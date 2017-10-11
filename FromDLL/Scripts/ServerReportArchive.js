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
var stripInvalidCharacters;
var allowInvalidCharacters;

function SRA_ReportExists(reportName) {
	var reports = reportNames.split(",");
	for (var i = 0; i < reports.length; i++) {
		var parts = reports[i].toLowerCase().split("|");
		if (parts[0].toLowerCase() == reportName.toLowerCase()) {
			if (parts.length > 0) {
				if (parts[parts.length - 1] == "false")
					return true;
				return "ReadOnly";
			}
			return true;
		}
	}
	return false;
}

function SRA_ReportExistsToOtherUser(reportName) {
	//var responseServer = new AdHoc.ResponseServer;

	var url = responseServer.ResponseServerUrl + "ReportExistsToOtherUser=" + reportName;
	//xmlHttpRequest.open("GET", url, false);
	//xmlHttpRequest.send(null);
	var result = responseServer.RequestData(url, null, false);
	//var result = xmlHttpRequest.responseText;
	if (result == "yes")
		return true;
	return false;
}

function SRA_SaveReportClick(evt, reportNameId, formId, action) {
	var value = document.getElementById(reportNameId).value;
	value = window.utility.fixReportNamePath(value, jsResources.categoryCharacter, stripInvalidCharacters, allowInvalidCharacters);
	var b = SRA_CheckReport(value);
	if (b.canBeSaved) {
		if (b.confirm) {
			ReportingServices.showConfirm(jsResources.AReportWithTheSameNameAlreadyExists, function (result) {
				if (result == jsResources.OK) {
					ChangeFormAction(formId, action + "rn=" + value);
					document.getElementById(reportNameId).value = value;
				}
			});
		} else {
			ChangeFormAction(formId, action + "rn=" + value);
			document.getElementById(reportNameId).value = value;
		}
	}
}

function SRA_CheckReport(rnParam, checkReportExist) {
	if (checkReportExist == null)
		checkReportExist = true;
	nameNodes = rnParam.split(jsResources.categoryCharacter);
	var emptyName = false;
	for (var index = 0; index < nameNodes.length; index++)
		if (nameNodes[index] == null || nameNodes[index].length == 0)
			emptyName = true;
	if (emptyName) {
		ebc_cancelSubmiting = true;
		tbPropmtReportNameData.forceNewNameOnSave = true;
		ReportingServices.showOk(jsResources.ReportNameInvalid, TB_PropmtReportName);
		return { canBeSaved: false };
	}
	var reportName = rnParam;
	if (!reportName.trim()) {
		ebc_cancelSubmiting = true;
		tbPropmtReportNameData.forceNewNameOnSave = true;
		ReportingServices.showOk(jsResources.EnterANameOfTheSavedReport, TB_PropmtReportName);
		return { canBeSaved: false };
	}
	if (checkReportExist) {
		var exists = SRA_ReportExists(reportName);
		if (exists != false) {
			if (exists == "ReadOnly" || !allowOverwriting) {
				ebc_cancelSubmiting = true;
				tbPropmtReportNameData.forceNewNameOnSave = true;
				ReportingServices.showOk(jsResources.ThisReportAlreadyExists, TB_PropmtReportName);
				return { canBeSaved: false };
			}
			return { canBeSaved: true, confirm: true };
		} else {
			var existsToOther = SRA_ReportExistsToOtherUser(reportName);
			if (existsToOther != false) {
				ebc_cancelSubmiting = true;
				tbPropmtReportNameData.forceNewNameOnSave = true;
				ReportingServices.showOk(jsResources.ReportExistsOverwriteNotAllowed, TB_PropmtReportName);
				return { canBeSaved: false };
			}
		}
	}
	return { canBeSaved: true };
}

function SRA_ReportSelect(selectId, reportNameId, newLocation) {
	var select = document.getElementById(selectId);
	var selectedReport = select.value;

	if (selectedReport == '...') {
		document.getElementById(reportNameId).value = '';
		EBC_ClearContols();
	}
	else {
		var refererAnchor = document.getElementById("RefererAnchor");
		selectedReport = selectedReport.replace(/ /, '+');
		var newHref = newLocation + "rn=" + selectedReport;
		if (isNetscape)
			window.location.href = newHref;
		else {
			refererAnchor.href = newHref;
			refererAnchor.click();
		}
	}
}
function SRA_SaveAsView(viewNameId, viewsList) {
	var viewName = document.getElementById(viewNameId).value.toLowerCase();
	viewsList = viewsList.toLowerCase();
	var vList = new Array();
	vList = viewsList.split(',');
	viewName = window.utility.fixReportNamePath(viewName, jsResources.categoryCharacter, stripInvalidCharacters, allowInvalidCharacters);
	exist = false;
	if (!viewName) {
		event.cancelBubble = true;
		event.returnValue = false;
		return;
	}
	for (i = 0; i < vList.length; i++)
		if (viewName == vList[i]) {
			exist = true;
			break;
		}
	if (exist) {
		ReportingServices.showOk(jsResources.jsThereIsAlreadyAnObjectNamedInTheDatabase.format([viewName]));
		event.cancelBubble = true;
		event.returnValue = false;
	}
}