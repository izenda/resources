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
	angular.module('izenda.common.core').component('izendaDialogBoxComponent', {
		templateUrl: '###RS###extres=components.common.core.components.dialog-box.template.html',
		bindings: {
			componentId: '@',
			useGlobalEventListening: '<',
			opened: '<',
			title: '<',
			message: '<',
			alertInfo: '<',
			buttons: '<',
			checkboxes: '<'
		},
		controller: ['$izendaLocale', '$izendaUtilUiService', izendaDialogBoxComponentCtrl]
	});

	function izendaDialogBoxComponentCtrl($izendaLocale, $izendaUtilUiService) {
		var $ctrl = this;

		this.$izendaUtilUiService = $izendaUtilUiService;
		
		/**
		 * Handle button click.
		 */
		this.onButtonClick = function (button) {
			if (!button) return;
			if (angular.isFunction(button.callback)) {
				button.callback($izendaUtilUiService.dialogBox.checkboxes);
			}
			$ctrl.closeModal();
		}

		/**
		 * Close modal dialog.
		 */
		this.closeModal = function () {
			$izendaUtilUiService.closeDialogBox();
		};
	}
});
