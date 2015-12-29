/**
 * Bootstrap tooltip directive.
 */

(function () {
	'use strict';

	function izendaBootstrapCollapse($timeout) {
		return {
			restrict: 'A',
			scope: {
				collapsed: '='
			},
			link: function ($scope, element) {
				var $element = angular.element(element);
				$element.addClass('collapse');
				if ($scope.collapsed) {
					$element.addClass('in');
				}
				$element.collapse();
				$scope.$watch('collapsed', function () {
					$element.collapse($scope.collapsed ? 'hide' : 'show');
				});
				
			}
		}
	}

	// implementation
	function izendaBootstrapTooltip() {
		return {
			restrict: 'A',
			scope: {
				tooltipItems: '='
			},
			link: function (scope, element, attrs) {
				var $element = angular.element(element);
				scope.$watch('tooltipItems', function (newVal) {
					if (!angular.isArray(newVal)) {
						$element.attr('title', '');
						return;
					}
					var result = '';
					for (var i = 0; i < newVal.length; i++) {
						if (newVal.length > 1)
							result += i + '. ';
						result += newVal[i].message + '<br/>';
					}
					$element.attr('title', result);
					$element.tooltip('hide')
						.attr('data-original-title', newVal)
						.tooltip('fixTitle');
				});
			}
		};
	};

	// definition
	angular.module('izendaCommonControls')
		.directive('izendaBootstrapTooltip', [izendaBootstrapTooltip])
		.directive('izendaBootstrapCollapse', ['$timeout', izendaBootstrapCollapse]);
})();
