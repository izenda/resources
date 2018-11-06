import * as angular from 'angular';
import 'izenda-external-libs';
import 'common/core/module';
import 'common/query/module';

const izendaUiModule = angular
	.module('izenda.common.ui', ['rx', 'izenda.common.core', 'izenda.common.query'])
	.value('izenda.common.ui.reportNameInputPlaceholderText', ['js_Name', 'Name'])
	.value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
	.value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);
export default izendaUiModule;

