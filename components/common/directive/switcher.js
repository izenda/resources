/**
 * Switcher directive
 */
(function () {
  'use strict';

  // template
  var izendaSwitcherTemplate =
    '<span ng-show="label != null && label != \'\'" class="izenda-switcher-label">{{label}}</span>' +
    '<span class="izenda-switcher" title="{{tooltip}}">' +
      '<span class="izenda-switcher-text-off">O</span>' +
      '<span class="izenda-switcher-item"></span>' +
      '<span class="izenda-switcher-text-on">I</span>' +
    '</span>';

  // implementation
  function izendaSwitcher() {
    return {
      restrict: 'A',
      scope: {
        tooltip: '=',
        label: '=',
        ngModel: '='
      },
      template: izendaSwitcherTemplate,
      link: function ($scope, elem, attrs) {
        elem.click(function(e) {
          e.stopPropagation();
          $scope.ngModel = !$scope.ngModel;
          $scope.$parent.$apply();
        });
        var $switcher = elem.find('.izenda-switcher');
        $scope.$watch('ngModel', function (newVal) {
          if (newVal) {
            $switcher.addClass('on');
          } else {
            $switcher.removeClass('on');
          }
        });
      }
    };
  };

  // definition
  angular
    .module('izendaCommonControls')
    .directive('izendaSwitcher', [
      izendaSwitcher
    ]);
})();