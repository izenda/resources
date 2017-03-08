(function () {
	'use strict';

	// require configuration
	require.config({
		baseUrl: '###RS###extres=components',
		waitSeconds: 0,
		paths: {
			'moment': 'vendor/moment/moment-with-locales.min',
			'angular': 'vendor/angular-1.6.1/angular.min'
		},
		shim: {
			angular: {
				exports: 'angular'
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
			loaderUtils.storeDefaultJquery(); // we need to set jq$ as default jQuery object, because angularjs use default jquery.
			require([
				'angular',
				'moment',
				'vendor/jscssp/cssParser',
				'vendor/bootstrap/js/bootstrap-datetimepicker.min'], function (angular) {
					window.angular = angular;
					loaderUtils.restoreDefaultJquery(); // restore default jQuery object after loading

					// load module definitions
					require(['common/module-definition', 'instant-report/module-definition'], function (commonSettingsLoader, instantReportBootstrapper) {
						// load javascripts
						require([
							'common/services/services',
							'common/directive/directives',
							'common/controllers/controllers',
							'instant-report/services/services',
							'instant-report/directive/directives',
							'instant-report/controllers/controllers'], function () {
								// start instant reports application
								instantReportBootstrapper.bootstrap();
							});
					});
				});
		});
	});
})();
