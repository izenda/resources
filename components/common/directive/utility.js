/**
 * Small utility directives
 */

angular.module('izendaQuery').directive('bindOnce', function () {
	return {
		scope: true,
		link: function ($scope, $element) {
			setTimeout(function () {

				$scope.$destroy();
				$element.removeClass('ng-binding ng-scope');

				var hasAttr = function (element, attrName) {
					var attr = angular.element(element).attr(attrName);
					return typeof attr !== typeof undefined && attr !== false;
				};

				if (hasAttr($element, 'ng-bind'))
					$element.removeAttr('ng-bind');
				if (hasAttr($element, 'bind-once'))
					$element.removeAttr('bind-once');
			}, 0);
		}
	}
});

angular.module('izendaCommonControls').directive('izendaStopPropagation', [
	function() {
		return {
			restrict: 'A',
			link: function (scope, elem) {
				elem.click(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
]);

angular.module('izendaCommonControls').directive('izendaFitAbsoluteElement', [
	'$window', '$timeout',
	function ($window, $timeout) {
		return {
			restrict: 'A',
			link: function (scope, elem) {
				var deltaTop = elem.attr('delta-top');
				if (angular.isString(deltaTop))
					deltaTop = parseInt(deltaTop);
				else
					deltaTop = 0;

				var $parent = angular.element(elem.parent());

				var setTop = function() {
					var topHeight = 0;
					angular.element.each($parent.children(), function() {
						var $child = angular.element(this);
						if ($child.data('izenda-fit-absolute-element') === 'top') {
							topHeight += $child.height();
						}
					});
					if (topHeight > 0) {
						elem.css('top', topHeight + deltaTop + 'px');
					}
				};

				setTop();
				$timeout(function() {
					setTop();
				}, 1000);
				angular.element($window).on('resize.' + Math.random(), function() {
					setTop();
				});
			}
		};
	}
]);
