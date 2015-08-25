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


var reportNames = "";
var reportCategories = "";
var allowOverwriting;
var folderId;
var stripInvalidCharacters;
var allowInvalidCharacters;
var categoryCharacter = '\\';

function SRA_ReportExists(reportName)
{
	var reports = reportNames.split(",");
	for(var i=0;i<reports.length;i++)
	{
		var parts = reports[i].toLowerCase().split("|");
		if(parts[0].toLowerCase()==reportName.toLowerCase())
		{
			if(parts.length>0)
			{
				if(parts[parts.length-1]=="false")
					return true;
				return "ReadOnly";
			}
			return true;
		}
	}
	return false;
}

function SRA_ReportExistsToOtherUser(reportName)
{
	//var responseServer = new AdHoc.ResponseServer;
	
	var url = responseServer.ResponseServerUrl + "ReportExistsToOtherUser="+reportName;
	//xmlHttpRequest.open("GET", url, false);
	//xmlHttpRequest.send(null);
	var result  = responseServer.RequestData(url, null, false);
	//var result = xmlHttpRequest.responseText;
	if (result == "yes")
		return true;
	return false;
}

function escapeRegExp(s) {
  return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function SRA_ProcessReportName(reportName, folder, replaceFolder)
{	
	reportName = reportName.replace(/^( )+/g, '');
	reportName = reportName.replace(/( )+$/g, '');
	var pth = reportName.split(jsResources.categoryCharacter);
	if (pth.length>2)
		return null;
	if (pth.length == 2)
	{
		if (folder == null || folder == '')
		{
			folder = pth[0];
			reportName = pth[1];
		}
		else
			return null;
	}
	if (stripInvalidCharacters) {
	  reportName = reportName.replace(/[^A-Za-z0-9_\\\-'' ]+/g, '');
	}
	else {
	  var pos = reportName.search(/[^A-Za-z0-9_\\\-'' ]+/);
	  if (pos != -1 && !allowInvalidCharacters)
	    return null;
	}
	
	if(replaceFolder != null && replaceFolder && folderId != null)
	{
		var folderControl = document.getElementById(folderId);
		if(folderControl!=null)
		{
			var folderText = folderControl.value;
			if(folderText != null && folderText != folder)
				folder = folderText;
		}
	}	
	var additionalCharacter = '';
	if (categoryCharacter != '\\')
	  additionalCharacter = escapeRegExp(categoryCharacter);
	var regexp = new RegExp("[^A-Za-z0-9_/" + additionalCharacter + "\\-'' \\\\]", 'g');
	if (folder != "" && folder != null)
	{
	  if (stripInvalidCharacters) {
	    folder = folder.replace(regexp, '');
	  }
	  else {
	    var pos = folder.search(regexp);
	    if (pos != -1 && !allowInvalidCharacters)
	      return null;
	  }
		var lastfolderIndex = reportName.lastIndexOf(jsResources.categoryCharacter);
		if(lastfolderIndex!=-1)
			reportName = reportName.substr(lastfolderIndex+1);
		lastfolderIndex = reportName.lastIndexOf('%5c');
		if(lastfolderIndex!=-1)
			reportName = reportName.substr(lastfolderIndex+3);
		if(folder.charAt(folder.length-1)!=jsResources.categoryCharacter)
			folder = folder + jsResources.categoryCharacter;
		reportName = folder + reportName;
	}
	return reportName;
}

function SRA_SaveReportClick(evt, reportNameId, formId, action) {
	var value = SRA_ProcessReportName(document.getElementById(reportNameId).value);
	var b = SRA_CheckReport(value);
	if(b) {
	  ChangeFormAction(formId, action + "rn=" + value);
		document.getElementById(reportNameId).value = value;
	}
}

function SRA_CheckReport(rnParam, checkReportExist) {
	if(checkReportExist==null)
	  checkReportExist = true;
	nameNodes = rnParam.split(categoryCharacter);
	var emptyName = false;
	for (var index = 0; index < nameNodes.length; index++)
	  if (nameNodes[index] == null || nameNodes[index].length == 0)
	  emptyName = true;
	if (emptyName)
	{
		ebc_cancelSubmiting = true;
		tbPropmtReportNameData.forceNewNameOnSave = true;
		modal_ok(jsResources.ReportNameInvalid, null, TB_PropmtReportName);
		return false;
	}
	var reportName = rnParam.toLowerCase();
	var trimReportName = reportName;
	while (trimReportName != null && trimReportName.length >0 && trimReportName.charAt(0) == ' ')
	{
		if (trimReportName.length == 1)
			trimReportName = '';
		else
			trimReportName = trimReportName.slice(1-trimReportName.length);
	}	
	if (trimReportName == '')
	{
		ebc_cancelSubmiting = true;
		tbPropmtReportNameData.forceNewNameOnSave = true;
		modal_ok(jsResources.EnterANameOfTheSavedReport, null, TB_PropmtReportName);

		return false;
	}
	var exists = SRA_ReportExists(reportName);
	if (exists!=false && checkReportExist)
		if (exists=="ReadOnly" || !allowOverwriting || !confirm(jsResources.AReportWithTheSameNameAlreadyExists))
		{
			ebc_cancelSubmiting = true;
			if(exists=="ReadOnly" || !allowOverwriting)
			{
				tbPropmtReportNameData.forceNewNameOnSave = true;
				modal_ok(jsResources.ThisReportAlreadyExists, null, TB_PropmtReportName); 
			}
			return false;
		}
	var existsToOther = SRA_ReportExistsToOtherUser(reportName);
	if (existsToOther!=false && checkReportExist)
	{
		ebc_cancelSubmiting = true;
		tbPropmtReportNameData.forceNewNameOnSave = true;
		modal_ok(jsResources.ReportExistsOverwriteNotAllowed, null, TB_PropmtReportName);
		return false;
	}
	return true;
}

function SRA_ReportSelect(selectId, reportNameId, newLocation)
{
	var select = document.getElementById(selectId);
	var selectedReport = select.value;
	
	if (selectedReport=='...')
	{
		document.getElementById(reportNameId).value = '';
		EBC_ClearContols();
	}
	else
	{
		var refererAnchor = document.getElementById("RefererAnchor");
		selectedReport = selectedReport.replace(/ /, '+');
		var newHref = newLocation + "rn=" + selectedReport;
		if(isNetscape)
			window.location.href = newHref;
		else
		{
			refererAnchor.href = newHref;
			refererAnchor.click();
		}
	}
}
function SRA_SaveAsView(viewNameId, viewsList)
{
	var viewName = document.getElementById(viewNameId).value.toLowerCase();
	viewsList = viewsList.toLowerCase();
	var vList = new Array();
	vList = viewsList.split(',');
	viewName = SRA_ProcessReportName(viewName);
	exist = false;
	if (viewName == '')
	{
		event.cancelBubble = true;
		event.returnValue = false;
		return;
	}
	for (i=0; i<vList.length; i++)
		if (viewName==vList[i])
		{
			exist = true; 
			break;
		}
	if (exist)
	{ 
		modal_ok(jsResources.jsThereIsAlreadyAnObjectNamedInTheDatabase.replace("{0}", viewName));
		event.cancelBubble = true;
		event.returnValue = false;
	}
}