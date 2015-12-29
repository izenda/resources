/**
* Column choise control for instant report.
*/
(function () {
  'use strict';

  // implementation
  function izendaInstantReportColumnSettings($izendaUrl) {
    return {
      restrict: 'A',
      scope: {
        name: '@',
        tables: '=',
        selectedColumn: '='
      },
      templateUrl: $izendaUrl.urlSettings.urlResources + '/components/instant-report/templates/instant-report-column-settings.html',
      link: function ($scope, elem, attrs) {
        
      }
    };
  };

  // definition
  angular
    .module('izendaInstantReport')
    .directive('izendaInstantReportColumnSettings', [
      '$izendaUrl',
      izendaInstantReportColumnSettings
    ]);
})();