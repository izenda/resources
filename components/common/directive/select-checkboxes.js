/**
 * Select checkboxes directive. 
 */
angular
	.module('izendaCommonControls')
	.directive('izendaSelectCheckboxes', [
		'$log',
		function () {
			return {
				restrict: 'AE',
				scope: {
					existentValues: '=',
					ngModel: '='
				},
				template: '<div ng-repeat="existentValue in existentValues">' +
									'<label class="izenda-select-checkboxes-label">' +
									'<input type="checkbox" ng-click="clickCheckbox(existentValue)" ng-checked="isChecked(existentValue)"/>' +
									'<span ng-bind="existentValue.text"></span>' +
									'</label>' +
									'</div>',
				link: function ($scope, elem, attrs) {
					$scope.$watch('existentValues', function () {
						$scope.$parent.$eval(attrs.ngChange);
					}, true);

					$scope.$watchCollection('ngModel', function () {
						$scope.$parent.$eval(attrs.ngChange);
					});

					$scope.isChecked = function (existentValue) {
						var viewValue = $scope.ngModel;
						return viewValue.indexOf(existentValue.value) >= 0;
					};
					$scope.clickCheckbox = function (existentValue) {
						var viewValue = $scope.ngModel;
						if (viewValue.indexOf(existentValue.value) >= 0)
							viewValue.splice(viewValue.indexOf(existentValue.value), 1);
						else
							viewValue.push(existentValue.value);
					};
				}
			};
		}
	]);
