import * as angular from 'angular';
import izendaDashboardModule from 'dashboard/module-definition';

interface IIzendaDashboardBackgroundScope extends ng.IScope {
	backgroundColor: string;
	backgroundImage: string;
	backgroundImageRepeat: boolean;
	hueRotate: boolean;
}

/**
 * Dashboard background directive. Used to set background color, image and hue rotate.
 */
class IzendaDashboardBackground implements ng.IDirective {
	restrict = 'E';
	scope = {
		backgroundColor: '=',
		backgroundImage: '=',
		backgroundImageRepeat: '=',
		hueRotate: '='
	};

	link: ($scope: IIzendaDashboardBackgroundScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $window: ng.IWindowService) {
		IzendaDashboardBackground.prototype.link = ($scope: IIzendaDashboardBackgroundScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			const id = String(Math.random());

			let oldMouseX = 0;
			let oldMouseY = 0;
			let degree = 0;

			// ensure background was added
			let $background = angular.element('body > .iz-dash-background');
			let $dashboardsDiv = angular.element('#izendaDashboardMainContainer');
			if ($background.length === 0) {
				$background = angular.element('<div class="iz-dash-background"></div>');
				angular.element('body').prepend($background);
			}

			// Update background
			const updateBackground = () => {
				$background = angular.element('body > .iz-dash-background');
				if ($scope.backgroundImage)
					$background.css('background', `url('${$scope.backgroundImage}')`);
				else
					$background.css('background', '');
				if ($scope.backgroundImageRepeat) {
					$background.css('background-repeat', 'repeat');
					$background.css('background-size', 'initial');
				} else {
					$background.css('background-repeat', '');
					$background.css('background-size', '');
				}
				if ($scope.backgroundColor)
					$background.css('background-color', $scope.backgroundColor);
				else
					$background.css('background-color', '');
			};

			// set background position
			const setBackgroundPosition = () => {
				let newBackgroundTop = $dashboardsDiv.offset().top + 50 - angular.element($window).scrollTop();
				if (newBackgroundTop < 0) newBackgroundTop = 0;
				$background.css({
					'-moz-background-position-y': newBackgroundTop + 'px',
					'-o-background-position-y': newBackgroundTop + 'px',
					'background-position-y': newBackgroundTop + 'px'
				});
			};

			// Hue can use rotate
			const isToggleHueRotateEnabled = () => {
				const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
				const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
				const isFirefox = /Firefox/.test(navigator.userAgent);
				return isChrome || isSafari || isFirefox;
			}

			// Turn off background hue rotate
			const resetRotate = () => {
				clearTimeout($window.hueRotateTimeOut);
				$background.css({ '-webkit-filter': 'hue-rotate(' + '0' + 'deg)' });
				$background.css({ '-moz-filter': 'hue-rotate(' + '0' + 'deg)' });
				$background.css({ '-o-filter': 'hue-rotate(' + '0' + 'deg)' });
				$background.css({ '-ms-filter': 'hue-rotate(' + '0' + 'deg)' });
				$background.css({ 'filter': 'hue-rotate(' + '0' + 'deg)' });
			};

			// Run hue rotate
			const rotate = () => {
				if (!isToggleHueRotateEnabled())
					return;
				$background.css({ '-webkit-filter': 'hue-rotate(' + degree + 'deg)' });
				$background.css({ '-moz-filter': 'hue-rotate(' + degree + 'deg)' });
				$background.css({ '-o-filter': 'hue-rotate(' + degree + 'deg)' });
				$background.css({ '-ms-filter': 'hue-rotate(' + degree + 'deg)' });
				$background.css({ 'filter': 'hue-rotate(' + degree + 'deg)' });
				$window.hueRotateTimeOut = setTimeout(() => {
					let addPath: number;
					const dx = ($window.mouseX - oldMouseX);
					const dy = ($window.mouseY - oldMouseY);
					addPath = Math.sqrt(dx * dx + dy * dy);
					const wndPath = Math.sqrt($window.innerHeight * $window.innerHeight + $window.innerWidth * $window.innerWidth);
					addPath = addPath * 360 / wndPath;
					oldMouseX = $window.mouseX;
					oldMouseY = $window.mouseY;
					if (isNaN(addPath))
						addPath = 0;
					degree += 6 + addPath;
					while (degree > 360)
						degree -= 360;
					rotate();
				}, 100);
			}

			// run background
			setBackgroundPosition();

			angular.element($window).on('scroll.' + id, () => setBackgroundPosition());

			updateBackground();

			// watch bindings changed
			$scope.$watch('backgroundColor', () => updateBackground());
			$scope.$watch('backgroundImage', () => updateBackground());
			$scope.$watch('backgroundImageRepeat', () => updateBackground());
			$scope.$watch('hueRotate', newVal => {
				if (newVal) rotate();
				else resetRotate();
			});

			// destruction method
			$element.on('$destroy', () => {
				angular.element($window).off('scroll.' + id);
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($window: ng.IWindowService) => new IzendaDashboardBackground($window);
		directive.$inject = ['$window'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaDashboardBackground', ['$window', IzendaDashboardBackground.factory()]);
