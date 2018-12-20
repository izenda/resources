import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report charts controller definition
 */
izendaInstantReportModule.controller('InstantReportChartsController', [
	'$rootScope',
	'$scope',
	'$window',
	'$timeout',
	'$q',
	'$izendaUrlService',
	'$izendaLocaleService',
	'$izendaCompatibilityService',
	'$izendaInstantReportStorageService',
	'$izendaInstantReportVisualizationService',
	'$izendaInstantReportValidationService',
	'$log',
	function (
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$izendaUrlService,
		$izendaLocaleService,
		$izendaCompatibilityService,
		$izendaInstantReportStorageService,
		$izendaInstantReportVisualizationService,
		$izendaInstantReportValidationService,
		$log) {
		'use strict';
		var vm = this;

		$scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
		$scope.$izendaInstantReportVisualizationService = $izendaInstantReportVisualizationService;

		vm.visualizationConfig = $izendaInstantReportVisualizationService.getVisualizationConfig();
		vm.selectedChart = null;

		/**
		 * Select chart
		 */
		vm.selectChart = function (chart) {
			if (vm.selectedChart === chart) {
				vm.selectedChart = null;
				$izendaInstantReportStorageService.selectChart(null);
				if (!$izendaCompatibilityService.isSmallResolution())
					$izendaInstantReportValidationService.validateReportSetAndRefresh();
			} else {
				vm.selectedChart = chart;
				$izendaInstantReportStorageService.selectChart(chart);
				if (!$izendaCompatibilityService.isSmallResolution())
					$izendaInstantReportValidationService.validateReportSetAndRefresh();
			}

		};

		/**
		 * Prepare config
		 */
		vm.prepareConfig = function () {
			if (!angular.isObject(vm.visualizationConfig))
				return;
			if (!angular.isArray(vm.visualizationConfig.categories))
				return;
			angular.element.each(vm.visualizationConfig.categories, function (iCategory: number, category: any) {
				category.opened = iCategory === 0;
			});
		};

		/**
		 * Open new window with chart help
		 * @param {object} chart object
		 */
		vm.showChartHelp = function (chart) {
			if (!angular.isObject(chart))
				throw 'Chart parameter should be object';
			$window.open(chart.docUrl, '_blank');
		};

		/**
		* Initialize controller
		*/
		vm.init = function () {

			$scope.$watch('$izendaInstantReportVisualizationService.getVisualizationConfig()', function (visConfig) {
				vm.visualizationConfig = visConfig;
				vm.prepareConfig();
			});

			$scope.$watch('$izendaInstantReportStorageService.getSelectedChart()', function (chart) {
				vm.selectedChart = chart;
			});
		};
	}
]);