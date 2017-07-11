(function () {
  'use strict';

  /**
   * Izenda query service which provides report viewer specific queries
   * this is singleton
   */
  angular
    .module('izendaReportViewer')
    .factory('$izendaReportViewerQuery', [
      '$izendaRsQuery',
      '$log',
      function ($izendaRsQuery, $log) {
        var _ = angular.element;

        // PUBLIC API
        return {
          getCrsHtml: getCrsHtml
        };

        /**
         * Get rendered current report set
         */
        function getCrsHtml() {
          throw 'Not implemented yet.';
          return $izendaRsQuery.query('getdashboardfiltersdata', [], {
            dataType: 'json'
          });
        }

      }]);
})();
