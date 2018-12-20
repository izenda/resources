import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report validation controller.
 */
izendaInstantReportModule.controller('InstantReportValidationController', [
	'$rootScope',
	'$scope',
	'$izendaLocaleService',
	'$izendaInstantReportValidationService',
	function (
		$rootScope,
		$scope,
		$izendaLocaleService,
		$izendaInstantReportValidationService) {

		'use strict';
		var vm = this;
		$scope.$izendaInstantReportValidationService = $izendaInstantReportValidationService;

		vm.isValid = true;
		vm.messages = [];
		vm.infoMessages = [];

		/**
		* Initialize controller
		*/
		vm.init = function () {
			$scope.$watch('$izendaInstantReportValidationService.getValidationMessages()', function (messages) {
				vm.isValid = $izendaInstantReportValidationService.isReportValid();
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