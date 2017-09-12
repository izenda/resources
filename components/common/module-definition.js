/**
 * requirejs module, which creates angular modules.
 * returns 'loadSettings' function, which could load settings for this module.
 */
izendaRequire.define(['angular'], function (angular) {
	'use strict';
	
	// common UI module definition:
	angular
		.module('izenda.common.ui', ['izenda.common.core', 'izenda.common.query'])
		.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_Name', 'Name'])
		.value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
		.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);

	// public API
	return {
		loadSettings: function () {
			var deferredObject = angular.element.Deferred();
			var urlSettings = window.urlSettings$;
			var rsPageUrl = urlSettings.urlRsPage;
			var settingsUrl = rsPageUrl + '?wscmd=getCommonSettings';
			// load common settings:
			angular.element.get(settingsUrl, function (configJson, resultStatus, xhr) {
				var configObject = configJson;
				angular
					.module('izenda.common.query')
					.constant('$izendaCommonSettings', configObject);
				deferredObject.resolve();
			});
			return deferredObject.promise();
		}
	};
});
