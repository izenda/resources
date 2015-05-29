/**
 * Requirements: 
 *   common/izendaCompatibility
 *   common/izendaQuery
 *   common/izendaCommonControls
 *   filter/izendaFilters
 */
var modules = [
    'ngRoute',
    'ngCookies',
    'izendaCompatibility',
    'izendaQuery',
    'izendaCommonControls',
    'izendaFilters'
];

if (angular.version.major >= 1 && angular.version.minor >= 3) {
    modules.push('ngFx');
    if (!(jq$.browser.msie && jq$.browser.version <= 10)) {
        modules.push('impressjs');
    }
}

angular.module('izendaDashboard', modules);

angular.module('izendaDashboard').config([
  '$logProvider', function($logProvider) {
    $logProvider.debugEnabled(false );
  }
]);
