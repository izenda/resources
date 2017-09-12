izendaRequire.define([
	'angular',
	'../../common/ui/services/share-service',
	'../../common/ui/components/share/component',
	'../services/services',
	'../directive/directives'
], function (angular) {

	/**
	* Instant report settings controller definition
	*/
	angular
	.module('izendaInstantReport')
	.controller('InstantReportSettingsController', [
				'$rootScope',
				'$scope',
				'$window',
				'$timeout',
				'$q',
				'$log',
				'$izendaShareService',
				InstantReportSettingsController
	]);

	function InstantReportSettingsController(
				$rootScope,
				$scope,
				$window,
				$timeout,
				$q,
				$log,
				$izendaShareService) {

		'use strict';
		var vm = this;
		$scope.$izendaShareService = $izendaShareService;

		vm.subjects = $izendaShareService.getSubjects();
		vm.rights = $izendaShareService.getRights();
		vm.shareRules = $izendaShareService.getShareRules();

		/**
		* Initialize controller
		*/
		vm.init = function () {
			$scope.$watch('$izendaShareService.getShareRules()', function () {
				vm.shareRules = $izendaShareService.getShareRules();
			});
			$scope.$watch('$izendaShareService.getSubjects()', function () {
				vm.subjects = $izendaShareService.getSubjects();
			});
			$scope.$watch('$izendaShareService.getRights()', function () {
				vm.rights = $izendaShareService.getRights();
			});
		};
	}

});