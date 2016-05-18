<%@ Control Language="C#" AutoEventWireup="true" %>

<div id="izendaDashboardMainContainer" ng-app="izendaDashboard">
  
  <!-- select report name and category dialog -->
  <div ng-include="'Resources/components/common/templates/select-report-name.html'"></div>
  
  <!-- select report part dialog -->
  <div ng-include="'Resources/components/common/templates/select-report.html'"></div>

  <!-- dashboard toolbar -->
  <div ng-include="'Resources/components/dashboard/templates/toolbar.html'"></div>
  

  <!-- filters panel -->
  <div ng-include="'Resources/components/custom/templates/filters-legacy.html'"></div>
  <!--<div ng-include="'Resources/components/filter/templates/filters.html'"></div>-->
  <!-- HERE IS EXAMPLE FOR CONTROL CUSTOMIZATION: -->
  <!--<div ng-include="'Resources/components/custom/filters-custom-template.html'"></div>-->

  <!-- dashboard body -->
  <div ng-include="'Resources/components/dashboard/templates/dashboard.html'"></div>
</div>

<script type="text/javascript">
  jq$('.dropdown-no-close-on-click.dropdown-menu .hue-rotate-switcher').click(function (e) {
    e.stopPropagation();
  });
</script>
