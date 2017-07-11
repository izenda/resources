izendaRequire.define(['angular', './localization-service', './rs-query-service'], function (angular) {

	angular.module('izenda.common.query').factory('$izendaSettings', [
		'$log',
		'$q',
		'$izendaLocale',
		'$izendaCommonSettings',
		function ($log, $q, $izendaLocale, $izendaCommonSettings) {
			'use strict';

			var settings = $izendaCommonSettings;

			var defaultDateFormat = {
				longDate: 'dddd, MMMM DD, YYYY',
				longTime: 'h:mm:ss A',
				shortDate: 'MM/DD/YYYY',
				shortTime: 'h:mm A',
				timeFormatForInnerIzendaProcessing: 'HH:mm:ss', // this time format used in method DateLocToUs for saving filters.
				showTimeInFilterPickers: false
			};

			// default format culture "en-US" (momentjs format string)
			var dateFormat = angular.extend({}, defaultDateFormat);
			var culture = 'en';
			var bulkCsv = false;
			var categoryCharacter = '\\';

			/**
			 * Default date formats
			 * @returns {object} 
			 */
			var getDefaultDateFormat = function () {
				return defaultDateFormat;
			};

			/**
			 * Default format string (en-US). This format used for sending dates to the server.
			 * @param customDateFormatString {string}. Alternative date format if required.
			 */
			var getDefaultDateFormatString = function (customDateFormatString) {
				var showTime = $izendaCommonSettings.showTimeInFilterPickers;
				var timeFormatString = showTime ? ' ' + defaultDateFormat.timeFormatForInnerIzendaProcessing : '';
				var dateFormatString = defaultDateFormat.shortDate;
				if (angular.isString(customDateFormatString) && customDateFormatString.trim() !== '') {
					dateFormatString = customDateFormatString;
				}
				return dateFormatString + timeFormatString;
			}

			/**
			 * Convert .net date time format string to momentjs format string.
			 * @param {string} .net format string
			 * @returns {string} momentjs format string
			 */
			var convertDotNetTimeFormatToMoment = function (format) {
				var converter = izenda.utils.date.formatConverter;
				return converter.convert(format, converter.dotNet, converter.momentJs);
			};

			/**
			* Get common settings
			*/
			var getCommonSettings = function () {
				return settings;
			};

			/**
			 * Get date format.
			 */
			var getDateFormat = function () {
				return dateFormat;
			};

			/**
			 * Get current page culture.
			 */
			var getCulture = function () {
				return culture;
			};

			/**
			 * Get "bulk csv" CSV export mode enabled.
			 */
			var getBulkCsv = function () {
				return bulkCsv;
			}

			var getCategoryCharacter = function () {
				return categoryCharacter;
			}

			/**
			 * Get raw settings object ($izendaCommonSettings) and initialize service settings objects
			 * Runs when service starts.
			 */
			function initialize() {
				dateFormat.longDate = convertDotNetTimeFormatToMoment($izendaCommonSettings.dateFormatLong);
				dateFormat.longTime = convertDotNetTimeFormatToMoment($izendaCommonSettings.timeFormatLong);
				dateFormat.shortDate = convertDotNetTimeFormatToMoment($izendaCommonSettings.dateFormatShort);
				dateFormat.shortTime = convertDotNetTimeFormatToMoment($izendaCommonSettings.timeFormatShort);
				dateFormat.showTimeInFilterPickers = $izendaCommonSettings.showTimeInFilterPickers;
				dateFormat.defaultFilterDateFormat = dateFormat.shortDate + ($izendaCommonSettings.showTimeInFilterPickers ? ' ' + dateFormat.longTime : '');

				culture = $izendaCommonSettings.culture;
				if (culture.indexOf('-') > 0)
					culture = culture.substring(0, culture.indexOf('-'));

				if (typeof $izendaCommonSettings.bulkCsv != 'undefined')
					bulkCsv = $izendaCommonSettings.bulkCsv;
				if (typeof $izendaCommonSettings.categoryCharacter != 'undefined')
					categoryCharacter = $izendaCommonSettings.categoryCharacter;

				$log.debug('Common settings initialized');
			};

			initialize();

			// public API
			return {
				getDefaultDateFormat: getDefaultDateFormat,
				getDefaultDateFormatString: getDefaultDateFormatString,
				getCommonSettings: getCommonSettings,
				getDateFormat: getDateFormat,
				getCulture: getCulture,
				getBulkCsv: getBulkCsv,
				getCategoryCharacter: getCategoryCharacter
			};
		}
	]);

});