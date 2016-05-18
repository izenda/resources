angular.module('izenda.common.ui').controller('IzendaNotificationController', [
	'$rootScope',
	'$scope',
	izendaNotificationController]);

/**
 * Notification controller
 */
function izendaNotificationController(
	$rootScope,
	$scope) {
	'use strict';

	var vm = this;
	vm.notificationsIdCounter = 1;
	vm.notifications = [];

	var getNotificationById = function(id) {
		var i = 0;
		while (i < vm.notifications.length) {
			var itm = vm.notifications[i];
			if (itm.id === id) {
				return itm;
			}
			i++;
		}
		return null;
	};

	/**
	 * Cancel notification item autohide
		*/
	vm.cancelNotificationTimeout = function (id) {
		var itm = getNotificationById(id);
		if (itm.timeoutId >= 0) {
			clearTimeout(itm.timeoutId);
			itm.timeoutId = -1;
		}
	};

	/**
	 * Close notification
	 */
	vm.closeNotification = function (id) {
		var i = 0;
		while (i < vm.notifications.length) {
			if (vm.notifications[i].id === id) {
				vm.cancelNotificationTimeout(id);
				vm.notifications.splice(i, 1);
				$scope.$evalAsync();
				return;
			}
			i++;
		}
	};

	/**
	 * Open notification
	 */
	vm.showNotification = function (title, text, icon) {
		var nextId = vm.notificationsIdCounter++;
		var iconClass = '';
		if (angular.isString(icon)) {
			if (icon === 'error') {
				iconClass = 'glyphicon glyphicon-exclamation-sign';
			}
		}
		var objToShow = {
			id: nextId,
			title: title,
			text: text,
			iconClass: iconClass
		};
		objToShow.timeoutId = setTimeout(function () {
			vm.closeNotification(objToShow.id);
		}, 5000);
		vm.notifications.push(objToShow);
		$scope.$evalAsync();
	};

	$scope.$on('showNotificationEvent', function (event, args) {
		if (args.length > 0) {
			var title = args.length > 1 ? args[1] : '';
			var text = args[0];
			vm.showNotification(title, text);
		}
	});

	/**
	 * Initialize controller
	 */
	vm.initialize = function () {
		
	};
}
