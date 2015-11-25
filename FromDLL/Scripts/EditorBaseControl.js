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

var isNetscape = window.navigator.appName == 'Netscape' || window.navigator.appName == 'Opera';

var ebc_data = {};
var ebc_wait = {};
var ebc_controls = new Array();
var ebc_tableInfo = null;
var ebc_constraintsInfo = null;
var ebc_parsedValues = null;
var ebc_mozillaEvent;
var ebc_controlsRenamed = false;
var ebc_cancelSubmiting = false;
var quantityOfCallsInvalidate = 0;
var UseDefaultDialogs = false;
var currentRequests = 0;
var responseServer;
var descriptions = new Array();
var tablesSave = {};

function urldecode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ');
}

function EBC_Init(responseServerUrl, count, useDefaultDialogs, timeOut) {
	quantityOfCallsInvalidate = count;
	UseDefaultDialogs = useDefaultDialogs;
	responseServer = new AdHoc.ResponseServer(responseServerUrl, timeOut);
	AdHoc.ResponseServer.RegisterBeforeSubmitHandler("EBC_RenameControls()");
	AdHoc.ResponseServer.RegisterAfterSubmitHandler("EBC_RenameControls(true)");
}

function EBC_RegisterControl(id)
{
	ebc_controls.push(id);
}

function EBC_ClearContols()
{
	for (var i = 0; i < ebc_controls.length; i++)
		EBC_RemoveAllRows(ebc_controls[i]);
}

function EBC_internalSetName(elem, n, undo)
{
	if (elem.name != null)
	{
		elem.name = undo
			? elem.name.substring(0, elem.name.length - n.toString().length)
			: elem.name + n.toString();
	}
	var children = elem.childNodes;
	if (children != null)
	{
		for (var i = 0; i < children.length; i++)
			EBC_internalSetName(children[i], n, undo);
	}
}

function EBC_RenameControls(undo)
{
	for (var i = 0; i < ebc_controls.length; i++)
	{
		var rows = jq$('#' + ebc_controls[i] + ' > tbody > tr');
		if (rows == null || rows.length == 0)
			continue;

		for (var j = 0; j < rows.length; j++) {
			var children = rows[j].childNodes;
			if (children == null)
				continue;

			for (var k = 0; k < children.length; k++)
				EBC_internalSetName(children[k], j, undo);
		}
	}
}

function EBC_SubmitHandler(evt)
{
	if (ebc_controlsRenamed)
		return;
		
	if (ebc_cancelSubmiting)
	{
		evt = evt == null ? event : evt;
		ebc_cancelSubmiting = false;
		if (!isNetscape)
		{
			event.cancelBubble = true;
			event.returnValue = false;
		}
		else
		{
			evt.stopPropagation();
			evt.preventDefault();
		}
		return false;
	}
	ebc_controlsRenamed = true;
	if (AdHoc.ResponseServer.CallBeforeSubmitHandlers == null || !AdHoc.ResponseServer.CallBeforeSubmitHandlers())
		EBC_RenameControls();
}

function EBC_FormSubmit()
{
	if(ebc_controlsRenamed)
		return;
		
	if(ebc_cancelSubmiting)
	{
		ebc_cancelSubmiting = false;
		return false;
	}
	ebc_controlsRenamed = true;
	if (AdHoc.ResponseServer.CallBeforeSubmitHandlers == null || !AdHoc.ResponseServer.CallBeforeSubmitHandlers())
	    EBC_RenameControls();
	this.submitBackup();
}

function EBC_internalSetSubmitHandler()
{
	var forms = document.forms;
	if (isNetscape)
		window.addEventListener('submit', EBC_SubmitHandler, false);
	else
		window.attachEvent('onsubmit', EBC_SubmitHandler);
	for (var i = 0; i < forms.length; i++)
	{
		if (isNetscape)
			forms[i].addEventListener('submit', EBC_SubmitHandler, false);
		else
			forms[i].attachEvent('onsubmit', EBC_SubmitHandler);
		forms[i].submitBackup = forms[i].submit;
		forms[i].submit = EBC_FormSubmit;
	}
}

function EBC_OnServerResponse(url, xmlHttpRequest, arg, additionalData)
{
	currentRequests--;
	if (xmlHttpRequest.status == 200)
	{
		var data = xmlHttpRequest.responseText, wait = ebc_wait[arg.path + arg.params];
		if (!data || data.match(/^<opt(?:ion|group)/)) {
			if (EBC_SetData != null)
				EBC_SetData(arg.path + arg.params, data, additionalData);
		}
		else if (data.match(/^<table/)) {
			ebc_data[arg.path + arg.params] = data;
			ebc_wait[arg.path + arg.params] = null;
		}
		else if (data.indexOf("###USEPAGE###") != -1) {
			ebc_data[arg.path + arg.params] = data;
			ebc_wait[arg.path + arg.params] = null;
		}
		else {
			ebc_data[arg.path + arg.params] = data;
			ebc_wait[arg.path + arg.params] = null;
			eval(data);
		}
		if (currentRequests == 0) {
			if (window.ebc_disableEnableFunctions)
				for (var i = 0; i < ebc_disableEnableFunctions.length; i++)
					ebc_disableEnableFunctions[i](true);
		}
		if (arg.callbackFunction)
			arg.callbackFunction(data, wait);
	}
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true) {
		sc_qac_requests--;
		SC_QuickAdd_Close_Callback();
	}
}

function EBC_SetOffsetForSheduler(timeOffset) {
	if (typeof(EBC_TimeZone) == 'undefined' || timeOffset == 0)
		return;

	for (var i = 0;i<EBC_TimeZone.length;i++)
	{
		var controlID = EBC_TimeZone[i];
		var control = document.getElementById(controlID);
		if (control == null)
			continue;

		var row = control;
		while (row != null && row.tagName != 'TR')
			row = row.parentNode;

		control.value = timeOffset;
		var hour = EBC_GetElementByName(row, "Hour", "INPUT");
		var minute = EBC_GetElementByName(row, "Minute", "INPUT");
		var ampm = EBC_GetElementByName(row, "Ampm", "SELECT");
		var day = EBC_GetElementByName(row, "Day", "SELECT");
		var month = EBC_GetElementByName(row, "Month", "SELECT");
		var year = EBC_GetElementByName(row, "Year", "SELECT");

		var hourValue = (1*hour.value);
		if (hourValue == 12)
			hourValue = 0;
		hourValue += (ampm.value == "PM" ? 12 : 0);

		var minuteValue = (1*minute.value) + timeOffset;
		var date = new Date(year.value, month.value-1, day.value, hourValue, minuteValue);
		if (date == NaN)
			continue;

		year.value = date.getYear();
		month.value = date.getMonth()+1;
		day.value = date.getDate();
		hourValue = date.getHours();
		ampm.value = "AM";
		if (hourValue > 11)
		{
			ampm.value = "PM";
			hourValue -= 12;
		}
		hour.value = hourValue;
		minute.value = date.getMinutes();
	}
}

function EBC_CallServer(path, params, async, callbackFunction, additionalData)
{
	if(window.ebc_disableEnableFunctions)
		for(var i=0;i<ebc_disableEnableFunctions.length;i++)
			ebc_disableEnableFunctions[i](false);

	var paramsProcessed = params.replace("=" + "&", "&");
	var commandParams =
		'p=' + encodeURIComponent(path) + "&" + paramsProcessed +
		(quantityOfCallsInvalidate==0 ? "" : "&" + "r=" + quantityOfCallsInvalidate);		
		
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true)
		sc_qac_requests++;

	responseServer.ExecuteCommand(
		"GetOptionsByPath",
		commandParams,
		async,
		EBC_OnServerResponse,
		{path:path, params:params, callbackFunction:callbackFunction},
		additionalData);
		
	currentRequests++;
}

function UriEncodeParamValue(paramsStr, nameToEncode) {
  var params = paramsStr;
  var curInd = params.indexOf(nameToEncode + '=');
  if (curInd >= 0 && (curInd == 0 || params[curInd - 1] == '&' || params[curInd - 1] == '?')) {
    var startTbls = curInd + nameToEncode.length + 1;
    curInd = startTbls;
    while (curInd < params.length && params[curInd] != '=')
      curInd++;
    var finishTbls;
    if (curInd >= params.length)
      finishTbls = curInd - 1;
    else {
      while (curInd > startTbls && params[curInd] != '&')
        curInd--;
      finishTbls = curInd - 1;
    }
    if (finishTbls > startTbls) {
      var encodedTables = encodeURIComponent(params.substr(startTbls, finishTbls - startTbls + 1));
      var paramsHead = params.substr(0, startTbls);
      var paramsTail = '';
      if (finishTbls < params.length - 1)
        paramsTail = params.substr(finishTbls + 1);
      params = paramsHead + encodedTables + paramsTail;
    }
  }
  return params;
}

function EBC_LoadData(path, params, sel, async, callbackFunction, additionalData)
{
	if (params == null)
	  params = "";
	params = UriEncodeParamValue(params, 'tables');
	params = UriEncodeParamValue(params, 'columnName');
	var tblCnt = -1;
	var paramsOld = '';
	while (paramsOld != params) {
	  paramsOld = params;
	  tblCnt++;
	  params = UriEncodeParamValue(params, 'tbl' + tblCnt);
	}
	var fcCnt = -1;
	paramsOld = '';
	while (paramsOld != params) {
	  paramsOld = params;
	  fcCnt++;
	  params = UriEncodeParamValue(params, 'fc' + fcCnt);
	}
	var data = ebc_data[path + params];
	if (data != null) {
		if (additionalData != null)
			data = data + additionalData;
		sel = EBC_SetSelectContent(sel, data);
		if (sel != null)
			sel.Loading = false;
		if (callbackFunction)
			callbackFunction(sel != null ? sel : data);
		return sel != null ? sel : data;
	}
	if (async == null)
		async = true;
	var objs = ebc_wait[path + params];
	var newPath = false;

	if (objs == null) {
		objs = new Array();
		ebc_wait[path + params] = objs;
		newPath = true;
	}
	var obj = {};
	obj.sel = sel;
	if (sel != null)
		obj.sel.urlKey = '#' + path + '#' + params + '#';
	obj.urlKey = '#' + path + '#' + params + '#';
	obj.callback = callbackFunction;
	objs.push(obj);

	if (newPath) {
		EBC_CallServer(path, params, async, function (d, wait) {
			if (!wait || typeof wait.length == "undefined")
				return;

			for (var i = 0 ; i < wait.length; i++) {
				if (typeof wait[i].callback == "function")
					wait[i].callback(d);
			}
		}, additionalData);
	}
}

function EBC_SetData(path, data, additionalData)
{
	var totalData = data;
	if (additionalData != null)
		totalData = totalData + additionalData;		
	ebc_data[path] = data;
	var objs = ebc_wait[path];
	if (objs == null)
		return;

	ebc_wait[path] = null;
	for (var i = 0; i < objs.length; i++) {
		if (objs[i] == null || objs[i].sel == null)
			continue;
		var sel = objs[i].sel;
		if (objs[i].urlKey != sel.urlKey)
			continue;
		sel = EBC_SetSelectContent(sel, totalData);
		if (sel != null)
			sel.Loading = false;
	}
}

function EBC_LoadTableInfo() {
	if (ebc_tableInfo != null)
		return;
	responseServer.ExecuteCommand("GetKeysInfo", "", true, function (url, xmlHttpRequest) {
		if (xmlHttpRequest.status == 200)
			eval(xmlHttpRequest.responseText);
	});
}

function EBC_LoadConstraints() {
	if (ebc_constraintsInfo != null)
		return;
	responseServer.ExecuteCommand("GetConstraintsInfo", "", false, function (url, xmlHttpRequest) {
		if (xmlHttpRequest.status == 200)
			eval(xmlHttpRequest.responseText);
	});
}

function EBC_AnalyzeCopyPaste(values) {
	responseServer.ExecuteCommandOnData("AnalyzeCopyPaste", "", false, function (url, xmlHttpRequest) {
		if (xmlHttpRequest.status == 200)
			eval(xmlHttpRequest.responseText);
	}, "", "", values);
}

function EBC_SetTableInfo(info)
{
	ebc_tableInfo = info;
}

function EBC_SetConstraintsInfo(info) {
  ebc_constraintsInfo = info;
}

function EBC_SetParsedValues(info) {
  ebc_parsedValues = info;
}

function EBC_GetSelectValue(sel)
{
	var result = "";
	var needSeparator = false;
	if (sel.multiple)
	{
		for (var i=0;i<sel.options.length; i++)
		{
			if (sel.options[i].selected)
			{
				if (needSeparator)
					result = result + ",";
				else
					needSeparator = true;
				result = result + sel.options[i].value;
			}
		}
	}
	else
	{
		result = sel.value;
	}
	return result;
}

function EBC_SetSelectContent(sel, content)
{
	if (sel == null)
		return;
		
	var value = EBC_GetSelectValue(sel);
	var fieldIndex = jq$(sel).find(':selected').attr('fieldIndex');
	jq$(sel).html(content);
	if (sel.name != undefined && sel.name != null && 
		sel.name.indexOf("PivotFunction", sel.name.length - "PivotFunction".length) == -1) {
		EBC_SetSelectedIndexByValue(sel, value);
		if (fieldIndex != null && sel.value != value)
			jq$(sel).val(jq$(sel).find('option[fieldIndex="' + fieldIndex + '"]').val());
		var isFilterValueSelect = jq$(sel).attr('name') && jq$(sel).attr('name').indexOf('SelectValue', jq$(sel).attr('name').length - 'SelectValue'.length) != -1;
		if (!isFilterValueSelect || jq$(sel).html() != jq$("<select>").html(content).html())
			EBC_FireOnChange(sel);
	}
	sel.Loading = false;
	return sel;
}

function EBC_FireOnChange(sel)
{
	// this is not browser fired event, so let propertyName field indicate it.
	//sel.onchangeRaisedManually = true;
	//try
	//{
	if (isNetscape)
	{
		var e = document.createEvent("HTMLEvents");
		e.initEvent("change", true, false);
		try {
			sel.dispatchEvent(e);
		}
		catch (ex) { }
		e = document.createEvent("HTMLEvents");
		e.initEvent("resize", true, false);
		document.documentElement.dispatchEvent(e);
	}
	else
	{
		var eventObj = document.createEventObject();
		eventObj.propertyName = '1';
		if (sel.disabled && sel.onchange != null)
			sel.onchange(eventObj);
		if (sel.fireEvent != null) {
			try {
				sel.fireEvent("onchange", eventObj);
			}
			catch (ex) { }
		}
		document.documentElement.fireEvent('onresize');
	}
	//} 
	//finally { sel.onchangeRaisedManually = false;}
}

function EBC_IsUserEvent()
{
	if(isNetscape)
		return (ebc_mozillaEvent==null || ebc_mozillaEvent.propertyName!='1');
	else
		return (event==null || event.propertyName!='1');
}

// Sets selected index of SELECT control by option's value.
// If value is not found set selected index to 0 and function returns false, otherwise true.
function EBC_SetSelectedIndexByValue(sel, value)
{
	var cnt = sel.options.length;
	var si = 0;
	while (si < cnt && sel.options[si].value != value)
		si++;
	if (si < cnt)
	{
		sel.selectedIndex = si;
		return true;
	}
	else
	{
		// bad way
		//sel.selectedIndex = -1;
		sel.setAttribute("oldValue", value);
		var onceSeted = false;
		var multiple = false;
		if(isNetscape)
			multiple = sel.multiple;
		else if (sel.getAttribute("multiple") != null || sel.getAttribute("multiple") != undefined)
			multiple = true;

		if ((value != null) && multiple)
		{
			var vals = value.split(",");
			for (var i=0; i<vals.length; i++)
			{
				si = 0;
				while (si < cnt && sel.options[si].value != vals[i])
					si++;
				if (si < cnt)
				{
					var option = sel.options[si];
					if (onceSeted == false)
					{
						onceSeted = true;
						sel.selectedIndex = si;
					}
					//sel.selectedIndex = si;
					option.selected = true;
				}
			}
			if (onceSeted)
			{
				return true;
			}
		}
		if (onceSeted == false)
		{
			sel.selectedIndex = 0;
			return false;
		}
	}
	return false;
}

function EBC_PrepareNewRow(row)
{
	var elems = row.getElementsByTagName('SELECT');
	var prefix = row.id != null && row.id.indexOf('_ExtraColumn') > 1 ? 'exv' : '';
	for (var i = 0; i < elems.length; i++) {
		var el = elems[i];
		if (el.name == null) {
			EBC_SetSelectContent(el, '<option value=\'...\'>Loading ...</option>');
			break;
		}

		if (el.name.lastIndexOf('_' + prefix + 'Subreport') > 1) {
			el.selectedIndex = 0;
		}
		else if (el.name.lastIndexOf('_' + prefix + 'DrillDownStyle') > 1) {
			el.selectedIndex = 0;
			el.disabled = true;
		}
		else if (el.name.lastIndexOf('_Extra') > 1) {
			el.selectedIndex = 0;
		}
		else if (el.name.lastIndexOf('_' + prefix + 'ExpressionType') > 1) {
			el.selectedIndex = 0;
		}
		else if (el.name.lastIndexOf('_' + prefix + 'ConditionOperator') > 1) {
			el.selectedIndex = 0;
		}
		else {
			EBC_SetSelectContent(el, '<option value=\'...\'>Loading ...</option>');
		}
	}

	elems = row.getElementsByTagName('INPUT');
	for (i = 0; i < elems.length; i++) {
		var el = elems[i];
		if (el.name == null)
			break;

		if (el.name.lastIndexOf('_ExtraDescription') > 1)
			el.value = '';
	}
}

function EBC_GetElementByName(row, elementName, tagName)
{
	if(row == null)
		return null;
	var code = '_' + tagName + '\\' + elementName;
	var oresult = row[code];
	if(oresult && oresult.parentNode)
		return oresult;
	var result;
	var elems = row.getElementsByTagName(tagName);
	var cnt = elems.length;
	for (var i = 0; i < cnt; i++)
	{
		var elem = elems[i];
		var name = elem.name;
		if(name == null)
			name = elem.getAttribute("name");
		if(name == null)
			continue;
		if ((name.substr(name.lastIndexOf('_') + 1) == elementName) || (name == elementName))
		{
			result = elem;
			break;
		}
	}
	if(isNetscape)
		row[code] = result;
	return result;
}

function EBC_GetSelectByName(row, selName)
{
	return EBC_GetElementByName(row, selName, 'SELECT');
}

function EBC_GetInputByName(row, inputName)
{
	return EBC_GetElementByName(row, inputName, 'INPUT');
}

function EBC_TextAreaByName(row, areaName) {
	return EBC_GetElementByName(row, areaName, 'TEXTAREA');
}

function EBC_Humanize(func, input, suffix)
{
	input = input.replace(/([a-z])([A-Z])/g, '$1 $2');
	var strings = input.split("_");
	input = "";
	for(var i=0;i<strings.length;i++)
	{
		var space = "";
		if(i!=0)
			space = " ";
		input = input + space + strings[i].substring(0, 1).toUpperCase() + strings[i].substr(1);
	}
	if(func!="" && func!=null)
		input = func + '(' + input + ')';
	return input+suffix;
}

// Sets values of some selection control by table names array.
function EBC_ChangeAllTablesSel(tables, selectionControl, excludeItemIndex, addEmptyOption, tablesWithAliases)
{
	if (tablesWithAliases != null)
	{
		tables = new Array();
		for (var i =0; i < tablesWithAliases.length; i++)
			tables.push(tablesWithAliases[i].table);
	}

	if (selectionControl==null)
		return;
	selectionControl.options.length = 0;
	if (addEmptyOption)
	{
		var oOption = document.createElement('OPTION');
		selectionControl.options.add(oOption);
		oOption.text = oOption.value = "...";
	}

	if (tables == null)
		return;
		
	for(var i = 0; i < tables.length; i++)
	{
		if (excludeItemIndex!=null && i==excludeItemIndex || tables[i]==null)
			continue;
		
		var oOption = document.createElement('OPTION');
		selectionControl.options.add(oOption);
		
		var elems = tables[i].split("&");
		var name = elems[0];
		var number = null;
		if(elems.length>1)
			number = elems[1];
		var tableName = EBC_Internal_GetTableName(name);
		if (tablesWithAliases != null)
			tableName = tablesWithAliases[i].alias;

		if(number!=null)
		{
			oOption.value = name + "'" + tableName + number;
			oOption.text = tableName + number;
		}
		else
		{
			oOption.value = name;
			oOption.text = tableName;
		}
	}
}

function EBC_Internal_GetTableName(tableName)
{
	var dotIndex = tableName.lastIndexOf('.');
	var result = tableName.substr(dotIndex+1);
	var len = result.length;
	if (len>0 && result.charAt(0)=='[' && result.charAt(len-1)==']')
		result = result.substring(1, len-1);
	return result;
}

function EBC_HideIfOpenerPresents(id)
{
	var hide;
	if(isNetscape)
		hide = (history.length == 1);
	else
		hide = window.opener!=null;
	if(hide)
	{
		var control = document.getElementById(id);
		control.style["display"] = "none";
	}
}

function EBC_GetSrcElement(e)
{
	if(isNetscape)
		return e.target;
	else
		return e.srcElement;
}

EBC_internalSetSubmitHandler();

function EBC_ExpandSubTable(row)
{
	var rowIndex = row.rowIndex;
	var table = row.parentNode;
	var visible = "none";
	for(var i = rowIndex + 1; i < table.rows.length; i++)
	{
		var currentRow = table.rows[i];
		if (currentRow.getAttribute("header") == "true"
		    && (currentRow.getAttribute("fullpath") == undefined 
		        || (currentRow.getAttribute("fullpath") != undefined && currentRow.getAttribute("fullpath").indexOf(row.getAttribute("fullpath")) != 0)))
		    break;
			
		var display = currentRow.style["display"];
		
		if (i == rowIndex + 1)
		    visible = display;
		else
		    display = visible;
		
		if(display == "none")
		{
			 display = "";
			 currentRow.style["visibility"] = "visible";
		}
		else
		{
			display = "none";
			currentRow.style["visibility"] = "hidden";
		}
		currentRow.style["display"] = display;
	}
}

function EBC_ExpandGroupTable(row) {
	var rowIndex = row.rowIndex;
	var table = row.parentNode;

	var className = row.className;
	var collapsePattern = "Collapsed";
	var collapsed = className.indexOf(collapsePattern) == (className.length - collapsePattern.length);
	row.className = collapsed ? "VisualGroupMulti" : "VisualGroupMultiCollapsed";

	for (var i = rowIndex + 1; i < table.rows.length; i++) {
		var currentRow = table.rows[i];
		if (currentRow.getAttribute("header") == "true"
			&& (currentRow.getAttribute("level") <= row.getAttribute("level")))
			break;

		if (collapsed) {
			var isFiltered = currentRow.className.indexOf("Filtered") >= 0;
			if (!isFiltered) {
				currentRow.style["display"] = "";
				currentRow.style["visibility"] = "visible";
			}
		} else {
			currentRow.style["display"] = "none";
			currentRow.style["visibility"] = "hidden";
		}
	}
}


function EBC_ExpandTable(row) {
	var rowIndex = row.rowIndex;
	var table = row.parentNode;
	if (table.rows[rowIndex].className == "VisualGroup")
		table.rows[rowIndex].className = "VisualGroupCollapsed";
	else
		table.rows[rowIndex].className = "VisualGroup";
	for (var i = rowIndex + 1; i < table.rows.length; i++) {
		var currentRow = table.rows[i];
		if (currentRow.getAttribute("header") == "true")
			break;
		var display = currentRow.style["display"];
		if (display == "none") {
			display = "";
			currentRow.style["visibility"] = "visible";
		}
		else {
			display = "none";
			currentRow.style["visibility"] = "hidden";
		}
		currentRow.style["display"] = display;
	}
}

function EBC_CheckFieldsCountWithStoredParams() {
	if (lastCallParams_EBC_CheckFieldsCount == null || lastCallParams_EBC_CheckFieldsCount.length != 2)
		return;
	EBC_CheckFieldsCount(lastCallParams_EBC_CheckFieldsCount[0], lastCallParams_EBC_CheckFieldsCount[1]);
}

var ebc_fieldsCount = {};
var ebc_totalFieldsCount = 0;
var lastCallParams_EBC_CheckFieldsCount = new Array();
function EBC_CheckFieldsCount(id, count)
{
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true) {
		lastCallParams_EBC_CheckFieldsCount = new Array();
		lastCallParams_EBC_CheckFieldsCount[0] = id;
		lastCallParams_EBC_CheckFieldsCount[1] = count;
		return;
	}
	if(ebc_fieldsCount[id]!=null)
		ebc_totalFieldsCount -= ebc_fieldsCount[id];
	ebc_fieldsCount[id] = count;
	ebc_totalFieldsCount += count;
	
	if(typeof(DisableEnablePreviewTab)!='undefined')
		DisableEnablePreviewTab(false, ebc_totalFieldsCount>0);
	if(typeof(DisableEnableToolbar)!='undefined')
		DisableEnableToolbar(false, ebc_totalFieldsCount>0);
}


function EBC_PopulateDescriptions(fields) {
    descriptions = new Array();
    var calcField;
    for (var i = 0; i < fields.length; i++) {
    	var field = fields[i];
    	calcField = new Array();
    	calcField.fieldIndex = field.index;
        if ((field.func != 'None' && field.func != 'GROUP' || field.coefficient != null && field.coefficient != "") && field.description != '' && field.description != null) {           
            calcField.description = field.description;
            calcField.datatype = (field.expressionType && field.expressionType!='...') ? field.expressionType: field.datatype;
            descriptions.push(calcField);
        }
        else if (field.operationElem == '~' && (i + 1 < fields.length) && (fields[i + 1].operationElem != '~')) {
            calcField.description = field.description;
            calcField.datatype = field.datatype;
            descriptions.push(calcField);
        }
    }
}
