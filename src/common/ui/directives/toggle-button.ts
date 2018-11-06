import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaToggleButtonScope extends ng.IScope {
	trueValue: any;
	falseValue: any;
}

/**
 * Toggle button directive
 */
class IzendaToggleButton implements ng.IDirective {
	restrict = 'EA';
	transclude = true;
	require = ['ngModel'];
	scope = {
		trueValue: '=',
		falseValue: '='
	};

	template =
		`<span type="button" class="btn izenda-toggle-button-btn active" data-toggle="button">
	<ng-transclude></ng-transclude>
</span>`;

	link: ($scope: IIzendaToggleButtonScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes, requiredParams: ng.IController) => void;

	constructor() {
		IzendaToggleButton.prototype.link = ($scope: IIzendaToggleButtonScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes,
			requiredParams: ng.IController) => {
			const ngModel: any = requiredParams[0];
			const btn = $element.children('.btn');

			$scope.$parent.$watch(attrs.ngModel, (newVal, oldVal) => {
				if (newVal === oldVal)
					return;
				if (newVal == $scope.trueValue) {
					if (btn.hasClass('active')) {
						btn.removeClass('active');
						$scope.$parent.$eval(attrs.ngChange);
					}
				} else if (newVal == $scope.falseValue) {
					if (!btn.hasClass('active')) {
						btn.addClass('active');
						$scope.$parent.$eval(attrs.ngChange);
					}
				}
			});
			if (ngModel.$viewValue === $scope.trueValue) {
				if (btn.hasClass('active')) {
					btn.removeClass('active');
				}
			} else if (ngModel.$viewValue === $scope.falseValue) {
				if (!btn.hasClass('active')) {
					btn.addClass('active');
				}
			}

			$element.on('click', () => ngModel.$setViewValue(!ngModel.$viewValue));

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaToggleButton();
	}
}

izendaUiModule.directive('izendaToggleButton', [IzendaToggleButton.factory()]);
