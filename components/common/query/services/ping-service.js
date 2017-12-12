izendaRequire.define([
	'angular',
	'../module-definition',
	'./common-query-service'
], function (angular) {

	/**
	 * Service which used to keep http session alive.
	 */
	angular.module('izenda.common.query').factory('$izendaPing', [
		'$timeout',
		'$izendaCommonQuery',
		function ($timeout, $izendaCommonQuery) {
			'use strict';

			var minute = 60 * 1000;
			var defaultTimeout = 15 * minute;  // default timeout - 15 minutes.
			var timeout = -1;
			var pingTimer = null;

			/**
			 * Stop ping queries
			 */
			var stopPing = function () {
				if (pingTimer !== null) {
					$timeout.cancel(pingTimer);
					pingTimer = null;
				}
			};

			/**
			 * Make ping iteration and create timeout for next iteration.
			 */
			var ping = function () {
				// cancel previous timer:
				stopPing();

				// hint: start immediately if timeout variable wasn't set.
				pingTimer = $timeout(function () {
					$izendaCommonQuery.ping().then(function (data) {
						// set timeout
						timeout = (data > 0)
							? Math.round(data * 0.75 * minute)
							: defaultTimeout;
						ping();
					});
				}, timeout >= 0 ? timeout : 0);
			};

			/**
			 * Start ping queries
			 */
			var startPing = function () {
				ping();
			};

			return {
				startPing: startPing,
				stopPing: stopPing
			};
		}]);

});