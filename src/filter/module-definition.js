izendaRequire.define(['angular', '../common/module-definition'], function (angular) {
	'use strict';

	var module = angular.module('izendaFilters', [
		'izenda.common.core',
		'izenda.common.query',
		'izenda.common.ui']);

	return module;
});