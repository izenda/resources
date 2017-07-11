izendaRequire.define(['angular', 'moment', '../../common/services/services'], function (angular, moment) {

	/**
	 * Izenda query service which provides dashboard specific queries
	 * this is singleton
	 */
	angular.module('izendaInstantReport').factory('$izendaInstantReportQuery', [
		'$rootScope',
		'$q',
		'$http',
		'$log',
		'$window',
		'$izendaLocale',
		'$izendaUrl',
		'$izendaSettings',
		'$izendaRsQuery',
	function ($rootScope, $q, $http, $log, $window, $izendaLocale, $izendaUrl, $izendaSettings, $izendaRsQuery) {
		'use strict';

		var requestList = [];

		/**
		 * Get type group of field operator
		 */
		var getFieldFilterOperatorValueType = function (operator) {
			var hiddenOperators = ['Blank', 'NotBlank', 'UsePreviousOR', 'True', 'False'],
				oneValueOperators = ['LessThan', 'GreaterThan', 'LessThanNot', 'GreaterThanNot', 'Equals', 'NotEquals', 'Like',
				'BeginsWith', 'EndsWith', 'NotLike', 'LessThan_DaysOld', 'GreaterThan_DaysOld', 'Equals_DaysOld', 'LessThan_DaysOld',
				'GreaterThan_DaysOld', 'Equals_DaysOld'],
				twoValueOperators = ['Between', 'NotBetween'],
				selectValuesOperators = ['Equals_Select', 'NotEquals_Select'],
				selectMultipleValuesOperators = ['Equals_Multiple', 'NotEquals_Multiple'],
				selectPopupValuesOperators = ['EqualsPopup', 'NotEqualsPopup'],
				selectCheckboxesValuesOperators = ['Equals_CheckBoxes'],
				selectOneDateOperators = ['EqualsCalendar', 'NotEqualsCalendar'],
				selectTwoDatesOperators = ['BetweenTwoDates', 'NotBetweenTwoDates'],
				fieldOperators = ['LessThanField', 'GreaterThanField', 'EqualsField', 'NotEqualsField'],
				inTimePeriod = ['InTimePeriod'];
			if (!angular.isObject(operator))
				return 'hidden';
			if (operator.value === '' || hiddenOperators.indexOf(operator.value) >= 0)
				return 'hidden';
			if (oneValueOperators.indexOf(operator.value) >= 0)
				return 'oneValue';
			if (twoValueOperators.indexOf(operator.value) >= 0)
				return 'twoValues';
			if (selectValuesOperators.indexOf(operator.value) >= 0)
				return 'select';
			if (selectMultipleValuesOperators.indexOf(operator.value) >= 0)
				return 'select_multiple';
			if (selectPopupValuesOperators.indexOf(operator.value) >= 0)
				return 'select_popup';
			if (selectCheckboxesValuesOperators.indexOf(operator.value) >= 0)
				return 'select_checkboxes';
			if (selectOneDateOperators.indexOf(operator.value) >= 0)
				return 'oneDate';
			if (selectTwoDatesOperators.indexOf(operator.value) >= 0)
				return 'twoDates';
			if (fieldOperators.indexOf(operator.value) >= 0)
				return 'field';
			if (inTimePeriod.indexOf(operator.value) >= 0) {
				return 'inTimePeriod';
			}
			return operator.value;
		};

		/**
		 * Calculate current actual type group for field.
		 */
		function getCurrentTypeGroup(field, dataTypeGroup) {
			var typeGroup;
			if (angular.isDefined(dataTypeGroup)) {
				typeGroup = dataTypeGroup;
			} else {
				typeGroup = angular.isObject(field.expressionType) && field.expressionType.value !== '...'
					? field.expressionType.value
					: field.typeGroup;
			}
			return typeGroup;
		}

		/**
		* Get datasources
		*/
		function getDatasources() {
			return $izendaRsQuery.query('getjsonschema', ['lazy'], {
				dataType: 'json'
			},
			// custom error handler:
			{
				handler: function () {
					return 'Failed to get datasources';
				},
				params: []
			});
		}

		/**
		 * Load field info by given sql column name.
		 */
		function getFieldsInfo(fieldSysName) {
			return $izendaRsQuery.query('getfieldsinfo', [fieldSysName], {
				dataType: 'json'
			}, {
				handler: function (fName) {
					return 'Failed to get field info for field ' + fName;
				},
				params: [fieldSysName]
			});
		}

		/**
		 * Search fields in datasources (returns range of values [from, to])
		 */
		function findInDatasources(searchString, from, to) {
			var params = [encodeURIComponent(searchString)];
			if (angular.isNumber(from) && angular.isNumber(to))
				params = params.concat(from, to);
			return $izendaRsQuery.query('findfields', params, {
				dataType: 'json'
			}, {
				handler: function (sString) {
					return 'Failed to search fields and tables by keyword: ' + sString;
				},
				params: [searchString]
			});
		}

		/**
		 * Load report json config
		 */
		function loadReport(reportFullName) {
			return $izendaRsQuery.query('loadReportSetConfigJson', [reportFullName], {
				dataType: 'json'
			},
			// custom error handler:
			{
				handler: function (fullName) {
					return 'Failed load report ' + fullName;
				},
				params: [reportFullName]
			});
		}

		/**
		 * Cancel all running preview queries. All queries will be rejected.
		 */
		function cancelAllPreviewQueries() {
			var i = 0;
			for (var i = 0; i < requestList.length; i++) {
				var request = requestList[i];
				request.canceller.resolve('Cancelled!');
			}
			requestList = [];
		};

		/**
		 * Run reportSet preview request. If request R2 have come earlier that request R1 - R1 request cancels.
		 */
		function getReportSetPreviewQueued(reportSetConfig) {
			cancelAllPreviewQueries();

			// prepare params
			var paramsArray = [
				'iic=1', // invalidate in cache
				'urlencoded=true',
				'wscmd=getNewReportSetPreviewFromJson',
				'wsarg0=' + encodeURIComponent(JSON.stringify(reportSetConfig))
			];
			if (typeof (window.izendaPageId$) !== 'undefined')
				paramsArray.push('izpid=' + window.izendaPageId$);
			if (typeof (window.angularPageId$) !== 'undefined')
				paramsArray.push('anpid=' + window.angularPageId$);

			var resolver = $q.defer();
			var canceller = $q.defer();
			var req = {
				method: 'POST',
				url: $izendaUrl.settings.urlRsPage,
				timeout: canceller.promise,
				dataType: 'text',
				data: paramsArray.join('&'), // query parameters
				headers: {
					'Content-Type': 'text/html'
				}
			};

			// add request to current requests list
			requestList.push({
				canceller: canceller,
				resolver: resolver
			});

			var requestPromise = $http(req);
			requestPromise
				.then(function successCallback(response) {
					resolver.resolve(response.data);
				}, function errorCallback(response) {
					if (response.config.timeout.$$state.value !== 'Cancelled!') {
						//handle errors:
						var errorText = $izendaLocale.localeText('js_FailedToLoadPreview', 'Failed to load preview.');
						$rootScope.$broadcast('izendaShowMessageEvent', [
									errorText,
									$izendaLocale.localeText('js_Error', 'Error'),
									'danger']);
						resolver.reject(response.data);
					}
				});
			return resolver.promise;
		}

		/**
		 * Create report set from json and save it.
		 */
		function saveReportSet(reportSetConfig) {
			var paramsString = JSON.stringify(reportSetConfig);
			return $izendaRsQuery.query('saveReportSetFromJson', [paramsString], {
				dataType: 'text',
				headers: {
					'Content-Type': 'text/html'
				},
				method: 'POST'
			}, {
				handler: function () {
					return 'Failed to save report set';
				}
			});
		}

		/**
		 * Create report set from json and set it as CurrentReportSet.
		 */
		function setReportAsCrs(reportSetConfig) {
			var paramsString = JSON.stringify(reportSetConfig);
			return $izendaRsQuery.query('setReportSetFromJsonToCrs', [paramsString], {
				dataType: 'text',
				headers: {
					'Content-Type': 'text/html'
				},
				method: 'POST'
			}, {
				handler: function () {
					return 'Failed to set current report as CurrentReportSet';
				}
			});
		};

		/**
		 * Open window for print.
		 */
		function openPrintWindow(url, parameters, resolve) {
			// open html print window
			var form = document.createElement("form");
			form.action = $izendaUrl.settings.urlRsPage;
			form.method = 'POST';
			// set custom (our) window as target window
			form.target = 'form-target';
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

			// open window for form and submit for into that window
			var formWindow = window.open('', 'form-target', '');
			form.submit();

			// workaroud for webkit ajax request block
			if ('WebkitAppearance' in document.documentElement.style) {
				var intervalId = setInterval(function () {
					if (!formWindow || formWindow.closed) {
						clearInterval(intervalId);
						intervalId = null;
						resolve();
					}
				}, 500);
			} else
				resolve();
		}

		/**
		 * Open url in new window. 
		 */
		function exportReportInNewWindow(reportSetToSend, exportType) {
			return $q(function (resolve) {
				// create url for export
				var urlParams = {
					'wscmd': exportType === 'print' ? 'printReportSet' : 'exportReportSet',
					'wsarg0': JSON.stringify(reportSetToSend),
					'wsarg1': exportType
				};
				if (typeof ($window.izendaPageId$) !== 'undefined')
					urlParams['izpid'] = $window.izendaPageId$;

				if (exportType !== 'print') {
					// export file
					$izendaRsQuery.downloadFileRequest('POST', $izendaUrl.settings.urlRsPage, urlParams).then(function () {
						resolve();
					});
				} else {
					// print html
					openPrintWindow($izendaUrl.settings.urlRsPage, urlParams, resolve);
				}
			});
		}

		function getVisualizationConfig() {
			return $izendaRsQuery.query('getVisualizationConfig', [], {
				dataType: 'json'
			}, {
				handler: function () {
					return 'Failed to get visualizations config';
				}
			});
		}

		/**
		 * Get list of constraints
		 */
		function getContraintsInfo() {
			return $izendaRsQuery.query('getconstraintslist', [], {
				dataType: 'json'
			}, {
				handler: function () {
					return 'Failed to get contraints info';
				}
			});
		}

		function getFieldFunctions(field, functionPurpose) {
			if (!angular.isObject(field))
				throw 'Field should be object';
			var parameters;
			var typeGroup = getCurrentTypeGroup(field);
			if (functionPurpose === 'subtotal') {
				// available functions for subtotals
				parameters = {
					'cmd': 'GetOptionsByPath',
					'p': 'FunctionList',
					'type': field.sqlType,
					'typeGroup': typeGroup,
					'includeBlank': 'true',
					'includeGroupBy': 'false',
					'forSubtotals': 'true',
					'extraFunction': 'false',
					'forDundasMap': 'false',
					'onlyNumericResults': 'false',
					'resultType': 'json'
				};
			} else if (functionPurpose === 'field') {
				// available functions for column
				parameters = {
					'cmd': 'GetOptionsByPath',
					'p': 'FunctionList',
					'type': field.sqlType,
					'typeGroup': typeGroup,
					'includeBlank': 'true',
					'includeGroupBy': 'true',
					'forSubtotals': 'false',
					'extraFunction': 'false',
					'forDundasMap': 'false',
					'onlyNumericResults': 'false',
					'resultType': 'json'
				};
			} else if (functionPurpose === 'pivotField') {
				parameters = {
					'cmd': 'GetOptionsByPath',
					'p': 'FunctionList',
					'type': field.sqlType,
					'typeGroup': typeGroup,
					'includeBlank': 'true',
					'includeGroupBy': 'true',
					'forSubtotals': 'false',
					'extraFunction': 'true',
					'forDundasMap': 'false',
					'onlyNumericResults': 'false',
					'resultType': 'json'
				};
			}

			return $izendaRsQuery.rsQuery(parameters, {
				dataType: 'json',
				cache: true
			}, {
				handler: function (fieldParam) {
					return 'Failed to get function list info for field ' + fieldParam.sysname;
				},
				params: [field]
			});
		}

		function getPeriodList() {
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'PeriodList',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get period list.';
				},
				params: []
			});
		};

		function getExistentPopupValuesList(field, table) {
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'ExistentPopupValuesList',
				'columnName': field.sysname,
				'tbl0': table.sysname,
				'ta0': '',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get custom popups styles.';
				},
				params: []
			});
		};

		function getDrillDownStyles() {
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'DrillDownStyleList',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get drilldown styles.';
				},
				params: []
			});
		}

		function getExpressionTypes() {
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'ExpressionTypeList',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get expression types.';
				},
				params: []
			});
		}

		function getSubreports() {
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'SubreportsList',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get subreports.';
				},
				params: []
			});
		}

		function getVgStyles() {
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'VgStyleList',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function () {
					return 'Failed to get available visual group styles.';
				},
				params: []
			});
		}

		function getFieldFormats(field, dataTypeGroup) {
			if (!angular.isObject(field))
				throw 'Field should be object';
			var typeGroup = getCurrentTypeGroup(field, dataTypeGroup);
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'FormatList',
				'typeGroup': typeGroup,
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function (fieldParam) {
					return 'Failed to get format list info for field ' + fieldParam.sysname;
				},
				params: [field]
			});
		}

		function getFilterFormats(filter) {
			if (!angular.isObject(filter) || !angular.isObject(filter.field))
				throw 'filter and filter.field should be objects.';
			var typeGroup = getCurrentTypeGroup(filter.field);
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'FormatList',
				'typeGroup': typeGroup,
				'onlySimple': 'true',
				'forceSimple': 'true',
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function (filterParam) {
					return 'Failed to get format list info for filter ' + filterParam.field.sysname;
				},
				params: [filter]
			});
		};

		function getFieldOperatorList(field, tablesString, dataTypeGroup) {
			if (!angular.isObject(field))
				throw 'Field should be object.';
			var typeGroup = getCurrentTypeGroup(field, dataTypeGroup);
			return $izendaRsQuery.rsQuery({
				'cmd': 'GetOptionsByPath',
				'p': 'OperatorList',
				'typeGroup': typeGroup,
				'tables': tablesString,
				'colFullName': field.sysname,
				'resultType': 'json'
			}, {
				dataType: 'json',
				cache: true
			}, {
				handler: function (fieldParam) {
					return 'Failed to get operator list for field ' + fieldParam.sysname;
				},
				params: [field]
			});
		}

		function getExistentValuesList(tables, constraintFilters, filter, simpleJoins, filterLogic) {
			if (filter.field === null || !angular.isString(filter.field.sysname))
				throw 'filter field sysname should be defined.';
			if (!angular.isArray(tables))
				throw 'tables should be array';

			// create base query params
			var queryParams = {
				'cmd': 'GetOptionsByPath',
				'p': 'ExistentValuesList',
				'columnName': filter.field.sysname,
				'resultType': 'json'
			};
			if (angular.isString(filter.possibleValue)) {
				queryParams['possibleValue'] = filter.possibleValue.replace('&', '%26');
			}

			// add constraint filters params
			var counter = 0;
			angular.element.each(constraintFilters, function () {
				var constraintFilter = this;
				if (constraintFilter.field !== null && angular.isObject(constraintFilter.operator)
					&& constraintFilter.operator.value !== '' && angular.isArray(constraintFilter.values)
					&& constraintFilter.values.length > 0) {
					var constraintParamPart = {};
					constraintParamPart['fc' + counter] = constraintFilter.field.sysname;
					constraintParamPart['fo' + counter] = constraintFilter.operator.value;
					var constraintOperatorType = getFieldFilterOperatorValueType(constraintFilter.operator);
					if (constraintOperatorType === 'twoValues') {
						constraintParamPart['fvl' + counter] = constraintFilter.values[0];
						constraintParamPart['fvr' + counter] = constraintFilter.values[1];
					} else if (constraintOperatorType === 'twoDates') {
						constraintParamPart['fvl' + counter] = moment(constraintFilter.values[0]).format($izendaSettings.getDateFormat().shortDate);
						constraintParamPart['fvr' + counter] = moment(constraintFilter.values[1]).format($izendaSettings.getDateFormat().shortDate);
					} else if (constraintOperatorType === 'oneDate') {
						constraintParamPart['fvl' + counter] = moment(constraintFilter.values[0]).format($izendaSettings.getDateFormat().shortDate);
					} else if (constraintOperatorType === 'field') {
						var val = angular.isObject(constraintFilter.values[0])
							? constraintFilter.values[0].sysname
							: '';
						constraintParamPart['fvl' + counter] = val;
					} else {
						constraintParamPart['fvl' + counter] = constraintFilter.values.join(',');
					}

					angular.extend(queryParams, constraintParamPart);
					counter++;
				}
			});

			if (simpleJoins) {
				// create tablenames
				var tableNames = [];
				angular.element.each(tables, function () {
					tableNames.push(this.sysname);
				});
				queryParams['tbl0'] = tableNames.join('\'');
				if (angular.isString(filterLogic) && filterLogic.trim() !== '') {
					queryParams['filterLogic'] = filterLogic;
				}

				// run query
				return $izendaRsQuery.rsQuery(queryParams, {
					'dataType': 'json',
					cache: true
				}, {
					handler: function (tablesParam, fieldParam) {
						return 'Failed to existent values list list for tables ' + tablesParam + ' and field ' + fieldParam;
					},
					params: [tableNames.join(','), filter.field.sysname]
				});
			} else {
				// Custom joins request:
				/*
				cmd:GetOptionsByPath
				p:ExistentValuesList
				columnName:[dbo].[Categories].[CategoryID]
				tbl0:[dbo].[Categories]
				ta0:
				tbl1:[dbo].[Invoices]
				ta1:
				lclm1:[dbo].[Invoices].[OrderID]
				rclm1:[dbo].[Categories].[CategoryID]
				jn1:INNER
				*/
				throw 'Custom joins isn\'t implemented yet';
			}
		}

		// PUBLIC API
		return {
			getFieldFilterOperatorValueType: getFieldFilterOperatorValueType,
			getDatasources: getDatasources,
			getFieldsInfo: getFieldsInfo,
			findInDatasources: findInDatasources,
			loadReport: loadReport,
			getReportSetPreviewQueued: getReportSetPreviewQueued,
			cancelAllPreviewQueries: cancelAllPreviewQueries,
			saveReportSet: saveReportSet,
			setReportAsCrs: setReportAsCrs,
			exportReportInNewWindow: exportReportInNewWindow,
			getContraintsInfo: getContraintsInfo,
			getFieldFunctions: getFieldFunctions,
			getFieldFormats: getFieldFormats,
			getPeriodList: getPeriodList,
			getFilterFormats: getFilterFormats,
			getVgStyles: getVgStyles,
			getExpressionTypes: getExpressionTypes,
			getDrillDownStyles: getDrillDownStyles,
			getExistentPopupValuesList: getExistentPopupValuesList,
			getSubreports: getSubreports,
			getFieldOperatorList: getFieldOperatorList,
			getExistentValuesList: getExistentValuesList,
			getVisualizationConfig: getVisualizationConfig
		};
	}]);

});
