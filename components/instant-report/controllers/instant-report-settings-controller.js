/**
* Instant report settings controller definition
*/
angular
.module('izendaInstantReport')
.controller('InstantReportSettingsController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			'$izendaShareService',
			InstantReportSettingsController
]);

function InstantReportSettingsController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$log,
			$izendaShareService) {

	'use strict';
	var vm = this;

	/**
	* Initialize controller
	*/
	vm.init = function () {
	};
}
