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
				windowResizeOptions.previousWidth = angular.element($window).width();
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
				turnOffWindowResizeHandler: turnOffWindowResizeHandler
			};
		}]);
