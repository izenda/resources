var currentDatasource;
var dataSources;
var fieldsList;
var fieldsWereRemoved = new Array();
var wereChecked = new Array();
var curPropCdsInd;
var curPropFInd;
var additionalCategories = new Array();
var needClick = false;
var realFilterParent;
var visualFilterParent;
var filtersTable;
var clonedFilters;
var groupingUsed;
var prevCatValue;
var fieldsDataObtained = false;

if (typeof IzLocal == 'undefined') { IzLocal = { Res: function (key, defaultValue) { return defaultValue; }, LocalizePage: function () { } }; }

//Util-----------------------------------------------------------------------------------------------------
function modifyUrl(parameterName, parameterValue) {
	var queryParameters = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
	while (m = re.exec(queryString)) {
		queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	queryParameters[parameterName] = parameterValue;
	location.search = jq$.param(queryParameters);
}

function updateURLParameter(url, param, paramVal) {
	var newAdditionalURL = "";
	var tempArray = url.split("?");
	var baseURL = tempArray[0];
	var additionalURL = tempArray[1];
	var temp = "";
	if (additionalURL) {
		tempArray = additionalURL.split("&");
		for (i = 0; i < tempArray.length; i++) {
			if (tempArray[i].split('=')[0] != param) {
				newAdditionalURL += temp + tempArray[i];
				temp = "&";
			}
		}
	}

	var rows_txt = temp + "" + param + "=" + paramVal;
	return baseURL + "?" + newAdditionalURL + rows_txt;
}

function IsIE() {
	if (navigator.appName == 'Microsoft Internet Explorer')
		return true;
	return false;
}

function GetDialogWidth() {
	var dialogWidth = 860; // default width for desktop
	if (jq$(window).width() < 900)
		dialogWidth = jq$(window).width() - 20;
	return dialogWidth;
}

function GetLoadingHtml() {
	var loading = jq$('#loadingDiv');
	if (loading == null || loading.length == 0)
		return '';
	return jq$('<div>').append(loading.clone().show()).html()
}

//------------------------------------------------------------------------------------------------------------------

//Ajax--------------------------------------------------------------------------------------------------------------
function AjaxRequest(url, parameters, callbackSuccess, callbackError, id, dataToKeep) {
	var thisRequestObject;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
	thisRequestObject.requestId = id;
	thisRequestObject.dtk = dataToKeep;
	thisRequestObject.onreadystatechange = ProcessRequest;

	/*thisRequestObject.open('GET', url + '?' + parameters, true);
    thisRequestObject.send();*/
	thisRequestObject.open('POST', url, true);
	thisRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	thisRequestObject.send(parameters);

	function DeserializeJson() {
		var responseText = thisRequestObject.responseText;
		while (responseText.indexOf('"\\/Date(') >= 0) {
			responseText = responseText.replace('"\\/Date(', 'eval(new Date(');
			responseText = responseText.replace(')\\/"', '))');
		}
		if (responseText.charAt(0) != '[' && responseText.charAt(0) != '{')
			responseText = '{' + responseText + '}';
		var isArray = true;
		var isHtml = false;
		if (responseText.charAt(0) != '[') {
			responseText = '[' + responseText + ']';
			isArray = false;
		}
		var retObj;
		try {
			retObj = eval(responseText);
		}
		catch (e) {
			retObj = null;
		}
		if (retObj == null) {
			try {
				isHtml = true;
				retObj = eval(thisRequestObject.responseText);
			}
			catch (e) {
				retObj = null;
			}
		}
		if (retObj == null)
			return null;
		if (isHtml)
			return retObj;
		if (!isArray)
			return retObj[0];
		return retObj;
	}

	function ProcessRequest() {
		if (thisRequestObject.readyState == 4) {
			if (thisRequestObject.status == 200 && callbackSuccess) {
				var toRet;
				if (thisRequestObject.requestId != 'getrenderedreportset' && thisRequestObject.requestId != 'getcrsreportpartpreview' && thisRequestObject.requestId != 'renderedreportpart')
					toRet = DeserializeJson();
				else
					toRet = thisRequestObject.responseText;
				callbackSuccess(toRet, thisRequestObject.requestId, thisRequestObject.dtk);
			}
			else if (callbackError) {
				callbackError(thisRequestObject);
			}
		}
	}
}

function clearNames(elem) {
	jq$(elem).attr('name', '');
	jq$(elem).attr('id', '');
	for (var index = 0; index < elem.children.length; index++)
		clearNames(elem.children[index]);
}

function SendFieldsData(data) {
	var requestString = 'wscmd=updatecrsfields&wsarg0=' + encodeURIComponent(data);
	AjaxRequest('./rs.aspx', requestString, FieldsDataSent, null, 'updatecrsfields');
}

function FieldsDataSent(returnObj, id) {
	if (id != 'updatecrsfields' || returnObj == undefined || returnObj == null || returnObj.Value == null)
		return;
	GetFiltersData();
	//GetRenderedReportSet(true);
}
//------------------------------------------------------------------------------------------------------------------

//Common interface----------------------------------------------------------------------------------------------------
function DetectCurrentDs(dbName) {
	var newValue = -1;
	for (var index = 0; index < dataSources.length; index++) {
		if (dbName == dataSources[index].DbName) {
			newValue = index;
			break;
		}
	}
	currentDatasource = newValue;
}

function GetSelectedFieldInd() {
	var res = -1;
	var idCnt = 0;
	while (true) {
		var cb = document.getElementById('ufcb' + idCnt);
		if (cb == null)
			break;
		if (cb.checked) {
			if (res == -1)
				res = idCnt;
			else {
				res = -1;
				break;
			}
		}
		idCnt++;
	}
	return res;
}

function InitiateEmail() {
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	var rnVal;
	if (fieldWithRn != null)
		rnVal = fieldWithRn.value;
	else if (reportName == undefined || reportName == null)
		rnVal = '';
	else
		rnVal = reportName;
	while (rnVal.indexOf('+') >= 0) {
		rnVal = rnVal.replace('+', ' ');
	}
	TB_EMailReport(encodeURIComponent(rnVal), '?subject=' + encodeURIComponent(rnVal) + '&body=' + encodeURIComponent(location));
}

function ChangeTopRecords(recsNum, updateReportData) {
	for (var i = 0; i < 6; i++)
		jq$('#resNumLi' + i).removeClass('selected');
	var resNumImg = document.getElementById('resNumImg');
	var uvcVal = '100';
	var baseUrl = resNumImg.src.substr(0, resNumImg.src.lastIndexOf("ModernImages.") + 13);
	if (recsNum == 1) {
		uvcVal = '1';
		jq$('#resNumLi0').addClass('selected');
		resNumImg.src = nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'row-1.png';
	}
	if (recsNum == 10) {
		uvcVal = '10';
		jq$('#resNumLi1').addClass('selected');
		resNumImg.src = nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-10.png';
	}
	if (recsNum == 100) {
		uvcVal = '100';
		jq$('#resNumLi2').addClass('selected');
		resNumImg.src = nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-100.png';
	}
	if (recsNum == 1000) {
		uvcVal = '1000';
		jq$('#resNumLi3').addClass('selected');
		resNumImg.src = nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-1000.png';
	}
	if (recsNum == 10000) {
		uvcVal = '10000';
		jq$('#resNumLi5').addClass('selected');
		resNumImg.src = nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-10000.png';
	}
	if (recsNum == -1) {
		uvcVal = '-1';
		jq$('#resNumLi4').addClass('selected');
		resNumImg.src = nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-all.png';
	}
	if (updateReportData) {
		SetTopRecords(uvcVal);
	}
}

function SetTopRecords(topRecords) {
	var requestString = 'wscmd=settoprecords&wsarg0=' + topRecords;
	AjaxRequest('./rs.aspx', requestString, TopRecordsSet, null, 'settoprecords');
}

function TopRecordsSet(returnObj, id) {
	if (id != 'settoprecords' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value != 'OK') {
		alert(returnObj.Value);
		return;
	}
	GetRenderedReportSet(false);
}

function RefreshFieldsList() {
	var remainingHtml = "<table>";
	var usedHtml = "<table width=\"100%\">";
	var uCnt = 0;
	var rCnt = 0;
	var cdsBegin = currentDatasource;
	var cdsEnd = currentDatasource + 1;
	if (currentDatasource == -1) {
		cdsBegin = 0;
		cdsEnd = dataSources.length;
	}

	// Fill available data sources table
	var selectedColumns = new Array();
	for (var i = 0; i < fieldsList.length; i++)
		selectedColumns.push(fieldsList[i].DbName);
	var dsTable = jq$('<table>');
	dsTable.css('width', '100%');

	var GetColumnControlRow = function (dbName, friendlyName, globalColNum, fieldIndex, dsIndex, description) {
		var dsRow = jq$('<tr>');
		var dsCheckCell = jq$('<td>');
		dsCheckCell.css('width', '15px');
		var dsCheckbox = jq$('<input>');
		dsCheckbox.attr('type', 'checkbox').attr('id', 'rfcb' + globalColNum).attr('fInd', fieldIndex).attr('dsInd', dsIndex).attr('value', dbName);
		if (description)
			dsCheckbox.attr('desc', description);
		dsCheckCell.append(dsCheckbox);
		dsRow.append(dsCheckCell);
		var dsNameCell = jq$('<td>');
		dsNameCell.html('<label style="cursor:pointer;" for="rfcb' + globalColNum + '">' + friendlyName + '</label>');
		dsRow.append(dsNameCell);
		return dsRow;
	};

	var globalColNum = 0;
	for (var i = 0; i < dataSources.length; i++) {
		if (currentDatasource >= 0 && i != currentDatasource)
			continue;
		if (dataSources.length > 1 && currentDatasource < 0) {
			var dsHeaderRow = jq$('<tr>');
			var dsHeaderCell = jq$('<td>');
			dsHeaderCell.attr('colspan', '3');
			dsHeaderCell.text(dataSources[i].FriendlyName);
			dsHeaderCell.css('font-weight', 'bold');
			dsHeaderCell.css('text-align', 'center');
			dsHeaderRow.append(dsHeaderCell);
			dsTable.append(dsHeaderRow);
		}
		for (var col = 0; col < dataSources[i].Columns.length; col++) {
			if (!dataSources[i].Columns[col].Hidden) {
				var dsRow = null;

				for (var rfi = 0; rfi < fieldsWereRemoved.length; rfi++)
					if (fieldsWereRemoved[rfi].column == dataSources[i].Columns[col].DbName) {
						dsRow = GetColumnControlRow(fieldsWereRemoved[rfi].column, fieldsWereRemoved[rfi].description, globalColNum, col, i, fieldsWereRemoved[rfi].description);
						dsTable.append(dsRow);
						globalColNum++;
					}

				if (dsRow == null && selectedColumns.indexOf(dataSources[i].Columns[col].DbName) < 0) {
					dsRow = GetColumnControlRow(dataSources[i].Columns[col].DbName, dataSources[i].Columns[col].FriendlyName, globalColNum, col, i);
					dsTable.append(dsRow);
					globalColNum++;
				}
			}
		}
	}

	// Fill selected Fields
	var fieldsTable = jq$('<table>');
	fieldsTable.css('width', '100%');
	for (var i = 0; i < fieldsList.length; i++) {
		if (fieldsList[i].Hidden == true)
			continue;
		var fRow = jq$('<tr>');
		fRow.attr('onmouseover', 'this.children[2].style.opacity=0.5;');
		fRow.attr('onmouseout', 'this.children[2].style.opacity=0;');

		var checkedText = '';
		if (wereChecked.length > i && wereChecked[i] == true)
			checkedText = ' checked="checked"';
		var fCheckCell = jq$('<td>');
		fCheckCell.css('width', '15px');
		fCheckCell.html('<input type="checkbox" id="ufcb' + i + '" fInd="' + i + '" value="' + fieldsList[i].DbName + '"' + checkedText + ' />');
		fRow.append(fCheckCell);

		var fNameCell = jq$('<td>');
		fNameCell.html('<label style="cursor:pointer;" for="ufcb' + i + '">' + fieldsList[i].Description + '</label>');
		fRow.append(fNameCell);

		var fPropsCell = jq$('<td>');
		fPropsCell.attr('style', 'width:15px; opacity:0; cursor:pointer; background-image:url(rs.aspx?image=gear.gif); background-repeat:no-repeat; background-position:0px 4px;');
		fPropsCell.attr('onmouseover', 'this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}');
		fPropsCell.attr('onmouseout', 'this.style.opacity=0;');
		fPropsCell.attr('onclick', 'ShowFieldPropertiesForField(this.parentElement.children[0].children[0]);');
		fRow.append(fPropsCell);

		fieldsTable.append(fRow);
	}

	var selectedFields = new Array();
	for (var cds = cdsBegin; cds < cdsEnd; cds++) {
		for (var fCnt = 0; fCnt < dataSources[cds].Columns.length; fCnt++) {
			var idPrefix;
			var trActions;
			if (dataSources[cds].Columns[fCnt].Selected > -1) {
				idPrefix = 'ufcb' + uCnt;
				uCnt++;
				trActions = ' onmouseover="javascript:this.children[2].style.opacity=0.5;" onmouseout="javascript:this.children[2].style.opacity=0;"';
			}
			else {
				idPrefix = 'rfcb' + rCnt;
				rCnt++;
				trActions = '';
			}
			var wasChecked = '';
			for (var index = 0; index < wereChecked.length; index++) {
				if (wereChecked[index] == dataSources[cds].Columns[fCnt].DbName) {
					wasChecked = ' checked="checked"';
					break;
				}
			}
			var clickProcess = '';
			if (dataSources[cds].Columns[fCnt].Selected > -1)
				clickProcess = 'onchange="javascript:var fpButton = document.getElementById(\'fpButton\'); if (GetSelectedFieldInd() >= 0) {jq$(fpButton).removeClass(\'disabled\');} else {jq$(fpButton).addClass(\'disabled\');}"';
			var lColor = '';
			var fieldOpt = '';
			if (!dataSources[cds].Columns[fCnt].Hidden) {
				fieldOpt += '<tr' + trActions + '><td width="15"><input type="checkbox" id="' + idPrefix + '" cdsInd="' + cds + '" fInd="' + fCnt + '" value="' + dataSources[cds].Columns[fCnt].DbName + '"' + wasChecked + clickProcess + ' /></td>';
			}
			else {
				fieldOpt += '<tr style="display:none;"' + trActions + '><td width="15"><input type="checkbox" id="' + idPrefix + '" cdsInd="' + cds + '" fInd="' + fCnt + '" value="' + dataSources[cds].Columns[fCnt].DbName + '" disabled="disabled" /></td>';
				lColor = 'color:#808080;';
			}
			fieldOpt += '<td><label style="cursor:pointer;' + lColor + '" for="' + idPrefix + '">' + dataSources[cds].Columns[fCnt].FriendlyName + '</label></td>';
			if (!dataSources[cds].Columns[fCnt].Hidden)
				fieldOpt += '<td onmouseover="javascript:this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" onmouseout="javascript:this.style.opacity=0;" onclick="javascript:ShowFieldPropertiesForField(this.parentElement.children[0].children[0]);" width="15" style="opacity:0; cursor:pointer; background-image:url(rs.aspx?image=gear.gif); background-repeat:no-repeat; background-position:0px 4px;"></td>';
			fieldOpt += "</tr>";
			if (dataSources[cds].Columns[fCnt].Selected > -1) {
				var selectedHtml = new Object();
				selectedHtml.Text = fieldOpt;
				selectedHtml.OrderNum = dataSources[cds].Columns[fCnt].Selected;
				selectedFields[selectedFields.length] = selectedHtml;
			}
			else
				remainingHtml += fieldOpt;
		}
	}
	for (var ind1 = 0; ind1 < selectedFields.length - 1; ind1++) {
		for (var ind2 = ind1 + 1; ind2 < selectedFields.length; ind2++) {
			if (selectedFields[ind1].OrderNum > selectedFields[ind2].OrderNum) {
				var tmpText = selectedFields[ind1].Text;
				var tmpOrder = selectedFields[ind1].OrderNum;
				selectedFields[ind1].Text = selectedFields[ind2].Text;
				selectedFields[ind1].OrderNum = selectedFields[ind2].OrderNum;
				selectedFields[ind2].Text = tmpText;
				selectedFields[ind2].OrderNum = tmpOrder;
			}
		}
	}
	for (var index = 0; index < selectedFields.length; index++)
		usedHtml += selectedFields[index].Text;
	usedHtml += '</table>';
	remainingHtml += '</table>';
	var remaining = document.getElementById('remainingFieldsSel');
	var used = document.getElementById('usedFieldsSel');
	//remaining.innerHTML = remainingHtml;
	jq$('#remainingFieldsSel').html(dsTable);

	//used.innerHTML = usedHtml;
	jq$('#usedFieldsSel').html(fieldsTable);

	var fpButton = document.getElementById('fpButton');
	if (wereChecked.length != 1)
		jq$(fpButton).addClass('disabled');
	else
		jq$(fpButton).removeClass('disabled');
	if (typeof filtersDataObtained != 'undefined' && filtersDataObtained && fieldsDataObtained)
		CheckShowAddFilterControls();
}

function updateFields() {
	var usageData = new Object();
	usageData.Fields = new Array();
	for (var i = 0; i < fieldsList.length; i++) {
		var usedField = new Object();
		usedField.FriendlyName = fieldsList[i].FriendlyName;
		usedField.DbName = fieldsList[i].DbName;
		usedField.Total = fieldsList[i].Total;
		usedField.VG = fieldsList[i].VG;
		usedField.IsMultilineHeader = fieldsList[i].IsMultilineHeader;
		usedField.Description = fieldsList[i].Description;
		usedField.Format = fieldsList[i].Format;
		usedField.Width = fieldsList[i].Width;
		usedField.FilterOperator = fieldsList[i].FilterOperator;
		usedField.LabelJ = fieldsList[i].LabelJ;
		usedField.ValueJ = fieldsList[i].ValueJ;
		usedField.GUID = fieldsList[i].GUID; // Empty for new fields
		usedField.TableJoinAlias = fieldsList[i].TableJoinAlias;
		usageData.Fields.push(usedField);
	}

	var s = JSON.stringify(usageData);
	wereChecked.length = 0;
	RefreshFieldsList();
	SendFieldsData(s);
}

function UpdateFieldsAndRefresh() {
	updateFields();
	GetRenderedReportSet(true);
}

//------------------------------------------------------------------------------------------------------------------

//Pivots control--------------------------------------------------------------------------------------------------
function RefreshPivots() {
	var requestString = 'wscmd=getpivotguidata';
	AjaxRequest('./rs.aspx', requestString, PivotsDataGot, null, 'getpivotguidata');
}

function PivotsDataGot(returnObj, id) {
	if (id != 'getpivotguidata' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.CurrentField == '' || returnObj.FieldNames == null) {
		jq$(".visibility-pivots").hide();
		return;
	}
	if (!nrvConfig.ReportIsLocked)
		jq$(".visibility-pivots").show();
	var pivotHtml = '<div>' + IzLocal.Res('js_Column', 'Column').toUpperCase() + '</div>';
	pivotHtml += '<select id="pivot-field" onchange="SetPivotField();">';
	for (var i = 0; i < returnObj.FieldNames.length; i++) {
		var selected = '';
		if (returnObj.CurrentField == returnObj.FieldIds[i])
			selected = ' selected="selected"';
		if (returnObj.FieldIds[i] == '') {
			if (returnObj.FieldNames[i] == '------') {
				pivotHtml += '<option disabled="">------</option>';
			}
			else {
				if (returnObj.FieldNames[i] == '') {
					pivotHtml += '</optgroup>';
				}
				else {
					pivotHtml += '<optgroup label="' + returnObj.FieldNames[i] + '">';
				}
			}
			continue;
		}
		pivotHtml += '<option value="' + returnObj.FieldIds[i] + '"' + selected + '>' + returnObj.FieldNames[i] + '</option>';
	}
	pivotHtml += '</select><br />';
	pivotHtml += '<div>' + IzLocal.Res('js_Function', 'Function').toUpperCase() + '</div>';
	pivotHtml += '<select id="pivot-function" onchange="SetPivotFunction();">';
	for (var i = 0; i < returnObj.FunctionNames.length; i++) {
		var selected = '';
		if (returnObj.CurrentFunction == returnObj.FunctionIds[i])
			selected = ' selected="selected"';
		pivotHtml += '<option value="' + returnObj.FunctionIds[i] + '"' + selected + '>' + returnObj.FunctionNames[i] + '</option>';
	}
	pivotHtml += '</select><br />';
	var pivotSelector = document.getElementById('pivot-selector');
	pivotSelector.innerHTML = pivotHtml;

	if (returnObj.PerPageCount != null && returnObj.PerPageCount > 0)
		jq$('.pivots-count .pivots-count-text').val(returnObj.PerPageCount);
	else
		jq$('.pivots-count .pivots-count-text').val('');
}

function SetPivotField() {
	var requestString = 'wscmd=setpivotfield&wsarg0=' + document.getElementById('pivot-field').value;
	AjaxRequest('./rs.aspx', requestString, PivotFieldSet, null, 'setpivotfield');
}

function PivotFieldSet(returnObj, id) {
	if (id != 'setpivotfield' || returnObj == undefined || returnObj == null || returnObj.Value == null)
		return;
	if (returnObj.Value != 'OK')
		alert(returnObj.Value);
	RefreshPivots();
}

function SetPivotFunction() {
	var requestString = 'wscmd=setpivotfunction&wsarg0=' + document.getElementById('pivot-function').value;
	AjaxRequest('./rs.aspx', requestString, PivotFunctionSet, null, 'setpivotfunction');
}

function PivotFunctionSet(returnObj, id) {
	if (id != 'setpivotfunction' || returnObj == undefined || returnObj == null || returnObj.Value == null)
		return;
	if (returnObj.Value != 'OK')
		alert(returnObj.Value);
	RefreshPivots();
}

function SetPivotCount() {
	var requestString = 'wscmd=setpivotcount&wsarg0=' + jq$('.pivots-count .pivots-count-text').val();
	AjaxRequest('./rs.aspx', requestString, PivotFunctionSet, null, 'setpivotcount');
}
//------------------------------------------------------------------------------------------------------------------

//Field advanced properties-------------------------------------------------------------------------------------------------------
function ShowFieldPropertiesByFullFieldName(fieldName, GUID) {
	var foundField = -1;
	var calcFieldIndex = -1;

	var tableAlias = '';
	for (var i = 0; i < filtersData.length; i++)
		if (filtersData[i].GUID == GUID) {
			tableAlias = filtersData[i].AliasTable;
			break;
		}

	for (var i = 0; i < fieldsList.length; i++)
		if (fieldsList[i].DbName == fieldName) {
			if (foundField >= 0) // Second field on the same column
				foundField = -1;
			else
				foundField = i;	
		}
		else if (fieldsList[i].Description == fieldName) {
			calcFieldIndex = i;
		}

	if (foundField >= 0) {
		curPropFInd = foundField;
		FP_ShowFieldProperties(fieldsList[foundField], fieldPopup);
		return;
	}

	for (var dsInd = 0; dsInd < dataSources.length; dsInd++)
		for (var colInd = 0; colInd < dataSources[dsInd].Columns.length; colInd++)
			if (dataSources[dsInd].Columns[colInd].DbName == fieldName && (tableAlias == '' || dataSources[dsInd].Columns[colInd].TableJoinAlias == tableAlias)) {
				var newField = jq$.extend({}, dataSources[dsInd].Columns[colInd]);
				newField.FilterGUID = GUID;
				for (var i = 0; i < filtersData.length; i++)
					if (filtersData[i].GUID == GUID) {
						newField.FilterOperator = filtersData[i].OperatorValue;
						break;
					}
				FP_ShowFieldProperties(newField, fieldPopup);
				return;
			}
	if (calcFieldIndex >= 0) {
		curPropFInd = calcFieldIndex;
		FP_ShowFieldProperties(fieldsList[calcFieldIndex], fieldPopup);
		return;
	}
}

function ShowFieldPropertiesForField(fieldCb) {
	curPropFInd = fieldCb.getAttribute('fInd');
	FP_ShowFieldProperties(fieldsList[curPropFInd], fieldPopup);
}

function ShowFieldProperties() {
	var fieldInd = GetSelectedFieldInd();
	var fieldCb = document.getElementById('ufcb' + fieldInd);
	if (fieldCb == null)
		return;
	ShowFieldPropertiesForField(fieldCb);
}

function updateFieldProperties(newField) {
	fieldsList[curPropFInd].Description = newField.Description;
	fieldsList[curPropFInd].Total = newField.Total;
	fieldsList[curPropFInd].VG = newField.VG
	fieldsList[curPropFInd].IsMultilineHeader = newField.IsMultilineHeader;
	fieldsList[curPropFInd].Format = newField.Format;
	fieldsList[curPropFInd].Width = newField.Width;
	fieldsList[curPropFInd].FilterOperator = newField.FilterOperator;
	fieldsList[curPropFInd].LabelJ = newField.LabelJ;
	fieldsList[curPropFInd].ValueJ = newField.ValueJ;
	for (var i = 0; i < fieldsList.length; i++)
		if (i != curPropFInd && fieldsList[i].DbName == fieldsList[curPropFInd].DbName)
			fieldsList[i].FilterOperator = newField.FilterOperator;
	updateFields();
}
//------------------------------------------------------------------------------------------------------------------

//Fields list-----------------------------------------------------------------------------------------------------------
function AddRemainingFields() {
	var selectedColumns = jq$('input[id^="rfcb"]:checked');
	for (var i = 0; i < selectedColumns.length; i++) {
		var dsIndex = jq$(selectedColumns[i]).attr('dsind');
		var fieldIndex = jq$(selectedColumns[i]).attr('find');
		var desc = jq$(selectedColumns[i]).attr('desc');

		// Clone a Column and create a Field out of it
		var newField = jq$.extend({}, dataSources[dsIndex].Columns[fieldIndex]);
		if (desc) {
			for (var fwr = 0; fwr < fieldsWereRemoved.length; fwr++)
				if (fieldsWereRemoved[fwr].description == desc) {
					newField = fieldsWereRemoved[fwr].properties;
					fieldsWereRemoved.splice(fwr, 1);
					break;
				}
		}

		for (var j = 0; j < fieldsList.length; j++)
			if (fieldsList[j].DbName == newField.DbName && fieldsList[j].FilterOperator != '') {
				newField.FilterOperator = fieldsList[j].FilterOperator;
				newField.DupFilter = true;
				fieldsList[j].DupFilter = true;
				break;
			}
		fieldsList.push(newField);
	}
	wereChecked.length = 0;
	RefreshFieldsList();
}

function RemoveUsedFields() {
	var selectedFields = jq$('input[id^="ufcb"]:checked');
	wereChecked.length = 0;
	for (var i = selectedFields.length - 1; i >= 0; i--) {
		var toRemoveIndex = jq$(selectedFields[i]).attr('find');

		// Save removed fields so they can be recreated
		var fieldFullProperties = fieldsList[toRemoveIndex];
		fieldsWereRemoved.push({
			column: fieldFullProperties.DbName,
			description: fieldFullProperties.Description,
			properties: fieldFullProperties
		});

	    fieldsList.splice(toRemoveIndex, 1);
	}
    RefreshFieldsList();
}

function MoveUp() {
	MoveFields(true);
}

function MoveDown() {
	MoveFields(false);
}

function MoveFields(direction) {
	var selectedFields = jq$('input[id^="ufcb"]:checked');
	wereChecked = new Array(fieldsList.length);

	for (var i = 0; i < fieldsList.length; i++)
		fieldsList[i].ToMove = false;
	for (var i = 0; i < selectedFields.length; i++)
		fieldsList[jq$(selectedFields[i]).attr('find')].ToMove = true;

	// true = Up, false = Down
	if (direction)
		for (var cnt = 1; cnt < fieldsList.length; cnt++) {
			if (fieldsList[cnt].ToMove && !fieldsList[cnt - 1].ToMove) {
				var tmp = fieldsList[cnt - 1];
				fieldsList[cnt - 1] = fieldsList[cnt];
				fieldsList[cnt] = tmp;
			}
		}
	else
		for (var cnt = fieldsList.length - 2; cnt >= 0; cnt--) {
			if (fieldsList[cnt].ToMove && !fieldsList[cnt + 1].ToMove) {
				var tmp = fieldsList[cnt + 1];
				fieldsList[cnt + 1] = fieldsList[cnt];
				fieldsList[cnt] = tmp;
			}
		}

	for (var i = 0; i < fieldsList.length; i++)
		wereChecked[i] = fieldsList[i].ToMove;

	RefreshFieldsList();
}
//------------------------------------------------------------------------------------------------------------------------


//Save and Save As code----------------------------------------------------------------------------------------------------------
function GetCategoriesList(setRn) {
	var requestString = 'wscmd=crscategories';
	AjaxRequest('./rs.aspx', requestString, GotCategoriesList, null, 'crscategories', setRn);
}

function AddOptsRecursively(selObj, parent) {
	for (var index = 0; index < parent.subs.length; index++) {
		selObj.add(parent.subs[index].node);
		AddOptsRecursively(selObj, parent.subs[index]);
	}
}

function GotCategoriesList(returnObj, id, setRn) {
	if (id != 'crscategories' || returnObj == undefined || returnObj == null)
		return;
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	var rnVal;
	if (fieldWithRn != null)
		rnVal = fieldWithRn.value;
	else if (reportName == undefined || reportName == null)
		rnVal = '';
	else
		rnVal = reportName;
	while (rnVal.indexOf('+') >= 0) {
		rnVal = rnVal.replace('+', ' ');
	}
	var nodes = rnVal.split(nrvConfig.CategoryCharacter);
	var curCatName = '';
	var curRepName = nodes[0];
	if (nodes.length > 1) {
		curRepName = nodes[nodes.length - 1];
		curCatName = nodes[0];
		for (var ccnIndex = 1; ccnIndex < nodes.length - 1; ccnIndex++)
			curCatName += nrvConfig.CategoryCharacter + nodes[ccnIndex];
	}
	var newReportName = document.getElementById('newReportName');
	var newCategoryName = document.getElementById('newCategoryName');
	if (setRn) {
		newReportName.value = curRepName;
	}
	var catsArray = new Array();
	catsArray[catsArray.length] = '';
	for (var acCnt = 0; acCnt < additionalCategories.length; acCnt++)
		catsArray[catsArray.length] = additionalCategories[acCnt];
	if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
		for (var index = 0; index < returnObj.AdditionalData.length; index++)
			catsArray[catsArray.length] = returnObj.AdditionalData[index];
	newCategoryName.options.length = 0;
	var root = new Object();
	root.node = null;
	root.name = '';
	root.path = '';
	root.subs = new Array();
	for (var index = 0; index < catsArray.length; index++) {
		var subCats = catsArray[index].split(nrvConfig.CategoryCharacter);
		var indent = '';
		var currentParent = root;
		for (var scCnt = 0; scCnt < subCats.length; scCnt++) {
			if (scCnt > 0)
				indent += String.fromCharCode(160) + String.fromCharCode(160);
			var newParent = null;
			for (var rsCnt = 0; rsCnt < currentParent.subs.length; rsCnt++) {
				if (currentParent.subs[rsCnt].name == subCats[scCnt]) {
					newParent = currentParent.subs[rsCnt];
					break;
				}
			}
			if (newParent == null) {
				newParent = new Object();
				newParent.name = subCats[scCnt];
				newParent.path = currentParent.path + (currentParent.path.length > 0 ? nrvConfig.CategoryCharacter : '') + newParent.name;
				newParent.subs = new Array();
				var npOpt = new Option();
				npOpt.value = newParent.path;
				npOpt.text = indent + newParent.name;
				while (npOpt.text.indexOf('+') >= 0)
					npOpt.text = npOpt.text.replace('+', ' ');
				if (npOpt.value == curCatName)
					npOpt.selected = 'selected';
				newParent.node = npOpt;
				currentParent.subs[currentParent.subs.length] = newParent;
			}
			currentParent = newParent;
		}
	}
	AddOptsRecursively(newCategoryName, root);
	var saveAsDialog = document.getElementById('saveAsDialog');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	saveAsDialog.style.height = windowHeight + 'px';
	saveAsDialog.style.paddingTop = ((windowHeight / 2) - 100) + 'px';
	saveAsDialog.style.display = '';
	prevCatValue = newCategoryName.value;
}

function ShowSaveAsDialog() {
	additionalCategories.length = 0;
	GetCategoriesList(true);
}

function SaveReportAs() {
	var newRepName = document.getElementById('newReportName').value;
	var newCatName = document.getElementById('newCategoryName').value;
	var newFullName = newRepName;
	if (newCatName != null && newCatName != '' && newCatName != IzLocal.Res('js_Uncategorized', 'Uncategorized')) {
		newFullName = newCatName + nrvConfig.CategoryCharacter + newFullName;
	}
	while (newFullName.indexOf(' ') >= 0) {
		newFullName = newFullName.replace(' ', '+');
	}
	CheckIfReportExists(newFullName);
}

function CheckIfReportExists(reportFullName) {
	var requestString = 'wscmd=checkifreportexists';
	requestString += '&wsarg0=' + reportFullName;
	AjaxRequest('./rs.aspx', requestString, CheckedIfReportExists, null, 'checkifreportexists');
}

function CheckedIfReportExists(returnObj, id) {
	if (id != 'checkifreportexists' || returnObj == undefined || returnObj == null || returnObj.Value == null)
		return;
	if (returnObj.Value != 'retou_YES' && returnObj.Value != 'retou_NO') {
		alert('Unexpected response: ' + returnObj.Value);
	}
	else {
		if (returnObj.Value == 'retou_NO') {
			if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
				FinalizePreSaveRoutines(returnObj.AdditionalData[0]);
			else
				alert('Unexpected response: Field with validated report set name is empty');
		}
		else {
			modal_confirm('ReportSet with specified name already exists. Are you sure to overwrite it?', null, function(obj, res) {
				if (res)
					FinalizePreSaveRoutines(returnObj.AdditionalData[0]);
			});
		}
	}
}

function FinalizePreSaveRoutines(newFullName) {
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	if (fieldWithRn != null) {
		fieldWithRn.value = newFullName;
	}
	else {
		reportName = newFullName;
	}
	var saveAsDialog = document.getElementById('saveAsDialog');
	saveAsDialog.style.display = 'none';
	SaveReportSet();
}

function SaveReportSet() {
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	var rnVal;
	if (fieldWithRn != null)
		rnVal = fieldWithRn.value;
	else if (reportName == undefined || reportName == null)
		rnVal = '';
	else
		rnVal = reportName;
	while (rnVal.indexOf('+') >= 0) {
		rnVal = rnVal.replace('+', ' ');
	}
	if (rnVal == null || rnVal == '') {
		ShowSaveAsDialog();
		return;
	}
	var loadingrv2 = document.getElementById('loadingrv2');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	loadingrv2.style.height = windowHeight + 'px';
	loadingrv2.style.paddingTop = ((windowHeight / 2) - 100) + 'px';
	loadingrv2.style.display = '';
	var requestString = 'wscmd=savecurrentreportset';
	requestString += '&wsarg0=' + rnVal;
	AjaxRequest('./rs.aspx', requestString, ReportSetSaved, null, 'savecurrentreportset');
}

function ReportSetSaved(returnObj, id) {
	if (id != 'savecurrentreportset' || returnObj == undefined || returnObj == null || returnObj.Value == null)
		return;
	if (returnObj.Value != 'OK') {
		document.getElementById('loadingrv2').style.display = 'none';
		alert(returnObj.Value);
	}
	else {
		var fieldWithRn = document.getElementById('reportNameFor2ver');
		var rnVal;
		if (fieldWithRn != null) {
			rnVal = fieldWithRn.value;
		}
		else {
			rnVal = reportName;
		}
		modifyUrl('rn', rnVal);
	}
}

function ShowNewCatDialog() {
	document.getElementById('addedCatName').value = '';
	var saveAsDialog = document.getElementById('saveAsDialog');
	saveAsDialog.style.display = 'none';
	var newCatDialog = document.getElementById('newCatDialog');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	newCatDialog.style.height = windowHeight + 'px';
	newCatDialog.style.paddingTop = ((windowHeight / 2) - 100) + 'px';
	newCatDialog.style.display = '';
}

function AddNewCategory() {
	additionalCategories[additionalCategories.length] = document.getElementById('addedCatName').value;
	var newCatDialog = document.getElementById('newCatDialog').style.display = 'none';
	GetCategoriesList(false);
}
//------------------------------------------------------------------------------------------------------------------------


//Exports ----------------------------------------------------------------------------------------------------------

function GetExport(format) {
	var reportNameParam = '';
	var fieldWithRn = document.getElementById('reportNameFor2ver');
	var rnVal;
	if (fieldWithRn != null)
		rnVal = fieldWithRn.value;
	else if (reportName == undefined || reportName == null)
		rnVal = '';
	else
		rnVal = reportName;
	rnVal = rnVal.replace(/\+/g, ' ');
	if (rnVal)
		reportNameParam = '&rn=' + rnVal;

	var urlParams = responseServerWithDelimeter + 'output=' + format;
	if (reportNameParam)
		urlParams = urlParams + reportNameParam;

	responseServer.OpenUrlWithModalDialogNewCustomRsUrl(urlParams, 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);
}

//------------------------------------------------------------------------------------------------------------------------

//Initialization----------------------------------------------------------------------------------------------------------------------
var reportName;
var urlSettings;
var initialized;
var nrvConfig;

function InitializePopup() {
	fieldPopup = jq$("#data-source-field").dialog({
		autoOpen: false,
		width: GetDialogWidth(),
		height: "auto",
		modal: true,
		buttons: {
			"OK": function () {
				switchTabAfterRefreshCycle = true;
				var field = FP_CollectProperties();
				if (field.FilterGUID && field.FilterGUID != 'undefined')
					CommitChangedFilter(field);
				else
					updateFieldProperties(field);
				jq$(this).dialog("close");
			},
			"Cancel": function () {
				jq$(this).dialog("close");
			}
		},
		open: function () {
			jq$(this).parents(".ui-dialog-buttonpane button:eq(0)").focus();
		},
		show: { effect: "fade", duration: 200 },
		hide: { effect: "fade", duration: 200 }
	});
}

function InitializeResponsiveUI() {
	jq$(window).resize(function () {
		ChangeFieldsWidth();
	});
	ChangeFieldsWidth();
}

function InitViewerTabs() {
	var filtersTab = jq$('#tab1');
	var fieldsTab = jq$('#tab2');

	if (filtersTab.length > 0) {
		jq$('#htmlFilters').hide();
		filtersTab.append(GetLoadingHtml());
	}
	if (fieldsTab.length > 0) {
		jq$('#fieldPropertiesDialogContainer').hide();
		jq$('#fieldsCtlTable').hide();
		fieldsTab.append(GetLoadingHtml());
	}
}

function ChangeFieldsWidth() {
	var fieldsControl = jq$('#fieldsCtlTable');
	if (!fieldsControl)
		return;
	if (jq$(window).width() < 900)
		fieldsControl.addClass('narrow');
	else
		fieldsControl.removeClass('narrow');
}

function InitializeViewer() {
	initialized = false;
	InitializePopup();
	InitializeResponsiveUI();
	InitViewerTabs();
	document.getElementById('tab1a').click();
	GetReportViewerConfig();
}

function GetReportViewerConfig() {
	var wwidth = jq$(window).width();
	var wheight = jq$(window).height();
    var rnParam = '';
    if (reportName)
    	rnParam = reportName;
    var requestString = 'wscmd=reportviewerconfig&wsarg0=' + wwidth + '&wsarg1=' + wheight + '&wsarg2=' + rnParam;
	AjaxRequest('./rs.aspx', requestString, GotReportViewerConfig, null, 'reportviewerconfig');
}

function GotReportViewerConfig(returnObj, id) {
	if (id != 'reportviewerconfig' || returnObj == undefined || returnObj == null)
		return;
	nrvConfig = returnObj;
	nrvConfig.serverDelimiter = '?';
	if (nrvConfig.ResponseServerUrl.indexOf('?') >= 0)
		nrvConfig.serverDelimiter = '&';
	if (document.getElementById('rlhref') != null)
		document.getElementById('rlhref').href = nrvConfig.ReportListUrl;
	urlSettings = new UrlSettings(nrvConfig.ResponseServerUrl);
	var delimiter = '';
	if (urlSettings.urlRsPage.lastIndexOf(nrvConfig.serverDelimiter) != urlSettings.urlRsPage.length - 1)
		delimiter = nrvConfig.serverDelimiter;
	responseServer = new AdHoc.ResponseServer(urlSettings.urlRsPage + delimiter, 0);
	responseServerWithDelimeter = responseServer.ResponseServerUrl;
	if (nrvConfig.UseBulkCsv) {
		var csvExportBtn = document.getElementById('csvExportBtn');
		if (csvExportBtn != null)
			csvExportBtn.onclick = function () { responseServer.OpenUrlWithModalDialogNewCustomRsUrl('rs.aspx?output=BULKCSV', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl); };
	}
	if (!nrvConfig.ShowHtmlPrint)
		document.getElementById('htmlPrintBtn').style.display = 'none';
	if (!nrvConfig.ShowPdfPrint) {
		document.getElementById('eoPrintBtn').style.display = 'none';
		document.getElementById('testsharpPrintBtn').style.display = 'none';
	}
	else if (nrvConfig.UseDirectPdfPrint) {
		document.getElementById('eoPrintBtn').style.display = 'none';
		document.getElementById('testsharpPrintBtn').style.display = '';
	}

	if (!nrvConfig.ShowHtmlPrint && !nrvConfig.ShowPdfPrint)
		document.getElementById('printBtnContainer').style.display = 'none';

	ChangeTopRecords(nrvConfig.InitialResults, false);
	if (urlSettings.reportInfo.exportType != null) {
		responseServer.OpenUrlWithModalDialogNewCustomRsUrl(nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'output=' + urlSettings.reportInfo.exportType, 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);
	};
	ApplySecurityOptions();
	if (!initialized)
		GetRenderedReportSet(false);
	//http://fogbugz.izenda.us/default.asp?15858#BugEvent.185759
	/*if (!nrvConfig.AllowRTFExportFormat)
		jq$("#RTFExportButton").remove();*/
    AppendReportNameTitle(nrvConfig.ClearReportName);
}

function ApplySecurityOptions() {
	if (nrvConfig.ReportIsReadOnly == true) {
		jq$('.hide-readonly').hide();
		jq$('#btnSaveDirect').attr('disabled', 'disabled');
	}
	if (nrvConfig.ReportIsViewOnly == true)
		jq$('.hide-viewonly').hide();
	if (nrvConfig.ReportIsLocked == true)
		jq$('.hide-locked').hide();
}

function GetRenderedReportSet(invalidateInCache, additionalParams, caller) {
	jq$('#renderedReportDiv').html(GetLoadingHtml());

	var requestString = 'wscmd=getrenderedreportset',
		urlParams = [],
		queryParameters = {},
		re = /([^&=]+)=([^&]*)/g, m;

	while (m = re.exec(location.search.substring(1))) {
		var pName = decodeURIComponent(m[1]).toLowerCase();
		queryParameters[pName] = decodeURIComponent(m[2]);
		if (pName != 'rn')
			urlParams.push(pName + '=' + m[2]);
	}

	if (queryParameters['rn'] != null && queryParameters['rn'].length > 0 && !initialized)
		requestString += '&wsarg0=' + (reportName = queryParameters['rn']);
	if (invalidateInCache)
		urlParams.push('iic=1');
	if (additionalParams)
		urlParams.push(additionalParams);

	AjaxRequest('./rs.aspx' + (urlParams.length > 0 ? "?" + urlParams.join("&") : ""), requestString, GotRenderedReportSet, null, 'getrenderedreportset');
}

function GotRenderedReportSet(returnObj, id) {
	if (id != 'getrenderedreportset' || !returnObj)
		return;
	ReportScripting.loadReportResponse(returnObj, "#renderedReportDiv");

	AdHoc.Utility.InitGaugeAnimations(null, null, false);
	// Dirty workaround for IE8
	if (jq$.support.opacity == false)
		setTimeout(function () { jq$('body')[0].className = jq$('body')[0].className; }, 200);
	if (!initialized) {
		initialized = true;
		GetReportViewerConfig();
		FirstLoadInit();
	}
	else {
		jq$('#htmlFilters :input').prop('disabled', true);
		GetFiltersData();
	}
}

function FirstLoadInit() {
	var designerBtn = document.getElementById('designerBtn');
	var reportParam = '';
	if (reportName != undefined && reportName != null)
		reportParam = '?rn=' + reportName;
	designerBtn.onclick = function () { window.location = nrvConfig.ReportDesignerUrl + reportParam; };
	jq$('#navdiv ul li a').click(function () {
		var currentTab = jq$(this).attr('href');
		var vis = jq$(currentTab).is(':visible');
		jq$('#tabsContentsDiv > div').hide();
		jq$(this).parent().removeClass('active');
		if (!vis) {
			jq$(currentTab).show();
			document.getElementById('updateBtnPC').style.display = 'none';
		}
		else {
			document.getElementById('updateBtnPC').style.display = '';
			setTimeout(function () {
				jq$('#navdiv ul li').removeClass('active');
				jq$('#navdiv ul li a').removeClass('active');
			}, 100);
		}
	});

    InitializeFields();
    RefreshPivots();   
    GetFiltersData();
}

function AppendReportNameTitle(forcedReportName){
	var fieldWithRn = document.getElementById('clearReportNameFor2ver');
	var rnVal;
	if (forcedReportName)
		rnVal = forcedReportName;
	else if (fieldWithRn != null)
		rnVal = fieldWithRn.value;
	else if (reportName == undefined || reportName == null)
		rnVal = '';
	else
		rnVal = reportName;

	while (rnVal.indexOf('+') >= 0) {
		rnVal = rnVal.replace('+', ' ');
	}
	var frNodes = rnVal.split(nrvConfig.CategoryCharacter);
	var namePart = frNodes[frNodes.length - 1];
	var catPart = frNodes.length <= 1 ? '' : frNodes[frNodes.length - 2];
	if (namePart.indexOf('&') >= 0) {
		namePart = namePart.substr(0, namePart.indexOf('&'));
	}
	if (catPart.indexOf('&') >= 0) {
		catPart = catPart.substr(0, catPart.indexOf('&'));
	}
	var rntc = namePart;
	var selfInd = rntc.indexOf('(SELF)_');
	if (selfInd >= 0)
		rntc = rntc.substr(0, selfInd);
	var autoInd = rntc.indexOf('(AUTO)_');
	if (autoInd == 0)
		rntc = rntc.substr(7);
	var hdr = '<h1 style=\"margin-left:40px;\">' + rntc + (catPart.length <= 0 ? '' : ' <i>(' + catPart + ')</i>') + '</h1>';
	var repHeader = document.getElementById('repHeader');
	repHeader.innerHTML = hdr;
}

function GetDatasourcesList() {
	fieldsDataObtained = false;
	var requestString = 'wscmd=crsdatasources';
	AjaxRequest('./rs.aspx', requestString, GotDatasourcesList, null, 'crsdatasources');
}

function GotDatasourcesList(returnObj, id) {
	if (id != 'crsdatasources' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.DataSources == null || returnObj.DataSources.length == 0)
		return;

	// Show Fiends content instead of the Loading
	if (jq$('#fieldsCtlTable').is(':hidden'))
		jq$('#fieldsCtlTable').show();
	if (jq$('#fieldPropertiesDialogContainer').is(':hidden'))
		jq$('#fieldPropertiesDialogContainer').show();
	jq$('#tab2 #loadingDiv').hide();

	dataSources = returnObj.DataSources;
	fieldsList = returnObj.SelectedFields;
	var dsUlList = document.getElementById('dsUlList');
	jq$(dsUlList).empty();
	var allOpt = new Option();
	allOpt.value = "###all###";
	allOpt.text = IzLocal.Res('js_All', 'All');
	dsUlList.add(allOpt);

	for (var i = 0; i < returnObj.DataSources.length; i++) {
		var opt = new Option();
		opt.value = returnObj.DataSources[i].DbName;
		opt.text = returnObj.DataSources[i].FriendlyName;
		dsUlList.add(opt);
	}

	if (dataSources.length == 1) {
		var dsUlList = document.getElementById('dsUlList');
		dsUlList.style.display = 'none';
	}
	currentDatasource = -1;
	wereChecked.length = 0;
	fieldsDataObtained = true;
	RefreshFieldsList();
}

function InitializeFields() {
	GetDatasourcesList();
}

function CheckNewCatName() {
	var newCategoryName = document.getElementById('newCategoryName');
	if (newCategoryName.value == IzLocal.Res('js_CreateNew', '(Create new)'))
		ShowNewCatDialog();
	else
		prevCatValue = newCategoryName.value;
}

function CancelSave() {
	var saveAsDialog = document.getElementById('saveAsDialog');
	saveAsDialog.style.display = 'none';
}

function CancelAddCategory() {
	var newCatDialog = document.getElementById('newCatDialog').style.display = 'none';
	var saveAsDialog = document.getElementById('saveAsDialog');
	var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	saveAsDialog.style.height = windowHeight + 'px';
	saveAsDialog.style.paddingTop = ((windowHeight / 2) - 100) + 'px';
	saveAsDialog.style.display = '';
	var newCategoryName = document.getElementById('newCategoryName');
	newCategoryName.value = prevCatValue;
}
//---------------------------------------------------------------------------------------------------------------------------

//Tooltip functionality from old reportViewer----------------------------------------------------------------------------
// Href tooltips functions
var FADINGTOOLTIP;
var FadingTooltipList = {};
var wnd_height, wnd_width;
var tooltip_height, tooltip_width;
var tooltip_shown = false;
var transparency = 100;
var timer_id = 1;

function DisplayTooltip(tooltip_url) {
	tooltip_shown = (tooltip_url != "") ? true : false;

	if (tooltip_shown) {
		FADINGTOOLTIP = FadingTooltipList[tooltip_url];
		if (FADINGTOOLTIP == null) {
			var obody = document.getElementsByTagName('body')[0];
			var frag = document.createDocumentFragment();
			FADINGTOOLTIP = document.createElement('div');
			FADINGTOOLTIP.style.border = "darkgray 1px outset";
			FADINGTOOLTIP.style.width = "auto";
			FADINGTOOLTIP.style.height = "auto";
			FADINGTOOLTIP.style.color = "black";
			FADINGTOOLTIP.style.backgroundColor = "white";
			FADINGTOOLTIP.style.position = "absolute";
			FADINGTOOLTIP.style.zIndex = 1000;
			frag.appendChild(FADINGTOOLTIP);
			obody.insertBefore(frag, obody.firstChild);
			window.onresize = UpdateWindowSize;
			document.onmousemove = AdjustToolTipPosition;

			FADINGTOOLTIP.innerHTML = IzLocal.Res('js_Loading', "Loading...") + "<br><image src='" + nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + "image=loading.gif'/>";
			//EBC_GetData(tooltip_url, null, DisplayTooltip_CallBack, tooltip_url);
			responseServer.RequestData(tooltip_url, DisplayTooltip_CallBack);
		}
		FADINGTOOLTIP.style.display = "";
		FADINGTOOLTIP.style.visibility = "visible";
		FadingTooltipList[tooltip_url] = FADINGTOOLTIP;
	}
	else {
		if (FADINGTOOLTIP != null) {
			clearTimeout(timer_id);
			FADINGTOOLTIP.style.visibility = "hidden";
			FADINGTOOLTIP.style.display = "none";
		}
	}
}

function DisplayTooltip_CallBack(url, xmlHttpRequest) {
	if (xmlHttpRequest.status == 200) {
		var toolTip = FadingTooltipList[url];
		toolTip.innerHTML = xmlHttpRequest.responseText;
		if (toolTip == FADINGTOOLTIP)
			tooltip_height = (FADINGTOOLTIP.style.pixelHeight) ? FADINGTOOLTIP.style.pixelHeight : FADINGTOOLTIP.offsetHeight;
		transparency = 0;
		AdHoc.Utility.InitGaugeAnimations(null, null, true);
	}
}

function AdjustToolTipPosition(evt) {
	evt = (evt) ? evt : window.event;
	if (tooltip_shown) {
		var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft + document.body.scrollLeft;
		WindowLoading();

		var offset_y = evt.clientY + tooltip_height + 15;
		var top = evt.clientY + scrollTop + 15;
		if (offset_y > wnd_height) {
			var offset_y2 = evt.clientY - tooltip_height - 15;
			top = evt.clientY - tooltip_height + scrollTop - 15;
			if (offset_y2 < 0) {
				top = (wnd_height - tooltip_height) / 2 + scrollTop;
			}
		}

		var offset_x = evt.clientX + tooltip_width + 15;
		var left = evt.clientX + scrollLeft + 15;
		if (offset_x > wnd_width) {
			var dx = offset_x - wnd_width;
			var offset_x2 = evt.clientX - tooltip_width - 15;
			var left2 = evt.clientX - tooltip_width + scrollLeft - 15;
			if (offset_x2 < 0) {
				var dx2 = -offset_x2;
				if (dx2 < dx)
					left = left2;
			}
			else {
				left = left2;
			}
		}
		if (tooltip_height > 100) {
			top = scrollTop + evt.clientY - tooltip_height / 3;
		}

		FADINGTOOLTIP.style.left = left + 'px';
		FADINGTOOLTIP.style.top = top + 'px';
	}
}

function WindowLoading() {
	tooltip_width = (FADINGTOOLTIP.style.pixelWidth) ? FADINGTOOLTIP.style.pixelWidth : FADINGTOOLTIP.offsetWidth;
	tooltip_height = (FADINGTOOLTIP.style.pixelHeight) ? FADINGTOOLTIP.style.pixelHeight : FADINGTOOLTIP.offsetHeight;
	UpdateWindowSize();
}

function ToolTipFading() {
	if (transparency <= 100) {
		FADINGTOOLTIP.style.filter = "alpha(opacity=" + transparency + ")";
		transparency += 5;
		timer_id = setTimeout('ToolTipFading()', 35);
	}
}

function UpdateWindowSize() {
	wnd_height = document.body.clientHeight;
	wnd_width = document.body.clientWidth;
}
//---------------------------------------------------------------------------------------------------------
