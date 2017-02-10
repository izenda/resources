define(['../services/services'], function () {

	(function () {
		'use strict';

		var template =
			'<div class="izenda-splashscreen hidden">' +
				'<div class="izenda-splashscreen-inner text-center">' +
					'<img class="izenda-splashscreen-loading"/>' +
					'<span class="izenda-splashscreen-text"></span>' +
				'</div>' +
			'</div>';

		angular.module('izenda.common.ui').directive('izendaSplashScreen', ['$timeout', '$izendaUrl', function ($timeout, $izendaUrl) {
			return {
				restrict: 'EA',
				scope: {
					ngShow: '=',
					text: '=',
					loadingIndicatorUrl: '@',
					parentSelector: '@'
				},
				link: function ($scope) {
					var splashTimeout = null;
					var $element = angular.element(template);
					var added = false;

					// loading spinner
					var defaultLoadingIndicatorUrl = angular.isString($scope.loadingIndicatorUrl)
						? $scope.loadingIndicatorUrl
						: $izendaUrl.settings.urlRsPage + '?image=ModernImages.loading-grid.gif';
					var parentSelectorText = angular.isString($scope.parentSelector) ? $scope.parentSelector : 'body';
					var bodyOverflow, bodyPadding, $body;

					var initialize = function () {
						$element.find('.izenda-splashscreen-loading').attr('src', defaultLoadingIndicatorUrl);
						$body = angular.element(parentSelectorText);
						if ($body.length > 0 && !added) {
							bodyOverflow = $body.css('overflow');
							bodyPadding = $body.css('padding-left');
							$body.append($element);
							added = true;
						}
					};

					var setText = function (text) {
						var $inner = $element.find('.izenda-splashscreen-text');
						$inner.text($scope.text);
					}

					var bodyHasScrollbar = function () {
						return $body.length > 0 && $body.get(0).scrollHeight > $body.height();
					};

					var showSplash = function () {
						initialize();
						if (splashTimeout !== null) {
							$timeout.cancel(splashTimeout);
							splashTimeout = null;
						}
						splashTimeout = $timeout(function () {
							$element.removeClass('hidden');
							bodyOverflow = $body.css('overflow');
							$body.css('overflow', 'hidden');
							if (bodyHasScrollbar()) {
								bodyPadding = $body.css('padding-left');
								$body.css('padding-right', '17px');
							}
						}, 1000);
					};

					var hideSplash = function () {
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

					$scope.$watch('ngShow', function (newVal) {
						if (newVal)
							showSplash();
						else
							hideSplash();
					});

					$scope.$watch('text', function (newText) {
						setText(newText);
					});
				}
			};
		}]);
	})();

});
