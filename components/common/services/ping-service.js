angular
  .module('izendaQuery')
  .factory('$izendaPing', [
    '$timeout',
    '$izendaCommonQuery',
    function ($timeout, $izendaCommonQuery) {
      'use strict';
      var started = false;
      var timeout = -1;

      var ping = function() {
        if (started) {
          $timeout(function() {
            $izendaCommonQuery.ping().then(function(data) {
              timeout = Math.round((60 * data * 2000) / 3);
              ping();
            });
          }, timeout >= 0 ? timeout : 0);
        }
      }

      var startPing = function () {
        started = true;
        ping();
      };

      var stopPing = function () {
        started = false;
      };

      return {
        startPing: startPing,
        stopPing: stopPing
      };
    }]);