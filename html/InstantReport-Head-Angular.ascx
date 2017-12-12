<%@ Control Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="Izenda.AdHoc" %>
<title>Instant Report</title>

<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModernStyles.jquery-ui" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=tagit" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=css.shrinkable-grid.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.vendor.jquery-minicolors.jquery.minicolors.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.common.css.common.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.instant-report.css.instant-report.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.vendor.bootstrap.css.bootstrap-datetimepicker.min.css" />

<script type="text/javascript">
  ensureIzPidProcessed();
</script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.url-settings"></script>
<script type="text/javascript">
  window.urlSettings$ = UrlSettings();
</script>
<script type="text/javascript" src="./rp.aspx?js=Utility"></script>
<script type="text/javascript" src="./rp.aspx?js=AdHocServer"></script>
<script type="text/javascript" src="./rp.aspx?js=NumberFormatter"></script>
<script type="text/javascript" src="./rp.aspx?js=vendor.highcharts.highcharts"></script>
<script type="text/javascript" src="./rp.aspx?js=vendor.highcharts.highcharts-more"></script>
<script type="text/javascript" src="./rp.aspx?js=vendor.highcharts.modules.funnel"></script>
<script type="text/javascript" src="./rp.aspx?js=AdHocServer"></script>
<script type="text/javascript" src="./rp.aspx?js=ReportViewer"></script>
<script type="text/javascript" src="./rp.aspx?js=ReportingServices"></script>
<script type="text/javascript" src="./rp.aspx?js=ReportScripting"></script>
<script type="text/javascript" src="./rp.aspx?js=CustomScripts"></script>
<script type="text/javascript" src="./rp.aspx?js=moment"></script>
<script type="text/javascript" src="./rp.aspx?js=EditorBaseControl"></script>
<script type="text/javascript" src="./rp.aspx?js=datepicker.langpack"></script>
<script type="text/javascript" src="./rp.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="./rp.aspx?js=tag-it"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.shrinkable-grid.js"></script>


<!-- load and run instant report application -->
<script src="./rp.aspx?extres=components.vendor.babel.polyfill.min.js"></script>
<script src="./rp.aspx?extres=components.vendor.requirejs.require.js"></script>
<script src="./rp.aspx?extres=components.instant-report.module-loader.js"></script>

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
