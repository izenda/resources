<%@ Control AutoEventWireup="true" %>

<!-- Styles Resources -->
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.data-sources" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.charts" />

<!-- Styles Internal -->
<link rel="stylesheet" type="text/css" href="rs.aspx?css=jQuery" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jquery-ui" /> 
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="Resources/css/ModernStyles/jquery.dataTables.css" />

<!-- jQuery Core -->
<script type="text/javascript" src="rs.aspx?js=jQuery.jq"></script>
<script type="text/javascript" src="rs.aspx?js=jQuery.jqui"></script>

<!-- Utils Internal -->
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
<script type="text/javascript" src="rs.aspx?js=ModernScripts.colResizable-1.3.source"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.scrollTo.min"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.dataTables.min"></script>
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.dataTables.colReorder"></script>
<script type="text/javascript" src="rs.aspx?js=CustomScripts"></script>

<!-- Utils Resources -->
<script type="text/javascript" src="./Resources/js/ReportViewerFilters.js"></script>
<script type="text/javascript" src="./Resources/js/FieldProperties.js"></script>
<script type="text/javascript" src="./Resources/js/charts.js"></script>
<script type="text/javascript" src="./Resources/js/datasources-search.js"></script>
<script type="text/javascript" src="./Resources/js/data-sources.js"></script>
<script type="text/javascript" src="./Resources/js/data-sources-preview.js"></script>


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