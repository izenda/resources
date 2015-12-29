angular.module('izendaCommonControls').controller('IzendaSelectReportNameController', [
	'$rootScope',
	'$scope',
	'$q',
	'$log',
	'$izendaUrl',
	'$izendaCommonQuery',
	'$izendaSettings',
	'$izendaLocale',
	'reportNameInputPlaceholderText',
	izendaSelectReportNameController]);

/**
 * Report name dialog controller
 */
function izendaSelectReportNameController(
	$rootScope,
	$scope,
	$q,
	$log,
	$izendaUrl,
	$izendaCommonQuery,
	$izendaSettings,
	$izendaLocale,
	reportNameInputPlaceholderText) {
	'use strict';

	var _ = angular.element;
	var vm = this;

	vm.reportNameInputPlaceholderText = $izendaLocale.localeText(reportNameInputPlaceholderText[0], reportNameInputPlaceholderText[1]);
	vm.CREATE_NEW_TEXT = $izendaLocale.localeText('js_CreateNew', 'Create New');
	vm.UNCATEGORIZED_TEXT = 'Uncategorized';
	vm.ERROR_REPORT_NAME_EMPTY = $izendaLocale.localeText('js_NameCantBeEmpty', 'Dashboard name can\'t be empty.');
	vm.ERROR_CATEGORY_EXIST = function (categoryName) {
		var result = $izendaLocale.localeText('js_CategoryExist', 'Category with name "{0}" already exist.');
		result = result.replace('{0}', categoryName);
		return result;
	};
	vm.ERROR_REPORT_EXIST = function (fullReportName) {
		var result = $izendaLocale.localeText('js_ReportAlreadyExist', 'Dashboard or Report "{0}" already exist');
		result = result.replace('{0}', fullReportName);
		return result;
	};
	vm.ERROR_INVALID_REPORT_NAME = $izendaLocale.localeText('js_InvalidDashboardName', 'Invalid Dashboard Name'); // InvalidDashboardName
	vm.ERROR_INVALID_CATEGORY_NAME = $izendaLocale.localeText('js_InvalidCategoryName', 'Invalid Category Name'); // InvalidCategoryName

	vm.modalOpened = false;
	vm.isNewReportDialog = false;
	vm.reportName = '';
	vm.isCreatingNewCategory = false;
	vm.newCategoryName = '';
	vm.categories = [];
	vm.selectedCategoryId = -1;
	vm.isSelectDisabled = true;
	vm.reportSets = [];
	vm.errorMessages = [];
	vm.invalidCharsRegex = new RegExp("[^A-Za-z0-9_\\\-'' ]+", 'g');

	/**
	 * Get report with given name from report list
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
		vm.selectedCategoryId = -1;
		vm.isSelectDisabled = true;
		vm.reportSets.length = 0;
		if (vm.isNewReportDialog) {
			vm.reportName = '';
		} else {
			var separatorIndex = (reportInfo && reportInfo.name) ? reportInfo.name.lastIndexOf('/') : -1;
			vm.reportName = (separatorIndex < 0) ? reportInfo.name : reportInfo.name.substr(separatorIndex + 1);
		}
	};

	/**
	 * Open modal dialog
	 */
	vm.show = function () {
		vm.resetForm();

		var reportInfo = $izendaUrl.getReportInfo();

		// show loading message inside select control
		vm.categories.push($izendaLocale.localeText('js_Loading', 'Loading...'));
		vm.selectedCategoryId = 0;
		vm.modalOpened = true;
		vm.reportName = reportInfo.name;

		$scope.$evalAsync();

		$izendaCommonQuery.getReportSetCategory(vm.UNCATEGORIZED_TEXT).then(function (data) {
			vm.categories.length = 0;
			vm.selectedCategoryId = -1;

			vm.reportSets = data.ReportSets;

			// add categories
			vm.categories.push({
				'id': 0,
				'name': vm.CREATE_NEW_TEXT
			}, {
				'id': 1,
				'name': vm.UNCATEGORIZED_TEXT
			});
			if (reportInfo.category === null || reportInfo.category === vm.UNCATEGORIZED_TEXT)
				vm.selectedCategoryId = 1;
			for (var i = 0; i < vm.reportSets.length; i++) {
				var id = vm.categories.length;
				var report = vm.reportSets[i];
				var category = report.Category;
				if (category == null || category === '')
					category = vm.UNCATEGORIZED_TEXT;
				var item = !report.Subcategory ? category : category + "\\" + report.Subcategory;
				if (_.grep(vm.categories, function (a) {
          return a['name'] === item;
				}).length === 0) {
					vm.categories.push({
						'id': id,
						'name': item
					});
					if (reportInfo.category === item) {
						vm.selectedCategoryId = id;
					}
				};
			}
			vm.isSelectDisabled = false;
			$scope.$evalAsync();
		});
	};

  /**
   * Report category selected handler
   */
  vm.categorySelectedHandler = function () {
	  if (vm.selectedCategoryId !== null) {
		  var selectedObj = vm.getCategoryObjectById(vm.selectedCategoryId);
		  if (selectedObj['id'] === 0) {
			  vm.isCreatingNewCategory = true;
		  } else {
			  vm.isCreatingNewCategory = false;
		  }
	  } else {
	  	vm.isCreatingNewCategory = false;
	  }
	  $scope.$evalAsync();
  };

	/**
	 * OK button pressed
	 */
	vm.completeHandler = function () {
		vm.validateForm().then(function () {
			vm.closeModal();

			var selectedObj = vm.getCategoryObjectById(vm.selectedCategoryId);
			var categoryName = vm.isCreatingNewCategory ? vm.newCategoryName : selectedObj['name'];
			$rootScope.$broadcast(vm.isNewReportDialog ? 'selectedNewReportNameEvent' : 'selectedReportNameEvent',
      [vm.reportName, categoryName]);
		}, function () { });
	};

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
			var rName = angular.isString(vm.reportName) ? vm.reportName.trim() : '';
			if (rName === '') {
				vm.errorMessages.push(vm.ERROR_REPORT_NAME_EMPTY);
				reject();
				$scope.$evalAsync();
				return false;
			}

			$izendaSettings.getCommonSettings().then(function (settings) {
				if (!settings.allowInvalidCharacters) {
					if (settings.stripInvalidCharacters)
						rName = rName.replace(vm.invalidCharsRegex, '');
					if (rName.match(vm.invalidCharsRegex)) {
						vm.errorMessages.push(vm.ERROR_INVALID_REPORT_NAME);
						reject();
						return false;
					}
				}

				// check category
				if (vm.isCreatingNewCategory) {
					if (!settings.allowInvalidCharacters) {
						if (settings.stripInvalidCharacters)
							vm.newCategoryName = vm.newCategoryName.replace(vm.invalidCharsRegex, '');
						if (vm.newCategoryName.match(vm.invalidCharsRegex)) {
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
				var selectedObj = vm.getCategoryObjectById(vm.selectedCategoryId);
				var selectedCategoryName = selectedObj['name'];

				// resolve if it is same report
				var reportInfo = $izendaUrl.getReportInfo();
				if (reportInfo.name === rName && reportInfo.category === selectedCategoryName) {
					vm.errorMessages.push(vm.ERROR_REPORT_EXIST(selectedCategoryName + '\\' + rName));
					reject();
					return false;
				}

				// check report isn't in that category
				if (selectedCategoryName === vm.UNCATEGORIZED_TEXT) {
					if (vm.isReportInReportList(rName, vm.reportSets)) {
						vm.errorMessages.push(vm.ERROR_REPORT_EXIST(selectedCategoryName + '\\' + rName));
						reject();
						$scope.$evalAsync();
						return false;
					}
					resolve();
					return true;
				} else {
					$izendaCommonQuery.getReportSetCategory(selectedCategoryName).then(function (data) {
						vm.reportSets = data.ReportSets;
						if (vm.isReportInReportList(rName, data.ReportSets)) {
							vm.errorMessages.push(vm.ERROR_REPORT_EXIST(selectedCategoryName + '\\' + rName));
							reject();
							return false;
						}
						resolve();
						return true;
					});
				}
				return true;
			});
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
		vm.resetForm();
		$scope.$on('openSelectReportNameModalEvent', function (event, args) {
			vm.isNewReportDialog = args.length > 0 ? args[0] : false;
			vm.show();
		});
	};
}