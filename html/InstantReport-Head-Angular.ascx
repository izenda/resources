<%@ Control Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="Izenda.AdHoc" %>
<title>Dashboards</title>
<script type="text/javascript" src="Resources/js/main.js"></script>
<script type="text/javascript">
	ensureIzPidProcessed();
	window.angularPageId$ = (new Date()).getTime().toString();
</script>
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jquery-ui"/>
<link rel="stylesheet" type="text/css" href="Resources/css/shrinkable-grid.css" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/jquery.minicolors.css" />
<link rel="stylesheet" type="text/css" href="Resources/components/common/css/common.css" />
<link rel="stylesheet" type="text/css" href="Resources/components/instant-report/css/instant-report.css" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=tagit" />

<script type="text/javascript" src="./Resources/components/vendor/custom/msie-detect.js"></script>
<script type="text/javascript" src="rs.aspx?js=Utility"></script>
<!-- url settings -->
<script type="text/javascript" src="Resources/components/vendor/jquery.minicolors.min.js"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.url-settings"></script>
<script type="text/javascript" src="rs.aspx?js=NumberFormatter"></script>
<script type="text/javascript" src="rs.aspx?js=HtmlCharts"></script>
<script type="text/javascript" src="rs.aspx?js=HtmlChartsPieLabels"></script>
<script type="text/javascript" src="rs.aspx?js=htmlcharts-more"></script>
<script type="text/javascript" src="rs.aspx?js=HtmlChartsFunnel"></script>
<script type="text/javascript" src="rs.aspx?js=AdHocServer"></script>
<script type="text/javascript" src="rs.aspx?js=ReportViewer"></script>
<script type="text/javascript" src="rs.aspx?js=ReportingServices"></script>
<script type="text/javascript" src="rs.aspx?js=ReportScripting"></script>
<script type="text/javascript" src="rs.aspx?js=CustomScripts"></script>
<script type="text/javascript" src="rs.aspx?js=moment"></script>
<script type="text/javascript" src="rs.aspx?js=EditorBaseControl"></script>
<!-- datetime -->
<link rel="stylesheet" type="text/css" href="Resources/components/vendor/bootstrap/css/bootstrap-datetimepicker.min.css" />
<script type="text/javascript" src="Resources/components/vendor/moment/moment-with-locales.min.js"></script>
<script type="text/javascript" src="Resources/components/vendor/bootstrap/js/bootstrap-datetimepicker.min.js"></script>
<script type="text/javascript" src="Resources/components/vendor/bootstrap/js/bootstrap3-typeahead.min.js"></script>
<script type="text/javascript" src="rs.aspx?js=datepicker.langpack"></script>
<script type="text/javascript" src="rs.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="rs.aspx?js=tag-it"></script>

<script type="text/javascript">
  window.urlSettings$ = UrlSettings();
  var urlSettings = window.urlSettings$;
  var url = urlSettings.urlRsPage + '?wscmd=reportviewerconfig&wsarg0=0&wsarg1=0&wsarg2=' + encodeURIComponent(urlSettings.reportInfo.fullName);
  url = appendParameterToUrl(url, 'izpid', window.izendaPageId$);
  url = appendParameterToUrl(url, 'anpid', window.angularPageId$);
  jq$.ajax(url, {
    dataType: 'json'
  }).done(function (returnObj) {
    nrvConfig = returnObj;
    nrvConfig.serverDelimiter = '?';
    if (nrvConfig.ResponseServerUrl.indexOf('?') >= 0)
      nrvConfig.serverDelimiter = '&';
    var delimiter = '';
    if (urlSettings.urlRsPage.lastIndexOf(nrvConfig.serverDelimiter) !== urlSettings.urlRsPage.length - 1)
      delimiter = nrvConfig.serverDelimiter;
    responseServer = new AdHoc.ResponseServer(urlSettings.urlRsPage + delimiter, 0);
    responseServerWithDelimeter = responseServer.ResponseServerUrl;
  });
</script>

<!-- angular -->
<script type="text/javascript">
  window.$$jQueryTemp = null;
  if (window.jQuery)
    window.$$jQueryTemp = window.jQuery;
  window.jQuery = jq$;
</script>

<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-animate.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-aria.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-cookies.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-loader.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-messages.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-resource.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-route.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-sanitize.js"></script>

<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/TweenMax.min.js"></script>
<script type="text/javascript" src="Resources/components/vendor/angular-1.5.6/angular-impress.js"></script>
<script type="text/javascript">
  if (window.$$jQueryTemp)
    window.jQuery = window.$$jQueryTemp;
</script>

<!-- common -->
<script type="text/javascript" src="Resources/components/common/module-definition.js"></script>
<script type="text/javascript" src="Resources/components/common/services/util-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/url-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/compatibility-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/rs-query-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/common-query-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/localization-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/ping-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/schedule-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/share-service.js"></script>
<script type="text/javascript" src="Resources/components/common/services/settings-service.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/bootstrap.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/autocomplete.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/bootstrap-modal.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/splashscreen.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/select-checkboxes.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/align-switcher.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/color-picker.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/datetime-picker.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/report-viewer.js"></script>
<script type="text/javascript" src="Resources/components/common/directive/utility.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/select-report-name-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/schedule-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/share-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/message-controller.js"></script>
<script type="text/javascript" src="Resources/components/common/controllers/notification-controller.js"></script>

<!-- Instant Report -->
<script type="text/javascript" src="Resources/components/instant-report/module-definition.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/services/instant-report-validation.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/services/instant-report-storage.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/services/instant-report-service.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/services/instant-report-pivot.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/services/instant-report-visualization.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/directive/instant-report-field-draggable.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/directive/instant-report-left-panel-resize.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-validation-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-data-source-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-filters-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-columns-sort.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-charts-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-format-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-schedule-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-settings-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-field-options-controller.js"></script>
<script type="text/javascript" src="Resources/components/instant-report/controllers/instant-report-pivot-controller.js"></script>

<script runat="server">
  protected override void OnInit(EventArgs e)
  {
    if (Utility.PageIsPostBack(Page))
      return;

    if (Page.Request.Params["clear"] != null)
    {
      Response.Redirect(Utility.AppendIzPidParameter(Page.Request.Url.LocalPath) + "#?new");
    }

    if (Page.Request.Params["rn"] != null)
    {
      string report = Page.Request.Params["rn"],
        query = null;
      var izpidFound = false;
      foreach (string key in Request.QueryString.AllKeys)
      {
        if (key == "rn")
          continue;
        if (key == "izpid")
          izpidFound = true;
        if (!string.IsNullOrEmpty(query))
          query += "&";
        query += string.Format("{0}={1}", key, Request.QueryString[key]);
      }
      var baseUrl = Request.Path + (!string.IsNullOrEmpty(query) ? "?" : "") + query;
      if (!izpidFound)
        baseUrl = Utility.AppendIzPidParameter(baseUrl);
      Response.Redirect(baseUrl + "#/" + report.Replace('\\', '/'));
    }
  }
</script>
