/**
 * requirejs module, which creates angular modules.
 * returns 'loadSettings' function, which could load settings for this module.
 */
izendaRequire.define(['angular', 'angular-cookies', '../common/module-definition', '../filter/module-definition'], function (angular, angularCookies, izendaCommon) {
	'use strict';

	// Create dashboards angular module
	angular.module('izendaDashboard', [
		'ngCookies',
		'izenda.common.core',
		'izenda.common.query',
		'izenda.common.ui',
		'izendaFilters'
	]);

	/**
	 * Create and configure modules
	 */
	var configureModules = function(configObject) {
		// configure common ui module:
		angular
			.module('izenda.common.ui')
			.constant('izendaCommonUiConfig', {
				clearShareRules: false, // show rules which defined in current report set.
				clearScheduleOptions: false // show schedule options for current report set.
			})
			.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_DashboardName', 'Dashboard Name'])
			.value('izenda.common.ui.reportNameEmptyError', ['js_DashboardNameCantBeEmpty', 'Dashboard name can\'t be empty.'])
			.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidDashboardName', 'Invalid dashboard Name']);

		// configure instant report module
		var module = angular
			.module('izendaDashboard')
			.constant('izendaDashboardConfig', {
				showDashboardToolbar: true,
				defaultDashboardCategory: null,
				defaultDashboardName: null,
				dashboardToolBarItemsSort: function (item1, item2) {
					return item1.localeCompare(item2); // default order
				}
			})
			.config(['$logProvider', function ($logProvider) { $logProvider.debugEnabled(false); }])
			.constant('$izendaDashboardSettings', configObject);

		return module;
	}

	/**
	 * Bootstrap angular app:
	 * window.urlSettings$ objects should be defined before this moment.
	 */
	var bootstrapDashboards = function () {
		angular.element(document).ready(function () {
			// common settings promise:
			var commonQuerySettingsPromise = izendaCommon.loadSettings();

			// instant report settings promise:
			var urlSettings = window.urlSettings$;
			var rsPageUrl = urlSettings.urlRsPage;
			var settingsUrl = rsPageUrl + '?wscmd=getDashboardSettings';
			var dashboardsSettingsPromise = angular.element.get(settingsUrl);

			// wait while all settings are loaded:
			angular.element
				.when(commonQuerySettingsPromise, dashboardsSettingsPromise)
				.then(function (commonSettingsResult, dashboardsSettingsResult) {

					// get instant report config object
					var configObject = dashboardsSettingsResult[0];

					// create and configure modules:
					configureModules(configObject);

					// bootstrap application:
					angular.bootstrap('#izendaDashboardMainContainer', ['izendaDashboard']);
				});
		});
	};

	return {
		bootstrap: bootstrapDashboards,
		configureModules: configureModules
	};
});
