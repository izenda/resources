angular
.module('izendaQuery')
.factory('$izendaSettings', [
'$log',
'$q',
'$izendaRsQuery',
'$izendaLocale',
function ($log, $q, $izendaRsQuery, $izendaLocale) {
	'use strict';

	var dashboardSettingsCached = {};

	/**
	* Get all dashboard settings
	*/
	var getDashboardSettings = function () {
		return $izendaRsQuery.query('getDashboardSettings', [], {
			dataType: 'json'
		},
		// custom error handler:
		{
			handler: function () {
				return $izendaLocale.localeText('js_DashboardSettingsError', 'Failed to get Dashboard settings');
			},
			params: []
		});
	}

	/**
	* Get common settings
	*/
	var getCommonSettings = function () {
		return $izendaRsQuery.query('getCommonSettings', [], {
			dataType: 'json',
			cache: true
		},
		// custom error handler:
		{
			handler: function () {
				return 'Failed to get settings';
			},
			params: []
		});
	}

	/**
	 * Get dashboard setting from server or cache
	 */
	var getDashboardSetting = function (name) {
		var defer = $q.defer();
		if (!(name in dashboardSettingsCached)) {
			getDashboardSettings().then(function (data) {
				dashboardSettingsCached = data;
				defer.resolve(dashboardSettingsCached[name]);
			});
		} else {
			// get cached value
			defer.resolve(dashboardSettingsCached[name]);
		}
		return defer.promise;
	};

	/**
	* Get AdHocSettings.PrintMode value (value will be cached)
	*/
	var getPrintMode = function () {
		var printMode = getDashboardSetting('allowedPrintEngine');
		return printMode;
	};

	/**
	* get dashboards is allowed
	*/
	var getDashboardAllowed = function () {
		var dashboardsAllowed = getDashboardSetting('dashboardsAllowed');
		return dashboardsAllowed;
	};

	return {
		getPrintMode: getPrintMode,
		getDashboardAllowed: getDashboardAllowed,
		getCommonSettings: getCommonSettings
	}
}
]);
