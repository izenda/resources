import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaLocalizationService from 'common/core/services/localization-service';

/**
 * Utility service. Provides the utility functions.
 */
export default class IzendaUtilService {

	static get injectModules(): any[] {
		return ['$izendaLocaleService'];
	}

	constructor(private readonly $izendaLocaleService: IzendaLocalizationService) { }

	/**
	 * Create human readable variable name version
	 * @param {string} text Text
	 */
	humanizeVariableName(text: string): string {
		if (!angular.isString(text))
			return text;
		const result = text
			// insert a space between lower & upper
			.replace(/([a-z])([A-Z\d])/g, '$1 $2')
			// space before last upper in a sequence followed by lower
			.replace(/\b([A-Z\d]+)([A-Z\d])([a-z])/, '$1 $2$3')
			// uppercase the first character
			.replace(/^./, txt => txt.toUpperCase());
		return result;
	}

	/**
	 * "Uncategorized" category localized name getter.
	 */
	get uncategorized(): string {
		return this.$izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
	}

	/**
	 * Get "Uncategorized" category localized name.
	 */
	getUncategorized(): string {
		return this.uncategorized;
	}

	/**
	 * Check whether "uncategorized" category or not.
	 */
	isUncategorized(category: string): boolean {
		if (!category || !angular.isString(category))
			return true;
		return category.toLowerCase() === this.uncategorized.toLowerCase();
	}

	/**
	 * Check whether categories equal or not.
	 * @param {string} cat1 Category name.
	 * @param {string} cat2 Category name.
	 */
	isCategoriesEqual(cat1: string, cat2: string): boolean {
		return (this.isUncategorized(cat1) && this.isUncategorized(cat2)) || cat1 === cat2;
	}

	/**
	 * Generate report full name
	 * @param {string} reportName report name.
	 * @param {string} separator directories separator symbol.
	 * @param {string} category report category (optional).
	 * @return {string} generated report full name.
	 */
	createReportFullName(reportName: string, separator: string, category?: string): string {
		if (!reportName || reportName.trim() === '')
			throw new Error('Empty "reportName" parameter isn\'t allowed.');
		return this.isUncategorized(category)
			? reportName
			: category + separator + reportName;
	}

	/**
	 * Convert options which have got from server using "GetOptionsByPath" query into 
	 * one dimentional array, which allow to use it as <option>
	 */
	convertOptionsByPath(optionGroups: any[]): any[] {
		if (!angular.isArray(optionGroups))
			return [];

		const groups = [];
		optionGroups.forEach(group => {
			group.options.forEach(option => {
				option.group = angular.isString(group.name) && group.name !== ''
					? group.name
					: undefined;
				groups.push(option);
			});
		});
		return groups;
	}

	/**
	 * Get option by value from array of objects with "value" property (case insensitive): 
	 * [{value:'text1',...}, {value:'text2', ...}, ...]
	 */
	getOptionByValue(options: any[], value: string, isLowerCaseComparison?: boolean) {
		let i = 0;
		if (!angular.isArray(options) || !options.length)
			return null;
		while (i < options.length) {
			const option: any = options[i];
			if (!isLowerCaseComparison && option.value === value)
				return option;
			if (isLowerCaseComparison && option.value.toLowerCase() === value.toLowerCase())
				return option;
			i++;
		}
		return null;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaUtilService', IzendaUtilService.injectModules.concat(IzendaUtilService));
	}
}
