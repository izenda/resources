/**
 * Service used for store data in share control
 */
angular.module('izenda.common.ui').factory('$izendaShareService', ['$injector', '$q', '$izendaCommonQuery',
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

		var getShareRules = function() {
			return shareRules;
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

		var setShareRules = function(value) {
			shareRules = value;
		}

		var getSubjects = function() {
			return subjects;
		}

		var getRights = function() {
			return rights;
		};

		var isShareDataLoaded = function() {
			return shareDataLoaded;
		};

		var loadShareData = function (customShareRules) {
			reset();
			return $q(function (resolve) {
				if (angular.isObject(customShareRules))
					setShareRules(customShareRules);
				$izendaCommonQuery.getShareData().then(function(shareData) {
					// rights
					angular.element.each(shareData.Rights, function() {
						rights.push({
							text: this.Text,
							value: this.Value
						});
					});

					// subjects
					angular.element.each(shareData.ShareWith, function () {
						subjects.push({
							text: this.Text,
							value: this.Value
						});
					});

					if (!clearShareRules) {
						shareRules = [];
						for (var key in shareData.ReportVisibility) {
							if (shareData.ReportVisibility.hasOwnProperty(key)) {
								shareRules.push({
									subject: key,
									right: shareData.ReportVisibility[key]
								});
							}
						}
					}
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
