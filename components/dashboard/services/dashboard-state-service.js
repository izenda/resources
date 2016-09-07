/**
 * Dashboard state service contains all event handles, which are common for dashboard controllers.
 */
angular
	.module('izendaDashboard')
	.factory('$izendaDashboardState', [
		'$rootScope',
		'$window',
		'$log',
		function ($rootScope, $window, $log) {
			'use strict';

			/////////////////////////////////////////
			// tiles loaded:
			/////////////////////////////////////////

			var dashboardTilesLoaded = false;
			var getDashboardTilesLoaded = function() {
				return dashboardTilesLoaded;
			};
			var setDashboardTilesLoaded = function(loaded) {
				dashboardTilesLoaded = loaded;
			}

			/**
			 * Load and prepare report into container
			 * @param {string} report html data.
			 * @param {jquery dom element} container.
			 */
			var loadReportIntoContainer = function (htmlData, $container) {
				try {
					// clear previous content
					$container.empty();

					// load response to container
					if (angular.isDefined(ReportScripting))
						ReportScripting.loadReportResponse(htmlData, $container);
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
				timeout: false,
				rtime: null,
				previousWidth: null
			};
			var isWindowChangingNow;
			var windowWidth;

			/**
			 * Window width getter
			 */
			var getWindowWidth = function() {
				return windowWidth;
			};

			/**
			 * Turn on window resize handler
			 */
			var turnOnWindowResizeHandler = function () {
				windowResizeOptions.id = null;
				//windowResizeOptions.previousWidth = angular.element($window).width();
				isWindowChangingNow = true;
				function doneResizing() {
					if (windowResizeOptions.previousWidth !== angular.element($window).width()) {
						windowResizeOptions.timeout = false;
						isWindowChangingNow = false;
						windowWidth = angular.element($window).width();
						$rootScope.$applyAsync();
					}
					windowResizeOptions.previousWidth = angular.element($window).width();
				}
				angular.element($window).on('resize.dashboard', function () {
					if (windowResizeOptions.id != null)
						clearTimeout(windowResizeOptions.id);
					windowResizeOptions.id = setTimeout(doneResizing, 200);
				});
			};
			
			/**
			 * Remove window resize handler.
			 */
			var turnOffWindowResizeHandler = function() {
				angular.element($window).off('resize.dashboard');
			};
			
			// INITIALIZE:

			turnOnWindowResizeHandler();

			// PUBLIC API
			return {
				getDashboardTilesLoaded: getDashboardTilesLoaded,
				setDashboardTilesLoaded: setDashboardTilesLoaded,
				getWindowWidth: getWindowWidth,
				turnOnWindowResizeHandler: turnOnWindowResizeHandler,
				turnOffWindowResizeHandler: turnOffWindowResizeHandler,
				loadReportIntoContainer: loadReportIntoContainer
			};
		}]);
