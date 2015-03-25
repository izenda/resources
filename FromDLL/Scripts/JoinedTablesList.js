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


var JTC_onListChangedHandler = {};
var JTC_JoinedAutomatically = {};
var JTC_needRepeat = false;
var JTC_autoJoinQueue = {};
var JTC_leftAutoJoinQueue = {};
var JTC_oldTableList = new Array(" ");
var JTC_hash = "0";
var isNetscape = window.navigator.appName == 'Netscape';
var isOpera = window.navigator.appName == 'Opera';
var JTCS_Init_executes = false;

//Prepare tabs
function JTC_PrepareTabStrip(id)
{
	if(window.tabStripId && !window.tabStriptIdisIlligal)
		return;
	var table = document.getElementById(id);
	while(table != null && table.tagName != 'SPAN')
		table = table.parentNode;
	table = table.firstChild.childNodes;
A:	for(var i = table.length - 1; i >= 0; --i)
	{
		var node = table[i];
		if(node.tagName == 'DIV' && node.className == 'TabStrip')
			for(var j = node.childNodes.length - 1; j >= 0; --j)
				if(node.childNodes[j].tagName == 'TABLE')
				{
					var tid = node.childNodes[j].tBodies[0].rows[0].id;
					window.tabStripId = tid.substr(0, tid.length - 4);
					break A;
				}
	}
	window.tabStriptIdisIlligal = true;
}

//ceck, and enable/disable other tabs
function JTC_CheckAliases(id)
{
	if(window.DisableEnableTabsFrom && window.firstDisabledTabIndex)
	{
		var count = 0;
		var tableSels = document.getElementsByName(id + '_Table');	
		var rightTable = document.getElementsByName(id + '_RightTable');
		var column = document.getElementsByName(id + '_Column');
		var rightColumn = document.getElementsByName(id + '_RightColumn');
		var joinSel = document.getElementsByName(id + '_Join');
		var joined = true;

		for (var i = 0; i < tableSels.length && joined; i++)
		{
			if (tableSels[i] != null && tableSels[i].value != null && tableSels[i].value != '...')
			{
				count++;
				if (i>0)
				{
					if (joinSel != null && joinSel[i] != null && joinSel[i].value == 'CROSS_JOIN')
						joined = true;
					else
					{
						joined = (rightTable[i].value != null && rightTable[i].value != '...');
						joined = joined  && (rightColumn[i].value != null && rightColumn[i].value != '...');
						joined = joined  && (column[i].value != null && column[i].value != '...');
					}
				}
			}
		}

		JTC_PrepareTabStrip(id);
		if (JTC_JoinedAutomatically[id])
		    joined = true;
		if(count>0 && joined)
			DisableEnableTabsFrom(true, firstDisabledTabIndex);
		else
			DisableEnableTabsFrom(false, firstDisabledTabIndex);		
	}
}

function JTC_AutoJoin(id, rowIndex)
{
	// source table have not join fields
	if (rowIndex == 0)
	{
		return true;
	}
		
	var result = false;
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var row = body.rows[rowIndex]
	
	var leftColumn = EBC_GetSelectByName(row, 'Column');
	var rightColumn = EBC_GetSelectByName(row, 'RightColumn');
		
	var leftTable = EBC_GetSelectByName(row, 'Table');
	var leftTableName = leftTable.value;
	if (leftTableName != '...')
	{
		var primaryKey = null;
		var foreignKey = null;
		var rightTable = EBC_GetSelectByName(row, 'RightTable');
		var rightTableName = rightTable.value;
		
		if (ebc_tableInfo != null)
		{
			if (typeof(ebc_tableInfo[leftTableName]) != 'undefined' && ebc_tableInfo[leftTableName] != null && ebc_tableInfo[leftTableName][rightTableName] != null)
			{
				primaryKey = ebc_tableInfo[leftTableName][rightTableName][1];
				foreignKey = ebc_tableInfo[leftTableName][rightTableName][0];
			}
			else if (typeof(ebc_tableInfo[rightTableName]) != 'undefined' && ebc_tableInfo[rightTableName] != null && ebc_tableInfo[rightTableName][leftTableName] != null)
			{
				primaryKey = ebc_tableInfo[rightTableName][leftTableName][0];
				foreignKey = ebc_tableInfo[rightTableName][leftTableName][1];
			}
		}
		if (primaryKey != null && foreignKey != null)
		{
			EBC_SetSelectedIndexByValue(rightColumn, primaryKey);
			EBC_SetSelectedIndexByValue(leftColumn, foreignKey);
			result = true;
		}
		else
			result = JTC_Internal_FindEqualColumns(row);
	}
	return result;
}

function JTC_SetRightColumnValues(id, rowIndex)
{
	var tableSel = document.getElementsByName(id + '_RightTable')[rowIndex]
	var columnSel = document.getElementsByName(id + '_RightColumn')[rowIndex]
	
	if (tableSel != null && columnSel != null)
	{
		if (tableSel.value == '...' || tableSel.value == '')
			EBC_LoadData('@JTC/Empty', null, columnSel, false);
		else
		{
			// it needs to auto-join columns when right column will be loaded
			JTC_autoJoinQueue[rowIndex] = 1;
			EBC_LoadData(
				"CombinedColumnList",
				"tables=" + tableSel.value.split("'")[0] +
				"&" + "joinFields=true", columnSel,
				false);
		}
	}
}

function JTC_SelectRightTableSelValue(id, rowIndex)
{
	//check oldValue, then from last table to upper
	var rightTableSel = document.getElementsByName(id + '_RightTable')[rowIndex];
	var oldValue = rightTableSel.value;
	if (oldValue == '...')
	{
		oldValue = rightTableSel.getAttribute("oldValue");
		if (oldValue != null && oldValue != '...')
			EBC_SetSelectedIndexByValue(rightTableSel, oldValue);
	}
	var autoJoined = false;
	JTC_SetRightColumnValues(id, rowIndex);
	autoJoined = JTC_AutoJoin(id, rowIndex);
	var tableSel = document.getElementsByName(id + '_Table');
	for (var i=rowIndex-1;i>=0 && !autoJoined;i--)
	{
		if (tableSel[i].value != '...')
		{
			EBC_SetSelectedIndexByValue(rightTableSel, tableSel[i].value);
			JTC_SetRightColumnValues(id, rowIndex);
			autoJoined = JTC_AutoJoin(id, rowIndex);
		}
	}
	if (!autoJoined)
	{
		EBC_SetSelectedIndexByValue(rightTableSel, '...');
		JTC_SetRightColumnValues(id, rowIndex);
	}
	rightTableSel.setAttribute("oldValue", EBC_GetSelectValue(rightTableSel));
}

function JTC_GetTableList(id)
{
	var tableSels = document.getElementsByName(id + '_Table');
	
	var tables = new Array();
	for (var i = 0; i < tableSels.length; i++)
	{
		var value = new Array();
		value.table = tableSels[i].value;
		if (value.table != null && value.table != '...')
		{
			if (tableSels[i].selectedIndex > -1)
			{
				value.alias = tableSels[i].options[tableSels[i].selectedIndex].text;
			}
			else
				value.alias = '';
			value.notFirst = i != 0;
			tables.push(value);
		}
	}
	var tablesCopy = new Array();
	for(var i = 0; i < tables.length; i++)
	{
		var countBefore = 0;
		var count = 0;
		for(var j = 0; j<tables.length; j++)
		{
			if(tables[i].table == tables[j].table)
			{
				count++;
				if(j<i)
					countBefore++;
			}
		}
		if(count>1)
		{
			var num = countBefore+1;
			var newElem = new Array();
			newElem.table = tables[i].table;
			if (num>1)
				newElem.table += "*" + num;
			newElem.alias = tables[i].alias;
			tablesCopy.push(newElem);
		}
		else
			tablesCopy.push(tables[i]);
	}
	return tablesCopy;
}

function JTC_SetRightTableSelValues(id, i , tablesWithAliases)
{
	var body = document.getElementById(id).tBodies[0];
	var row = body.rows[i];
	
	var rightTableSel = EBC_GetSelectByName(row, 'RightTable');
	if (rightTableSel==null)
		return;

	var oldValue = rightTableSel.value;
	EBC_ChangeAllTablesSel(null , rightTableSel, i, true, tablesWithAliases); 
		
	EBC_SetSelectedIndexByValue(rightTableSel, oldValue);
	if(rightTableSel.value!="...")
		rightTableSel.setAttribute("oldValueRight", rightTableSel.value);
}

function JTC_innerShowHideParams(row, hide, visibilityMode, tagName)
{
	if (tagName == null)
		tagName = "DIV";
	var elements = row.getElementsByTagName(tagName);
	var count = elements.length;
	for (var i = 0; i < count; i++)
	{
		var elem = elements[i];
		if (elem.attributes["visibilityMode"] != null && elem.attributes["visibilityMode"].value == visibilityMode)
			elem.style["display"] = hide ? 'none' : 'inline';
	}
}
function JTC_ShowHideParams(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if(row==null)
		return;
	var tableSel = EBC_GetSelectByName(row, 'Table');
	var joinSel = EBC_GetSelectByName(row, 'Join');
	if(tableSel==null || joinSel==null)
		return;
	var hideRightTable = (row["sectionRowIndex"] == 0 || tableSel.value == '...' || joinSel.value == 'CROSS_JOIN');
	var hideJoinType = (row["sectionRowIndex"] == 0 || tableSel.value == '...');
	JTC_innerShowHideParams(row, row["sectionRowIndex"] == 0, '1');
	JTC_innerShowHideParams(row, hideRightTable, '2');
	JTC_innerShowHideParams(row, hideJoinType, '3');
	JTC_CheckAliases(EBC_GetParentTable(row).id);
}

function JTC_TableChanged(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	
	if (row == null || row.parentNode == null || row.parentNode.parentNode == null)
		return;
	
	var tableId = EBC_GetParentTable(row).id;
	
	if (row.rowIndex < 0 && row["sectionRowIndex"]<0)
		return;

	if (row.rowIndex>0 && row["sectionRowIndex"]>0)
	{
		JTC_ShowHideParams(e);
	}

	// update all next Right tables 
	var startFrom = 1;
	if (row["sectionRowIndex"] > 0)
		startFrom = row["sectionRowIndex"];
		
	var tableSels = document.getElementsByName(tableId + '_Table');
	var columnSels = document.getElementsByName(tableId + '_Column');
	var rightTableSels = document.getElementsByName(tableId + '_RightTable');
	var rightColumnSel = document.getElementsByName(tableId + '_RightColumn');
	
	if (row["sectionRowIndex"] > 0 && tableSels[row["sectionRowIndex"] ] != null)
	{
		if (columnSels != null && columnSels[row["sectionRowIndex"]] != null)
		{
			columnSels[row["sectionRowIndex"]].onchange = null;
			
			try
			{
				if (tableSels[row["sectionRowIndex"] ].value == '...')
					EBC_LoadData('@JTC/Empty', null, columnSels[row["sectionRowIndex"]], false);
				else
				{
					EBC_LoadData(
						"CombinedColumnList",
						"tables=" + tableSels[row["sectionRowIndex"]].value +
						"&" + "joinFields=true",
						columnSels[row["sectionRowIndex"]],
						false);
				}
			}
			finally
			{
				columnSels = document.getElementsByName(tableId + '_Column');
				columnSels[row["sectionRowIndex"]].onchange = JTC_LeftColumnChanged;
			}
		}
	}
	
	// RightTable possible values
	var tablesWithAliases = JTC_GetTableList(tableId);
	
	for (var i=startFrom;i<tableSels.length;i++)
	{
		if (tableSels[i].value != '...')
		{
			tableSels[i].onchange = null;
			columnSels[i].onchange = null;
			rightTableSels[i].onchange = null;
			rightColumnSel[i].onchange = null;
			
			try
			{
				// UpdateRightTable possible values
				JTC_SetRightTableSelValues(tableId, i , tablesWithAliases)
				JTC_leftAutoJoinQueue[i] = 1;
				// Update Right table and join Fields
				JTC_SelectRightTableSelValue(tableId, i);
			}
			finally
			{
				tableSels = document.getElementsByName(tableId + '_Table');
				columnSels = document.getElementsByName(tableId + '_Column');
				rightTableSels = document.getElementsByName(tableId + '_RightTable');
				rightColumnSel = document.getElementsByName(tableId + '_RightColumn');
				tableSels[i].onchange = JTC_TableChanged;
				columnSels[i].onchange = JTC_LeftColumnChanged;
				rightTableSels[i].onchange = JTC_RightTableChanged;
				rightColumnSel[i].onchange = JTC_RightColumnChanged;
			}
		}
	}
	JTC_CheckAliases(tableId);
	JTC_OnListChanged(tableId);
}

function JTC_LeftColumnChanged(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var tableId = EBC_GetParentTable(row).id;
	JTC_CheckAliases(tableId);
}

function JTC_RightTableChanged(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var tableId = EBC_GetParentTable(row).id;
	
	var columnSels = EBC_GetSelectByName(row, 'Column');
	var rightTableSels = EBC_GetSelectByName(row, 'RightTable');
	var rightColumnSel = EBC_GetSelectByName(row, 'RightColumn');
	
	columnSels.onchange = null;
	rightColumnSel.onchange = null;
	rightTableSels.onchange = null;
	
	try
	{
		if (row["sectionRowIndex"] > -1)
		{
			JTC_SetRightColumnValues(tableId, row["sectionRowIndex"]);
			rightColumnSel = EBC_GetSelectByName(row, 'RightColumn');
			if (rightTableSels.value != '...')
				JTC_AutoJoin(tableId, row["sectionRowIndex"]);
		}
	}
	finally
	{
		columnSels.onchange = JTC_LeftColumnChanged;
		rightTableSels.onchange = JTC_RightTableChanged;
		rightColumnSel.onchange = JTC_RightColumnChanged;
	}

	JTC_CheckAliases(tableId);
}

function JTC_RightColumnChanged(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var tableId = EBC_GetParentTable(row).id;
	JTC_CheckAliases(tableId);
}

//===============================================

function JTC_RegisterOnListChangedHandler(id, ctrlId, func)
{
	var arr = JTC_onListChangedHandler[id];
	if (arr == null)
	{
		arr = new Array();
		JTC_onListChangedHandler[id] = arr;
	}
	var handler = {};
	handler.id = ctrlId;
	handler.func = func;
	arr.push(handler);
}

function JTC_OnListChanged(id) {
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var count = body.rows.length;
	var allLoaded = true;
	for (var i = 0; i < count; i++)
	{
		var tableSel = EBC_GetSelectByName(body.rows[i], 'Table');
		if(tableSel.options.length==1 && tableSel.options[0].text=='Loading ...')
			allLoaded = false;
	}
	if(!allLoaded)
		return;
	var tablesWithAliases = JTC_GetTableList(id);
	var tables = new Array();
	for (var i = 0;i<tablesWithAliases.length; i++)
		tables.push(tablesWithAliases[i].table);
	
	if(tables.toString()==JTC_oldTableList.toString())
		return;
	JTC_oldTableList = tables;
	var handlers = JTC_onListChangedHandler[id];
	
	if (handlers != null)
	{
		for (var i = 0; i < handlers.length; i++)
			handlers[i].func(handlers[i].id, tables);
  }
}

function getEnd(source, len)
{
	return (source.length <= len) ? source : source.substr(source.length - len, len);
}

function isStringContains(source, s)
{
	return (source.indexOf(s)>-1);
}

var cuthalf = 150;
var buf = new Array((cuthalf * 2) - 1);

function LeveDist(s, t) {
  var i, j, m, n, cost, flip, result;
  s = s.substr(0, cuthalf);
  t = t.substr(0, cuthalf);
  m = s.length;
  n = t.length;
  if (m == 0)
    result = n;
  else if (n == 0)
    result = m;
  else {
    flip = false;
    for (i = 0; i <= n; i++)
      buf[i] = i;
    for (i = 1; i <= m; i++) {
      if (flip)
        buf[0] = i;
      else
        buf[cuthalf] = i;
      for (j = 1; j <= n; j++) {
        if (s.charAt(i - 1) == t.charAt(j - 1))
          cost = 0;
        else
          cost = 1;
        if (flip)
          buf[j] = Math.min(Math.min(buf[cuthalf + j] + 1, buf[j - 1] + 1), buf[cuthalf + j - 1] + cost);
        else
          buf[cuthalf + j] = Math.min(Math.min(buf[j] + 1, buf[cuthalf + j - 1] + 1), buf[j - 1] + cost);
      }
      flip = !flip;
    }
    if (flip)
      result = buf[cuthalf + n];
    else
      result = buf[n];
  }
  return result;
}

// Looks up and selects equal columns by their name
function JTC_Internal_FindEqualColumns(row) {
  var columnSel = EBC_GetSelectByName(row, 'Column');
	var rightColumnSel = EBC_GetSelectByName(row, 'RightColumn');
	var rightColumn;
	var column;
	var rightOptionIndex = -1;
	var leftOptionIndex = -1;
	var stopSearch = false;
	var moreThanOneEqualNames = false;
	
	//for intelligent autojoin
  /*var leftTable = EBC_GetSelectByName(row, 'Table');
  var leftTableName = leftTable.value;
  while (leftTableName.indexOf('[') >= 0)
    leftTableName = leftTableName.replace('[', '');
  while (leftTableName.indexOf(']') >= 0)
    leftTableName = leftTableName.replace(']', '');
  var leftTableNodes = leftTableName.split('.');
  leftTableName = leftTableNodes[leftTableNodes.length - 1].toUpperCase();
  var rightTable = EBC_GetSelectByName(row, 'RightTable');
  var rightTableName = rightTable.value;
  while (rightTableName.indexOf('[') >= 0)
    rightTableName = rightTableName.replace('[', '');
  while (rightTableName.indexOf(']') >= 0)
    rightTableName = rightTableName.replace(']', '');
  var rightTableNodes = rightTableName.split('.');
  rightTableName = rightTableNodes[rightTableNodes.length - 1].toUpperCase();
  var bestLeftIndex = -1;
  var bestRightIndex = -1;
  var bestCombosedDist = 10000;
  var currentDist = 10000;
  var composed = '';
  for (i = 0; i < rightColumnSel.options.length; i++) {
    rightColumn = rightColumnSel.options[i].text.toUpperCase();
    if (rightColumn == "...")
      continue;
    for (j = 0; j < columnSel.options.length; j++) {
      column = columnSel.options[j].text.toUpperCase();
      if (column == "...")
        continue;
      composed = leftTableName + column;	    
      if (Math.abs(composed.length - rightColumn.length) <= 0) {
        currentDist = LeveDist(composed, rightColumn);
        if (currentDist < bestCombosedDist) {
          bestCombosedDist = currentDist;
          bestLeftIndex = j;
          bestRightIndex = i;
        }
      }	    
      composed = rightTableName + rightColumn;
      if (Math.abs(composed.length - column.length) <= 0) {
        currentDist = LeveDist(composed, column);
        if (currentDist < bestCombosedDist) {
          bestCombosedDist = currentDist;
          bestLeftIndex = j;
          bestRightIndex = i;
        }
      }
    }
  }
  if (bestCombosedDist <= 1) {
    rightColumnSel.selectedIndex = bestRightIndex;
    columnSel.selectedIndex = bestLeftIndex;
    return true;
  }
  return false;*/

//for old variant	
	for (i = 0; i < rightColumnSel.options.length && !stopSearch; i++) {
		rightColumn = rightColumnSel.options[i].text.toUpperCase();
		if (rightColumn == "...")
			continue;
		for (j=0; j<columnSel.options.length && !stopSearch; j++) {
			column = columnSel.options[j].text.toUpperCase();
			if (column == "...")
			  continue;			
			if (column == rightColumn) {
			  if (rightOptionIndex!=-1)
					moreThanOneEqualNames = true;
				rightOptionIndex = i;
				leftOptionIndex = j;
				if (isStringContains(rightColumn, 'ID'))
					stopSearch = true;
			}
		}
	}
	var flag = stopSearch || (!moreThanOneEqualNames && rightOptionIndex > -1 && leftOptionIndex > -1);
	if (flag) {
	  rightColumnSel.selectedIndex = rightOptionIndex;
	  columnSel.selectedIndex = leftOptionIndex;
	}
	return flag;
}

function JTC_RemoveHandler(e)
{
	if(e) ebc_mozillaEvent = e;
	var table = EBC_GetParentTable(EBC_GetRow());
	EBC_RemoveHandler(ebc_mozillaEvent);
	JTC_CheckAliases(table.id);
	JTC_OnListChanged(table.id);
}

function JTC_InitRow(row)
{
	var tableSel = EBC_GetSelectByName(row, 'Table');
	if(tableSel==null)
		return;
	var table = tableSel.value;
	var joinSel = EBC_GetSelectByName(row, 'Join');
	var join;
	if (joinSel!=null)
		join = joinSel.value;
	var columnSel = EBC_GetSelectByName(row, 'Column');
	var rightTableSel = EBC_GetSelectByName(row, 'RightTable');
	var rightColumnSel = EBC_GetSelectByName(row, 'RightColumn');
	var rightTable;
	if (rightTableSel!=null)
		rightTable = rightTableSel.value;
		
	//stop events 
	if (tableSel != null)
		tableSel.onchange = null;
	if (columnSel != null)
		columnSel.onchange = null;
	if (rightTableSel != null)
		rightTableSel.onchange = null;
	if (rightColumnSel != null)
		rightColumnSel.onchange = null;
		
	try
	{
		tableSel.setAttribute("oldValue", EBC_GetSelectValue(tableSel));
		if(rightTableSel!=null && rightTableSel.value!="...")
			rightTableSel.setAttribute("oldValueRight", rightTableSel.value);
		
		EBC_LoadData("TableList", "hash=" + JTC_hash, tableSel, false);
		if (joinSel!=null)
		{
			EBC_LoadData('@JTC/JoinTypes', null, joinSel);
			joinSel = EBC_GetSelectByName(row, 'Join');
			EBC_SetSelectedIndexByValue(joinSel, 'INNER');
		}

		if (columnSel!=null)
		{
			if (table == '...' || row.tableIndex == 0)
				EBC_LoadData('@JTC/Empty', null, columnSel);
			else
				EBC_LoadData(
					"CombinedColumnList",
					"tables=" + table +
					"&" + "joinFields=true", columnSel, false);
		}

		if (rightColumnSel!=null)
		{
			if (rightTable == '...' || row.tableIndex == 0)
				EBC_LoadData('@JTC/Empty', null, rightColumnSel);
			else
				EBC_LoadData(
					"CombinedColumnList",
					"tables="+rightTable.split("'")[0] +
					"&" + "joinFields=true",
					rightColumnSel, false);
		}

		var hideRightTable = (row["sectionRowIndex"] == 0 || table == '...' || join == 'CROSS_JOIN');
		JTC_innerShowHideParams(row, row["sectionRowIndex"] == 0, '1');
		JTC_innerShowHideParams(row, hideRightTable, '2');
	}
	finally
	{
		tableSel = EBC_GetSelectByName(row, 'Table');
		columnSel = EBC_GetSelectByName(row, 'Column');
		rightTableSel = EBC_GetSelectByName(row, 'RightTable');
		rightColumnSel = EBC_GetSelectByName(row, 'RightColumn');
		// start events
		if (tableSel != null)
			tableSel.onchange = JTC_TableChanged;
		if (columnSel != null)
			columnSel.onchange = JTC_LeftColumnChanged;
		if (rightTableSel != null)
			rightTableSel.onchange = JTC_RightTableChanged;
		if (rightColumnSel != null)
			rightColumnSel.onchange = JTC_RightColumnChanged;
	}
}

function JTC_InitRows(id)
{
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var count = body.rows.length;
	var i =0;
	
	// load join types
	for (i=1;i<count;i++)
	{
		var joinSel = EBC_GetSelectByName(body.rows[i], 'Join');
		if (joinSel != null)
			EBC_LoadData('@JTC/JoinTypes', null, joinSel);
	}
	JTC_CheckAliases(id);
}

function JTC_Init(id, autoJoinOnRenderedRows, tablesHash, allowDomainJoin, joinedAutomatically) {
  allTabsFilled = true;
	if (allowDomainJoin == null)
	    allowDomainJoin = false;

	if (joinedAutomatically == null)
	  joinedAutomatically = false;
	JTC_JoinedAutomatically[id] = joinedAutomatically;
	
	JTC_hash = tablesHash;
	EBC_LoadTableInfo();
	JTC_PrepareTabStrip(id);
	//if(typeof(DisableEnableTabsFrom)!='undefined'  && typeof(firstDisabledTabIndex)!='undefined')
	//	DisableEnableTabsFrom(false, firstDisabledTabIndex);
	EBC_RegisterControl(id);
	table = document.getElementById(id);
	EBC_RegisterRowInsertHandler(table, JTC_InitRow);
	EBC_SetData('@JTC/Empty', '<option value=\'...\'>...</option>');
	EBC_SetData('@JTC/JoinTypes', 
		'<option value="...">...</option>'+
		'<option value=INNER>' + jsResources.JoinInner + '</option>' +
		'<option value=CROSS_JOIN>' + jsResources.JoinCross + '</option>' +
		'<option value=LEFT_OUTER>' + jsResources.JoinLeft + '</option>' +
		'<option value=RIGHT_OUTER>' + jsResources.JoinRight + '</option>' +
		'<option value=FULL_OUTER>' + jsResources.JoinFull + '</option>' +
		(allowDomainJoin ? '<option value=DOMAIN>' + jsResources.Domain + '</option>' : ''));
	JTC_InitRows(id);
}
