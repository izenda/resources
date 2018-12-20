import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report controller definition
 */
izendaInstantReportModule.controller('InstantReportController', [
	'$rootScope',
	'$scope',
	'$window',
	'$timeout',
	'$cookies',
	'$q',
	'$log',
	'$izendaUtilUiService',
	'$izendaUrlService',
	'$izendaLocaleService',
	'$izendaSettingsService',
	'$izendaCompatibilityService',
	'$izendaScheduleService',
	'$izendaShareService',
	'$izendaInstantReportStorageService',
	'$izendaInstantReportPivotService',
	'$izendaInstantReportValidationService',
	'$izendaInstantReportSettingsService',
	function (
		$rootScope,
		$scope,
		$window,
		$timeout,
		$cookies,
		$q,
		$log,
		$izendaUtilUiService,
		$izendaUrlService,
		$izendaLocaleService,
		$izendaSettingsService,
		$izendaCompatibilityService,
		$izendaScheduleService,
		$izendaShareService,
		$izendaInstantReportStorageService,
		$izendaInstantReportPivotService,
		$izendaInstantReportValidationService,
		$izendaInstantReportSettingsService) {
		'use strict';
		var vm = this;
		var UNCATEGORIZED = $izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
		$scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
		$scope.$izendaInstantReportPivotService = $izendaInstantReportPivotService;
		$scope.$izendaInstantReportValidationService = $izendaInstantReportValidationService;
		$scope.$izendaUrlService = $izendaUrlService;
		$scope.$izendaLocaleService = $izendaLocaleService;

		$scope.$izendaCompatibilityService = $izendaCompatibilityService;
		$scope.$izendaScheduleService = $izendaScheduleService;
		$scope.$izendaShareService = $izendaShareService;

		vm.isSmallResolution = $izendaCompatibilityService.isSmallResolution();

		vm.isSaveReportModalOpened = false;
		vm.isLoading = true;

		vm.previewHtml = $izendaInstantReportStorageService.getPreview();
		vm.reportSetOptions = {
			isVgUsed: false,
			vgStyle: null,
			sortedActiveFields: []
		};;
		vm.filtersPanelOpened = $izendaInstantReportStorageService.getFiltersPanelOpened();
		vm.pivotsPanelOpened = $izendaInstantReportPivotService.getPivotsPanelOpened();
		vm.isValid = true;
		vm.activeField = null;
		vm.filtersCount = $izendaInstantReportStorageService.getFilters().length;
		vm.pivotCellsCount = $izendaInstantReportPivotService.getCellValues().length;
		vm.top = $izendaInstantReportStorageService.getOptions().top;
		vm.previewTop = $izendaInstantReportStorageService.getOptions().previewTop;
		vm.activeFields = $izendaInstantReportStorageService.getAllActiveFields();
		vm.settings = $izendaInstantReportSettingsService.getSettings();
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

		vm.effectiveRights = $izendaCompatibilityService.getRights();
		_updateReportSetRightVariables();

		/**
		 * Wait message header for export and print
		 */
		vm.getWaitMessageHeaderText = function () {
			if (vm.exportProgress === 'export') {
				return $izendaLocaleService.localeText('js_ExportingInProgress', 'Exporting in progress.');
			}
			if (vm.exportProgress === 'print') {
				return $izendaLocaleService.localeText('js_PrintingInProgress', 'Printing in progress.');
			}
			return '';
		}

		/**
		 * Wait message for export and print
		 */
		vm.getWaitMessageText = function () {
			if (vm.exportProgress === 'export') {
				return $izendaLocaleService.localeText('js_FinishExporting', 'Please wait till export is completed...');
			}
			if (vm.exportProgress === 'print') {
				return $izendaLocaleService.localeText('js_FinishPrinting', 'Please finish printing before continue.');
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
			$izendaInstantReportStorageService.openReportInDesigner();
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
				vm.updateReportSetValidationAndRefresh(true);
				//$izendaInstantReportValidationService.validateReportSetAndRefresh();
			} else {
				vm.setLeftPanelActiveItem(vm.leftPanel.previousPanelId);
				vm.leftPanel.previousPanelId = vm.leftPanel.activeItem;
			}
		};

		/**
		 * Set preview value
		 */
		vm.setPreviewTop = function (value) {
			$izendaInstantReportStorageService.setPreviewTop(value);
			vm.applyChanges();
			vm.closeAllNavbars();
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
				return $izendaLocaleService.localeText('js_HideLeftPanel', 'Hide left panel');
			else
				return $izendaLocaleService.localeText('js_ShowLeftPanel', 'Show left panel');
		};

		/**
		 * Handler column drag/drop reorder
		 */
		vm.columnReordered = function (fromIndex, toIndex, isVg) {
			// we need to understand that swap from <-> to doesn't take into concideration invisible fields.
			$izendaInstantReportStorageService.moveFieldToPosition(fromIndex, toIndex, isVg, true);
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
			$izendaInstantReportStorageService.unselectAllFields();
			field.selected = true;
			$izendaInstantReportStorageService.setCurrentActiveField(field);
			$scope.$applyAsync();
		};

		/**
		 * Remove column by given index
		 * @param {number} index 
		 */
		vm.removeColumn = function (field) {
			if (!angular.isNumber(field.parentFieldId)) {
				// if it is not multiple column for one database field.
				$izendaInstantReportStorageService.applyFieldChecked(field).then(function () {
					var selectedField = $izendaInstantReportStorageService.getCurrentActiveField();
					if (selectedField === field)
						$izendaInstantReportStorageService.applyFieldSelected(field, false);
					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			} else {
				var parentField = $izendaInstantReportStorageService.getFieldById(field.parentFieldId);
				$izendaInstantReportStorageService.removeAnotherField(parentField, field);
				vm.updateReportSetValidationAndRefresh();
				$scope.$applyAsync();
			}
		};

		/**
		 * Open filters modal dialog
		*/
		vm.openFiltersPanel = function (value) {
			$izendaInstantReportPivotService.setPivotsPanelOpened(false);
			if (angular.isDefined(value)) {
				$izendaInstantReportStorageService.setFiltersPanelOpened(value);
			} else {
				var opened = $izendaInstantReportStorageService.getFiltersPanelOpened();
				$izendaInstantReportStorageService.setFiltersPanelOpened(!opened);
			}
		};

		/**
		 * Open pivots panel
		 */
		vm.openPivotsPanel = function (value) {
			$izendaInstantReportStorageService.setFiltersPanelOpened(false);
			if (angular.isDefined(value)) {
				$izendaInstantReportPivotService.setPivotsPanelOpened(value);
			} else {
				var opened = $izendaInstantReportPivotService.getPivotsPanelOpened();
				$izendaInstantReportPivotService.setPivotsPanelOpened(!opened);
			}
		}

		/**
		 * Open filters panel and add filter
		 */
		vm.addFilter = function (fieldSysName) {
			if (!angular.isString(fieldSysName))
				return;
			if ($izendaInstantReportStorageService.getActiveTables().length === 0)
				return;
			vm.openFiltersPanel(true);
			$izendaInstantReportStorageService.createNewFilter(fieldSysName).then(function (filter) {
				$izendaInstantReportStorageService.getFilters().push(filter);
				filter.initialized = true;
				$izendaInstantReportValidationService.validateReportSet();
				$izendaInstantReportStorageService.setFilterOperator(filter, null).then(function () {
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
			if ($izendaInstantReportStorageService.getActiveTables().length === 0)
				return;

			vm.openPivotsPanel(true);

			var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName);
			var newItem = $izendaInstantReportStorageService.createFieldObject(
				field.name, field.parentId, field.tableSysname, field.tableName,
				field.sysname, field.typeGroup, field.type, field.sqlType);
			$izendaInstantReportStorageService.initializeField(newItem).then(function (f) {
				$scope.$applyAsync();
			});
			$izendaInstantReportPivotService.addPivotItem(newItem);

			$izendaInstantReportStorageService.applyAutoGroups(true);
		}

		/**
		 * Update validation state and refresh if needed.
		 */
		vm.updateReportSetValidationAndRefresh = function (forceRefresh) {
			$izendaInstantReportValidationService.validateReportSetAndRefresh(forceRefresh);
		};

		/**
		 * Add field to report
		 */
		vm.addFieldToReport = function (fieldSysName) {
			if (!angular.isString(fieldSysName))
				return;
			var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName, true);
			if (field.checked) {
				var anotherField = $izendaInstantReportStorageService.addAnotherField(field, true);
				$izendaInstantReportStorageService.applyFieldChecked(anotherField).then(function () {
					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			} else {
				$izendaInstantReportStorageService.unselectAllFields();
				field.selected = true;
				$izendaInstantReportStorageService.setCurrentActiveField(field);
				$izendaInstantReportStorageService.applyFieldChecked(field).then(function () {
					vm.updateReportSetValidationAndRefresh();
					$scope.$applyAsync();
				});
			}
			// move field from last postions to selected position if it is drag-n-drop:
			if (field.checked && vm.currentInsertColumnOrder >= 0) {
				var fieldsArray = $izendaInstantReportStorageService.getAllVisibleFields().slice();
				fieldsArray = angular.element.grep(fieldsArray, function (f: any) {
					return !f.isVgUsed;
				});
				fieldsArray.sort(function (a, b) {
					return a.order - b.order;
				});
				var from = fieldsArray.length - 1;
				var to = vm.currentInsertColumnOrder;
				$izendaInstantReportStorageService.moveFieldToPosition(from, to, false, true);
			}
			vm.currentInsertColumnOrder = -1;
		};

		/**
		 * Close all navbar opened dropdowns
		 */
		vm.closeAllNavbars = function () {
			var $navBar = angular.element('.iz-inst-navbar');
			$navBar.find('.navbar-nav > li.open').each(function () {
				angular.element(this).removeClass('open');
			});
		};

		/**
		 * Place dropdown to the proper position.
		 */
		vm.alignNavDropdowns = function () {
			var $navbar = angular.element('.iz-inst-navbar');
			var $liList = $navbar.find('.iz-inst-nav > li.open');
			if (!$liList.length)
				return;
			$liList.each(function () {
				var $li = angular.element(this);
				var liWidth = $li.width();
				var $dropdown = $li.children('.dropdown-menu');
				var isRightNow = $dropdown.hasClass('dropdown-menu-right');
				var dropdownWidth = $dropdown.width();
				var deltaLeft = $li.position().left + $dropdown.position().left;
				var deltaRight = $navbar.width() - deltaLeft - dropdownWidth;
				var isRightAlign = false;
				var needToMove = false;
				if (deltaRight < 0) {
					isRightAlign = true;
					needToMove = true;
				}
				if (deltaLeft < 0 || (isRightNow && deltaRight + liWidth > dropdownWidth + 10)) {
					needToMove = true;
					isRightAlign = false;
				}
				if (needToMove)
					if (isRightAlign)
						$dropdown.addClass('dropdown-menu-right');
					else
						$dropdown.removeClass('dropdown-menu-right');
			});
		};

		/**
		 * Open navbar dropdown accordingly to its relative position to the edges of the screen.
		 * @param {object} $event angular click event object.
		 */
		vm.openNavBarDropdown = function ($event, doSync) {
			function openDropdown($li) {
				vm.closeAllNavbars();
				$li.addClass('open');
				vm.alignNavDropdowns();
			}

			$event.stopPropagation();
			if (!vm.isValid)
				return;

			// dropdown elements
			var $aElement = angular.element($event.currentTarget);
			var $liElement = $aElement.parent();
			var $dropdownElement = $aElement.siblings('.dropdown-menu');

			// close
			if ($liElement.hasClass('open')) {
				$dropdownElement.removeClass('dropdown-menu-right');
				$liElement.removeClass('open');
				return;
			}

			// open
			if (doSync)
				$izendaInstantReportStorageService.setReportSetAsCrs(false).then(function () {
					openDropdown($liElement);
				});
			else
				openDropdown($liElement);
		};

		vm.isSaveButtonVisible = function() {
			return vm.settings.showSaveControls && vm.rights.isSaveAllowed && vm.activeFields.length > 0;
		};

		vm.isSaveAsButtonVisible = function() {
			return vm.settings.showSaveControls && vm.rights.isSaveAsAllowed && vm.activeFields.length > 0;
		};

		/**
		 * Save dialog closed handler.
		 */
		vm.onSaveClosed = function () {
			vm.isSaveReportModalOpened = false;
		};

		/**
		 * Report name/category selected. Save report handler.
		 */
		vm.onSave = function (reportName, categoryName) {
			_saveReportWithGivenName(reportName, categoryName);
			vm.isSaveReportModalOpened = false;
		};

		/**
		 * Save report
		 */
		vm.saveReport = function (forceRename) {
			vm.isSaveReportModalOpened = false;
			var rs = $izendaInstantReportStorageService.getReportSet();
			var needToRename = forceRename || !rs.reportName;
			if (needToRename) {
				vm.isSaveReportModalOpened = true;
			} else {
				_saveReportWithGivenName(rs.reportName, rs.reportCategory);
			}
			vm.closeAllNavbars();
		};

		/**
		 * Print report buttons handler.
		 */
		vm.printReport = function (printType) {
			vm.exportProgress = 'print';
			$timeout(function () {
				$izendaInstantReportStorageService.printReport(printType).then(function (results) {
					if (!results.success) {
						var reportSet = $izendaInstantReportStorageService.getReportSet();
						var rsReportName = reportSet.reportName;
						// show message
						$izendaUtilUiService.showErrorDialog(
							$izendaLocaleService.localeTextWithParams(
								'js_FailedPrintReport',
								'Failed to print report "{0}". Error description: {1}.',
								[rsReportName, results.message]),
							$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error'));
					}
					vm.exportProgress = null;
				});
				$scope.$applyAsync();
			}, 500);
			vm.closeAllNavbars();
		};

		var exportReportInternal = function (exportType) {
			vm.exportProgress = 'export';
			$izendaInstantReportStorageService.exportReport(exportType).then(function (results) {
				if (!results.success) {
					var reportSet = $izendaInstantReportStorageService.getReportSet();
					var rsReportName = reportSet.reportName;

					// show error dialog
					$izendaUtilUiService.showErrorDialog(
						$izendaLocaleService.localeTextWithParams(
							'js_FailedExportReport',
							'Failed to export report "{0}". Error description: {1}.',
							[rsReportName, results.message]),
						$izendaLocaleService.localeText('js_FailedExportReportTitle', 'Report export error'));

				}
				vm.exportProgress = null;
			});
		}

		var showCsvBulkUnsupportedFormatWarning = function (exportType) {

			var message = $izendaLocaleService.localeText('js_CsvBulkUnsupportFormatsWarning',
				'Csv(bulk) export does not support following formats: percent of group, percent of group (with rounding), gauge, gauge (variable), dash gauge. Default format will be applied instead of them.');

			var checkboxes = [
				{
					label: $izendaLocaleService.localeText('js_DoNotShowThisDialogAgain', 'Do not show this dialog again'),
					checked: false
				}];

			var warningArgs = {
				title: $izendaLocaleService.localeText('js_Warning', 'Warning'),
				message: message,
				buttons: [
					{
						text: $izendaLocaleService.localeText('js_Ok', 'Ok'),
						callback: function (checkboxes) {
							if (checkboxes && checkboxes.length > 0) {
								var doNotShowAgain = checkboxes[0];
								if (doNotShowAgain && doNotShowAgain.checked) {
									var date = new Date;
									date.setDate(date.getDate() + 365);
									var cookieOptions = { expires: date }
									$cookies.put("izendaHideCsvBulkUnsupportedFormatWarning", true, cookieOptions);
								}
							}
							exportReportInternal(exportType);
						}
					},
					{ text: $izendaLocaleService.localeText('js_Cancel', 'Cancel') }
				],
				checkboxes: checkboxes,
				alertInfo: 'warning'
			}
			$izendaUtilUiService.showDialogBox(warningArgs);
		};

		var isCsvBulkWithUnsupportedFormat = function (exportType) {
			var isCsvBulk = exportType === 'csv' && $izendaSettingsService.getBulkCsv();
			if (!isCsvBulk) return false;
			var hasAggregateFormats = $izendaInstantReportStorageService.hasAggregateFormats();
			return hasAggregateFormats;
		}

		/**
		 * Export report buttons handler
		 */
		vm.exportReport = function (exportType) {
			var hideCsvWarning = $cookies.get("izendaHideCsvBulkUnsupportedFormatWarning");
			if (isCsvBulkWithUnsupportedFormat(exportType) && !hideCsvWarning) {
				showCsvBulkUnsupportedFormatWarning(exportType);
				return;
			}
			exportReportInternal(exportType);
			vm.closeAllNavbars();
		};

		/**
		 * on-page-click report preview handler. Raises when user clicks on paging controls in preview.
		 */
		vm.onPagingClick = function (pagingControlType, pageRange) {
			var rs = $izendaInstantReportStorageService.getReportSet();
			rs.options.rowsRange = pageRange;
			$izendaInstantReportValidationService.validateReportSetAndRefresh();
		};

		/**
		 * Send report link via email
		 */
		vm.sendReportLinkEmail = function () {
			$izendaInstantReportStorageService.sendReportLinkEmail();
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
				if (angular.isString(reportInfo.fullName) && reportInfo.fullName.trim() !== '') {
					// if location contains report name: load it
					$izendaInstantReportStorageService.loadReport(reportInfo.fullName).then(function () {
						vm.isExistingReport = true;
						vm.reportInfo = reportInfo;
						$scope.$applyAsync();
					});
				} else {
					$izendaInstantReportStorageService.newReport().then(function () {
						vm.isExistingReport = false;
						vm.reportInfo = reportInfo;
						$scope.$applyAsync();
					});
				}
			};

			$scope.$watch('$izendaCompatibilityService.isSmallResolution()', function (value, prevValue) {
				vm.isSmallResolution = value;
				if (vm.isSmallResolution) {
					angular.element('.iz-inst-mainpanel-body').css('visibility', 'hidden');
				} else {
					$timeout(() => {
						angular.element('.iz-inst-mainpanel-body').css('visibility', 'visible');
					}, 600);
				}
				if (prevValue && !value) {
					// small -> normal
					vm.setLeftPanelActiveItem(0);
				}
			});

			$scope.$watch('$izendaCompatibilityService.getRights()', function (value, prevValue) {
				if (value === prevValue)
					return;
				vm.effectiveRights = value;
				_updateReportSetRightVariables();
			});

			//
			$scope.$on('changeVisualizationProperties', function (event, args) {
				$izendaInstantReportStorageService.getReportSet().charts[0].properties = args[0];
			});

			// look for location change
			$scope.$watch('$izendaUrlService.getReportInfo()', function (reportInfo) {
				applyReportInfo(reportInfo);
			});

			/**
			 * Listen for complete loading page.
			 */
			$scope.$watch('$izendaInstantReportStorageService.getPageReady()', function (isPageReady) {
				if (isPageReady) {
					vm.isLoading = false;
					vm.updateReportSetValidationAndRefresh();
				}
			});

			// Look for preview change
			$scope.$watch('$izendaInstantReportStorageService.getPreview()', function (previewHtml) {

				// prepare options:
				var options = $izendaInstantReportStorageService.getOptions();
				vm.reportSetOptions = {
					isVgUsed: false,
					vgStyle: options.page.vgStyle,
					sortedActiveFields: [],
					pivotCellsCount: vm.pivotCellsCount
				};

				// add active fields.
				vm.reportSetOptions.sortedActiveFields = $izendaInstantReportStorageService.getAllVisibleFields();
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

			$scope.$watch('$izendaInstantReportStorageService.getFiltersPanelOpened()', function (opened) {
				vm.filtersPanelOpened = opened;
			});

			$scope.$watch('$izendaInstantReportPivotService.getPivotsPanelOpened()', function (opened) {
				vm.pivotsPanelOpened = opened;
			});

			$scope.$watch('$izendaInstantReportStorageService.getCurrentActiveField()', function (field) {
				vm.activeField = field;
			});

			$scope.$watch('$izendaInstantReportStorageService.getOptions().top', function (top) {
				vm.top = top;
			});

			$scope.$watch('$izendaInstantReportStorageService.getOptions().previewTop', function (top) {
				vm.previewTop = top;
			});

			$scope.$watchCollection('$izendaInstantReportStorageService.getFilters()', function (filters) {
				vm.filtersCount = filters.length;
			});

			$scope.$watchCollection('$izendaInstantReportPivotService.getCellValues()', function (cellValues) {
				vm.pivotCellsCount = cellValues.length;
			});

			$scope.$watchCollection('$izendaInstantReportStorageService.getAllActiveFields()', function (activeFields) {
				vm.activeFields = activeFields;
			});

			$scope.$watch('$izendaInstantReportStorageService.getPreviewSplashVisible()', function (visible) {
				vm.reportLoadingIndicatorIsVisible = visible;
			});

			// listen for validation state change.
			$scope.$watch('$izendaInstantReportValidationService.isReportValid()', function (isValid) {
				vm.isValid = isValid;
			});

			/**
			 * Report name selected handler
			 */
			$scope.$on('selectedNewReportNameEvent', function (event, args) {
				if (!angular.isArray(args) || args.length !== 2)
					throw 'Array with 2 elements expected';
				var name = args[0], category = args[1];
				_saveReportWithGivenName(name, category);
			});

			// todo: move that javascript to special directive in future, because DOM manipulations in controller is bad practice:
			var $root = angular.element('.iz-inst-root');
			angular.element(window).resize(function () {
				vm.alignNavDropdowns();
				$root.height(angular.element(window).height() - $root.offset().top - 30);
			});
			$root.height(angular.element(window).height() - $root.offset().top - 30);

			// left panel resize sensor
			var $panel = angular.element('.iz-inst-left-panel');
			if ($panel.length)
				resizeSensor($panel.get(0), function () {
					vm.alignNavDropdowns();
				});
		};

		function _updateReportSetRightVariables() {
			vm.rights = {};
			vm.rights.isFiltersEditAllowed = $izendaCompatibilityService.isFiltersEditAllowed();
			vm.rights.isFullAccess = $izendaCompatibilityService.isFullAccess();
			vm.rights.isEditAllowed = $izendaCompatibilityService.isEditAllowed();
			vm.rights.isSaveAsAllowed = $izendaCompatibilityService.isSaveAsAllowed();
			vm.rights.isSaveAllowed = $izendaCompatibilityService.isSaveAllowed();
		}

		/**
		 * Save report with selected name
		 */
		function _saveReportWithGivenName(reportName, reportCategory) {
			var category = reportCategory;
			if (!angular.isString(category) || category.toLowerCase() === UNCATEGORIZED.toLowerCase())
				category = '';

			var rsReportName = reportName;
			if (angular.isString(reportCategory) && reportCategory !== '')
				rsReportName = reportCategory + $izendaSettingsService.getCategoryCharacter() + rsReportName;

			var savePromise;
			if (angular.isString(reportName) && reportName !== '') {
				savePromise = $izendaInstantReportStorageService.saveReportSet(reportName, category);
			} else {
				savePromise = $izendaInstantReportStorageService.saveReportSet();
			}
			savePromise.then(function () {
				var notificationMessage = $izendaLocaleService.localeTextWithParams('js_ReportSaved', 'Report "{0}" sucessfully saved.', [rsReportName]);
				$izendaUtilUiService.showNotification(notificationMessage);
			}, function (error) {
				var errorTitle = $izendaLocaleService.localeText('js_FailedSaveReportTitle', 'Report save error');
				var errorMessage = $izendaLocaleService.localeTextWithParams(
					'js_FailedSaveReport',
					'Failed to save report "{0}". Error description: {1}',
					[rsReportName, error]);
				$izendaUtilUiService.showErrorDialog(errorMessage, errorTitle);
			});
		}
	}]);