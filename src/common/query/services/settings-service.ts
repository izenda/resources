import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaUtilService from 'common/core/services/util-service';
import { IIzendaCommonSettings } from 'common/common-module-definition';

export class DateTimeFormat {
	constructor(
		public longDate: string,
		public longTime: string,
		public shortDate: string,
		public shortTime: string,
		public timeFormatForInnerIzendaProcessing: string, // this time format used in method DateLocToUs for saving filters.
		public showTimeInFilterPickers: boolean,
		public defaultFilterDateFormat: string) {
	}
}

export default class IzendaQuerySettingsService {

	readonly defaultDateFormat: DateTimeFormat;
	readonly dateFormat: DateTimeFormat;
	readonly culture: string;
	readonly bulkCsv: boolean;
	readonly categoryCharacter: string;

	static get injectModules(): any[] {
		return ['$izendaUtilService', '$izendaCommonSettings'];
	}

	constructor(
		private readonly $izendaUtilService: IzendaUtilService,
		private readonly $izendaCommonSettings: IIzendaCommonSettings) {

		// initialize formats
		this.defaultDateFormat = new DateTimeFormat(
			'dddd, MMMM DD, YYYY',
			'h:mm:ss A',
			'MM/DD/YYYY',
			'h:mm A',
			'HH:mm:ss',
			false,
			'MM/DD/YYYY' + ($izendaCommonSettings.showTimeInFilterPickers ? ' HH:mm:ss' : ''));
		const format = this.defaultDateFormat;
		this.dateFormat = new DateTimeFormat(format.longDate, format.longTime, format.shortDate,
			format.shortTime, format.timeFormatForInnerIzendaProcessing, format.showTimeInFilterPickers, '');
		this.dateFormat.longDate = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.dateFormatLong);
		this.dateFormat.longTime = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.timeFormatLong);
		this.dateFormat.shortDate = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.dateFormatShort);
		this.dateFormat.shortTime = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.timeFormatShort);
		this.dateFormat.showTimeInFilterPickers = $izendaCommonSettings.showTimeInFilterPickers;
		this.dateFormat.defaultFilterDateFormat = this.dateFormat.shortDate +
			($izendaCommonSettings.showTimeInFilterPickers ? ` ${this.dateFormat.longTime}` : '');

		// culture
		this.culture = $izendaCommonSettings.culture;
		if (this.culture.indexOf('-') > 0)
			this.culture = this.culture.substring(0, this.culture.indexOf('-'));

		// bulk csv
		this.bulkCsv = false;
		if (typeof $izendaCommonSettings.bulkCsv != 'undefined')
			this.bulkCsv = $izendaCommonSettings.bulkCsv;

		// category character
		this.categoryCharacter = '\\';
		if (typeof $izendaCommonSettings.categoryCharacter != 'undefined')
			this.categoryCharacter = $izendaCommonSettings.categoryCharacter;
	}

	/**
	 * Default date formats
	 * @returns {DateTimeFormat} 
	 */
	getDefaultDateFormat(): DateTimeFormat {
		return this.defaultDateFormat;
	}

	/**
	 * Default format string (en-US). This format used for sending dates to the server.
	 * @param {string} customDateFormatString. Alternative date format if required.
	 */
	getDefaultDateFormatString(customDateFormatString?: string): string {
		const showTime = this.$izendaCommonSettings.showTimeInFilterPickers;
		const timeFormatString = showTime ? ' ' + this.defaultDateFormat.timeFormatForInnerIzendaProcessing : '';
		let dateFormatString = this.defaultDateFormat.shortDate;
		if (angular.isString(customDateFormatString) && customDateFormatString.trim() !== '') {
			dateFormatString = customDateFormatString;
		}
		return dateFormatString + timeFormatString;
	}

	/**
	 * Convert .net date time format string to momentjs format string.
	 * @param {string} format .net format string
	 * @returns {string} momentjs format string
	 */
	convertDotNetTimeFormatToMoment(format: string): string {
		const converter = izenda.utils.date.formatConverter;
		return converter.convert(format, converter.dotNet, converter.momentJs);
	}

	/**
	* Get common settings
	*/
	getCommonSettings(): any {
		return this.$izendaCommonSettings;
	}

	/**
	 * Get date format.
	 */
	getDateFormat(): DateTimeFormat {
		return this.dateFormat;
	}

	/**
	 * Get current page culture.
	 */
	getCulture(): string {
		return this.culture;
	}

	/**
	 * Get "bulk csv" CSV export mode enabled.
	 */
	getBulkCsv(): boolean {
		return this.bulkCsv;
	}

	getCategoryCharacter(): string {
		return this.categoryCharacter;
	}

	getReportFullName(reportName: string, reportCategory?: string): string {
		let result = null;
		if (reportName) {
			result = '';
			if (!this.$izendaUtilService.isUncategorized(reportCategory))
				result = reportCategory + this.getCategoryCharacter();
			result += reportName;
		}
		return result;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaSettingsService',
			IzendaQuerySettingsService.injectModules.concat(IzendaQuerySettingsService));
	}
}
