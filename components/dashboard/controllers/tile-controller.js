izendaRequire.define([
	'angular',
	'../../common/core/services/compatibility-service',
	'../../common/core/services/localization-service',
	'../../common/core/services/util-service',
	'../../common/core/services/event-service',
	'../../common/core/services/util-ui-service',
	'../../common/query/services/rs-query-service',
	'../../common/query/services/common-query-service',
	'../../common/query/services/settings-service',
	'../../common/query/services/url-service',
	'../../common/ui/directives/bootstrap',
	'../../common/ui/components/select-report/component',
	'../services/services',
	'../directives/directives'
], function (angular) {

	/**
	 * Tile default state object
	 */
	angular
		.module('izendaDashboard')
		.constant('tileDefaults', {
			id: null,
			canBeLoaded: false,
			maxRights: 'None',
			title: null,
			description: null,
			reportFullName: null,
			reportPartName: null,
			reportSetName: null,
			reportName: null,
			reportCategory: null,
			reportNameWithCategory: null,
			previousReportFullName: null,
			isSourceReportDeleted: false,
			designerType: 'ReportDesigner',
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			top: 100,
			topString: '100',
			flip: false,
			applyFilterParams: false,
			backgroundColor: '#fff',
			backTilePopupOpened: false
		});

	/**
	 * Tile component definition
	 */
	angular
		.module('izendaDashboard')
		.component('izendaDashboardTile', {
			templateUrl: '###RS###extres=components.dashboard.templates.izenda-dashboard-tile.html',
			controller: ['$element', '$interval', '$timeout', '$rootScope', '$window', '$izendaCompatibility', '$izendaUtil', '$izendaUrl',
				'$izendaUtilUiService', '$izendaLocale', '$izendaSettings', '$izendaDashboardSettings', '$izendaRsQuery', '$izendaDashboardQuery',
				'$izendaEvent', '$izendaDashboardState',
				IzendaDashboardTileController],
			bindings: {
				tile: '<', // main tile object
				tiles: '<', // all tile objects in dashboard
				gridWidth: '<',
				gridHeight: '<',
				isDashboardChangingNow: '<',
				onTileDrag: '&',
				onTileDragStart: '&',
				onTileDragEnd: '&',
				onTileResize: '&',
				onTileResizeStart: '&',
				onTileResizeEnd: '&',
				onTileDelete: '&',
				onTileReportSelected: '&'
			}
		});

	function IzendaDashboardTileController($element, $interval, $timeout, $rootScope, $window, $izendaCompatibility, $izendaUtil, $izendaUrl,
		$izendaUtilUiService, $izendaLocale, $izendaSettings, $izendaDashboardSettings, $izendaRsQuery, $izendaDashboardQuery, $izendaEvent, $izendaDashboardState) {
		var self = this;

		var isIe = $izendaCompatibility.checkIE();

		self.$izendaUrl = $izendaUrl;

		self.isButtonsVisible = true;
		self.deleteConfirmClass = 'title-button hidden-confirm-btn';

		self.tileSizeChanged = false;
		self.state = {
			empty: true,
			resizableHandlerStarted: false,
			relativeReportComplexity: 0
		};
		self.isSelectReportPartModalVisible = false;

		/**
		 * Check if tile is empty
		 */
		self.isTileEmpty = function () {
			return self.state.empty;
		};

		/**
		 * Check if one column view required
		 */
		self.isOneColumnView = function () {
			return $izendaCompatibility.isOneColumnView();
		};

		/**
		 * Check tile is read only
		 */
		self.isEditAllowed = function () {
			return $izendaCompatibility.isEditAllowed();
		};

		/**
		 * Check if tile title set
		 */
		self.isTitleSet = function () {
			return angular.isString(self.tile.title) && self.tile.title != '';
		};

		/**
		 * Is tile small enough and we need to show buttons without labels.
		 */
		self.isTileButtonsTight = function () {
			return self.tile.width * self.gridWidth < 400;
		};

		/**
		 * change report category from cat1\cat2\cat3 to cat1/cat2/cat3
		 */
		self.getConvertedReportCategory = function () {
			if (!angular.isString(self.tile.reportCategory))
				return null;
			return self.tile.reportCategory;
		};

		/**
		 * Generate title text
		 */
		self.getTitleText = function () {
			if (self.isTitleSet())
				return self.tile.title;
			var result = '';
			if (self.getConvertedReportCategory())
				result += self.getConvertedReportCategory() + ' / ';
			if (self.tile.reportName && self.tile.reportPartName)
				result += self.tile.reportName + ' / ' + self.tile.reportPartName;
			return result;
		};

		/**
		 * Is html model enabled in AdHocSettings
		 */
		self.isReportDivHidden = function () {
			return !self.tile.reportFullName || self.isDashboardChangingNow;
		};

		/**
		 * Is tile content should be hidden now.
		 */
		self.isTileSmallEnough = function () {
			return self.tile.width * self.gridWidth < 400 || self.tile.height * self.gridHeight < 400;
		};

		/**
		 * Class for confirm delete button (depends on tile size)
		 */
		self.getConfirmDeleteClass = function () {
			var tightClass = self.isTileButtonsTight() ? ' short' : '';
			return 'title-button-confirm-remove' + tightClass;
		};

		/**
		 * Class for cancel delete button (depends on tile size)
		 */
		self.getCancelDeleteClass = function () {
			var tightClass = self.isTileButtonsTight() ? ' short' : '';
			return 'title-button-cancel-remove' + tightClass;
		};

		//////////////////////////////////////////////////////////////////////
		// export modal
		//////////////////////////////////////////////////////////////////////

		self.exportProgress = null;
		self.getWaitMessageHeaderText = function () {
			if (self.exportProgress === 'export') {
				return $izendaLocale.localeText('js_ExportingInProgress', 'Exporting in progress.');
			}
			if (self.exportProgress === 'print') {
				return $izendaLocale.localeText('js_PrintingInProgress', 'Printing in progress.');
			}
			return '';
		}
		self.getWaitMessageText = function () {
			if (self.exportProgress === 'export') {
				return $izendaLocale.localeText('js_FinishExporting', 'Please wait till export is completed...');
			}
			if (self.exportProgress === 'print') {
				return $izendaLocale.localeText('js_FinishPrinting', 'Please finish printing before continue.');
			}
			return '';
		}

		//////////////////////////////////////////////////////////////////////
		// rights
		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		// tile actions
		//////////////////////////////////////////////////////////////////////

		/**
		 * Show confirm delete dialog in title
		 */
		self.showConfirmDelete = function () {
			if (!self.tile.reportFullName) {
				self.deleteTile();
				return;
			}
			self.deleteConfirmClass = 'title-button';
		};

		/**
		 * Hide confirm delete dialog in title
		 */
		self.hideConfirmDelete = function () {
			self.deleteConfirmClass = 'title-button hidden-confirm-btn';
		};

		/**
		 * Delete this tile
		 */
		self.deleteTile = function () {
			if (angular.isFunction(self.onTileDelete)) {
				self.onTileDelete(self.tile);
			}
		}

		/**
		 * Close back tile popup
		 */
		self.closeBackTilePopup = function () {
			self.tile.backTilePopupOpened = false;
		};

		/**
		 * Back tile popup closed handler
		 */
		self.onBackTilePopupClosed = function () {

		};

		/**
		 * Print tile
		 */
		self.printTile = function () {
			self.closeBackTilePopup();

			// print single tile if parameter is set:
			if (!self.tile.reportFullName)
				return;

			var printUrl = $izendaUrl.settings.urlRsPage + '?p=htmlreport&print=1';
			printUrl += '&reportPartName=' + encodeURIComponent(self.tile.reportFullName);

			// izpid and anpid will be added inside the ExtendReportExport method 
			var newWindow = ExtendReportExport(responseServer.OpenUrl, printUrl, 'aspnetForm', '', '', true);
			self.exportProgress = 'print';
			$timeout(function () {
				if ('WebkitAppearance' in document.documentElement.style) {
					var intervalId = $interval(function () {
						if (!newWindow || newWindow.closed) {
							$interval.cancel(intervalId);
							intervalId = null;
							self.exportProgress = null;
							self.flipFront(true, false);
						}
					}, 500);
				} else {
					self.exportProgress = null;
					self.flipFront(true, false);
				}
			}, 500);
		};

		/**
		 * Export to excel
		 */
		self.exportExcel = function () {
			self.closeBackTilePopup();

			var addParam = '';
			if (typeof (window.izendaPageId$) !== 'undefined')
				addParam += '&izpid=' + window.izendaPageId$;
			if (typeof (window.angularPageId$) !== 'undefined')
				addParam += '&anpid=' + window.angularPageId$;

			// download the file
			self.exportProgress = 'print';
			$izendaRsQuery.downloadFileRequest('GET', $izendaUrl.settings.urlRsPage + '?rpn=' + self.tile.reportFullName +
				'&output=XLS(MIME)' + addParam).then(function () {
					self.exportProgress = null;
					self.flipFront(true, false);
				});
		};

		/**
		 * Back tile side click handler
		 */
		self.onBackTileClick = function () {
			self.tiles.forEach(function (tile) {
				if (tile.id !== self.tile.id)
					tile.backTilePopupOpened = false;
			});
			if (self.isTileSmallEnough()) {
				self.tile.backTilePopupOpened = !self.tile.backTilePopupOpened;
			} else {
				self.flipBack();
			}
		};

		/**
		 * Flip tile back
		 */
		self.flipBack = function () {
			self.tile.flip = {
				isFront: false
			};
		};

		/**
		 * Flip tile front
		 */
		self.flipFront = function (update, updateFromSourceReport) {
			self.closeBackTilePopup();
			self.tile.flip = {
				isFront: true,
				update: update,
				updateFromSourceReport: updateFromSourceReport
			};
		};

		/**
		 * Go to report viewer
		 */
		self.fireReportViewerLink = function () {
			self.closeBackTilePopup();

			if (!self.tile.isSourceReportDeleted) {
				$window.open(_getReportViewerLink(), '_blank');
			} else {
				var errorText = $izendaLocale.localeText('js_SourceReportNotExist', 'Source report "{0}" doesn\'t exist.');
				errorText = errorText.replaceAll(/\{0\}/, _getSourceReportName());
				$izendaUtilUiService.showErrorDialog(errorText);
			}
		};

		/**
		 * Go to report editor
		 */
		self.fireReportEditorLink = function () {
			self.closeBackTilePopup();

			if (!self.tile.isSourceReportDeleted) {
				$window.location.href = _getReportEditorLink();
			} else {
				var errorText = $izendaLocale.localeText('js_SourceReportNotExist', 'Source report "{0}" not exist.');
				errorText = errorText.replaceAll(/\{0\}/, _getSourceReportName());
				$izendaUtilUiService.showErrorDialog(errorText);
			}
		};

		/**
		 * Refresh tile content
		 * @param {boolean} updateFromSourceReport. Is tile content need to be refreshed from the source report.
		 * TODO: remove DOM manipulations to separate directive.
		 */
		self.refreshTile = function (updateFromSourceReport) {
			var updateFromSource = self.tile.updateFromSource || updateFromSourceReport;
			self.tileSizeChanged = false; // reset tile size information
			self.tile.updateFromSource = false; // reset update from source flag

			if (!self.tile.reportFullName)
				return;

			var previousReportName = self.tile.previousReportFullName; // reset previous full name
			self.tile.previousReportFullName = null;

			var loadingHtml = '<div class="izenda-common-vcentered-container">' +
				'<div class="izenda-common-vcentered-item">' +
				'<img class="izenda-common-img-loading" src="' + $izendaUrl.settings.urlRsPage + '?image=ModernImages.loading-grid.gif" alt="Loading..." />' +
				'</div>' +
				'</div>';
			var $body = $element.find('.animate-flip> .flippy-front> .frame> .report');
			$body.html(loadingHtml);
			var tileWidth = _getWidth() * self.gridWidth - 20;
			var tileHeight = _getHeight() * self.gridHeight - 55;
			if (self.tile.description) {
				tileHeight -= 32;
			}
			$izendaDashboardQuery.loadTileReport({
				updateFromSourceReport: updateFromSource,
				dashboardFullName: $izendaUrl.getReportInfo().fullName,
				reportFullName: self.tile.reportFullName,
				reportPreviousFullName: previousReportName,
				top: self.tile.top,
				contentWidth: tileWidth,
				contentHeight: tileHeight,
				forPrint: false,
				applyFilterParams: self.applyFilterParams
			}).then(function (data) {
				var htmlData;
				if (typeof (data) === 'string') {
					htmlData = data
				} else if (typeof (data) === 'object') {
					htmlData = data.html;
					var topValue = data.top && data.top > 0 ? data.top : 100;
					self.setTileTop(topValue);
					self.tile.title = data.title;
				} else {
					throw 'Unexpected query result: ' + data;
				}
				// resolve
				if (updateFromSourceReport)
					$izendaEvent.queueEvent('refreshFilters', [], true);
				_applyTileHtml(htmlData);
			});
		};

		/**
		 * Set tile top values.
		 */
		self.setTileTop = function (newTop) {
			self.tile.top = newTop;
			self.tile.topString = '' + newTop;
		}

		//////////////////////////////////////////////////////////////////////
		// tile handlers
		//////////////////////////////////////////////////////////////////////

		$rootScope.$on('izendaDashboardTile.update', function (event, args) {
			var tileId = args[0];
			if (tileId === null || tileId === self.tile.id) {
				var tileChangesObj = args[1] || null;
				var isUpdateRequired = !!args[2];
				var isUpdateFromSourceRequired = !!args[3];
				if (angular.isObject(tileChangesObj))
					angular.extend(self.tile, tileChangesObj);
				if (isUpdateRequired)
					self.refreshTile(isUpdateFromSourceRequired);
			}
		});

		/**
		 * Resize start handler
		 */
		self._onTileResizeStartInner = function (eventResult) {
			self.isButtonsVisible = false;
			if (angular.isFunction(self.onTileResizeStart))
				self.onTileResizeStart(eventResult);
		};

		/**
		 * Resize handler
		 */
		self._onTileResizeInner = function (eventResult) {
			if (angular.isFunction(self.onTileResize))
				self.onTileResize(eventResult);
		};

		/**
		 * Resize end handler
		 */
		self._onTileResizeEndInner = function (eventResult) {
			if (eventResult.isTileSizeChanged) {
				self.flipFront();
				self.refreshTile(false);
			}
			if (angular.isFunction(self.onTileResizeEnd)) {
				self.onTileResizeEnd(eventResult);
			}
			self.isButtonsVisible = true;
		};

		/**
		 * Drag end handler
		 */
		self._onTileDragEndInner = function (eventResult) {
			if (eventResult.isTileSizeChanged)
				self.refreshTile(false);
			if (angular.isFunction(self.onTileDragEnd))
				self.onTileDragEnd(eventResult);
		};

		/**
		 * Select report part for tile
		 */
		self.selectReportPart = function () {
			self.isSelectReportPartModalVisible = true;
		};

		/**
		 * Select report part cancelled
		 */
		self.onSelectReportModalClosed = function () {
			// we need to reset "opened" binding.
			self.isSelectReportPartModalVisible = false;
		};

		/**
		 * Report part selected handler
		 */
		self.onSelectReportPart = function (reportPartInfo) {
			// hide select report part dialog
			self.closeBackTilePopup();
			var rpInfo = reportPartInfo;
			var fName = rpInfo.Name;
			if (!$izendaUtil.isUncategorized(rpInfo.Category))
				fName = rpInfo.Category + $izendaSettings.getCategoryCharacter() + fName;

			var nameparts = rpInfo.Name.split('@');
			var name = nameparts[0];
			var part = nameparts[1];

			// check if tile already exist
			var isTileInDashboard = self.tiles.filter(function (tile) {
				return tile.reportPartName === part
					&& tile.reportName === name
					&& ((tile.reportCategory === rpInfo.Category)
						|| ($izendaUtil.isUncategorized(tile.reportCategory) && $izendaUtil.isUncategorized(rpInfo.Category)));
			}).length > 0;

			if (isTileInDashboard) {
				var errorText = $izendaLocale.localeText('js_CantSelectReportPart',
					'Can\'t select report part because dashboard already contains tile with that report.');
				$izendaUtilUiService.showNotification(errorText);
				return;
			}

			// update report parameters
			self.tile.previousReportFullName = self.tile.reportFullName;
			angular.extend(self.tile, $izendaUrl.extractReportPartNames(fName, true));
			self.tile.title = rpInfo.Title;

			// update report name with category variable
			self.tile.reportNameWithCategory = self.tile.reportName;
			if (!$izendaUtil.isUncategorized(self.tile.reportCategory))
				self.tile.reportNameWithCategory = self.tile.reportCategory + $izendaSettings.getCategoryCharacter() + self.tile.reportNameWithCategory;

			if (rpInfo.IsLocked)
				self.tile.maxRights = 'Locked';
			else if (rpInfo.ViewOnly)
				self.tile.maxRights = 'View Only';
			else if (rpInfo.ReadOnly)
				self.tile.maxRights = 'Read Only';
			else
				self.tile.maxRights = 'Full Access';

			// set top variables for tile:
			var newTop = rpInfo.NativeTop && rpInfo.NativeTop > 0 ? rpInfo.NativeTop : 100;
			self.setTileTop(newTop);
			self.tile.designerType = rpInfo.DesignerType;
			self.flipFront(true, true);
			if (angular.isFunction(self.onTileReportSelected)) {
				self.onTileReportSelected(self.tile);
			}
		};

		/**
		 * Tile flip handler
		 */
		self.onTileFlip = function (isFront, update, updateFromSourceReport) {
			if (isFront && update) {
				self.refreshTile(updateFromSourceReport);
			}
		};

		/**
		 * Tile top changed:
		 */
		self.onSetTileTop = function (top) {
			if (self.tile.top === top)
				return;
			self.tile.top = top;
			self.tile.topString = '' + top;
			$izendaDashboardQuery.setReportPartTop(self.tile.reportFullName, self.tile.top).then(function () {
				self.flipFront(true, false);
			});
			self.closeBackTilePopup();
		};

		/**
		 * Bindings listener
		 */
		self.$onChanges = function (changesObj) {
			if (changesObj.tile && angular.isObject(changesObj.tile)) {
				self.refreshTile();
			};
		};

		//////////////////////////////////////////////////////////////////////
		// tile position
		//////////////////////////////////////////////////////////////////////

		/**
		 * Return style object for '.iz-dash-tile'
		 */
		self.getTileStyle = function () {
			return {
				'top': (self.gridHeight * _getY()) + 'px',
				'left': (self.gridWidth * _getX()) + 'px',
				'width': (self.gridWidth * _getWidth()) + 'px',
				'height': (self.gridHeight * _getHeight()) + 'px',
				'z-index': (self.tile.backTilePopupOpened ? '3' : '1')
			};
		};

		/**
		 * Get tile width
		 */
		self.getWidth = function () {
			return _getWidth();
		};

		/**
		 * Get tile height
		 */
		self.getHeight = function () {
			return _getHeight();
		};

		/**
		 * Get X coordinate for tile. This coordinate used for drawing tile UI
		 */
		function _getX() {
			return self.isOneColumnView() ? 0 : self.tile.x;
		};

		/**
		 * Get Y coordinate for tile. This coordinate used for drawing tile UI
		 */
		function _getY() {
			var sortedTiles = self.tiles.sort(function (a, b) {
				if (a.y != b.y)
					return a.y - b.y;
				return a.x - b.x;
			});
			return self.isOneColumnView() ? 4 * sortedTiles.indexOf(self.tile) : self.tile.y;
		};

		/**
		 * Get width of tile. This coordinate used for drawing tile UI
		 */
		function _getWidth() {
			return self.isOneColumnView() ? 12 : self.tile.width;
		};

		/**
		 * Get height of tile. This coordinate used for drawing tile UI
		 */
		function _getHeight() {
			return self.isOneColumnView() ? 4 : self.tile.height;
		};

		/**
		 * Get report viewer link for tile report
		 */
		function _getReportViewerLink() {
			return getAppendedUrl($izendaUrl.settings.urlReportViewer + '?rn=' + _getSourceReportName());
		};

		/**
		 * Get report editor link for tile report
		 */
		function _getReportEditorLink() {
			var designerUrl = self.tile.designerType === 'InstantReport'
				? $izendaUrl.settings.urlInstantReport
				: $izendaUrl.settings.urlReportDesigner;
			return getAppendedUrl(designerUrl + '?rn=' + _getSourceReportName());
		};

		/**
		 * Get source report name
		 */
		function _getSourceReportName() {
			var result = self.tile.reportName;
			if (!$izendaUtil.isUncategorized(self.tile.reportCategory))
				result = self.tile.reportCategory + $izendaSettings.getCategoryCharacter() + result;
			return result;
		};

		/**
		 * Set tile inner html
		 */
		function _applyTileHtml(htmlData) {
			// load tile content
			var $report = angular.element($element).find('.report');
			$izendaDashboardState.loadReportIntoContainer(htmlData, $report);

			var numberOfCellInComplexReport = 3000;
			var numberOfCells = angular.element($element).find('.ReportTable td').length;
			self.state.relativeReportComplexity = numberOfCells / numberOfCellInComplexReport;
			if (self.state.relativeReportComplexity > 1)
				self.state.relativeReportComplexity = 1;

			if (isIe && self.state.relativeReportComplexity >= 0.5)
				$element.addClass('hover-ie');

			self.state.empty = false;
		}
	}

	/**
	 * Tile hover directive. Adds onHover event handler to tile.
	 */
	angular.module('izendaDashboard').directive('izendaTileHover', [
		'$window',
		function ($window) {
			return {
				restrict: 'A',
				link: function ($scope, $element, attrs) {
					var $$el = angular.element($element);
					var uid = Math.floor(Math.random() * 1000000);
					var windowMouseMoveEventName = 'mousemove.tilehover' + uid;
					var isHoveringOverTile = false;
					var isHoverLocked = false;

					$scope.$on('$destroy', function () {
						$$el.off('hover');
						angular.element($window).off(windowMouseMoveEventName);
					});

					// hover event handlers
					$$el.hover(function () {
						applyTileHover($$el, true);
					}, function () {
						applyTileHover($$el, false);
					});

					// window mouse move event handlers
					angular.element($window).on(windowMouseMoveEventName, function (e) {
						var $tileElement = angular.element(e.target).closest('div.iz-dash-tile');
						var overTile = $tileElement.length > 0 && $tileElement.attr('tileid') == $$el.attr('tileid');
						if (overTile !== isHoveringOverTile) {
							applyTileHover($$el, overTile);
						}
						isHoveringOverTile = overTile;
					});

					$scope.$watch('$ctrl.tile.backTilePopupOpened', function (newVal, oldVal) {
						if (!newVal && oldVal) {
							// backTilePopupOpened turned off
							isHoverLocked = false;
							applyTileHover($$el, isHoveringOverTile);
						}
						else if (newVal && !oldVal) {
							// backTilePopupOpened turned on
							applyTileHover($$el, true);
							isHoverLocked = true;
						}
					});

					/**
					 * Turn off/on tile hover classes.
					 */
					function applyTileHover($tile, value) {
						var reportComplexityCoefficent = $scope.$eval(attrs.izendaTileHoverReportComplexity);
						if (isHoverLocked && reportComplexityCoefficent < 0.5)
							return;
						if (value) {
							$tile.addClass('hover');
							$tile.removeClass('no-hover-overflow');
						} else {
							$tile.addClass('no-hover-overflow');
							$tile.removeClass('hover');
						}
						// hover event handlers
					}
				}
			};
		}
	]);

	/**
	 * Tile flip directive. Flips tile and calls handler.
	 */
	angular.module('izendaDashboard').directive('izendaTileFlip', [
		'$timeout',
		function ($timeout) {
			return {
				restrict: 'A',
				scope: {
					flipObject: '=izendaTileFlipObject',
					flipHandler: '&izendaTileFlipHandler'
				},
				link: function ($scope, $element) {
					function _getFlippyFront() {
						return $element.children('.animate-flip').children('.flippy-front');
					}
					function _getFlippyBack() {
						return $element.children('.animate-flip').children('.flippy-back');
					}

					function _flipTileFront(update, updateFromSourceReport) {
						$element.children('.ui-resizable-handle').hide();
						var showClass = 'animated fast flipInY';
						var hideClass = 'animated fast flipOutY';

						var $front = _getFlippyFront();
						var $back = _getFlippyBack();
						$back.addClass(hideClass);
						$front.removeClass(showClass);
						$front.css('display', 'block').addClass(showClass);
						$back.css('display', 'none').removeClass(hideClass);

						$timeout(function () {
							$front.removeClass('flipInY');
							$back.removeClass('flipInY');
							$element.children('.ui-resizable-handle').fadeIn(200);
						}, 200).then(function () {
							// call handler
							if (angular.isFunction($scope.flipHandler)) {
								$scope.flipHandler({
									isFront: true,
									update: update,
									updateFromSourceReport: updateFromSourceReport
								});
							}
						});
					}

					function _flipTileBack() {
						$element.children('.ui-resizable-handle').hide();
						var showClass = 'animated fast flipInY';
						var hideClass = 'animated fast flipOutY';

						var $front = _getFlippyFront()
						var $back = _getFlippyBack();
						$front.addClass(hideClass);
						$back.removeClass(showClass);
						$back.css('display', 'block').addClass(showClass);
						$front.css('display', 'none').removeClass(hideClass);

						$timeout(function () {
							$front.removeClass('flipInY');
							$back.removeClass('flipInY');
							$element.children('.ui-resizable-handle').fadeIn(200);
						}, 200).then(function () {
							// call handler
							if (angular.isFunction($scope.flipHandler)) {
								$scope.flipHandler({
									isFront: false
								});
							}
						});
					}

					$scope.$watch('flipObject', function (newValue, oldValue) {
						if (oldValue !== newValue) {
							if (newValue.isFront)
								_flipTileFront(newValue.update, newValue.updateFromSourceReport);
							else
								_flipTileBack();
						}
					});
				}
			};
		}
	]);

	/**
	 * Directive provides move function for dashboard tile.
	 */
	angular.module('izendaDashboard').directive('izendaTileDraggable', ['$rootScope', '$timeout', '$izendaDashboardState',
		function ($rootScope, $timeout, $izendaDashboardState) {
			return {
				restrict: 'E',
				scope: {
					enabled: '=',
					gridWidth: '=',
					gridHeight: '=',
					tile: '=',
					tiles: '=',
					onMove: '&',
					onMoveStart: '&',
					onMoveEnd: '&'
				},
				link: function ($scope, $element, attrs) {
					/**
					 * Find tile which contain point {x,y}
					 */
					function _getUnderlyingTile(left, top, $tilesArray) {
						if (!angular.isArray($scope.tiles))
							return null;
						//var x = Math.round(left / $scope.gridWidth),
						//	y = Math.round(top / $scope.gridHeight)
						for (var i = 0; i < $tilesArray.length; i++) {
							var $tile = $tilesArray[i];
							var tileOffset = $tile.offset();
							var currentTile = $scope.tiles[i];
							if ($scope.tile.id != currentTile.id) {
								if (tileOffset.left <= left && left <= tileOffset.left + $tile.width()
									&& tileOffset.top <= top && top <= tileOffset.top + $tile.height()) {
									return currentTile;
								}
							}
						};
						return null;
					}

					/**
					 * Check tile intersects to any other tile
					 */
					function _checkTileIntersects($helper) {
						var hitTest = function (a, oTile, accuracyX, accuracyY) {
							var aPos = a.position();
							var aLeft = aPos.left > 0 ? aPos.left : 0;
							var aTop = aPos.top > 0 ? aPos.top : 0;
							var aRight = aLeft + a.width();
							var aBottom = aTop + a.height();
							if (aRight / $scope.gridWidth > 12) {
								var delta = aRight - $scope.gridWidth * 12;
								aLeft -= delta;
								aRight = $scope.gridWidth * 12;
							}


							var bLeft = oTile.x * $scope.gridWidth + accuracyX;
							var bTop = oTile.y * $scope.gridHeight + accuracyY;
							var bRight = (oTile.x + oTile.width) * $scope.gridWidth - accuracyX;
							var bBottom = (oTile.y + oTile.height) * $scope.gridHeight - accuracyY;
							var result = !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
							return result;
						};

						var result = false;
						$scope.tiles.forEach(function (oTile) {
							if (oTile.id === $scope.tile.id)
								return;
							if (hitTest($helper, oTile, $scope.gridWidth / 2, $scope.gridHeight / 2)) {
								result = true;
							}
						});
						return result;
					}

					/**
					 * Get snapped to grid bbox.
					 */
					function _getTargetBbox(helperLeft, helperTop, helperWidth, helperHeight) {
						// calculate tile shadow position
						var x = Math.round(helperLeft / $scope.gridWidth) * $scope.gridWidth;
						var y = Math.round(helperTop / $scope.gridHeight) * $scope.gridHeight;
						var helperBbox = {
							left: x,
							top: y,
							width: helperWidth,
							height: helperHeight
						};
						return helperBbox;
					}

					var $tile = $element.closest('.iz-dash-tile');
					var previousHelperBbox = { left: 0, top: 0, width: 0, height: 0 };
					var helperWidth = 0;
					var helperHeight = 0;
					var $tileFlippies;
					var $tilesArray = [];
					// init draggable
					$tile.draggable({
						stack: '.iz-dash-tile',
						handle: '.title-container, .iz-dash-select-report-front-container',
						helper: function (event) {
							var width = $scope.tile.width * $scope.gridWidth;
							var height = $scope.tile.height * $scope.gridHeight;
							var helperStr =
								'<div class="iz-dash-tile iz-dash-tile-helper" style="z-index: 1000; top: 0px; height: ' + height + 'px; left: 0px; width: ' + width + 'px; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0); z-index: 1000;">' +
								'<div class="animate-flip">' +
								'<div class="flippy flippy-front animated fast">' +
								'<div class="title-container" style="height: 35px; overflow: hidden;"><div class="title"><span class="title-text"></span></div></div>' +
								'</div>' +
								'</div>' +
								'</div>';
							return angular.element(helperStr);
						},
						distance: 10,
						start: function (event, ui) {
							$tileFlippies = $tile.children('.animate-flip').children('.flippy');

							$scope.tiles.forEach(function (tile) {
								tile.backTilePopupOpened = false;
							});

							// turn off window resize handler
							$izendaDashboardState.turnOffWindowResizeHandler();

							// update tiles array;
							$tilesArray = []
							if (angular.isArray($scope.tiles)) {
								$scope.tiles.forEach(function (currentTile) {
									$tilesArray.push(angular.element('.iz-dash-tile[tileid=' + currentTile.id + ']'));
								});
							}

							$tile = $element.closest('.iz-dash-tile');
							// fire onMoveStart handler:
							if (angular.isFunction($scope.onMoveStart))
								$scope.onMoveStart({
									tile: $scope.tile
								});

							// prepare helper:
							var $helper = ui.helper;
							helperWidth = $helper.width();
							helperHeight = $helper.height();
							var $helperFlipFront = $helper.find('.flippy-front');
							$helperFlipFront.removeClass('flipInY');
							$helperFlipFront.removeClass('animated');
							$helperFlipFront.removeClass('fast');
							$helperFlipFront.css('background-color', 'rgba(50,205,50, 0.3)');
							$helperFlipFront.find('.frame').remove();
							$helper.css('z-index', 1000);
							$helper.css('opacity', 1);
						},
						drag: function (event, ui) {
							var $helper = ui.helper;
							var $helperFlipFront = $helper.find('.flippy-front');

							// calculate tile shadow position
							var helperPos = $helper.position();
							var helperBbox = _getTargetBbox(helperPos.left, helperPos.top, helperWidth, helperHeight);
							$helperFlipFront.css('background-color', 'rgba(50,205,50, 0.3)'); // semi-transparent green

							// check underlying tile
							if (angular.isArray($scope.tiles)) {
								$scope.tiles.forEach(function (currentTile) {
									currentTile.backgroundColor = '#fff';
								});
								var targetTile = _getUnderlyingTile(event.pageX, event.pageY, $tilesArray);
								if (targetTile) {
									// highlight tile for swap
									targetTile.backgroundColor = 'rgba(50,205,50, 1)';
								} else if (_checkTileIntersects($helper)) {
									$helperFlipFront.css('background-color', 'rgba(220,20,60,0.2)');
								}
							}

							// prevent duplicate calls
							if (previousHelperBbox.left == helperBbox.left && previousHelperBbox.top == helperBbox.top
								&& previousHelperBbox.width == helperBbox.width && previousHelperBbox.height == helperBbox.height) {
								$scope.$applyAsync();
								return;
							}
							previousHelperBbox = helperBbox;

							// fire onMove handler:
							if (angular.isFunction($scope.onMove)) {
								var result = $scope.onMove({
									tile: $scope.tile,
									shadowPosition: helperBbox
								});
							}
							$scope.$applyAsync();
						},
						stop: function (event, ui) {
							var $helper = ui.helper;
							var helperPos = $helper.position();
							var $source = angular.element(event.target);

							// return default tile color
							if (angular.isArray($scope.tiles)) {
								$scope.tiles.forEach(function (currentTile) {
									currentTile.backgroundColor = '#fff';
								});
							}
							var targetTile = _getUnderlyingTile(event.pageX, event.pageY, $tilesArray);
							var eventResult;
							var isTileSizeChanged = false;

							var $animatedTiles = [];
							var anotherTileUpdateArguments = null;
							if (targetTile) {
								// swap tiles
								isTileSizeChanged = $scope.tile.width !== targetTile.width || $scope.tile.height !== targetTile.height;
								var tileChangeObject = {
									x: $scope.tile.x,
									y: $scope.tile.y,
									width: $scope.tile.width,
									height: $scope.tile.height
								};
								// set new size for current tile:
								$scope.tile.x = targetTile.x;
								$scope.tile.y = targetTile.y;
								$scope.tile.width = targetTile.width;
								$scope.tile.height = targetTile.height;
								$scope.$applyAsync();

								// root scope is needed to update other tiles
								$rootScope.$broadcast('izendaDashboardTile.update', [targetTile.id, tileChangeObject, false, false]);
								if (isTileSizeChanged)
									angular.element('.iz-dash-tile[tileid=' + targetTile.id + ']').find('.report').empty();

								// run animation:
								[$scope.tile, targetTile].forEach(function (affectedTile) {
									var $tile = angular.element('.iz-dash-tile[tileid=' + affectedTile.id + ']');
									$tile.addClass('transition');
									$animatedTiles.push($tile);
								});
							} else if (!_checkTileIntersects($helper)) {
								// move tile
								var helperPos = $helper.position();
								var helperBbox = _getTargetBbox(helperPos.left, helperPos.top, helperWidth, helperHeight);
								$scope.tile.x = Math.round(helperBbox.left / $scope.gridWidth);
								$scope.tile.y = Math.round(helperBbox.top / $scope.gridHeight);
								$scope.tile.width = Math.round(helperBbox.width / $scope.gridWidth);
								$scope.tile.height = Math.round(helperBbox.height / $scope.gridHeight);
								if ($scope.tile.x < 0)
									$scope.tile.x = 0;
								if ($scope.tile.y < 0)
									$scope.tile.y = 0;
								if ($scope.tile.x + $scope.tile.width > 12) {
									$scope.tile.x = 12 - $scope.tile.width;
									isTileSizeChanged = true;
								}
								$scope.$applyAsync();

								// run animation for current tile:
								var $t = angular.element('.iz-dash-tile[tileid=' + $scope.tile.id + ']');
								$t.addClass('transition');
								$animatedTiles.push($t);
							}

							$animatedTiles.forEach(function ($tile) {
								$tile.find('.report').hide();
							});
							setTimeout(function () {
								$animatedTiles.forEach(function ($tile) {
									$tile.removeClass('transition');
								});
								$tile.css('z-index', '1');
								$tile.find('.frame').removeClass('hidden');
								$tileFlippies.removeClass('flipInY');
								$tileFlippies.removeClass('animated');
								$tileFlippies.removeClass('fast');
								setTimeout(function () {
									$animatedTiles.forEach(function ($tile) {
										$tile.find('.report').show();
									});
									if (targetTile && isTileSizeChanged)
										$rootScope.$broadcast('izendaDashboardTile.update', [targetTile.id, {}, true, false]);

									// turn on window resize handler
									$izendaDashboardState.turnOnWindowResizeHandler();
									// fire onMoveEnd handler:
									eventResult = {
										isTileSizeChanged: isTileSizeChanged,
										tile: $scope.tile
									};
									if (angular.isFunction($scope.onMoveEnd)) {
										$scope.onMoveEnd({ eventResult: eventResult });
									}
									$scope.$applyAsync();
								}, 100);
							}, 300);
						}
					});

					// handlers
					$scope.$watch('enabled', function (enabled, prevEnabled) {
						if (enabled == prevEnabled)
							return;
						if (enabled) {
							$tile.draggable('enable');
						} else {
							$tile.draggable('disable');
						}
					});
				}
			};
		}
	]);

	/**
	 * Directive provides resize function for dashboard tile.
	 */
	angular.module('izendaDashboard').directive('izendaTileResizable', ['$izendaDashboardState',
		function ($izendaDashboardState) {
			return {
				restrict: 'E',
				scope: {
					gridWidth: '=',
					gridHeight: '=',
					tile: '=',
					tiles: '=',
					onResize: '&',
					onResizeStart: '&',
					onResizeEnd: '&'
				},
				link: function ($scope, $element, attrs) {

					/**
					 * Check tile intersects to any other tile
					 */
					function _checkTileIntersects($helper) {
						var hitTest = function (a, oTile, accuracyX, accuracyY) {
							var aPos = a.position();
							var aLeft = aPos.left > 0 ? aPos.left : 0;
							var aTop = aPos.top > 0 ? aPos.top : 0;
							var aRight = aLeft + a.width();
							var aBottom = aTop + a.height();

							var bLeft = oTile.x * $scope.gridWidth + accuracyX;
							var bTop = oTile.y * $scope.gridHeight + accuracyY;
							var bRight = (oTile.x + oTile.width) * $scope.gridWidth - accuracyX;
							var bBottom = (oTile.y + oTile.height) * $scope.gridHeight - accuracyY;
							var result = !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
							return result;
						};

						var result = false;
						$scope.tiles.forEach(function (oTile) {
							if (oTile.id === $scope.tile.id)
								return;
							if (hitTest($helper, oTile, $scope.gridWidth / 2, $scope.gridHeight / 2)) {
								result = true;
							}
						});
						return result;
					}

					/**
					 * Update resizable according to current gridWidth and gridHeight
					 */
					function _updateContraints() {
						$tile.resizable('option', 'grid', [$scope.gridWidth, $scope.gridHeight]);
						$tile.resizable('option', 'minHeight', $scope.gridWidth);
						$tile.resizable('option', 'minWidth', $scope.gridHeight);
					}

					/**
					 * Update tile x,y,width,height according to the new dom element size
					 */
					function _updateTileSize(tile, $tile) {
						var tilePosition = $tile.position();
						var x = Math.round(tilePosition.left / $scope.gridWidth),
							y = Math.round(tilePosition.top / $scope.gridHeight),
							width = Math.round($tile.width() / $scope.gridWidth),
							height = Math.round($tile.height() / $scope.gridHeight);
						var isTileSizeNeedToCorrect = x < 0 || y < 0 || x + width > 12;
						if (x < 0) {
							width = width + x;
							tile.x = 0;
						} else
							tile.x = x;
						if (y < 0) {
							height = height + y;
							tile.y = 0;
						} else
							tile.y = y
						tile.width = width;
						tile.height = height;
						if (tile.x + tile.width > 12) {
							tile.width = 12 - tile.x;
						}
						if (isTileSizeNeedToCorrect) {
							$tile.css('left', tile.x * $scope.gridWidth);
							$tile.css('top', tile.y * $scope.gridHeight);
							$tile.width(tile.width * $scope.gridWidth);
							$tile.height(tile.height * $scope.gridHeight);
						}
					}

					// initialize resizable
					var $tile = $element.closest('.iz-dash-tile');
					var $tileFlippies;
					var previousHelperBbox = { left: 0, top: 0, width: 0, height: 0 };
					// initialize resizable for tile
					$tile.resizable({
						minWidth: $scope.gridWidth,
						minHeight: $scope.gridHeight,
						grid: [$scope.gridWidth, $scope.gridHeight],
						handles: 'n, e, s, w, se',
						// start resize handler
						start: function (event) {
							$scope.tiles.forEach(function (tile) {
								tile.backTilePopupOpened = false;
							});
							// turn off window resize handler
							$izendaDashboardState.turnOffWindowResizeHandler();

							// context variables
							$tile = angular.element(event.target);
							$tileFlippies = $tile.children('.animate-flip').children('.flippy');

							$tileFlippies.children('.frame').addClass('hidden');
							$tileFlippies.removeClass('flipInY');
							$tileFlippies.css('background-color', 'rgba(50,205,50, 0.3)');
							$tile.css('z-index', 1000);
							$tile.css('opacity', 1);

							// fire onResizeStart handler:
							if (angular.isFunction($scope.onResizeStart)) {
								var eventResult = {
									tile: $scope.tile
								};
								$scope.onResizeStart({ eventResult: eventResult });
							}
						},
						// resize handler
						resize: function (event, ui) {
							var helperPosition = $tile.position();
							var x = Math.round(helperPosition.left / $scope.gridWidth) * $scope.gridWidth;
							var y = Math.round(helperPosition.top / $scope.gridHeight) * $scope.gridHeight;
							var helperBbox = {
								left: x,
								top: y,
								width: Math.round($tile.width() / $scope.gridWidth) * $scope.gridWidth,
								height: Math.round($tile.height() / $scope.gridHeight) * $scope.gridWidth
							};
							// prevent duplicate calls
							if (previousHelperBbox.left == helperBbox.left && previousHelperBbox.top == helperBbox.top
								&& previousHelperBbox.width == helperBbox.width && previousHelperBbox.height == helperBbox.height)
								return;
							previousHelperBbox = helperBbox;

							// fire onMove handler:
							if (angular.isFunction($scope.onResize)) {
								var eventResult = {
									tile: $scope.tile,
									shadowPosition: helperBbox
								};
								$scope.onResize({ eventResult: eventResult });
							}
							$tileFlippies.css('background-color', 'rgba(50,205,50, 0.5)');
							if (_checkTileIntersects($tile)) {
								$tileFlippies.css('background-color', 'rgba(220,20,60,0.5)');
							}
						},
						// end resize handler
						stop: function (event, ui) {
							$tile.css('z-index', '1');
							$tile.find('.frame').removeClass('hidden');
							$tileFlippies.removeClass('flipInY');
							$tileFlippies.removeClass('animated');
							$tileFlippies.removeClass('fast');

							$tileFlippies.css('background-color', '');
							var eventResult;
							if (_checkTileIntersects($tile)) {
								$tile.animate({
									left: ui.originalPosition.left,
									top: ui.originalPosition.top,
									width: ui.originalSize.width,
									height: ui.originalSize.height
								}, 200, function () {
								});
								eventResult = {
									action: 'resize cancel',
									isTileSizeChanged: false
								};
							} else {
								var isFlippyBack = $tile.find('.flippy-back').is(':visible');
								var isTileSizeChanged = $tile.width() != ui.originalSize.width || $tile.height() != ui.originalSize.height;
								if (isTileSizeChanged) {
									_updateTileSize($scope.tile, $tile);
								}
								eventResult = {
									action: 'resize end',
									isTileSizeChanged: isTileSizeChanged
								};
							}
							$tileFlippies.children('.frame').removeClass('hidden');
							$tile.css('opacity', 1);

							// turn on window resize handler
							$izendaDashboardState.turnOnWindowResizeHandler();

							// fire onResizeEnd handler:
							if (angular.isFunction($scope.onResizeEnd)) {
								$scope.onResizeEnd({
									eventResult: eventResult
								});
							}
						}
					});

					// handlers
					$scope.$watch('enabled', function (enabled, prevEnabled) {
						if (enabled == prevEnabled)
							return;
						if (enabled) {
							$tile.resizable('enable');
						} else {
							$tile.draggable('disable');
						}
					});
					$scope.$watch('gridWidth', function (newVal, oldVal) {
						if (newVal == oldVal)
							return;
						_updateContraints();
					});
					$scope.$watch('gridHeight', function (newVal, oldVal) {
						if (newVal == oldVal)
							return;
						_updateContraints();
					});
				}
			}
		}
	]);
});
