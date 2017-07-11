izendaRequire.define(['angular', '../common/module-definition'], function (angular) {
	'use strict';

	/**
	 * Requirements: 
	 *   izenda.common.compatibility
	 *   izenda.common.query
	 *   izenda.common.ui
	 */
	var module = angular.module('izendaFilters', [
		'izenda.common.compatibility',
		'izenda.common.query',
		'izenda.common.ui']);

	return module;
});