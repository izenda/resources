izendaRequire.define([
	'angular',
	'../../common/query/services/rs-query-service'
], function (angular) {

	/**
	 * Instant report settings service.
	 */
	angular.module('izendaInstantReport').factory('$izendaInstantReportSettings', [
		'$izendaRsQuery',
	function ($izendaRsQuery) {

		var settingsObject = null;

		/**
		 * Get instant report settings from server.
		 */
		function getInstantReportSettings() {
			return $izendaRsQuery.query('getInstantReportSettings', [], {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get instant report settings';
				},
				params: []
			});
		};

		/**
		 * Load settings and set settingsObject
		 */
		function initialize() {
			getInstantReportSettings().then(function (resultObject) {
				settingsObject = resultObject;
			});
		}

		/**
		 * Settings getter
		 */
		var getSettings = function () {
			return settingsObject;
		};

		// initialize service
		initialize();

		// public api
		return {
			getInstantReportSettings: getInstantReportSettings,
			getSettings: getSettings
		};
	}]);

});
