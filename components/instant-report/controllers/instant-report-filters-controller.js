izendaRequire.define([
	'angular',
	'../../common/core/services/compatibility-service',
	'../../common/core/services/localization-service',
	'../../common/ui/directives/autocomplete',
	'../../common/ui/directives/datetime-picker',
	'../../common/ui/directives/select-checkboxes',
	'../../common/query/services/settings-service',
	'../../common/core/services/util-ui-service',
	'../services/services',
	'../directive/directives'
], function (angular) {

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
		'$izendaLocale',
		'$izendaSettings',
		'$izendaCompatibility',
		'$izendaUtilUiService',
		'$izendaInstantReportQuery',
		'$izendaInstantReportStorage',
		'$izendaInstantReportValidation',
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
		$izendaLocale,
		$izendaSettings,
		$izendaCompatibility,
		$izendaUtilUiService,
		$izendaInstantReportQuery,
		$izendaInstantReportStorage,
		$izendaInstantReportValidation) {
		'use strict';
		$scope.$izendaLocale = $izendaLocale;
		$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
		$scope.$izendaSettings = $izendaSettings;
		$scope.$izendaCompatibility = $izendaCompatibility;
		var vm = this;

		vm.panelOpened = false;
		vm.filters = [];
		vm.filterOptions = $izendaInstantReportStorage.getFilterOptions();
		vm.options = $izendaInstantReportStorage.getOptions();
		vm.activeFields = [];
		vm.currentValue = '';
		vm.dateFormat = $izendaSettings.getDateFormat();
		vm.culture = $izendaSettings.getCulture();

		/**
		 * Add new filter
		 */
		vm.addFilter = function (fieldSysName) {
			$izendaInstantReportStorage.createNewFilter(fieldSysName).then(function (filter) {
				if (filter.field !== null && !filter.field.allowedInFilters) {
					var errorTitle = $izendaLocale.localeText('js_Error', 'Error');
					var errorText = $izendaLocale.localeText('js_FieldForbiddenForFiltering', 'This field is forbidden to use for filtering.');
					$izendaUtilUiService.showNotification(errorText, errorTitle);
					return;
				}
				$izendaInstantReportStorage.getFilters().push(filter);
				filter.initialized = true;
				$izendaInstantReportValidation.validateReportSet();
				$izendaInstantReportStorage.setFilterOperator(filter, null).then(function () {
					$scope.$applyAsync();
				});
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
			$izendaInstantReportValidation.validateReportSet();
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
		vm.onFilterFieldChange = function (filter) {
			if (!filter.initialized)
				return;
			filter.values = [];
			filter.currentValue = '';
			$izendaInstantReportValidation.validateReportSet();
			$izendaInstantReportStorage.loadFilterFormats(filter);
			$izendaInstantReportStorage.setFilterOperator(filter).then(function () {
				$izendaInstantReportStorage.getPopupFilterCustomTemplate(filter);
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
		vm.onFilterOperatorChange = function (filter) {
			filter.values = [];
			var asyncPromise = $q(function (resolve) {
				var operatorType = $izendaInstantReportStorage.getFieldFilterOperatorValueType(filter.operator);
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
					$izendaInstantReportStorage.getPopupFilterCustomTemplate(filter).then(function () {
						resolve();
					});
					return;
				}
				resolve();
			});

			asyncPromise.then(function () {
				$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
					$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
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
				$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
					filter.possibleValue = null;
					resolve(filter.existentValues);
				});
			});
		};

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
			$izendaInstantReportStorage.updateFieldFilterExistentValues(filter).then(function () {
				$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
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
				$izendaInstantReportStorage.refreshFiltersForFilterLogic().then(function () {
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
			$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
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
			$izendaInstantReportStorage.refreshNextFiltersCascading(filter).then(function () {
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
			$scope.$watch('$izendaSettings.getDateFormat()', function (dateFormat) {
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

			$scope.$watch('$izendaInstantReportStorage.getOptions()', function (options) {
				vm.options = options;
			});

			$scope.$watchCollection('$izendaInstantReportStorage.getAllFieldsInActiveTables(true)', function (newActiveFields, oldActiveFields) {

				// sync collection elements:
				// add:
				angular.element.each(newActiveFields, function () {
					var newActiveField = this;
					if (!newActiveField.allowedInFilters) {
						return;
					}
					var found = false;
					angular.element.each(vm.activeFields, function () {
						if (this.id == newActiveField.id)
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
						if (newActiveFields[j].id == field.id)
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
		};

		vm.initWatchers();
	}

	/**
	 * Find all opened filter popup modals and close it.
	 */
	window.hideModal = function () {
		var popupModals = document.getElementsByName('filtersPopupModalDialog');
		angular.element.each(popupModals, function () {
			var $modal = angular.element(this);
			if ($modal.hasClass('modal') && $modal.hasClass('in')) {
				$modal.modal('hide');
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
		hideModal();
	}

	/**
	 * Directive, which used for listening custom popup filters value change.
	 */
	angular.module('izendaInstantReport').directive('izendaOnPopupValueChange', [
		'$interval',
		function ($interval) {
			return {
				restrict: 'A',
				scope: {
					handler: '&izendaOnPopupValueChange'
				},
				link: function ($scope, $element, attrs) {
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

});