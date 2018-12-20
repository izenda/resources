import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaInstantReportDefaultPivotConfig from 'instant-report/models/instant-report-pivot-config';

/**
 * Pivot storage service
 */
export default class IzendaInstantReportPivotService {

	private static $izendaInstantReportPivotsDefaultConfigName = '$izendaInstantReportPivotsDefaultConfig';
	private pivotConfig: IzendaInstantReportDefaultPivotConfig;
	private pivotsPanelOpened: boolean;

	static get injectModules(): any[] {
		return ['$injector', '$q', '$izendaUtilService'];
	}

	constructor(private readonly $injector: ng.auto.IInjectorService,
		private readonly $q: ng.IQService,
		private readonly $izendaUtilService: IzendaUtilService) {

		const defaultConfig = this.$injector.get(IzendaInstantReportPivotService.$izendaInstantReportPivotsDefaultConfigName);
		this.pivotConfig = IzendaInstantReportDefaultPivotConfig.fromObject(defaultConfig);
		this.pivotsPanelOpened = false;
	}

	/**
	 * Get pivot column field wrapper
	 */
	getPivotColumn() {
		return this.pivotConfig.pivotColumn;
	}

	/**
	 * Set pivot column
	 */
	setPivotColumn(value) {
		this.pivotConfig.pivotColumn = value;
	}

	/**
	 * Set default group for pivot column.
	 */
	setDefaultGroup() {
		if (!angular.isObject(this.pivotConfig.pivotColumn))
			return;
		if (!this.pivotConfig.pivotColumn.groupByFunction)
			this.pivotConfig.pivotColumn.groupByFunction = this.$izendaUtilService.getOptionByValue(this.pivotConfig.pivotColumn.groupByFunctionOptions, 'GROUP', true);
	}

	/**
	 * Clear pivots
	 */
	removePivots() {
		this.pivotConfig.pivotColumn = null;
		this.pivotConfig.cellValues = [];
		this.pivotConfig.options.addSideTotals = false;
	}

	/**
	 * Get pivot options object
	 */
	getPivotOptions() {
		return this.pivotConfig.options;
	}

	/**
	 * Get pivots panel state
	 */
	getPivotsPanelOpened() {
		return this.pivotsPanelOpened;
	}

	/**
	 * Set pivots panel state
	 */
	setPivotsPanelOpened(value) {
		this.pivotsPanelOpened = value;
	}

	/////////////////////////////////////////
	// cell value functions
	/////////////////////////////////////////

	/**
	 * Get pivot fields wrappers
	 */
	getCellValues() {
		return this.pivotConfig.cellValues;
	}

	/**
	 * Check is pivot added and valid.
	 * @returns {boolean} is valid
	 */
	isPivotValid() {
		return angular.isObject(this.pivotConfig.pivotColumn) && this.pivotConfig.cellValues.length > 0;
	}

	/**
	 * Add cell value field
	 */
	addCellValue() {
		this.pivotConfig.cellValues.push(null);
	}

	/**
	 * Remove cell value
	 */
	removeCellValue(cellValue) {
		const cellValues = this.pivotConfig.cellValues;
		const idx = cellValues.indexOf(cellValue);
		if (idx >= 0) {
			cellValues.splice(idx, 1);
		}
	}

	/**
	 * Replace cell values by each other
	 */
	swapCellValues(fromIndex, toIndex) {
		const cellValues = this.pivotConfig.cellValues;
		const temp = cellValues[fromIndex];
		cellValues[fromIndex] = cellValues[toIndex];
		cellValues[toIndex] = temp;
	}

	/**
	 * Move cell value to position
	 */
	moveCellValueTo(fromIndex, toIndex) {
		const cellValues = this.pivotConfig.cellValues;
		cellValues.splice(toIndex, 0, cellValues.splice(fromIndex, 1)[0]);
	}

	/**
	 * Set cell value field, update available groups, formats, etc...
	 */
	setCellValueField(index, newField) {
		this.pivotConfig.cellValues[index] = newField;
	}

	/**
	 * Add pivot column or cell if pivot column already defined
	 */
	addPivotItem(fieldCopy) {
		if (!angular.isObject(this.pivotConfig.pivotColumn)) {
			this.pivotConfig.pivotColumn = fieldCopy;
		} else {
			this.pivotConfig.cellValues.push(fieldCopy);
		}
	}

	/**
	 * Synchronizes pivot
	 */
	syncPivotState(activeFieldsInActiveTables) {
		this.removeNotActiveFields(activeFieldsInActiveTables);
	}

	/**
	 * Remove pivot column and pivot cell if corresponging fields are no
	 * longer available.
	 * @param {array} array of currently active fields.
	 */
	removeNotActiveFields(activeFieldsInActiveTables) {
		const isFieldInList = (field, fieldList) => fieldList && fieldList.some(f => f.sysname === field.sysname);

		if (this.pivotConfig.pivotColumn && !isFieldInList(this.pivotConfig.pivotColumn, activeFieldsInActiveTables))
			this.pivotConfig.pivotColumn = null;

		this.pivotConfig.cellValues = this.pivotConfig.cellValues.filter(cv => isFieldInList(cv, activeFieldsInActiveTables));
	}

	/////////////////////////////////////////
	// data
	/////////////////////////////////////////

	/**
	 * Prepare pivots for send
	 */
	getPivotDataForSend() {
		return this.pivotConfig.pivotColumn ? this.pivotConfig : null;
	}

	/**
	 * Load pivot
	 */
	loadPivotData(pivotData) {
		this.pivotConfig = pivotData;
		return this.$q(resolve => resolve());
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module
			.value(IzendaInstantReportPivotService.$izendaInstantReportPivotsDefaultConfigName, {
				pivotColumn: null,
				cellValues: [],
				options: {
					addSideTotals: false
				}
			})
			.service('$izendaInstantReportPivotService',
				IzendaInstantReportPivotService.injectModules.concat(IzendaInstantReportPivotService));
	}
}
