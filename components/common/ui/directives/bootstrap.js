izendaRequire.define([
	'angular',
	'../module-definition'
], function (angular) {

	'use strict';

	// definition
	angular.module('izenda.common.ui')
		.directive('izendaBootstrapCollapse', ['$timeout', izendaBootstrapCollapse])
		.directive('izendaBootstrapTooltip', [izendaBootstrapTooltip])
		.directive('izendaBootstrapDropdown', ['$window', izendaBootstrapDropdown]);

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
	}

	function izendaBootstrapDropdown($window) {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				opened: '=',
				attachToElement: '@',
				width: '@',
				height: '@',
				onOpen: '&',
				onClose: '&'
			},
			template:
				'<div class="dropdown">' +
					'<div class="dropdown-menu dropdown-strong-shadow dropdown-no-close-on-click" izenda-stop-propagation>' +
					'<div class="dropdown-triangle"></div>' +
					'<div ng-style="{\'width\': width, \'height\': height}">' +
					'<div ng-transclude></div>' +
					'</div>' +
					'</div>' +
					'</div>',
			link: function ($scope, $element, attrs) {
				var id = ('' + Math.random()).substring(2);
				var scrollEventId = 'scroll.izendaBootstrapDropdown' + id;
				var resizeEventId = 'resize.izendaBootstrapDropdown' + id;
				var keyEventId = 'keyup.izendaBootstrapDropdown' + id;
				var $dropdown = $element.find('.dropdown');
				var $menu = $element.find('.dropdown-menu');

				$dropdown.find('.dropdown-triangle').on('click', function () {
					close();
				});

				angular.element($window).on(scrollEventId, function () {
					close();
				});

				angular.element($window).on(resizeEventId, function () {
					close();
				});

				angular.element($window).on(keyEventId, function (event) {
					// esc button handler
					if (event.keyCode == 27 && $scope.opened) {
						close();
					}
				});

				$scope.$on('$destroy', function () {
					angular.element($window).off(scrollEventId);
					angular.element($window).off(resizeEventId);
					angular.element($window).off(keyEventId);
				});

				$scope.$watch('opened', function (newVal) {
					if (newVal && !$dropdown.hasClass('open'))
						open();
					if (!newVal && $dropdown.hasClass('open'))
						close();
				});

				function open() {
					var $attachToElement = angular.element($scope.attachToElement);
					$dropdown.addClass('open');
					$menu.css('position', 'fixed');
					var top = ($attachToElement.offset().top + $attachToElement.outerHeight(true) - angular.element(window).scrollTop());
					var left = $attachToElement.offset().left;
					$menu.css({
						'top': top + 'px',
						'left': left + 'px'
					});
					$menu.children('.dropdown-triangle').css('left', 0);
					$menu.data('open', true);
					var windowWidth = angular.element($window).width();
					if ($menu.offset().left + $menu.width() > windowWidth) {
						var delta = $menu.offset().left + $menu.width() - windowWidth + 10;
						left -= delta;
						$menu.css('left', left);
						$menu.children('.dropdown-triangle').css('left', delta + 'px');
					}
					if (angular.isFunction($scope.onOpen))
						$scope.onOpen({});
				}

				function close() {
					$dropdown.removeClass('open');
					$menu.data('open', false);
					$scope.opened = false;
					if (angular.isFunction($scope.onClose))
						$scope.onClose({});
					$scope.$applyAsync();
				}
			}
		};
	}
});