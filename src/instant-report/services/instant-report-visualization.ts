import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaInstantReportQueryService from 'instant-report/services/instant-report-query';

/**
 * Instant report chart service. Contains charts data and its functions.
 */
export default class IzendaInstantReportVisualizationService {

	visConfig: any;

	static get injectModules(): any[] {
		return ['$q', '$izendaInstantReportQueryService'];
	}

	constructor(private readonly $q: ng.IQService,
		private readonly $izendaInstantReportQueryService: IzendaInstantReportQueryService) {
		this.visConfig = this.createDefaultConfig();
	}

	/**
	 * Create default config object
	 */
	createDefaultConfig() {
		return {
			categories: []
		};
	}

	/**
	 * Get current config.
	 */
	getVisualizationConfig() {
		return this.visConfig;
	}

	/**
	 * Load visualizations. Designed as async operation for future async config loading.
	 * @returns {promise object}.
	 */
	loadVisualizations() {
		this.visConfig = this.createDefaultConfig();

		return this.$q(resolve => {
			// run query:
			this.$izendaInstantReportQueryService.getVisualizationConfig().then(config => {
				if (!angular.isObject(config) || !angular.isArray(config.categories)) {
					resolve();
					return;
				}
				// set config:
				this.visConfig = config;

				// add category name to each visualization object:
				this.visConfig.categories
					.filter(c => !!c.charts)
					.forEach(c => c.charts.forEach(chart => chart.categoryName = c.name));
				resolve();
			});
		});
	}

	/**
	 * Find visualization object by given name and category.
	 * @param {string} category.
	 * @param {string} name.
	 * @returns {object} visualization object.
	 */
	findVisualization(category, name) {
		var result = null;
		this.visConfig.categories
			.filter(c => c.name === category)
			.forEach(c => {
				const charts = c.charts.filter(ch => ch.name === name);
				if (charts && charts.length)
					result = charts[0];
			});
		return result;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaInstantReportVisualizationService',
			IzendaInstantReportVisualizationService.injectModules.concat(IzendaInstantReportVisualizationService));
	}
}
