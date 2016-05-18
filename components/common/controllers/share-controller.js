angular.module('izenda.common.ui').controller('IzendaShareController', [
	'$scope',
	'$izendaLocale',
	'$izendaShareService',
	izendaShareController]);

/**
 * Share controller
 */
function izendaShareController(
	$scope,
	$izendaLocale,
	$izendaShareService) {
	'use strict';
	$scope.$izendaShareService = $izendaShareService;
	var vm = this;

	vm.subjects = [];
	vm.rights = [];
	vm.shareRules = [];

	var reset = function() {
		vm.subjects = [];
		vm.rights = [];
		vm.shareRules = [];
	};

	/**
	 * Update available values
	 */
	vm.updateAvailableValues = function () {
		var listImplementedSubjects = [];
		angular.element.each(vm.shareRules, function () {
			var shareRule = this;
			if (angular.isString(shareRule.subject) && listImplementedSubjects.indexOf(shareRule.subject) < 0) {
				listImplementedSubjects.push(shareRule.subject);
			}
		});

		angular.element.each(vm.shareRules, function() {
			var shareRule = this;
			shareRule.availableSubjects = [];
			angular.element.each(vm.subjects, function() {
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

			shareRule.availableRights = [];
			angular.element.each(vm.rights, function () {
				var right = this;
				var rightRecord = angular.extend({}, right);
				rightRecord.disabled = false;
				shareRule.availableRights.push(rightRecord);
			});
		});
	};

	/**
	 * Check is share rule selected right is valid
	 */
	vm.getShareRuleValidationMessage = function(shareRule) {
		if (shareRule.right === null && shareRule.subject !== null)
			return $izendaLocale.localeText('js_NessesarySelectRight', 'It is necessary to choose the right, otherwise it will be ignored.');
		return null;
	};

	/**
	 * Subject <select> changed handler
	 */
	vm.onShareRuleSubjectChanged = function () {
		vm.updateAvailableValues();
	};

	/**
	 * Add share rule
	 */
	vm.addShareRule = function() {
		vm.shareRules.push({
			subject: null,
			right: null,
			availableSubjects: [],
			availableRights: []
		});
		vm.updateAvailableValues();
	}

	/**
	 * Initialize controller
	 */
	vm.initialize = function () {
		$scope.$watch('$izendaShareService.isShareDataLoaded()', function (loaded) {
			reset();
			if (!loaded)
				return;
			vm.rights = [];
			angular.copy($izendaShareService.getRights(), vm.rights);

			vm.subjects = [];
			angular.copy($izendaShareService.getSubjects(), vm.subjects);
			vm.subjects.unshift({
				text: '',
				value: null
			});

			vm.shareRules = $izendaShareService.getShareRules();
			angular.element.each(vm.shareRules, function() {
				this.availableSubjects = [];
				this.availableRights = [];
			});
			vm.updateAvailableValues();
		});
	};
}
