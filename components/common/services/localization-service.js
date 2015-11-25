/**
 * Default locale
 */
angular.module('izendaQuery').value('$izendaLocalizedTexts', {
	'close': 'Close',
	'cancel': 'Cancel',
	'ok': 'OK',
	'schedule.title': 'Schedule',
	'schedule.date': 'Date',
	'schedule.time': 'Time',
	'schedule.timezone': 'Timezone',
	'schedule.repeat': 'Repeat',
	'schedule.email': 'Send Email As',
	'schedule.recepients': 'Recepients'
});

/**
 * Localization service
 */
angular.module('izendaQuery').service('$izendaLocale', [
	function () {
		'use strict';

		/**
		 * Get localized text
		 */
		this.localeText = function (key, defaultValue) {
			var result = IzLocal.Res(key, defaultValue);
			return result;
		};
	}]);

/**
 * Filter to apply locale in html templates
 */
angular.module('izendaQuery').filter('izendaLocale', [
	'$izendaLocale', function ($izendaLocale, defaultValue) {	
		return function (text, defaultValue) {
			var defaultVal = angular.isString(defaultValue) ? defaultValue : '';
			return $izendaLocale.localeText(text, defaultVal);
		};
	}
]);
