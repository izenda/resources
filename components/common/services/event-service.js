/**
 * Background image/color storage service
 */
angular
  .module('izendaQuery')
  .service('$izendaEvent', [
    '$rootScope', '$log', function ($rootScope, $log) {
      'use strict';

      var events = {};

      /**
       * Add event to queue. 
       */
      this.queueEvent = function (eventName, eventArguments, clearQueue) {
        if (!(eventName in events) || clearQueue) {
          events[eventName] = [];
        }
        var eventRecord = {
          args: eventArguments
        };
        events[eventName].push(eventRecord);
        $log.debug('event "' + eventName + '" queued');
        $rootScope.$broadcast(eventName, eventArguments);
      };

      /**
       * Retrieve event record from queue and return it's record.
       */
      this.handleQueuedEvent = function (eventName, scope, eventContext, eventHandler) {
        if (!angular.isFunction(eventHandler))
          throw 'eventHandler should be a function';
        if (!(eventName in events) || !angular.isArray(events[eventName]))
          events[eventName] = [];
        while (events[eventName].length > 0) {
          var eventRecord = events[eventName].shift();
          $log.debug('event "' + eventName + '" run from queue');
          eventHandler.apply(eventContext, eventRecord.args);
        }
        // start handling event using angular events.
        if (scope.$$listeners) {
          var eventArr = scope.$$listeners[eventName];
          if (eventArr) {
            for (var i = 0; i < eventArr.length; i++) {
              if (eventArr[i] === eventHandler) {
                eventArr.splice(i, 1);
              }
            }
          }
        };
        scope.$on(eventName, function (event, args) {
          $log.debug('event "' + eventName + '" run from $on');
          events[eventName] = [];
          eventHandler.apply(eventContext, args);
        });
      };

      /**
       * Clear all queued events (for manual $broadcast handling)
       */
      this.clearEventQueue = function (eventName) {
        events[eventName] = [];
      };
    }]);
