angular
  .module('izendaFilters')
  .controller('IzendaFiltersCustomController', [
    '$scope',
    '$rootScope',
    '$log',
    '$izendaUrl',
    '$izendaFiltersQuery',
    '$injector',
    IzendaFiltersCustomController]);

/**
 * Here is sample of IzendaFiltersController customization;
 */
function IzendaFiltersCustomController($scope, $rootScope, $log, $izendaUrl, $izendaFiltersQuery, $injector) {
  'use strict';
  var vm = this;
  
  // make inheritance from base class:
  $injector.invoke(IzendaFiltersController, this, {
    $scope: $scope,
    $rootScope: $rootScope,
    $izendaUrl: $izendaUrl,
    $izendaFiltersQuery: $izendaFiltersQuery
  });

  /**
   * Load and initialize dashboard filters override
   */
  vm.initializeDashboardFilters = function () {
    // here is way of running superclass method:
    // TODO: need to think how to call superclass method without instantiate it.
    //(new IzendaFiltersController($scope, $izendaUrl, $izendaFiltersQuery)).initializeDashboardFilters.apply(vm, []);
    vm.filtersData.push({
      OperatorFriendlyName: '1111',
      Description: '222'
    });
    $scope.$evalAsync();
  };
}