/**
 * Toggle button directive
 */
(function () {
  'use strict';
  
  // implementation
  function izendaToggleButton($log) {
    return {
      restrict: 'EA',
      transclude: true,
      require: ['ngModel'],
      scope: {
        trueValue: '=',
        falseValue: '='
      },
      template: '<span type="button" class="btn izenda-toggle-button-btn active" data-toggle="button">' +
                '<ng-transclude></ng-transclude>' +
                '</span>',
      link: function (scope, elem, attrs, requiredParams) {
        var ngModel = requiredParams[0];
        var btn = elem.children('.btn');
        scope.$parent.$watch(attrs.ngModel, function (newVal, oldVal) {
          if (newVal === oldVal)
            return;
          if (newVal == scope.trueValue) {
            if (btn.hasClass('active')) {
              btn.removeClass('active');
              scope.$parent.$eval(attrs.ngChange);
            }
          } else if (newVal == scope.falseValue) {
            if (!btn.hasClass('active')) {
              btn.addClass('active');
              scope.$parent.$eval(attrs.ngChange);
            }
          }
        });
        if (ngModel.$viewValue === scope.trueValue) {
          if (btn.hasClass('active')) {
            btn.removeClass('active');
          }
        } else if (ngModel.$viewValue === scope.falseValue) {
          if (!btn.hasClass('active')) {
            btn.addClass('active');
          }
        }

        elem.on('click', function () {
          ngModel.$setViewValue(!ngModel.$viewValue);
        });
      }
    };
  };

  // definition
  angular
    .module('izendaCommonControls')
    .directive('izendaToggleButton', [
      '$log',
      izendaToggleButton
    ]);
})();
