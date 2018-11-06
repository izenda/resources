import * as angular from 'angular';
import 'izenda-external-libs';
import izendaDashboardModule from 'dashboard/module-definition';

interface IIzendaTileHoverScope extends ng.IScope {
}

/**
 * Tile hover directive. Adds onHover event handler to tile.
 */
class IzendaTileHover implements ng.IDirective {
	restrict = 'A';

	link: ($scope: IIzendaTileHoverScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $window: ng.IWindowService) {
		IzendaTileHover.prototype.link = ($scope: IIzendaTileHoverScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			const uid = Math.floor(Math.random() * 1000000);
			const windowMouseMoveEventName = `mousemove.tilehover${uid}`;
			let isHoveringOverTile = false;
			let isHoverLocked = false;

			// set hover classes func
			const applyTileHover = ($tile: ng.IAugmentedJQuery, isHoveringNow: boolean) => {
				const reportComplexityCoefficent = $scope.$eval(attrs.izendaTileHoverReportComplexity);
				if (isHoverLocked && reportComplexityCoefficent < 0.5)
					return;
				if (isHoveringNow) {
					$tile.addClass('hover');
					$tile.removeClass('no-hover-overflow');
				} else {
					$tile.addClass('no-hover-overflow');
					$tile.removeClass('hover');
				}
			};

			// hover event handlers
			$element.hover(() => {
				applyTileHover($element, true);
			}, () => {
				applyTileHover($element, false);
			});

			// window mouse move event handlers
			angular.element($window).on(windowMouseMoveEventName, (e) => {
				var $tileElement = angular.element(e.target).closest('div.iz-dash-tile');
				var overTile = $tileElement.length > 0 && $tileElement.attr('tileid') == $element.attr('tileid');
				if (overTile !== isHoveringOverTile) {
					applyTileHover($element, overTile);
				}
				isHoveringOverTile = overTile;
			});

			$scope.$watch('$ctrl.tile.backTilePopupOpened', (newVal, oldVal) => {
				if (!newVal && oldVal) {
					// backTilePopupOpened turned off
					isHoverLocked = false;
					applyTileHover($element, isHoveringOverTile);
				} else if (newVal && !oldVal) {
					// backTilePopupOpened turned on
					applyTileHover($element, true);
					isHoverLocked = true;
				}
			});

			// destruction method
			$element.on('$destroy', () => {
				$element.off('hover');
				angular.element($window).off(windowMouseMoveEventName);
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($window: ng.IWindowService) => new IzendaTileHover($window);
		directive.$inject = ['$window'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaTileHover', ['$window', IzendaTileHover.factory()]);
