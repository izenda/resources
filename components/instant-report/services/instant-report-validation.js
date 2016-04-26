angular.module('izendaInstantReport').factory('$izendaInstantReportValidation', [
	'$q',
	'$izendaLocale',
	'$izendaInstantReportStorage', 
	'$izendaInstantReportPivots',
	function ($q, $izendaLocale, $izendaInstantReportStorage, $izendaInstantReportPivots) {
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
		var isReportValid = function() {
			return validation.isValid;
		};

		/**
		 * Validation object getter
		 * @returns {object} 
		 */
		var getValidation = function() {
			return validation;
		};

		/**
		 * Get list of validation messages
		 * @returns {Array}.
		 */
		var getValidationMessages = function() {
			return validation.messages;
		};

		/**
		 * Clear all validation messages and state
		 */
		var clearValidation = function () {
			validation.isValid = true;
			validation.messages = [];
		};

		/**
		 * Validate report set
		 * @param {object} $izendaInstantReportStorage instance 
		 * @param {object} $izendaInstantReportPivots instance
		 * @returns {boolean} report is valid
		 */
		var validateReportSet = function () {
			clearValidation();

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
			if (!hasActiveFields) {
				validation.isValid = false;
				validation.messages.push({
					type: 'info',
					text: $izendaLocale.localeText('js_YouShouldSelectField', 'You should select at least one field to see preview.')
				});
			}

			if (options.distinct && binaryFields.length > 0) {
				var binaryFieldsString = binaryFields.map(function(bField) {
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
			return validation.isValid;
		};

		// public API
		return {
			isReportValid: isReportValid,
			getValidation: getValidation,
			getValidationMessages: getValidationMessages,
			validateReportSet: validateReportSet
		};
	}]);
