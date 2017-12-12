izendaRequire.define([
	'angular',
	'../module-definition',
	'../../core/services/localization-service',
	'../../core/services/util-ui-service'
], function (angular) {

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
		'$izendaUtilUiService',
		function ($window, $rootScope, $http, $q, $injector, $log, $izendaLocale, $izendaUtilUiService) {
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
				var _queryParams = angular.extend({}, queryParams);
				// apply izendaPageId$
				if (typeof (window.izendaPageId$) !== 'undefined')
					_queryParams['izpid'] = window.izendaPageId$;
				if (typeof (window.angularPageId$) !== 'undefined')
					_queryParams['anpid'] = window.angularPageId$;

				var isPost = angular.isObject(options) && options.method === 'POST';

				var postData = {};
				var url = baseUrl;
				if (!isPost) {
					// GET request url:
					url += '?';
					for (var paramName in _queryParams) {
						if (_queryParams.hasOwnProperty(paramName)) {
							url += paramName + '=' + encodeURIComponent(_queryParams[paramName]) + '&';
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
					for (var paramName2 in _queryParams) {
						if (_queryParams.hasOwnProperty(paramName2)) {
							postParamsString += '&' + paramName2 + '=' + encodeURIComponent(_queryParams[paramName2]);
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
					resolver.resolve(angular.isString(response) ? response : response.data);
				}, function (response) {
					// handle error
					var needToReject = true;
					var config = response.config;
					var errorText;
					if (resolver.errorOptions != null) {
						needToReject = false;
						errorText = resolver.errorOptions.handler.apply(response, resolver.errorOptions.params);
					} else if (response.message) {
						errorText = response.message;
					} else if (config) {
						errorText = $izendaLocale.localeText('js_QueryFailed', 'Query failed') + ': ' + config;
					} else {
						errorText = $izendaLocale.localeText('localeVariable', 'An unknown error occurred.');
					}
					if (resolver.$izendaRsQueryCancelled) {
						$izendaUtilUiService.showErrorDialog(errorText);
						if (needToReject)
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

			/**
			 * Send post request and receive file attachment.
			 */
			function downloadFileRequest(method, url, parameters) {
				return $q(function (resolve) {
					if (typeof (Blob) !== 'undefined') {
						// post request for download the file
						var xhr = new XMLHttpRequest();
						xhr.open(method, url, true);
						xhr.responseType = 'arraybuffer';
						xhr.onload = function () {
							if (this.status === 200) {
								var filename = "";
								var disposition = xhr.getResponseHeader('Content-Disposition');
								if (disposition && disposition.toLowerCase().indexOf('attachment') !== -1) {
									var filenameRegex = /[Ff]ilename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
									var matches = filenameRegex.exec(disposition);
									if (matches != null && matches[1])
										filename = matches[1].replace(/['"]/g, '');
								}
								var type = xhr.getResponseHeader('Content-Type');

								var blob = new Blob([this.response], { type: type });
								if (typeof window.navigator.msSaveBlob !== 'undefined') {
									// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. 
									// These URLs will no longer resolve as the data backing the URL has been freed."
									window.navigator.msSaveBlob(blob, filename);
									resolve();
								} else {
									var URL = window.URL || window.webkitURL;
									var downloadUrl = URL.createObjectURL(blob);
									if (filename) {
										// use HTML5 a[download] attribute to specify filename
										var a = document.createElement("a");
										// safari doesn't support this yet
										if (typeof a.download === 'undefined') {
											window.location = downloadUrl;
										} else {
											a.href = downloadUrl;
											a.target = '_blank';
											a.download = filename;
											document.body.appendChild(a);
											a.click();
											document.body.removeChild(a);
										}
									} else {
										window.location = downloadUrl;
									}
									setTimeout(function () {
										URL.revokeObjectURL(downloadUrl);
										resolve();
									}, 100); // cleanup
								}
							}
						};

						xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
						if (method.toLowerCase() === 'post')
							xhr.send(angular.element.param(parameters));
						else if (method.toLowerCase() === 'get')
							xhr.send();
						else
							throw 'Unsupported request method: ' + method;
					} else {
						if (method.toLowerCase() === 'post') {
							// old browser post request
							var form = document.createElement("form");
							form.action = url;
							form.method = method;
							form.target = "_blank";
							if (parameters) {
								for (var key in parameters) {
									var input = document.createElement("textarea");
									input.name = key;
									input.value = typeof parameters[key] === "object" ? JSON.stringify(parameters[key]) : parameters[key];
									form.appendChild(input);
								}
							}
							form.style.display = 'none';
							document.body.appendChild(form);
							form.submit();
							document.body.removeChild(form);
						} else {
							// old browser get request
							var a = document.createElement("a");
							a.href = url;
							a.target = '_blank';
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
						}
						resolve();
					}
				});
			}

			// PUBLIC API:
			return {
				cancelAllQueries: cancelAllQueries,
				customQuery: customQuery,
				rsQuery: rsQuery,
				query: query,
				downloadFileRequest: downloadFileRequest
			};
		}]);

});