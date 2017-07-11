<%@ Control AutoEventWireup="true" %>

<!-- Styles Resources -->
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModernStyles.data-sources" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModernStyles.charts" />

<!-- Styles Internal -->
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModernStyles.jquery-ui" /> 
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=jquery-ui-timepicker-addon" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?extres=css.ModernStyles.jquery.dataTables.css" />
<link rel="stylesheet" type="text/css" href="./rp.aspx?css=tagit" />

<!-- jQuery Core -->
<script type="text/javascript" src="./rp.aspx?js=jQuery.jq"></script>
<script type="text/javascript" src="./rp.aspx?js=jQuery.jqui"></script>

<!-- Utils Internal -->
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.url-settings"></script>
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
<script type="text/javascript" src="./rp.aspx?js=jquery-ui-timepicker-addon"></script>
<script type="text/javascript" src="./rp.aspx?js=datepicker.langpack"></script>
<script type="text/javascript" src="./rp.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.colResizable-1.3.source"></script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.jquery.scrollTo.min"></script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.jquery.dataTables.min"></script>
<script type="text/javascript" src="./rp.aspx?js=ModernScripts.jquery.dataTables.colReorder"></script>
<script type="text/javascript" src="./rp.aspx?js=CustomScripts"></script>
<script type="text/javascript" src="./rp.aspx?js=tag-it"></script>

<!-- Utils Resources -->
<script type="text/javascript" src="./rp.aspx?extres=js.ReportViewerFilters.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.FieldProperties.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.charts.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.datasources-search.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.data-sources.js"></script>
<script type="text/javascript" src="./rp.aspx?extres=js.data-sources-preview.js"></script>


<script type="text/javascript">
	var previewWasVisible = false;
	var updateOnDrag = true;
	var updateOnClick = true;
	var updateOnAdvancedOk = true;

	function hideAllPreview() {
		previewWasVisible = false;
		var previews = jq$(".show-preview");
		if (previews.length > 0) {
			previewWasVisible = true;
			hideFieldsPreview();
		}
	}
</script>