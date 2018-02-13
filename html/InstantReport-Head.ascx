<%@ Control AutoEventWireup="true" %>
<%@ Import namespace="Izenda.AdHoc" %>

<!-- Styles Resources -->
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=ModernStyles.data-sources" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=ModernStyles.charts" />

<!-- Styles Internal -->
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=ModernStyles.jquery-ui" /> 
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=ModalDialogStyle" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=jquery-ui-timepicker-addon" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=css.ModernStyles.jquery.dataTables.css" />
<link rel="stylesheet" type="text/css" href="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>css=tagit" />

<!-- jQuery Core -->
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=jQuery.jq"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=jQuery.jqui"></script>

<!-- Utils Internal -->
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.jquery.purl"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.url-settings"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=Utility"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=AdHocServer"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=NumberFormatter"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=vendor.highcharts.highcharts"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=vendor.highcharts.highcharts-more"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=vendor.highcharts.modules.funnel"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ReportViewer"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=AdHocToolbarNavigation"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=moment"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=HtmlOutputReportResults"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=EditorBaseControl"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=MultilineEditorBaseControl"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=GaugeControl"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ReportingServices"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ReportScripting"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=jquery-ui-timepicker-addon"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=datepicker.langpack"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js_nocache=ModernScripts.IzendaLocalization"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.colResizable-1.3.source"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.jquery.scrollTo.min"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.jquery.dataTables.min"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=ModernScripts.jquery.dataTables.colReorder"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=CustomScripts"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>js=tag-it"></script>

<!-- Utils Resources -->
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.ReportViewerFilters.js"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.FieldProperties.js"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.charts.js"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.datasources-search.js"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.data-sources.js"></script>
<script type="text/javascript" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>extres=js.data-sources-preview.js"></script>


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