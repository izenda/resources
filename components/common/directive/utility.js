/**
 * Small utility directives
 */
(function () {
  'use strict';

  // implementation
  function izendaStopPropagation() {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs, requiredParams) {
        elem.click(function(e) {
          e.stopPropagation();
        });
      }
    };
  };

  // definition
  angular
    .module('izendaCommonControls')
    .directive('izendaStopPropagation', [
      izendaStopPropagation
    ]);
})();
