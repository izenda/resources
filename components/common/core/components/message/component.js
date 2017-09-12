izendaRequire.define([
	'angular',
	'../../module-definition',
	'../../services/localization-service',
	'../../services/util-ui-service',
	'../../directives/bootstrap-modal'
], function (angular) {

	/**
	 * Message component definition
	 */
	angular.module('izenda.common.core').component('izendaMessageComponent', {
		templateUrl: 'Resources/components/common/core/components/message/template.html',
		bindings: {},
		controller: ['$izendaLocale', '$izendaUtilUiService', izendaMessageComponentCtrl]
	});

	function izendaMessageComponentCtrl($izendaLocale, $izendaUtilUiService) {
		var $ctrl = this;

		$ctrl.$izendaUtilUiService = $izendaUtilUiService;

		$ctrl.closeMessage = function () {
			$izendaUtilUiService.closeMessageDialog();
		};
	}
});
