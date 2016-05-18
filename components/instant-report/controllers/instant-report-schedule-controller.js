/**
* Instant report schedule controller definition
*/
angular
.module('izendaInstantReport')
.controller('InstantReportScheduleController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			InstantReportScheduleController
]);

function InstantReportScheduleController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$log) {
	'use strict';
	var vm = this;

	/**
	* Initialize controller
	*/
	vm.init = function () {
	};
}
