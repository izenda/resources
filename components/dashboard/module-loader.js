(function () {
	'use strict';

	// require configuration
	require.config({
		baseUrl: '###RS###extres=components',
		waitSeconds: 0,
		paths: {
			'moment': 'vendor/moment/moment-with-locales.min',
			'angular': 'vendor/angular-1.6.1/angular.min',
			'angular-cookies': 'vendor/angular-1.6.1/angular-cookies.min'
		},
		shim: {
			angular: {
				exports: 'angular'
			},
			'angular-cookies': {
				deps: ['angular'],
				exports: 'angular-cookies'
			}
		}
	});

	//add jquery as requirejs module if not defined
	if (!require.defined('jquery'))
		define('jquery', [], function () {
			return jq$;
		});

	require(['common/loader-utils'], function (loaderUtils) {
		// load report viewer config (used for legacy js code)
		loaderUtils.loadReportViewerConfig().then(function () {
			// start initialize app
			loaderUtils.storeDefaultJquery(); // we need to set jq$ as default jQuery object, because angularjs use default jquery.
			require([
				'angular',
				'angular-cookies',
				'moment',
				'vendor/jscssp/cssParser',
				'vendor/bootstrap/js/bootstrap-datetimepicker.min'], function (angular) {
					window.angular = angular;
					loaderUtils.restoreDefaultJquery(); // restore default jQuery object after loading

					// load module definitions
					require(['common/module-definition', 'filter/module-definition', 'dashboard/module-definition'],
						function (commonSettingsLoader, filter, dashboardBootstrapper) {
							// load javascripts
							require([
								'common/services/services',
								'common/directive/directives',
								'common/controllers/controllers',
								'filter/controllers/filters-legacy-controller',
								'dashboard/services/services',
								'dashboard/directives/directives',
								'dashboard/controllers/controllers'], function () {
									// start instant reports application
									dashboardBootstrapper.bootstrap();
								});
						});
				});
		});
	});
})();
