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
		'$modal',
		'$izendaUrl',
		'$izendaCompatibility',
		'$izendaInstantReportSettings',
		'$izendaInstantReportStorage',
		'$izendaInstantReportPivots',
		'$izendaScheduleService',
		'$izendaShareService',
		'$izendaInstantReportValidation',
		InstantReportController]);

function InstantReportController(
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$log,
		$modal,
		$izendaUrl,
		$izendaCompatibility,
		$izendaInstantReportSettings,
		$izendaInstantReportStorage,
		$izendaInstantReportPivots,
		$izendaScheduleService,
		$izendaShareService,
		$izendaInstantReportValidation) {
	'use strict';
	var vm = this;

	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	$scope.$izendaInstantReportPivots = $izendaInstantReportPivots;
	$scope.$izendaInstantReportSettings = $izendaInstantReportSettings;
	$scope.$izendaInstantReportValidation = $izendaInstantReportValidation;
	$scope.$izendaUrl = $izendaUrl;

	$scope.$izendaCompatibility = $izendaCompatibility;
	vm.isSmallResolution = $izendaCompatibility.isSmallResolution();

	vm.isLoading = true;
	vm.previewHtml = $izendaInstantReportStorage.getPreview();
	vm.filtersPanelOpened = $izendaInstantReportStorage.getFiltersPanelOpened();
	vm.pivotsPanelOpened = $izendaInstantReportPivots.getPivotsPanelOpened();
	vm.isValid = true;
	vm.activeField = null;
	vm.filtersCount = $izendaInstantReportStorage.getFilters().length;
	vm.pivotCellsCount = $izendaInstantReportPivots.getCellValues().length;
	vm.top = $izendaInstantReportStorage.getOptions().top;
	vm.previewTop = $izendaInstantReportStorage.getOptions().previewTop;
	vm.activeFields = $izendaInstantReportStorage.getAllActiveFields();
	vm.settings = $izendaInstantReportSettings.getSettings();
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
	 * Handler column drag/drop reorder
	 */
	vm.columnReordered = function (fromIndex, toIndex) {
		$izendaInstantReportStorage.moveFieldToPosition(fromIndex, toIndex, false);
		$scope.$applyAsync();
	};

	/**
	 * Get columns, allowed for reorder
	 * @returns {number} count of columns which allowed for reorder.
	 */
	vm.getAllowedColumnsForReorder = function() {
		return vm.activeFields.length;
	};

	/**
	 * Column selected
	 */
	vm.selectedColumn = function (index) {
		var fieldsArray = $izendaInstantReportStorage.getAllActiveFields().slice();
		fieldsArray.sort(function(a, b) {
			return a.order - b.order;
		});
		var field = fieldsArray[index];
		$izendaInstantReportStorage.unselectAllFields();
		field.selected = true;
		$izendaInstantReportStorage.setCurrentActiveField(field);
	};

	/**
	 * Remove column by given index
	 * @param {number} index 
	 */
	vm.removeColumn = function(index) {
		var fieldsArray = $izendaInstantReportStorage.getAllActiveFields().slice();
		fieldsArray.sort(function(a, b) {
			return a.order - b.order;
		});
		var field = fieldsArray[index];
		$izendaInstantReportStorage.applyFieldChecked(field).then(function () {
			var selectedField = $izendaInstantReportStorage.getCurrentActiveField();
			if (selectedField === field)
				$izendaInstantReportStorage.applyFieldSelected(field, false);
			vm.updateReportSetValidationAndRefresh();
			$scope.$applyAsync();
		});
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
		$izendaInstantReportStorage.createNewFilter(fieldSysName).then(function(filter) {
			$izendaInstantReportStorage.getFilters().push(filter);
			filter.initialized = true;
			$izendaInstantReportStorage.setFilterOperator(filter, null).then(function () {
				$scope.$applyAsync();
			});
		});
	};

	/**
	 * Open pivots panel and add pivot item
	 */
	vm.addPivotItem = function(fieldSysName) {
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
	vm.updateReportSetValidationAndRefresh = function() {
		var validationResult = $izendaInstantReportValidation.validateReportSet();
		if (validationResult) {
			if (!$izendaCompatibility.isSmallResolution())
				$izendaInstantReportStorage.getReportPreviewHtml();
		} else {
			$izendaInstantReportStorage.clearReportPreviewHtml();
		}
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
			$izendaInstantReportStorage.applyFieldChecked(anotherField).then(function() {
				vm.updateReportSetValidationAndRefresh();
				$scope.$applyAsync();
			});
		} else {
			$izendaInstantReportStorage.unselectAllFields();
			field.selected = true;
			$izendaInstantReportStorage.setCurrentActiveField(field);
			$izendaInstantReportStorage.applyFieldChecked(field).then(function () {
				vm.updateReportSetValidationAndRefresh();
				$scope.$applyAsync();
			});
		}
		// move field from last postions to selected position if it is drag-n-drop:
		if (field.checked && vm.currentInsertColumnOrder >= 0) {
			var allFields = $izendaInstantReportStorage.getAllActiveFields();
			var from = allFields.length - 1;
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
			vm.saveReportWithGivenName();
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
				rsReportName = rsReportCategory + '\\' + rsReportName;
			
			// show result message
			var errorMessage = null;
			if (angular.isString(result)) {
				if (result === 'OK') {
					$rootScope.$broadcast('showNotificationEvent', ['Report "' + rsReportName + '" was succesfully saved.']);
				} else {
					errorMessage = 'Can\'t save report "' + rsReportName + '". Error: ' + result;
				}
			} else if (angular.isObject(result)) {
				if (result.hasOwnProperty('Value')) {
					errorMessage = 'Can\'t save report "' + rsReportName + '". Error: ' + result.Value;
				} else {
					errorMessage = result;
					$log.$error('Unsupported result type: ' + typeof (result) + '. Error message: ', result);
				}
			} else {
				errorMessage = result;
				$log.$error('Unsupported result type: ' + typeof (result) + '. Error message: ', result);
			}
			if (errorMessage !== null) {
				$rootScope.$broadcast('izendaShowMessageEvent', [errorMessage, 'Report save error', 'danger']);
			}
		});
	}

	/**
	 * Print report buttons handler.
	 */
	vm.printReport = function(printType) {
		$izendaInstantReportStorage.printReport(printType).then(function(result, message) {
			if (!result) {
				$rootScope.$broadcast('izendaShowMessageEvent', [
					'Can\'t print report. Error: ' + message + '.',
					'Report print error',
					'danger']);
			}
		});
	};

	/**
	 * Export report buttons handler
	 */
	vm.exportReport = function(exportType) {
		$izendaInstantReportStorage.exportReport(exportType).then(function (result, message) {
			if (!result) {
				$rootScope.$broadcast('izendaShowMessageEvent', [
					'Can\'t export report. Error: ' + message + '.',
					'Report export error',
					'danger']);
			}
		});
	};

	/**
	 * Sync current settings and set report set as current report set.
	 */
	/*vm.syncReportSetAndEval = function (evalCode) {
		return $q(function(resolve, reject) {
			$izendaInstantReportStorage.setReportSetAsCrs(true).then(function () {
				if (angular.isString(evalCode)) {
					try {
						eval(evalCode);
						resolve();
					} catch (error) {
						$log.error('Can\'t eval code: "' + evalCode + '". Error: ', error);
						reject();
					}
				}
			});
		});
	};*/

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
	vm.sendReportLinkEmail = function() {
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
				// load schedule data with default config for new report
				var scheduleDataPromise = $izendaScheduleService.loadScheduleData();
				var shareDataPromise = $izendaShareService.loadShareData();
				$q.all([scheduleDataPromise, shareDataPromise]).then(function () {
					vm.isExistingReport = false;
					vm.reportInfo = reportInfo;
					$scope.$applyAsync();
				});
			}
		};
		
		$scope.$watch('$izendaCompatibility.isSmallResolution()', function(value, prevValue) {
			vm.isSmallResolution = value;
			if (prevValue && !value) {
				// small -> normal
				vm.setLeftPanelActiveItem(0);
			}
		});

		//
		$scope.$on('changeVisualizationProperties', function(event, args) {
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

		$scope.$watchCollection('$izendaInstantReportStorage.getFilters()', function(filters) {
			vm.filtersCount = filters.length;
		});

		$scope.$watchCollection('$izendaInstantReportPivots.getCellValues()', function(cellValues) {
			vm.pivotCellsCount = cellValues.length;
		});

		$scope.$watchCollection('$izendaInstantReportStorage.getAllActiveFields()', function(activeFields) {
			vm.activeFields = activeFields;
		});

		$scope.$watch('$izendaInstantReportStorage.getPreviewSplashVisible()', function(visible) {
			vm.reportLoadingIndicatorIsVisible = visible;
		});

		$scope.$watch('$izendaInstantReportSettings.getSettings()', function (settings) {
			vm.settings = settings;
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
			if (!angular.isString(category) || category.toLowerCase() === 'uncategorized')
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
}
