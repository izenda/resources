izendaRequire.define([
	'angular',
	'../module-definition',
	'../../query/services/common-query-service'
], function (angular) {

	/**
	 * Service used for store data in share control
	 */
	angular.module('izenda.common.ui').factory('$izendaShareService', [
		'$injector',
		'$q',
		'$izendaCommonQuery',
		function ($injector, $q, $izendaCommonQuery) {
			'use strict';

			// get clear share rules config option.
			var clearShareRules = false;
			if ($injector.has('izendaCommonUiConfig')) {
				var config = $injector.get('izendaCommonUiConfig');
				clearShareRules = angular.isObject(config) ? config.clearShareRules : false;
			}

			var rights;
			var subjects;
			var shareRules;
			var shareDataLoaded = false;

			var reset = function () {
				shareDataLoaded = false;
				rights = [];
				subjects = [];
				shareRules = [];
			};

			var getShareRulesToSend = function () {
				var result = [];
				angular.element.each(shareRules, function () {
					if (this.subject !== null && this.right !== null)
						result.push({
							subject: this.subject,
							right: this.right
						});
				});
				return result;
			};

			var getShareRules = function () {
				return shareRules;
			};

			var setShareRules = function (value) {
				shareRules = value;
			}

			var getSubjects = function () {
				return subjects;
			}

			var getRights = function () {
				return rights;
			};

			var isShareDataLoaded = function () {
				return shareDataLoaded;
			};

			var loadShareData = function (options) {
				var defaultOptions = {
					defaultShareConfig: false, // by default we are getting share config from current report set.
					shareConfig: null // custom share config
				};
				var actualOptions = angular.isObject(options)
					? angular.extend({}, defaultOptions, options)
					: defaultOptions;

				reset();
				return $q(function (resolve) {
					// load share config
					$izendaCommonQuery.getShareData(actualOptions.defaultShareConfig).then(function (shareData) {
						// fill available rights collection
						angular.element.each(shareData.Rights, function () {
							rights.push({
								text: this.Text,
								value: this.Value
							});
						});
						// fill available subjects collection
						angular.element.each(shareData.ShareWith, function () {
							subjects.push({
								text: this.Text,
								value: this.Value
							});
						});

						var newShareRules = [];

						if (actualOptions.shareConfig) {
							// if we already have share rules: just set it, no need to use rules, which were 
							// loaded from server
							newShareRules = actualOptions.shareConfig;
						} else if (!clearShareRules) {
							// if "izendaCommonUiConfig.clearShareRules" 
							for (var key in shareData.ReportVisibility) {
								if (shareData.ReportVisibility.hasOwnProperty(key)) {
									newShareRules.push({
										subject: key,
										right: shareData.ReportVisibility[key]
									});
								}
							}
						}
						// store share rules model
						setShareRules(newShareRules);
						shareDataLoaded = true;
						resolve();
					});
				});
			};

			var saveShareConfigToCrs = function () {
				var shareConfig = getShareRulesToSend();
				$izendaCommonQuery.saveShareData(shareConfig);
			};

			reset();

			return {
				getShareRules: getShareRules,
				setShareRules: setShareRules,
				getSubjects: getSubjects,
				getRights: getRights,
				isShareDataLoaded: isShareDataLoaded,
				loadShareData: loadShareData,
				getShareRulesToSend: getShareRulesToSend,
				saveShareConfigToCrs: saveShareConfigToCrs
			};
		}
	]);

});