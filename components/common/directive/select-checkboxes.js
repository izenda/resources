/**
 * Select checkboxes directive. Usage:
 * <izenda-select-checkboxes labels="..." values="..." ng-model="..." ng-disabled="..."></izenda-select-checkboxes>
 */
(function () {
  'use strict';
  
  // implementation
  function izendaSelectCheckboxes($log) {
    return {
      restrict: 'AE',
      scope: {
        labels: '=',
        values: '=',
        ngModel: '=',
        ngDisabled: '='
      },
      template: '<div ng-repeat="(li, l) in labels">' +
                '<label class="izenda-select-checkboxes-label">' +
                '<input type="checkbox" ng-click="clickCheckbox(values[li])" ng-checked="isChecked(values[li])"' +
                  'ng-disabled="ngDisabled"/>' +
                '<span ng-bind="l"></span>' +
                '</label>' +
                '</div>',
      link: function ($scope, elem, attrs) {
        
        $scope.$parent.$watch(attrs.ngDisabled, function (newValue, oldValue) {
          if (oldValue !== newValue) {
            $scope.$parent.$eval(attrs.ngChange);
          }
        });
        $scope.$parent.$watchCollection(attrs.ngModel, function (newVal, oldVal) {
          if (oldVal.length !== newVal.length) {
            $scope.$parent.$eval(attrs.ngChange);
          }
        });

        $scope.isChecked = function (value) {
          var viewValue = $scope.ngModel;
          return viewValue.indexOf(value) >= 0;
        };
        $scope.clickCheckbox = function (value) {
          var viewValue = $scope.ngModel;
          if (viewValue.indexOf(value) >= 0)
            viewValue.splice(viewValue.indexOf(value), 1);
          else
            viewValue.push(value);
        };
      }
    };
  }

  // definition
  angular
    .module('izendaCommonControls')
    .directive('izendaSelectCheckboxes', [
      '$log',
      izendaSelectCheckboxes
    ]);
})();
