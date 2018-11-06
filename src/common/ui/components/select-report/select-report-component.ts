import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaCommonQueryService from 'common/query/services/common-query-service';

/**
 * Select report component definition
 */
@IzendaComponent(
	izendaUiModule,
	'izendaSelectReportComponent',
	['$timeout', '$izendaLocale', '$izendaUrl', '$izendaSettings', '$izendaCommonQuery'],
	{
		templateUrl: '###RS###extres=components.common.ui.components.select-report.select-report-template.html',
		bindings: {
			opened: '<',
			onSelected: '&',
			onModalClosed: '&'
		}
	})
export default class IzendaSelectReportComponent implements ng.IComponentController {
	private readonly uncategorizedText: string;
	// bindings
	opened: boolean;
	onSelected: (param: any) => void;
	onModalClosed: (param: any) => void;
	// other
	openedInner: boolean;
	category: string;
	categories: string[];
	groups: any[];
	isLoading: boolean;
	hideAll: boolean;

	constructor(
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaLocale: IzendaLocalizationService,
		private readonly $izendaUrl: IzendaUrlService,
		private readonly $izendaSettings: IzendaQuerySettingsService,
		private readonly $izendaCommonQuery: IzendaCommonQueryService) {

		this.uncategorizedText = this.$izendaLocale.localeText('js_Uncategorized', 'Uncategorized');
		this.reset();
	}

	$onChanges(changesObj) {
		if (!changesObj.opened)
			return;
		const currentOpened = changesObj.opened.currentValue;
		if (currentOpened) {
			this.reset();
			this.openedInner = true;
			// timeout is needed for the smoother modal animation
			this.$timeout(() => {
				this.hideAll = false;
				this.$izendaCommonQuery.getReportSetCategory(this.uncategorizedText).then(data => {
					const reportSets = data.ReportSets;
					this.addCategoriesToModal(reportSets);
					this.addReportsToModal(reportSets);
					this.isLoading = false;
				});
			}, 1000);
		}
	}

	/**
	 * Add report parts to modal
	 */
	addReportPartsToModal(reportParts: any[]) {
		this.groups = [];
		if (!reportParts || !reportParts.length)
			return;

		// add groups:
		let currentGroup = [];
		for (let i = 0; i < reportParts.length; i++) {
			if (i > 0 && i % 4 === 0) {
				this.groups.push(currentGroup);
				currentGroup = [];
			}
			const reportPart = reportParts[i];
			reportPart.isReportPart = true;
			currentGroup.push(reportPart);
		}
		this.groups.push(currentGroup);
	}

	/**
	 * Add reportset categories to modal select control.
	 */
	addCategoriesToModal(reportSets: any[]) {
		if (!reportSets)
			return;
		this.categories = reportSets
			.filter(report => !report.Dashboard)
			.map<string>(report => {
				const category = report.Category ? report.Category : this.uncategorizedText;
				return !report.Subcategory
					? category
					: category + this.$izendaSettings.getCategoryCharacter() + report.Subcategory;
			});
		// make categories unique
		this.categories = Array.from(new Set<string>(this.categories));
		if (!this.category)
			this.category = this.uncategorizedText;
	}

	/**
	 * Add report to modal dialog body.
	 */
	addReportsToModal(reportSets: any[]) {
		this.groups = [];
		let reportSetsToShow = [];

		if (reportSets && reportSets.length)
			reportSetsToShow = reportSets.filter(rs => !rs.Dashboard && rs.Name);
		if (!reportSetsToShow || !reportSetsToShow.length)
			return;

		// add groups:
		let currentGroup = [];
		this.groups.length = 0;
		for (let i = 0; i < reportSetsToShow.length; i++) {
			if (i > 0 && i % 4 === 0) {
				this.groups.push(currentGroup);
				currentGroup = [];
			}
			const reportSet = reportSetsToShow[i];
			reportSet.isReportPart = false;
			currentGroup.push(reportSet);
		}
		this.groups.push(currentGroup);
	}

	/**
	 * Select category handler
	 */
	categoryChangedHandler() {
		if (this.isLoading)
			return;
		this.isLoading = true;
		this.groups = [];
		if (!this.category)
			this.category = this.uncategorizedText;
		this.$izendaCommonQuery.getReportSetCategory(this.category).then(data => {
			this.addReportsToModal(data.ReportSets);
			this.isLoading = false;
		});
	}

	/**
	 * Modal closed handler
	 */
	modalClosedHandler() {
		if (angular.isFunction(this.onModalClosed))
			this.onModalClosed({});
	}

	/**
	 * User clicked to report set item
	 */
	itemSelectedHandler(item) {
		const isReportPart = item.isReportPart;
		let reportFullName = item.Name;

		if (item.CategoryFull)
			reportFullName = item.CategoryFull + this.$izendaSettings.getCategoryCharacter() + reportFullName;

		if (!isReportPart) {
			// if report set selected
			this.isLoading = true;
			this.groups = [];
			this.$izendaCommonQuery.getReportParts(reportFullName).then(data => {
				var reports = data.Reports;
				this.addReportPartsToModal(reports);
				this.isLoading = false;
			});
		} else {
			this.openedInner = false;
			// if report part selected
			if (angular.isFunction(this.onSelected))
				this.onSelected({ reportPartInfo: item });
		}
	}

	/**
	 * Reset form
	 */
	reset() {
		this.openedInner = false;
		this.category = this.uncategorizedText;
		this.categories = [];
		this.groups = [];
		this.isLoading = true;
		this.hideAll = true;
	}
}
