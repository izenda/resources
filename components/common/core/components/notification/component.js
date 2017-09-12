izendaRequire.define([
	'angular',
	'../../services/util-ui-service',
	'../../module-definition'
], function (angular) {

	/**
	 * Message component definition
	 */
	angular.module('izenda.common.core').component('izendaNotificationComponent', {
		templateUrl: 'Resources/components/common/core/components/notification/template.html',
		bindings: {},
		controller: ['$izendaUtilUiService', izendaNotificationComponentCtrl]
	});

	function izendaNotificationComponentCtrl($izendaUtilUiService) {
		var $ctrl = this;

		$ctrl.notifications = $izendaUtilUiService.notifications;

		/**
		 * Close notification.
		 * @param {object} notification Notification object.
		 */
		$ctrl.closeNotification = function (notification) {
			$izendaUtilUiService.closeNotification(notification.id);
		};

		/**
		 * Cancel notification autohide.
		 * @param {object} notification Notification object.
		 */
		$ctrl.cancelNotificationTimeout = function (notification) {
			$izendaUtilUiService.cancelNotificationTimeout(notification.id);
		};
	}
});
