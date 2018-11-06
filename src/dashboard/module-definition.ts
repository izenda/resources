import * as angular from 'angular';
import 'izenda-external-libs';
import 'common/core/module';
import 'common/query/module';
import 'common/ui/module';

// common
import { IzendaCommonLoader } from 'common/common-module-definition';
import izendaUiModule from 'common/ui/module-definition';

/**
 * requirejs module, which creates angular modules.
 * returns 'loadSettings' function, which could load settings for this module.
 */
// Create dashboards angular module
const izendaDashboardModule = angular.module('izendaDashboard', [
	'ngCookies',
	'rx',
	'izenda.common.core',
	'izenda.common.query',
	'izenda.common.ui',
	'izendaFilters'
]);

export default izendaDashboardModule;

// configure common ui module:
izendaUiModule
	.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_DashboardName', 'Dashboard Name'])
	.value('izenda.common.ui.reportNameEmptyError', ['js_DashboardNameCantBeEmpty', 'Dashboard name can\'t be empty.'])
	.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidDashboardName', 'Invalid dashboard Name']);

export class IzendaDashboardsLoader {

	/**
	 * Create and configure modules
	 */
	static configureModules(configObject) {
		const dashboardSettings = configObject as IIzendaDashboardSettings;
		const dashboardConfig = {
			showDashboardToolbar: true,
			defaultDashboardCategory: null, //'qwe\\qwewqe',
			defaultDashboardName: null, //'qqqq',
			dashboardToolBarItemsSort: (item1, item2) => item1.localeCompare(item2)
		} as IIzendaDashboardConfig;
		// configure instant report module
		const module = angular
			.module('izendaDashboard')
			.constant('izendaDashboardConfig', dashboardConfig)
			.config(['$logProvider', $logProvider => { $logProvider.debugEnabled(false); }])
			.config([
				'$provide', $provide => {
					$provide.decorator('$browser', [
						'$delegate', $delegate => {
							$delegate.onUrlChange = () => { };
							$delegate.url = () => '';
							return $delegate;
						}
					]);
				}
			])
			.constant('$izendaDashboardSettings', dashboardSettings);

		return module;
	}

	/**
	 * Bootstrap angular app:
	 * window.urlSettings$ objects should be defined before this moment.
	 */
	static bootstrap() {
		angular.element(document).ready(() => {
			// common settings promise:
			var commonQuerySettingsPromise = IzendaCommonLoader.loadSettings();

			// instant report settings promise:
			var urlSettings = window.urlSettings$;
			var rsPageUrl = urlSettings.urlRsPage;
			var settingsUrl = rsPageUrl + '?wscmd=getDashboardSettings';
			var dashboardsSettingsPromise = angular.element.get(settingsUrl);

			// wait while all settings are loaded:
			angular.element
				.when(commonQuerySettingsPromise, dashboardsSettingsPromise)
				.then((commonSettingsResult, dashboardsSettingsResult) => {

					// get instant report config object
					var configObject = dashboardsSettingsResult[0];

					// create and configure modules:
					IzendaDashboardsLoader.configureModules(configObject);

					// bootstrap application:
					angular.bootstrap('#izendaDashboardMainContainer', ['izendaDashboard']);
				});
		});
	};
}

export interface IIzendaDashboardSettings {
	allowedPrintEngine: string;
	dashboardsAllowed: boolean;
}

export interface IIzendaDashboardConfig {
	showDashboardToolbar: boolean;
	defaultDashboardCategory: string;
	defaultDashboardName: string;
	dashboardToolBarItemsSort: any;
}
