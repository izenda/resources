import * as angular from 'angular';
import izendaDashboardModule from 'dashboard/module-definition';

interface IIzendaTileTopSliderScope extends ng.IScope {
	disabled: any;
	rendered: any;
	ngModel: any;
	showItemAll: any;
	onChangeEnd: any;
}

/**
 * Slider for selecting top value.
 */
class IzendaTileTopSlider implements ng.IDirective {
	restrict = 'A';
	require = ['ngModel'];
	scope = {
		disabled: '=',
		rendered: '=',
		ngModel: '=',
		showItemAll: '=',
		onChangeEnd: '&'
	};
	template = '<input></input>';

	link: ($scope: IIzendaTileTopSliderScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor() {
		IzendaTileTopSlider.prototype.link = ($scope: IIzendaTileTopSliderScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			let slider = null;

			// initialize values array
			let valuesArray: Array<string | number> = [];
			for (let i = 1; i <= 10; i++)
				valuesArray.push(i);
			for (let j = 20; j <= 100; j = j + 10)
				valuesArray.push(j);
			valuesArray.push(250);
			valuesArray.push(500);
			valuesArray.push(1000);
			valuesArray.push(5000);
			valuesArray.push(10000);
			valuesArray.push('ALL');

			// convert value from values array to the number
			const convertFromToValue = (valuesArrayIndex: number): number => {
				let val: string | number = valuesArray[valuesArrayIndex];
				if (val === 'ALL') val = -1;
				return Number(val);
			};

			// add new value to the valuesArray
			const appendValueToFromArray = (value: number): boolean => {
				const index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
				if (index >= 0)
					return false;

				const updatedArray: Array<string | number> = [];
				valuesArray.forEach(currValue => {
					if (currValue > value && updatedArray.indexOf(value) < 0)
						updatedArray.push(value);
					updatedArray.push(currValue);
				});
				valuesArray = updatedArray;
				return true;
			};

			// convert number into values array value and return index of the found value.
			const convertAndGetValuesArrayIndex = (value: number): number => {
				let index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
				if (index < 0)
					index = valuesArray.indexOf('ALL');
				return index;
			};

			// initialize slider
			const initializeSlider = () => {
				const $input = $element.children('input');
				appendValueToFromArray($scope.ngModel); // add current value to the valuesArray if no exist.
				$input.val('');
				$input['ionRangeSlider']({
					disable: $scope.disabled,
					grid: true,
					hide_min_max: true,
					from: convertAndGetValuesArrayIndex($scope.ngModel),
					values: valuesArray,
					onFinish: data => {
						const value = convertFromToValue(data.from);
						if (angular.isFunction($scope.onChangeEnd))
							$scope.onChangeEnd({ newTop: value });
					}
				});
				slider = $input.data("ionRangeSlider");
			}

			// Set value to slider
			const setSliderValue = (value: number) => {
				if (!slider)
					return;
				// add value to the values array if not exist.
				if (appendValueToFromArray(value))
					slider.update({
						values: valuesArray
					});
				const from = convertAndGetValuesArrayIndex(value);
				slider.update({
					from: from
				});
			};

			// watches: 
			$scope.$watch('ngModel', (newValue: number) => setSliderValue(newValue));
			$scope.$watch('showItemAll', value => {
				const isAllElementExists = valuesArray.indexOf('ALL') >= 0;
				if (isAllElementExists && !value)
					valuesArray.pop();
				else if (!isAllElementExists && value)
					valuesArray.push('ALL');
				if (slider)
					slider.update({
						values: valuesArray
					});
			});

			$scope.$watch('rendered', (value: boolean) => {
				if (value)
					initializeSlider();
				else if (slider) {
					slider.destroy();
					slider = null;
				}
			});

			$scope.$watch('disabled', (value: boolean) => {
				if (slider)
					slider.update({
						disable: value
					});
			});

			// destruction method
			$element.on('$destroy', () => {
				if (slider) {
					slider.destroy();
					slider = null;
				}
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaTileTopSlider();
	}
}

izendaDashboardModule.directive('izendaTileTopSlider', [IzendaTileTopSlider.factory()]);
