import * as angular from 'angular';
import 'izenda-external-libs';
import izendaCoreModule from 'common/core/module-definition';

/**
 * Angular filter which replaces string.
 * Usage:
 * {{ 'some string' | izendaReplaceString: [{ from: 's', to: '$' }, { from: 'o', to: '0' } ] }}
 * this sample will produce string '$0me $tring'
 */
izendaCoreModule.filter('izendaReplaceString', () =>
	(text: string, rules: Array<{ from: string, to: string }>) => {
		if (!angular.isArray(rules))
			return text;
		var resultText = text;
		if (!resultText)
			return resultText;

		rules.forEach(rule => resultText = resultText.replaceAll(rule.from, rule.to));
		return resultText;
	});


/**
 * Attribute directive "izenda-scroll-bottom-action=""" which fires handler on container scroll end (-100px).
 * Event: scroll-bottom-action
 */
export class IzendaScrollBottomAction implements ng.IDirective {
	restrict = 'A';
	link: ($scope: ng.IScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor() {
		IzendaScrollBottomAction.prototype.link =
			($scope: ng.IScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

				const $parent = $element.parent();
				$parent.on('scroll', () => {
					const height = $element.height();
					if (height === 0)
						return;
					if (height - $parent.height() - 100 < $parent.scrollTop()) {
						$scope.$eval(attrs.izendaScrollBottomAction);
					}
				});
			};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaScrollBottomAction();
	}
}
izendaCoreModule.directive('izendaScrollBottomAction', [IzendaScrollBottomAction.factory()]);

/**
 * Set focus on element directive.
 * Usage: 
 * <some-tag izenda-focus="{{expression_which_returns_bool}}" ...>
 *   ...
 * </some-tag>
 */
class IzendaFocus implements ng.IDirective {
	scope = {
		trigger: '@izendaFocus'
	};
	link: ($scope: IIzendaFocusScope, $element: ng.IAugmentedJQuery) => void;

	constructor(private readonly $timeout: ng.ITimeoutService) {
		IzendaFocus.prototype.link = ($scope: IIzendaFocusScope, $element: ng.IAugmentedJQuery) => {
			$scope.$watch('trigger', value => {
				if (value)
					this.$timeout(() => $element[0].focus());
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: any) => new IzendaFocus($timeout);
		directive.$inject = ['$timeout'];
		return directive;
	}
}
interface IIzendaFocusScope extends ng.IScope {
	trigger: any;
}
izendaCoreModule.directive('izendaFocus', ['$timeout', IzendaFocus.factory()]);

/**
 * izenda-fit-absolute-element directive.
 */
class IzendaFitAbsoluteElement implements ng.IDirective {
	restrict = 'A';
	link: ($scope: ng.IScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(
		private readonly $window: ng.IWindowService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $interval: ng.IIntervalService) {

		IzendaFitAbsoluteElement.prototype.link = ($scope: ng.IScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
			const windowResizeEventName = `resize.izendaFitAbsoluteElement.${Math.random()}`;
			const deltaTopString = String(attrs['deltaTop']);
			const deltaTop = parseInt(deltaTopString) || 0;
			const $parent = angular.element($element.parent());
			let topCache = -1;

			const setTop = (): boolean => {
				const $childs = $parent.children('[data-izenda-fit-absolute-element-relative=top]');
				if ($childs.length === 0)
					return false;

				let topHeight = 0;
				let isSuccess = true;
				for (let i = 0; i < $childs.length; i++) {
					const $child = angular.element($childs[i]);
					const topValue = String($child.attr('data-izenda-fit-absolute-element-relative'));
					if (topValue === 'top') {
						const childHeight = $child.height();
						if (childHeight <= 0)
							isSuccess = false;
						topHeight += childHeight;
					}
				}
				if (topHeight > 0 && topCache < 0 || topHeight + deltaTop !== topCache) {
					topCache = topHeight + deltaTop;
					$element.css('top', topHeight + deltaTop + 'px');
				}
				return isSuccess;
			};

			const setTopUntilSuccess = () => {
				let attemptCount = 0;
				if (setTop())
					return;
				let toolbarIntervalPromise = this.$interval(() => {
					if (setTop() || attemptCount > 50) {
						this.$interval.cancel(toolbarIntervalPromise);
						toolbarIntervalPromise = null;
						attemptCount = 0;
					}
					attemptCount++;
				}, 100);
			};

			setTopUntilSuccess();

			angular.element(this.$window).on(windowResizeEventName, () => {
				setTopUntilSuccess();
			});

			angular.element(this.$window).on('izendaCustomResize', () => {
				setTopUntilSuccess();
			});

			// destruction method
			$element.on('$destroy', () => {
				angular.element(this.$window).off(windowResizeEventName);
				angular.element(this.$window).off('izendaCustomResize');
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive =
			($window: ng.IWindowService, $timeout: ng.ITimeoutService, $interval: ng.IIntervalService) => new IzendaFitAbsoluteElement($window, $timeout, $interval);
		directive.$inject = ['$window', '$timeout', '$interval'];
		return directive;
	}
}
izendaCoreModule.directive('izendaFitAbsoluteElement', IzendaFitAbsoluteElement.factory());


/**
 * Directive for input element which allows to input only positive integer values.
 */
class IzendaIntegerInput implements ng.IDirective {
	restrict = 'A';
	link: ($scope: ng.IScope, $element: ng.IAugmentedJQuery) => void;

	constructor() {
		IzendaFitAbsoluteElement.prototype.link =
			($scope: ng.IScope, $element: ng.IAugmentedJQuery) => {
				$element.on('keydown', evt => {
					const ctrlOrMeta = evt.ctrlKey || evt.metaKey;
					if ([46, 8, 9, 27, 13].indexOf(evt.keyCode) >= 0 /*Allow: backspace, delete, tab, escape, enter*/
						|| (evt.keyCode === 65 && ctrlOrMeta) /*Allow: Ctrl/cmd+A*/
						|| (evt.keyCode === 67 && ctrlOrMeta) /*Allow: Ctrl/cmd+C*/
						|| (evt.keyCode === 88 && ctrlOrMeta) /*Allow: Ctrl/cmd+X*/
						|| (evt.keyCode >= 35 && evt.keyCode <= 40)) { /*Allow: home, end, left, right*/
						// let it happen, don't do anything
						return;
					}
					// Ensure that it is a number and stop the keypress
					if ((evt.shiftKey || (evt.keyCode < 48 || evt.keyCode > 57)) && (evt.keyCode < 96 || evt.keyCode > 105)) {
						evt.preventDefault();
					}
				});
			};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = () => new IzendaIntegerInput();
		return directive;
	}
}
izendaCoreModule.directive('izendaIntegerInput', IzendaIntegerInput.factory());