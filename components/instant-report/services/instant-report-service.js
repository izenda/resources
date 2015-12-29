/**
 * Izenda query service which provides dashboard specific queries
 * this is singleton
 */
angular.module('izendaInstantReport').factory('$izendaInstantReportQuery', [
	'$log',
	'$izendaSettings',
	'$izendaRsQuery',
function ($log, $izendaSettings, $izendaRsQuery) {
	'use strict';
	var angularJq$ = angular.element;

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
			fieldOperators = ['LessThanField', 'GreaterThanField', 'EqualsField', 'NotEqualsField'];
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
		return $izendaRsQuery.query('getjsonschema', [], {
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
	 * Send report set config to server and return it's preview.
	 */
	function getNewReportSetPreview(reportSetConfig) {
		var paramsString = JSON.stringify(reportSetConfig);
		return $izendaRsQuery.query('getNewReportSetPreviewFromJson', [paramsString], {
			dataType: 'text',
			headers: {
				'Content-Type': 'text/html'
			},
			method: 'POST'
		}, {
			handler: function () {
				return 'Failed to get report set preview';
			}
		});
	}

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

	function getFieldFunctions(field, forSubtotals) {
		if (!angular.isObject(field))
			throw 'Field should be object';
		var parameters;
		var typeGroup = getCurrentTypeGroup(field);
		if (forSubtotals) {
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
		} else {
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
			'type': typeGroup,
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

	function getFieldOperatorList(field, dataTypeGroup) {
		if (!angular.isObject(field))
			throw 'Field should be object.';
		var typeGroup = getCurrentTypeGroup(field, dataTypeGroup);
		return $izendaRsQuery.rsQuery({
			'cmd': 'GetOptionsByPath',
			'p': 'OperatorList',
			'typeGroup': typeGroup,
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

	function getExistentValuesList(tables, constraintFilters, filter, simpleJoins) {
		var isEmptyFilterValue = function (filter) {
			if (!angular.isArray(filter.values) || filter.values.length === 0)
				return true;
			if (filter.values.length === 1 && filter.values[0] === '')
				return true;
			if (filter.values.length === 2 && filter.values[0] === '' && filter.values[1] === '')
				return true;
			return false;
		}

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

		// add constraint filters params
		var counter = 0;
		angular.element.each(constraintFilters, function () {
			var constraintFilter = this;
			if (constraintFilter.field !== null && angular.isObject(constraintFilter.operator)
				&& constraintFilter.operator.value !== '' && !isEmptyFilterValue(constraintFilter)) {
				var constraintParamPart = {};
				constraintParamPart['fc' + counter] = constraintFilter.field.sysname;
				constraintParamPart['fo' + counter] = constraintFilter.operator.value;
				var constraintOperatorType = getFieldFilterOperatorValueType(constraintFilter.operator);
				if (constraintOperatorType === 'twoValues') {
					constraintParamPart['fvl' + counter] = constraintFilter.values[0];
					constraintParamPart['fvr' + counter] = constraintFilter.values[1];
				} else if (constraintOperatorType === 'twoDates') {
					constraintParamPart['fvl' + counter] = moment(constraintFilter.values[0]).format($izendaSettings.getDateFormat().date);
					constraintParamPart['fvr' + counter] = moment(constraintFilter.values[1]).format($izendaSettings.getDateFormat().date);
				} else if (constraintOperatorType === 'oneDate') {
					constraintParamPart['fvl' + counter] = moment(constraintFilter.values[0]).format($izendaSettings.getDateFormat().date);
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
			angularJq$.each(tables, function () {
				tableNames.push(this.sysname);
			});
			queryParams['tbl0'] = tableNames.join('\'');

			queryParams['clear'] = 1;

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
		loadReport: loadReport,
		getNewReportSetPreview: getNewReportSetPreview,
		saveReportSet: saveReportSet,
		setReportAsCrs: setReportAsCrs,
		getContraintsInfo: getContraintsInfo,
		getFieldFunctions: getFieldFunctions,
		getFieldFormats: getFieldFormats,
		getVgStyles: getVgStyles,
		getExpressionTypes: getExpressionTypes,
		getDrillDownStyles: getDrillDownStyles,
		getSubreports: getSubreports,
		getFieldOperatorList: getFieldOperatorList,
		getExistentValuesList: getExistentValuesList,
		getVisualizationConfig: getVisualizationConfig
	};
}]);
