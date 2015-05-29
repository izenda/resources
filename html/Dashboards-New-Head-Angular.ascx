<%@ Control Language="C#" AutoEventWireup="true"%>
<title>Dashboards</title>

<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/jquery.minicolors.css"/>
<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/bootstrap-datepicker3.min.css"/>
<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/bootstrap-timepicker.min.css"/>
<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/perfect-scrollbar.css"/>
<link rel="stylesheet" type="text/css" href="Resources/components/vendor/ionrangeslider/ion.rangeSlider.css"/>
<link rel="stylesheet" type="text/css" href="Resources/components/vendor/ionrangeslider/ion.rangeSlider.skinHTML5.css"/>
<!-- old styles -->
<link rel="stylesheet" type="text/css" href="./Resources/css/shrinkable-grid.css" />
<!-- new styles -->
<link rel="stylesheet" type="text/css" href="Resources/components/common/css/common.css"/>
<link rel="stylesheet" type="text/css" href="Resources/components/filter/css/filters.css"/>
<link rel="stylesheet" type="text/css" href="Resources/components/dashboard/css/dashboard.css"/>

<!-- url settings -->
<script type="text/javascript" src="./rs.aspx?js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="./rs.aspx?js=ModernScripts.jquery.nicescroll.min"></script>
<script type="text/javascript" src="./rs.aspx?js=ModernScripts.url-settings"></script>
<script>
  // Hue rotate function
  var urlSettings = new UrlSettings();
  urlSettings.replaceRnForAngularApp();
</script>
<script type="text/javascript">
  window.jQueryTemp = null;
  if (window.jQuery)
    window.jQueryTemp = window.jQuery;
  window.jQuery = jq$;
</script>
<![if !IE]>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-animate.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-aria.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-cookies.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-impress.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-loader.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-messages.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-resource.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-route.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-sanitize.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/ngFx.js"></script>

<![endif]>
<!--[if gt IE 8]>
	<script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-animate.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-aria.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-cookies.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-impress.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-loader.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-messages.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-resource.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-route.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/angular-sanitize.js"></script>
  <script type="text/javascript" src="Resources/components/vendor/angular-1.3.14/ngFx.js"></script>
<![endif]-->
<!--[if lte IE 8]>
	<script type="text/javascript" src="Resources/components/vendor/angular-1.2.27/angular.js"></script>
	<script type="text/javascript" src="Resources/components/vendor/angular-1.2.27/angular-route.js"></script>
	<script type="text/javascript" src="Resources/components/vendor/angular-1.2.27/angular-animate.js"></script>
	<script type="text/javascript" src="Resources/components/vendor/angular-1.2.27/angular-cookies.js"></script>
	<script type="text/javascript" src="Resources/components/vendor/angular-impress.js"></script>
<![endif]-->

<script type="text/javascript">
  if (window.jQueryTemp)
    window.jQuery = window.jQueryTemp;
</script>

<script type="text/javascript" src="rs.aspx?js=Utility"></script>
<script type="text/javascript" src="rs.aspx?js=AdHocServer"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.url-settings"></script>
<script type="text/javascript" src="rs.aspx?js=NumberFormatter"></script>
<script type="text/javascript" src="rs.aspx?js=HtmlCharts"></script>
<script type="text/javascript" src="rs.aspx?js=htmlcharts-more"></script>
<script type="text/javascript" src="rs.aspx?js=HtmlChartsFunnel"></script>
<script type="text/javascript" src="rs.aspx?js=ModalDialog"></script>
<script type="text/javascript" src="rs.aspx?js=ReportViewer"></script>
<script type="text/javascript" src="rs.aspx?js=AdHocToolbarNavigation"></script>
<script type="text/javascript" src="rs.aspx?js=moment"></script>
<script type="text/javascript" src="rs.aspx?js=HtmlOutputReportResults"></script>
<script type="text/javascript" src="rs.aspx?js=EditorBaseControl"></script>
<script type="text/javascript" src="rs.aspx?js=MultilineEditorBaseControl"></script>
<script type="text/javascript" src="rs.aspx?js=GaugeControl"></script>
<script type="text/javascript" src="rs.aspx?js=ReportScripting"></script>
<script type="text/javascript" src="rs.aspx?js=datepicker.langpack"></script>
<script type="text/javascript" src="rs.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>
<script>
  // legacy code: needed for correct report handlers work
  var urlSettings = new UrlSettings();
  jq$.ajax(urlSettings.urlRsPage + '?wscmd=reportviewerconfig&wsarg0=0&wsarg1=0&wsarg2=' + urlSettings.reportInfo.fullName, {
    dataType: 'json'
  }).done(function (returnObj) {
    nrvConfig = returnObj;
    nrvConfig.serverDelimiter = '?';
    if (nrvConfig.ResponseServerUrl.indexOf('?') >= 0)
      nrvConfig.serverDelimiter = '&';
    urlSettings = new UrlSettings(nrvConfig.ResponseServerUrl);
    var delimiter = '';
    if (urlSettings.urlRsPage.lastIndexOf(nrvConfig.serverDelimiter) != urlSettings.urlRsPage.length - 1)
      delimiter = nrvConfig.serverDelimiter;
    responseServer = new AdHoc.ResponseServer(urlSettings.urlRsPage + delimiter, 0);
    responseServerWithDelimeter = responseServer.ResponseServerUrl;
  });
</script>

<!-- Utils Resources -->
<script type="text/javascript" src="./Resources/js/ReportViewerFilters.js"></script>
<script type="text/javascript" src="./Resources/js/Schedule.js"></script>
<script type="text/javascript" src="./Resources/js/Share.js"></script>
<script type="text/javascript" src="./Resources/js/FieldProperties.js"></script>
<script type="text/javascript" src="./Resources/js/shrinkable-grid.js"></script>
<script type="text/javascript" src="./Resources/js/ContentRefreshIntervals.js"></script>
<style type="text/css">
  .izenda-toolbar {
    display: none !important;
  }

  table.simpleFilters td.filterColumn {
    background-color: #CCEEFF;
    margin-top: 10px;
    overflow: hidden;
  }

  #dsUlList {
    margin: 5px 0 2px;
  }

  #fieldsCtlTable {
    border-spacing: 0;
    margin-bottom: 1px;
  }

  .Filter div input, select {
    width: 100%;
    margin-left: 0px;
  }

  .Filter div input {
    width: 296px;
    margin-left: 0px;
  }

    .Filter div input[type="checkbox"] {
      margin-left: 5px;
      width: auto;
    }

  .filterValue {
    padding-left: 0px;
  }

  .pivot-selector select {
    padding: 5px;
    min-width: 300px;
    width: auto;
  }

  .pivot-selector div {
    margin: 5px 0px;
  }

  .field-selector-container {
    float: left;
    width: 400px;
    height: 200px;
    overflow-y: scroll;
    border: 1px solid #aaa;
  }

  .f-button {
    margin: 2px;
    display: inline-block;
  }

  .f-button a {
    line-height: 25px;
    vertical-align: baseline;
    border: none;
    padding: 7px;
    color: white !important;
    text-decoration: none !important;
    position: relative;
    display: inline-block;
  }

  .f-button .text {
    margin-right: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
  }

  .f-button .blue {
  }

  .f-button .gray {
  }

  .f-button.left {
    float: left;
  }

  .f-button.right {
    float: right;
  }

  .f-button.middle .text {
    display: none;
  }

  .f-button a img {
    margin-right: 12px;
    margin-right: 2px;
    width: 25px;
    height: 25px;
    vertical-align: bottom;
    position: relative;
    top: 1px;
  }

  .f-button a.gray, .f-button a.gray.disabled:hover {
    background-color: #A0A0A0;
  }

  .f-button a.gray:hover {
    background-color: #C0C0C0;
  }

  .f-button a.blue, .f-button a.blue.disabled:hover {
    background-color: #1C4E89;
  }

  .f-button a.blue:hover {
    background-color: #32649e;
  }

  .f-button a.disabled {
    opacity: .5;
    cursor: default;
  }

  .visibility-pivots {
    display: none;
  }

.multi-valued-check-advanced {
    display: inline-block;
    background-color: white;
    line-height: 10px;
    vertical-align: baseline;
    text-align: center;
    border: 1px solid #777;
    height: 11px;
    width: 11px;
    position: relative;
    padding: 0px;
}

.multi-valued-check-advanced label {
    font-family:Courier New, monospace;
    font-size:11px;
    background: none;
    vertical-align: top;
    text-align: center;
    line-height: 11px;
    height: 12px;
    width: 12px;
    cursor: pointer;
    padding-top: 0px;
    border: none;
    left: -1px;
    margin: 0px;
} 
</style>

<script type="text/javascript" src="Resources/components/vendor/jquery.minicolors.js"></script>
<script type="text/javascript" src="Resources/components/vendor/ionrangeslider/ion.rangeSlider.js"></script>
<script type="text/javascript" src="Resources/components/vendor/bootstrap/js/bootstrap-datepicker.min.js"></script>
<script type="text/javascript" src="Resources/components/vendor/bootstrap/js/bootstrap-timepicker.js"></script>
<script type="text/javascript" src="Resources/components/vendor/perfect-scrollbar.js"></script>

<!-- common -->
<script type="text/javascript" src="Resources/components/common/module-definition.js"></script>
<script type="text/javascript" src="Resources/components/common/services/url-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/compatibility-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/rs-query-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/common-query-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/settings-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/ping-service.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/color-picker.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/toggle-button.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/datetime-picker.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/select-checkboxes.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/bootstrap-modal.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/switcher.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/select-report-name-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/select-report-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/schedule-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/share-controller.js"></script>

<!-- filters -->
<script type="text/javascript" src="Resources/components/filter/module-definition.js"></script>
<script type="text/javascript" src="Resources/components/filter/services/filters-query-service.js"></script>
<!--<script type="text/javascript" src="Resources/components/filter/controllers/filters-controller.js"></script>-->
<!-- Use old filters : -->
<script type="text/javascript" src="Resources/components/custom/controllers/filters-legacy-controller.js"></script>
<!-- HERE IS EXAMPLE FOR CONTROL CUSTOMIZATION: -->
<!--<script type="text/javascript" src="Resources/components/custom/controllers/filters-custom-controller.js"></script>-->

<!-- dashboard -->
<script type="text/javascript" src="Resources/components/dashboard/module-definition.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/services/background-service.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/services/dashboard-query-service.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/services/toolbar-query-service.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/directives/toolbar-links-panel.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/directives/dashboard-background.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/directives/tile-top-slider.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/controllers/tile-controller.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/controllers/dashboard-controller.js"></script>
<script type="text/javascript" src="Resources/components/dashboard/controllers/toolbar-controller.js"></script>
