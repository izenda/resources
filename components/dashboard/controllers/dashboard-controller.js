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
    izendaDashboardController]);

/**
   * Dashboard controller
   */
function izendaDashboardController(
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
	$izendaDashboardState) {

	'use strict';
	var vm = this;

	var _ = angular.element;
	$scope.izendaUrl = $izendaUrl;
	$scope.izendaDashboardState = $izendaDashboardState;
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

	vm.galleryContainerStyle = {
		'height': 0,
		'top': '20px'
	};

	// is dashboard changing now.
	vm.isChangingNow = false;
	vm.isGalleryMode = false;
	vm.isFullscreenMode = false;
	vm.galleryTileIndex = 0;
	vm.galleryTile = null;
	vm.galleryTileTitle = null;

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

	////////////////////////////////////////////////////////
	// scope helper functions:
	////////////////////////////////////////////////////////

	vm.getRoot = function () {
		return _('#dashboardsDiv');
	};
	vm.getTileContainer = function () {
		return _('#dashboardBodyContainer');
	};
	vm.getGalleryContainer = function () {
		return _('#galleryBodyContainer');
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
	vm.printDashboardAsHtml = function () {
		var addParam = '';
		if (typeof (window.izendaPageId$) !== 'undefined')
			addParam = '&izpid=' + window.izendaPageId$;
		ExtendReportExport(responseServer.OpenUrl, 'rs.aspx?p=htmlreport&print=1' + addParam, 'aspnetForm', '');
	};

	/**
	 * Print whole dashboard as PDF
	 */
	vm.printDashboardAsPDF = function () {
		var addParam = '';
		if (typeof (window.izendaPageId$) !== 'undefined')
			addParam = '&izpid=' + window.izendaPageId$;
		$window.open($izendaUrl.settings.urlRsPage + '?output=PDF' + addParam, '_self');
	};

	/**
   * Close modal box
   */
	vm.closeMessageBox = function() {
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
			'left': shadowBbox.left,
			'top': shadowBbox.top,
			'width': shadowBbox.width,
			'height': shadowBbox.height
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
   * Go to selected slide
   */
	vm.goToSlide = function (tileid) {
		var index = vm.getTileIndex(tileid);
		if (vm.galleryTileIndex < index) {
			$scope.$emit('nextSlide');
		} else {
			$scope.$emit('previousSlide');
		}
		$scope.$evalAsync();
	};

	/**
   * Next tile in gallery
   */
	vm.nextGalleryTile = function () {
		clearInterval(vm.galleryIntervalId);
		vm.galleryIntervalId = null;
		vm.galleryTileIndex++;
		if (vm.galleryTileIndex >= vm.tiles.length) {
			vm.galleryTileIndex = 0;
		}
		vm.galleryTile = vm.tiles[vm.galleryTileIndex];
		vm.galleryTileTitle = createTileTitle(vm.galleryTile);
		$scope.$emit('nextSlide');
		$scope.$evalAsync();
	};

	/**
   * Previous tile in gallery
   */
	vm.prevGalleryTile = function () {
		clearInterval(vm.galleryIntervalId);
		vm.galleryIntervalId = null;
		vm.galleryTileIndex--;
		if (vm.galleryTileIndex < 0) {
			vm.galleryTileIndex = vm.tiles.length - 1;
		}
		vm.galleryTile = vm.tiles[vm.galleryTileIndex];
		vm.galleryTileTitle = createTileTitle(vm.galleryTile);
		$scope.$emit('previousSlide');
		$scope.$evalAsync();
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
			$izendaEvent.queueEvent('refreshFilters', [], true);
		});

		$scope.$on('toggleGalleryMode', function (event, args) {
			if (angular.isUndefined(args) || angular.isUndefined(args[0]))
				throw 'Should be 1 argument with boolean parameter';
			var activate = args[0];
			if ((activate && vm.isGalleryMode) || (!activate && !vm.isGalleryMode))
				return;
			if (activate) {
				activateGallery();
			} else {
				deactivateGallery(vm.tilesAnimationCompleted);
			}
		});

		$scope.$on('toggleGalleryModeFullscreen', function (event, args) {
			var requestFullScreen = function (htmlElement) {
				var requestMethod = htmlElement.requestFullScreen || htmlElement.webkitRequestFullScreen || htmlElement.mozRequestFullScreen || htmlElement.msRequestFullscreen;
				if (requestMethod) {
					requestMethod.call(htmlElement);
				} else if (typeof window.ActiveXObject !== "undefined") {
					var wscript = new ActiveXObject("WScript.Shell");
					if (typeof (wscript.SendKeys) === 'function') {
						wscript.SendKeys("{F11}");
					} else {
						alert($izendaLocale.localeText('js_CantFullScreenMode', 'Can\'t run fullscreen mode.'));
					}
				}
			};
			var $galleryRoot = vm.getGalleryContainer();
			if ($galleryRoot.length === 0) {
				throw 'Can\'t find gallery root node!';
			}
			requestFullScreen($galleryRoot.get(0));
		});

		$izendaEvent.handleQueuedEvent('dashboardSyncEvent', $scope, vm, function () {
			sync().then(function () {
				$izendaEvent.queueEvent('dashboardSyncCompletedEvent', []);
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
		loadDashboardLayout(updateFromSource);
		$scope.$evalAsync();
	};

	////////////////////////////////////////////////////////
	// dashboard functions:
	////////////////////////////////////////////////////////

	function fullscreenChangeHandler() {
		if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
			vm.isFullscreenMode = true;
			var backgroundImg = $izendaBackground.getBackgroundImgFromStorage();
			if (backgroundImg != null) {
				vm.getGalleryContainer().get(0).style.setProperty('background-image', 'url(' + backgroundImg + ')', 'important');
			} else {
				vm.getGalleryContainer().get(0).style.setProperty('background-image', '');
			}
			vm.getGalleryContainer().get(0).style.setProperty('background-color', $izendaBackground.getBackgroundColor(), 'important');

			$scope.$evalAsync();
		} else {
			vm.isFullscreenMode = false;
			vm.getGalleryContainer().get(0).style.setProperty('background-image', '');
			vm.getGalleryContainer().get(0).style.setProperty('background-color', '');
			$scope.$evalAsync();
		}
	}

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

		// mouse down
		vm.getTileContainer().on('mousedown.dashboard', function (e) {
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
		vm.getTileContainer().on('mousemove.dashboard', function (e) {
			ensureAddTile();
			if (!angular.isObject(vm.mouseMoveCache)) {
				var $tContainer = vm.getTileContainer();
				vm.mouseMoveCache = {
					$tileContainer: $tContainer,
					offset: $tContainer.offset()
				}
			}
			var relativeX = e.pageX - vm.mouseMoveCache.offset.left;
			var relativeY = e.pageY - vm.mouseMoveCache.offset.top;
			var x = Math.floor(relativeX / vm.tileWidth);
			var y = Math.floor(relativeY / vm.tileHeight);

			if (!vm.addtile.started) {
				var $target = _(e.target);
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
				return;
			}

			// add new tile if needed
			if (vm.addtile.count > 5) {
				if (vm.addtile.tile == null) {
					addNewPixelTile(x, y);
				}
			}
			vm.addtile.count++;
		});

		// mouseup
		vm.getTileContainer().on('mouseup.dashboard', function (e) {
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
		vm.getTileContainer().on('mouseout.dashboard', function (e) {
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
					RecordsCount: tile.top,
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
		if (json.Rows[0].ColumnsCount !== 0) {
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
		} else {
			deferred.reject($izendaLocale.localeText('js_CantPrintEmptyDashboard', 'Can\'t sync empty dashboard.'));
			$scope.$applyAsync();
		}
		return deferred.promise;
	}

	/**
   * Save 
   */
	function save(dashboardName, dashboardCategory) {
		var dashboardFullName = dashboardName;
		if (angular.isString(dashboardCategory) && dashboardCategory != '' && dashboardCategory.toLowerCase() !== 'uncategorized') {
			dashboardFullName = dashboardCategory + '\\' + dashboardName;
		}
		var json = createSaveJson();
		if (json.Rows[0].ColumnsCount === 0) {
			vm.openMessageBox($izendaLocale.localeText('js_CantSaveEmptyDashboard', 'Can\'t save empty dashboard.'));
			return;
		}
		$izendaDashboardQuery.saveDashboard(dashboardFullName, json).then(function (data) {
			if (data.Value !== 'OK') {
				// handle save error:
				$rootScope.$broadcast('showNotificationEvent', [$izendaLocale.localeText('js_CantSaveDashboard', 'Can\'t save dashboard') +
					' "' + dashboardName + '". ' + $izendaLocale.localeText('js_Error', 'Error') + ': ' + data.Value]);
			} else {
				var n = $izendaUrl.getReportInfo().name, c = $izendaUrl.getReportInfo().category;
				$rootScope.$broadcast('showNotificationEvent', [$izendaLocale.localeText('js_DashboardSaved', 'Dashboard sucessfully saved')]);
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
		$izendaDashboardQuery.loadDashboardLayout(vm.reportInfo.fullName).then(function (data) {
			// set dashboard rights:
			$log.debug('Effective rights ', data.EffectiveRights);
			$izendaCompatibility.setRights(data.EffectiveRights);
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
						top: cell.RecordsCount
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
		$scope.$broadcast('tileRefreshEvent', [updateFromSource]);
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

	function activateGallery() {
		if (vm.tiles.length === 0) {
			return;
		}
		vm.isGalleryMode = true;
		updateGalleryContainer();
		setTimeout(function () {
			angular.element(document.getElementById('impresshook')).scope().$emit('initImpress');
			loadTileToGallery();
			$scope.$evalAsync();
		}, 1);
		$scope.$evalAsync();
	}

	function deactivateGallery(refreshTiles) {
		vm.isGalleryMode = false;
		clearInterval(vm.galleryIntervalId);
		vm.galleryIntervalId = null;
		clearGalleryTiles();
		_('body').css('overflow', 'auto');
		updateTileContainerSize();
		if (refreshTiles)
			refreshAllTiles(false);
		$scope.$evalAsync();
	}

	function loadTileToGallery() {
		// load report
		var galleryTiles = _('.slide');
		var firstTile = null;
		galleryTiles.each(function (iTile, tile) {
			var $tile = _(tile);
			var tid = $tile.attr('tileId');
			var tileObj = vm.getTileById(tid);
			if (firstTile === null) {
				firstTile = tileObj;
			}
			$izendaDashboardQuery.loadTileReport({
				updateFromSourceReport: false,
				dashboardFullName: $izendaUrl.getReportInfo().fullName,
				reportFullName: tileObj.reportFullName,
				reportPreviousFullName: null,
				top: tileObj.top,
				contentWidth: $tile.width() - 50,
				contentHeight: $tile.height() - 50,
				forPrint: false
			})
      .then(function (htmlData) {
      	applyGalleryTileHtml($tile, htmlData);
      	$scope.$evalAsync();
      });
		});
		vm.galleryTileIndex = 0;
		vm.galleryTile = firstTile;
		vm.galleryTileTitle = createTileTitle(vm.galleryTile);
	}

	function updateGalleryContainer() {
		var tileContainerTop = vm.getRoot().offset().top;
		for (var i = 0; i < vm.tiles.length; i++) {
			var tile = vm.tiles[i];
			var $slide = _('<div class="step slide" tileid="' + tile.id + '" data-x="' + (i + 1) * 1240 + '" data-y="0" data-z="0" ' +
				'data-rotate-x="0" data-rotate-y="0" data-rotate-z="0"><h1 ng-bind="' + tile.reportFullName + '"></h1></div>');
			vm.getGalleryContainer().find('.impress').append($slide);
		}
		vm.galleryContainerStyle['height'] = _($window.top).height() - tileContainerTop - 30;
		$scope.$evalAsync();
	}

  function clearGalleryTiles() {
    vm.getGalleryContainer().find('.slide').remove();
    vm.getGalleryContainer().find('.impress').empty();
  }

  /**
   * Set tile inner html
   */
  function applyGalleryTileHtml($tile, htmlData) {
    var $reportDiv = _('<div class="report"></div>');
    $tile.append($reportDiv);
    var $b = $reportDiv;

    if (!angular.isUndefined(ReportScripting))
      ReportScripting.loadReportResponse(htmlData, $b);
    if (!angular.isUndefined(AdHoc.Utility) && typeof AdHoc.Utility.InitGaugeAnimations == 'function') {
      AdHoc.Utility.InitGaugeAnimations(null, null, false);
    }
    var divs$ = $b.find('div.DashPartBody, div.DashPartBodyNoScroll');

    divs$.find('span').each(function (iSpan, span) {
      var $span = _(span);
      if ($span.attr('id') && $span.attr('id').indexOf('_outerSpan') >= 0) {
        $span.css('display', 'inline');
      }
    });

    var $zerochartResults = divs$.find('.iz-zero-chart-results');
    if ($zerochartResults.length > 0) {
      $zerochartResults.closest('table').css('height', '100%');
      divs$.css('height', '100%');
    }

    if (!angular.isUndefined(AdHoc) && !angular.isUndefined(AdHoc.Utility) && typeof (AdHoc.Utility.InitGaugeAnimations) == 'function') {
      AdHoc.Utility.InitGaugeAnimations(null, null, false);
    }
  }

	/**
   * Initialize dashboard controller (set event listeners and so on)
   */
  vm.initialize = function () {
		$izendaSettings.getDashboardAllowed().then(function (allowed) {
			vm.dashboardsAllowedByLicense = allowed;
			vm.licenseInitialized = true;
			if (allowed) {
				// remove content from all tiles to speed up "bounce up" animation
				if (!vm.isIE8) {
					document.addEventListener("fullscreenchange", fullscreenChangeHandler);
					document.addEventListener("webkitfullscreenchange", fullscreenChangeHandler);
					document.addEventListener("mozfullscreenchange", fullscreenChangeHandler);
					document.addEventListener("MSFullscreenChange", fullscreenChangeHandler);
				}

				vm.initializeEventHandlers();

				// all tiles added:
				$scope.$watch(angular.bind(vm, function (name) {
					return this.tilesAnimationCompleted;
				}), function (newVal) {
					if (newVal) {
						$izendaEvent.queueEvent('refreshFilters', [], true);
					}
				});

				// watch for dashboard resize:
				$scope.$watch('izendaDashboardState.getWindowWidth()', function (newWidth) {
					if (angular.isUndefined(newWidth))
						return;
					vm.updateDashboardSize();
					updateGalleryContainer();
					vm.updateDashboardHandlers();
				});

				// watch for location change: we can set dashboard when location is changing
				$scope.$watch('izendaUrl.getReportInfo()', function (reportInfo) {
					var initDone = function () {
						if (reportInfo.fullName === null && !reportInfo.isNew)
							return;
						$log.debug('Initialize dashboard after location change: ', reportInfo);
						vm.initializeDashboard(reportInfo);
						$izendaScheduleService.loadScheduleData();
						$izendaShareService.loadShareData();
					}

					if (!angular.isDefined(reportInfo))
						return;
					if (reportInfo.isNew) {
						// create new dashboard
						$izendaCommonQuery.newDashboard().then(function () {
							initDone();
						});
					} else {
						// set existing dashboard as current
						$izendaCommonQuery.setCurrentReportSet(reportInfo.fullName).then(function () {
							initDone();
						});
					}
				});
			}
		});
	};
}
