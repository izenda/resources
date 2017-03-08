define(['../../common/services/services'], function () {

	/**
	 * Dashboard state service contains all event handles, which are common for dashboard controllers.
	 */
	angular
		.module('izendaDashboard')
		.factory('$izendaDashboardState', [
			'$rootScope',
			'$window',
			'$log',
		'$izendaLocale',
		function ($rootScope, $window, $log, $izendaLocale) {
			'use strict';

			/**
			 * Extract custom css rules
			 */
			function extractCustomCss(html) {
				if (!angular.isFunction(CSSParser))
					throw 'Css parser (cssParser.js) not found';
				var startMarker = '/*CustomCssStart*/';
				var endMarker = '/*CustomCssEnd*/'
				var startIndex = html.indexOf(startMarker);
				var endIndex = html.indexOf(endMarker);
				if (startIndex < 0 || endIndex < 0 || startIndex > endIndex)
					return null;
				try {
					var customCss = html.substring(startIndex + startMarker.length, endIndex);
					var parser = new CSSParser();
					var sheet = parser.parse(customCss, false, true);
					return sheet;
				} catch (e) {
					return null;
				}
			}

			/**
			 * Inject custom css
			 */
			function injectCustomCss(html, customCss) {
				var startMarker = '/*CustomCssStart*/';
				var endMarker = '/*CustomCssEnd*/'
				var startIndex = html.indexOf(startMarker);
				var endIndex = html.indexOf(endMarker);
				if (startIndex < 0 || endIndex < 0 || startIndex > endIndex)
					return null;
				var result = [
					html.substring(0, startIndex),
					startMarker,
					customCss,
					endMarker,
					html.substring(endIndex + endMarker.length)
				].join('');
				return result;
			}

			/**
			 * Change rules
			 */
			function replaceCssRules(styleSheet, selectorTextChangeFunction) {
				var cssRules = styleSheet.cssRules;
				cssRules.forEach(function (rule) {
					if (rule.type === 1) {
						var selector = rule.mSelectorText;
						rule.mSelectorText = selectorTextChangeFunction(selector);
					} else if (rule.type === 4) {
						replaceCssRules(rule, selectorTextChangeFunction);
					}
				});
			}

			/////////////////////////////////////////
			// tiles loaded:
			/////////////////////////////////////////

			var dashboardTilesLoaded = false;
			var getDashboardTilesLoaded = function () {
				return dashboardTilesLoaded;
			};
			var setDashboardTilesLoaded = function (loaded) {
				dashboardTilesLoaded = loaded;
			}

			/**
			 * Load and prepare report into container
			 * @param {string} report html data.
			 * @param {jquery dom element} container.
			 */
			var loadReportIntoContainer = function (htmlData, $container) {
				try {
					var tileId = $container.closest('.izenda-report-with-id').attr('reportid');
					// clear previous content
					$container.empty();

					// load response to container
					izenda.report.loadReportResponse(htmlData, $container);

					// replace CSS
					var $customCss = $container.find('style[id=additionalStyle]');
					if ($customCss.length > 0) {
						var csshtml = $customCss.html();
						var styleSheet = extractCustomCss(csshtml);
						if (styleSheet) {
							// replace rule selectors:
							replaceCssRules(styleSheet, function (selector) {
								var parts = selector.split(',');
								var result = '';
								parts.forEach(function (part, index) {
									if (index > 0)
										result += ', ';
									result += '.izenda-report-with-id[reportid="' + tileId + '"] ' + part.trim();
								});
								return result;
							});
						}
						var newCss = styleSheet.cssText();
						var newHtml = injectCustomCss(csshtml, newCss);
						$customCss.html(newHtml);
					}

					$container.find('[id$=_outerSpan]').css("display", "block");
					// prepare content div
					var divs$ = $container.find('div.DashPartBody, div.DashPartBodyNoScroll');
					if (divs$.length > 0) {
						divs$.css('height', 'auto');
						divs$.find('span').each(function (iSpan, span) {
							var $span = angular.element(span);
							if ($span.attr('id') && $span.attr('id').indexOf('_outerSpan') >= 0) {
								$span.css('display', 'inline');
							}
						});
						var $zerochartResults = divs$.find('.iz-zero-chart-results');
						if ($zerochartResults.length > 0) {
							$zerochartResults.closest('table').css('height', '100%');
							divs$.css('height', '100%');
						}
					}
					// init gauge
					if (angular.isDefined(AdHoc) && angular.isObject(AdHoc.Utility) && angular.isFunction(AdHoc.Utility.InitGaugeAnimations)) {
						AdHoc.Utility.InitGaugeAnimations(null, null, false);
					}
				} catch (e) {
					$container.empty();
					var failedMsg = $izendaLocale.localeText('js_FailedToLoadReport', 'Failed to load report') + ': ' + e;
					$container.append('<b>' + failedMsg + '</b>');
					$log.error(failedMsg);
				}
			};

			/////////////////////////////////////////
			// window:
			/////////////////////////////////////////

			var windowResizeOptions = {
				timeoutId: null,
				previousWidth: null
			};
			var windowWidth;

			/**
			 * Window width getter
			 */
			var getWindowWidth = function () {
				return windowWidth;
			};

			/**
			 * Turn on window resize handler
			 */
			var turnOnWindowResizeHandler = function () {
				windowResizeOptions.timeoutId = null;
				windowResizeOptions.previousWidth = angular.element($window).width();
				var resizeCompleted = function () {
					if (windowResizeOptions.previousWidth !== angular.element($window).width()) {
						windowWidth = angular.element($window).width();
						$rootScope.$applyAsync();
					}
					windowResizeOptions.previousWidth = angular.element($window).width();
				};
				angular.element($window).on('resize.dashboard', function () {
					if (windowResizeOptions.timeoutId != null) {
						clearTimeout(windowResizeOptions.timeoutId);
						windowResizeOptions.timeoutId = null;
					}
					windowResizeOptions.timeoutId = setTimeout(resizeCompleted, 200);
				});
			};

			// INITIALIZE:

			turnOnWindowResizeHandler();

			// PUBLIC API
			return {
				getDashboardTilesLoaded: getDashboardTilesLoaded,
				setDashboardTilesLoaded: setDashboardTilesLoaded,
				getWindowWidth: getWindowWidth,
				loadReportIntoContainer: loadReportIntoContainer
			};
		}]);

});
