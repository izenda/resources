import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaRsQueryService from 'common/query/services/rs-query-service';

/**
 * This service provides API query methods.
 */
export default class IzendaCommonQueryService {

	constructor(
		private readonly $izendaRsQuery: IzendaRsQueryService,
		private readonly $izendaLocale: IzendaLocalizationService) { }

	/**
	 * Used for refresh session timeout
	 */
	ping(): angular.IPromise<number> {
		return this.$izendaRsQuery.query('ping', [], { dataType: 'text' });
	}

	/**
	 * Create new dashboard report set and set it as CurrentReportSet
	 */
	newDashboard(): angular.IPromise<any> {
		return this.$izendaRsQuery.query('newcrs', ['DashboardDesigner'], { dataType: 'json' }, {
			handler: () => this.$izendaLocale.localeText('js_DashboardCreateError', 'Failed to create new dashboard'),
			params: []
		});
	}

	/**
	 * Check report set is exist. Returns promise with 'true' value if exists
	 * @param {string} reportSetFullName Report set full name for check.
	 */
	checkReportSetExist(reportSetFullName: string): angular.IPromise<any> {
		if (!angular.isString(reportSetFullName) || reportSetFullName.trim() === '')
			throw new Error('reportSetFullName should be non empty string');

		const errorText = this.$izendaLocale.localeText('js_DashboardCheckExistError', 'Failed to check dashboard exist');
		return this.$izendaRsQuery.query('checkreportsetexists', [reportSetFullName], { dataType: 'text' }, {
			handler: name => `${errorText}: ${name}`,
			params: [reportSetFullName]
		});
	}

	/**
	 * Set AdHocContext current report set
	 * @param {string} reportSetFullName Report set full name for check.
	 */
	setCrs(reportSetFullName: string): angular.IPromise<any> {
		const errorText = this.$izendaLocale.localeText('js_SetCrsError', 'Failed to set current report set');
		return this.$izendaRsQuery.query('setcurrentreportset', [reportSetFullName], { dataType: 'text' }, {
			handler: name => `${errorText}: ${name}`,
			params: [reportSetFullName]
		});
	}

	/**
	 * Get report list by category
	 * @param {string} category category name.
	 */
	getReportSetCategory(category: string): angular.IPromise<any> {
		var categoryStr = angular.isDefined(category)
			? (category.toLowerCase() === this.$izendaLocale.localeText('js_Uncategorized', 'Uncategorized').toLowerCase()
				? ''
				: category)
			: '';
		const errorText = this.$izendaLocale.localeText('js_GetCategoryError', 'Failed to get reports for category');
		return this.$izendaRsQuery.query('reportlistdatalite', [categoryStr], { dataType: 'json' }, {
			handler: name => `${errorText}: ${name}`,
			params: [category]
		});
	}

	/**
	 * Get report parts
	 * @param {string} reportFullName Report full name (xxx@aaa\bbb).
	 */
	getReportParts(reportFullName: string): angular.IPromise<any> {
		const errorText = this.$izendaLocale.localeText('js_ReportPartsError', 'Failed to get report parts for report');
		return this.$izendaRsQuery.query('reportdata', [reportFullName], { dataType: 'json' }, {
			handler: name => `${errorText}: ${name}`,
			params: [reportFullName]
		});
	}

	/**
	 * Get data which needed for schedule
	 * @param {number} clientTimezoneOffset Default timezone.
	 */
	getScheduleData(clientTimezoneOffset: number): angular.IPromise<any> {
		return this.$izendaRsQuery.query('getCrsSchedule', [String(clientTimezoneOffset)], { dataType: 'json' }, {
			handler: () => 'Failed to get schedule data',
			params: []
		});
	}

	/**
	 * Get data which needed for schedule
	 * @param {boolean} defaultShareConfig If true - share config will get from new empty reportset, false - from current report set.
	 */
	getShareData(defaultShareConfig?: boolean): angular.IPromise<any> {
		return this.$izendaRsQuery.query('getCrsShare', [defaultShareConfig ? 'true' : 'false'], { dataType: 'json' }, {
			handler: () => 'Failed to get share data',
			params: []
		});
	}

	static get injectModules(): any[] {
		return ['$izendaRsQuery', '$izendaLocale'];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaCommonQuery', IzendaCommonQueryService.injectModules.concat(IzendaCommonQueryService));
	}
}
