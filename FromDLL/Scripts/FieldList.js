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


var sc_tables = {};
var sc_oldTableList = null;
var SC_onColumnFunctionChangedHandlers = {};
var SC_onColumnInitializedHandlers = {};
var loadCalled = [];
var fieldTypes = {};
var isNetscape = window.navigator.appName == 'Netscape';
var SC_mustGroupOrFunction = {};
var enabledColor;
var disabledColor;
var imageUrl;
var disabledImageUrl;
var allowComparativeArithmetic;
var fieldValueChecked = {};
var groupByMonthName;
var SC_onMultivaluedCheckBoxValueChangedHandlers = {};
var quickAddDiv = document.createElement('div');

function SC_OnDrilDownChang(obj)
{
	if(obj == null)
		return;
	var value = obj.value;
	var table = EBC_GetParentTable(obj);
	var row = null;
	var urlRow = null; 
	if (table != null)
		row = EBC_GetRow(table);
	if (row != null)
	{
		table = EBC_GetParentTable(row);
		if (table != null)
		{
			var rowIndex = row.rowIndex;
			urlRow = table.tBodies[0].rows[rowIndex+2];
			row = table.tBodies[0].rows[rowIndex+1];
		}
		else
			row = null;
	}
	if (row != null)
	{
		var ddStyle = row.getElementsByTagName('SELECT');
		if (ddStyle != null)
			ddStyle = ddStyle[0];
		if (ddStyle != null)
		{
			if (value == '...' || value == '')
			{
				EBC_SetSelectedIndexByValue(ddStyle, '');
				ddStyle.disabled = true;
			}
			else
				ddStyle.disabled = false;

			var styleItems = ddStyle.getElementsByTagName('OPTION');
			if (styleItems && styleItems.length > 0)
				for (var i = 0; i < styleItems.length; i++)
					if (styleItems[i].value == "EmbeddedDetail")
						styleItems[i].disabled = value == "(AUTO)";
			
			if (value != '' && value != '...' && (ddStyle.value == "..." || ddStyle.value == "" || (value == "(AUTO)" && ddStyle.value == "EmbeddedDetail")))
				EBC_SetSelectedIndexByValue(ddStyle, "DetailLinkNewWindow");
		}
	}
	if (urlRow != null)
	{
	    var tbUrl = urlRow.getElementsByTagName('input');
	    if (tbUrl != null)
	        tbUrl = tbUrl[0];
	    if (tbUrl != null)
	        tbUrl.disabled = !(value == '...' || value == '');
	}
}

function SC_FieldValueCheckbox_OnClick(obj, id)
{
	if (obj.checked)
		fieldValueChecked[id] = true;
	else
		fieldValueChecked[id] = false;
	SC_CheckGroupingAndFunctions(id);
}

function SC_RegisterOnColumnFunctionChangeHandler(id, ctrlId, func)
{
	var arr = SC_onColumnFunctionChangedHandlers[id];
	if (arr == null)
	{
		arr = new Array();
		SC_onColumnFunctionChangedHandlers[id] = arr;
	}
	var handler = {};
	handler.id = ctrlId;
	handler.func = func;
	arr.push(handler);
}

function SC_RegisterOnColumnInitializedHandler(id, ctrlId, func)
{
	var arr = SC_onColumnInitializedHandlers[id];
	if (arr == null)
	{
		arr = new Array();
		SC_onColumnInitializedHandlers[id] = arr;
	}
	var handler = {};
	handler.id = ctrlId;
	handler.func = func;
	arr.push(handler);
}

function SC_CallOnColumnFunctionChangeHandlers(id, columnName, functionName)
{
	if (columnName == null)
		columnName = 'Column';
	if (functionName == null)
		functionName = 'Function';
	var handlers = SC_onColumnFunctionChangedHandlers[id];
	var fields = SC_GetFieldsList(id, columnName, functionName);
	EBC_CheckFieldsCount(id, fields.length);
	if (handlers != null)
	{
		for (var i = 0; i < handlers.length; i++)
			handlers[i].func(handlers[i].id, fields);
	}
}
function SC_GetFieldsList(id, columnName, functionName)
{
	if (columnName == null)
		columnName = 'Column';
	if (functionName == null)
		functionName = 'Function';
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var fields = new Array();
	for (var i = 0; i < body.rows.length; i++)
	{		
		var columnSel = EBC_GetSelectByName(body.rows[i], columnName);
		var funcSelect = EBC_GetSelectByName(body.rows[i], functionName);
		var descriptionEdit = EBC_GetInputByName(body.rows[i], 'Description');
		var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', body.rows[i]);
		var coefficientEdit = EBC_TextAreaByName(body.rows[i], 'Coefficient');
		var expressionTypeElem = EBC_GetSelectByName(body.rows[i], 'ExpressionType');

		if (columnSel != null)
		{
			var columnSelValue = columnSel.value;
			if(columnSelValue != '...')
			{
				var field = {};
				if (operationElem.ElementExists()) {
				    if (operationElem.valueElement.value.trim() == "")
				        field.operationElem = '~';
                    else
				        field.operationElem = operationElem.valueElement.value;
				} else
				    field.operationElem = '~';
				field.column = columnSelValue;
				if (funcSelect != null) {
					field.func = funcSelect.value;
					var option = funcSelect.options[funcSelect.selectedIndex];
					if (option != null)
						field.datatype = option.getAttribute("datatype");
				}
				if (descriptionEdit != null)
				    field.description = descriptionEdit.value;
				if (coefficientEdit != null) {
				    field.coefficient = "";
				    var coefVal = coefficientEdit.value;
				    if (coefVal.trim() != "" && coefVal.indexOf('example:') != 0)
				        field.coefficient = coefVal;
				}
				field.expressionType = expressionTypeElem == null ? '' : expressionTypeElem.value;
				field.index = i;
				fields.push(field);
			}
			else
			{
				if (operationElem.ElementExists())
					operationElem.disable();
			}
		}
	}
	return fields;
}

function SC_SetAcceptableValues(row, operationElem, columnName, functionName) 
{
	if (operationElem.ElementExists()) 
	{
		var funcSelect = EBC_GetSelectByName(row, functionName == null ? 'Function': functionName);
		var columnSel = EBC_GetSelectByName(row, columnName == null ? 'Column' : functionName);
		if (columnSel.selectedIndex > -1)
		{
			var dataTypeGroup = columnSel.options[columnSel.selectedIndex].getAttribute("dataTypeGroup");
			if (dataTypeGroup == "Numeric" || dataTypeGroup == "Real" || dataTypeGroup == "Money" ||
			  funcSelect.value == "COUNT" || funcSelect.value == "COUNT_DISTINCT" ||
				funcSelect.value == "DAYS_OLD" || funcSelect.value == "AVG_DAYS_OLD" || funcSelect.value == "SUM_DAYS_OLD")
			{
				if (allowComparativeArithmetic)
					operationElem.setAcceptableValues("arithmetic1");
				else
					operationElem.setAcceptableValues("arithmetic2");
			}
			else if (dataTypeGroup == "DateTime" || dataTypeGroup == "Date")
			{
				
				if (allowComparativeArithmetic)
					operationElem.setAcceptableValues("arithmetic5");
				else
					operationElem.setAcceptableValues("arithmetic6");
			}
			else
			{
				if (allowComparativeArithmetic)
					operationElem.setAcceptableValues("arithmetic3");
				else
					operationElem.setAcceptableValues("arithmetic4");
			}
		}
	}
}

function SC_LoadColumns(id, path, options, columnName)
{
	if (JTCS_Init_executes)
		return;
	var cName = 'Column';
	if (columnName != null && columnName != "")
		cName = columnName;
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	for (var i = 0; i < body.rows.length; i++)
	{
		loadCalled[i] = '1';
		var row = body.rows[i];
		var columnSel = EBC_GetSelectByName(row, cName);		
		if (columnSel != null)
		{
			var value = columnSel.value;
			if (options.indexOf("&" + "addExpression=true") == -1)
			    options += "&" + "addExpression=true";
			EBC_LoadData(path, options, columnSel);
		}
	}
}

function SC_OnTableListInitialized(id, tables)
{
	sc_tables[id] = tables;
	
	var fields = SC_GetFieldsList(id, 'Column', 'Function');
		EBC_CheckFieldsCount(id, fields.length);
	
	var handlers = SC_onColumnInitializedHandlers[id];
	if (handlers != null)
	{
		for (var i = 0; i < handlers.length; i++)
			handlers[i].func(handlers[i].id, fields);
	}
	if (typeof TS_activateDefaultTab != 'undefined')
		TS_activateDefaultTab();
}

function SC_OnTableListInitializedWithExtraColumn(id, tables)
{
	sc_tables[id+"_ExtraColumn"] = tables;
	var fields = SC_GetFieldsList(id, "ExtraColumn", "ExtraFunction");
	EBC_CheckFieldsCount(id+"_ExtraColumn", fields.length);
	SC_OnTableListInitialized(id, tables);
}

function SC_OnTableListChangedHandlerWithExtraColumn(id, tables)
{
	SC_OnTableListChangedHandler(id, tables);
	SC_OnTableListChangedHandler(id+"_ExtraColumn", tables, null, true);
}

function SC_OnTableListChangedHandler(id, tables, loadFields, extraColumn)
{
	var isExtraColumn = (extraColumn != null && extraColumn == true);
	var message = document.getElementById(id + '_Message');
	if (message)
	{
		message.innerHTML = jsResources.NoTablesSelected;
		message.style.display = tables=="" ? 'block' : 'none';
	}
	
	if(tables.join!=null)
	{
		SC_ChangeAllTablesSel(id, tables);
		tables = tables.join('\'');
	}
	else
	{
		var tablesArray = tables.split("'");
		SC_ChangeAllTablesSel(id, tablesArray);
	}
	sc_tables[id] = tables;
	if (isExtraColumn)
	{
		SC_LoadColumns(id, "CombinedColumnList", "tables="+tables, 'ExtraColumn');
		SC_LoadColumns(id, "CombinedColumnList", "tables="+tables, 'ExtraValue');
	}
	else
		SC_LoadColumns(id, "CombinedColumnList", "ignoreSort=true&tables="+tables);
		//EBC_LoadData(
		//	"CombinedColumnList", 
		//	"tables=" + tables +
		//	"&" + "ignoreSort=true",
		//	null);
}

function SC_OnExtraColumnChangedHandler(e, el, columnName)
{
	var cName = 'Column';
	if (columnName != null)
		cName = columnName;
	if(e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if (row != null)
	{
		var parentTable = EBC_GetParentTable(row);
		var savedAutogrouping = parentTable.skipAutogrouping;
		parentTable.skipAutogrouping = true;
		
		var columnSel = EBC_GetSelectByName(row, cName);
		if (cName == 'ExtraColumn')
		{
			SC_ShowExtraColumns(parentTable.id);
			var funcSelect = EBC_GetSelectByName(row, 'ExtraFunction');
			var funcSelectValue = '';
			var id = EBC_GetParentTable(row).id;
			EBC_SetFunctions(row, true, false, null, true, 'ExtraFunction', null, null, cName, true);
			SC_CheckGroupingAndFunctions(id);
            // Not sure about this code that's why wrapped with try-catch
		    try{
		        if (jq$(columnSel).find(':selected').attr('datatypegroup') == "DateTime" && jq$(funcSelect).val() == "GROUP")
		            jq$(funcSelect).val('GROUP_BY_YEAR_AND_MONTH');		
		    }
		    catch(e){}
		}
		else
		{
			var funcSelect = EBC_GetSelectByName(row, 'ExtraValueFunction');
			var funcSelectValue = '';
			var id = EBC_GetParentTable(row).id;
			var mustGroup = SC_mustGroupOrFunction[id];
			if (SC_mustGroupOrFunction[id] == undefined && EBC_GetSelectByName(EBC_GetParentTable(row).rows[0], 'ExtraFunction').value != 'None')
			    mustGroup = true;
			EBC_SetFunctions(row, true, false, null, false, 'ExtraValueFunction', null, null, cName, null, null, true);
		
			EBC_SetFormat(row, null, cName, 'ExtraFormat');
			
			var descriptionEdit = EBC_GetInputByName(row, 'ExtraDescription');
			if (columnSel && descriptionEdit)
			{
				var colName = columnSel.options[columnSel.selectedIndex].text;
				if (colName == '' || colName == '...' || colName == 'Loading ...')
					descriptionEdit.value = '';
				else if (!descriptionEdit.value)
					descriptionEdit.value = colName;
			}
			
			SC_ColumnChangeContext = {};
			SC_ColumnChangeContext.row = row;
			SC_ColumnChangeContext.strColumn = cName;
			SC_ColumnChangeContext.columnSel = columnSel;
			SC_ResetRowToDefault(true);
		}
	}
}

function SC_InsertExtraColumnBelow(id)
{
    EBC_InsertBelowHandler(event, 1);
    if (jq$('#' + id + '_ExtraColumn').children().children().length > 1){
        jq$('.' + id + '_ExtraDescription_Label1').show();
        jq$('.' + id + '_ExtraDescription').show();
        jq$(this).parents('tr').next().find('.' + id + '_ExtraDescription').val('');
        jq$('.' + id + '_ExtraDescription_Label2').show();
    }
}

function SC_RemoveExtraColumn(id, force)
{
	EBC_RemoveNotLastRowHandler('ExtraValue', event, force);
    if (jq$('#' + id + '_ExtraColumn').children().children().length < 3) {
        jq$('.' + id + '_ExtraDescription_Label1').hide();
        jq$('.' + id + '_ExtraDescription').hide();
        jq$('.' + id + '_ExtraDescription_Label2').hide();
    }
}

var SC_ColumnChangeContext = {};

function SC_OnColumnChangedHandler(e, el) {
	if (e) {
		ebc_mozillaEvent = e;
	}

	var row = EBC_GetRow();

	if (row != null && row.parentNode != null) {
		if (row._scColumnChangeFired == true) {
			return;
		}
		row._scColumnChangeFired = true;
		row._ignoreDescriptor = 0;

		var parentTable = EBC_GetParentTable(row);
		var id = parentTable.id;
		var savedAutogrouping = parentTable.skipAutogrouping;
		parentTable.skipAutogrouping = true;

		try {
			var isLoadCalled = loadCalled[row.rowIndex - 1] == 1;

			var strColumn = el.name.substr(el.name.lastIndexOf("_") + 1);
			var columnSel = EBC_GetSelectByName(row, strColumn);
			var strFunction = jq$(row).find("select[name*=Function][onchange*=OnFunctionChangeHandler]").attr("name");
			strFunction = strFunction.substr(strFunction.lastIndexOf("_") + 1);
			var oldValue = columnSel.getAttribute("oldValue");
			var isNotSelectedColumnSel = (columnSel.value == "" || columnSel.value == "..." || columnSel.selectedIndex == -1);

			var isSameValue = oldValue != null && columnSel.options[columnSel.selectedIndex].value == oldValue;
			var fieldCannotBeSelected = false;
			var showChangeRowCheckDialog = false;
			var coefficientEditTemp = EBC_GetElementByName(row, "Coefficient", "TEXTAREA");

			if (oldValue != null && columnSel.options[columnSel.selectedIndex].value != oldValue) {
				if (columnSel.options[columnSel.selectedIndex].restrictselecting == "true") {
					var dialogHtml = "<div id=\"" + id + "_ChangeRowCheck\"><div>This field cannot be selected.</div><br /><input type=\"button\" id=\"" + id + "_ChangeRowCheck_Ok\" value=\"" + jsResources.OK + "\" name=\"" + id + "_ChangeRowCheck_Ok\" onclick=\"SC_ChangeRowCheckDialogResult(false, '" + id + "');\"></div>";
					ShowDialog(dialogHtml);
					fieldCannotBeSelected = true;
					showChangeRowCheckDialog = true;
				} else if (coefficientEditTemp && coefficientEditTemp.value.trim().indexOf("example") != 0) {
					var dialogHtml = "<div id=\"" + id + "_ChangeRowCheck\"><div>You will lose Expression data if you select a different field. Continue?</div><br /><input type=\"button\" id=\"" + id + "_ChangeRowCheck_Ok\" value=\"" + jsResources.OK + "\" name=\"" + id + "_ChangeRowCheck_Ok\" onclick=\"SC_ChangeRowCheckDialogResult(true, '" + id + "');\">&nbsp;" +
						"<input type=\"button\" id=\"" + id + "_ChangeRowCheck_Cancel\" value=\"" + jsResources.Cancel + "\" name=\"" + id + "_ChangeRowCheck_Cancel\" onclick=\"SC_ChangeRowCheckDialogResult(false, '" + id + "');\"></div>";
					ShowDialog(dialogHtml);
					showChangeRowCheckDialog = true;
				}
			}

			if (columnSel) {
				if (isLoadCalled) {
					loadCalled[row.rowIndex - 1] = 0;
				}

				if (!isNotSelectedColumnSel && !fieldCannotBeSelected) {
					var newRow = EBC_AddEmptyRow(row);
					if (newRow) {
						var newColumnSel = EBC_GetSelectByName(newRow, strColumn);
						SC_ColumnChangeContext = {};
						SC_ColumnChangeContext.row = newRow;
						SC_ColumnChangeContext.strColumn = strColumn;
						SC_ColumnChangeContext.columnSel = newColumnSel;
						SC_ColumnChangeContext.strFunction = strFunction;
						SC_ColumnChangeContext.oldValue = newColumnSel.getAttribute("oldValue");
						SC_ColumnChangeContext.isNotSelectedColumnSel = true;

						SC_ResetRowToDefault();
					}
				}
			}

			SC_ColumnChangeContext = {};
			SC_ColumnChangeContext.row = row;
			SC_ColumnChangeContext.strColumn = strColumn;
			SC_ColumnChangeContext.columnSel = columnSel;
			SC_ColumnChangeContext.strFunction = strFunction;
			SC_ColumnChangeContext.oldValue = oldValue;
			SC_ColumnChangeContext.isNotSelectedColumnSel = isNotSelectedColumnSel;

			if (!showChangeRowCheckDialog && !isSameValue) {
				SC_ResetRowToDefault();
			}
		} finally {
			row._scColumnChangeFired = false;
			parentTable.skipAutogrouping = savedAutogrouping;
		}
	}
}

function SC_ResetRowToDefault(isExtraColumn) {
	var row = SC_ColumnChangeContext.row,
		columnSel = SC_ColumnChangeContext.columnSel,
		strColumn = SC_ColumnChangeContext.strColumn,
		strFunction = SC_ColumnChangeContext.strFunction,
		isNotSelectedColumnSel = SC_ColumnChangeContext.isNotSelectedColumnSel;

	var prefix = isExtraColumn ? 'exv' : '';

	if (row && columnSel) {
		if (EBC_IsRealChangedSelValue(columnSel)) {
			row.setAttribute("userChanged", "false");
		}

		var parentTable = EBC_GetParentTable(row);

		var dataTypeGroup = "";
		if (columnSel.selectedIndex != -1) {
			dataTypeGroup = EBC_GetDataTypeGroup(row, strColumn, strFunction, null);
			if (dataTypeGroup == null) {
				dataTypeGroup = "";
			}
		}

		var isBinaryDataTypeGroup = dataTypeGroup == "Binary";
		var disabledSort = isBinaryDataTypeGroup;

		/* 
		 * General Field Settings
		 */

		/* Description */
		var descriptionEdit = EBC_GetInputByName(row, prefix + "Description");
		if (descriptionEdit) {
			descriptionEdit.value = "";
			descriptionEdit.disabled = false;

			EBC_SetDescription(row, true);
		}

		/* Function */
		var funcSelect = EBC_GetSelectByName(row, strFunction);
		if (funcSelect) {
			funcSelect.selectedIndex = 0;
			funcSelect.disabled = false;
		}

		var mustGroupOrFunction = false;
		var body = parentTable.tBodies[0];
		var rows = body.rows;
		var i = 0;
		var count = rows.length;
		while (!mustGroupOrFunction && i < count) {
			var funcTemp = EBC_GetSelectByName(rows[i], strFunction);
			var groupCheckboxTemp = EBC_GetElementByName(rows[i], prefix + "Group", "INPUT");
			var isGruopChecked = groupCheckboxTemp && groupCheckboxTemp.checked;
			var isScalar = funcTemp == null ? null : funcTemp.options[funcTemp.selectedIndex].getAttribute("isScalar");
			isScalar = isScalar == null || isScalar.length == 0 ? "0" : isScalar;
			mustGroupOrFunction = (funcTemp == null ? false : (funcTemp.selectedIndex > 0 || isGruopChecked) && isScalar == "0");
			i++;
		}

		/* Group */
		var groupCheckbox = EBC_GetElementByName(row, prefix + "Group", "INPUT");
		if (groupCheckbox) {
			groupCheckbox.checked = mustGroupOrFunction && !isNotSelectedColumnSel;
			groupCheckbox.disabled = false;
			mustGroupOrFunction = false;
		}

		/* Sort */
		var orderCheckbox = EBC_GetElementByName(row, prefix + "Order", "INPUT");
		if (orderCheckbox) {
			orderCheckbox.checked = false;
			orderCheckbox.disabled = disabledSort;
		}

		/* VG */
		var masterCheckbox = EBC_GetElementByName(row, prefix + "Master", "INPUT");
		if (masterCheckbox) {
			masterCheckbox.checked = false;
			masterCheckbox.disabled = false;
		}

		/* A */
		var arithmeticOperationElem = new AdHoc.MultivaluedCheckBox(prefix + "ArithmeticOperation", row);
		if (arithmeticOperationElem.ElementExists()) {
			if (isNotSelectedColumnSel || isBinaryDataTypeGroup) {
				arithmeticOperationElem.disable();
			} else {
				arithmeticOperationElem.enable();
				arithmeticOperationElem.setValueInternal(" ");
			}
			SC_AfterArithmeticOperationChanged(ebc_mozillaEvent);
		}

		/* 
		 * Advanced Field Settings
		 */

		/* Column Group */
		var columnGroupEdit = EBC_GetInputByName(row, prefix + "ColumnGroup");
		if (columnGroupEdit) {
			columnGroupEdit.value = columnGroupEdit.getAttribute("data-default") || "";;
			columnGroupEdit.disabled = false;
		}

		/* Break Page After VG (PDF) */
		var breakPageCheckbox = EBC_GetElementByName(row, prefix + "BreakPage", "INPUT");
		if (breakPageCheckbox) {
			breakPageCheckbox.checked = false;
			breakPageCheckbox.disabled = true;
		}

		/* Multiline Header */
		var multilineHeaderCheckbox = EBC_GetElementByName(row, prefix + "IsMultilineHeader", "INPUT");
		if (multilineHeaderCheckbox) {
			multilineHeaderCheckbox.checked = false;
			multilineHeaderCheckbox.disabled = false;
		}

		/* Hide this field */
		var invisibleCheckbox = EBC_GetElementByName(row, prefix + "Invisible", "INPUT");
		if (invisibleCheckbox) {
			invisibleCheckbox.checked = false;
			invisibleCheckbox.disabled = false;
		}

		/* Separator */
		var separatorCheckbox = EBC_GetElementByName(row, prefix + "Separator", "INPUT");
		if (separatorCheckbox) {
			separatorCheckbox.checked = false;
			separatorCheckbox.disabled = false;
		}

		/* Sort (z-a) */
		var orderDescCheckbox = EBC_GetElementByName(row, prefix + "OrderDesc", "INPUT");
		if (orderDescCheckbox) {
			orderDescCheckbox.checked = false;
			orderDescCheckbox.disabled = disabledSort;
		}

		/* Italic */
		var italicCheckbox = EBC_GetElementByName(row, prefix + "Italic", "INPUT");
		if (italicCheckbox) {
			italicCheckbox.checked = false;
			italicCheckbox.disabled = false;
		}

		/* Bold */
		var boldCheckbox = EBC_GetElementByName(row, prefix + "Bold", "INPUT");
		if (boldCheckbox) {
			boldCheckbox.checked = false;
			boldCheckbox.disabled = false;
		}

		/* Width */
		var widthEdit = EBC_GetInputByName(row, prefix + "Width");
		if (widthEdit) {
			widthEdit.value = widthEdit.getAttribute("data-default") || "";
			widthEdit.disabled = false;
		}

		/* Label Justification */
		var labelJustificationElem = new AdHoc.MultivaluedCheckBox(prefix + "LabelJustification", row);
		if (labelJustificationElem.ElementExists()) {
			labelJustificationElem.enable();
			labelJustificationElem.setValueInternal("M");
		}

		/* Value Justification */
		var justificationElem = new AdHoc.MultivaluedCheckBox(prefix + "Justification", row);
		if (justificationElem.ElementExists()) {
			justificationElem.enable();
			justificationElem.setValueInternal(" ");
		}

		/* Subreport */
		var subreportSelect = EBC_GetSelectByName(row, prefix + "Subreport");
		if (subreportSelect) {
			subreportSelect.selectedIndex = 0;
			subreportSelect.disabled = false;
		}

		/* Drill-Down Style */
		var drillDownStyleSelect = EBC_GetSelectByName(row, prefix + "DrillDownStyle");
		if (drillDownStyleSelect) {
			drillDownStyleSelect.selectedIndex = 0;
			drillDownStyleSelect.disabled = true;
		}

		/* Url */
		var urlEdit = EBC_GetInputByName(row, prefix + "Url");
		if (urlEdit) {
			urlEdit.value = urlEdit.getAttribute("data-default") || "";
			urlEdit.disabled = false;
		}

		/* Subtotal Function */
		var subtotalFunctionSelect = EBC_GetSelectByName(row, prefix + "SubtotalFunction");
		if (subtotalFunctionSelect) {
			subtotalFunctionSelect.selectedIndex = 0;
			subtotalFunctionSelect.disabled = false;
		}

		/* Subtotal Expression */
		var subtotalExpressionEdit = EBC_GetElementByName(row, prefix + "SubtotalExpression", "TEXTAREA");
		if (subtotalExpressionEdit) {
			subtotalExpressionEdit.value = subtotalExpressionEdit.getAttribute("data-default") || "";
			subtotalExpressionEdit.disabled = false;
		}

		/* Gradient Cells Shading */
		var gradientCheckbox = EBC_GetElementByName(row, prefix + "Gradient", "INPUT");
		if (gradientCheckbox) {
			gradientCheckbox.checked = false;
			gradientCheckbox.disabled = false;
		}

		/* Text Highlight */
		var textHighlightEdit = EBC_GetInputByName(row, prefix + "TextHighlight");
		if (textHighlightEdit) {
			textHighlightEdit.value = textHighlightEdit.getAttribute("data-default") || "";
			textHighlightEdit.disabled = false;
		}

		/* Cell Highlight */
		var cellHighlightEdit = EBC_GetInputByName(row, prefix + "CellHighlight");
		if (cellHighlightEdit) {
			cellHighlightEdit.value = cellHighlightEdit.getAttribute("data-default") || "";
			cellHighlightEdit.disabled = false;
		}

		/* Value Ranges */
		var valueRangesEdit = EBC_GetInputByName(row, prefix + "ValueRanges");
		if (valueRangesEdit) {
			valueRangesEdit.value = valueRangesEdit.getAttribute("data-default") || "";
			valueRangesEdit.disabled = false;
		}

		/* Expression */
		var coefficientEdit = EBC_GetElementByName(row, prefix + "Coefficient", "TEXTAREA");
		if (coefficientEdit) {
			coefficientEdit.value = coefficientEdit.getAttribute("data-default") || "";
			coefficientEdit.disabled = false;
		}

		/* Expression type */
		var expressionTypeSelect = EBC_GetSelectByName(row, prefix + "ExpressionType");
		if (expressionTypeSelect) {
			expressionTypeSelect.selectedIndex = 0;
			expressionTypeSelect.disabled = false;
		}

		/* Group By Expression */
		var groupByExpressionCheckbox = EBC_GetElementByName(row, prefix + "GroupByExpression", "INPUT");
		if (groupByExpressionCheckbox) {
			groupByExpressionCheckbox.checked = false;
			groupByExpressionCheckbox.disabled = false;
		}

		/* 
		 * Post-Actions
		 */

		EBC_SetFunctions(row, mustGroupOrFunction, false, null, true, strFunction, null, null, strColumn);
		EBC_SetFunctions(row, mustGroupOrFunction, false, null, true, prefix + "SubtotalFunction", false, true, strColumn);

		if (!isNotSelectedColumnSel && strColumn == (prefix + "Column")) {
			SC_CheckPropertiesModified(row);
		}

		if (arithmeticOperationElem.ElementExists()) {
			SC_SetAcceptableValues(row, arithmeticOperationElem);
		}
	}
}

function SC_ChangeRowCheckDialogResult(result, id) {
	var dialog = document.getElementById(id + "_ChangeRowCheck");
	if (result) {
		SC_ResetRowToDefault();
	} else {
		var row = SC_ColumnChangeContext.row,
			columnSel = SC_ColumnChangeContext.columnSel,
			oldValue = SC_ColumnChangeContext.oldValue;
		if (row && columnSel && (typeof oldValue != "undefined" && oldValue != null)) {
			EBC_SetSelectedIndexByValue(columnSel, oldValue);
			if (oldValue == '' || oldValue == '...') {
				SC_ResetRowToDefault();
			}
		}
	}
	HideDialog(dialog, true);
}

function SC_GetStringBeforeParenthesis(src)
{
	var index = src.indexOf('(');
	return (index==-1) ? src : src.substring(0, index);
}

function SC_RemoveDatabaseType(src) {
	var index = src.lastIndexOf('(');
	return (index == -1) ? src : src.substring(0, index);
}

function SC_CheckGroupingAndFunctionsWithStoredParams() {
	if (lastCallParams_SC_CheckGroupingAndFunctions == null || lastCallParams_SC_CheckGroupingAndFunctions.length != 1)
		return;
	SC_CheckGroupingAndFunctions(lastCallParams_SC_CheckGroupingAndFunctions[0]);
}

var oldIsCorrect = true;
var isCorrect = true;
var showWarning = false;
var lastCallParams_SC_CheckGroupingAndFunctions = new Array();
function SC_CheckGroupingAndFunctions(id)
{
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true) {
		lastCallParams_SC_CheckGroupingAndFunctions = new Array();
		lastCallParams_SC_CheckGroupingAndFunctions[0] = id;
		return;
	}
	var table = document.getElementById(id);
	if (table.attributes["eventID"] != null)
	{
		id = table.attributes["eventID"].value;
		table = document.getElementById(id);
	}
	mustGroupOrFunction = SC_mustGroupOrFunction[id];
	if (fieldValueChecked[id])
		mustGroupOrFunction = false;
	//var table = document.getElementById(id);

	var body = table.tBodies[0];
	oldIsCorrect = isCorrect;
	isCorrect = true;
	var isArithmeticProblem = false;
	var rowCount = body.rows.length;
	if (rowCount > 0)
	{
		var isGrouped = 'NotSet';
		for (var i = 0; i < rowCount; i++)
		{
			var row = body.rows[i];
			if(row._scColumnChangeFired)
			    continue;
			var strSelectName = jq$(body.rows[i]).find("select[onchange*=SC_OnColumnChangedHandler]").attr("name"); //Gets the name of the first control in the row with an onchange attribute like SC_OnColumnChangedHandler
			if (strSelectName == null)
			    continue; //not a row with a valid select element
			strSelectName = strSelectName.substr(strSelectName.lastIndexOf("_") + 1);
			var strFunctionName = jq$(body.rows[i]).find("select[onchange*=SC_OnFunctionChangeHandler]").attr("name"); //Gets the name of the first control in the row with an onchange attribute like SC_OnFunctionChangeHandler
			strFunctionName = strFunctionName.substr(strFunctionName.lastIndexOf("_") + 1);
			var columnSelect = EBC_GetSelectByName(row, strSelectName);
			var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
			var isOperation = false;
			if(operationElem.ElementExists() && !operationElem.isDefault())
					isOperation = true;
			if(columnSelect!=null) {
				if (columnSelect.value != '...') {
				  var funcSelect = EBC_GetSelectByName(row, strFunctionName);
				  var isScalar = funcSelect.options[funcSelect.selectedIndex].getAttribute("isScalar");
				  if (isScalar == null || isScalar.length == 0)
				    isScalar = '0';
					if (!isOperation)
					{
					  var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
						if (mustGroupOrFunction) {
						  if ((groupCheckbox == null || !groupCheckbox.checked) && (funcSelect.value == 'None' || funcSelect.value == '...' || isScalar == '1'))
							{
							  isCorrect = false;
								break;
							}
						}
						else if (isGrouped == 'NotSet')
						  isGrouped = ((groupCheckbox != null && groupCheckbox.checked) || (funcSelect.value != 'None' && funcSelect.value != '...' && isScalar == '0'));
						else if (((groupCheckbox != null && groupCheckbox.checked) || (funcSelect.value != 'None' && funcSelect.value != '...' && isScalar == '0')) != isGrouped)
						{
						  isCorrect = false;
							break;
						}
					}
					else if (funcSelect.value == 'GROUP')
						isArithmeticProblem = true;
				}
			}
		}
	}
	var messageText;
	{
		if (SC_mustGroupOrFunction[id])
			messageText = jsResources.EachSelectionMustBeEitherGroupedOrAFunction;
		else
			messageText = jsResources.IfFunctionsAreUsedEachSelectionMustBeAFunction;
	}
	var message = document.getElementById(table.id + '_Message');
	if (message)
	{
		message.innerHTML = messageText;
		message.style.display = isCorrect ? 'none' : 'block';
	}
	if (showWarning==false && isCorrect!=oldIsCorrect)
	{
		if(typeof(DisableEnablePreviewTab)!='undefined')
			DisableEnablePreviewTab(!isCorrect);
		if(typeof(DisableEnableToolbar)!='undefined')
			DisableEnableToolbar(!isCorrect);
	}
	SC_CheckTotals(id);
}

function SC_CheckTotalsIsUsed(id)
{
	var totalsSelect = document.getElementsByName(id + '_SubtotalsFunction')[0];
	if(totalsSelect==null)
		return;
	var totalsShown;
	if (totalsSelect.value=="None")
		totalsShown = false;
	else
		totalsShown = true;

	showWarning = false;
	if (totalsShown)
	{
		showWarning = true;
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var rowCount = body.rows.length;
		if (rowCount > 0)
		{
			for (var i = 0; i < rowCount; i++)
			{
				var row = body.rows[i];
				var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
				if (orderCheckbox.checked)
				{
					showWarning = false;
					break;
				}
			}
		}
	}

	var message = document.getElementById(id + '_MessageTotals');
	if (message) 
		message.style.display = showWarning ? 'block' : 'none';
	
	if (isCorrect==true)
	{
		if(typeof(DisableEnablePreviewTab)!='undefined')
			DisableEnablePreviewTab(showWarning);
		if(typeof(DisableEnableToolbar)!='undefined')
			DisableEnableToolbar(showWarning);
	}
	

}

function SC_SmartMarkingGroupingAndFunctions(id, groupOn)
{
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var rowCount = body.rows.length;
	var groupingCount = 0;
	var functionsCount = 0;
	var notEmptyRowCount = 0;
	
	if (rowCount > 0)
	{
		for (var i = 0; i < rowCount; i++)
		{
			var row = body.rows[i];
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
			if(operationElem.ElementExists() && !operationElem.isDefault())
				continue;
			if (columnSelect == undefined || columnSelect == null || columnSelect.value == '...')
				continue;
				
			notEmptyRowCount++;
			var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
			var funcSelect = EBC_GetSelectByName(row, 'Function');
			var isScalar = funcSelect.options[funcSelect.selectedIndex].getAttribute("isScalar");
			if (isScalar == null || isScalar.length == 0)
			  isScalar = '0';
			if ((groupCheckbox!=null && groupCheckbox.checked) || funcSelect.value == 'GROUP')
				groupingCount++;
			else if (funcSelect.value != 'None' && isScalar == '0')
				functionsCount++;
		}
		if ((functionsCount == 1 && groupingCount == 0 || functionsCount == 0 && groupingCount == 1)&& groupOn)
		{
			for (var i = 0; i < rowCount; i++)
			{
				var row = body.rows[i];
				var columnSelect = EBC_GetSelectByName(row, 'Column');
				var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
				if(operationElem.ElementExists() && !operationElem.isDefault())
					continue;
				if(columnSelect!=null && columnSelect.value != '...')
				{
					var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
					var funcSelect = EBC_GetSelectByName(row, 'Function');
					if (funcSelect.value == 'None')
					{
					  if (groupCheckbox != null)
					    groupCheckbox.checked = true;
					  else {
					    EBC_SetSelectedIndexByValue(funcSelect, 'GROUP');
					  }
					}
				}
			}
		}
		else if (functionsCount == 0 && groupingCount == notEmptyRowCount - 1 && !groupOn)
		{
			for (var i = 0; i < rowCount; i++)
			{
				var row = body.rows[i];
				var columnSelect = EBC_GetSelectByName(row, 'Column');
				var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
				if(operationElem.ElementExists() && !operationElem.isDefault())
					continue;
				if(columnSelect!=null && columnSelect.value != '...')
				{
					var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
					var funcSelect = EBC_GetSelectByName(row, 'Function');
					if (groupCheckbox!=null)
						groupCheckbox.checked = false;
					else
						funcSelect.value = 'None';
				}
			}
		}
	}
}

function SC_CheckTotals(id)
{
	var index = id.indexOf('_ExtraColumn');
	if (index > 0)
		id = id.substring(id.length-12,0);
	var totalsSelect = document.getElementsByName(id + '_SubtotalsFunction')[0];
	var totalsDiv = document.getElementById(id + '_TotalsDiv');
	if(totalsSelect==null)
		return;
	
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var rowCount = body.rows.length;
	var numerics = false;
	if (rowCount > 0)
	{
		for (var i = 0; i < rowCount; i++)
		{
			var row = body.rows[i];
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			if(columnSelect==null)
				continue;
			if(columnSelect.selectedIndex==-1)
				continue;
			var dataTypeGroup = EBC_GetDataTypeGroup(row);
			if(dataTypeGroup=="Numeric" || dataTypeGroup=="Real" || dataTypeGroup=="Money")
			{
				numerics = true;
				break;
			}
		}
	}
	
	if (!numerics)
	{
		var extraRow = document.getElementById(id + "_ExtraColumn_valueTR");
		if (extraRow != null)
		{
			if (extraRow.style["display"] != "none")
			{
				var dataTypeGroup = EBC_GetDataTypeGroup(extraRow, "ExtraValue", "ExtraValueFunction", "ExtraFormat");
				numerics = (dataTypeGroup=="Numeric" || dataTypeGroup=="Real" || dataTypeGroup=="Money");
			}
		}
	}
	
	if(!numerics)
	{
		totalsSelect.disabled = true;
		totalsDiv.style["display"] = "none";
	}
	else
	{
		totalsSelect.disabled = false;
		totalsDiv.style["display"] = "";
	}
}

function SC_OnFunctionChangeHandler(e, el, cName, fName, cFormat) {
	if (cName == null)
		cName = 'Column';
	if (fName == null)
		fName = 'Function';
	if (cFormat == null)
		cFormat = 'Format';
	if(e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if(row._scFunctionChangeFired)
			return;
		row._scFunctionChangeFired = true;
	try
	{
		var columnSel = EBC_GetSelectByName(row, cName);
		var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
		var funcSelect = EBC_GetSelectByName(row, fName);
		if (EBC_IsRealChangedSelValue(funcSelect))
			row.setAttribute("userChanged", "false");

		var columnName = columnSel.options[columnSel.selectedIndex].text;
		var isNeedToSetDF = true;
		if (operationElem.ElementExists() && !operationElem.isDefault())
			isNeedToSetDF = false;
		if (isNeedToSetDF)
			EBC_SetFormat(row, null, cName, fName, cFormat);
	
		var id = EBC_GetParentTable(row).id;
	
		if(SC_mustGroupOrFunction[id] && funcSelect.value==groupByMonthName)
		{
			var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
			orderCheckbox.checked = true;
		}
		SC_SetAcceptableValues(row, operationElem);
	
		SC_OnGroupFunctionChangeHandler(ebc_mozillaEvent, el, isNeedToSetDF, fName);
		SC_CallOnColumnFunctionChangeHandlers(id, cName, fName);
		EBC_SetFunctions(
				row,
				mustGroupOrFunction,
				false,
				null,
				true,
				"SubtotalFunction",
				false,
				true);
	}
	finally
	{
		row._scFunctionChangeFired = false;
	}
}

function SC_OnFormatChangeHandler(e, el)
{
	if(e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if(row._scFormatChangeFired)
		return;
	row._scFormatChangeFired = true;
	try
	{
		var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);

		var isNeedToSetD = true;
		if (operationElem.ElementExists() && !operationElem.isDefault())
			isNeedToSetD = false;
		if (isNeedToSetD)
			EBC_SetDescription(row);
	}
	finally
	{
		row._scFormatChangeFired = false;
	}
}

function SC_OnGroupFunctionChangeHandler(e, el, isNeedToSetDescription, functionName)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
	var funcSelect = EBC_GetSelectByName(row, functionName == null ? 'Function' : functionName);
	
	var src;
	if(isNetscape || window.event==null)
		src = ebc_mozillaEvent;
	else
		src = window.event.srcElement;
	var element = (el!=null ? el : (e.target ? e.target : e.srcElement));
	
	if(groupCheckbox != null && element==groupCheckbox && groupCheckbox.checked)
		funcSelect.value = 'None';
	
	if(element==funcSelect && funcSelect.value!='None' && groupCheckbox != null)
		groupCheckbox.checked = false;
	//if (isNeedToSetDescription == null || isNeedToSetDescription)
		EBC_SetDescription(row);
	var parentTable = EBC_GetParentTable(row);
	var id = parentTable.id;
	
	// Second argument specifies whether grouping should "TURN ON" or "TURN OFF"
	if (!parentTable.skipAutogrouping && !element.Loading)
	{
		SC_SmartMarkingGroupingAndFunctions(id,
			(element==funcSelect && element.value!='None') ||
			(element==groupCheckbox && element.checked));
	}
		
	SC_CheckGroupingAndFunctions(id);
}

function SC_ClearRowInputs(row)
{
	var inputs = row.getElementsByTagName('INPUT');
	for (var i = 0; i < inputs.length; i++)
	{
		var input = inputs[i];
		if (input.type == 'checkbox'){
		    if (input.getAttribute("data-default") != undefined && input.getAttribute("data-default") != null)
		        input.checked = input.getAttribute("data-default").toLower() == "true";
		    else
		        input.checked = false;
		}
		else if (input.type == 'text'){
		    if (input.getAttribute("data-default") != undefined && input.getAttribute("data-default") != null)
		        input.value = input.getAttribute("data-default");
		    else
			    input.value = '';
		}
		else if (input.type == 'hidden')
		{
		    if (input.getAttribute("data-default") != undefined && input.getAttribute("data-default") != null)
		        input.value = input.getAttribute("data-default");
		}
	}
	var button = EBC_GetElementByName(row , "AdvancedButton" , "IMG");
	var src = button.getAttribute("src");
	var index = src.indexOf("advanced-settings");
	src = src.substring(0,index);
	src += "advanced-settings.png";
	button.setAttribute("src", src);	
}

function SC_InitNewRow(row)
{
	row.setAttribute("userChanged", "false");
	SC_InitRow(row);
	SC_ClearRowInputs(row);
	SC_CheckGroupingAndFunctions(EBC_GetParentTable(row).id);
	row._scColumnChangeFired = false;
	row._scFunctionChangeFired = false;
	row._scFormatChangeFired = false;
}

function SC_InitRow(row)
{
	var columnSel = EBC_GetSelectByName(row, 'Column');
	var functionSel = EBC_GetSelectByName(row, 'Function');
	var formatSel = EBC_GetSelectByName(row, 'Format');
	var id = EBC_GetParentTable(row).id;
	if (columnSel != null && sc_tables[id] != null)
	{
		var value = columnSel.value;
		var url = sc_tables[id];
		if(url.indexOf("&" + "addExpression=true") == -1)
			url +="&" + "addExpression=true";
		EBC_LoadData("CombinedColumnList", "tables=" + url, columnSel);
	}
	if (functionSel != null)
		EBC_LoadData('FunctionList', null, functionSel);
	if (formatSel != null)
		EBC_LoadData('FormatList', null, formatSel);
	var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
	if(operationElem.ElementExists())
		SC_AfterArithmeticOperationChanged(ebc_mozillaEvent);
}

function SC_Init(id, checked, mustGroupOrFunction, a, g) {
	groupByMonthName = g;
	allowComparativeArithmetic = a;
	fieldValueChecked[id] = checked;
	SC_mustGroupOrFunction[id] = mustGroupOrFunction;
	EBC_RegisterControl(id);
	EBC_SetData('@SC/Empty', '<option value=\'...\'>...</option>');
	var table = document.getElementById(id);
	EBC_RegisterRowInsertHandler(table, SC_InitNewRow);
	var body = table.tBodies[0];
	var count = body.rows.length;
	for (var i = 0; i < count; i++) {
		SC_CheckPropertiesModified(body.rows[i]);
		var columnSel = EBC_GetSelectByName(body.rows[i], 'Column');
		if (columnSel.value != "..." && columnSel.value != "")
			body.rows[i].setAttribute("userChanged", "true");
	}
	SC_CheckGroupingAndFunctions(id);
	EBC_RegisterRowRemoveHandler(table, SC_OnRemoveTableRow);
	EBC_RegiserForUnusedRowsRemoving(table);
}

function SC_InitPivotTable(id) {
	EBC_RegisterControl(id);
	var table = document.getElementById(id);
	EBC_RegisterRowInsertHandler(table, SC_InitNewRow);
	var extraRows = jq$(table).find("[id$='ExtraColumn_valueTR']");
	for (var i = 0; i < extraRows.length; i++)
		SC_CheckPropertiesModified(extraRows[i]);
	EBC_RegisterRowRemoveHandler(table, SC_OnRemoveTableRow);
	EBC_RegiserForUnusedRowsRemoving(table);
}

function SC_AddTableFields(id)
{
	table = document.getElementById(id);
	var max = table.getAttribute("max");
	var body = table.tBodies[0];
	var rowCount = body.rows.length;
	if (rowCount > 0)
	{
		var allTablesSel = document.getElementById(id + '_AllTables');
		if (allTablesSel.value == '')
			return;
		
		var values = new Array();
		for (var j=0; j<rowCount; j++)
		{
			var columnSel = EBC_GetSelectByName(body.rows[j], 'Column');
			var v = columnSel.value;
			if (v != null && v != '...')
				values.push(columnSel.value);
		}
		
		var lastRow = body.rows[rowCount-1];
		
		
		var columnSel = EBC_GetSelectByName(lastRow, 'Column'); // selection ctrl in last row
		var newColumnSel, newRow;
		var option, dotIndex;
		var filterRe = new RegExp(addAllFilterRegexp, 'i');
		
		var elems = allTablesSel.value.split("'");
		var selectedTableName = elems[0];
		var selectedAlias = null;
		if(elems.length>1)
			selectedAlias = elems[1];
		var currentRow = rowCount -1;
		if (currentRow < 0)
			currentRow = 0;
		for(var i = 0; i < columnSel.options.length && (max == null || max > rowCount); i++)
		{
			optionValue = columnSel.options[i].value;
			// add new row when option value is not empty, not ..., not .*
			// and having our table name before dot.
			if (optionValue == null || optionValue == '...')
				continue;

			var currElems = optionValue.split("'");
			var alias = null;
			if(currElems.length>1)
				alias = currElems[1];
			
			dotIndex = optionValue.lastIndexOf('.');
			
			if (optionValue.substring(0, dotIndex) == selectedTableName && alias == selectedAlias && 
				!filterRe.test(optionValue.substring(dotIndex+2, currElems[0].length-1)))
			{
				var haveValue = false;
				for (var v in values)
					if (values[v]==optionValue)
					{
						haveValue = true;
						break;
					}
				if(haveValue)
					continue;
				if(isNetscape)
					newRow = EBC_InsertRow(table, currentRow);
				else
					newRow = EBC_InsertRow(table.tBodies[0], currentRow);
				currentRow++
				SC_ClearRowInputs(newRow);
				SC_ClearRowSelects(newRow);
				newColumnSel = EBC_GetSelectByName(newRow, 'Column');
				newColumnSel.value = optionValue;
				// most likely this is unreachable code
				// values.push(optionValue);
				EBC_FireOnChange(newColumnSel);
				rowCount = body.rows.length;
			}
		}
		SC_CallOnColumnFunctionChangeHandlers(id);
	}
}

function SC_QuickAdd(id, columnNumber, minInColumn, maxFieldWidth)
{
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var rowCount = body.rows.length;
	if (rowCount<=0)
		return;
		
	var values = {};
	for (var i = 0; i < rowCount; i++)
	{
		var row = body.rows[i];
		var columnSel = EBC_GetSelectByName(row, 'Column');
		var v = columnSel.value;
		if (v != null && v != '...')
			values[v] = true;
	}
	
	var columnSel = document.createElement('select');
	var div = document.createElement('div');
	div.appendChild(columnSel);
	columnSel = div.firstChild;
	var selRez = EBC_LoadData("CombinedColumnList", "&" + "tables=" + sc_tables[id], columnSel, false);
	if (selRez)
		columnSel = selRez;
	else if (div.childNodes.length >0)
	{
		columnSel = div.childNodes[0];
	}

	var html = "<div align='left' style='text-align:left;' class='quick-add-container'><div style='margin-bottom:6px;'>" + jsResources.PleaseSelectTheFields + "</div>";
	
	//all fields
	var allFieldsTable = document.getElementById(id + "_AllFieldsTable");
	
	//  This needs to be moved to version 7
	if (allFieldsTable != null)
	{
		var allFieldsBody = allFieldsTable.tBodies[0];
		var allFieldsRow = allFieldsBody.rows[0];
		var allFieldsCell = allFieldsRow.cells[0];
		var obj = allFieldsCell.childNodes[0];
		var checked = obj.checked ? "checked" : "";
		html += "<div style='font-size:13px;text-align:center;visibility:hidden;'><input type=checkbox " + checked +
						" id='SC_QuickAdd_ShowAll'>&nbsp;" +
						jsResources.ShowAllFields + "</div>";
		
	}
	
	var valuesCount = 0;
	
	var tables = {};
	var options = columnSel.options;
	// check if empty
	for (var i=0;i<options.length;i++) {
		var group = options[i].getAttribute("optgroup");
		if (group != null) {
			if (tables[group] == null) tables[group] = new Array();
			//else 
			tables[group].push(options[i]);
		}
	}
	var maxRows = 0;
	var tablesCount = 0;
	var xBase = 0;
	for (key in tables)
	{
		var currentGroup = tables[key];
		var currentGroupLength = currentGroup.length;
		var rowNumber = Math.min(Math.max(Math.ceil(currentGroupLength / columnNumber), minInColumn), currentGroupLength);
		for (var i = 0; i < currentGroupLength; i++)
		{
			var y = i % rowNumber;
			var x = Math.floor(i / rowNumber) + xBase;
			var item = currentGroup[i];
			currentGroup[i] = {x:x, y:y, item:item};
		}
		xBase += currentGroup.width = Math.ceil(currentGroupLength / rowNumber);
		if (maxRows < rowNumber)
			maxRows = rowNumber;
		tablesCount++;
	}
	
	if (maxRows > 0)
	{
		html += "<style>#mdb table {width: 100%; font-size: 13px; text-align: left;}" +
			"#mdb table tr * {padding-right: 10px;}</style>";
		html += "<table>";  
		html += "<tr>";
		for (key in tables)
			html += "<th colspan='" + tables[key].width + "'>" + key + "</th>";
		html += "</tr>";
		var optNum = 0;
		for (var i = 0; i < maxRows; i++)
		{
			html += "<tr>";
			for (key in tables)
			{
				var currentTable = tables[key];
				var addEmpty = currentTable.width;
				
				for (var j = 0; j < currentTable.length; j++)
				{
					if (currentTable[j].y == i)
					{
						--addEmpty;
						var optionValue = currentTable[j].item.value;
						var optionTitle = currentTable[j].item.innerHTML;
						var optionText = optionTitle;
						if(optionTitle.length > maxFieldWidth)
							optionText = optionTitle.substr(0, maxFieldWidth - 3) + '...';
						var haveValue = values[optionValue];
						html += "<td><nobr><input type=checkbox " + (haveValue ? "checked disabled" : "") +
							" value='" + optionValue +
							"' id='SC_QuickAdd_" + optNum +
							"'> <span title='" + optionTitle + "'>" + optionText + "</span></nobr></td>";
						optNum++;
					}
				}
				while(addEmpty--)
					html += "<td>&nbsp;</td>";
			}
			html += "</tr>";
		}
		html += "</table>";
	}
	html += "</div><input type='button' id='" + id + "_QuickAdd_Ok' value='" + jsResources.OK + "' name='" + id + "_QuickAdd_Ok' onclick=\"SC_QuickAdd_Close(true, '" + id + "')\">&nbsp;";
	html += "<input type='button' id='" + id + "_QuickAdd_Cancel' value='" + jsResources.Cancel + "' name='" + id + "_QuickAdd_Cancel' onclick='SC_QuickAdd_Close(false)'>";
	quickAddDiv.innerHTML = html;
	ShowDialog(quickAddDiv);
	if (isNetscape)
		document.addEventListener('keydown', SC_QuickAdd_Keydown, true);
	else
		document.attachEvent('onkeydown', SC_QuickAdd_Keydown);

	if (selRez == null) {
		jq$('.quick-add-container').css('cursor', 'wait');
		setTimeout(function () { SC_QuickAdd_Refresh(id, columnNumber, minInColumn, maxFieldWidth); }, 500);
	}
}

function SC_QuickAdd_Refresh(id, columnNumber, minInColumn, maxFieldWidth) {
	var columnSel = document.createElement('select');
	var selRez = EBC_LoadData("CombinedColumnList", "&" + "tables=" + sc_tables[id], columnSel, false);

	if (selRez) {
		hm();
		SC_QuickAdd(id, columnNumber, minInColumn, maxFieldWidth);
	}
	else if (jq$('.quick-add-container').length > 0)
		setTimeout(function () { SC_QuickAdd_Refresh(id, columnNumber, minInColumn, maxFieldWidth); }, 500);
}

var sc_qac_works = false;
var sc_qac_requests = 0;
var sc_qac_timers = 0;

function SC_QuickAdd_Close(res, id)
{
	try
	{
		sc_qac_requests = 0;
		sc_qac_timers = 0;
		sc_qac_works = true;
		if(res)
		{
			//show all;
			var showAll = document.getElementById("SC_QuickAdd_ShowAll");
			var allFieldsTable = document.getElementById(id + "_AllFieldsTable");
			if (allFieldsTable != null)
			{
				var allFieldsBody = allFieldsTable.tBodies[0];
				var allFieldsRow = allFieldsBody.rows[0];
				var allFieldsCell = allFieldsRow.cells[0];
				var obj = allFieldsCell.childNodes[0];
				obj.checked = showAll.checked;
				SC_OnShowAll(obj);
			}

			var table = document.getElementById(id);
			var max = table.getAttribute("max");
			var body = table.tBodies[0];
			var rowCount = body.rows.length;
			var needsGroup = false;
			var values = {};
			for (var i=0; i<rowCount; i++)
			{
				var row = body.rows[i];
				var funcSelect = EBC_GetSelectByName(row, 'Function');
				var isScalar = funcSelect.options[funcSelect.selectedIndex].getAttribute("isScalar");
				if (isScalar == null || isScalar.length == 0)
				  isScalar = '0';
				if (funcSelect.value != "None" && funcSelect.value != "..." && isScalar == '0')
					needsGroup = true;
				var columnSel = EBC_GetSelectByName(row, 'Column');
				var v = columnSel.value;
				if (v != null && v != '...')
					values[columnSel.value] = true;
			}

			var lastRow = body.rows[rowCount-1];
			var columnSel = EBC_GetSelectByName(lastRow, 'Column'); // selection ctrl in last row
			var newColumnSel, newRow;
			var currentCheckBox;
			var added = false;
			for(var i = columnSel.options.length-1;i>=0;i--)
			{
				var chbId = "SC_QuickAdd_" + i;
				currentCheckBox = document.getElementById(chbId);
				if (currentCheckBox==null || !currentCheckBox.checked)
					continue;

				var haveValue = values[currentCheckBox.value];
				if(haveValue)
					continue;
					
				if (max < table.tBodies[0].rows.length)
					continue;
					
				added = true;
				newRow = EBC_InsertRow(table, rowCount - 1);
				newRow.setAttribute("userChanged", "");
				SC_ClearRowInputs(newRow);
				SC_ClearRowSelects(newRow);
				newColumnSel = EBC_GetSelectByName(newRow, 'Column');
				newColumnSel.value = currentCheckBox.value;

				if (needsGroup) {
					var funcSelect = EBC_GetSelectByName(newRow, 'Function');
					EBC_SetSelectedIndexByValue(funcSelect, 'GROUP');
				}
				EBC_FireOnChange(newColumnSel);
			}
			while (max < table.tBodies[0].rows.length)
				EBC_RemoveRow(table.tBodies[0].rows[max]);
			if (added)
			{
				SC_CallOnColumnFunctionChangeHandlers(id);
			}
		}
	}
	finally
	{
	    HideDialog(quickAddDiv, true);
	}
}

function SC_QuickAdd_Close_Callback() {
	if (sc_qac_timers > 0 || sc_qac_requests > 0)
		return;
	sc_qac_timers = 0;
	sc_qac_requests = 0;
	sc_qac_works = false;
	if (typeof CHC_OnTableListChangedHandlerWithStoredParams === "function")
		CHC_OnTableListChangedHandlerWithStoredParams();
	if (typeof GC_OnTableListChangedHandlerWithStoredParams === "function")
		GC_OnTableListChangedHandlerWithStoredParams();
	if (typeof CC_OnTableListChangedHandlerWithStoredParams === "function")
		CC_OnTableListChangedHandlerWithStoredParams();
	if (typeof SC_CheckGroupingAndFunctionsWithStoredParams === "function")
		SC_CheckGroupingAndFunctionsWithStoredParams();
	if (typeof EBC_CheckFieldsCountWithStoredParams === "function")
		EBC_CheckFieldsCountWithStoredParams();
}

function SC_QuickAdd_Keydown(evt)
{
	var evt = (evt) ? evt : window.event;
	/*if(evt.keyCode==10 || evt.keyCode==13)
	{
		if(isNetscape)
		{
			evt.stopPropagation();
			evt.preventDefault();
		}
		else
			evt.cancelBubble = true;
		SC_QuickAdd_Close(true);
	}*/
	if(evt.keyCode==27)
		SC_QuickAdd_Close(false);
}

function SC_ClearRowSelects(row)
{
	var selElems = row.getElementsByTagName('SELECT');
	var selCount = selElems.length;
	for (var i = 0; i < selCount; i++)
	{
		var sel = selElems[i];
		if (sel.options.length > 0)
			sel.selectedIndex = 0;
	}
}

function SC_ChangeAllTablesSel(id, tables)
{
	var allTablesSel = document.getElementById(id + '_AllTables');
	if (allTablesSel != null && tables != null && tables.join)
		EBC_LoadData("UsedTableList", "tables=" + tables.join('\''), allTablesSel);
}

function SC_RemoveAllFields(id)
{
	EBC_RemoveAllRows(id);
	SC_CallOnColumnFunctionChangeHandlers(id);
}

function SC_OnOrderCheckedHandle(e)
{
	if(e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
	var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
	if(orderCheckbox.checked)
		orderDescCheckbox.checked = false;
	var table = EBC_GetParentTable(row);
	var id = table.id;
	SC_CheckTotalsIsUsed(id);
}

/*function SC_OnOrderDescCheckedHandle(e)
{
	if(e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
	var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
	if(orderDescCheckbox.checked)
		orderCheckbox.checked = false;
}*/

function SC_AfterArithmeticOperationChanged(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if (row==null)
		return;
	var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
	var descriptionEdit = EBC_GetInputByName(row, 'Description');
	var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
	var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
	var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
	var invCheckbox = EBC_GetElementByName(row, 'Invisible', 'INPUT');
	var formatSelect = EBC_GetSelectByName(row, 'Format');
	var masterCheckbox = EBC_GetElementByName(row, 'Master', 'INPUT');
	if (operationElem.ElementExists() && !operationElem.isDefault())	
	{
		if(descriptionEdit)
		{
			descriptionEdit.value = "";
			descriptionEdit.disabled = true;
		}
		if(groupCheckbox != null && groupCheckbox)
		{
			groupCheckbox.checked = false;
			groupCheckbox.disabled = true;
		}
		if(orderCheckbox)
		{
			orderCheckbox.checked = false;
			orderCheckbox.disabled = true;
		}
		if(orderDescCheckbox)
		{
			orderDescCheckbox.checked = false;
			orderDescCheckbox.disabled = true;
		}
		if(invCheckbox)
		{
			invCheckbox.checked = false;
			invCheckbox.disabled = true;
		}
		if(masterCheckbox)
		{
			masterCheckbox.checked = false;
			masterCheckbox.disabled = true;
		}
		formatSelect.selectedIndex = 0;
		formatSelect.disabled = true;
		var table = EBC_GetParentTable(row);
		var body = table.tBodies[0];
		var index = row["sectionRowIndex"];
		//var setFormat = row.getAttribute("userChanged")!="true";
		var stringFormats = false;
		if(index>0)
		{
			for(var i=index-1;i>=0;i--)
			{				
				var currRow = body.rows[i];
				var funcSelect = EBC_GetSelectByName(currRow, 'Function');
				var columnSel = EBC_GetSelectByName(currRow, 'Column');
				var dataTypeGroup = EBC_GetDataTypeGroup(row);
				if (!(dataTypeGroup == "Numeric" ||
					dataTypeGroup == "Real" ||
					dataTypeGroup == "Money"))
					stringFormats = true;
					
				var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', currRow);
				if (!(operationElem.ElementExists() && !operationElem.isDefault()))
				{
					var formatSelect = EBC_GetSelectByName(currRow, 'Format');
					if (stringFormats)
						formatSelect.setAttribute("TypeGroup", "String");
					else
						formatSelect.setAttribute("TypeGroup", "Real");
					break;
				}
				else
					formatSelect.setAttribute("TypeGroup", "");
			}
		}
	}
	else
	{
		if(descriptionEdit)
			descriptionEdit.disabled = false;
		if(groupCheckbox != null && groupCheckbox)
			groupCheckbox.disabled = false;
		if(orderCheckbox)
			orderCheckbox.disabled = false;
		if(orderDescCheckbox)
			orderDescCheckbox.disabled = false;
		if(invCheckbox)
			invCheckbox.disabled = false;
		if(masterCheckbox)
			masterCheckbox.disabled = false;
		if (formatSelect)
			formatSelect.disabled = false;
		if (descriptionEdit && (descriptionEdit.value=="" || descriptionEdit.value==null))
			EBC_SetDescription(row);
	}
	var id = EBC_GetParentTable(row).id;
	SC_CheckGroupingAndFunctions(id);
	SC_CallOnColumnFunctionChangeHandlers(id);
}

function SC_OnVisualGroupsCheckedHandler(e) {
	if (e) {
		ebc_mozillaEvent = e;
	}
	var row = EBC_GetRow();
	var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
	var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
	var masterCheckbox = EBC_GetElementByName(row, 'Master', 'INPUT');
	var invisibleCheckbox = EBC_GetElementByName(row, 'Invisible', 'INPUT');
	var pageBreakCheckbox = EBC_GetElementByName(row, 'BreakPage', 'INPUT');
	if (masterCheckbox != null && masterCheckbox.checked) {
		if (orderCheckbox != null && !orderCheckbox.checked && orderDescCheckbox != null && !orderDescCheckbox.checked) {
			orderCheckbox.checked = true;
	}
	}
	if (invisibleCheckbox != null) {
		invisibleCheckbox.checked = false;
		invisibleCheckbox.disabled = masterCheckbox.checked;
	}
	if (pageBreakCheckbox != null) {
		pageBreakCheckbox.checked = false;
		pageBreakCheckbox.disabled = !masterCheckbox.checked;
	}
	SC_CheckPropertiesModified(row);
}

function SC_OnDescriptionChangedHandler(e) {
  var emptyVal = false;
	if(e) {
		ebc_mozillaEvent = e;
		var element = e.target ? e.target : e.srcElement;
		if (!(element.ChangedAutomatically)) {
		  element.UserModified = true;
			if (element.value == '') {
		    emptyVal = true;
		}
	}
	}
	var row = EBC_GetRow();
	if (emptyVal) {
	  EBC_SetDescription(row);
	}
	var id = EBC_GetParentTable(row).id;
	SC_CallOnColumnFunctionChangeHandlers(id);
}

function SC_OnRemoveTableRow(id) {
	SC_CallOnColumnFunctionChangeHandlers(id);
	SC_CheckGroupingAndFunctions(id);
}

//var sc_properties_container;
var sc_propsTable;
var dialogRow;
function SC_ShowProperties(e, sc_id) {
	if (e) {
		ebc_mozillaEvent = e;
	}
	dialogRow = EBC_GetRow();
	var propsTable = EBC_GetElementByName(dialogRow, "PropertiesTable", "table");
	var sc = document.getElementById(sc_id);
	var top = AdHoc.Utility.absPosition(sc).top;
	//sc_properties_container = propsTable.parentNode;
	sc_propsTable = ShowDialog(propsTable, null, null, top - 12, null, false);
}

function SC_CheckPropertiesModified(dialogRow) {
	var result = false;
	var propsTable = EBC_GetElementByName(dialogRow, "PropertiesTable", "table");
	if (propsTable != null) {
		var row = propsTable.rows;
		for (var i = 0; i < row.length && !result; i++) {
			var cell = row[i].cells[1];
			if (cell != null) {
				var element = cell.firstChild;
				if (element != null) {
					var tagName = element.nodeName;
					var elType = element.getAttribute("type");
					if (tagName == "TABLE") {
						element = element.rows[0].cells[0].firstChild;
						tagName = element.nodeName;
						elType = element.getAttribute("type");
					}
					switch (tagName) {
						case "INPUT":
							switch (elType) {
									case "text":
											var value = element.value;
											var name = element.getAttribute("name");
											if (name != null && value == "1" && (name.indexOf("_Coefficient")+12 == name.length))
												value = "";
											result = !(value == null || value == "" || (value.indexOf("example") == 0));
										break;
									case "checkbox":
										result = element.checked;
										break;
									case "hidden":
										var value = element.value;
										var defValue = element.getAttribute("data-default");
										result = (value && defValue && value != defValue && value != "&nbsp;");
										break;
								}
							break;
						case "SELECT":
								var value = element.value;
								result = !(value == null || value == "" || value == "..." || (value == "DEFAULT") || (value.indexOf("example") == 0));
							break;
						case "DIV":
								var childNode = element.firstChild;
								if (childNode.nodeName == "INPUT") {
									var cnName = childNode.getAttribute("name");
									if (cnName.indexOf('_LabelJustificationCurrentValue') >= 0 || cnName.indexOf('_exvLabelJustificationCurrentValue') >= 0) {
										result = (childNode.value != 'M');
									} else if (cnName.indexOf('_JustificationCurrentValue') >= 0 || cnName.indexOf('_exvJustificationCurrentValue') >= 0) {
										result = (childNode.value != ' ' && childNode.value != String.fromCharCode(160));
									}
								}
							break;
						case "TEXTAREA":
								var value = element.value;
								result = !(value == null || value == "" || (value.indexOf("example") == 0));
							break;
					}
				}
			}
		}
	}
	var button = EBC_GetElementByName(dialogRow , "AdvancedButton" , "IMG");
	var src = button.getAttribute("src");
	var index = src.indexOf("advanced-settings");
	src = src.substring(0,index);
	src += "advanced-settings";
	if (result) {
		src += "-dot";
	}
	src += ".png";
	button.setAttribute("src", src);
	return result;
}

function SC_HideProperties(id)
{
	HideDialog(sc_propsTable, false);
	var row = EBC_GetRow(sc_propsTable);
	SC_CheckPropertiesModified(row);
	var expressionTypeSelect = EBC_GetSelectByName(row, "ExpressionType");
	if (row != null && expressionTypeSelect) {
		EBC_SetFormat(row, true);
		EBC_SetFunctions(row);
	}
	SC_CallOnColumnFunctionChangeHandlers(id);
	CC_UpdateFiltersFromLogic();
}

function SC_SubtotalFunctionChange(obj)
{
	var table = jq$(obj).closest('table[name$="PropertiesTable"]');
	if (table != null && table.length > 0) {
		var expressionEdit = table.find('textarea[name$="SubtotalExpression"]');
		if (expressionEdit != null && expressionEdit.length > 0) {
			if (jq$(obj).val() == "EXPRESSION")
				expressionEdit.closest('tr').show();
			else
				expressionEdit.closest('tr').hide();
		}
	}
}

function SC_ShowExtraColumns(id)
{
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var columnSel = EBC_GetSelectByName(body.rows[0], 'ExtraColumn');
	var functionSel = EBC_GetSelectByName(body.rows[0], 'ExtraFunction');
	var visibility = (columnSel != null && columnSel.value !='...');
	
	var row = document.getElementById(id+"_valueTR");
	//var usingWord = document.getElementById(id+"_valueWord");
	//var functionWord = document.getElementById(id+"_functionWord");
	
	//var pivotSubtotal = document.getElementById(id+"_Subtotal");
	
	for (var i=1;i<table.rows.length;i++)
	{
		var row = table.rows[i];
		if (visibility)
		{
			row.style["display"] = "";
		}
		else
		{
			row.style["display"] = "none";
		}
		
	}
	
	/*if (visibility)
	{
		row.style["display"] = "";
		functionSel.style["display"] = "";
		usingWord.style["display"] = "";
		functionWord.style["display"] = "";
		if (pivotSubtotal != null)
		  pivotSubtotal.style["display"] = "";
	}
	else
	{
		row.style["display"] = "none";
		functionSel.style["display"] = "none";
		usingWord.style["display"] = "none";
		functionWord.style["display"] = "none";
		if (pivotSubtotal != null)
		  pivotSubtotal.style["display"] = "none";
	}*/
}

function SC_OnTableListChangedHandlerShowAllTables(id, tables)
{
	SC_LoadColumns(id, "CombinedColumnList", "tables="+tables, 'GroupByColumn');
	SC_LoadColumns(id, "CombinedColumnList", "tables="+tables, 'SortByColumn');
}

function SC_OnShowAll(obj)
{
	EBC_CheckFieldsCount(obj.name, obj.checked);
	var table = EBC_GetParentTable(obj);
	var body = table.tBodies[0];
	var row = body.rows[0];
	var display = "none";
	if (obj.checked)
		display = "";
	for (var i=1;i<7;i++)
	{
		var cell = row.cells[i];
		cell.style["display"] = display;
	}
}

function SC_OnDeleteShowAll(id)
{
	var allFieldsTable = document.getElementById(id + "_AllFieldsTable");
	if (allFieldsTable != null)
	{
		var allFieldsBody = allFieldsTable.tBodies[0];
		var allFieldsRow = allFieldsBody.rows[0];
		var allFieldsCell = allFieldsRow.cells[0];
		var obj = allFieldsCell.childNodes[0];
		obj.checked = false;
		SC_OnShowAll(obj);
	}
}

function SC_ShowPivot(id, obj)
{
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var display = body.rows[0].style["display"];
	var columnSel = EBC_GetSelectByName(body.rows[0], 'ExtraColumn');
	if (display == "none")
	{
		body.rows[0].style["display"] = "";
		obj.value = jsResources.RemovePivot;
		jq$("table[id$='ExtraColumn_Subtotal']").show();
	}
	else
	{
		columnSel.value ='...';
		for (var i = 0; i < body.rows.length; i++)
			body.rows[i].style["display"] = "none";
		obj.value = jsResources.AddPivot;
		
		jq$("table[id$='ExtraColumn_Subtotal']").hide();
		SC_CheckTotals(id);
	}
}