import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';

export default class IzendaRsQueryService {

	urlSettings: any;
	rsQueryBaseUrl: string;
	private readonly requestList: Array<RequestListItem>;

	constructor(
		private readonly $window: ng.IWindowService,
		private readonly $rootScope: ng.IRootScopeService,
		private readonly $http: ng.IHttpService,
		private readonly $q: ng.IQService,
		private readonly $injector: ng.auto.IInjectorService,
		private readonly $log: ng.ILogService,
		private readonly $izendaLocale: IzendaLocalizationService,
		private readonly $izendaUtilUiService: IzendaUtilUiService) {

		this.urlSettings = this.$window['urlSettings$'];
		this.rsQueryBaseUrl = this.urlSettings.urlRsPage;
		this.requestList = new Array<RequestListItem>();
	}

	/**
	 * Custom query to the izenda response server
	 * @param {any} queryParams Query parameters.
	 * @param {any} options Query options.
	 * @param {any} errorOptions Error options.
	 * @param {boolean} invalidateInCacheParameter Do we need to invalidate caches.
	 */
	rsQuery(queryParams: any, options: any, errorOptions: any, invalidateInCacheParameter: boolean = false): angular.IPromise<any> {
		return this.customQuery(this.rsQueryBaseUrl, queryParams, options, errorOptions, invalidateInCacheParameter);
	}

	/**
	 * Custom query to the izenda API.
	 * @param {string} wsCmd Izenda API command.
	 * @param {any[]} wsArgs Izenda API command parameters (wsarg0, wsarg1,...).
	 * @param {any} options Query options.
	 * @param {any} errorOptions Error options.
	 * @param {boolean} invalidateInCacheParameter Do we need to invalidate caches.
	 */
	query(wsCmd: string, wsArgs: any[], options: any, errorOptions?: any, invalidateInCacheParameter: boolean = false): angular.IPromise<any> {
		// prepare params:
		var params = {
			'wscmd': wsCmd
		};
		if (angular.isArray(wsArgs)) {
			for (let i = 0; i < wsArgs.length; i++) {
				var wsArg = wsArgs[i];
				params['wsarg' + i] = (angular.isDefined(wsArg) && wsArg != null) ? wsArg : '';
			}
		} else {
			throw new Error('wsArgs: expected array, but got: ' + typeof (wsArgs));
		}

		// set default error options if it is not defined:
		let currentErrorOptions: any;
		if (angular.isUndefined(errorOptions)) {
			currentErrorOptions = {
				handler: (wsCmd2, wsArgs2) => {
					return 'Query: "' + wsCmd2 + '" [' + wsArgs2 + '] failed.';
				},
				params: [wsCmd, wsArgs]
			};
		} else {
			currentErrorOptions = errorOptions;
		}
		return this.rsQuery(params, options, currentErrorOptions, invalidateInCacheParameter);
	}

	/**
	 * Query to the izenda API (POST request which returns JSON).
	 * @param {string} wsCmd Izenda API command.
	 * @param {any[]} wsArgs Izenda API command parameters (wsarg0, wsarg1,...).
	 * @param {boolean} invalidateInCacheParameter Do we need to invalidate caches.
	 */
	apiQuery(wsCmd: string, wsArgs: any[], invalidateInCacheParameter: boolean = false): angular.IPromise<any> {
		return this.$q((resolve, reject) => {
			// check params:
			if (!angular.isString(wsCmd) || wsCmd === '') {
				reject('Parameter error: wsCmd parameter should be non-empty string.');
				return;
			}
			if (!angular.isArray(wsArgs)) {
				reject('Parameter error: wsArgs parameter should be array.');
				return;
			}

			// create params array
			const params = { 'wscmd': wsCmd };
			wsArgs.forEach((wsArg, i) => {
				params['wsarg' + i] = (angular.isDefined(wsArg) && wsArg !== null) ? wsArg : '';
			});

			// run query
			this.rsQuery(params, { dataType: 'json', method: 'POST' }, null, invalidateInCacheParameter)
				.then(result => resolve(result), error => reject(error));
		});
	}

	/**
	 * Cancel all running queries
	 * @param {any} options (optional) options.cancelList may set custom queries to cancel.
	 */
	cancelAllQueries(options?: any) {
		let opts = options || {};
		// queries which we can cancel
		let cancellableQueries = opts.hasOwnProperty('cancelList')
			? opts['cancelList']
			: this.$injector.get('izenda.common.query.cancellableQueries');

		let count = this.requestList.length;
		let i = 0;
		while (i < this.requestList.length) {
			let request = this.requestList[0];
			let cancel = false;
			if (angular.isArray(cancellableQueries)) {
				var requestUrl = request.url;
				var requestParams = request.queryParamsFinal;
				for (let j = 0; j < cancellableQueries.length; j++) {
					var cancelRule = cancellableQueries[j];
					if (angular.isString(cancelRule)) {
						cancel = cancel || requestUrl.indexOf(cancelRule) >= 0;
					} else if (angular.isObject(cancelRule)) {
						if ('wscmd' in cancelRule) {
							cancel = cancel || requestUrl.indexOf('wscmd=' + cancelRule['wscmd']) >= 0;
							cancel = cancel || requestParams.hasOwnProperty('wscmd') && requestParams['wscmd'] === cancelRule['wscmd'];
						}
					} else {
						throw 'Unknown cancel rule: ' + cancelRule;
					}
				}
			}

			if (cancel) {
				request.canceller.resolve();
				request.resolver.$izendaRsQueryCancelled = false;
				this.requestList.splice(i, 1);
			} else {
				i++;
			}
		}

		return count - i;
	}

	/**
	 * Send post request and receive file attachment.
	 * @param {string} method GET/POST
	 * @param {string} url Url.
	 * @param {any} parameters Url parameters dictionary.
	 * @return {angular.IPromise<void>} Promise without parameters.
	 */
	downloadFileRequest(method: string, url: string, parameters?: any): angular.IPromise<void> {
		return this.$q((resolve: () => void) => {
			if (typeof (Blob) !== 'undefined') {
				// post request for download the file
				const xhr = new XMLHttpRequest();
				xhr.open(method, url, true);
				xhr.responseType = 'arraybuffer';

				const selfXhr = xhr;
				xhr.onload = (evt) => {
					console.log('downloadFileRequest xhr.onload evt: ', evt);
					if (selfXhr.status !== 200)
						return;
					const disposition = xhr.getResponseHeader('Content-Disposition');
					let filename = '';
					if (disposition && disposition.toLowerCase().indexOf('attachment') !== -1) {
						const filenameRegex = /[Ff]ilename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						const matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1])
							filename = matches[1].replace(/['"]/g, '');
					}
					const type = xhr.getResponseHeader('Content-Type');

					const blob = new Blob([selfXhr.response], { type: type });
					if (typeof window.navigator.msSaveBlob !== 'undefined') {
						// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. 
						// These URLs will no longer resolve as the data backing the URL has been freed."
						window.navigator.msSaveBlob(blob, filename);
						resolve();
					} else {
						let urlFunc = window.URL || window['webkitURL'];
						var downloadUrl = urlFunc.createObjectURL(blob);
						if (filename) {
							// use HTML5 a[download] attribute to specify filename
							let linkElement = document.createElement('a');
							// safari doesn't support this yet
							if (typeof linkElement.download === 'undefined') {
								window.location.href = downloadUrl;
							} else {
								linkElement.href = downloadUrl;
								linkElement.target = '_blank';
								linkElement.download = filename;
								document.body.appendChild(linkElement);
								linkElement.click();
								document.body.removeChild(linkElement);
							}
						} else {
							window.location.href = downloadUrl;
						}
						setTimeout(() => {
							urlFunc.revokeObjectURL(downloadUrl);
							resolve();
						}, 100); // cleanup
					}
				};

				xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
				if (method.toLowerCase() === 'post')
					xhr.send(angular.element.param(parameters || {}));
				else if (method.toLowerCase() === 'get')
					xhr.send();
				else
					throw 'Unsupported request method: ' + method;
			} else {
				if (method.toLowerCase() === 'post') {
					// old browser post request
					const form = document.createElement('form');
					form.action = url;
					form.method = method;
					form.target = '_blank';
					if (parameters)
						for (let key in parameters)
							if (parameters.hasOwnProperty(key)) {
								const input = document.createElement('textarea');
								input.name = key;
								input.value = typeof parameters[key] === 'object' ? JSON.stringify(parameters[key]) : parameters[key];
								form.appendChild(input);
							}
					form.style.display = 'none';
					document.body.appendChild(form);
					form.submit();
					document.body.removeChild(form);
				} else {
					// old browser get request
					let linkElement2 = document.createElement('a');
					linkElement2.href = url;
					linkElement2.target = '_blank';
					document.body.appendChild(linkElement2);
					linkElement2.click();
					document.body.removeChild(linkElement2);
				}
				resolve();
			}
		});
	}

	/**
	 * Do query to custom url
	 */
	private customQuery(baseUrl: string, queryParams: any,
		options: { method: string, dataType: string },
		errorOptions: any,
		invalidateInCacheParameter: boolean): angular.IPromise<any> {

		const queryParamsFinal = angular.extend({}, queryParams);
		// apply izendaPageId$
		if (typeof (window['izendaPageId$']) !== 'undefined')
			queryParamsFinal['izpid'] = window['izendaPageId$'];
		if (typeof (window['angularPageId$']) !== 'undefined')
			queryParamsFinal['anpid'] = window['angularPageId$'];

		const isPost = angular.isObject(options) && options.method === 'POST';
		let postData = {};
		let url = baseUrl;

		if (!isPost) {
			// GET request url:
			url += '?';
			for (let paramName in queryParamsFinal) {
				if (queryParamsFinal.hasOwnProperty(paramName)) {
					url += paramName + '=' + encodeURIComponent(queryParamsFinal[paramName]) + '&';
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
			let postParamsString = 'urlencoded=true';
			for (var paramName2 in queryParamsFinal) {
				if (queryParamsFinal.hasOwnProperty(paramName2)) {
					postParamsString += '&' + paramName2 + '=' + encodeURIComponent(queryParamsFinal[paramName2]);
				}
			}
			postData = {
				data: postParamsString
			};
			if (invalidateInCacheParameter)
				url += '?iic=1';
		}

		// create promises
		const canceler = this.$q.defer<any>();
		const resolver = this.$q.defer<any>();
		resolver['$izendaRsQueryCancelled'] = true;
		resolver['errorOptions'] = angular.isObject(errorOptions) ? errorOptions : null;

		// prepare request optinos
		const dataType = angular.isDefined(options) && angular.isString(options.dataType)
			? options.dataType
			: 'text';
		let contentType = 'text/html';
		if (dataType === 'json')
			contentType = 'text/json';
		url = getAppendedUrl(url);
		const requestId = (+new Date).toString() + '_' + Math.floor(Math.random() * 1000000).toString(); // pseudo random UID.
		const reqHeaders = {} as ng.IHttpRequestConfigHeaders;
		reqHeaders['Content-Type'] = contentType;
		const req = {} as ng.IRequestConfig;
		req.method = 'GET';
		req.url = url;
		req.headers = reqHeaders;
		req.timeout = canceler.promise;
		if (angular.isObject(options)) {
			angular.extend(req, options);
		}
		angular.extend(req, postData); // it is empty for http GET requests
		// custom
		req['requestId'] = requestId;
		req['queryParamsFinal'] = queryParamsFinal;

		// add request to requestList
		this.requestList.push(new RequestListItem(requestId, url, queryParamsFinal, canceler, resolver));

		// run query
		this.$http(req).then(response => {
			// handle success
			this.removeRequest(response.config['requestId']);
			if (!angular.isObject(response)) {
				// resolve non-object responses
				resolver.resolve(response);
				return;
			}
			// object response
			var data = response.data;
			if (angular.isObject(data) && angular.isString(data['izendaQueryStatus'])) {
				// API query result
				if (data['izendaQueryStatus'] === 'ok')
					resolver.resolve(data['result']);
				else if (data['izendaQueryStatus'] === 'error')
					resolver.reject(data['error']);
				else
					resolver.reject('Unknown izendaQueryStatus: ' + data['izendaQueryStatus']);
			} else {
				// Non-API json query result
				resolver.resolve(data);
			}
		}, response => {
			// handle request error
			this.removeRequest(response.config.requestId);

			let needToReject = true;
			let errorText: string;
			if (resolver['errorOptions'] != null) {
				needToReject = false;
				errorText = resolver['errorOptions'].handler.apply(response,
					resolver['errorOptions'].params ? resolver['errorOptions'].params : []);
			} else if (response.message)
				errorText = response.message;
			else if (response.config)
				errorText = this.$izendaLocale.localeText('js_QueryFailed', 'Query failed') + ': ' + JSON.stringify(response.config);
			else
				errorText = this.$izendaLocale.localeText('localeVariable', 'An unknown error occurred.');
			if (resolver['$izendaRsQueryCancelled']) {
				if (needToReject)
					resolver.reject(errorText);
				else
					this.$izendaUtilUiService.showErrorDialog(errorText);
			}
		});
		return resolver.promise;
	}

	/**
	 * Remove request from array
	 */
	private removeRequest(requestId: string) {
		let foundIndex = -1;
		let i = 0;
		while (foundIndex < 0 && i < this.requestList.length) {
			if (this.requestList[i].requestId === requestId) {
				foundIndex = i;
			}
			i++;
		}
		if (foundIndex >= 0) {
			this.requestList.splice(foundIndex, 1);
		}
	}

	static get injectModules(): any[] {
		return ['$window', '$rootScope', '$http', '$q', '$injector', '$log', '$izendaLocale', '$izendaUtilUiService'];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.constant('izenda.common.query.cancellableQueries', [{
			wscmd: 'loadDashboardConfigNew' // load dashboard layout query
		}, {
			wscmd: 'getDashboardCategoriesNew'
		}, {
			wscmd: 'getDashboardTilePreviewNew' // load tile html query
		}, {
			wscmd: 'getCrsSchedule'
		}, {
			wscmd: 'getCrsShare'
		}])
		.service('$izendaRsQuery', IzendaRsQueryService.injectModules.concat(IzendaRsQueryService));
	}
}

export class RequestListItem {
	constructor(
		public requestId: string,
		public url: string,
		public queryParamsFinal: any,
		public canceller: any,
		public resolver: any) { }
}
