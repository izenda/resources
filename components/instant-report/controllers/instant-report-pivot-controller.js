izendaRequire.define([
	'angular',
	'../../common/core/services/compatibility-service',
	'../../common/core/services/localization-service',
	'../services/services',
	'../directive/directives'
], function (angular) {

	angular.module('izendaInstantReport').controller('InstantReportPivotsController', [
				'$rootScope',
				'$scope',
				'$izendaLocale',
				'$izendaCompatibility',
				'$izendaInstantReportStorage',
				'$izendaInstantReportPivots',
				'$izendaInstantReportValidation',
				InstantReportPivotsController
	]);

	function InstantReportPivotsController(
		$rootScope,
		$scope,
		$izendaLocale,
		$izendaCompatibility,
		$izendaInstantReportStorage,
		$izendaInstantReportPivots,
		$izendaInstantReportValidation) {
		var vm = this;
		$scope.$izendaInstantReportPivots = $izendaInstantReportPivots;
		$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;

		vm.panelOpened = false; // pivot panel state
		vm.activeFields = $izendaInstantReportStorage.getAllFieldsInActiveTables(true);
		vm.pivotColumn = $izendaInstantReportPivots.getPivotColumn();
		vm.pivotOptions = $izendaInstantReportPivots.getPivotOptions();
		vm.cellValues = $izendaInstantReportPivots.getCellValues();
		vm.selectedFields = [];

		var updateSelectedFieldsArray = function () {
			vm.selectedFields = [];
			angular.element.each(vm.cellValues, function () {
				var cellValue = this;
				vm.selectedFields.push($izendaInstantReportStorage.getFieldBySysName(cellValue.sysname));
			});
		}
		updateSelectedFieldsArray();

		////////////////////////////
		// pivot column
		////////////////////////////

		/**
		 * Get additional class for "add cell value" button.
		 * @returns {string} class names 'class1 class2 ...'.
		 */
		vm.getAddCellBtnClass = function () {
			if (!vm.pivotColumn)
				return 'disabled';
			var result = false;
			angular.element.each(vm.cellValues, function (iValue, value) {
				if (!value)
					result = true;
			});
			return result ? 'disabled' : '';
		};

		/**
		 * Update validation
		 */
		vm.updateValidation = function () {
			$izendaInstantReportValidation.validateReportSet();
		};

		/**
		 * Update validation state and refresh if needed.
		 */
		vm.updateReportSetValidationAndRefresh = function () {
			$izendaInstantReportPivots.setDefaultGroup();

			$izendaInstantReportStorage.clearReportPreviewHtml();
			$izendaInstantReportStorage.applyAutoGroups(true);
			$izendaInstantReportValidation.validateReportSetAndRefresh();
		};

		/**
		 * User selected pivot column
		 */
		vm.onPivotColumnFieldSelect = function () {
			if (vm.pivotColumn !== null) {
				var sourceField = $izendaInstantReportStorage.getFieldBySysName(vm.pivotColumn.sysname);

				var groupName = null;
				var oldPivotColumn = $izendaInstantReportPivots.getPivotColumn();
				if (angular.isObject(oldPivotColumn) && sourceField.sysname === oldPivotColumn.sysname) {
					groupName = oldPivotColumn.groupByFunction.value;
				}

				$izendaInstantReportStorage.copyFieldObject(sourceField, vm.pivotColumn, true);
				$izendaInstantReportStorage.resetFieldObject(vm.pivotColumn);
				vm.pivotColumn.isPivotColumn = true;
				$izendaInstantReportPivots.setPivotColumn(vm.pivotColumn);
				$izendaInstantReportStorage.initializeField(vm.pivotColumn).then(function () {

					if (groupName !== null) {
						angular.element.each(vm.pivotColumn.groupByFunctionOptions, function () {
							if (this.value === groupName)
								vm.pivotColumn.groupByFunction = this;
						});
					}

					if (vm.cellValues.length === 0) {
						vm.addCellValue();
					}

					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			}
		};

		////////////////////////////
		// cell values
		////////////////////////////

		/**
		 * Cell value field select handler
		 */
		vm.onCellValueFieldSelect = function (index) {
			var selectedField = vm.selectedFields[index];
			var cellValue = vm.cellValues[index];
			if (angular.isObject(cellValue) && selectedField.sysname === cellValue.sysname)
				return;
			if (cellValue === null) {
				// if field wasn't set yet
				vm.cellValues[index] = cellValue = $izendaInstantReportStorage.createFieldObject(selectedField.name, selectedField.parentId, selectedField.tableSysname, selectedField.tableName,
				selectedField.sysname, selectedField.typeGroup, selectedField.type, selectedField.sqlType);
			}
			$izendaInstantReportStorage.copyFieldObject(selectedField, cellValue, true);
			$izendaInstantReportStorage.resetFieldObject(cellValue);
			$izendaInstantReportStorage.initializeField(cellValue).then(function (f) {
				angular.element.each(f.groupByFunctionOptions, function () {
					if (this.value.toLowerCase() === 'group')
						f.groupByFunction = this;
				});
				vm.updateReportSetValidationAndRefresh();
				$scope.$applyAsync();
			});
		}

		/**
		 * Cell value function select handler
		 */
		vm.onCellValueFunctionSelect = function (cellValue) {
			if (cellValue.groupByFunction === null)
				return;
			$izendaInstantReportStorage.onFieldFunctionApplyed(cellValue);
			vm.updateReportSetValidationAndRefresh();
		};

		/**
		 * Cell value
		 */
		vm.showAdvancedOptions = function (cellValue) {
			cellValue.isPivotCellValue = true;
			$izendaInstantReportStorage.applyFieldSelected(cellValue, true);
		};

		/**
		 * Create cell value item
		 */
		vm.addCellValue = function () {
			$izendaInstantReportPivots.addCellValue();
			vm.selectedFields.push(null);
			vm.updateValidation();
		};

		vm.clearPivots = function () {
			$izendaInstantReportPivots.removePivots();
			vm.updateReportSetValidationAndRefresh();
		};

		/**
		 * Remove cell value
		 */
		vm.removeCellValue = function (cellValue) {
			var idx = vm.cellValues.indexOf(cellValue);
			vm.selectedFields.splice(idx, 1);
			$izendaInstantReportPivots.removeCellValue(cellValue);
			vm.updateReportSetValidationAndRefresh();
		}

		/**
		 * Move cell value
		 */
		vm.moveCellValueTo = function (fromIndex, toIndex) {
			$izendaInstantReportPivots.moveCellValueTo(fromIndex, toIndex);
			vm.selectedFields.splice(toIndex, 0, vm.selectedFields.splice(fromIndex, 1)[0]);
			$scope.$applyAsync();
		}

		/**
		 * Reorder cells
		 */
		vm.reorderCellValue = function (fromIndex, toIndex) {
			$izendaInstantReportPivots.swapCellValues(fromIndex, toIndex);
			var temp = vm.selectedFields[fromIndex];
			vm.selectedFields[fromIndex] = vm.selectedFields[toIndex];
			vm.selectedFields[toIndex] = temp;
			$scope.$applyAsync();
		}

		/**
		 * Add pivot item
		 */
		vm.addPivotItem = function (fieldSysName) {
			if (!angular.isString(fieldSysName))
				return;
			if ($izendaInstantReportStorage.getActiveTables().length === 0)
				return;
			// open panel
			$izendaInstantReportStorage.setFiltersPanelOpened(false);
			$izendaInstantReportPivots.setPivotsPanelOpened(true);

			// create and add pivot item
			var field = $izendaInstantReportStorage.getFieldBySysName(fieldSysName);
			var newItem = $izendaInstantReportStorage.createFieldObject(
				field.name, field.parentId, field.tableSysname, field.tableName,
				field.sysname, field.typeGroup, field.type, field.sqlType);
			$izendaInstantReportStorage.initializeField(newItem).then(function (f) {
				$scope.$applyAsync();
			});
			$izendaInstantReportPivots.addPivotItem(newItem);

			$izendaInstantReportStorage.applyAutoGroups(true);
		};

		/**
		* Initialize controller
		*/
		vm.init = function () {

			// pivot panel state listener
			$scope.$watch('$izendaInstantReportPivots.getPivotsPanelOpened()', function (opened) {
				vm.panelOpened = opened;
			});

			// main pivot column
			$scope.$watch('$izendaInstantReportPivots.getPivotColumn()', function (pivotColumn) {
				vm.pivotColumn = pivotColumn;
			});

			// pivot cell values
			$scope.$watchCollection('$izendaInstantReportPivots.getCellValues()', function (cellValues) {
				vm.cellValues = cellValues;
				updateSelectedFieldsArray();
			});

			$scope.$watch('$izendaInstantReportPivots.getPivotOptions()', function (pivotOptions) {
				vm.pivotOptions = pivotOptions;
			});

			// listen for active field items
			$scope.$watchCollection('$izendaInstantReportStorage.getAllFieldsInActiveTables(true)', function (newActiveFields) {
				// add:
				var countOfChanges = 0;
				angular.element.each(newActiveFields, function () {
					var newActiveField = this;
					var found = false;
					angular.element.each(vm.activeFields, function () {
						if (this.sysname === newActiveField.sysname)
							found = true;
					});
					if (!found) {
						vm.activeFields.push(newActiveField);
						countOfChanges++;
					}
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
					if (!found) {
						vm.activeFields.splice(i, 1);
						countOfChanges++;
					} else
						i++;
				}
				$izendaInstantReportPivots.syncPivotState(vm.activeFields);
			});
		};
	}

});