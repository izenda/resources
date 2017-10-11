izendaRequire.define([
	'angular',
	'../../common/core/services/compatibility-service',
	'../../common/core/services/localization-service',
	'../../common/core/services/event-service',
	'../../common/core/services/util-ui-service',
	'../../common/core/directives/bootstrap-modal',
	'../../common/core/components/message/component',
	'../../common/core/components/notification/component',
	'../../common/query/services/rs-query-service',
	'../../common/query/services/common-query-service',
	'../../common/query/services/settings-service',
	'../../common/query/services/url-service',
	'../../common/ui/services/schedule-service',
	'../../common/ui/services/share-service',
	'../../common/ui/directives/splashscreen',
	'../../common/ui/components/select-report-name/component',
	'../../common/ui/components/select-report/component',
	'../services/services',
	'../directives/directives'
], function (angular) {

	angular
		.module('izendaDashboard')
		.controller('IzendaDashboardController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			'$animate',
			'$injector',
			'$izendaUtilUiService',
			'$izendaBackground',
			'$izendaUrl',
			'$izendaCompatibility',
			'$izendaDashboardQuery',
			'$izendaCommonQuery',
			'$izendaRsQuery',
			'$izendaEvent',
			'$izendaLocale',
			'$izendaSettings',
			'$izendaScheduleService',
			'$izendaShareService',
			'$izendaDashboardState',
			'$izendaGalleryService',
			'$izendaDashboardSettings',
			IzendaDashboardController]);

	/**
	 * Dashboard controller
	 */
	function IzendaDashboardController(
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$log,
		$animate,
		$injector,
		$izendaUtilUiService,
		$izendaBackground,
		$izendaUrl,
		$izendaCompatibility,
		$izendaDashboardQuery,
		$izendaCommonQuery,
		$izendaRsQuery,
		$izendaEvent,
		$izendaLocale,
		$izendaSettings,
		$izendaScheduleService,
		$izendaShareService,
		$izendaDashboardState,
		$izendaGalleryService,
		$izendaDashboardSettings) {

		'use strict';

		var vm = this;
		var _ = angular.element;
		$scope.izendaUrl = $izendaUrl;
		$scope.izendaDashboardState = $izendaDashboardState;
		$scope.$izendaGalleryService = $izendaGalleryService;
		vm.reportInfo = null;

		var newTileIndex = 1;

		vm.licenseInitialized = false;
		vm.dashboardsAllowedByLicense = false;

		vm.isLoaded = false;
		vm.isSaveReportModalOpened = false;

		vm.isIE8 = $izendaCompatibility.checkIsIe8();

		// dashboard tiles container
		vm.tileContainerStyle = {
			'height': 0
		};

		// gallery
		vm.galleryContainerStyle = {
			'height': 0
		};
		vm.galleryState = $izendaGalleryService.getGalleryState();
		vm.galleryTileIndex = 0;
		vm.galleryUpdateCounter = 0;

		// is dashboard changing now.
		vm.isChangingNow = false;

		// dashboard tiles
		vm.tiles = [];
		vm.galleryTiles = [];
		vm.tileWidth = 0;
		vm.tileHeight = 0;

		vm.rights = 'None'; // dashboard sharing rights for current user

		vm.isMessageDialogOpened = false;
		vm.messageDialogText = '';
		vm.messageDialogTitle = '';

		// grid:
		vm.isGridVisible = false;
		vm.gridStyle = {
			'background-size': vm.tileWidth + 'px ' + vm.tileHeight + 'px, ' + vm.tileWidth + 'px ' + vm.tileHeight + 'px'
		};
		vm.isGridShadowVisible = false;
		vm.isGridShadowPlusButtonVisible = false;
		vm.gridShadowStyle = {

		};

		vm.exportProgress = null;
		vm.getWaitMessageHeaderText = function () {
			if (vm.exportProgress === 'export') {
				return $izendaLocale.localeText('js_ExportingInProgress', 'Exporting in progress.');
			}
			if (vm.exportProgress === 'print') {
				return $izendaLocale.localeText('js_PrintingInProgress', 'Printing in progress.');
			}
			return '';
		}
		vm.getWaitMessageText = function () {
			if (vm.exportProgress === 'export') {
				return $izendaLocale.localeText('js_FinishExporting', 'Please wait till export is completed...');
			}
			if (vm.exportProgress === 'print') {
				return $izendaLocale.localeText('js_FinishPrinting', 'Please finish printing before continue.');
			}
			return '';
		}

		////////////////////////////////////////////////////////
		// scope helper functions:
		////////////////////////////////////////////////////////
		var _$dashboardsDiv = null;
		vm.getRoot = function () {
			if (!_$dashboardsDiv || !_$dashboardsDiv.length)
				_$dashboardsDiv = angular.element('#dashboardsDiv');
			return _$dashboardsDiv;
		};

		var _$tileContainer = null;
		vm.getTileContainer = function () {
			if (!_$tileContainer || !_$tileContainer.length)
				_$tileContainer = angular.element('#dashboardBodyContainer');
			return _$tileContainer;
		};

		var _$galleryContainer = null;
		vm.getGalleryContainer = function () {
			if (!_$galleryContainer || !_$galleryContainer.length)
				_$galleryContainer = angular.element('#galleryBodyContainer');
			return _$galleryContainer;
		};

		vm.getTileById = function (tileId) {
			var searchResult = angular.element.grep(vm.tiles, function (tile) {
				return tile.id === tileId;
			});
			return searchResult.length > 0 ? searchResult[0] : null;
		};

		vm.getTileIndex = function (tileid) {
			var i = 0;
			var result = -1;
			while (i < vm.tiles.length && result < 0) {
				if (vm.tiles[i].id === tileid)
					result = i;
				i++;
			}
			return result;
		};
		vm.getTileByTile$ = function (tile$) {
			return vm.getTileById(vm.getTile$Id(tile$));
		};
		vm.getOtherTiles = function (tiles, tile) {
			var result;
			if (tile != null) {
				result = [];
				for (var i = 0; i < tiles.length; i++) {
					if (tiles[i].id != tile.id)
						result.push(tiles[i]);
				}
			} else {
				result = tiles;
			}
			return result;
		};
		vm.getTile$ById = function (tileId) {
			return vm.getTileContainer().find('.iz-dash-tile[tileid="' + tileId + '"]');
		};
		vm.getTile$Id = function ($tile) {
			return $tile.attr('tileid');
		};
		vm.getTile$ByInnerEl = function (el) {
			var $el = _(el);
			return _($el.closest('.iz-dash-tile'));
		};
		vm.isTile$ = function (el) {
			var $el = _(el);
			return $el.closest('izenda-dashboard-tile').length > 0;
		};

		vm.getTilePositionIndex = function (tileId) {
			var position = 0;
			var currentTile = vm.getTileById(tileId);
			for (var i = 0; i < vm.tiles.length; i++) {
				var tile = vm.tiles[i];
				if ((tile.y < currentTile.y) || (tile.y == currentTile.y && tile.x < currentTile.x))
					position++;
			}
			return position;
		};

		////////////////////////////////////////////////////////
		// event handlers:
		////////////////////////////////////////////////////////

		/**
		 * Watch tileWidth changes
		 */
		$scope.$watch(angular.bind(vm, function (name) {
			return this.tileWidth;
		}), function (newVal) {
			vm.refreshTileGrid();
		});

		/**
		 * Watch tileHeight changes
		 */
		$scope.$watch(angular.bind(vm, function () {
			return this.tileHeight;
		}), function (newVal) {
			vm.refreshTileGrid();
		});

		////////////////////////////////////////////////////////
		// scope functions:
		////////////////////////////////////////////////////////

		/**
		 * Does dashboard contain non empty tiles?
		 */
		vm.updateGalleryTiles = function (tiles) {
			var tilesCollection = angular.isArray(tiles) ? tiles : vm.tiles;
			// remove empty tiles for gallery view:
			vm.galleryTiles = tilesCollection.filter(function (tile) {
				return !!tile.reportName;
			});
			vm.galleryState.hasTiles = vm.galleryTiles.length > 0;
		}

		/**
		 * Check if one column view required
		 */
		vm.isOneColumnView = function () {
			return $izendaCompatibility.isOneColumnView();
		};

		/**
		 * Check tile is read only
		 */
		vm.isEditAllowed = function () {
			return $izendaCompatibility.isEditAllowed();
		};

		/**
		 * Print whole dashboard as HTML
		 */
		vm.printDashboardAsHtml = function (reportForPrint) {
			return $q(function (resolve) {
				var printUrl = $izendaUrl.settings.urlRsPage;
				printUrl += '?p=htmlreport&print=1';
				// print single tile if parameter is set:
				if (angular.isString(reportForPrint) && reportForPrint !== '')
					printUrl += '&reportPartName=' + encodeURIComponent(reportForPrint);

				// izpid and anpid will be added inside the ExtendReportExport method 
				var newWindow = ExtendReportExport(responseServer.OpenUrl, printUrl, 'aspnetForm', '', '', true);
				vm.exportProgress = 'print';
				$timeout(function () {
					if ('WebkitAppearance' in document.documentElement.style) {
						var intervalId = setInterval(function () {
							if (!newWindow || newWindow.closed) {
								clearInterval(intervalId);
								intervalId = null;
								vm.exportProgress = null;
								resolve();
								$scope.$applyAsync();
							}
						}, 500);
					} else {
						vm.exportProgress = null;
						resolve();
						$scope.$applyAsync();
					}
				}, 500);
			});
		};

		/**
		 * Print whole dashboard as PDF
		 */
		vm.printDashboardAsPDF = function () {
			var addParam = '';
			if (typeof (window.izendaPageId$) !== 'undefined')
				addParam += '&izpid=' + window.izendaPageId$;
			if (typeof (window.angularPageId$) !== 'undefined')
				addParam += '&anpid=' + window.angularPageId$;

			// download the file
			vm.exportProgress = 'print';
			$izendaRsQuery.downloadFileRequest('GET', $izendaUrl.settings.urlRsPage + '?output=PDF' + addParam).then(function () {
				vm.exportProgress = null;
				$scope.$applyAsync();
			});
		};

		/**
		 * Close modal box
		 */
		vm.closeMessageBox = function () {
			vm.isMessageDialogOpened = false;
			$scope.$applyAsync();
		};

		/**
		 * Open modal message
		 */
		vm.openMessageBox = function (text, title) {
			vm.isMessageDialogOpened = true;
			vm.messageDialogText = text;
			vm.messageDialogTitle = angular.isDefined(title) ? title : '';
			$scope.$applyAsync();
		};

		/**
		 * Update tile grid parameters
		 */
		vm.refreshTileGrid = function () {
			vm.gridStyle = {
				'background-size': vm.tileWidth + 'px ' + vm.tileHeight + 'px, ' + vm.tileWidth + 'px ' + vm.tileHeight + 'px'
			};
		};

		/**
		 * Show editor grid
		 */
		vm.showTileGrid = function () {
			vm.isGridVisible = true;
			$scope.$applyAsync();
		};

		/**
		 * Hide editor grid 
		 */
		vm.hideTileGrid = function () {
			vm.isGridVisible = false;
			vm.hideTileGridShadow();
			$scope.$applyAsync();
		};

		/**
		 * Show tile grid shadow
		 */
		vm.showTileGridShadow = function (shadowBbox, showPlusButton) {
			vm.isGridShadowVisible = true;
			vm.isGridShadowPlusButtonVisible = showPlusButton;
			var left = shadowBbox.left,
				top = shadowBbox.top,
				width = shadowBbox.width,
				height = shadowBbox.height;
			if (left < 0) {
				left = 0;
			}
			if (left + width >= vm.tileWidth * 12) {
				left = vm.tileWidth * 12 - width;
			}
			if (top < 0)
				top = 0;
			vm.gridShadowStyle = {
				'left': left + 1,
				'top': top + 1,
				'width': width - 1,
				'height': height - 1
			};
			$scope.$applyAsync();
		};

		/**
		 * Hide tile grid shadow
		 */
		vm.hideTileGridShadow = function () {
			vm.isGridShadowVisible = false;
			$scope.$applyAsync();
		};

		/**
		 * Check bbox for intersects
		 */
		vm.checkTileIntersectsBbox = function (tile) {
			var hitTest = function (a, b) {
				var aLeft = a.x;
				var aRight = a.x + a.width - 1;
				var aTop = a.y;
				var aBottom = a.y + a.height - 1;

				var bLeft = b.x;
				var bRight = b.x + b.width - 1;
				var bTop = b.y;
				var bBottom = b.y + b.height - 1;
				return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
			};
			var otherTiles = vm.getOtherTiles(vm.tiles, tile);
			for (var i = 0; i < otherTiles.length; i++) {
				var oTile = otherTiles[i];
				if (hitTest(tile, oTile)) {
					return true;
				}
			}
			return false;
		};

		/**
		 * Check tile intersects to any other tile
		 */
		vm.checkTileIntersects = function (tile, $helper) {
			var hitTest = function (a, b, accuracy) {
				var aPos = a.offset();
				var bPos = b.offset();

				var aLeft = aPos.left;
				var aRight = aPos.left + a.width();
				var aTop = aPos.top;
				var aBottom = aPos.top + a.height();

				var bLeft = bPos.left + accuracy;
				var bRight = bPos.left + b.width() - accuracy;
				var bTop = bPos.top + accuracy;
				var bBottom = bPos.top + b.height() - accuracy;
				return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
			};
			// check

			var $tile = vm.getTile$ById(tile.id);
			if (!angular.isUndefined($helper)) {
				$tile = $helper;
			}
			var otherTiles = vm.getOtherTiles(vm.tiles, tile);
			for (var i = 0; i < otherTiles.length; i++) {
				var oTile = otherTiles[i];
				var $oTile = vm.getTile$ById(oTile.id);
				if (hitTest($tile, $oTile, 30)) {
					return true;
				}
			}
			return false;
		};

		/**
		 * Check tile is outside the dashboard
		 */
		vm.checkTileMovedToOuterSpace = function ($tile, sensitivity) {
			var precision = sensitivity;
			if (typeof (sensitivity) == 'undefined' || sensitivity == null)
				precision = 0;
			var tp = $tile.position();
			if (tp.left + $tile.width() > vm.tileWidth * 12 + precision || tp.left < -precision || tp.top < -precision)
				return true;
			return false;
		};

		/**
		 * Get tile which lie under testing tile.
		 */
		vm.getUnderlyingTile = function (x, y, testingTile) {
			var $target = null;
			var targetTile;
			var $tiles = vm.getRoot().find('.iz-dash-tile');
			for (var i = 0; i < $tiles.length; i++) {
				var $t = _($tiles[i]);
				if ($t.hasClass('iz-dash-tile-helper'))
					break;
				var tile = vm.getTileByTile$($t);
				if (tile == null || tile.id != testingTile.id) {
					var tilePosition = $t.offset();
					if (tilePosition.left <= x && tilePosition.left + $t.width() >= x && tilePosition.top <= y && tilePosition.top + $t.height() >= y) {
						targetTile = tile;
						$target = $t;
					}
				}
			}
			return $target;
		};

		/**
		 * Swap 2 tiles. Return promise after complete swap.
		 */
		vm.swapTiles = function ($tile1, $tile2) {
			var deferred = $q.defer();
			var t1O = $tile1.position(),
				t2O = $tile2.position(),
				w1 = $tile1.width(),
				h1 = $tile1.height(),
				w2 = $tile2.width(),
				h2 = $tile2.height();

			$tile1.find('.frame').hide();
			$tile2.find('.frame').hide();

			var completeCount = 0;
			$tile1.animate({
				left: t2O.left,
				top: t2O.top,
				width: w2,
				height: h2
			}, 500, function () {
				if (completeCount == 0)
					completeCount++;
				else {
					deferred.resolve([$tile1, $tile2]);
				}
			});
			$tile2.animate({
				left: t1O.left,
				top: t1O.top,
				width: w1,
				height: h1
			}, 500, function () {
				if (completeCount == 0)
					completeCount++;
				else {
					deferred.resolve([$tile1, $tile2]);
				}
			});
			return deferred.promise;
		};

		/**
		 * Select report name handler
		 */
		vm.onSave = function (reportName, categoryName) {
			save(reportName, categoryName);
		};

		/**
		 * Save dialog closed handler.
		 */
		vm.onSaveClosed = function () {
			vm.isSaveReportModalOpened = false;
		};

		/**
		 * Update dashboard size:
		 */
		vm.updateDashboardSize = function (additionalBbox) {
			updateTileContainerSize(additionalBbox);
		};

		/**
		 * Event fires on tile drag start
		 */
		vm.onTileDragStart = function (tile) {
			turnOffAddTileHandler();
			vm.showTileGrid();
			vm.showTileGridShadow({
				left: tile.x * vm.tileWidth,
				top: tile.y * vm.tileHeight,
				width: tile.width * vm.tileWidth,
				height: tile.height * vm.tileHeight
			}, false);
			$scope.$applyAsync();
		};

		/**
		 * Event fires on tile drag change position
		 */
		vm.onTileDrag = function (tile, shadowPosition) {
			vm.showTileGridShadow({
				left: shadowPosition.left,
				top: shadowPosition.top,
				width: shadowPosition.width,
				height: shadowPosition.height
			}, false);
			vm.updateDashboardSize(shadowPosition);
			$scope.$applyAsync();
		};

		/**
		 * Event fires on tile drag end
		 */
		vm.onTileDragEnd = function (eventResult) {
			vm.hideTileGridShadow();
			vm.hideTileGrid();
			$scope.$applyAsync();
			turnOnAddTileHandler();
		};

		/**
		 * Start tile resize event handler
		 */
		vm.onTileResizeStart = function (tile) {
			turnOffAddTileHandler();
			vm.showTileGrid();
			vm.showTileGridShadow({
				left: tile.x * vm.tileWidth,
				top: tile.y * vm.tileHeight,
				width: tile.width * vm.tileWidth,
				height: tile.height * vm.tileHeight
			}, false);
			$scope.$applyAsync();
		};

		/**
		 * Tile resize handler
		 */
		vm.onTileResize = function (tile, shadowPosition) {
			vm.showTileGridShadow({
				left: shadowPosition.left,
				top: shadowPosition.top,
				width: shadowPosition.width,
				height: shadowPosition.height
			}, false);
			vm.updateDashboardSize(shadowPosition);
			$scope.$applyAsync();
		};

		/**
		 * Tile resize completed handler
		 */
		vm.onTileResizeEnd = function (eventResult) {
			vm.hideTileGridShadow();
			vm.hideTileGrid();
			$scope.$applyAsync();
			turnOnAddTileHandler();
		};

		/**
		 * Tile delete handler
		 */
		vm.onTileDelete = function (tile) {
			var tile = vm.getTileById(tile.id);
			if (tile == null)
				throw 'Tile "' + tileid + '" not found';
			vm.tiles.splice(vm.tiles.indexOf(tile), 1);
			updateTileContainerSize();
			sync().then(function () {
				$izendaEvent.queueEvent('refreshFilters', [], true);
			});
		};

		/**
		 * Tile report selected handler
		 */
		vm.onTileReportSelected = function (tile) {
			vm.updateGalleryTiles();
		};

		/**
		 * Turn activate/deactivate dashboard handlers after resize
		 */
		vm.updateDashboardHandlers = function () {
			if (!vm.isEditAllowed()) {
				turnOffAddTileHandler();
			} else {
				turnOnAddTileHandler();
			}
		};

		/**
		 * Fires when tiles added and animation is completed.
		 */
		vm.initializeEventHandlers = function () {

			$izendaEvent.handleQueuedEvent('dashboardSyncEvent', $scope, vm, function (subject) {
				sync().then(function () {
					$izendaEvent.queueEvent('dashboardSyncCompletedEvent', [subject]);
				});
			});

			$izendaEvent.handleQueuedEvent('printWholeDashboardEvent', $scope, vm, function (printType) {
				if (printType === 'html')
					vm.printDashboardAsHtml();
				else if (printType === 'pdf')
					vm.printDashboardAsPDF();
				else
					throw 'Unknown print type "' + printType + '"';
			});

			$izendaEvent.handleQueuedEvent('dashboardRefreshEvent', $scope, vm, function (reloadDashboardLayout, updateFromSource) {
				if (reloadDashboardLayout) {
					var reportInfo = $izendaUrl.getReportInfo();
					vm.initializeDashboard(reportInfo, updateFromSource);
				} else {
					refreshAllTiles(updateFromSource);
				}
			});

			$izendaEvent.handleQueuedEvent('dashboardSaveEvent', $scope, vm, function (showNameDialog) {
				if (showNameDialog) {
					vm.isSaveReportModalOpened = true;
				} else {
					var dashboardName = $izendaUrl.getReportInfo().name;
					var dashboardCategory = $izendaUrl.getReportInfo().category;
					save(dashboardName, dashboardCategory);
				}
			});
		};

		/**
		 * Load and initialize dashboard
		 */
		vm.initializeDashboard = function (reportInfo, updateFromSource) {
			vm.reportInfo = reportInfo;
			_('.report').empty();
			deactivateGallery(false);
			// if we're refreshing dashboard which haven't saved yet:
			if (reportInfo.isNew && vm.tiles.length > 0) {
				sync().then(function () {
					loadDashboardLayout(updateFromSource);
					$scope.$evalAsync();
				});
			} else {
				loadDashboardLayout(updateFromSource);
				$scope.$evalAsync();
			}
		};

		////////////////////////////////////////////////////////
		// dashboard functions:
		////////////////////////////////////////////////////////

		/**
		 * Add tile handler initialize
		 */
		function turnOnAddTileHandler() {
			var addNewPixelTile = function (x, y) {
				var newTile = angular.extend({}, $injector.get('tileDefaults'), {
					id: 'IzendaDashboardTileNew' + (newTileIndex++),
					isNew: true,
					width: 1,
					height: 1,
					x: x,
					y: y
				});
				while (!vm.checkTileIntersectsBbox(newTile) && newTile.width < 6 && newTile.width + newTile.x < 12) {
					newTile.width++;
				}
				if (vm.checkTileIntersectsBbox(newTile)) {
					newTile.width--;
				}
				while (!vm.checkTileIntersectsBbox(newTile) && newTile.height < 3) {
					newTile.height++;
				}
				if (vm.checkTileIntersectsBbox(newTile)) {
					newTile.height--;
				}
				if (newTile.width <= 0 || newTile.height <= 0)
					return;
				vm.tiles.push(newTile);
				vm.updateDashboardSize();
				$scope.$evalAsync();
			};
			var $tileContainer = vm.getTileContainer();

			// on click on free dashboard area: add tile
			$tileContainer.on('mousedown.dashboard', function (event) {
				var $target = angular.element(event.target);
				if (vm.isTile$($target))
					return true;
				if (event.which !== 1)
					return true;
				$tileContainer = vm.getTileContainer();
				// get {x, y} click coordinates
				var x = Math.floor((event.pageX - $tileContainer.offset().left) / vm.tileWidth),
					y = Math.floor((event.pageY - $tileContainer.offset().top) / vm.tileHeight);
				addNewPixelTile(x, y);
				return false;
			});

			// on mouse move: show grid
			$tileContainer.on('mousemove.dashboard', function (e) {
				var $target = angular.element(e.target);
				if (vm.isTile$($target))
					return true;
				$tileContainer = vm.getTileContainer();
				// get {x, y} click coordinates
				var x = Math.floor((e.pageX - $tileContainer.offset().left) / vm.tileWidth),
					y = Math.floor((e.pageY - $tileContainer.offset().top) / vm.tileHeight);
				vm.showTileGrid();
				vm.showTileGridShadow({
					left: x * vm.tileWidth,
					top: y * vm.tileHeight,
					width: vm.tileWidth,
					height: vm.tileHeight
				}, true);
			});

			// on mouse out: hide grid
			$tileContainer.on('mouseout.dashboard', function () {
				vm.hideTileGridShadow();
				vm.hideTileGrid();
			});
		}

		function turnOffAddTileHandler() {
			vm.getTileContainer().off('mousedown.dashboard');
			vm.getTileContainer().off('mousemove.dashboard');
			vm.getTileContainer().off('mouseout.dashboard');
			vm.hideTileGrid();
			$scope.$applyAsync();
		}

		////////////////////////////////////////////////////////
		// tiles functions:
		////////////////////////////////////////////////////////

		function createTileTitle(tile) {
			if (tile.title != null && tile.title != '')
				return tile.title;
			var result = '';
			if (tile.reportCategory != null && tile.reportCategory != '')
				result = tile.reportCategory + ' / ';
			result = result + tile.reportName + ' / ' + tile.reportPartName;
			return result;
		}

		function sortTilesByPosition(tilesArray) {
			return tilesArray.sort(function (a, b) {
				if (a.y != b.y)
					return a.y - b.y;
				return a.x - b.x;
			});
		}

		/**
		 * Prepare tiles for saving: cleaning, validating and so on...
		 */
		function createSaveJson() {
			var tiles = vm.tiles;
			var config = {
				Rows: [{
					Cells: [],
					ColumnsCount: 0
				}],
				RowsCount: 1
			};
			for (var i = 0; i < tiles.length; i++) {
				var tile = tiles[i];
				if (angular.isString(tile.reportFullName) && tile.reportFullName !== '') {
					var saveObject = {
						ReportTitle: angular.isUndefined(tile.title) ? '' : tile.title,
						ReportDescription: angular.isUndefined(tile.description) ? '' : tile.description,
						ReportFullName: tile.reportFullName,
						ReportPartName: tile.reportPartName,
						ReportSetName: tile.reportNameWithCategory,
						RecordsCount: tile.top,
						X: tile.x,
						Y: tile.y,
						Height: tile.height,
						Width: tile.width
					};
					config.Rows[0].Cells.push(saveObject);
					config.Rows[0].ColumnsCount++;
				}
			}
			return config;
		}

		/**
		 * Sync tiles state to server
		 */
		function sync() {
			var deferred = $q.defer();
			var json = createSaveJson();
			$izendaDashboardQuery.syncDashboard(json).then(function (data) {
				if (data.Value !== 'OK') {
					deferred.reject(
						$izendaLocale.localeText('js_SyncDashboardError', 'Can\'t sync dashboard.') + ' ' +
						$izendaLocale.localeText('js_Error', 'Error') + ': ' + data.Value);
					$scope.$applyAsync();
				} else {
					deferred.resolve();
					$scope.$applyAsync();
				}
			});
			return deferred.promise;
		}

		/**
		 * Save dashboard.
		 * @param {string} dashboardName dashboard report name
		 * @param {string} dashboardCategory dashboard report category
		 */
		function save(dashboardName, dashboardCategory) {
			var json = createSaveJson();
			if (json.Rows[0].ColumnsCount === 0) {
				vm.openMessageBox($izendaLocale.localeText('js_CantSaveEmptyDashboard', 'Can\'t save empty dashboard.'));
				return;
			}

			// perform save action
			$izendaDashboardState.saveDashboard(json, dashboardName, dashboardCategory).then(
				function (saveResults) {
					// success
					var name = saveResults[0], category = saveResults[1], isDashboardNameChanged = saveResults[2];
					$izendaUtilUiService.showNotification($izendaLocale.localeText('js_DashboardSaved', 'Dashboard sucessfully saved'));
					if (isDashboardNameChanged) {
						$rootScope.$broadcast('selectedNewReportNameEvent', [name, category]);
					}
				}, function (errorMessage) {
					// handle save error
					var errorText = $izendaLocale.localeText('js_CantSaveDashboard', 'Can\'t save dashboard') +
						' "' + dashboardName + '". ' + $izendaLocale.localeText('js_Error', 'Error') + ': ' + errorMessage;
					$izendaUtilUiService.showErrorDialog(errorText);
				});
		}

		/**
		 * Load dashboard layout
		 */
		function loadDashboardLayout(updateFromSource) {
			// interrupt previous animations
			clearInterval(vm.refreshIntervalId);
			vm.refreshIntervalId = null;
			vm.isLoaded = false;

			// remove tiles
			vm.tiles.length = 0;

			// remove tiles dom elements
			var tiles = _('.iz-dash-tile');
			tiles.remove();

			// start loading dashboard layout
			$izendaDashboardQuery.loadDashboardLayout(updateFromSource).then(function (data) {
				// set dashboard rights:
				$log.debug('Effective rights ', data.EffectiveRights);
				$izendaCompatibility.setRights(data.EffectiveRights);
				$izendaCompatibility.setShowSaveControls(data.ShowSaveControls);
				$izendaCompatibility.setShowSaveAsToolbarButton(data.ShowSaveAsToolbarButton);
				// collect tiles information:
				var tilesToAdd = [];
				var maxHeight = 0;
				if (data.Rows == null || data.Rows.length === 0) {
					tilesToAdd.push(angular.extend({}, $injector.get('tileDefaults'), {
						id: 'IzendaDashboardTile0',
						isNew: true,
						width: 12,
						height: 4
					}));
					maxHeight = 4;
				} else {
					// create tiles
					var cells = data.Rows[0].Cells;
					for (var i = 0; i < cells.length; i++) {
						var cell = cells[i];
						var obj = angular.extend({}, $injector.get('tileDefaults'), $izendaUrl.extractReportPartNames(cell.ReportFullName), {
							id: 'IzendaDashboardTile' + i,
							x: cell.X,
							y: cell.Y,
							width: cell.Width,
							height: cell.Height,
							title: cell.ReportTitle,
							designerType: cell.DesignerType,
							isSourceReportDeleted: cell.IsSourceReportDeleted,
							description: cell.ReportDescription,
							top: cell.RecordsCount,
							topString: '' + cell.RecordsCount,
							endTop: cell.RecordsCount,
							canBeLoaded: cell.CanBeLoaded,
							maxRights: cell.MaxRights,
							applyFilterParams: true
						});
						if (maxHeight < cell.Y + cell.Height)
							maxHeight = cell.Y + cell.Height;
						tilesToAdd.push(obj);
					}
					if (vm.isOneColumnView()) {
						maxHeight = cells.length * 4;
					}
				}

				tilesToAdd = sortTilesByPosition(tilesToAdd);
				for (var i = 0; i < tilesToAdd.length; i++)
					tilesToAdd[i].index = i;

				updateTileSize();

				// start loading tiles:
				updateTileContainerSize({
					top: 0,
					left: 0,
					height: (maxHeight) * vm.tileHeight,
					width: 12 * vm.tileWidth
				});

				vm.updateDashboardHandlers();

				// start loading tile reports
				for (var ii = 0; ii < tilesToAdd.length; ii++) {
					var tileToAdd = tilesToAdd[ii];
					tileToAdd.updateFromSource = updateFromSource;
					vm.tiles.push(tileToAdd);
				}

				if (updateFromSource) {
					$izendaEvent.queueEvent('dashboardUpdateFiltersEvent', [true, true], false);
				}

				vm.isLoaded = true;
			});
		};

		/**
		 * Refresh all tiles
		 */
		function refreshAllTiles(updateFromSource) {
			if (!vm.galleryState.isGalleryEnabled) {
				$rootScope.$broadcast('izendaDashboardTile.update', [null, null, true, updateFromSource]);
			} else {
				// trigger gallery update
				vm.galleryUpdateCounter++;
				$scope.$applyAsync();
			}
		}

		////////////////////////////////////////////////////////
		// tile container functions:
		////////////////////////////////////////////////////////
		vm.initialRootWidth = vm.getRoot().width();
		function updateTileSize() {
			var $tileContainer = vm.getTileContainer();
			var parentWidth = vm.initialRootWidth;
			var width = Math.floor(parentWidth / 12) * 12;
			width -= 24;

			$tileContainer.width(width);
			vm.tileWidth = width / 12;
			vm.tileHeight = vm.tileWidth > 100 ? vm.tileWidth : 100;
		}

		/**
		 * Tile container style
		 */
		function updateTileContainerSize(additionalBox) {
			// update width
			updateTileSize();

			// update height
			var maxHeight = 0;
			if (vm.isOneColumnView()) {
				maxHeight = vm.tiles.length !== 0 ? vm.tiles.length * 4 - 1 : 0;
			} else {
				_.each(vm.tiles, function () {
					if (this.y + this.height > maxHeight) {
						maxHeight = this.y + this.height;
					}
				});
			}

			maxHeight = maxHeight * vm.tileHeight;

			// update height of union of tiles and additional box it is set
			if (angular.isDefined(additionalBox)) {
				if (additionalBox.top + additionalBox.height > maxHeight) {
					maxHeight = additionalBox.top + additionalBox.height;
				}
			}
			// set height:
			vm.tileContainerStyle.height = (maxHeight + vm.tileHeight + 1) + 'px';
		}

		////////////////////////////////////////////////////////
		// gallery
		////////////////////////////////////////////////////////

		/**
		 * Dashboard activities when gallery fullscreen mode changed.
		 */
		function galleryFullScreenChanged() {
			var $galleryContainer = vm.getGalleryContainer();
			// when we're going to fullscreen mode - we need to add background for element, which will be the root in fullscreen view.
			if (vm.galleryState.isGalleryFullScreen) {
				var backgroundImg = $izendaBackground.getBackgroundImgFromStorage();
				if (backgroundImg != null) {
					$galleryContainer.css('background-image', 'url(' + backgroundImg + ')', 'important');
				} else {
					$galleryContainer.css('background-image', '');
				}
				$galleryContainer.css('background-color', $izendaBackground.getBackgroundColor(), 'important');
			} else {
				$galleryContainer.css('background-image', '');
				$galleryContainer.css('background-color', '');
			}
			$scope.$applyAsync();
		}

		/**
		 * Turn on gallery view.
		 */
		function activateGallery() {
			if (vm.tiles.length === 0) {
				return;
			}
			_('.report').empty();
			updateGalleryContainer();
			vm.galleryTileIndex = 0;
			$scope.$applyAsync();
		}

		/**
		 * Turn off gallery view
		 * @param {boolean} need or not refresh tiles in dashboard. 
		 */
		function deactivateGallery(refreshTiles) {
			_('body').css('overflow', 'auto');
			updateTileContainerSize();
			if (refreshTiles)
				refreshAllTiles(false);
			$scope.$applyAsync();
		}

		/**
		 * Dashboard activities when gallery mode changed.
		 */
		function galleryModeChanged() {
			if (vm.galleryState.isGalleryEnabled) {
				activateGallery();
			} else {
				deactivateGallery(vm.isLoaded);
			}
		}

		/**
		 * Update gallery container size
		 */
		function updateGalleryContainer() {
			var tileContainerTop = vm.getRoot().offset().top;
			vm.galleryContainerStyle['height'] = _($window).height() - tileContainerTop - 30;
			$scope.$applyAsync();
		}

		function updateSize() {
			var width = angular.element($window).width();
			vm.updateDashboardSize();
			updateGalleryContainer();
			vm.updateDashboardHandlers();
		}

		vm.dashboardGlobalClickHandler = function ($event) {
			if (angular.element($event.target).closest('.title-button.button2').length === 0)
				vm.tiles.forEach(function (tile) {
					tile.backTilePopupOpened = false;
				});
		};

		/**
		 * Initialize dashboard controller (set event listeners and so on)
		 */
		vm.initialize = function () {
			vm.dashboardsAllowedByLicense = $izendaDashboardSettings.dashboardsAllowed;
			vm.licenseInitialized = true;
			if (!vm.dashboardsAllowedByLicense)
				return;

			// initialize events
			vm.initializeEventHandlers();
			// all tiles added:
			$scope.$watch(angular.bind(vm, function (name) {
				return this.isLoaded;
			}), function (newVal) {
				if (newVal) {
					$izendaEvent.queueEvent('refreshFilters', [], true);
				}
			});

			$scope.$watchCollection(angular.bind(vm, function (name) {
				return this.tiles;
			}), function (newCollection) {
				vm.updateGalleryTiles(newCollection);
			});

			// watch for gallery state change.
			$scope.$watch('$izendaGalleryService.getGalleryState()', function (galleryState, oldState) {
				vm.galleryState = $izendaGalleryService.getGalleryState();

				// gallery was turned on/off
				if (oldState.isGalleryEnabled !== galleryState.isGalleryEnabled) {
					galleryModeChanged();
				}
				// gallery fullscreen changed
				if (oldState.isGalleryFullScreen !== galleryState.isGalleryFullScreen) {
					galleryFullScreenChanged();
				}
			}, true);
			// watch for dashboard resize:
			$scope.$watch('izendaDashboardState.getWindowWidth()', function (newWidth) {
				angular.element('body').css('overflow', 'hidden');
				vm.initialRootWidth = vm.getRoot().width();
				angular.element('body').css('overflow', '');
				updateSize();
				refreshAllTiles(false);
			});

			// watch for location change: we can set dashboard when location is changing
			$scope.$watch('izendaUrl.getReportInfo()', function (reportInfo) {
				var initDone = function () {
					if (reportInfo.fullName === null && !reportInfo.isNew)
						return;
					$log.debug('Initialize dashboard after location change: ', reportInfo);
					vm.initializeDashboard(reportInfo);
					$izendaScheduleService.loadScheduleData();
					$izendaShareService.loadShareData({
						defaultShareConfig: false
					});
				}

				if (!angular.isDefined(reportInfo))
					return;
				if (reportInfo.isNew) {
					// create new dashboard
					$izendaCommonQuery.newDashboard().then(function () {
						initDone();
					});
				} else if (reportInfo.fullName) {
					// set existing dashboard as current
					$izendaCommonQuery.setCrs(reportInfo.fullName).then(function () {
						initDone();
					});
				}
			});

			updateSize();
		};
	}

});