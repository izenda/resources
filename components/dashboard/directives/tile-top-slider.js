(function() {
  'use strict';

  /**
 * Slider component
 */
  function izendaTileTopSlider() {
    return {
      restrict: 'A',
      require: ['ngModel'],
      scope: {
        ngModel: '=',
        onChangeEnd: '&'
      },
      template: '<input></input>',
      link: function ($scope, elem, attrs) {
        var $input = elem.children('input');
        // set ng-model value
        var setModelValue = function (value) {
          $scope.ngModel = parseInt(value);
          $scope.$parent.$apply();
        };
        // set value to slider widget
        var setSliderValue = function (value) {
          $input.data("ionRangeSlider").update({
            from: value
          });
        };

        // initialize slider
        $input.ionRangeSlider({
          hide_min_max: true,
          hide_from_to: true,
          from: $scope.ngModel,
          min: 1,
          max: 101,
          onChange: function (data) {
            var value = data.from;
            setModelValue(value);
          },
          onFinish: function (data) {
            var value = data.from;
            setModelValue(value);
            $scope.onChangeEnd({});
            $scope.$parent.$apply();
          }
        });
        setSliderValue($scope.ngModel);
      }
    };
  }

  // definition
  angular
    .module('izendaDashboard')
    .directive('izendaTileTopSlider', [
      izendaTileTopSlider
    ]);

})();
