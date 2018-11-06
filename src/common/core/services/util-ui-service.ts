import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaLocalizationService from 'common/core/services/localization-service';

export default class IzendaUtilUiService {
	private notificationHideDelay = 5000;
	private notificationsIdCounter = 1;
	notifications: any[] = [];

	message: any = null;
	dialogBox: any = null;

	constructor(
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaLocale: IzendaLocalizationService) {
	}

	/**
	 * Immediately close notification.
	 * @param {number} notificationId notification id
	 */
	closeNotification(notificationId: number) {
		let i = 0;
		while (i < this.notifications.length) {
			if (this.notifications[i].id === notificationId) {
				this.cancelNotificationTimeout(notificationId);
				this.notifications.splice(i, 1);
				return;
			}
			i++;
		}
	}

	/**
	 * Cancel notification autohide.
	 * @param {number} notificationId notification id
	 */
	cancelNotificationTimeout(notificationId: number) {
		const itm = this.getNotificationById(notificationId);
		if (itm.timeoutId) {
			this.$timeout.cancel(itm.timeoutId);
			itm.timeoutId = null;
		}
	}

	/**
	 *  Shows pop up notification panel. If no <izenda-notification-component> defined or no components with componentId will be found
	 * then nothing will happen.
	 * @param {string} text Message text.
	 * @param {string} title Title text (optional).
	 * @param {string} icon Icon (optional). Possible values 'error' or no value.
	 */
	showNotification(text: string, title?: string, icon?: string) {
		const nextId = this.notificationsIdCounter++;
		const iconClass = angular.isString(icon) && icon === 'error' ? 'glyphicon glyphicon-exclamation-sign' : '';
		var objToShow = {
			id: nextId,
			title: title ? title : '',
			text: text,
			iconClass: iconClass,
			timeoutId: null
		};
		objToShow.timeoutId = this.$timeout(() => {
			this.closeNotification(objToShow.id);
		}, this.notificationHideDelay);
		this.notifications.push(objToShow);
	}

	/**
	 * Shows message dialog. If no <izenda-message-component> defined or no components with componentId will be found
	 * then nothing will happen.
	 * @param {string} message Message text.
	 * @param {string} title Title text (optional).
	 * @param {string} alertInfo Type of dialog (optional). Possible values: 'success', 'info', 'warning', 'danger'
	 */
	showMessageDialog(message: string, title?: string, alertInfo?: string) {
		this.message = {
			message: message,
			title: angular.isDefined(title) ? title : '',
			alertInfo: angular.isDefined(alertInfo) ? alertInfo : 'info'
		};
	}

	/**
	 * Shows error dialog.
	 * @param {string} componentId ID of component. Used for distinguish different similar components.
	 * @param {string} message Error text
	 * @param {string} title Error title (optional)
	 */
	showErrorDialog(message: string, title?: string) {
		const titleText = angular.isDefined(title) ? title : this.$izendaLocale.localeText('js_Error', 'Error');
		this.showMessageDialog(message, titleText, 'danger');
	}

	/**
	 * Close message dialog.
	 */
	closeMessageDialog() {
		this.message = null;
	}

	/**
	 * Shows dialog box. If no <izenda-dialog-box-component> defined or no components with componentId will be found
	 * then nothing will happen.
	 * @param {string} message Message text.
	 * @param {string} title Title text (optional).
	 * @param {string} alertInfo Type of dialog (optional). Possible values: 'success', 'info', 'warning', 'danger'
	 * @param {Array} buttons dialog buttons (optional).
	 * @param {Array} checkboxes checkboxes collection (optional).
	 */
	showDialogBox(options: any) {
		this.dialogBox = {
			message: options.message,
			title: angular.isDefined(options.title) ? options.title : '',
			alertInfo: angular.isDefined(options.alertInfo) ? options.alertInfo : 'info',
			buttons: angular.isDefined(options.buttons) ? options.buttons : [{ text: 'Close' }],
			checkboxes: angular.isDefined(options.checkboxes) ? options.checkboxes : []
		};
	}

	/**
	 * Close dialog box
	 */
	closeDialogBox() {
		this.dialogBox = null;
	}

	private getNotificationById(id) {
		const found = this.notifications.find(n => {
			return n.id === id;
		});
		return found ? found : null;
	}

	static get injectModules(): any[] {
		return ['$timeout', '$izendaLocale'];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaUtilUiService',
			IzendaUtilUiService.injectModules.concat(IzendaUtilUiService));
	}
}
