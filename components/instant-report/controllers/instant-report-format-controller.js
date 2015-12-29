/**
* Instant report formatting controller definition
*/
angular
.module('izendaInstantReport')
.controller('InstantReportFormatController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			'$izendaInstantReportSettings',
			'$izendaInstantReportStorage',
			InstantReportFormatController
]);

function InstantReportFormatController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$log,
			$izendaInstantReportSettings,
			$izendaInstantReportStorage) {
	'use strict';

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

	vm.$izendaInstantReportSettings = $izendaInstantReportSettings;
	vm.$izendaInstantReportStorage = $izendaInstantReportStorage;
	vm.options = $izendaInstantReportStorage.getOptions();
	vm.vgStyles = [];
	vm.allActiveFields = [];
	vm.drillDownFields = $izendaInstantReportStorage.getDrillDownFields();
	vm.selectedDrilldownField = null;
	vm.ddkValuesMaxAmount = 2;

	/**
	 * Remove fields which are already in drilldown collection
	 */
	vm.removeDrilldownFieldsFromAvailable = function () {
		vm.allActiveFields = angular.element.grep(vm.allActiveFields, function (f) {
			var found = false;
			angular.element.each(vm.drillDownFields, function() {
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
	vm.syncAvailableCollection = function() {
		var activeTables = $izendaInstantReportStorage.getActiveTables();
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
		$scope.$watch('$izendaInstantReportStorage.getOptions()', function (options) {
			vm.options = options;
		});

		$scope.$watch('$izendaInstantReportStorage.getVgStyles()', function (styles) {
			vm.vgStyles = styles;
		});

		$scope.$watch('$izendaInstantReportStorage.getDrillDownFields()', function(ddFields) {
			vm.drillDownFields = ddFields;
			vm.syncAvailableCollection();
		});

		$scope.$watchCollection('$izendaInstantReportStorage.getActiveTables()', function () {
			vm.syncAvailableCollection();
		});

		$scope.$watch('$izendaInstantReportSettings.getSettings()', function (settings) {
			vm.settings = settings;
			if (!angular.isObject(vm.settings))
				return;
			vm.ddkValuesMaxAmount = settings.ddkValuesMaxAmount;
		});
	};
}
