import * as angular from 'angular';
import 'izenda-external-libs';
import izendaDashboardModule from 'dashboard/module-definition';

interface IIzendaTileFlipScope extends ng.IScope {
	flipObject: any;
	flipHandler: any;
}

/**
 * Tile flip directive. Flips tile and calls handler.
 */
class IzendaTileFlip implements ng.IDirective {
	restrict = 'A';
	scope = {
		flipObject: '=izendaTileFlipObject',
		flipHandler: '&izendaTileFlipHandler'
	};
	link: ($scope: IIzendaTileFlipScope, $element: ng.IAugmentedJQuery) => void;

	constructor(private readonly $timeout: ng.ITimeoutService) {
		IzendaTileFlip.prototype.link = ($scope: IIzendaTileFlipScope, $element: ng.IAugmentedJQuery) => {

			const getFlippyFront = () => $element.children('.animate-flip').children('.flippy-front');
			const getFlippyBack = () => $element.children('.animate-flip').children('.flippy-back');

			const flipTileFront = (update: boolean, updateFromSourceReport: boolean) => {
				const showClass = 'animated fast flipInY';
				const hideClass = 'animated fast flipOutY';
				const $front = getFlippyFront();
				const $back = getFlippyBack();

				$element.children('.ui-resizable-handle').hide();
				$back.addClass(hideClass);
				$front.removeClass(showClass);
				$front.css('display', 'block').addClass(showClass);
				$back.css('display', 'none').removeClass(hideClass);

				$timeout(() => {
					$front.removeClass('flipInY');
					$back.removeClass('flipInY');
					$element.children('.ui-resizable-handle').fadeIn(200);
				}, 200).then(() => {
					// call handler
					if (angular.isFunction($scope.flipHandler))
						$scope.flipHandler({
							isFront: true,
							update: update,
							updateFromSourceReport: updateFromSourceReport
						});
				});
			}

			const flipTileBack = () => {
				const showClass = 'animated fast flipInY';
				const hideClass = 'animated fast flipOutY';
				const $front = getFlippyFront();
				const $back = getFlippyBack();

				$element.children('.ui-resizable-handle').hide();
				$front.addClass(hideClass);
				$back.removeClass(showClass);
				$back.css('display', 'block').addClass(showClass);
				$front.css('display', 'none').removeClass(hideClass);

				$timeout(() => {
					$front.removeClass('flipInY');
					$back.removeClass('flipInY');
					$element.children('.ui-resizable-handle').fadeIn(200);
				}, 200).then(() => {
					// call handler
					if (angular.isFunction($scope.flipHandler)) {
						$scope.flipHandler({
							isFront: false
						});
					}
				});
			}

			$scope.$watch('flipObject', (newValue: any, oldValue: any) => {
				if (oldValue === newValue)
					return;
				if (newValue.isFront)
					flipTileFront(newValue.update, newValue.updateFromSourceReport);
				else
					flipTileBack();
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: ng.ITimeoutService) => new IzendaTileFlip($timeout);
		directive.$inject = ['$timeout'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaTileFlip', ['$timeout', IzendaTileFlip.factory()]);
