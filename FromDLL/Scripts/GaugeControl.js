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

function GC_OnTableListChangedHandlerWithStoredParams() {
	if (lastCallParams_GC_OnTableListChangedHandler == null || lastCallParams_GC_OnTableListChangedHandler.length != 2)
		return;
	GC_OnTableListChangedHandler(lastCallParams_GC_OnTableListChangedHandler[0], lastCallParams_GC_OnTableListChangedHandler[1]);
}

var lastCallParams_GC_OnTableListChangedHandler = new Array();
function GC_OnTableListChangedHandler(id, tables)
{
	if (!tables)
		return;
	var sc_wac_works_val = false;
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true)
		sc_wac_works_val = true;
	var JTCS_Init_executes_val = false;
	if (typeof JTCS_Init_executes != 'undefined' && JTCS_Init_executes != null && JTCS_Init_executes == true)
		JTCS_Init_executes_val = true;
	if (sc_wac_works_val || JTCS_Init_executes_val) {
		lastCallParams_GC_OnTableListChangedHandler = new Array();
		lastCallParams_GC_OnTableListChangedHandler[0] = id;
		lastCallParams_GC_OnTableListChangedHandler[1] = tables;
		return;
	}
	tablesSave[id] = tables;
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	if(tables.join != null)
		tables = tables.join("'");
	var additionalData = null;
	if(descriptions != null && descriptions.length > 0)
	{
		additionalData = "<option disabled=''>------</option>";
		for(var j = 0; j < descriptions.length; j++) {
			var calcField = descriptions[j];
			additionalData = additionalData + '<option value="Desciption!' + calcField.description + '"' + (calcField.datatype != null ? (' datatype="' + calcField.datatype + '"') : '') + ' fieldIndex="' + calcField.fieldIndex + '">[' + calcField.description + '] (calc)</option>';
		}
	}
	for (var i = 0; i < body.rows.length; i++)
	{
		var columnSel = EBC_GetSelectByName(body.rows[i], 'Column');
		var tempData = additionalData;
		if (columnSel != null)
		{
			var filter = "";
			var filter2 = "";
			if(i == 1)
			{
				filter = "NotBinary";
				filter2 = "NotText";
				tempData = null;
			}
			EBC_LoadData(
				"CombinedColumnList",
				"tables=" + tables +
				"&" + "typeGroup=" + filter +
				"&" + "type=" + filter2 +
				"&" + "includeBlank=true",
				columnSel,
				null,
				null,
				tempData);
			var fmtSel = EBC_GetSelectByName(body.rows[i], 'FormatValue');
			if (fmtSel != null) {
				EBC_SetFormat(body.rows[i], true, null, null, "FormatValue");
			}
		}
	}
}

function GC_OnAggregateFunctionChanged(e, chartElementId) {
	var selectElement = AdHoc.Utility.getElementByEvent(e);
	var tr = AdHoc.Utility.findParentElement(selectElement, 'tr');
	if (tr != null) {
		var fmtSel = EBC_GetSelectByName(tr, 'FormatValue');
		if (fmtSel != null) {
			EBC_SetFormat(tr, true, null, null, "FormatValue");
		}
	}
}

function GC_OnColumnChangedHandler(e)
{
	if(e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow(e);
	try {
		var columnSel = EBC_GetSelectByName(row, 'Column');
		var oldValue = columnSel.getAttribute("oldValue");
		if (columnSel.options[columnSel.selectedIndex].restrictselecting == "true") {
			if (oldValue != null && columnSel.options[columnSel.selectedIndex].value != oldValue) {
				EBC_SetSelectedIndexByValue(columnSel, oldValue);
		alert(jsResources.ThisFieldCannotBeSelected);
		}
	}
	columnSel.setAttribute("oldValue", columnSel.options[columnSel.selectedIndex].value);
	}
	catch (exc) {}
	if (row == null)
		return;
			
	var rowFunc = EBC_GetSelectByName(row, 'Function');
	jq$(rowFunc).removeAttr('disabled');
	if (columnSel.options[columnSel.selectedIndex].value.indexOf('Desciption!') == 0)
		jq$(rowFunc).attr('disabled', 'true');
			
	EBC_SetFunctions(row, false, row["sectionRowIndex"] != 1);
	var fmtSel = EBC_GetSelectByName(row, 'FormatValue');
	if (fmtSel != null) {
		EBC_SetFormat(row, true, null, null, "FormatValue");
	}
	var id = EBC_GetParentTable(row).id;
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var count = 1;
	
	var disableAfterIndex = -1;

	var enableAll = true;
	for (var i = 1; i < body.rows.length-1; i++)
	{
		var selField = EBC_GetSelectByName(body.rows[i], 'Column');
		if(selField!=null && selField.value=="...")
		{
			if (disableAfterIndex == -1)
				disableAfterIndex = i;
		}
	}
	if (disableAfterIndex == -1)
		disableAfterIndex = body.rows.length-1;
	for (var i = 1; i < body.rows.length; i++)
	{
		var selField = EBC_GetSelectByName(body.rows[i], 'Column');
		var selFunc = EBC_GetSelectByName(body.rows[i], 'Function');
		
		if (i > disableAfterIndex)
		{
			if (!selField.disabled)
			{
				selField.oldIndex = selField.selectedIndex;
				selField.selectedIndex = 0;
				selField.disabled = true;
				if (selFunc != null)
				{
					selFunc.disabled = true;
					if (selFunc.length == 1) 
						EBC_SetFunctions(body.rows[i], false,  false);
				}
			}
		}
		else {
			if (selField != null)
			    selField.disabled = false;
			if (selFunc != null && selField.options[selField.selectedIndex].value.indexOf('Desciption!') == -1)
				selFunc.disabled = false;
			if (i == disableAfterIndex && selField != null)
			{
				if (selField.oldIndex != -1)
					selField.selectedIndex = selField.oldIndex;
				selField.oldIndex = -1;
				if (selField.selectedIndex != 0)
					disableAfterIndex++;
			}
		}
	}

	for (var i = 1; i < body.rows.length-1; i++)
	{
		var selField = EBC_GetSelectByName(body.rows[i], 'Column');
		if(selField!=null && selField.value=="...")
			count = 0;
	}
	EBC_CheckFieldsCount(id, count);
}

function getElementsByNameIE(tag, name) {

  var elem = document.getElementsByTagName(tag);
  var arr = new Array();
  for (i = 0, iarr = 0; i < elem.length; i++) {
    att = elem[i].getAttribute("name");
    if (att == name) {
      arr[iarr] = elem[i];
      iarr++;
    }
  }
  return arr;
}

function GC_GlassClicked(e) {
	GC_OtherClicked(e);
  var glassRow = getElementsByNameIE('tr', 'GC_glassCombosRow');
  if (glassRow != null && glassRow[0] != null)
		glassRow[0].style.visibility = '';
}

function GC_AnimateClicked(e) {
	GC_OtherClicked(e);
	var table = EBC_GetParentTable(e);
	jq$(table).find("tr.animateGaugePropertyes").show();
	jq$("tr.gaugeColorSelector").find('input').prop('disabled', true);
}

function GC_OtherClicked(e) {
  var glassRow = getElementsByNameIE('tr', 'GC_glassCombosRow');
  if (glassRow != null && glassRow[0] != null)
		glassRow[0].style.visibility = 'hidden';
	var table = EBC_GetParentTable(e);
	jq$(table).find("tr.animateGaugePropertyes").hide();
	jq$("tr.gaugeColorSelector").find('input').prop('disabled', false);
}

function GC_TargetReportChanged(e)
{
	var row = EBC_GetRow(e);
	if (row != null)
	{
		var value = e.value;
		var visible = (value != "..." && value != "" && value != null);
		for (var i=2;i<4;i++)
		{
			row.cells[i].style.visibility = (visible ? "" : "hidden");
		}
	}
}

function GC_Init(id)
{
	EBC_RegisterControl(id);
}

function GC_PopulateDescriptions(fields)
{
    EBC_PopulateDescriptions(fields);
}

var gc_fields;
function GC_OnFieldsListChangedHandler(id, fields)
{	
	if (gc_fields != fields) {
		if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true)
			sc_qac_timers++;
		setTimeout(function () {
			GC_PopulateDescriptions(fields);
			GC_OnTableListChangedHandler(id, tablesSave[id]);
			if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true) {
				sc_qac_timers--;
				SC_QuickAdd_Close_Callback();
			}
		}, 0);
	}
	gc_fields = fields;
}

var GC_DescSet = false;
function GC_OnFieldsListInitialized(id, fields)
{
	if (!GC_DescSet)
	{
		GC_PopulateDescriptions(fields);
		GC_OnTableListChangedHandler(id, tablesSave[id]);
	}
	GC_DescSet = true;
}