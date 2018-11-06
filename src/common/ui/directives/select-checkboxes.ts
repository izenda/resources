import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaSelectCheckboxesScope extends ng.IScope {
	existentValues: any;
	ngModel: any;
	isChecked: any;
	clickCheckbox: any;
}

/**
 * Select checkboxes directive. 
 */
class IzendaSelectCheckboxes implements ng.IDirective {
	restrict = 'AE';

	scope = {
		existentValues: '=',
		ngModel: '='
	};

	template =
		`<div ng-repeat="existentValue in existentValues">
	<label class="izenda-common-select-checkboxes-label">
		<input type="checkbox" ng-click="clickCheckbox(existentValue)" ng-checked="isChecked(existentValue)"/>
		<span ng-bind="existentValue.text"></span>
	</label>
</div>`;

	link: ($scope: IIzendaSelectCheckboxesScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor() {
		IzendaSelectCheckboxes.prototype.link = ($scope: IIzendaSelectCheckboxesScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			$element.addClass('izenda-common-select-checkboxes');

			$scope.$watch('existentValues', () => $scope.$parent.$eval(attrs.ngChange), true);
			$scope.$watchCollection('ngModel', () => $scope.$parent.$eval(attrs.ngChange));

			$scope.isChecked = existentValue => {
				const viewValue = $scope.ngModel;
				return viewValue.indexOf(existentValue.value) >= 0;
			};
			$scope.clickCheckbox = existentValue => {
				const viewValue = $scope.ngModel;
				if (viewValue.indexOf(existentValue.value) >= 0)
					viewValue.splice(viewValue.indexOf(existentValue.value), 1);
				else
					viewValue.push(existentValue.value);
			};

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaSelectCheckboxes();
	}
}

izendaUiModule.directive('izendaSelectCheckboxes', [IzendaSelectCheckboxes.factory()]);
