define(['./localization-service', './rs-query-service'], function () {

	angular.module('izenda.common.query').factory('$izendaSettings', [
		'$log',
		'$q',
		'$izendaRsQuery',
		'$izendaLocale',
		'$izendaCommonSettings',
		function ($log, $q, $izendaRsQuery, $izendaLocale, $izendaCommonSettings) {
			'use strict';

			var settings = $izendaCommonSettings;

			var defaultDateFormat = {
				longDate: 'dddd, MMMM DD, YYYY',
				longTime: 'h:mm:ss A',
				shortDate: 'M/D/YYYY',
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
				getCommonSettings: getCommonSettings,
				getDateFormat: getDateFormat,
				getCulture: getCulture,
				getBulkCsv: getBulkCsv,
				getCategoryCharacter: getCategoryCharacter
			};
		}
	]);

});