import * as angular from 'angular';
import 'izenda-external-libs';

/**
 * Localization service. Gets localized strings from the "IzLocal" object.
 */
export default class IzendaLocalizationService {

	constructor() {
		IzLocal.LocalizePage();
	}

	/**
	 * Get localized text.
	 * @param {string} key. Locale string key (defined in resources.aspx)
	 * @param {string} defaultValue. Default value, when locale text couldn't be got
	 * @returns {string} localized text.
	 */
	localeText(key: string, defaultValue: string): string {
		const defaultText = angular.isString(defaultValue) ? defaultValue : '';
		return IzLocal.Res(key, defaultText);
	}

	/**
	 * Apply locale string in format "...{0}...{1}..." and apply instead of '{n}' params[n]
	 * @param {string} locale text key. This key contains in resources.
	 * @param {strong} defaultValue. Default value if locale resource wasn't found.
	 * @param {Array} params. Additional params.
	 * @returns {string}. Localized text. 
	 */
	localeTextWithParams(key: string, defaultValue: string, params: string[]): string {
		let result = this.localeText(key, defaultValue);
		if (angular.isArray(params))
			params.forEach((param, iParam) =>
				result = result.replaceAll(`{${iParam}}`, param));
		return result;
	}

	static get injectModules(): any[] {
		return [];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaLocale', IzendaLocalizationService.injectModules.concat(IzendaLocalizationService));
		/**
		 * Filter which is used for the applying localization.
		 * Sample usage: <div ng-bind=":: 'js_close' | izendaLocale: 'Close'" /> where 'Close' - "defaultValue" parameter value.
		 */
		module.filter('izendaLocale', [
			'$izendaLocale',
			($izendaLocale: IzendaLocalizationService) => {
				return (text: string, defaultValue: string) => $izendaLocale.localeText(text, defaultValue);
			}
		]);
	}
}
