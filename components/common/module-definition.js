// common compatibility module definition
angular.module('izenda.common.compatibility', []);

// common Query module definition
angular
	.module('izenda.common.query', [])
	.config(["$httpProvider", function ($httpProvider) {
		$httpProvider.defaults.transformResponse.push(function (responseData) {
			// convert $http response. We need to translate asp.net dates 
			// in string format '/Date(ticksNumber)/' to js Date objects (only for json response type):
			var regexDate = /^\/Date\(([-]{0,1}\d+)\)\/$/;
			var convertDateStringsToDates = function (input) {
				if (!angular.isObject(input))
					return;
				for (var key in input) {
					if (!input.hasOwnProperty(key)) continue;
					var value = input[key];
					if (angular.isString(value)) {
						var match = value.match(regexDate);
						if (angular.isArray(match) && match.length > 0) {
							var milliseconds = parseInt(match[match.length - 1]);
							if (!isNaN(milliseconds)) {
								input[key] = new Date(milliseconds);
							}
						}
					} else if (angular.isObject(value)) {
						convertDateStringsToDates(value);
					}
				}
			};
			convertDateStringsToDates(responseData);
			return responseData;
		});
	}]);

// common UI module definition:
angular
	.module('izenda.common.ui', ['izenda.common.compatibility', 'izenda.common.query'])
	.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_Name', 'Name'])
	.value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
	.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);

/**
 * Common module settings loader.
 */
function izendaCommonQuerySettingsLoader() {
	this.loadSettings = function () {
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
	};
}
