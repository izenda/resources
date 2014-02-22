<%@ Control AutoEventWireup="true" %>

	<link rel="stylesheet" href="/Resources/css/data-sources.css" type="text/css" />
	<link rel="stylesheet" href="rs.aspx?css=ModernStyles.jquery.dataTables" type="text/css" />
	<script type="text/javascript" src="rs.aspx?js=ModernScripts.json2"></script>
	<script type="text/javascript" src="/Resources/js/data-sources.js"></script>
	<script type="text/javascript" src="/Resources/js/data-sources-preview.js"></script>
	<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery-ui-1.9.2.animations.min"></script>
	<link rel="stylesheet" type="text/css" href="/Resources/css/charts.css" />
	<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jquery-ui" />
	<script type="text/javascript" src="./rs.aspx?js=ModernScripts.jquery-ui-1.8.21.custom.min"></script>
	<script type="text/javascript" src="./rs.aspx?js=ModernScripts.jquery.scrollTo.min"></script>
	<script type="text/javascript" src="./rs.aspx?js=ModernScripts.jquery.dataTables.min"></script>
	<script type="text/javascript" src="./rs.aspx?js=ModernScripts.jquery.dataTables.colReorder"></script>
	<script type="text/javascript" src="./rs.aspx?js=ModernScripts.colResizable-1.3.source"></script>
	<script type="text/javascript" src="/Resources/js/charts.js"></script>
	<script type="text/javascript" src="/Resources/js/datasources-search.js"></script>
	<script type="text/javascript" src="./rs.aspx?js=jQuery.jq"></script>	
	<script type="text/javascript" src="./rs.aspx?js=Utility"></script>
	<script type="text/javascript" src="./rs.aspx?js=AdHocServer"></script>
	<script type="text/javascript" src="./rs.aspx?js=EditorBaseControl"></script>
	<script type="text/javascript" src="/Resources/js/FieldProperties.js"></script>
    <script type="text/javascript" src="./rs.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>

	<script type="text/javascript">
		var previewWasVisible = false;
        var updateOnDrag = true;
        var updateOnClick = false;
        var updateOnAdvancedOk = true;

		function hideAllPreview() {
			previewWasVisible = false;
			var previews = $(".show-preview");
			if (previews.length > 0) {
				previewWasVisible = true;
				hideFieldsPreview();
			}
		}
	</script>
