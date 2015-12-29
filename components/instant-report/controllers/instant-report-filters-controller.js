/**
* Instant report filters controller
*/
angular.module('izendaInstantReport').controller('InstantReportFiltersController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$sce',
			'$log',
			'$modal',
			'$izendaSettings',
			'$izendaInstantReportQuery',
			'$izendaInstantReportStorage',
			InstantReportFiltersController
]);

function InstantReportFiltersController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$sce,
			$log,
			$modal,
			$izendaSettings,
			$izendaInstantReportQuery,
			$izendaInstantReportStorage) {
	'use strict';
	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	$scope.$izendaSettings = $izendaSettings;
	var vm = this;

	vm.panelOpened = false;
	vm.filters = [];
	vm.filterOptions = $izendaInstantReportStorage.getFilterOptions();
	vm.activeFields = [];
	vm.currentValue = '';
	vm.dateFormat = $izendaSettings.getDateFormat();
	vm.culture = $izendaSettings.getCulture();
	
	/**
	 * Add new filter
	 */
	vm.addFilter = function (fieldSysName) {
		var filter = $izendaInstantReportStorage.createNewFilter(fieldSysName);
		$izendaInstantReportStorage.getFilters().push(filter);
		filter.initialized = true;
		$izendaInstantReportStorage.setFilterOperator(filter, null).then(function () {
			$scope.$applyAsync();
		});
	};

	/**
	 * Swap filter handler
	 */
	vm.reorderFilters = function (index1, index2) {
		$izendaInstantReportStorage.swapFilters(index1, index2);
		var allfilters = $izendaInstantReportStorage.getFilters();
		var index = Math.min(index1, index2);
		var filter = allfilters[index];
		$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
			$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
				$scope.$applyAsync();
			});
		});
	};

	/**
	 * Move to filter handler
	 */
	vm.moveFilterTo = function (index1, index2) {
		$izendaInstantReportStorage.moveFilterTo(index1, index2);
		var allfilters = $izendaInstantReportStorage.getFilters();
		var index = Math.min(index1, index2);
		index = index > 0 ? index - 1 : 0;
		var filter = allfilters[index];
		$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
			$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
				$scope.$applyAsync();
			});
		});
	}

	/**
	 * Remove filter
	 */
	vm.removeFilter = function (filter) {
		var allfilters = $izendaInstantReportStorage.getFilters();
		var count = allfilters.length;
		var index = $izendaInstantReportStorage.getFilters().indexOf(filter);
		$izendaInstantReportStorage.removeFilter(filter);
		if (count === 0)
			return;

		// refresh next filters after apply cascading
		var nextFilter;
		if (index === 0) {
			nextFilter = allfilters[0];
		} else {
			nextFilter = allfilters[index - 1];
		}
		$izendaInstantReportStorage.updateFieldFilterExistentValues(nextFilter).then(function () {
			$izendaInstantReportStorage.refreshNextFiltersCascading(nextFilter).then(function () {
				$scope.$applyAsync();
			});
		});
	};

	/**
	 * Handler when field selected
	 */
	vm.updateFilterOperators = function (filter) {
		if (!filter.initialized)
			return;
		filter.values = [];
		filter.currentValue = '';
		$izendaInstantReportStorage.setFilterOperator(filter).then(function () {
			$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
				$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
					$scope.$applyAsync();
				});
			});
		});
	};

	/**
	 * Prepare filter values and existing values
	 */
	vm.updateFilterValues = function (filter) {
		filter.values = [];
		var operatorType = $izendaInstantReportStorage.getFieldFilterOperatorValueType(filter.operator);
		if (operatorType === 'oneValue' || operatorType === 'oneDate') {
			filter.values = [''];
		} else if (operatorType === 'twoValues' || operatorType === 'twoDates') {
			filter.values = ['', ''];
		} else if (operatorType === 'Equals_TextArea') {
			filter.currentValue = '';
		} else if (operatorType === 'select' || operatorType === 'Equals_Autocomplete' || operatorType === 'select_multiple') {
			filter.values = [''];
		}
		$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
			$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
				$scope.$applyAsync();
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
	 * Prepare value for filter
	 */
	vm.onCurrentValueChange = function (filter) {
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
		$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
			$scope.$applyAsync();
		});
	}

	/**
	 * Get btn text for popup
	 */
	vm.getPopupBtnText = function (filter) {
		if (!angular.isArray(filter.values) || filter.values.length === 0)
			return '...';
		var labels = [];
		angular.element.each(filter.values, function () {
			var filterValue = this;
			angular.element.each(filter.existentValues, function() {
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
	vm.toggleValue = function (values, value) {
		var index = values.indexOf(value);
		if (index >= 0)
			values.splice(index, 1);
		else
			values.push(value);
	};

	/**
	 * Is value in values collection in filter
	 */
	vm.isValueChecked = function (values, value) {
		return values.indexOf(value) >= 0;
	};

	/**
	 * Get filter value type
	 */
	vm.getFilterOperatorType = function (filter) {
		return $izendaInstantReportStorage.getFieldFilterOperatorValueType(filter.operator);
	};

	/**
	 * Apply filters
	 */
	vm.applyFilters = function () {
		$izendaInstantReportStorage.getReportPreviewHtml();
	};

	/**
	 * Close filters panel
	 */
	vm.closeFiltersPanel = function () {
		$izendaInstantReportStorage.setFiltersPanelOpened(false);
	};

	/**
	 * Initialize watches
	 */
	vm.initWatchers = function () {
		$scope.$watch('$izendaSettings.getDateFormat()', function(dateFormat) {
			vm.dateFormat = dateFormat;
		}, true);

		$scope.$watch('$izendaSettings.getCulture()', function (culture) {
			vm.culture = culture;
		});

		$scope.$watchCollection('$izendaInstantReportStorage.getFilters()', function (newFilters, oldFilters) {
			vm.filters = newFilters;
		});

		$scope.$watch('$izendaInstantReportStorage.getFilterOptions()', function (newValue) {
			vm.filterOptions = newValue;
		});

		$scope.$watchCollection('$izendaInstantReportStorage.getAllFieldsInActiveTables()', function (newActiveFields, oldActiveFields) {
			// sync collection elements:
			// add:
			angular.element.each(newActiveFields, function () {
				var newActiveField = this;
				var found = false;
				angular.element.each(vm.activeFields, function () {
					if (this.sysname === newActiveField.sysname)
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
					if (newActiveFields[j].sysname === field.sysname)
						found = true;
				}
				if (!found)
					vm.activeFields.splice(i, 1);
				else
					i++;
			}
		});

		$scope.$watch('$izendaInstantReportStorage.getFiltersPanelOpened()', function (opened) {
			vm.panelOpened = opened;
		});
	};

	/**
	 * Initialize controller
	 */
	vm.init = function () {
		vm.filters = $izendaInstantReportStorage.getFilters();
		vm.activeFields = $izendaInstantReportStorage.getAllFieldsInActiveTables();
	};

	vm.initWatchers();
}
