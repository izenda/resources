izendaRequire.define(['angular', '../services/services'], function (angular) {

	/**
	 * Bootstrap tooltip directive.
	 */

	(function () {
		'use strict';

		function izendaBootstrapCollapse($timeout) {
			return {
				restrict: 'A',
				scope: {
					collapsed: '=',
					useDelay: '=',
					onComplete: '&'
				},
				link: function ($scope, element) {
					/**
					 * Invoke complete handler.
					 */
					function collapseCompleted(result) {
						if (angular.isFunction($scope.onComplete)) {
							$scope.onComplete({
								collapsed: result
							});
						}
					};

					var $element = angular.element(element);
					$element.addClass('collapse');
					if ($scope.collapsed) {
						$element.addClass('in');
					}

					$element.collapse();

					// add event collapse handlers
					$element.on('hidden.bs.collapse', function () {
						collapseCompleted(true);
					});
					$element.on('shown.bs.collapse', function () {
						collapseCompleted(false);
					});

					// watch for collapsed state change
					$scope.$watch('collapsed', function () {
						if ($scope.useDelay) {
							$timeout(function () {
								$element.collapse($scope.collapsed ? 'hide' : 'show');
							}, 1000);
						} else {
							$element.collapse($scope.collapsed ? 'hide' : 'show');
						}
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
		angular.module('izenda.common.ui')
			.directive('izendaBootstrapTooltip', [izendaBootstrapTooltip])
			.directive('izendaBootstrapCollapse', ['$timeout', izendaBootstrapCollapse]);
	})();

});