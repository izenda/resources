/**
 * Izenda query service which provides dashboard specific queries
 * this is singleton
 */
angular
  .module('izendaQuery')
  .factory('$izendaDashboardQuery', [
    '$izendaRsQuery',
    '$log',
    function ($izendaRsQuery, $log) {
      'use strict';

      /**
       * Load dashboard tiles
       */
      function loadDashboardLayout() {
        return $izendaRsQuery.query('getReportDashboardConfig', [], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function () {
            return 'Failed to load dashboard layout';
          }
        });
      }

      /**
       * Set top for report part
       */
      function setReportPartTop(reportPartFullName, top) {
        var result = $izendaRsQuery.query('settoptoreportpartincrs', [reportPartFullName, top]);
        return result;
      }

      /**
       * Load tile report html
       */
      function loadTileReport(updateFromSourceReport, dashboardFullName, reportFullName, reportPreviousFullName,
            top, contentWidth, contentHeight, forPrint) {
        var result = $izendaRsQuery.query(updateFromSourceReport ? 'updateandgetcrsreportpartpreview' : 'getcrsreportpartpreview',
          [reportFullName, reportPreviousFullName, 1, top, contentWidth, contentHeight, forPrint],
          {
            dataType: 'text',
            headers: {
              'Content-Type': 'text/html'
            }
          },
          // custom error handler:
          {
            handler: function (name) {
              return 'Failed to load tile "' + name + '"';
            },
            params: [reportFullName]
          });
        return result;
      }

      /**
       * Save dashboard
       */
      function saveDashboard(dashboardName, dashboardConfigObject) {
        return $izendaRsQuery.query('savecrsdashboard', [JSON.stringify(dashboardConfigObject), dashboardName], {
          dataType: 'text',
          method: 'POST'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to save dashboard "' + name + '"';
          },
          params: [dashboardName]
        });
      }

      /**
       * Sync dashboard state to server
       */
      function syncDashboard(dashboardConfigObject) {
        return $izendaRsQuery.query('synccrsdashboard', [JSON.stringify(dashboardConfigObject)], {
          dataType: 'text'
        },
        // custom error handler:
        {
          handler: function () {
            return 'Failed to sync dashboard';
          },
          params: []
        });
      }

      /**
       * Load rendered report part of CRS
       */
      function loadTileReportForPrint(reportPartName) {
        return $izendaRsQuery.query('renderedreportpartcrsforprint', ['', reportPartName], {
          dataType: 'text'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to load tile "' + name + '" for print';
          },
          params: [reportPartName]
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

      // PUBLIC API
      return {
        loadDashboardLayout: loadDashboardLayout,
        loadTileReport: loadTileReport,
        loadTileReportForPrint: loadTileReportForPrint,
        saveDashboard: saveDashboard,
        syncDashboard: syncDashboard,
        setReportPartTop: setReportPartTop,
        loadDashboardForPrint: loadDashboardForPrint
      };
    }]);