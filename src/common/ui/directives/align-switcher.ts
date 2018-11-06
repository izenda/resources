import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaAlignSwitcherScope extends ng.IScope {
	ngModel: any;
	title: string;
	alignShortcut: string;
	nextValue: any;
}

/**
 * Align switcher directive.
 */
class IzendaAlignSwitcher implements ng.IDirective {
	restrict = 'AE';
	scope = {
		ngModel: '=',
		title: '@'
	};
	template = `<span class="izenda-common-align-switcher glyphicon" ng-click="nextValue()" ng-attr-title="title" ng-class="alignShortcut"></span>`;

	link: ($scope: IIzendaAlignSwitcherScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor() {
		IzendaAlignSwitcher.prototype.link = ($scope: IIzendaAlignSwitcherScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			const itemsArray = ['L', 'M', 'R', 'J', ' '];
			const shortcuts = {
				'L': 'glyphicon-align-left',
				'M': 'glyphicon-align-center',
				'J': 'glyphicon-align-center',
				'R': 'glyphicon-align-right',
				' ': 'glyphicon-none'
			};

			const validateValue = (model) => {
				if (angular.isUndefined(model))
					return;
				if (itemsArray.indexOf(model) < 0)
					throw 'Unknown align value: ' + model;
			};

			var updateShortcut = (model) => $scope.alignShortcut = shortcuts[model];

			$scope.nextValue = () => {
				var idx = itemsArray.indexOf($scope.ngModel);
				if (idx < itemsArray.length - 1)
					idx++;
				else
					idx = 0;
				$scope.ngModel = itemsArray[idx];
				updateShortcut($scope.ngModel);
			};

			//
			$scope.$parent.$watch(attrs.ngModel, (newValue, oldValue) => {
				if (oldValue === newValue)
					return;
				validateValue(newValue);
				updateShortcut(newValue);
			});
			validateValue($scope.ngModel);
			updateShortcut($scope.ngModel);

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = () => new IzendaAlignSwitcher();
		directive.$inject = [];
		return directive;
	}
}
izendaUiModule.directive('izendaAlignSwitcher', [IzendaAlignSwitcher.factory()]);
