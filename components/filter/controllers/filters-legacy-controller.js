izendaRequire.define(['angular', '../../common/services/services'], function (angular) {

	angular
	.module('izendaFilters')
	.controller('IzendaFiltersLegacyController', [
	'$scope',
	'$window',
	'$rootScope',
	'$log',
	'$izendaUrl',
	'$izendaEvent',
	IzendaFiltersLegacyController]);

	/**
	 * Controller for old non angular filters
	 */
	// ReSharper disable once InconsistentNaming
	function IzendaFiltersLegacyController($scope, $window, $rootScope, $log, $izendaUrl, $izendaEvent) {
		var _ = angular.element;
		$scope.izendaUrl = $izendaUrl;
		var vm = this;
		vm.opened = false;

		vm.containerStyle = {
			display: 'none',
			opacity: 0
		};

		/**
		 * Update container style object
		 */
		vm.updateContainerStyle = function () {
			if (vm.opened) {
				vm.containerStyle = {
					display: '',
					opacity: 1
				};
			} else {
				vm.containerStyle = {
					display: 'none',
					opacity: 0
				};
			}
		};

		/**
		 * Open filters panel and initialize filters
		 */
		vm.openFiltersPanel = function () {
			vm.opened = true;
			vm.updateContainerStyle();
		};

		/**
		 * Close filters panel
		 */
		vm.closeFiltersPanel = function () {
			vm.opened = false;
			vm.updateContainerStyle();
		};

		/**
		 * Toggle filters panel
		 */
		vm.toggleFiltersPanel = function () {
			if (vm.opened)
				vm.closeFiltersPanel();
			else
				vm.openFiltersPanel();
		};

		////////////////////////////////////////////////////////
		// Initialize
		////////////////////////////////////////////////////////

		/**
		 * Run filters
		 */
		vm.initializeFilters = function (getFiltersFromQuery) {
			if (getFiltersFromQuery)
				GetFiltersData($izendaUrl.getFilterParamsString());
			else
				GetFiltersData();
		};

		/**
		 * Initialize filters controllers
		 */
		vm.initialize = function () {

			$window.useGetRenderedReportSetForFilters = false;

			// open filters event handler
			$scope.$on('izendaFiltersOpen', function () {
				vm.openFiltersPanel();
			});

			// close filters event handler
			$scope.$on('izendaFiltersClose', function () {
				vm.closeFiltersPanel();
			});

			// toggle filters event handler
			$scope.$on('izendaFiltersToggle', function () {
				vm.toggleFiltersPanel();
			});

			vm.initializeFilters(false);

			// 'refreshFilters' event handle
			$izendaEvent.handleQueuedEvent('refreshFilters', $scope, vm, function () {
				vm.initializeFilters(true);
			});

			$izendaEvent.handleQueuedEvent('dashboardRefreshEvent', $scope, vm, function (reloadDashboardLayout, updateFromSource) {
				if (reloadDashboardLayout || updateFromSource) {
					vm.initializeFilters(false);
				}
			});

			_('#updateBtnP > a').click(function (event) {
				event.preventDefault();
				CommitFiltersData(true);
				$izendaEvent.queueEvent('dashboardRefreshEvent', [false, false], false);
			});

			// watch for location change: we can set dashboard when location is changing
			$scope.$watch('izendaUrl.getReportInfo()', function (reportInfo) {
				if (!angular.isDefined(reportInfo))
					return;
				if (reportInfo.fullName === null && !reportInfo.isNew)
					return;
				vm.closeFiltersPanel();
			});

			IzLocal.LocalizePage();
		};
	}

});