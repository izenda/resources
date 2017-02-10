<%@ Control Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="Izenda.AdHoc" %>
<title>Dashboards</title>
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jquery-ui" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=tagit" />
<link rel="stylesheet" type="text/css" href="Resources/css/shrinkable-grid.css" />
<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/jquery.minicolors.css" />
<link rel="stylesheet" type="text/css" href="Resources/components/common/css/common.css" />
<link rel="stylesheet" type="text/css" href="Resources/components/instant-report/css/instant-report.css" />
<link rel="stylesheet" type="text/css" href="Resources/components/vendor/bootstrap/css/bootstrap-datetimepicker.min.css" />

<script type="text/javascript" src="rs.aspx?js=AdHocQuery"></script>
<script type="text/javascript">
  ensureIzPidProcessed();
</script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.url-settings"></script>
<script type="text/javascript">
  window.urlSettings$ = UrlSettings();
</script>
<script type="text/javascript" src="rs.aspx?js=Utility"></script>
<script type="text/javascript" src="rs.aspx?js=AdHocServer"></script>
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
<script type="text/javascript" src="Resources/components/vendor/moment/moment-with-locales.min.js"></script>
<script type="text/javascript" src="Resources/components/vendor/bootstrap/js/bootstrap-datetimepicker.min.js"></script>
<script type="text/javascript" src="Resources/components/vendor/bootstrap/js/bootstrap3-typeahead.min.js"></script>
<script type="text/javascript" src="rs.aspx?js=datepicker.langpack"></script>
<script type="text/javascript" src="rs.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="rs.aspx?js=tag-it"></script>

<!-- load and run instant report application -->
<script src="Resources/components/vendor/requirejs/require.js" data-main="Resources/components/instant-report/module-loader.js"></script>

<script runat="server">
    protected override void OnInit(EventArgs e)
    {
      if (Utility.PageIsPostBack(Page))
        return;

      if (Page.Request.Params["clear"] != null)
      {
        Response.Redirect(Utility.AppendIzPidParameter(Page.Request.Url.LocalPath) + "#!?new");
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
        Response.Redirect(baseUrl + "#!/" + report.Replace("\\", "%5c"));
      }
    }
</script>
