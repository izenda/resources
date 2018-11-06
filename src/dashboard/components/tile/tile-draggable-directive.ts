import * as angular from 'angular';
import 'izenda-external-libs';
import izendaDashboardModule from 'dashboard/module-definition';
import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';


interface IIzendaTileDraggableScope extends ng.IScope {
	enabled: boolean;
	gridWidth: number;
	gridHeight: number;
	tile: IzendaDashboardTileModel;
	tiles: IzendaDashboardTileModel[];
	onMove: any;
	onMoveStart: any;
	onMoveEnd: any;
}

/**
 * Directive provides move function for dashboard tile.
 */
class IzendaTileDraggable implements ng.IDirective {
	restrict = 'E';
	scope = {
		enabled: '=',
		gridWidth: '=',
		gridHeight: '=',
		tile: '=',
		tiles: '=',
		onMove: '&',
		onMoveStart: '&',
		onMoveEnd: '&'
	};
	link: ($scope: IIzendaTileDraggableScope, $element: ng.IAugmentedJQuery) => void;

	constructor(
		private readonly $rootScope: ng.IRootScopeService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaDashboardStorage: DashboardStorageService) {
		IzendaTileDraggable.prototype.link = ($scope: IIzendaTileDraggableScope, $element: ng.IAugmentedJQuery) => {

			const getTileByTile$ = ($t: ng.IAugmentedJQuery): IzendaDashboardTileModel => {
				if (!$t || !angular.isArray($scope.tiles)) return null;
				var tileid = Number($t.attr('tileid'));
				return $scope.tiles.find(t => t.id === tileid) || null;
			}

			/**
			 * Find tile which contain point {x,y}
			 */
			const getUnderlyingTile$ = (left: number, top: number, $tiles: ng.IAugmentedJQuery[]): ng.IAugmentedJQuery => {
				if (!angular.isArray($scope.tiles))
					return null;
				const result = $tiles.find(($currentTile, currentTileIndex) => {
					const tileOffset = $currentTile.offset();
					const currentTile = $scope.tiles[currentTileIndex];
					if ($scope.tile.id === currentTile.id)
						return false;
					return tileOffset.left <= left
						&& left <= tileOffset.left + $currentTile.width()
						&& tileOffset.top <= top
						&& top <= tileOffset.top + $currentTile.height();
				});
				return result || null;
			}

			/**
			 * Check tile intersects to any other tile
			 */
			const checkTileIntersects = ($helper: ng.IAugmentedJQuery) => {
				const hitTest = (
					a: ng.IAugmentedJQuery,
					otherTile: IzendaDashboardTileModel,
					accuracyX: number,
					accuracyY: number) => {
					const aPos = a.position();
					const aTop = aPos.top > 0 ? aPos.top : 0;
					const aBottom = aTop + a.height();
					let aLeft = aPos.left > 0 ? aPos.left : 0;
					let aRight = aLeft + a.width();
					if (aRight / $scope.gridWidth > 12) {
						const delta = aRight - $scope.gridWidth * 12;
						aLeft -= delta;
						aRight = $scope.gridWidth * 12;
					}
					const bLeft = otherTile.x * $scope.gridWidth + accuracyX;
					const bTop = otherTile.y * $scope.gridHeight + accuracyY;
					const bRight = (otherTile.x + otherTile.width) * $scope.gridWidth - accuracyX;
					const bBottom = (otherTile.y + otherTile.height) * $scope.gridHeight - accuracyY;
					return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
				};

				let result = false;
				$scope.tiles.forEach(oTile => {
					if (oTile.id === $scope.tile.id)
						return;
					if (hitTest($helper, oTile, $scope.gridWidth / 2, $scope.gridHeight / 2))
						result = true;
				});
				return result;
			}

			/**
			 * Get snapped to grid bbox.
			 */
			const getTargetBbox = (helperLeft: number, helperTop: number, helperWidth: number, helperHeight: number) => {
				// calculate tile shadow position
				const x = Math.round(helperLeft / $scope.gridWidth) * $scope.gridWidth;
				const y = Math.round(helperTop / $scope.gridHeight) * $scope.gridHeight;
				const helperBbox = {
					left: x,
					top: y,
					width: helperWidth,
					height: helperHeight
				};
				return helperBbox;
			}

			let $tile = $element.closest('.iz-dash-tile');
			let previousHelperBbox = { left: 0, top: 0, width: 0, height: 0 };
			let helperWidth = 0;
			let helperHeight = 0;
			let $tileFlippies: JQuery<HTMLElement>;
			let $tilesArray: JQuery<HTMLElement>[] = [];

			// init draggable
			$tile['draggable']({
				stack: '.iz-dash-tile',
				handle: '.title-container, .iz-dash-select-report-front-container',
				distance: 10,

				helper: () => {
					const width = $scope.tile.width * $scope.gridWidth;
					const height = $scope.tile.height * $scope.gridHeight;
					const helperStr =
						`<div class="iz-dash-tile iz-dash-tile-helper" style="z-index:1000;top:0;left:0;height:${height}px;width:${width}px;opacity:1;transform:matrix(1,0,0,1,0,0);">
	<div class="animate-flip">
		<div class="flippy flippy-front animated fast">
			<div class="title-container" style="height: 35px; overflow: hidden;"><div class="title"><span class="title-text"></span></div></div>
		</div>
	</div>
</div>`;
					return angular.element(helperStr);
				},
				start: (event, ui) => {
					$tileFlippies = $tile.children('.animate-flip').children('.flippy');

					$scope.tiles.forEach(tile => {
						tile.backTilePopupOpened = false;
					});

					// turn off window resize handler
					$izendaDashboardStorage.turnOffWindowResizeHandler();

					// update tiles array;
					$tilesArray = $scope.tiles.map(currentTile => angular.element(`.iz-dash-tile[tileid=${currentTile.id}]`));

					$tile = $element.closest('.iz-dash-tile');

					// fire onMoveStart handler:
					if (angular.isFunction($scope.onMoveStart))
						$scope.onMoveStart({ tile: $scope.tile });

					// prepare helper:
					const $helper = ui.helper;
					helperWidth = $helper.width();
					helperHeight = $helper.height();
					const $helperFlipFront = $helper.find('.flippy-front');
					$helperFlipFront.removeClass('flipInY');
					$helperFlipFront.removeClass('animated');
					$helperFlipFront.removeClass('fast');
					$helperFlipFront.css('background-color', 'rgba(50,205,50, 0.3)');
					$helperFlipFront.find('.frame').remove();
					$helper.css('z-index', 1000);
					$helper.css('opacity', 1);
				},
				drag: (event, ui) => {
					const $helper = ui.helper;
					const $helperFlipFront = $helper.find('.flippy-front');

					// calculate tile shadow position
					var helperPos = $helper.position();
					var helperBbox = getTargetBbox(helperPos.left, helperPos.top, helperWidth, helperHeight);
					$helperFlipFront.css('background-color', 'rgba(50,205,50, 0.3)'); // semi-transparent green

					// check underlying tile
					if (angular.isArray($scope.tiles)) {
						$scope.tiles.forEach(currentTile => {
							currentTile.backgroundColor = '#fff';
						});
						var targetTile = getTileByTile$(getUnderlyingTile$(event.pageX, event.pageY, $tilesArray));
						if (targetTile)
							// highlight tile for swap
							targetTile.backgroundColor = 'rgba(50,205,50, 1)';
						else if (checkTileIntersects($helper))
							$helperFlipFront.css('background-color', 'rgba(220,20,60,0.2)');
					}

					// prevent duplicate calls
					if (previousHelperBbox.left === helperBbox.left &&
						previousHelperBbox.top === helperBbox.top &&
						previousHelperBbox.width === helperBbox.width &&
						previousHelperBbox.height === helperBbox.height) {
						$scope.$applyAsync();
						return;
					}
					previousHelperBbox = helperBbox;

					// fire onMove handler:
					if (angular.isFunction($scope.onMove)) {
						$scope.onMove({
							tile: $scope.tile,
							shadowPosition: helperBbox
						});
					}
					$scope.$applyAsync();
				},
				stop: (event, ui) => {
					const $helper = ui.helper;

					// return default tile color
					if (angular.isArray($scope.tiles)) {
						$scope.tiles.forEach(currentTile => {
							currentTile.backgroundColor = '';
						});
					}
					$scope.tile.backgroundColor = '';
					const $animatedTiles: JQuery<HTMLElement>[] = [];

					const eventResult = {
						type: 'none',
						isTileSizeChanged: false,
						tile: $scope.tile,
						targetTile: getTileByTile$(getUnderlyingTile$(event.pageX, event.pageY, $tilesArray))
					};
					if (eventResult.targetTile) {
						// swap tiles
						eventResult.type = 'swap';
						eventResult.isTileSizeChanged = $scope.tile.width !== eventResult.targetTile.width ||
							$scope.tile.height !== eventResult.targetTile.height;

						// exchange sizes
						var tileChangeObject = {
							x: $scope.tile.x,
							y: $scope.tile.y,
							width: $scope.tile.width,
							height: $scope.tile.height
						};
						// set new size for current tile:
						$scope.tile.x = eventResult.targetTile.x;
						$scope.tile.y = eventResult.targetTile.y;
						$scope.tile.width = eventResult.targetTile.width;
						$scope.tile.height = eventResult.targetTile.height;
						// set new size for target tile
						eventResult.targetTile.x = tileChangeObject.x;
						eventResult.targetTile.y = tileChangeObject.y;
						eventResult.targetTile.width = tileChangeObject.width;
						eventResult.targetTile.height = tileChangeObject.height;

						// run animation:
						// clear tile content for smooth animation
						[$scope.tile, eventResult.targetTile].forEach(affectedTile => {
							const $affectedTile = angular.element('.iz-dash-tile[tileid=' + affectedTile.id + ']');
							$affectedTile.addClass('transition');
							$animatedTiles.push($affectedTile);
						});
					} else if (!checkTileIntersects($helper)) {
						eventResult.type = 'move';
						const helperPos = $helper.position();
						const helperBbox = getTargetBbox(helperPos.left, helperPos.top, helperWidth, helperHeight);
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
							eventResult.isTileSizeChanged = true;
						}

						// run animation for current tile:
						const $t = angular.element('.iz-dash-tile[tileid=' + $scope.tile.id + ']');
						$t.addClass('transition');
						$animatedTiles.push($t);
					}
					$animatedTiles.forEach($t => {
						$t.find('.report').hide();
					});
					$scope.$applyAsync();

					setTimeout(() => {
						$animatedTiles.forEach($t => {
							$t.removeClass('transition');
						});
						$tile.css('z-index', '1');
						$tile.find('.frame').removeClass('hidden');
						$tileFlippies.removeClass('flipInY');
						$tileFlippies.removeClass('animated');
						$tileFlippies.removeClass('fast');
						setTimeout(() => {
							$animatedTiles.forEach($t => {
								$t.find('.report').show();
							});
							// turn on window resize handler
							$izendaDashboardStorage.turnOnWindowResizeHandler();
							// fire onMoveEnd handler:
							if (angular.isFunction($scope.onMoveEnd)) {
								$scope.onMoveEnd({ eventResult: eventResult });
							}
							$scope.$applyAsync();
						}, 100);
					}, 300);
				}
			});

			// handlers
			$scope.$watch('enabled', (enabled, prevEnabled) => {
				if (enabled === prevEnabled)
					return;
				$tile['draggable'](enabled ? 'enable' : 'disable');
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = (
			$rootScope: ng.IRootScopeService,
			$timeout: ng.ITimeoutService,
			$izendaDashboardStorage: DashboardStorageService) =>
			new IzendaTileDraggable($rootScope, $timeout, $izendaDashboardStorage);
		directive.$inject = ['$rootScope', '$timeout', '$izendaDashboardStorage'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaTileDraggable',
	['$rootScope', '$timeout', '$izendaDashboardStorage', IzendaTileDraggable.factory()]);
