import 'izenda-external-libs';
import * as angular from 'angular';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';
import IzendaRsQueryService from 'common/query/services/rs-query-service';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaScheduleService from 'common/ui/services/schedule-service';
import IzendaShareService from 'common/ui/services/share-service';
import IzendaUrlService from 'common/query/services/url-service';

import { IzendaDashboardModel } from 'dashboard/model/dashboard-model';
import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';

/**
	 * Dashboard query service. This service is not implied for direct use in components.
	 */
export default class DashboardQueryService {

	constructor(
		private readonly $q: ng.IQService,
		private readonly $izendaSettings: IzendaQuerySettingsService,
		private readonly $izendaUtilUiService: IzendaUtilUiService,
		private readonly $izendaRsQuery: IzendaRsQueryService,
		private readonly $izendaLocale: IzendaLocalizationService,
		private readonly $izendaScheduleService: IzendaScheduleService,
		private readonly $izendaShareService: IzendaShareService,
		private readonly $izendaUrl: IzendaUrlService) {
	}

	/**
	 * (new!) Load dashboard config json
	 * @param {string} dashboardFullName dashboard report set full name
	 * @param {boolean} updateFromSource whether need to update dashboard tiles from source report or not.
	 */
	loadDashboardNew(dashboardFullName: string, updateFromSource: boolean): angular.IPromise<IzendaDashboardModel> {
		if (!dashboardFullName)
			throw 'dashboardFullName should be non-empty string.';

		return this.$q((resolve, reject) => {
			this.$izendaRsQuery.apiQuery('loadDashboardConfigNew', [dashboardFullName, updateFromSource]).then(json => {
				// validate query result
				if (!IzendaDashboardModel.isValidJson(json)) {
					reject(`Query "loadDashboardConfigNew" returned invalid result:${JSON.stringify(json)}`);
					return;
				}

				// extract share & schedule configs from json and create its models in the share and schedule services.
				this.$izendaScheduleService.setScheduleConfig(json.schedule);
				this.$izendaShareService.setShareConfig(json.share);
				const dashboardModel = IzendaDashboardModel.createInstance(false, json);
				resolve(dashboardModel);
			}, error => {
				reject(error);
			});
		});
	}

	/**
	 * (new!) Save dashboard.
	 * @param {any} json dashboard model.
	 */
	saveDashboardNew(json: any): angular.IPromise<any> {
		if (!json)
			throw new Error('Dashboard json is empty');
		const dashboardConfigParam = JSON.stringify(json);
		return this.$izendaRsQuery.apiQuery('saveReportSetNew', [dashboardConfigParam]);
	}

	/**
	 * Deserealize dashboard into CurrentReportSet.
	 * @param {any} json dashboard json
	 * @param {IzendaDashboardTileModel} tile
	 */
	syncTilesNew(json: any, tile?: IzendaDashboardTileModel) {
		const dashboardConfigParam = JSON.stringify(json);

		return this.$izendaRsQuery.apiQuery('syncDashboardNew',
			[dashboardConfigParam, tile && tile.reportFullName ? tile.reportFullName : '']);
	}

	/**
	 * Deserealize dashboard and return it's filters
	 * @param {json} dashboardConfig
	 */
	syncFiltersNew(dashboardConfig) {
		const dashboardConfigParam = JSON.stringify(dashboardConfig);

		return this.$izendaRsQuery.apiQuery('syncDashboardFiltersNew', [dashboardConfigParam]);
	}

	/**
	 * Load tile HTML
	 * @param {any} dashboardConfig
	 * @param {IzendaDashboardTileModel} tiles which preview is required
	 */
	loadTilesPreviewNew(dashboardConfig, tile, size) {
		if (!angular.isObject(tile))
			throw 'Argument exception: "tile" parameter should be object.';

		const dashboardConfigParam = JSON.stringify(dashboardConfig);

		return this.$izendaRsQuery.apiQuery('getDashboardTilePreviewNew',
			[dashboardConfigParam, tile.reportFullName, size.width, size.height]);
	}

	/**
	 * Send report via email
	 */
	sendReportViaEmailNew(dashboardConfig, type, to) {
		const dashboardConfigParam = JSON.stringify(dashboardConfig);

		return this.$izendaRsQuery.apiQuery('sendDashboardEmailNew', [dashboardConfigParam, type, to]);
	}

	/**
	 * Load refresh intevals configured in AdHocSettings.
	 */
	loadAutoRefreshIntervalsNew() {
		return this.$q(resolve => {
			this.$izendaRsQuery.apiQuery('autorefreshintervals', []).then(
				result => {
					resolve(result);
				},
				error => {
					const errorMessage =
						this.$izendaLocale.localeText('js_DashboardAutoRefreshError', 'Failed to get auto refresh intervals');
					this.$izendaUtilUiService.showErrorDialog(`${errorMessage}: ${error}`);
				});
		});
	}

	/**
	 * Load dashboard navigation
	 */
	loadDashboardNavigationNew() {
		return this.$izendaRsQuery.apiQuery('getDashboardCategoriesNew', []);
	}

	static get injectModules(): any[] {
		return ['$q', '$izendaSettings', '$izendaUtilUiService', '$izendaRsQuery', '$izendaLocale', '$izendaScheduleService',
			'$izendaShareService', '$izendaUrl'];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaDashboardQuery', DashboardQueryService.injectModules.concat(DashboardQueryService));
	}
}
