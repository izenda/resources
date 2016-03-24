<%@ Control Language="C#" AutoEventWireup="true" %>

<div ng-app="izendaInstantReport" class="iz-inst-root"
  ng-controller="InstantReportController as irController"
  ng-init="irController.init()"
  ng-cloak>

  <div ng-include="'Resources/components/common/templates/notification.html'"></div>

  <!-- select report name and category dialog -->
  <div ng-include="'Resources/components/common/templates/select-report-name.html'"></div>

  <!-- message dialog -->
  <div ng-include="'Resources/components/common/templates/message.html'"></div>

  <!-- left panel -->
  <div class="iz-inst-left-panel"
    style="width: 550px" data-style="width: 550px"
    ng-class="(irController.leftPanel.opened ? '' : 'collapsed') + irController.getMobileClass()">
    <div class="iz-inst-sidepanel-buttons noselect">
      <!-- menu button for mobile view -->
      <div class="iz-inst-sidepanel-button"
        title="Menu"
        ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(5)"
        ng-click="irController.setLeftPanelActiveItem(5)">
        <div class="glyphicon glyphicon-menu-hamburger bootstrap-glyphicon"></div>
      </div>
      <!-- datasources button -->
      <div class="iz-inst-sidepanel-button datasources"
        ng-class="irController.getLeftPanelClass(0)"
        ng-click="irController.setLeftPanelActiveItem(0)"
        title="Data sources">
        <span class="iz-inst-sidepanel-button-text">data</span>
      </div>
      <!-- filter button for mobile view -->
      <div class="iz-inst-sidepanel-button" title="Filters"
        ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(8)"
        ng-click="irController.setLeftPanelActiveItem(8)">
        <div class="glyphicon glyphicon-filter bootstrap-glyphicon"></div>
      </div>
      <!-- pivots button for mobile view -->
      <div class="iz-inst-sidepanel-button" title="Pivots"
        ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(9)"
        ng-click="irController.setLeftPanelActiveItem(9)">
        <div class="glyphicon glyphicon-transfer bootstrap-glyphicon"></div>
      </div>
      <div class="iz-inst-sidepanel-button charts"
        ng-class="irController.getLeftPanelClass(1)"
        ng-click="irController.setLeftPanelActiveItem(1)"
        ng-show="irController.settings.showChartTab"
        title="Charts">
        <span class="iz-inst-sidepanel-button-text">charts</span>
      </div>
      <div class="iz-inst-sidepanel-button format"
        ng-class="irController.getLeftPanelClass(2)"
        ng-click="irController.setLeftPanelActiveItem(2)"
        title="Format and options">
        <span class="iz-inst-sidepanel-button-text">format</span>
      </div>
      <div class="iz-inst-sidepanel-button schedule"
        ng-class="irController.getLeftPanelClass(3)"
        ng-click="irController.setLeftPanelActiveItem(3)"
        ng-show="irController.settings.showScheduleControls"
        title="Schedule">
        <span class="iz-inst-sidepanel-button-text">schedule</span>
      </div>
      <div class="iz-inst-sidepanel-button access"
        ng-class="irController.getLeftPanelClass(4)"
        ng-click="irController.setLeftPanelActiveItem(4)"
        ng-show="irController.settings.showSharingControl"
        title="Sharing">
        <span class="iz-inst-sidepanel-button-text">sharing</span>
      </div>
    </div>
    <div class="iz-inst-leftpanel-body">
      <!-- report name -->
      <div class="iz-inst-report-name-container"
        ng-show="irController.isExistingReport">
        <ol class="breadcrumb"
          ng-show="irController.reportInfo.category !== '' && irController.reportInfo.category !== 'Uncategorized'"
          ng-attr-title="{{irController.reportInfo.fullName}}">
          <li>
            <b ng-bind="irController.reportInfo.category"></b>
          </li>
          <li class="active" ng-bind="irController.reportInfo.name"></li>
        </ol>
        <ol class="breadcrumb"
          ng-hide="irController.reportInfo.category !== '' && irController.reportInfo.category !== 'Uncategorized'"
          ng-attr-title="{{irController.reportInfo.fullName}}">
          <li class="active" ng-bind="irController.reportInfo.name"></li>
        </ol>
      </div>
      <!-- left panel content -->
      <div class="panel"
        ng-class="irController.getLeftPanelClass(0)">
        <div ng-include="'Resources/components/instant-report/templates/instant-report-data-source.html'"></div>
      </div>
      <div class="panel"
        ng-class="irController.getLeftPanelClass(1)">
        <div ng-include="'Resources/components/instant-report/templates/instant-report-charts.html'"></div>
      </div>
      <div class="panel"
        ng-class="irController.getLeftPanelClass(2)">
        <div ng-include="'Resources/components/instant-report/templates/instant-report-format.html'"></div>
      </div>
      <div class="panel"
        ng-class="irController.getLeftPanelClass(3)">
        <div ng-include="'Resources/components/instant-report/templates/instant-report-schedule.html'"></div>
      </div>
      <div class="panel"
        ng-class="irController.getLeftPanelClass(4)">
        <div ng-include="'Resources/components/instant-report/templates/instant-report-settings.html'"></div>
      </div>
      <!-- toolbar -->
      <div class="panel" ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(5)">
        <div class="iz-inst-left-menu-container">
          <div ng-include="'Resources/components/instant-report/templates/instant-report-main-toolbar.html'"></div>
        </div>
      </div>
      <!-- preview for mobile -->
      <div class="panel" ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(6)">
        <div class="iz-inst-left-preview-container">
          <!-- validation controller -->
          <div ng-include="'Resources/components/instant-report/templates/instant-report-validation.html'"></div>
          <div class="iz-inst-preview-root-container"
            droppable-accept=".datasource-field"
            on-drop="irController.addFieldToReport(arg0)"
            izenda-instant-report-field-droppable>
            <izenda-report-viewer class="iz-inst-preview-container"
              html-text="irController.previewHtml"
              allow-col-reorder="false"
              allow-col-remove="false"
              empty-text="''">
            </izenda-report-viewer>
          </div>
        </div>
      </div>
      <!-- field options panel for mobile-->
      <div class="panel" ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(7)">
        <div class="iz-inst-left-field-options-container">
          <div ng-include="'Resources/components/instant-report/templates/instant-report-field-options.html'"></div>
        </div>
      </div>
      <!-- filters for mobile -->
      <div class="panel" ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(8)">
        <div class="iz-inst-left-filters-container">
          <div ng-include="'Resources/components/instant-report/templates/instant-report-filters.html'"></div>
        </div>
      </div>
      <!-- pivots for mobile -->
      <div class="panel" ng-if="$izendaCompatibility.isSmallResolution()"
        ng-class="irController.getLeftPanelClass(9)">
        <div class="iz-inst-left-pivots-container">
          <div ng-include="'Resources/components/instant-report/templates/instant-report-pivots.html'"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- left panel resize grip -->
  <div class="iz-inst-left-panel-resize noselect"
    style="left: 550px" data-style="left: 550px"
    ng-class="irController.getMobileClass()"
    left-panel-selector=".iz-inst-left-panel"
    main-panel-selector=".iz-inst-main-panel"
    opened="irController.leftPanel.opened"
    ng-if="!$izendaCompatibility.isSmallResolution()"
    izenda-instant-report-left-panel-resize>
  </div>

  <!-- main panel (only for full view) -->
  <div class="iz-inst-main-panel"
    style="margin-left: 554px" data-style="margin-left: 554px"
    ng-if="!$izendaCompatibility.isSmallResolution()">
    <div ng-include="'Resources/components/instant-report/templates/instant-report-main-toolbar.html'"
      data-izenda-fit-absolute-element="top">
    </div>

    <!-- loading message -->
    <div class="izenda-vcentered-container" ng-show="irController.isLoading">
      <div class="izenda-vcentered-item">
        <img class="img-responsive" style="width: 24px;" ng-src="{{$izendaUrl.settings.urlRsPage}}?image=ModernImages.loading-grid.gif" alt="Loading..." />
      </div>
    </div>

    <!-- main panel body for full view -->
    <div class="iz-inst-mainpanel-body" ng-class="irController.activeField && irController.isLeftPanelBodyActive(0) ? 'show-options-panel' : ''"
      ng-hide="irController.isLoading"
      delta-top="20"
      izenda-fit-absolute-element>
      <!-- filters controller -->
      <div ng-include="'Resources/components/instant-report/templates/instant-report-filters.html'"></div>

      <!-- pivots controller -->
      <div ng-include="'Resources/components/instant-report/templates/instant-report-pivots.html'"></div>

      <!-- validation controller -->
      <div ng-include="'Resources/components/instant-report/templates/instant-report-validation.html'"></div>
      
      <div class="iz-inst-preview-root-container"
        droppable-accept=".datasource-field"
        on-drop="irController.addFieldToReport(arg0)"
        izenda-instant-report-field-droppable>
        <izenda-report-viewer class="iz-inst-preview-container"
          html-text="irController.previewHtml"
          empty-text="''"
          allow-col-reorder="true"
          allowed-columns-for-reorder="irController.getAllowedColumnsForReorder()"
          allow-col-remove="true"
          droppable-accept=".datasource-field"
          current-insert-column-order="irController.currentInsertColumnOrder"
          on-reorder="irController.columnReordered(arg0, arg1)"
          on-header-click="irController.selectedColumn(arg0)"
          on-remove="irController.removeColumn(arg0)"
          on-paging-click="irController.onPagingClick(arg0, arg1)">
        </izenda-report-viewer>
      </div>
    </div>

    <!-- field options for full view-->
    <div ng-include="'Resources/components/instant-report/templates/instant-report-field-options.html'"></div>
  </div>

  <!-- refresh preview button for mobile view -->
  <div ng-if="$izendaCompatibility.isSmallResolution()"
    class="btn iz-inst-matherial-refresh btn-izenda-dark"
    title="Refresh report preview"
    ng-click="irController.applyChangesMobile()">
    <span class="glyphicon"
      ng-class="irController.leftPanel.previousPanelId === irController.leftPanel.activeItem ? 'glyphicon-refresh' : 'glyphicon-share-alt horizontal-mirror'"></span>
  </div>

  <!-- splashscreen -->
  <div ng-show="irController.reportLoadingIndicatorIsVisible"
    text="$izendaInstantReportStorage.getPreviewSplashText()"
    loading-indicator-url="{{$izendaUrl.settings.urlRsPage}}?image=ModernImages.loading-grid.gif"
    parent-selector=".iz-inst-mainpanel-body"
    izenda-splash-screen>
  </div>
</div>
