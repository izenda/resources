/**
 * Izenda query service which provides dashboard specific queries
 * this is singleton
 */
angular.module('izendaQuery')
	.factory('$izendaCommonQuery', [
	'$log',
	'$izendaRsQuery',
	'$izendaLocale',
	function ($log, $izendaRsQuery, $izendaLocale) {
		'use strict';

		/**
		* Used for refresh session timeout
		*/
		function ping() {
			return $izendaRsQuery.query('ping', [], {
				dataType: 'text'
			});
		};

		/**
		 * Create new dashboard report set and set it as CurrentReportSet
		 */
		function newDashboard() {
			return $izendaRsQuery.query('newcrs', ['DashboardDesigner'], {
				dataType: 'json'
			},
			// custom error handler:
			{
				handler: function () {
					return $izendaLocale.localeText('js_DashboardCreateError', 'Failed to create new dashboard');
				},
				params: []
			});
		}

		function setCurrentReportSet(reportSetFullName) {
			return $izendaRsQuery.query('setcurrentreportset', [reportSetFullName], {
				dataType: 'text'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_DashboardCrsError', 'Failed to set current report set') + ': ' + name;
				},
				params: [reportSetFullName]
			});
		}

		/**
		* Check report set is exist.
		* returns promise with 'true' value if exists
		*/
		function checkReportSetExist(reportSetFullName) {
			if (!angular.isString(reportSetFullName) || reportSetFullName.trim() === '')
				throw new Error('reportSetFullName should be non empty string');
			return $izendaRsQuery.query('checkreportsetexists', [reportSetFullName], {
				dataType: 'text'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_DashboardCheckExistError', 'Failed to check dashboard exist') + ': ' + name;
				},
				params: [reportSetFullName]
			});
		}

		/**
		* Set AdHocContext current report set
		*/
		function setCrs(reportSetFullName) {
			return $izendaRsQuery.query('setcurrentreportset', [reportSetFullName], {
				dataType: 'text'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_SetCrsError', 'Failed to set current report set') + ': ' + name;
				},
				params: [reportSetFullName]
			});
		}

		/**
		* Get report list by category
		*/
		function getReportSetCategory(category) {
			var categoryStr = angular.isDefined(category)
			? (category.toLowerCase() === 'uncategorized' ? '' : category)
			: '';
			return $izendaRsQuery.query('reportlistdatalite', [categoryStr], {
				dataType: 'json'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_GetCategoryError', 'Failed to get reports for category') + ': ' + name;
				},
				params: [category]
			});
		}

		/**
		* Get report parts
		*/
		function getReportParts(reportFullName) {
			return $izendaRsQuery.query('reportdata', [reportFullName], {
				dataType: 'json'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_ReportPartsError', 'Failed to get report parts for report') + ': ' + name;
				},
				params: [reportFullName]
			});
		}

		/**
		 * Get data which needed for schedule
		 */
		function getScheduleData(clientTimezoneOffset) {
			return $izendaRsQuery.query('getCrsSchedule', [clientTimezoneOffset], {
				dataType: 'json'
			}, {
				handler: function () {
					return 'Failed to get schedule data';
				},
				params: []
			});
		}

		/**
		 * Get data which needed for schedule
		 */
		function getShareData() {
			return $izendaRsQuery.query('getCrsShare', [], {
				dataType: 'json'
			}, {
				handler: function () {
					return 'Failed to get share data';
				},
				params: []
			});
		}

		/**
		 * Save schedule config to current report set
		 */
		function saveScheduleData(scheduleData) {
			return $izendaRsQuery.query('setCrsSchedule', [JSON.stringify(scheduleData)], {
				dataType: 'text'
			}, {
				handler: function () {
					return 'Failed to save schedule data';
				},
				params: []
			});
		}

		/**
		 * Save schedule config to current report set
		 */
		function saveShareData(shareConfig) {
			return $izendaRsQuery.query('setCrsShare', [JSON.stringify(shareConfig)], {
				dataType: 'text'
			}, {
				handler: function () {
					return 'Failed to save share data';
				},
				params: []
			});
		}

		// PUBLIC API
		return {
			setCurrentReportSet: setCurrentReportSet,
			newDashboard: newDashboard,
			checkReportSetExist: checkReportSetExist,
			getReportSetCategory: getReportSetCategory,
			getReportParts: getReportParts,
			setCrs: setCrs,
			ping: ping,
			getScheduleData: getScheduleData,
			getShareData: getShareData,
			saveScheduleData: saveScheduleData,
			saveShareData: saveShareData
		};
	}]);