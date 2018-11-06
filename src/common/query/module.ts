import * as angular from 'angular';
import izendaQueryModule from 'common/query/module-definition';
import IzendaRsQueryService from 'common/query/services/rs-query-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaCommonQueryService from 'common/query/services/common-query-service';
import IzendaPingService from 'common/query/services/ping-service';
import IzendaUrlService from 'common/query/services/url-service';

// register http provider
izendaQueryModule.config(['$httpProvider', $httpProvider => {
	$httpProvider.defaults.transformResponse.push(responseData => {
		// convert $http response. We need to translate asp.net dates 
		// in string format '/Date(ticksNumber)/' to js Date objects (only for json response type):
		var regexDate = /^\/Date\(([-]{0,1}\d+)\)\/$/;
		var convertDateStringsToDates = input => {
			if (!angular.isObject(input))
				return;
			for (let key in input) {
				if (!input.hasOwnProperty(key)) continue;
				const value = input[key];
				if (angular.isString(value)) {
					const match = value.match(regexDate);
					if (angular.isArray(match) && match.length > 0) {
						const milliseconds = parseInt(match[match.length - 1]);
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

// register services
IzendaRsQueryService.register(izendaQueryModule);
IzendaQuerySettingsService.register(izendaQueryModule);
IzendaCommonQueryService.register(izendaQueryModule);
IzendaPingService.register(izendaQueryModule);
IzendaUrlService.register(izendaQueryModule);
