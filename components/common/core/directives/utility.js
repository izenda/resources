izendaRequire.define([
	'angular',
	'../module-definition'
], function (angular) {
	
	angular.module('izenda.common.core').filter('izendaReplaceString', [function () {
		return function (text, rules) {
			if (!angular.isArray(rules))
				return text;
			var resultText = text;
			if (!resultText)
				return resultText;
			angular.element.each(rules, function () {
				if (!angular.isObject(this))
					return;
				resultText = resultText.replaceAll(this.from, this.to);
			});
			return resultText;
		};
	}
	]);

	/**
	 * Directive which runs handler on scroll end
	 */
	angular.module('izenda.common.core').directive('izendaScrollBottomAction', function () {
		return {
			restrict: 'A',
			link: function ($scope, $element, attrs) {
				var $parent = $element.parent();
				$parent.on('scroll', function () {
					var height = $element.height();
					if (height === 0)
						return;
					if (height - $parent.height() - 100 < $parent.scrollTop()) {
						$scope.$eval(attrs.scrollBottomAction);
					}
				});
			}
		};
	});

	/**
	 * Set focus on element directive.
	 * Usage: 
	 * <some-tag izenda-focus="{{expression_which_returns_bool}}" ...>
	 *   ...
	 * </some-tag>
	 */
	angular.module('izenda.common.core').directive('izendaFocus', function ($timeout) {
		return {
			scope: {
				trigger: '@izendaFocus'
			},
			link: function (scope, element) {
				scope.$watch('trigger', function (value) {
					if (value === 'true') {
						$timeout(function () {
							element[0].focus();
						});
					}
				});
			}
		};
	});

	/**
	 * Apply binding value and remove binding directive.
	 */
	angular.module('izenda.common.core').directive('bindOnce', function () {
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

	/**
	 * Click stop propagation directive.
	 */
	angular.module('izenda.common.core').directive('izendaStopPropagation', [
		function () {
			return {
				restrict: 'A',
				link: function (scope, elem) {
					elem.click(function (e) {
						e.stopPropagation();
					});
				}
			};
		}
	]);

	angular.module('izenda.common.core').directive('izendaFitAbsoluteElement', [
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

					var setTop = function () {
						var topHeight = 0;
						angular.element.each($parent.children(), function () {
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
					$timeout(function () {
						setTop();
					}, 1000);
					angular.element($window).on('resize.' + Math.random(), function () {
						setTop();
					});
				}
			};
		}
	]);

});