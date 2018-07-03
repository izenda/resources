izendaRequire.define([
		'angular',
		'../../module-definition',
		'../../../core/directives/utility',
		'../../../core/directives/bootstrap-modal',
		'../../../core/services/localization-service',
		'../../../query/services/settings-service',
		'../../../query/services/url-service',
		'../../../query/services/common-query-service'
	],
	function(angular) {
		/**
		 * Select report name component definition
		 */
		angular.module('izenda.common.ui').component('izendaSelectReportNameComponent',
			{
				templateUrl: '###RS###extres=components.common.ui.components.select-report-name.template.html',
				bindings: {
					opened: '<',
					onSelected: '&',
					onModalClosed: '&'
				},
				controller: [
					'$q',
					'$izendaLocale',
					'$izendaUrl',
					'$izendaSettings',
					'$izendaCommonQuery',
					'izenda.common.ui.reportNameInputPlaceholderText',
					'izenda.common.ui.reportNameEmptyError',
					'izenda.common.ui.reportNameInvalidError',
					izendaSelectReportNameComponentCtrl
				]
			});

		function izendaSelectReportNameComponentCtrl($q,
			$izendaLocale,
			$izendaUrl,
			$izendaSettings,
			$izendaCommonQuery,
			reportNameInputPlaceholderText,
			reportNameEmptyError,
			reportNameInvalidError) {
			var $ctrl = this;
			$ctrl.$izendaUrl = $izendaUrl;

			$ctrl.isCategoryAllowed = $izendaSettings.getCommonSettings().showCategoryTextboxInSaveDialog;
			$ctrl.reportNameInputPlaceholderText =
				$izendaLocale.localeText(reportNameInputPlaceholderText[0], reportNameInputPlaceholderText[1]);
			$ctrl.CREATE_NEW_TEXT = $izendaLocale.localeText('js_CreateNew', 'Create New');
			$ctrl.UNCATEGORIZED_TEXT = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');
			$ctrl.ERROR_REPORT_NAME_EMPTY = $izendaLocale.localeText(reportNameEmptyError[0], reportNameEmptyError[1]);
			$ctrl.ERROR_CATEGORY_EXIST = function(categoryName) {
				return $izendaLocale.localeTextWithParams('js_CategoryExist',
					'Category with name "{0}" already exist.',
					[categoryName]);
			};
			$ctrl.ERROR_REPORT_EXIST = function(fullReportName) {
				return $izendaLocale.localeTextWithParams('js_ReportAlreadyExist',
					'Dashboard or report "{0}" already exist',
					[fullReportName]);
			};
			$ctrl.ERROR_INVALID_REPORT_NAME = $izendaLocale.localeText(reportNameInvalidError[0], reportNameInvalidError[1]);
			$ctrl.ERROR_INVALID_CATEGORY_NAME = $izendaLocale.localeText('js_InvalidCategoryName', 'Invalid Category Name');

			$ctrl.openedInner = false;
			$ctrl.isNewReportDialog = false;
			$ctrl.reportName = '';
			$ctrl.isCreatingNewCategory = false;
			$ctrl.newCategoryName = '';
			$ctrl.categories = [];
			$ctrl.selectedCategory = null;
			$ctrl.isSelectDisabled = true;
			$ctrl.reportSets = [];
			$ctrl.errorMessages = [];
			$ctrl.focus = {
				isNameFocused: false,
				isCategoryFocused: false
			};

			var nextId = 1;

			$ctrl.$onInit = function() {
			};

			$ctrl.$onChanges = function(changesObj) {
				if (changesObj.opened) {
					var currentOpened = changesObj.opened.currentValue;
					if (currentOpened) {
						// open dialog
						$ctrl.openModal();
					}
				}
			};

			/**
			 * Modal closed handler
			 */
			$ctrl.modalClosedHandler = function() {
				if (angular.isFunction($ctrl.onModalClosed))
					$ctrl.onModalClosed({});
			};

			/**
			 * Close modal dialog
			 */
			$ctrl.closeModal = function() {
				$ctrl.openedInner = false;
			};

			/**
			 * Open modal dialog
			 */
			$ctrl.openModal = function() {
				$ctrl.openedInner = true;
				$ctrl.resetForm();

				var reportInfo = $izendaUrl.getReportInfo();

				nextId = 1;

				// show loading message inside select control
				$ctrl.categories = [];
				$ctrl.categories.push({
					id: -1,
					name: $izendaLocale.localeText('js_Loading', 'Loading...')
				});
				$ctrl.selectedCategory = $ctrl.categories[0];
				$ctrl.reportName = reportInfo.name;

				$izendaCommonQuery.getReportSetCategory($ctrl.UNCATEGORIZED_TEXT).then(function(data) {
					$ctrl.categories = [];
					$ctrl.selectedCategory = null;

					$ctrl.reportSets = data.ReportSets;

					// add categories
					var settings = $izendaSettings.getCommonSettings();
					if (settings.allowCreateNewCategory) {
						// "Create new"
						$ctrl.categories.push({
							'id': 0,
							'name': $ctrl.CREATE_NEW_TEXT
						});
					}
					// "Uncategorized"
					$ctrl.categories.push({
						'id': nextId++,
						'name': $ctrl.UNCATEGORIZED_TEXT
					});
					$ctrl.selectedCategory = getCategoryByName($ctrl.UNCATEGORIZED_TEXT);

					// Other categories
					if (angular.isArray($ctrl.reportSets)) {
						$ctrl.reportSets.forEach(function(report) {
							var id = nextId++;
							var currentCategoryName = report.Category;
							if (!currentCategoryName)
								currentCategoryName = $ctrl.UNCATEGORIZED_TEXT;
							currentCategoryName = !report.Subcategory
								? currentCategoryName
								: currentCategoryName + $izendaSettings.getCategoryCharacter() + report.Subcategory;
							if (angular.element.grep($ctrl.categories, function(a) { return a.name === currentCategoryName; }).length ===
								0) {
								// if have't already added
								var cat = { id: id, name: currentCategoryName };
								$ctrl.categories.push(cat);
								if (reportInfo.category === currentCategoryName) {
									$ctrl.selectedCategory = cat;
								}
							};
						});
					}

					$ctrl.isSelectDisabled = false;
				});
			};

			/**
			 * "Enter" button key press handler for report name <input>
			 * @param {event object} $event.
			 */
			$ctrl.reportNameKeyPressed = function($event) {
				if ($event.keyCode === 13) {
					$ctrl.completeHandler();
				}
			};

			/**
			 * OK button pressed
			 */
			$ctrl.completeHandler = function() {
				$ctrl.validateForm().then(function() {
						$ctrl.closeModal();
						var categoryName = $ctrl.isCreatingNewCategory ? $ctrl.newCategoryName : $ctrl.selectedCategory.name;
						if (angular.isFunction($ctrl.onSelected)) {
							$ctrl.onSelected({ reportName: $ctrl.reportName, categoryName: categoryName });
						}
					},
					function() {});
			};

			/**
			 * Get report with given name from report list
			 * @param {string} report name.
			 * @param {Array} list with reports.
			 */
			$ctrl.isReportInReportList = function(reportName, reportList) {
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
			$ctrl.resetForm = function() {
				var reportInfo = $izendaUrl.getReportInfo();
				$ctrl.errorMessages = [];
				$ctrl.isCreatingNewCategory = false;
				$ctrl.newCategoryName = '';
				$ctrl.categories = [];
				$ctrl.selectedCategory = null;
				$ctrl.isSelectDisabled = true;
				$ctrl.reportSets = [];
				$ctrl.focus.isNameFocused = false;
				$ctrl.focus.isCategoryFocused = false;
				if ($ctrl.isNewReportDialog) {
					$ctrl.reportName = '';
				} else {
					var separatorIndex = (reportInfo && reportInfo.name)
						? reportInfo.name.lastIndexOf($izendaSettings.getCategoryCharacter())
						: -1;
					$ctrl.reportName = (separatorIndex < 0) ? reportInfo.name : reportInfo.name.substr(separatorIndex + 1);
				}
			};

			/**
			 * Clear all focus
			 */
			$ctrl.clearFocus = function() {
				$ctrl.focus.isNameFocused = false;
				$ctrl.focus.isCategoryFocused = false;
			};

			/**
			 * Set focus on report name input
			 */
			$ctrl.setFocus = function() {
				$ctrl.focus.isNameFocused = true;
			};

			/**
			 * Categories were updated.
			 */
			$ctrl.updateCategoriesHandler = function(newCategories) {
				$ctrl.categories = [];
				var selectedCategoryName = $ctrl.selectedCategory.name;
				$ctrl.categories = angular.element.map(newCategories,
					function(category) {
						return {
							'id': nextId++,
							'name': category
						};
					});
				$ctrl.selectedCategory = getCategoryByName(selectedCategoryName);
			};

			/**
			 * Report category selected handler
			 */
			$ctrl.categorySelectedHandler = function(val) {
				if (!$ctrl.isCategoryAllowed) {
					$ctrl.selectedCategory = getCategoryByName($ctrl.UNCATEGORIZED_TEXT);
					return;
				}
				$ctrl.selectedCategory = getCategoryByName(val);
				if ($ctrl.selectedCategory !== null) {
					if ($ctrl.selectedCategory.name === $ctrl.CREATE_NEW_TEXT) {
						$ctrl.isCreatingNewCategory = true;
						$ctrl.clearFocus();
						$ctrl.focus.isCategoryFocused = true;
					} else {
						$ctrl.isCreatingNewCategory = false;
					}
				} else {
					$ctrl.isCreatingNewCategory = false;
				}
			};

			/**
			 * Validate form
			 */
			$ctrl.validateForm = function() {
				return $q(function(resolve, reject) {
					// check report name not empty
					$ctrl.errorMessages.length = 0;
					$ctrl.reportName = angular.isString($ctrl.reportName) ? $ctrl.reportName.trim() : '';
					if ($ctrl.reportName === '') {
						$ctrl.errorMessages.push($ctrl.ERROR_REPORT_NAME_EMPTY);
						reject();
						return false;
					}

					// check report name is valid
					var settings = $izendaSettings.getCommonSettings();
					var reportNameFixed = window.utility.fixReportNamePath($ctrl.reportName,
						$izendaSettings.getCategoryCharacter(),
						settings.stripInvalidCharacters,
						settings.allowInvalidCharacters);
					if (!reportNameFixed) {
						$ctrl.errorMessages.push($ctrl.ERROR_INVALID_REPORT_NAME);
						reject();
						return false;
					}
					$ctrl.reportName = reportNameFixed;

					// check category
					if ($ctrl.isCreatingNewCategory) {
						var fixedCategoryName = window.utility.fixReportNamePath($ctrl.newCategoryName,
							$izendaSettings.getCategoryCharacter(),
							settings.stripInvalidCharacters,
							settings.allowInvalidCharacters);
						if (!fixedCategoryName) {
							$ctrl.errorMessages.push($ctrl.ERROR_INVALID_CATEGORY_NAME);
							reject();
							return false;
						}
						$ctrl.newCategoryName = fixedCategoryName;

						for (var i = 0; i < $ctrl.categories.length; i++) {
							if ($ctrl.newCategoryName === $ctrl.categories[i]['name']) {
								$ctrl.errorMessages.push($ctrl.ERROR_CATEGORY_EXIST($ctrl.newCategoryName));
								reject();
								return false;
							}
						}
						resolve();
						return true;
					}

					// check report name
					var selectedCategoryName = $ctrl.selectedCategory.name;

					// resolve if it is same report
					var reportInfo = $izendaUrl.getReportInfo();
					if (reportInfo.name === $ctrl.reportName && reportInfo.category === selectedCategoryName) {
						$ctrl.errorMessages.push(
							$ctrl.ERROR_REPORT_EXIST(selectedCategoryName + $izendaSettings.getCategoryCharacter() + $ctrl.reportName));
						reject();
						return false;
					}

					// check report isn't in that category
					if (selectedCategoryName === $ctrl.UNCATEGORIZED_TEXT) {
						if ($ctrl.isReportInReportList($ctrl.reportName, $ctrl.reportSets)) {
							$ctrl.errorMessages.push($ctrl.ERROR_REPORT_EXIST(selectedCategoryName +
								$izendaSettings.getCategoryCharacter() +
								$ctrl.reportName));
							reject();
							return false;
						}
						resolve();
						return true;
					} else {
						$izendaCommonQuery.getReportSetCategory(selectedCategoryName).then(function(data) {
							$ctrl.reportSets = data.ReportSets;
							if ($ctrl.isReportInReportList($ctrl.reportName, data.ReportSets)) {
								$ctrl.errorMessages.push($ctrl.ERROR_REPORT_EXIST(selectedCategoryName +
									$izendaSettings.getCategoryCharacter() +
									$ctrl.reportName));
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
			$ctrl.getCategoryObjectById = function(id) {
				for (var i = 0; i < $ctrl.categories.length; i++) {
					if ($ctrl.categories[i].id === id)
						return $ctrl.categories[i];
				}
				return null;
			};

			/**
			 * Get category object by it's id
			 */
			$ctrl.getCategoryObjectByName = function(name) {
				for (var i = 0; i < $ctrl.categories.length; i++) {
					if ($ctrl.categories[i].name === name)
						return $ctrl.categories[i];
				}
				return null;
			};

			function getInvalidCharsRegex() {
				var additionalCharacter = '';
				if (jsResources.categoryCharacter != '\\')
					additionalCharacter = jsResources.categoryCharacter.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
				return new RegExp("[^A-Za-z0-9_/" + additionalCharacter + "\\-'' \\\\]", 'g');
			}

			/**
			 * Find category by given name
			 * @param {string} category name.
			 */
			function getCategoryByName(name) {
				var category = null;
				angular.element.each($ctrl.categories,
					function() {
						if (this.name === name)
							category = this;
					});
				return category;
			}
		}

		angular.module('izenda.common.ui').directive('izendaCategorySelect',
			[
				'$izendaSettings', function($izendaSettings) {
					return {
						restrict: 'A',
						scope: {
							categories: '=',
							category: '=',
							onSelect: '&',
							onCategoriesChanged: '&'
						},
						link: function($scope, element) {
							var categoryCharacter = $izendaSettings.getCategoryCharacter();
							var commonSettings = $izendaSettings.getCommonSettings();
							var stripInvalidCharacters = commonSettings.stripInvalidCharacters;
							var allowInvalidCharacters = commonSettings.allowInvalidCharacters;
							var categoryControl = new AdHoc.Utility.IzendaCategorySelectorControl(
								element,
								categoryCharacter,
								stripInvalidCharacters,
								allowInvalidCharacters);
							categoryControl.addSelectedHandler(function(val) {
								if (angular.isFunction($scope.onSelect)) {
									$scope.onSelect({
										val: val
									});
									$scope.$applyAsync();
								}
							});

							// watch for collapsed state change
							$scope.$watchCollection('categories',
								function() {
									updateCategories();
									updateCategory();
								});
							$scope.$watch('category',
								function() {
									updateCategory();
								});

							function updateCategories() {
								var categories = $scope.categories.map(function(catObject) {
									return { name: catObject.name };
								});
								var previousLength = categories.length;
								categoryControl.setCategories(categories);
								var newCategories = collectCategories();
								if (previousLength !== newCategories.length && angular.isFunction($scope.onCategoriesChanged)) {
									$scope.onCategoriesChanged({
										newCategories: newCategories
									});
									$scope.$applyAsync();
								}
							}

							function updateCategory() {
								if (angular.isObject($scope.category) && $scope.category.id > 0) {
									categoryControl.select($scope.category.name);
								}
							}

							function collectCategories() {
								var options = angular.element.map(element.children('option'),
									function($option) {
										return $option.value;
									});
								return options;
							}
						}
					}
				}
			]);
	});