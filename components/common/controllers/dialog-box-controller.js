izendaRequire.define(['angular', '../services/services', '../directive/directives'], function (angular) {

	/**
	 * This controller used for showing modal dialog with message.
	 * it could be run by using $rootScope.$broadcast 'izendaShowDialogBoxEvent'
	 * with 5 parameters: message, title, buttons, callback, callbackArgs.
	 */
	angular
		.module('izenda.common.ui')
		.controller('IzendaDialogBoxController', [
			'$scope',
			IzendaDialogBoxController]);

	function IzendaDialogBoxController($scope) {
		'use strict';
		var vm = this;

		vm.opened = false;
		vm.title = '';
		vm.message = '';
		vm.buttons = [{ text: 'Close' }];
		vm.checkboxes = [];
		vm.alert = 'info';

		/**
		 * Reset dialog to its default state.
		 */
		vm.resetForm = function () {
			vm.opened = false;
			vm.title = '';
			vm.message = '';
			vm.buttons = [{ text: 'Close' }];
			vm.checkboxes = [];
			vm.alert = 'info';
		};

		/**
		 * Close modal dialog.
		 */
		vm.closeModal = function () {
			vm.opened = false;
		};

		/**
		 * Handle button click.
		 */
		vm.onButtonClick = function (button)
		{
			if (!button) return;
			vm.closeModal();
			if (button.callback && typeof button.callback === 'function') {
				button.callback(vm.checkboxes);
			}
		}

		/**
		 * Open modal handler
		 */
		$scope.$on('izendaShowDialogBoxEvent', function (event, args) {
			vm.resetForm();
			if (args.message) {
				vm.message = args.message;
			}
			if (args.title) {
				vm.title = args.title;
			}
			if (args.buttons) {
				vm.buttons = args.buttons;
			}
			if (args.checkboxes) {
				vm.checkboxes = args.checkboxes;
			}
			if (args.alert) {
				vm.alert = args.alert;
			}
			vm.opened = true;
		});
	}
});