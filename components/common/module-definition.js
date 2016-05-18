angular.module('izendaCompatibility', []);

angular
	.module('izendaQuery', [])
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

angular.module('izendaCommonControls', ['izendaCompatibility', 'izendaQuery']);
angular.module('izendaCommonControls').value('reportNameInputPlaceholderText', ['js_Name', 'Name']);

angular.module('izenda.common.ui', []);
