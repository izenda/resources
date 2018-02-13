<%@ Control Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="Izenda.AdHoc" %>

<title>Instant Report</title>

<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=ModernStyles.jquery-ui" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=tagit" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=css.shrinkable-grid.css" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=components.vendor.jquery-minicolors.jquery.minicolors.css" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=components.common.css.common.css" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=components.instant-report.css.instant-report.css" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=components.vendor.bootstrap.css.bootstrap-datetimepicker.min.css" />

<script type="text/javascript">
  ensureIzPidProcessed();
</script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.url-settings"></script>
<script type="text/javascript">
  window.urlSettings$ = UrlSettings();
</script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=Utility"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=AdHocServer"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=NumberFormatter"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=vendor.highcharts.highcharts"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=vendor.highcharts.highcharts-more"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=vendor.highcharts.modules.funnel"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=AdHocServer"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ReportViewer"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ReportingServices"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ReportScripting"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=CustomScripts"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=moment"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=EditorBaseControl"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=datepicker.langpack"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=tag-it"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.shrinkable-grid.js"></script>


<!-- load and run instant report application -->
<script src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=components.vendor.requirejs.require.js"></script>
<script src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=components.instant-report.module-loader.js"></script>

<script runat="server">
	protected override void OnInit(EventArgs e)
	{
		if (Utility.PageIsPostBack(Page))
			return;

		if (Page.Request.Params["clear"] != null)
		{
			Response.Redirect(Utility.AppendIzPidParameter(Page.Request.Url.LocalPath) + "?isNew=1");
		}
	}
</script>
