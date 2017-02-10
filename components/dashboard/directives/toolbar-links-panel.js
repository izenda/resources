define(['../../common/services/services', '../services/services'], function () {

	/**
	 * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
	 */
	(function () {
		'use strict';

		// implementation
		function izendaToolbarLinksPanel($timeout, $izendaUrl) {
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
				templateUrl: $izendaUrl.settings.urlResources + '/components/dashboard/templates/toolbar-links-panel.html',
				link: function ($scope, elem, attrs) {
					var $slideContainer = _(elem).find('.iz-dash-linkspanel-navbar-3');
					var slideContainerWidth = $slideContainer.width();

					// calculate max right of menu items
					var getMaxRight = function () {
						var maxRight = 0;
						$slideContainer.find('.iz-dash-linkspanel-navbar-item').each(function () {
							var right = angular.element(this).position().left + _(this).width();
							if (maxRight < right)
								maxRight = right;
						});
						return maxRight;
					};

					// move toolbar buttons left or right
					var moveMenuItems = function (leftDelta) {
						var left = $slideContainer.css('left');
						if (angular.isString(left) && left.indexOf('px') >= 0)
							left = parseInt(left.substring(0, left.length - 2));
						left += leftDelta;
						var maxRight = getMaxRight();
						var width = slideContainerWidth;
						if (left < width - maxRight)
							left = width - maxRight;
						if (left > 0)
							left = 0;
						$slideContainer.css('left', left + 'px');
					}

					// move to item
					$scope.moveTo = function (item) {
						var itemToMove = item;
						if (!itemToMove && $scope.toolbarItems.length > 0) {
							itemToMove = $scope.toolbarItems[$scope.toolbarItems.length - 1];
						}
						if (itemToMove) {
							var $item = angular.element(elem).find('#izDashToolbarItem' + itemToMove.id);
							var maxRight = getMaxRight();
							var width = slideContainerWidth;
							var left = $item.position().left + $item.width() / 2;
							left = -left + width / 2;
							if (left > 0)
								left = 0;
							if (left < width - maxRight)
								left = width - maxRight;
							$slideContainer.css('left', left + 'px');
						}
					};

					// move right button
					$scope.moveRight = function () {
						moveMenuItems(-300);
					};

					// move left button
					$scope.moveLeft = function () {
						moveMenuItems(300);
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
						return $scope.sumWidth > slideContainerWidth;
					};

					// watch toolbar item collection changed
					$scope.$watchCollection('toolbarItems', function () {
						$scope.refreshButtonsWidth = true;
						$slideContainer.find('.iz-dash-linkspanel-navbar-item').on('mouseup', function () {
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
				'$izendaUrl',
				izendaToolbarLinksPanel
			]);
	})();

});



