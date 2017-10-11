izendaRequire.define([
	'angular',
	'../../common/ui/components/schedule/component',
	'../../common/ui/services/schedule-service',
	'../directive/directives'
], function (angular) {

	/**
	* Instant report schedule controller definition
	*/
	angular
	.module('izendaInstantReport')
	.controller('InstantReportScheduleController', [
		'$rootScope',
		'$scope',
		'$window',
		'$timeout',
		'$q',
		'$log',
		'$izendaScheduleService',
		InstantReportScheduleController
	]);

	function InstantReportScheduleController(
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$log,
		$izendaScheduleService) {
		'use strict';
		var vm = this;
		$scope.$izendaScheduleService = $izendaScheduleService;
		vm.scheduleConfig = $izendaScheduleService.getScheduleConfig();
		vm.repeatTypes = $izendaScheduleService.getRepeatTypes();
		vm.emailTypes = $izendaScheduleService.getEmailTypes();
		vm.timezones = $izendaScheduleService.getTimezones();

		/**
		 * Initialize controller
		 */
		vm.initialize = function () {
			$scope.$watch('$izendaScheduleService.getScheduleConfig()', function (scheduleConfig) {
				vm.scheduleConfig = scheduleConfig;
			});
			$scope.$watch('$izendaScheduleService.getRepeatTypes()', function (repeatTypes) {
				vm.repeatTypes = repeatTypes;
			});
			$scope.$watch('$izendaScheduleService.getEmailTypes()', function (emailTypes) {
				vm.emailTypes = emailTypes;
			});
			$scope.$watch('$izendaScheduleService.getTimezones()', function (timezones) {
				vm.timezones = timezones;
			});
		};
	}
});