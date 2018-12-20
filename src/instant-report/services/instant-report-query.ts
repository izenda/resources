import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaRsQueryService from 'common/query/services/rs-query-service';

/**
 * Izenda query service which provides dashboard specific queries
 * this is singleton
 */
export default class IzendaInstantReportQueryService {

	private requestList: any[];

	static get injectModules(): any[] {
		return ['$q', '$http', '$window', '$izendaLocaleService', '$izendaUtilUiService', '$izendaUrlService',
			'$izendaSettingsService', '$izendaRsQueryService'];
	}

	constructor(
		private readonly $q: ng.IQService,
		private readonly $http: ng.IHttpService,
		private readonly $window: ng.IWindowService,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaUtilUiService: IzendaUtilUiService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaSettingsService: IzendaQuerySettingsService,
		private readonly $izendaRsQueryService: IzendaRsQueryService) {
		this.requestList = [];
	}

	/**
	 * Get type group of field operator
	 */
	getFieldFilterOperatorValueType(operator) {
		const hiddenOperators = ['Blank', 'NotBlank', 'UsePreviousOR', 'True', 'False'];
		const oneValueOperators = [
			'LessThan', 'GreaterThan', 'LessThanNot', 'GreaterThanNot', 'Equals', 'NotEquals', 'Like',
			'BeginsWith', 'EndsWith', 'NotLike', 'LessThan_DaysOld', 'GreaterThan_DaysOld', 'Equals_DaysOld',
			'LessThan_DaysOld',
			'GreaterThan_DaysOld', 'Equals_DaysOld'
		];
		const twoValueOperators = ['Between', 'NotBetween'];
		const selectValuesOperators = ['Equals_Select', 'NotEquals_Select'];
		const selectMultipleValuesOperators = ['Equals_Multiple', 'NotEquals_Multiple'];
		const selectPopupValuesOperators = ['EqualsPopup', 'NotEqualsPopup'];
		const selectCheckboxesValuesOperators = ['Equals_CheckBoxes'];
		const selectOneDateOperators = ['EqualsCalendar', 'NotEqualsCalendar'];
		const selectTwoDatesOperators = ['BetweenTwoDates', 'NotBetweenTwoDates'];
		const fieldOperators = ['LessThanField', 'GreaterThanField', 'EqualsField', 'NotEqualsField'];
		const inTimePeriod = ['InTimePeriod'];
		if (!angular.isObject(operator))
			return 'hidden';
		if (!operator.value || hiddenOperators.indexOf(operator.value) >= 0)
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
	}

	/**
	 * Calculate current actual type group for field.
	 */
	getCurrentTypeGroup(field, dataTypeGroup?) {
		let typeGroup: any;
		if (angular.isDefined(dataTypeGroup)) {
			typeGroup = dataTypeGroup;
		} else {
			const expressionType: { value: any } = field.expressionType;
			typeGroup = angular.isObject(expressionType) && expressionType.value !== '...'
				? expressionType.value
				: field.typeGroup;
		}
		return typeGroup;
	}

	/**
	 * Get datasources
	 */
	getDatasources() {
		return this.$izendaRsQueryService.query('getjsonschema', ['lazy'], {
			dataType: 'json'
		}, {
				handler: () => 'Failed to get datasources',
				params: []
			});
	}

	/**
	 * Load field info by given sql column name.
	 */
	getFieldsInfo(fieldSysName) {
		return this.$izendaRsQueryService.query('getfieldsinfo', [fieldSysName], {
			dataType: 'json'
		}, {
				handler: fieldName => `Failed to get field info for field ${fieldName}`,
				params: [fieldSysName]
			});
	}

	/**
	 * Search fields in datasources (returns range of values [from, to])
	 */
	findInDatasources(searchString, from, to) {
		let params = [encodeURIComponent(searchString)];
		if (angular.isNumber(from) && angular.isNumber(to))
			params = params.concat(String(from), String(to));
		return this.$izendaRsQueryService.query('findfields', params, {
			dataType: 'json'
		}, {
				handler: sString => `Failed to search fields and tables by keyword: ${sString}`,
				params: [searchString]
			});
	}

	/**
	 * Load report json config
	 */
	loadReport(reportFullName) {
		return this.$izendaRsQueryService.apiQuery('loadReportSetConfigJson', [reportFullName]);
	}

	/**
	 * Cancel all running preview queries. All queries will be rejected.
	 */
	cancelAllPreviewQueries() {
		for (let i = 0; i < this.requestList.length; i++) {
			const request = this.requestList[i];
			request.canceller.resolve('Cancelled!');
		}
		this.requestList = [];
	};

	/**
	 * Run reportSet preview request. If request R2 have come earlier that request R1 - R1 request cancels.
	 */
	getReportSetPreviewQueued(reportSetConfig) {
		this.cancelAllPreviewQueries();
		// prepare params
		const paramsArray = [
			'iic=1', // invalidate in cache
			'urlencoded=true',
			'wscmd=getNewReportSetPreviewFromJson',
			`wsarg0=${encodeURIComponent(JSON.stringify(reportSetConfig))}`
		];
		if (typeof (window.izendaPageId$) !== 'undefined')
			paramsArray.push(`izpid=${window.izendaPageId$}`);
		if (typeof (window.angularPageId$) !== 'undefined')
			paramsArray.push(`anpid=${window.angularPageId$}`);

		const rnParamValue = (reportSetConfig.reportCategory
			? reportSetConfig.reportCategory + this.$izendaSettingsService.getCategoryCharacter() + reportSetConfig.reportName
			: reportSetConfig.reportName);

		var resolver = this.$q.defer();
		const canceller = this.$q.defer();
		const req = {
			method: 'POST',
			url: this.$izendaUrlService.settings.urlRsPage,
			params: { 'rnalt': rnParamValue },
			timeout: canceller.promise,
			dataType: 'text',
			data: paramsArray.join('&'), // query parameters
			headers: {
				'Content-Type': 'text/html'
			}
		};

		// add request to current requests list
		this.requestList.push({
			canceller: canceller,
			resolver: resolver
		});

		const requestPromise = this.$http(req);
		requestPromise
			.then(
				response => resolver.resolve(response.data),
				response => {
					if (response.config.timeout.$$state.value !== 'Cancelled!') {
						//handle errors:
						const errorText = this.$izendaLocaleService.localeText('js_FailedToLoadPreview', 'Failed to load preview.');
						this.$izendaUtilUiService.showErrorDialog(errorText);
						resolver.reject(response.data);
					}
				});
		return resolver.promise;
	}

	/**
	 * Create report set from json and save it.
	 */
	saveReportSet(reportSetConfig) {
		const paramsString = JSON.stringify(reportSetConfig);
		return this.$izendaRsQueryService.apiQuery('saveReportSetNew', [paramsString]);
	}

	/**
	 * Create report set from json and set it as CurrentReportSet.
	 */
	setReportAsCrs(reportSetConfig) {
		const paramsString = JSON.stringify(reportSetConfig);
		return this.$izendaRsQueryService.query('setReportSetFromJsonToCrs', [paramsString], {
			dataType: 'text',
			headers: {
				'Content-Type': 'text/html'
			},
			method: 'POST'
		}, {
				handler: () => 'Failed to set current report as CurrentReportSet'
			});
	};

	/**
	 * Open window for print.
	 */
	openPrintWindow(parameters, resolve) {
		// open html print window
		const form = document.createElement('form');
		form.action = this.$izendaUrlService.settings.urlRsPage;
		form.method = 'POST';
		// set custom (our) window as target window
		form.target = 'form-target';
		if (parameters) {
			for (let key in parameters) {
				if (parameters.hasOwnProperty(key)) {
					const input = document.createElement('textarea');
					input.name = key;
					input.value = typeof parameters[key] === 'object'
						? JSON.stringify(parameters[key])
						: parameters[key];
					form.appendChild(input);
				}
			}
		}
		form.style.display = 'none';
		document.body.appendChild(form);

		// open window for form and submit for into that window
		var formWindow = window.open('', 'form-target', '');
		form.submit();

		// workaround for webkit ajax request block
		if ('WebkitAppearance' in document.documentElement.style) {
			var intervalId = setInterval(() => {
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
	exportReportInNewWindow(reportSetToSend, exportType) {
		return this.$q(resolve => {
			// create url for export
			var urlParams = {
				'wscmd': exportType === 'print' ? 'printReportSet' : 'exportReportSet',
				'wsarg0': JSON.stringify(reportSetToSend),
				'wsarg1': exportType
			};
			if (typeof (this.$window.izendaPageId$) !== 'undefined')
				urlParams['izpid'] = this.$window.izendaPageId$;

			if (exportType !== 'print') {
				// export file
				this.$izendaRsQueryService.downloadFileRequest('POST', this.$izendaUrlService.settings.urlRsPage, urlParams)
					.then(() => {
						resolve();
					});
			} else {
				// print html
				this.openPrintWindow(urlParams, resolve);
			}
		});
	}

	getVisualizationConfig() {
		return this.$izendaRsQueryService.query('getVisualizationConfig', [], {
			dataType: 'json'
		}, {
				handler: () => 'Failed to get visualizations config'
			});
	}

	/**
	 * Get list of constraints
	 */
	getConstraintsInfo() {
		return this.$izendaRsQueryService.query('getconstraintslist', [], {
			dataType: 'json'
		}, {
				handler: () => 'Failed to get constraints info'
			});
	}

	getFieldFunctions(field, functionPurpose) {
		if (!angular.isObject(field))
			throw 'Field should be object';
		let parameters: any = null;
		const typeGroup = this.getCurrentTypeGroup(field);
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
		return this.$izendaRsQueryService.rsQuery(parameters, {
			dataType: 'json',
			cache: true
		}, {
				handler: fieldParam => `Failed to get function list info for field ${fieldParam.sysname}`,
				params: [field]
			});
	}

	getPeriodList() {
		return this.$izendaRsQueryService.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'PeriodList',
			'resultType': 'json'
		}, {
				dataType: 'json',
				cache: true
			}, {
				handler: () => 'Failed to get period list.',
				params: []
			});
	};

	getExistentPopupValuesList(field, table) {
		return this.$izendaRsQueryService.rsQuery({
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
				handler: () => 'Failed to get custom popups styles.',
				params: []
			});
	};

	getDrillDownStyles() {
		return this.$izendaRsQueryService.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'DrillDownStyleList',
			'resultType': 'json'
		}, {
				dataType: 'json',
				cache: true
			}, {
				handler: () => 'Failed to get drilldown styles.',
				params: []
			});
	}

	getExpressionTypes() {
		return this.$izendaRsQueryService.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'ExpressionTypeList',
			'resultType': 'json'
		}, {
				dataType: 'json',
				cache: true
			}, {
				handler: () => 'Failed to get expression types.',
				params: []
			});
	}

	getSubreports() {
		return this.$izendaRsQueryService.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'SubreportsList',
			'resultType': 'json'
		}, {
				dataType: 'json',
				cache: true
			}, {
				handler: () => 'Failed to get subreports.',
				params: []
			});
	}

	getVgStyles() {
		return this.$izendaRsQueryService.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'VgStyleList',
			'resultType': 'json'
		}, {
				dataType: 'json',
				cache: true
			}, {
				handler: () => 'Failed to get available visual group styles.',
				params: []
			});
	}

	getFieldFormats(field, dataTypeGroup?) {
		if (!angular.isObject(field))
			throw 'Field should be object';
		const typeGroup = this.getCurrentTypeGroup(field, dataTypeGroup);
		return this.$izendaRsQueryService.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'FormatList',
			'typeGroup': typeGroup,
			'resultType': 'json'
		}, {
				dataType: 'json',
				cache: true
			}, {
				handler: fieldParam => `Failed to get format list info for field ${fieldParam.sysname}`,
				params: [field]
			});
	}

	getFilterFormats(filter) {
		if (!angular.isObject(filter) || !angular.isObject(filter.field))
			throw 'filter and filter.field should be objects.';
		const typeGroup = this.getCurrentTypeGroup(filter.field);
		return this.$izendaRsQueryService.rsQuery({
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
				handler: filterParam => `Failed to get format list info for filter ${filterParam.field.sysname}`,
				params: [filter]
			});
	}

	getFieldOperatorList(field, tablesString, dataTypeGroup?) {
		if (!angular.isObject(field))
			throw 'Field should be object.';
		const typeGroup = this.getCurrentTypeGroup(field, dataTypeGroup);
		return this.$izendaRsQueryService.rsQuery({
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
				handler: fieldParam => `Failed to get operator list for field ${fieldParam.sysname}`,
				params: [field]
			});
	}

	getExistentValuesList(tables, constraintFilters, filter, simpleJoins, filterLogic) {
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
		if (constraintFilters)
			constraintFilters.forEach(constraintFilter => {
				const constraintFilterOperatorValue = constraintFilter && constraintFilter.operator ? constraintFilter.operator.value : '';

				if (constraintFilter.field !== null && angular.isObject(constraintFilter.operator)
					&& constraintFilterOperatorValue !== '' && angular.isArray(constraintFilter.values)
					&& constraintFilter.values.length > 0) {
					const constraintParamPart = {};
					constraintParamPart[`fc${counter}`] = constraintFilter.field.sysname;
					constraintParamPart[`fo${counter}`] = constraintFilterOperatorValue;
					const constraintOperatorType = this.getFieldFilterOperatorValueType(constraintFilter.operator);
					if (constraintOperatorType === 'twoValues') {
						constraintParamPart[`fvl${counter}`] = constraintFilter.values[0];
						constraintParamPart[`fvr${counter}`] = constraintFilter.values[1];
					} else if (constraintOperatorType === 'twoDates') {
						constraintParamPart[`fvl${counter}`] = moment(constraintFilter.values[0]).format(this.$izendaSettingsService.getDateFormat().shortDate);
						constraintParamPart[`fvr${counter}`] = moment(constraintFilter.values[1]).format(this.$izendaSettingsService.getDateFormat().shortDate);
					} else if (constraintOperatorType === 'oneDate') {
						constraintParamPart[`fvl${counter}`] = moment(constraintFilter.values[0]).format(this.$izendaSettingsService.getDateFormat().shortDate);
					} else if (constraintOperatorType === 'field') {
						const val = angular.isObject(constraintFilter.values[0])
							? constraintFilter.values[0].sysname
							: '';
						constraintParamPart[`fvl${counter}`] = val;
					} else {
						constraintParamPart[`fvl${counter}`] = constraintFilter.values.join(',');
					}

					angular.extend(queryParams, constraintParamPart);
					counter++;
				}
			});

		if (simpleJoins) {
			// create tablenames
			const tableNames = tables.map(x => x.sysname);
			queryParams['tbl0'] = tableNames.join('\'');
			if (angular.isString(filterLogic) && filterLogic.trim() !== '') {
				queryParams['filterLogic'] = filterLogic;
			}
			// run query
			return this.$izendaRsQueryService.rsQuery(queryParams, {
				'dataType': 'json',
				cache: true
			}, {
					handler: (tablesParam, fieldParam) => `Failed to existent values list list for tables ${tablesParam} and field ${fieldParam}`,
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
			throw 'Custom joins hasn\'t implemented yet';
		}
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaInstantReportQueryService', IzendaInstantReportQueryService.injectModules.concat(IzendaInstantReportQueryService));
	}
}
