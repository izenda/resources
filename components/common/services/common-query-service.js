/**
 * Izenda query service which provides dashboard specific queries
 * this is singleton
 */
angular
  .module('izendaQuery')
  .factory('$izendaCommonQuery', [
    '$log',
    '$izendaRsQuery',
    function ($log, $izendaRsQuery) {
      'use strict';

      /**
       * Used for refresh session timeout
       */
      function ping() {
        return $izendaRsQuery.query('ping', [], {
          dataType: 'text'
        });
      };

      /**
       * Check report set is exist.
       * returns promise with 'true' value if exists
       */
      function checkReportSetExist(reportSetFullName) {
        if (!angular.isString(reportSetFullName) || reportSetFullName.trim() === '')
          throw new Error('reportSetFullName should be non empty string');
        return $izendaRsQuery.query('checkreportsetexists', [reportSetFullName], {
          dataType: 'text'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to check dashboard "' + name + '" exist';
          },
          params: [reportSetFullName]
        });
      }

      /**
       * Set AdHocContext current report set
       */
      function setCrs(reportSetFullName) {
        return $izendaRsQuery.query('setcurrentreportset', [reportSetFullName], {
          dataType: 'text'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to set current report set "' + name + '"';
          },
          params: [reportSetFullName]
        });
      }

      /**
       * Get report list by category
       */
      function getReportSetCategory(category) {
        var categoryStr = angular.isDefined(category)
          ? (category.toLowerCase() === 'uncategorized' ? '' : category)
          : '';
        return $izendaRsQuery.query('reportlistdatalite', [categoryStr], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to get reports for category "' + name + '"';
          },
          params: [category]
        });
      }

      /**
       * Get report parts
       */
      function getReportParts(reportFullName) {
        return $izendaRsQuery.query('reportdata', [reportFullName], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to get report parts for report "' + name + '"';
          },
          params: [reportFullName]
        });
      }

      // PUBLIC API
      return {
        checkReportSetExist: checkReportSetExist,
        getReportSetCategory: getReportSetCategory,
        getReportParts: getReportParts,
        setCrs: setCrs,
        ping: ping
      };
    }]);