angular
.module('izendaQuery')
.factory('$izendaSettings', [
'$log',
'$q',
'$izendaRsQuery',
function ($log, $q, $izendaRsQuery) {
	'use strict';

	var settingsCached = {};

	/**
	* Get print mode setting
	*/
	var getDashboardSettings = function () {
		return $izendaRsQuery.query('getDashboardSettings', [], {
			dataType: 'json'
		},
		// custom error handler:
		{
			handler: function () {
				return 'Failed to get Dashboard settings';
			},
			params: []
		});
	}

	/**
	 * Get dashboard setting from server or cache
	 */
	var getDashboardSetting = function (name) {
		var defer = $q.defer();
		if (!(name in settingsCached)) {
			// initialize print mode
			getDashboardSettings().then(function (data) {
				settingsCached = data;
				$log.debug('Dashboard settings loaded: ', settingsCached);
				defer.resolve(settingsCached[name]);
			});
		} else {
			// get cached value
			defer.resolve(settingsCached[name]);
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
		getDashboardAllowed: getDashboardAllowed
	}
}
]);
