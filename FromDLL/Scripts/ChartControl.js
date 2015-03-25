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

var chartTypes = {};
var chartTypeSelectIds = {};
var advancedEnabledIds = {};

// ---------------------------------------
// Chart report - control 
AdHoc.chartControl = function(elementId) {
	this.elementId = elementId;
}
AdHoc.chartControl.prototype = {
	getChartTypeSelect : function() {
		return document.getElementById(this.elementId + '_ChartTypeSelect')
	}
}

// Static methods
AdHoc.chartControl.Instances = new Dictionary();
AdHoc.chartControl.getFromId = function(elementId) {
	var chartControl = AdHoc.chartControl.Instances.getItem(elementId);	
	if (chartControl!=null)
		return chartControl;
	chartControl = new AdHoc.chartControl(elementId);
	AdHoc.chartControl.Instances.addItem(elementId, chartControl);
	return chartControl; 
}

// ----------------------------------------
// Chart report field - control
AdHoc.chartControlRow = function(tr, chartElementId) {
	this.chartControl = AdHoc.chartControl.getFromId(chartElementId);
	this.tr = tr;
	this.tr.associatedChartControlRow = this;
}
AdHoc.chartControlRow.prototype = {
	getOrderCheckBox : function() {
		var td = this.tr.cells[5]; // !FIXME: One more ugly hardcoding
		var chk = jq$(td).find("[type=checkbox]");
		if (chk[0] != undefined && chk[0] != null && jq$(chk[0]).is(":visible"))
			return chk[0]; //Ext.DomQuery.selectNode("div/input", td);
		else 
			return null;
	},
	
	getChartType : function() {
		return this.chartControl.getChartTypeSelect().value;
	},
	
	setOrder : function(value) {
		var checkBox = this.getOrderCheckBox();
		if (checkBox != null && checkBox.checked != value)
			checkBox.click();
	}
}
// Static members 
AdHoc.chartControlRow.fromTrElement = function(tr, chartElementId) {
	if (tr != null && tr.associatedChartControlRow != null)
		return tr.associatedChartControlRow;
	else
		return new AdHoc.chartControlRow(tr, chartElementId);
}
// ----------------------------------------

function CHC_chartInfo(showLegendControlName, checkedControlName, showAreaControlName, showParetoControlName, showRightTitleValueControlName)
{
	this.showLegendControlName = showLegendControlName;
	this.checkedControlName = checkedControlName;
	this.showAreaControlName = showAreaControlName;
	this.showParetoControlName = showParetoControlName;
	this.showRightTitleValueControlName = showRightTitleValueControlName;
}

function CHC_getChartTypeSelectControl(id)
{
	return document.getElementById(chartTypeSelectIds[id]);
}

function CHC_getCurrentChartType(id)
{
	return CHC_getChartTypeSelectControl(id).value;
}

function CHC_getCurrentChartInfo(id)
{
	var chartTypeSelect = CHC_getChartTypeSelectControl(id);
	if (chartTypeSelect && chartTypeSelect.value!="...")
		return CHC_ChartTypeInfo[chartTypeSelect.value];
}

function CHC_getCurrentChartItems(id)
{
	return CHC_ChartTypes[CHC_getCurrentChartType(id)];
}

function CHC_onSeparatorChange(e)
{
	if (e) 
		ebc_mozillaEvent = e;
	var row = EBC_GetRow(e);
	var table = EBC_GetParentTable(row);
	var chartType = "";
	var chartTypeSelect = CHC_getChartTypeSelectControl(table.id);
	if (chartTypeSelect && chartTypeSelect.value!="...")
		chartType = chartTypeSelect.value;
	var prevValue = jq$(e).prop('prevvalue');
	if (chartType && prevValue!= null && prevValue != jq$(e).val()) {
		var legend = jq$(table).siblings('[id$="PropertiesDiv"]').find('[charttype="' + chartType + '"]').find('input[name$="ShowLegend"]');
		var stacked = jq$(table).siblings('[id$="PropertiesDiv"]').find('[charttype="' + chartType + '"]').find('input[name$="Stacked"]');

		var showSeparatorFeatures = e.value != "...";

	    if (legend.length > 0) {
	    	legend[0].checked = showSeparatorFeatures;
	    	legend[0].disabled = !showSeparatorFeatures;
	    	if (!showSeparatorFeatures)
	    		jq$(legend).attr('title', jsResources.RequireSeparatorSelection0.toString().replace(/\{0\}/g, jsResources.ShowLegend));
	    }
	    if (stacked.length > 0) {
	    	stacked[0].checked = showSeparatorFeatures;
	    	stacked[0].disabled = !showSeparatorFeatures;
	    	if (!showSeparatorFeatures)
	    		jq$(stacked).attr('title', jsResources.RequireSeparatorSelection0.toString().replace(/\{0\}/g, jsResources.Stacked));
	    }
	}
	jq$(e).prop('prevvalue', jq$(e).val());
}

function CHC_onParetoChange(e) {
  if (e)
    ebc_mozillaEvent = e;
  var row = EBC_GetRow(e);
  var table = EBC_GetParentTable(row);
  var row2 = EBC_GetRow(table);
  var table2 = EBC_GetParentTable(row2);
  var table2Id = table2.id;
  var lastSub = table2Id.lastIndexOf('_');
  var searchId = table2Id.substr(0, lastSub);
  var chartInfo = CHC_getCurrentChartInfo(searchId);
  if (chartInfo != null)	{
    var showRigthTitleValueControl = document.getElementsByName(chartInfo.showRightTitleValueControlName)[0];
    var fieldValueControl = document.getElementById(searchId + '_FieldValue');
    if (showRigthTitleValueControl == null || fieldValueControl == null)
      return;
    if (e.checked || fieldValueControl.value != "...")
      showRigthTitleValueControl.disabled = false;
    else
      showRigthTitleValueControl.disabled = true;
  }
}

function CHC_onHorizontalChange(e) {
	if (e)
		ebc_mozillaEvent = e;
	var isCheked = e.checked;
	var row = EBC_GetRow(e);
	var table = EBC_GetParentTable(row);
	var row2 = EBC_GetRow(table);
	var table2 = EBC_GetParentTable(row2);
	var tableId = table2.id;
	var lastSub = tableId.lastIndexOf('_');
	var searchName = tableId.substr(0, lastSub) + '_Bar_Pareto';
	var pareto = document.getElementsByName(searchName)[0];
	if (pareto != null && isCheked) {
		pareto.checked = false;
	}
	if (pareto != null)
		pareto.disabled = isCheked;
}

function CHC_onLineChange(e)
{
	if (e) 
		ebc_mozillaEvent = e;
	var row = EBC_GetRow(e);
	var table = EBC_GetParentTable(row);
	var chartInfo = CHC_getCurrentChartInfo(table.id);
	if (chartInfo != null)
	{
		var showAreaValueControl = document.getElementsByName(chartInfo.showAreaControlName)[0];
		showAreaValueControl.disabled = (e.value == "...");
		if (showAreaValueControl.disabled)
			showAreaValueControl.checked = false;

		var showParetoValueControl = document.getElementsByName(chartInfo.showParetoControlName)[0];
		showParetoValueControl.disabled = (e.value != "...");
		if (showParetoValueControl.disabled)
		  showParetoValueControl.checked = false;

		var tableId = table.id;
		var lastSub = tableId.lastIndexOf('_');
		var searchName = tableId.substr(0, lastSub) + '_chc_Bar_Pareto';
		var pareto = document.getElementsByName(searchName)[0];
		var paretoAllow = false;
		
		if (pareto != null && pareto.checked)
		  paretoAllow = true;
		var showRigthTitleValueControl = document.getElementsByName(chartInfo.showRightTitleValueControlName)[0];
		showRigthTitleValueControl.disabled = (e.value == "..." && !paretoAllow);
	}
}

function CHC_Init(id, ct, advancedEnabledId)
{
	chartTypeSelectIds[id] = id+'_ChartTypeSelect';
	chartTypes[id] = ct;
	advancedEnabledIds[id] = advancedEnabledId;
	
	if ((chartTypes[id]==null) || (chartTypes[id]=="...")) 
		chartTypes[id] = '';
	EBC_RegisterControl(id);
	
	//var table = document.getElementById(id);
	//var body = table.tBodies[0];
	//var count = body.rows.length;
	//for (var i = 0; i < count; i++)
	//{
	//	var funcField = EBC_GetSelectByName(body.rows[i], 'Function');
	//	EBC_LoadData('FunctionList', null, funcField);
	//}
	var table = document.getElementById(id+'_radio');
	var selChoice = EBC_GetSelectByName(table, 'choice');
	selChoice.options[0].value = chartTypes[id];
	selChoice.options[0].text  = chartTypes[id];
	
	var el = document.getElementById(chartTypeSelectIds[id]);
	el.value = chartTypes[id];
	if(chartTypes[id]=='')
		CHC_ChartTypeChangeHandler(null, chartTypes[id], id);
}

function CHC_OnTableListChangedHandlerWithStoredParams() {
	if (lastCallParams_CHC_OnTableListChangedHandler == null || lastCallParams_CHC_OnTableListChangedHandler.length != 2)
		return;
	CHC_OnTableListChangedHandler(lastCallParams_CHC_OnTableListChangedHandler[0], lastCallParams_CHC_OnTableListChangedHandler[1]);
}

var lastCallParams_CHC_OnTableListChangedHandler = new Array();
function CHC_OnTableListChangedHandler(id, tables)
{
	var sc_wac_works_val = false;
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true)
		sc_wac_works_val = true;
	var JTCS_Init_executes_val = false;
	if (typeof JTCS_Init_executes != 'undefined' && JTCS_Init_executes != null && JTCS_Init_executes == true)
		JTCS_Init_executes_val = true;
	if (sc_wac_works_val || JTCS_Init_executes_val) {
		lastCallParams_CHC_OnTableListChangedHandler = new Array();
		lastCallParams_CHC_OnTableListChangedHandler[0] = id;
		lastCallParams_CHC_OnTableListChangedHandler[1] = tables;
		return;
	}
	tablesSave[id] = tables;
	CHC_ChartTypeChangeHandler(null, chartTypes[id], id);
}

function CHC_ResetFunctionValue(id)
{
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	var count = body.rows.length;
	if (count>0)
	{
		var func = EBC_GetSelectByName(body.rows[0], 'Function');
		var column = EBC_GetSelectByName(body.rows[0], 'Column');
		if (func)
		{
			func.selectedIndex = 0;
			CHC_OnColumnChangedHandler(column);
		}
	}
}

function CHC_ChartTypeChangeHandlerByUser(e, ct, id)
{
	CHC_ChartTypeChangeHandler(e, ct, id);
	CHC_ResetFunctionValue(id);
}

function CHC_ChartTypeChangeHandler(e, ct, id)
{
	if(e) ebc_mozillaEvent = e;
	var chartTypesSelect;
	if (e != null)
	{
		if(isNetscape)
			chartTypesSelect = ebc_mozillaEvent;
		else
			chartTypesSelect = window.event.srcElement;
	
		chartTypes[id] = chartTypesSelect.value;
	}
	else
	{
		chartTypes[id] = ct;
		var chartTypesSelect = document.getElementById(id+'_ChartTypeSelect');
		chartTypesSelect.value = chartTypes[id];
	}
	
	var chartItems = CHC_ChartTypes[chartTypes[id]];
	var table = document.getElementById(id+'_radio');
	var selChoice = EBC_GetSelectByName(table, 'choice');
	selChoice.options[0].value = chartTypes[id];
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	
	var prop = document.getElementById(id + "_Properties");
	var show = false;
	if(prop!=null && prop.style["display"] == "block")
		show = true;
	for (var i = 0; i < body.rows.length; i++)
	{
		var columnSel = EBC_GetSelectByName(body.rows[i], 'Column');
		if (columnSel != null)
			columnSel.disabled = (chartTypes[id]=='');
	}

	var option = chartTypesSelect.options[chartTypesSelect.selectedIndex];
	
	var labels = document.getElementsByName(id+'_CHCLabel');
	for (var i = 0; i < labels.length; i++)
	{
		if(labels[i]==null)
			continue;
		if(chartItems==null)
			labels[i].innerHTML = "";
		else
		{
			var item = chartItems[i];
			if(item==null || item.label==null)
				labels[i].innerHTML = "";
			else
				labels[i].innerHTML = item.label;
		}
	}

	var count = body.rows.length;
	var advancedEnabledId = advancedEnabledIds[id];
	var advancedEnabled = document.getElementById(advancedEnabledId);
	if(tablesSave[id]!=null && tablesSave[id]!="" && tablesSave[id].length!=0)
	{
		chartTypesSelect.disabled = false;
		if(tablesSave[id].join!=null)
			tablesSave[id] = tablesSave[id].join('\'');
		for (var i = 0; i < count; i++)
		{
			var selField = EBC_GetSelectByName(body.rows[i], 'Column');
			if(selField.value!="...")
				body.rows[i].setAttribute("userChanged", "true");
			var filter;
			var includeBlank = true;
			var numericOnly = false;
			var onlySimple = false;
			var forbidAutoSelect = false;
			var defaultAdvancedTypeGroup = "None";
			var addExpression = "&" + "addExpression=false";
			//var addExpression = (i == count - 1) ? "" : "&addExpression=true";
		
			if(chartItems==null)
				filter = "all";
			else
			{
				var item = chartItems[i];
				if(item==null || item.label==null)
					filter = "all";
				else
				{
					filter = item.filter;
					includeBlank = !item.shouldBeSetted;
					numericOnly = item.numericOnly;
					forbidAutoSelect = item.forbidAutoSelect;
					defaultAdvancedTypeGroup = item.defaultAdvancedTypeGroup;
					onlySimple = item.onlySimpleFormats;
				}
			}
			selField.forbidAutoSelect = forbidAutoSelect;
			var additionalData = null;
			if(descriptions != null && descriptions.length > 0)
			{
				additionalData = "<option disabled=''>------</option>";
				for(var j = 0; j < descriptions.length; j++) {
					var calcField = descriptions[j];
					additionalData = additionalData + '<option value="Desciption!' + calcField.description + '"' + (calcField.datatype != null ? (' datatype="' + calcField.datatype + '"') : '') + ' fieldIndex="' + calcField.fieldIndex + '">[' + calcField.description + '] (calc)</option>';
				}
			}
			if(numericOnly)
			{
				EBC_LoadData(
					"CombinedColumnList",
					"tables=" + tablesSave[id] + 
					"&" + "typeGroup=NotBinary" + 
					"&" + "type=NotText" +
					"&" + "includeBlank=" + includeBlank +
					addExpression,
					selField,
					null,
					null,
					additionalData);
			}
			else
			{
				EBC_LoadData(
					"CombinedColumnList",
					"tables=" + tablesSave[id] + 
					"&" + "typeGroup=" + filter +
					"&" + "includeBlank=" + includeBlank +
					"&" + "defaultAdvancedTypeGroup=" + defaultAdvancedTypeGroup +
					addExpression,
					selField,
					null,
					null,
					additionalData);
			}	
			
		}
	}
	else
		chartTypesSelect.disabled = true;
		
	for (var i = 0; i < count; i++)
	{
		var divElems = body.rows[i].getElementsByTagName('DIV');
		var divCount = divElems.length;
		var funcVisible;
		var orderVisible = "none";
		var valueRangeVisible = false;
		var ascChecked = false;
		var descChecked = false;
		var defaultAggregateFunction;
		if(chartItems==null)
			funcVisible = "none";
		else
		{
			var item = chartItems[i];
			if(item==null || item.label==null)
				funcVisible = "none";
			else
			{
				defaultAggregateFunction = item.defaultAggregateFunction;
				funcVisible = item.functionVisible ? "" : "none";
				orderVisible = item.canBeSorted ? "" : "none";
				ascChecked = item.orderType == "ASC";
				descChecked = item.orderType == "DESC";
				if (item.label == "Separator")
					valueRangeVisible = true;
			}
		}
		
		jq$(body.rows[i]).find('td').each(function () {
			if (jq$(this).attr('visibilitymode') == '2')
				jq$(this).css('display', orderVisible);
			if (jq$(this).attr('visibilitymode') == '3')
				jq$(this).css('display', valueRangeVisible ? '' : 'none');
			if (jq$(this).attr('visibilitymode') == '-3')
				jq$(this).css('display', valueRangeVisible ? 'none' : '');
		});
		for (var j = 0; j < divCount; j++)
		{
			var elem = divElems[j];
			var visibilityMode = elem.getAttribute("visibilityMode");
			if (visibilityMode=="1")
				elem.style.display = funcVisible;
			if (visibilityMode=="2")
				elem.style.display = orderVisible;
			if (visibilityMode == "3")
				elem.style.display = valueRangeVisible ? '' : 'none';
			if (visibilityMode=="Advanced_2")
			{
				if (advancedEnabled != null && advancedEnabled.value=="true")
					elem.style.display = orderVisible;
				if (orderVisible=="")
					elem.setAttribute("canBeVisible", "true");
				else
					elem.setAttribute("canBeVisible", "false");
			}
		}
		if(funcVisible=='none')
		{
			var funcField = EBC_GetSelectByName(body.rows[i], 'Function');
			if(funcField!=null)
				funcField.selectedIndex = 0;
		}
		if(e!=null)
		{
			var orderAscCheckbox = EBC_GetElementByName(body.rows[i], 'OrderAsc', 'INPUT');
			if(orderAscCheckbox!=null)
				orderAscCheckbox.checked = ascChecked;
			
			var orderDescCheckbox = EBC_GetElementByName(body.rows[i], 'OrderDesc', 'INPUT');
			if(orderDescCheckbox!=null)
				orderDescCheckbox.checked = descChecked;
		}
	}
	for (var i = 0; i < count; i++)
	{
		var funcVisible = "";
		if(chartItems==null)
			funcVisible = "none";
		else
		{
			var item = chartItems[i];
			if(item==null || item.label==null)
				funcVisible = "none";
			if(item!=null && !show && item.advanced)
				funcVisible = "none";
		}
		body.rows[i].style.display = funcVisible;
	}
	
	var propertiesDiv = document.getElementById(id + "_PropertiesDiv");
	if(propertiesDiv!=null)
	{
		if(chartItems==null || !chartItems.haveProperties)
			propertiesDiv.style["display"] = "none";
		else
		{	
			propertiesDiv.style["display"] = "";
			var propertiesTable = document.getElementById(id + "_Properties");
			if(propertiesTable!=null)
				for (var i = 0; i < propertiesTable.rows.length; i++)
				{
					var row = propertiesTable.rows[i];
					if(row.getAttribute("chartType")==chartTypes[id])
						row.style["display"] = "";
					else
						row.style["display"] = "none";
				}
		}
	}
	var row = EBC_GetRow(e);
	var titleDiv = document.getElementById(id + "_ChartTitleDiv");
	if (chartTypesSelect.value == '...' || chartTypesSelect.value == '')
		titleDiv.style["display"] = 'none';
	else
		titleDiv.style["display"] = 'block';
	
	var visualizationsDiv = document.getElementById(id + "_visualizationsDiv");
	if (visualizationsDiv != null) {
	  if (chartTypesSelect.value == 'Visualization') {
	    visualizationsDiv.style["display"] = 'block';
	  }
	  else {
	    visualizationsDiv.style["display"] = 'none';
	  }
	}
}

function CHC_UpdateOrderByAggregateFunction(
	aggregateFunction,
	chartControlRow)
{
	if (chartControlRow.getChartType()=="Bar" && aggregateFunction=="GROUP_BY_MONTH_NAME") 
		chartControlRow.setOrder(true);
}

function CHC_UpdateGrouping(functionSelect, table)
{
	if (functionSelect.value != 'None')
	{
		var rows = table.tBodies[0].rows;
		var rowsCount = rows.length;
		var row = AdHoc.Utility.findParentElement(functionSelect, 'tr');
		var rowIndex = row["sectionRowIndex"];
		for (var i=0; i<rowsCount; i++)
		{
			if (i == rowIndex) continue;
			var funcSelect = EBC_GetSelectByName(rows[i], 'Function');
			var columnSelect = EBC_GetSelectByName(rows[i], 'Column');
			if (funcSelect.value == 'None' && (columnSelect.value != "..." && columnSelect.value != null))
				EBC_SetSelectedIndexByValue(funcSelect, 'GROUP');
		}
	}
}

function CHC_OnAggregateFunctionChanged(e, chartElementId)
{
	var selectElement = AdHoc.Utility.getElementByEvent(e);
	var tr = AdHoc.Utility.findParentElement(selectElement, 'tr');
	var chartControlRow = AdHoc.chartControlRow.fromTrElement(tr, chartElementId);
	CHC_UpdateOrderByAggregateFunction(selectElement.value, chartControlRow);
	var table = AdHoc.Utility.findParentElement(tr, 'table');
	CHC_UpdateGrouping(selectElement, table);
	
	if (tr != null) {
		EBC_SetFormat(tr, true);
	}
}

function CHC_OnColumnChangedHandler(e)
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
        alert("This field cannot be selected.");
      }
    }
    columnSel.setAttribute("oldValue", columnSel.options[columnSel.selectedIndex].value);
  }
  catch (exc) {
  }
	// If separator selected set "Show legend" checkbox value to true
	var rowIndex = row["sectionRowIndex"];
	var id = EBC_GetParentTable(row).id;
	var table = document.getElementById(id);

	var cItems = CHC_getCurrentChartItems(id);
	if (cItems && rowIndex < cItems.length)
	    var cItem = cItems[rowIndex];
	
	if (row != null)
	{
		var numericOnly = (cItem==null ? false : cItem.numericOnly);
		var defaultAggregateFunction = (cItem==null ? "None" : cItem.defaultAggregateFunction);
		var onlySimple = (cItem==null ? false : cItem.onlySimpleFormats);
		
		// If typeGroup changed then try to set default function
		var tryToSetDefaultFunction = false;
		if (defaultAggregateFunction != "None")
		{
		  var columnSel = EBC_GetSelectByName(row, 'Column');
			if(columnSel.selectedIndex>=0)
			{
				var option_ = columnSel.options[columnSel.selectedIndex];
				var oldType = row.getAttribute("oldDataType");
				var type = option_.getAttribute("dataType");
				if (oldType != null && oldType != "")
				{
					if (oldType != type)
						tryToSetDefaultFunction = true;
				}
				row.setAttribute("oldDataType", type);
			}
		}

		var rowFunc = EBC_GetSelectByName(row, 'Function');
		jq$(rowFunc).removeAttr('disabled');
		if (columnSel.options[columnSel.selectedIndex].value.indexOf('Desciption!') == 0)
		{
			jq$(rowFunc).attr('disabled', 'true');
			defaultAggregateFunction = "ForceNone";
			tryToSetDefaultFunction = true;
		}
		
		EBC_SetFunctions(row, true, numericOnly, defaultAggregateFunction, true, null, null, null, null, null, tryToSetDefaultFunction);
		EBC_SetFormat(row, true);
	}
	var body = table.tBodies[0];
	var count = 1;
	for (var i = 0; i < body.rows.length; i++)
	{
		var selField = EBC_GetSelectByName(body.rows[i], 'Column');
		
		if(selField == null || selField.value=="" || selField.disabled)
			count = 0;
	}
	
	if (cItem!=null && cItem.onChange)
		cItem.onChange(e);
			
	EBC_CheckFieldsCount(id, count);
}
function CHC_OnOrderClickedHandler(e, id)
{
	if(e.checked)
	{
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var count = body.rows.length;
		for (var i = 0; i < count; i++)
		{
			var orderAscCheckbox = EBC_GetElementByName(body.rows[i], 'OrderAsc', 'INPUT');
			if(orderAscCheckbox!=null && orderAscCheckbox!=e)
				orderAscCheckbox.checked = false;
				
			var orderDescCheckbox = EBC_GetElementByName(body.rows[i], 'OrderDesc', 'INPUT');
			if(orderDescCheckbox!=null && orderDescCheckbox!=e)
				orderDescCheckbox.checked = false;
		}
	}
}

function CHC_ShowAdvancedClick(obj, id)
{
	CHC_ShowHideProperties(obj, id);
	var table = document.getElementById(id);
	var body = table.tBodies[0];
	
	for (var i = 0; i < body.rows.length; i++)
	{
		var columnSel = EBC_GetSelectByName(body.rows[i], 'Column');
		if (columnSel != null && columnSel.value == "..." && columnSel.forbidAutoSelect != true)
		{
			var cnt = columnSel.options.length;
			for (var j = 0; j<cnt; j++)
				if (columnSel.options[j].attributes["default"] != null && columnSel.options[j].attributes["default"].value == "true")
				{
					columnSel.selectedIndex = j;
					CHC_OnColumnChangedHandler(columnSel);
					break;
				}
		}		

	}
}

function CHC_ShowHideProperties(obj, id)
{
	var advancedEnabledId = advancedEnabledIds[id];
	var table = document.getElementById(id + "_Properties");
	var show = false;
	if(table.style["display"] == "none")
	{
		table.style["display"] = "block";
		show = true;
	}
	else
		table.style["display"] = "none";
		
	table = document.getElementById(id+'_radio');
	var selChoice = EBC_GetSelectByName(table, 'choice');
	var chartType = selChoice.options[0].value;
	var chartItems = CHC_ChartTypes[chartType];
	
	table = document.getElementById(id);
	var body = table.tBodies[0];
	var count = body.rows.length;
	for (var i = 0; i < count; i++)
	{
		var funcVisible = "";
		if(chartItems==null)
			funcVisible = "none";
		else
		{
			var item = chartItems[i];
			if(item==null || (item.advanced && !show))
				funcVisible = "none";
			if(show && item!=null && item.advanced)
				funcVisible = "";
		}
		body.rows[i].style.display = funcVisible;
		
		var divVisible = show ? "" : "none";
		var divElems = body.rows[i].getElementsByTagName('DIV');
		var divCount = divElems.length;
		for (var j = 0; j < divCount; j++)
		{
			var elem = divElems[j];
			if (elem.getAttribute("visibilityMode")=="Advanced")
				elem.style.display = divVisible;
			if (elem.getAttribute("visibilityMode")=="Advanced_2" && elem.getAttribute("canBeVisible")!="false")
				elem.style.display = divVisible;
		}
	}
	obj.disabled = true;
	var advancedEnabled = document.getElementById(advancedEnabledId);
	if (advancedEnabled != null)
		advancedEnabled.value = "true";
}

function CHC_ShowHideEffect(obj)
{
	var table = EBC_GetParentTable(obj);
	var row = EBC_GetRow(obj);
	var rowIndex = row.rowIndex;
	var rows = table.tBodies[0].rows;
	if (obj.value == "..." || obj.value == "")
	{
		rows[rowIndex+1].style["display"] = "";
		rows[rowIndex+2].style["display"] = "none";
	}
	else
	{
		rows[rowIndex+1].style["display"] = "none";
		rows[rowIndex+2].style["display"] = "";
	}
}


function CHC_PopulateDescriptions(fields)
{
    EBC_PopulateDescriptions(fields);
}

var chc_fields;
function CHC_OnFieldsListChangedHandler(id, fields)
{	
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true)
		sc_qac_timers++;
	setTimeout(function () {
		CHC_PopulateDescriptions(fields);
		CHC_OnTableListChangedHandler(id, tablesSave[id]);
		if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true) {
			sc_qac_timers--;
			SC_QuickAdd_Close_Callback();
		}
	}, 0);
	chc_fields = fields;
}

var CHC_DescSet = false;
function CHC_OnFieldsListInitialized(id, fields)
{
	if (!CHC_DescSet)
	{
		CHC_PopulateDescriptions(fields);
		CHC_OnTableListChangedHandler(id, tablesSave[id]);
	}
	CHC_DescSet = true;
}