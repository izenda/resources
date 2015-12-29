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
		'$izendaInstantReportSettings',
		'$izendaInstantReportStorage',
		'$izendaScheduleService',
		'$izendaShareService',
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
		$izendaInstantReportSettings,
		$izendaInstantReportStorage,
		$izendaScheduleService,
		$izendaShareService) {
	'use strict';
	var vm = this;

	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	$scope.$izendaInstantReportSettings = $izendaInstantReportSettings;
	$scope.$izendaUrl = $izendaUrl;

	vm.isLoading = true;
	vm.previewHtml = $izendaInstantReportStorage.getPreview();
	vm.filtersPanelOpened = $izendaInstantReportStorage.getFiltersPanelOpened();
	vm.isValid = true;
	vm.activeField = null;
	vm.filtersCount = $izendaInstantReportStorage.getFilters().length;
	vm.top = $izendaInstantReportStorage.getOptions().top;
	vm.previewTop = $izendaInstantReportStorage.getOptions().previewTop;
	vm.activeFields = $izendaInstantReportStorage.getAllActiveFields();
	vm.settings = $izendaInstantReportSettings.getSettings();
	vm.reportInfo = null;
	vm.isExistingReport = false;
	vm.allowedPrintEngine = 'None';
	/**
	 * Left panel state object
	 */
	vm.leftPanel = {
		activeItem: 0,
		opened: true
	};

	/**
	 * Set active panel
	 */
	vm.setLeftPanelActiveItem = function (id) {
		vm.leftPanel.activeItem = id;
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
		$izendaInstantReportStorage.getReportPreviewHtml();
	}

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
	 * Column selected
	 */
	vm.selectedColumn = function (index) {
		var fieldsArray = $izendaInstantReportStorage.getAllActiveFields().slice();
		fieldsArray.sort(function(a, b) {
			return a.order - b.order;
		});
		$log.info(fieldsArray);
		var field = fieldsArray[index];
		$izendaInstantReportStorage.unselectAllFields();
		field.selected = true;
		$izendaInstantReportStorage.setCurrentActiveField(field);
	};

	/**
	 * Open filters modal dialog
	*/
	vm.openFiltersPanel = function (value) {
		if (angular.isDefined(value)) {
			$izendaInstantReportStorage.setFiltersPanelOpened(value);
		} else {
			var opened = $izendaInstantReportStorage.getFiltersPanelOpened();
			$izendaInstantReportStorage.setFiltersPanelOpened(!opened);
		}
	};

	/**
	 * Open filters panel and add filter
	 */
	vm.addFilter = function (fieldSysName) {
		if (!angular.isString(fieldSysName))
			return;
		if ($izendaInstantReportStorage.getActiveTables().length === 0)
			return;
		vm.openFiltersPanel(true);
		var filter = $izendaInstantReportStorage.createNewFilter(fieldSysName);
		$izendaInstantReportStorage.getFilters().push(filter);
		filter.initialized = true;
		$izendaInstantReportStorage.setFilterOperator(filter, null).then(function() {
			$scope.$applyAsync();
		});
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
			$izendaInstantReportStorage.applyFieldChecked(anotherField);
		} else {
			$izendaInstantReportStorage.unselectAllFields();
			field.selected = true;
			$izendaInstantReportStorage.setCurrentActiveField(field);
			$izendaInstantReportStorage.applyFieldChecked(field);
		}
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
			if (result === 'OK') {
				$rootScope.$broadcast('showNotificationEvent', ['Report "' + rsReportName + '" was succesfully saved.']);
			} else {
				$rootScope.$broadcast('izendaShowMessageEvent', [
					'Can\'t save report "' + rsReportName + '". Error: ' + result + '.',
					'Report save error',
					'danger']);
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
			if (!angular.isDefined(reportInfo)) {
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
			}
		});

		// Look for preview change
		$scope.$watch('$izendaInstantReportStorage.getPreview()', function (previewHtml) {
			vm.previewHtml = previewHtml;
		});

		$scope.$watch('$izendaInstantReportStorage.getFiltersPanelOpened()', function (opened) {
			vm.filtersPanelOpened = opened;
		});
		
		$scope.$watch('$izendaInstantReportStorage.isReportSetValid()', function (isValid) {
			vm.isValid = isValid;
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

		$scope.$watchCollection('$izendaInstantReportStorage.getAllActiveFields()', function(activeFields) {
			vm.activeFields = activeFields;
		});

		$scope.$watch('$izendaInstantReportSettings.getSettings()', function (settings) {
			vm.settings = settings;
			if (!angular.isObject(vm.settings))
				return;
			vm.showSaveControls = settings.showSaveControls;
			vm.showScheduleControls = settings.showScheduleControls;
			vm.showSharingControl = settings.showSharingControl;
			vm.showDesignLinks = settings.showDesignLinks;
			vm.allowedPrintEngine = settings.allowedPrintEngine;
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
			$root.height(jq$(window).height() - $root.offset().top - 50);
		});
		$root.height(jq$(window).height() - $root.offset().top - 50);
	};
}
