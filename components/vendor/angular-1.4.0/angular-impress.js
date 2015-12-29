(function (window, angular, $) {
  'use strict';

  angular.module('impressjs', []).directive('impress', ['$compile',

  function ($compile) {
    //Helper functions
    var pfx = (function () {

      var style = document.createElement('dummy').style,
          prefixes = 'Webkit Moz O ms Khtml'.split(' '),
          memory = {};

      return function (prop) {
        if (typeof memory[prop] === 'undefined') {

          var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
              props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

          memory[prop] = null;
          for (var i in props) {
            if (style[props[i]] !== undefined) {
              memory[prop] = props[i];
              break;
            }
          }

        }

        return memory[prop];
      };

    })();

    // `translate` builds a translate transform string for given data.
    var translate = function (t) {
      return ' translate3d(' + t.x + 'px,' + t.y + 'px,' + t.z + 'px) ';
    };

    // `rotate` builds a rotate transform string for given data.
    // By default the rotations are in X Y Z order that can be reverted by passing `true`
    // as second parameter.
    var rotate = function (r, revert) {
      var rX = ' rotateX(' + r.x + 'deg) ',
          rY = ' rotateY(' + r.y + 'deg) ',
          rZ = ' rotateZ(' + r.z + 'deg) ';

      return revert ? rZ + rY + rX : rX + rY + rZ;
    };

    // `scale` builds a scale transform string for given data.
    var scale = function (s) {
      return ' scale(' + s + ') ';
    };

    // `perspective` builds a perspective transform string for given data.
    var perspective = function (p) {
      return ' perspective(' + p + 'px) ';
    };

    var toNumber = function (numeric, fallback) {
      return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

    var prefixer = function (props) {
      var key, pkey, rules = {};
      for (key in props) {
        if (props.hasOwnProperty(key)) {
          pkey = pfx(key);
          if (pkey !== null) {
            rules[pkey] = props[key];
          }
        }
      }
      return rules;
    };
    // `computeWindowScale` counts the scale factor between window size and size
    // defined for the presentation in the config.
    var computeWindowScale = function (config) {
      var hScale = window.innerHeight / config.height,
          wScale = window.innerWidth / config.width,
          scale = hScale > wScale ? wScale : hScale;

      if (config.maxScale && scale > config.maxScale) {
        scale = config.maxScale;
      }

      if (config.minScale && scale < config.minScale) {
        scale = config.minScale;
      }

      if (Math.abs(1 - scale) < 0.1)
        scale = 1;
      return scale;
    };

    var throttle = function (fn, delay) {
      var timer = null;
      return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    };

    var defaults = {
      width: 950,
      height: 950,
      maxScale: 20,
      minScale: 0,
      perspective: 1000,
      transitionDuration: 1000
    };

    return {
      restrict: 'C',
      replace: false,
      scope: false,
      link: function () {

      },
      controller: function ($scope, $element) {
        var slides = [],
            data, step, currentState = {
              scale: 1
            }, activeStep, target = {
              rotate: {
                x: 0,
                y: 0,
                z: 0
              },
              translate: {
                x: 0,
                y: 0,
                z: 0
              },
              scale: 1
            },
            stepData = [];
        $scope.currentSlide = 0;
        var duration = 500,
            zoomin = false;

        var rootStyles = {
          position: 'absolute',
          transformOrigin: 'top left',
          transition: 'transform 100ms ease-out',
          transformStyle: 'preserve-3d'
        };


        var rootData = $element[0].dataset;
        var config = {
          width: toNumber(rootData.width, defaults.width),
          height: toNumber(rootData.height, defaults.height),
          maxScale: toNumber(rootData.maxScale, defaults.maxScale),
          minScale: toNumber(rootData.minScale, defaults.minScale),
          perspective: toNumber(rootData.perspective, defaults.perspective),
          transitionDuration: toNumber(rootData.transitionDuration, defaults.transitionDuration)
        };
        var rootCSS = prefixer(rootStyles);

        $scope.$on('initImpress', function () {
          slides = $($element).find('.step');
          
          document.documentElement.style.height = '100%';

          $(document.body).css({
            overflow: 'hidden'
          });

          window.addEventListener('resize', throttle(function () {
            // force going to active step again, to trigger rescaling
            $scope.$emit('goToSlide');
          }));
          $scope.canvas = $compile('<div ng-style="canvasStyle()""></div>')($scope, function (ele) {
            $scope.canvasStyle = function () {

              ele.css(
              prefixer({
                transform: rotate(target.rotate, true) + translate(target.translate),
                transitionDuration: duration + 'ms',
                transitionDelay: '0ms',
                pointerEvents: 'auto'
              }));
              ele.css(rootCSS);
            };

            $scope.$on('updateCanvas', $scope.canvasStyle);
          });
          $scope.canvas.append($element.children('.step'));
          $element.prepend($scope.canvas);

          $scope.windowScale = computeWindowScale(config);

          $element.css(rootCSS);
          $element.css(prefixer({
            top: '50%',
            left: '50%',
            transform: perspective(config.perspective / $scope.windowScale) + scale($scope.windowScale),
            transition: 'all 0s ease-out'
          }));

          for (var i = 0; i < slides.length; i++) {
            data = slides[i].dataset;
            step = {
              translate: {
                x: toNumber(data.x),
                y: toNumber(data.y),
                z: toNumber(data.z)
              },
              rotate: {
                x: toNumber(data.rotateX),
                y: toNumber(data.rotateY),
                z: toNumber(data.rotateZ || data.rotate)
              },
              scale: toNumber(data.scale, 1),
              el: slides[i]
            };
            stepData.push(step);

            $(slides[i]).css(prefixer({
              position: 'absolute',
              transform: 'translate(-50%,-50%)' + translate(step.translate) + rotate(step.rotate) + scale(step.scale),
              transformStyle: 'preserve-3d'
            }));
          }
          $scope.goToSlide(0);

          document.addEventListener('keydown', function (e) {
            var keyCode = e.keyCode || e.which,
                arrow = {
                  left: 37,
                  up: 38,
                  right: 39,
                  down: 40
                };
            switch (keyCode) {
              case arrow.left:
                $scope.$emit('previousSlide');
                break;
              case arrow.up:
                //..
                break;
              case arrow.right:
                $scope.$emit('nextSlide');
                break;
              case arrow.down:
                //..
                break;
            }
          });
        });

        $scope.goToSlide = function (index) {
          window.scrollTo(0, 0);
          if (!index) {
            index = $scope.currentSlide;
          } else {
            $scope.currentSlide = index;
          }

          $('.step').removeClass('active');
          $(stepData[index].el).addClass('active');
          var step = stepData[index];

          target = {
            rotate: {
              x: -step.rotate.x,
              y: -step.rotate.y,
              z: -step.rotate.z
            },
            translate: {
              x: -step.translate.x,
              y: -step.translate.y,
              z: -step.translate.z
            },
            scale: 1 / step.scale
          };

          zoomin = target.scale >= currentState.scale;
          currentState = target;
          $scope.$emit('updateCanvas');

          if (step === activeStep) {
            $scope.windowScale = computeWindowScale(config);
          }
          activeStep = step;

          var targetScale = target.scale * $scope.windowScale;

          $element.css(prefixer({
            transform: perspective(config.perspective / targetScale) + scale(targetScale),
            transitionDuration: duration + 'ms',
            transitionDelay: '0ms'
          }));

        };

        $scope.$on('goToSlide', function () {
          $scope.goToSlide();
        });

        $scope.$on('nextSlide', function () {
          $scope.currentSlide += 1;
          if ($scope.currentSlide >= slides.length) {
            $scope.currentSlide = 0;
          }
          $scope.goToSlide();
        });

        $scope.$on('previousSlide', function () {
          $scope.currentSlide -= 1;
          if ($scope.currentSlide <= -1) {
            $scope.currentSlide = slides.length - 1;
          }
          $scope.goToSlide();
        });

        $scope.$on('goToId', function (e, data) {
          var target = $('#' + data.id)[0];
          for (var i = 0; i < stepData.length; i++) {
            if (stepData[i].el === target) {
              $scope.goToSlide(i);
              return;
            }
          }
        });
      }
    };
  }]);

})(window, angular, jQuery);