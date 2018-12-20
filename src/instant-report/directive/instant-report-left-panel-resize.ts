import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';

interface IIzendaInstantReportLeftPanelResizeScope extends ng.IScope {
	leftPanelSelector: any;
	mainPanelSelector: any;
	opened: any;
	$izendaCompatibilityService: any;
}

class IzendaInstantReportLeftPanelResizeDirective implements ng.IDirective {
	restrict = 'A';
	scope = {
		leftPanelSelector: '@',
		mainPanelSelector: '@',
		opened: '='
	};

	link: ($scope: IIzendaInstantReportLeftPanelResizeScope, $element: ng.IAugmentedJQuery) => void;

	constructor(private readonly $window: ng.IWindowService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService) {
		IzendaInstantReportLeftPanelResizeDirective.prototype.link = (
			$scope: IIzendaInstantReportLeftPanelResizeScope, $element: ng.IAugmentedJQuery) => {
			
			const getWidth = ($el: JQuery<HTMLElement>): number => {
				let elWidth = $el.width();
				const styleData = String($el.attr('data-style'));
				const styleString = styleData ? styleData : String($el.attr('style'));
				if (styleString) {
					// find "width: NNNpx" items and parse it.
					styleString.split(';')
						.filter(x => x && x.trim().indexOf('width') === 0)
						.forEach(x => {
							const widthArray = x.split(':');
							const widthString = widthArray[1].trim();
							const initialValue = elWidth;
							elWidth = parseInt(widthString.substring(0, widthString.length - 2));
							if (isNaN(elWidth))
								elWidth = initialValue;
						});
				}
				return elWidth;
			}

			const applyCustomEvent = () => {
				if (!this.$izendaCompatibilityService.isIe()) {
					this.$window.dispatchEvent(new Event('izendaCustomResize'));
				} else {
					const evt = document.createEvent('UIEvents');
					evt.initUIEvent('resize', true, false, window, 0);
					window.dispatchEvent(evt);
				}
			};

			$scope.$izendaCompatibilityService = this.$izendaCompatibilityService;

			const $elem = angular.element($element);
			let $left = angular.element($scope.leftPanelSelector);
			let $main = angular.element($scope.mainPanelSelector);
			let isLeftInitialized = false;
			let isMainInitialized = false;

			// initialize jquery objects
			const initializeElements = () => {
				if (!isLeftInitialized) {
					$left = angular.element($scope.leftPanelSelector);
					isLeftInitialized = $left.length > 0;
				}
				if (!isMainInitialized) {
					$main = angular.element($scope.mainPanelSelector);
					isMainInitialized = $main.length > 0;
				}
			};

			const initStyles = ($el: JQuery<HTMLElement>) => {
				const width = getWidth($el);
				const leftStyle = `width: ${width}px`;
				const mainStyle = `margin-left: ${width + 4}px`;
				$elem.attr('style', `width: ${width}px`);
				$elem.attr('data-style', `left: ${width}px`);
				$left.attr('style', leftStyle);
				$left.attr('data-style', leftStyle);
				$main.attr('style', mainStyle);
				$main.attr('data-style', mainStyle);
			};

			// initialize draggable
			var windowWidth = angular.element(this.$window).width();
			$elem['draggable']({
				axis: 'x',
				zIndex: 2,
				containment: [350, 0, Math.min(1500, windowWidth - 500), 0],
				drag: (event, ui) => {
					initializeElements();
					const currentLeftStyle = `width: ${ui.position.left}px`;
					const currentMainStyle = `margin-left: ${ui.position.left + 4}px`;
					$elem.attr('data-style', `left: ${ui.position.left}px`);
					$left.attr('style', currentLeftStyle);
					$left.attr('data-style', currentLeftStyle);
					$main.attr('style', currentMainStyle);
					$main.attr('data-style', currentMainStyle);
					applyCustomEvent();
				}
			});

			initializeElements();
			initStyles($left);

			// open/close left panel handler
			$scope.$watch('opened', (newOpened: boolean) => {
				initializeElements();
				const isMobileView = this.$izendaCompatibilityService.isSmallResolution();
				const collapsedLeft = isMobileView ? 48 : 128;
				const width = getWidth($left);

				if (newOpened) {
					const dataStyleLeft = String($left.attr('data-style')) || `width: ${isMobileView ? '100%' : width + 'px'}`;
					const dataStyleMain = String($main.attr('data-style')) || `margin-left: ${width + 4}px;`;
					const dataStyleElem = String($elem.attr('data-style')) || `left: ${width}px;`;
					$left.attr('style', dataStyleLeft);
					$main.attr('style', dataStyleMain);
					$element.attr('style', dataStyleElem);
				} else {
					$left.attr('style', `width: ${collapsedLeft}px;`);
					$main.attr('style', `margin-left: ${collapsedLeft}px;`);
					$element.attr('style', 'left: -4px;');
				}
				applyCustomEvent();
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = (
			$window: ng.IWindowService,
			$izendaCompatibilityService: IzendaCompatibilityService) =>
			new IzendaInstantReportLeftPanelResizeDirective($window, $izendaCompatibilityService);
		directive.$inject = ['$window', '$izendaCompatibilityService'];
		return directive;
	}
}

izendaInstantReportModule.directive('izendaInstantReportLeftPanelResize', [
	'$window', '$izendaCompatibilityService', IzendaInstantReportLeftPanelResizeDirective.factory()]);
