/**
 * Izenda query service which provides toolbar specific queries
 * this is singleton
 */
angular
  .module('izendaQuery')
  .factory('$izendaDashboardToolbarQuery', [
    '$izendaRsQuery',
    '$log',
    function ($izendaRsQuery, $log) {
      'use strict';

      function setCurrentReportSet(dashboardFullName) {
        return $izendaRsQuery.query('setcurrentreportset', [dashboardFullName], {
          dataType: 'text'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to set dashboard "' + name + '"';
          },
          params: [dashboardFullName]
        });
      }

      function loadDashboardNavigation() {
        return $izendaRsQuery.query('getdashboardcategories', [], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function () {
            return 'Failed to get dashboard categories';
          }
        });
      }

      /**
       * Load rendered for print dashboard
       */
      function loadDashboardForPrint() {
        return $izendaRsQuery.rsQuery({
          'p': 'htmlreport',
          'printmanual': '1'
        }, {
          dataType: 'text'
        },
        // custom error handler:
        {
          handler: function () {
            return 'Failed to load dashboard for print';
          },
          params: []
        });
      }

      /**
       * Create new dashboard report set and set it as CurrentReportSet
       */
      function newDashboard() {
        return $izendaRsQuery.query('newcrsdashboard', [], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function () {
            return 'Failed to create new dashboard';
          },
          params: []
        });
      }

      // PUBLIC API
      return {
        loadDashboardNavigation: loadDashboardNavigation,
        setCurrentReportSet: setCurrentReportSet,
        newDashboard: newDashboard,
        loadDashboardForPrint: loadDashboardForPrint
      };
    }]);