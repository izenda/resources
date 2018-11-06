import * as angular from 'angular';
import 'izenda-external-libs';
import izendaCoreModule from 'common/core/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import IzendaUtilUiService from 'common/core/services/util-ui-service';

/**
 * Notification component
 */
@IzendaComponent(izendaCoreModule, 'izendaNotificationComponent', ['$izendaUtilUiService'], {
	templateUrl: '###RS###extres=components.common.core.components.notification.notification-template.html',
	bindings: {}
})
export default class IzendaDialogBoxComponent {
	notifications: any[];

	constructor(private readonly $izendaUtilUiService: IzendaUtilUiService) {
		this.notifications = $izendaUtilUiService.notifications;
	}

	/**
	 * Close notification.
	 * @param {object} notification Notification object.
	 */
	closeNotification(notification) {
		this.$izendaUtilUiService.closeNotification(notification.id);
	}

	/**
	 * Cancel notification autohide.
	 * @param {object} notification Notification object.
	 */
	cancelNotificationTimeout(notification) {
		this.$izendaUtilUiService.cancelNotificationTimeout(notification.id);
	}
}
