/**
 * Dashboard background directive. Used to set background color, image and hue rotate.
 */
(function () {
  'use strict';

  // implementation
  function izendaDashboardBackground($window) {
    'use strict';
    var _ = angular.element;
    return {
      restrict: 'A',
      scope: {
        backgroundColor: '=',
        backgroundImage: '=',
        hueRotate: '='
      },
      link: function ($scope) {
        var oldMouseX = 0;
        var oldMouseY = 0;
        var degree = 0;

        // ensure background was added
        var $background = _('body > .iz-dash-background');
        if ($background.length === 0) {
          $background = _('<div class="iz-dash-background"></div>');
          _('body').prepend($background);
        }

        // Update background
        var updateBackground = function () {
          if ($scope.backgroundColor)
            $background.css('background-color', $scope.backgroundColor);
          else
            $background.css('background-color', '');
          if ($scope.backgroundImage)
            $background.css('background-image', 'url(' + $scope.backgroundImage + ')');
          else
            $background.css('background-image', '');
        };

        // set background position
        var setBackgroundPosition = function () {
          var newBackgroundTop = 150 - _($window).scrollTop();
          if (newBackgroundTop < 0) newBackgroundTop = 0;
          $background.css({
            '-moz-background-position-y': newBackgroundTop + 'px',
            '-o-background-position-y': newBackgroundTop + 'px',
            'background-position-y': newBackgroundTop + 'px'
          });
        };

        // Hue can use rotate
        var isToggleHueRotateEnabled = function () {
          var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
          var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
          return isChrome || isSafari;
        }

        // Turn off background hue rotate
        var resetRotate = function () {
          clearTimeout($window.hueRotateTimeOut);
          $background.css({ 'filter': 'hue-rotate(' + '0' + 'deg)' });
          $background.css({ '-webkit-filter': 'hue-rotate(' + '0' + 'deg)' });
          $background.css({ '-moz-filter': 'hue-rotate(' + '0' + 'deg)' });
          $background.css({ '-o-filter': 'hue-rotate(' + '0' + 'deg)' });
          $background.css({ '-ms-filter': 'hue-rotate(' + '0' + 'deg)' });
        };

        // Run hue rotate
        var rotate = function () {
          if (!isToggleHueRotateEnabled())
            return;
          $background.css({ 'filter': 'hue-rotate(' + degree + 'deg)' });
          $background.css({ '-webkit-filter': 'hue-rotate(' + degree + 'deg)' });
          $background.css({ '-moz-filter': 'hue-rotate(' + degree + 'deg)' });
          $background.css({ '-o-filter': 'hue-rotate(' + degree + 'deg)' });
          $background.css({ '-ms-filter': 'hue-rotate(' + degree + 'deg)' });
          $window.hueRotateTimeOut = setTimeout(function () {
            var addPath;
            var dx = ($window.mouseX - oldMouseX);
            var dy = ($window.mouseY - oldMouseY);
            addPath = Math.sqrt(dx * dx + dy * dy);
            var wndPath = Math.sqrt($window.innerHeight * $window.innerHeight + $window.innerWidth * $window.innerWidth);
            addPath = addPath * 360 / wndPath;
            oldMouseX = $window.mouseX;
            oldMouseY = $window.mouseY;
            if (isNaN(addPath))
              addPath = 0;
            degree += 6 + addPath;
            while (degree > 360)
              degree -= 360;
            rotate();
          }, 100);
        }

        // run background
        setBackgroundPosition();
        _($window).scroll(function () {
          setBackgroundPosition();
        });
        updateBackground();

        // watch bindings changed
        $scope.$watch('backgroundColor', function () {
          updateBackground();
        });
        $scope.$watch('backgroundImage', function () {
          updateBackground();
        });
        $scope.$watch('hueRotate', function (newVal) {
          if (newVal) {
            rotate();
          } else {
            resetRotate();
          }
        });
      }
    };
  };

  // definition
  angular
    .module('izendaDashboard')
    .directive('izendaDashboardBackground', [
      '$window',
      izendaDashboardBackground
    ]);
})();



