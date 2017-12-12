izendaRequire.define([
	'angular',
	'../module-definition',
	'./localization-service'
], function (angular) {

	/**
	 * This service provides useful functions for working with the common UI.
	 */
	angular.module('izenda.common.core').service('$izendaUtilUiService', [
		'$timeout',
		'$rootScope',
		'$izendaLocale',
		function ($timeout, $rootScope, $izendaLocale) {
			'use strict';
			var self = this;

			var notificationHideDelay = 5000;
			var _notificationsIdCounter = 1;
			this.notifications = [];

			this.message = null;
			this.dialogBox = null;

			/**
			 * Immediately close notification.
			 * @param {number} notificationId notification id
			 */
			this.closeNotification = function (notificationId) {
				_closeNotification(notificationId);
			};

			/**
			 * Cancel notification autohide.
			 * @param {number} notificationId notification id
			 */
			this.cancelNotificationTimeout = function (notificationId) {
				_cancelNotificationTimeout(notificationId);
			};

			/**
			 *  Shows pop up notification panel. If no <izenda-notification-component> defined or no components with componentId will be found
			 * then nothing will happen.
			 * @param {string} text Message text.
			 * @param {string} title Title text (optional).
			 * @param {string} icon Icon (optional). Possible values 'error' or no value.
			 */
			this.showNotification = function (text, title, icon) {
				_showNotification(angular.isString(text) ? text : '', angular.isString(title) ? title : '', angular.isString(icon) ? icon : '');
			}

			/**
			 * Shows message dialog. If no <izenda-message-component> defined or no components with componentId will be found
			 * then nothing will happen.
			 * @param {string} message Message text.
			 * @param {string} title Title text (optional).
			 * @param {string} alertInfo Type of dialog (optional). Possible values: 'success', 'info', 'warning', 'danger'
			 */
			this.showMessageDialog = function (message, title, alertInfo) {
				this.message = {
					message: message,
					title: angular.isDefined(title) ? title : '',
					alertInfo: angular.isDefined(alertInfo) ? alertInfo : 'info'
				};
			};

			/**
			 * Shows error dialog.
			 * @param {string} componentId ID of component. Used for distinguish different similar components.
			 * @param {string} message Error text
			 * @param {string} title Error title (optional)
			 */
			this.showErrorDialog = function (message, title) {
				var titleText = angular.isDefined(title) ? title : $izendaLocale.localeText('js_Error', 'Error');
				self.showMessageDialog(message, titleText, 'danger');
			};

			/**
			 * Close message dialog.
			 */
			this.closeMessageDialog = function () {
				this.message = null;
			};

			/**
			 * Shows dialog box. If no <izenda-dialog-box-component> defined or no components with componentId will be found
			 * then nothing will happen.
			 * @param {string} message Message text.
			 * @param {string} title Title text (optional).
			 * @param {string} alertInfo Type of dialog (optional). Possible values: 'success', 'info', 'warning', 'danger'
			 * @param {Array} buttons dialog buttons (optional).
			 * @param {Array} checkboxes checkboxes collection (optional).
			 */
			this.showDialogBox = function (options) {
				this.dialogBox = {
					message: options.message,
					title: angular.isDefined(options.title) ? options.title : '',
					alertInfo: angular.isDefined(options.alertInfo) ? options.alertInfo : 'info',
					buttons: angular.isDefined(options.buttons) ? options.buttons : [{ text: 'Close' }],
					checkboxes: angular.isDefined(options.checkboxes) ? options.checkboxes : []
				};
			};

			/**
			 * Close dialog box
			 */
			this.closeDialogBox = function () {
				this.dialogBox = null;
			};
			
			function _getNotificationById(id) {
				var found = self.notifications.filter(function (n) {
					return n.id === id;
				});
				return found.length ? found[0] : null;
			}

			function _cancelNotificationTimeout(id) {
				var itm = _getNotificationById(id);
				if (itm.timeoutId) {
					$timeout.cancel(itm.timeoutId);
					itm.timeoutId = null;
				}
			}

			function _closeNotification(id) {
				var i = 0;
				while (i < self.notifications.length) {
					if (self.notifications[i].id === id) {
						_cancelNotificationTimeout(id);
						self.notifications.splice(i, 1);
						return;
					}
					i++;
				}
			}

			function _showNotification(title, text, icon) {
				var nextId = _notificationsIdCounter++;
				var iconClass = angular.isString(icon) && icon === 'error' ? 'glyphicon glyphicon-exclamation-sign' : '';
				var objToShow = {
					id: nextId,
					title: title,
					text: text,
					iconClass: iconClass
				};
				objToShow.timeoutId = $timeout(function () {
					_closeNotification(objToShow.id);
				}, notificationHideDelay);
				self.notifications.push(objToShow);
			}
		}]);
});