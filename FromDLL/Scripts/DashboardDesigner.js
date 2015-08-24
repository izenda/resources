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

var multiPageId;
var callback;
var previewIDs = {};
var ids = new Array();

function DD_OnReportEdit(reportName, callbackFunction)
{
	var div = document.getElementById(multiPageId);
	for(var i=0;i<div.childNodes.length;i++)
	{
		if(div.childNodes[i].id==reportName+"_containerDiv") 
		{
			callback = callbackFunction;
			ShowDialog(div.childNodes[i].firstChild, (pageWidth()-100) + "px"); //
			break;
		}
	}
}

function DD_HideDesigner(id, simpleHide)
{
	var designer = document.getElementById(id);
	HideDialog(designer);
	if (simpleHide == null || simpleHide == false)
		callback();
}

function DD_OnReportDeleted(reportName, matrix)
{
	var reportDiv = document.getElementById(reportName+"_div");
	reportDiv.parentNode.removeChild(reportDiv);
}

function DD_Init(id)
{
	multiPageId = id;
}

function DD_OnTabChanged() //horrId, index, continueScript
{
	EBC_RemoveAllUnusedRows();
}

function DD_ShowStylePopup(styleControlId)
{
	var styleControl = document.getElementById(styleControlId);
	ShowDialog(styleControl);
}

function DD_HidePopup(styleControlId)
{
	var styleControl = document.getElementById(styleControlId);
	HideDialog(styleControl);
}

function DD_ShowHideButtons(cell, hide)
{
	var table = cell.getElementsByTagName("table")[0];
	if (table==null)
		return;
	var row = table.rows[0];
	var cells = row.cells;
	for (var i=0;i<cells.length;i++)
	    if (cells[i].childNodes.length>0)
	        cells[i].childNodes[0].style['visibility'] = hide ? "hidden" : "visible";
}

function DD_MoveUpHandler(el) {
	el = AdHoc.Utility.findParentElement(el, 'table').parentNode;
	var cell = AdHoc.Utility.findParentElement(el, 'td');
	var table = AdHoc.Utility.findParentElement(el, 'table');
	var matrix = new AdHoc.MatrixEditorBaseControl(table);
	matrix.moveUpCell(cell);
}

function DD_MoveDownHandler(el) {
	el = AdHoc.Utility.findParentElement(el, 'table').parentNode;
	var cell = AdHoc.Utility.findParentElement(el, 'td');
	var table = AdHoc.Utility.findParentElement(el, 'table');
	var matrix = new AdHoc.MatrixEditorBaseControl(table);
	matrix.moveDownCell(cell);
}

function DD_MoveLeftHandler(el) {
	el = AdHoc.Utility.findParentElement(el, 'table').parentNode;
	var cell = AdHoc.Utility.findParentElement(el, 'td');
	var table = AdHoc.Utility.findParentElement(el, 'table');
	var matrix = new AdHoc.MatrixEditorBaseControl(table);
	matrix.moveLeftCell(cell);
}

function DD_MoveRightHandler(el) {
	el = AdHoc.Utility.findParentElement(el, 'table').parentNode;
	var cell = AdHoc.Utility.findParentElement(el, 'td');
	var table = AdHoc.Utility.findParentElement(el, 'table');
	var matrix = new AdHoc.MatrixEditorBaseControl(table);
	matrix.moveRightCell(cell);
}

function DD_RemoveReport(el, onReportDeleted) {
	el = AdHoc.Utility.findParentElement(el, 'table').parentNode;
	DD_RemoveReportInternal(el, onReportDeleted);
}

function DD_RemoveReportInternal(el, onReportDeleted) {
	var cell = AdHoc.Utility.findParentElement(el, 'td'); 
	var table = AdHoc.Utility.findParentElement(el, 'table');
	var matrix = new AdHoc.MatrixEditorBaseControl(table);
	var hidden = cell.getElementsByTagName("input")[0];
	matrix.removeCell(cell);
	onReportDeleted(hidden.value, matrix);
}

var title;

function DD_OnMouseOver(id)
{
	var sid = "TableCell_"+id;
	var item = document.getElementById(sid);
	item.style.border = "black thin solid";
	item = document.getElementById("idTitleInfo");
	item.innerHTML = "<a align='left'>"+title[id]+"</a>";
}

function DD_OnMouseOut(id)
{
	var sid = "TableCell_"+id;
	var item = document.getElementById(sid);
	item.style.border = "white thin solid";
	item = document.getElementById("idTitleInfo");
	item.innerHTML = "<br><br><br>";
}

function DD_ReportEdit(el, onReportChanged, param)
{
	el = AdHoc.Utility.findParentElement(el, 'table').parentNode;
	var cell = AdHoc.Utility.findParentElement(el, 'td'); 
	var table = AdHoc.Utility.findParentElement(el, 'table');
	var matrix = new AdHoc.MatrixEditorBaseControl(table);
	var hidden = cell.getElementsByTagName("input")[0];
	onReportChanged(hidden.value, function() { DD_EndReportEdit(hidden.value, param); });
}

function DD_EndReportEdit(reportName, param)
{
	var previewControlId = previewIDs[reportName];
	HORR_UpdateContent(previewControlId, null, true, param);
}

function DRL_Init(id, rowIndex)
{
	AdHoc.MatrixEditorBaseControl.RegisterControl(id);
}

function DD_PromptReportName(id, postBackFunction, formId, action, reportType) {
	var rnIndex = window.location.search.indexOf('rn=');
	if (rnIndex!=-1)
	{
		var reportName = "";
		var category = "";
		var l = window.location.search.indexOf('&', rnIndex+3);
		if (l==-1)
			reportName = window.location.search.slice(rnIndex+3);
		else
			reportName = window.location.search.slice(rnIndex+3, l);
		var lastfolderIndex = reportName.lastIndexOf(jsResources.categoryCharacter);
		if(lastfolderIndex!=-1)
		{
			category = reportName.substring(0, lastfolderIndex);
			reportName = reportName.substr(lastfolderIndex+1);
		}
		lastfolderIndex = reportName.lastIndexOf('%5c');
		if(lastfolderIndex!=-1)
		{
			category = reportName.substring(0, lastfolderIndex);
			reportName = reportName.substr(lastfolderIndex+3);
		}
		
		category = category.replace(/\+/g," ");
		reportName = reportName.replace(/\+/g," ");
		
		reportName = SRA_ProcessReportName(reportName, category, false);
		if (reportName!=null)
		{
		  action = action.replace("__report_name__", reportName.replace(/ /g, "+"));
			ChangeFormAction(formId, action);
		}
	}

	if (reportType==null)
	{
		var reportTypeSelect = document.getElementById(id + "_ReportType");
		reportType = reportTypeSelect.value;
	}
	else
	{
		var reportTypeHiddenField = document.getElementById(id + "_ReportType");
		reportTypeHiddenField.value = reportType;
	}
	
	var i = 0;
	var haveThisName;
	
	do
	{
		i++;
		var currentName = reportType + i;
		haveThisName = false;
		for(var j=0;j<names.length;j++)
		{
			if (names[j]==currentName)
			{
				haveThisName = true;
				break;
			}
		}
	}
	while(haveThisName);

	
	var userData = {};
	userData.postBackFunction = postBackFunction;
	userData.controlId = id;
	
	DD_PromptReportNameCallBack(userData, reportType + i, true);
	
	return true;
}

function DD_PromptReportNameCallBack(userData, reportName, isOk)
{
	if(isOk && reportName!=null)
	{
		if (reportName == '')
		{
			modal_ok(jsResources.EnterANameOfTheSavedReport);
			return;
		}
		var haveThisName = false;
		for(var j=0;j<names.length;j++)
		{
		    if (names[j] == reportName)
		    {
		        haveThisName = true;
				break;
		    }
		}
		
		if(haveThisName)
		{
			modal_ok(jsResources.ThisReportAlreadyExists);
			return;
		}
		else
		{
			var reportNameControl = document.getElementById(userData.controlId + "_NewReportName");
			reportNameControl.value = reportName;			
			var postBackFunction = userData.postBackFunction.replace(/&quot;/g, '"');
			pause(100);
			ShowDialog("Saving...<br><image src='" + responseServerWithDelimeter + "image=loading.gif'/>");
			pause(100);
			eval(postBackFunction);
		}
	}
}

function pause(ms) {
  var now = new Date();
  var exitTime = now.getTime() + ms;
  while (true) {
    now = new Date();
    if (now.getTime() >= exitTime) return;
  }
}

var names;
function DD_PopupAddReport(id, postBackFunction, formId, action, rs, keysString, namesString, titles)
{
	//alert(namesString);
	//FADINGTOOLTIP = null;
	var keys = keysString.split(",");
	names = namesString.split(",");
	title = titles.split(";");
	var html = "<div id = 'Dashboard_NewReportTypeSelect'  style='width : 600px'><a align='center' style='text-align:center'>" + jsResources.WhatTypeOfReportElementWouldYouLikeToAdd + "</a><br>";
	html += "<table align='center'>";
	for (var i = 0; i < keys.length; i++)
	{
		var onclick = "DD_PromptReportName('" + id + "', '" + postBackFunction + "', '" + formId + "', '" + action + "', '" + keys[i] + "')";
		if (i%4 == 0)
			html += "<tr>";
		html += "<td id = 'TableCell_"+i+"' style = 'border: white thin solid;' "+
			"onmouseover = javascript:DD_OnMouseOver("+i+") "+
			"onmouseout = javascript:DD_OnMouseOut("+i+")>";
		html += "<img onclick=\"" + onclick + "\" src='" + rs + "image=Dashboard." + keys[i] + ".gif' alt='" + keys[i] + "'/>";
		html += "</td>";
		if (i%4 == 3)
			html += "</tr>";
	}
	html += "</table><br>";
	html += "<div id = 'idTitleInfo'><br><br><br></div>";
	html += "</div>";
	html += "<input type='button' value='Cancel' onclick='hm()'>"
	ShowDialog(html);
}
