(function () {
	'use strict';

	// definition
	angular
	.module('izendaDashboard')
	.directive('izendaTileTopSlider', [
	function () {
		return {
			restrict: 'A',
			require: ['ngModel'],
			scope: {
				disabled: '=',
				rendered: '=',
				ngModel: '=',
				endValue: '=',
				showItemAll: '=',
				onChangeEnd: '&'
			},
			template: '<input></input>',
			link: function ($scope, elem) {
				var slider = null;
				// initialize values array
				var valuesArray = [];
				for (var i = 1; i <= 10; i++)
					valuesArray.push(i);
				for (var j = 20; j <= 100; j = j + 10)
					valuesArray.push(j);
				valuesArray.push(250);
				valuesArray.push(500);
				valuesArray.push(1000);
				valuesArray.push(5000);
				valuesArray.push(10000);
				valuesArray.push('ALL');

				var convertFromToValue = function (from) {
					var val = valuesArray[from];
					if (val === 'ALL')
						val = -1;
					return val;
				};
				var convertValueToFrom = function (value) {
					var index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
					if (index < 0)
						index = valuesArray.indexOf('ALL');
					return index;
				}
				var setModelValue = function (value) {
					$scope.ngModel = value;
					$scope.$parent.$applyAsync();
				};
				var setEndValue = function (value) {
					$scope.endValue = value;
					$scope.$parent.$applyAsync();
				};

				/**
				 * Initialize slider
				 */
				var initializeSlider = function() {
					var $input = elem.children('input');
					$input.ionRangeSlider({
						disable: $scope.disabled,
						grid: true,
						hide_min_max: true,
						from: convertValueToFrom($scope.ngModel),
						values: valuesArray,
						onFinish: function (data) {
							var value = convertFromToValue(data.from);
							setEndValue(value);
							$scope.onChangeEnd({});
							$scope.$parent.$applyAsync();
						}
					});
					slider = $input.data("ionRangeSlider");
				}

				/**
				 * Set value to slider
				 */
				var setSliderValue = function (value) {
					if (!slider)
						return;
					var from = convertValueToFrom(value);
					slider.update({
						from: from
					});
				};

				// watches: 

				$scope.$watch('ngModel', function (newValue) {
					setSliderValue(newValue);
				});

				$scope.$watch('showItemAll', function (value) {
					var allExist = valuesArray.indexOf('ALL') >= 0;
					if (allExist && !value)
						valuesArray.pop();
					else if(!allExist && value)
						valuesArray.push('ALL');
					if (slider)
						slider.update({
							values: valuesArray
						});
				});

				$scope.$watch('rendered', function (value) {
					if (value) {
						initializeSlider();
					} else {
						if (slider) {
							slider.destroy();
							slider = null;
						}
					}
					
				});

				$scope.$watch('disabled', function (value) {
					if (slider)
						slider.update({
							disable: value
						});
				});
			}
		};
	}
	]);
})();
