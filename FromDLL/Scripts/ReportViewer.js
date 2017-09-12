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
	var queryParameters = {},
		queryString = location.search.substring(1),
		re = /([^&=]+)=([^&]*)/g, m;
	var s = [];
	while (m = re.exec(queryString)) {
		var key = decodeURIComponent(m[1]);
		var value = decodeURIComponent(m[2]);
		if (key == parameterName)
			value = parameterValue;
		if (key.toLowerCase() != 'rn')
			value = encodeURIComponent(value);
		key = encodeURIComponent(key);
		s[s.length] = key + "=" + value;
	}
	location.search = s.join("&").replace(/%20/g, "+");
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
	GetDatasourcesList();
}
//------------------------------------------------------------------------------------------------------------------

//Common interface--------------------------------------------------------------------------------------------------
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
	if (!resNumImg) {
		return;
	}
	var uvcVal = '100';
	if (recsNum == 1) {
		uvcVal = '1';
		jq$('#resNumLi0').addClass('selected');
		resNumImg.src = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'row-1.png';
	}
	if (recsNum == 10) {
		uvcVal = '10';
		jq$('#resNumLi1').addClass('selected');
		resNumImg.src = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-10.png';
	}
	if (recsNum == 100) {
		uvcVal = '100';
		jq$('#resNumLi2').addClass('selected');
		resNumImg.src = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-100.png';
	}
	if (recsNum == 1000) {
		uvcVal = '1000';
		jq$('#resNumLi3').addClass('selected');
		resNumImg.src = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-1000.png';
	}
	if (recsNum == 10000) {
		uvcVal = '10000';
		jq$('#resNumLi5').addClass('selected');
		resNumImg.src = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-10000.png';
	}
	if (recsNum == -1) {
		uvcVal = '-1';
		jq$('#resNumLi4').addClass('selected');
		resNumImg.src = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter + 'image=ModernImages.' + 'rows-all.png';
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

/**
 * Update used and remaining fields lists html.
 */
function RefreshFieldsList() {
	function _createColumnControlRow(checkboxAttrs, labelFor, labelText) {
		var $row = jq$('<tr>');
		// append checkbox:
		var $checkCell = jq$('<td></td>')
			.css('width', '15px');
		var $checkbox = jq$('<input>')
			.attr('type', 'checkbox');
		for (var key in checkboxAttrs)
			if (checkboxAttrs.hasOwnProperty(key))
				$checkbox.attr(key, checkboxAttrs[key]);
		$checkCell.append($checkbox);
		$row.append($checkCell);

		// append label
		var $nameCell = jq$('<td></td>');
		var $label = jq$('<label></label>')
			.css('cursor', 'pointer')
			.attr('for', labelFor)
			.text(labelText);
		$nameCell.append($label);

		$row.append($nameCell);
		return $row;
	};

	function _createColumnControlRowSelected(index, description) {
		// create basic row
		var checkboxAttrs = {
			'id': 'ufcb' + index,
			'fInd': index
		};
		if (wereChecked.length > index && wereChecked[index] == true)
			checkboxAttrs['checked'] = 'checked';
		var $row = _createColumnControlRow(checkboxAttrs, 'ufcb' + index, description);
		$row.hover(function () {
			this.children[2].style.opacity = 0.5;
		}, function () {
			this.children[2].style.opacity = 0;
		});
		// append properties button
		var $fPropsCell = jq$('<td>');
		$fPropsCell.css({
			'width': '15px',
			'opacity': 0,
			'cursor': 'pointer',
			'background-image': 'url(rp.aspx?image=gear.gif)',
			'background-repeat': 'no-repeat',
			'background-position': '0px 4px'
		}).on('mouseover', function (event) {
			this.style.opacity = 1;
			var e = event ? event : window.event;
			if (e) {
				e.cancelBubble = true;
				if (e.stopPropagation)
					e.stopPropagation();
			}
		}).on('mouseout', function () {
			this.style.opacity = 0;
		}).on('click', function () {
			ShowFieldPropertiesForField(this.parentElement.children[0].children[0]);
		});
		$row.append($fPropsCell);
		return $row;
	}

	function _createColumnControlRowDs(dbName, friendlyName, globalColNum, fieldIndex, dsIndex, description) {
		var checkboxAttrs = {
			'id': 'rfcb' + globalColNum,
			'fInd': fieldIndex,
			'dsInd': dsIndex,
			'value': dbName
		};
		if (description)
			checkboxAttrs['desc'] = description;
		return _createColumnControlRow(checkboxAttrs, 'rfcb' + globalColNum, friendlyName);
	}

	// Fill available data sources table
	var selectedColumns = fieldsList.map(function (field) {
		return field.DbName;
	});

	var $dsTable = jq$('<table></table>').css('width', '100%');

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
			$dsTable.append(dsHeaderRow);
		}

		var additionalFieldsWereRemoved = [];
		for (var rfi = 0; rfi < fieldsWereRemoved.length; rfi++) {
			var afs = fieldsWereRemoved[rfi].properties.AdditionalFields;
			for (var afi = 0; afi < afs.length; afi++) {
				additionalFieldsWereRemoved.push(afs[afi].DbName);
			}
		}

		for (var col = 0; col < dataSources[i].Columns.length; col++) {
			if (!dataSources[i].Columns[col].Hidden) {
				var $dsRow = null;

				for (var rfi = 0; rfi < fieldsWereRemoved.length; rfi++)
					if (fieldsWereRemoved[rfi].column == dataSources[i].Columns[col].DbName) {
						$dsRow = _createColumnControlRowDs(fieldsWereRemoved[rfi].column, fieldsWereRemoved[rfi].description, globalColNum, col, i,
									fieldsWereRemoved[rfi].description);
						$dsTable.append($dsRow);
						globalColNum++;
					}

				if ($dsRow == null && selectedColumns.indexOf(dataSources[i].Columns[col].DbName) < 0
							&& additionalFieldsWereRemoved.indexOf(dataSources[i].Columns[col].DbName) < 0) {
					$dsRow = _createColumnControlRowDs(dataSources[i].Columns[col].DbName, dataSources[i].Columns[col].FriendlyName, globalColNum, col, i);
					$dsTable.append($dsRow);
					globalColNum++;
				}
			}
		}
	}
	jq$('#remainingFieldsSel').empty();
	jq$('#remainingFieldsSel').append($dsTable);

	// Fill selected Fields
	var $fieldsTable = jq$('<table>').css('width', '100%');
	for (var i = 0; i < fieldsList.length; i++) {
		if (fieldsList[i].Hidden == true)
			continue;
		var $row = _createColumnControlRowSelected(i, fieldsList[i].Description);
		$fieldsTable.append($row);
	}
	jq$('#usedFieldsSel').empty();
	jq$('#usedFieldsSel').append($fieldsTable);

	var $fpButton = jq$('#fpButton');
	if (wereChecked.length != 1)
		$fpButton.addClass('disabled');
	else
		$fpButton.removeClass('disabled');
	if (typeof filtersDataObtained != 'undefined' && filtersDataObtained && fieldsDataObtained)
		CheckShowAddFilterControls();
}

function updateFields() {
	var usageData = new Object();
	usageData.Fields = new Array();
	for (var i = 0; i < fieldsList.length; i++) {
		var usedField = jq$.extend({}, fieldsList[i]);
		usedField.Description = encodeURIComponent(usedField.Description);
		usageData.Fields.push(usedField);
	}

	var s = JSON.stringify(usageData);
	wereChecked.length = 0;
	SendFieldsData(s);
}

function UpdateFieldsAndRefresh() {
	updateFields();
	// If possible try to stay on the same page
	var currPage = jq$('.iz-pagelink[data-active-page]').data('active-page');
	GetRenderedReportSet(true, currPage ? ('results=' + currPage) : null);
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
function ShowFilterPropertiesByFieldName(fieldName, GUID) {
	var calcFieldIndex = -1;
	var tableAlias = '';
	for (var i = 0; i < filtersData.length; i++) {
		if (filtersData[i].GUID == GUID) {
			tableAlias = filtersData[i].AliasTable;
			break;
		}
	}
	function prepareFieldToFilterPropertiesView(field) {
		field.FilterGUID = GUID;
		for (var i = 0; i < filtersData.length; i++) {
			if (filtersData[i].GUID == GUID) {
				field.FilterOperator = filtersData[i].OperatorValue;
				field.FilterFriendlyName = field.Description;
				field.Description = filtersData[i].Alias;
				break;
			}
		}
	}
	for (var dsInd = 0; dsInd < dataSources.length; dsInd++) {
		for (var colInd = 0; colInd < dataSources[dsInd].Columns.length; colInd++) {
			if (dataSources[dsInd].Columns[colInd].DbName == fieldName && (tableAlias == '' || dataSources[dsInd].Columns[colInd].TableJoinAlias == tableAlias)) {
				var newField = jq$.extend({}, dataSources[dsInd].Columns[colInd]);
				prepareFieldToFilterPropertiesView(newField);
				FP_ShowFilterProperties(newField, fieldPopup);
				return;
			}
		}
	}
	for (var i = 0; i < fieldsList.length; i++) {
		if (fieldsList[i].Description == fieldName) {
			calcFieldIndex = i;
			break;
		}
	}
	if (calcFieldIndex >= 0) {
		curPropFInd = calcFieldIndex;
		var newField = jq$.extend({}, fieldsList[calcFieldIndex]);
		prepareFieldToFilterPropertiesView(newField);
		FP_ShowFilterProperties(newField, fieldPopup);
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
	for (var property in newField) {
		if (newField.hasOwnProperty(property)) {
			fieldsList[curPropFInd][property] = newField[property];
		}
	}
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
		var isFieldWasRemoved = false;
		var newField = jq$.extend({}, dataSources[dsIndex].Columns[fieldIndex]);
		if (desc) {
			for (var fwr = 0; fwr < fieldsWereRemoved.length; fwr++)
				if (fieldsWereRemoved[fwr].description == desc) {
					newField = fieldsWereRemoved[fwr].properties;
					fieldsWereRemoved.splice(fwr, 1);
					isFieldWasRemoved = true;
					break;
				}
		}
		fieldsList.push(newField);

		if (isFieldWasRemoved) {
			jq$.each(newField.AdditionalFields, function (i, field) {
				fieldsList.push(field);
			});
		}

	}
	wereChecked.length = 0;
	updateFields();
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

		if (typeof (RemoveFilterByUid) === 'function') {
			var func = fieldFullProperties.AggregateFunction;
			var expression = fieldFullProperties.Expression;
			var description = fieldFullProperties.Description;
			if ((func != 'None' && func != 'GROUP' || expression != null && expression != "") && description != '' && description != null) {
				RemoveFilterByFieldGuid(fieldFullProperties.GUID);
			}
		}

		fieldsList.splice(toRemoveIndex, 1);

		if (fieldFullProperties.AdditionalFields.length > 0) {
			fieldsList = jq$.grep(fieldsList, function (field) {
				var isAdditional = false;
				for (var i = 0; i < fieldFullProperties.AdditionalFields.length; i++) {
					if (field.GUID == fieldFullProperties.AdditionalFields[i].GUID) {
						isAdditional = true;
						break;
					}
				}
				return !isAdditional;
			});
		}
	}
	updateFields();
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
	for (var i = 0; i < selectedFields.length; i++) {
		var field = fieldsList[jq$(selectedFields[i]).attr('find')];
		field.ToMove = true;
	}

	// true = Up, false = Down
	var fieldCount = fieldsList.length;
	if (direction)
		for (var cnt = 1; cnt < fieldCount; cnt++) {
			if (fieldsList[cnt].ToMove && !fieldsList[cnt - 1].ToMove) {
				var fieldsToMove = fieldsList.splice(cnt, fieldsList[cnt].AdditionalFields.length + 1);

				var r = 1;
				for (var j = cnt - 1; j >= 0 && fieldsList[j].Operator != 'None'; j--) r++;

				for (var i = fieldsToMove.length - 1; i >= 0; i--)
					fieldsList.splice(cnt - r, 0, fieldsToMove[i]);
			}
		}
	else
		for (var cnt = fieldCount - 2; cnt >= 0; cnt--) {
			if (fieldsList[cnt].ToMove && !fieldsList[cnt + 1].ToMove) {
				if (cnt + fieldsList[cnt].AdditionalFields.length + 1 == fieldCount)
					continue;

				var fieldsToMove = fieldsList.splice(cnt, fieldsList[cnt].AdditionalFields.length + 1);
				var r = fieldsList[cnt].AdditionalFields.length;
				for (var i = 1; i <= fieldsToMove.length; i++)
					fieldsList.splice(cnt + r + i, 0, fieldsToMove[i - 1]);
			}
		}

	for (var i = 0; i < fieldCount; i++)
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
	if (additionalCategories.length > 0)
		curCatName = additionalCategories[additionalCategories.length - 1];
	var newReportName = document.getElementById('newReportName');
	var newCategoryName = document.getElementById('newCategoryName');
	if (setRn) {
		newReportName.value = curRepName;
	}
	var catsArray = new Array();
	catsArray[catsArray.length] = '';
	for (var acCnt = 0; acCnt < additionalCategories.length; acCnt++)
		catsArray[catsArray.length] = additionalCategories[acCnt];
	for (var index = 0; returnObj.AdditionalData && index < returnObj.AdditionalData.length; index++)
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
	prevCatValue = newCategoryName.value;

	ReportingServices.showModal(document.getElementById("saveAsBlock"), {
		buttons: [
			{ value: jsResources.OK, classes: "izenda-dialog-btn-primary", style: "margin-right: 10px;", onclick: SaveReportAs },
			{ value: jsResources.Cancel, classes: "izenda-dialog-btn-default" }
		],
		buttonTemplate: '<button type="button" class="izenda-btn izenda-width-100">{value}</button>',
		tipStyle: "background-color: white; padding: 10px;",
		overlayStyle: "opacity: 0;",
		containerStyle: "padding: 7px; margin: 0; font: 16px 'Segoe UI', Tahoma, Verdana, Arial, Helvetica, sans-serif; white-space: nowrap;",
		footerStyle: "padding: 7px;"
	});
}

function ShowSaveAsDialog() {
	additionalCategories.length = 0;
	GetCategoriesList(true);
}

function SaveReportAs() {
	var newRepName = document.getElementById('newReportName').value;
	var newCatName = document.getElementById('newCategoryName').value;
	newRepName = jq$.map(newRepName.split(nrvConfig.CategoryCharacter), jq$.trim).join(nrvConfig.CategoryCharacter);
	newCatName = jq$.map(newCatName.split(nrvConfig.CategoryCharacter), jq$.trim).join(nrvConfig.CategoryCharacter);

	newRepName = CheckNameValidity(newRepName);
	if (newRepName == null) {
		alert(IzLocal.Res('jsInvalidReportName', 'Invalid Report Name'));
		return false;
	}
	newCatName = CheckNameValidity(newCatName);
	if (newCatName == null) {
		alert(IzLocal.Res('InvalidCategoryName', 'Invalid Category Name'));
		return false;
	}

	var newFullName = newRepName;
	if (newCatName != null && newCatName != '' && newCatName != IzLocal.Res('js_Uncategorized', 'Uncategorized')) {
		newFullName = newCatName + nrvConfig.CategoryCharacter + newFullName;
	}
	while (newFullName.indexOf(' ') >= 0) {
		newFullName = newFullName.replace(' ', '+');
	}

	CheckIfReportExists(newFullName);
}

function escapeRegExp(s) {
	return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function CheckNameValidity(name) {
	var additionalCharacter = '';
	if (nrvConfig.CategoryCharacter != '\\')
		additionalCharacter = escapeRegExp(nrvConfig.CategoryCharacter);
	var invalidCharsRegex = new RegExp("[^A-Za-z0-9_/" + additionalCharacter + "\\-'' \\\\]", 'g');
	if (nrvConfig.AllowInvalidCharacters)
		return name;
	if (nrvConfig.StripInvalidCharacters)
		name = name.replace(invalidCharsRegex, '');

	if (name.match(invalidCharsRegex))
		return null;

	return name;
}

function CheckIfReportExists(reportFullName) {
	var requestString = 'wscmd=checkifreportexists';
	requestString += '&wsarg0=' + reportFullName;
	AjaxRequest('./rs.aspx', requestString, CheckedIfReportExists, null, 'checkifreportexists');
}

function CheckedIfReportExists(returnObj, id) {
	if (id != 'checkifreportexists' || returnObj == undefined || returnObj == null || returnObj.Value == null)
		return;
	if (returnObj.Value != 'OK') {
		alert('Unexpected response: ' + returnObj.Value);
	}
	else {
		if (!returnObj.ReportExists) {
			if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
				FinalizePreSaveRoutines(returnObj.AdditionalData[0]);
			else
				alert('Unexpected response: Field with validated report set name is empty');
		}
		else {
			if (!returnObj.ReadOnly) {
				ReportingServices.showConfirm('ReportSet with specified name already exists. Are you sure to overwrite it?', function (result) {
					if (result == jsResources.OK)
						FinalizePreSaveRoutines(returnObj.AdditionalData[0]);
				});
			}
			else
				ReportingServices.showOk('ReportSet with specified name already exists, and cannot be overwritten.');
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
	ReportingServices.showModal(document.getElementById("newCatBlock"), {
		buttons: [
			{ value: jsResources.Create, classes: "izenda-dialog-btn-primary", style: "margin-right: 10px;", onclick: AddNewCategory, isDefault: true },
			{ value: jsResources.Cancel, classes: "izenda-dialog-btn-default", onclick: CancelAddCategory }
		],
		buttonTemplate: '<button type="button" class="izenda-btn izenda-width-100">{value}</button>',
		tipStyle: "background-color: white; padding: 10px;",
		overlayStyle: "opacity: 0;",
		containerStyle: "padding: 7px; margin: 0; font: 16px 'Segoe UI', Tahoma, Verdana, Arial, Helvetica, sans-serif; white-space: nowrap;",
		footerStyle: "padding: 7px;"
	});
}

function AddNewCategory() {
	additionalCategories[additionalCategories.length] = document.getElementById('addedCatName').value;
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

	responseServer.OpenUrlWithModalDialogNewCustomRsUrl(urlParams, 'aspnetForm', 'reportFrame');
}

//------------------------------------------------------------------------------------------------------------------------

//Initialization----------------------------------------------------------------------------------------------------------------------
var reportName;
var urlSettings;
var initialized;
var nrvConfig;

function InitializePopup() {
	var dialogButtons = {};
	dialogButtons[IzLocal.Res('js_Ok', 'OK')] = function () {
		switchTabAfterRefreshCycle = true;
		var propDialogMode = document.getElementById('propDialogMode');
		if (propDialogMode.value == 'filter') {
			var filter = FP_CollectFilterProperties();
			CommitChangedFilter(filter);
		}
		else if (propDialogMode.value == 'field') {
			var field = FP_CollectFieldProperties();
			updateFieldProperties(field);
		}
		jq$(this).dialog("close");
	};
	dialogButtons[IzLocal.Res('js_Cancel', 'Cancel')] = function () {
		jq$(this).dialog("close");
	};
	fieldPopup = jq$("#data-source-field").dialog({
		autoOpen: false,
		width: GetDialogWidth(),
		height: "auto",
		modal: true,
		buttons: dialogButtons,
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
	else if (typeof UrlSettings == 'function')
		rnParam = UrlSettings().reportInfo.fullName;
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
		document.getElementById('rlhref').href = getAppendedUrl(nrvConfig.ReportListUrl);
	urlSettings = new UrlSettings(nrvConfig.ResponseServerUrl);
	var delimiter = '';
	if (urlSettings.urlRsPage.lastIndexOf(nrvConfig.serverDelimiter) != urlSettings.urlRsPage.length - 1)
		delimiter = nrvConfig.serverDelimiter;
	responseServer = new AdHoc.ResponseServer(urlSettings.urlRsPage + delimiter, 0);
	responseServerWithDelimeter = responseServer.ResponseServerUrl;
	resourcesProvider = new AdHoc.ResourcesProvider(urlSettings.urlRpPage + delimiter, 0);
	resourcesProviderWithDelimeter = resourcesProvider.ResourcesProviderUrl;
	if (nrvConfig.UseBulkCsv) {
		var csvExportBtn = document.getElementById('csvExportBtn');
		if (csvExportBtn != null)
			csvExportBtn.onclick = function () {
				ExtendReportExport(responseServer.OpenUrlWithModalDialogNewCustomRsUrl,
					nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'output=BULKCSV', 'aspnetForm', 'reportFrame');
			};
	}
	if (!nrvConfig.ShowHtmlPrint || nrvConfig.LimitOutputsToCsv)
		document.getElementById('htmlPrintBtn').style.display = 'none';
	if (!nrvConfig.ShowPdfPrint || nrvConfig.LimitOutputsToCsv)
		document.getElementById('html2pdfPrintBtn').style.display = 'none';
	if ((!nrvConfig.ShowHtmlPrint && !nrvConfig.ShowPdfPrint) || nrvConfig.LimitOutputsToCsv)
		document.getElementById('printBtnContainer').style.display = 'none';
	if (nrvConfig.LimitOutputsToCsv) {
		document.getElementById('excelExportBtn').style.display = 'none';
		document.getElementById('wordExportBtn').style.display = 'none';
		document.getElementById('menuBtnExcelExport').onclick = '';
	}

	if (!nrvConfig.ShowSaveControls)
		document.getElementById('saveControls').style.display = 'none';
	if (!nrvConfig.ShowSaveAsToolbarButton)
		document.getElementById('saveAsBtn').style.display = 'none';
	ChangeTopRecords(nrvConfig.InitialResults, false);
	if (urlSettings.reportInfo.exportType != null) {
		responseServer.OpenUrlWithModalDialogNewCustomRsUrl(
			nrvConfig.ResponseServerUrl + nrvConfig.serverDelimiter + 'output=' + urlSettings.reportInfo.exportType, 'aspnetForm', 'reportFrame');
	}

	if (!nrvConfig.ShowAllInResults) {
		jq$(".izenda-results-control-separator").hide();
		jq$(".izenda-results-control-all").hide();
	}

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
	if (nrvConfig.ReportIsLocked == true) {
		jq$('.hide-locked').hide();
		if (nrvConfig.HideFiltersWhenLocked)
			jq$('.hide-when-locked').hide();
	}
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
		var pNvalueParam = pName[0] == 'p' && (pName.indexOf('value', pName.length - 'value'.length) !== -1 || pName.indexOf('value2', pName.length - 'value2'.length) !== -1);
		if (pName != 'rn' && !(pNvalueParam && invalidateInCache))
			urlParams.push(pName + '=' + m[2]);
	}

	if (queryParameters['rn'] != null && queryParameters['rn'].length > 0 && !initialized)
		requestString += '&wsarg0=' + (reportName = queryParameters['rn']) + '&rnalt=' + reportName;
	if (invalidateInCache)
		urlParams.push('iic=1');
	if (additionalParams)
		urlParams.push(additionalParams);

	AjaxRequest('./rs.aspx' + (urlParams.length > 0 ? "?" + urlParams.join("&") : ""), requestString, GotRenderedReportSet, null, 'getrenderedreportset');
}

function GotRenderedReportSet(returnObj, id) {
	if (id != 'getrenderedreportset' || !returnObj)
		return;
	izenda.report.loadReportResponse(returnObj, "#renderedReportDiv");

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
		if (typeof (GetFiltersData) === 'function')
			GetFiltersData();
	}
}

function FirstLoadInit() {
	var designerBtn = document.getElementById('designerBtn');
	if (designerBtn) {
		var reportParam = '';
		if (reportName != undefined && reportName != null) {
			reportParam = '?rn=' + reportName;
		}
		designerBtn.onclick = function () {
			if (nrvConfig.DesignerType === 'InstantReport') {
				window.location = getAppendedUrl(nrvConfig.InstantReportUrl + reportParam);
			} else {
				window.location = getAppendedUrl(nrvConfig.ReportDesignerUrl + reportParam);
			}
		};
	}
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
	if (typeof (GetFiltersData) === 'function')
		GetFiltersData();
}

function AppendReportNameTitle(forcedReportName) {
	var fieldWithRn = document.getElementById('clearReportNameFor2ver');
	var rnVal;
	if (forcedReportName)
		rnVal = forcedReportName;
	else if (fieldWithRn != null)
		rnVal = fieldWithRn.value;
	else
		rnVal = '';
	var autoInd = rnVal.indexOf('(AUTO)_');
	if (autoInd == 0)
		rnVal = rnVal.substr(7);
	var selfInd = rnVal.indexOf('(SELF)_');
	if (selfInd >= 0)
		rnVal = rnVal.substr(0, selfInd);
	rnVal = rnVal.replaceAll('+', ' ');
	var frNodes = rnVal.split(nrvConfig.CategoryCharacter);
	var namePart = frNodes[frNodes.length - 1];
	var catPart = frNodes.length <= 1 ? '' : frNodes[frNodes.length - 2];
	if (namePart.indexOf('&') >= 0) {
		namePart = namePart.substr(0, namePart.indexOf('&'));
	}
	if (catPart.indexOf('&') >= 0) {
		catPart = catPart.substr(0, catPart.indexOf('&'));
	}
	var hdr = '<h1 style=\"margin-left:40px;\">' + namePart + (catPart.length <= 0 ? '' : ' <i>(' + catPart + ')</i>') + '</h1>';
	var repHeader = document.getElementById('repHeader');
	if (typeof repHeader != 'undefined' && repHeader != null)
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
	if (dsUlList) {
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

function CancelAddCategory() {
	document.getElementById('newCategoryName').value = prevCatValue;

	ReportingServices.showModal(document.getElementById("saveAsBlock"), {
		buttons: [
			{ value: jsResources.OK, classes: "izenda-dialog-btn-primary", style: "margin-right: 10px;", onclick: SaveReportAs },
			{ value: jsResources.Cancel, classes: "izenda-dialog-btn-default" }
		],
		buttonTemplate: '<button type="button" class="izenda-btn izenda-width-100">{value}</button>',
		tipStyle: "background-color: white; padding: 10px;",
		overlayStyle: "opacity: 0;",
		containerStyle: "padding: 7px; margin: 0; font: 16px 'Segoe UI', Tahoma, Verdana, Arial, Helvetica, sans-serif; white-space: nowrap;",
		footerStyle: "padding: 7px;"
	});
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
