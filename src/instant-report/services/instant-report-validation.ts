import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import IzendaInstantReportStorageService from 'instant-report/services/instant-report-storage';
import IzendaInstantReportPivotService from 'instant-report/services/instant-report-pivot';
import IzendaInstantReportSettingsService from 'instant-report/services/instant-report-settings';

export default class IzendaInstantReportValidationService {

	validation = {
		isValid: true,
		messages: []
	};
	binaryFieldsArray: string[] = ['Null', 'Unknown', 'Binary', 'VarBinary', 'Text', 'Image'];

	static get injectModules(): any[] {
		return [
			'$izendaLocaleService',
			'$izendaInstantReportStorageService',
			'$izendaInstantReportPivotService',
			'$izendaInstantReportSettingsService',
			'$izendaCompatibilityService'];
	}

	constructor(
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaInstantReportStorageService: IzendaInstantReportStorageService,
		private readonly $izendaInstantReportPivotService: IzendaInstantReportPivotService,
		private readonly $izendaInstantReportSettingsService: IzendaInstantReportSettingsService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService) {

	}

	/**
	 * Is report valid getter
	 * @returns {boolean} 
	 */
	isReportValid() {
		return this.validation.isValid;
	}

	/**
	 * Validation object getter
	 * @returns {object} 
	 */
	getValidation() {
		return this.validation;
	}

	/**
	 * Get list of validation messages
	 * @returns {Array}.
	 */
	getValidationMessages() {
		return this.validation.messages;
	}

	/**
	 * Validate pivots. 
	 */
	validatePivots() {
		const pivotColumn = this.$izendaInstantReportPivotService.getPivotColumn();
		const pivotCells = this.$izendaInstantReportPivotService.getCellValues();

		// check if pivot column was set:
		if (angular.isObject(pivotColumn)) {
			if (!pivotCells || !pivotCells.length) {
				// show warning when pivot cells wasn't added.
				this.validation.isValid = false;
				this.validation.messages.push({
					type: 'info',
					text: this.$izendaLocaleService.localeText('js_AddPivotCellsWarning',
						'You should add pivot cells to enable pivot view.')
				});
			} else {
				const havePivotCells = pivotCells.some(p => angular.isObject(p));
				if (!havePivotCells) {
					this.validation.isValid = false;
					this.validation.messages.push({
						type: 'info',
						text: this.$izendaLocaleService.localeText('js_SpecifyPivotColumnWarning',
							'You should specify column for at least one pivot cell (pivot cells without column will be ignored).')
					});
				}
			}
		}
	}

	/**
	 * Clear all validation messages and state
	 */
	clearValidation() {
		this.validation.isValid = true;
		this.validation.messages = [];
	}

	/**
	 * Return existing validation actions
	 */
	getValidationActions() {
		return this.validation.messages
			.map(m => m.additionalActionType)
			.filter(a => !!a);
	}

	/**
	 * Validate report set
	 * @returns {boolean} report is valid
	 */
	validateReportSet() {
		this.clearValidation();

		const pivotColumn = this.$izendaInstantReportPivotService.getPivotColumn();
		const activeFields = this.$izendaInstantReportStorageService.getAllFieldsInActiveTables();
		const options = this.$izendaInstantReportStorageService.getOptions();

		// try to find at least one active field
		const binaryFields = [];
		let hasActiveFields: boolean = false;
		activeFields.forEach(field => {
			hasActiveFields = hasActiveFields || field.checked;
			if (field.checked && this.binaryFieldsArray.indexOf(field.sqlType) >= 0) {
				binaryFields.push(field);
			}
		});

		// try to find active pivot fields
		hasActiveFields = hasActiveFields || this.$izendaInstantReportPivotService.isPivotValid();

		// create validation result for fields
		if (!hasActiveFields && !pivotColumn) {
			this.validation.isValid = false;
			this.validation.messages.push({
				type: 'info',
				text: this.$izendaLocaleService.localeText('js_YouShouldSelectField', 'You should select at least one field to see preview.')
			});
		}

		// stored procedure parameters validation
		if (!this.$izendaInstantReportStorageService.isAllSpParametersAssigned()) {
			this.validation.isValid = false;
			this.validation.messages.push({
				type: 'info',
				text: this.$izendaLocaleService.localeText('js_spParameterIsRequired', 'Please specify values for your stored procedure parameters in the filters.')
			});
		}

		// distinct validation
		if (this.$izendaInstantReportSettingsService.getSettings().showDistinct && options.distinct && binaryFields.length > 0) {
			const binaryFieldsString = binaryFields
				.map((bField: any) => `"${bField.name}" (${bField.sqlType})`)
				.join(', ');
			this.validation.messages.push({
				type: 'info',
				additionalActionType: 'TURN_OFF_DISTINCT',
				text: this.$izendaLocaleService.localeTextWithParams(
					'js_ColumnsIsntCompatibleWithDistinct',
					'Report contain columns: {0}. These columns are not compatable with "distinct" setting. Distinct setting was disabled!',
					[binaryFieldsString])
			});
		}

		// run pivots validation
		this.validatePivots();

		return this.validation.isValid;
	};

	/**
	 * Validate report set and refresh preview.
	 */
	validateReportSetAndRefresh(forceRefresh: boolean = false) {
		const validationResult = this.validateReportSet();
		const validationActions = this.getValidationActions();
		if (validationResult) {
			// report is valid
			if (validationActions.indexOf('TURN_OFF_DISTINCT') >= 0)
				this.$izendaInstantReportStorageService.getOptions().distinct = false;
			if (forceRefresh || !this.$izendaCompatibilityService.isSmallResolution())
				this.$izendaInstantReportStorageService.getReportPreviewHtml();
		} else {
			// report not valid
			this.$izendaInstantReportStorageService.clearReportPreviewHtml();
		}
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaInstantReportValidationService', IzendaInstantReportValidationService.injectModules.concat(IzendaInstantReportValidationService));
	}
}
