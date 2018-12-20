import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaRsQueryService from 'common/query/services/rs-query-service';
import { IIzendaInstantReportConfig } from 'instant-report/models/instant-report-config';

/**
 * Instant report settings service.
 */
export default class IzendaInstantReportSettingsService {

	private settingsObject: IIzendaInstantReportConfig = null;

	static get injectModules(): any[] {
		return ['$injector', '$izendaRsQueryService'];
	}

	constructor(
		private readonly $injector: ng.auto.IInjectorService,
		private readonly $izendaRsQueryService: IzendaRsQueryService) {

		// first try to get settings object if it have been already loaded
		this.settingsObject = this.$injector.get<IIzendaInstantReportConfig>('$izendaInstantReportSettingsValue');
		if (!angular.isObject(this.settingsObject))
			// if not loaded - load now.
			this.loadInstantReportSettings().then(resultObject => {
				this.settingsObject = resultObject as IIzendaInstantReportConfig;
			});
	}

	/**
	 * Get instant report settings from server.
	 */
	private loadInstantReportSettings() {
		return this.$izendaRsQueryService.query('getInstantReportSettings', [], {
			dataType: 'json',
			cache: true
		}, {
				handler: () => 'Failed to get instant report settings',
				params: []
			});
	}

	/**
	 * Settings getter
	 */
	getSettings(): IIzendaInstantReportConfig {
		return this.settingsObject;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaInstantReportSettingsService',
			IzendaInstantReportSettingsService.injectModules.concat(IzendaInstantReportSettingsService));
	}
}
