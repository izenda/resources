(function (require, define) {
	'use strict';
	
	// require configuration
	require.config({
		baseUrl: '###RS###extres=components',
		waitSeconds: 0,
		paths: {
			'moment': 'vendor/moment/moment-with-locales.min',
			'izendaAngular': 'vendor/angular-1.6.1/angular.min',
			'css-parser': 'vendor/jscssp/cssParser',
			'bootstrap-datetimepicker': 'vendor/bootstrap/js/bootstrap-datetimepicker.min',
			'izendaAngularCookies': 'vendor/angular-1.6.1/angular-cookies.min'
		},
		map: {
			'*': {
				'jquery': 'jq$',
				'angular': 'izendaAngular',
				'angular-cookies': "izendaAngularCookies"
			}
		},
		shim: {
			'angular-cookies': {
				deps: ['angular'],
				exports: 'angular-cookies'
			}
		}
	});
	define('jq$', [], function () {
		return jq$;
	});

	// start loading
	require(['jquery', 'common/loader-utils'], function (jq$, loaderUtils) {
		// we need to set jq$ as default jQuery object, because angularjs use default jquery.
		// if we're using external angular (which already loaded in the external code
		// nothing will happen, because angular init code will not be executed here.
		loaderUtils.storeDefaultJquery();
		require(['angular'], function (angular) {
			loaderUtils.restoreDefaultJquery(); // restore default jQuery object after loading

			// load report viewer config (used for legacy js code)
			loaderUtils.loadReportViewerConfig().then(function () {
				// load module definitions
				require(['common/module-definition', 'instant-report/module-definition'],
					function (commonSettingsLoader, instantReportBootstrapper) {
						// load javascripts
						require([
							'common/services/services',
							'common/directive/directives',
							'common/controllers/controllers',
							'instant-report/services/services',
							'instant-report/directive/directives',
							'instant-report/controllers/controllers'], function () {
								// load main template:
								angular.element.get('Resources/components/instant-report/templates/instant-report-app.html').then(function (html) {
									var placeHolder = document.getElementById('izendaInstantReportRootPlaceHolder');
									placeHolder.innerHTML = html;
									// start instant reports application
									instantReportBootstrapper.bootstrap();
								});
							});
					});
			});
		});
	});
})(izendaRequire.require, izendaRequire.define);
