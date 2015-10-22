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
				ngModel: '=',
				endValue: '=',
				onChangeEnd: '&'
			},
			template: '<input></input>',
			link: function ($scope, elem) {
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
				}

				// initialize slider
				var $input = elem.children('input');
				$input.ionRangeSlider({
					grid: true,
					hide_min_max: true,
					from: convertValueToFrom($scope.ngModel),
					values: valuesArray,
					onChange: function (data) {
						var value = convertFromToValue(data.from);
						setModelValue(value);
					},
					onFinish: function (data) {
						var value = convertFromToValue(data.from);
						setEndValue(value);
						$scope.onChangeEnd({});
						$scope.$parent.$applyAsync();
					}
				});

				/*var slider = $input.data("ionRangeSlider");
				var setSliderValue = function (value) {
				var from = convertValueToFrom(value);
				slider.update({
				from: from
				});
				};*/
			}
		};
	}
	]);
})();
