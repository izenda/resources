import * as angular from 'angular';
import izendaDashboardModule from 'dashboard/module-definition';

interface IIzendaToolbarLinksPanelScope extends ng.IScope {
	toolbarItems: any[];
	toolbarActiveItem: any;
	toolbarActiveItemChangeCounter: any;
	onClick: any;
	equalsFunc: any;
	getTitle: any;

	moveTo: (any) => void;
	moveRight: () => void;
	moveLeft: () => void;
	getLiClass: (any) => string;
	isButtonsVisible: () => boolean;
	refreshButtonsWidth: boolean;
	sumWidth: number;
}

/**
 * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
 */
class IzendaToolbarLinksPanel implements ng.IDirective {
	restrict = 'A';
	scope = {
		toolbarItems: '=',
		toolbarActiveItem: '=',
		toolbarActiveItemChangeCounter: '=',
		onClick: '&',
		equalsFunc: '&',
		getTitle: '&'
	};
	templateUrl = '###RS###extres=components.dashboard.directives.toolbar-links-panel.html';

	link: ($scope: IIzendaToolbarLinksPanelScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $timeout: ng.ITimeoutService, private readonly $window: ng.IWindowService) {
		IzendaToolbarLinksPanel.prototype.link = ($scope: IIzendaToolbarLinksPanelScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			const $slideScrollContainer = angular.element($element).find('.iz-dash-linkspanel-navbar-2');

			const $slideContainer = angular.element($element).find('.iz-dash-linkspanel-navbar-3');

			const getMinLeft = () => $slideScrollContainer.width() - $slideContainer.width() - 80;

			const getMaxLeft = () => 0;

			const setLeftValue = (value: number) => {
				$slideContainer.css('transform', 'translate3d(' + Math.floor(value) + 'px, 0px, 0px)');
				$slideContainer.attr('transform-left', Math.floor(value));
			}

			const respectEdges = (position: number): number => {
				let result = position;
				result = Math.max(result, getMinLeft());
				result = Math.min(result, getMaxLeft());
				return result;
			}

			// move toolbar buttons left or right
			const moveMenuItems = (leftDelta: number) => {
				const leftString = $slideContainer.attr('transform-left');
				let leftNumber = 0;
				if (angular.isString(leftString))
					leftNumber = parseInt(leftString);
				leftNumber += leftDelta;
				leftNumber = respectEdges(leftNumber);
				setLeftValue(leftNumber);
			}

			// move to item
			$scope.moveTo = (item) => {
				if (!$scope.toolbarItems)
					return;
				var itemToMove = item;
				if (!itemToMove && $scope.toolbarItems.length > 0)
					itemToMove = $scope.toolbarItems[$scope.toolbarItems.length - 1];

				if (itemToMove) {
					const $item = angular.element($element).find('#izDashToolbarItem' + itemToMove.id);
					const itemLeft = $item.position().left + $item.width() / 2;
					let leftNumber = $slideScrollContainer.width() / 2 - itemLeft;
					leftNumber = respectEdges(leftNumber);
					setLeftValue(leftNumber);
				}
			};

			// move right button
			$scope.moveRight = () => moveMenuItems(-500);

			// move left button
			$scope.moveLeft = () => moveMenuItems(500);

			// get active li class 
			$scope.getLiClass = (item): string => $scope.equalsFunc({ arg0: item, arg1: $scope.toolbarActiveItem }) ? 'active' : '';

			// check left and right buttons is needed
			$scope.isButtonsVisible = (): boolean => {
				if ($scope.refreshButtonsWidth) {
					$scope.sumWidth = 0;
					$slideContainer.find('.iz-dash-linkspanel-navbar-item').each((iNavbarItem, navbarItem) => {
						$scope.sumWidth += angular.element(navbarItem).width();
					});
					$scope.refreshButtonsWidth = false;
				}
				const width = $slideScrollContainer.width();
				return width && $scope.sumWidth > width;
			};

			// watch toolbar item collection changed
			$scope.$watchCollection('toolbarItems', () => {
				$scope.refreshButtonsWidth = true;
				$slideContainer.find('.iz-dash-linkspanel-navbar-item').on('click', e => {
					const idStr = String(angular.element(e.delegateTarget).attr('id'));
					const id = parseInt(idStr.split('izDashToolbarItem')[1]);
					const item = $scope.toolbarItems.find(toolbarItem => toolbarItem.id === id) || null;
					$scope.moveTo(item);
					$scope.onClick({ arg0: item });
					$scope.$applyAsync();
				});
			});

			// watch active item changed
			$scope.$watch('toolbarActiveItemChangeCounter', () => {
				$timeout(() => {
					$scope.moveTo($scope.toolbarActiveItem);
					$scope.$parent.$eval(attrs.toolbarActiveItem);
				}, 0);
			});

			// watch active item changed
			$scope.$watch('toolbarActiveItem', () => {
				$timeout(() => {
					$scope.moveTo($scope.toolbarActiveItem);
					$scope.$parent.$eval(attrs.toolbarActiveItem);
				}, 0);
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: ng.ITimeoutService, $window: ng.IWindowService) => new IzendaToolbarLinksPanel($timeout, $window);
		directive.$inject = ['$timeout', '$window'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaToolbarLinksPanel', ['$timeout', '$window', IzendaToolbarLinksPanel.factory()]);
