/**
 * Select report name and category modal dialog.
 * Opens dialog on $rootScope.$broadcast 'openSelectReportNameModalEvent' event.
 */
angular.module('izenda.common.ui').controller('IzendaSelectReportNameController', [
	'$rootScope',
	'$scope',
	'$q',
	'$log',
	'$izendaUrl',
	'$izendaCommonQuery',
	'$izendaSettings',
	'$izendaLocale',
	'izenda.common.ui.reportNameInputPlaceholderText',
	'izenda.common.ui.reportNameEmptyError',
	'izenda.common.ui.reportNameInvalidError',
	IzendaSelectReportNameController]);

/**
 * Report name dialog controller
 */
function IzendaSelectReportNameController(
	$rootScope,
	$scope,
	$q,
	$log,
	$izendaUrl,
	$izendaCommonQuery,
	$izendaSettings,
	$izendaLocale,
	reportNameInputPlaceholderText,
	reportNameEmptyError,
	reportNameInvalidError) {
	'use strict';
	var vm = this;
	$scope.$izendaUrl = $izendaUrl;
	vm.isCategoryAllowed = $izendaSettings.getCommonSettings().showCategoryTextboxInSaveDialog;

	// localization:
	vm.reportNameInputPlaceholderText = $izendaLocale.localeText(reportNameInputPlaceholderText[0], reportNameInputPlaceholderText[1]);
	vm.CREATE_NEW_TEXT = $izendaLocale.localeText('js_CreateNew', 'Create New');
	vm.UNCATEGORIZED_TEXT = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');
	vm.ERROR_REPORT_NAME_EMPTY = $izendaLocale.localeText(reportNameEmptyError[0], reportNameEmptyError[1]);
	vm.ERROR_CATEGORY_EXIST = function (categoryName) {
		return $izendaLocale.localeTextWithParams('js_CategoryExist', 'Category with name "{0}" already exist.', [categoryName]);
	};
	vm.ERROR_REPORT_EXIST = function (fullReportName) {
		return $izendaLocale.localeTextWithParams('js_ReportAlreadyExist', 'Dashboard or report "{0}" already exist', [fullReportName]);
	};
	vm.ERROR_INVALID_REPORT_NAME = $izendaLocale.localeText(reportNameInvalidError[0], reportNameInvalidError[1]);
	vm.ERROR_INVALID_CATEGORY_NAME = $izendaLocale.localeText('js_InvalidCategoryName', 'Invalid Category Name');

	// main:
	 
	vm.modalOpened = false;
	vm.isNewReportDialog = false;
	vm.reportName = '';
	vm.isCreatingNewCategory = false;
	vm.newCategoryName = '';
	vm.categories = [];
	vm.selectedCategory = null;
	vm.isSelectDisabled = true;
	vm.reportSets = [];
	vm.errorMessages = [];
	vm.focus = {
		isNameFocused: false,
		isCategoryFocused: false
	};

	var nextId = 0;

	var getInvalidCharsRegex = function () {
		var additionalCharacter = '';
		if (jsResources.categoryCharacter != '\\')
			additionalCharacter = jsResources.categoryCharacter.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		return new RegExp("[^A-Za-z0-9_/" + additionalCharacter + "\\-'' \\\\]", 'g');
	}

	/**
	 * Find category by given name
	 * @param {string} category name.
	 */
	var getCategoryByName = function (name) {
		var category = null;
		angular.element.each(vm.categories, function () {
			if (this.name === name)
				category = this;
		});
		return category;
	};

	/**
	 * "Enter" button key press handler for report name <input>
	 * @param {event object} $event.
	 */
	vm.reportNameKeyPressed = function($event) {
		if ($event.keyCode === 13) {
			vm.completeHandler();
		}
	};

	/**
	 * Get report with given name from report list
	 * @param {string} report name.
	 * @param {Array} list with reports.
	 */
	vm.isReportInReportList = function (reportName, reportList) {
		for (var i = 0; i < reportList.length; i++) {
			var rs = reportList[i];
			if (rs.Name === reportName.trim()) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Set form to it's initial state
	 */
	vm.resetForm = function () {
		var reportInfo = $izendaUrl.getReportInfo();
		vm.errorMessages.length = 0;
		vm.isCreatingNewCategory = false;
		vm.newCategoryName = '';
		vm.categories.length = 0;
		vm.selectedCategory = null;
		vm.isSelectDisabled = true;
		vm.reportSets.length = 0;
		vm.focus.isNameFocused = false;
		vm.focus.isCategoryFocused = false;
		if (vm.isNewReportDialog) {
			vm.reportName = '';
		} else {
			var separatorIndex = (reportInfo && reportInfo.name) ? reportInfo.name.lastIndexOf($izendaSettings.getCategoryCharacter()) : -1;
			vm.reportName = (separatorIndex < 0) ? reportInfo.name : reportInfo.name.substr(separatorIndex + 1);
		}
	};

	/**
	 * Clear all focus
	 */
	vm.clearFocus = function () {
		vm.focus.isNameFocused = false;
		vm.focus.isCategoryFocused = false;
	};

	/**
	 * Set focus on report name input
	 */
	vm.setFocus = function () {
		vm.focus.isNameFocused = true;
		$scope.$applyAsync();
	};

	/**
	 * Open modal dialog
	 */
	vm.show = function () {
		vm.resetForm();

		var reportInfo = $izendaUrl.getReportInfo();

		// show loading message inside select control
		vm.categories = [];
		vm.categories.push({
			id: 1,
			name: $izendaLocale.localeText('js_Loading', 'Loading...')
		});
		vm.selectedCategory = vm.categories[0];
		vm.modalOpened = true;
		vm.reportName = reportInfo.name;
		$scope.$applyAsync();

		$izendaCommonQuery.getReportSetCategory(vm.UNCATEGORIZED_TEXT).then(function (data) {
			vm.categories = [];
			vm.selectedCategory = null;

			vm.reportSets = data.ReportSets;

			// add categories
			var settings = $izendaSettings.getCommonSettings();
			if (settings.allowCreateNewCategory) {
				vm.categories.push({
					'id': nextId++,
					'name': vm.CREATE_NEW_TEXT
				});
			}
			vm.categories.push({
				'id': nextId++,
				'name': vm.UNCATEGORIZED_TEXT
			});
			vm.selectedCategory = getCategoryByName(vm.UNCATEGORIZED_TEXT);

			for (var i = 0; i < vm.reportSets.length; i++) {
				var id = nextId++;
				var report = vm.reportSets[i];
				var category = report.Category;
				if (category == null || category === '')
					category = vm.UNCATEGORIZED_TEXT;
				var item = !report.Subcategory ? category : category + $izendaSettings.getCategoryCharacter() + report.Subcategory;
				if (angular.element.grep(vm.categories, function (a) {
					return a['name'] === item;
				}).length === 0) {
					var cat = {
						'id': id,
						'name': item
					};
					vm.categories.push(cat);
					if (reportInfo.category === item) {
						vm.selectedCategory = cat;
					}
				};
			}
			vm.isSelectDisabled = false;
			$scope.$applyAsync();
		});
	};

	/**
   * Report category selected handler
   */
	vm.categorySelectedHandler = function () {
		if (!vm.isCategoryAllowed) {
			vm.selectedCategory = getCategoryByName(vm.UNCATEGORIZED_TEXT);
			return;
		}
		if (vm.selectedCategory !== null) {
			if (vm.selectedCategory.name === vm.CREATE_NEW_TEXT) {
				vm.isCreatingNewCategory = true;
				vm.clearFocus();
				vm.focus.isCategoryFocused = true;
			} else {
				vm.isCreatingNewCategory = false;
			}
		} else {
			vm.isCreatingNewCategory = false;
		}
		$scope.$applyAsync();
	};

	/**
	 * OK button pressed
	 */
	vm.completeHandler = function () {
		vm.validateForm().then(function () {
			vm.closeModal();
			var categoryName = vm.isCreatingNewCategory ? vm.newCategoryName : vm.selectedCategory.name;
			$rootScope.$broadcast(vm.isNewReportDialog ? 'selectedNewReportNameEvent' : 'selectedReportNameEvent',
      [vm.reportName, categoryName]);
		}, function () { });
	};

	/**
	 * Close modal dialog
	 */
	vm.closeModal = function () {
		vm.modalOpened = false;
		$scope.$evalAsync();
	};

	/**
	 * Validate form
	 */
	vm.validateForm = function () {
		return $q(function (resolve, reject) {
			// check report name not empty
			vm.errorMessages.length = 0;
			vm.reportName = angular.isString(vm.reportName) ? vm.reportName.trim() : '';
			vm.reportName = jq$.map(vm.reportName.split($izendaSettings.getCategoryCharacter()), jq$.trim).join($izendaSettings.getCategoryCharacter());
			if (vm.reportName === '') {
				vm.errorMessages.push(vm.ERROR_REPORT_NAME_EMPTY);
				reject();
				$scope.$evalAsync();
				return false;
			}

			var settings = $izendaSettings.getCommonSettings();
			if (!settings.allowInvalidCharacters) {
				var regexp = getInvalidCharsRegex();
				if (settings.stripInvalidCharacters)
					vm.reportName = vm.reportName.replace(regexp, '');
				if (vm.reportName.match(regexp)) {
					vm.errorMessages.push(vm.ERROR_INVALID_REPORT_NAME);
					reject();
					return false;
				}
			}

			// check category
			if (vm.isCreatingNewCategory) {
				vm.newCategoryName = jq$.map(vm.newCategoryName.split($izendaSettings.getCategoryCharacter()), jq$.trim).join($izendaSettings.getCategoryCharacter());
				if (!settings.allowInvalidCharacters) {
					var regexp = getInvalidCharsRegex();
					if (settings.stripInvalidCharacters)
						vm.newCategoryName = vm.newCategoryName.replace(regexp, '');
					if (vm.newCategoryName.match(regexp)) {
						vm.errorMessages.push(vm.ERROR_INVALID_CATEGORY_NAME);
						reject();
						return false;
					}
				}
				for (var i = 0; i < vm.categories.length; i++) {
					if (vm.newCategoryName === vm.categories[i]['name']) {
						vm.errorMessages.push(vm.ERROR_CATEGORY_EXIST(vm.newCategoryName));
						reject();
						return false;
					}
				}
				resolve();
				return true;
			}

			// check report name
			var selectedCategoryName = vm.selectedCategory.name;

			// resolve if it is same report
			var reportInfo = $izendaUrl.getReportInfo();
			if (reportInfo.name === vm.reportName && reportInfo.category === selectedCategoryName) {
				vm.errorMessages.push(vm.ERROR_REPORT_EXIST(selectedCategoryName + $izendaSettings.getCategoryCharacter() + vm.reportName));
				reject();
				return false;
			}

			// check report isn't in that category
			if (selectedCategoryName === vm.UNCATEGORIZED_TEXT) {
				if (vm.isReportInReportList(vm.reportName, vm.reportSets)) {
					vm.errorMessages.push(vm.ERROR_REPORT_EXIST(selectedCategoryName + $izendaSettings.getCategoryCharacter() + vm.reportName));
					reject();
					$scope.$evalAsync();
					return false;
				}
				resolve();
				return true;
			} else {
				$izendaCommonQuery.getReportSetCategory(selectedCategoryName).then(function (data) {
					vm.reportSets = data.ReportSets;
					if (vm.isReportInReportList(vm.reportName, data.ReportSets)) {
						vm.errorMessages.push(vm.ERROR_REPORT_EXIST(selectedCategoryName + $izendaSettings.getCategoryCharacter() + vm.reportName));
						reject();
						return false;
					}
					resolve();
					return true;
				});
			}
			return true;
		});
	};

	/**
	 * Get category object by it's id
	 */
	vm.getCategoryObjectById = function (id) {
		for (var i = 0; i < vm.categories.length; i++) {
			if (vm.categories[i].id === id)
				return vm.categories[i];
		}
		return null;
	};

	/**
	 * Get category object by it's id
	 */
	vm.getCategoryObjectByName = function (name) {
		for (var i = 0; i < vm.categories.length; i++) {
			if (vm.categories[i].name === name)
				return vm.categories[i];
		}
		return null;
	};

	/**
	 * select report name controller initialization
	 */
	vm.initialize = function () {
		// show dialog event handler
		$scope.$on('openSelectReportNameModalEvent', function (event, args) {
			vm.isNewReportDialog = args.length > 0 ? args[0] : false;
			vm.show();
		});
	};
}