izendaRequire.define([
	'angular',
	'../../../vendor/jquery-minicolors/jquery.minicolors.min',
	'../module-definition'
], function (angular) {
	'use strict';

	/**
	 * Color picker directive. Requires "jquery-minicolors" jQuery plugin. Usage:
	 * <izenda-color-picker ng-model="..."></izenda-color-picker>
	 */
	angular.module('izenda.common.ui').directive('izendaColorPicker', [function () {
		return {
			restrict: 'A',
			scope: {
				ngModel: '=',
				inline: '@',
				additionalClass: '@'
			},
			template: '<input class="minicolors form-control" ng-class="additionalClass"></input>',
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

				$scope.$on('$destroy', function() {
					$input.minicolors('destroy');
					$input.remove();
				});

				// watch active item changed
				$scope.$watch('ngModel', function (newVal, oldVal) {
					if (newVal === oldVal)
						return;
					$input.val(newVal);
					$input.minicolors('value', newVal);
				});

				initializeControl();
			}
		};
	}]);
});