izendaRequire.define([
	'angular',
	'../module-definition',
	'../directives/utility' // almost all "izendaLocale" directives uses with "bindOnce"
], function (angular) {

	/**
	 * Localization service. Gets localized strings from the "IzLocal" object.
	 */
	angular.module('izenda.common.core').service('$izendaLocale', [
		function () {
			'use strict';

			/**
			 * Get localized text.
			 * @param {string} key. Locale string key (defined in resources.aspx)
			 * @param {string} defaultValue. Default value, when locale text couldn't be got
			 * @returns {string} localized text.
			 */
			this.localeText = function (key, defaultValue) {
				var result = IzLocal.Res(key, defaultValue);
				return result;
			};

			/**
			 * Apply locale string in format "...{0}...{1}..." and apply instead of '{n}' params[n]
			 * @param {string} locale text key. This key contains in resources.
			 * @param {strong} defaultValue. Default value if locale resource wasn't found.
			 * @param {Array} params. Additional params.
			 * @returns {string}. Localized text. 
			 */
			this.localeTextWithParams = function (key, defaultValue, params) {
				var result = this.localeText(key, defaultValue);
				if (angular.isArray(params)) {
					angular.element.each(params, function (iParamValue, paramValue) {
						result = result.replaceAll('{' + iParamValue + '}', paramValue);
					});
				}
				return result;
			};
			IzLocal.LocalizePage();
		}]);

	/**
	 * Filter to apply locale in html templates
	 */
	angular.module('izenda.common.core').filter('izendaLocale', [
		'$izendaLocale', function ($izendaLocale, defaultValue) {
			return function (text, defaultValue) {
				var defaultVal = angular.isString(defaultValue) ? defaultValue : '';
				return $izendaLocale.localeText(text, defaultVal);
			};
		}
	]);

});