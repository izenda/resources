/**
* Instant report validation controller.
*/
angular
.module('izendaInstantReport')
.controller('InstantReportValidationController', [
			'$rootScope',
			'$scope',
			'$izendaInstantReportValidation',
			InstantReportValidationController
]);

function InstantReportValidationController($rootScope, $scope, $izendaInstantReportValidation) {

	'use strict';
	var vm = this;
	$scope.$izendaInstantReportValidation = $izendaInstantReportValidation;

	vm.isValid = true;
	vm.messages = [];

	/**
	* Initialize controller
	*/
	vm.init = function () {
		$scope.$watch('$izendaInstantReportValidation.isReportValid()', function (isValid) {
			vm.isValid = isValid;
			vm.messages = $izendaInstantReportValidation.getValidation().messages;
		});
	};
}
