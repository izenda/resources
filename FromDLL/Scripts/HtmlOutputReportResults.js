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

var clientControlId = "";
var reportContentDivId = {};
var formId = {};
var tops = {};
var subReportNames = {};
var allowPaging = {};
var showDataWhenParametersBlank = {};
var HORR_serverDigitSeparator = ".";
var HORR_clientDigitSeparator = ".";
var HORR_UpdateContentInternal_waitingExecut = false;
var HORR_UpdateContentCanceled = false;
var HORR_shortDateFormat = "MM/DD/YYYY";

function urldecode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ');
}

function HORR_ShowHideFilters(filtersID, buttionId)
{
	var filtersRow = document.getElementById(filtersID);
	var button = null;
	if(buttionId!=null)
		button = document.getElementById(buttionId);
	if(filtersRow.style['display']!='none')
	{
		if(button!=null)
			button.innerHTML = jsResources.ShowFilters;
		filtersRow.style['display']='none';
	}
	else
	{
		if(button!=null)
			button.innerHTML = jsResources.HideFilters;
		filtersRow.style['display']='';
	}
}

function HORR_SortClear(row)
{
	var cells = row.cells;
	for(var i=0;i<cells.length;i++)
	{
		var cell = cells[i];
		var span = cell.getElementsByTagName("span");
		if(span.length>0)
		{
			span = span[0];
			span.setAttribute("sorted", "None");
			var img = cell.getElementsByTagName("img");
			img = img[1];
			img.style["visibility"] = "hidden";
		}
	}
}

function HORR_GetCell(elem)
{
	while (elem != null && elem.tagName != 'TD')
		elem = elem.parentNode;
	return elem;
}

function HORR_CellOnMouseOver(obj)
{
	var img = obj.getElementsByTagName("img");
	img = img[3];
	img.style["visibility"] = "visible";
}

function HORR_CellOnMouseOut(obj)
{
	var img = obj.getElementsByTagName("img");
	img = img[3];
	img.style["visibility"] = "hidden";
}

function HORR_ClearTableSorting(row)
{
	if (row != null) {
		for (var i =0;i<row.cells.length; i++)
		{
			try{
				var cell = row.cells[i];
				var parent = cell.firstChild;
				var span = parent.firstChild;
				var img = parent.getElementsByTagName("img");
				if (typeof span.setAttribute == "undefined")
					continue;
				span.setAttribute("sorted", "None");
			    try{
			        span.firstChild.setAttribute("sorted", "None");
			    }
			    catch(e){}
			    var serverUrlWithDelimiter = resourcesProvider.ResourcesProviderUrl;
				img[1].src = serverUrlWithDelimiter + "image=1.gif";
				img[1].alt = "Unsorted";
			}catch(e){}
		}
	}
}

function HORR_SortOnServer(span, rowsCount, fieldGuid)
{
	// If not Viewer use default client-side sorting
	if (typeof fieldsList == 'undefined' || fieldsList == null)
		return HORR_SortByColumn(span, rowsCount);

	var sortSequence = ["NONE", "ASC", "DESC"];
	var sorted = span.getAttribute("sorted").toUpperCase();
	var sortedIndex = sortSequence.indexOf(sorted);
	
	var newSort = sortSequence[sortedIndex == 2 ? 0 : (sortedIndex + 1)];
	for (var i = 0; i < fieldsList.length; i++)
		if (fieldsList[i].GUID == fieldGuid) {
			fieldsList[i].OrderType = newSort;
			sortedFieldGuid = fieldGuid;
			break;
		}
	if (typeof UpdateFieldsAndRefresh == 'function')
		UpdateFieldsAndRefresh();
}

function HORR_SortByColumn(span, rowsCount)
{
	var parent = span.parentNode;
	var cell = HORR_GetCell(span);
	var sorted = span.getAttribute("sorted");
	var img = parent.getElementsByTagName("img");
	img = img[1];
	HORR_ClearTableSorting(cell.parentNode);
    
	
    
	var serverUrlWithDelimiter = resourcesProvider.ResourcesProviderUrl;
	if(sorted == "None")
	{
		HORR_SortClear(EBC_GetRow(span));
		span.setAttribute("sorted", "Asc");
		img.src = serverUrlWithDelimiter + "image=grid-asc.gif";
		img.alt = jsResources.SortedAscending;
		img.style["visibility"] = "visible";
		HORR_Sort("asc", cell, rowsCount);
	}
	else if(sorted=="Desc")
	{
		span.setAttribute("sorted", "Asc");
		img.src = serverUrlWithDelimiter + "image=grid-asc.gif";
		img.alt = jsResources.SortedAscending;
		img.style["visibility"] = "visible";
		HORR_Sort("asc", cell, rowsCount);
	}
	else if(sorted=="Asc")
	{
		span.setAttribute("sorted", "Desc");
		img.src = serverUrlWithDelimiter + "image=grid-desc.gif";
		img.alt = jsResources.SortedDescending;
		img.style["visibility"] = "visible";
		HORR_Sort("desc", cell, rowsCount);
	}
}

function HORR_Sort(order, cell, rowsCount)
{
	var cellIndex = cell.cellIndex;
	var table = cell.parentNode.parentNode;
	var attributes = new Array();
	//attributes.push("bgcolor");
	attributes.push("class");
	if(rowsCount==-1)
		rowsCount = table.rows.length;
	insertionSort(table, cell.parentNode.rowIndex + 1, cell.parentNode.rowIndex + rowsCount, order == "desc", cellIndex, attributes);
}

function HORR_GetInnerText(node) {
	return node ? node.textContent : '';
}

function HORR_OnlyNumbers(str) {
	if (str.substring(0, 1) == "-") {
		str = str.substr(1);
	}
	var sepCnt = 0;
	for (var i = 0; i < str.length; i++) {
		var ch = str.charAt(i);
		if (ch == HORR_clientDigitSeparator) {
			sepCnt++;
			if (sepCnt > 1) {
				return false;
			}
			continue;
		}
		if (ch < '0' || ch > '9') {
			return false;
		}
	}
	return true;
}

function sortByFunction(itemA, itemB, reverse) {
	var a = itemA[0];
	var b = itemB[0];
	if (typeof a == 'string' || typeof b == 'string') {
		a = a.toString();
		b = b.toString();
	}

	if (a == b) return (itemA[2] > itemB[2]) ? -1 : 1;
	if (reverse == true) {
		return (a > b) ? -1 : 1;
	} else {
		return (a < b) ? -1 : 1;
	}
}

function merge_sort(array, comparison, reverse) {
	if (array.length < 2) {
		return array;
	}
	var middle = Math.ceil(array.length / 2);
	return merge(merge_sort(array.slice(0, middle), comparison, reverse),
		merge_sort(array.slice(middle), comparison, reverse),
		comparison, reverse);
}

function merge(left, right, comparison, reverse) {
	var result = new Array();
	while ((left.length > 0) && (right.length > 0)) {
		if (comparison(left[0], right[0], reverse) <= 0) {
			result.push(left.shift());
		} else {
			result.push(right.shift());
		}
	}
	while (left.length > 0) {
		result.push(left.shift());
	}
	while (right.length > 0) {
		result.push(right.shift());
	}
	return result;
}

function tryParseDate(value, format, result) {
	var parsedDate = moment(value, format, true);
	result.value = parsedDate._d;
	return parsedDate.isValid();
}

function insertionSort(t, iRowStart, iRowEnd, fReverse, iColumn, leaveAttributes) {
	var hiddenColumns = jq$(t).parent().data('columns-to-hide');
	if (hiddenColumns && hiddenColumns > 0)
		ToggleReportGrid(t, 0);
	var attributes = new Array();
	var iRow = iRowStart;
	if(leaveAttributes) {
		for (var i = 0; i < leaveAttributes.length; i++) {
			attributes[i] = new Array();
		}

		for (iRow = iRowStart; iRow <= iRowEnd; iRow++) {
			for(var i = 0; i < leaveAttributes.length; i++) {
				var attr = t.rows[iRow].getAttribute(leaveAttributes[i]);
				if (leaveAttributes[i] == "class") { //IE bug workaround
					attr = t.rows[iRow].className;
				}

				if (typeof(attr) == "object" && attr != null) {
					attributes[i].push(attr.cssText);
				} else {
					attributes[i].push(attr);
				}
			}
		}
	}

	var sortAsStrings = false;
	// For Dates only
	var dateFormat = null;
	var tblHdrs = jq$(t).find('tr.ReportHeader');
	if (typeof tblHdrs != 'undefined' && tblHdrs.length > 0) {
		var sortHdr = tblHdrs[tblHdrs.length - 1];
		var sortHandler = jq$(jq$(sortHdr).find('td')[iColumn]).find('.header-sort-handler');
		if (typeof sortHandler != undefined && sortHandler != null) {
			if (sortHandler.attr('data-format'))
				dateFormat = sortHandler.attr('data-format');
			if (sortHandler.attr('data-sortasstrings'))
				sortAsStrings = sortHandler.attr('data-sortasstrings') == '1';
		}
	}
	// ---

	var allDates = true;
	var allNumerics = true;
	var arrayToSort = new Array();
	for (var i = iRowStart; i <= iRowEnd; i++) {
		var item = new Array();
		var value = "";
		
		if (iColumn != null) {
			if (typeof(t.rows[i].cells[iColumn]) != "undefined") {
				value = HORR_GetInnerText(t.rows[i].cells[iColumn]);
			}
		} else {
			value = HORR_GetInnerText(t.rows[iRowiStart]);
		}

		var valDate = null;
		if (!sortAsStrings && value.length >= 6 && dateFormat) {
			try {
				var parsedDate = {};
				if (tryParseDate(value, dateFormat, parsedDate)) {
					valDate = parsedDate.value;
				}
			} catch (except) { }
		}
		
		var curr = value;
		var minuse = false;
		if (curr.substring(0,1) == "(" && curr.substring(curr.length-1, curr.length) == ")") {
			minuse = true;
			curr = curr.substring(1, curr.length-1);
		} else if (curr.substring(0, 1) == "-") {
			minuse = true;
			curr = curr.substr(1);
		}
		if (curr.substring(0, 1) == "$" ||
			curr.substring(0, 1) == "£" ||
			curr.substring(0, 1) == "₤" ||
			curr.substring(0, 1) == "€" ||
			curr.substring(0, 1) == "¥") {
			curr = curr.substr(1);
		}
		if (value.substr(value.length - 1, 1) == "%" ||
			value.substr(value.length - 1, 1) == "€") {
			curr = curr.substr(0, value.length-1);
		}

		var currFormated = curr.replace(/^\s+|\s+$/g, '');
		if (',' != HORR_serverDigitSeparator) {
			currFormated = currFormated.replace(/,/g, '');
		}
		if ('.' != HORR_serverDigitSeparator) {
			currFormated = currFormated.replace(/\./g, '');
		}

		currFormated = currFormated.replace(HORR_serverDigitSeparator, HORR_clientDigitSeparator);

		var onlyNumbers = !sortAsStrings && HORR_OnlyNumbers(currFormated);
		var currentNum = !sortAsStrings ? parseFloat(currFormated) : NaN;
		if (onlyNumbers && !isNaN(currentNum)) {
			item[0] = currentNum;
			if (minuse) {
				item[0] = -currentNum;
			}
			item[2] = currFormated;
		} else if (!isNaN(valDate) && valDate != null) {
			allNumerics = false;
			item[0] = valDate;
			item[2] = value.toLowerCase();
		} else {
			if (value) {
				allDates = false;
				allNumerics = false;
			}
			item[0] = value.toLowerCase();
			item[2] = item[0];
		}
		
		item[1] = t.rows[i];
		arrayToSort.push(item);
	}

	var tempArray = [];
	for (var i = 0; i < arrayToSort.length; i++) {
		if (!allDates || !allDates && !allNumerics) {
			arrayToSort[i][0] = arrayToSort[i][2];
		}
		arrayToSort[i].push(i);
		tempArray.push(arrayToSort[i]);
	}

	arrayToSort = merge_sort(arrayToSort, sortByFunction, fReverse);

	var pos = iRowEnd;
	var dx = - 1;
	while (arrayToSort.length > 0) {
		var item = arrayToSort.pop()[1];
		if ((iRowStart <= pos) && (pos <= iRowEnd)) {
			t.insertBefore(item, t.rows[pos]);
		}
		pos+=dx;
	}

	if (leaveAttributes) {
		for (iRow = iRowStart; iRow <= iRowEnd; iRow++) {
			for (var i = 0; i < leaveAttributes.length; i++) {
				var attr = t.rows[iRow].getAttribute(leaveAttributes[i]);
				if (typeof(attr) == "object" && attr != null) {
					attr.cssText = attributes[i][iRow - iRowStart];
				} else {
					if (leaveAttributes[i] == "class") {
						t.rows[iRow].className = attributes[i][iRow - iRowStart];
					} else {
						t.rows[iRow].setAttribute(leaveAttributes[i], attributes[i][iRow - iRowStart]);
					}
				}
			}
		}
	}
	if (hiddenColumns && hiddenColumns > 0)
		ToggleReportGrid(t, hiddenColumns);
}

function document_OnSelectStart(evt)
{
	evt = (evt) ? evt : window.event;
	if (evt.srcElement.tagName !="INPUT")
	{
		evt.returnValue = false;
		evt.cancelBubble = true;
	}
}

function HORR_HideIfOpenerPresents(id)
{
	var hide = window.history ? window.history.length === 1 : window.opener != null;
	if(hide)
	{
		var control = document.getElementById(id);
		control.style["display"] = "none";
	}
}

function IsVisible(obj)
{	
	while(obj!=null)
	{
		if(obj.style!=null && obj.style.display=="none")
			return false;
		obj = obj.parentNode;
	}
	return true;
}

function HORR_UpdateVisibleContent(id, top)
{
	tops[id] = top;
	var reportContent = document.getElementById(reportContentDivId[id]);
	if (!reportContent)
		reportContent = document.getElementById('_ReportsDiv');
	if(IsVisible(reportContent))
		HORR_UpdateContent(id, null, true);
}

function HORR_UpdateVisibleContent2(id, top, params)
{
	tops[id] = top;
	HORR_UpdateContent(id, null, true, params);
}

function HORR_NotMultilySelect(e)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow(e);
	if (row == null)
		return true;
	var operatorSel = EBC_GetSelectByName(row, 'Operator');
	if(operatorSel==null)
		return true;
	
	return ((operatorSel.value != "Equals_Multiple") && (operatorSel.value != "NotEquals_Multiple") && (operatorSel.value != "..."));
}

function HORR_UpdateContent(id, continueScript, pause, params) {
	ReportingServices.showLoading({
		containerStyle: "padding: 3px 3px 0 3px; font-family: Verdana; font-size: 12px; white-space: nowrap;",
		footerStyle: "padding: 0px 4px 4px 4px;",
		buttons: [{ value: jsResources.Cancel, onclick: HORR_CancelUpdatingContent }]
	});

	if (pause == null || pause == false)
		HORR_UpdateContentInternal(id, null, params);
	else {
		if (!HORR_UpdateContentInternal_waitingExecut) {
			HORR_UpdateContentInternal_waitingExecut = true;
			setTimeout(function () {
				HORR_UpdateContentInternal(id, continueScript, params);
			}, 100);
		}
	}
}

function HORR_CancelUpdatingContent()
{
	ReportingServices.hideTip();
	try{
		HORR_UpdateContentCanceled = true;
		TabStrip_TogglePrevTab();
	}
	catch(exc){}
}

function HORR_UpdateContentInternal(id, continueScript, params, needPostback) {
	HORR_UpdateContentCanceled = false;
	HORR_UpdateContentInternal_waitingExecut = false;

	var reportContent = document.getElementById(reportContentDivId[id]);
	if (!reportContent)
		reportContent = document.getElementById('_ReportsDiv');
	var subReportName = subReportNames[id];

	var wwidth = jq$(window).width();
	var wheight = jq$(window).height();

	if (needPostback == null)
		needPostback = true;

	var url = responseServer.ResponseServerUrl + 'wscmd=getrenderedreportset&contentId=' + id
		+ (subReportName != null ? '&srn=' + subReportName : '') + '&iic=1';
	if (tops[id] != null)
		url = url + '&top=' + tops[id];
	if (params != null)
		url = url + "&" + params;

	responseServer.RequestData(
		url,
		HORR_UpdateContentInternalCallback,
		true,
		needPostback ? formId[id] : null,
		{
			reportContent: reportContent,
			continueScript: continueScript
		}
	);
}

function EvalGloballyOld(data) {
  var fixedData = data.trim();
  if (fixedData.substr(0, 4) == '<!--' || 'a' == '-->')
    fixedData = fixedData.substr(4);
  if (fixedData.substr(fixedData.length - 3, 3) == '-->')
    fixedData = fixedData.substr(0, fixedData.length - 3);
  fixedData = fixedData.trim();
	(window.execScript || function (fixedData) {
		window["eval"].call(window, fixedData);
	})(fixedData);
}

function HORR_UpdateContentInternalCallback(url, xmlHttpRequest, arg) {
	if (HORR_UpdateContentCanceled)
		return;

	document.body.style.cursor = 'auto';
	ReportingServices.hideTip();
	izenda.report.loadReportResponse(xmlHttpRequest.responseText, arg.reportContent);
	if (arg.continueScript != null && arg.continueScript != "")
		eval(arg.continueScript);
	AdHoc.Utility.InitGaugeAnimations(null, null);
}

function HORR_Init(id, divId, fId, top, subReportName, ap, refreshInterval, sdwpb, digitSeparator, maxVersion, dateFormat)
{
	AdHoc.maxVersion = maxVersion;
	clientControlId = id;
	reportContentDivId[id] = divId;
	formId[id] = fId;
	tops[id] = top;
	subReportNames[id] = subReportName;
	allowPaging[id] = ap;
	showDataWhenParametersBlank[id] = sdwpb;
	
	HORR_shortDateFormat = dateFormat;
	HORR_serverDigitSeparator = digitSeparator;
	
	if(refreshInterval>0)
		setInterval("HORR_UpdateContentInternal('" + id + "', null, 'checkHash=1', false)", refreshInterval);
}

var fieldSelect = null;
function HORR_AddField(id, obj, deleteFieldSelectId, showFilters)
{
	var field = obj.value;
	fieldSelect = obj;
	if (showFilters)
	{
		var typeGroup = obj.options[obj.selectedIndex].getAttribute("dataTypeGroup");
		var type = obj.options[obj.selectedIndex].getAttribute("dataType");
		var tmpSel = document.createElement('select');
		var tmpDiv = document.createElement('div');
		tmpDiv.appendChild(tmpSel);
		var f = function() {HORR_AddField_Callback(tmpDiv, id, field, deleteFieldSelectId);};
		EBC_LoadData(
			"FunctionList",
			"type=" + type + 
			"&" + "typeGroup=" + typeGroup +
			"&" + "includeBlank=false" + 
			"&" + "includeGroupBy=true",
			tmpSel,
			true,
			f);
	}
	else
	{
		responseServer.ExecuteCommand("addField", "field=" + field, false);		
    var deleteFieldSelect = document.getElementById(deleteFieldSelectId);
		HORR_AfterAddField(id, field, deleteFieldSelectId, deleteFieldSelect.options.length);
	}
}

function HORR_AddField_Callback(tmpDiv, id, field, deleteFieldSelectId) {
	var positionVisibility = "";
	var tmpSel = tmpDiv.firstChild;
	var html = "<table width=\"auto\"><tr><td style=\"text-align:left;\"><b>" + jsResources.PleaseChooseAFunction + "</b></td>";
	html += "<td style=\"" + positionVisibility + "\">&nbsp;&nbsp;&nbsp;&nbsp;</td><td style=\"text-align:left;" + positionVisibility + "\"><b>" + jsResources.PleaseChooseAPosition + ".</b></td></tr>";
	html += "<tr><td style=\"vertical-align:top;text-align:left;\">";
	html += "<table border='0' id='RadioButtonFunctionListTable'>";
	for(var i = 0; i < tmpSel.options.length; i++) {
		var optionValue = tmpSel.options[i].value;
		var optionText = tmpSel.options[i].innerHTML;
		html += "<tr><td><input name='RadioButtonFunctionList' type='radio' " + (optionValue == "GROUP" ? "checked" : "") +
			" value='" + optionValue +
			"' id='RadioButtonFunctionList_" + i +
			"'/>&nbsp;" + optionText +
			"</tr></td>";
	}
	html += "</table></td>";
	html += "<td style=\"" + positionVisibility + "\">&nbsp;&nbsp;&nbsp;&nbsp;</td><td style=\"vertical-align:top;text-align:left;" + positionVisibility + "\">";
  html += "<table border='0' id='RadioButtonPositionListTable'>";
  var fieldsNum = -1;
  var existingFields = new Array();
  if (deleteFieldSelectId != null) {
    var deleteFieldSelect = document.getElementById(deleteFieldSelectId);
    if (deleteFieldSelect != null) {
      for (var index = 0; index < deleteFieldSelect.options.length; index++) {
        if (deleteFieldSelect.options[index].innerHTML != "...") {
          fieldsNum++;
          existingFields[fieldsNum] = deleteFieldSelect.options[index].innerHTML;
        }
      }
    }
  }
  fieldsNum++;
  var optionValue = 0;
  var optionText = "0 - Before <i>" + existingFields[0] + "</i>";
  html += "<tr><td><input name='RadioButtonPositionList' type='radio' value='" + optionValue +
		"' id='RadioButtonPositionList_" + i +
		"'/>&nbsp;" + optionText +
		"</tr></td>";
  for (var i = 1; i <= fieldsNum; i++) {
    var optionValue = i;
    var optionText = i + " - After <i>" + existingFields[i - 1] + "</i>";
    var selected = '';
    if (i == fieldsNum)
      selected = ' checked="checked"';
    html += "<tr><td><input name='RadioButtonPositionList' type='radio'" + selected + " value='" + optionValue +
		"' id='RadioButtonPositionList_" + i +
		"'/>&nbsp;" + optionText +
		"</tr></td>";
  }
  html += "</table></td>";
	html += "</tr></table>";
	ReportingServices.showOk(html, function() { HORR_AddField_Close(id, field, deleteFieldSelectId); });
}


function HORR_AddField_Close(id, field, deleteFieldSelectId)
{
	ReportingServices.hideTip();
  var table = document.getElementById("RadioButtonFunctionListTable");
  var body = table.tBodies[0];
  var rowCount = body.rows.length;
  var func;
  for (var i = 0; i < rowCount; i++) {
    var row = body.rows[i];
    var radioButton = row.childNodes[0].childNodes[0];
    if (radioButton.checked) {
      func = radioButton.attributes["value"].value;
      break;
    }
  }
  table = document.getElementById("RadioButtonPositionListTable");
  body = table.tBodies[0];
  rowCount = body.rows.length;
  var pos = 1000;
  for (var i = 0; i < rowCount; i++) {
    var row = body.rows[i];
    var radioButton = row.childNodes[0].childNodes[0];
    if (radioButton.checked) {
      pos = radioButton.attributes["value"].value;
      break;
    }
  }
	responseServer.ExecuteCommand("addField", "field=" + field + "&" + "function=" + func + "&position=" + pos, false);
	HORR_AfterAddField(id, field, deleteFieldSelectId, pos);
}

function HORR_AfterAddField(id)
{
  HORR_UpdateContent(id, 'RequestAddDelete();', true);
}

function RequestAddDelete() {
  var requestString = 'wscmd=adddeletefieldscontent';
  AjaxRequest('./rs.aspx', requestString, AcceptAddDelete, null, 'adddeletefieldscontent');
}

function AcceptAddDelete(returnObj, id) {
  if (id != 'adddeletefieldscontent' || returnObj == undefined || returnObj == null)
    return;
  if (returnObj.length != 2)
    return;
  var textsList = returnObj[0];
  var valuesList = returnObj[1];
  if (textsList == null || valuesList == null || textsList.length != valuesList.length || textsList.length <= 0)
    return;
  var ftd = jq$('select[id$=FieldsToDelete]');
  if (ftd.length == 0)
    return;
  ftd = ftd[0];
  ftd.options.length = 0;
  var lCnt = 0;
  var addSelStr = '';
  while (lCnt < textsList.length) {
    if (textsList[lCnt] == "###ADD###") {
      addSelStr = valuesList[lCnt];
      lCnt++;
      continue;
    }
    var newOpt = new Option();
    newOpt.text = textsList[lCnt];
    newOpt.value = valuesList[lCnt];
    ftd.options.add(newOpt);
    lCnt++;
  }
  if (addSelStr == '')
    return;
  var fta = jq$('select[name$=FieldsToAdd]');
  if (fta.length == 0)
    return;
  fta = fta[0];
  var p1Ind = fta.outerHTML.indexOf('>');
  var p1 = fta.outerHTML.substr(0, p1Ind + 1);
  var p3Ind = fta.outerHTML.lastIndexOf('<');
  var p3 = fta.outerHTML.substr(p3Ind);
  fta.outerHTML = p1 + addSelStr + p3;
}

function HORR_DeleteField(id, field)
{
	if(field.value!=null)
	{
		field = field.value;
	}
	if(field!="...")
	{
		responseServer.ExecuteCommand("deleteField", "field=" + field, false);
		HORR_UpdateContent(id, 'RequestAddDelete();', true);
	}
}

// Href tooltips functions
var FADINGTOOLTIP;
var FadingTooltipList = {};
var wnd_height, wnd_width;
var tooltip_height, tooltip_width;
var tooltip_shown=false;
var	transparency = 100;
var timer_id = 1;
			
function DisplayTooltip(tooltip_url)
{
	tooltip_shown = (tooltip_url != "")? true : false;
	
	if (tooltip_shown)
	{
		FADINGTOOLTIP = FadingTooltipList[tooltip_url];
		if (FADINGTOOLTIP==null)
		{
			var obody=document.getElementsByTagName('body')[0];
			var frag=document.createDocumentFragment();
			FADINGTOOLTIP = document.createElement('div');
			FADINGTOOLTIP.style.border = "darkgray 1px outset";
			FADINGTOOLTIP.style.width = "auto";
			FADINGTOOLTIP.style.height = "auto";
			FADINGTOOLTIP.style.color = "black";
			FADINGTOOLTIP.style.backgroundColor = "white";
			FADINGTOOLTIP.style.position = "absolute";
			FADINGTOOLTIP.style.zIndex = 1000;
			frag.appendChild(FADINGTOOLTIP);
			obody.insertBefore(frag,obody.firstChild);
			window.onresize = UpdateWindowSize;
			document.onmousemove = AdjustToolTipPosition;
			
			FADINGTOOLTIP.innerHTML = jsResources.Loading + "...<br><image src='" + resourcesProviderWithDelimeter + "image=loading.gif'/>";
			//EBC_GetData(tooltip_url, null, DisplayTooltip_CallBack, tooltip_url);
			responseServer.RequestData(tooltip_url, DisplayTooltip_CallBack);
		}
		FADINGTOOLTIP.style.display = "";
		FADINGTOOLTIP.style.visibility = "visible";
		FadingTooltipList[tooltip_url] = FADINGTOOLTIP;
	}
	else
	{
		if (FADINGTOOLTIP != null)
		{
			clearTimeout(timer_id);
			FADINGTOOLTIP.style.visibility="hidden";
			FADINGTOOLTIP.style.display = "none";
		}
	}
}

function DisplayTooltip_CallBack(url, xmlHttpRequest)
{
	if (xmlHttpRequest.status==200)
	{	
		var toolTip = FadingTooltipList[url];
		toolTip.innerHTML = xmlHttpRequest.responseText;
		if (toolTip == FADINGTOOLTIP)
			tooltip_height=(FADINGTOOLTIP.style.pixelHeight)? FADINGTOOLTIP.style.pixelHeight : FADINGTOOLTIP.offsetHeight;
		transparency = 0;
		AdHoc.Utility.InitGaugeAnimations(null, null);
	}
}

function AdjustToolTipPosition(evt)
{
	evt = (evt) ? evt : window.event;
	if(tooltip_shown)
	{
		var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft + document.body.scrollLeft;
		WindowLoading();
		
		var offset_y = evt.clientY + tooltip_height + 15;
		var top = evt.clientY + scrollTop + 15;
		if (offset_y > wnd_height)
		{
			var offset_y2 = evt.clientY - tooltip_height - 15;
			top = evt.clientY - tooltip_height + scrollTop -15;
			if (offset_y2 < 0)
			{
				top = (wnd_height - tooltip_height) / 2 + scrollTop;
			}
		}
		
		var offset_x = evt.clientX + tooltip_width + 15;
		var left = evt.clientX + scrollLeft + 15;
		if (offset_x > wnd_width)
		{
			var dx = offset_x - wnd_width;
			var offset_x2 = evt.clientX - tooltip_width - 15;
			var left2 = evt.clientX - tooltip_width + scrollLeft - 15;
			if (offset_x2 < 0)
			{
				var dx2 = -offset_x2;
				if (dx2 < dx)
					left = left2;
			}
			else
			{
				left = left2;
			}
	}
	if (tooltip_height > 100) {
	  top = scrollTop + evt.clientY - tooltip_height / 3;
	}
	
		FADINGTOOLTIP.style.left =  left + 'px';
		FADINGTOOLTIP.style.top = top + 'px';
	}
}

function WindowLoading()
{
	tooltip_width = (FADINGTOOLTIP.style.pixelWidth) ? FADINGTOOLTIP.style.pixelWidth : FADINGTOOLTIP.offsetWidth;
	tooltip_height=(FADINGTOOLTIP.style.pixelHeight)? FADINGTOOLTIP.style.pixelHeight : FADINGTOOLTIP.offsetHeight;
	UpdateWindowSize();
}
			
function ToolTipFading()
{
	if(transparency <= 100)
	{
		FADINGTOOLTIP.style.filter="alpha(opacity="+transparency+")";
		transparency += 5;
		timer_id = setTimeout('ToolTipFading()', 35);
	}
}

function UpdateWindowSize() 
{
	wnd_height=document.body.clientHeight;
	wnd_width=document.body.clientWidth;
}

var canChangePivot = false;
function HORR_PivotFieldChanged(e, obj, id, pivotFunctionId)
{
	if(e) ebc_mozillaEvent = e;
	var row = EBC_GetRow(obj);
	if (EBC_IsUserEvent(ebc_mozillaEvent || event))
		canChangePivot = true;
	EBC_SetFunctions(row, false, false, "GROUP", false, "PivotFunction", true, false, "PivotField");
}

function HORR_PivotFunctionChanged(e, obj, id)
{
	if(e) ebc_mozillaEvent = e;
	if (!EBC_IsUserEvent(ebc_mozillaEvent || event))
	{
		if (!canChangePivot)
			return;
	}
	canChangePivot = false;
	var row = EBC_GetRow(obj);
	var func = obj.value;
	var columnSel = EBC_GetSelectByName(row, "PivotField");
	var field = columnSel.value;
	responseServer.ExecuteCommand("changePivot", "field=" + field + "&" + "function="+func, true, HORR_PivotFunctionChangedCallback, id);
}

function HORR_PivotFunctionChangedCallback(url, xmlHttpRequest, arg)
{
	HORR_UpdateContent(arg, null, true);
}

function HORR_ShowHideReport(btn)
{
	var table = EBC_GetParentTable(btn);
	var td = EBC_GetColumn(table);
	for (var i=0;i<td.childNodes.length;i++)
	{
		var node = td.childNodes[i];
		if (node.className == "DashPartBody" || node.className == "DashPartBodyNoScroll")
		{
			var hidden = (node.style.visibility == "hidden");
			if (hidden)
			{
				node.style["visibility"] = "visible";
				node.style.display = "";
				
			}
			else
			{
				node.style["visibility"] = "hidden";
				node.style.display = "none";
			}
		}
	}
}

function HORR_NewShowHideReport(btn) {
	var topDiv = jq$(btn).parents('.DashPartBody');
	if (topDiv.length == 0)
		topDiv = jq$(btn).parents('.DashPartBodyNoScroll');
	if (topDiv.length == 0)
		return;
	topDiv.find('.DashDivToHide').toggle();
}

function HORR_ShowHideReportHeaderButtons(row, show)
{
	for (var i=0;i<row.cells.length;i++)
	{
		var cell = row.cells[i];
		for (var j=0;j<cell.childNodes.length;j++)
		{
			var obj = cell.childNodes[j];
			if (obj.tagName == "IMG" || obj.tagName == "A" || obj.tagName == "DIV")
				obj.style.visibility = show ? "visible" : "hidden";
		}
	}
}

function HORR_CloseReport(obj)
{
	var table = EBC_GetParentTable(obj);
	var td = EBC_GetColumn(table);
	td.style.visibility = "hidden";
	td.style.display = "none";
}

function HORR_NewCloseReport(btn) {
	var topDiv = jq$(btn).parents('.DashPartBody');
	if (topDiv.length == 0)
		topDiv = jq$(btn).parents('.DashPartBodyNoScroll');
	if (topDiv.length == 0)
		return;
	topDiv.hide();
}

function DisplayMapNativeToolTip(region, show)
{
    var image = region.parentNode.parentNode.getElementsByTagName('img')[0];
    if (show)
    	image.setAttribute('title', image.getAttribute('longdesc') != null ? image.getAttribute("longdesc") : '');
    else
        image.setAttribute('title', '');
}