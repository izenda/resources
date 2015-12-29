(function () {
	/**
	 * Report set object template
	 */
	angular.module('izendaInstantReport').constant('izendaInstantReportObjectDefaults', {
		reportName: null,
		reportCategory: null,
		dataSources: [],
		charts: [],
		filters: [],
		filterOptions: {
			require: 'None',
			filterLogic: ''
		},
		drillDownFields: [],
		options: {
			distinct: true,
			isSubtotalsEnabled: false,
			top: '',
			previewTop: 10,
			title: '',
			titleAlign: 'L',
			description: '',
			descriptionAlign: 'L',
			headerAndFooter: {
				reportHeader: '',
				reportFooter: '',
				pageHeader: ''
			},
			style: {
				borderColor: '#ffffff',
				headerColor: '#483d8b',
				headerForecolor: '#ffffff',
				itemColor: '#ffffff',
				itemForeColor: '#000000',
				itemAltColor: '#dcdcdc',
				isHeadersBold: false,
				isHeadersItalic: false,
				customCss: ''
			},
			page: {
				landscapePrinting: false,
				showPageNumber: false,
				showDateAndTime: false,
				usePagination: true,
				itemsPerPage: 1000,
				addBookmarkForVg: false,
				pageBreakAfterVg: false,
				minimizeGridWidth: true,
				vgStyle: 'CommaDelimited'
			}
		},
		isFieldsAutoGrouped: false
	});

	/**
	 * Filter object template
	 */
	angular.module('izendaInstantReport').constant('izendaFilterObjectDefaults', {
		initialized: false,
		field: null,
		required: false,
		operatorString: '',
		operator: null,
		operators: [],
		existentValues: [],
		values: [],
		isValid: true,
		validationMessages: [],
		validationMessageString: ''
	});

	/**
	 * Chart object template
	 */
	angular.module('izendaInstantReport').constant('izendaChartObjectDefaults', {
		id: 0,
		title: '',
		top: 100,
		chartType: null
	});

	/**
	 * Default (empty) function (for group by "function" field property)
	 */
	angular.module('izendaInstantReport').constant('izendaDefaultFunctionObject', {
		dataType: 'Unknown',
		dataTypeGroup: 'None',
		isScalar: '0',
		sqlTemplate: '{0}',
		text: '...',
		value: 'None',
		group: ''
	});

	/**
	 * Default (empty) subtotal function.
	 */
	angular.module('izendaInstantReport').constant('izendaDefaultSubtotalFunctionObject', {
		dataType: 'Unknown',
		dataTypeGroup: 'None',
		isScalar: '0',
		sqlTemplate: '{0}',
		text: '(Default)',
		value: 'DEFAULT',
		group: ''
	});

	/**
	 * Default (empty) function (for group by "function" field property)
	 */
	angular.module('izendaInstantReport').constant('izendaDefaultFormatObject', {
		text: '...',
		value: '{0}',
		group: ''
	});
})();

/**
* Storage for report object for instant report page.
*/
angular.module('izendaInstantReport').factory('$izendaInstantReportStorage', [
			'$injector',
			'$window',
			'$q',
			'$log',
			'$sce',
			'$rootScope',
			'izendaInstantReportConfig',
			'$izendaUrl',
			'$izendaSettings',
			'$izendaInstantReportQuery',
			'$izendaScheduleService',
			'$izendaShareService',
function ($injector, $window, $q, $log, $sce, $rootScope, izendaInstantReportConfig, $izendaUrl, $izendaSettings,
	$izendaInstantReportQuery, $izendaScheduleService, $izendaShareService) {
	'use strict';
	var angularJq$ = angular.element;

	// const:
	var EMPTY_FIELD_GROUP_OPTION = $injector.get('izendaDefaultFunctionObject');
	var EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS = $injector.get('izendaDefaultSubtotalFunctionObject');
	var EMPTY_EXPRESSION_TYPE = {
		value: '...',
		text: '...'
	};
	var EMPTY_FIELD_FORMAT_OPTION = $injector.get('izendaDefaultFormatObject');
	var UNCATEGORIZED = "Uncategorized";

	var isPageInitialized = false;
	var isPageReady = false;
	var existingReportLoadingSchedule = null;

	var reportSet = angular.extend({}, $injector.get('izendaInstantReportObjectDefaults'));
	var activeTables = [];
	var activeFields = [];
	var activeCheckedFields = [];
	var constaints = [];
	var visualizationConfig = null;
	var vgStyles = null;
	var drillDownStyles = null;
	var expressionTypes = null;
	var subreports = null;
	var currentActiveField = null;

	var uiPanelsState = {
		filtersPanelOpened: false
	};
	var nextId = 1;
	var orderCounter = 1;
	var previewHtml = '';

	var reportSetValidation = {
		isValid: false,
		messages: []
	};

	/////////////////////////////////////////
	// common functions
	/////////////////////////////////////////

	function humanize(text) {
		if (!angular.isString(text))
			return text;
		var result = text
			// insert a space between lower & upper
			.replace(/([a-z])([A-Z\d])/g, '$1 $2')
			// space before last upper in a sequence followed by lower
			.replace(/\b([A-Z\d]+)([A-Z\d])([a-z])/, '$1 $2$3')
			// uppercase the first character
			.replace(/^./, function (text) {
				return text.toUpperCase();
			});
		return result;
	}

	/**
	 * Get type group of field operator
	 */
	var getFieldFilterOperatorValueType = function (operator) {
		return $izendaInstantReportQuery.getFieldFilterOperatorValueType(operator);
	};

	var isUncategorized = function (categoryName) {
		return !angular.isString(categoryName)
			|| categoryName.trim() === ''
			|| categoryName.toLowerCase() === UNCATEGORIZED.toLowerCase();
	};

	var getReportSetFullName = function () {
		var category = reportSet.reportCategory;
		var name = reportSet.reportName;
		if (!angular.isString(name) || name.trim() === '')
			return null;
		var result = '';
		if (!isUncategorized(category)) {
			result += category + '\\';
		}
		result += name;
		return result;
	};

	var getNextId = function () {
		return nextId++;
	};

	var getNextOrder = function () {
		return orderCounter++;
	};

	/**
	 * Becomes true when page is ready to work
	 */
	var getPageReady = function() {
		return isPageReady;
	}

	/**
	 * Get whole report set
	 */
	var getReportSet = function () {
		return reportSet;
	};

	/**
	 * Get datasources
	 */
	var getDataSources = function () {
		return reportSet.dataSources;
	};

	/**
	 * Set datasources
	 */
	var setDataSources = function (dataSources) {
		if (!angular.isArray(dataSources))
			throw '"dataSources" parameter should be array.';
		reportSet.dataSources = dataSources;
	};

	/**
	 * Get filters reference
	 */
	var getFilters = function () {
		return reportSet.filters;
	};

	/**
	 * Get report set options
	 */
	var getOptions = function () {
		return reportSet.options;
	};

	/**
	 * Get drilldown fields
	 */
	var getDrillDownFields = function () {
		return reportSet.drillDownFields;
	};

	/**
	 * Get filter options
	 */
	var getFilterOptions = function () {
		return reportSet.filterOptions;
	};

	/**
	 * Get preview html
	 */
	var getPreview = function () {
		return previewHtml;
	};

	/**
	 * Parse and set contraints
	 */
	var setConstraints = function (constraintsData) {
		constaints = constraintsData.Data;
	};

	/**
	 * Find category by given id
	 */
	var getCategoryById = function (id) {
		var i = 0,
		    datasources = getDataSources();
		while (i < datasources.length) {
			var datasource = datasources[i];
			if (datasource.id === id)
				return datasource;
			i++;
		}
		return null;
	};

	/**
	 * Find table by given id
	 */
	var getTableById = function (id) {
		var i = 0,
		    datasources = getDataSources();
		while (i < datasources.length) {
			var j = 0,
					tables = datasources[i].tables;
			while (j < tables.length) {
				var table = tables[j];
				if (table.id === id)
					return table;
				j++;
			}
			i++;
		}
		return null;
	};

	/**
	 * Find field by given id
	 */
	var getFieldById = function (id) {
		var i = 0,
		    datasources = getDataSources();
		while (i < datasources.length) {
			var j = 0,
			    tables = datasources[i].tables;
			while (j < tables.length) {
				var k = 0,
				    fields = tables[j].fields;
				while (k < fields.length) {
					var field = fields[k];
					if (field.id === id)
						return field;
					k++;
				}
				j++;
			}
			i++;
		}
		return null;
	};

	var getAllTables = function () {
		var result = [];
		angular.element.each(getDataSources(), function () {
			var category = this;
			angularJq$.each(category.tables, function () {
				result.push(this);
			});
		});
		return result;
	};

	/**
	* Get checked tables
	*/
	var getActiveTables = function () {
		return activeTables;
	};

	/**
	 * Find field by sysname
	 */
	var getFieldBySysName = function (sysname, findInAllTables) {
		var result = null;
		var tablesCollection = (typeof (findInAllTables) === 'boolean' && findInAllTables)
			? getAllTables()
			: getActiveTables();
		angularJq$.each(tablesCollection, function () {
			angularJq$.each(this.fields, function () {
				if (this.sysname === sysname)
					result = this;
			});
		});
		return result;
	};

	/**
	 * Get checked and not checked fields in active tables;
	 */
	var getAllFieldsInActiveTables = function () {
		return activeFields;
	};

	/**
	 * Get active fields
	 */
	var getActiveFields = function (table) {
		var result = [];
		angularJq$.each(table.fields, function () {
			var field = this;
			if (!field.isMultipleColumns) {
				if (field.checked) {
					result.push(field);
				}
			} else {
				angularJq$.each(field.multipleColumns, function () {
					var multipleField = this;
					if (multipleField.checked) {
						result.push(multipleField);
					}
				});
			}

		});
		return result;
	};

	/**
	 * Works like each. Iterate through active fields.
	 */
	var eachActiveFields = function (fieldHandler, context) {
		if (!angular.isFunction(fieldHandler))
			throw 'fieldHandler should be a function.';
		var activeTables = getActiveTables();
		angularJq$.each(activeTables, function () {
			var table = this;
			var activeFields = getActiveFields(table);
			angularJq$.each(activeFields, function () {
				var field = this;
				fieldHandler.call(angular.isDefined(context) ? context : this, field, table);
			});
		});
	};

	/**
	 * Get all active fields.
	 */
	var getAllActiveFields = function () {
		var result = [];
		eachActiveFields(function (field) {
			result.push(field);
		});
		return result;
	};

	/////////////////////////////////////////
	// group functions
	/////////////////////////////////////////

	/**
	 * Check if functions allowed to field
	 */
	var allowFieldFunctions = function (field) {
		if (angular.isObject(field.expressionType) && field.expressionType.value !== '...')
			return ['Binary', 'Other', 'None'].indexOf(field.expressionType) < 0;
		return field.sqlType !== 'Text' && field.sqlType !== 'Image';
	}

	/**
	 * Check if field grouped
	 */
	var isFieldGrouped = function (field) {
		var compareWithValue = EMPTY_FIELD_GROUP_OPTION.value;
		return field.groupByFunction.value.toLowerCase() !== compareWithValue.toLowerCase();
	}

	/**
	 * Update field formats (it depends on selected group function)
	 */
	var updateFieldFormats = function (field, defaultFormatString) {
		var formatValueToApply = angular.isString(defaultFormatString) ? defaultFormatString : EMPTY_FIELD_FORMAT_OPTION.value;

		return $q(function (resolve) {
			var gotFieldFormats = function (returnObj) {
				var formatToApply = EMPTY_FIELD_FORMAT_OPTION;
				var groups = [];
				angularJq$.each(returnObj, function () {
					var group = this;
					angularJq$.each(group.options, function () {
						var option = this;
						option.group = group.name;
						if (option.value === formatValueToApply) {
							formatToApply = option;
						}
						groups.push(option);
					});
				});
				field.formatOptionGroups = groups;
				field.format = formatToApply;
				resolve(field);
			};
			if (isFieldGrouped(field)) {
				$izendaInstantReportQuery.getFieldFormats(field, field.groupByFunction.dataTypeGroup).then(function (returnObj) {
					gotFieldFormats(returnObj);
				});
			} else {
				$izendaInstantReportQuery.getFieldFormats(field).then(function (returnObj) {
					gotFieldFormats(returnObj);
				});
			}
		});
	}

	/**
	 * Get group by given value
	 */
	var getGroupByValue = function (field, value) {
		var i = 0;
		while (i < field.groupByFunctionOptions.length) {
			var option = field.groupByFunctionOptions[i];
			if (option.value.toLowerCase() === value.toLowerCase())
				return option;
			i++;
		}
		return null;
	};

	/**
	 * Get Subtotal group by given value
	 */
	var getGroupBySubtotalValue = function (field, value) {
		var i = 0;
		while (i < field.groupBySubtotalFunctionOptions.length) {
			var option = field.groupBySubtotalFunctionOptions[i];
			if (option.value.toLowerCase() === value.toLowerCase())
				return option;
			i++;
		}
		return null;
	};

	/**
	 * Check if checked fields has function
	 */
	var isReportUseGroup = function () {
		var activeTables = getActiveTables();
		if (activeTables.length === 0)
			return false;
		var result = false;
		eachActiveFields(function (field) {
			if (isFieldGrouped(field)) {
				result = true;
			}
		});
		return result;
	};

	/**
	 * Reset all groups which was grouped automatically.
	 */
	var resetAutoGroups = function () {
		// check group function:
		eachActiveFields(function (field) {
			if (allowFieldFunctions(field)) {
				field.groupByFunction = getGroupByValue(field, 'NONE');
				updateFieldFormats(field);
			}
		});
	};

	/** 
	 * Check if report has group and apply group by for other columns.
	 */
	var applyAutoGroups = function () {
		var hasGroup = isReportUseGroup();
		if (!hasGroup) {
			return;
		}
		// check group function:
		eachActiveFields(function (field) {
			if (!allowFieldFunctions(field))
				return;
			if (!isFieldGrouped(field)) {
				field.groupByFunction = getGroupByValue(field, 'GROUP');
				updateFieldFormats(field);
			}
		});
	};

	/**
	 * Get possible visual group styles from server
	 */
	var initializeVgStyles = function () {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getVgStyles().then(function (result) {
				vgStyles = result[0].options;
				resolve();
			});
		});
	};

	/**
	 * Get visual group styles
	 */
	var getVgStyles = function () {
		return vgStyles;
	};

	/////////////////////////////////////////
	// visualization functions
	/////////////////////////////////////////

	var findVisualizationInConfig = function (category, name) {
		if (!angular.isObject(visualizationConfig))
			return null;
		var result = null;
		angular.element.each(visualizationConfig.categories, function () {
			if (this.name === category) {
				angular.element.each(this.charts, function () {
					if (this.name === name)
						result = this;
				});
			}
		});
		return result;
	};

	var initializeVisualizations = function () {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getVisualizationConfig().then(function (config) {
				visualizationConfig = config;
				if (!angular.isObject(visualizationConfig) || !angular.isArray(visualizationConfig.categories))
					return;
				angular.element.each(visualizationConfig.categories, function () {
					var categoryName = this.name;
					angular.element.each(this.charts, function () {
						this.categoryName = categoryName;
					});
				});
				resolve();
			});
		});
	};

	var getVisualizationConfig = function () {
		return visualizationConfig;
	};

	/**
	 * Initialize possible expression types.
	 */
	var initializeExpressionTypes = function () {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getExpressionTypes().then(function (result) {
				expressionTypes = [];
				angular.element.each(result[0].options, function () {
					if (this.value !== '') {
						expressionTypes.push(this);
					}
				});
				resolve();
			});
		});

	};

	/**
	 * Initialize possible drilldown styles from server
	 */
	var initializeDrillDownStyles = function () {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getDrillDownStyles().then(function (result) {
				drillDownStyles = [];
				angular.element.each(result[0].options, function () {
					if (this.value !== '') {
						drillDownStyles.push(this);
					}
				});
				resolve();
			});
		});
	};

	/**
	 * Get drilldown styles
	 */
	var getDrillDownStyles = function () {
		return drillDownStyles;
	};

	var getExpressionTypes = function () {
		return expressionTypes;
	};

	var initializeSubreports = function () {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getSubreports().then(function (result) {
				subreports = result[0].options;
				resolve();
			});
		});
	}

	var getSubreports = function () {
		return subreports;
	};

	/////////////////////////////////////////
	// validation functions
	/////////////////////////////////////////

	/**
	 * Remove all validation messages
	 */
	var clearValidation = function () {
		if (!angular.isArray(getDataSources()))
			return;
		angularJq$.each(getDataSources(), function () {
			var category = this;
			angularJq$.each(category.tables, function () {
				var table = this;
				table.validateMessages = [];
				table.validateMessageLevel = null;
				angularJq$.each(table.fields, function () {
					var field = this;
					field.validateMessages = [];
					field.validateMessageLevel = null;
				});
			});
		});
	};

	/**
	 * Validate report and set validate messages to tables and fields
	 */
	var validateReport = function () {
		clearValidation();
		var validationFailed = false;
		var activeTables = getActiveTables();
		if (activeTables.length === 0)
			return;
		var hasGroup = isReportUseGroup();

		eachActiveFields(function (field) {
			if (hasGroup && !allowFieldFunctions(field)) {
				// if field have sql type which can't be grouped
				field.validateMessages.push({
					messageType: 'danger',
					message: 'Can\'t use fields with sql type "' + field.sqlType + '" with GROUP BY statement'
				});
				field.validateMessageLevel = 'danger';
				validationFailed = true;
			} else if (hasGroup && !isFieldGrouped(field)) {
				// if field have no group function
				field.validateMessages.push({
					messageType: 'danger',
					message: 'If functions are used, each selection must be a function.'
				});
				field.validateMessageLevel = 'danger';
				validationFailed = true;
			}
		});
		return validationFailed;
	};

	/**
	 * Clear global validation
	 */
	var clearReportSetValidation = function () {
		reportSetValidation.isValid = true;
		reportSetValidation.messages = [];
	};

	/**
	 * Do global validation. 
	 */
	var validateReportSet = function () {
		clearReportSetValidation();
		var rsv = reportSetValidation;

		// validate active tables and fields
		var activeFields = getAllFieldsInActiveTables();

		var hasActiveFields = false;
		angular.element.each(activeFields, function () {
			hasActiveFields |= this.checked;
		});
		if (!hasActiveFields) {
			rsv.isValid = false;
			rsv.messages.push({
				type: 'danger',
				text: 'You should select at least one field to see preview.'
			});
		}
		return rsv.isValid;
	};

	/**
	 * Return report set validation state
	 */
	var isReportSetValid = function () {
		return reportSetValidation.isValid;
	};

	/**
	 * Return report set validation messages
	 */
	var getReportSetValidationMessages = function () {
		return reportSetValidation.messages;
	};

	/////////////////////////////////////////
	// common UI functions
	/////////////////////////////////////////

	var hideAllPanels = function () {
		uiPanelsState.filtersPanelOpened = false;
	};

	var getFiltersPanelOpened = function () {
		return uiPanelsState.filtersPanelOpened;
	};

	var setFiltersPanelOpened = function (value) {
		hideAllPanels();
		uiPanelsState.filtersPanelOpened = value;
	}

	/////////////////////////////////////////
	// datasources functions
	/////////////////////////////////////////

	/**
	 * Algorithm which find nodes which can't be deactivated
	 */
	var findBridgesForGraph = function (nodes, links) {
		var n = nodes.length;
		var used = new Array(n);
		var tin = new Array(n);
		var fup = new Array(n);
		var timer;
		var bridgeNodes = [];

		var getLinksForNode = function (node) {
			var result = [];
			for (var i = 0; i < links.length; i++) {
				var link = links[i];
				var link1 = link[0];
				var link2 = link[1];
				if (link1 === link2)
					continue;
				if (link1 === node && result.indexOf(link2) < 0)
					result.push(link2);
				if (link2 === node && result.indexOf(link1) < 0)
					result.push(link1);
			}
			return result;
		};

		var dfs = function (v, p) {
			used[v] = true;
			tin[v] = fup[v] = timer++;
			var currentLinks = getLinksForNode(nodes[v]);
			for (var i = 0; i < currentLinks.length; i++) {
				var to = currentLinks[i];
				if (to === p) continue;
				if (used[to])
					fup[v] = Math.min(fup[v], tin[to]);
				else {
					dfs(to, v);
					fup[v] = Math.min(fup[v], fup[to]);
					if (fup[to] > tin[v]) {
						var isToNodeEdge = getLinksForNode(to).length < 2;
						var isVNodeEdge = currentLinks.length < 2;
						if (!isToNodeEdge && bridgeNodes.indexOf(to) < 0) {
							bridgeNodes.push(to);
						}
						if (!isVNodeEdge && bridgeNodes.indexOf(v) < 0) {
							bridgeNodes.push(v);
						}
					}
				}
			}
		};

		var findBridges = function () {
			timer = 0;
			for (var ii = 0; ii < n; ii++) {
				used[ii] = false;
				tin[ii] = null;
				fup[ii] = null;
			}
			for (var i = 0; i < n; i++)
				if (!used[i])
					dfs(i);
		}
		findBridges();

		return bridgeNodes;
	};

	/**
	 * Constraints check and update tables availability.
	 */
	var updateTablesAvailability = function () {
		// create tables which available by foreign keys
		var currentActiveTables = getActiveTables();
		var applyConstraints = currentActiveTables.length !== 0;
		var activeTableNames = [];
		var nodeConstraints = [];
		var nodes = [];
		angular.element.each(currentActiveTables, function (iTable, table) {
			nodes.push(iTable);
			activeTableNames.push(table.sysname);
		});

		// process constraints data
		var foreignKeyTables = [];
		angularJq$.each(constaints, function () {
			var constraint = this;
			var part1 = constraint[0];
			var part2 = constraint[1];
			var part1Index = activeTableNames.indexOf(part1);
			var part2Index = activeTableNames.indexOf(part2);
			if (part1Index >= 0 && part2Index >= 0 && part1 !== part2) {
				nodeConstraints.push([part1Index, part2Index]);
			}
			angularJq$.each(currentActiveTables, function () {
				var table = this;
				if (part1 === table.sysname || part2 === table.sysname) {
					if (foreignKeyTables.indexOf(part1) < 0)
						foreignKeyTables.push(part1);
					if (foreignKeyTables.indexOf(part2) < 0)
						foreignKeyTables.push(part2);
				}
			});
		});

		// enable/disable tables
		angularJq$.each(getDataSources(), function () {
			var category = this;
			category.enabled = false;
			// check tables
			angularJq$.each(category.tables, function () {
				var table = this;
				if (!applyConstraints) {
					category.enabled = true;
					table.enabled = true;
					angularJq$.each(table.fields, function () {
						var field = this;
						field.enabled = table.enabled;
					});
					return;
				}
				table.enabled = table.active || foreignKeyTables.indexOf(table.sysname) >= 0;
				category.enabled |= table.enabled;
				angularJq$.each(table.fields, function () {
					var field = this;
					field.enabled = table.enabled;
				});
			});
		});

		// disable bridge tables (tables which are links between two other active tables):
		var result = findBridgesForGraph(nodes, nodeConstraints);
		angular.element.each(result, function () {
			var idx = this;
			currentActiveTables[idx].enabled = false;
		});

	};

	/**
	 * Set "selected = false" for all fields
	 */
	var unselectAllFields = function () {
		angularJq$.each(getDataSources(), function () {
			var category = this;
			angularJq$.each(category.tables, function () {
				var table = this;
				angularJq$.each(table.fields, function () {
					var field = this;
					field.selected = false;
					angularJq$.each(field.multipleColumns, function () {
						this.selected = false;
					});
				});
			});
		});
	};



	/**
	 * Create active tables array
	 */
	var syncActiveTablesArray = function () {
		activeTables = [];
		activeFields = [];
		activeCheckedFields = [];
		angularJq$.each(getDataSources(), function () {
			angularJq$.each(this.tables, function () {
				if (this.active) {
					activeTables.push(this);
					angularJq$.each(this.fields, function () {
						activeFields.push(this);
						if (this.checked)
							activeCheckedFields.push(this);
					});
				}
			});
		});
	}

	/**
	 * Update tree state after checking table
	 */
	var updateParentFolders = function (table, syncCollapse) {
		var category = getCategoryById(table.parentId);
		syncActiveTablesArray();

		// update category active
		var j = 0,
				hasActiveTables = false;
		while (!hasActiveTables && j < category.tables.length) {
			if (category.tables[j].active) {
				hasActiveTables = true;
			}
			j++;
		}
		category.active = hasActiveTables;
		if (syncCollapse)
			category.collapsed = !hasActiveTables;
		updateTablesAvailability();
	};

	/**
	 * Update tree state after checking field
	 */
	var updateParentFoldersAndTables = function (field, syncCollapse) {
		var table = getTableById(field.parentId);

		// update table active
		var hasCheckedFields = false,
				i = 0;
		while (!hasCheckedFields && i < table.fields.length) {
			if (table.fields[i].checked)
				hasCheckedFields = true;
			i++;
		}

		// if table checked state false -> true:
		if (hasCheckedFields && !table.active)
			table.order = getNextOrder();
		// set table active
		table.active = hasCheckedFields || !table.enabled;

		if (syncCollapse)
			table.collapsed = !hasCheckedFields;

		// update table
		updateParentFolders(table, syncCollapse);
	};

	/**
	 * Update drilldowns
	 */
	var updateDrilldowns = function () {
		var drilldownFields = reportSet.drillDownFields;
		if (drilldownFields.length === 0)
			return;
		var i = 0;
		while (i < drilldownFields.length) {
			var drilldownField = drilldownFields[i];
			var isDdFieldActual = false;
			angular.element.each(getAllFieldsInActiveTables(), function () {
				if (drilldownField.id === this.id) {
					isDdFieldActual = true;
				}
			});
			if (isDdFieldActual) {
				i++;
			} else {
				drilldownFields.splice(i, 1);
			}
		}
	};

	/**
	* Get filtered datasources
	*/
	var filterDataSources = function (searchString) {
		if (!angular.isArray(getDataSources()))
			return;
		if (searchString === '') {
			angular.element.each(getDataSources(), function () {
				var category = this;
				category.collapsed = false;
				category.visible = true;
				angular.element.each(category.tables, function () {
					var table = this;
					table.highlight = false;
					table.collapsed = true;
					table.visible = true;
					angular.element.each(table.fields, function () {
						var field = this;
						field.highlight = false;
					});
				});
			});
			return;
		}

		angular.element.each(getDataSources(), function () {
			var category = this;
			var isTablesFound = false;
			angular.element.each(category.tables, function () {
				var table = this;
				table.highlight = false;
				if (table.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
					table.highlight = true;
					isTablesFound = true;
				}
				var isFieldsFound = false;
				angular.element.each(table.fields, function () {
					var field = this;
					field.highlight = false;
					if (field.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
						field.highlight = true;
						isFieldsFound = true;
						isTablesFound = true;
					}
				});
				table.collapsed = !isFieldsFound;
				table.visible = table.highlight || isFieldsFound;
			});
			category.collapsed = !isTablesFound;
			category.visible = isTablesFound;
		});
	};

	var createFieldObject = function (fieldName, tableId, tableSysname, tableName, fieldSysname, fieldTypeGroup, fieldType, fieldSqlType) {
		var fieldObject = {
			id: getNextId(),
			isInitialized: false,
			isMultipleColumns: false,
			multipleColumns: [],
			parentId: tableId,
			name: fieldName,
			tableSysname: tableSysname,
			tableName: tableName,
			sysname: fieldSysname,
			typeGroup: fieldTypeGroup,
			type: fieldType,
			sqlType: fieldSqlType,
			highlight: false,
			enabled: true,
			checked: false,
			selected: false,
			collapsed: false,
			isVgUsed: false,
			breakPageAfterVg: false,
			description: humanize(fieldName),
			isDescriptionSetManually: false,
			order: 0,
			// formats
			format: EMPTY_FIELD_FORMAT_OPTION,
			formatOptionGroups: [],
			// group by
			groupByFunction: EMPTY_FIELD_GROUP_OPTION, // field function (used to select GROUP BY function)
			groupByFunctionOptions: [], // available field functions to select
			// Subtotal group by
			groupBySubtotalFunction: EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS, // Subtotal field function  (used to select GROUP BY function for Subtotal)
			groupBySubtotalFunctionOptions: [], // available field functions for subtotals
			subtotalExpression: '',
			sort: null,
			italic: false,
			columnGroup: '',
			separator: false,
			textHighlight: '',
			cellHighlight: '',
			valueRange: '',
			width: '',
			labelJustification: 'L',
			valueJustification: 'L',
			visible: true,
			gradient: false,
			bold: false,
			drillDownStyle: 'DetailLink',
			customUrl: '',
			subreport: '',
			expression: '',
			expressionType: EMPTY_EXPRESSION_TYPE,
			groupByExpression: false,
			validateMessages: [],
			validateMessageLevel: null
		};
		return fieldObject;
	};

	/**
	 * Copy field object state
	 */
	var copyFieldObject = function (from, to) {
		to.isInitialized = from.isInitialized;
		to.parentId = from.parentId;
		to.tableSysname = from.tableSysname;
		to.sysname = from.sysname;
		to.typeGroup = from.typeGroup;
		to.type = from.type;
		to.sqlType = from.sqlType;
		to.enabled = from.enabled;
		to.expression = from.expression;
		to.expressionType = from.expressionType;
		to.groupByExpression = from.groupByExpression;
		to.checked = from.checked;
		to.isVgUsed = from.isVgUsed;
		to.breakPageAfterVg = from.breakPageAfterVg;
		to.description = from.description;
		to.isDescriptionSetManually = from.isDescriptionSetManually;
		to.order = from.order;
		to.format = from.format;
		to.formatOptionGroups = from.formatOptionGroups;
		to.groupByFunction = from.groupByFunction;
		to.groupByFunctionOptions = from.groupByFunctionOptions;
		to.groupBySubtotalFunction = from.groupBySubtotalFunction;
		to.groupBySubtotalFunctionOptions = from.groupBySubtotalFunctionOptions;
		to.sort = from.sort;
		to.italic = from.italic;
		to.columnGroup = from.columnGroup;
		to.separator = from.separator;
		to.textHighlight = from.textHighlight;
		to.cellHighlight = from.cellHighlight;
		to.valueRange = from.valueRange;
		to.width = from.width;
		to.labelJustification = from.labelJustification;
		to.valueJustification = from.valueJustification;
		to.gradient = from.gradient;
		to.visible = from.visible;
		to.bold = from.bold;
		to.drillDownStyle = from.drillDownStyle;
		to.customUrl = from.customUrl;
		to.subreport = from.subreport;
		to.validateMessages = from.validateMessages;
		to.validateMessageLevel = from.validateMessageLevel;
	};

	/**
	 * Reset datasources state
	 */
	var resetDataSources = function () {
		var datasources = getDataSources();
		if (!angular.isArray(datasources))
			return;
		angular.element.each(datasources, function (iCategory, category) {
			category.visible = true;
			category.active = false;
			category.enabled = true;
			category.collapsed = true;
			// iterate tables
			angular.element.each(category.tables, function (tableName, table) {
				table.visible = true;
				table.active = false;
				table.enabled = true;
				table.collapsed = true;
				table.validateMessages = [];
				table.validateMessageLevel = null;
				// iterate fields
				angular.element.each(table.fields, function (fieldName, field) {
					field.isMultipleColumns = false;
					field.multipleColumns = [];
					field.highlight = false;
					field.enabled = true;
					field.checked = false;
					field.selected = false;
					field.collapsed = false;
					field.isVgUsed = false,
					field.breakPageAfterVg = false;
					field.description = '';
					field.isDescriptionSetManually = false;
					field.order = 0;
					field.format = EMPTY_FIELD_FORMAT_OPTION;
					field.formatOptionGroups = [];
					field.groupByFunction = EMPTY_FIELD_GROUP_OPTION;
					field.groupByFunctionOptions = [];
					field.groupBySubtotalFunction = EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS;
					field.groupBySubtotalFunctionOptions = [];
					field.subtotalExpression = '';
					field.sort = null;
					field.italic = false;
					field.columnGroup = '';
					field.separator = false;
					field.textHighlight = '';
					field.cellHighlight = '';
					field.valueRange = '';
					field.width = '';
					field.labelJustification = 'L';
					field.valueJustification = 'L';
					field.gradient = false;
					field.visible = true;
					field.bold = false;
					field.drillDownStyle = 'DetailLink';
					field.customUrl = '';
					field.subreport = '';
					field.expression = '';
					field.expressionType = EMPTY_EXPRESSION_TYPE;
					field.groupByExpression = false;
					field.validateMessages = [];
					field.validateMessageLevel = null;
				});
			});
		});
	};

	/**
	* Convert datasources for future use it in app
	*/
	var convertDataSources = function (dataSources) {
		if (!angular.isArray(dataSources))
			return [];
		var result = [];
		// iterate categories
		var uncategorized = null;
		angularJq$.each(dataSources, function (iCategory, category) {
			var categoryObject = {
				id: getNextId(),
				name: category.DataSourceCategory,
				tables: [],
				visible: true,
				active: false,
				enabled: true,
				collapsed: true
			};
			// iterate tables
			angularJq$.each(category.tables, function (tableName, table) {
				var tableObject = {
					id: getNextId(),
					order: 0,
					parentId: categoryObject.id,
					name: table.name,
					sysname: table.sysname,
					fields: [],
					visible: true,
					active: false,
					enabled: true,
					collapsed: true,
					validateMessages: [],
					validateMessageLevel: null
				};
				// iterate fields
				angularJq$.each(table.fields, function (fieldName, field) {
					var fieldObject = createFieldObject(fieldName, tableObject.id, tableObject.sysname, tableObject.name, field.sysname,
						field.typeGroup, field.type, field.sqlType);
					tableObject.fields.push(fieldObject);
				});
				categoryObject.tables.push(tableObject);
			});

			if (isUncategorized(categoryObject.name) && izendaInstantReportConfig.moveUncategorizedToLastPostion) {
				uncategorized = categoryObject;
			} else {
				result.push(categoryObject);
			}
		});

		// move uncategorized to the last position:
		if (uncategorized !== null) {
			result.push(uncategorized);
		}

		if (result.length > 0) {
			result[0].collapsed = false;
		}
		return result;
	};

	/**
	 * Create object with report data which will be send to server.
	 */
	var createReportSetConfigForSend = function (previewTop) {
		// iterate through active fields.
		var activeTables = getActiveTables();
		if (activeTables.length === 0)
			return null;

		var options = angular.extend({}, getOptions());
		var filterOptions = angular.extend({}, getFilterOptions());

		var reportSetConfig = {
			reportName: reportSet.reportName,
			reportCategory: reportSet.reportCategory,
			joinedTables: [],
			drillDownFields: [],
			fields: [],
			filters: [],
			charts: [],
			options: options,
			filterOptions: filterOptions,
			schedule: null,
			share: {}
		};
		// preview top
		if (angular.isNumber(previewTop)) {
			reportSetConfig.options.top = previewTop;
		}

		// schedule
		var scheduleConfig = $izendaScheduleService.getScheduleConfigForSend();
		reportSetConfig.schedule = scheduleConfig;

		// share
		var shareConfig = $izendaShareService.getShareRulesToSend();
		reportSetConfig.share = shareConfig;

		// add drilldown fields.
		angular.element.each(getDrillDownFields(), function () {
			reportSetConfig.drillDownFields.push(this.sysname);
		});

		// add charts
		if (reportSet.charts.length > 0) {
			var chart = reportSet.charts[0];
			if (angular.isObject(chart)) {
				reportSetConfig.charts[0] = {
					name: chart.name,
					category: chart.categoryName,
					properties: chart.properties ? chart.properties : null
				};
			}
		}

		// prepare tables
		var activeFieldsList = getAllActiveFields();
		activeFieldsList.sort(function (field1, field2) {
			return field1.order - field2.order;
		});
		for (var i = 0; i < activeFieldsList.length; i++) {
			activeFieldsList[i].order = i + 1;
		}

		// add filters to config
		angularJq$.each(getFilters(), function () {
			var filter = this;
			if (!filter.isValid)
				return;
			if (filter.field === null || !angular.isObject(filter.operator) || filter.operator.value === '') {
				filter.isValid = false;
				return;
			}

			var preparedValues = filter.values;
			if (angular.isObject(filter.operator) && filter.operator.value !== '') {
				var valueType = getFieldFilterOperatorValueType(filter.operator);
				if (valueType === 'select_multiple' || valueType === 'select_popup' || valueType === 'select_checkboxes') {
					preparedValues = [filter.values.join(',')];
				} else if (valueType === 'field' && filter.values.length === 1 && filter.values[0] !== null) {
					preparedValues = [filter.values[0].sysname];
				} else if (valueType === 'twoDates') {
					preparedValues = [
						moment(filter.values[0]).format($izendaSettings.getDateFormat().date),
						moment(filter.values[1]).format($izendaSettings.getDateFormat().date)];
				} else if (valueType === 'oneDate') {
					preparedValues = [
						moment(filter.values[0]).format($izendaSettings.getDateFormat().date)];
				}
			}

			var filterObj = {
				required: filter.required,
				sysname: filter.field.sysname,
				operatorString: filter.operator.value,
				values: preparedValues
			};
			reportSetConfig.filters.push(filterObj);
		});

		// create config
		angularJq$.each(activeTables, function () {
			var table = this;
			var tableConfig = {
				sysname: table.sysname
			}
			var activeFields = getActiveFields(table);
			angularJq$.each(activeFields, function () {
				var field = this;
				reportSetConfig.fields.push({
					sysname: field.sysname,
					description: field.description ? field.description : humanize(field.name),
					format: field.format,
					groupByFunction: field.groupByFunction,
					groupBySubtotalFunction: field.groupBySubtotalFunction,
					subtotalExpression: field.subtotalExpression,
					sort: field.sort,
					order: field.order,
					italic: field.italic,
					columnGroup: field.columnGroup,
					separator: field.separator,
					valueRange: field.valueRange,
					textHighlight: field.textHighlight,
					cellHighlight: field.cellHighlight,
					width: field.width,
					labelJustification: field.labelJustification,
					valueJustification: field.valueJustification,
					gradient: field.gradient,
					visible: field.visible,
					isVgUsed: field.isVgUsed,
					breakPageAfterVg: field.breakPageAfterVg,
					bold: field.bold,
					drillDownStyle: field.drillDownStyle,
					customUrl: field.customUrl,
					subreport: field.subreport,
					expression: field.expression,
					expressionType: field.expressionType.value,
					groupByExpression: field.groupByExpression
				});
			});
			reportSetConfig.joinedTables.push(tableConfig);
		});
		$log.debug('reportSetConfig: ', reportSetConfig);
		return reportSetConfig;
	};

	/**
	 * Clear report preview.
	 */
	var clearReportPreviewHtml = function () {
		previewHtml = '';
	};

	/**
	 * Get and apply preview for current report set config.
	 */
	var getReportPreviewHtml = function () {
		clearReportPreviewHtml();
		var options = getOptions();
		var reportSetToSend = createReportSetConfigForSend(options.previewTop);
		$izendaInstantReportQuery.getNewReportSetPreview(reportSetToSend).then(function (data) {
			previewHtml = data;
		});
	};

	/**
	 * Set top value for preview
	 */
	var setPreviewTop = function (value) {
		var options = getOptions();
		if (!angular.isNumber(value) || value < 0) {
			options.previewTop = -2147483648;
		} else {
			options.previewTop = value;
		}
	}

	/**
	 * Save report set
	 */
	var saveReportSet = function (name, category) {
		var rs = getReportSet();
		var nameToSave = rs.reportName,
				categoryToSave = rs.reportCategory;
		if (angular.isDefined(name)) {
			nameToSave = name;
		}
		if (angular.isString(category) && category !== '') {
			categoryToSave = category;
		}
		rs.reportName = nameToSave;
		rs.reportCategory = categoryToSave;
		if (isUncategorized(rs.reportCategory)) {
			rs.reportCategory = '';
		}
		var reportSetToSend = createReportSetConfigForSend();
		return $q(function (resolve) {
			$izendaInstantReportQuery.saveReportSet(reportSetToSend).then(function (result) {
				var reportSetFullName = getReportSetFullName();
				if (angular.isString(reportSetFullName))
					$izendaUrl.setReportFullName(reportSetFullName);
				resolve(result);
			});
		});
	};

	/**
	 * Send send report set to server and set it as CRS
	 */
	var setReportSetAsCrs = function () {
		return $q(function (resolve) {
			var reportSetToSend = createReportSetConfigForSend();
			$izendaInstantReportQuery.setReportAsCrs(reportSetToSend).then(function (result) {
				if (result === 'OK') {
					resolve(true);
				} else {
					resolve(false, result);
				}
			});
		});
	};

	/**
	 * Generate pdf with current report and send file to user
	 */
	var exportReportAs = function (type) {
		return $q(function (resolve) {
			setReportSetAsCrs().then(function (reportSetWasSetAsCrs, message) {
				if (reportSetWasSetAsCrs) {
					var addParam = '';
					if (typeof (window.izendaPageId$) !== 'undefined')
						addParam = '&izpid=' + window.izendaPageId$;
					$window.open($izendaUrl.settings.urlRsPage + '?output=' + type + addParam, '_self');
					resolve(true);
				} else {
					resolve(false, message);
				}
			});
		});
	};

	/**
	 * Generate html and open print page.
	 */
	var printReportAsHtml = function () {
		return $q(function (resolve) {
			setReportSetAsCrs().then(function (success, message) {
				if (success) {
					var addParam = '';
					if (typeof (window.izendaPageId$) !== 'undefined')
						addParam = '&izpid=' + window.izendaPageId$;
					ExtendReportExport(responseServer.OpenUrl, 'rs.aspx?p=htmlreport&print=1' + addParam, 'aspnetForm', '');
					resolve(true);
				} else {
					resolve(false, message);
				}
			});
		});
	};

	/**
	 * Print report function
	 */
	var printReport = function (printType) {
		return $q(function (resolve) {
			if (printType === 'html') {
				printReportAsHtml().then(function (success, message) {
					resolve(success, message);
				});
			} else if (printType === 'pdf') {
				exportReportAs('PDF').then(function (success, message) {
					resolve(success, message);
				});
			} else {
				resolve(false, 'Unknown print type ' + printType);
			}
		});
	};

	/**
	 * Open report in report designer.
	 */
	var openReportInDesigner = function() {
		setReportSetAsCrs().then(function () {
			var url = $izendaUrl.settings.urlReportDesigner;
			if (angular.isString(reportSet.reportName) && reportSet.reportName !== '')
				url += '?rn=' + getReportSetFullName() + '&tab=Fields';
			else
				url += '?tab=Fields';
			$window.location.href = url;
		});
	};

	/**
	 * Export report function
	 */
	var exportReport = function (exportType) {
		return $q(function (resolve) {
			if (exportType === 'excel') {
				exportReportAs('XLS(MIME)').then(function (success, message) {
					resolve(success, message);
				});
			} else if (exportType === 'word') {
				exportReportAs('DOC').then(function (success, message) {
					resolve(success, message);
				});
			} else if (exportType === 'csv') {
				exportReportAs('CSV').then(function (success, message) {
					resolve(success, message);
				});
			} else if (exportType === 'xml') {
				exportReportAs('XML').then(function (success, message) {
					resolve(success, message);
				});
			} else {
				resolve(false, 'Unknown export type ' + exportType);
			}
		});
	};

	/**
	 * Send report link via client email
	 */
	var sendReportLinkEmail = function () {
		var reportInfo = $izendaUrl.getReportInfo();
		if (!angular.isObject(reportInfo) || !angular.isString(reportInfo.fullName) || reportInfo.fullName === '')
			throw 'Can\'t send email without report name';
		var redirectUrl = '?subject=' + encodeURIComponent(reportInfo.fullName) + '&body=' + encodeURIComponent(location);
		redirectUrl = 'mailto:' + redirectUrl.replace(/ /g, '%20');
		window.top.location = redirectUrl;
	};

	/**
	 * Load instant report datasources
	 */
	var loadDataSources = function () {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getContraintsInfo().then(function (contraintsData) {
				setConstraints(contraintsData);
				$izendaInstantReportQuery.getDatasources().then(function (data) {
					var convertedData = convertDataSources(data);
					setDataSources(convertedData);
					resolve();
				});
			});
		});
	};

	/////////////////////////////////////////
	// charts
	/////////////////////////////////////////

	/**
	 * Set current chart
	 */
	var selectChart = function (chart) {
		reportSet.charts[0] = chart;
	};

	/**
	 * Get current chart
	 */
	var getSelectedChart = function () {
		if (reportSet.charts.length === 0)
			return null;
		return reportSet.charts[0];
	}

	/////////////////////////////////////////
	// filters
	/////////////////////////////////////////

	var validateFilter = function (filter) {
		filter.isValid = true;
		filter.validationMessages = [];
		filter.validationMessageString = '';

		// check: is filter refer to field which in active table.
		if (filter.field !== null) {
			var activeFields = getAllFieldsInActiveTables();
			var found = false;
			var filterField = filter.field;
			angular.element.each(activeFields, function () {
				if (this.sysname === filterField.sysname)
					found = true;
			});
			if (!found) {
				filter.isValid = false;
				filter.validationMessages.push('filter field refers on datasource which isn\'t included to report');
				filter.validationMessageString = filter.validationMessages.join(', ');
			}
		}
	};


	/**
	 * Disable filters which are not pass validation
	 */
	var validateFilters = function () {
		angular.element.each(reportSet.filters, function () {
			validateFilter(this);
		});
	};

	/**
	 * Find filter operator by string value
	 */
	var getFilterOperatorByValue = function (filter, value) {
		if (!angular.isString(value))
			return null;
		var result = null;
		angular.element.each(filter.operators, function () {
			if (this.value === value)
				result = this;
		});
		return result;
	};

	/**
	 * Get filter operator list for field
	 */
	var getFieldFilterOperatorList = function (field) {
		return $q(function (resolve) {
			$izendaInstantReportQuery.getFieldOperatorList(field).then(function (data) {
				var result = [];
				angularJq$.each(data, function () {
					var groupName = this.name;
					angularJq$.each(this.options, function () {
						if (this.value !== '...') {
							var optionToAdd = angular.extend({
								groupName: groupName
							}, this);
							result.push(optionToAdd);
						}
					});
				});
				resolve(result);
			});
		});
	};

	/**
	 * Set filter operator and update available values
	 */
	var setFilterOperator = function (filter, operatorName) {
		return $q(function (resolve) {
			if (!angular.isObject(filter.field)) {
				filter.operators = [];
				filter.operator = null;
				resolve(filter);
				return;
			}
			getFieldFilterOperatorList(filter.field).then(function (result) {
				// select filter operator to apply
				var operatorNameToApply = null;
				if (angular.isObject(filter.operator))
					operatorNameToApply = filter.operator.value;
				if (angular.isString(operatorName))
					operatorNameToApply = operatorName;

				filter.operators = result;
				filter.operator = getFilterOperatorByValue(filter, operatorNameToApply);
				
				// update field value
				var operatorType = getFieldFilterOperatorValueType(filter.operator);
				if (operatorType === 'field') {
					filter.values = [getFieldBySysName(filter.values[0])];
				} else if (operatorType === 'oneDate' || operatorType === 'twoDates') {
					var valueDates = [];
					angular.element.each(filter.values, function() {
						var parsedDate = moment(this, $izendaSettings.getDateFormat().date, true);
						if (parsedDate.isValid())
							valueDates.push(parsedDate._d);
					});
					filter.values = valueDates;
				}
				
				resolve(filter);
			});
		});
	};

	/**
	 * Load filter existent values list (you need to ensure that all operators were applyed before starting update existing values)
	 */
	var updateFieldFilterExistentValues = function (filter) {
		return $q(function (resolve) {
			if (!angular.isObject(filter)) {
				resolve(null);
				return;
			}

			if (!angular.isObject(filter.field) || !angular.isObject(filter.operator)) {
				filter.existentValues = [];
				filter.initialized = true;
				resolve(filter);
				return;
			}

			// parse unicode symbols util
			var parseHtmlUnicodeEntities = function (str) {
				return str.replace(/&#([0-9]{1,4});/gi, function (match, numStr) {
					var num = parseInt(numStr, 10); // read num as normal number
					return String.fromCharCode(num);
				});
			};

			// get constraint filters
			var allFilters = getFilters();
			var idx = allFilters.indexOf(filter);
			if (idx < 0) {
				throw 'Filter ' + (filter.field !== null ? filter.field.sysname : '') + ' isn\'t found in report set filters collection.';
			}
			var constraintFilters = allFilters.slice(0, idx);

			// load existent values
			var operatorType = getFieldFilterOperatorValueType(filter.operator);
			if (operatorType === 'select' || operatorType === 'Equals_Autocomplete' || operatorType === 'select_multiple'
				|| operatorType === 'select_popup' || operatorType === 'select_checkboxes') {
				$izendaInstantReportQuery.getExistentValuesList(getActiveTables(), constraintFilters, filter, true).then(function (data) {
					var result = [];
					angularJq$.each(data[0].options, function () {
						var option = this;
						if (option.value !== '...') {
							option.text = parseHtmlUnicodeEntities(option.text);
							option.value = parseHtmlUnicodeEntities(option.value);
							result.push(option);
						}
					});
					filter.existentValues = result;
					filter.initialized = true;
					resolve(filter);
				});
			} else {
				filter.existentValues = [];
				filter.initialized = true;
				resolve(filter);
			}
		});
	};

	/**
	 * Refresh next filter values.
	 */
	var refreshNextFiltersCascading = function (filter) {
		return $q(function (resolve) {
			var allFilters = getFilters();
			var idx;
			var filtersToRefresh;
			if (angular.isObject(filter)) {
				idx = allFilters.indexOf(filter);
				if (idx < 0) {
					throw 'Filter ' + (filter.field !== null ? filter.field.sysname + ' ' : '') + 'isn\'t found in report set filters collection.';
				}
				filtersToRefresh = allFilters.slice(idx + 1);
			} else {
				filtersToRefresh = allFilters.slice(0);
			}

			if (filtersToRefresh.length > 0) {
				var refreshingFilter = filtersToRefresh[0];
				updateFieldFilterExistentValues(refreshingFilter).then(function () {
					refreshNextFiltersCascading(refreshingFilter).then(function () {
						resolve();
					});
				});
			}
		});
	}

	/**
	 * Create new filter object with default values
	 */
	var createNewFilter = function (fieldSysName, operatorName, values, required) {
		var filterObject = angular.extend({}, $injector.get('izendaFilterObjectDefaults'));
		// set field
		var field = getFieldBySysName(fieldSysName);
		filterObject.field = field;
		filterObject.values = values;
		filterObject.required = required === true;
		filterObject.operatorString = operatorName;
		return filterObject;
	};

	/**
	 * Delete filter from collection
	 */
	var removeFilter = function (filter) {
		var index = reportSet.filters.indexOf(filter);
		if (index >= 0) {
			reportSet.filters[index].field = null;
			reportSet.filters.splice(index, 1);
		}
	};

	/**
	 * Swap filter
	 */
	var swapFilters = function (index0, index1) {
		var filters = reportSet.filters;
		var temp = filters[index0];
		filters[index0] = filters[index1];
		filters[index1] = temp;
	};

	/**
	 * Move filter from position to position
	 */
	var moveFilterTo = function (fromIndex, toIndex) {
		reportSet.filters.splice(toIndex, 0, reportSet.filters.splice(fromIndex, 1)[0]);
	};

	/**
	 * Check current active tables and remove filters which connected to non-active fields
	 */
	var syncFilters = function () {
		var activeFields = getAllFieldsInActiveTables();
		var filters = getFilters();

		// find filters to remove
		var filtersToRemove = [];
		angularJq$.each(filters, function () {
			var filter = this;
			var isFilterActive = false;
			angularJq$.each(activeFields, function () {
				var activeField = this;
				if (filter.field === null || activeField.sysname === filter.field.sysname) {
					isFilterActive = true;
				}
			});
			if (!isFilterActive)
				filtersToRemove.push(filter);
		});

		// remove filters
		angularJq$.each(filtersToRemove, function () {
			removeFilter(this);
		});
	};

	/////////////////////////////////////////
	// field options
	/////////////////////////////////////////

	/**
	 * Covert [{ name: 'group name', options: [...]} }]
	 * to array of options with additional parameter group: 'group name'
	 */
	var convertFieldFunctions = function (fieldFunctions) {
		var groups = [];
		angularJq$.each(fieldFunctions, function () {
			var group = this;
			angularJq$.each(group.options, function () {
				var option = this;
				option.group = group.name;
				groups.push(option);
			});
		});
		return groups;
	};

	/**
	 * Load field function and apply group by function to field
	 */
	var loadFieldFunctions = function (field, defaultGroupString) {
		return $q(function (resolve) {
			var groupToApply = angular.isString(defaultGroupString) ? defaultGroupString : 'NONE';
			$izendaInstantReportQuery.getFieldFunctions(field).then(function (returnObj) {
				var groups = convertFieldFunctions(returnObj);
				field.groupByFunctionOptions = groups;
				field.groupByFunction = getGroupByValue(field, groupToApply);
				// if group list was changed and current group function not in list
				if (field.groupByFunction === null) {
					field.groupByFunction = getGroupByValue(field, 'NONE');
				}
				resolve(field);
			});
		});
	};

	/**
	 * Load Subtotal field function and apply Subtotal group by function to field
	 */
	var loadSubtotalFieldFunctions = function (field, defaultGroupString) {
		return $q(function (resolve) {
			var groupToApply = angular.isString(defaultGroupString) ? defaultGroupString : 'DEFAULT';
			$izendaInstantReportQuery.getFieldFunctions(field, true).then(function (returnObj) {
				var groups = convertFieldFunctions(returnObj);
				field.groupBySubtotalFunctionOptions = groups;
				field.groupBySubtotalFunction = getGroupBySubtotalValue(field, groupToApply);
				// if group list was changed and current group function not in list
				if (field.groupBySubtotalFunction === null) {
					field.groupByFunction = getGroupBySubtotalValue(field, 'DEFAULT');
				}
				resolve(field);
			});
		});
	};

	/**
	 * Load group functions to field
	 */
	var loadGroupFunctionsAndFormatsToField = function (field, defaultGroupString, defaultFormatString, defaultSubtotalGroupString) {
		return $q(function (resolve) {
			var groupToApply = angular.isString(defaultGroupString) ? defaultGroupString : 'NONE';
			var groupSubtotalToApply = angular.isString(defaultSubtotalGroupString) ? defaultSubtotalGroupString : 'DEFAULT';

			if (!allowFieldFunctions(field)) {
				// if field type doesn't support group by.
				field.groupByFunctionOptions = [EMPTY_FIELD_GROUP_OPTION];
				field.groupByFunction = EMPTY_FIELD_GROUP_OPTION;
				field.groupBySubtotalFunctionOptions = [EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS];
				field.groupBySubtotalFunction = EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS;
				updateFieldFormats(field, defaultFormatString).then(function (f) {
					resolve(f);
				});
			} else {
				// get field and Subtotal functions from server or request cache:
				var functionPromise = loadFieldFunctions(field, groupToApply);
				var subtotalPromise = loadSubtotalFieldFunctions(field, groupSubtotalToApply);
				$q.all([functionPromise, subtotalPromise]).then(function () {
					updateFieldFormats(field, defaultFormatString).then(function (f) {
						resolve(field);
					});
				});
			}
		});
	}

	/**
	 * Field initialization (async: returns promise)
	 */
	var initializeField = function (field) {
		return $q(function (resolve) {
			if (field.isInitialized) {
				resolve(field);
				return;
			}

			// load group and format collections:
			loadGroupFunctionsAndFormatsToField(field).then(function (f) {
				f.isInitialized = true;
				resolve(f);
			});
		});
	}

	/**
	 * Get current field which we are editing now.
	 */
	var getCurrentActiveField = function () {
		return currentActiveField;
	};

	/**
	 * Set current field for editing it.
	 */
	var setCurrentActiveField = function (field) {
		currentActiveField = field;
	};

	/**
	 * Refresh field description
	 */
	var autoUpdateFieldDescription = function (field) {
		if (!field.isDescriptionSetManually) {
			if (isFieldGrouped(field) && field.groupByFunction.value.toLowerCase() !== 'group')
				field.description = field.groupByFunction.text + ' (' + humanize(field.name) + ')';
			else
				field.description = humanize(field.name);
		}
	};

	/**
	 * Set aggregate function for field.
	 */
	var onFieldFunctionApplyed = function (field) {
		// do not change format for max, min, sum and sum distinct
		if (isFieldGrouped(field)) {
			applyAutoGroups();
		} else {
			resetAutoGroups();
			updateFieldFormats(field);
		}

		// auto update description
		autoUpdateFieldDescription(field);

		// validate
		validateReport();
	};

	/**
	 * Update functions, formats after expression typegroup was changed
	 */
	var onExpressionTypeGroupApplyed = function (field) {
		loadGroupFunctionsAndFormatsToField(field, field.groupByFunction.value, field.format.value, field.groupBySubtotalFunction.value);
	}

	/**
	 * Update Ui and show preview
	 */
	var updateUiStateAndRefreshPreview = function () {
		// remove drilldowns which are not in active tables
		updateDrilldowns();
		// update filters state
		syncFilters();
		if (getActiveTables().length === 0) {
			resetAutoGroups();
		} else {
			applyAutoGroups();
		}
		if (validateReportSet()) {
			validateReport();
			getReportPreviewHtml();
		} else {
			clearReportPreviewHtml();
		}
	};

	/**
	 * Fires when user check/uncheck field
	 */
	var applyFieldChecked = function (field, value) {
		if (!field.enabled) {
			validateReport();
			return;
		}
		field.checked = angular.isDefined(value) ? value : !field.checked;
		field.order = getNextOrder();

		// update state of datasources tree
		updateParentFoldersAndTables(field);

		// remove drilldowns which are not in active tables
		//updateDrilldowns();
		// update filters state
		//syncFilters();

		initializeField(field).then(function () {
			updateUiStateAndRefreshPreview();
		});
	};

	/**
	 * Select/unselect field
	 */
	var applyFieldSelected = function (field, value) {
		if (!field.enabled)
			return;
		if (field.isMultipleColumns) {
			field.collapsed = !field.collapsed;
			return;
		}
		unselectAllFields();
		setCurrentActiveField(null);
		if (value) {
			setCurrentActiveField(field);
			field.selected = value;
			initializeField(field);
		}
	};

	/**
	 * Check/uncheck table
	 */
	var applyTableActive = function (table) {
		if (!table.enabled) {
			return;
		}
		table.active = !table.active;
		table.order = getNextOrder();

		if (!table.active) {
			// deactivate all table fields
			angular.element.each(table.fields, function () {
				var field = this;
				field.checked = false;
			});
		}
		updateParentFolders(table);
		updateUiStateAndRefreshPreview();
	};

	/**
	 * Add more than one same field to report
	 */
	var addAnotherField = function (field, needToSelect) {
		field.isMultipleColumns = true;
		if (field.multipleColumns.length === 0) {
			field.multipleColumnsCounter = 1;
			var copyField = angular.copy(field);
			copyField.isMultipleColumns = false;
			copyField.multipleColumns = [];
			field.multipleColumns.push(copyField);
			if (needToSelect) {
				unselectAllFields();
				copyField.selected = true;
				setCurrentActiveField(copyField);
			}
		}

		// add another field
		var anotherField = createFieldObject(field.name + (field.multipleColumnsCounter++), field.parentId, field.tableSysname, field.tableName,
			field.sysname, field.typeGroup, field.type, field.sqlType);
		anotherField.order = getNextOrder();

		initializeField(anotherField).then(function () {
			applyAutoGroups();
		});

		field.multipleColumns.push(anotherField);
		return anotherField;
	};

	/**
	 * Apply field config to field
	 */
	var loadReportField = function (field, fieldConfig) {
		var functionValue = fieldConfig.groupByFunction.value;
		var subtotalFunctionValue = fieldConfig.groupBySubtotalFunction.value;
		var formatValue = fieldConfig.format.value;
		angular.extend(field, fieldConfig);

		angular.element.each(expressionTypes, function () {
			if (this.value === fieldConfig.expressionType)
				field.expressionType = this;
		});

		loadGroupFunctionsAndFormatsToField(field, functionValue, formatValue, subtotalFunctionValue).then(function (f) {
			f.isInitialized = true;
		});
	}

	/**
	 * Select drilldown fields
	 */
	var convertDrilldownFieldNamesToFields = function () {
		for (var i = 0; i < reportSet.drillDownFields.length; i++) {
			var currentItem = reportSet.drillDownFields[i];
			if (angular.isString(currentItem)) {
				reportSet.drillDownFields[i] = getFieldBySysName(currentItem, true);
			}
		}
	};

	/**
	 * Select charts
	 */
	var convertChartNamesToCharts = function () {
		for (var i = 0; i < reportSet.charts.length; i++) {
			var chart = reportSet.charts[i];
			if (angular.isObject(chart) && chart.hasOwnProperty('name') && chart.hasOwnProperty('category')) {
				var vis = findVisualizationInConfig(chart.category, chart.name);
				vis.properties = reportSet.charts[i].properties;
				reportSet.charts[i] = vis;
			}
		}
	}

	/**
	 * Add loaded filters. reportSet.filters at this stage is not initialized
	 * and we need to set field, operator and value objects.
	 */
	var loadFilters = function () {
		return $q(function (resolve) {
			var filterOperatorPromises = [];
			if (!angular.isArray(reportSet.filters) || reportSet.filters.length === 0) {
				resolve();
				return;
			}
			for (var i = 0; i < reportSet.filters.length; i++) {
				var filter = reportSet.filters[i];
				var filterConfig = {
					fieldSysName: filter.sysname,
					operatorName: filter.operatorString,
					values: filter.values,
					required: filter.required
				};
				var newFilter = createNewFilter(filterConfig.fieldSysName, filterConfig.operatorName, filterConfig.values, filterConfig.required);
				reportSet.filters[i] = newFilter;
				// set operator
				var operatorPromise;
				if (angular.isString(filterConfig.operatorName)) {
					operatorPromise = setFilterOperator(newFilter, filterConfig.operatorName);
				} else {
					operatorPromise = setFilterOperator(newFilter, null);
				}
				filterOperatorPromises.push(operatorPromise);
			}
			// wait when all operators loaded
			var existentValuesPromises = [];
			$q.all(filterOperatorPromises).then(function () {
				angular.element.each(reportSet.filters, function () {
					var existentPromise = updateFieldFilterExistentValues(this);
					existentValuesPromises.push(existentPromise);
				});
				// wait when all existent values loaded
				$q.all(existentValuesPromises).then(function () {
					// initialization completed
					resolve();
				});
			});
		});
	}

	/**
	 * Load existing report
	 */
	var loadReport = function (reportFullName) {
		$log.debug('loadReport ' + reportFullName + ' start');
		return $q(function (resolve) {
			if (!isPageInitialized) {
				existingReportLoadingSchedule = reportFullName;
				$log.debug('loadReport scheduled');
				resolve(false);
				return;
			}
			// update UI params
			currentActiveField = null;
			setFiltersPanelOpened(false);

			// load report data
			$izendaInstantReportQuery.loadReport(reportFullName).then(function (reportSetConfig) {
				// apply config to reportSet object
				if (!angular.isObject(reportSetConfig)) {
					$rootScope.$broadcast('izendaShowMessageEvent', [
						'Failed to load report: "' + reportSetConfig + '"',
						'Report load error',
						'danger']);
					// redirect to new report
					$izendaUrl.setIsNew();
					resolve(true, false);
					return;
				}
				resetDataSources();
				reportSet = angular.extend(reportSet, reportSetConfig);

				// update top
				if (reportSet.options.top < 0) reportSet.options.top = '';
				reportSet.options.previewTop = 10;

				// convert drilldown field sysnames to fields collection:
				convertDrilldownFieldNamesToFields();
				// convert chart names to chart objects collection
				convertChartNamesToCharts();

				// convert fields
				var addedFieldSysNames = [];
				angular.element.each(reportSet.activeFields, function () {
					var activeField = this;
					var sysname = activeField.sysname;
					var field = getFieldBySysName(sysname, true);
					if (!angular.isObject(field))
						$log.error('Field ' + sysname + ' not found in datasources');

					var isFieldMultiple = addedFieldSysNames.indexOf(sysname) >= 0;
					if (!isFieldMultiple) {
						loadReportField(field, activeField);
						field.checked = true;
						updateParentFoldersAndTables(field, true);
						addedFieldSysNames.push(sysname);
					} else {
						var anotherField = addAnotherField(field);
						loadReportField(anotherField, activeField);
						anotherField.checked = true;
					}
				});

				// convert filters
				var loadFiltersPromise = loadFilters();

				// load schedule data for config
				var scheduleConfigData = angular.extend({}, reportSetConfig.schedule);
				var loadScheduleDataPromise = $izendaScheduleService.loadScheduleData(scheduleConfigData);

				// load share data for config
				var shareConfig = angular.extend([], reportSetConfig.share);
				var loadShareDataPromise = $izendaShareService.loadShareData(shareConfig);

				// wait for all preparations completion
				$q.all([loadFiltersPromise, loadScheduleDataPromise, loadShareDataPromise]).then(function () {
					validateFilters();
					$log.debug('loadReport end');
					if (validateReportSet())
						getReportPreviewHtml();
					resolve(true, true);
				});
			});
		});
	}

	/**
	 * Remove another field
	 */
	var removeAnotherField = function (field, anotherField) {
		var idx = field.multipleColumns.indexOf(anotherField);
		if (idx >= 0) {
			if (getCurrentActiveField() === anotherField)
				setCurrentActiveField(null);
			field.multipleColumns.splice(idx, 1);
			getReportPreviewHtml();
		} else {
			throw 'Can\'t find ' + anotherField.name + ' in multipleColumns collection.';
		}

		if (field.multipleColumns.length === 1) {
			copyFieldObject(field.multipleColumns[0], field);
			field.multipleColumns = [];
			field.isMultipleColumns = false;
			field.collapsed = false;
			autoUpdateFieldDescription(field);
		}
	}

	/**
	 * Set sort value for field.
	 */
	var applyFieldSort = function (field, sortString) {
		if (angular.isString(sortString)) {
			if (sortString === 'asc') {
				field.sort = 'asc';
			} else if (sortString === 'desc') {
				field.sort = 'desc';
			} else {
				if (!field.isVgUsed)
					field.sort = null;
			}
		} else {
			if (!field.isVgUsed)
				field.sort = null;
		}
	};

	/**
	 * Set field italic
	 */
	var applyFieldItalic = function (field, value) {
		field.italic = value;
	};

	/**
	 * Set field visible
	 */
	var applyFieldVisible = function (field, value) {
		field.visible = value;
	};

	/**
	 * Set field bold
	 */
	var applyFieldBold = function (field, value) {
		field.bold = value;
	};

	/**
	 * Set visual group 
	 */
	var applyVisualGroup = function (field, value) {
		if (value && field.sort === null) {
			applyFieldSort(field, 'asc');
		}
		field.isVgUsed = value;
	};

	/**
	 * Column reorder. Indexes started from 1: 1,2,3,4,5,6
	 */
	var swapFields = function (fromIndex, toIndex) {
		if (fromIndex === toIndex)
			return;
		var activeFieldsSortedList = angular.element.grep(getAllActiveFields(), function (item) {
			return !item.isVgUsed;
		});
		activeFieldsSortedList.sort(function (f1, f2) {
			return f1.order - f2.order;
		});
		var field1 = activeFieldsSortedList[fromIndex - 1],
				field2 = activeFieldsSortedList[toIndex - 1],
				fieldOrder1 = field1.order,
				fieldOrder2 = field2.order;
		field1.order = fieldOrder2;
		field2.order = fieldOrder1;
	};

	var moveFieldToPosition = function (fromIndex, toIndex, isVisualGroup) {
		if (fromIndex === toIndex)
			return;
		var activeFieldsSorted = getAllActiveFields().sort(function (f1, f2) {
			return f1.order - f2.order;
		});
		activeFieldsSorted = angular.element.grep(activeFieldsSorted, function (field) {
			return (isVisualGroup ^ field.isVgUsed) === 0;
		});
		var fromElement = activeFieldsSorted[fromIndex];
		var i;
		if (fromIndex < toIndex) {
			for (i = 0; i < fromIndex; i++)
				activeFieldsSorted[i].order = getNextOrder();
			for (i = fromIndex + 1; i <= toIndex; i++)
				activeFieldsSorted[i].order = getNextOrder();
			fromElement.order = getNextOrder();
			for (i = toIndex + 1; i < activeFieldsSorted.length; i++)
				activeFieldsSorted[i].order = getNextOrder();
		} else {
			for (i = 0; i < toIndex; i++)
				activeFieldsSorted[i].order = getNextOrder();
			fromElement.order = getNextOrder();
			for (i = toIndex; i < activeFieldsSorted.length; i++)
				if (i !== fromIndex)
					activeFieldsSorted[i].order = getNextOrder();
		}
	}

	// initialize:
	$log.debug('Start instant report initialize');
	isPageInitialized = false;
	isPageReady = false;
	var startInitializingTimestamp = (new Date()).getTime();
	$q.all([$izendaSettings.getCommonSettings(), loadDataSources(), initializeVgStyles(), initializeSubreports(), initializeDrillDownStyles(),
		initializeExpressionTypes(), initializeVisualizations()]).then(function () {
			isPageInitialized = true;
			if (angular.isString(existingReportLoadingSchedule)) {
				$log.debug('Start loading scheduled report', existingReportLoadingSchedule);
				loadReport(existingReportLoadingSchedule).then(function () {
					$log.debug('End loading scheduled report');
					existingReportLoadingSchedule = null;
					isPageReady = true;
					$rootScope.$applyAsync();

					var timeSpent = (new Date()).getTime() - startInitializingTimestamp;
					$log.debug('Page ready: ', timeSpent + 'ms');
				});
			} else {
				validateReportSet();
				isPageReady = true;

				var timeSpent = (new Date()).getTime() - startInitializingTimestamp;
				$log.debug('Page ready: ', timeSpent + 'ms');
				
			}
		});

	// PUBLIC API
	return {
		getPageReady: getPageReady,
		getReportSet: getReportSet,
		saveReportSet: saveReportSet,
		setReportSetAsCrs: setReportSetAsCrs,
		printReport: printReport,
		openReportInDesigner: openReportInDesigner,
		exportReport: exportReport,
		sendReportLinkEmail: sendReportLinkEmail,
		getReportPreviewHtml: getReportPreviewHtml,
		setPreviewTop: setPreviewTop,

		getCategoryById: getCategoryById,
		getTableById: getTableById,
		getActiveTables: getActiveTables,
		getAllFieldsInActiveTables: getAllFieldsInActiveTables,
		getAllActiveFields: getAllActiveFields,
		activeCheckedFields: activeCheckedFields,
		getFieldBySysName: getFieldBySysName,
		getDataSources: getDataSources,
		setDataSources: setDataSources,
		getFilters: getFilters,
		getFilterOptions: getFilterOptions,

		updateParentFoldersAndTables: updateParentFoldersAndTables,
		unselectAllFields: unselectAllFields,
		filterDataSources: filterDataSources,
		getFieldById: getFieldById,
		getOptions: getOptions,
		getDrillDownFields: getDrillDownFields,
		getVgStyles: getVgStyles,
		getDrillDownStyles: getDrillDownStyles,
		getExpressionTypes: getExpressionTypes,
		getSubreports: getSubreports,
		getCurrentActiveField: getCurrentActiveField,
		setCurrentActiveField: setCurrentActiveField,
		isFieldGrouped: isFieldGrouped,
		applyAutoGroups: applyAutoGroups,
		applyFieldChecked: applyFieldChecked,
		applyFieldSelected: applyFieldSelected,
		applyTableActive: applyTableActive,
		addAnotherField: addAnotherField,
		removeAnotherField: removeAnotherField,
		onFieldFunctionApplyed: onFieldFunctionApplyed,
		onExpressionTypeGroupApplyed: onExpressionTypeGroupApplyed,
		applyFieldSort: applyFieldSort,
		applyFieldItalic: applyFieldItalic,
		applyFieldVisible: applyFieldVisible,
		applyFieldBold: applyFieldBold,
		applyVisualGroup: applyVisualGroup,
		swapFields: swapFields,
		moveFieldToPosition: moveFieldToPosition,

		getPreview: getPreview,

		loadReport: loadReport,

		// charts
		selectChart: selectChart,
		getSelectedChart: getSelectedChart,

		// filters
		getFiltersPanelOpened: getFiltersPanelOpened,
		setFiltersPanelOpened: setFiltersPanelOpened,
		createNewFilter: createNewFilter,
		removeFilter: removeFilter,
		swapFilters: swapFilters,
		moveFilterTo: moveFilterTo,
		getFieldFilterOperatorList: getFieldFilterOperatorList,
		updateFieldFilterExistentValues: updateFieldFilterExistentValues,
		getFieldFilterOperatorValueType: getFieldFilterOperatorValueType,
		refreshNextFiltersCascading: refreshNextFiltersCascading,
		setFilterOperator: setFilterOperator,

		// validation
		getReportSetValidationMessages: getReportSetValidationMessages,
		isReportSetValid: isReportSetValid,

		// visualization
		getVisualizationConfig: getVisualizationConfig
	};
}]);
