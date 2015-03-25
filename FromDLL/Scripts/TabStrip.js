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


var TabStrip_OnTabActivateMethods = {};
var PrevTabInfo = {};
var TS_ATeventData = null;

function TS_activateDefaultTab() {
	if (TS_ATeventData == null)
		return;
	TabStrip_ToggleTab(TS_ATeventData.strControlName, TS_ATeventData.strControlName + "_tab" + TS_ATeventData.tabIndex, TS_ATeventData.tabIndex, true, false);
	TS_ATeventData = null;
}

function TabStrip_RegisterOnTabActivate(strControlName, method)
{
	var arrMethods = TabStrip_OnTabActivateMethods[strControlName] || [];
		arrMethods.push(method);
	if (arrMethods.length==1)
		TabStrip_OnTabActivateMethods[strControlName]=arrMethods;
}

function TabStrip_OnTabActivate(strControlName, strTabName, tabIndex, pause)
{	
  var lastClickedTab = document.getElementById('lastClickedTab');
  if (lastClickedTab != undefined && lastClickedTab != null) {
    lastClickedTab.value = tabIndex;
  }
	var arrMethods = TabStrip_OnTabActivateMethods[strControlName];
	if (arrMethods)
	{
		for (var methodIdx in arrMethods)
		{
			try
			{
				var method = arrMethods[methodIdx];
				if (typeof(method)=='string')
					modal_ok(method + "(\"" + strControlName + "\", \"" + strTabName + "\", " + tabIndex + "\", " + pause + ")");
				else
					method(strControlName, strTabName, tabIndex, pause);
			}
			catch (e) {}
		}
	}
}

function TabStrip_GetTabsCount(strControlName)
{
	if (!strControlName)
		throw "Argument null exception: 'strControlName'";
	var objTabsRow = GetElementByName(strControlName + "_Row");
	if (!objTabsRow)
		throw "Can't find tabs row";
	return objTabsRow.cells.length;
}

function TabStrip_EnableDisableTab(strControlName, index, enable)
{
	if (!strControlName)
		throw "Argument null exception: 'strControlName'";
	var objTabsRow = GetElementByName(strControlName + "_Row");
	if (!objTabsRow)
		throw "Can't find tabs row";
	var tab = objTabsRow.cells[index].firstChild;

	var currentLink = document.getElementById('continueBtn' + (index - 1));

	if(enable)
	{
		if(tab.prevClassName!=null)
			tab.className = tab.prevClassName;
		tab.prevClassName = null;
		if (currentLink!=null)
			currentLink.style["display"] = "";
	}
	else
	{
		if (tab.className == "ActiveTab")
		{
			var eventData = {};
			eventData.strControlName = strControlName;
			eventData.tabIndex = index;
			TS_ATeventData = eventData;
			var parent = EBC_GetColumn(tab);
			var onMouseOver = parent.getAttribute("onMouseOver");
			if (onMouseOver != null && onMouseOver != "")
				TabStrip_ToggleTab(strControlName, strControlName+"_tab0", 0, true, false);
		}
		if(tab.prevClassName==null)
			tab.prevClassName = tab.className;
		tab.className = "DisabledTab";
		if (currentLink!=null)
			currentLink.style["display"] = "none";
	}
}

function TabStrip_WaitCursor(element)
{
	ShowDialog(jsResources.Loading + "...<br><image src='"+responseServerWithDelimeter+"image=loading.gif'/>");
}

function TabStrip_ToggleTab(strControlName, strTabName, tabIndex, runEvent, pause)
{
	if (!strControlName)
		throw "Argument null exception: 'strControlName'";
	if (!strTabName)
		throw "Argument null exception: 'strTabName'";
	var objActiveTabNameHolder = GetElementByName(strControlName);
	if (!objActiveTabNameHolder)
		throw "Can't find active tab name container";
	var objTab = document.getElementById(strTabName);
	if (!objTab)
		throw "Can't find specified tab.";
	objTab = objTab.firstChild;
	if(objTab.className=="DisabledTab")
		return;
	var strActiveTabName = objActiveTabNameHolder.value;
	if (strTabName==strActiveTabName)
	{
		if (objTab.className=="InactiveTab")
		{
			objTab.className="ActiveTab";
			TabStrip_OnTabActivate(strControlName, strTabName, tabIndex, pause);
		}
	}
	else
	{
		if (true)
		{
			PrevTabInfo.strControlName = strControlName;
			PrevTabInfo.strTabName = strActiveTabName;
			PrevTabInfo.tabIndex = 0;
			if (strActiveTabName && strActiveTabName.lastIndexOf("_tab") > 0)
			{
				var prevTabIndexStr = strActiveTabName.substring(strActiveTabName.lastIndexOf("_tab") + 4);
				if (prevTabIndexStr && parseInt(prevTabIndexStr, 10))
					PrevTabInfo.tabIndex = parseInt(prevTabIndexStr, 10);
			}
		}
		
		if (strActiveTabName)
		{
			var objActiveTab = document.getElementById(strActiveTabName);
			if (objActiveTab)
			{
				objActiveTab = objActiveTab.firstChild;
				if (objActiveTab)
				{
					objActiveTab.className = "InactiveTab";
					objActiveTab.prevClassName = objActiveTab.className;
				}
			}
		}
		objTab.className="ActiveTab";
		if(runEvent==null || runEvent==true)
			TabStrip_OnTabActivate(strControlName, strTabName, tabIndex, pause);
		objActiveTabNameHolder.value = strTabName;
	}
}

function TabStrip_Activate(strControlName, tabIndex)
{
	var objActiveTabNameHolder = GetElementByName(strControlName);
	if (objActiveTabNameHolder)
	{
		var strActiveTab = objActiveTabNameHolder.value;
		if (strActiveTab)
		TabStrip_ToggleTab(strControlName, strActiveTab, tabIndex);
	}
}

function TabStrip_OnMouseOver(strControlName, obj)
{
	if (obj.firstChild.className!="DisabledTab")
		obj.firstChild.className="ActiveTab";
}

function TabStrip_OnMouseOut(strControlName, obj)
{
	if (obj.firstChild.className!="DisabledTab")
	{
		var objActiveTabNameHolder = GetElementByName(strControlName);
		if (objActiveTabNameHolder)
		{
			var strActiveTabName = objActiveTabNameHolder.value;
			if (strActiveTabName)
			{
				var objActiveTab = document.getElementById(strActiveTabName);
				if(obj!=objActiveTab)
				obj.firstChild.className="InactiveTab";
			}
		}
	}
}

function GetElementByName(strControlName)
{
	var arrElements = document.getElementsByName(strControlName);
	if (arrElements && arrElements.length>0)
		return arrElements[0];
	return null;
}

function TabStrip_NextTab(strControlName)
{
	if (!strControlName)
		throw "Argument null exception: 'strControlName'";
	var objActiveTabNameHolder = GetElementByName(strControlName);
	if (!objActiveTabNameHolder)
		throw "Can't find active tab name container";
	var strActiveTabName = objActiveTabNameHolder.value;
	var objActiveTabCell = document.getElementById(strActiveTabName);
	if (objActiveTabCell)
	{
		var index = objActiveTabCell.cellIndex;
		var row = objActiveTabCell.parentNode;
		if(row.cells.length>index+1)
		{
			var nextCell = row.cells[index+1];
			nextCell.onclick();
		}
	}
}

function TabStrip_ActivateTab(strControlName, index)
{
	if (!strControlName)
		throw "Argument null exception: 'strControlName'";
	var objActiveTabNameHolder = GetElementByName(strControlName);
	if (!objActiveTabNameHolder)
		throw "Can't find active tab name container";
	var strActiveTabName = objActiveTabNameHolder.value;
	var objActiveTabCell = document.getElementById(strActiveTabName);
	if (objActiveTabCell)
	{
		var row = objActiveTabCell.parentNode;
		if(row.cells.length>index)
		{
			var cell = row.cells[index];
			cell.onclick();
		}
	}
}

function TabStrip_TogglePrevTab()
{
	if (PrevTabInfo == undefined || PrevTabInfo == null)
		return;
	TabStrip_ToggleTab(PrevTabInfo.strControlName, PrevTabInfo.strTabName, PrevTabInfo.tabIndex, true, false);
}