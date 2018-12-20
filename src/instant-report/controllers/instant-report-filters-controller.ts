import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report filters controller
 */
izendaInstantReportModule.controller('InstantReportFiltersController', [
	'$rootScope',
	'$scope',
	'$window',
	'$timeout',
	'$q',
	'$sce',
	'$log',
	'$izendaLocaleService',
	'$izendaSettingsService',
	'$izendaCompatibilityService',
	'$izendaUtilUiService',
	'$izendaInstantReportQueryService',
	'$izendaInstantReportStorageService',
	'$izendaInstantReportValidationService',
	function (
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$sce,
		$log,
		$izendaLocaleService,
		$izendaSettingsService,
		$izendaCompatibilityService,
		$izendaUtilUiService,
		$izendaInstantReportQueryService,
		$izendaInstantReportStorageService,
		$izendaInstantReportValidationService) {
		'use strict';
		$scope.$izendaLocaleService = $izendaLocaleService;
		$scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
		$scope.$izendaSettingsService = $izendaSettingsService;
		$scope.$izendaCompatibilityService = $izendaCompatibilityService;
		var vm = this;

		vm.panelOpened = false;
		vm.filters = [];
		vm.filterOptions = $izendaInstantReportStorageService.getFilterOptions();
		vm.options = $izendaInstantReportStorageService.getOptions();
		vm.activeFields = [];
		vm.currentValue = '';
		vm.dateFormat = $izendaSettingsService.getDateFormat();
		vm.culture = $izendaSettingsService.getCulture();

		/**
		 * Add new filter
		 */
		vm.addFilter = function (fieldSysName) {
			$izendaInstantReportStorageService.createNewFilter(fieldSysName).then(function (filter) {
				if (filter.field !== null && !filter.field.allowedInFilters) {
					var errorTitle = $izendaLocaleService.localeText('js_Error', 'Error');
					var errorText = $izendaLocaleService.localeText('js_FieldForbiddenForFiltering', 'This field is forbidden to use for filtering.');
					$izendaUtilUiService.showNotification(errorText, errorTitle);
					return;
				}
				$izendaInstantReportStorageService.getFilters().push(filter);
				filter.initialized = true;
				$izendaInstantReportValidationService.validateReportSet();
				$izendaInstantReportStorageService.setFilterOperator(filter, null).then(function () {
					$scope.$applyAsync();
				});
			});
		};

		/**
		 * Swap filter handler
		 */
		vm.reorderFilters = function (index1, index2) {
			$izendaInstantReportStorageService.swapFilters(index1, index2);
			var allfilters = $izendaInstantReportStorageService.getFilters();
			var index = Math.min(index1, index2);
			var filter = allfilters[index];
			$izendaInstantReportStorageService.updateFieldFilterExistentValues(filter).then(function () {
				$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
					$scope.$applyAsync();
				});
			});
		};

		/**
		 * Move to filter handler
		 */
		vm.moveFilterTo = function (index1, index2) {
			$izendaInstantReportStorageService.moveFilterTo(index1, index2);
			var allfilters = $izendaInstantReportStorageService.getFilters();
			var index = Math.min(index1, index2);
			index = index > 0 ? index - 1 : 0;
			var filter = allfilters[index];
			$izendaInstantReportStorageService.updateFieldFilterExistentValues(filter).then(function () {
				$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
					$scope.$applyAsync();
				});
			});
		}

		/**
		 * Remove filter
		 */
		vm.removeFilter = function (filter) {
			var allfilters = $izendaInstantReportStorageService.getFilters();
			var count = allfilters.length;
			var index = $izendaInstantReportStorageService.getFilters().indexOf(filter);
			$izendaInstantReportStorageService.removeFilter(filter);
			$izendaInstantReportValidationService.validateReportSet();
			if (count === 0)
				return;

			// refresh next filters after apply cascading
			var nextFilter;
			if (index === 0) {
				nextFilter = allfilters[0];
			} else {
				nextFilter = allfilters[index - 1];
			}
			$izendaInstantReportStorageService.updateFieldFilterExistentValues(nextFilter).then(function () {
				$izendaInstantReportStorageService.refreshNextFiltersCascading(nextFilter).then(function () {
					$scope.$applyAsync();
				});
			});
		};

		/**
		 * Handler when field selected
		 */
		vm.onFilterFieldChange = function (filter) {
			if (!filter.initialized)
				return;
			filter.values = [];
			filter.currentValue = '';
			$izendaInstantReportValidationService.validateReportSet();
			$izendaInstantReportStorageService.loadFilterFormats(filter);
			$izendaInstantReportStorageService.setFilterOperator(filter).then(function () {
				$izendaInstantReportStorageService.getPopupFilterCustomTemplate(filter);
				$izendaInstantReportStorageService.updateFieldFilterExistentValues(filter, true).then(function () {
					$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
						$scope.$applyAsync();
					});
				});
			});
		};

		/**
		 * Prepare filter values and existing values
		 */
		vm.onFilterOperatorChange = function (filter) {
			filter.values = [];
			var asyncPromise = $q(function (resolve) {
				var operatorType = $izendaInstantReportStorageService.getFieldFilterOperatorValueType(filter.operator);
				if (operatorType === 'oneValue' || operatorType === 'oneDate') {
					filter.values = [''];
					resolve();
					return;
				}
				if (operatorType === 'twoValues' || operatorType === 'twoDates') {
					filter.values = ['', ''];
					resolve();
					return;
				}
				if (operatorType === 'Equals_TextArea') {
					filter.currentValue = '';
					resolve();
					return;
				}
				if (operatorType === 'Equals_Autocomplete' || operatorType === 'select_multiple') {
					filter.values = [''];
					resolve();
					return;
				}
				if (operatorType === 'select_popup') {
					$izendaInstantReportStorageService.getPopupFilterCustomTemplate(filter).then(function () {
						resolve();
					});
					return;
				}
				resolve();
			});

			asyncPromise.then(function () {
				$izendaInstantReportStorageService.updateFieldFilterExistentValues(filter, true).then(function () {
					$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
						$scope.$applyAsync();
					});
				});
			});
		}

		/**
		 * Return array of titles
		 */
		vm.getExistentValuesSimpleList = function (existentValues) {
			var result = angular.element.map(existentValues, function (val) {
				return val.text;
			});
			return result;
		}

		/**
		 * Update autocomplete items while user entering some text
		 * @param {object} filter 
		 * @param {string} autocompleteText
		 * @return {angular promise}. Promise on complete
		 */
		vm.updateAutoCompleteItems = function (filter, autocompleteText) {
			return $q(function (resolve) {
				filter.possibleValue = autocompleteText;
				$izendaInstantReportStorageService.updateFieldFilterExistentValues(filter, true).then(function () {
					filter.possibleValue = null;
					resolve(filter.existentValues);
				});
			});
		};

		/**
		 * Prepare value for filter
		 */
		vm.onCurrentValueChange = function (filter) {
			if (!filter.isFilterReady)
				return;
			// prepare data:
			if (filter.operator.value === 'Equals_TextArea') {
				var values = filter.currentValue.match(/^.*((\r\n|\n|\r)|$)/gm);
				filter.values = [];
				angular.element.each(values, function () {
					if (this.trim() !== '' && filter.values.indexOf(this.trim()) < 0)
						filter.values.push(this.trim());
				});
			}
			// refresh cascading:
			$izendaInstantReportStorageService.updateFieldFilterExistentValues(filter).then(function () {
				$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
					$scope.$applyAsync();
				});
			});
		};

		/**
		 * On filter logic change.
		 */
		vm.onFilterLogicChange = function () {
			if (vm.filters.length === 0)
				return;
			if (vm.filterOptions.filterLogic) {
				$izendaInstantReportStorageService.refreshFiltersForFilterLogic().then(function () {
					$scope.$applyAsync();
				});
			} else {
				vm.onCurrentValueChange(vm.filters[0]);
			}
		};

		/**
		 * Change value handler for custom popup filter.
		 */
		vm.onPopupValueChange = function (filter, newValue) {
			filter.values = newValue.split(',');
			$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
				$scope.$applyAsync();
			});
		};

		/**
		 * Get btn text for popup
		 */
		vm.getPopupBtnText = function (filter) {
			if (!angular.isArray(filter.values) || filter.values.length === 0)
				return '...';
			var labels = [];
			angular.element.each(filter.values, function () {
				var filterValue = this;
				angular.element.each(filter.existentValues, function () {
					var existentValue = this;
					if (existentValue.value === filterValue)
						labels.push(existentValue.text);
				});
			});
			var result = labels.join(', ');
			if (result.length > 30) {
				result = result.substring(0, 30);
				result += '...';
			}
			return result;
		};

		/**
		 * Toggle filter value
		 */
		vm.toggleValue = function (filter, value) {
			var values = filter.values;
			var index = values.indexOf(value);
			if (index >= 0)
				values.splice(index, 1);
			else
				values.push(value);
			$izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
				$scope.$applyAsync();
			});
		};

		/**
		 * Is value in values collection in filter
		 */
		vm.isValueChecked = function (filter, value) {
			var values = filter.values;
			return values.indexOf(value) >= 0;
		};

		/**
		 * Get filter value type
		 */
		vm.getFilterOperatorType = function (filter) {
			return $izendaInstantReportStorageService.getFieldFilterOperatorValueType(filter.operator);
		};

		/**
		 * Apply filters
		 */
		vm.applyFilters = function () {
			$izendaInstantReportValidationService.validateReportSetAndRefresh();
		};

		/**
		 * Close filters panel
		 */
		vm.closeFiltersPanel = function () {
			$izendaInstantReportStorageService.setFiltersPanelOpened(false);
		};

		/**
		 * Initialize watches
		 */
		vm.initWatchers = function () {
			$scope.$watch('$izendaSettingsService.getDateFormat()', function (dateFormat) {
				vm.dateFormat = dateFormat;
			}, true);

			$scope.$watch('$izendaSettingsService.getCulture()', function (culture) {
				vm.culture = culture;
			});

			$scope.$watchCollection('$izendaInstantReportStorageService.getFilters()', function (newFilters, oldFilters) {
				vm.filters = newFilters;
			});

			$scope.$watch('$izendaInstantReportStorageService.getFilterOptions()', function (newValue) {
				vm.filterOptions = newValue;
			});

			$scope.$watch('$izendaInstantReportStorageService.getOptions()', function (options) {
				vm.options = options;
			});

			$scope.$watchCollection('$izendaInstantReportStorageService.getAllFieldsInActiveTables(true)', function (newActiveFields) {
				// sync collection elements:
				// add:
				angular.element.each(newActiveFields, function () {
					var newActiveField = this;
					if (!newActiveField.allowedInFilters)
						return;
					var found = false;
					angular.element.each(vm.activeFields, function () {
						if (this === newActiveField)
							found = true;
					});
					if (!found)
						vm.activeFields.push(newActiveField);
				});
				// remove:
				var i = 0;
				while (i < vm.activeFields.length) {
					var field = vm.activeFields[i];
					var found = false;
					for (var j = 0; j < newActiveFields.length; j++) {
						if (newActiveFields[j] === field)
							found = true;
					}
					if (!found)
						vm.activeFields.splice(i, 1);
					else
						i++;
				}
			});

			$scope.$watch('$izendaInstantReportStorageService.getFiltersPanelOpened()', function (opened) {
				vm.panelOpened = opened;
			});
		};

		/**
		 * Initialize controller
		 */
		vm.init = function () {
			vm.filters = $izendaInstantReportStorageService.getFilters();
		};

		vm.initWatchers();
	}
]);

/**
 * Find all opened filter popup modals and close it.
 */
window.hideModal = function () {
	var popupModals = document.getElementsByName('filtersPopupModalDialog');
	angular.element.each(popupModals, function () {
		var $modal = angular.element(this);
		if ($modal.hasClass('modal') && $modal.hasClass('in')) {
			$modal['modal']('hide');
		}
	});
}

/**
 * Custom popup filter modal submit callback.
 */
window.CC_CustomFilterPageValueReceived = function () { }

/**
 * Override hide modal function.
 */
window.hm = function () {
	window.hideModal();
}

interface IIzendaOnPopupValueChangeScope extends ng.IScope {
	handler: any;
}

/**
 * Directive, which used for listening custom popup filters value change.
 */
izendaInstantReportModule.directive('izendaOnPopupValueChange', [
	'$interval',
	function ($interval) {
		return {
			restrict: 'A',
			scope: {
				handler: '&izendaOnPopupValueChange'
			},
			link: function ($scope: IIzendaOnPopupValueChangeScope, $element, attrs) {
				var previousValue = $element.val();
				var intervalId = $interval(function () {
					var newValue = $element.val();
					if (newValue !== previousValue) {
						$scope.handler({
							newValue: newValue
						});
						previousValue = newValue;
					}
				}, 20);

				// we should turn off interval on destroy input tag.
				$scope.$on('$destroy', function handleDestroyEvent() {
					if (intervalId) {
						$interval.cancel(intervalId);
						intervalId = null;
					}
				});
			}
		};
	}]);