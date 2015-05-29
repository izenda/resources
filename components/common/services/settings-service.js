angular
  .module('izendaQuery')
  .factory('$izendaSettings', [
    '$log',
    '$q',
    '$izendaRsQuery',
    function ($log, $q, $izendaRsQuery) {
      'use strict';
      var printModeCached = null;
      
      /**
       * Get print mode setting
       */
      var getPrintModeSetting = function (settingName) {
        return $izendaRsQuery.query('getprintmodesetting', [settingName], {
          dataType: 'json'
        },
        // custom error handler:
        {
          handler: function (name) {
            return 'Failed to get AdHocSetting "' + name + '"';
          },
          params: [settingName]
        });
      }

      /**
       * Get AdHocSettings.PrintMode value (value will be cached)
       */
      var getPrintMode = function () {
        var defer = $q.defer();
        if (printModeCached === null) {
          // initialize print mode
          getPrintModeSetting('PrintMode').then(function (data) {
            var printModeValue = data;
            printModeCached = printModeValue;
            $log.debug('Fetched AdHocSettings.PrintMode: ' + printModeCached);
            defer.resolve(printModeValue);
          });
        } else {
          // get cached value
          $log.debug('Got from cache AdHocSettings.PrintMode: ' + printModeCached);
          defer.resolve(printModeCached);
        }
        return defer.promise;
      };

      return {
        getPrintMode: getPrintMode
      }
  }
  ]);
