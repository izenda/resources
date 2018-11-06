(function (require, define) {
	'use strict';

	// require configuration
	require.config({
		baseUrl: '###RS###extres=components',
		waitSeconds: 0,
		paths: {
			'moment': 'vendor/moment/moment-with-locales.min',
			'css-parser': 'vendor/jscssp/cssParser',
			'bootstrap-datetimepicker': 'vendor/bootstrap/js/bootstrap-datetimepicker.min',
			'resizeSensor': 'vendor/resize-sensor/resizeSensor',
			'rx': 'vendor/rxjs/rx.all.min',
			'izendaAngular': 'vendor/angular/angular.min',
			'izendaAngularCookies': 'vendor/angular/angular-cookies.min',
			'izendaAngularRx': 'vendor/rxjs/rx.angular',
			'minicolors': 'vendor/jquery-minicolors/jquery.minicolors.min',
			'msie-detect': 'vendor/custom/msie-detect',
			'corejs': 'vendor/corejs/shim.min'
		},
		map: {
			'*': {
				'jquery': 'jq$',
				'angular': 'izendaAngular',
				'angular-cookies': 'izendaAngularCookies',
				'angular-rx': 'izendaAngularRx'
			}
		},
		shim: {
			'angular-rx': {
				deps: ['rx', 'angular'],
				exports: 'angular-rx'
			},
			'angular-cookies': {
				deps: ['angular'],
				exports: 'angular-cookies'
			}
		}
	});
	define('jq$', [], function () {
		return jq$;
	});
	define('izenda-external-libs', [], function () {
		return true;
	});

	var firstRequireArray = ['jquery', 'common/loader-utils', 'corejs'];

	// start loading
	require(firstRequireArray, function (jq$, loaderUtils) {
		// we need to set jq$ as default jQuery object, because angularjs use default jquery.
		// if we're using external angular (which already loaded in the external code
		// nothing will happen, because angular init code will not be executed here.
		loaderUtils.storeDefaultJquery();
		require(['angular', 'angular-cookies', 'angular-rx'], function (angular) {
			loaderUtils.restoreDefaultJquery(); // restore default jQuery object after loading

			require(['resizeSensor', 'msie-detect', 'minicolors', 'bootstrap-datetimepicker'], function (resizeSensor) {
				window.resizeSensor = resizeSensor;
				// load report viewer config (used for legacy js code)
				loaderUtils.loadReportViewerConfig().then(function () {
					// load module definitions
					require(['instant-report/module'], function () {
						// load main template:
						angular.element.get('###RS###extres=components.instant-report.templates.instant-report-app.html').then(function (html) {
							var placeHolder = document.getElementById('izendaInstantReportRootPlaceHolder');
							placeHolder.innerHTML = html;
							// start instant reports application
							require([
								'instant-report/module-definition',
								'instant-report/controllers/instant-report-controller'], function (loaderModule) {
									loaderModule.IzendaInstantReportLoader.bootstrap();
							});
						});
					});
				});
			});
		});
	});
})(izendaRequire.require, izendaRequire.define);
