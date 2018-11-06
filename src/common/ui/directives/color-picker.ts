import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaColorPickerScope extends ng.IScope {
	ngModel: any;
	inline: any;
	additionalClass: any;
	color: any;
}

/**
 * Color picker directive. Requires "jquery-minicolors" jQuery plugin. Usage:
 * <izenda-color-picker ng-model="..."></izenda-color-picker>
 */
class IzendaColorPicker implements ng.IDirective {
	restrict = 'A';
	scope = {
		ngModel: '=',
		inline: '@',
		additionalClass: '@'
	};
	template = '<input class="minicolors form-control" ng-class="additionalClass"></input>';
	link: ($scope: IIzendaColorPickerScope, $element: ng.IAugmentedJQuery) => void;

	constructor() {
		IzendaColorPicker.prototype.link = ($scope: IIzendaColorPickerScope, $element: ng.IAugmentedJQuery) => {
			const $input = $element.find('input.minicolors');

			// watch active item changed
			$scope.$watch('ngModel', (newVal: string, oldVal: string) => {
				if (newVal === oldVal)
					return;
				$input.val(newVal);
				$input['minicolors']('value', newVal);
			});

			initializeControl();

			// destruction method
			$element.on('$destroy', () => {
				$input['minicolors']('destroy');
				$input.remove();
			});

			function initializeControl() {
				$input['minicolors']('destroy');
				$input.val($scope.ngModel);
				$input['minicolors']({
					inline: $scope.inline === 'true',
					lettercase: 'lowercase',
					theme: 'bootstrap',
					color: $scope.color,
					position: 'bottom right',
					change: hex => {
						var val = String($input.val());
						if (val.match(/^#{0,1}[0-9a-f]{6}$/gi)) {
							$scope.ngModel = hex;
							angular.element('.iz-dash-background').css('background-color', hex);
							$scope.$applyAsync();
						}
					}
				});

				$element.find('.minicolors-grid, .minicolors-slider').click(e => {
					e.stopPropagation();
					return false;
				});
			}
		};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaColorPicker();
	}
}

izendaUiModule.directive('izendaColorPicker', [IzendaColorPicker.factory()]);
