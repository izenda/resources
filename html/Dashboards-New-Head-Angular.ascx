<%@ Control Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="Izenda.AdHoc" %>
<title>Dashboards</title>

<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModernStyles.jquery-ui" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.vendor.jquery-minicolors.jquery.minicolors.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.vendor.ionrangeslider.ion.rangeSlider.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.vendor.ionrangeslider.ion.rangeSlider.skinHTML5.css" />
<!-- old styles -->
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=css.shrinkable-grid.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModalDialogStyle" />
<!-- new styles -->
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.common.css.common.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.filter.css.filters.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.dashboard.css.dashboard.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=tagit" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=jquery-ui-timepicker-addon" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=components.vendor.bootstrap.css.bootstrap-datetimepicker.min.css" />
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
      font-family: Courier New, monospace;
      font-size: 11px;
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

<script type="text/javascript">
  ensureIzPidProcessed();
  window.angularPageId$ = (new Date()).getTime().toString();
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
<script type="text/javascript" src="./rp.aspx?js=ReportViewer"></script>
<script type="text/javascript" src="./rp.aspx?js=AdHocToolbarNavigation"></script>
<script type="text/javascript" src="./rp.aspx?js=moment"></script>
<script type="text/javascript" src="./rp.aspx?js=HtmlOutputReportResults"></script>
<script type="text/javascript" src="./rp.aspx?js=EditorBaseControl"></script>
<script type="text/javascript" src="./rp.aspx?js=MultilineEditorBaseControl"></script>
<script type="text/javascript" src="./rp.aspx?js=GaugeControl"></script>
<script type="text/javascript" src="./rp.aspx?js=ReportingServices"></script>
<script type="text/javascript" src="./rp.aspx?js=ReportScripting"></script>
<script type="text/javascript" src="./rp.aspx?js=CustomScripts"></script>
<script type="text/javascript" src="./rp.aspx?js=tag-it"></script>
<script type="text/javascript" src="./rp.aspx?js=jquery-ui-timepicker-addon"></script>
<script type="text/javascript" src="./rp.aspx?js=datepicker.langpack"></script>
<script type="text/javascript" src="./rp.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.ReportViewerFilters.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.FieldProperties.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.shrinkable-grid.js"></script>

<!-- load and run instant report application -->
<script src="./rp.aspx?extres=components.vendor.requirejs.require.js"></script>
<script src="./rp.aspx?extres=components.dashboard.module-loader.js"></script>

<script runat="server">
	protected override void OnInit(EventArgs e)
	{
		if (Utility.PageIsPostBack(Page))
			return;

		if (Page.Request.Params["clear"] != null)
		{
			AdHocContext.CurrentReportSet = ReportSet.InitializeNew();
			Response.Redirect(Utility.AppendIzPidParameter(Page.Request.Url.LocalPath) + "?isNew=1");
		}
	}
</script>
