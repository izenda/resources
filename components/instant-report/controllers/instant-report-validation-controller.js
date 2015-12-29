/**
* Instant report validation controller.
*/
angular
.module('izendaInstantReport')
.controller('InstantReportValidationController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			InstantReportValidationController
]);

function InstantReportValidationController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$log) {

	'use strict';
	var vm = this;

	vm.isValid = true;
	vm.messages = [];

	/**
	* Initialize controller
	*/
	vm.init = function () {
		$scope.$watch('$izendaInstantReportStorage.isReportSetValid()', function (isValid) {
			vm.isValid = isValid;
		});
		$scope.$watch('$izendaInstantReportStorage.getReportSetValidationMessages()', function (messages) {
			vm.messages = messages;
		});
	};
}
