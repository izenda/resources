izendaRequire.define(['angular', '../../common/services/services', './instant-report-query'], function (angular) {

	/**
	 * Default pivot config object
	 */
	angular.module('izendaInstantReport').constant('izendaInstantReportDefaultPivotConfig', {
		pivotColumn: null,
		cellValues: [],
		options: {
			addSideTotals: false
		}
	});

	/**
	 * Pivot storage service
	 */
	angular.module('izendaInstantReport').factory('$izendaInstantReportPivots', [
		'$injector',
		'$q',
		'$rootScope',
		'$izendaUtil',
		'$izendaInstantReportQuery',
		function ($injector, $q) {
			'use strict';

			/////////////////////////////////////////
			// common functions and variables
			/////////////////////////////////////////

			// variables
			var defaultConfig = $injector.get('izendaInstantReportDefaultPivotConfig');
			var pivotConfig = angular.extend({}, defaultConfig);
			var pivotsPanelOpened = false;

			/**
			 * Get pivot column field wrapper
			 */
			var getPivotColumn = function () {
				return pivotConfig.pivotColumn;
			};

			/**
			 * Set pivot column
			 */
			var setPivotColumn = function (value) {
				pivotConfig.pivotColumn = value;
			};

			/**
			 * Clear pivots
			 */
			var removePivots = function () {
				pivotConfig.pivotColumn = null;
				pivotConfig.cellValues = [];
				pivotConfig.options.addSideTotals = false;
			};

			/**
			 * Get pivot options object
			 */
			var getPivotOptions = function () {
				return pivotConfig.options;
			};

			/**
			 * Get pivots panel state
			 */
			var getPivotsPanelOpened = function () {
				return pivotsPanelOpened;
			};

			/**
			 * Set pivots panel state
			 */
			var setPivotsPanelOpened = function (value) {
				pivotsPanelOpened = value;
			};

			/////////////////////////////////////////
			// cell value functions
			/////////////////////////////////////////

			/**
			 * Get pivot fields wrappers
			 */
			var getCellValues = function () {
				return pivotConfig.cellValues;
			};

			/**
			 * Check is pivot added and valid.
			 * @returns {boolean} is valid
			 */
			var isPivotValid = function () {
				return angular.isObject(pivotConfig.pivotColumn) && pivotConfig.cellValues.length > 0;
			};

			/**
			 * Add cell value field
			 */
			var addCellValue = function () {
				pivotConfig.cellValues.push(null);
			};

			/**
			 * Remove cell value
			 */
			var removeCellValue = function (cellValue) {
				var cellValues = pivotConfig.cellValues;
				var idx = cellValues.indexOf(cellValue);
				if (idx >= 0) {
					cellValues.splice(idx, 1);
				}
			};

			/**
			 * Replace cell values by each other
			 */
			var swapCellValues = function (fromIndex, toIndex) {
				var cellValues = pivotConfig.cellValues;
				var temp = cellValues[fromIndex];
				cellValues[fromIndex] = cellValues[toIndex];
				cellValues[toIndex] = temp;
			};

			/**
			 * Move cell value to position
			 */
			var moveCellValueTo = function (fromIndex, toIndex) {
				var cellValues = pivotConfig.cellValues;
				cellValues.splice(toIndex, 0, cellValues.splice(fromIndex, 1)[0]);
			};

			/**
			 * Set cell value field, update available groups, formats, etc...
			 */
			var setCellValueField = function (index, newField) {
				pivotConfig.cellValues[index] = newField;
			};

			/**
			 * Add pivot column or cell if pivot column already defined
			 */
			var addPivotItem = function (fieldCopy) {
				if (!angular.isObject(pivotConfig.pivotColumn)) {
					pivotConfig.pivotColumn = fieldCopy;
				} else {
					pivotConfig.cellValues.push(fieldCopy);
				}
			};

			/**
			 * Synchronizes pivot
			 */
			var syncPivotState = function (activeFieldsInActiveTables) {
				removeNotActiveFields(activeFieldsInActiveTables);
			};

			/**
			 * Remove pivot column and pivot cell if corresponging fields are no
			 * longer available.
			 * @param {array} array of currently active fields.
			 */
			var removeNotActiveFields = function (activeFieldsInActiveTables) {
				var isFieldInList = function (field, fieldList) {
					if (!angular.isArray(fieldList))
						return false;
					for (var i = 0; i < fieldList.length; i++)
						if (fieldList[i].sysname === field.sysname)
							return true;
					return false;
				};
				if (angular.isObject(pivotConfig.pivotColumn)) {
					if (!isFieldInList(pivotConfig.pivotColumn, activeFieldsInActiveTables))
						pivotConfig.pivotColumn = null;
				}
				var j = 0;
				while (j < pivotConfig.cellValues.length) {
					var cellValue = pivotConfig.cellValues[j];
					if (!isFieldInList(cellValue, activeFieldsInActiveTables)) {
						pivotConfig.cellValues.splice(j, 1);
					}
					j++;
				}
			};

			/////////////////////////////////////////
			// data
			/////////////////////////////////////////

			/**
			 * Prepare pivots for send
			 */
			var getPivotDataForSend = function () {
				if (!pivotConfig.pivotColumn)
					return null;
				return pivotConfig;
			};

			/**
			 * Load pivot
			 */
			var loadPivotData = function (pivotData) {
				pivotConfig = pivotData;
				return $q(function (resolve) {
					resolve();
				});
			};

			// PUBLIC API
			return {
				getPivotsPanelOpened: getPivotsPanelOpened,
				setPivotsPanelOpened: setPivotsPanelOpened,
				getPivotColumn: getPivotColumn,
				getPivotOptions: getPivotOptions,
				setPivotColumn: setPivotColumn,
				removePivots: removePivots,
				getCellValues: getCellValues,
				addCellValue: addCellValue,
				removeCellValue: removeCellValue,
				swapCellValues: swapCellValues,
				moveCellValueTo: moveCellValueTo,
				addPivotItem: addPivotItem,
				setCellValueField: setCellValueField,
				getPivotDataForSend: getPivotDataForSend,
				loadPivotData: loadPivotData,
				isPivotValid: isPivotValid,
				syncPivotState: syncPivotState
			};
		}
	]);

});