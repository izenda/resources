var modules = [
	'ngRoute',
	'ngCookies',
	'ui.bootstrap',
	'izendaCompatibility',
	'izendaQuery',
	'izendaCommonControls',
	'izenda.common.ui',
	'izendaFilters',
	'impressjs'
];

angular.module('izendaCommonControls').value('reportNameInputPlaceholderText', ['js_DashboardName', 'Dashboard Name']);

angular.module('izendaDashboard', modules);

// dashboard config object:
angular.module('izendaDashboard').constant('izendaDashboardConfig', {
	showDashboardToolbar: true
});

angular.module('izendaDashboard').config(['$logProvider', function ($logProvider) {
	$logProvider.debugEnabled(false);
}]);
