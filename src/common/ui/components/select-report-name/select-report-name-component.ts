import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaCommonQueryService from 'common/query/services/common-query-service';

/**
 * Select report name component definition
 */
@IzendaComponent(
	izendaUiModule,
	'izendaSelectReportNameComponent',
	['$q', '$izendaLocaleService', '$izendaUrlService', '$izendaSettingsService', '$izendaCommonQueryService', 'izenda.common.ui.reportNameInputPlaceholderText',
		'izenda.common.ui.reportNameEmptyError', 'izenda.common.ui.reportNameInvalidError'],
	{
		templateUrl: '###RS###extres=components.common.ui.components.select-report-name.select-report-name-template.html',
		bindings: {
			opened: '<',
			onSelected: '&',
			onModalClosed: '&'
		}
	})
export default class IzendaSelectReportNameComponent implements ng.IComponentController {
	// bindings
	onSelected: (param: any) => void;
	onModalClosed: (param: any) => void;
	// other
	private nextId: number = 1;
	private readonly textCreateNew: string;
	private readonly textUncategorized: string;
	private readonly textErrorReportNameEmpty: string;
	private readonly textErrorInvalidReportName: string;
	private readonly textErrorInvalidCategoryName: string;

	isCategoryAllowed: boolean;
	isOpenedInner: boolean;
	isNewReportDialog: boolean;
	isCreatingNewCategory: boolean;
	isSelectDisabled: boolean;
	isNameFocused: boolean;
	isCategoryFocused: boolean;

	reportNameInputPlaceholderText: string;
	reportName: string;
	newCategoryName: string;
	categories: Array<CategoryObject>;
	selectedCategory: CategoryObject;
	reportSets: any[];
	errorMessages: string[];

	constructor(
		private readonly $q: ng.IQService,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaSettingsService: IzendaQuerySettingsService,
		private readonly $izendaCommonQueryService: IzendaCommonQueryService,
		reportNameInputPlaceholderText: string[],
		private readonly reportNameEmptyError: string,
		private readonly reportNameInvalidError: string) {

		this.isCategoryAllowed = $izendaSettingsService.getCommonSettings().showCategoryTextboxInSaveDialog;
		this.reportNameInputPlaceholderText = this.$izendaLocaleService
			.localeText(reportNameInputPlaceholderText[0], reportNameInputPlaceholderText[1]);
		this.textCreateNew = $izendaLocaleService.localeText('js_CreateNew', 'Create New');
		this.textUncategorized = $izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
		this.textErrorReportNameEmpty = $izendaLocaleService.localeText(reportNameEmptyError[0], reportNameEmptyError[1]);
		this.textErrorInvalidReportName = $izendaLocaleService.localeText(reportNameInvalidError[0], reportNameInvalidError[1]);
		this.textErrorInvalidCategoryName = $izendaLocaleService.localeText('js_InvalidCategoryName', 'Invalid Category Name');

		this.isOpenedInner = false;
		this.isNewReportDialog = false;
		this.reportName = '';
		this.isCreatingNewCategory = false;
		this.newCategoryName = '';
		this.categories = [];
		this.selectedCategory = null;
		this.isSelectDisabled = true;
		this.reportSets = [];
		this.errorMessages = [];
		this.isNameFocused = false;
		this.isCategoryFocused = false;
	}

	$onChanges(changesObj) {
		if (changesObj.opened) {
			var currentOpened = changesObj.opened.currentValue;
			if (currentOpened)
				this.openModal();
		}
	}

	/**
	 * Modal closed handler
	 */
	modalClosedHandler() {
		if (angular.isFunction(this.onModalClosed))
			this.onModalClosed({});
	}

	/**
	 * Close modal dialog
	 */
	closeModal() {
		this.isOpenedInner = false;
	}

	/**
	 * Open modal dialog
	 */
	openModal() {
		this.isSelectDisabled = true;
		this.isOpenedInner = true;
		this.resetForm();

		const reportInfo = this.$izendaUrlService.getReportInfo();
		this.nextId = 1;

		// show loading message inside select control
		this.categories = [];
		this.categories.push({
			id: -1,
			name: this.$izendaLocaleService.localeText('js_Loading', 'Loading...')
		});
		this.selectedCategory = this.categories[0];
		this.reportName = reportInfo.name;

		this.$izendaCommonQueryService.getReportSetCategory(this.textUncategorized).then(data => {
			this.categories = [];
			this.selectedCategory = null;
			this.reportSets = data.ReportSets;

			// add categories
			// "Create new"
			if (this.$izendaSettingsService.getCommonSettings().allowCreateNewCategory)
				this.categories.push({
					id: this.nextId++,
					name: this.textCreateNew
				});

			// "Uncategorized"
			this.categories.push({
				id: this.nextId++,
				name: this.textUncategorized
			});
			this.selectedCategory = this.getCategoryObjectByName(this.textUncategorized);

			// Other categories
			if (angular.isArray(this.reportSets)) {
				this.reportSets.forEach(report => {
					const id = this.nextId++;
					let currentCategoryName = report.Category;
					if (!currentCategoryName)
						currentCategoryName = this.textUncategorized;
					currentCategoryName = !report.Subcategory
						? currentCategoryName
						: currentCategoryName + this.$izendaSettingsService.getCategoryCharacter() + report.Subcategory;

					if (this.categories && this.categories.length) {
						if (!this.categories.find(c => c.name === currentCategoryName)) {
							// if have't already added
							var cat = {
								id: id,
								name: currentCategoryName
							};
							this.categories.push(cat);
							if (reportInfo.category === currentCategoryName) {
								this.selectedCategory = cat;
							}
						}
					}
				});
			}

			this.isSelectDisabled = false;
		});
	}

	/**
	 * "Enter" button key press handler for report name <input>
	 * @param {event object} $event.
	 */
	reportNameKeyPressed($event: JQuery.Event) {
		if ($event.keyCode === JQuery.Key.Enter)
			this.completeHandler();
	}

	/**
	 * OK button pressed
	 */
	completeHandler() {
		this.validateForm().then(() => {
			this.closeModal();
			const categoryName = this.isCreatingNewCategory ? this.newCategoryName : this.selectedCategory.name;
			if (angular.isFunction(this.onSelected)) {
				this.onSelected({
					reportName: this.reportName,
					categoryName: categoryName
				});
			}
		}, () => { });
	}

	/**
	 * Get report with given name from report list
	 * @param {string} report name.
	 * @param {Array} list with reports.
	 */
	isReportInReportList(reportName: string, reportList: any[]): boolean {
		if (!reportList || !reportList.length)
			return false;
		return reportList.find(rs => rs.Name === reportName.trim());
	}

	/**
	 * Set form to it's initial state
	 */
	resetForm() {
		const reportInfo = this.$izendaUrlService.getReportInfo();
		this.errorMessages = [];
		this.isCreatingNewCategory = false;
		this.newCategoryName = '';
		this.categories = [];
		this.selectedCategory = null;
		this.isSelectDisabled = true;
		this.reportSets = [];
		this.isNameFocused = false;
		this.isCategoryFocused = false;
		if (this.isNewReportDialog) {
			this.reportName = '';
		} else {
			const separatorIndex = (reportInfo && reportInfo.name)
				? reportInfo.name.lastIndexOf(this.$izendaSettingsService.getCategoryCharacter())
				: -1;
			this.reportName = (separatorIndex < 0) ? reportInfo.name : reportInfo.name.substr(separatorIndex + 1);
		}
	}

	/**
	 * Clear all focus
	 */
	clearFocus() {
		this.isNameFocused = false;
		this.isCategoryFocused = false;
	}

	/**
	 * Set focus on report name input
	 */
	setFocus() {
		this.isNameFocused = true;
	}

	/**
	 * Categories were updated.
	 */
	updateCategoriesHandler(newCategories: string[]) {
		this.categories = newCategories.map(newCategoryName => {
			return {
				id: this.nextId++,
				name: newCategoryName
			};
		});
		const selectedCategoryName = this.selectedCategory ? this.selectedCategory.name : null;
		this.selectedCategory = this.getCategoryObjectByName(selectedCategoryName);
	}

	/**
	 * Report category selected handler
	 */
	categorySelectedHandler(category: string) {
		if (!this.isCategoryAllowed) {
			this.selectedCategory = this.getCategoryObjectByName(this.textUncategorized);
			return;
		}

		this.selectedCategory = this.getCategoryObjectByName(category);
		if (this.selectedCategory !== null) {
			if (this.selectedCategory.name === this.textCreateNew) {
				this.isCreatingNewCategory = true;
				this.clearFocus();
				this.isCategoryFocused = true;
			} else {
				this.isCreatingNewCategory = false;
			}
		} else {
			this.isCreatingNewCategory = false;
		}
	}

	/**
	 * Validate form
	 */
	private validateForm(): ng.IPromise<void> {
		return this.$q((resolve, reject) => {

			// check report name not empty
			this.errorMessages.length = 0;
			this.reportName = angular.isString(this.reportName) ? this.reportName.trim() : '';
			if (!this.reportName) {
				this.errorMessages.push(this.textErrorReportNameEmpty);
				reject();
				return false;
			}

			// check report name is valid
			var settings = this.$izendaSettingsService.getCommonSettings();
			var reportNameFixed = window.utility.fixReportNamePath(this.reportName,
				this.$izendaSettingsService.getCategoryCharacter(),
				settings.stripInvalidCharacters,
				settings.allowInvalidCharacters);
			if (!reportNameFixed) {
				this.errorMessages.push(this.textErrorInvalidReportName);
				reject();
				return false;
			}
			this.reportName = reportNameFixed;

			// check category
			if (this.isCreatingNewCategory) {
				var fixedCategoryName = window.utility.fixReportNamePath(this.newCategoryName,
					this.$izendaSettingsService.getCategoryCharacter(),
					settings.stripInvalidCharacters,
					settings.allowInvalidCharacters);
				if (!fixedCategoryName) {
					this.errorMessages.push(this.textErrorInvalidCategoryName);
					reject();
					return false;
				}
				this.newCategoryName = fixedCategoryName;

				for (let i = 0; i < this.categories.length; i++) {
					if (this.newCategoryName === this.categories[i]['name']) {
						this.errorMessages.push(this.getErrorTextCategoryExist(this.newCategoryName));
						reject();
						return false;
					}
				}
				resolve();
				return true;
			}

			// check report name
			var selectedCategoryName = this.selectedCategory.name;

			// resolve if it is same report
			var reportInfo = this.$izendaUrlService.getReportInfo();
			if (reportInfo.name === this.reportName && reportInfo.category === selectedCategoryName) {
				this.errorMessages.push(this.getErrorTextReportExist(selectedCategoryName +
					this.$izendaSettingsService.getCategoryCharacter() +
					this.reportName));
				reject();
				return false;
			}

			// check report isn't in that category
			if (selectedCategoryName === this.textUncategorized) {
				if (this.isReportInReportList(this.reportName, this.reportSets)) {
					this.errorMessages.push(this.getErrorTextReportExist(selectedCategoryName +
						this.$izendaSettingsService.getCategoryCharacter() +
						this.reportName));
					reject();
					return false;
				}
				resolve();
				return true;
			} else {
				this.$izendaCommonQueryService.getReportSetCategory(selectedCategoryName).then(data => {
					this.reportSets = data.ReportSets;
					if (this.isReportInReportList(this.reportName, data.ReportSets)) {
						this.errorMessages.push(this.getErrorTextReportExist(selectedCategoryName +
							this.$izendaSettingsService.getCategoryCharacter() +
							this.reportName));
						reject();
						return false;
					}
					resolve();
					return true;
				});
			}
			return true;
		});
	}

	/**
	 * Get category object by it's id
	 */
	private getCategoryObjectById(id: number): CategoryObject {
		return this.categories.find(category => category.id === id) || null;
	}

	/**
	 * Get category object by it's name
	 */
	private getCategoryObjectByName(name: string): CategoryObject {
		return this.categories.find(category => category.name === name) || null;
	}

	private getInvalidCharsRegex(): RegExp {
		let additionalCharacter = '';
		if (jsResources.categoryCharacter !== '\\')
			additionalCharacter = jsResources.categoryCharacter.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
		return new RegExp('[^A-Za-z0-9_/' + additionalCharacter + "\\-'' \\\\]", 'g');
	}

	private getErrorTextCategoryExist(categoryName) {
		return this.$izendaLocaleService.localeTextWithParams('js_CategoryExist',
			'Category with name "{0}" already exist.',
			[categoryName]);
	}

	private getErrorTextReportExist(fullReportName) {
		return this.$izendaLocaleService.localeTextWithParams('js_ReportAlreadyExist',
			'Dashboard or report "{0}" already exist',
			[fullReportName]);
	}
}

///////////////////////////////////////////////////////////////////////////////////////

interface IIzendaCategorySelectScope extends ng.IScope {
	categories: CategoryObject[];
	category: CategoryObject;
	onSelect: any;
	onCategoriesChanged: any;
}

/**
 * Directive docs.
 */
class IzendaCategorySelect implements ng.IDirective {
	restrict = 'A';
	scope = {
		categories: '=',
		category: '=',
		onSelect: '&',
		onCategoriesChanged: '&'
	};
	link: ($scope: IIzendaCategorySelectScope, $element: ng.IAugmentedJQuery) => void;

	constructor(private readonly $izendaSettingsService: IzendaQuerySettingsService) {
		IzendaCategorySelect.prototype.link = ($scope: IIzendaCategorySelectScope, $element: ng.IAugmentedJQuery) => {

			const categoryCharacter = $izendaSettingsService.getCategoryCharacter();
			const commonSettings = $izendaSettingsService.getCommonSettings();
			const stripInvalidCharacters = commonSettings.stripInvalidCharacters;
			const allowInvalidCharacters = commonSettings.allowInvalidCharacters;
			const categoryControl = new AdHoc.Utility.IzendaCategorySelectorControl(
				$element,
				categoryCharacter,
				stripInvalidCharacters,
				allowInvalidCharacters);
			categoryControl.addSelectedHandler(val => {
				if (angular.isFunction($scope.onSelect)) {
					$scope.onSelect({
						val: val
					});
					$scope.$applyAsync();
				}
			});

			// watch for collapsed state change
			$scope.$watchCollection('categories', () => {
				updateCategories();
				updateCategory();
			});
			$scope.$watch('category', () => {
				updateCategory();
			});

			function updateCategories() {
				const previousLength = $scope.categories.length;
				categoryControl.setCategories($scope.categories);
				const newCategories = collectCategories();
				if (previousLength !== newCategories.length && angular.isFunction($scope.onCategoriesChanged)) {
					$scope.onCategoriesChanged({
						newCategories: newCategories
					});
					$scope.$applyAsync();
				}
			}

			function updateCategory() {
				if (angular.isObject($scope.category) && $scope.category.id !== 1) {
					categoryControl.select($scope.category.name);
				}
			}

			function collectCategories() {
				const options = angular.element.map($element.children('option'), ($option: any) => {
					return $option.value;
				});
				return options;
			}

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($izendaSettingsService: IzendaQuerySettingsService) => new IzendaCategorySelect($izendaSettingsService);
		directive.$inject = ['$izendaSettingsService'];
		return directive;
	}
}

izendaUiModule.directive('izendaCategorySelect', ['$izendaSettingsService', IzendaCategorySelect.factory()]);

class CategoryObject {
	id: number;
	name: string;
}