import * as angular from 'angular';
import 'izenda-external-libs';
import 'common/core/module';
import 'common/query/module';
import 'common/ui/module';

// common
import izendaUiModule from 'common/ui/module-definition';
import { IzendaCommonLoader } from 'common/common-module-definition';
import { IIzendaInstantReportConfig } from 'instant-report/models/instant-report-config';

// Create instant report angular module
const izendaInstantReportModule = angular.module('izendaInstantReport', [
	'ngCookies',
	'rx',
	'izenda.common.core',
	'izenda.common.query',
	'izenda.common.ui'
]);
export default izendaInstantReportModule;

// configure common ui module:
izendaUiModule
	.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_ReportName', 'Report Name'])
	.value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
	.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);

export class IzendaInstantReportLoader {

	static configureInstantReportModules(instantReportConfig: IIzendaInstantReportConfig) {
		// configure instant report module
		const module = izendaInstantReportModule
			.config(['$logProvider', $logProvider => $logProvider.debugEnabled(false)])
			.config(['$provide', $provide => {
				$provide.decorator('$browser', ['$delegate', $delegate => {
					$delegate.onUrlChange = () => { };
					$delegate.url = () => '';
					return $delegate;
				}]);
			}])
			.value('$izendaInstantReportSettingsValue', instantReportConfig);
		return module;
	}

	/**
	 * Bootstrap angular app:
	 * window.urlSettings$ objects should be defined before this moment.
	 */
	static bootstrap() {
		angular.element(document).ready(() => {
			// common settings promise:
			const commonQuerySettingsPromise = IzendaCommonLoader.loadSettings();

			// instant report settings promise:
			const urlSettings = window.urlSettings$;
			const rsPageUrl = urlSettings.urlRsPage;
			const settingsUrl = rsPageUrl + '?wscmd=getInstantReportSettings';
			const instantReportSettingsPromise = angular.element.get(settingsUrl);

			// wait while all settings are loaded:
			angular.element
				.when(commonQuerySettingsPromise, instantReportSettingsPromise)
				.then((commonSettingsResult, instantReportSettingsResult) => {
					// get instant report config object
					const configObject = instantReportSettingsResult[0] as IIzendaInstantReportConfig;
					configObject.moveUncategorizedToLastPosition = true;
					// create and configure modules:
					IzendaInstantReportLoader.configureInstantReportModules(configObject);
					// bootstrap application:
					angular.element('#izendaInstantReportRootContainer').removeClass('hidden');
					angular.bootstrap('#izendaInstantReportRootContainer', ['izendaInstantReport']);
				});
		});
	}
}
