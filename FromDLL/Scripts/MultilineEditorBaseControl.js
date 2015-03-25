/* Copyright (c) 2005-2010 Izenda, L.L.C.

_____________________________________________________________________
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


var ebc_rowInsertHandlers = {};
var ebc_rowRemoveHandlers = {};
var ebc_selTable = new Array();
var caCalendarsPoolIndex = 1000;

function EBC_RegiserForUnusedRowsRemoving(tbl)
{
	ebc_selTable.push(tbl);
}

function EBC_RegisterRowInsertHandler(table, handler)
{
	ebc_rowInsertHandlers[table.id] = handler;
}

function EBC_RegisterRowRemoveHandler(table, handler)
{
	ebc_rowRemoveHandlers[table.id] = handler;
}

function EBC_InsertRow(table, n, newRow)
{
  var tb = table.tBodies[0], r = tb.rows;
	if(newRow == null)
		newRow = r[0].cloneNode(true);
	if (newRow.style["display"] == "none")
		newRow.style["display"] = "";
	
	if(r.length <= n)
		tb.appendChild(newRow);
	else
		tb.insertBefore(newRow, r[n]);
	//for(i in newRow)
	//	if(i.charAt(0) == '_')
	//		newRow[i] = undefined;
	newRow._table = table;
	var filterNumber = EBC_GetInputByName(newRow, 'FilterNumber');
	if (filterNumber != null && CC_RenumFilters != null)
		CC_RenumFilters(EBC_GetParentTable(newRow));
	return newRow;
}

function EBC_GetRow(elem)
{
	if(!elem)
		elem = window.event ? window.event.srcElement :
		( ebc_mozillaEvent ? ( ebc_mozillaEvent.target || ebc_mozillaEvent ) : null );
	while (elem != null && elem.tagName != 'TR')
		elem = elem.parentNode;
	return elem;
}

function EBC_GetColumn(elem)
{
	if(!elem)
		elem = window.event ? window.event.srcElement :
		( ebc_mozillaEvent ? ( ebc_mozillaEvent.target || ebc_mozillaEvent ) : null );
	while (elem != null && elem.tagName != 'TD')
		elem = elem.parentNode;
	return elem;
}

function EBC_GetParentTable(row)
{
	if(row._table)
		return row._table;
	var elem;
	elem = row.parentNode;
	while (elem != null && elem.tagName != 'TABLE')
		elem = elem.parentNode;
	row._table=elem;
	return elem;
}

function EBC_SecureCaControls(parentControl) {
  var r = null;
  if (parentControl == null || parentControl.children == null)
    return r;
  for (var i = 0; i < parentControl.children.length; i++) {
    var child = parentControl.children[i];
    var ids = child.id;
    if (ids.indexOf('CaCalContainer') >= 0) {
      parentControl.removeChild(child);
      var res = new Array();
      res[1] = parentControl;
      res[2] = child;
      if (i >= parentControl.children.length - 1) {
        res[3] = null;
      }
      else {
        res[3] = parentControl.children[i + 1];
      }
      return res;
    }
    if (r == null)
      r = EBC_SecureCaControls(child);
  }
  return r;
}

function EBC_CheckCAControlsNeeded(parentControl) {
  var r = false;
  if (parentControl == null || parentControl.children == null)
    return r;
  for (var i = 0; i < parentControl.children.length; i++) {
    var child = parentControl.children[i];
    var ids = child.id;
    if (ids.indexOf('CaCalPlace') >= 0) {
      return true;
    }
    if (r == false)
      r = EBC_CheckCAControlsNeeded(child);
  }
  return r;
}

function EBC_CheckCAControlsC(parentControl) {
  var r = false;
  if (parentControl == null || parentControl.children == null)
    return r;
  for (var i = 0; i < parentControl.children.length; i++) {
    var child = parentControl.children[i];
    var ids = child.id;
    if (ids.indexOf('CaCalPlace') >= 0) {
      if (child.children.length > 0)
        return true;
      else
        return false;
    }
    if (r == false)
      r = EBC_CheckCAControlsC(child);
  }
  return r;
}

function EBC_FixCAControlsC(parentControl) {
	if (parentControl == null || parentControl.children == null)
		return;
	var r = false;
	for (var i = 0; i < parentControl.children.length; i++) {
		var child = parentControl.children[i];
		var ids = child.id;
		if (ids.indexOf('bcStartDateJQ') >= 0 || ids.indexOf('bcEndDateJQ') >= 0 || ids.indexOf('equalsDateJQ') >= 0) {
			jq$(child).removeClass('hasDatepicker');
			var newId;
			while (true) {
				newId = ids + '_' + Math.floor(Math.random() * 10000001);
				if (document.getElementById(newId) == null)
					break;
			}
			jq$(child).attr("id", newId);
			if (typeof ebc_jqDateFormat != 'undefined' && ebc_jqDateFormat != null && ebc_jqDateFormat != '')
				jq$(child).datepicker({ dateFormat: ebc_jqDateFormat });
			else
				jq$(child).datepicker();
		}
		if (ids.indexOf('CaCalPlace') >= 0) {
			if (child.children.length == 0) {
				if (caCalendarsPoolIndex == 1000) {
					CalendarFrom_CaCal1000.PopUp = 1;
					CalendarTo_CaCal1000.PopUp = 1;
				}
				if (caCalendarsPoolIndex == 1001) {
					CalendarFrom_CaCal1001.PopUp = 1;
					CalendarTo_CaCal1001.PopUp = 1;
				}
				if (caCalendarsPoolIndex == 1002) {
					CalendarFrom_CaCal1002.PopUp = 1;
					CalendarTo_CaCal1002.PopUp = 1;
				}
				if (caCalendarsPoolIndex == 1003) {
					CalendarFrom_CaCal1003.PopUp = 1;
					CalendarTo_CaCal1003.PopUp = 1;
				}
				if (caCalendarsPoolIndex == 1004) {
					CalendarFrom_CaCal1004.PopUp = 1;
					CalendarTo_CaCal1004.PopUp = 1;
				}
				if (caCalendarsPoolIndex < 1005) {
					var nc = document.getElementById('CaCalContainer' + caCalendarsPoolIndex);
					child.appendChild(nc);
					caCalendarsPoolIndex++;
				}
			}
			return true;
		}
		if (r == false)
			r = EBC_FixCAControlsC(child);
	}
	return r;
}

function EBC_internalInsertHandler(row, index, rowNumberForClone) {
	var rNumberForColne = 0;
	if (rowNumberForClone != null)
	 rNumberForColne = rowNumberForClone ;
	var table = EBC_GetParentTable(row);
	var max = table.getAttribute("max");
	var body = table.tBodies[0];
	if (max == null || max > body.rows.length) 
	{
		var caProcessNeeded = EBC_CheckCAControlsNeeded(row);
		if (caProcessNeeded)
			var pair = EBC_SecureCaControls(table.tBodies[0].rows[0]);
		var newRow = table.tBodies[0].rows[rNumberForColne].cloneNode(true);
		if (caProcessNeeded) {
			if (pair[3] == null)
				pair[1].appendChild(pair[2]);
			else
				pair[1].insertBefore(pair[2], pair[3]);
		}
		newRow._table = table;
		var savedAutogrouping = table.skipAutogrouping;
		table.skipAutogrouping = true;
		EBC_PrepareNewRow(newRow);
		var handler = ebc_rowInsertHandlers[table.id];
		if (handler != null)
		{
			handler(newRow);
		}
		newRow = EBC_InsertRow(table, index, newRow);

    EBC_FixCAControlsC(newRow);
		
		table.skipAutogrouping = savedAutogrouping;
		return newRow;
	}
	return null;
}

function EBC_InsertAboveHandler(e, rowNumberForClone)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	EBC_internalInsertHandler(row, row["sectionRowIndex"], rowNumberForClone);
}

function EBC_InsertBelowHandler(e, rowNumberForClone)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	EBC_internalInsertHandler(row, row["sectionRowIndex"] + 1, rowNumberForClone);
}

function EBC_MoveUpHandler(e, allowMoveLastRow)
{
	var row;
	if(e)
	{
		ebc_mozillaEvent = e;
		row = EBC_GetRow(e.target);
	}
	else
		row = EBC_GetRow();
	if(row == null)
		return;
	if(row["sectionRowIndex"] <= 0)
		return;
	var table = EBC_GetParentTable(row);
	var body = table.tBodies[0];
	if(!allowMoveLastRow && row["sectionRowIndex"]>=body.rows.length-1)
		return;
	body.insertBefore(row, body.rows[row["sectionRowIndex"]-1]);
}

function EBC_MoveDownHandler(e, allowMoveLastRow)
{
	var row;
	if(e)
	{
		ebc_mozillaEvent = e;
		row = EBC_GetRow(e.target);
	}
	else
		row = EBC_GetRow();
	if(row == null)
		return;
	var table = EBC_GetParentTable(row);
	var body = table.tBodies[0];
	if(!allowMoveLastRow && row["sectionRowIndex"]>=body.rows.length-2 || row["sectionRowIndex"]>=body.rows.length-1)
		return;
	body.insertBefore(body.rows[row["sectionRowIndex"] + 1], row);
}

function EBC_RemoveHandler(e)
{
	if(e)
	{
		ebc_mozillaEvent = e;
		EBC_RemoveRow(EBC_GetRow(e.target));
	}
	else
		EBC_RemoveRow(EBC_GetRow());
}

function EBC_RemoveAllRows(id)
{
	var table = document.getElementById(id),
	min = table.getAttribute("min") || 0,
	body = table.tBodies[0],
	rowCount = body.rows.length - min,
	i = 0, ti = table.id, handler = ebc_rowRemoveHandlers[ti];
	if (handler != null)
		for (; i < rowCount; ++i)
		{
			body.removeChild(body.firstChild);
			handler(ti);
		}
	else
		for (; i < rowCount; ++i)
			body.removeChild(body.firstChild);
}

function EBC_RemoveRow(row)
{
	EBC_RemoveRow_Internal(row,EBC_GetParentTable(row));
}

function EBC_RemoveRow_Internal(row, table)
{
	var min = table.getAttribute("min");
	var body = table.tBodies[0];
	if (min == null || min < body.rows.length)
	{
		body.removeChild(row);
		var handler = ebc_rowRemoveHandlers[table.id];
		if (handler != null)
			handler(table.id);
	}
}


function EBC_RemoveNotLastRowHandler(selectName, e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var table = EBC_GetParentTable(row);
	var rowCount = table.rows.length;
	var columnSelect = EBC_GetSelectByName(row, selectName);
	if (columnSelect.value != '...')
		return EBC_RemoveRow_Internal(row, table);
	var prevRow = (rowCount>2) ? table.rows[rowCount-2] : null;
	var prevColumnSelect = prevRow == null ? null : EBC_GetSelectByName(prevRow, selectName);
	if (row.rowIndex != rowCount - 1 || (prevColumnSelect!=null && prevColumnSelect.value=='...'))
		EBC_RemoveRow_Internal(row, table);
}

function EBC_AddEmptyRow(row, rowNumberForClone) {
	var table = EBC_GetParentTable(row);
	if (row == table.tBodies[0].lastChild) {
		return EBC_internalInsertHandler(row, row["sectionRowIndex"] + 1, rowNumberForClone);
	}
}

function EBC_RemoveUnusedRows(table, column)
{
	var sel, cur, r = table.tBodies[0].rows, rowCount = r.length;
	for (i = rowCount - 2; i >= 0; --i)
	{
		cur = r[i];
		sel = EBC_GetSelectByName(cur, column);
		if (sel && sel.value == '...')
			EBC_RemoveRow_Internal(cur, table);
	}
}

function EBC_RemoveAllUnusedRows()
{
	for(var i=0; i < ebc_selTable.length; ++i)
	{
		var table = ebc_selTable[i];
		if(table != null)
			EBC_RemoveUnusedRows(table, 'Column');
	}
}

function EBC_GetDataTypeGroup(row, columnName, functionName, formatName)
{
	if (columnName == null)
		columnName = 'Column';
	if (formatName == null)
		formatName = 'Format';
	var columnSel = EBC_GetSelectByName(row, columnName);
	var formatSelect = EBC_GetSelectByName(row, formatName);
	
	return EBC_GetDataTypeGroup_Internal(row,columnSel, functionName, formatSelect);
}

function EBC_GetDataTypeGroup_Internal(row, columnSel, functionName, formatSelect)
{
	if (functionName == null)
		functionName = 'Function';
	var functionSel = EBC_GetSelectByName(row, functionName);

	var typeGroup = formatSelect==null ? "" : formatSelect.getAttribute("TypeGroup");
	
	if((!typeGroup || typeGroup=="None") && functionSel.selectedIndex > -1)
		typeGroup = functionSel==null ? "" : functionSel.options[functionSel.selectedIndex].getAttribute("dataTypeGroup");
		
	if((!typeGroup || typeGroup=="None") && columnSel.selectedIndex > -1)
		typeGroup = columnSel==null ? "" : columnSel.options[columnSel.selectedIndex].getAttribute("dataTypeGroup");
	return typeGroup;
}

function EBC_SetFormat(row, onlySimple, columnName, functionName, formatName) {
	if (columnName == null)
		columnName = 'Column';
	if (formatName == null)
		formatName = 'Format';
	var formatSelect = EBC_GetSelectByName(row, formatName);
	var columnSel = EBC_GetSelectByName(row, columnName);
	if (formatSelect == null || columnSel == null)
		return;
	if (columnSel.selectedIndex == -1)
		return;

	var newValue = formatSelect.value;
	var dataTypeGroup = EBC_GetDataTypeGroup_Internal(row, columnSel, functionName, formatSelect);
	if (dataTypeGroup == null)
		dataTypeGroup = "";
	if (row.getAttribute("userChanged") != "true") {
		var format = formatSelect.value;
		if (((format == "{0}" || format == "...") && dataTypeGroup != "") && formatSelect.style["display"] != "none")
			newValue = defaultFormats[dataTypeGroup];
	}
	EBC_LoadData(
		"FormatList",
		"type=" + dataTypeGroup +
			(onlySimple ? "&" + "onlySimple=true" : ""),
		formatSelect,
		true,
		function() { EBC_SetSelectedIndexByValue(EBC_GetSelectByName(row, formatName), newValue) });
}

function EBC_SetFunctions(row, mustGroupOrFunction, onlyNumericResults, defaultAggregateFunction, onlyGroup, funcSelectName, includeGroup, forSubtotals, columnName, isExtraFunction, setDefaultIfPossible) {
	if (columnName == null)
		columnName = 'Column';
	if (funcSelectName == null)
		funcSelectName = 'Function';
	if (onlyNumericResults == null)
		onlyNumericResults = false;
	if (mustGroupOrFunction == null)
		mustGroupOrFunction = false;
	if (onlyGroup == null)
		onlyGroup = false;
	if (includeGroup == null)
		includeGroup = true;
	if (forSubtotals == null)
		forSubtotals = false;
	if (isExtraFunction == null)
	    isExtraFunction = false;
	var forDundasMap = jq$(row).find("select[name*=map_]").length > 0; //Determines whether the row is on the dundas map editor by finding any dropdowns with names like "map_"
	var columnSel = EBC_GetSelectByName(row, columnName); //The control using the database column list
	var funcSelect = EBC_GetSelectByName(row, funcSelectName); //The control using the SqlFunctionList
	var mainFuncSelect = EBC_GetSelectByName(row, 'Function'); //Always "Function" because this is always an aggregate function of the column
	if (columnSel == null || funcSelect == null)
		return;
	var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
	var isOperation = false;
	if(operationElem && operationElem.ElementExists() && !operationElem.isDefault())
		isOperation = true;
	if (columnSel.selectedIndex >= 0) {
		var option_ = columnSel.options[columnSel.selectedIndex];
		var typeGroup = option_.getAttribute("dataTypeGroup");
		var type = option_.getAttribute("dataType");
		if (funcSelectName == "SubtotalFunction" && mainFuncSelect != null) {
			var mainFuncOption = mainFuncSelect.options[mainFuncSelect.selectedIndex];
			if (mainFuncOption != null) {
				var mfTypeGroup = mainFuncOption.getAttribute("dataTypeGroup");
				var mfType = mainFuncOption.getAttribute("dataType");
				if (mfTypeGroup && mfType && mfTypeGroup != "None" && mfTypeGroup != "Other" && mfType != "Unknown") {
					typeGroup = mfTypeGroup;
					type = mfType;
				}
			}
		}
		if (typeGroup == null)
			typeGroup = "";
		if (type == null)
			type = "";
		var baseValue = null, value = "None";
		if (forSubtotals)
			value = "DEFAULT";
		var includeBlank = "true";
		if (defaultAggregateFunction != null && defaultAggregateFunction != "None")
			baseValue = defaultAggregateFunction;
		if(defaultAggregateFunction != null && defaultAggregateFunction == "ForceNone")
			baseValue = "None";
		if (typeGroup != "" && !isOperation) {
			if (mustGroupOrFunction) {
				if (onlyGroup)
					value = 'GROUP';
				else {
					if (typeGroup == 'Numeric' || typeGroup == 'Real' || typeGroup == 'Money')
						value = 'SUM';
					else
						value = 'COUNT';
				}
			}

			if (onlyNumericResults) {
				if (typeGroup != 'Numeric' && typeGroup != 'Real' && typeGroup != 'Money') {
					includeBlank = false;
					includeGroup = false;
					value = 'COUNT_DISTINCT';
				}
			}
		}
		funcSelect.Loading = true;
		if (row._ignoreDescriptor != undefined)
			row._ignoreDescriptor++;
		else
			row._ignoreDescriptor = 1;
		EBC_LoadData(
			"FunctionList",
			"type=" + type +
				"&" + "typeGroup=" + typeGroup +
				"&" + "includeBlank=" + includeBlank +
				"&" + "includeGroupBy=" + includeGroup +
				"&" + "forSubtotals=" + forSubtotals +
				"&" + "extraFunction=" + isExtraFunction +
				"&" + "forDundasMap=" + forDundasMap +
				"&" + "onlyNumericResults=" + onlyNumericResults,
			funcSelect,
			true,
			function() {
				var funcSelect = EBC_GetSelectByName(row, funcSelectName);
				row._ignoreDescriptor--;
				if ((funcSelect.value == "None" || (setDefaultIfPossible && baseValue != null)) && option_.text != "..." && !forSubtotals) {
					EBC_SetSelectedIndexByValue(funcSelect, baseValue || value);
					EBC_FireOnChange(funcSelect);
					if (baseValue && funcSelect.value != baseValue) {
						EBC_SetSelectedIndexByValue(funcSelect, value);
						EBC_FireOnChange(funcSelect);
					}
				}
			}
		);
	}
}

/// optimize work with EBC_Humanize
function EBC_SetDescription(row) {
	//if(row._ignoreDescriptor){
//		return;}

	//if(row.getAttribute("userChanged")=="true")
//		return;

	// Find controls in a row
	var funcSelect = EBC_GetSelectByName(row, 'Function');
	var formatSel = EBC_GetSelectByName(row, 'Format');
	var descriptionEdit = EBC_GetInputByName(row, 'Description');
	var columnSel = EBC_GetSelectByName(row, 'Column');

	// Check - user modified
	if (descriptionEdit == null)
		return;
	if (descriptionEdit.UserModified && descriptionEdit.value != '')
		return;

	descriptionEdit.ChangedAutomatically = true;
	if (funcSelect == null) return;
	var funcSelectValue = funcSelect.value;
	if (funcSelectValue == null) return;
	if (columnSel.selectedIndex <= 0) return;
	var columnName = columnSel.options[columnSel.selectedIndex].text;
	if (columnName == '' || columnName == '...') {
		descriptionEdit.value = '';
		descriptionEdit.ChangedAutomatically = false;
		return;
	}
	if (typeof MEBC_ShowDatabaseTypes != 'undefined' && MEBC_ShowDatabaseTypes != null && MEBC_ShowDatabaseTypes == true)
		columnName = SC_RemoveDatabaseType(columnName);
	if (funcSelectValue == 'GROUP_BY_MONTH_NAME') {
		if (descriptionEdit.getAttribute("FirstModification") == 'true') {
			descriptionEdit.setAttribute("FirstModification", "false");
			if (descriptionEdit.value != jsResources.Month) {
				descriptionEdit.UserModified = true;
				return;
			}
		}
		descriptionEdit.ChangedAutomatically = false;
		descriptionEdit.value = jsResources.Month;
		return;
	}

	if (funcSelectValue == 'AVG_DAYS_OLD') {
		if (descriptionEdit.getAttribute("FirstModification") == 'true') {
			descriptionEdit.setAttribute("FirstModification", "false");
			if (descriptionEdit.value != 'Average(Days Old(' + columnName + '))') {
				descriptionEdit.UserModified = true;
				return;
			}
		}
		descriptionEdit.ChangedAutomatically = false;
		descriptionEdit.value = 'Average(Days Old(' + columnName + '))';
		return;
	}
	if (funcSelectValue == 'SUM_DAYS_OLD') {
		if (descriptionEdit.getAttribute("FirstModification") == 'true') {
			descriptionEdit.setAttribute("FirstModification", "false");
			if (descriptionEdit.value != 'Sum(Days Old(' + columnName + '))') {
				descriptionEdit.UserModified = true;
				return;
			}
		}
		descriptionEdit.ChangedAutomatically = false;
		descriptionEdit.value = 'Sum(Days Old(' + columnName + '))';
		return;
	}

	var funcSelectText = funcSelect.options[funcSelect.selectedIndex].text;
	if (funcSelectText == "..." || funcSelectValue == 'GROUP')
		funcSelectText = "";

	var startVal = funcSelectText.indexOf("(");
	var endVal = funcSelectText.indexOf(")");
	if (startVal > 0 && endVal > startVal)
		funcSelectText = funcSelectText.substring(startVal + 1, endVal);

	var formatSelValue = formatSel.value;
	var suffix = "";
	if (formatSelValue == "PercentOfGroup")
		suffix = " %";
	var newValue = EBC_Humanize(funcSelectText, columnName, suffix);
	if (descriptionEdit.getAttribute("FirstModification") == 'true') {
		descriptionEdit.setAttribute("FirstModification", "false");
		if (descriptionEdit.value != newValue) {
			descriptionEdit.UserModified = true;
			return;
		}
	}
	descriptionEdit.value = newValue;
	descriptionEdit.ChangedAutomatically = false;
}

function EBC_IsRealChangedSelValue(sel) {
	if (sel == null)
		return false;
	var value = EBC_GetSelectValue(sel);
	var oldValue = sel.getAttribute("oldValue");
	var result = false;
	if (oldValue != null && oldValue != '' && oldValue != '...' && oldValue != 'Loading ...') {
		result = (oldValue != value);
	}
	sel.setAttribute("oldValue", value);
	return result;
}
