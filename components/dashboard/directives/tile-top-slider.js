izendaRequire.define([
	'angular',
	'../../vendor/ionrangeslider/ion.rangeSlider',
	'../services/services'
], function (angular) {

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

					var _convertFromToValue = function (from) {
						var val = valuesArray[from];
						if (val === 'ALL')
							val = -1;
						return val;
					};

					var _appendValueToFromArray = function (value) {
						var index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
						if (index >= 0)
							return false;
						var updatedArray = [];
						valuesArray.forEach(function (currValue) {
							if (currValue > value && updatedArray.indexOf(value) < 0)
								updatedArray.push(value);
							updatedArray.push(currValue);
						});
						valuesArray = updatedArray;
						return true;
					};

					var _convertValueToFrom = function (value) {
						var index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
						if (index < 0)
							index = valuesArray.indexOf('ALL');
						return index;
					};

					/**
					 * Initialize slider
					 */
					var initializeSlider = function () {
						var $input = elem.children('input');
						_appendValueToFromArray($scope.ngModel); // add current value if it doesn't exist in current values array.
						$input.val('');
						$input.ionRangeSlider({
							disable: $scope.disabled,
							grid: true,
							hide_min_max: true,
							from: _convertValueToFrom($scope.ngModel),
							values: valuesArray,
							onFinish: function (data) {
								var value = _convertFromToValue(data.from);
								if (angular.isFunction($scope.onChangeEnd))
									$scope.onChangeEnd({newTop: value});
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
						if (_appendValueToFromArray(value))
							slider.update({
								values: valuesArray
							});
						var from = _convertValueToFrom(value);
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
						else if (!allExist && value)
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

});
