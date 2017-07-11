izendaRequire.define(['angular', '../../vendor/jquery-minicolors/jquery.minicolors.min', '../services/services'], function (angular) {
	/**
	 * Color picker directive. Requires "jquery-minicolors" jQuery plugin. Usage:
	 * <izenda-color-picker ng-model="..."></izenda-color-picker>
	 */
	(function () {
		'use strict';

		// template
		var izendaColorPickerTemplate = '<input class="minicolors form-control" ng-class="additionalClass"></input>';

		// definition
		angular.module('izenda.common.ui').directive('izendaColorPicker', [function () {
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
					function initializeControl() {
						$input.minicolors('destroy');
						$input.val($scope.ngModel);
						$input.minicolors({
							inline: $scope.inline === 'true',
							lettercase: 'lowercase',
							theme: 'bootstrap',
							color: $scope.color,
							position: 'bottom right',
							change: function (hex) {
								var val = $input.val();
								if (val.match(/^#{0,1}[0-9a-f]{6}$/gi)) {
									$scope.ngModel = hex;
									angular.element('.iz-dash-background').css('background-color', hex);
									$scope.$applyAsync();
								}
							}
						});

						elem.find('.minicolors-grid, .minicolors-slider').click(function (e) {
							e.stopPropagation();
							return false;
						});
					}

					// watch active item changed
					$scope.$watch('ngModel', function (newVal) {
						$input.val(newVal);
						$input.minicolors('value', newVal);
					});

					initializeControl();
				}
			};
		}]);
	})();

});