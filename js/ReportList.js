var lastlySelectedCat = 0;
var tabNames = new Array();
var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

//Ajax request for JSON methods-----------------------------------------------------------
function AjaxRequest(url, parameters, callbackSuccess, callbackError, id) {
	var thisRequestObject = null;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
	thisRequestObject.requestId = id;
	thisRequestObject.onreadystatechange = ProcessRequest;

	thisRequestObject.open('GET', url + '?' + parameters, true);
	thisRequestObject.send();

	function DeserializeJson() {
		var responseText = thisRequestObject.responseText;
		while (responseText.indexOf('"\\/Date(') >= 0) {
			responseText = responseText.replace('"\\/Date(', 'eval(new Date(');
			responseText = responseText.replace(')\\/"', '))');
		}
		if (responseText.charAt(0) != '[' && responseText.charAt(0) != '{')
			responseText = '{' + responseText + '}';
		var isArray = true;
		if (responseText.charAt(0) != '[') {
			responseText = '[' + responseText + ']';
			isArray = false;
		}
		var retObj = eval(responseText);
		if (!isArray)
			return retObj[0];
		return retObj;
	}

	function ProcessRequest() {
		if (thisRequestObject.readyState == 4) {
			if (thisRequestObject.status == 200 && callbackSuccess) {
				callbackSuccess(DeserializeJson(), thisRequestObject.requestId, parameters);
			}
			else if (callbackError) {
				callbackError(thisRequestObject);
			}
		}
	}
}

//Delete ReportSet methods--------------------------------------------------------------------
function ud() { }

function RL_DeleteNew(message, reportName) {
	var userData = new ud();
	userData.reportName = reportName;
	modal_confirm(message, userData, RL_DeleteCallbackNew);
}

function RL_DeleteCallbackNew(userData, isConfirmed) {
	if (isConfirmed) {
		ShowContentLoading(function () { PerformDelete(userData); }, IzLocal.Res('js_Deleting', 'Deleting...'));
	}
}

function PerformDelete(userData) {
	var requestString = 'wscmd=deletereportset';
	requestString += '&wsarg0=' + userData.reportName;
	AjaxRequest('./rs.aspx', requestString, ReportSetDeleted, null, 'deletereportset');
}

function ReportSetDeleted(returnObj, id) {
	if (id != 'deletereportset')
		return;
	RL_SearchReports();
}

//Elements UI events methods-----------------------------------------------------------------
var searchInputTimer;
var searchKeyword = '';

function ShowHideCategory(catId) {
	var catDiv = document.getElementById(catId);
	if (catDiv.style.display == 'none')
		catDiv.style.display = '';
	else
		catDiv.style.display = 'none';
}

function RL_FocusSearch(searchBox) {
	if (searchBox.value == IzLocal.Res('js_Search', 'Search')) {
		searchBox.value = "";
		searchBox.style.color = "#000000";
	}
}

function RL_BlurSearch(searchBox) {
	if (searchBox.value == "") {
		searchBox.value = IzLocal.Res('js_Search', 'Search');
		searchBox.style.color = "#B0B0B0";
	}
}

function RL_SearchReports() {
	GetReports(searchKeyword, tabNames[lastlySelectedCat]);
}

function RL_SearchInputStartTimeout(searchString) {
	jq$("#RL_SearchingIcon").css("display", "none");
	searchKeyword = searchString;
	clearTimeout(searchInputTimer);
	jq$("#RL_SearchingIcon").css("display", "");
	searchInputTimer = setTimeout(RL_SearchReports, 1000);
}

//Exchange data with server and list rendering methods--------------------------------------------
var UseDefaultDialogs;
var responseServer;
var nrlConfigObj;
var currentThId = 0;

function GetUrlParam(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null)
		return "";
	else
		return results[1];
}

function GetConfig() {
	var instant = GetUrlParam('instant');
	if (instant != '1')
		instant = '0';
	var requestString = 'wscmd=reportlistconfig&wsarg0=' + instant;
	AjaxRequest('./rs.aspx', requestString, AcceptConfig, null, 'reportlistconfig');
}

function AcceptConfig(returnObj, id) {
	if (id != 'reportlistconfig' || returnObj == undefined || returnObj == null)
		return;
	nrlConfigObj = returnObj;
	if (!nrlConfigObj.Operational) {
		window.location = nrlConfigObj.SettingsLink;
		return;
	}
	UseDefaultDialogs = nrlConfigObj.UseDefaultDialogs;
	responseServer = new AdHoc.ResponseServer(nrlConfigObj.ResponseServerUrl, nrlConfigObj.TimeOut);
	var reportDesignerLink = jq$("#newReportLink");
	var dashboardDesignerLink = jq$("#newDashboardLink");
	if (reportDesignerLink != null) {
		reportDesignerLink.href = nrlConfigObj.ReportDesignerLink;
		reportDesignerLink.target = nrlConfigObj.ReportDesignerTarget;
	}
	if (dashboardDesignerLink != null)
		dashboardDesignerLink.href = nrlConfigObj.DashboardDesignerLink;
	var irdivlink = document.getElementById('irdivlink');
	if (irdivlink != null)
		irdivlink.onclick = function () { window.location = nrlConfigObj.InstantReportUrl; };
	GetReports(searchKeyword, '');
}

function GetReports(keyword, category) {
	var requestString = 'wscmd=reportlistdatalite';
	if (keyword == null)
		keyword = '';
	requestString += '&wsarg0=' + category + '&wsarg1=' + keyword + '&wsarg2=1';
	AjaxRequest('./rs.aspx', requestString, AcceptReports, GetReportsFail, 'reportlistdatalite');
}

function LeftTabClicked(tabClicked, tabsNum) {
	for (var index = 0; index < tabsNum; index++) {
		jq$('#ltab' + index).removeClass('selected');
	}
	//jq$('#tabs').tabs({ selected: tabClicked });
	jq$('#ltab' + tabClicked).addClass('selected');
	lastlySelectedCat = tabClicked;
}

function GetReportsFail(returnObj) {
	if (returnObj.requestId != 'reportlistdatalite') {
		return;
	}
	var startEx = returnObj.responseText.indexOf('<' + '!' + '-' + '-');
	if (startEx < 0) {
		return;
	}
	var exMsg = returnObj.responseText.substr(startEx + 4, returnObj.responseText.length - startEx - 7);
	var reportsDiv = document.getElementById('reportListDiv');
	jq$("#RL_SearchingIcon").css("display", "none");
	jq$("#loadingDiv").css("display", "none");
	reportsDiv.innerHTML = exMsg;
	document.getElementById('reportListDiv').style.visibility = 'visible';
}

function IsSameSubcategory(original, refCategory, refSubcategories) {
	if (original == null || refCategory == null || refSubcategories == null)
		return false;
	var originalSubcategories = original.split(nrlConfigObj.CategoryCharacter);
	if (originalSubcategories[0] != refCategory)
		return false;
	for (var i = 1; i < originalSubcategories.length; i++)
		if (refSubcategories.length < i || originalSubcategories[i] != refSubcategories[i - 1])
			return false;
	return true;
}

function AcceptReports(returnObj, id, parameters) {
	if (id != 'reportlistdatalite' || returnObj == undefined || returnObj == null ||
		  returnObj.ReportSets == undefined || returnObj.ReportSets == null) {
		jq$("#RL_SearchingIcon").css("display", "none");
		jq$("#loadingDiv").css("display", "none");
		return;
	}
	var content = '';
	var leftContent = '';
	var tabs = new Array();
	var catsWithSubcats = [];
	if (returnObj.ReportSets.length == 0 && (parameters.toString().match(/wsarg1=./) == null || parameters.toString().match(/wsarg1=./) == 'wsarg1=&')) {
		jq$("#loadingDiv").css("display", "none");
		jq$("#addInstantReportContainerDiv").css("display", "");
		ShowContentLoading(setTimeout(function () { window.location = nrlConfigObj.ReportDesignerLink; }, 11000), IzLocal.Res('js_NoReportsCurrentlyExistMessage', 'No reports currently exist. Please create and save at least one in the report designer.<br />Redirecting to the Report Designer in 10 seconds.'));
		return;
	} else {
		for (var rCnt1 = 0; rCnt1 < returnObj.ReportSets.length; rCnt1++) {
			var catName = returnObj.ReportSets[rCnt1].CategoryFull;
			if (catName == null || catName == '')
				catName = IzLocal.Res('js_Uncategorized', 'Uncategorized');
			var tabIndex = -1;
			for (var tabCnt1 = 0; tabCnt1 < tabs.length; tabCnt1++)
				if (returnObj.ReportSets[rCnt1].CategoryFull == tabs[tabCnt1].CategoryFull) {
					tabIndex = tabCnt1;
					break;
				}

			if (tabIndex < 0) {
				tabIndex = tabs.length;
				tabs[tabIndex] = new Object();
				tabs[tabIndex].TabName = catName.lastIndexOf(nrlConfigObj.CategoryCharacter) > 0 ? catName.substring(catName.lastIndexOf(nrlConfigObj.CategoryCharacter) + 1) : catName;
				tabs[tabIndex].Category = catName.lastIndexOf(nrlConfigObj.CategoryCharacter) > 0 ? catName.substring(0, catName.lastIndexOf(nrlConfigObj.CategoryCharacter)) : catName;
				tabs[tabIndex].CategoryFull = returnObj.ReportSets[rCnt1].CategoryFull;
				tabs[tabIndex].Reports = new Array();
				tabNames[tabIndex] = returnObj.ReportSets[rCnt1].CategoryFull;

				if (catName.indexOf(nrlConfigObj.CategoryCharacter) > 0) {
					var categoriesAll = catName.split(nrlConfigObj.CategoryCharacter);
					for (var i = 0; i < categoriesAll.length - 1; i++)
						if (catsWithSubcats[categoriesAll[i]] == null)
							catsWithSubcats[categoriesAll[i]] = i;
				}
			}
			tabs[tabIndex].Reports[tabs[tabIndex].Reports.length] = returnObj.ReportSets[rCnt1];
		}
		if (tabs.length <= 0) {
			jq$("#RL_SearchingIcon").css("display", "none");
			content += '<div id="tabs" style="text-align: center; width: 100%; font-size: 36px; color: #aaa; margin-top: 100px;">No Reports Found</div>';

			var reportsDiv = jq$("#reportListDiv");
			reportsDiv.css("display", "none");
			reportsDiv.html(content);

			jq$('#loadingDiv').hide('fade', null, 400, function () {
				reportsDiv.show('fade', 1000);
			});
			return;
		}
	}
	content += '<div id="tabs"><ul style="display:none;">';
	leftContent += '<ul>';

	//var RenderUnusedSubcategory = function (categoryName, parentCategories) {
	//    if (parentCategories == null)
	//        return '';
	//    var res = '';
	//    var categoriesSplit = parentCategories.split('\\');
	//    for (var j = 0; j < categoriesSplit.length; j++) {
	//        if (catsUsed[categoriesSplit[j]] == null) {
	//            res += '<li><a href="#">' + categoriesSplit[j] + '</a></li>';
	//            catsUsed[categoriesSplit[j]] = true;
	//        }
	//    }

	//    return res;
	//};

	var catsUsed = [];
	var subcatMarginBase = 30;
	var expandIconUrl = responseServer.ResponseServerUrl + 'image=ModernImages.collapse.png';
	var subcatVisibilityTemplate = 'display:list-item;';
	if (nrlConfigObj.ExpandCategorizedReports != true)
		subcatVisibilityTemplate = 'display:none;';

	for (var tabCnt2 = 0; tabCnt2 < tabs.length; tabCnt2++) {
		var tabName = tabs[tabCnt2].TabName;
		var subTabAdditional = '';
		var catLevel = 0;
		if (tabs[tabCnt2].CategoryFull != null && tabs[tabCnt2].CategoryFull.indexOf(nrlConfigObj.CategoryCharacter) > 0) {
			subTabAdditional = 'margin-left:' + (subcatMarginBase * (tabs[tabCnt2].CategoryFull.split(nrlConfigObj.CategoryCharacter).length - 1)) + 'px;';

			var categoriesSplit = tabs[tabCnt2].CategoryFull.split(nrlConfigObj.CategoryCharacter);
			var partialCategory = categoriesSplit[0];
			for (var j = 0; j < categoriesSplit.length - 1; j++) {
				if (j > 0)
					partialCategory += nrlConfigObj.CategoryCharacter + categoriesSplit[j];
				if (catsUsed[partialCategory] == null) {
					leftContent += '<li data-level="' + j + '" style="margin-left:' + (subcatMarginBase * j) + 'px;' + (j > 0 ? subcatVisibilityTemplate : '') + '"><img src="' + expandIconUrl + '" onclick="javascript:ToggleSubcategories(this);" class="expand-collapse-category-icon"/><a class="category-expander" href="#">' + categoriesSplit[j] + '</a></li>';
					catsUsed[partialCategory] = true;
				}
				catLevel++;
			}
		}
		content += '<li style="font-size:0.9em;"><a href="#tab' + tabCnt2 + '">' + tabName + '</a></li>';
		var leftSelected = '';
		if (tabCnt2 == lastlySelectedCat)
			leftSelected = ' class="selected"';
		var hasSubcat = false;
		if (catsWithSubcats[tabName] == catLevel)
			hasSubcat = true;
		leftContent += '<li data-level="' + catLevel + '" style="' + subTabAdditional + (catLevel > 0 ? subcatVisibilityTemplate : '') + '">' + (hasSubcat ? '<img src="' + expandIconUrl + '" onclick="javascript:ToggleSubcategories(this);" class="expand-collapse-category-icon"/>' : '') + '<a ' + (hasSubcat ? 'class="category-expander" ' : '') + ' id="ltab' + tabCnt2 + '" href="#"' + leftSelected
				  + ' onclick="LeftTabClicked(' + tabCnt2 + ', ' + tabs.length + '); ShowContentLoading(function(){GetReports(searchKeyword, tabNames[' + tabCnt2 + '])}, \'' + IzLocal.Res('js_Loading') + '\');">'
				  + tabName + '</a></li>';
		catsUsed[tabs[tabCnt2].CategoryFull] = true;
	}
	content += '</ul>';
	leftContent += '</ul>';
	var grCnt = 0;
	var report, designTemplate, viewTemplate, linkTemplate, viewLink, designLink, directLink, deleteLink, printLink;
	for (var tabCnt = 0; tabCnt < tabs.length; tabCnt++) {
		content += '<div id="tab' + tabCnt + '">';
		content += '<div class="thumbs">';
		for (var rCnt = 0; rCnt < tabs[tabCnt].Reports.length; rCnt++) {
			if (tabs[tabCnt].Reports[rCnt].Name == null || tabs[tabCnt].Reports[rCnt].Name == '')
				continue;
			grCnt++;
			report = tabs[tabCnt].Reports[rCnt];
			if (report.Dashboard && forSelection)
				continue;

			designTemplate = report.Dashboard ? nrlConfigObj.DashboardDesignTemplate : nrlConfigObj.ReportDesignTemplate;
			viewTemplate = report.Dashboard ? nrlConfigObj.DashboardViewTemplate : nrlConfigObj.ReportViewTemplate;
			linkTemplate = report.Dashboard ? nrlConfigObj.DashboardLinkTemplate : nrlConfigObj.ReportLinkTemplate;

			var fullName = report.Name;
			if (report.Category != null && report.Category != '')
				fullName = report.Category + nrlConfigObj.CategoryCharacter + fullName;
			directLink = linkTemplate + report.UrlEncodedName;
			printLink = "\'rs.aspx?rn=" + report.UrlEncodedName + "&print=1\'";
			designLink = designTemplate[0] + report.UrlEncodedName + designTemplate[1];
			deleteLink = 'javascript:RL_DeleteNew(\'' + IzLocal.Res('js_AreYouSureYouWantToDeleteMessage', 'Are you sure you want to delete {0}?').replace(/\{0\}/g, fullName.replace('\'', '\\\'')) + '\', \'' + report.UrlEncodedName + '\');';
			viewLink = viewTemplate[0] + report.UrlEncodedName + viewTemplate[1];
			var thumbClass = isTouch ? 'thumb no-hover' : 'thumb';
			if (!forSelection) {
				if (nrlConfigObj.ThumbnailsAllowed) {
					content += '<a href="' + directLink + '" onclick="javascript:event=event||window.event;if((event.which==null&&event.button<2)||(event.which!=null&&event.which<2)){if(event.preventDefault){event.preventDefault();}else{event.returnValue=false;}return false;}">';
					content += '<div class="' + thumbClass + '" onclick="javascript:event=event||window.event;if((event.which==null&&event.button<2)||(event.which!=null&&event.which<2))' + viewLink + '" id="">';
					content += '<div class="thumb-container" style="background-color:white;width:' + nrlConfigObj.ThumbnailWidth + 'px;height:' + nrlConfigObj.ThumbnailHeight + 'px;"><img src="' + report.ImgUrl + '" />';
					content += '<div class="thumb-buttons">';
					if (!report.ViewOnly && !report.IsLocked && nrlConfigObj.AllowDesignReports)
						content += '<div class="thumb-edit" onclick="event.cancelBubble = true;(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;(event.preventDefault) ? event.preventDefault() : event.returnValue = false;' + designLink + '" title="' + IzLocal.Res('js_Edit', 'Edit') + '"></div>';
					if (!report.ReadOnly && !report.ViewOnly && !report.IsLocked && nrlConfigObj.AllowDeletingReports && nrlConfigObj.AllowDesignReports)
						content += '<div class="thumb-remove" onclick="event.cancelBubble = true;(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;(event.preventDefault) ? event.preventDefault() : event.returnValue = false;' + deleteLink + '" title="' + IzLocal.Res('js_Remove', 'Remove') + '"></div>';
					content += '<div class="thumb-print" onclick="event.cancelBubble = true;(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;(event.preventDefault) ? event.preventDefault() : event.returnValue = false;window.open(' + printLink + ', \'_blank\');" title="' + IzLocal.Res('js_Print', 'Print') + '"></div>';
					content += '</div>';
					content += '</div>';
					content += '<div class="thumb-title" style="max-width:' + nrlConfigObj.ThumbnailWidth + 'px;">' + report.Name + '</div>';
					content += '</div>';
					content += '</a>';
				}
				else {
					content += '<div class="' + thumbClass + '" style="background-color: #f3f3f3;max-width:' + (nrlConfigObj.ThumbnailWidth + 70) + 'px;line-height:55px;" onclick="' + viewLink + '" id="">';
					content += '<div class="thumb-container" style="width:' + (nrlConfigObj.ThumbnailWidth + 70) + 'px;height:0px;float:left;">';
					content += '<div class="thumb-buttons">';
					if (!report.ViewOnly && !report.IsLocked && nrlConfigObj.AllowDesignReports)
						content += '<div class="thumb-edit" style="top:28px;" onclick="event.cancelBubble = true;(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;(event.preventDefault) ? event.preventDefault() : event.returnValue = false;' + designLink + '" title="' + IzLocal.Res('js_Edit', 'Edit') + '"></div>';
					if (!report.ReadOnly && !report.ViewOnly && !report.IsLocked && nrlConfigObj.AllowDeletingReports && nrlConfigObj.AllowDesignReports)
						content += '<div class="thumb-remove" onclick="event.cancelBubble = true;(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;(event.preventDefault) ? event.preventDefault() : event.returnValue = false;' + deleteLink + '" title="' + IzLocal.Res('js_Remove', 'Remove') + '"></div>';
					content += '<div class="thumb-print" style="top:28px;" onclick="event.cancelBubble = true;(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;(event.preventDefault) ? event.preventDefault() : event.returnValue = false;window.open(' + printLink + ', \'_blank\');" title="' + IzLocal.Res('js_Print', 'Print') + '"></div>';
					content += '</div>';
					content += '</div>';
					content += '<div class="thumb-title" style="max-width:' + nrlConfigObj.ThumbnailWidth + 'px;line-height:55px;padding-top:0px;"><span style="margin-top:-5px;word-break:normal;display:inline-block;line-height:20px;vertical-align:middle;">' + report.Name + '</span></div>';
					content += '</div>';
				}
			}
			else {
				content += '<div class="' + thumbClass + '" onclick="parent.ReportForPartSelected(\'' + report.UrlEncodedName + '\');" id="">';
				content += '<div class="thumb-container" style="background-color:white; width:' + nrlConfigObj.ThumbnailWidth + 'px;height:' + nrlConfigObj.ThumbnailHeight + 'px;"><img src="' + report.ImgUrl + '" />';
				content += '</div>';
				content += '<div class="thumb-title">' + report.Name + '</div>';
				content += '</div>';
			}
		}
		content += '</div>';
		content += '</div>';
	}
	content += '</div>';
	var recentContent = '<ul>';
	for (var index = 0; index < returnObj.Recent.length; index++) {
		report = returnObj.Recent[index];
		viewTemplate = report.Dashboard ? nrlConfigObj.DashboardViewTemplate : nrlConfigObj.ReportViewTemplate;
		viewLink = viewTemplate[0] + report.UrlEncodedName + viewTemplate[1];
		directLink = (report.Dashboard ? nrlConfigObj.DashboardLinkTemplate : nrlConfigObj.ReportLinkTemplate) + report.UrlEncodedName;
		recentContent += '<li><a onclick="javascript:event=event||window.event;if((event.which==null&&event.button<2)||(event.which!=null&&event.which<2)){' + viewLink + 'if(event.preventDefault){event.preventDefault();}else{event.returnValue=false;}return false;}" href="' + directLink + '">' + report.Name + '</a></li>';
	}
	recentContent += '</ul>';
	jq$("#reportListDiv")
		.css("display", "none")
		.html(content);
	jq$('#leftSideCats').html(leftContent);
	jq$('#recentReports').html(recentContent);
	jq$('#tabs').tabs({ fx: { opacity: 'toggle' } });

	jq$('#tabs').tabs('select', lastlySelectedCat);
	if (lastlySelectedCat > 0)
		LeftTabClicked(lastlySelectedCat, tabs.length);

	jq$('#loadingDiv').hide('fade', null, 400, function() {
		jq$('#reportListDiv').css('visibility', 'visible');
		jq$('#contentDiv').css('cursor', 'default');
		jq$('#reportListDiv').show('fade', 1000);
	});
	jq$('#RL_SearchingIcon').css("display", "none");
}

function ToggleSubcategories(target) {
	var parentNode = jq$(target).parent();
	var targetLevel = parentNode.attr("data-level");
	var vis = parentNode.next().is(':visible');
	parentNode.nextUntil('[data-level="' + targetLevel + '"]').each(function () {
		var current = jq$(this);
		if (current.attr('data-level') <= targetLevel)
			return;
		if (vis && current.is(':visible'))
			current.hide("slide", { direction: "up" }, 400);
		else if (!vis && !current.is(':visible') && (parseInt(current.attr('data-level')) == parseInt(targetLevel) + 1))
			current.show("slide", { direction: "up" }, 400);
	});
}

function ShowContentLoading(callback, text) {
	jq$('#contentDiv').css('cursor', 'wait');
	jq$('#reportListDiv').hide('fade', null, 600, ShowLoadingAfterFade(text, callback));
}

function ShowLoadingAfterFade(text, callback) {
	var vSize = document.body.offsetHeight;
	jq$('#loadingDiv').css('height', vSize + 'px');
	jq$('#loadingWord').css('margin-top', (vSize / 3) + 'px');
	var loadingWord = document.getElementById('loadingWord');
	loadingWord.innerHTML = text;
	jq$('#loadingDiv').show('fade', null, 400, callback);
}

var forSelection;

jq$(document).ready(function () {
	forSelection = GetUrlParam('justSelect') == '1';
	if (forSelection) {
		document.getElementById('whiteHeader').style.display = 'none';
		document.getElementById('blueHeader').style.display = 'none';
	}

	var vSize = document.body.offsetHeight;
	jq$('#loadingDiv').css('height', vSize + 'px');
	jq$('#loadingWord').css('margin-top', (vSize / 3) + 'px');

	GetConfig();
});