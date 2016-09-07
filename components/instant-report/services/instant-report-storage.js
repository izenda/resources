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
			rowsRange: null,
			distinct: true,
			showFiltersInReportDescription: false,
			isSubtotalsEnabled: false,
			exposeAsDatasource: false,
			hideGrid: false,
			top: '',
			previewTop: 100,
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
		description: '',
		parameter: true,
		operatorString: '',
		operator: null,
		operators: [],
		existentValues: [],
		values: [],
		titleFormat: null,
		titleFormats: [],
		isValid: true,
		validationMessages: [],
		validationMessageString: '',
		customPopupTemplateUrl: null
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
			'$izendaUtil',
			'$izendaUrl',
			'$izendaLocale',
			'$izendaSettings',
			'$izendaCompatibility',
			'$izendaScheduleService',
			'$izendaShareService',
			'$izendaInstantReportSettings',
			'$izendaInstantReportQuery',
			'$izendaInstantReportPivots',
			'$izendaInstantReportVisualization',
function ($injector, $window, $q, $log, $sce, $rootScope, $izendaUtil, $izendaUrl, $izendaLocale, $izendaSettings, $izendaCompatibility,
	$izendaScheduleService, $izendaShareService, $izendaInstantReportSettings, $izendaInstantReportQuery,
	$izendaInstantReportPivots, $izendaInstantReportVisualization) {
	'use strict';

	// const:
	var EMPTY_FIELD_GROUP_OPTION = $injector.get('izendaDefaultFunctionObject');
	var EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS = $injector.get('izendaDefaultSubtotalFunctionObject');
	var EMPTY_EXPRESSION_TYPE = {
		value: '...',
		text: '...'
	};
	var EMPTY_FIELD_FORMAT_OPTION = $injector.get('izendaDefaultFormatObject');
	var UNCATEGORIZED = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');

	var isPageInitialized = false;
	var isPageReady = false;
	var existingReportLoadingSchedule = null;

	var isPreviewSplashVisible = false;
	var previewSplashText = $izendaLocale.localeText('js_WaitPreviewLoading', 'Please wait while preview is loading...');

	var reportSet = angular.merge({}, $injector.get('izendaInstantReportObjectDefaults'));
	reportSet.options.distinct = $izendaInstantReportSettings.distinct; // set default distinct setting value

	var activeTables = [];
	var activeFields = [];
	var activeCheckedFields = [];
	var constaints = [];
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

	/////////////////////////////////////////
	// common functions
	/////////////////////////////////////////

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
	var getPageReady = function () {
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
	 * Find table by given sysname
	 * @param {string} sysname.
	 * @returns {object} table object. 
	 */
	var getTableBySysname = function (sysname) {
		var result = null;
		angular.element.each(getDataSources(), function () {
			var category = this;
			angular.element.each(category.tables, function () {
				if (this.sysname === sysname)
					result = this;
			});
		});
		return result;
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
					if (field.id === id) {
						return field;
					}
					if (field.isMultipleColumns) {
						angular.element.each(field.multipleColumns, function() {
							var multipleField = this;
							if (multipleField.id === id) {
								return multipleField;
							}
						});
					}
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
			angular.element.each(category.tables, function () {
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
		angular.element.each(tablesCollection, function () {
			if (this.lazy)
				return;
			angular.element.each(this.fields, function () {
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
		angular.element.each(table.fields, function () {
			var field = this;
			if (!field.isMultipleColumns) {
				if (field.checked) {
					result.push(field);
				}
			} else {
				angular.element.each(field.multipleColumns, function () {
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
		angular.element.each(activeTables, function () {
			var table = this;
			var aFields = getActiveFields(table);
			angular.element.each(aFields, function () {
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
				field.formatOptionGroups = $izendaUtil.convertOptionsByPath(returnObj);
				field.format = $izendaUtil.getOptionByValue(field.formatOptionGroups, formatValueToApply);
				resolve(field);
			};

			if (isFieldGrouped(field) && ['min', 'max', 'sum', 'sum_distinct', 'group'].indexOf(field.groupByFunction.value.toLowerCase()) < 0) {
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
		return $izendaUtil.getOptionByValue(field.groupByFunctionOptions, value);
	};

	/**
	 * Get Subtotal group by given value
	 */
	var getGroupBySubtotalValue = function (field, value) {
		return $izendaUtil.getOptionByValue(field.groupBySubtotalFunctionOptions, value);
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
	var applyAutoGroups = function (force) {
		if (!force) {
			var hasGroup = isReportUseGroup();
			if (!hasGroup) {
				return;
			}
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
					this.disabled = false;
					drillDownStyles.push(this);
				});
				resolve();
			});
		});
	};

	/**
	 * Disable EmbeddedDetail drilldown style for current report and (AUTO)
	 */
	var disableEmbeddedDrillDownStyle = function (field) {
		angular.element.each(drillDownStyles, function () {
			var ddStyle = this;
			ddStyle.disabled = false;
			var reportInfo = $izendaUrl.getReportInfo();
			if (ddStyle.value === 'EmbeddedDetail') {
				ddStyle.disabled = field.subreport === '(AUTO)' || field.subreport === reportInfo.fullName;
			}
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
		angular.element.each(getDataSources(), function () {
			var category = this;
			angular.element.each(category.tables, function () {
				var table = this;
				table.validateMessages = [];
				table.validateMessageLevel = null;
				angular.element.each(table.fields, function () {
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
					message: $izendaLocale.localeTextWithParams(
						'js_CantUseWithGroup',
						'Can\'t use fields with sql type "{0}" with GROUP BY statement',
						[field.sqlType])
				});
				field.validateMessageLevel = 'danger';
				validationFailed = true;
			} else if (hasGroup && !isFieldGrouped(field)) {
				// if field have no group function
				field.validateMessages.push({
					messageType: 'danger',
					message: $izendaLocale.localeText('js_MustBeFunction', 'If functions are used, each selection must be a function.')
				});
				field.validateMessageLevel = 'danger';
				validationFailed = true;
			}
		});
		return validationFailed;
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
		angular.element.each(constaints, function () {
			var constraint = this;
			var part1 = constraint[0];
			var part2 = constraint[1];
			var part1Index = activeTableNames.indexOf(part1);
			var part2Index = activeTableNames.indexOf(part2);
			if (part1Index >= 0 && part2Index >= 0 && part1 !== part2) {
				nodeConstraints.push([part1Index, part2Index]);
			}
			angular.element.each(currentActiveTables, function () {
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
		angular.element.each(getDataSources(), function () {
			var category = this;
			category.enabled = false;
			// check tables
			angular.element.each(category.tables, function () {
				var table = this;
				if (!applyConstraints) {
					category.enabled = true;
					table.enabled = true;
					angular.element.each(table.fields, function () {
						var field = this;
						field.enabled = table.enabled;
					});
					return;
				}
				table.enabled = table.active || foreignKeyTables.indexOf(table.sysname) >= 0;
				category.enabled |= table.enabled;
				angular.element.each(table.fields, function () {
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
		angular.element.each(getDataSources(), function () {
			var category = this;
			angular.element.each(category.tables, function () {
				var table = this;
				angular.element.each(table.fields, function () {
					var field = this;
					field.selected = false;
					angular.element.each(field.multipleColumns, function () {
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
		angular.element.each(getDataSources(), function () {
			angular.element.each(this.tables, function () {
				if (this.active) {
					activeTables.push(this);
					angular.element.each(this.fields, function () {
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
	var updateParentFoldersAndTables = function (field, syncCollapse, restrictTableUncheck) {
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
		table.active = restrictTableUncheck || hasCheckedFields || !table.enabled;

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
	var searchInDataDources = function (searchString, from, to) {
		return $q(function(resolve) {
			if (searchString === '') {
				resolve([]);
				return;
			}
			// start search
			$izendaInstantReportQuery.findInDatasources(searchString, from, to).then(function (results) {
				// search completed
				var searchResults = results;
				angular.element.each(searchResults, function (idx) {
					this.id = from + idx;
				});
				resolve(searchResults);
			});
		});
		

		/*if (!angular.isArray(getDataSources()))
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
		});*/
	};

	var resetFieldObject = function (fieldObject, defaultValues) {
		fieldObject.isInitialized = false;
		fieldObject.isMultipleColumns = false;
		fieldObject.multipleColumns = [];
		fieldObject.highlight = false;
		fieldObject.enabled = true;
		fieldObject.checked = false;
		fieldObject.selected = false;
		fieldObject.collapsed = false;
		fieldObject.isVgUsed = false;
		fieldObject.breakPageAfterVg = false;
		fieldObject.description = $izendaUtil.humanizeVariableName(fieldObject.name);
		fieldObject.isDescriptionSetManually = false;
		fieldObject.order = 0;
		fieldObject.format = EMPTY_FIELD_FORMAT_OPTION;
		fieldObject.formatOptionGroups = [];
		fieldObject.groupByFunction = EMPTY_FIELD_GROUP_OPTION;
		fieldObject.groupByFunctionOptions = [];
		fieldObject.groupBySubtotalFunction = EMPTY_SUBTOTAL_FIELD_GROUP_OPTIONS;
		fieldObject.groupBySubtotalFunctionOptions = [];
		fieldObject.subtotalExpression = '';
		fieldObject.allowedInFilters = true;
		fieldObject.sort = null;
		fieldObject.italic = false;
		fieldObject.columnGroup = '';
		fieldObject.separator = false;
		fieldObject.textHighlight = '';
		fieldObject.cellHighlight = '';
		fieldObject.valueRange = '';
		fieldObject.width = '';
		fieldObject.labelJustification = 'M';
		fieldObject.valueJustification = 'J';
		fieldObject.visible = true;
		fieldObject.gradient = false;
		fieldObject.bold = false;
		fieldObject.drillDownStyle = '';
		fieldObject.customUrl = '';
		fieldObject.subreport = '';
		fieldObject.expression = '';
		fieldObject.expressionType = EMPTY_EXPRESSION_TYPE;
		fieldObject.groupByExpression = false;
		fieldObject.validateMessages = [];
		fieldObject.validateMessageLevel = null;

		angular.extend(fieldObject, defaultValues);
	};

	var createFieldObject = function (fieldName, tableId, tableSysname, tableName, fieldSysname, fieldTypeGroup, fieldType, fieldSqlType, allowedInFilters) {
		var fieldObject = { };
		resetFieldObject(fieldObject, {
			id: getNextId(),
			parentId: tableId,
			name: fieldName,
			tableSysname: tableSysname,
			tableName: tableName,
			sysname: fieldSysname,
			typeGroup: fieldTypeGroup,
			type: fieldType,
			sqlType: fieldSqlType,
			allowedInFilters: allowedInFilters
		});
		return fieldObject;
	};

	/**
	 * Copy field object state
	 */
	var copyFieldObject = function (from, to, replaceName) {
		to.isInitialized = from.isInitialized;
		to.parentId = from.parentId;
		to.tableSysname = from.tableSysname;
		if (replaceName)
			to.name = from.name;
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
			angular.element.each(category.tables, function (idx, table) {
				table.visible = true;
				table.active = false;
				table.enabled = true;
				table.collapsed = true;
				table.validateMessages = [];
				table.validateMessageLevel = null;
				// iterate fields
				angular.element.each(table.fields, function (idx, field) {
					resetFieldObject(field, {
						isInitialized: field.isInitialized,
						description: ''
					});
				});
			});
		});
	};

	/**
	 * Convert fields which got from server into format which used in app and add it to table object.
	 * @param {Array} fields. Server side fields object.
	 */
	var convertAndAddFields = function (tableObject, fields) {
		angular.element.each(fields, function (fieldName, field) {
			var fieldObject = createFieldObject(fieldName, tableObject.id, tableObject.sysname, tableObject.name, field.sysname,
				field.typeGroup, field.type, field.sqlType, field.allowedInFilters);
			autoUpdateFieldDescription(fieldObject);
			tableObject.fields.push(fieldObject);
		});
		tableObject.fields.sort(function (field1, field2) {
			if (field1.name > field2.name)
				return 1;
			if (field1.name < field2.name)
				return -1;
			return 0;
		});
		tableObject.lazy = false;
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
		angular.element.each(dataSources, function (iCategory, category) {
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
			angular.element.each(category.tables, function (tableName, table) {
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
					validateMessageLevel: null,
					lazy: false
				};
				// add field if loadded
				if (table.fields === 'LAZIED') {
					tableObject.lazy = true;
				} else {
					convertAndAddFields(tableObject, table.fields);
				}
				categoryObject.tables.push(tableObject);
			});

			if (isUncategorized(categoryObject.name) && $izendaInstantReportSettings.moveUncategorizedToLastPostion) {
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

	var createFieldObjectForSend = function (field) {
		return {
			sysname: field.sysname,
			description: field.description ? field.description : $izendaUtil.humanizeVariableName(field.name),
			format: field.format,
			groupByFunction: field.groupByFunction,
			groupBySubtotalFunction: field.groupBySubtotalFunction,
			subtotalExpression: field.subtotalExpression,
			allowedInFilters: field.allowedInFilters,
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
		}
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
		angular.element.each(getFilters(), function () {
			var filter = this;
			if (filter.field === null || !angular.isObject(filter.operator)) {
				filter.isValid = false;
				return;
			}
			filter.isValid = true;

			// prepare filter values to send
			var preparedValues = filter.values;
			// date string created according to format which used in "internal static string DateLocToUs(string date)":
			var dateformat = $izendaSettings.getDateFormat();
			var defaultDateFormat = $izendaSettings.getDefaultDateFormat();
			var dateFormatString = defaultDateFormat.shortDate +
				(dateformat.showTimeInFilterPickers ? ' ' + defaultDateFormat.timeFormatForInnerIzendaProcessing : '');
			var valueType = getFieldFilterOperatorValueType(filter.operator);
			if (valueType === 'select_multiple' || valueType === 'select_popup' || valueType === 'select_checkboxes') {
				preparedValues = [filter.values.join(',')];
			} else if (valueType === 'field' && filter.values.length === 1 && filter.values[0] !== null) {
				preparedValues = [filter.values[0].sysname];
			} else if (valueType === 'twoDates') {
				var momentObj1 = moment(filter.values[0]),
					  momentObj2 = moment(filter.values[1]);
				preparedValues = [
					momentObj1.isValid() ? momentObj1.format(dateFormatString) : null,
					momentObj2.isValid() ? momentObj2.format(dateFormatString) : null
				];
			} else if (valueType === 'oneDate') {
				var momentObj = moment(filter.values[0]);
				preparedValues = [
					momentObj.isValid() ? momentObj.format(dateFormatString) : null
				];
			}

			var filterObj = {
				required: filter.required,
				description: filter.description,
				parameter: filter.parameter,
				sysname: filter.field.sysname,
				operatorString: filter.operator.value,
				values: preparedValues,
				titleFormat: filter.titleFormat,
				customPopupTemplateUrl: filter.customPopupTemplateUrl
			};
			var isBlank = true;
			angular.element.each(filterObj.values, function () {
				if (this !== '') isBlank = false;
			});
			if (isBlank)
				filterObj.values = [];
			reportSetConfig.filters.push(filterObj);
		});

		// pivot
		var pivotConfig = $izendaInstantReportPivots.getPivotDataForSend();
		if (!pivotConfig)
			reportSetConfig.pivot = null;
		else {
			reportSetConfig.pivot = {
				options: pivotConfig.options
			};
			reportSetConfig.pivot.pivotColumn = createFieldObjectForSend(pivotConfig.pivotColumn);
			reportSetConfig.pivot.cellValues = [];
			angular.element.each(pivotConfig.cellValues, function () {
				if (this)
					reportSetConfig.pivot.cellValues.push(createFieldObjectForSend(this));
			});
		}
		// create config
		angular.element.each(activeTables, function () {
			var table = this;
			var tableConfig = {
				sysname: table.sysname
			}
			var aFields = getActiveFields(table);
			angular.element.each(aFields, function () {
				var field = this;
				reportSetConfig.fields.push(createFieldObjectForSend(field));
			});
			reportSetConfig.joinedTables.push(tableConfig);
		});
		$log.debug('reportSetConfig: ', reportSetConfig);
		return reportSetConfig;
	};

	/**
	 * Load fields for lazy table
	 * @param {object} table 
	 */
	var loadLazyFields = function (table) {
		return $q(function(resolve) {
			if (!table.lazy) {
				resolve(false);
				return;
			}
			$izendaInstantReportQuery.getFieldsInfo(table.sysname).then(function(data) {
				convertAndAddFields(table, data[0].fields);
				resolve(true);
			});
		});
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
		return $q(function (resolve) {
			clearReportPreviewHtml();
			isPreviewSplashVisible = true;
			var options = getOptions();
			var reportSetToSend = createReportSetConfigForSend(options.previewTop);
			$izendaInstantReportQuery.getNewReportSetPreview(reportSetToSend).then(function (data) {
				previewHtml = data;
				isPreviewSplashVisible = false;
				getOptions().rowsRange = null;
				$rootScope.$applyAsync();
				resolve();
			});
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
	var setReportSetAsCrs = function (applyPreviewTop) {
		return $q(function (resolve) {
			var reportSetToSend = createReportSetConfigForSend();
			if (applyPreviewTop) {
				reportSetToSend.options.applyPreviewTop = true;
			}
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
					var addParam = '';
					if (typeof (window.izendaPageId$) !== 'undefined')
						addParam += '&izpid=' + window.izendaPageId$;
					if (typeof (window.angularPageId$) !== 'undefined')
						addParam += '&anpid=' + window.angularPageId$;
					$window.open(getAppendedUrl($izendaUrl.settings.urlRsPage + '?output=' + type + addParam), '_self');
					resolve(true);
			});
	};

	/**
	 * Generate html and open print page.
	 */
	var printReportAsHtml = function () {
		return $q(function (resolve) {
					var addParam = '';
					if (typeof (window.izendaPageId$) !== 'undefined')
						addParam += '&izpid=' + window.izendaPageId$;
					if (typeof (window.angularPageId$) !== 'undefined')
						addParam += '&anpid=' + window.angularPageId$;
					ExtendReportExport(responseServer.OpenUrl, 'rs.aspx?p=htmlreport&print=1' + addParam, 'aspnetForm', '');
					resolve(true);
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
	var openReportInDesigner = function () {
		setReportSetAsCrs().then(function () {
			var url = $izendaUrl.settings.urlReportDesigner;
			if (angular.isString(reportSet.reportName) && reportSet.reportName !== '')
				url += '?rn=' + getReportSetFullName() + '&tab=Fields';
			else
				url += '?tab=Fields';
			$window.location.href = getAppendedUrl(url);
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
				var exportMode = 'CSV';
				if ($izendaSettings.getBulkCsv())
					exportMode = 'BULKCSV';
				exportReportAs(exportMode).then(function (success, message) {
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
		window.top.location = getAppendedUrl(redirectUrl);
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
			var aFields = getAllFieldsInActiveTables();
			var found = false;
			var filterField = filter.field;
			angular.element.each(aFields, function () {
				if (this.sysname === filterField.sysname)
					found = true;
			});
			if (!found) {
				filter.isValid = false;
				filter.validationMessages.push(
					$izendaLocale.localeText('js_FilterFieldIsntIncluded', 'Filter field refers on datasource which isn\'t included to report'));
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
				angular.element.each(data, function () {
					var groupName = this.name ? this.name : undefined;
					angular.element.each(this.options, function () {
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
					var dateformat = $izendaSettings.getDateFormat();
					var defaultDateFormat = $izendaSettings.getDefaultDateFormat();
					var dateFormatString = defaultDateFormat.shortDate +
						(dateformat.showTimeInFilterPickers ? ' ' + defaultDateFormat.timeFormatForInnerIzendaProcessing : '');
					var valueDates = [];
					angular.element.each(filter.values, function () {
						var parsedDate = moment(this, dateFormatString, true);
						if (parsedDate.isValid())
							valueDates.push(parsedDate._d);
					});
					filter.values = valueDates;
				} else if (filter.operator && filter.operator.value === 'Equals_TextArea') {
					filter.currentValue = filter.values.join();
				}

				resolve(filter);
			});
		});
	};

	/**
	 * Load filter existent values list (you need to ensure that all operators were applyed before starting update existing values)
	 */
	var updateFieldFilterExistentValues = function (filter) {
		// parse unicode symbols util
		function parseHtmlUnicodeEntities(str) {
			return angular.element('<textarea />').html(str).text();
		}

		// convert options which we have got from server.
		function convertOptionsForSelect(options, operatorType) {
			if (!angular.isArray(options))
				return [];
			var result = [];
			angular.element.each(options, function () {
				var option = this;
				if (option.value === '...') {
					if (operatorType === 'select' || operatorType === 'inTimePeriod' || operatorType === 'select_multiple') {
						option.text = parseHtmlUnicodeEntities(option.text);
						option.value = option.value;
						result.push(option);
					}
				} else {
					option.text = parseHtmlUnicodeEntities(option.text);
					option.value = option.value;
					result.push(option);
				}
			});
			return result;
		}

		function getOptionByValue(options, value) {
			if (!angular.isArray(options))
				return null;
			var resultsArray = angular.element.grep(options, function (currentOption) {
				return currentOption.value === value;
			});
			if (resultsArray.length === 0)
				return null;
			return resultsArray[0];
		}

		function syncValues(filter) {
			if (filter.values.length === 0 || filter.operator.value === 'Equals_Autocomplete')
				return;
			var newValues = [];
			angular.element.each(filter.existentValues, function () {
				var existentValue = this.value;
				if (filter.values.indexOf(existentValue) >= 0)
					newValues.push(existentValue);
			});
			filter.values = newValues;
		}

		// return promise
		return $q(function (resolve) {
			if (!angular.isObject(filter)) {
				resolve(filter);
				return;
			}

			if (!angular.isObject(filter.field) || !angular.isObject(filter.operator)) {
				filter.existentValues = [];
				filter.values = [];
				filter.initialized = true;
				resolve(filter);
				return;
			}

			// get constraint filters
			var allFilters = getFilters();
			var idx = allFilters.indexOf(filter);
			if (idx < 0) {
				throw 'Filter ' + (filter.field !== null ? filter.field.sysname : '') + ' isn\'t found in report set filters collection.';
			}
			// Add constraint filters if filter logic wasn't applyed
			var constraintFilters = [];
			if (!reportSet.filterOptions.filterLogic) {
				constraintFilters = allFilters.slice(0, idx);
			}

			// load existent values
			var operatorType = getFieldFilterOperatorValueType(filter.operator);
			if (['select', 'Equals_Autocomplete', 'select_multiple', 'select_popup', 'select_checkboxes'].indexOf(operatorType) >= 0) {
				$izendaInstantReportQuery.getExistentValuesList(getActiveTables(), constraintFilters, filter, true, reportSet.filterOptions.filterLogic)
					.then(function (data) {
						filter.existentValues = convertOptionsForSelect(data[0].options, operatorType);
						syncValues(filter);
						var defaultValue = getOptionByValue(filter.existentValues, '...');
						if (filter.values.length === 0 && defaultValue)
							filter.values = [defaultValue.value];
						filter.initialized = true;
						resolve(filter);
					});
			} else if (operatorType === 'inTimePeriod') {
				$izendaInstantReportQuery.getPeriodList().then(function(data) {
					filter.existentValues = convertOptionsForSelect(data[0].options, operatorType);
					syncValues(filter);
					var defaultValue = getOptionByValue(filter.existentValues, '...');
					if (filter.values.length === 0 && defaultValue)
						filter.values = [defaultValue.value];
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
	 * Set filter existing values when filterLogic
	 */
	var refreshFiltersForFilterLogic = function () {
		return $q(function (resolve) {
			if (!reportSet.filterOptions.filterLogic) {
				resolve();
				return;
			}
			var allFilters = getFilters();
			var promises = [];
			angular.element.each(allFilters, function () {
				var filter = this;
				var promise = updateFieldFilterExistentValues(filter);
				promises.push(promise);
			});
			$q.all(promises).then(function () {
				resolve();
			});
		});
	};

	/**
	 * Refresh next filter values.
	 */
	var refreshNextFiltersCascading = function (filter) {
		return $q(function (resolve) {
			if (reportSet.filterOptions.filterLogic) {
				resolve();
				return;
			}
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

			// cascading filters update
			if (filtersToRefresh.length > 0) {
				var refreshingFilter = filtersToRefresh[0];
				updateFieldFilterExistentValues(refreshingFilter).then(function() {
					refreshNextFiltersCascading(refreshingFilter).then(function () {
						// we don't need to call markAllFiltersAsRefreshing(false); here, because the last time when that function
						// will be called - it will go through the "else" condition.
						resolve(filter);
					});
				});
			} else {
				resolve(filter);
			}
		});
	}

	/**
	 * Create filter object without loading its format.
	 */
	var _createNewFilterBase = function (fieldSysName, operatorName, values, required, description, parameter, customPopupTemplateUrl) {
		var filterObject = angular.extend({}, $injector.get('izendaFilterObjectDefaults'));
		// set field
		var field = getFieldBySysName(fieldSysName);
		filterObject.field = field;
		if (angular.isDefined(values)) {
			filterObject.values = values;
			if (operatorName === 'Equals_Autocomplete')
				filterObject.values = [values.join(',')];
		}
		if (angular.isDefined(required))
			filterObject.required = required;
		if (angular.isDefined(description))
			filterObject.description = description;
		if (angular.isDefined(parameter))
			filterObject.parameter = parameter;
		if (angular.isDefined(operatorName))
			filterObject.operatorString = operatorName;
		if (angular.isDefined(customPopupTemplateUrl))
			filterObject.customPopupTemplateUrl = customPopupTemplateUrl;
		return filterObject;
	};

	/**
	 * Load possible formats collection and set format for filter string in description.
	 * @param {object} filter. Filter object (field must me set to apply format)
	 * @param {string} titleFormatName. Format object value
	 * @returns {angular promise}. Promise parameter: filter object. 
	 */
	var loadFilterFormats = function(filter, titleFormatName) {
		// load and set filter format:
		var filterFormatNameToApply = EMPTY_FIELD_FORMAT_OPTION.value;
		if (angular.isString(titleFormatName) && titleFormatName !== '')
			filterFormatNameToApply = titleFormatName;
		return $q(function (resolve) {
			if (angular.isObject(filter.field)) {
				$izendaInstantReportQuery.getFilterFormats(filter).then(function (returnObj) {
					filter.titleFormats = $izendaUtil.convertOptionsByPath(returnObj);
					filter.titleFormat = $izendaUtil.getOptionByValue(filter.titleFormats, filterFormatNameToApply);
					resolve(filter);
				});
			} else {
				resolve(filter);
			}
		});
	};

	/**
	 * Create new filter object with default values
	 */
	var createNewFilter = function (fieldSysName, operatorName, values, required, description, parameter, titleFormatName, customPopupTemplateUrl) {
		var filterObject = _createNewFilterBase(fieldSysName, operatorName, values, required, description, parameter, titleFormatName, customPopupTemplateUrl);
		return loadFilterFormats(filterObject, titleFormatName);
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
		var aFields = getAllFieldsInActiveTables();
		var filters = getFilters();

		// find filters to remove
		var filtersToRemove = [];
		angular.element.each(filters, function () {
			var filter = this;
			var isFilterActive = false;
			angular.element.each(aFields, function () {
				var activeField = this;
				if (filter.field === null || activeField.sysname === filter.field.sysname) {
					isFilterActive = true;
				}
			});
			if (!isFilterActive)
				filtersToRemove.push(filter);
		});

		// remove filters
		angular.element.each(filtersToRemove, function () {
			removeFilter(this);
		});
	};

	/**
	 * Parse filter custom temlpate string
	 * format: "###USEPAGE###http://.../CustomFilters/CustomFilterTemplate.aspx###"
	 */
	var parseFilterCustomTemplate = function (templateString) {
		if (angular.isString(templateString) && templateString.indexOf("###USEPAGE###") != -1) {
			return templateString.substring(13, templateString.length - 3);
		}
		return templateString;
	};

	/**
	 * Load custom template for popup filter.
	 */
	var getPopupFilterCustomTemplate = function (filter) {
		return $q(function (resolve) {
			var field = filter.field;
			var table = getTableById(field.parentId);
			$izendaInstantReportQuery.getExistentPopupValuesList(field, table).then(function (data) {
				if (angular.isString(data))
					filter.customPopupTemplateUrl = parseFilterCustomTemplate(data);
				else
					filter.customPopupTemplateUrl = null;
				resolve();
			});
		});
	};

	/////////////////////////////////////////
	// field options
	/////////////////////////////////////////

	/**
	 * Load field function and apply group by function to field
	 */
	var loadFieldFunctions = function (field, defaultGroupString) {
		return $q(function (resolve) {
			var groupToApply = angular.isString(defaultGroupString) ? defaultGroupString : 'NONE';
			$izendaInstantReportQuery.getFieldFunctions(field, field.isPivotColumn ? 'pivotField' : 'field').then(function (returnObj) {
				field.groupByFunctionOptions = $izendaUtil.convertOptionsByPath(returnObj);

				var isSimpleGroupFunction = field.groupByFunctionOptions.length === 2
					&& field.groupByFunctionOptions[0].value.toLowerCase() === 'none'
					&& field.groupByFunctionOptions[1].value.toLowerCase() === 'group';
				if (isSimpleGroupFunction && groupToApply.toLowerCase() === 'none') {
					groupToApply = 'GROUP';
				}

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
			$izendaInstantReportQuery.getFieldFunctions(field, 'subtotal').then(function (returnObj) {
				field.groupBySubtotalFunctionOptions = $izendaUtil.convertOptionsByPath(returnObj);
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
				field.description = field.groupByFunction.text + ' (' + $izendaUtil.humanizeVariableName(field.name) + ')';
			else
				field.description = $izendaUtil.humanizeVariableName(field.name);
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
		}

		updateFieldFormats(field);

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

		// apply/reset autogroups
		if (getActiveTables().length === 0) {
			resetAutoGroups();
		} else {
			applyAutoGroups();
		}
	};

	/**
	 * Fires when user check/uncheck field
	 */
	var applyFieldChecked = function (field, value, restrictTableUncheck) {
		return $q(function (resolve) {
			if (!field.enabled) {
				validateReport();
				resolve();
				return;
			}
			field.checked = angular.isDefined(value) ? value : !field.checked;
			field.order = getNextOrder();

			// update state of datasources tree
			updateParentFoldersAndTables(field, false, restrictTableUncheck);

			initializeField(field).then(function () {
				updateUiStateAndRefreshPreview();
				resolve();
			});
		});
	};

	/**
	 * Select/unselect field
	 */
	var applyFieldSelected = function (field, value) {
		if (!angular.isObject(field)) {
			unselectAllFields();
			setCurrentActiveField(null);
			return;
		}
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
		var parentField = field;
		if (parentField.multipleColumns.length === 0) {
			var copyField = parentField = angular.copy(field);
			copyField.isMultipleColumns = true;
			copyField.multipleColumnsCounter = 1;
			copyField.multipleColumns.push(field);
			// set copy field instead of original field.
			var table = getTableById(field.parentId);
			var fieldIndex = table.fields.indexOf(field);
			table.fields[fieldIndex] = copyField;

			if (needToSelect) {
				unselectAllFields();
				field.selected = true;
				setCurrentActiveField(field);
			}
		}

		// add another field to parentField
		var anotherField = createFieldObject(parentField.name + (parentField.multipleColumnsCounter++), parentField.parentId, parentField.tableSysname, parentField.tableName,
			parentField.sysname, parentField.typeGroup, parentField.type, parentField.sqlType);
		anotherField.order = getNextOrder();
		anotherField.parentFieldId = parentField.id;

		initializeField(anotherField).then(function () {
			applyAutoGroups();
			autoUpdateFieldDescription(anotherField);
		});
		parentField.multipleColumns.push(anotherField);

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
		if (field.order > orderCounter)
			orderCounter = field.order + 1;

		angular.element.each(expressionTypes, function () {
			if (this.value === fieldConfig.expressionType)
				field.expressionType = this;
		});

		loadGroupFunctionsAndFormatsToField(field, functionValue, formatValue, subtotalFunctionValue).then(function (f) {
			autoUpdateFieldDescription(f);
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
				var vis = $izendaInstantReportVisualization.findVisualization(chart.category, chart.name);
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
					required: filter.required,
					description: filter.description,
					parameter: filter.parameter,
					titleFormat: filter.titleFormat,
					customPopupTemplateUrl: filter.customPopupTemplateUrl
				};
				var newFilter = _createNewFilterBase(
					filterConfig.fieldSysName,
					filterConfig.operatorName,
					filterConfig.values,
					filterConfig.required,
					filterConfig.description,
					filterConfig.parameter,
					filter.customPopupTemplateUrl);
				
				reportSet.filters[i] = newFilter;

				// load filter formats
				var formatLoadPromise = loadFilterFormats(newFilter, filterConfig.titleFormat);
				filterOperatorPromises.push(formatLoadPromise);

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
						$izendaLocale.localeText('js_FailedToLoadReport', 'Failed to load report') + ': "' + reportSetConfig + '"',
						$izendaLocale.localeText('js_ReportLoadError', 'Report load error'),
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

				var lazyPromises = [];
				angular.element.each(reportSet.joinedTables, function() {
					var tableObj = this;
					var table = getTableBySysname(tableObj.sysname);
					var loadFieldPromise = loadLazyFields(table);
					lazyPromises.push(loadFieldPromise);
				});

				// wait until table fields will be loaded:
				$q.all(lazyPromises).then(function () {
					// convert chart names to chart objects collection
					convertChartNamesToCharts();

					// convert drilldown field sysnames to fields collection:
					convertDrilldownFieldNamesToFields();

					// load pivot fields
					if (angular.isObject(reportSet.pivot)) {
						var pivotColumnConfig = angular.copy(reportSet.pivot.pivotColumn);
						var pivotColumnField = getFieldBySysName(pivotColumnConfig.sysname, true);
						reportSet.pivot.pivotColumn = angular.copy(pivotColumnField);
						reportSet.pivot.pivotColumn.isPivotColumn = true;
						loadReportField(reportSet.pivot.pivotColumn, pivotColumnConfig);
						for (var i = 0; i < reportSet.pivot.cellValues.length; i++) {
							var cellValueConfig = angular.copy(reportSet.pivot.cellValues[i]);
							reportSet.pivot.cellValues[i] = angular.copy(getFieldBySysName(cellValueConfig.sysname, true));
							loadReportField(reportSet.pivot.cellValues[i], cellValueConfig);
						}
					}

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

					// initialization promises
					var promises = [];

					// pivots initialization
					if (angular.isObject(reportSet.pivot)) {
						var pivotData = reportSet.pivot;
						promises.push($izendaInstantReportPivots.loadPivotData(pivotData));
						reportSet.pivot = null;
					}

					// convert filters
					promises.push(loadFilters());

					// load schedule data for config
					var scheduleConfigData = angular.extend({}, reportSetConfig.schedule);
					promises.push($izendaScheduleService.loadScheduleData(scheduleConfigData));

					// load share data for config
					var shareConfig = angular.extend([], reportSetConfig.share);
					promises.push($izendaShareService.loadShareData(shareConfig));

					// wait for all preparations completion
					$q.all(promises).then(function () {
						validateFilters();
						$log.debug('loadReport end');
						resolve(true, true);
					});
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
		} else {
			throw 'Can\'t find ' + anotherField.name + ' in multipleColumns collection.';
		}

		if (field.multipleColumns.length === 1) {
			copyFieldObject(field.multipleColumns[0], field);
			field.multipleColumns = [];
			field.isMultipleColumns = false;
			field.collapsed = false;
			field.parentFieldId = null;
			autoUpdateFieldDescription(field);
		}
	};

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
	 * We need to set visual group fields order first and other fields next.
	 */
	var updateVisualGroupFieldOrders = function () {
		var activeFields = getAllActiveFields();
		// we need to update field orders:
		// vgField1, vgField2, ..., vgFieldN, nonVg1, nonVg2, ..., nonVgM
		var vgFields = angular.element.grep(activeFields, function (f) {
			return f.isVgUsed;
		});
		if (vgFields.length === 0)
			return;
		vgFields.sort(function (a, b) {
			return a.order - b.order;
		});
		angular.element.each(vgFields, function () {
			this.order = getNextOrder();
		});
		var nonVgFields = angular.element.grep(activeFields, function (f) {
			return !f.isVgUsed;
		});
		nonVgFields.sort(function (a, b) {
			return a.order - b.order;
		});
		angular.element.each(nonVgFields, function () {
			this.order = getNextOrder();
		});
	};

	/**
	 * Set visual group 
	 */
	var applyVisualGroup = function (field, value) {
		if (value && field.sort === null) {
			applyFieldSort(field, 'asc');
		}
		field.isVgUsed = value;
		if (value) {
			updateVisualGroupFieldOrders();
		}
	};

	/**
	 * Restore default color settings.
	 */
	var restoreDefaultColors = function () {
		var defaultReportSettings = $injector.get('izendaInstantReportObjectDefaults');
		var defaultStyle = defaultReportSettings.options.style;
		var style = reportSet.options.style;
		style.borderColor = defaultStyle.borderColor;
		style.headerColor = defaultStyle.headerColor;
		style.headerForecolor = defaultStyle.headerForecolor;
		style.itemColor = defaultStyle.itemColor;
		style.itemForeColor = defaultStyle.itemForeColor;
		style.itemAltColor = defaultStyle.itemAltColor;
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

	/**
	 * Change field order
	 */
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
		updateVisualGroupFieldOrders();
	};

	var getPreviewSplashVisible = function () {
		return isPreviewSplashVisible;
	};

	var getPreviewSplashText = function () {
		return previewSplashText;
	};

	// initialize:
	$log.debug('Start instant report initialize');
	isPageInitialized = false;
	isPageReady = false;

	var startInitializingTimestamp = (new Date()).getTime();
	$q.all([loadDataSources(), initializeVgStyles(), initializeSubreports(), initializeDrillDownStyles(),
		initializeExpressionTypes(), $izendaInstantReportVisualization.loadVisualizations()]).then(function () {
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
		clearReportPreviewHtml: clearReportPreviewHtml,
		setPreviewTop: setPreviewTop,

		getCategoryById: getCategoryById,
		getTableById: getTableById,
		getTableBySysname: getTableBySysname,
		getActiveTables: getActiveTables,
		getAllFieldsInActiveTables: getAllFieldsInActiveTables,
		getAllActiveFields: getAllActiveFields,
		activeCheckedFields: activeCheckedFields,
		getFieldBySysName: getFieldBySysName,
		getDataSources: getDataSources,
		setDataSources: setDataSources,
		getFilters: getFilters,
		getFilterOptions: getFilterOptions,

		loadLazyFields: loadLazyFields,
		updateParentFoldersAndTables: updateParentFoldersAndTables,
		unselectAllFields: unselectAllFields,
		searchInDataDources: searchInDataDources,
		getFieldById: getFieldById,
		getOptions: getOptions,
		getDrillDownFields: getDrillDownFields,
		getVgStyles: getVgStyles,
		getDrillDownStyles: getDrillDownStyles,
		disableEmbeddedDrillDownStyle: disableEmbeddedDrillDownStyle,
		getExpressionTypes: getExpressionTypes,
		getSubreports: getSubreports,
		getCurrentActiveField: getCurrentActiveField,
		setCurrentActiveField: setCurrentActiveField,
		isFieldGrouped: isFieldGrouped,
		applyAutoGroups: applyAutoGroups,
		resetAutoGroups: resetAutoGroups,
		initializeField: initializeField,
		resetFieldObject: resetFieldObject,
		createFieldObject: createFieldObject,
		copyFieldObject: copyFieldObject,
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
		updateVisualGroupFieldOrders: updateVisualGroupFieldOrders,
		swapFields: swapFields,
		moveFieldToPosition: moveFieldToPosition,
		restoreDefaultColors: restoreDefaultColors,

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
		refreshFiltersForFilterLogic: refreshFiltersForFilterLogic,
		setFilterOperator: setFilterOperator,
		loadFilterFormats: loadFilterFormats,
		getPreviewSplashVisible: getPreviewSplashVisible,
		getPreviewSplashText: getPreviewSplashText,
		getPopupFilterCustomTemplate: getPopupFilterCustomTemplate
	};
}]);
