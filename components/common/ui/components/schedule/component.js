izendaRequire.define([
	'angular',
	'../../module-definition',
	'../../../core/services/localization-service',
	'../../../query/services/settings-service',
	'../../services/schedule-service',
	'../../directives/datetime-picker'
], function (angular) {
	/**
	 * Schedule component definition
	 */
	angular.module('izenda.common.ui').component('izendaScheduleComponent', {
		templateUrl: 'Resources/components/common/ui/components/schedule/template.html',
		bindings: {
			scheduleConfig: '=',
			repeatTypes: '<',
			emailTypes: '<',
			timezones: '<'
		},
		controller: ['$izendaLocale', '$izendaSettings', '$izendaScheduleService', izendaScheduleComponentCtrl]
	});

	function izendaScheduleComponentCtrl($izendaLocale, $izendaSettings, $izendaScheduleService) {
		var $ctrl = this;

		$ctrl.dateFormat = null;
		$ctrl.culture = null;

		/**
		 * Component init
		 */
		this.$onInit = function () {
			$ctrl.dateFormat = $izendaSettings.getDateFormat();
			$ctrl.culture = $izendaSettings.getCulture();
		};
	}
});