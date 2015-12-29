angular
  .module('izendaDashboard')
  .constant('tileDefaults', {
  	id: null,
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
  	topString: '100'
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
    '$izendaCompatibility',
    '$izendaCommonQuery',
    '$izendaSettings',
    '$izendaDashboardQuery',
    '$izendaEvent',
		'$izendaLocale',
		'$izendaDashboardState',
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
  $izendaCompatibility,
  $izendaCommonQuery,
  $izendaSettings,
  $izendaDashboardQuery,
  $izendaEvent,
	$izendaLocale,
	$izendaDashboardState) {

	'use strict';
	var _ = angular.element;

	$scope.animationCompleted = false;

	var vm = this;
	vm.izendaUrl = $izendaUrl;
	vm.izendaDashboardState = $izendaDashboardState;
	vm.isDesignLinksAllowed = false;

	vm.isIE8 = $izendaCompatibility.checkIsIe8();
	vm.printMode = 'Html2PdfAndHtml';

	vm.state = {
		empty: true,
		resizableHandlerStarted: false
	};

	// delete tile button classes
	vm.deleteClass = 'title-button';
	vm.deleteConfirmClass = 'title-button hidden-confirm-btn';

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
		return vm.reportCategory.split('\\').join('/');
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
	vm.getTopString = function() {
		return angular.isNumber(vm.top) ? vm.top : '';
	};

	/**
   * Return class for '.iz-dash-tile'
   */
	vm.getTileClass = function () {
		var baseClass = 'iz-dash-tile fx-fade-down fx-speed-500 fx-trigger fx-easing-quint';
		return baseClass;
	};

	////////////////////////////////////////////////////////
	// tile events
	////////////////////////////////////////////////////////

	vm.initializeEventHandlers = function () {

		/**
     * Watch top changed
     */
		$scope.$watch(angular.bind(vm, function (endTop) {
			return vm.endTop;
		}), function (newVal, oldVal) {
			if (newVal !== oldVal) {
				vm.top = newVal;
				updateParentTile();
			}
		});

		$scope.$watch(angular.bind(vm, function () {
			return vm.top;
		}), function (newTop) {
			vm.topString = newTop <= 0 ? 'ALL' : newTop;
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

		/**
     * Tile light effect
     */
		$scope.$on('tileLedStartEvent', function (event, args) {
			if (args.length !== 1 || typeof (args[0]) !== 'string')
				return;
			var reportFullName = args[0];
			if (reportFullName !== vm.reportFullName)
				return;
			$element.find('.flippy-front, .flippy-back').css('background-color', 'greenyellow');
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
			$element.find('.flippy-front, .flippy-back').css('background-color', '#fff');
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
			if (rpInfo.Category != null && rpInfo.Category !== '' && rpInfo.Category.toLowerCase() !== 'uncategorized')
				fName = rpInfo.Category + '\\' + fName;

			var nameparts = rpInfo.Name.split('@');
			var name = nameparts[0];
			var part = nameparts[1];

			// check if tile already exist
			var found = false;
			var tiles = $scope.dashboardController.tiles;
			for (var i = 0; i < tiles.length; i++) {
				var tile = tiles[i];
				if (tile.reportCategory === rpInfo.Category && tile.reportPartName === part && tile.reportName === name)
					found = true;
			}

			if (found) {
				$rootScope.$broadcast('showNotificationEvent', [
		      $izendaLocale.localeText('js_CantSelectReportPart', 'Can\'t select report part because dashboard already contains tile with that report.')]);
				return;
			}

			// update report parameters
			vm.previousReportFullName = vm.reportFullName;
			angular.extend(vm, vm.izendaUrl.extractReportPartNames(fName, true));
			vm.title = rpInfo.Title;
			vm.reportNameWithCategory = vm.reportName;
			if (vm.reportCategory != null && vm.reportCategory.toLowerCase() !== 'uncategorized')
				vm.reportNameWithCategory = vm.reportCategory + '\\' + vm.reportNameWithCategory;
			vm.top = 100;
			vm.endTop = 100;
			vm.flipFront(true, true);
			updateParentTile();
			$izendaEvent.queueEvent('refreshFilters', [], true);
		});


		// extend scope with tile parameters and default parameters:
		var tileDefaults = $injector.get('tileDefaults');
		angular.extend(this, tileDefaults, tile);

		// set report name
		vm.reportNameWithCategory = vm.reportName;
		if (vm.reportCategory != null)
			vm.reportNameWithCategory = vm.reportCategory + '\\' + vm.reportNameWithCategory;

		initializeAdHocSettings();

		initializeDraggable();
		initializeResizable();
		updateDashboardHandlers($element);

		vm.initializeEventHandlers();

		// watch for window width chage
		$scope.$watch('izendaDashboardState.getWindowWidth()', function (newWidth) {
			if (angular.isUndefined(newWidth))
				return;
			var $tile = $scope.dashboardController.getTile$ById(vm.id);
			if (vm.isOneColumnView()) {
				$tile.addClass('mobile');
			} else {
				$tile.removeClass('mobile');
			}
			updateDashboardHandlers($tile);
			vm.refreshTile(false);
		});
		refreshTile(false);
	};

	/**
   * Select report part for tile
   */
	vm.selectReportPart = function () {
		$rootScope.$broadcast('openSelectPartModalEvent', [vm.id]);
	};

	/**
   * Get source report name
   */
	vm.getSourceReportName = function () {
		var result = vm.reportName;
		if (vm.reportCategory && vm.reportCategory !== 'Uncategorized') {
			result = vm.reportCategory + '\\' + result;
		}
		return result;
	};

	/**
   * Get report viewer link for tile report
   */
	vm.getReportViewerLink = function () {
		return vm.izendaUrl.settings.urlReportViewer + '?rn=' + vm.getSourceReportName();
	};

	/**
   * Go to report viewer
   */
	vm.fireReportViewerLink = function () {
		if (!vm.isSourceReportDeleted) {
			$window.open(vm.getReportViewerLink(), '_blank');
		} else {
			$rootScope.$broadcast('showNotificationEvent', ['Source report "' + vm.getSourceReportName() + '" doesn\'t exist.']);
		}
	};

	/**
   * Get report editor link for tile report
   */
	vm.getReportEditorLink = function () {
		var designerUrl = vm.designerType === 'InstantReport'
			? vm.izendaUrl.settings.urlInstantReport
  		: vm.izendaUrl.settings.urlReportDesigner;
		return designerUrl + '?rn=' + vm.getSourceReportName();
	};

	/**
   * Go to report editor
   */
	vm.fireReportEditorLink = function () {
		if (!vm.isSourceReportDeleted) {
			$window.location.href = vm.getReportEditorLink();
		} else {
			$rootScope.$broadcast('showNotificationEvent', ['Source report "' + vm.getSourceReportName() + '" doesn\'t exist.']);
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
		$izendaDashboardQuery.setReportPartTop(vm.reportFullName, vm.top).then(function () {
			flipTileFront(true);
		});
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
		$izendaSettings.getPrintMode().then(function (printModeString) {
			vm.printMode = printModeString;
			$scope.$applyAsync();
		});

		$izendaSettings.getCommonSettings().then(function (settings) {
			vm.isDesignLinksAllowed = settings.showDesignLinks;
			$scope.$applyAsync();
		});
	};

	/**
   * Print tile
   */
	vm.printTile = function () {
		$izendaDashboardQuery.loadTileReportForPrint(vm.reportFullName)
      .then(function (htmlData) {
      	$timeout(function () {
      		var windowPrint = $window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
      		windowPrint.document.write(htmlData);
      		windowPrint.document.close();
      		windowPrint.focus();
      		$timeout(function () {
      			windowPrint.print();
      			windowPrint.close();
      		}, 2000);
      	}, 0);
      });
		vm.flipFront(true, false);
	};

	/**
   * Export to excel
   */
	vm.exportToExcel = function () {
		var addParam = '';
		if (typeof (window.izendaPageId$) !== 'undefined')
			addParam = '&izpid=' + window.izendaPageId$;
		var url = vm.izendaUrl.settings.urlRsPage + '?rpn=' + vm.reportFullName + '&output=XLS(MIME)' + addParam;
		$window.open(url, '_self');
		vm.flipFront(true, false);
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
		parentTile.reportName = vm.reportName;
		parentTile.reportPartName = vm.reportPartName;
		parentTile.reportCategory = vm.reportCategory;
		parentTile.reportSetName = vm.reportSetName;
		parentTile.reportFullName = vm.reportFullName;
		parentTile.reportNameWithCategory = vm.reportNameWithCategory;
		parentTile.title = vm.title;
		parentTile.description = vm.description;

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
	};

	/**
   * initialize draggable for tile
   */
	function initializeDraggable() {
		$element.draggable({
			stack: '.iz-dash-tile',
			handle: '.title-container',
			helper: function (event) {
				var $target = _(event.currentTarget);
				var helperStr =
          '<div class="iz-dash-tile iz-dash-tile-helper" style="top: 0px; height: ' + $target.height() + 'px; left: 0px; width: ' + $target.width() + 'px; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0); z-index: 1000;">' +
          '<div class="animate-flip">' +
          '<div class="flippy-front animated fast">' +
          '<div class="title-container" style="height: 35px; overflow: hidden;"><div class="title"><span class="title-text">' +
          '</span></div></div>' +
          '</div></div></div>';
				return _(helperStr);
			},
			distance: 10,
			start: function (event, ui) {
				$rootScope.$broadcast('startEditTileEvent', [{
					tileId: vm.id,
					actionName: 'drag'
				}]);

				var $helper = ui.helper;
				$helper.find('.flippy-front, .flippy-back').removeClass('flipInY');
				$helper.find('.flippy-front, .flippy-back').css('background-color', 'rgba(50,205,50, 0.3)');
				$helper.find('.frame').remove();
				$helper.css('z-index', 1000);
				$helper.css('opacity', 1);
			},
			drag: function (event, ui) {
				var $flippies = $scope.dashboardController.getTileContainer().find('.animate-flip > .flippy-front, .animate-flip > .flippy-back');
				var $helper = ui.helper;
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
				$flippies.css('background-color', '#fff');
				$helper.find('.flippy-front, .flippy-back').css('background-color', 'rgba(50,205,50, 0.3)');
				var $target = $scope.dashboardController.getUnderlyingTile(event.pageX, event.pageY, vm);
				if ($target != null) {
					$scope.dashboardController.hideTileGridShadow();
					$target.find('.flippy-front, .flippy-back').css('background-color', 'rgba(50,205,50, 1)');
				} else {
					if ($scope.dashboardController.checkTileIntersects(vm, $helper) || $scope.dashboardController.checkTileMovedToOuterSpace($helper, 10)) {
						$helper.find('.flippy-front, .flippy-back').css('background-color', 'rgba(220,20,60,0.2)');
					}
				}
			},
			stop: function (event, ui) {
				var $flippies = $scope.dashboardController.getTileContainer().find('.animate-flip > .flippy-front, .animate-flip > .flippy-back');
				var $helper = ui.helper;
				var $source = _(event.target);
				var $target = $scope.dashboardController.getUnderlyingTile(event.pageX, event.pageY, vm);
				$flippies.css('background-color', '#fff');

				// swap tile:
				if ($target != null) {
					$scope.dashboardController.swapTiles($source, $target).then(function (swappedTiles) {
						var $swappedTile1 = swappedTiles[0],
                $swappedTile2 = swappedTiles[1];
						$swappedTile1.find('.frame').show();
						$swappedTile2.find('.frame').show();
						var tileSizeChanged = Math.abs($swappedTile1.width() - $swappedTile2.width()) > 5
                  || Math.abs($swappedTile1.height() - $swappedTile2.height()) > 5;
						if (tileSizeChanged) {
							var id1 = $scope.dashboardController.getTile$Id($swappedTile1),
                  id2 = $scope.dashboardController.getTile$Id($swappedTile2);
							$rootScope.$broadcast('stopEditTileEvent', [{
								tileId: [id1, id2],
								refresh: true,
								actionName: 'drag'
							}]);
						}
					});
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
				$rootScope.$broadcast('startEditTileEvent', [{
					tileId: vm.id,
					actionName: 'resize'
				}]);
				$animates = $scope.dashboardController.getTileContainer().find('.animate-flip');
				var $target = _(event.target);
				$target.find('.flippy-front, .flippy-back').removeClass('flipInY');
				$target.find('.flippy-front, .flippy-back').css('background-color', 'rgba(50,205,50, 0.3)');
				$target.find('.frame').addClass('hidden');
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
				$animates.find('.flippy-front,.flippy-back').css('background-color', '#fff');
				if ($scope.dashboardController.checkTileIntersects(tile) || $scope.dashboardController.checkTileMovedToOuterSpace($t)) {
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
					vm.updateTileParameters();
					$rootScope.$broadcast('stopEditTileEvent', [{
						tileId: vm.id,
						actionName: 'resize',
						refresh: true
					}]);
				}
				$t.find('.flippy-front .report, .flippy-back .report').removeClass('hidden');
				$t.css('opacity', 1);
			}
		});
		vm.state.resizableHandlerStarted = true;
	}

	/**
   * Flip tile to the front side and refresh if needed.
   */
	function flipTileFront(update, updateFromSourceReport) {
		var $tile = _($element);
		var showClass = 'animated fast flipInY';
		var hideClass = 'animated fast flipOutY';
		var $front = $tile.find('.flippy-front');
		var $back = $front.parent().find('.flippy-back');
		$back.addClass(hideClass);
		$front.removeClass(showClass);
		setTimeout(function () {
			$front.css('display', 'block').addClass(showClass);
			$back.css('display', 'none').removeClass(hideClass);
		}, 1);
		setTimeout(function () {
			$front.removeClass('flipInY');
			$back.removeClass('flipInY');
		}, 200);

		if (update) {
			refreshTile(updateFromSourceReport);
		}
	}

	/**
   * Flip tile to back side
   */
	function flipTileBack() {
		var $tile = _($element);
		var showClass = 'animated fast flipInY';
		var hideClass = 'animated fast flipOutY';
		var $front = $tile.find('.flippy-front');
		var $back = $tile.find('.flippy-back');
		$front.addClass(hideClass);
		$back.removeClass(showClass);
		setTimeout(function () {
			$back.css('display', 'block').addClass(showClass);
			$front.css('display', 'none').removeClass(hideClass);
		}, 1);
		setTimeout(function () {
			$front.removeClass('flipInY');
			$back.removeClass('flipInY');
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
		var $body = _($element).find('.report');
		$body.empty();
	}

	/**
	 * Refresh tile content
	 */
	function refreshTile(updateFromSourceReport) {
		var updateFromSource = vm.updateFromSource || updateFromSourceReport;
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
				'<img class="img-responsive" src="' + vm.izendaUrl.settings.urlRsPage + '?image=ModernImages.loading-grid.gif" alt="Loading..." />' +
				'</div>' +
				'</div>';
			var $body = _($element).find('.report');
			$body.html(loadingHtml);
			// load from handler:
			if (vm.preloadDataHandler != null) {
				vm.preloadDataHandler.then(function (htmlData) {
					applyTileHtml(htmlData);
				});
			} else {
				var tileWidth = vm.getWidth() * $scope.dashboardController.tileWidth - 20;
				var tileHeight = vm.getHeight() * $scope.dashboardController.tileHeight - 55;
				if (vm.description !== null && vm.description !== '') {
					tileHeight -= 30;
				}
				$izendaDashboardQuery.loadTileReport({
					updateFromSourceReport: updateFromSource,
					dashboardFullName: vm.izendaUrl.getReportInfo().fullName,
					reportFullName: vm.reportFullName,
					reportPreviousFullName: previousReportName,
					top: vm.top,
					contentWidth: tileWidth,
					contentHeight: tileHeight,
					forPrint: false
				}).then(function (htmlData) {
					applyTileHtml(htmlData);
				});
			}
		}
	}

	/**
	 * Set tile inner html
	 */
	function applyTileHtml(htmlData) {
		vm.preloadDataHandler = null;
		vm.preloadData = null;
		clearTileContent();

		var $tile = _($element);

		var $b = _($element).find('.report');
		var divs$ = $b.find('div.DashPartBody, div.DashPartBodyNoScroll');
		try {
			// prepare
			if (!angular.isUndefined(ReportScripting))
				ReportScripting.loadReportResponse(htmlData, $b);
			$b.find('[id$=_outerSpan]').css("display", "block");
			if (!angular.isUndefined(AdHoc.Utility) && typeof AdHoc.Utility.InitGaugeAnimations == 'function') {
				AdHoc.Utility.InitGaugeAnimations(null, null, false);
			}
			if (divs$.length > 0) {
				divs$.css('height', 'auto');
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
			}

			if (!angular.isUndefined(AdHoc) && !angular.isUndefined(AdHoc.Utility) && typeof (AdHoc.Utility.InitGaugeAnimations) == 'function') {
				AdHoc.Utility.InitGaugeAnimations(null, null, false);
			}
		} catch (e) {
			clearTileContent();
			var $body = _($element).find('.report');
			$body.append('<b>Failed to load report: ' + e + '</b>');
			$log.error($izendaLocale.localeText('js_FailedToLoadReport', 'Failed to load report') + ': ' + e);
		}
		$tile.find('.frame').css('overflow', 'hidden');
		setTimeout(function () {
			$tile.find('.frame').css('overflow', 'auto');
		}, 10);
		vm.state.empty = false;
	}
}

