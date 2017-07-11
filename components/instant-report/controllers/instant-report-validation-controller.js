izendaRequire.define(['angular', '../services/services', '../directive/directives'], function (angular) {

	/**
	* Instant report validation controller.
	*/
	angular
	.module('izendaInstantReport')
	.controller('InstantReportValidationController', [
				'$rootScope',
				'$scope',
				'$izendaLocale',
				'$izendaInstantReportValidation',
				'$izendaInstantReportStorage',
				InstantReportValidationController
	]);

	function InstantReportValidationController(
		$rootScope,
		$scope,
		$izendaLocale,
		$izendaInstantReportValidation,
		$izendaInstantReportStorage) {

		'use strict';
		var vm = this;
		$scope.$izendaInstantReportValidation = $izendaInstantReportValidation;

		vm.isValid = true;
		vm.messages = [];
		vm.infoMessages = [];

		/**
		* Initialize controller
		*/
		vm.init = function () {
			$scope.$watch('$izendaInstantReportValidation.getValidationMessages()', function (messages) {
				vm.isValid = $izendaInstantReportValidation.isReportValid();
				vm.messages = [];
				vm.infoMessages = [];
				angular.element.each(messages, function () {
					var message = this;
					if (message.type === 'info') {
						vm.infoMessages.push(message);
					} else {
						vm.messages.push(message);
					}
				});

			});
		};
	}

});