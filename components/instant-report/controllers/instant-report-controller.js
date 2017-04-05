define(['../services/services', '../directive/directives'], function () {

	/**
	 * Instant report controller definition
	 */
	angular
		.module('izendaInstantReport')
		.controller('InstantReportController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			'$izendaUrl',
			'$izendaLocale',
			'$izendaSettings',
			'$izendaCompatibility',
			'$izendaInstantReportStorage',
			'$izendaInstantReportPivots',
			'$izendaScheduleService',
			'$izendaShareService',
			'$izendaInstantReportValidation',
			'$izendaInstantReportSettings',
			InstantReportController]);

	function InstantReportController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$log,
			$izendaUrl,
			$izendaLocale,
			$izendaSettings,
			$izendaCompatibility,
			$izendaInstantReportStorage,
			$izendaInstantReportPivots,
			$izendaScheduleService,
			$izendaShareService,
			$izendaInstantReportValidation,
			$izendaInstantReportSettings) {
		'use strict';
		var vm = this;
		var UNCATEGORIZED = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');
		$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
		$scope.$izendaInstantReportPivots = $izendaInstantReportPivots;
		$scope.$izendaInstantReportValidation = $izendaInstantReportValidation;
		$scope.$izendaUrl = $izendaUrl;
		$scope.$izendaLocale = $izendaLocale;

		$scope.$izendaCompatibility = $izendaCompatibility;
		vm.isSmallResolution = $izendaCompatibility.isSmallResolution();

		vm.isLoading = true;
		vm.previewHtml = $izendaInstantReportStorage.getPreview();
		vm.reportSetOptions = {
			isVgUsed: false,
			vgStyle: null,
			sortedActiveFields: []
		};;
		vm.filtersPanelOpened = $izendaInstantReportStorage.getFiltersPanelOpened();
		vm.pivotsPanelOpened = $izendaInstantReportPivots.getPivotsPanelOpened();
		vm.isValid = true;
		vm.activeField = null;
		vm.filtersCount = $izendaInstantReportStorage.getFilters().length;
		vm.pivotCellsCount = $izendaInstantReportPivots.getCellValues().length;
		vm.top = $izendaInstantReportStorage.getOptions().top;
		vm.previewTop = $izendaInstantReportStorage.getOptions().previewTop;
		vm.activeFields = $izendaInstantReportStorage.getAllActiveFields();
		vm.settings = $izendaInstantReportSettings;
		vm.reportInfo = null;
		vm.isExistingReport = false;

		vm.currentInsertColumnOrder = -1; // used for select field position for drag'n'drop fields

		// Left panel state object
		var previewPanelId = 6;
		vm.leftPanel = {
			activeItem: 0,
			previousPanelId: 0,
			opened: true
		};

		vm.exportProgress = null;

		vm.effectiveRights = $izendaCompatibility.getRights();
		_updateReportSetRightVariables();

		/**
		 * Wait message header for export and print
		 */
		vm.getWaitMessageHeaderText = function () {
			if (vm.exportProgress === 'export') {
				return $izendaLocale.localeText('js_ExportingInProgress', 'Exporting in progress.');
			}
			if (vm.exportProgress === 'print') {
				return $izendaLocale.localeText('js_PrintingInProgress', 'Printing in progress.');
			}
			return '';
		}

		/**
		 * Wait message for export and print
		 */
		vm.getWaitMessageText = function () {
			if (vm.exportProgress === 'export') {
				return $izendaLocale.localeText('js_FinishExporting', 'Please wait till export is completed...');
			}
			if (vm.exportProgress === 'print') {
				return $izendaLocale.localeText('js_FinishPrinting', 'Please finish printing before continue.');
			}
			return '';
		}

		/**
		 * Set active panel
		 */
		vm.setLeftPanelActiveItem = function (id) {
			vm.leftPanel.activeItem = id;
			if (id !== previewPanelId)
				vm.leftPanel.previousPanelId = id;
			vm.leftPanel.opened = true;
		};

		/**
		 * Open report designer.
		 */
		vm.openReportInDesigner = function () {
			$izendaInstantReportStorage.openReportInDesigner();
		};

		/**
		 * Refresh preview
		 */
		vm.applyChanges = function () {
			vm.updateReportSetValidationAndRefresh();
		}

		/**
		 * Refresh preview for mobile devices
		 */
		vm.applyChangesMobile = function () {
			if (vm.leftPanel.previousPanelId === vm.leftPanel.activeItem) {
				vm.setLeftPanelActiveItem(6);
				$izendaInstantReportStorage.getReportPreviewHtml();
			} else {
				vm.setLeftPanelActiveItem(vm.leftPanel.previousPanelId);
				vm.leftPanel.previousPanelId = vm.leftPanel.activeItem;
			}
		};

		/**
		 * Set preview value
		 */
		vm.setPreviewTop = function (value) {
			$izendaInstantReportStorage.setPreviewTop(value);
			vm.applyChanges();
		}

		/**
		 * Returns active class for panel
		 */
		vm.getLeftPanelClass = function (id) {
			var result = vm.isExistingReport ? 'has-title' : '';
			if (vm.isLeftPanelBodyActive(id))
				result += ' active';
			return result.trim();
		};

		/**
		 * Get class for mobile view
		 */
		vm.getMobileClass = function () {
			return vm.isSmallResolution ? ' iz-inst-mobile ' : '';
		};

		/**
		 * returns true only for active panel in left panel
		 */
		vm.isLeftPanelBodyActive = function (id) {
			return vm.leftPanel.activeItem === id;
		};

		/**
		 * Hide/show left panel
		 */
		vm.toggleLeftPanel = function () {
			vm.leftPanel.opened = !vm.leftPanel.opened;
		};

		/**
		 * Get toggle left panel button title
		 */
		vm.getToggleButtonTitle = function () {
			if (vm.leftPanel.opened)
				return $izendaLocale.localeText('js_HideLeftPanel', 'Hide left panel');
			else
				return $izendaLocale.localeText('js_ShowLeftPanel', 'Show left panel');
		};

		/**
		 * Handler column drag/drop reorder
		 */
		vm.columnReordered = function (fromIndex, toIndex, isVg) {
			$izendaInstantReportStorage.moveFieldToPosition(fromIndex, toIndex, isVg);
			vm.updateReportSetValidationAndRefresh();
			$scope.$applyAsync();
		};

		/**
		 * Get columns, allowed for reorder
		 * @returns {number} count of columns which allowed for reorder.
		 */
		vm.getAllowedColumnsForReorder = function () {
			return vm.activeFields.length;
		};

		/**
		 * Column selected
		 */
		vm.selectedColumn = function (field) {
			$izendaInstantReportStorage.unselectAllFields();
			field.selected = true;
			$izendaInstantReportStorage.setCurrentActiveField(field);
			$scope.$applyAsync();
		};

		/**
		 * Remove column by given index
		 * @param {number} index 
		 */
		vm.removeColumn = function (field) {
			if (!angular.isNumber(field.parentFieldId)) {
				// if it is not multiple column for one database field.
				$izendaInstantReportStorage.applyFieldChecked(field).then(function () {
					var selectedField = $izendaInstantReportStorage.getCurrentActiveField();
					if (selectedField === field)
						$izendaInstantReportStorage.applyFieldSelected(field, false);
					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			} else {
				var parentField = $izendaInstantReportStorage.getFieldById(field.parentFieldId);
				$izendaInstantReportStorage.removeAnotherField(parentField, field);
				vm.updateReportSetValidationAndRefresh();
				$scope.$applyAsync();
			}
		};

		/**
		 * Open filters modal dialog
		*/
		vm.openFiltersPanel = function (value) {
			$izendaInstantReportPivots.setPivotsPanelOpened(false);
			if (angular.isDefined(value)) {
				$izendaInstantReportStorage.setFiltersPanelOpened(value);
			} else {
				var opened = $izendaInstantReportStorage.getFiltersPanelOpened();
				$izendaInstantReportStorage.setFiltersPanelOpened(!opened);
			}
		};

		/**
		 * Open pivots panel
		 */
		vm.openPivotsPanel = function (value) {
			$izendaInstantReportStorage.setFiltersPanelOpened(false);
			if (angular.isDefined(value)) {
				$izendaInstantReportPivots.setPivotsPanelOpened(value);
			} else {
				var opened = $izendaInstantReportPivots.getPivotsPanelOpened();
				$izendaInstantReportPivots.setPivotsPanelOpened(!opened);
			}
		}

		/**
		 * Open filters panel and add filter
		 */
		vm.addFilter = function (fieldSysName) {
			if (!angular.isString(fieldSysName))
				return;
			if ($izendaInstantReportStorage.getActiveTables().length === 0)
				return;
			vm.openFiltersPanel(true);
			$izendaInstantReportStorage.createNewFilter(fieldSysName).then(function (filter) {
				$izendaInstantReportStorage.getFilters().push(filter);
				filter.initialized = true;
				$izendaInstantReportValidation.validateReportSet();
				$izendaInstantReportStorage.setFilterOperator(filter, null).then(function () {
					$scope.$applyAsync();
				});
			});
		};

		/**
		 * Open pivots panel and add pivot item
		 */
		vm.addPivotItem = function (fieldSysName) {
			if (!angular.isString(fieldSysName))
				return;
			if ($izendaInstantReportStorage.getActiveTables().length === 0)
				return;

			vm.openPivotsPanel(true);

			var field = $izendaInstantReportStorage.getFieldBySysName(fieldSysName);
			var newItem = $izendaInstantReportStorage.createFieldObject(
				field.name, field.parentId, field.tableSysname, field.tableName,
				field.sysname, field.typeGroup, field.type, field.sqlType);
			$izendaInstantReportStorage.initializeField(newItem).then(function (f) {
				$scope.$applyAsync();
			});
			$izendaInstantReportPivots.addPivotItem(newItem);

			$izendaInstantReportStorage.applyAutoGroups(true);
		}

		/**
		 * Update validation state and refresh if needed.
		 */
		vm.updateReportSetValidationAndRefresh = function () {
			$izendaInstantReportValidation.validateReportSetAndRefresh();
		};

		/**
		 * Add field to report
		 */
		vm.addFieldToReport = function (fieldSysName) {
			if (!angular.isString(fieldSysName))
				return;
			var field = $izendaInstantReportStorage.getFieldBySysName(fieldSysName, true);
			if (field.checked) {
				var anotherField = $izendaInstantReportStorage.addAnotherField(field, true);
				$izendaInstantReportStorage.applyFieldChecked(anotherField).then(function () {
					$izendaInstantReportStorage.updateVisualGroupFieldOrders();
					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			} else {
				$izendaInstantReportStorage.unselectAllFields();
				field.selected = true;
				$izendaInstantReportStorage.setCurrentActiveField(field);
				$izendaInstantReportStorage.applyFieldChecked(field).then(function () {
					$izendaInstantReportStorage.updateVisualGroupFieldOrders();
					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			}
			// move field from last postions to selected position if it is drag-n-drop:
			if (field.checked && vm.currentInsertColumnOrder >= 0) {
				var fieldsArray = $izendaInstantReportStorage.getAllActiveFields().slice();
				fieldsArray = angular.element.grep(fieldsArray, function (f) {
					return !f.isVgUsed;
				});
				fieldsArray.sort(function (a, b) {
					return a.order - b.order;
				});
				var from = fieldsArray.length - 1;
				var to = vm.currentInsertColumnOrder;
				$izendaInstantReportStorage.moveFieldToPosition(from, to, false);
			}
			vm.currentInsertColumnOrder = -1;
		};

		/**
		 * Save report
		 */
		vm.saveReport = function (forceRename) {
			var rs = $izendaInstantReportStorage.getReportSet();
			var needToRename = forceRename || rs.reportName === null || rs.reportName === '';
			if (needToRename) {
				$rootScope.$broadcast('openSelectReportNameModalEvent', [true]);
			} else {
				vm.saveReportWithGivenName(rs.reportName, rs.reportCategory);
			}
		};

		/**
		 * Save report with selected name
		 */
		vm.saveReportWithGivenName = function (reportName, reportCategory) {
			var savePromise;
			if (angular.isString(reportName) && reportName !== '') {
				savePromise = $izendaInstantReportStorage.saveReportSet(reportName, reportCategory);
			} else {
				savePromise = $izendaInstantReportStorage.saveReportSet();
			}
			savePromise.then(function (result) {
				var reportSet = $izendaInstantReportStorage.getReportSet();
				var rsReportName = reportSet.reportName;
				var rsReportCategory = reportSet.reportCategory;
				if (angular.isString(rsReportCategory) && rsReportCategory !== '')
					rsReportName = rsReportCategory + $izendaSettings.getCategoryCharacter() + rsReportName;

				// show result message
				var errorMessage = null;
				if (angular.isString(result)) {
					if (result === 'OK') {
						$rootScope.$broadcast('izendaShowNotificationEvent', [$izendaLocale.localeTextWithParams('js_ReportSaved', 'Report "{0}" sucessfully saved.', [rsReportName])]);
					} else {
						errorMessage = $izendaLocale.localeTextWithParams(
							'js_FailedSaveReport',
							'Failed to save report "{0}". Error description: {1}',
							[rsReportName, result]);
					}
				} else if (angular.isObject(result)) {
					if (result.hasOwnProperty('Value')) {
						errorMessage = $izendaLocale.localeTextWithParams(
							'js_FailedSaveReport',
							'Failed to save report "{0}". Error description: {1}',
							[rsReportName, result.Value]);
					} else {
						errorMessage = result;
						$log.$error('Unsupported result type: ' + typeof (result) + '. Error message: ', result);
					}
				} else {
					errorMessage = result;
					$log.$error('Unsupported result type: ' + typeof (result) + '. Error message: ', result);
				}
				if (errorMessage !== null) {
					$rootScope.$broadcast('izendaShowMessageEvent', [errorMessage, $izendaLocale.localeText('js_FailedSaveReportTitle', 'Report save error'), 'danger']);
				}
			});
		}

		/**
		 * Print report buttons handler.
		 */
		vm.printReport = function (printType) {
			vm.exportProgress = 'print';
			$timeout(function () {
				$izendaInstantReportStorage.printReport(printType).then(function (result, message) {
					if (!result) {
						var reportSet = $izendaInstantReportStorage.getReportSet();
						var rsReportName = reportSet.reportName;
						$rootScope.$broadcast('izendaShowMessageEvent', [
							$izendaLocale.localeTextWithParams(
								'js_FailedPrintReport',
								'Failed to print report "{0}". Error description: {1}.',
								[rsReportName, message]),
							$izendaLocale.localeText('js_FailedPrintReportTitle', 'Report print error'),
							'danger']);
					}
					vm.exportProgress = null;
				});
				$scope.$applyAsync();
			}, 500);
		};

		/**
		 * Export report buttons handler
		 */
		vm.exportReport = function (exportType) {
			vm.exportProgress = 'export';
			$izendaInstantReportStorage.exportReport(exportType).then(function (result, message) {
				if (!result) {
					var reportSet = $izendaInstantReportStorage.getReportSet();
					var rsReportName = reportSet.reportName;
					$rootScope.$broadcast('izendaShowMessageEvent', [
						$izendaLocale.localeTextWithParams(
							'js_FailedExportReport',
							'Failed to export report "{0}". Error description: {1}.',
							[rsReportName, message]),
						$izendaLocale.localeText('js_FailedExportReportTitle', 'Report export error'),
						'danger']);
				}
				vm.exportProgress = null;
			});
		};

		/**
		 * Sync current settings and set report set as current report set.
		 */
		vm.syncReportSetAndEval = function (applyPreviewTop) {
			vm.isSynchronized = false;
			return $q(function (resolve, reject) {
				$izendaInstantReportStorage.setReportSetAsCrs(applyPreviewTop).then(function () {
					vm.isSynchronized = true;
					$scope.$applyAsync();
				});
			});
		};

		/**
		 * on-page-click report preview handler. Raises when user clicks on paging controls in preview.
		 */
		vm.onPagingClick = function (pagingControlType, pageRange) {
			var rs = $izendaInstantReportStorage.getReportSet();
			rs.options.rowsRange = pageRange;
			$izendaInstantReportStorage.getReportPreviewHtml();
		};

		/**
		 * Send report link via email
		 */
		vm.sendReportLinkEmail = function () {
			$izendaInstantReportStorage.sendReportLinkEmail();
		};

		/**
		 * Initialize controller
		 */
		vm.init = function () {
			var applyReportInfo = function (reportInfo) {
				if (!angular.isObject(reportInfo)) {
					vm.isExistingReport = false;
					vm.reportInfo = null;
					return;
				}
				// default action - new report
				if (reportInfo.isDefault) {
					$izendaUrl.setLocation({
						fullName: null,
						name: null,
						category: null,
						isNew: true,
						isDefault: false
					});
					return;
				}
				if (angular.isString(reportInfo.fullName) && reportInfo.fullName.trim() !== '') {
					// if location contains report name: load it
					$izendaInstantReportStorage.loadReport(reportInfo.fullName).then(function () {
						vm.isExistingReport = true;
						vm.reportInfo = reportInfo;
						$scope.$applyAsync();
					});
				} else {
					$izendaInstantReportStorage.newReport().then(function () {
						vm.isExistingReport = false;
						vm.reportInfo = reportInfo;
						$scope.$applyAsync();
					});
				}
			};

			$scope.$watch('$izendaCompatibility.isSmallResolution()', function (value, prevValue) {
				vm.isSmallResolution = value;
				if (prevValue && !value) {
					// small -> normal
					vm.setLeftPanelActiveItem(0);
				}
			});

			$scope.$watch('$izendaCompatibility.getRights()', function (value, prevValue) {
				if (value === prevValue)
					return;
				vm.effectiveRights = value;
				_updateReportSetRightVariables();
			});

			//
			$scope.$on('changeVisualizationProperties', function (event, args) {
				$izendaInstantReportStorage.getReportSet().charts[0].properties = args[0];
			});

			// look for location change
			$scope.$watch('$izendaUrl.getReportInfo()', function (reportInfo) {
				applyReportInfo(reportInfo);
			});

			/**
			 * Listen for complete loading page.
			 */
			$scope.$watch('$izendaInstantReportStorage.getPageReady()', function (isPageReady) {
				if (isPageReady) {
					vm.isLoading = false;
					vm.updateReportSetValidationAndRefresh();
				}
			});

			// Look for preview change
			$scope.$watch('$izendaInstantReportStorage.getPreview()', function (previewHtml) {

				// prepare options:
				var options = $izendaInstantReportStorage.getOptions();
				vm.reportSetOptions = {
					isVgUsed: false,
					vgStyle: options.page.vgStyle,
					sortedActiveFields: [],
					pivotCellsCount: vm.pivotCellsCount
				};

				// add active fields.
				vm.reportSetOptions.sortedActiveFields = $izendaInstantReportStorage.getAllActiveFields().slice();
				vm.reportSetOptions.sortedActiveFields.sort(function (a, b) {
					return a.order - b.order;
				});
				angular.element.each(vm.reportSetOptions.sortedActiveFields, function () {
					if (this.isVgUsed)
						vm.reportSetOptions.isVgUsed = true;
				});

				// set preview html
				vm.previewHtml = previewHtml;
			});

			$scope.$watch('$izendaInstantReportStorage.getFiltersPanelOpened()', function (opened) {
				vm.filtersPanelOpened = opened;
			});

			$scope.$watch('$izendaInstantReportPivots.getPivotsPanelOpened()', function (opened) {
				vm.pivotsPanelOpened = opened;
			});

			$scope.$watch('$izendaInstantReportStorage.getCurrentActiveField()', function (field) {
				vm.activeField = field;
			});

			$scope.$watch('$izendaInstantReportStorage.getOptions().top', function (top) {
				vm.top = top;
			});

			$scope.$watch('$izendaInstantReportStorage.getOptions().previewTop', function (top) {
				vm.previewTop = top;
			});

			$scope.$watchCollection('$izendaInstantReportStorage.getFilters()', function (filters) {
				vm.filtersCount = filters.length;
			});

			$scope.$watchCollection('$izendaInstantReportPivots.getCellValues()', function (cellValues) {
				vm.pivotCellsCount = cellValues.length;
			});

			$scope.$watchCollection('$izendaInstantReportStorage.getAllActiveFields()', function (activeFields) {
				vm.activeFields = activeFields;
			});

			$scope.$watch('$izendaInstantReportStorage.getPreviewSplashVisible()', function (visible) {
				vm.reportLoadingIndicatorIsVisible = visible;
			});

			// listen for validation state change.
			$scope.$watch('$izendaInstantReportValidation.isReportValid()', function (isValid) {
				vm.isValid = isValid;
			});

			/**
			 * Report name selected handler
			 */
			$scope.$on('selectedNewReportNameEvent', function (event, args) {
				var name = args[0],
						category = args[1];
				if (!angular.isString(category) || category.toLowerCase() === UNCATEGORIZED.toLowerCase())
					category = '';
				vm.saveReportWithGivenName(name, category);
			});

			// todo: move that javascript to special directive in future, because DOM manipulations in controller is bad practice:
			var $root = jq$('.iz-inst-root');
			jq$(window).resize(function () {
				var delta = $izendaCompatibility.isSmallResolution() ? 30 : 73;
				$root.height(jq$(window).height() - $root.offset().top - delta);
			});
			var delta = $izendaCompatibility.isSmallResolution() ? 30 : 73;
			$root.height(jq$(window).height() - $root.offset().top - delta);
		};

		function _updateReportSetRightVariables() {
			vm.rights = {};
			vm.rights.isFiltersEditAllowed = $izendaCompatibility.isFiltersEditAllowed();
			vm.rights.isFullAccess = $izendaCompatibility.isFullAccess();
			vm.rights.isEditAllowed = $izendaCompatibility.isEditAllowed();
			vm.rights.isSaveAsAllowed = $izendaCompatibility.isSaveAsAllowed();
			vm.rights.isSaveAllowed = $izendaCompatibility.isSaveAllowed();
		}
	}

});