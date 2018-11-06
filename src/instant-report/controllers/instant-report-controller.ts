﻿import * as angular from 'angular';
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
	'$izendaUrl',
	'$izendaLocale',
	'$izendaSettings',
	'$izendaCompatibility',
	'$izendaScheduleService',
	'$izendaShareService',
	'$izendaInstantReportStorage',
	'$izendaInstantReportPivots',
	'$izendaInstantReportValidation',
	'$izendaInstantReportSettings',
	function (
		$rootScope,
		$scope,
		$window,
		$timeout,
		$cookies,
		$q,
		$log,
		$izendaUtilUiService,
		$izendaUrl,
		$izendaLocale,
		$izendaSettings,
		$izendaCompatibility,
		$izendaScheduleService,
		$izendaShareService,
		$izendaInstantReportStorage,
		$izendaInstantReportPivots,
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
		$scope.$izendaScheduleService = $izendaScheduleService;
		$scope.$izendaShareService = $izendaShareService;

		vm.isSmallResolution = $izendaCompatibility.isSmallResolution();

		vm.isSaveReportModalOpened = false;
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
				vm.updateReportSetValidationAndRefresh(true);
				//$izendaInstantReportValidation.validateReportSetAndRefresh();
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
				return $izendaLocale.localeText('js_HideLeftPanel', 'Hide left panel');
			else
				return $izendaLocale.localeText('js_ShowLeftPanel', 'Show left panel');
		};

		/**
		 * Handler column drag/drop reorder
		 */
		vm.columnReordered = function (fromIndex, toIndex, isVg) {
			// we need to understand that swap from <-> to doesn't take into concideration invisible fields.
			$izendaInstantReportStorage.moveFieldToPosition(fromIndex, toIndex, isVg, true);
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
		vm.updateReportSetValidationAndRefresh = function (forceRefresh) {
			$izendaInstantReportValidation.validateReportSetAndRefresh(forceRefresh);
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
				var fieldsArray = $izendaInstantReportStorage.getAllVisibleFields().slice();
				fieldsArray = angular.element.grep(fieldsArray, function (f: any) {
					return !f.isVgUsed;
				});
				fieldsArray.sort(function (a, b) {
					return a.order - b.order;
				});
				var from = fieldsArray.length - 1;
				var to = vm.currentInsertColumnOrder;
				$izendaInstantReportStorage.moveFieldToPosition(from, to, false, true);
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
				$izendaInstantReportStorage.setReportSetAsCrs(false).then(function () {
					openDropdown($liElement);
				});
			else
				openDropdown($liElement);
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
			var rs = $izendaInstantReportStorage.getReportSet();
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
				$izendaInstantReportStorage.printReport(printType).then(function (results) {
					if (!results.success) {
						var reportSet = $izendaInstantReportStorage.getReportSet();
						var rsReportName = reportSet.reportName;
						// show message
						$izendaUtilUiService.showErrorDialog(
							$izendaLocale.localeTextWithParams(
								'js_FailedPrintReport',
								'Failed to print report "{0}". Error description: {1}.',
								[rsReportName, results.message]),
							$izendaLocale.localeText('js_FailedPrintReportTitle', 'Report print error'));
					}
					vm.exportProgress = null;
				});
				$scope.$applyAsync();
			}, 500);
			vm.closeAllNavbars();
		};

		var exportReportInternal = function (exportType) {
			vm.exportProgress = 'export';
			$izendaInstantReportStorage.exportReport(exportType).then(function (results) {
				if (!results.success) {
					var reportSet = $izendaInstantReportStorage.getReportSet();
					var rsReportName = reportSet.reportName;

					// show error dialog
					$izendaUtilUiService.showErrorDialog(
						$izendaLocale.localeTextWithParams(
							'js_FailedExportReport',
							'Failed to export report "{0}". Error description: {1}.',
							[rsReportName, results.message]),
						$izendaLocale.localeText('js_FailedExportReportTitle', 'Report export error'));

				}
				vm.exportProgress = null;
			});
		}

		var showCsvBulkUnsupportedFormatWarning = function (exportType) {

			var message = $izendaLocale.localeText('js_CsvBulkUnsupportFormatsWarning',
				'Csv(bulk) export does not support following formats: percent of group, percent of group (with rounding), gauge, gauge (variable), dash gauge. Default format will be applied instead of them.');

			var checkboxes = [
				{
					label: $izendaLocale.localeText('js_DoNotShowThisDialogAgain', 'Do not show this dialog again'),
					checked: false
				}];

			var warningArgs = {
				title: $izendaLocale.localeText('js_Warning', 'Warning'),
				message: message,
				buttons: [
					{
						text: $izendaLocale.localeText('js_Ok', 'Ok'),
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
					{ text: $izendaLocale.localeText('js_Cancel', 'Cancel') }
				],
				checkboxes: checkboxes,
				alertInfo: 'warning'
			}
			$izendaUtilUiService.showDialogBox(warningArgs);
		};

		var isCsvBulkWithUnsupportedFormat = function (exportType) {
			var isCsvBulk = exportType === 'csv' && $izendaSettings.getBulkCsv();
			if (!isCsvBulk) return false;
			var hasAggregateFormats = $izendaInstantReportStorage.hasAggregateFormats();
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
			var rs = $izendaInstantReportStorage.getReportSet();
			rs.options.rowsRange = pageRange;
			$izendaInstantReportValidation.validateReportSetAndRefresh();
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
				vm.reportSetOptions.sortedActiveFields = $izendaInstantReportStorage.getAllVisibleFields();
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
			vm.rights.isFiltersEditAllowed = $izendaCompatibility.isFiltersEditAllowed();
			vm.rights.isFullAccess = $izendaCompatibility.isFullAccess();
			vm.rights.isEditAllowed = $izendaCompatibility.isEditAllowed();
			vm.rights.isSaveAsAllowed = $izendaCompatibility.isSaveAsAllowed();
			vm.rights.isSaveAllowed = $izendaCompatibility.isSaveAllowed();
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
				rsReportName = reportCategory + $izendaSettings.getCategoryCharacter() + rsReportName;

			var savePromise;
			if (angular.isString(reportName) && reportName !== '') {
				savePromise = $izendaInstantReportStorage.saveReportSet(reportName, category);
			} else {
				savePromise = $izendaInstantReportStorage.saveReportSet();
			}
			savePromise.then(function () {
				var notificationMessage = $izendaLocale.localeTextWithParams('js_ReportSaved', 'Report "{0}" sucessfully saved.', [rsReportName]);
				$izendaUtilUiService.showNotification(notificationMessage);
			}, function (error) {
				var errorTitle = $izendaLocale.localeText('js_FailedSaveReportTitle', 'Report save error');
				var errorMessage = $izendaLocale.localeTextWithParams(
					'js_FailedSaveReport',
					'Failed to save report "{0}". Error description: {1}',
					[rsReportName, error]);
				$izendaUtilUiService.showErrorDialog(errorMessage, errorTitle);
			});
		}
	}]);