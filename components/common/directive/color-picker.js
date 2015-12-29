/**
 * Color picker directive. Requires "jquery-minicolors" jQuery plugin. Usage:
 * <izenda-color-picker ng-model="..."></izenda-color-picker>
 */
(function () {
	'use strict';

	// template
	var izendaColorPickerTemplate = '<input class="minicolors form-control" ng-class="additionalClass"></input>';

	// implementation
	function izendaColorPicker($log) {
		return {
			restrict: 'A',
			scope: {
				ngModel: '=',
				inline: '@',
				additionalClass: '@'
			},
			template: izendaColorPickerTemplate,
			link: function ($scope, elem, attrs) {
				var $input = elem.find('input.minicolors');
				$input.minicolors({
					inline: $scope.inline === 'true',
					theme: 'bootstrap',
					color: $scope.color,
					change: function (hex) {
						$scope.ngModel = hex;
						angular.element('.iz-dash-background').css('background-color', hex);
						$scope.$applyAsync();
					}
				});
				// watch active item changed
				$scope.$parent.$watch(attrs.ngModel, function (newVal, oldVal) {
					if (newVal !== oldVal) {
						$input.minicolors('value', [newVal]);
					}
				});
				$input.minicolors('value', [$scope.ngModel]);
				elem.find('.minicolors-grid, .minicolors-slider').click(function (e) {
					e.stopPropagation();
				});
			}
		};
	};

	// definition
	angular
    .module('izendaCommonControls')
    .directive('izendaColorPicker', [
      '$log',
      izendaColorPicker
    ]);
})();