define(['../services/services', '../directive/directives'], function () {

	/**
	 * Schedule control. Used for report schedule configuration
	 */
	angular
		.module('izenda.common.ui')
		.controller('IzendaScheduleController', [
			'$scope',
			'$izendaLocale',
			'$izendaSettings',
			'$izendaScheduleService',
			IzendaScheduleController]);

	function IzendaScheduleController($scope, $izendaLocale, $izendaSettings, $izendaScheduleService) {
		'use strict';
		var vm = this;

		// add services references to scope for bindings:
		$scope.$izendaSettings = $izendaSettings;
		$scope.$izendaScheduleService = $izendaScheduleService;

		vm.scheduleConfig = $izendaScheduleService.getScheduleConfig();
		vm.repeatTypes = $izendaScheduleService.getRepeatTypes();
		vm.emailTypes = $izendaScheduleService.getEmailTypes();
		vm.timezones = $izendaScheduleService.getTimezones();
		vm.scheduleDateOpened = false;
		vm.dateFormat = $izendaSettings.getDateFormat();
		vm.culture = $izendaSettings.getCulture();

		/**
		 * Initialize controller
		 */
		vm.initialize = function () {

			$scope.$watch('$izendaSettings.getDateFormat()', function (dateFormat) {
				vm.dateFormat = dateFormat;
			}, true);

			$scope.$watch('$izendaSettings.getCulture()', function (culture) {
				vm.culture = culture;
			});

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