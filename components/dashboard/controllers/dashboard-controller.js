define(['../services/services', '../directives/directives'], function () {

	angular
		.module('izendaDashboard')
		.directive('tileAnimationCompleted', function () {
			function link(scope) {
				scope.$on('fade-down:enter', function () {
					var $parentScope = scope.$parent;
					if (!$parentScope.animationCompleted) {
						$parentScope.$broadcast('tileRefreshEvent', [false]);
						$parentScope.animationCompleted = true;
					}
				});
			}
			return {
				restrict: 'A',
				link: link
			};
		});

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
		var UNCATEGORIZED = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');
		var _ = angular.element;
		$scope.izendaUrl = $izendaUrl;
		$scope.izendaDashboardState = $izendaDashboardState;
		$scope.$izendaGalleryService = $izendaGalleryService;
		vm.reportInfo = null;

		var newTileIndex = 1;

		vm.licenseInitialized = false;
		vm.dashboardsAllowedByLicense = false;

		vm.tilesAnimationCompleted = false;

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
			var searchResult = _.grep(vm.tiles, function (tile) {
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
			return $el.closest('.iz-dash-tile').length > 0;
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
			vm.gridShadowStyle = {
				'left': shadowBbox.left + 1,
				'top': shadowBbox.top + 1,
				'width': shadowBbox.width - 1,
				'height': shadowBbox.height - 1
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
		 * Update dashboard size:
		 */
		vm.updateDashboardSize = function (additionalBbox) {
			updateTileContainerSize(additionalBbox);
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
			$scope.$on('selectedReportNameEvent', function (event, args) {
				var dashboardName = args[0], dashboardCategory = args[1];
				save(dashboardName, dashboardCategory);
			});

			$scope.$on('startEditTileEvent', function (event, args) {
				var options = args.length > 0 ? args[0] : {};
				vm.editTileEvent = vm.editTileEvent || { actionName: null };
				var isMouseMove = options.actionName == 'addtile';
				var isInEdit = vm.editTileEvent.actionName != null && vm.editTileEvent.actionName != 'addtile';
				vm.showTileGrid();
				if (isMouseMove) {
					if (!isInEdit) {
						vm.showTileGridShadow({
							left: options.shadowX,
							top: options.shadowY,
							width: vm.tileWidth,
							height: vm.tileHeight
						}, true);
						vm.editTileEvent.actionName = options.actionName;
					}
				} else {
					vm.editTileEvent.actionName = options.actionName;
				}
				$scope.$applyAsync();
			});

			$scope.$on('stopEditTileEvent', function (event, args) {
				var options = args.length > 0 ? args[0] : {};
				vm.editTileEvent = vm.editTileEvent || { actionName: null };
				var isMouseMove = options.actionName == 'addtile';
				var isInEdit = vm.editTileEvent.actionName != null && vm.editTileEvent.actionName != 'addtile';
				if (isMouseMove) {
					if (!isInEdit) {
						vm.hideTileGrid();
						vm.editTileEvent.actionName = null;
					}
				} else {
					vm.hideTileGrid();
					updateTileContainerSize();
					vm.editTileEvent.actionName = null;
				}
				$scope.$applyAsync();
			});

			$scope.$on('deleteTileEvent', function (event, args) {
				if (angular.isUndefined(args) || angular.isUndefined(args[0]))
					throw 'Should be 1 argument with object: { tileId: <tileid> }';
				var tileid = args[0].tileId;
				var tile = vm.getTileById(tileid);
				if (tile == null)
					throw 'Tile "' + tileid + '" not found';
				var idx = -1;
				for (var i = 0; i < vm.tiles.length; i++)
					if (vm.tiles[i].id == tileid)
						idx = i;
				vm.tiles.splice(idx, 1);
				sync().then(function () {
					$izendaEvent.queueEvent('refreshFilters', [], true);
				});
			});

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
					$rootScope.$broadcast('openSelectReportNameModalEvent', []);
				} else {
					var dashboardName = $izendaUrl.getReportInfo().name,
							dashboardCategory = $izendaUrl.getReportInfo().category;
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
		 * Get addtile context object
		 */
		function ensureAddTile() {
			vm.addtile = vm.addtile || {
				count: 0,
				started: false,
				startedDraw: false,
				tile: null,
				relativeX: 0,
				relativeY: 0,
				x: 0,
				y: 0
			};
		}

		/**
		 * Add tile handler initialize
		 */
		function turnOnAddTileHandler() {
			var addNewPixelTile = function (x, y) {
				vm.addtile.tile = angular.extend({}, $injector.get('tileDefaults'), {
					id: 'IzendaDashboardTileNew' + (newTileIndex++),
					isNew: true,
					width: 1,
					height: 1,
					x: x,
					y: y
				});
				while (!vm.checkTileIntersectsBbox(vm.addtile.tile) && vm.addtile.tile.width < 6
							&& vm.addtile.tile.width + vm.addtile.tile.x < 12) {
					vm.addtile.tile.width++;
				}
				if (vm.checkTileIntersectsBbox(vm.addtile.tile)) {
					vm.addtile.tile.width--;
				}
				while (!vm.checkTileIntersectsBbox(vm.addtile.tile) && vm.addtile.tile.height < 3) {
					vm.addtile.tile.height++;
				}
				if (vm.checkTileIntersectsBbox(vm.addtile.tile)) {
					vm.addtile.tile.height--;
				}

				vm.tiles.push(vm.addtile.tile);
				vm.updateDashboardSize();
				$scope.$evalAsync();
			};

			var $tileContainer = vm.getTileContainer();

			// mouse down
			$tileContainer.on('mousedown.dashboard', function (e) {
				ensureAddTile();
				var $tileContainer = vm.getTileContainer();
				var $target = _(e.target);
				if (vm.isTile$($target) || vm.addtile.started)
					return;
				angular.extend(vm.addtile, {
					count: 0,
					started: true,
					startedDraw: false,
					x: e.pageX,
					y: e.pageY,
					relativeX: e.pageX - $tileContainer.offset().left,
					relativeY: e.pageY - $tileContainer.offset().top,
					tile: null
				});
			});

			// move mouse over the dashboard
			$tileContainer.on('mousemove.dashboard', function (e) {
				ensureAddTile();
				if (!angular.isObject(vm.mouseMoveCache)) {
					var $tContainer = vm.getTileContainer();
					vm.mouseMoveCache = {
						$tileContainer: $tContainer,
						offset: function () { return $tContainer.offset(); }
					}
				}
				if (!vm.addtile.started) {
					var relativeX = e.pageX - vm.mouseMoveCache.offset().left;
					var relativeY = e.pageY - vm.mouseMoveCache.offset().top;
					var x = Math.floor(relativeX / vm.tileWidth);
					var y = Math.floor(relativeY / vm.tileHeight);
					var $target = _(e.target);
					if (e.target != vm.mouseMoveCache.previousElement || e.target === vm.mouseMoveCache.$tileContainer.get(0) || $target.hasClass('dashboard-grid')) {
						var isTile = vm.isTile$($target);
						if (isTile) {
							vm.addtile.count = 0;
							$rootScope.$broadcast('stopEditTileEvent', [{
								tileId: null,
								actionName: 'addtile'
							}]);
						} else {
							vm.addtile.count++;
							if (vm.addtile.count > 5) {
								$rootScope.$broadcast('startEditTileEvent', [{
									tileId: vm.id,
									shadowX: x * vm.tileWidth,
									shadowY: y * vm.tileHeight,
									actionName: 'addtile'
								}]);
							}
						}
					};
					vm.mouseMoveCache.previousElement = e.target;
					return;
				}

				// add new tile if needed
				if (vm.addtile.count > 5) {
					if (vm.addtile.tile == null) {
						var relativeX = e.pageX - vm.mouseMoveCache.offset().left;
						var relativeY = e.pageY - vm.mouseMoveCache.offset().top;
						var x = Math.floor(relativeX / vm.tileWidth);
						var y = Math.floor(relativeY / vm.tileHeight);
						addNewPixelTile(x, y);
					}
				}
				vm.addtile.count++;
			});

			// mouseup
			$tileContainer.on('mouseup.dashboard', function (e) {
				ensureAddTile();
				var $tileContainer = vm.getTileContainer();
				var $target = _(e.target);
				var relativeX = e.pageX - $tileContainer.offset().left;
				var relativeY = e.pageY - $tileContainer.offset().top;
				var x = Math.floor(relativeX / vm.tileWidth);
				var y = Math.floor(relativeY / vm.tileHeight);

				if (!vm.addtile.started) {
					return;
				}
				if (vm.addtile.tile == null) {
					addNewPixelTile(x, y);
				}

				$rootScope.$broadcast('stopEditTileEvent', [{
					tileId: null,
					actionName: 'addtile'
				}]);
			});

			// mouseout
			$tileContainer.on('mouseout.dashboard', function (e) {
				ensureAddTile();
				vm.addtile.started = false;
				vm.addtile.startedDraw = false;
				vm.addtile.tile = null;
				$rootScope.$broadcast('stopEditTileEvent', [{
					tileId: null,
					actionName: 'addtile'
				}]);
			});
		}

		function turnOffAddTileHandler() {
			vm.getTileContainer().off('mousedown.dashboard');
			vm.getTileContainer().off('mousemove.dashboard');
			vm.getTileContainer().off('mouseup.dashboard');
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
						RecordsCount: tile.topPreview,
						X: tile.x,
						Y: tile.y,
						Height: tile.height,
						Width: tile.width
					};
					config.Rows[0].Cells[i] = saveObject;
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
		 * Save 
		 */
		function save(dashboardName, dashboardCategory) {
			var dashboardFullName = dashboardName;
			if (angular.isString(dashboardCategory) && dashboardCategory !== '' && dashboardCategory.toLowerCase() !== UNCATEGORIZED.toLowerCase()) {
				dashboardFullName = dashboardCategory + $izendaSettings.getCategoryCharacter() + dashboardName;
			}
			var json = createSaveJson();
			if (json.Rows[0].ColumnsCount === 0) {
				vm.openMessageBox($izendaLocale.localeText('js_CantSaveEmptyDashboard', 'Can\'t save empty dashboard.'));
				return;
			}
			$izendaDashboardQuery.saveDashboard(dashboardFullName, json).then(function (data) {
				if (data.Value !== 'OK') {
					// handle save error:
					$rootScope.$broadcast('izendaShowNotificationEvent', [$izendaLocale.localeText('js_CantSaveDashboard', 'Can\'t save dashboard') +
						' "' + dashboardName + '". ' + $izendaLocale.localeText('js_Error', 'Error') + ': ' + data.Value]);
				} else {
					var n = $izendaUrl.getReportInfo().name, c = $izendaUrl.getReportInfo().category;
					$rootScope.$broadcast('izendaShowNotificationEvent', [$izendaLocale.localeText('js_DashboardSaved', 'Dashboard sucessfully saved')]);
					if (n !== dashboardName || c !== dashboardCategory) {
						$rootScope.$broadcast('selectedNewReportNameEvent', [dashboardName, dashboardCategory]);
					}
				}
			});
		}

		/**
		 * Load dashboard layout
		 */
		function loadDashboardLayout(updateFromSource) {
			// interrupt previous animations
			clearInterval(vm.refreshIntervalId);
			vm.refreshIntervalId = null;
			vm.tilesAnimationCompleted = false;

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
							topPreview: cell.RecordsCount,
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
				vm.tilesAnimationCompleted = true;
			});
		};

		/**
		 * Refresh all tiles
		 */
		function refreshAllTiles(updateFromSource) {
			if (!vm.galleryState.isGalleryEnabled) {
				$scope.$broadcast('tileRefreshEvent', [updateFromSource]);
			} else {
				// trigger gallery update
				vm.galleryUpdateCounter++;
				$scope.$applyAsync();
			}
		}

		////////////////////////////////////////////////////////
		// tile container functions:
		////////////////////////////////////////////////////////

		function updateTileSize() {
			var $tileContainer = vm.getTileContainer();
			var parentWidth = vm.getRoot().width();
			var width = Math.floor(parentWidth / 12) * 12;
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
				deactivateGallery(vm.tilesAnimationCompleted);
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
				return this.tilesAnimationCompleted;
			}), function (newVal) {
				if (newVal) {
					$izendaEvent.queueEvent('refreshFilters', [], true);
				}
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
				updateSize();
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