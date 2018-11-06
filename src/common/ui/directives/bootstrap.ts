import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaBootstrapCollapseScope extends ng.IScope {
	collapsed: boolean;
	useDelay: boolean;
	onComplete: (any) => void;
}

/**
 * Collapsible container directive.
 */
class IzendaBootstrapCollapse implements ng.IDirective {
	restrict = 'A';
	scope = {
		collapsed: '=',
		useDelay: '=',
		onComplete: '&'
	};

	link: ($scope: IIzendaBootstrapCollapseScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $timeout: ng.ITimeoutService) {
		IzendaBootstrapCollapse.prototype.link = ($scope: IIzendaBootstrapCollapseScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			/**
			 * Invoke complete handler.
			 */
			const collapseCompleted = result => {
				if (angular.isFunction($scope.onComplete)) {
					$scope.onComplete({
						collapsed: result
					});
				}
			};

			$element.addClass('collapse');
			if ($scope.collapsed)
				$element.addClass('in');
			$element['collapse'](); // call bootstrap jquery_element.collapse() method.

			// add event collapse handlers
			$element.on('hidden.bs.collapse', () => collapseCompleted(true));
			$element.on('shown.bs.collapse', () => collapseCompleted(false));

			// watch for collapsed state change
			$scope.$watch('collapsed', () => {
				if ($scope.useDelay)
					$timeout(() => $element['collapse']($scope.collapsed ? 'hide' : 'show'), 1000);
				else
					$element['collapse']($scope.collapsed ? 'hide' : 'show');
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: ng.ITimeoutService) => new IzendaBootstrapCollapse($timeout);
		directive.$inject = ['$timeout'];
		return directive;
	}
}
izendaUiModule.directive('izendaBootstrapCollapse', ['$timeout', IzendaBootstrapCollapse.factory()]);


interface IIzendaBootstrapTooltipScope extends ng.IScope {
	tooltipItems: any;
}

/**
 * Tooltip directive
 */
class IzendaBootstrapTooltip implements ng.IDirective {
	restrict = 'A';
	scope = {
		tooltipItems: '='
	};
	link: ($scope: IIzendaBootstrapTooltipScope, $element: ng.IAugmentedJQuery) => void;

	constructor() {
		IzendaBootstrapTooltip.prototype.link = ($scope: IIzendaBootstrapTooltipScope, $element: ng.IAugmentedJQuery) => {
			$scope.$watch('tooltipItems', (newVal: any[]) => {
				if (!angular.isArray(newVal)) {
					$element.attr('title', '');
					return;
				}
				var result = '';
				for (let i = 0; i < newVal.length; i++) {
					if (newVal.length > 1)
						result += i + '. ';
					result += newVal[i].message + '<br/>';
				}
				$element.attr('title', result);
				$element['tooltip']('hide')
					.attr('data-original-title', newVal)
					.tooltip('update');
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaBootstrapTooltip();
	}
}
izendaUiModule.directive('izendaBootstrapTooltip', [IzendaBootstrapTooltip.factory()]);


interface IIzendaBootstrapDropdownScope extends ng.IScope {
	opened: boolean;
	attachToElement: string;
	width: number;
	height: number;
	onOpen: (...any) => void;
	onClose: (...any) => void;
}

/**
 * Bootstrap dropdown directive
 */
class IzendaBootstrapDropdown implements ng.IDirective {
	restrict = 'E';
	transclude = true;
	scope = {
		opened: '=',
		attachToElement: '@',
		width: '@',
		height: '@',
		onOpen: '&',
		onClose: '&'
	};
	template =
		`<div class="dropdown">
	<div class="dropdown-menu izenda-common-dropdown-strong-shadow dropdown-no-close-on-click"
		ng-click="$event.stopPropagation();">
		<div class="izenda-common-dropdown-triangle"></div>
		<div ng-style="{\'width\': width, \'height\': height}">
			<div ng-transclude></div>
		</div>
	</div>
</div>`;
	link: ($scope: IIzendaBootstrapDropdownScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $window: ng.IWindowService) {
		IzendaBootstrapDropdown.prototype.link = ($scope: IIzendaBootstrapDropdownScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
			const id = ('' + Math.random()).substring(2);
			const scrollEventId = 'scroll.izendaBootstrapDropdown' + id;
			const resizeEventId = 'resize.izendaBootstrapDropdown' + id;
			const keyEventId = 'keyup.izendaBootstrapDropdown' + id;

			const $dropdown = $element.find('.dropdown');
			const $menu = $element.find('.dropdown-menu');

			$dropdown.find('.izenda-common-dropdown-triangle').on('click', () => close());
			angular.element($window).on(scrollEventId, () => close());
			angular.element($window).on(resizeEventId, () => close());
			angular.element($window).on(keyEventId, event => {
				// esc button handler
				if (event.keyCode == 27 && $scope.opened) {
					close();
				}
			});

			$scope.$watch('opened', (newVal: boolean) => {
				if (newVal && !$dropdown.hasClass('open'))
					open();
				if (!newVal && $dropdown.hasClass('open'))
					close();
			});

			function open() {
				const $attachToElement = angular.element($scope.attachToElement);
				const $tile = $attachToElement.closest('.iz-dash-tile');
				$dropdown.addClass('open');
				$menu.css('position', 'absolute');
				$menu.css('z-index', 9999);
				let left = $tile.width() - $menu.width() - 16;
				let delta = 0;
				if (left < 0) {
					delta = -left;
					left = 0;
				}
				const top = 44;
				$menu.children('.izenda-common-dropdown-triangle').css('left', $menu.width() - delta - 58);
				$menu.css({
					left: left + 'px',
					top: top + 'px'
				});
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

			// destruction method
			$element.on('$destroy', () => {
				angular.element($window).off(scrollEventId);
				angular.element($window).off(resizeEventId);
				angular.element($window).off(keyEventId);
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($window: ng.IWindowService) => new IzendaBootstrapDropdown($window);
		directive.$inject = ['$window'];
		return directive;
	}
}

izendaUiModule.directive('izendaBootstrapDropdown', ['$window', IzendaBootstrapDropdown.factory()]);
