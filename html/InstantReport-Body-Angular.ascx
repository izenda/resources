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
    ng-class="irController.leftPanel.opened ? '' : 'collapsed'">
    <div class="iz-inst-sidepanel-buttons noselect">
      <div class="iz-inst-sidepanel-button datasources"
        ng-class="irController.getLeftPanelClass(0)"
        ng-click="irController.setLeftPanelActiveItem(0)">
        data
      </div>
      <div class="iz-inst-sidepanel-button charts"
        ng-class="irController.getLeftPanelClass(1)"
        ng-click="irController.setLeftPanelActiveItem(1)">
        charts
      </div>
      <div class="iz-inst-sidepanel-button format"
        ng-class="irController.getLeftPanelClass(2)"
        ng-click="irController.setLeftPanelActiveItem(2)">
        format
      </div>
      <div class="iz-inst-sidepanel-button schedule"
        ng-class="irController.getLeftPanelClass(3)"
        ng-click="irController.setLeftPanelActiveItem(3)"
        ng-show="irController.showScheduleControls">
        schedule
      </div>
      <div class="iz-inst-sidepanel-button access"
        ng-class="irController.getLeftPanelClass(4)"
        ng-click="irController.setLeftPanelActiveItem(4)"
        ng-show="irController.showSharingControl">
        sharing
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
    </div>
  </div>

  <!-- left panel resize grip -->
  <div class="iz-inst-left-panel-resize noselect"
    left-panel-selector=".iz-inst-left-panel"
    main-panel-selector=".iz-inst-main-panel"
    opened="irController.leftPanel.opened"
    izenda-instant-report-left-panel-resize>
  </div>

  <!-- main panel -->
  <div class="iz-inst-main-panel">
    <div class="iz-inst-mainpanel-menu">
      <div class="btn-group" role="group" aria-label="Toggle left panel" title="Toggle left panel"
        ng-click="irController.toggleLeftPanel()">
        <button type="button" class="btn btn-default">
          <span class="glyphicon glyphicon-chevron-left"
            ng-class="irController.leftPanel.opened ? 'glyphicon-chevron-left' : 'glyphicon-chevron-right'"></span>
        </button>
      </div>

      <!-- refresh button -->
      <div class="btn-group">
        <button class="btn btn-izenda-dark" title="Refresh report preview"
          ng-click="irController.applyChanges()"
          ng-disabled="!irController.isValid">
          <span class="glyphicon glyphicon-refresh"></span>&nbsp;Update Results
        </button>
      </div>
      <div class="btn-group">
        <button class="btn btn-default dropdown-toggle" title="Set records count for preview"
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          ng-disabled="!irController.isValid">
          <span>Preview Records: </span>
          <span ng-bind="(irController.previewTop > 0 ? irController.previewTop + ' ' : 'All ')"></span>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a ng-click="irController.setPreviewTop(10)">10
          </a></li>
          <li><a ng-click="irController.setPreviewTop(100)">100
          </a></li>
          <li><a ng-click="irController.setPreviewTop(1000)">1000
          </a></li>
          <li><a ng-click="irController.setPreviewTop(10000)">10000
          </a></li>
          <li><a ng-click="irController.setPreviewTop(irController.top)"
            ng-show="irController.top > 0"
            ng-bind="'Record count from options: ' + irController.top"></a></li>
          <li><a ng-click="irController.setPreviewTop()">All records
          </a></li>
        </ul>
      </div>

      <!-- save -->
      <div class="btn-group"
        ng-show="irController.showSaveControls">
        <button type="button" class="btn btn-default" title="Save report"
          ng-click="irController.saveReport(false)"
          ng-disabled="!irController.isValid">
          <span class="glyphicon svg-icon icon-16 save"></span>
        </button>
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          ng-disabled="!irController.isValid">
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a ng-click="irController.saveReport(false)"
            ng-disabled="!irController.isValid">
            <span class="glyphicon svg-icon icon-16 save"></span>
            &nbsp;
            <b>Save</b>
            <br />
            <span class="menu-item-description">Save changes to the report for everyone it is shared with</span>
          </a></li>
          <li><a ng-click="irController.saveReport(true)"
            ng-disabled="!irController.isValid">
            <span class="glyphicon svg-icon icon-16 save"></span>
            &nbsp;
            <b>Save as</b>
            <br />
            <span class="menu-item-description">Save a copy with a new name, keeping the original intact</span>
          </a></li>
        </ul>
      </div>
      
      <!-- Go to report editor button -->
      <div class="btn-group">
        <button type="button" class="btn btn-default" title="Open report in Report Designer"
          ng-click="irController.openReportInDesigner()"
          ng-disabled="irController.activeFields.length === 0">
          <span class="glyphicon glyphicon-pencil"></span>
        </button>
      </div>

      <!-- print -->
      <div class="btn-group"
        ng-show="irController.allowedPrintEngine !== 'None'">
        <button type="button" class="btn btn-default" title="Print report"
          ng-disabled="!irController.isValid"
          ng-click="irController.printReport(irController.allowedPrintEngine.indexOf('Html2Pdf') > 0 ? 'pdf' : 'html')">
          <span class="glyphicon svg-icon icon-16 print"></span>
        </button>
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          ng-disabled="!irController.isValid">
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a ng-disabled="!irController.isValid"
            ng-click="irController.printReport('html')"
            ng-show="irController.allowedPrintEngine === 'Html' || irController.allowedPrintEngine === 'Html2PdfAndHtml'">
            <img class="icon-16" src="rs.aspx?image=ModernImages.print-32.png" alt="">
            &nbsp;
            <b>Print HTML</b>
            <br />
            <span class="menu-item-description">Print directly from your browser, the fastest way for modern browsers</span>
          </a></li>
          <li><a ng-disabled="!irController.isValid"
            ng-click="irController.printReport('pdf')"
            ng-show="irController.allowedPrintEngine === 'Html2Pdf' || irController.allowedPrintEngine === 'Html2PdfAndHtml'">
            <img class="icon-16" src="rs.aspx?image=ModernImages.pdf-32.png" alt="">
            &nbsp;
            <b>HTML-powered PDF</b>
            <br />
            <span class="menu-item-description">One-file compilation of all the report's pages</span>
          </a></li>
        </ul>
      </div>

      <!-- export -->
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          ng-disabled="!irController.isValid">
          <span class="glyphicon svg-icon icon-16 glyphicon-log-out"></span>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a ng-disabled="!irController.isValid"
            ng-click="irController.exportReport('excel')">
            <img class="icon-16" src="rs.aspx?image=ModernImages.xls-32.png" alt=""/>
            &nbsp;
            <b>Export to Excel</b>
            <br />
            <span class="menu-item-description">File for Microsoft's spreadsheet application</span>
          </a></li>
          <li><a ng-disabled="!irController.isValid"
            ng-click="irController.exportReport('word')">
            <img class="icon-16" src="rs.aspx?image=ModernImages.word-32.png" alt="">
            &nbsp;
            <b>Word document</b>
            <br />
            <span class="menu-item-description">File for Microsoft's word processor, most widely-used office application</span>
          </a></li>
          <li><a ng-disabled="!irController.isValid"
            ng-click="irController.exportReport('csv')">
            <img class="icon-16" src="rs.aspx?image=ModernImages.csv-32.png" alt="">
            &nbsp;
            <b>CSV</b>
            <br />
            <span class="menu-item-description">Stores tabular data in text file, that can be used in Google Docs</span>
          </a></li>
          <li><a ng-disabled="!irController.isValid"
            ng-click="irController.exportReport('xml')">
            <img class="icon-16" src="rs.aspx?image=ModernImages.xml-32.png" alt="">
            &nbsp;
            <b>XML</b>
            <br />
            <span class="menu-item-description">Both human-readable and machine-readable text file</span>
          </a></li>
        </ul>
      </div>

      <!-- email -->
      <div class="btn-group">
        <button type="button" class="btn btn-default" title="Email report from client"
          ng-disabled="!irController.isValid || !irController.isExistingReport"
          ng-click="irController.sendReportLinkEmail()"
          ng-attr-title="{{irController.isExistingReport ? 'Send email with report link' : 'You must save a report before it can be emailed'}}">
          <span class="glyphicon svg-icon icon-16 email"></span>
        </button>
      </div>

      <!-- filters -->
      <div class="btn-group">
        <button type="button" class="btn btn-default" title="Edit Report Filters"
          ng-disabled="irController.activeFields.length === 0"
          ng-click="irController.openFiltersPanel()"
          ng-class="irController.filtersPanelOpened ? 'active' : ''"
          droppable-accept=".datasource-field"
          on-drop="irController.addFilter(arg0)"
          izenda-instant-report-field-droppable>
          <span class="glyphicon glyphicon-filter"></span>
          <span class="highlight-notification-round"
            ng-show="irController.filtersCount > 0"
            ng-bind="irController.filtersCount"></span>
        </button>
      </div>
    </div>
    
    <!-- loading message -->
    <div class="izenda-vcentered-container" ng-show="irController.isLoading">
      <div class="izenda-vcentered-item">
        <img class="img-responsive" ng-src="{{$izendaUrl.settings.urlRsPage}}?image=ModernImages.loading-grid.gif" alt="Loading..." />
      </div>
    </div>

    <div class="iz-inst-mainpanel-body" ng-class="irController.activeField && irController.isLeftPanelBodyActive(0) ? 'show-options-panel' : ''"
      ng-hide="irController.isLoading">
      <!-- filters controller -->
      <div ng-include="'Resources/components/instant-report/templates/instant-report-filters.html'"></div>

      <!-- validation controller -->
      <div ng-include="'Resources/components/instant-report/templates/instant-report-validation.html'"></div>

      <div class="iz-inst-preview-root-container"
        droppable-accept=".datasource-field"
        on-drop="irController.addFieldToReport(arg0)"
        izenda-instant-report-field-droppable>
        <div class="iz-inst-preview-container"
          html-text="irController.previewHtml"
          allow-col-reorder="true"
          on-reorder="irController.columnReordered(arg0, arg1)"
          empty-text="''"
          on-header-click="irController.selectedColumn(arg0)"
          izenda-report-viewer>
        </div>
      </div>
    </div>
    <!-- field options -->
    <div ng-include="'Resources/components/instant-report/templates/instant-report-field-options.html'"></div>
  </div>
</div>
