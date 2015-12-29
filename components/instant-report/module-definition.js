// configure parent
angular.module('izenda.common.ui').constant('izendaCommonUiConfig', {
	clearShareRules: true, // do not show rules which defined in current report set.
	clearScheduleOptions: true // do not show schedule options for current report set.
});

angular.module('izendaCommonControls').value('reportNameInputPlaceholderText', ['js_ReportName', 'Report Name']);

// create module
angular.module('izendaInstantReport', [
	'ui.bootstrap',
	'izendaQuery',
	'izendaCommonControls',
	'izenda.common.ui'
]).constant('izendaInstantReportConfig', {
	moveUncategorizedToLastPostion: true
}).config([
	'$logProvider', function ($logProvider) {
		$logProvider.debugEnabled(false);
	}
]);
