import * as angular from 'angular';
import 'izenda-external-libs';
import izendaDashboardModule from 'dashboard/module-definition';
import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';

interface IIzendaTileResizableScope extends ng.IScope {
	gridWidth: any;
	gridHeight: any;
	tile: any;
	tiles: any;
	onResize: any;
	onResizeStart: any;
	onResizeEnd: any;
}

/**
 * Directive provides resize function for dashboard tile.
 */
class IzendaTileResizable implements ng.IDirective {
	restrict = 'E';
	scope = {
		gridWidth: '=',
		gridHeight: '=',
		tile: '=',
		tiles: '=',
		onResize: '&',
		onResizeStart: '&',
		onResizeEnd: '&'
	};
	link: ($scope: IIzendaTileResizableScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $izendaDashboardStorageService: any) {
		IzendaTileResizable.prototype.link = ($scope: IIzendaTileResizableScope, $element: ng.IAugmentedJQuery) => {

			// initialize resizable
			let $tile = $element.closest('.iz-dash-tile');
			let $tileFlippies: ng.IAugmentedJQuery;
			let previousHelperBbox = { left: 0, top: 0, width: 0, height: 0 };

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
			 * Update resizable according to current gridWidth and gridHeight
			 */
			const updateContraints = () => {
				$tile['resizable']('option', 'grid', [$scope.gridWidth, $scope.gridHeight]);
				$tile['resizable']('option', 'minHeight', $scope.gridWidth);
				$tile['resizable']('option', 'minWidth', $scope.gridHeight);
			}

			/**
			 * Update tile x,y,width,height according to the new dom element size
			 */
			const updateTileSize = (tile: IzendaDashboardTileModel, $t: ng.IAugmentedJQuery) => {
				const tilePosition = $t.position();
				const x = Math.round(tilePosition.left / $scope.gridWidth);
				const y = Math.round(tilePosition.top / $scope.gridHeight);
				let width = Math.round($t.width() / $scope.gridWidth);
				let height = Math.round($t.height() / $scope.gridHeight);
				const isTileSizeNeedToCorrect = x < 0 || y < 0 || x + width > 12;
				if (x < 0) {
					width = width + x;
					tile.x = 0;
				} else
					tile.x = x;
				if (y < 0) {
					height = height + y;
					tile.y = 0;
				} else
					tile.y = y;
				tile.width = width;
				tile.height = height;
				if (tile.x + tile.width > 12) {
					tile.width = 12 - tile.x;
				}
				if (isTileSizeNeedToCorrect) {
					const l = tile.x * $scope.gridWidth;
					const t = tile.y * $scope.gridHeight;
					$t.css('transform', `translate3d(${l}px,${t}px,0)`);
					$t.width(tile.width * $scope.gridWidth);
					$t.height(tile.height * $scope.gridHeight);
				}
			}

			// initialize resizable for tile
			$tile['resizable']({
				minWidth: $scope.gridWidth,
				minHeight: $scope.gridHeight,
				grid: [$scope.gridWidth, $scope.gridHeight],
				handles: 'n, e, s, w, se',
				// start resize handler
				start: event => {
					$scope.tiles.forEach(t => {
						t.backTilePopupOpened = false;
					});
					// turn off window resize handler
					this.$izendaDashboardStorageService.turnOffWindowResizeHandler();

					// context variables
					$tile = (angular.element(event.target) as angular.IAugmentedJQuery);
					$tileFlippies = $tile.children('.animate-flip').children('.flippy');

					$tileFlippies.children('.frame').addClass('hidden');
					$tileFlippies.removeClass('flipInY');
					$tileFlippies.css('background-color', 'rgba(50,205,50, 0.3)');
					$tile.css('z-index', 1000);
					$tile.css('opacity', 1);

					// fire onResizeStart handler:
					if (angular.isFunction($scope.onResizeStart)) {
						const eventResult = {
							tile: $scope.tile
						};
						$scope.onResizeStart({ eventResult: eventResult });
					}
				},
				// resize handler
				resize: () => {
					const helperPosition = $tile.position();
					const x = Math.round(helperPosition.left / $scope.gridWidth) * $scope.gridWidth;
					const y = Math.round(helperPosition.top / $scope.gridHeight) * $scope.gridHeight;
					const helperBbox = {
						left: x,
						top: y,
						width: Math.round($tile.width() / $scope.gridWidth) * $scope.gridWidth,
						height: Math.round($tile.height() / $scope.gridHeight) * $scope.gridWidth
					};
					// prevent duplicate calls
					if (previousHelperBbox.left === helperBbox.left &&
						previousHelperBbox.top === helperBbox.top &&
						previousHelperBbox.width === helperBbox.width &&
						previousHelperBbox.height === helperBbox.height)
						return;
					previousHelperBbox = helperBbox;

					// fire onMove handler:
					if (angular.isFunction($scope.onResize)) {
						const eventResult = {
							tile: $scope.tile,
							shadowPosition: helperBbox
						};
						$scope.onResize({ eventResult: eventResult });
					}
					$tileFlippies.css('background-color', 'rgba(50,205,50, 0.5)');
					if (checkTileIntersects($tile)) {
						$tileFlippies.css('background-color', 'rgba(220,20,60,0.5)');
					}
				},
				// end resize handler
				stop: (event, ui) => {
					$tile.css('z-index', '1');
					$tile.find('.frame').removeClass('hidden');
					$tileFlippies.removeClass('flipInY');
					$tileFlippies.removeClass('animated');
					$tileFlippies.removeClass('fast');

					$tileFlippies.css('background-color', '');
					let eventResult: any;
					if (checkTileIntersects($tile)) {
						$tile.animate({
							left: ui.originalPosition.left,
							top: ui.originalPosition.top,
							width: ui.originalSize.width,
							height: ui.originalSize.height
						}, 200);
						eventResult = {
							action: 'resize cancel',
							isTileSizeChanged: false
						};
					} else {
						const isTileSizeChanged = $tile.width() !== ui.originalSize.width || $tile.height() !== ui.originalSize.height;
						if (isTileSizeChanged)
							updateTileSize($scope.tile, $tile);
						eventResult = {
							action: 'resize end',
							isTileSizeChanged: isTileSizeChanged
						};
					}
					$tileFlippies.children('.frame').removeClass('hidden');
					$tile.css('opacity', 1);

					// turn on window resize handler
					this.$izendaDashboardStorageService.turnOnWindowResizeHandler();

					// fire onResizeEnd handler:
					if (angular.isFunction($scope.onResizeEnd)) {
						$scope.onResizeEnd({
							eventResult: eventResult
						});
					}
				}
			});

			// handlers
			$scope.$watch('enabled', (enabled, prevEnabled) => {
				if (enabled === prevEnabled)
					return;
				$tile['resizable'](enabled ? 'enable' : 'disable');
			});

			$scope.$watch('gridWidth', (newVal, oldVal) => {
				if (newVal === oldVal)
					return;
				updateContraints();
			});

			$scope.$watch('gridHeight', (newVal, oldVal) => {
				if (newVal === oldVal)
					return;
				updateContraints();
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($izendaDashboardStorageService: DashboardStorageService) => new IzendaTileResizable($izendaDashboardStorageService);
		directive.$inject = ['$izendaDashboardStorageService'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaTileResizable', ['$izendaDashboardStorageService', IzendaTileResizable.factory()]);
