import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaPingService from 'common/query/services/ping-service';

export class IzendaLocationModel {
	fullName: string = null;
	category: string = null;
	name: string = null;
	isNew: boolean = false;

	static fromJson(json: any): IzendaLocationModel {
		const location = new IzendaLocationModel();
		location.fullName = json.fullName || null;
		location.category = json.category || null;
		location.name = json.name || null;
		location.isNew = !!json.isNew;
		return location;
	}
}

export default class IzendaUrlService {

	settings: any; // url settings.
	reportNameInfo: IzendaLocationModel;
	location: any; // current location (rx.BehaviorSubject object)

	static get injectModules(): any[] {
		return ['rx',
			'$window',
			'$izendaSettingsService',
			'$izendaPingService',
			'$izendaUtilService'];
	}

	constructor(
		private readonly rx: any,
		private readonly $window: ng.IWindowService,
		private readonly $izendaSettingsService: IzendaQuerySettingsService,
		private readonly $izendaPingService: IzendaPingService,
		private readonly $izendaUtilService: IzendaUtilService) {

		this.settings = $window.urlSettings$;
		this.reportNameInfo = this.getLocation();
		this.location = new this.rx.BehaviorSubject(this.reportNameInfo);
		// subscribe on location change:
		window.onpopstate = event => {
			if (event.state && (event.state.rn || event.state.new)) {
				this.locationChangedHandler();
			}
		}
		// start ping
		this.$izendaPingService.startPing();
	}

	/**
	 * Set report name and category to location
	 * @param {IzendaLocationModel} locationInfo location object
	 */
	setLocation(locationInfo: IzendaLocationModel) {
		if (!angular.isObject(locationInfo))
			throw new Error('"locationInfo" parameter should be object');

		// if is new
		if (locationInfo.isNew) {
			this.setUrl({ isNew: '1' }, { new: true });
			this.locationChangedHandler();
			return;
		}

		// navigate to existing report
		this.setUrl({ rn: locationInfo.fullName.replaceAll(' ', '+') }, { rn: locationInfo.fullName });
		this.locationChangedHandler();
	}

	/**
	 * Change url if possible, otherwise reload the page with new url.
	 * @param {any} params - url params object.
	 * @param {any} additionalParams - additional params for pushState.
	 */
	setUrl(params: any, additionalParams: any) {
		const previousUrlParams = this.getUrlParams(window.location.href);

		const isRnOldExist = angular.isString(previousUrlParams.rn);
		const isRnNewExist = angular.isString(params.rn) && params.rn !== '';

		const rnOld = isRnOldExist ? 'rn=' + previousUrlParams.rn.replaceAll(' ', '+') : '';
		const rnNew = isRnNewExist ? 'rn=' + params.rn.replaceAll(' ', '+') : '';

		const isNewOldExist = angular.isString(previousUrlParams.isNew);
		const isNewNewExist = angular.isString(params.isNew);

		if (isRnOldExist && isRnNewExist && rnOld === rnNew)
			// same rn
			return;
		if (isNewOldExist && isNewNewExist)
			// same isNew
			return;
		if (isRnNewExist && isNewNewExist)
			throw 'Incorrect params: both "rn" and "isNew" defined.';

		const newPath = window.location.pathname;
		let newParams = window.location.search ? window.location.search : '?';

		if (isNewNewExist) {
			// go to new report
			// remove rn
			newParams = newParams.replaceAll(rnOld, '');
			newParams += (newParams.endsWith('?') ? '' : '&') + 'isNew=1';
		} else if (isRnNewExist) {
			// go to existing report
			// remove isNew
			newParams = newParams.replaceAll('isNew=1', '');
			if (isRnOldExist)
				newParams = newParams.replaceAll(rnOld, rnNew);
			else
				newParams += (newParams.endsWith('?') ? '' : '&') + rnNew;
		}
		newParams = newParams.replaceAll('?&', '?');
		newParams = newParams.replaceAll('&&', '&');

		// navigate new url
		const newUrl = newPath + newParams;
		if (this.$window.history && this.$window.history.pushState) {
			this.$window.history.pushState(additionalParams, document.title, newUrl);
		} else
			window.location.href = newUrl;
	}

	/**
	 * Returns report full name (category delimiter: $izendaSettingsService.getCategoryCharacter())
	 * @return {IzendaLocationModel} current location model.
	 */
	getLocation(): IzendaLocationModel {
		this.settings = new UrlSettings(); // retrieve current url settings
		const reportInfo = this.settings.reportInfo;

		// existing report
		if (reportInfo.fullName)
			return IzendaLocationModel.fromJson(reportInfo);

		// isNew
		const result = new IzendaLocationModel();
		result.isNew = reportInfo.isNew;
		return result;
	};

	/**
	 * Set report name and category to location.
	 * @param {string} fullName Report full name.
	 */
	setReportFullName(fullName: string) {
		this.setLocation({
			fullName: fullName,
			name: this.extractReportName(fullName),
			category: this.extractReportCategory(fullName),
			isNew: false
		});
	};

	/**
	 * Go to "new"
	 */
	setIsNew() {
		this.setLocation({
			fullName: null,
			name: null,
			category: null,
			isNew: true
		});
	};

	/**
	 * Handler, which reacts on page load and $location change.
	 */
	locationChangedHandler() {
		// update url settings object because url has changed
		this.settings = new UrlSettings();

		// cancel all current queries
		//const countCancelled = this.$izendaRsQueryService.cancelAllQueries();
		//if (countCancelled > 0)
		//	this.$log.debug(`>>> Cancelled ${countCancelled} queries`);

		// set current report set if location has changed
		const newLocationModel = this.getLocation();
		if (newLocationModel.fullName !== this.reportNameInfo.fullName || newLocationModel.isNew !== this.reportNameInfo.isNew) {
			this.reportNameInfo = newLocationModel;
			this.location.onNext(this.reportNameInfo);
		}
	};

	/**
	 * Create filter parameters url part using current filterParameters from UrlSettings object.
	 * @return {string} Url parameters string: '&p1=v1&p2=v2...&pN=vN'.
	 */
	getFilterParamsString(): string {
		let requestString = '';
		if (this.settings.filterParameters.length > 0) {
			for (let i = 0; i < this.settings.filterParameters.length; i++) {
				const paramObject = this.settings.filterParameters[i];
				requestString += `&${paramObject[0]}=${encodeURIComponent(paramObject[1])}`;
			}
		}
		return requestString;
	}

	/**
	 * Extract report name from category\report full name
	 * @param {string} fullName Report full name.
	 * @return {string} report name without category.
	 */
	extractReportName(fullName: string): string {
		if (!angular.isString(fullName) || fullName === '')
			throw `Can't extract report name from object "${JSON.stringify(fullName)}" with type ${typeof (fullName)}`;
		const parts = fullName.split(this.$izendaSettingsService.getCategoryCharacter());
		return parts[parts.length - 1];
	}

	/**
	 * Extract report category from "category\report full name
	 * @param {string} fullName Report full name.
	 * @return {string} report category.
	 */
	extractReportCategory(fullName: string): string {
		if (!angular.isString(fullName) || fullName === '')
			throw `Can't extract report category from object "${JSON.stringify(fullName)}" with type ${typeof (fullName)}`;

		const reportFullNameParts = fullName.split(this.$izendaSettingsService.getCategoryCharacter());
		let category: string;
		if (reportFullNameParts.length >= 2)
			category = reportFullNameParts.slice(0, reportFullNameParts.length - 1).join(this.$izendaSettingsService.getCategoryCharacter());
		else
			category = this.$izendaUtilService.getUncategorized();
		return category;
	};

	/**
	 * Extract report name, category, report set name for report part.
	 * @param {string} fullName Report full name.
	 * @return {any} report parts object.
	 */
	extractReportPartNames(fullName: string, isPartNameAtRight: boolean): any {
		if (!angular.isString(fullName) || fullName === '')
			throw `Can't extract report part name from object "${JSON.stringify(fullName)}" with type ${typeof (fullName)}`;

		const result = {
			reportPartName: null,
			reportFullName: fullName,
			reportSetName: null,
			reportName: null,
			reportCategory: null,
			reportNameWithCategory: null
		};
		// extract report part name
		let reportSetName = fullName;
		if (fullName.indexOf('@') >= 0) {
			const parts = fullName.split('@');
			if (!angular.isUndefined(isPartNameAtRight) && isPartNameAtRight) {
				[reportSetName, result.reportPartName] = parts;
			} else {
				[result.reportPartName, reportSetName] = parts;
			}
		}
		// collect results into one object:
		result.reportSetName = reportSetName;
		result.reportName = this.extractReportName(reportSetName);
		result.reportCategory = this.extractReportCategory(reportSetName);
		result.reportNameWithCategory = result.reportName;
		if (this.$izendaUtilService.isUncategorized(result.reportCategory))
			result.reportNameWithCategory =
				result.reportCategory + this.$izendaSettingsService.getCategoryCharacter() + result.reportNameWithCategory;
		result.reportFullName = (result.reportPartName != null ? result.reportPartName + '@' : '') + result.reportSetName;
		return result;
	}

	/**
	 * Get current report info object.
	 */
	getReportInfo(): IzendaLocationModel {
		return this.reportNameInfo;
	}

	private getUrlParams(url) {
		const urlObj = (typeof (angular.element['url']) === 'undefined') ? window.purl(url) : angular.element['url'](url);
		return urlObj.data.param.query;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaUrlService', IzendaUrlService.injectModules.concat(IzendaUrlService));
	}
}
