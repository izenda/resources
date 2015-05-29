(function () {
  'use strict';

  /**
   * Izenda query service which provides filter specific queries
   * this is singleton
   */
  angular
    .module('izendaFilters')
    .factory('$izendaFiltersQuery', [
      '$izendaRsQuery',
      '$log',
      function ($izendaRsQuery, $log) {
        var _ = angular.element;
        // PUBLIC API
        return {
          loadFiltersData: loadFiltersData,
          loadAllFiltersData: loadAllFiltersData,
          setFiltersData: setFiltersData,
          refreshCascadingFilters: refreshCascadingFilters
        };

        function loadFiltersData() {
          return $izendaRsQuery.query('getdashboardfiltersdata', [], {
            dataType: 'json'
          });
        }

        function loadAllFiltersData() {
          return $izendaRsQuery.query('getallfiltersdata', [], {
            dataTyoe: 'json'
          });
        }

        function setFiltersData(dashboardFilters) {
          return $izendaRsQuery.query('setfiltersdata2', [JSON.stringify(dashboardFilters)], {
            dataType: 'json'
          });
        }

        function refreshCascadingFilters(dashboardFilters) {
          return $izendaRsQuery.query('refreshcascadingfilters2', [JSON.stringify(dashboardFilters)], {
            dataType: 'json'
          });
        }

        /**
         * Prepare filter to send (filter object changes)
         */
        function convertFilterData(filter) {
          switch (filter.ControlType) {
            case 1:
            case 11:
            case 100:
            case 3:
            case 4:
            case 6:
            case 7:
            case 9:
              filter.Values = [filter.Value];
          }
        }

      }]);
})();
