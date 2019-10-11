import * as angular from 'angular';
import 'izenda-external-libs';
import 'common/core/tools/izenda-linq';
import IzendaUtilUiService from 'common/core/services/util-ui-service';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import IzendaScheduleService from 'common/ui/services/schedule-service';
import IzendaShareService from 'common/ui/services/share-service';
import IzendaInstantReportQueryService from 'instant-report/services/instant-report-query';
import IzendaInstantReportPivotService from 'instant-report/services/instant-report-pivot';
import IzendaInstantReportSettingsService from 'instant-report/services/instant-report-settings';
import IzendaInstantReportVisualizationService from 'instant-report/services/instant-report-visualization';

export default class IzendaInstantReportStorageService {

	private readonly emptyFieldGroupOption: any;
	private readonly emptySubtotalFieldGroupOptions: any;
	private readonly emptyExpressionType: any;
	private readonly emptyFieldFormatOption: any;
	isPageInitialized: boolean;
	isPageReady: boolean;
	existingReportLoadingSchedule: any;
	newReportLoadingSchedule: any;
	isPreviewSplashVisible: boolean;
	previewSplashText: string;
	reportSet: any;
	activeTables: any[];
	activeFields: any[];
	calcFields: any[];
	activeCheckedFields: any[];
	private constraints: any[];
	vgStyles: any;
	drillDownStyles: any;
	expressionTypes: any;
	subreports: any;
	currentActiveField: any;
	uiPanelsState: any;
	nextId: number;
	orderCounter: number;
	previewHtml: string;

	static get injectModules(): any[] {
		return [
			'$injector',
			'$window',
			'$q',
			'$log',
			'$rootScope',
			'$izendaUtilUiService',
			'$izendaUtilService',
			'$izendaUrlService',
			'$izendaLocaleService',
			'$izendaSettingsService',
			'$izendaCompatibilityService',
			'$izendaScheduleService',
			'$izendaShareService',
			'$izendaInstantReportSettingsService',
			'$izendaInstantReportQueryService',
			'$izendaInstantReportPivotService',
			'$izendaInstantReportVisualizationService'];
	}

	constructor(private readonly $injector: ng.auto.IInjectorService,
		private readonly $window: ng.IWindowService,
		private readonly $q: ng.IQService,
		private readonly $log: ng.ILogService,
		private readonly $rootScope: ng.IRootScopeService,
		private readonly $izendaUtilUiService: IzendaUtilUiService,
		private readonly $izendaUtilService: IzendaUtilService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaSettingsService: IzendaQuerySettingsService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService,
		private readonly $izendaScheduleService: IzendaScheduleService,
		private readonly $izendaShareService: IzendaShareService,
		private readonly $izendaInstantReportSettingsService: IzendaInstantReportSettingsService,
		private readonly $izendaInstantReportQueryService: IzendaInstantReportQueryService,
		private readonly $izendaInstantReportPivotService: IzendaInstantReportPivotService,
		private readonly $izendaInstantReportVisualizationService: IzendaInstantReportVisualizationService) {
		// const:
		this.emptyFieldGroupOption = $injector.get('izendaDefaultFunctionObject');
		this.emptySubtotalFieldGroupOptions = $injector.get('izendaDefaultSubtotalFunctionObject');
		this.emptyExpressionType = {
			value: '...',
			text: '...'
		};
		this.emptyFieldFormatOption = $injector.get('izendaDefaultFormatObject');
		this.isPageInitialized = false;
		this.isPageReady = false;
		this.existingReportLoadingSchedule = null;
		this.newReportLoadingSchedule = null;
		this.isPreviewSplashVisible = false;
		this.previewSplashText = $izendaLocaleService.localeText('js_WaitPreviewLoading', 'Please wait while preview is loading...');
		this.reportSet = angular.merge({}, $injector.get('izendaInstantReportObjectDefaults'));
		this.reportSet.options.distinct = $izendaInstantReportSettingsService.getSettings().distinct; // set default distinct setting value
		this.restoreDefaultColors(); // set default report colors
		this.activeTables = [];
		this.activeFields = [];
		this.calcFields = [];
		this.activeCheckedFields = [];
		this.constraints = [];
		this.vgStyles = null;
		this.drillDownStyles = null;
		this.expressionTypes = null;
		this.subreports = null;
		this.currentActiveField = null;

		this.uiPanelsState = {
			filtersPanelOpened: false
		};
		this.nextId = 1;
		this.orderCounter = 1;
		this.previewHtml = '';

		this.initialize();
	}

	initialize() {
		// initialize:
		this.$log.debug('Start instant report initialize');
		this.isPageInitialized = false;
		this.isPageReady = false;
		var startInitializingTimestamp = (new Date()).getTime();
		this.$q.all([this.loadDataSources(), this.initializeVgStyles(), this.initializeSubreports(), this.initializeDrillDownStyles(),
		this.initializeExpressionTypes(), this.initializeCharts()]).then(() => {
			this.isPageInitialized = true;
			if (angular.isString(this.existingReportLoadingSchedule)) {
				// existing report
				this.$log.debug('Start loading scheduled report', this.existingReportLoadingSchedule);
				this.loadReport(this.existingReportLoadingSchedule).then(() => {
					this.$log.debug('End loading scheduled report');
					this.existingReportLoadingSchedule = null;
					this.isPageReady = true;
					this.$rootScope.$applyAsync();
					this.$log.debug('Page ready: ', `${(new Date()).getTime() - startInitializingTimestamp}ms`);
				});
			} else if (angular.isString(this.newReportLoadingSchedule)) {
				// new report
				this.$log.debug('Start creating new report');
				this.newReport().then(() => {
					this.$log.debug('End creating new report');
					this.newReportLoadingSchedule = null;
					this.isPageReady = true;
					this.$rootScope.$applyAsync();
					this.$log.debug('Page ready: ', `${(new Date()).getTime() - startInitializingTimestamp}ms`);
				});
			} else {
				// default
				this.isPageReady = true;
				this.$log.debug('Page ready: ', `${(new Date()).getTime() - startInitializingTimestamp}ms`);
			}
		});
	}

	/////////////////////////////////////////
	// common functions
	/////////////////////////////////////////

	/**
	 * Get type group of field operator
	 */
	getFieldFilterOperatorValueType(operator) {
		return this.$izendaInstantReportQueryService.getFieldFilterOperatorValueType(operator);
	}

	private getReportSetFullName() {
		const category = this.reportSet.reportCategory;
		const name = this.reportSet.reportName;
		if (!angular.isString(name) || name.trim() === '')
			return null;
		let result = '';
		if (!this.$izendaUtilService.isUncategorized(category)) {
			result += category + this.$izendaSettingsService.getCategoryCharacter();
		}
		result += name;
		return result;
	}

	private getNextId() {
		return this.nextId++;
	}

	private guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

	private getNextOrder() {
		return this.orderCounter++;
	}

	/**
	 * Becomes true when page is ready to work
	 */
	getPageReady() {
		return this.isPageReady;
	}

	/**
	 * Get whole report set
	 */
	getReportSet() {
		return this.reportSet;
	}

	/**
	 * Get datasources
	 */
	getDataSources() {
		return this.reportSet.dataSources;
	}

	/**
	 * Set datasources
	 */
	setDataSources(dataSources) {
		if (!angular.isArray(dataSources))
			throw '"dataSources" parameter should be array.';
		this.reportSet.dataSources = dataSources;
	}

	/**
	 * Get filters reference
	 */
	getFilters() {
		return this.reportSet.filters;
	}

	/**
	 * Get report set options
	 */
	getOptions() {
		return this.reportSet.options;
	}

	/**
	 * Get drilldown fields
	 */
	getDrillDownFields() {
		return this.reportSet.drillDownFields;
	}

	/**
	 * Get filter options
	 */
	getFilterOptions() {
		return this.reportSet.filterOptions;
	}

	/**
	 * Get preview html
	 */
	getPreview() {
		return this.previewHtml;
	}

	/**
	 * Parse and set constraints
	 */
	setConstraints(constraintsData) {
		this.constraints = constraintsData.Data;
	}

	/**
	 * Find category by given id
	 */
	getCategoryById(id) {
		let i = 0;
		const datasources = this.getDataSources();
		while (i < datasources.length) {
			const datasource = datasources[i];
			if (datasource.id === id)
				return datasource;
			i++;
		}
		return null;
	}

	/**
	 * Find first table by property value.
	 */
	getTableByProperty(propertyName, value, caseIndependent?) {
		if (angular.isUndefined(propertyName))
			throw 'propertyName parameter should be set.';
		const datasources = this.getDataSources();
		for (let i = 0; i < datasources.length; i++) {
			const category = datasources[i];
			for (let j = 0; j < category.tables.length; j++) {
				const table = category.tables[j];
				if (!table.hasOwnProperty(propertyName))
					throw 'Table don\'t have property ' + propertyName;
				let propertyValue = table[propertyName];
				let compareValue = value;
				if (propertyValue && caseIndependent)
					propertyValue = (propertyValue + '').toLowerCase();
				if (compareValue && caseIndependent)
					compareValue = (compareValue + '').toLowerCase();
				if (propertyValue === compareValue)
					return table;
			}
		}
		return null;
	}

	/**
	 * Find table by given id
	 */
	getTableById(id) {
		return this.getTableByProperty('id', id);
	}

	/**
	 * Find table by given sysname
	 * @param {string} sysname.
	 * @returns {object} table object. 
	 */
	getTableBySysname(sysname) {
		return this.getTableByProperty('sysname', sysname);
	}

	/**
	 * Find table by name. (Case independent)
	 * @param {string} name.
	 * @returns {object} table object.
	 */
	getTableByName(name) {
		return this.getTableByProperty('name', name, true);
	}

	/**
	 * Find field by given id
	 */
	getFieldById(id) {
		let i = 0;
		const datasources = this.getDataSources();
		while (i < datasources.length) {
			let j = 0;
			const tables = datasources[i].tables;
			while (j < tables.length) {
				let k = 0;
				const fields = tables[j].fields;
				while (k < fields.length) {
					const field = fields[k];
					if (field.id === id) {
						return field;
					}
					if (field.isMultipleColumns && field.multipleColumns.length) {
						const multipleField = field.multipleColumns.firstOrDefault(f => f.id === id);
						if (multipleField)
							return multipleField;
					}
					k++;
				}
				j++;
			}
			i++;
		}
		return null;
	}

	/**
	 * Get all tables in all datasources
	 */
	getAllTables() {
		return this.getDataSources().reduce((result, category) => result.concat(category.tables), []);
	}

	/**
	* Get checked tables
	*/
	getActiveTables() {
		return this.activeTables;
	}

	/**
	 * Find field by guid
	 */
	getCalcField(calcFieldId) {
		return this.calcFields.firstOrDefault(c => c.sysname === calcFieldId);
	}

	private getField(propertyName, propertyValue, findInAllTables?) {
		if (propertyValue && propertyValue.indexOf('fldId|') === 0)
			return this.getCalcField(propertyValue);

		const tablesCollection = (typeof (findInAllTables) === 'boolean' && findInAllTables)
			? this.getAllTables()
			: this.getActiveTables();

		// find first field in tables which matches predicate "propertyName = propertyValue":
		return tablesCollection.firstOrDefaultInInner('fields', f =>
			f.hasOwnProperty(propertyName) && f[propertyName] === propertyValue);
	}

	/**
	 * Find field by sysname
	 */
	getFieldBySysName(sysname, findInAllTables?) {
		return this.getField('sysname', sysname, findInAllTables);
	}

	/**
	 * Check if functions allowed to field
	 */
	isBinaryField(field) {
		if (!field) return false;
		const expressionType = field.expressionType;
		if (expressionType && expressionType.value && expressionType.value !== '...')
			return ['Binary', 'Other', 'None'].indexOf(expressionType.value) >= 0;
		return field.sqlType === 'Text' || field.sqlType === 'Image';
	}

	/**
	 * Get checked and not checked fields in active tables;
	 * TODO: it is not a good idea to assign values to "additionalGroup" property in get function.
	 */
	getAllFieldsInActiveTables(appendCalcFields?) {
		this.activeFields.forEach(f =>
			f.additionalGroup = f.tableName);

		if (!appendCalcFields)
			return this.activeFields;

		this.calcFields.forEach(f =>
			f.additionalGroup = this.$izendaLocaleService.localeText('js_calcFields', 'Calculated Fields'));

		return this.activeFields.concat(this.calcFields);
	}

	/**
	 * Get active (checked) fields (including multiple fields).
	 * @param {object} table Table object.
	 * @returns {object[]} Checked fields collection.
	 */
	getActiveFields(table) {
		return table.fields.reduce((result: any[], f: any) => {
			if (!f.isMultipleColumns && f.checked)
				result.push(f);
			else if (f.isMultipleColumns)
				result = result.concat(f.multipleColumns.filter(fm => fm.checked));
			return result;
		}, []);
	}

	/**
	 * Base fields iterator function
	 * @param {function} fieldHandler iterator "each" handler
	 * @param {function} getFieldsFunction field filter function (function(table) {... return fieldsArray; })
	 * @param {object} context context object
	 */
	eachFieldsBase<T, F>(
		fieldHandler: (field: F, table: T) => void,
		getFieldsFunction: (table: T) => F[],
		context?: any) {
		if (!angular.isFunction(fieldHandler))
			throw 'fieldHandler should be a function.';

		this.getActiveTables().forEach(t => {
			var aFields = getFieldsFunction(t);
			if (aFields && aFields.length)
				aFields.forEach(f => fieldHandler.call(angular.isDefined(context) ? context : this, f, t));
		});
	}

	/**
	 * Works like each. Iterate through checked fields
	 */
	eachActiveFields(fieldHandler, context?) {
		this.eachFieldsBase(fieldHandler, this.getActiveFields, context);
	}

	/**
	 * Get all checked fields.
	 */
	getAllActiveFields() {
		var result = [];
		this.eachActiveFields(field => result.push(field));
		return result;
	}

	/**
	 * Get all checked and visible fields.
	 */
	getAllVisibleFields() {
		return this.getAllActiveFields().filter(f => f.visible);
	}

	/////////////////////////////////////////
	// group functions
	/////////////////////////////////////////
	/**
	 * Check if functions allowed to field
	 */
	isActiveFieldsContainsBinary() {
		return this.getAllActiveFields().some(f => this.isBinaryField(f));
	}

	/////////////////////////////////////////
	// group functions
	/////////////////////////////////////////

	/**
	 * Check if field grouped
	 */
	isFieldGrouped(field) {
		const compareWithValue = this.emptyFieldGroupOption.value;
		if (!field.groupByFunction || !field.groupByFunction.value)
			return false;
		return field.groupByFunction.value.toLowerCase() !== compareWithValue.toLowerCase();
	}

	/**
	 * Check if field grouped and not 'group' function is applied.
	 */
	isFieldGroupedWithFunction(field) {
		return this.isFieldGrouped(field) && field.groupByFunction.value.toLowerCase() !== 'group';
	}

	/**
	 * Update field formats (it depends on selected group function)
	 */
	updateFieldFormats(field, defaultFormatString?) {
		const gotFieldFormats = (returnObj, defaultTypeGroup, resolveFunc) => {
			field.formatOptionGroups = this.$izendaUtilService.convertOptionsByPath(returnObj);
			var formatToApply;
			var defaultTypeGroupFormatString = this.getDefaultFieldFormat(defaultTypeGroup);
			if (angular.isString(defaultFormatString) && defaultFormatString) {
				formatToApply = this.$izendaUtilService.getOptionByValue(field.formatOptionGroups, defaultFormatString);
				if (!formatToApply) {
					formatToApply =
						this.$izendaUtilService.getOptionByValue(field.formatOptionGroups, defaultTypeGroupFormatString);
				}
			} else {
				formatToApply =
					this.$izendaUtilService.getOptionByValue(field.formatOptionGroups, defaultTypeGroupFormatString);
			}
			field.format = formatToApply;
			resolveFunc(field);
		};

		return this.$q(resolve => {
			// isFieldGrouped guarantees that field.groupByFunction.value will be non-empty and don't have "None" value.
			if (this.isFieldGrouped(field) && ['min', 'max', 'sum', 'sum_distinct', 'group'].indexOf(field.groupByFunction.value.toLowerCase()) < 0) {
				this.$izendaInstantReportQueryService.getFieldFormats(field, field.groupByFunction.dataTypeGroup).then(returnObj => {
					gotFieldFormats(returnObj, field.groupByFunction.dataTypeGroup, resolve);
				});
			} else {
				this.$izendaInstantReportQueryService.getFieldFormats(field).then(returnObj => {
					gotFieldFormats(returnObj, field.typeGroup, resolve);
				});
			}
		});
	}

	/**
	 * Get group by given value
	 */
	getGroupByValue(field, value) {
		return this.$izendaUtilService.getOptionByValue(field.groupByFunctionOptions, value, true);
	}

	/**
	 * Get Subtotal group by given value
	 */
	getGroupBySubtotalValue(field, value) {
		return this.$izendaUtilService.getOptionByValue(field.groupBySubtotalFunctionOptions, value, true);
	}

	/**
	 * Check if checked fields has function
	 */
	isReportUseGroup() {
		const activeTables = this.getActiveTables();
		if (activeTables.length === 0)
			return false;

		let result: boolean = false;
		this.eachActiveFields(field => {
			if (this.isFieldGrouped(field))
				result = true;
		});
		return result;
	}

	/**
	 * Reset all groups which was grouped automatically.
	 */
	resetAutoGroups() {
		// check group function:
		this.eachActiveFields(field => {
			if (!this.isBinaryField(field)) {
				field.groupByFunction = this.getGroupByValue(field, 'NONE');
				this.updateFieldFormats(field);
			}
		});
	}

	/** 
	 * Check if report has group and apply group by for other columns.
	 */
	applyAutoGroups(force?) {
		if (!force) {
			const hasGroup = this.isReportUseGroup();
			if (!hasGroup)
				return;
		}
		// check group function:
		this.eachActiveFields(field => {
			if (this.isBinaryField(field))
				return;
			if (!this.isFieldGrouped(field)) {
				field.groupByFunction = this.getGroupByValue(field, 'GROUP');
				this.updateFieldFormats(field);
			}
		});
	}

	/**
	 * Get possible visual group styles from server
	 */
	initializeVgStyles() {
		return this.$q(resolve => {
			this.$izendaInstantReportQueryService.getVgStyles().then(result => {
				this.vgStyles = result[0].options;
				resolve();
			});
		});
	}

	/**
	 * Get visual group styles
	 */
	getVgStyles() {
		return this.vgStyles;
	}

	/**
	 * Initialize possible expression types.
	 */
	initializeExpressionTypes() {
		return this.$q(resolve => {
			this.$izendaInstantReportQueryService.getExpressionTypes().then(result => {
				this.expressionTypes = [];
				const options = result[0].options;
				if (options)
					this.expressionTypes = this.expressionTypes.concat(options.filter(o => o.value !== ''));
				resolve();
			});
		});

	}

	/**
	 * Initialize possible drilldown styles from server
	 */
	initializeDrillDownStyles() {
		return this.$q(resolve => {
			this.$izendaInstantReportQueryService.getDrillDownStyles().then(result => {
				this.drillDownStyles = [];
				const options = result[0].options;
				if (options)
					options.forEach(o => {
						o.disabled = false;
						this.drillDownStyles.push(o);
					});
				resolve();
			});
		});
	}

	/**
	 * Disable EmbeddedDetail drilldown style for current report and (AUTO)
	 */
	disableEmbeddedDrillDownStyle(field) {
		this.drillDownStyles.forEach(ddStyle => {
			ddStyle.disabled = false;
			var reportInfo = this.$izendaUrlService.getReportInfo();
			if (ddStyle.value === 'EmbeddedDetail') {
				ddStyle.disabled = field.subreport === '(AUTO)' || field.subreport === reportInfo.fullName;
			}
		});
	}

	/**
	 * Get drilldown styles
	 */
	getDrillDownStyles() {
		return this.drillDownStyles;
	}

	getExpressionTypes() {
		return this.expressionTypes;
	}

	initializeSubreports() {
		return this.$q(resolve => {
			this.$izendaInstantReportQueryService.getSubreports().then(result => {
				this.subreports = result[0].options;
				resolve();
			});
		});
	}

	getSubreports() {
		return this.subreports;
	}

	/**
	* Initialize charts
	*/
	initializeCharts() {
		return this.$q(resolve => {
			const settings = this.$izendaInstantReportSettingsService.getSettings();
			if (!settings.showChartTab || !settings.visionAllowed) {
				resolve();
				return;
			}
			this.$izendaInstantReportVisualizationService.loadVisualizations().then(() => resolve());
		});
	}

	/////////////////////////////////////////
	// validation functions
	/////////////////////////////////////////

	/**
	 * Remove all validation messages
	 */
	clearValidation() {
		if (!angular.isArray(this.getDataSources()))
			return;
		this.getDataSources().forEach(category => {
			category.tables.forEach(table => {
				table.validateMessages = [];
				table.validateMessageLevel = null;
				table.fields.forEach(field => {
					field.validateMessages = [];
					field.validateMessageLevel = null;
				});
			});
		});
	}

	/**
	 * Validate report and set validate messages to tables and fields
	 */
	validateReport() {
		this.clearValidation();
		var validationFailed: boolean = false;
		const activeTables = this.getActiveTables();
		if (activeTables.length === 0)
			return false;
		var hasGroup = this.isReportUseGroup();

		this.eachActiveFields(field => {
			if (hasGroup && this.isBinaryField(field)) {
				// if field have sql type which can't be grouped
				field.validateMessages.push({
					messageType: 'danger',
					message: this.$izendaLocaleService.localeTextWithParams(
						'js_CantUseWithGroup',
						'Can\'t use fields with sql type "{0}" with GROUP BY statement',
						[field.sqlType])
				});
				field.validateMessageLevel = 'danger';
				validationFailed = true;
			} else if (hasGroup && !this.isFieldGrouped(field)) {
				// if field have no group function
				field.validateMessages.push({
					messageType: 'danger',
					message: this.$izendaLocaleService.localeText('js_MustBeFunction', 'If functions are used, each selection must be a function.')
				});
				field.validateMessageLevel = 'danger';
				validationFailed = true;
			}
		});
		return validationFailed;
	}

	/////////////////////////////////////////
	// common UI functions
	/////////////////////////////////////////

	hideAllPanels() {
		this.uiPanelsState.filtersPanelOpened = false;
	}

	getFiltersPanelOpened() {
		return this.uiPanelsState.filtersPanelOpened;
	}

	setFiltersPanelOpened(value) {
		this.hideAllPanels();
		this.uiPanelsState.filtersPanelOpened = value;
	}

	/////////////////////////////////////////
	// datasources functions
	/////////////////////////////////////////

	/**
	 * Algorithm which find nodes which can't be deactivated
	 */
	findBridgesForGraph(nodes, links) {
		const n = nodes.length;
		const used = new Array(n);
		const tin = new Array(n);
		const fup = new Array(n);
		let timer: number = 0;
		const bridgeNodes = [];

		const getLinksForNode = node => {
			const result = [];
			for (let i = 0; i < links.length; i++) {
				const link = links[i];
				const link1 = link[0];
				const link2 = link[1];
				if (link1 === link2)
					continue;
				if (link1 === node && result.indexOf(link2) < 0)
					result.push(link2);
				if (link2 === node && result.indexOf(link1) < 0)
					result.push(link1);
			}
			return result;
		};

		const dfs = (v, p?) => {
			used[v] = true;
			tin[v] = fup[v] = timer++;
			const currentLinks = getLinksForNode(nodes[v]);
			for (let i = 0; i < currentLinks.length; i++) {
				const to = currentLinks[i];
				if (to === p) continue;
				if (used[to])
					fup[v] = Math.min(fup[v], tin[to]);
				else {
					dfs(to, v);
					fup[v] = Math.min(fup[v], fup[to]);
					if (fup[to] > tin[v]) {
						const isToNodeEdge = getLinksForNode(to).length < 2;
						const isVNodeEdge = currentLinks.length < 2;
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

		const findBridges = () => {
			timer = 0;
			for (let ii = 0; ii < n; ii++) {
				used[ii] = false;
				tin[ii] = null;
				fup[ii] = null;
			}
			for (let i = 0; i < n; i++)
				if (!used[i])
					dfs(i);
		}
		findBridges();

		return bridgeNodes;
	}

	/**
	 * Constraints check and update tables availability.
	 */
	updateTablesAvailability() {
		// create tables which available by foreign keys
		var currentActiveTables = this.getActiveTables();
		var applyConstraints = currentActiveTables.length !== 0;
		var activeTableNames = [];
		var nodeConstraints = [];
		var nodes = [];

		currentActiveTables.forEach((table, iTable) => {
			nodes.push(iTable);
			activeTableNames.push(table.sysname);
		});

		// process constraints data
		var foreignKeyTables = [];
		this.constraints.forEach(constraint => {
			const [part1, part2] = constraint;
			const part1Index = activeTableNames.indexOf(part1);
			const part2Index = activeTableNames.indexOf(part2);
			if (part1Index >= 0 && part2Index >= 0 && part1 !== part2) {
				nodeConstraints.push([part1Index, part2Index]);
			}
			currentActiveTables.forEach(table => {
				if (part1 === table.sysname || part2 === table.sysname) {
					if (foreignKeyTables.indexOf(part1) < 0)
						foreignKeyTables.push(part1);
					if (foreignKeyTables.indexOf(part2) < 0)
						foreignKeyTables.push(part2);
				}
			});
		});

		// enable/disable tables
		this.getDataSources().forEach(category => {
			category.enabled = false;
			// check tables
			category.tables.forEach(table => {
				if (!applyConstraints) {
					category.enabled = true;
					table.enabled = true;
					table.fields.forEach(field => {
						field.enabled = table.enabled;
					});
					return;
				}
				table.enabled = table.active
					|| (foreignKeyTables.indexOf(table.sysname) >= 0
						&& this.$izendaInstantReportSettingsService.getSettings().maxAllowedTables > currentActiveTables.length);
				category.enabled |= table.enabled;
				table.fields.forEach(field => {
					field.enabled = table.enabled;
				});
			});
		});

		// disable bridge tables (tables which are links between two other active tables):
		const result = this.findBridgesForGraph(nodes, nodeConstraints);
		result.forEach(idx => currentActiveTables[idx].enabled = false);
	}

	/**
	 * Set "selected = false" for all fields
	 */
	unselectAllFields() {
		this.getDataSources().forEach(category => {
			category.tables.forEach(table => {
				table.fields.forEach(field => {
					field.selected = false;
					field.multipleColumns.forEach(mField => mField.selected = false);
				});
			});
		});
	}

	/**
	 * Check is calc field exist
	 */
	private calcFieldExist(calcFieldId) {
		return this.calcFields.some(c => c.sysname === calcFieldId);
	}

	/**
	 * Update calc field properties
	 */
	private updateCalcField(field, calcField) {
		calcField.name = `[${field.description}] (calc)`;
	}

	/**
	 * Create calc field
	 */
	private createCalcField(field) {
		const result = angular.copy(field) as any;
		result.sysname = `fldId|${field.guid}`;
		this.updateCalcField(field, result);
		return result;
	}

	/**
	 * Sync calc fields
	 */
	private syncCalcFieldsArray() {
		var newCalcFields = [];
		// remove old calc fields
		this.calcFields.forEach(calcField => {
			let foundField = null;
			const fieldGuid = calcField.sysname.substring(6);
			this.eachActiveFields(field => {
				if (fieldGuid === field.guid)
					foundField = field;
			});
			const isExpressionSet = foundField
				&& angular.isString(foundField.expression)
				&& foundField.expression.trim() !== '';
			if (foundField && (this.isFieldGroupedWithFunction(foundField) || isExpressionSet)) {
				newCalcFields.push(calcField);
				this.updateCalcField(foundField, calcField);
			}
		});
		this.calcFields = newCalcFields;

		// add new
		this.eachActiveFields(field => {
			const isExpressionSet = angular.isString(field.expression)
				&& field.expression.trim() !== '';

			// if field grouped and it is not simple 'GROUP' or it has expression
			if (!this.calcFieldExist(`fldId|${field.guid}`) && (this.isFieldGroupedWithFunction(field) || isExpressionSet)) {
				const calcField = this.createCalcField(field);
				this.calcFields.push(calcField);
			}
		});
	}

	/**
	 * Create active tables array
	 */
	syncActiveTablesArray() {
		this.activeTables = [];
		this.activeFields = [];
		this.activeCheckedFields = [];
		this.getDataSources().forEach(category => {
			category.tables.filter(t => t.active).forEach(table => {
				this.activeTables.push(table);
				this.activeFields = this.activeFields.concat(table.fields);
				this.activeCheckedFields = this.activeCheckedFields.concat(table.fields.filter(f => f.checked));
			});
		});
		this.syncCalcFieldsArray();
	}

	/**
	 * Update tree state after checking table
	 */
	updateParentFolders(table, syncCollapse?) {
		const parentCategory = this.getCategoryById(table.parentId);
		this.syncActiveTablesArray();

		// update category active
		parentCategory.active = parentCategory.tables.some(t => t.active);
		if (syncCollapse)
			parentCategory.collapsed = !parentCategory.active;
		this.updateTablesAvailability();
	}

	/**
	 * Update tree state after checking field
	 */
	updateParentFoldersAndTables(field, syncCollapse?, restrictTableUncheck?) {
		const table = this.getTableById(field.parentId);
		const hasCheckedFields = table.fields.some(f => f.checked);

		// if table checked state false -> true:
		if (hasCheckedFields && !table.active)
			table.order = this.getNextOrder();
		// update table active
		table.active = restrictTableUncheck || hasCheckedFields || !table.enabled;

		if (syncCollapse)
			table.collapsed = !hasCheckedFields;

		// update table
		this.updateParentFolders(table, syncCollapse);
	}

	/**
	 * Update drilldowns
	 */
	updateDrilldowns() {
		this.reportSet.drillDownFields = this.reportSet.drillDownFields.filter(drilldownField => {
			return this.getAllFieldsInActiveTables().some(f => drilldownField.id === f.id);
		});
	}

	/**
	* Get filtered datasources
	*/
	searchInDataDources(searchString, from, to) {
		return this.$q(resolve => {
			if (searchString === '') {
				resolve([]);
				return;
			}
			// start search
			this.$izendaInstantReportQueryService.findInDatasources(searchString, from, to).then(results => {
				// search completed
				if (results && results.length)
					results.forEach((item, idx) => item.id = from + idx);
				resolve(results);
			});
		});
	}

	resetFieldObject(fieldObject, defaultValues?) {
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
		fieldObject.description = this.$izendaUtilService.humanizeVariableName(fieldObject.name);
		fieldObject.isDescriptionSetManually = false;
		fieldObject.order = 0;
		fieldObject.format = this.emptyFieldFormatOption;
		fieldObject.formatOptionGroups = [];
		fieldObject.groupByFunction = this.emptyFieldGroupOption;
		fieldObject.groupByFunctionOptions = [];
		fieldObject.groupBySubtotalFunction = this.emptySubtotalFieldGroupOptions;
		fieldObject.groupBySubtotalFunctionOptions = [];
		fieldObject.subtotalExpression = '';
		fieldObject.allowedInFilters = true;
		fieldObject.isSpParameter = false;
		fieldObject.sort = null;
		fieldObject.italic = false;
		fieldObject.columnGroup = '';
		fieldObject.separator = false;
		fieldObject.textHighlight = '';
		fieldObject.cellHighlight = '';
		fieldObject.valueRange = '';
		fieldObject.width = '';
		fieldObject.labelJustification = 'M';
		fieldObject.valueJustification = ' ';
		fieldObject.visible = true;
		fieldObject.gradient = false;
		fieldObject.bold = false;
		fieldObject.drillDownStyle = '';
		fieldObject.customUrl = '';
		fieldObject.subreport = '';
		fieldObject.expression = '';
		fieldObject.expressionType = this.emptyExpressionType;
		fieldObject.groupByExpression = false;
		fieldObject.validateMessages = [];
		fieldObject.validateMessageLevel = null;

		angular.extend(fieldObject, defaultValues);
	}

	private createFieldObjectInner(fieldProperties) {
		const fieldObject = {
			id: this.getNextId(),
			parentFieldId: null,
			parentId: null,
			name: null,
			tableSysname: null,
			tableName: null,
			sysname: null,
			typeGroup: null,
			type: null,
			sqlType: null,
			allowedInFilters: null,
			isDescriptionSetManually: null,
			description: null,
			order: 0,
			guid: null,
			selected: null,
			checked: null
		};
		this.resetFieldObject(fieldObject, fieldProperties);
		return fieldObject;
	}

	/**
	 * Create field object.
	 */
	createFieldObject(fieldName, tableId, tableSysname, tableName, fieldSysname, fieldTypeGroup,
		fieldType, fieldSqlType, allowedInFilters, isSpParameter) {
		const fieldObject = this.createFieldObjectInner({
			guid: this.guid(),
			parentId: tableId,
			name: fieldName,
			tableSysname: tableSysname,
			tableName: tableName,
			sysname: fieldSysname,
			typeGroup: fieldTypeGroup,
			type: fieldType,
			sqlType: fieldSqlType,
			allowedInFilters: allowedInFilters,
			isSpParameter: isSpParameter
		});
		return fieldObject;
	}

	/**
	 * Copy field object state
	 */
	copyFieldObject(from, to, replaceName?) {
		to.id = from.id;
		to.guid = from.guid;
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
	}

	/**
	 * Reset datasources state
	 */
	resetDataSources() {
		const datasources = this.getDataSources();
		if (!angular.isArray(datasources))
			return;
		datasources.forEach(category => {
			category.visible = true;
			category.active = false;
			category.enabled = true;
			category.collapsed = true;
			// iterate tables
			category.tables.forEach(table => {
				table.visible = true;
				table.active = false;
				table.enabled = true;
				table.collapsed = true;
				table.validateMessages = [];
				table.validateMessageLevel = null;
				// iterate fields
				table.fields.forEach(field => {
					this.resetFieldObject(field);
				});
			});
		});
	}

	/**
	 * Refresh field description
	 */
	autoUpdateFieldDescription(field) {
		if (!field.isDescriptionSetManually) {
			field.description = this.generateDescription(field);
		}
	}

	/**
	 * Convert fields which got from server into format which used in app and add it to table object.
	 * @param {Array} fields. Server side fields object.
	 */
	convertAndAddFields(tableObject, fields) {
		if (fields && fields.length)
			fields.forEach((field) => {
				var fieldObject = this.createFieldObject(field.name, tableObject.id, tableObject.sysname, tableObject.name, field.sysname,
					field.typeGroup, field.type, field.sqlType, field.allowedInFilters, field.isSpParameter === 'True');
				this.autoUpdateFieldDescription(fieldObject);
				tableObject.fields.push(fieldObject);
			});
		tableObject.lazy = false;
	}

	/**
	* Convert datasources for future use it in app
	*/
	convertDataSources(dataSources) {
		if (!angular.isArray(dataSources))
			return [];
		var result = [];
		// iterate categories
		var uncategorized = null;
		dataSources.forEach(category => {
			const categoryObject = {
				id: this.getNextId(),
				name: category.DataSourceCategory,
				tables: [],
				visible: true,
				active: false,
				enabled: true,
				collapsed: true
			};
			// iterate tables
			category.tables.forEach(table => {
				const tableObject = {
					id: this.getNextId(),
					order: 0,
					parentId: categoryObject.id,
					name: table.name,
					sysname: table.sysname,
					tableType: table.tableType,
					fields: [],
					visible: true,
					active: false,
					enabled: true,
					collapsed: true,
					validateMessages: [],
					validateMessageLevel: null,
					lazy: null
				};
				// add field if loaded
				if (table.fields === 'LAZIED') {
					tableObject.lazy = true;
				} else {
					this.convertAndAddFields(tableObject, table.fields);
				}
				categoryObject.tables.push(tableObject);
			});

			if (this.$izendaUtilService.isUncategorized(categoryObject.name)
				&& this.$izendaInstantReportSettingsService.getSettings().moveUncategorizedToLastPosition) {
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
	}

	createFieldObjectForSend(field) {
		return {
			guid: field.guid,
			sysname: field.sysname,
			description: field.description ? field.description : this.$izendaUtilService.humanizeVariableName(field.name),
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
	}

	/**
	 * Create object with report data which will be send to server.
	 */
	createReportSetConfigForSend(previewTop?) {
		// iterate through active fields.
		const activeTables = this.getActiveTables();
		if (activeTables.length === 0)
			return null;

		const options = angular.extend({}, this.getOptions());
		const filterOptions = angular.extend({}, this.getFilterOptions());

		const reportSetConfig = {
			reportName: this.reportSet.reportName,
			reportCategory: this.reportSet.reportCategory,
			joinedTables: [],
			drillDownFields: [],
			fields: [],
			filters: [],
			charts: [],
			options: options,
			filterOptions: filterOptions,
			schedule: null,
			share: {},
			pivot: null
		};
		if (typeof (reportSetConfig.options.page.itemsPerPage) !== 'number') {
			reportSetConfig.options.page.itemsPerPage = parseInt(reportSetConfig.options.page.itemsPerPage);
		}

		// preview top
		const reportTop = parseInt(reportSetConfig.options.top);
		if (angular.isNumber(previewTop)) {
			if (!isNaN(reportTop) && (reportTop < previewTop || previewTop < 0))
				reportSetConfig.options.top = reportTop;
			else
				reportSetConfig.options.top = previewTop;
		}

		// schedule
		reportSetConfig.schedule = this.$izendaScheduleService.getScheduleConfigForSend();

		// share
		reportSetConfig.share = this.$izendaShareService.getShareConfigForSend();

		// add drilldown fields.
		reportSetConfig.drillDownFields = this.getDrillDownFields().map(f => f.sysname);

		// add charts
		if (this.reportSet.charts.length > 0) {
			var chart = this.reportSet.charts[0] as any;
			if (chart) {
				reportSetConfig.charts[0] = {
					name: chart.name,
					category: chart.categoryName,
					properties: chart.properties ? chart.properties : null
				};
			}
		}

		// prepare tables
		const activeFieldsList = this.getAllActiveFields();
		activeFieldsList.sort((field1, field2) => field1.order - field2.order);
		for (let i = 0; i < activeFieldsList.length; i++)
			activeFieldsList[i].order = i + 1;

		// add filters to config
		this.getFilters().forEach(filter => {
			if (filter.field === null || !angular.isObject(filter.operator)) {
				filter.isValid = false;
				return;
			}
			filter.isValid = true;

			// prepare filter values to send
			let preparedValues = filter.values;
			// date string created according to format which used in "internal static string DateLocToUs(string date)":
			const valueType = this.getFieldFilterOperatorValueType(filter.operator);
			if (valueType === 'select_multiple' || valueType === 'select_popup' || valueType === 'select_checkboxes') {
				preparedValues = [filter.values.join(',')];
			} else if (valueType === 'field' && filter.values.length === 1 && filter.values[0] !== null) {
				preparedValues = [filter.values[0].sysname];
			} else if (valueType === 'twoDates') {
				let momentObj1: any = null;
				let momentObj2: any = null;
				if (filter.values[0])
					momentObj1 = moment(filter.values[0]);
				if (filter.values[1])
					momentObj2 = moment(filter.values[1]);
				preparedValues = [
					momentObj1 && momentObj1.isValid() ? momentObj1.format(this.$izendaSettingsService.getDefaultDateFormatString()) : null,
					momentObj2 && momentObj2.isValid() ? momentObj2.format(this.$izendaSettingsService.getDefaultDateFormatString()) : null
				];
			} else if (valueType === 'oneDate') {
				let momentObj: any = null;
				if (filter.values[0])
					momentObj = moment(filter.values[0]);
				preparedValues = [
					momentObj && momentObj.isValid() ? momentObj.format(this.$izendaSettingsService.getDefaultDateFormatString()) : null
				];
			}

			const filterObj = {
				required: filter.required,
				description: filter.description,
				parameter: filter.parameter,
				sysname: filter.field.sysname,
				operatorString: filter.operator.value,
				values: preparedValues,
				titleFormat: filter.titleFormat,
				customPopupTemplateUrl: filter.customPopupTemplateUrl
			};

			const isBlank = filterObj.values.every(v => v === '');
			if (isBlank)
				filterObj.values = [];

			reportSetConfig.filters.push(filterObj);
		});

		// pivot
		this.$izendaInstantReportPivotService.syncPivotState(this.getAllFieldsInActiveTables());
		const pivotConfig = this.$izendaInstantReportPivotService.getPivotDataForSend();
		if (!pivotConfig)
			reportSetConfig.pivot = null;
		else {
			reportSetConfig.pivot = {
				options: pivotConfig.options
			};
			reportSetConfig.pivot.pivotColumn = this.createFieldObjectForSend(pivotConfig.pivotColumn);
			reportSetConfig.pivot.cellValues = pivotConfig.cellValues
				.filter(c => !!c)
				.map(c => this.createFieldObjectForSend(c));
		}

		// fill joined tables:
		reportSetConfig.joinedTables = activeTables.map(t => {
			return { sysname: t.sysname };
		});

		// fill fields
		activeTables.forEach(table => {
			var activeFields = this.getActiveFields(table);
			reportSetConfig.fields.pushAll(activeFields.map(this.createFieldObjectForSend));
		});
		// update field order 
		reportSetConfig.fields.sort((f1, f2) => {
			if (f1.isVgUsed ^ f2.isVgUsed)
				if (f1.isVgUsed) return -1;
				else return 1;
			else return f1.order - f2.order;
		});
		reportSetConfig.fields.forEach(f => f.order = this.getNextOrder());

		this.$log.debug('reportSetConfig: ', reportSetConfig);
		return reportSetConfig;
	}

	/**
	 * Load fields for lazy table
	 * @param {object} table 
	 */
	loadLazyFields(table) {
		return this.$q(resolve => {
			if (!table.lazy) {
				resolve(false);
				return;
			}
			this.$izendaInstantReportQueryService.getFieldsInfo(table.sysname).then(data => {
				this.convertAndAddFields(table, data.fields);
				resolve(true);
			});
		});
	}

	/**
	 * Clear report preview.
	 */
	clearReportPreviewHtml() {
		this.previewHtml = '';
		this.$izendaInstantReportQueryService.cancelAllPreviewQueries();
	}

	/**
	 * Get and apply preview for current report set config.
	 */
	getReportPreviewHtml() {
		this.clearReportPreviewHtml();
		this.isPreviewSplashVisible = true;
		this.$rootScope.$applyAsync();
		return this.$q(resolve => {
			const options = this.getOptions();
			const reportSetToSend = this.createReportSetConfigForSend(options.previewTop);
			this.$izendaInstantReportQueryService.getReportSetPreviewQueued(reportSetToSend).then(data => {
				this.previewHtml = data as string;
				this.isPreviewSplashVisible = false;
				this.getOptions().rowsRange = null;
				this.$rootScope.$applyAsync();
				resolve();
			}, () => {
				// reject
				this.isPreviewSplashVisible = false;
				this.$rootScope.$applyAsync();
				resolve();
			});
		});
	}

	/**
	 * Set top value for preview
	 */
	setPreviewTop(value) {
		const options = this.getOptions();
		if (!angular.isNumber(value) || value < 0) {
			options.previewTop = -2147483648;
		} else {
			options.previewTop = value;
		}
	}

	/**
	 * Save report set
	 */
	saveReportSet(name, category) {
		const rs = this.getReportSet();
		const nameToSave: string = angular.isDefined(name) ? name : rs.reportName;
		const categoryToSave = angular.isString(category) && category !== '' ? category : '';

		rs.reportName = nameToSave;
		rs.reportCategory = categoryToSave;
		if (this.$izendaUtilService.isUncategorized(rs.reportCategory))
			rs.reportCategory = '';

		const reportSetToSend = this.createReportSetConfigForSend();
		return this.$q((resolve, reject) => {
			this.$izendaInstantReportQueryService.saveReportSet(reportSetToSend).then(result => {
				const reportSetFullName = this.getReportSetFullName();
				if (angular.isString(reportSetFullName))
					this.$izendaUrlService.setReportFullName(reportSetFullName);
				resolve(result);
			}, error => {
				reject(error);
			});
		});
	}

	/**
	 * Send send report set to server and set it as CRS
	 */
	setReportSetAsCrs(applyPreviewTop?) {
		return this.$q(resolve => {
			const reportSetToSend = this.createReportSetConfigForSend();
			if (applyPreviewTop)
				reportSetToSend.options.applyPreviewTop = true;

			this.$izendaInstantReportQueryService.setReportAsCrs(reportSetToSend).then(result => {
				if (result === 'OK') {
					resolve([true]);
				} else {
					resolve([false, result]);
				}
			});
		});
	}

	/**
	 * Generate pdf with current report and send file to user
	 */
	exportReportAs(exportType) {
		return this.$q(resolve => {
			const reportSetToSend = this.createReportSetConfigForSend();
			reportSetToSend.options.applyPreviewTop = false;
			this.$izendaInstantReportQueryService
				.exportReportInNewWindow(reportSetToSend, exportType)
				.then(() => resolve(true));
		});
	}

	/**
	 * Generate html and open print page.
	 */
	printReportAsHtml() {
		return this.$q(resolve => {
			const reportSetToSend = this.createReportSetConfigForSend();
			reportSetToSend.options.applyPreviewTop = false;
			this.$izendaInstantReportQueryService
				.exportReportInNewWindow(reportSetToSend, 'print')
				.then(() => resolve(true));
		});
	}

	/**
	 * Print report function
	 */
	printReport(printType) {
		return this.$q(resolve => {
			if (printType === 'html') {
				this.printReportAsHtml()
					.then(success => resolve({
						success: success,
						message: ''
					}));
			} else if (printType === 'pdf') {
				this.exportReportAs('PDF').then(
					success => resolve({
						success: success,
						message: ''
					}));
			} else {
				resolve({
					success: false,
					message: `Unknown print type ${printType}`
				});
			}
		});
	}

	/**
	 * Open report in report designer.
	 */
	openReportInDesigner() {
		this.setReportSetAsCrs().then(() => {
			var url = this.$izendaUrlService.settings.urlReportDesigner;
			if (angular.isString(this.reportSet.reportName) && this.reportSet.reportName !== '')
				url += `?rn=${this.getReportSetFullName()}&tab=Fields`;
			else
				url += '?tab=Fields';
			this.$window.location.href = getAppendedUrl(url);
		});
	}

	/**
	 * Export report function
	 */
	exportReport(exportType) {
		return this.$q(resolve => {
			if (exportType === 'excel') {
				this.exportReportAs('XLS(MIME)')
					.then(success => resolve({
						success: success,
						message: ''
					}));
			} else if (exportType === 'word') {
				this.exportReportAs('DOC')
					.then(success => resolve({
						success: success,
						message: ''
					}));
			} else if (exportType === 'csv') {
				const exportMode = this.$izendaSettingsService.getBulkCsv() ? 'BULKCSV' : 'CSV';
				this.exportReportAs(exportMode)
					.then(success => resolve({
						success: success,
						message: ''
					}));
			} else if (exportType === 'xml') {
				this.exportReportAs('XML')
					.then(success => resolve({
						success: success,
						message: ''
					}));
			} else {
				resolve({
					success: false,
					message: `Unknown export type ${exportType}`
				});
			}
		});
	}

	/**
	 * Send report link via client email
	 */
	sendReportLinkEmail() {
		const reportInfo = this.$izendaUrlService.getReportInfo();
		if (!angular.isObject(reportInfo) || !angular.isString(reportInfo.fullName) || reportInfo.fullName === '')
			throw 'Can\'t send email without report name';
		const reportViewerLocation = location.href.replaceAll(this.$izendaUrlService.settings.urlInstantReport, this.$izendaUrlService.settings.urlReportViewer);
		let redirectUrl = `?subject=${encodeURIComponent(reportInfo.fullName)}&body=${encodeURIComponent(reportViewerLocation)}`;
		redirectUrl = `mailto:${redirectUrl.replace(/ /g, '%20')}`;
		this.$window.top.location.href = getAppendedUrl(redirectUrl);
	}

	/**
	 * Load instant report datasources
	 */
	loadDataSources() {
		return this.$q(resolve => {
			this.$izendaInstantReportQueryService.getConstraintsInfo().then(constraintsData => {
				this.setConstraints(constraintsData);
				this.$izendaInstantReportQueryService.getDatasources().then(data => {
					this.setDataSources(this.convertDataSources(data));
					resolve();
				});
			});
		});
	}

	/////////////////////////////////////////
	// charts
	/////////////////////////////////////////

	/**
	 * Set current chart
	 */
	selectChart(chart) {
		this.reportSet.charts[0] = chart;
	}

	/**
	 * Get current chart
	 */
	getSelectedChart() {
		return this.reportSet.charts.length ? this.reportSet.charts[0] : null;
	}

	/////////////////////////////////////////
	// filters
	/////////////////////////////////////////

	validateFilter(filter) {
		filter.isValid = true;
		filter.validationMessages = [];
		filter.validationMessageString = '';

		// check: is filter refer to field which in active table.
		if (filter.field !== null) {
			const filterField = filter.field;
			const found = this.getAllFieldsInActiveTables(true).some(f => f.sysname === filterField.sysname);
			if (!found) {
				filter.isValid = false;
				filter.validationMessages.push(
					this.$izendaLocaleService.localeText('js_FilterFieldIsntIncluded', 'Filter field refers on datasource which isn\'t included to report'));
				filter.validationMessageString = filter.validationMessages.join(', ');
			}
		}
	}


	/**
	 * Disable filters which are not pass validation
	 */
	validateFilters() {
		this.reportSet.filters.forEach(f => this.validateFilter(f));
	}

	/**
	 * Mark filters as ready to use.
	 */
	startFilters() {
		this.reportSet.filters.forEach(f => f.isFilterReady = true);
	}

	/**
	 * Find filter operator by string value
	 */
	getFilterOperatorByValue(filter, value) {
		if (!angular.isString(value) || !value)
			return null;
		return filter.operators.firstOrDefault(f => f.value === value);
	}

	/**
	 * Check all stored procedure parameters assigned in filters
	 */
	isAllSpParametersAssigned() {
		const spParamFields = this.getAllFieldsInActiveTables().filter(field => field.isSpParameter);
		if (!spParamFields.length)
			return true;

		const filters = this.getFilters();
		let foundUnassignedParam: boolean = false;
		spParamFields.forEach(field => {
			const found = filters.some(f => f.field && f.field === field);
			if (!found)
				foundUnassignedParam = true;
		});
		return !foundUnassignedParam;
	}

	/**
	 * Get filter operator list for field
	 */
	getFieldFilterOperatorList(field) {
		return this.$q(resolve => {
			var tablesParam = this.getActiveTables().map(table => table.sysname).join(',');
			this.$izendaInstantReportQueryService.getFieldOperatorList(field, tablesParam).then(data => {
				var result = [];
				data.forEach(d => {
					const groupName = d.name ? d.name : undefined;
					result = result.concat(d.options
						.filter(o => o.value !== '...')
						.map(o => angular.extend({ groupName: groupName }, o)));
				});
				resolve(result);
			});
		});
	}

	/**
	 * Set filter operator and update available values
	 */
	setFilterOperator(filter, operatorName) {
		return this.$q(resolve => {
			if (!angular.isObject(filter.field)) {
				filter.operators = [];
				filter.operator = null;
				resolve(filter);
				return;
			}

			this.getFieldFilterOperatorList(filter.field).then(result => {
				// select filter operator to apply
				var operatorNameToApply = null;
				if (filter.operator)
					operatorNameToApply = filter.operator.value;
				if (angular.isString(operatorName))
					operatorNameToApply = operatorName;

				filter.operators = result;
				filter.operator = this.getFilterOperatorByValue(filter, operatorNameToApply);

				// update field value
				var operatorType = this.getFieldFilterOperatorValueType(filter.operator);
				if (operatorType === 'field') {
					filter.values = [this.getFieldBySysName(filter.values[0])];
				} else if (operatorType === 'oneDate' || operatorType === 'twoDates') {
					filter.values = filter.values.map(v => {
						const parsedDate = moment(
							v,
							[this.$izendaSettingsService.getDefaultDateFormatString(), this.$izendaSettingsService.getDefaultDateFormatString('M/D/YYYY')],
							true);
						if (parsedDate.isValid())
							return parsedDate._d;
						return null;
					});
				} else if (filter.operator && filter.operator.value === 'Equals_TextArea') {
					filter.currentValue = filter.values.join();
				}
				resolve(filter);
			});
		});
	}

	/**
	 * Load filter existent values list (you need to ensure that all operators were applied before starting update existing values)
	 */
	updateFieldFilterExistentValues(filter, forceUpdate?) {
		// parse unicode symbols util
		const parseHtmlUnicodeEntities = (str: string): string =>
			angular.element('<textarea />').html(str).text();

		// convert options which we have got from server.
		const convertOptionsForSelect = (options, operatorType) => {
			if (!angular.isArray(options))
				return [];
			var result = [];
			options.forEach(option => {
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

		var syncValues = filterObject => {
			if (filterObject.values.length === 0 || filterObject.operator.value === 'Equals_Autocomplete')
				return;
			filterObject.values = filterObject.values.filter(fv =>
				filterObject.existentValues.map(e => e.value).includes(fv));
		};

		// return promise
		return this.$q(resolve => {
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

			const isCascadingDisabled = this.$window.nrvConfig && !this.$window.nrvConfig.CascadeFilterValues;
			if (!forceUpdate && (this.reportSet.filterOptions.filterLogic || isCascadingDisabled)) {
				resolve(filter);
				return;
			}

			// get constraint filters
			const allFilters = this.getFilters();
			const idx = allFilters.indexOf(filter);
			if (idx < 0)
				throw `Filter ${filter.field !== null ? filter.field.sysname : ''} isn't found in report set filters collection.`;

			// Add constraint filters if filter logic wasn't applied
			let constraintFilters = [];
			if (!this.reportSet.filterOptions.filterLogic)
				constraintFilters = allFilters.slice(0, idx);

			// load existent values
			const operatorType = this.getFieldFilterOperatorValueType(filter.operator);
			if (['select', 'Equals_Autocomplete', 'select_multiple', 'select_popup', 'select_checkboxes'].indexOf(operatorType) >= 0) {
				this.setReportSetAsCrs(false).then(() => {
					this.$izendaInstantReportQueryService
						.getExistentValuesList(this.getActiveTables(), constraintFilters, filter, true, this.reportSet.filterOptions.filterLogic)
						.then(data => {
							filter.existentValues = convertOptionsForSelect(data && data.length ? data[0].options : [], operatorType);
							syncValues(filter);
							const defaultValue = this.$izendaUtilService.getOptionByValue(filter.existentValues, '...');
							if (filter.values.length === 0 && defaultValue)
								filter.values = [defaultValue.value];
							filter.initialized = true;
							resolve(filter);
						});
				});
			} else if (operatorType === 'inTimePeriod') {
				this.$izendaInstantReportQueryService.getPeriodList().then(data => {
					filter.existentValues = convertOptionsForSelect(data && data.length ? data[0].options: [], operatorType);
					syncValues(filter);
					const defaultValue = this.$izendaUtilService.getOptionByValue(filter.existentValues, '...');
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
	}

	/**
	 * Set filter existing values when filterLogic
	 */
	refreshFiltersForFilterLogic() {
		return this.$q(resolve => {
			if (!this.reportSet.filterOptions.filterLogic) {
				resolve();
				return;
			}
			const allFilters = this.getFilters();
			const promises = allFilters.map(filter => this.updateFieldFilterExistentValues(filter, true));
			this.$q.all(promises).then(() => resolve());
		});
	}

	/**
	 * Refresh next filter values.
	 */
	refreshNextFiltersCascading(filter) {
		return this.$q(resolve => {
			const isCascadingDisabled = this.$window.nrvConfig && !this.$window.nrvConfig.CascadeFilterValues;
			if (this.reportSet.filterOptions.filterLogic || isCascadingDisabled) {
				resolve();
				return;
			}
			const allFilters = this.getFilters();
			// TODO: change to: const filtersToRefresh = allFilters.filter((f, fi) => {...});
			let filtersToRefresh;
			if (filter) {
				const idx = allFilters.indexOf(filter);
				if (idx < 0)
					throw `Filter ${filter.field !== null ? filter.field.sysname + ' ' : ''}isn't found in report set filters collection.`;
				filtersToRefresh = allFilters.slice(idx + 1);
			} else {
				filtersToRefresh = allFilters.slice(0);
			}

			// cascading filters update
			if (filtersToRefresh.length > 0) {
				const refreshingFilter = filtersToRefresh[0];
				this.updateFieldFilterExistentValues(refreshingFilter).then(() => {
					this.refreshNextFiltersCascading(refreshingFilter).then(() => {
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
	private createNewFilterBase(fieldSysName, operatorName, values, required, description, parameter, customPopupTemplateUrl) {
		const filterObject = angular.extend({}, this.$injector.get('izendaFilterObjectDefaults'));
		// set field
		let field;
		if (fieldSysName && fieldSysName.indexOf('fldId|') === 0) {
			field = this.getCalcField(fieldSysName);
		} else
			field = this.getFieldBySysName(fieldSysName);
		while (field && field.mcAncestor)
			field = field.mcAncestor;

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
	}

	/**
	 * Load possible formats collection and set format for filter string in description.
	 * @param {object} filter. Filter object (field must me set to apply format)
	 * @param {string} titleFormatName. Format object value
	 * @returns {angular promise}. Promise parameter: filter object. 
	 */
	loadFilterFormats(filter, titleFormatName) {
		// load and set filter format:
		let filterFormatNameToApply = this.emptyFieldFormatOption.value;
		if (angular.isString(titleFormatName) && titleFormatName !== '')
			filterFormatNameToApply = titleFormatName;

		return this.$q(resolve => {
			if (filter.field) {
				this.$izendaInstantReportQueryService.getFilterFormats(filter).then(returnObj => {
					filter.titleFormats = this.$izendaUtilService.convertOptionsByPath(returnObj);
					filter.titleFormat = this.$izendaUtilService.getOptionByValue(filter.titleFormats, filterFormatNameToApply);
					resolve(filter);
				});
			} else {
				resolve(filter);
			}
		});
	}

	/**
	 * Create new filter object with default values
	 */
	createNewFilter(fieldSysName, operatorName, values, required, description, parameter, titleFormatName, customPopupTemplateUrl) {
		const filterObject = this.createNewFilterBase(fieldSysName, operatorName, values, required,
			description, parameter, customPopupTemplateUrl);
		filterObject.isFilterReady = true;
		return this.loadFilterFormats(filterObject, titleFormatName);
	}

	/**
	 * Delete filter from collection
	 */
	removeFilter(filter) {
		const index = this.reportSet.filters.indexOf(filter);
		if (index >= 0) {
			this.reportSet.filters[index].field = null;
			this.reportSet.filters.splice(index, 1);
		}
	}

	/**
	 * Swap filter
	 */
	swapFilters(index0, index1) {
		const filters = this.reportSet.filters;
		const temp = filters[index0];
		filters[index0] = filters[index1];
		filters[index1] = temp;
	}

	/**
	 * Move filter from position to position
	 */
	moveFilterTo(fromIndex, toIndex) {
		this.reportSet.filters.splice(toIndex, 0, this.reportSet.filters.splice(fromIndex, 1)[0]);
	}

	/**
	 * Check current active tables and remove filters which connected to non-active fields
	 */
	syncFilters() {
		const aFields = this.getAllFieldsInActiveTables(true);
		const filters = this.getFilters();

		// find filters to remove
		var filtersToRemove = [];
		filters.forEach(filter => {
			const isFilterActive = aFields
				.some(activeField => filter.field === null || activeField.sysname === filter.field.sysname);
			if (!isFilterActive)
				filtersToRemove.push(filter);
		});

		// remove filters
		filtersToRemove.forEach(f => this.removeFilter(f));
	}

	/**
	 * Load custom template for popup filter.
	 */
	getPopupFilterCustomTemplate(filter) {
		return this.$q(resolve => {
			const field = filter.field;
			if (!filter.field) {
				resolve();
				return;
			}
			const table = this.getTableById(field.parentId);
			this.$izendaInstantReportQueryService.getExistentPopupValuesList(field, table).then(data => {
				if (data.userpage != null)
					filter.customPopupTemplateUrl = data.userpage;
				else
					filter.customPopupTemplateUrl = null;
				resolve();
			});
		});
	}

	/////////////////////////////////////////
	// field options
	/////////////////////////////////////////

	/**
	 * Load field function and apply group by function to field
	 */
	loadFieldFunctions(field, defaultGroupString) {
		return this.$q(resolve => {
			let groupToApply = angular.isString(defaultGroupString) && defaultGroupString
				? defaultGroupString
				: 'NONE';
			this.$izendaInstantReportQueryService
				.getFieldFunctions(field, field.isPivotColumn ? 'pivotField' : 'field')
				.then(returnObj => {
					field.groupByFunctionOptions = this.$izendaUtilService.convertOptionsByPath(returnObj);

					const isSimpleGroupFunction = field.groupByFunctionOptions.length === 2
						&& field.groupByFunctionOptions[0].value.toLowerCase() === 'none'
						&& field.groupByFunctionOptions[1].value.toLowerCase() === 'group';
					if (isSimpleGroupFunction && groupToApply.toLowerCase() === 'none')
						groupToApply = 'GROUP';

					field.groupByFunction = this.getGroupByValue(field, groupToApply);
					// if group list was changed and current group function not in list
					if (field.groupByFunction === null)
						field.groupByFunction = this.getGroupByValue(field, 'NONE');
					resolve(field);
				});
		});
	}

	/**
	 * Load Subtotal field function and apply Subtotal group by function to field
	 */
	loadSubtotalFieldFunctions(field, defaultGroupString) {
		return this.$q(resolve => {
			const groupToApply = angular.isString(defaultGroupString) && defaultGroupString
				? defaultGroupString
				: 'DEFAULT';
			this.$izendaInstantReportQueryService
				.getFieldFunctions(field, 'subtotal')
				.then(returnObj => {
					field.groupBySubtotalFunctionOptions = this.$izendaUtilService.convertOptionsByPath(returnObj);
					field.groupBySubtotalFunction = this.getGroupBySubtotalValue(field, groupToApply);
					// if group list was changed and current group function not in list
					if (field.groupBySubtotalFunction === null)
						field.groupByFunction = this.getGroupBySubtotalValue(field, 'DEFAULT');
					resolve(field);
				});
		});
	}

	/**
	 * Load group functions to field
	 */
	loadGroupFunctionsAndFormatsToField(field, defaultGroupString?, defaultFormatString?, defaultSubtotalGroupString?) {
		return this.$q(resolve => {
			const groupToApply = angular.isString(defaultGroupString) && defaultGroupString
				? defaultGroupString
				: 'NONE';
			const groupSubtotalToApply = angular.isString(defaultSubtotalGroupString) && defaultSubtotalGroupString
				? defaultSubtotalGroupString
				: 'DEFAULT';

			if (this.isBinaryField(field)) {
				// if field type doesn't support group by.
				field.groupByFunctionOptions = [this.emptyFieldGroupOption];
				field.groupByFunction = this.emptyFieldGroupOption;
				field.groupBySubtotalFunctionOptions = [this.emptySubtotalFieldGroupOptions];
				field.groupBySubtotalFunction = this.emptySubtotalFieldGroupOptions;
				this.updateFieldFormats(field, defaultFormatString).then(f => resolve(f));
			} else {
				// get field and Subtotal functions from server or request cache:
				const functionPromise = this.loadFieldFunctions(field, groupToApply);
				const subtotalPromise = this.loadSubtotalFieldFunctions(field, groupSubtotalToApply);
				this.$q
					.all([functionPromise, subtotalPromise])
					.then(() =>
						this.updateFieldFormats(field, defaultFormatString)
							.then(() =>
								resolve(field)));
			}
		});
	}

	/**
	 * Field initialization (async: returns promise)
	 */
	initializeField(field) {
		return this.$q(resolve => {
			if (field.isInitialized) {
				resolve(field);
				return;
			}

			// load group and format collections:
			this.loadGroupFunctionsAndFormatsToField(field).then((f: any) => {
				f.isInitialized = true;
				resolve(f);
			});
		});
	}

	/**
	 * Get current field which we are editing now.
	 */
	getCurrentActiveField() {
		return this.currentActiveField;
	}

	/**
	 * Set current field for editing it.
	 */
	setCurrentActiveField(field) {
		this.currentActiveField = field;
	}

	/**
	 * Create auto description.
	 */
	private generateDescription(field) {
		if (this.isFieldGrouped(field) && field.groupByFunction.value.toLowerCase() !== 'group')
			return field.groupByFunction.text + ' (' + this.$izendaUtilService.humanizeVariableName(field.name) + ')';
		else
			return this.$izendaUtilService.humanizeVariableName(field.name);
	}

	/**
	 * Set aggregate function for field.
	 */
	onFieldFunctionApplied(field) {
		// do not change format for max, min, sum and sum distinct
		if (this.isFieldGrouped(field)) {
			this.applyAutoGroups();
		} else {
			this.resetAutoGroups();
		}

		this.updateFieldFormats(field);

		// auto update description
		this.autoUpdateFieldDescription(field);

		this.syncCalcFieldsArray();

		// validate
		this.validateReport();
	}

	/**
	 * Update functions, formats after expression typegroup was changed
	 */
	onExpressionTypeGroupApplied(field) {
		this.loadGroupFunctionsAndFormatsToField(field, field.groupByFunction.value, field.format.value, field.groupBySubtotalFunction.value)
			.then(() => this.syncCalcFieldsArray());
	}

	/**
	 * Update calc fields collection when expression was changed.
	 * @param {any} field - target field.
	 */
	onExpressionApplied() {
		this.syncCalcFieldsArray();
	}

	/**
	 * Update Ui and show preview
	 */
	updateUiStateAndRefreshPreview() {
		// remove drilldowns which are not in active tables
		this.updateDrilldowns();

		// update pivot state
		this.$izendaInstantReportPivotService.syncPivotState(this.getAllFieldsInActiveTables());

		// update filters state
		this.syncFilters();

		// apply/reset autogroups
		if (this.getActiveTables().length === 0 || this.isActiveFieldsContainsBinary()) {
			this.resetAutoGroups();
		} else {
			this.applyAutoGroups();
		}
	}

	/**
	 * Fires when user check/uncheck field
	 */
	applyFieldChecked(field, value, restrictTableUncheck) {
		return this.$q(resolve => {
			if (!field.enabled) {
				this.validateReport();
				resolve();
				return;
			}
			field.checked = angular.isDefined(value) ? value : !field.checked;
			field.order = this.getNextOrder();

			// update state of datasources tree
			this.updateParentFoldersAndTables(field, false, restrictTableUncheck);

			this.initializeField(field).then(() => {
				this.updateUiStateAndRefreshPreview();
				resolve();
			});
		});
	}

	/**
	 * Select/unselect field
	 */
	applyFieldSelected(field, value) {
		if (!angular.isObject(field)) {
			this.unselectAllFields();
			this.setCurrentActiveField(null);
			return;
		}
		if (!field.enabled)
			return;
		if (field.isMultipleColumns) {
			field.collapsed = !field.collapsed;
			return;
		}
		this.unselectAllFields();
		this.setCurrentActiveField(null);
		if (value) {
			this.setCurrentActiveField(field);
			field.selected = value;
			this.initializeField(field);
		}
	}

	/**
	 * Check/uncheck table
	 */
	applyTableActive(table) {
		return this.$q(resolve => {
			const updateAndResolve = () => {
				this.updateParentFolders(table);
				this.updateUiStateAndRefreshPreview();
				resolve();
			};

			if (!table.enabled) {
				return;
			}
			table.active = !table.active;
			table.order = this.getNextOrder();

			if (!table.active) {
				// deactivate all table fields
				table.fields.forEach(f => f.checked = false);
				updateAndResolve();
				return;
			}
			// table activated
			if (table.lazy) {
				// load lazy fields
				this.loadLazyFields(table).then(() => {
					updateAndResolve();
				});
			} else {
				updateAndResolve();
			}
		});
	}

	private prepareParentFieldForMultipleFields(field) {
		let parentField = field;
		if (parentField.multipleColumns.length === 0) {
			// if field has no multiple fields:
			const copyField = angular.copy(field) as any;
			parentField = copyField;
			copyField.mcAncestor = field;
			copyField.originId = field.id;
			copyField.isMultipleColumns = true;
			copyField.multipleColumnsCounter = 1;
			copyField.multipleColumns.push(field);
			const table = this.getTableById(field.parentId);
			const fieldIndex = table.fields.indexOf(field);
			table.fields[fieldIndex] = copyField;
		}
		return parentField;
	}

	/**
	 * Add ready-to-use another field (no need to clone parent field)
	 */
	addExactAnotherField(field, anotherFieldProperties) {
		const anotherField = this.createFieldObjectInner(anotherFieldProperties);
		// add to parent field.
		const parentField = this.prepareParentFieldForMultipleFields(field);
		parentField.multipleColumns.push(anotherField);
		parentField.multipleColumnsCounter++;
		anotherField.parentFieldId = parentField.id;
		anotherField.parentId = parentField.parentId;
		anotherField.name = parentField.name + parentField.multipleColumnsCounter;
		anotherField.tableSysname = parentField.tableSysname;
		anotherField.tableName = parentField.tableName;
		anotherField.sysname = parentField.sysname;
		anotherField.typeGroup = parentField.typeGroup;
		anotherField.type = parentField.type;
		anotherField.sqlType = parentField.sqlType;
		anotherField.allowedInFilters = parentField.allowedInFilters;
		anotherField.isDescriptionSetManually = true;
		return anotherField;
	}

	/**
	 * Add more than one same field to report
	 */
	addAnotherField(field, needToSelect) {
		const parentField = this.prepareParentFieldForMultipleFields(field);

		// add another field to parentField
		parentField.multipleColumnsCounter++;
		const anotherField = this.createFieldObject(parentField.name + parentField.multipleColumnsCounter, parentField.parentId,
			parentField.tableSysname, parentField.tableName, parentField.sysname, parentField.typeGroup,
			parentField.type, parentField.sqlType, parentField.allowedInFilters, parentField.isSpParameter);
		if (parentField.description)
			anotherField.description = parentField.description + ' ' + (parentField.multipleColumns.length + 1);
		anotherField.allowedInFilters = parentField.allowedInFilters;
		anotherField.order = this.getNextOrder();
		anotherField.guid = this.guid();
		anotherField.parentFieldId = parentField.id;

		this.initializeField(anotherField).then(() => {
			this.applyAutoGroups();
		});
		parentField.multipleColumns.push(anotherField);

		// select if needed
		if (needToSelect) {
			this.unselectAllFields();
			anotherField.selected = true;
			this.setCurrentActiveField(anotherField);
		}

		return anotherField;
	}

	/**
	 * Apply field config to field
	 */
	loadReportField(field, fieldConfig) {
		return this.$q(resolve => {
			const functionValue = fieldConfig.groupByFunction.value;
			const subtotalFunctionValue = fieldConfig.groupBySubtotalFunction.value;
			const formatValue = fieldConfig.format.value;
			angular.extend(field, fieldConfig);
			// remove column group from description: 'field description@column group'
			if (field.description.lastIndexOf('@') > 0 && field.columnGroup) {
				field.description = field.description.substring(0, field.description.lastIndexOf('@'));
			}
			if (field.order > this.orderCounter)
				this.orderCounter = field.order + 1;

			fieldConfig.expressionType = fieldConfig.expressionType || '...';
			const expressionType = this.expressionTypes.firstOrDefault(e => e.value === fieldConfig.expressionType);
			if (expressionType)
				field.expressionType = expressionType;

			this.loadGroupFunctionsAndFormatsToField(field, functionValue, formatValue, subtotalFunctionValue)
				.then((f: any) => {
					if (fieldConfig.description) {
						// if description differs from the default generated description: mark it as "set manually"
						f.isDescriptionSetManually = fieldConfig.description !== this.generateDescription(f);
						f.description = fieldConfig.description;
					} else
						this.autoUpdateFieldDescription(f);
					f.isInitialized = true;
					resolve(f);
				});
		});
	}

	applyDescription(field) {
		const autoDescription = this.generateDescription(field);
		if (!field.description)
			field.isDescriptionSetManually = false;
		else
			field.isDescriptionSetManually = field.description !== autoDescription;
		this.syncCalcFieldsArray();
	}

	/**
	 * Select drilldown fields
	 */
	convertDrilldownFieldNamesToFields() {
		for (let i = 0; i < this.reportSet.drillDownFields.length; i++) {
			const currentItem = this.reportSet.drillDownFields[i];
			if (angular.isString(currentItem)) {
				this.reportSet.drillDownFields[i] = this.getFieldBySysName(currentItem, true);
			}
		}
	}

	/**
	 * Select charts
	 */
	convertChartNamesToCharts() {
		for (let i = 0; i < this.reportSet.charts.length; i++) {
			const chart = this.reportSet.charts[i];
			if (chart && chart.hasOwnProperty('name') && chart.hasOwnProperty('category')) {
				const vis = this.$izendaInstantReportVisualizationService.findVisualization(chart.category, chart.name);
				vis.properties = this.reportSet.charts[i].properties;
				this.reportSet.charts[i] = vis;
			}
		}
	}

	/**
	 * Add loaded filters. reportSet.filters at this stage is not initialized
	 * and we need to set field, operator and value objects.
	 */
	loadFilters() {
		return this.$q(resolve => {
			const filterOperatorPromises: any[] = [];
			if (!angular.isArray(this.reportSet.filters) || this.reportSet.filters.length === 0) {
				resolve();
				return;
			}
			for (let i = 0; i < this.reportSet.filters.length; i++) {
				const filter = this.reportSet.filters[i];
				const filterConfig = {
					fieldSysName: filter.sysname,
					operatorName: filter.operatorString,
					values: filter.values,
					required: filter.required,
					description: filter.description,
					parameter: filter.parameter,
					titleFormat: filter.titleFormat,
					customPopupTemplateUrl: filter.customPopupTemplateUrl
				};
				const newFilter = this.createNewFilterBase(
					filterConfig.fieldSysName,
					filterConfig.operatorName,
					filterConfig.values,
					filterConfig.required,
					filterConfig.description,
					filterConfig.parameter,
					filter.customPopupTemplateUrl);

				this.reportSet.filters[i] = newFilter;

				// load filter formats
				const formatLoadPromise = this.loadFilterFormats(newFilter, filterConfig.titleFormat);
				filterOperatorPromises.push(formatLoadPromise);

				// set operator
				let operatorPromise: Object;
				if (angular.isString(filterConfig.operatorName) && filterConfig.operatorName) {
					operatorPromise = this.setFilterOperator(newFilter, filterConfig.operatorName);
				} else {
					operatorPromise = this.setFilterOperator(newFilter, null);
				}
				filterOperatorPromises.push(operatorPromise);
			}
			// wait when all operators loaded
			this.$q.all(filterOperatorPromises).then(() => {
				var existentValuesPromises = this.reportSet.filters.reduce((promise, filter) => {
					return promise.then(() => this.updateFieldFilterExistentValues(filter, true));
				}, Promise.resolve([]));
				// wait when all existent values loaded
				this.$q.all(existentValuesPromises).then(() => resolve());
			});
		});
	}

	/**
	 * Initialize service for new report
	 */
	newReport() {
		return this.$q(resolve => {
			if (!this.isPageInitialized) {
				this.newReportLoadingSchedule = 'new!';
				this.$log.debug('newReport scheduled');
				resolve(false);
				return;
			}

			const promises: any[] = [];

			// load schedule data with default config for new report
			promises.push(this.$izendaScheduleService.setScheduleConfig(null));
			promises.push(this.$izendaShareService.setShareConfig(null));

			// set full access for new report:
			this.$izendaCompatibilityService.setFullAccess();

			// load default table if defined
			const defaultTableName = this.$izendaInstantReportSettingsService.getSettings().defaultTable;
			if (defaultTableName) {
				const table = this.getTableBySysname(defaultTableName) || this.getTableByName(defaultTableName);
				if (table) {
					table.collapsed = false;
					promises.push(this.applyTableActive(table));
				}
			}

			// wait until completed all asynchronous operations
			this.$q.all(promises).then(() => resolve());
		});
	}

	/**
	 * Load existing report
	 */
	loadReport(reportFullName) {
		this.$log.debug(`loadReport ${reportFullName} start`);
		return this.$q(resolve => {
			if (!this.isPageInitialized) {
				this.existingReportLoadingSchedule = reportFullName;
				this.$log.debug('loadReport scheduled');
				resolve([false]);
				return;
			}
			// update UI params
			this.currentActiveField = null;
			this.setFiltersPanelOpened(false);

			let previousPreviewTop = 100;
			if (this.reportSet && this.reportSet.options)
				previousPreviewTop = this.reportSet.options.previewTop;

			// load report data
			this.$izendaInstantReportQueryService.loadReport(reportFullName).then(reportSetConfig => {
				this.resetDataSources();
				this.reportSet = angular.extend(this.reportSet, reportSetConfig);
				this.$izendaCompatibilityService.setRights(this.reportSet.options.effectiveRights);
				this.$izendaCompatibilityService.setUsesHiddenColumns(this.reportSet.options.usesHiddenColumns);

				// update top
				if (this.reportSet.options.top < 0)
					this.reportSet.options.top = '';
				this.reportSet.options.previewTop = previousPreviewTop;

				const lazyPromises: any[] = [];
				this.reportSet.joinedTables.forEach(tableObj => {
					const table = this.getTableBySysname(tableObj.sysname);
					const loadFieldPromise = this.loadLazyFields(table);
					table.active = true;
					table.order = this.getNextOrder();
					lazyPromises.push(loadFieldPromise);
				});

				// wait until table fields will be loaded:
				this.$q.all(lazyPromises).then(() => {
					// initialization promises
					var promises = [];

					// convert chart names to chart objects collection
					this.convertChartNamesToCharts();

					// convert drilldown field sysnames to fields collection:
					this.convertDrilldownFieldNamesToFields();

					// load pivot fields
					if (angular.isObject(this.reportSet.pivot)) {
						const pivotColumnConfig = angular.copy(this.reportSet.pivot.pivotColumn);
						const pivotColumnField = this.getFieldBySysName(pivotColumnConfig.sysname, true);
						this.reportSet.pivot.pivotColumn = angular.copy(pivotColumnField);
						this.reportSet.pivot.pivotColumn.isPivotColumn = true;

						promises.push(this.loadReportField(this.reportSet.pivot.pivotColumn, pivotColumnConfig));

						for (let i = 0; i < this.reportSet.pivot.cellValues.length; i++) {
							const cellValueConfig = angular.copy(this.reportSet.pivot.cellValues[i]);
							this.reportSet.pivot.cellValues[i] = angular.copy(this.getFieldBySysName(cellValueConfig.sysname, true));
							promises.push(this.loadReportField(this.reportSet.pivot.cellValues[i], cellValueConfig));
						}
					}

					// convert fields
					var addedFieldSysNames = [];
					this.reportSet.activeFields.forEach(activeField => {
						var sysname = activeField.sysname;
						var field = this.getFieldBySysName(sysname, true);
						if (!angular.isObject(field))
							this.$log.error(`Field ${sysname} not found in datasources`);

						var isFieldMultiple = addedFieldSysNames.indexOf(sysname) >= 0;
						if (!isFieldMultiple) {
							field.guid = activeField.guid;
							promises.push(this.loadReportField(field, activeField));
							field.checked = true;
							this.updateParentFoldersAndTables(field, true);
							addedFieldSysNames.push(sysname);
						} else {
							const anotherField = this.addExactAnotherField(field, activeField);
							anotherField.guid = activeField.guid;
							if (activeField.description) {
								anotherField.isDescriptionSetManually = true;
								anotherField.description = activeField.description;
							}
							promises.push(this.loadReportField(anotherField, activeField));
							anotherField.checked = true;
						}
					});
					this.syncCalcFieldsArray();

					// pivots initialization
					if (angular.isObject(this.reportSet.pivot)) {
						const pivotData = this.reportSet.pivot;
						promises.push(this.$izendaInstantReportPivotService.loadPivotData(pivotData));
						this.reportSet.pivot = null;
					}

					// convert filters
					promises.push(this.loadFilters());

					// load schedule data for config
					var scheduleConfigData = angular.extend({}, reportSetConfig.schedule);
					promises.push(this.$izendaScheduleService.setScheduleConfig(scheduleConfigData));

					// load share data for config
					var shareConfigData = angular.extend([], reportSetConfig.share);
					promises.push(this.$izendaShareService.setShareConfig(shareConfigData));

					// wait for all preparations completion
					this.$q.all(promises).then(() => {
						this.validateFilters();
						this.startFilters();
						if (this.$izendaCompatibilityService.isUsesHiddenColumns()) {
							if (this.reportSet.activeFields.length > 0)
								this.$izendaUtilUiService.showMessageDialog(
									this.$izendaLocaleService.localeText(
										'js_reportSetUsesHiddenColumns',
										'This ReportSet has publicly unavailable fields in configuration, therefore it misses some elements on current page, and cannot be saved/updated. Use Save As with different name instead.'));
							else
								this.$izendaUtilUiService.showMessageDialog(
									this.$izendaLocaleService.localeText(
										'js_reportSetUsesAllHiddenColumns',
										'All fields in this report are unavailable. Please choose another fields and use Save As with different name instead.'));
						}
						this.$log.debug('loadReport end');
						resolve([true, true]);
					});
				});
			}, error => {
				// error loading report set config
				// show error dialog
				this.$izendaUtilUiService.showErrorDialog(
					this.$izendaLocaleService.localeText('js_FailedToLoadReport', 'Failed to load report') + ': "' + error + '"',
					this.$izendaLocaleService.localeText('js_ReportLoadError', 'Report load error'));

				// redirect to new report
				this.$izendaUrlService.setIsNew();
				resolve([true, false]);
			});
		});
	}

	/**
	 * Remove another field
	 */
	removeAnotherField(field, anotherField) {
		const idx = field.multipleColumns.indexOf(anotherField);
		if (idx >= 0) {
			if (this.getCurrentActiveField() === anotherField)
				this.setCurrentActiveField(null);

			const isReplaceIdNeeded = field.originId === anotherField.id;
			field.multipleColumns.splice(idx, 1);
			if (field.multipleColumns.length > 0 && isReplaceIdNeeded)
				field.multipleColumns[0].id = field.originId;
		} else {
			throw `Can't find ${anotherField.name} in multipleColumns collection.`;
		}

		if (field.multipleColumns.length === 1) {
			this.copyFieldObject(field.multipleColumns[0], field);
			field.multipleColumns = [];
			field.isMultipleColumns = false;
			field.collapsed = false;
			field.parentFieldId = null;
			this.autoUpdateFieldDescription(field);
		}
	}

	/**
	 * Set sort value for field.
	 */
	applyFieldSort(field, sortString) {
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
	}

	/**
	 * Set field italic
	 */
	applyFieldItalic(field, value) {
		field.italic = value;
	}

	/**
	 * Set field visible
	 */
	applyFieldVisible(field, value) {
		if (!value)
			field.isVgUsed = false;
		field.visible = value;
	}

	/**
	 * Set field bold
	 */
	applyFieldBold(field, value) {
		field.bold = value;
	}

	/**
	 * Set visual group 
	 */
	applyVisualGroup(field, value) {
		if (value && field.sort === null) {
			this.applyFieldSort(field, 'asc');
		}
		field.isVgUsed = value;
		this.updateVisualGroupFieldOrders(field);
	}

	/**
	 * Column reorder. Indexes started from 1: 1,2,3,4,5,6
	 */
	swapFields(fromIndex, toIndex) {
		if (fromIndex === toIndex)
			return;
		const activeFieldsSortedList = this.getAllActiveFields().filter(item => !item.isVgUsed);
		activeFieldsSortedList.sort((f1, f2) => f1.order - f2.order);

		const field1 = activeFieldsSortedList[fromIndex - 1];
		const field2 = activeFieldsSortedList[toIndex - 1];
		const fieldOrder1 = field1.order;
		const fieldOrder2 = field2.order;
		field1.order = fieldOrder2;
		field2.order = fieldOrder1;
	}

	/**
	 * We need to set visual group fields order first and other fields next.
	 */
	updateVisualGroupFieldOrders(recentlyChangedField) {
		const activeFields = this.getAllActiveFields();
		const vgFields = activeFields.filter(f => f.isVgUsed);
		// if we don't have VG fields - do nothing.
		if (vgFields.length === 0)
			return;
		// we need to update field orders:
		// vgField1, vgField2, ..., vgFieldN, nonVg1, nonVg2, ..., nonVgM

		// if we turned on visual group on currently changed field - move it to the last position of vg fields
		if (recentlyChangedField && recentlyChangedField.isVgUsed)
			recentlyChangedField.order = vgFields.reduce((max, f) => f.order > max ? f.order : max, vgFields[0].order) + 1;
		// recalculate fields order
		vgFields.sort((a, b) => a.order - b.order);
		vgFields.forEach(f => f.order = this.getNextOrder());

		const nonVgFields = activeFields.filter(f => !f.isVgUsed);
		// if we turned off visual group on currently changed field - move it to the first position of non-vg fields.
		if (nonVgFields.length && recentlyChangedField && !recentlyChangedField.isVgUsed)
			recentlyChangedField.order = nonVgFields.reduce((min, f) => f.order < min ? f.order : min, nonVgFields[0].order) - 1;
		// recalculate fields order
		nonVgFields.sort((a, b) => a.order - b.order);
		nonVgFields.forEach(f => f.order = this.getNextOrder());
	}

	/**
	 * Change field order
	 */
	moveFieldToPosition(fromIndex, toIndex, isVisualGroup, takeCareOfInvisibleFields) {
		if (fromIndex === toIndex)
			return;
		const fields = this.getAllActiveFields().filter(field => {
			// extract vg|non-vg fields (depends on isVisualGroup param)
			return (isVisualGroup ^ field.isVgUsed) === 0;
		});

		const activeFieldsSorted = fields.sort((f1, f2) => f1.order - f2.order);
		const visibleFieldsSorted = takeCareOfInvisibleFields
			? activeFieldsSorted.filter(f => f.visible)
			: activeFieldsSorted;

		// calculate actual fromIndex and toIndex
		const fromElement = visibleFieldsSorted[fromIndex];
		if (takeCareOfInvisibleFields) {
			fromIndex = activeFieldsSorted.indexOf(fromElement);
			const element = visibleFieldsSorted[toIndex];
			toIndex = activeFieldsSorted.indexOf(element);
		}

		// Move element: fromIndex -> toIndex that way:
		// for example, we're sorting visual group columns which has orders activeFieldsSorted=[c1=1,c2=2,c3=5]
		// (3, 4, 6,... - are non vg columns)
		// and we need to move 1 --> 3, so the result orders will be [c1=5,c2=1,c3=2]. non vg column orders won't be touched.
		if (fromIndex < toIndex) {
			let previousOrder = activeFieldsSorted[fromIndex].order;
			for (let j = fromIndex + 1; j <= toIndex; j++) {
				const order = activeFieldsSorted[j].order;
				activeFieldsSorted[j].order = previousOrder;
				previousOrder = order;
			}
			activeFieldsSorted[fromIndex].order = previousOrder;
		} else {
			let nextOrder = activeFieldsSorted[fromIndex].order;
			for (let j = fromIndex - 1; j >= toIndex; j--) {
				const order = activeFieldsSorted[j].order;
				activeFieldsSorted[j].order = nextOrder;
				nextOrder = order;
			}
			activeFieldsSorted[fromIndex].order = nextOrder;
		}
	}

	getPreviewSplashVisible() {
		return this.isPreviewSplashVisible;
	}

	getPreviewSplashText() {
		return this.previewSplashText;
	}

	hasAggregateFormats() {
		if (!this.activeCheckedFields) return false;
		const aggregateFormats = [
			'PercentOfGroup',
			'PercentOfGroupWithRounding',
			'Gauge',
			'GaugeVariable',
			'GaugeDashboard'
		];
		for (let i = 0; i < this.activeCheckedFields.length; i++) {
			const field = this.activeCheckedFields[i];
			if (!field || !field.format || !field.format.value) continue;
			if (aggregateFormats.indexOf(field.format.value) >= 0) return true;
		}
		return false;
	}

	/**
	 * Restore default color settings.
	 */
	restoreDefaultColors() {
		const style = this.reportSet.options.style;
		const settings = this.$izendaInstantReportSettingsService.getSettings();

		style.borderColor = settings.reportBorderColor;
		style.headerColor = settings.reportHeaderColor;
		style.headerForecolor = settings.headerForegroundColor;
		style.itemColor = settings.reportItemColor;
		style.itemForeColor = settings.itemForegroundColor;
		style.itemAltColor = settings.reportAlternatingItemColor;
	}

	/**
	 * Get default field format (based on field typegroup)
	 * @param {object} field Field.
	 */
	getDefaultFieldFormat(typeGroup) {
		let formatKey;
		switch (typeGroup) {
			case 'Numeric':
				formatKey = '{0:#,0}';
				break;
			case 'Real':
				formatKey = '{0:#,0.00}';
				break;
			case 'Money':
				formatKey = '{0:C2}';
				break;
			case 'DateTime':
				formatKey = '{0:d}';
				break;
			default:
				formatKey = '{0}';
		}
		return formatKey;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module
			.constant('izendaInstantReportObjectDefaults', {
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
					usesHiddenColumns: false,
					rowsRange: null,
					distinct: true,
					showFiltersInReportDescription: false,
					isSubtotalsEnabled: false,
					exposeAsDatasource: false,
					hideGrid: false,
					top: '',
					previewTop: 100,
					imageAlign: 'L',
					title: '',
					titleAlign: 'L',
					description: '',
					descriptionAlign: 'L',
					headerAndFooter: {
						reportHeader: '',
						reportHeaderAlign: 'L',
						reportFooter: '',
						reportFooterAlign: 'L',
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
						itemsPerPage: 10000,
						addBookmarkForVg: false,
						pageBreakAfterVg: false,
						minimizeGridWidth: true,
						enableResponsiveGrid: true,
						vgStyle: 'CommaDelimited',
						pivotsPerPage: '',
						splitAllColumns: false,
						pageBreakOnSplit: false
					}
				},
				isFieldsAutoGrouped: false
			})
			.constant('izendaFilterObjectDefaults', {
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
				customPopupTemplateUrl: null,
				isFilterReady: false
			})
			.constant('izendaDefaultFunctionObject', {
				dataType: 'Unknown',
				dataTypeGroup: 'None',
				isScalar: '0',
				sqlTemplate: '{0}',
				text: '...',
				value: 'None',
				group: ''
			})
			.constant('izendaDefaultSubtotalFunctionObject', {
				dataType: 'Unknown',
				dataTypeGroup: 'None',
				isScalar: '0',
				sqlTemplate: '{0}',
				text: '(Default)',
				value: 'DEFAULT',
				group: ''
			})
			.constant('izendaDefaultFormatObject', {
				text: '...',
				value: '{0}',
				group: ''
			})
			.service('$izendaInstantReportStorageService', IzendaInstantReportStorageService.injectModules.concat(IzendaInstantReportStorageService));
	}

}
