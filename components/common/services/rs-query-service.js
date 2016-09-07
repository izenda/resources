angular
	.module('izenda.common.query')
	.constant('izenda.common.query.cancellableQueries', [{
		wscmd: 'getReportDashboardConfig'
	}, {
		wscmd: 'updateandgetcrsreportpartpreview'
	}, {
		wscmd: 'getcrsreportpartpreview'
	}, {
		wscmd: 'getdashboardfiltersdata'
	}, {
		wscmd: 'getallfiltersdata'
	}, {
		wscmd: 'refreshcascadingfilters2'
	}]);

/**
* Izenda query service which provides access to rs.aspx
* this is singleton
*/
angular.module('izenda.common.query').factory('$izendaRsQuery', [
	'$window',
	'$rootScope',
	'$http',
	'$q',
	'$injector',
	'$log',
	'$izendaLocale',
	function ($window, $rootScope, $http, $q, $injector, $log, $izendaLocale) {
		'use strict';

		var urlSettings = $window.urlSettings$;

		var rsQueryBaseUrl = urlSettings.urlRsPage;

		var rsQueryLog = {};

		var requestList = [];

		/**
		* Remove request from array
		*/
		function removeRequest(url) {
			var foundIndex = -1;
			var i = 0;
			while (foundIndex < 0 && i < requestList.length) {
				if (requestList[i].url === url) {
					foundIndex = i;
				}
				i++;
			}
			if (foundIndex >= 0) {
				requestList.splice(foundIndex, 1);
			}
		}

		/**
		* Do query to custom url
		*/
		function customQuery(baseUrl, queryParams, options, errorOptions, invalidateInCacheParameter) {
			var isPost = angular.isObject(options) && options.method === 'POST';

			var postData = {};
			var url = baseUrl;
			if (!isPost) {
				// GET request url:
				url += '?';
				for (var paramName in queryParams) {
					if (queryParams.hasOwnProperty(paramName)) {
						url += paramName + '=' + encodeURIComponent(queryParams[paramName]) + '&';
					}
				}
				if (url.substring(url.length - 1) === '&') {
					url = url.substring(0, url.length - 1);
				}
				if (invalidateInCacheParameter)
					if (url.endsWith('?'))
						url += 'iic=1';
					else
						url += '&iic=1';
			} else {
				// POST request params string:
				var postParamsString = 'urlencoded=true';
				for (var paramName2 in queryParams) {
					if (queryParams.hasOwnProperty(paramName2)) {
						postParamsString += '&' + paramName2 + '=' + encodeURIComponent(queryParams[paramName2]);
					}
				}
				postData = {
					data: postParamsString
				};
				if (invalidateInCacheParameter)
					url += '?iic=1';
			}

			// create promises
			var canceler = $q.defer();
			var resolver = $q.defer();
			resolver.$izendaRsQueryCancelled = true;

			// apply query options
			resolver.errorOptions = angular.isObject(errorOptions) ? errorOptions : null;
			var dataType = angular.isDefined(options) && angular.isString(options.dataType)
				? options.dataType
				: 'text';
			var contentType = 'text/html';
			if (dataType === 'json')
				contentType = 'text/json';
			url = getAppendedUrl(url);
			var req = {
				method: 'GET',
				url: url,
				timeout: canceler.promise,
				headers: {
					'Content-Type': contentType
				}
			};
			if (angular.isObject(options)) {
				angular.extend(req, options);
			}
			angular.extend(req, postData); // it is empty for http GET requests

			// add request to list
			requestList.push({
				url: url,
				canceller: canceler,
				resolver: resolver
			});
			rsQueryLog[url] = new Date();
			// run query
			$http(req).then(function (response) {
				// handle success
				var currentUrl = response.config.url;
				$log.debug('<<< ' + ((new Date()).getTime() - rsQueryLog[currentUrl].getTime()) + 'ms: ' + currentUrl);
				removeRequest(currentUrl);
				if (typeof (response) == 'string') {
					resolver.resolve(response);
				} else {
					resolver.resolve(response.data);
				}
			}, function (response) {
				// handle error
				var config = response.config;
				var errorText;
				if (resolver.errorOptions != null) {
					errorText = resolver.errorOptions.handler.apply(response, resolver.errorOptions.params);
				} else if (response.message) {
					errorText = response.message;
				} else if (config) {
					errorText = $izendaLocale.localeText('js_QueryFailed', 'Query failed') + ': ' + config;
				} else {
					errorText = $izendaLocale.localeText('localeVariable', 'An unknown error occurred.');
				}
				if (resolver.$izendaRsQueryCancelled) {
					$rootScope.$broadcast('izendaShowNotificationEvent', [errorText, 'Error']);
					resolver.reject(errorText);
				}
			});
			return resolver.promise;
		}

		/**
		* Do query to RespornceServer
		*/
		function rsQuery(queryParams, options, errorOptions, invalidateInCacheParameter) {
			return customQuery(rsQueryBaseUrl, queryParams, options, errorOptions, invalidateInCacheParameter);
		}

		/**
		* Base query to RespornceServer with wscmd and wsargN parameters
		*/
		function query(wsCmd, wsArgs, options, errorOptions, invalidateInCacheParameter) {
			// prepare params:
			var params = {
				'wscmd': wsCmd
			};
			if (angular.isArray(wsArgs)) {
				for (var i = 0; i < wsArgs.length; i++) {
					var wsArg = wsArgs[i];
					if (angular.isDefined(wsArg) && wsArg != null) {
						params['wsarg' + i] = wsArg;
					} else {
						params['wsarg' + i] = '';
					}
				}
			} else {
				throw new Error('wsArgs: expected array, but got: ' + typeof (wsArgs));
			}

			// apply izendaPageId$
			if (typeof (window.izendaPageId$) !== 'undefined')
				params['izpid'] = window.izendaPageId$;
			if (typeof (window.angularPageId$) !== 'undefined')
				params['anpid'] = window.angularPageId$;

			// set default error options if it is not defined:
			var eOptions;
			if (angular.isUndefined(errorOptions)) {
				eOptions = {
					handler: function (wsCmd2, wsArgs2) {
						return 'Query: "' + wsCmd2 + '" [' + wsArgs2 + '] failed.';
					},
					params: [wsCmd, wsArgs]
				};
			} else {
				eOptions = errorOptions;
			}
			return rsQuery(params, options, eOptions, invalidateInCacheParameter);
		}

		/**
		* Cancel all running queries
		*/
		function cancelAllQueries(options) {
			var opts = options || {};

			// queries which we can cancel
			var cancellableQueries;
			if (opts.hasOwnProperty('cancelList')) {
				cancellableQueries = opts['cancelList'];
			} else {
				cancellableQueries = $injector.get('izenda.common.query.cancellableQueries');
			}

			var count = requestList.length;
			var i = 0;
			while (i < requestList.length) {
				var request = requestList[0];
				var cancel = false;
				if (angular.isArray(cancellableQueries)) {
					for (var j = 0; j < cancellableQueries.length; j++) {
						var cancelRule = cancellableQueries[j];
						if (angular.isString(cancelRule)) {
							cancel |= request.url.indexOf(cancelRule) >= 0;
						} else if (angular.isObject(cancelRule)) {
							if ('wscmd' in cancelRule) {
								cancel |= request.url.indexOf('wscmd=' + cancelRule['wscmd']) >= 0;
							}
						} else {
							throw 'Unknown cancel rule: ' + cancelRule;
						}
					}
				}

				if (cancel) {
					$log.debug('<<< (cancelled!) ' + ((new Date()).getTime() - rsQueryLog[request.url].getTime()) + 'ms: ' + request.url);
					request.canceller.resolve();
					request.resolver.$izendaRsQueryCancelled = false;
					requestList.splice(0, 1);
				} else {
					i++;
				}
			}
			return count - i;
		}

		// PUBLIC API:
		return {
			cancelAllQueries: cancelAllQueries,
			customQuery: customQuery,
			rsQuery: rsQuery,
			query: query
		};
	}]);
