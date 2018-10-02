/* Copyright (c) 2005 Izenda, Inc.

 ____________________________________________________________________
|                                                                   |
|   Izenda .NET Component Library                                   |
|                                                                   |
|   Copyright (c) 2005 Izenda, Inc.                                 |
|   ALL RIGHTS RESERVED                                             |
|                                                                   |
|   The entire contents of this file is protected by U.S. and       |
|   International Copyright Laws. Unauthorized reproduction,        |
|   reverse-engineering, and distribution of all or any portion of  |
|   the code contained in this file is strictly prohibited and may  |
|   result in severe civil and criminal penalties and will be       |
|   prosecuted to the maximum extent possible under the law.        |
|                                                                   |
|   RESTRICTIONS                                                    |
|                                                                   |
|   THIS SOURCE CODE AND ALL RESULTING INTERMEDIATE FILES           |
|   ARE CONFIDENTIAL AND PROPRIETARY TRADE                          |
|   SECRETS OF DEVELOPER EXPRESS INC. THE REGISTERED DEVELOPER IS   |
|   LICENSED TO DISTRIBUTE THE PRODUCT AND ALL ACCOMPANYING .NET    |
|   CONTROLS AS PART OF AN EXECUTABLE PROGRAM ONLY.                 |
|                                                                   |
|   THE SOURCE CODE CONTAINED WITHIN THIS FILE AND ALL RELATED      |
|   FILES OR ANY PORTION OF ITS CONTENTS SHALL AT NO TIME BE        |
|   COPIED, TRANSFERRED, SOLD, DISTRIBUTED, OR OTHERWISE MADE       |
|   AVAILABLE TO OTHER INDIVIDUALS WITHOUT EXPRESS WRITTEN CONSENT  |
|   AND PERMISSION FROM DEVELOPER EXPRESS INC.                      |
|                                                                   |
|   CONSULT THE END USER LICENSE AGREEMENT(EULA FOR INFORMATION ON  |
|   ADDITIONAL RESTRICTIONS.                                        |
|                                                                   |
|___________________________________________________________________|
*/

var allTabsFilled = false;
var resizeDelay = null;

(function (ns) {
	ns.pages = ns.pages || {};
	ns.pages.designer = ns.pages.designer || {};

	ns.pages.designer.context = ns.pages.designer.context || {};

})(window.izenda || (window.izenda = {}));

function OnAdHocQueryBuilderTabChanged(horrId, index, continueScript, columnNumber, param) {
	var pageContext = izenda.pages.designer.context;
	EBC_RemoveAllUnusedRows();
	if (typeof(EBC_TotalStartupScript) != 'undefined') {
		if (!EBC_TotalStartupScriptRunned)
			EBC_TotalStartupScript();
	}
	if (pageContext.previewTabIndex != null && index == pageContext.previewTabIndex && typeof(HORR_UpdateContent) != "undefined")
		HORR_UpdateContent(horrId, continueScript, true, param);
}

function OnAdHocQueryBuilderBeforeTabChanged() {
}

function AHQB_GotoTab(index) {
	var pageContext = izenda.pages.designer.context;
	TabStrip_ActivateTab(pageContext.tabStripId, index);
}

function AHQB_Init() {
	window.addEventListener('resize', AHQB_OnResize, true);
	document.addEventListener('load', AHQB_OnResize, true);
}

function AHQB_OnResize() {
	clearTimeout(resizeDelay);
}

function AHQB_OnResize_Internal() {
	var helpControls = document.getElementsByTagName("td");
	var bsize = document.body.offsetWidth < 900;
	for (var i = 0; i < helpControls.length; i++) {
		var helpControl = helpControls[i];
		if (helpControl.getAttribute("AdHocHelpControl") != "true")
			continue;
		if (bsize)
			helpControl.style.display = "none";
		else
			helpControl.style.display = "";
	}
}

function DisableEnableTabs() {
}

var isErrorOld = false;

function DisableEnablePreviewTab(isError, enable) {
	var trueEnable = !isError;
	if (enable == null)
		isErrorOld = isError;
	else
		trueEnable = !isErrorOld && enable;
	var pbCnt = 0;
	var pb = document.getElementById('PreviewBtn' + pbCnt);
	while (pb != null) {
		if (trueEnable)
			pb.style["display"] = "";
		else
			pb.style["display"] = "none";
		pbCnt++;
		pb = document.getElementById('PreviewBtn' + pbCnt);
	}

	var pageContext = izenda.pages.designer.context;
	if (pageContext.tabStripId && pageContext.previewTabIndex)
		TabStrip_EnableDisableTab(pageContext.tabStripId, pageContext.previewTabIndex, trueEnable);
}

function DisableEnableTabsFrom(enable, index) {
	var pageContext = izenda.pages.designer.context;
	if (pageContext.tabStripId) {
		var tabsCount = TabStrip_GetTabsCount(pageContext.tabStripId);
		for (var i = index; i < tabsCount; i++)
			TabStrip_EnableDisableTab(pageContext.tabStripId, i, enable);
	}
}

function AHRD_ShowHideHelpPanel() {
	var helpControls = document.getElementsByTagName("td");
	for (var i = 0; i < helpControls.length; i++) {
		var helpControl = helpControls[i];
		if (helpControl.getAttribute("AdHocHelpControl") != "true")
			continue;
		helpControl.style["display"] = helpControl.style["display"] == "none" ? "" : "none";
	}
}

function GetLoadingHtml() {
	var loading = jq$('#loadingDiv');
	if (loading == null || loading.length == 0)
		return '';
	return jq$('<div>').append(loading.clone().show()).html();
}

function GetRenderedReportSet(invalidateInCache, additionalParams) {
	jq$('#renderedReportDiv').html(GetLoadingHtml());
	var requestString = 'wscmd=getrenderedreportset',
		urlParams = [];
	var rnField = document.getElementById('reportNameFor2ver');
	var rn;
	if (typeof rnField != 'undefined' && rnField != null)
		rn = rnField.value;
	if (typeof rn == 'undefined' || rn == null)
		rn = '';
	urlParams.push('rn=' + rn);
	if (invalidateInCache)
		urlParams.push('iic=1');
	if (additionalParams)
		urlParams.push(additionalParams);
	AjaxRequest('./rs.aspx' + (urlParams.length > 0 ? '?' + urlParams.join('&') : ''),
		requestString,
		GotRenderedReportSet,
		null,
		'getrenderedreportset');
}

function GotRenderedReportSet(returnObj, id) {
	if (id != 'getrenderedreportset' || !returnObj)
		return;
	izenda.report.loadReportResponse(returnObj, '#renderedReportDiv');
	AdHoc.Utility.InitGaugeAnimations(null, null, false);
	// Dirty workaround for IE8
	if (jq$.support.opacity == false)
		setTimeout(function() { jq$('body')[0].className = jq$('body')[0].className; }, 200);
}

if(window.ebc_disableEnableFunctions)
	ebc_disableEnableFunctions.push(DisableEnableTabs);

AHQB_Init();
