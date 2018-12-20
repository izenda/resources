import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

izendaInstantReportModule.controller('InstantReportPivotsController', [
	'$rootScope',
	'$scope',
	'$izendaLocaleService',
	'$izendaCompatibilityService',
	'$izendaInstantReportStorageService',
	'$izendaInstantReportPivotService',
	'$izendaInstantReportValidationService',
	function (
		$rootScope,
		$scope,
		$izendaLocaleService,
		$izendaCompatibilityService,
		$izendaInstantReportStorageService,
		$izendaInstantReportPivotService,
		$izendaInstantReportValidationService) {
		var vm = this;
		$scope.$izendaInstantReportPivotService = $izendaInstantReportPivotService;
		$scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;

		vm.panelOpened = false; // pivot panel state
		vm.activeFields = $izendaInstantReportStorageService.getAllFieldsInActiveTables(true);
		vm.pivotColumn = $izendaInstantReportPivotService.getPivotColumn();
		vm.pivotOptions = $izendaInstantReportPivotService.getPivotOptions();
		vm.cellValues = $izendaInstantReportPivotService.getCellValues();
		vm.selectedFields = [];

		var updateSelectedFieldsArray = function () {
			vm.selectedFields = [];
			vm.cellValues.forEach(cellValue => {
				if (cellValue)
					vm.selectedFields.push($izendaInstantReportStorageService.getFieldBySysName(cellValue.sysname));
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
			$izendaInstantReportValidationService.validateReportSet();
		};

		/**
		 * Update validation state and refresh if needed.
		 */
		vm.updateReportSetValidationAndRefresh = function () {
			$izendaInstantReportPivotService.setDefaultGroup();

			$izendaInstantReportStorageService.clearReportPreviewHtml();
			$izendaInstantReportStorageService.applyAutoGroups(true);
			$izendaInstantReportValidationService.validateReportSetAndRefresh();
		};

		/**
		 * User selected pivot column
		 */
		vm.onPivotColumnFieldSelect = function () {
			if (vm.pivotColumn !== null) {
				var sourceField = $izendaInstantReportStorageService.getFieldBySysName(vm.pivotColumn.sysname);

				var groupName = null;
				var oldPivotColumn = $izendaInstantReportPivotService.getPivotColumn();
				if (angular.isObject(oldPivotColumn) && sourceField.sysname === oldPivotColumn.sysname) {
					groupName = oldPivotColumn.groupByFunction.value;
				}

				$izendaInstantReportStorageService.copyFieldObject(sourceField, vm.pivotColumn, true);
				$izendaInstantReportStorageService.resetFieldObject(vm.pivotColumn);
				vm.pivotColumn.isPivotColumn = true;
				$izendaInstantReportPivotService.setPivotColumn(vm.pivotColumn);
				$izendaInstantReportStorageService.initializeField(vm.pivotColumn).then(function () {

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
				vm.cellValues[index] = cellValue = $izendaInstantReportStorageService.createFieldObject(selectedField.name, selectedField.parentId, selectedField.tableSysname, selectedField.tableName,
					selectedField.sysname, selectedField.typeGroup, selectedField.type, selectedField.sqlType);
			}
			$izendaInstantReportStorageService.copyFieldObject(selectedField, cellValue, true);
			$izendaInstantReportStorageService.resetFieldObject(cellValue);
			$izendaInstantReportStorageService.initializeField(cellValue).then(function (f) {
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
			$izendaInstantReportStorageService.onFieldFunctionApplied(cellValue);
			vm.updateReportSetValidationAndRefresh();
		};

		/**
		 * Cell value
		 */
		vm.showAdvancedOptions = function (cellValue) {
			cellValue.isPivotCellValue = true;
			$izendaInstantReportStorageService.applyFieldSelected(cellValue, true);
		};

		/**
		 * Create cell value item
		 */
		vm.addCellValue = function () {
			$izendaInstantReportPivotService.addCellValue();
			vm.selectedFields.push(null);
			vm.updateValidation();
		};

		vm.clearPivots = function () {
			$izendaInstantReportPivotService.removePivots();
			vm.updateReportSetValidationAndRefresh();
		};

		/**
		 * Remove cell value
		 */
		vm.removeCellValue = function (cellValue) {
			var idx = vm.cellValues.indexOf(cellValue);
			vm.selectedFields.splice(idx, 1);
			$izendaInstantReportPivotService.removeCellValue(cellValue);
			vm.updateReportSetValidationAndRefresh();
		}

		/**
		 * Move cell value
		 */
		vm.moveCellValueTo = function (fromIndex, toIndex) {
			$izendaInstantReportPivotService.moveCellValueTo(fromIndex, toIndex);
			vm.selectedFields.splice(toIndex, 0, vm.selectedFields.splice(fromIndex, 1)[0]);
			$scope.$applyAsync();
		}

		/**
		 * Reorder cells
		 */
		vm.reorderCellValue = function (fromIndex, toIndex) {
			$izendaInstantReportPivotService.swapCellValues(fromIndex, toIndex);
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
			if ($izendaInstantReportStorageService.getActiveTables().length === 0)
				return;
			// open panel
			$izendaInstantReportStorageService.setFiltersPanelOpened(false);
			$izendaInstantReportPivotService.setPivotsPanelOpened(true);

			// create and add pivot item
			var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName);
			var newItem = $izendaInstantReportStorageService.createFieldObject(
				field.name, field.parentId, field.tableSysname, field.tableName,
				field.sysname, field.typeGroup, field.type, field.sqlType);
			$izendaInstantReportStorageService.initializeField(newItem).then(function (f) {
				$scope.$applyAsync();
			});
			$izendaInstantReportPivotService.addPivotItem(newItem);

			$izendaInstantReportStorageService.applyAutoGroups(true);
		};

		/**
		* Initialize controller
		*/
		vm.init = function () {

			// pivot panel state listener
			$scope.$watch('$izendaInstantReportPivotService.getPivotsPanelOpened()', function (opened) {
				vm.panelOpened = opened;
			});

			// main pivot column
			$scope.$watch('$izendaInstantReportPivotService.getPivotColumn()', function (pivotColumn) {
				vm.pivotColumn = pivotColumn;
			});

			// pivot cell values
			$scope.$watchCollection('$izendaInstantReportPivotService.getCellValues()', function (cellValues) {
				vm.cellValues = cellValues;
				updateSelectedFieldsArray();
			});

			$scope.$watch('$izendaInstantReportPivotService.getPivotOptions()', function (pivotOptions) {
				vm.pivotOptions = pivotOptions;
			});

			// listen for active field items
			$scope.$watchCollection('$izendaInstantReportStorageService.getAllFieldsInActiveTables(true)', function (newActiveFields) {
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
				$izendaInstantReportPivotService.syncPivotState(vm.activeFields);
			});
		};
	}
]);