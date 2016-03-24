angular.module('izendaInstantReport').factory('$izendaInstantReportValidation', [
	'$q',
	'$izendaInstantReportStorage', 
	'$izendaInstantReportPivots',
	function ($q, $izendaInstantReportStorage, $izendaInstantReportPivots) {
		'use strict';

		var validation = {
			isValid: true,
			messages: []
		};

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
			var activeFields = $izendaInstantReportStorage.getAllFieldsInActiveTables();
			angular.element.each(activeFields, function () {
				hasActiveFields |= this.checked;
			});
			// try to find active pivot fields
			hasActiveFields |= $izendaInstantReportPivots.isPivotValid();

			// create validation result for fields
			if (!hasActiveFields) {
				validation.isValid = false;
				validation.messages.push({
					type: 'danger',
					text: 'You should select at least one field to see preview.'
				});
			}
			return validation.isValid;
		};

		// public API
		return {
			isReportValid: isReportValid,
			getValidation: getValidation,
			validateReportSet: validateReportSet
		};
	}]);
