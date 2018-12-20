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

function disableAnchor(obj, disable)
{
	var image = obj.firstChild;

	if(disable)
	{
		obj.style.cursor = "not-allowed";
		if(image!=null && image.src!=null)
		{
			if(image.src.substr(image.src.length - 13, 9) != "-disabled")
			{
				var newSrc = image.src.substring(0, image.src.length - 4) + "-disabled" + image.src.substring(image.src.length - 4);
				image.src = newSrc;
			}
		}
		
		if(obj.attributes['href'] != null)
		{
			obj.setAttribute('href_bak', obj.attributes['href'].nodeValue);
			obj.removeAttribute('href');
		}
		
		if(obj.attributes['onclick'] != null)
		{
			obj.setAttribute('onclick_bak', obj.attributes['onclick'].nodeValue);
			obj.removeAttribute('onclick');
		}
	}
	else
	{
		// The following statement prevents client-side activation of diabled buttons
		if (obj != null && obj.attributes['canactivateonclient'])
			if (obj.attributes['canactivateonclient'].value == '0')
				return;
		obj.style.cursor = "";
		if(image!=null && image.src!=null)
		{
			if(image.src.substr(image.src.length - 13, 9) == "-disabled")
			{
				var newSrc = image.src.substring(0, image.src.length - 13) + image.src.substring(image.src.length - 4);
				image.src = newSrc;
			}
		}
		
		if(obj.attributes['href_bak'] != null)
			obj.setAttribute('href', obj.attributes['href_bak'].nodeValue);
		
		if(obj.attributes['onclick_bak'] != null)
			obj.setAttribute('onclick', obj.attributes['onclick_bak'].nodeValue);
	}
}

var isErrorOld = false;
function DisableEnableToolbar(isError, enable)
{
	var isCorrect = !isError;
	if (enable==null)
		isErrorOld = isError;
	else
		isCorrect = !isErrorOld && enable;
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
			disableAnchor(anchor, !isCorrect);
			var cell = anchor.parentNode;
			var row = cell.parentNode;
			var tBody = row.parentNode;
			var table = tBody.parentNode;
			var content = table.parentNode;
			if(!isCorrect)
				content.setAttribute("contentdisabled", true);
			else
				content.removeAttribute("contentdisabled");
		}
	}
	var selects = toolbarRow.getElementsByTagName("select");
	for(var i=0;i<selects.length;i++)
	{
		var select = selects[i];
		select.disabled = !isCorrect;
	}
}