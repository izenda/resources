import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report formatting controller definition
 */
izendaInstantReportModule.controller('InstantReportFormatController', [
	'$rootScope',
	'$scope',
	'$window',
	'$timeout',
	'$q',
	'$log',
	'$izendaLocaleService',
	'$izendaCompatibilityService',
	'$izendaInstantReportStorageService',
	'$izendaInstantReportSettingsService',
	function (
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$log,
		$izendaLocaleService,
		$izendaCompatibilityService,
		$izendaInstantReportStorageService,
		$izendaInstantReportSettingsService) {
		'use strict';
		$scope.$izendaCompatibilityService = $izendaCompatibilityService;
		var vm = this;
		vm.optGroups = {
			'headerAndFooter': {
				opened: false
			},
			'color': {
				opened: false
			},
			'page': {
				opened: false
			},
			'drilldowns': {
				opened: false
			}
		};

		$scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
		vm.options = $izendaInstantReportStorageService.getOptions();
		vm.vgStyles = [];
		vm.allActiveFields = [];
		vm.drillDownFields = $izendaInstantReportStorageService.getDrillDownFields();
		vm.selectedDrilldownField = null;

		vm.settings = $izendaInstantReportSettingsService.getSettings();
		vm.ddkValuesMaxAmount = vm.settings.ddkValuesMaxAmount;
		vm.allowVirtualDataSources = vm.settings.allowVirtualDataSources;

		/**
		 * Restore default color settings.
		 */
		vm.restoreDefaultColors = function () {
			$izendaInstantReportStorageService.restoreDefaultColors();
		};

		/**
		 * Remove fields which are already in drilldown collection
		 */
		vm.removeDrilldownFieldsFromAvailable = function () {
			vm.allActiveFields = angular.element.grep(vm.allActiveFields, function (f: any) {
				var found = false;
				angular.element.each(vm.drillDownFields, function () {
					var ddField = this;
					if (ddField.id === f.id)
						found = true;
				});
				return !found;
			});
		};

		/**
		 * update available collection
		 */
		vm.syncAvailableCollection = function () {
			var activeTables = $izendaInstantReportStorageService.getActiveTables();
			vm.allActiveFields = [];
			angular.element.each(activeTables, function () {
				var table = this;
				angular.element.each(table.fields, function () {
					vm.allActiveFields.push(this);
				});
			});
			vm.removeDrilldownFieldsFromAvailable();
		};

		/**
		 * Add drilldown key
		 */
		vm.addDrilldown = function () {
			if (vm.selectedDrilldownField === null)
				return;
			if (vm.drillDownFields.length >= vm.ddkValuesMaxAmount)
				return;
			vm.drillDownFields.push(vm.selectedDrilldownField);
			vm.syncAvailableCollection();
		};

		/**
		 * Remove drilldown field
		 */
		vm.removeDrilldownField = function (field) {
			var index = vm.drillDownFields.indexOf(field);
			vm.drillDownFields.splice(index, 1);
			vm.syncAvailableCollection();
		}

		/**
		* Initialize controller
		*/
		vm.init = function () {

			/**
			 * Look for options change
			 */
			$scope.$watch('$izendaInstantReportStorageService.getOptions()', function (options) {
				vm.options = options;
			});

			$scope.$watch('$izendaInstantReportStorageService.getVgStyles()', function (styles) {
				vm.vgStyles = styles;
			});

			$scope.$watch('$izendaInstantReportStorageService.getDrillDownFields()', function (ddFields) {
				vm.drillDownFields = ddFields;
				vm.syncAvailableCollection();
			});

			$scope.$watchCollection('$izendaInstantReportStorageService.getActiveTables()', function () {
				vm.syncAvailableCollection();
			});
		};
	}
]);