angular
	.module('izenda.common.ui')
	.controller('IzendaMessageController', ['$scope', function ($scope) {
		'use strict';

		var vm = this;
		vm.opened = false;
		vm.title = '';
		vm.message = '';
		vm.alertInfo = 'info';

		vm.resetForm = function () {
			vm.opened = false;
			vm.title = '';
			vm.message = '';
			vm.alertInfo = 'success';
		};

		vm.closeModal = function () {
			vm.opened = false;
		};

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
	}]);
