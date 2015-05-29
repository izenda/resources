angular
.module('izendaFilters')
.controller('IzendaFiltersLegacyController', [
'$scope',
'$rootScope',
'$log',
'$izendaUrl',
IzendaFiltersLegacyController]);

/**
 * Controller for old non angular filters
 */
// ReSharper disable once InconsistentNaming
function IzendaFiltersLegacyController($scope, $rootScope, $log, $izendaUrl) {
  var _ = angular.element;
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
  vm.initializeFilters = function() {
    // start legacy code
    GetFiltersData();
  };

  /**
   * Initialize filters controllers
   */
  vm.initialize = function () {

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

    /**
     * Refresh filters event
     */
    $scope.$on('refreshFilters', function () {
      vm.initializeFilters();
    });

    vm.initializeFilters();

    _('#updateBtnP > a').click(function(event) {
      event.preventDefault();
      CommitFiltersData(true);
      $rootScope.$broadcast('dashboardRefreshEvent', []);
    });

  };
}
