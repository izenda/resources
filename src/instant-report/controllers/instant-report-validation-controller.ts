import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report validation controller.
 */
izendaInstantReportModule.controller('InstantReportValidationController', [
	'$rootScope',
	'$scope',
	'$izendaLocale',
	'$izendaInstantReportValidation',
	function (
		$rootScope,
		$scope,
		$izendaLocale,
		$izendaInstantReportValidation) {

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
]);