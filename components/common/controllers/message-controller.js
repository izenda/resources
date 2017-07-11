izendaRequire.define(['angular', '../services/services', '../directive/directives'], function (angular) {

	/**
	 * This controller used for showing modal dialog with message.
	 * it could be run by using $rootScope.$broadcast 'izendaShowMessageEvent'
	 * with 3 parameters: message, title and alertType.
	 */
	angular
		.module('izenda.common.ui')
		.controller('IzendaMessageController', [
			'$scope',
			IzendaMessageController]);

	function IzendaMessageController($scope) {
		'use strict';
		var vm = this;

		vm.opened = false;
		vm.title = '';
		vm.message = '';
		vm.alertInfo = 'info';

		/**
		 * Reset dialog to its default state.
		 */
		vm.resetForm = function () {
			vm.opened = false;
			vm.title = '';
			vm.message = '';
			vm.alertInfo = 'info';
		};

		/**
		 * Close modal dialog.
		 */
		vm.closeModal = function () {
			vm.opened = false;
		};

		/**
		 * Open modal handler
		 */
		$scope.$on('izendaShowMessageEvent', function (event, args) {
			vm.resetForm();
			if (args.length > 0) {
				vm.message = args[0];
			}
			if (args.length > 1) {
				vm.title = args[1];
			}
			if (args.length > 2) {
				vm.alertInfo = args[2];
			}
			vm.opened = true;
		});
	}

});