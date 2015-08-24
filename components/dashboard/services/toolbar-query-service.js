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

      /**
       * Send report via email
       */
      function sendReportViaEmail(type, to) {
        return $izendaRsQuery.query('sendReportEmail', [type, to], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function () {
            return 'Failed to send report to email';
          },
          params: []
        });
      }

      // PUBLIC API
      return {
        loadDashboardNavigation: loadDashboardNavigation,
        setCurrentReportSet: setCurrentReportSet,
        newDashboard: newDashboard,
        sendReportViaEmail: sendReportViaEmail
      };
    }]);