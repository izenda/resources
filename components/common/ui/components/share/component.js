izendaRequire.define([
	'angular',
	'../../module-definition',
	'../../../core/services/localization-service'
], function (angular) {

	/**
	 * Message component definition
	 */
	angular.module('izenda.common.ui').component('izendaShareComponent', {
		templateUrl: 'Resources/components/common/ui/components/share/template.html',
		bindings: {
			subjects: '<',
			rights: '<',
			shareRules: '<'
		},
		controller: ['$izendaLocale', izendaShareComponentCtrl]
	});

	function izendaShareComponentCtrl($izendaLocale) {
		var $ctrl = this;
		
		/**
		 * Component init
		 */
		this.$onInit = function () {
			updateAvailableValues();
		};

		/**
		 * Bindings update handler
		 */
		$ctrl.$onChanges = function (changesObj) {
			updateAvailableValues();
		};

		/**
		 * Check is share rule selected right is valid
		 */
		$ctrl.getShareRuleValidationMessage = function (shareRule) {
			if (shareRule.right === null && shareRule.subject !== null)
				return $izendaLocale.localeText('js_NessesarySelectRight', 'It is necessary to choose the right, otherwise it will be ignored.');
			return null;
		};

		/**
		 * Subject <select> changed handler
		 */
		$ctrl.onShareRuleSubjectChanged = function () {
			updateAvailableValues();
		};

		/**
		 * Add share rule
		 */
		$ctrl.addShareRule = function () {
			$ctrl.shareRules.push({
				subject: null,
				right: null,
				availableSubjects: []
			});
			updateAvailableValues();
		}

		/**
		 * Update available share subjects.
		 */
		function updateAvailableValues() {
			if (!$ctrl.shareRules)
				return;

			var listImplementedSubjects = [];
			angular.element.each($ctrl.shareRules, function () {
				var shareRule = this;
				if (angular.isString(shareRule.subject) && listImplementedSubjects.indexOf(shareRule.subject) < 0) {
					listImplementedSubjects.push(shareRule.subject);
				}
			});

			angular.element.each($ctrl.shareRules, function () {
				var shareRule = this;
				shareRule.availableSubjects = [];
				angular.element.each($ctrl.subjects, function () {
					var subject = this;
					var subjectRecord = angular.extend({}, subject);
					if (shareRule.subject !== subjectRecord.value && listImplementedSubjects.indexOf(subject.value) >= 0) {
						// disable already selected subjects
						subjectRecord.disabled = true;
					} else {
						subjectRecord.disabled = false;
					}
					shareRule.availableSubjects.push(subjectRecord);
				});
			});
		};

		function reset() {
			$ctrl.subjects = [];
			$ctrl.rights = [];
			$ctrl.shareRules = [];
		}
	}
});
