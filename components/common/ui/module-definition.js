izendaRequire.define([
	'angular',
	'../core/module-definition',
	'../query/module-definition'
], function (angular) {
	'use strict';
	angular
		.module('izenda.common.ui', ['izenda.common.core', 'izenda.common.query'])
		.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_Name', 'Name'])
		.value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
		.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);
});
