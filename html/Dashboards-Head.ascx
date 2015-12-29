<%@ Control Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="Izenda.AdHoc" %>

<title>Dashboards</title>

<script runat="server">
    public string getDashboardViewer()
    {
        return AdHocSettings.DashboardViewer;
    }
    public string getDashboardDesignerUrl()
    {
        return AdHocSettings.DashboardDesignerUrl;
    }
</script>

<% if (AdHocContext.DashboardsAllowed)
   { %>

<!-- Styles Resources -->
<link rel="stylesheet" type="text/css" href="./Resources/css/report-list-modal.css" />

<!-- Styles Internal -->
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jquery-ui-1.8.21.custom2" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.custom_dashboard" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=DashboardViewer" />
<link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jqui_modified2" />
  <script type="text/javascript" src="rs.aspx?js=jQuery.jq"></script>
  <script type="text/javascript" src="./rs.aspx?js_nocache=ModernScripts.IzendaLocalization"></script>

<!-- jQuery Core -->
<script type="text/javascript" src="rs.aspx?js=jQuery.jq"></script>
<script type="text/javascript" src="rs.aspx?js=jQuery.jqui"></script>
<!-- Utils Internal -->
<script type="text/javascript" src="./rs.aspx?js=jQuery.jq_db"></script>
<script type="text/javascript" src="./rs.aspx?js=jQuery.jqui_db"></script>
<script type="text/javascript" src="rs.aspx?js=jQuery.DashboardViewer"></script>	
<script type="text/javascript" src="rs.aspx?js=jQuery.NewDashboardControls"></script>	
<script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.blockUI"></script>

<!-- Utils Resources -->
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
        /*width:100%;*/
        margin-left:0px;
    }

    .Filter div input {
        width:296px;
        margin-left:0px;
    }
    
    .Filter div input[type="checkbox"] {
        margin-left: 5px;
        width: auto;
    }
    
    .filterValue {
        padding-left:0px;
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
        height: 25px;
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
</style>

<script type="text/javascript">

	//Save and Save As code----------------------------------------------------------------------------------------------------------
	var additionalCategories = new Array();
	var prevCatValue;

	function modifyUrl(parameterName, parameterValue) {
	location.search = jqdb$.param(modifyUrlParameters(parameterName, parameterValue));
	}

	function modifyUrlParameters(parameterName, parameterValue) {
	    var queryParameters = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
	    while (m = re.exec(queryString)) {
	        queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	    }
	    queryParameters[parameterName] = parameterValue;
	    return queryParameters;
	}

	function GetCategoriesList(setRn) {
	var requestString = 'wscmd=crscategories';
	AjaxRequest('./rs.aspx', requestString, GotCategoriesList, null, 'crscategories', setRn);
	}

	function AddOptsRecursively(selObj, parent) {
	  for (var index = 0; index < parent.subs.length; index++) {
	    selObj.add(parent.subs[index].node);
	    AddOptsRecursively(selObj, parent.subs[index]);
	  }
	}

	function GotCategoriesList(returnObj, id, setRn) {
	  if (id != 'crscategories' || returnObj == undefined || returnObj == null)
	    return;
	  var fieldWithRn = document.getElementById('reportNameFor2ver');
	  var rnVal;
	  if (fieldWithRn != null) {
	    rnVal = fieldWithRn.value;
	  }
	  else if (reportName == undefined || reportName == null) {
	    rnVal = '';
	  }
	  else {
	    rnVal = reportName;
	  }
	  while (rnVal.indexOf('+') >= 0) {
	    rnVal = rnVal.replace('+', ' ');
	  }
	  var nodes = rnVal.split('\\\\');
	  var curCatName = '';
	  var curRepName = nodes[0];
	  if (nodes.length > 1) {
	    curRepName = nodes[nodes.length - 1];
	    curCatName = nodes[0];
	    for (var ccnIndex = 1; ccnIndex < nodes.length - 1; ccnIndex++)
	      curCatName += '\\' + nodes[ccnIndex];
	  }
	  var newReportName = document.getElementById('newReportName');
	  var newCategoryName = document.getElementById('newCategoryName');
	  if (setRn) {
	    newReportName.value = curRepName;
	  }
	  var catsArray = new Array();
	  catsArray[catsArray.length] = '';
	  for (var acCnt = 0; acCnt < additionalCategories.length; acCnt++)
	    catsArray[catsArray.length] = additionalCategories[acCnt];
	  if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
	    for (var index = 0; index < returnObj.AdditionalData.length; index++)
	      catsArray[catsArray.length] = returnObj.AdditionalData[index];
	  newCategoryName.options.length = 0;
	  var root = new Object();
	  root.node = null;
	  root.name = '';
	  root.path = '';
	  root.subs = new Array();
	  for (var index = 0; index < catsArray.length; index++) {
	    var subCats = catsArray[index].split('\\');
	    var indent = '';
	    var currentParent = root;
	    for (var scCnt = 0; scCnt < subCats.length; scCnt++) {
	      if (scCnt > 0)
	        indent += String.fromCharCode(160) + String.fromCharCode(160);
	      var newParent = null;
	      for (var rsCnt = 0; rsCnt < currentParent.subs.length; rsCnt++) {
	        if (currentParent.subs[rsCnt].name == subCats[scCnt]) {
	          newParent = currentParent.subs[rsCnt];
	          break;
	        }
	      }
	      if (newParent == null) {
	        newParent = new Object();
	        newParent.name = subCats[scCnt];
	        newParent.path = currentParent.path + (currentParent.path.length > 0 ? '\\' : '') + newParent.name;
	        newParent.subs = new Array();
	        var npOpt = new Option();
	        npOpt.value = newParent.path;
	        npOpt.text = indent + newParent.name;
	        while (npOpt.text.indexOf('+') >= 0)
	          npOpt.text = npOpt.text.replace('+', ' ');
	        if (npOpt.value == curCatName)
	          npOpt.selected = 'selected';
	        newParent.node = npOpt;
	        currentParent.subs[currentParent.subs.length] = newParent;
	      }
	      currentParent = newParent;
	    }
	  }
	  AddOptsRecursively(newCategoryName, root);
	  var saveAsDialog = document.getElementById('saveAsDialog');
	  var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	  saveAsDialog.style.height = windowHeight + 'px';
	  saveAsDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
	  saveAsDialog.style.display = '';
	  prevCatValue = newCategoryName.value;
	}

	function ShowSaveAsDialog() {
	additionalCategories.length = 0;
	GetCategoriesList(true);
	}

	function SaveReportAs() {
	var newRepName = document.getElementById('newReportName').value;
	var newCatName = document.getElementById('newCategoryName').value;
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	var newFullName = newRepName;
	    if (newCatName != null && newCatName != '' && newCatName != IzLocal.Res('js_Uncategorized', 'Uncategorized')) {
	    newFullName = newCatName + '\\' + newFullName;
	}
	while (newFullName.indexOf(' ') >= 0) {
	    newFullName = newFullName.replace(' ', '+');
	}
	if (fieldWithRn != null) {
	    fieldWithRn.value = newFullName;
	}
	else {
	    reportName = newFullName;
	}
	var saveAsDialog = document.getElementById('saveAsDialog');
	saveAsDialog.style.display = 'none';
	SaveReportSet();
	}

	function SaveReportSet() {
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	var rnVal;
	if (fieldWithRn != null) {
	    rnVal = fieldWithRn.value;
	}
	else {
	    rnVal = reportName;
	}
	while (rnVal.indexOf('+') >= 0) {
	    rnVal = rnVal.replace('+', ' ');
	}
	if (rnVal == null || rnVal == '') {
	    ShowSaveAsDialog();
	    return;
	}

	var formControlId = clientControlId ? formId[clientControlId] : 'aspnetForm';
	jqdb$('#' + formControlId).attr('action', jqdb$('#' + formControlId).attr('action').toString().replace(/&emptyreport=1/, ''));

	var loadingrv2 = document.getElementById('loadingrv2');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	loadingrv2.style.height = windowHeight + 'px';
	loadingrv2.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
	loadingrv2.style.display = '';
	var requestString = 'wscmd=savecurrentreportset';
	requestString += '&wsarg0=' + rnVal;
	AjaxRequest('./rs.aspx', requestString, ReportSetSaved, null, 'savecurrentreportset');
	}

	function ReportSetSaved(returnObj, id) {
	if (id != 'savecurrentreportset' || returnObj == undefined || returnObj == null || returnObj.Value == null)
	    return;
	document.getElementById('loadingrv2').style.display = 'none';
	if (returnObj.Value != 'OK') {
	    alert(returnObj.Value);
	}
	else {
	    var fieldWithRn = document.getElementById('reportNameFor2ver');
	    var rnVal;
	    if (fieldWithRn != null) {
	    rnVal = fieldWithRn.value;
	    }
	    else {
	    rnVal = reportName;
	    }
	    var newParams = modifyUrlParameters('rn', rnVal);
	    if (newParams['emptyreport'])
	        delete newParams['emptyreport'];
	    location.search = jqdb$.param(newParams);
	}
	}

	function ShowNewCatDialog() {
	document.getElementById('addedCatName').value = '';
	var saveAsDialog = document.getElementById('saveAsDialog');
	saveAsDialog.style.display = 'none';
	var newCatDialog = document.getElementById('newCatDialog');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	newCatDialog.style.height = windowHeight + 'px';
	newCatDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
	newCatDialog.style.display = '';
	}

	function AddNewCategory() {
	additionalCategories[additionalCategories.length] = document.getElementById('addedCatName').value;
	var newCatDialog = document.getElementById('newCatDialog').style.display = 'none';
	GetCategoriesList(false);
	}

	function CheckNewCatName() {
	var newCategoryName = document.getElementById('newCategoryName');
	    if (newCategoryName.value == IzLocal.Res('js_CreateNew', '(Create new)'))
	    ShowNewCatDialog();
	else
	    prevCatValue = newCategoryName.value;
	}

	function CancelSave() {
	var saveAsDialog = document.getElementById('saveAsDialog');
	saveAsDialog.style.display = 'none';
	}

	function CancelAddCategory() {
	var newCatDialog = document.getElementById('newCatDialog').style.display = 'none';
	var saveAsDialog = document.getElementById('saveAsDialog');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	saveAsDialog.style.height = windowHeight + 'px';
	saveAsDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
	saveAsDialog.style.display = '';
	var newCategoryName = document.getElementById('newCategoryName');
	newCategoryName.value = prevCatValue;
	}
	//------------------------------------------------------------------------------------------------------------------------

	// Utils
	function ApplySecurityOptions() {
	    if (typeof dashboardConfig == 'undefined')
	        return;
	    if (dashboardConfig.ReportIsReadOnly == true) {
	        jq$('.hide-readonly').hide();
	        jq$('#btnSaveDirect').attr('disabled', 'disabled');
	    }
	    if (dashboardConfig.ReportIsViewOnly == true)
	        jq$('.hide-viewonly').hide();
	    if (dashboardConfig.ReportIsLocked == true)
	        jq$('.hide-locked').hide();
	}
	//------------------------------------------------------------------------------------------------------------------------

	function FixLoadingPos() {
	var ls = document.getElementById('loadingScreen');
	var limg = document.getElementById('limg');
	var lw = document.getElementById('loadingWord');
	if (document.body == null || ls == null || limg == null || lw == null) {
	    setTimeout(FixLoadingPos, 10);
	    return;
	}
	var vSize = document.body.offsetHeight;
	ls.style.paddingTop = (vSize / 3) + 'px';
	limg.style.display = '';
	    lw.innerHTML = IzLocal.Res('js_Loading', "Loading...");
	}
	setTimeout(FixLoadingPos, 10);

	function GoToCatTab(rn) {
	jqdb$('#loadingBg')
	    .fadeIn(1000, function () {
	        jqdb$('#loadingScreen').fadeIn(400, function () {
	        window.location = '<%= getDashboardViewer() %>?rn=' + rn;
	    });
	    });
	return;
	}

    jqdb$(function () {
        jqdb$(".cbControlTab > input:button").button();
        jqdb$(".dashboard-view-button").button({ icons: { primary: 'ui-icon-search' }, text: false });
        jqdb$(".dashboard-design-button").button({ icons: { primary: 'ui-icon-gear' }, text: false });
        jqdb$(".refresh-button").button({ icons: { primary: 'ui-icon-refresh' } });
        jqdb$(".dashboard-hide-button").button({ icons: { primary: 'ui-icon-triangle-1-s' }, text: false });
        jqdb$(".dashboard-hide-button").click(function () { ToggleReport(this); });

        jqdb$("#btn-effects-apply").button();

       // jqdb$("#cdTabs").tabs({});

        jqdb$('#cdTabs .tabs-header-spacer').width(jqdb$('.btn-toolbar').width());

        jqdb$("#btn-effects-apply").click(function () {
	    var speed = parseInt(jqdb$("#tabselect-duration").val(), 10);
	    if (isNaN(speed) || speed == undefined)
	    speed = 1000;
	    var fxOptions = { duration: speed };
	    if (jqdb$("#chk-effect-height").attr("checked") == "checked")
	    fxOptions.height = "toggle";
	    if (jqdb$("#chk-effect-width").attr("checked") == "checked")
	    fxOptions.width = "toggle";
	    if (jqdb$("#chk-effect-opacity").attr("checked") == "checked")
	    fxOptions.opacity = "toggle";
	    jqdb$("#cdTabs").tabs("option", "fx", fxOptions);
	});



	var animationEnded = false;
	function ToggleReport(button) {
	    var content = jqdb$(button).parent().parent().find(".dashboard-report-content");
	    var innerContent = content.find(".report-part-container");

	    var isVisible = jqdb$(content).is(":visible");
	    var options = {};
	    var effectType = jqdb$("#effect-type").val();
	    var effectDuration = parseInt(jqdb$("#effect-duration").val());
	    if (effectDuration == undefined || isNaN(effectDuration))
	    effectDuration = 1000;

	    var chartEffectType = jqdb$("#charts-effect-type").val();
	    var chartEffectDuration = parseInt(jqdb$("#charts-duration").val());
	    if (chartEffectDuration == undefined || isNaN(chartEffectDuration))
	    chartEffectDuration = 1000;

	    animationEnded = false;
	    if (isVisible) {
	    if (chartEffectType == "") {
	        animationEnded = true;
	        jqdb$(content).hide(effectType, options, effectDuration);
	        jqdb$(button).button({ icons: { primary: 'ui-icon-triangle-1-n' }, text: false });
	        return;
	    }

	    if (jqdb$(innerContent).find("imgff").filter(function () {
        return (jqdb$(this).width() > 50 || jqdb$(this).height() > 50 || jqdb$(this).attr("usemap") != undefined)
	    }).length > 0)
	        jqdb$(innerContent).find("imgff").filter(function () {
	            return (jqdb$(this).width() > 50 || jqdb$(this).height() > 50 || jqdb$(this).attr("usemap") != undefined)
	        }).hide(chartEffectType, options, chartEffectDuration, function () {
	        if (animationEnded)
	            return;
	        animationEnded = true;
	        jqdb$(content).hide(effectType, options, effectDuration);
	        jqdb$(button).button({ icons: { primary: 'ui-icon-triangle-1-n' }, text: false });
	        });
	    else {
	        jqdb$(content).hide(effectType, options, effectDuration);
	        jqdb$(button).button({ icons: { primary: 'ui-icon-triangle-1-n' }, text: false });
	    }
	    }
	    else {
	    if (effectType == "") {
	        animationEnded = true;
	        jqdb$(content).show();
	        jqdb$(innerContent).find("imgff").filter(function () {
	            return (jqdb$(this).width() > 50 || jqdb$(this).height() > 50 || jqdb$(this).attr("usemap") != undefined)
	        }).show(chartEffectType, options, chartEffectDuration);
	        jqdb$(button).button({ icons: { primary: 'ui-icon-triangle-1-s' }, text: false });
	        return;
	    }

	    jqdb$(content).show(effectType, options, effectDuration, function () {
	        if (animationEnded)
	        return;
	        animationEnded = true;
	        jqdb$(innerContent).find("imgff").filter(function () {
	            return (jqdb$(this).width() > 50 || jqdb$(this).height() > 50 || jqdb$(this).attr("usemap") != undefined)
	        }).show(chartEffectType, options, chartEffectDuration);
	        jqdb$(button).button({ icons: { primary: 'ui-icon-triangle-1-s' }, text: false });
	    });
	    }
	}

	function FixReportsWidth() {
	    var mainDiv = document.getElementById('dashboardsDiv');
	    if (window.innerWidth >= 1050) {
	    mainDiv.style.paddingLeft = '6px';
	    mainDiv.style.paddingRight = '6px';
	    }
	    else {
	    mainDiv.style.paddingLeft = '0px';
	    mainDiv.style.paddingRight = '0px';
	    }
	    var newWidth = jqdb$("#cdTabs").width();
	    var halfWidth = (newWidth - 4 - 5 * 4) * 0.5 - 4;
	    var fullWidth = newWidth - 4 - 5 * 2;
	    jqdb$(".dashboard-content-row").each(function () {
	        var reportsInRow = jqdb$(this).find(".dashboard-part").length;
	    if (reportsInRow == 2)
	        jqdb$(this).find(".dashboard-part").css("width", halfWidth + "px");
	    else if (reportsInRow == 1)
	        jqdb$(this).find(".dashboard-part").css("width", fullWidth + "px");
	    });

	    return;

	    var newWidth = jqdb$("#cdTabs").width();
	    jqdb$(".dashboard-part-table").each(function () {
	        jqdb$(this).find(" > tbody > tr").each(function () {
	            var reportsInRow = jqdb$(this).find(".dashboard-part").length;
	        if (reportsInRow > 0) {
	            var reports = jqdb$(this).find(".dashboard-part");
	        var rowWidth = 0;
	        for (var i = 0; i < reports.length; i++)
	            rowWidth += jqdb$(reports[0]).width();
	        if (rowWidth > newWidth - 10 - 10 * (reportsInRow - 1) - 6 * reportsInRow)
	            jqdb$(this).find(".dashboard-part").css("width", (newWidth / reportsInRow - 10 * (reportsInRow - 1) - 5 * reportsInRow) + "px");
	        else
	            jqdb$(this).find(".dashboard-part").css("width", "");
	        }
	    });
	    });
	}

	jqdb$(window).resize(function (e) {
	    FixReportsWidth();
	});

	// Init

	jqdb$(window).load(function () {
	    jqdb$('#loadingScreen').fadeOut(400, function () {
	        jqdb$('#loadingBg').fadeOut(1000, function () {
	        //fixSelectsInIE();	      
	    });
	    });
	    FixReportsWidth();
	});

	fixSelectsInIE();
	function fixSelectsInIE() {
	    try {
	    var tmpStyle1 = jqdb$('select[name$="_Filters_Column"]').attr("style");
	    if (!tmpStyle1)
	        tmpStyle1 = "";
	    jqdb$('select[name$="_Filters_Column"]').css("_wa", "_blank").attr("style", tmpStyle1);
	    jqdb$('select[name$="_Filters_Column"]').css("-webkit-appearance", "none");
	    var tmpStyle2 = jqdb$('select[name$="_Filters_SelectValue"]').attr("style");
	    if (!tmpStyle2)
	        tmpStyle2 = "";
	    jqdb$('select[name$="_Filters_SelectValue"]').css("_wa", "_blank").attr("style", tmpStyle2);
	    }
	    catch (exc) { }
	}

	if (typeof (SwitchTab) != typeof (undefined))
	    SwitchTab();

	});

	function getURLParameter(name) {
	return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
    );
	}

	jqdb$(document).ready(function () {
	ApplySecurityOptions();
	var rn = getURLParameter('rn');
	if (rn != undefined && rn != '') {
	    var designDbBtn = document.getElementById('designDbBtn');
	    var href = jqdb$(designDbBtn).attr('href');
	    var separator = '?';
	    if (href.indexOf('?') >= 0)
	    separator = '&';
	    if (rn != '' && rn != null && rn != 'null')
	    href += separator + 'rn=' + rn;
	    designDbBtn.setAttribute('href', href);
	}

	jqdb$('#addDashboardLink').click(function () {
	    jqdb$(location).attr('href', '<%= getDashboardDesignerUrl() %>?clear=1');
	});
    try {
    ActivateNewDashboardViewerControls();
    }
    catch (e) {
    }
    AdHoc.Utility.InitGaugeAnimations(null, null, false);

	});
</script>

<% } %>