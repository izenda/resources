izendaRequire.define([
	'angular',
	'../services/services'
], function (angular) {

	/**
	 * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
	 */
	(function () {
		'use strict';

		// implementation
		function izendaToolbarLinksPanel($timeout) {
			'use strict';
			var _ = angular.element;
			return {
				restrict: 'A',
				scope: {
					toolbarItems: '=',
					toolbarActiveItem: '=',
					toolbarActiveItemChangeCounter: '=',
					onClick: '&',
					equalsFunc: '&',
					getTitle: '&'
				},
				templateUrl: '###RS###extres=components.dashboard.templates.toolbar-links-panel.html',
				link: function ($scope, elem, attrs) {
					var $slideScrollContainer = angular.element(elem).find('.iz-dash-linkspanel-navbar-2');
					var $slideContainer = angular.element(elem).find('.iz-dash-linkspanel-navbar-3');

					function getMinRight() {
						var c2Width = $slideScrollContainer.width();
						var c3Width = $slideContainer.width();
						return c2Width - c3Width - 40;
					}

					function getMaxRight() {
						return 40;
					}

					function respectEdges(position) {
						var result = position;
						var min = getMinRight();
						var max = getMaxRight();
						result = Math.max(result, min);
						result = Math.min(result, max);
						return result;
					}

					// move toolbar buttons left or right
					function moveMenuItems(rightDelta) {
						var rightString = $slideContainer.css('right');
						var rightNumber = 0;
						if (angular.isString(rightString) && rightString.indexOf('px') >= 0)
							rightNumber = parseInt(rightString.substring(0, rightString.length - 2));
						rightNumber += rightDelta;
						rightNumber = respectEdges(rightNumber);
						$slideContainer.css('right', rightNumber + 'px');
					}

					// move to item
					$scope.moveTo = function (item) {
						var itemToMove = item;
						if (!itemToMove && $scope.toolbarItems.length > 0) {
							itemToMove = $scope.toolbarItems[$scope.toolbarItems.length - 1];
						}
						if (itemToMove) {
							var $item = angular.element(elem).find('#izDashToolbarItem' + itemToMove.id);

							var itemRight = $slideContainer.width() - $item.position().left - $item.width() / 2;
							var rightNumber = $slideScrollContainer.width() / 2 - itemRight;
							rightNumber = respectEdges(rightNumber);
							$slideContainer.css('right', rightNumber + 'px');
						}
					};

					// move right button
					$scope.moveRight = function () {
						moveMenuItems(300);
					};

					// move left button
					$scope.moveLeft = function () {
						moveMenuItems(-300);
					};

					// get active li class 
					$scope.getLiClass = function (item) {
						var isActive = $scope.equalsFunc({ arg0: item, arg1: $scope.toolbarActiveItem });
						return isActive ? 'active' : '';
					};

					// check left and right buttons is needed
					$scope.isButtonsVisible = function () {
						if ($scope.refreshButtonsWidth) {
							$scope.sumWidth = 0;
							$slideContainer.find('.iz-dash-linkspanel-navbar-item').each(function () {
								$scope.sumWidth += angular.element(this).width();
							});
							$scope.refreshButtonsWidth = false;
						}
						var width = $slideScrollContainer.width();
						return width && $scope.sumWidth > width;
					};

					// watch toolbar item collection changed
					$scope.$watchCollection('toolbarItems', function () {
						$scope.refreshButtonsWidth = true;
						$slideContainer.find('.iz-dash-linkspanel-navbar-item').on('click', function () {
							var idStr = _(this).attr('id');
							var id = parseInt(idStr.split('izDashToolbarItem')[1]);
							var item = null;
							for (var i = 0; i < $scope.toolbarItems.length ; i++) {
								if ($scope.toolbarItems[i].id === id)
									item = $scope.toolbarItems[i];
							}
							$scope.moveTo(item);
							$scope.onClick({ arg0: item });
							$scope.$applyAsync();
						});
					});

					// watch active item changed
					$scope.$watch('toolbarActiveItemChangeCounter', function () {
						$timeout(function () {
							$scope.moveTo($scope.toolbarActiveItem);
							$scope.$parent.$eval(attrs.toolbarActiveItem);
						}, 0);
					});
					// watch active item changed
					$scope.$watch('toolbarActiveItem', function () {
						$timeout(function () {
							$scope.moveTo($scope.toolbarActiveItem);
							$scope.$parent.$eval(attrs.toolbarActiveItem);
						}, 0);
					});
				}
			};
		}

		// definition
		angular
			.module('izendaDashboard')
			.directive('izendaToolbarLinksPanel', [
				'$timeout',
				'$window',
				izendaToolbarLinksPanel
			]);
	})();

});



