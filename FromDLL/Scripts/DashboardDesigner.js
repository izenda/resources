/* Copyright (c) 2005-2010 Izenda, L.L.C.

 ____________________________________________________________________
|                                                                   |
|   Izenda .NET Component Library                                   |
|                                                                   |
|   Copyright (c) 2005-2010 Izenda, L.L.C.                          |
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

var toolbarId;
var reportViewerURL;

function DD2_GetReportsByReportSet(reportSetSelect)
{
	var reportSetName = reportSetSelect.value;
	var td = EBC_GetColumn(reportSetSelect);
	if (td != null)
	{
		var sel = EBC_GetElementByName(td, "ReportName", "SELECT");
		if (sel != null)
		{
		  var value = sel.getAttribute("oldValue");
		  EBC_LoadData("DashReportsNames", "rn=" + reportSetName, sel, false);
			sel = EBC_GetElementByName(td, "ReportName", "SELECT");
			/*var hasFilters = false;
			if (sel.options.length > 1)
			{
				hasFilters = (sel.options[sel.options.length-1].value == "HasDateTimeFilter");
				if (hasFilters)
					sel.options.length = sel.options.length-1;
			}*/
			//sel.setAttribute("HasDateTimeFilters", hasFilters ? "yes" : "no");
			if (value != null)
			{
				EBC_SetSelectedIndexByValue(sel, value);
				DD2_CheckReport(sel);
			}
			if (sel.options.length == 2)
			{
				sel.options[1].selected = true;
				DD2_CheckReport(sel);
			}
			
			/*var dateFiltersCount = hasFilters ? 1 : 0;
			var table = EBC_GetParentTable(td);
			var rows = table.rows;
			for (var j=0;j<rows.length && dateFiltersCount < 1;j++) 
			{
				var cells = rows[j].cells;
				for (var i=0;i<cells.length && dateFiltersCount < 1; i++) 
				{
					var selWithAttribute = EBC_GetElementByName(cells[i], "ReportName", "SELECT");
					if (selWithAttribute.getAttribute("HasDateTimeFilters") == "yes")
						dateFiltersCount++;
				}
			}
			var id = table.id;
			var index = id.lastIndexOf('_');
			if (index > 0)
			{
				id = id.substring(0, index) + "_AdHocSliderDiv";
				var div = document.getElementById(id);
				if (div != null)
					div.style["visibility"] = ((dateFiltersCount > 0) ? "" : "hidden");
			}*/
		}
	}
}

function DD2_CheckReport(sel)
{
	var td = EBC_GetColumn(sel);
	var reportSelect = EBC_GetElementByName(td, "ReportSetName", "SELECT");
	var reportName = reportSelect.value;
	var subReport = EBC_GetSelectValue(sel);
	sel.setAttribute("oldValue",subReport);
	var reportState = false;
	if (reportName == null || reportName == "...")
	{
		reportState = true;
	}
	else
	{
		reportState = (subReport != "..." && subReport  != null);
	}
	DD2_SetReportState(td, reportState);

	DD2_CheckSelectedReports();
}

function DD2_CheckSelectedReports() {
    var reportSelected = false;
    jq$('[name$="_ReportName"]').each(function(){
        if (jq$(this).val() != '...'){
            reportSelected = true;
            return;
        }
    });
    jq$('[name="ReportState"]').each(function(){
        if (jq$(this).is(':visible')){
            reportSelected = false;
            return;
        }
    });
	
    if (reportSelected)
        DisableEnableToolbar(false, true);
    else
        DisableEnableToolbar(false, false);
}

function DD2_CheckState(table)
{
	var result = true;
	var rows = table.rows;
	for (var j=0;((j<rows.length) && result);j++) {
		var cells = rows[j].cells;
		for (var i=0;((i<cells.length) && result); i++) {
			result = DD2_GetReportState(cells[i]);
		}
	}
	DD2_Ready(result);
}

function DD2_SetReportState(td, reportState)
{
	if (td != null)
	{
		td.setAttribute("reportState", reportState ? "" : "notReady");
		
		var img = EBC_GetElementByName(td, "ReportState", "IMG");
		if (img != null)
			img.style.display = reportState ? "none" : "";
		
		if (!reportState)
			DD2_Ready(reportState);
		else
			DD2_CheckState(EBC_GetParentTable(td));
	}
}

function DD2_GetReportState(td)
{
	if (td == null)
		return true;
	var state = td.getAttribute("reportState");
	return (state != "notReady");
}

function DD2_OnMouseOver(cell)
{
	cell.setAttribute("mouseOver", "true");
	var table = EBC_GetParentTable(cell);
	var rows = table.rows;
	for (var i=0;i<rows.length;i++)
	{
		var cells = rows[i].cells;
		for (var j=0;j<cells.length;j++)
		{
			if (cells[j] != cell)
				DD2_OnMouseOut(cells[j]);
		}
	}
	var childs = cell.childNodes;
	for (var i =0;i<childs.length;i++)
		if (childs[i].style != null)
		{
			jQ(childs[i]).fadeIn("fast", function() {this.style.visibility="";});
		}
}

function DD2_OnMouseOut(cell)
{
	cell.setAttribute("mouseOver", "");
	var reportField = EBC_GetSelectByName(cell, "ReportSetName");
	var reportTitleField = EBC_GetInputByName(cell, "TextBox");
	if (reportField != null && reportTitleField != null)
	{
		var reportSetName = reportField.value;
		var reportSetTitle = reportTitleField.value;
		if ((reportSetName == "" || reportSetName == "..." || reportSetName == null) && 
		(reportSetTitle == "" || reportSetTitle == null))
		{
			var childs = cell.childNodes;
			var needHide = true;
			var focusedElement;
			for (var i=0;needHide && i<childs.length;i++)
			{
				needHide = (childs[i] != document.activeElement);
				focusedElement = childs[i];
			}
			if (needHide)
			{
				for (var i =0;i<childs.length;i++)
					if (childs[i].style != null)
						if (childs[i].style.visibility != "hidden")
							jQ(childs[i]).fadeOut("slow", function() {this.style.visibility="hidden";this.style.display="inline";});
			}
			else
			{
				if (focusedElement.onblur == null)
					focusedElement.onblur = function(){DD2_OnUnfocuse(cell)};
			}
		}
	}
}

function DD2_OnUnfocuse(cell)
{
	var mouseOver = (cell.getAttribute("mouseOver") == "true");
	if (!mouseOver)
		DD2_OnMouseOut(cell);
}

function DD2_Ready(ready)
{
	var toolbarRow = document.getElementById(toolbarId);
	var anchors = toolbarRow.getElementsByTagName("A");
	for(var i=0;i<anchors.length;i++)
	{
		var anchor = anchors[i];
		var buttonId = anchor.getAttribute("buttonId");
		if(!(
			buttonId=="BackButton" ||
			buttonId=="NewButton" ||
			buttonId=="AdminButton" ||
			buttonId=="DatabaseDiagram" ||
			buttonId=="ReportListButton" ||
			buttonId=="UpgradeButton" ||
			buttonId=="ShowHelp" ||
			buttonId=="EtlButton" ||
			buttonId=="AddReportButton"))
		{
			disableAnchor(anchor, !ready);
			var cell = anchor.parentNode;
			var row = cell.parentNode;
			var tBody = row.parentNode;
			var table = tBody.parentNode;
			var content = table.parentNode;
			if(!ready)
				content.setAttribute("contentdisabled", true);
			else
				content.removeAttribute("contentdisabled");
		}
	}
}

function DD2_Init(tableID, viewerURL, hideUnused)
{
    reportViewerURL = viewerURL;
	/*var table = document.getElementById(tableID);
	var rows = table.rows;
	for (var j=0;j<rows.length;j++) 
	{
		var cells = rows[j].cells;
		for (var i=0;i<cells.length; i++) 
		{
			var sel = EBC_GetElementByName(cells[i], "ReportSetName", "SELECT");
			DD2_GetReportsByReportSet(sel);
			if (hideUnused)
				DD2_OnMouseOut(cells[i]);
		}
	}*/
}

jq$(document).ready(function () {
    DD2_CheckSelectedReports();
});


function DD2_OpenReport(obj)
{
	if (obj != null)
	{
		var td = EBC_GetColumn(obj);
		var reportSelect = EBC_GetElementByName(td, "ReportSetName", "SELECT");
		var reportSetName = reportSelect.value;
		if (reportSetName != '...' && reportSetName != '' && reportSetName != null) {
		  redirectUrl = reportViewerURL + "rn=" + reportSetName;
			window.open(redirectUrl, '_blank')
		}
	}
}