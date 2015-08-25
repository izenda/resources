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

function RL_UpdateToFolder(folder, responseServerUrl, timeOut)
{
	if (typeof(responseServer) == 'undefined')
		responseServer = new AdHoc.ResponseServer(responseServerUrl, timeOut);
	if(typeof(RC_SetCategory)!='undefined')
		RC_SetCategory(folder);
	if (typeof (RC_SetCategory2) != 'undefined')
		RC_SetCategory2(folder);
}


function ud(){}

function RL_Delete(obj, message, reportName)
{
	var UserData = new ud();
	UserData.reportName = reportName;
	UserData.obj = obj;
	modal_confirm(message,UserData,RL_DeleteCallback);
}

function RL_DeleteCallback(UserData,isConfirmed)
{
	var obj = UserData.obj;
	var reportName = UserData.reportName;
	if (isConfirmed)
	{
		var row = EBC_GetRow(obj);
		var table = EBC_GetParentTable(row);
		// start deleting Category
		if (row.rowIndex != 0)
		{
			var r1 = table.rows[row.rowIndex-1];
			if (row.rowIndex == table.rows.length-1 ||
				(table.rows[row.rowIndex+1].attributes["header"]!=null &&
				 table.rows[row.rowIndex+1].attributes["header"].nodeValue == "true"))
			{
				if (r1.attributes["reportslistheader"]!=null && r1.attributes["reportslistheader"].nodeValue == "true")
				{
					if (row.rowIndex-2 >= 0 && table.rows[row.rowIndex-2].attributes["header"]!=null && table.rows[row.rowIndex-2].attributes["header"].nodeValue == "true")
						table.deleteRow(row.rowIndex-2);
					table.deleteRow(r1.rowIndex);
				}
			}
		}
		// end deleting Category
		table.deleteRow(row.rowIndex);
		
		if(typeof(reportNames)!="undefined")
		{
			var reports = reportNames.split(",");
			var newReportNames = "";
			for(var i=0;i<reports.length;i++)
			{
				var parts = reports[i].toLowerCase().split("|");
				if(parts[0].toLowerCase()!=reportName.toLowerCase())
					newReportNames = newReportNames+reports[i];
			}
			reportNames = newReportNames;
		}
		responseServer.ExecuteCommand('deleteReport', "report=" + reportName);
	}
}

function RL_CellOnMouseOver(obj)
{
	RL_AutoHide(obj, false);
}

function RL_CellOnMouseOut(obj)
{
	RL_AutoHide(obj, true);
}

function RL_AutoHide(cell, hide)
{
    for(var i=0;i<cell.childNodes.length;i++)
    {
	    var child = cell.childNodes[i];
	    if(child.getAttribute && child.getAttribute("autohide")=="true")
		    child.style["visibility"] = hide ? "hidden" : "visible";
    }
}

var RL_FADINGTOOLTIP;
var RL_FadingTooltipList = {};
var RL_wnd_height, RL_wnd_width;
var RL_tooltip_height, RL_tooltip_width;
var RL_tooltip_shown = false;
var RL_transparency = 100;

function RL_UpdateWindowSize() {
  RL_wnd_height = document.body.clientHeight;
  RL_wnd_width = document.body.clientWidth;
}

function RL_WindowLoading() {
  RL_tooltip_width = (RL_FADINGTOOLTIP.style.pixelWidth) ? RL_FADINGTOOLTIP.style.pixelWidth : RL_FADINGTOOLTIP.offsetWidth;
  RL_tooltip_height = (RL_FADINGTOOLTIP.style.pixelHeight) ? RL_FADINGTOOLTIP.style.pixelHeight : RL_FADINGTOOLTIP.offsetHeight;
  RL_UpdateWindowSize();
}

function RL_AdjustToolTipPosition(evtX, evtY) {
  if (RL_tooltip_shown) {
    var scrollTop = 0;
    var scrollLeft = 0;    
    RL_WindowLoading();
    var offset_y = evtY + RL_tooltip_height + 15;
    var top = evtY + scrollTop + 15;
    if (offset_y > RL_wnd_height) {
      var offset_y2 = evtY - RL_tooltip_height - 15;
      top = evtY - RL_tooltip_height + scrollTop - 15;
      if (offset_y2 < 0) {
        top = (RL_wnd_height - RL_tooltip_height) / 2 + scrollTop;
      }
    }
    var offset_x = evtX + RL_tooltip_width + 15;
    var left = evtX + scrollLeft + 15;
    if (offset_x > RL_wnd_width) {
      var dx = offset_x - RL_wnd_width;
      var offset_x2 = evtX - RL_tooltip_width - 15;
      var left2 = evtX - RL_tooltip_width + scrollLeft - 15;
      if (offset_x2 < 0) {
        var dx2 = -offset_x2;
        if (dx2 < dx)
          left = left2;
      }
      else {
        left = left2;
      }
    }
    if (RL_tooltip_height > 100) {
      top = scrollTop + evtY - RL_tooltip_height / 3;
    }
    var thumbnailHeight = 0;
    try {
      thumbnailHeight = RL_FADINGTOOLTIP.children[0].children[0].children[0].children[0].clientHeight;
    }
    catch(fe) {
      thumbnailHeight = 0;
    }
    top -= thumbnailHeight / 2;
    RL_FADINGTOOLTIP.style.left = left + 'px';
    RL_FADINGTOOLTIP.style.top = top + 'px';
  }else{
   if (RL_FADINGTOOLTIP != null && RL_FADINGTOOLTIP.style.left == "" && RL_FADINGTOOLTIP.style.top == "") {
      RL_FADINGTOOLTIP.style.visibility = "hidden";
      RL_FADINGTOOLTIP.style.display = "none";
    }
  }
}

function RL_DisplayTooltip(tooltip_url, reportLink) {
  RL_tooltip_shown = (tooltip_url != "") ? true : false;
  if (RL_tooltip_shown) {
    RL_FADINGTOOLTIP = RL_FadingTooltipList[tooltip_url];
    if (RL_FADINGTOOLTIP == null) {
      var obody = document.getElementsByTagName('body')[0];
      var frag = document.createDocumentFragment();
      RL_FADINGTOOLTIP = document.createElement('div');
      RL_FADINGTOOLTIP.style.border = "darkgray 1px outset";
      RL_FADINGTOOLTIP.style.width = "auto";
      RL_FADINGTOOLTIP.style.height = "auto";
      RL_FADINGTOOLTIP.style.color = "black";
      RL_FADINGTOOLTIP.style.backgroundColor = "white";
      RL_FADINGTOOLTIP.style.position = "absolute";
      RL_FADINGTOOLTIP.style.visibility = "hidden";
      RL_FADINGTOOLTIP.style.display = "none";      
      frag.appendChild(RL_FADINGTOOLTIP);
      obody.insertBefore(frag, obody.firstChild);
      window.onresize = RL_UpdateWindowSize;
      var absOffsetX = 0;
      var absOffsetY = 0;
      var obj = reportLink;
      while (obj != null) {
        absOffsetX += obj.offsetLeft;
        absOffsetY += obj.offsetTop;
        obj = obj.offsetParent;
      }
      RL_FADINGTOOLTIP.offsetX = absOffsetX + reportLink.clientWidth + 20;
      RL_FADINGTOOLTIP.offsetY = absOffsetY;      
      responseServer.RequestData(tooltip_url, RL_DisplayTooltip_CallBack);
      RL_FadingTooltipList[tooltip_url] = RL_FADINGTOOLTIP;
    } else {
      RL_FADINGTOOLTIP.style.display = "";
      RL_FADINGTOOLTIP.style.visibility = "visible";
      var absOffsetX = 0;
      var absOffsetY = 0;
      var obj = reportLink;
      while (obj != null) {
        absOffsetX += obj.offsetLeft;
        absOffsetY += obj.offsetTop;
        obj = obj.offsetParent;
      }
      RL_FADINGTOOLTIP.offsetX = absOffsetX + reportLink.clientWidth + 20;
      RL_FADINGTOOLTIP.offsetY = absOffsetY;      
      RL_AdjustToolTipPosition(RL_FADINGTOOLTIP.offsetX, RL_FADINGTOOLTIP.offsetY);
    }
  }
  else {
    if (RL_FADINGTOOLTIP != null) {
      RL_FADINGTOOLTIP.style.visibility = "hidden";
      RL_FADINGTOOLTIP.style.display = "none";
    }
  }
}

function RL_DisplayTooltip_CallBack(url, xmlHttpRequest) {
  if (xmlHttpRequest.status == 200) {
    var toolTip = RL_FadingTooltipList[url];
    toolTip.innerHTML = xmlHttpRequest.responseText;
    if (toolTip == RL_FADINGTOOLTIP) {
      RL_tooltip_height = (RL_FADINGTOOLTIP.style.pixelHeight) ? RL_FADINGTOOLTIP.style.pixelHeight : RL_FADINGTOOLTIP.offsetHeight;
      RL_FADINGTOOLTIP.style.display = "";
      RL_FADINGTOOLTIP.style.visibility = "visible";
      RL_AdjustToolTipPosition(RL_FADINGTOOLTIP.offsetX, RL_FADINGTOOLTIP.offsetY);      
    }
    RL_transparency = 0;    
  }
}

function RL_LocateMid(charInd, charVal, range, preString) {
  if (RL_Ks[range.start].length <= charInd) {
    var newStart = range.start;
    while (true) {
      newStart++;
      if (newStart > range.finish || RL_Ks[newStart].substr(0, charInd) != preString) {
        range.mid = -1;
        return;
      }
      if (RL_Ks[newStart].length > charInd)
        break;
    }
    range.start = newStart;
  }
  if (RL_Ks[range.start].charAt(charInd) == charVal) {
    range.mid = range.start;
    return;
  }
  if (RL_Ks[range.finish].charAt(charInd) == charVal) {
    range.mid = range.finish;
    return;
  }
  while (true) {
    if (range.finish - range.start < 2) {
      range.mid = -1;
      return;
    }
    range.mid = Math.floor((range.start + range.finish) / 2);
    var midChar = RL_Ks[range.mid].charAt(charInd);
    if (midChar == charVal)
      return;
    if (midChar > charVal)
      range.finish = range.mid;
    if (midChar < charVal)
      range.start = range.mid;
  }
}

function RL_LocateStart(charInd, charVal, range) {
  if (RL_Ks[range.start].charAt(charInd) == charVal)
    return;
  var tmpStart = range.start;
  var tmpFinish = range.mid;
  while (true) {
    var tmpMid = Math.floor((tmpStart + tmpFinish) / 2);
    var midChar = RL_Ks[tmpMid].charAt(charInd);
    if (midChar == charVal) {
      if (RL_Ks[tmpMid - 1].charAt(charInd) < charVal) {
        range.start = tmpMid;
        return;
      }
      tmpFinish = tmpMid;      
    }
    if (midChar < charVal) {
      if (RL_Ks[tmpMid + 1].charAt(charInd) == charVal) {
        range.start = tmpMid + 1;
        return;
      }    
      tmpStart = tmpMid;
    }
  }
}

function RL_LocateFinish(charInd, charVal, range) {
  if (RL_Ks[range.finish].charAt(charInd) == charVal)
    return;
  var tmpStart = range.mid;
  var tmpFinish = range.finish;
  while (true) {
    var tmpMid = Math.floor((tmpStart + tmpFinish) / 2);
    var midChar = RL_Ks[tmpMid].charAt(charInd);
    if (midChar == charVal) {
      if (RL_Ks[tmpMid + 1].charAt(charInd) > charVal) {
        range.finish = tmpMid;
        return;
      }
      tmpStart = tmpMid;      
    }
    if (midChar > charVal) {
      if (RL_Ks[tmpMid - 1].charAt(charInd) == charVal) {
        range.finish = tmpMid - 1;
        return;
      }    
      tmpFinish = tmpMid;
    }
  }
}

function RL_gEBID(val) {
  return document.getElementById("rl_hid" + val);
}

function RL_ShowReports(show) {
  if (show) {
    display = "";
    visibility = "visible";
  }
  else {
    display = "none";
    visibility = "hidden";
  }
  for (var index = 0; index < RL_Ai.length; index++) {
    RL_Os[RL_Ai[index]].style["display"] = display;
    RL_Os[RL_Ai[index]].style["visibility"] = visibility;
  }
  for (var index = 0; index < RL_RE.length; index++) {
    RL_RE[index].style["display"] = display;
    RL_RE[index].style["visibility"] = visibility;
  }
}

function RL_ShowCategories(show) {
  if (show) {
    display = "";
    visibility = "visible";
  }
  else {
    display = "none";
    visibility = "hidden";
  }
  for (var index = 0; index < RL_CL.length; index++) {
    RL_CL[index].style["display"] = display;
    RL_CL[index].style["visibility"] = visibility;
  }
}

function RL_FocusSearch(searchBox) {
  if (searchBox.value == "Search") {
    searchBox.value = "";
    searchBox.style.color = "#000000";
  }
}

function RL_BlurSearch(searchBox) {
  if (searchBox.value == "") {
    searchBox.value = "Search";
    searchBox.style.color = "#B0B0B0";
  }
}

function RL_SearchReports(searchString) {
  var sl = searchString.length;
  if (sl < 3) {
    if (!RL_LastWasShowReports) {
      RL_ShowReports(true);
      RL_ShowCategories(true);
    }
    RL_LastWasShowReports = true;
    RL_LastWasHideReports = false;
    return;
  }
  var range = { start: 0, finish: RL_Ks.length - 1, mid: -1 }
  var charInd = 0;
  while (charInd < sl) {
    var charToSearch = searchString.charAt(charInd);
    RL_LocateMid(charInd, charToSearch, range, searchString.substr(0, charInd));
    if (range.mid == -1) {
      range.start = -1;
      range.finish = -1;
      break;
    }
    RL_LocateStart(charInd, charToSearch, range);
    RL_LocateFinish(charInd, charToSearch, range);
    charInd++;
  }
  if (range.start == -1 || range.finish == -1) {
    if (!RL_LastWasHideReports) {
      RL_ShowReports(false);
      RL_ShowCategories(false);
    }
    RL_LastWasHideReports = true;
    RL_LastWasShowReports = false;
    return;
  }
  RL_ShowReports(false);
  RL_ShowCategories(false);
  for (var index = range.start; index <= range.finish; index++) {
    var arr = RL_BD[index];
    for (var index2 = 0; index2 < arr.length; index2++) {
      var rep = RL_Os[arr[index2]];
      rep.style["display"] = "";
      rep.style["visibility"] = "visible";
      var cat = RL_CL[RL_RC[arr[index2]]];
      cat.style["display"] = "";
      cat.style["visibility"] = "visible";
    }
  }
  RL_LastWasShowReports = false;
  RL_LastWasHideReports = false;  
}
