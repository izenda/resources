izendaRequire.define(['angular', '../services/services', '../directives/directives'], function (angular) {

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
			topPreview: 100,
			topString: '100',
			flip: false,
			applyFilterParams: false
		});

	angular
		.module('izendaDashboard')
		.controller('IzendaTileController', [
			'$window',
			'$timeout',
			'$element',
			'$rootScope',
			'$scope',
			'$log',
			'$injector',
			'$izendaUrl',
			'$izendaRsQuery',
			'$izendaCompatibility',
			'$izendaCommonQuery',
			'$izendaSettings',
			'$izendaDashboardQuery',
			'$izendaEvent',
			'$izendaLocale',
			'$izendaUtil',
			'$izendaDashboardState',
			'$izendaDashboardSettings',
			izendaTileController]);

	/**
	 * Tile controller
	 */
	function izendaTileController(
		$window,
		$timeout,
		$element,
		$rootScope,
		$scope,
		$log,
		$injector,
		$izendaUrl,
		$izendaRsQuery,
		$izendaCompatibility,
		$izendaCommonQuery,
		$izendaSettings,
		$izendaDashboardQuery,
		$izendaEvent,
		$izendaLocale,
		$izendaUtil,
		$izendaDashboardState,
		$izendaDashboardSettings) {

		'use strict';

		$scope.animationCompleted = false;

		var vm = this;
		vm.izendaUrl = $izendaUrl;
		vm.izendaDashboardState = $izendaDashboardState;
		vm.isDesignLinksAllowed = false;
		vm.showAllInResults = true;

		vm.isIE8 = $izendaCompatibility.checkIsIe8();
		vm.isIE = $izendaCompatibility.checkIE();
		vm.printMode = 'Html2PdfAndHtml';

		vm.state = {
			empty: true,
			resizableHandlerStarted: false,
			relativeReportComplexity: 0
		};

		vm.dashboardSyncCompletedForTilePrintHandler = null;

		// delete tile button classes
		vm.deleteClass = 'title-button';
		vm.deleteConfirmClass = 'title-button hidden-confirm-btn';

		vm.tileSizeChanged = false;

		/**
		* Check tile is read only
		*/
		vm.isEditAllowed = function () {
			return $izendaCompatibility.isEditAllowed();
		};

		/**
		* change report category from cat1\cat2\cat3 to cat1/cat2/cat3
		*/
		vm.getConvertedReportCategory = function () {
			if (!angular.isString(vm.reportCategory))
				return null;
			return vm.reportCategory;
		};

		/**
		* Check if one column view required
		*/
		vm.isOneColumnView = function () {
			return $izendaCompatibility.isOneColumnView();
		};

		////////////////////////////////////////////////////////
		// calculated tile parameters:
		////////////////////////////////////////////////////////

		/**
		* Get X coordinate for tile. This coordinate used for drawing tile UI
		*/
		vm.getX = function () {
			return vm.isOneColumnView() ? 0 : vm.x;
		};

		/**
		* Get Y coordinate for tile. This coordinate used for drawing tile UI
		*/
		vm.getY = function () {
			return vm.isOneColumnView() ? 4 * $scope.dashboardController.getTilePositionIndex(vm.id) : vm.y;
		};

		/**
		* Get width of tile. This coordinate used for drawing tile UI
		*/
		vm.getWidth = function () {
			return vm.isOneColumnView() ? 12 : vm.width;
		};

		/**
		* Get height of tile. This coordinate used for drawing tile UI
		*/
		vm.getHeight = function () {
			return vm.isOneColumnView() ? 4 : vm.height;
		};

		/**
		* Check if tile title set
		*/
		vm.isTitleSet = function () {
			return angular.isString(vm.title) && vm.title != '';
		};

		/**
		 * Create title text
		 */
		vm.getTitleText = function () {
			if (vm.isTitleSet())
				return vm.title;
			var result = '';
			if (vm.getConvertedReportCategory())
				result += vm.getConvertedReportCategory() + ' / ';
			if (vm.reportName && vm.reportPartName)
				result += vm.reportName + ' / ' + vm.reportPartName;
			return result;
		};

		/**
		* Check if tile is empty
		*/
		vm.isTileEmpty = function () {
			return vm.state.empty;
		};

		/**
		* Return style object for '.iz-dash-tile'
		*/
		vm.getTileStyle = function () {
			return {
				'top': ($scope.dashboardController.tileHeight * vm.getY()) + 'px',
				'left': ($scope.dashboardController.tileWidth * vm.getX()) + 'px',
				'width': ($scope.dashboardController.tileWidth * vm.getWidth()) + 'px',
				'height': ($scope.dashboardController.tileHeight * vm.getHeight()) + 'px'
			};
		};

		/**
		* get top
		*/
		vm.getTopString = function () {
			return vm.topString;
		};

		////////////////////////////////////////////////////////
		// tile events
		////////////////////////////////////////////////////////

		vm.enableEndTopWatch = function () {
			vm.endTopWatchWatcher = $scope.$watch(angular.bind(vm, function (endTop) {
				return vm.endTop;
			}), function (newVal, oldVal) {
				if (newVal !== oldVal) {
					vm.topPreview = newVal;
					$izendaDashboardQuery.setReportPartTop(vm.reportFullName, vm.topPreview).then(function () {
						flipTileFront(true);
					});
					updateParentTile();
				}
			});
		};

		vm.disableEndTopWatch = function () {
			if (vm.endTopWatchWatcher)
				vm.endTopWatchWatcher();
			vm.endTopWatchWatcher = null;
		};

		vm.initializeEventHandlers = function () {
			/**
			 * Watch top changed in UI
			 */
			vm.enableEndTopWatch();

			/**
			 * Current top value
			 */
			$scope.$watch(angular.bind(vm, function () {
				return vm.topPreview;
			}), function (newTop) {
				vm.topString = newTop <= 0 ? 'ALL' : newTop + '';
			});

			/**
			* Watch title changed
			*/
			$scope.$watch(angular.bind(vm, function (title) {
				return vm.title;
			}), function (newVal, oldVal) {
				if (newVal !== oldVal) {
					updateParentTile();
				}
				$rootScope.$broadcast('tileTitleSet', [vm.reportFullName, newVal]);
			});

			/**
			* Watch description changed
			*/
			$scope.$watch(angular.bind(vm, function (description) {
				return vm.description;
			}), function (newVal, oldVal) {
				if (newVal !== oldVal) {
					updateParentTile();
				}
			});

			$izendaEvent.handleQueuedEvent('dashboardSyncCompletedEvent', $scope, vm, function (subject) {
				if (typeof vm.dashboardSyncCompletedForTilePrintHandler == 'function')
					if (subject == 'tile-print')
						vm.dashboardSyncCompletedForTilePrintHandler();
			});
		};

		////////////////////////////////////////////////////////
		// scope functions:
		////////////////////////////////////////////////////////
		/**
		* Initialize tile
		*/
		vm.initialize = function (tile) {
			/**
			* Tile refresh event handler
			*/
			$scope.$on('tileRefreshEvent', function (event, args) {
				if (args.length > 0 && typeof (args[0]) == 'boolean')
					vm.refreshTile(args[0]);
				else
					vm.refreshTile(false);
			});

			$scope.$on('tileClearEvent', function () {
				clearTileContent();
			});

			/**
			* Tile light effect
			*/
			$scope.$on('tileLedStartEvent', function (event, args) {
				if (args.length !== 1 || typeof (args[0]) !== 'string')
					return;
				var reportFullName = args[0];
				if (reportFullName !== vm.reportFullName)
					return;
				$getFlippies().css('background-color', 'greenyellow');
			});

			/**
			* Turn off tile led effect
			*/
			$scope.$on('tileLedEndEvent', function (event, args) {
				if (args.length !== 1 || typeof (args[0]) !== 'string')
					return;
				var reportFullName = args[0];
				if (reportFullName !== vm.reportFullName)
					return;
				$getFlippies().css('background-color', '#fff');
			});

			/**
			* Start tile edit event handler
			*/
			$scope.$on('startEditTileEvent', function (event, args) {
				var eventOptions = angular.isArray(args) && args.length > 0 ? args[0] : null;
				if (eventOptions == null)
					throw 'tile controller: startEditTileEvent should have 1 options argument.';
			});

			/**
			* Tile edit completed event handler
			*/
			$scope.$on('stopEditTileEvent', function (event, args) {
				var eventOptions = angular.isArray(args) && args.length > 0 ? args[0] : null;
				if (eventOptions == null)
					throw 'tile controller: stopEditTileEvent should have 1 options argument.';

				var tileIdArray = angular.isArray(eventOptions.tileId) ? eventOptions.tileId : [eventOptions.tileId];
				if (tileIdArray.indexOf(vm.id) >= 0) {
					vm.updateTileParameters();
					updateParentTile();
					if (eventOptions.refresh)
						vm.refreshTile(false);
				}
				$scope.dashboardController.isChangingNow = false;
			});

			/**
			* Report selected handler
			*/
			$scope.$on('selectedReportPartEvent', function (event, args) {
				var tileId = args[0];
				if (tileId !== vm.id)
					return;
				var rpInfo = args[1];
				var fName = rpInfo.Name;
				if (!$izendaUtil.isUncategorized(rpInfo.Category))
					fName = rpInfo.Category + $izendaSettings.getCategoryCharacter() + fName;

				var nameparts = rpInfo.Name.split('@');
				var name = nameparts[0];
				var part = nameparts[1];

				var isTileInDashboard = $scope.dashboardController.tiles.filter(function (tile) {
					return tile.reportPartName === part
							&& tile.reportName === name
							&& ((tile.reportCategory === rpInfo.Category)
								|| ($izendaUtil.isUncategorized(tile.reportCategory) && $izendaUtil.isUncategorized(rpInfo.Category)));
				}).length > 0;

				if (isTileInDashboard) {
					var errorText = $izendaLocale.localeText('js_CantSelectReportPart',
						'Can\'t select report part because dashboard already contains tile with that report.');
					$rootScope.$broadcast('izendaShowNotificationEvent', [errorText]);
					return;
				}

				// update report parameters
				vm.previousReportFullName = vm.reportFullName;
				angular.extend(vm, vm.izendaUrl.extractReportPartNames(fName, true));
				vm.title = rpInfo.Title;
				vm.reportNameWithCategory = vm.reportName;
				if (!$izendaUtil.isUncategorized(vm.reportCategory))
					vm.reportNameWithCategory = vm.reportCategory + $izendaSettings.getCategoryCharacter() + vm.reportNameWithCategory;

				if (rpInfo.IsLocked)
					vm.maxRights = 'Locked';
				else if (rpInfo.ViewOnly)
					vm.maxRights = 'View Only';
				else if (rpInfo.ReadOnly)
					vm.maxRights = 'Read Only';
				else
					vm.maxRights = 'Full Access';

				// set top variables for tile:
				vm.top = rpInfo.NativeTop && rpInfo.NativeTop > 0 ? rpInfo.NativeTop : 100;
				vm.topPreview = vm.top;
				vm.topString = '' + vm.top;
				vm.disableEndTopWatch();
				vm.endTop = vm.top;
				vm.enableEndTopWatch();
				vm.designerType = rpInfo.DesignerType;
				updateParentTile();
				vm.flipFront(true, true);
			});


			// extend scope with tile parameters and default parameters:
			var tileDefaults = $injector.get('tileDefaults');
			angular.extend(this, tileDefaults, tile);

			// set report name
			vm.reportNameWithCategory = vm.reportName;
			if (vm.reportCategory != null)
				vm.reportNameWithCategory = vm.reportCategory + $izendaSettings.getCategoryCharacter() + vm.reportNameWithCategory;

			initializeAdHocSettings();

			initializeDraggable();
			initializeResizable();
			updateDashboardHandlers($element);

			vm.initializeEventHandlers();

			// watch for window width change
			$scope.$watch('izendaDashboardState.getWindowWidth()', function (newWidth) {
				if (angular.isUndefined(newWidth))
					return;
				var $tile = $scope.dashboardController.getTile$ById(vm.id);
				if (!$tile.is(':visible'))
					return;
				if (vm.isOneColumnView()) {
					$tile.addClass('mobile');
				} else {
					$tile.removeClass('mobile');
				}
				updateDashboardHandlers($tile);
				vm.refreshTile(false);
			});

			// add/remove .hover class for tile
			$element.hover(function () {
				applyTileHover(angular.element(this), true);
			}, function () {
				applyTileHover(angular.element(this), false);
			});

			refreshTile(false);
		};

		/**
		* Select report part for tile
		*/
		vm.selectReportPart = function () {
			$rootScope.$broadcast('openSelectPartModalEvent', [vm.id]);
		};

		vm.hasRightLevel = function (requiredLevel) {
			var rights = ['None', 'Locked', 'View Only', 'Read Only', 'Full Access'];
			var currentRightLevel = rights.indexOf(vm.maxRights);
			if (currentRightLevel < 0)
				throw 'Unknown right string: ' + vm.maxRights;
			return currentRightLevel >= requiredLevel;
		}

		vm.hasLockedRightsOrMore = function () {
			return vm.hasRightLevel(1);
		};

		vm.hasViewOnlyRightsOrMore = function () {
			return vm.hasRightLevel(2);
		};

		vm.hasReadOnlyRightsOrMore = function () {
			return vm.hasRightLevel(3);
		};

		vm.hasFullRights = function () {
			return vm.hasRightLevel(4);
		};

		/**
		* Get source report name
		*/
		vm.getSourceReportName = function () {
			var result = vm.reportName;
			if (!$izendaUtil.isUncategorized(vm.reportCategory)) {
				result = vm.reportCategory + $izendaSettings.getCategoryCharacter() + result;
			}
			return result;
		};

		/**
		* Get report viewer link for tile report
		*/
		vm.getReportViewerLink = function () {
			return getAppendedUrl(vm.izendaUrl.settings.urlReportViewer + '?rn=' + vm.getSourceReportName());
		};

		/**
		* Go to report viewer
		*/
		vm.fireReportViewerLink = function () {
			if (!vm.isSourceReportDeleted) {
				$window.open(vm.getReportViewerLink(), '_blank');
			} else {
				var errorText = $izendaLocale.localeText('js_SourceReportNotExist', 'Source report "{0}" doesn\'t exist.');
				errorText = errorText.replaceAll(/\{0\}/, vm.getSourceReportName());
				$rootScope.$broadcast('izendaShowMessageEvent', [
							errorText,
							$izendaLocale.localeText('js_Error', 'Error'),
							'danger']);
			}
		};

		/**
		* Get report editor link for tile report
		*/
		vm.getReportEditorLink = function () {
			var designerUrl = vm.designerType === 'InstantReport'
				? vm.izendaUrl.settings.urlInstantReport
				: vm.izendaUrl.settings.urlReportDesigner;
			return getAppendedUrl(designerUrl + '?rn=' + vm.getSourceReportName());
		};

		/**
		* Go to report editor
		*/
		vm.fireReportEditorLink = function () {
			if (!vm.isSourceReportDeleted) {
				$window.location.href = vm.getReportEditorLink();
			} else {
				var errorText = $izendaLocale.localeText('js_SourceReportNotExist', 'Source report "{0}" not exist.');
				errorText = errorText.replaceAll(/\{0\}/, vm.getSourceReportName());
				$rootScope.$broadcast('izendaShowMessageEvent', [
							errorText,
							$izendaLocale.localeText('js_Error', 'Error'),
							'danger']);
			}
		};

		/**
		* Is tile content should be hidden now.
		*/
		vm.isReportDivHidden = function () {
			return vm.reportFullName == null || $scope.dashboardController.isChangingNow;
		};

		/**
		* Show confirm delete dialog in title
		*/
		vm.showConfirmDelete = function () {
			vm.deleteClass = 'title-button hidden-btn';
			vm.deleteConfirmClass = 'title-button';
		};

		/**
		* Hide confirm delete dialog in title
		*/
		vm.hideConfirmDelete = function () {
			vm.deleteClass = 'title-button';
			vm.deleteConfirmClass = 'title-button hidden-confirm-btn';
		};

		/**
		* Delete tile handler
		*/
		vm.deleteTile = function () {
			$rootScope.$broadcast('deleteTileEvent', [{
				tileId: vm.id
			}]);
		};

		/**
		* Refresh tile handler
		*/
		vm.refreshTile = function (updateFromSourceReport) {
			refreshTile(updateFromSourceReport);
		};

		/**
		* Tile top changed:
		*/
		vm.topSelected = function () {
			updateParentTile();
			/*$izendaDashboardQuery.setReportPartTop(vm.reportFullName, vm.topPreview).then(function () {
					flipTileFront(true);
			});*/
		};

		/**
		* Is html model enabled in AdHocSettings
		*/
		vm.isPrintTileVisible = function () {
			return vm.printMode === 'Html' || vm.printMode === 'Html2PdfAndHtml';
		};

		/**
		* Get adhocsettings
		*/
		function initializeAdHocSettings() {
			// common settings
			var settings = $izendaSettings.getCommonSettings();
			vm.isDesignLinksAllowed = settings.showDesignLinks;
			vm.showAllInResults = settings.showAllInResults;

			// dashboard settings
			vm.printMode = $izendaDashboardSettings.allowedPrintEngine;

			$scope.$applyAsync();
		};

		/**
		* Print tile
		*/
		vm.printTile = function () {

			$scope.dashboardController.printDashboardAsHtml(vm.reportFullName).then(function () {
				vm.flipFront(true, false);
			});
		};

		/**
		* Export to excel
		*/
		vm.exportToExcel = function () {
			var addParam = '';
			if (typeof (window.izendaPageId$) !== 'undefined')
				addParam += '&izpid=' + window.izendaPageId$;
			if (typeof (window.angularPageId$) !== 'undefined')
				addParam += '&anpid=' + window.angularPageId$;

			// download the file
			$scope.dashboardController.exportProgress = 'print';
			$izendaRsQuery.downloadFileRequest('GET', vm.izendaUrl.settings.urlRsPage + '?rpn=' + vm.reportFullName + '&output=XLS(MIME)' + addParam).then(function () {
				$scope.dashboardController.exportProgress = null;
				vm.flipFront(true, false);
				$izendaEvent.queueEvent('dashboardSyncEvent', ['tile-print']);
				$scope.$applyAsync();
			});
		};

		/**
		* Refresh tile parameters
		*/
		vm.updateTileParameters = function () {
			var $tile = $scope.dashboardController.getTile$ById(vm.id);
			var x = Math.round($tile.position().left / $scope.dashboardController.tileWidth),
				y = Math.round($tile.position().top / $scope.dashboardController.tileHeight),
				width = Math.round($tile.width() / $scope.dashboardController.tileWidth),
				height = Math.round($tile.height() / $scope.dashboardController.tileHeight);
			vm.x = x > 0 ? x : 0;
			vm.y = y > 0 ? y : 0;
			vm.width = width;
			vm.height = height;
			updateParentTile();
		};

		/**s
		* Flip tile back
		*/
		vm.flipBack = function () {
			flipTileBack();
		};

		/**
		* Flip tile front
		*/
		vm.flipFront = function (update, updateFromSourceReport) {
			flipTileFront(update, updateFromSourceReport);
		};

		/**
		* Class for confirm delete button (depends on tile size)
		*/
		vm.getConfirmDeleteClass = function () {
			if (vm.width <= 1)
				return 'title-button-confirm-remove short';
			return 'title-button-confirm-remove';
		};

		/**
		* Class for cancel delete button (depends on tile size)
		*/
		vm.getCancelDeleteClass = function () {
			if (vm.width <= 1)
				return 'title-button-cancel-remove short';
			return 'title-button-cancel-remove';
		};

		////////////////////////////////////////////////////////
		// tile functions:
		////////////////////////////////////////////////////////

		function updateGalleryState() {
			// update "hasTiles" variable
			$scope.dashboardController.updateGalleryTiles();
		}

		/**
		* Update parent collection. Should be called when tile change ends.
		*/
		function updateParentTile() {
			var parentTile = $scope.dashboardController.getTileById(vm.id);
			var oldTile = jQuery.extend({}, parentTile);
			parentTile.width = vm.width;
			parentTile.height = vm.height;
			parentTile.x = vm.x;
			parentTile.y = vm.y;
			parentTile.top = vm.top;
			parentTile.topPreview = vm.topPreview;
			parentTile.reportName = vm.reportName;
			parentTile.reportPartName = vm.reportPartName;
			parentTile.reportCategory = vm.reportCategory;
			parentTile.reportSetName = vm.reportSetName;
			parentTile.reportFullName = vm.reportFullName;
			parentTile.reportNameWithCategory = vm.reportNameWithCategory;
			parentTile.title = vm.title;
			parentTile.description = vm.description;
			parentTile.maxRights = vm.maxRights;

			var change = {};
			var changeCount = 0;
			for (var prop in parentTile) {
				if (parentTile.hasOwnProperty(prop)) {
					var newValue = parentTile[prop];
					if (!(prop in oldTile) || newValue !== oldTile[prop]) {
						change[prop] = newValue;
						changeCount++;
					}
				}
			}
			updateGalleryState();
		};

		/**
		* initialize draggable for tile
		*/
		function initializeDraggable() {
			$element.draggable({
				stack: '.iz-dash-tile',
				handle: '.title-container',
				helper: function (event) {
					var width = vm.getWidth() * $scope.dashboardController.tileWidth;
					var height = vm.getHeight() * $scope.dashboardController.tileHeight;
					var helperStr =
						'<div class="iz-dash-tile iz-dash-tile-helper" style="top: 0px; height: ' + height + 'px; left: 0px; width: ' + width + 'px; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0); z-index: 1000;">' +
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
					// turn off window resize handler
					$izendaDashboardState.turnOffWindowResizeHandler();
					$rootScope.$broadcast('startEditTileEvent', [{
						tileId: vm.id,
						actionName: 'drag'
					}]);

					var $helper = ui.helper;
					var $helperFlippies = $getFlippyFront($helper);
					$scope.$allFlippies = $scope.dashboardController.getTileContainer().find('.iz-dash-tile > .animate-flip > .flippy-front, .iz-dash-tile > .animate-flip > .flippy-back');
					$helperFlippies.removeClass('flipInY');
					$helperFlippies.css('background-color', 'rgba(50,205,50, 0.3)');
					$helperFlippies.find('.frame').remove();
					$helper.css('z-index', 1000);
					$helper.css('opacity', 1);
				},
				drag: function (event, ui) {
					var $helper = ui.helper;
					var $helperFlippies = $getFlippyFront($helper);

					var helperPos = $helper.position();
					// move tile shadow
					var x = Math.round(helperPos.left / $scope.dashboardController.tileWidth) * $scope.dashboardController.tileWidth;
					var y = Math.round(helperPos.top / $scope.dashboardController.tileHeight) * $scope.dashboardController.tileHeight;
					var helperBbox = {
						left: x,
						top: y,
						width: $helper.width(),
						height: $helper.height()
					};
					$scope.dashboardController.showTileGridShadow(helperBbox, false);
					$scope.dashboardController.updateDashboardSize(helperBbox);

					// check underlying tile
					$scope.$allFlippies.css('background-color', '#fff');
					$helperFlippies.css('background-color', 'rgba(50,205,50, 0.3)');
					var $target = $scope.dashboardController.getUnderlyingTile(event.pageX, event.pageY, vm);
					if ($target != null) {
						var $targetFlippies = $getFlippies($target);
						$scope.dashboardController.hideTileGridShadow();
						$targetFlippies.css('background-color', 'rgba(50,205,50, 1)');
					} else {
						if ($scope.dashboardController.checkTileIntersects(vm, $helper) || $scope.dashboardController.checkTileMovedToOuterSpace($helper, 10)) {
							$helperFlippies.css('background-color', 'rgba(220,20,60,0.2)');
						}
					}
				},
				stop: function (event, ui) {
					var $helper = ui.helper;
					var $source = angular.element(event.target);

					$scope.$allFlippies.css('background-color', '#fff');

					angular.forEach($scope.dashboardController.tiles, function (tile) {
						$scope.dashboardController.getTile$ById(tile.id).css('z-index', 1);
					});

					var $target = $scope.dashboardController.getUnderlyingTile(event.pageX, event.pageY, vm);

					// swap tile:
					if ($target != null) {
						$scope.dashboardController.swapTiles($source, $target).then(function (swappedTiles) {
							var $swappedTile1 = swappedTiles[0],
							$swappedTile2 = swappedTiles[1];
							$swappedTile1.find('.frame').show();
							$swappedTile2.find('.frame').show();
							var tileSizeChanged = Math.abs($swappedTile1.width() - $swappedTile2.width()) > 5
												|| Math.abs($swappedTile1.height() - $swappedTile2.height()) > 5;
							var id1 = $scope.dashboardController.getTile$Id($swappedTile1),
								id2 = $scope.dashboardController.getTile$Id($swappedTile2);
							$rootScope.$broadcast('stopEditTileEvent', [{
								tileId: [id1, id2],
								refresh: tileSizeChanged,
								actionName: 'drag'
							}]);
						});
						$scope.$allFlippies.css('background-color', '');
						return;
					}

					// cancel drag if have intersections or tile is out of dashboard space:
					if ($scope.dashboardController.checkTileIntersects(vm, $helper) || $scope.dashboardController.checkTileMovedToOuterSpace($helper, 10)) {
						vm.updateTileParameters();
						$rootScope.$broadcast('stopEditTileEvent', [{
							tileId: vm.id,
							refresh: false,
							actionName: 'drag'
						}]);
						$scope.$allFlippies.css('background-color', '');
						return;
					}

					// move tile to new location:
					var pos = $helper.position();
					var $t = $scope.dashboardController.getTile$ByInnerEl($source);
					$t.animate({
						left: Math.round(pos.left / $scope.dashboardController.tileWidth) * $scope.dashboardController.tileWidth,
						top: Math.round(pos.top / $scope.dashboardController.tileHeight) * $scope.dashboardController.tileHeight
					}, 500, function () {
						vm.updateTileParameters();
						$rootScope.$broadcast('stopEditTileEvent', [{
							tileId: vm.id,
							refresh: false,
							actionName: 'drag'
						}]);
					});
					$scope.$allFlippies.css('background-color', '');

					// turn on window resize handler
					$izendaDashboardState.turnOnWindowResizeHandler();
				}
			});
		}

		/**
		* Initialize resizable handler
		*/
		function initializeResizable() {
			var $animates = $scope.dashboardController.getTileContainer().find('.animate-flip');
			$element.resizable({
				minHeight: $scope.dashboardController.tileHeight,
				minWidth: $scope.dashboardController.tileWidth,
				grid: [$scope.dashboardController.tileWidth, $scope.dashboardController.tileHeight],
				/*containment: 'parent',*/
				handles: 'n, e, s, w, se',
				start: function (event, ui) {
					// turn off window resize handler
					$izendaDashboardState.turnOffWindowResizeHandler();

					$rootScope.$broadcast('startEditTileEvent', [{
						tileId: vm.id,
						actionName: 'resize'
					}]);
					$animates = $scope.dashboardController.getTileContainer().find('.animate-flip');
					var $target = angular.element(event.target);
					var $targetFlippies = $getFlippies($target);
					$targetFlippies.removeClass('flipInY');
					$targetFlippies.css('background-color', 'rgba(50,205,50, 0.3)');
					$targetFlippies.children('.frame').addClass('hidden');
					$target.css('z-index', 1000);
					$target.css('opacity', 1);
				},
				resize: function (event, ui) {
					var $currentTileUi = ui.element;
					var $t = $scope.dashboardController.getTile$ByInnerEl($currentTileUi);
					var tile = $scope.dashboardController.getTileByTile$($t);

					var helperPos = $currentTileUi.position();
					var x = Math.round(helperPos.left / $scope.dashboardController.tileWidth) * $scope.dashboardController.tileWidth;
					var y = Math.round(helperPos.top / $scope.dashboardController.tileHeight) * $scope.dashboardController.tileHeight;
					var helperBbox = {
						left: x,
						top: y,
						height: Math.round($currentTileUi.height() / $scope.dashboardController.tileHeight) * $scope.dashboardController.tileHeight,
						width: Math.round($currentTileUi.width() / $scope.dashboardController.tileWidth) * $scope.dashboardController.tileWidth
					};
					$scope.dashboardController.updateDashboardSize(helperBbox);

					$animates.find('.flippy-front,.flippy-back').css('background-color', '#fff');
					$t.find('.flippy-front,.flippy-back').css('background-color', 'rgba(50,205,50, 0.5)');
					if ($scope.dashboardController.checkTileIntersects(tile)) {
						$t.find('.flippy-front,.flippy-back').css('background-color', 'rgba(220,20,60,0.5)');
					}
				},
				stop: function (event, ui) {
					var $currentTileUi = ui.element;
					var $t = $scope.dashboardController.getTile$ByInnerEl($currentTileUi);
					var tile = $scope.dashboardController.getTileByTile$($t);
					$t.css('z-index', 1);
					$t.find('.frame').removeClass('hidden');
					$t.find('.flippy-front, .flippy-back').addClass('flipInY');
					$animates.find('.flippy-front,.flippy-back').css('background-color', '');
					if ($scope.dashboardController.checkTileIntersects(tile)) {
						// revert if intersects
						$currentTileUi.animate({
							left: ui.originalPosition.left,
							top: ui.originalPosition.top,
							width: ui.originalSize.width,
							height: ui.originalSize.height
						}, 200, function () {
							// no need to update tile:
							vm.updateTileParameters();
							$rootScope.$broadcast('stopEditTileEvent', [{
								actionName: 'resize'
							}]);
						});
					} else {
						var isFlippyBack = $t.find('.flippy-back').is(':visible');

						// fix out of bounds positions.
						var tp = $t.position();
						if (tp.left + $t.width() > $scope.dashboardController.tileWidth * 12) {
							$currentTileUi.width($scope.dashboardController.tileWidth * 12 - tp.left);
						}
						if (tp.left < 0) {
							$t.width($t.width() + tp.left);
							$t.css('left', 0);
						}
						if (tp.top < 0) {
							$t.height($t.height() + tp.top);
							$t.css('top', 0);
						}

						vm.tileSizeChanged = $currentTileUi.width() != ui.originalSize.width || $currentTileUi.height() != ui.originalSize.height;
						vm.updateTileParameters();
						$rootScope.$broadcast('stopEditTileEvent', [{
							tileId: vm.id,
							actionName: 'resize',
							refresh: !isFlippyBack
						}]);
					}

					$getReport($t).removeClass('hidden');
					$t.css('opacity', 1);
					// turn on window resize handler
					$izendaDashboardState.turnOnWindowResizeHandler();
				}
			});
			vm.state.resizableHandlerStarted = true;
		}

		/**
		* Flip tile to the front side and refresh if needed.
		*/
		function flipTileFront(update, updateFromSourceReport) {
			var $tile = $getTile();
			$tile.children('.ui-resizable-handle').hide();
			var showClass = 'animated fast flipInY';
			var hideClass = 'animated fast flipOutY';

			var $front = $getFlippyFront();
			var $back = $getFlippyBack();
			$back.addClass(hideClass);
			$front.removeClass(showClass);
			$front.css('display', 'block').addClass(showClass);
			$back.css('display', 'none').removeClass(hideClass);

			$timeout(function () {
				$front.removeClass('flipInY');
				$back.removeClass('flipInY');
				$tile.children('.ui-resizable-handle').fadeIn(200);
			}, 200).then(function () {
				vm.flip = false;
				$scope.$applyAsync();
			});

			if (update) {
				refreshTile(updateFromSourceReport);
			}
		}

		/**
		* Flip tile to back side
		*/
		function flipTileBack() {
			var $tile = $getTile();
			$tile.children('.ui-resizable-handle').hide();
			var showClass = 'animated fast flipInY';
			var hideClass = 'animated fast flipOutY';

			var $front = $getFlippyFront()
			var $back = $getFlippyBack();
			$front.addClass(hideClass);
			$back.removeClass(showClass);
			$back.css('display', 'block').addClass(showClass);
			$front.css('display', 'none').removeClass(hideClass);

			vm.flip = true;
			$timeout(function () {
				$front.removeClass('flipInY');
				$back.removeClass('flipInY');
				$tile.children('.ui-resizable-handle').fadeIn(200);
				$scope.$applyAsync();
			}, 200);
		}

		/**
		* Update handlers state
		*/
		function updateDashboardHandlers($tile) {
			if (vm.isEditAllowed()) {
				$tile.resizable('enable');
				$tile.draggable('enable');
				if (vm.state.resizableHandlerStarted) {
					$tile.resizable('option', 'grid', [$scope.dashboardController.tileWidth, $scope.dashboardController.tileHeight]);
					$tile.resizable('option', 'minHeight', $scope.dashboardController.tileHeight);
					$tile.resizable('option', 'minWidth', $scope.dashboardController.tileWidth);
				}
			} else {
				$tile.resizable('disable');
				$tile.draggable('disable');
			}
		}

		/**
		* Clear tile content
		*/
		function clearTileContent() {
			var $body = $getReport();
			$body.empty();
		}

		/**
		* Refresh tile content
		*/
		function refreshTile(updateFromSourceReport) {
			var $body = $getReport();
			var updateFromSource = vm.updateFromSource || updateFromSourceReport;
			vm.tileSizeChanged = false;
			vm.updateFromSource = false;
			if (vm.reportFullName == null || vm.reportFullName === '') {
				return;
			}
			var previousReportName = vm.previousReportFullName;
			vm.previousReportFullName = null;

			if (!angular.isUndefined(vm.preloadData) && vm.preloadData !== null) {
				applyTileHtml(vm.preloadData);
				vm.preloadData = null;
			} else {
				// splash screen
				var loadingHtml = '<div class="izenda-vcentered-container">' +
					'<div class="izenda-vcentered-item">' +
					'<img class="img-responsive" src="' + vm.izendaUrl.settings.urlRpPage + '?image=ModernImages.loading-grid.gif" alt="Loading..." />' +
					'</div>' +
					'</div>';
				$body.html(loadingHtml);
				// load from handler:
				if (vm.preloadDataHandler != null) {
					vm.preloadDataHandler.then(function (htmlData) {
						applyTileHtml(htmlData);
					});
				} else {
					var tileWidth = vm.getWidth() * $scope.dashboardController.tileWidth - 20;
					var tileHeight = vm.getHeight() * $scope.dashboardController.tileHeight - 55;
					if (vm.description) {
						tileHeight -= 32;
					}
					$izendaDashboardQuery.loadTileReport({
						updateFromSourceReport: updateFromSource,
						dashboardFullName: vm.izendaUrl.getReportInfo().fullName,
						reportFullName: vm.reportFullName,
						reportPreviousFullName: previousReportName,
						top: vm.topPreview,
						contentWidth: tileWidth,
						contentHeight: tileHeight,
						forPrint: false,
						applyFilterParams: vm.applyFilterParams
					}).then(function (data) {
						var htmlData;
						if (typeof (data) === 'string') {
							htmlData = data
						} else if (typeof (data) === 'object') {
							htmlData = data.html;
							vm.top = data.top && data.top > 0 ? data.top : 100;
							vm.topPreview = vm.top;
							vm.topString = '' + vm.top;
							vm.disableEndTopWatch();
							vm.endTop = vm.top;
							vm.enableEndTopWatch();
							vm.title = data.title;
							vm.description = data.description;
							updateParentTile();
						} else {
							throw 'Unexpected query result: ' + data;
						}
						if (updateFromSourceReport)
							$izendaEvent.queueEvent('refreshFilters', [], true);
						applyTileHtml(htmlData);
					});
					vm.applyFilterParams = false;
				}
			}
		}

		/**
		* Set tile hover
		*/
		function applyTileHover(tile, value) {
			tile.removeClass('no-hover-overflow');
			if (value) {
				if (!vm.isIE || vm.state.relativeReportComplexity < 0.5)
					tile.addClass('hover');
			} else {
				if (vm.state.relativeReportComplexity < 0.5)
					tile.addClass('no-hover-overflow');
				if (!vm.isIE || vm.state.relativeReportComplexity < 0.5)
					tile.removeClass('hover');
			}
		}

		/**
		* Set tile inner html
		*/
		function applyTileHtml(htmlData) {
			vm.preloadDataHandler = null;
			vm.preloadData = null;

			// load tile content
			var $report = angular.element($element).find('.report');
			$izendaDashboardState.loadReportIntoContainer(htmlData, $report);

			var numberOfCellInComplexReport = 3000;
			var numberOfCells = angular.element($element).find('.ReportTable td').length;
			vm.state.relativeReportComplexity = numberOfCells / numberOfCellInComplexReport;
			if (vm.state.relativeReportComplexity > 1)
				vm.state.relativeReportComplexity = 1;

			if (vm.isIE && vm.state.relativeReportComplexity >= 0.5)
				$element.addClass('hover-ie');
			var tile = $getTile();
			applyTileHover(tile, tile.is(':hover'));

			vm.state.empty = false;
		}

		function $getTile($customTile) {
			return angular.isDefined($customTile) ? angular.element($customTile) : angular.element($element);
		}

		function $getFlippies($customTile) {
			var $tile = $getTile($customTile);
			return $tile.children('.animate-flip').children('.flippy');
		}

		function $getFlippyFront($customTile) {
			var $tile = $getTile($customTile);
			return $tile.children('.animate-flip').children('.flippy-front');
		}

		function $getFlippyBack($customTile) {
			var $tile = $getTile($customTile);
			return $tile.children('.animate-flip').children('.flippy-back');
		}

		function $getReport($customTile) {
			var $tile = $getTile($customTile);
			return $tile.children('.animate-flip').children('.flippy-front').find('.report');
		}
	}

});