izendaRequire.define(['angular', '../../common/services/services', './instant-report-storage', './instant-report-pivot'], function (angular) {

	angular.module('izendaInstantReport').factory('$izendaInstantReportValidation', [
		'$q',
		'$izendaLocale',
		'$izendaInstantReportStorage',
		'$izendaInstantReportPivots',
	'$izendaInstantReportSettings',
	'$izendaCompatibility',
	function ($q, $izendaLocale, $izendaInstantReportStorage, $izendaInstantReportPivots, $izendaInstantReportSettings, $izendaCompatibility) {
		'use strict';

		var validation = {
			isValid: true,
			messages: []
		};
		var binaryFieldsArray = ['Null', 'Unknown', 'Binary', 'VarBinary', 'Text', 'Image'];

		/**
		 * Is report valid getter
		 * @returns {boolean} 
		 */
		var isReportValid = function () {
			return validation.isValid;
		};

		/**
		 * Validation object getter
		 * @returns {object} 
		 */
		var getValidation = function () {
			return validation;
		};

		/**
		 * Get list of validation messages
		 * @returns {Array}.
		 */
		var getValidationMessages = function () {
			return validation.messages;
		};

		/**
		 * Validate pivots. 
		 */
		var validatePivots = function () {
			var pivotColumn = $izendaInstantReportPivots.getPivotColumn();
			var pivotCells = $izendaInstantReportPivots.getCellValues();

			// check if pivot column was set:
			if (angular.isObject(pivotColumn)) {
				if (pivotCells.length === 0) {
					// show warning when pivot cells wasn't added.
					validation.isValid = false;
					validation.messages.push({
						type: 'info',
						text: $izendaLocale.localeText('js_AddPivotCellsWarning', 'You should add pivot cells to enable pivot view.')
					});
				} else {
					var havePivotCells = false;
					angular.element.each(pivotCells, function () {
						var pivotCell = this;
						if (angular.isObject(pivotCell))
							havePivotCells = true;
					});
					if (!havePivotCells) {
						validation.isValid = false;
						validation.messages.push({
							type: 'info',
							text: $izendaLocale.localeText('js_SpecifyPivotColumnWarning', 'You should specify column for at least one pivot cell (pivot cells without column will be ignored).')
						});
					}
				}
			}
		};

		/**
		 * Clear all validation messages and state
		 */
		var clearValidation = function () {
			validation.isValid = true;
			validation.messages = [];
		};

		var getValidationActions = function () {
			var result = [];
			angular.element.each(validation.messages, function () {
				var message = this;
				if (message.additionalActionType)
					result.push(message.additionalActionType)
			});
			return result;
		}

		/**
		 * Validate report set
		 * @returns {boolean} report is valid
		 */
		var validateReportSet = function () {
			clearValidation();

			var pivotColumn = $izendaInstantReportPivots.getPivotColumn();

			// try to find at least one active field
			var hasActiveFields = false;
			var binaryFields = [];
			var options = $izendaInstantReportStorage.getOptions();
			var activeFields = $izendaInstantReportStorage.getAllFieldsInActiveTables();
			angular.element.each(activeFields, function () {
				hasActiveFields |= this.checked;
				if (this.checked && binaryFieldsArray.indexOf(this.sqlType) >= 0) {
					binaryFields.push(this);
				}
			});
			// try to find active pivot fields
			hasActiveFields |= $izendaInstantReportPivots.isPivotValid();

			// create validation result for fields
			if (!hasActiveFields && !pivotColumn) {
				validation.isValid = false;
				validation.messages.push({
					type: 'info',
					text: $izendaLocale.localeText('js_YouShouldSelectField', 'You should select at least one field to see preview.')
				});
			}

			// stored procedure parameters validation
			if (!$izendaInstantReportStorage.isAllSpParametersAssigned()) {
				validation.isValid = false;
				validation.messages.push({
					type: 'info',
					text: $izendaLocale.localeText('js_spParameterIsRequired', 'Please specify values for your stored procedure parameters in the filters.')
				});
			}

			// distinct validation
			if ($izendaInstantReportSettings.showDistinct && options.distinct && binaryFields.length > 0) {
				var binaryFieldsString = binaryFields.map(function (bField) {
					return '"' + bField.name + '" (' + bField.sqlType + ')';
				}).join(', ');
				validation.messages.push({
					type: 'info',
					additionalActionType: 'TURN_OFF_DISTINCT',
					text: $izendaLocale.localeTextWithParams(
						'js_ColumnsIsntCompatibleWithDistinct',
						'Report contain columns: {0}. These columns are not compatable with "distinct" setting. Distinct setting was disabled!',
						[binaryFieldsString])
				});
			}

			// run pivots validation
			validatePivots();

			return validation.isValid;
		};

		/**
		 * Validate report set and refresh preview.
		 */
		var validateReportSetAndRefresh = function () {
			var _updatePreview = function () {
				if (!$izendaCompatibility.isSmallResolution())
					$izendaInstantReportStorage.getReportPreviewHtml();
			};

			var validationResult = validateReportSet();
			var validationActions = getValidationActions();
			if (validationResult) {
				// report is valid
				if (validationActions.indexOf('TURN_OFF_DISTINCT') >= 0) {
					$izendaInstantReportStorage.getOptions().distinct = false;
				}
				_updatePreview();
			} else {
				// report not valid
				$izendaInstantReportStorage.clearReportPreviewHtml();
			}
		};

		// public API
		return {
			isReportValid: isReportValid,
			getValidation: getValidation,
			getValidationMessages: getValidationMessages,
			validateReportSet: validateReportSet,
			validateReportSetAndRefresh: validateReportSetAndRefresh
		};
	}]);

});