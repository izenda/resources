/**
 * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
 */
(function() {
  'use strict';

  // implementation
  function izendaToolbarFolderMenuAccordion($timeout, $izendaUrl) {
    'use strict';
    var _ = angular.element;
    return {
      restrict: 'A',
      scope: {
        categories: '='
      },
      templateUrl: $izendaUrl.settings.urlBase + '/Resources/components/dashboard/templates/toolbar-folder-menu-accordion.html',
      link: function ($scope, elem, attrs) {

        // add category 'in' class for currentCategory
        $scope.getCategoryClass = function (index) {
          return $scope.categories[index].name === $izendaUrl.getReportInfo().category ? 'in' : '';
        };

        $scope.getCategoryItemClass = function(itemName) {
          var isCurrentName = itemName === $izendaUrl.getReportInfo().fullName;
          return isCurrentName ? 'active' : '';
        };

        // remove category part from report name
        $scope.extractReportName = function(fullName) {
          return $izendaUrl.extractReportName(fullName);
        };

        // navigate to dashboard
        $scope.goToDashboard = function (dashboard) {
	        $izendaUrl.setReportFullName(dashboard);
        };

        // toggle accordion handler
        $scope.toggleAccordion = function (index) {
          var $categoryContainer = _(elem.children()[index]);
          var $category = $categoryContainer.find('.category');
          if ($category.hasClass('in'))
            $category.removeClass('in');
          else
            $category.addClass('in');
        };
      }
    };
  }

  // definition
  angular
    .module('izendaDashboard')
    .directive('izendaToolbarFolderMenuAccordion', [
      '$timeout',
      '$izendaUrl',
      izendaToolbarFolderMenuAccordion
    ]);
})();
