import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';
import IzendaUrlService from 'common/query/services/url-service';

interface IIzendaSplashScreenScope extends ng.IScope {
	ngShow: any;
	text: any;
	loadingIndicatorUrl: any;
	parentSelector: any;
}

class IzendaSplashScreen implements ng.IDirective {
	restrict = 'EA';
	scope = {
		ngShow: '=',
		text: '=',
		loadingIndicatorUrl: '@',
		parentSelector: '@'
	};
	link: ($scope: IIzendaSplashScreenScope) => void;

	constructor(private readonly $timeout: ng.ITimeoutService, $izendaUrlService: IzendaUrlService) {
		IzendaSplashScreen.prototype.link = ($scope: IIzendaSplashScreenScope) => {

			var splashTimeout: ng.IPromise<any> = null;
			var template =
				`<div class="izenda-common-splashscreen hidden">
	<div class="izenda-common-splashscreen-inner text-center">
		<img class="izenda-common-splashscreen-loading"/>
		<span class="izenda-common-splashscreen-text"></span>
	</div>
</div>`;
			const $element = angular.element(template);
			let added = false;

			// loading spinner
			const defaultLoadingIndicatorUrl = angular.isString($scope.loadingIndicatorUrl)
				? $scope.loadingIndicatorUrl
				: $izendaUrlService.settings.urlRpPage + 'image=ModernImages.loading-grid.gif';
			const parentSelectorText = angular.isString($scope.parentSelector) ? $scope.parentSelector : 'body';
			let bodyOverflow: string;
			let bodyPadding: string;
			let $body: JQuery<HTMLElement>;

			const initialize = () => {
				$element.find('.izenda-common-splashscreen-loading').attr('src', defaultLoadingIndicatorUrl);
				$body = angular.element(parentSelectorText);
				if ($body.length > 0 && !added) {
					bodyOverflow = $body.css('overflow');
					bodyPadding = $body.css('padding-left');
					$body.append($element);
					added = true;
				}
			};

			const setText = () => {
				var $inner = $element.find('.izenda-common-splashscreen-text');
				$inner.text($scope.text);
			}

			const bodyHasScrollbar = (): boolean => {
				return $body.length > 0 && $body.get(0).scrollHeight > $body.height();
			};

			const showSplash = () => {
				initialize();
				if (splashTimeout !== null) {
					$timeout.cancel(splashTimeout);
					splashTimeout = null;
				}
				splashTimeout = $timeout(() => {
					$element.removeClass('hidden');
					bodyOverflow = $body.css('overflow');
					$body.css('overflow', 'hidden');
					if (bodyHasScrollbar()) {
						bodyPadding = $body.css('padding-left');
						$body.css('padding-right', '17px');
					}
				}, 1000);
			};

			const hideSplash = () => {
				initialize();
				if (splashTimeout !== null) {
					$timeout.cancel(splashTimeout);
					splashTimeout = null;
					$element.addClass('hidden');
					$body.css('overflow', bodyOverflow);
					if (bodyHasScrollbar()) {
						$body.css('padding-right', bodyPadding);
					}
				}
			};

			$scope.$watch('ngShow', newVal => {
				if (newVal)
					showSplash();
				else
					hideSplash();
			});

			$scope.$watch('text', () => setText());

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: ng.ITimeoutService, $izendaUrlService: IzendaUrlService) => new IzendaSplashScreen($timeout, $izendaUrlService);
		directive.$inject = ['$timeout', '$izendaUrlService'];
		return directive;
	}
}

izendaUiModule.directive('izendaSplashScreen', ['$timeout', '$izendaUrlService', IzendaSplashScreen.factory()]);
