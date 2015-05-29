/**
 * Date picker directive. Usage:
 * <izenda-date-picker ng-model="..." is-disabled="..." value-format="..."></izenda-date-picker>
 */
(function () {
  'use strict';
  
  // implementation
  function izendaDatePicker($log) {
    return {
      restrict: 'EA',
      require: ['ngModel'],
      scope: {
        ngModel: '=',
        isDisabled: '=',
        valueFormat: '='
      },
      template: '<input type="text" class="form-control" />' +
        '<span class="input-group-addon"><span class="glyphicon-calendar glyphicon"></span></span>',
      link: function ($scope, elem, attrs) {
        var input = elem.children('input');
        var btn = elem.children('.input-group-addon');

        // init calendar
        var datePickerOptions = {};
        if ($scope.valueFormat) {
          datePickerOptions.dateFormat = $scope.valueFormat;
        }
        $scope.calendar = input.datepicker(datePickerOptions);

        // check for disabled:
        $scope.$parent.$watch(attrs.ngDisabled, function (newVal) {
          input.prop('disabled', newVal);
          if (newVal) {
            btn.off('click');
            input.datepicker('hide');
          } else {
            btn.on('click', function () {
              elem.children('input').focus();
            });
          }
        });
        $scope.$parent.$watch(attrs.ngModel, function(newVal, oldVal) {
          if (newVal !== oldVal) {
            input.val(newVal);
          }
        });
        input.prop('disabled', attrs.ngDisabled);
        input.val($scope.ngModel);

        // handlers
        btn.on('click', function () {
          elem.children('input').focus();
        });
        elem.children('input').on('change', function () {
          $scope.ngModel = angular.element(this).val();
          $scope.$parent.$apply();
        });
      }
    };
  };

  // definition
  angular
    .module('izendaCommonControls')
    .directive('izendaDatePicker', [
      '$log',
      izendaDatePicker
    ]);
})();
