var currentDatasource;
var selectionsList;
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
    if (typeof (window.izendaPageId$) !== 'undefined') {
    	if (url.indexOf("?") == -1)
    		url = url + "?";
    	else {
    		if (url[url.length - 1] != '&' && url[url.length - 1] != '?')
    			url = url + "&";
    	}
    	url = url + 'izpid=' + window.izendaPageId$;
    }
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
        if (responseText.charAt(0) != '[') {
            responseText = '[' + responseText + ']';
            isArray = false;
        }
        var retObj = eval(responseText);
        if (!isArray)
            return retObj[0];
        return retObj;
    }

    function ProcessRequest() {
        if (thisRequestObject.readyState == 4) {
            if (thisRequestObject.status == 200 && callbackSuccess) {
                callbackSuccess(DeserializeJson(), thisRequestObject.requestId, thisRequestObject.dtk);
            }
            else if (callbackError) {
                callbackError(thisRequestObject);
            }
        }
    }
}

function clearNames(elem) {
    $(elem).attr('name', '');
    $(elem).attr('id', '');
    for (var index = 0; index < elem.children.length; index++)
        clearNames(elem.children[index]);
}

function filtersTrickBeforeUpdate() {
    if (filtersTable == undefined) {
        clonedFilters = undefined;
        return;
    }
    clonedFilters = $(filtersTable).clone(false, false)[0];
    clearNames(clonedFilters);
    filtersTable.style.display = 'none';
    realFilterParent.appendChild(filtersTable);
    visualFilterParent.insertBefore(clonedFilters, document.getElementById('updateBtnP'));
}

function filtersTrickAfterUpdate() {
    if (clonedFilters == undefined)
        return;
    setTimeout(function () { visualFilterParent.removeChild(clonedFilters); visualFilterParent.insertBefore(filtersTable, document.getElementById('updateBtnP')); filtersTable.style.display = ''; }, 100);
}

function updateReport(continueScript) {
    var fieldWithPCId = document.getElementById('previewControlIdFor2ver');
    var contId = fieldWithPCId.value;
    var fieldWithRn = document.getElementById('reportNameFor2ver');
    var rnVal = fieldWithRn.value;
    filtersTrickBeforeUpdate();
    var cs = continueScript;
    if (cs == undefined)
      cs = null;
    HORR_UpdateContent(contId, cs, true, 'rn=' + rnVal + '&invalidateInCache=1');
    filtersTrickAfterUpdate();
}

function SendFieldsData(data, saveAfterUpdate) {
    var requestString = 'wscmd=updatecrsfields&wsarg0=' + data;
    AjaxRequest('./rs.aspx', requestString, FieldsDataSent, null, 'updatecrsfields', saveAfterUpdate);
}

function FieldsDataSent(returnObj, id, saveAfterUpdate) {
    if (id != 'updatecrsfields' || returnObj == undefined || returnObj == null || returnObj.Value == null)
        return;
    if (saveAfterUpdate)
      updateReport('SaveAfterUpdate();');
    else
      updateReport();
}
//------------------------------------------------------------------------------------------------------------------

//Common interface----------------------------------------------------------------------------------------------------
function DetectCurrentDs(dbName) {
    var newValue = -1;
    for (var index = 0; index < selectionsList.length; index++) {
        if (dbName == selectionsList[index].DbName) {
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

function GetFieldIndexes(fieldDbName) {
    for (var dsCnt = 0; dsCnt < selectionsList.length; dsCnt++) {
        for (var fCnt = 0; fCnt < selectionsList[dsCnt].Fields.length; fCnt++) {
            if (selectionsList[dsCnt].Fields[fCnt].DbName == fieldDbName) {
                var indexes = new Array();
                indexes[indexes.length] = dsCnt;
                indexes[indexes.length] = fCnt;
                return indexes;
            }
        }
    }
    return null;
}

function UpdateMSV(lid) {
    var label = document.getElementById(lid);
    var msvs = label.getAttribute('msvs').split(',');
    var msv = label.getAttribute('msv');
    var curInd = -1;
    for (var ind = 0; ind < msvs.length; ind++) {
        if (msvs[ind] == msv) {
            curInd = ind;
            break;
        }
    }
    curInd++;
    if (curInd >= msvs.length)
        curInd = 0;
    label.setAttribute('msv', msvs[curInd]);
    label.innerHTML = msvs[curInd];
}

function InitiateEmail() {
  var fieldWithRn = document.getElementById('reportNameFor2ver');
  var rnVal = fieldWithRn.value;
  TB_EMailReport(encodeURIComponent(rnVal), '?subject=' + encodeURIComponent(rnVal) + '&body=' + encodeURIComponent(location));
}

function ChangeTopRecords(recsNum) {
    for (var i = 0; i < 6; i++)
        $('#resNumLi' + i).removeClass('selected');
    var resNumImg = document.getElementById('resNumImg');
    var uvcVal = '';
    var baseUrl = resNumImg.src.substr(0, resNumImg.src.lastIndexOf("ModernImages.") + 13);
    if (recsNum == 1) {
        uvcVal = '1';
        $('#resNumLi0').addClass('selected');
        resNumImg.src = 'rs.aspx?image=ModernImages.' + 'row-1.png';
    }
    if (recsNum == 10) {
        uvcVal = '10';
        $('#resNumLi1').addClass('selected');
        resNumImg.src = 'rs.aspx?image=ModernImages.' + 'rows-10.png';
    }
    if (recsNum == 100) {
        uvcVal = '100';
        $('#resNumLi2').addClass('selected');
        resNumImg.src = 'rs.aspx?image=ModernImages.' + 'rows-100.png';
    }
    if (recsNum == 1000) {
        uvcVal = '1000';
        $('#resNumLi3').addClass('selected');
        resNumImg.src = 'rs.aspx?image=ModernImages.' + 'rows-1000.png';
    }
    if (recsNum == 10000) {
        uvcVal = '10000';
        $('#resNumLi5').addClass('selected');
        resNumImg.src = 'rs.aspx?image=ModernImages.' + 'rows-10000.png';
    }    
    if (recsNum == -1) {
        uvcVal = '-1';
        $('#resNumLi4').addClass('selected');
        resNumImg.src = 'rs.aspx?image=ModernImages.' + 'rows-all.png';
    }
    var fieldWithPCId = document.getElementById('previewControlIdFor2ver');
    var contId = fieldWithPCId.value;
    filtersTrickBeforeUpdate();
    HORR_UpdateVisibleContent(contId, uvcVal);
    filtersTrickAfterUpdate();
}

function RefreshFieldsList() {
    var remainingHtml = "<table>";
    var usedHtml = "<table>";
    var uCnt = 0;
    var rCnt = 0;
    var cdsBegin = currentDatasource;
    var cdsEnd = currentDatasource + 1;
    if (currentDatasource == -1) {
        cdsBegin = 0;
        cdsEnd = selectionsList.length;
    }
    var selectedFields = new Array();
    for (var cds = cdsBegin; cds < cdsEnd; cds++) {
        for (var fCnt = 0; fCnt < selectionsList[cds].Fields.length; fCnt++) {
            var idPrefix;
            if (selectionsList[cds].Fields[fCnt].Selected > -1) {
                idPrefix = 'ufcb' + uCnt;
                uCnt++;
            }
            else {
                idPrefix = 'rfcb' + rCnt;
                rCnt++;
            }
            var wasChecked = '';
            for (var index = 0; index < wereChecked.length; index++) {
                if (wereChecked[index] == selectionsList[cds].Fields[fCnt].DbName) {
                    wasChecked = ' checked="checked"';
                    break;
                }
            }
            var clickProcess = '';
            if (selectionsList[cds].Fields[fCnt].Selected > -1)
                clickProcess = 'onchange="javascript:var fpButton = document.getElementById(\'fpButton\'); if (GetSelectedFieldInd() >= 0) {$(fpButton).removeClass(\'disabled\');} else {$(fpButton).addClass(\'disabled\');}"';
            var lColor = '';
            var fieldOpt = '';
            if (!selectionsList[cds].Fields[fCnt].Hidden) {
              fieldOpt += '<tr><td><input type="checkbox" id="' + idPrefix + '" cdsInd="' + cds + '" fInd="' + fCnt + '" value="' + selectionsList[cds].Fields[fCnt].DbName + '"' + wasChecked + clickProcess + ' /></td>';
            }
            else {
            	fieldOpt += '<tr style="display:none;"><td><input type="checkbox" id="' + idPrefix + '" cdsInd="' + cds + '" fInd="' + fCnt + '" value="' + selectionsList[cds].Fields[fCnt].DbName + '" disabled="disabled" /></td>';
              lColor = 'color:#808080;';              
            }
            fieldOpt += '<td><label style=\"cursor:pointer;' + lColor + '\" for=\"' + idPrefix + '\">' + selectionsList[cds].Fields[fCnt].FriendlyName + '</label></td></tr>';
            if (selectionsList[cds].Fields[fCnt].Selected > -1) {
                var selectedHtml = new Object();
                selectedHtml.Text = fieldOpt;
                selectedHtml.OrderNum = selectionsList[cds].Fields[fCnt].Selected;
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
    remaining.innerHTML = remainingHtml;
    used.innerHTML = usedHtml;
    var fpButton = document.getElementById('fpButton');
    if (wereChecked.length != 1)
        $(fpButton).addClass('disabled');
    else
        $(fpButton).removeClass('disabled');
}

function updateFields(saveAfterUpdate) {
    var usageData = new Object();
    usageData.Fields = new Array();
    for (var dsCnt = 0; dsCnt < selectionsList.length; dsCnt++) {
        for (var fCnt = 0; fCnt < selectionsList[dsCnt].Fields.length; fCnt++)
            if (selectionsList[dsCnt].Fields[fCnt].Selected > -1) {
                var usedField = new Object();
                usedField.FriendlyName = selectionsList[dsCnt].Fields[fCnt].FriendlyName;
                usedField.DbName = selectionsList[dsCnt].Fields[fCnt].DbName;
                usedField.Selected = selectionsList[dsCnt].Fields[fCnt].Selected;
                usedField.Total = selectionsList[dsCnt].Fields[fCnt].Total;
                usedField.VG = selectionsList[dsCnt].Fields[fCnt].VG;
                usedField.Description = selectionsList[dsCnt].Fields[fCnt].Description;
                usedField.Format = selectionsList[dsCnt].Fields[fCnt].Format;
                usedField.LabelJ = selectionsList[dsCnt].Fields[fCnt].LabelJ;
                usedField.ValueJ = selectionsList[dsCnt].Fields[fCnt].ValueJ;
                usageData.Fields[usageData.Fields.length] = usedField;
            }
    }
    var s = JSON.stringify(usageData);
    wereChecked.length = 0;
    RefreshFieldsList();
    SendFieldsData(s, saveAfterUpdate);
}
//------------------------------------------------------------------------------------------------------------------

//Pivots control--------------------------------------------------------------------------------------------------
function populatePivots() {
    var pivotsFieldOld = jq$("select[id$='PivotField']");
    var pivotsFunctionOld = jq$("select[id$='PivotFunction']");
    var pivotsControlNew = jq$("#pivot-selector");
    if (pivotsFieldOld.length > 0 && pivotsFunctionOld.length > 0 && pivotsControlNew.length > 0) {
        var onChangeFunc = jq$("select[id$='PivotFunction']").attr("onchange");
        onChangeFunc = onChangeFunc.replace("HORR_PivotFunctionChanged", "updatePivots");
        jq$("a[name='update-button-pivots']").attr("onclick", onChangeFunc);
        jq$("select[id$='PivotFunction']").attr("onchange", "");
        jq$("select[id$='PivotField']").attr("onchange", "pivotFieldChanged();");
        pivotsControlNew.find("#pivot-field").replaceWith(pivotsFieldOld);
        pivotsControlNew.find("#pivot-function").replaceWith(pivotsFunctionOld);
        jq$(".visibility-pivots").show();
    }
    else {
        jq$(".visibility-pivots").hide();
    }
    if (pivotsFunctionOld != null && pivotsFunctionOld.length > 0 && pivotsFunctionOld[0] != null) {
        var grpInd = -1;
        for (var i = 0; i < pivotsFunctionOld[0].options.length; i++) {
            if (pivotsFunctionOld[0].options[i].value == "GROUP") {
                grpInd = i;
                break;
            }
        }
        if (grpInd > -1)
            pivotsFunctionOld[0].remove(grpInd);
        var dotsInd = -1;
        for (var i = 0; i < pivotsFunctionOld[0].options.length; i++) {
            if (pivotsFunctionOld[0].options[i].value == "None") {
                dotsInd = i;
                break;
            }
        }
        if (pivotsFunctionOld[0].value == "None")
            groupingUsed = false;
        else {
            groupingUsed = true;
            if (dotsInd > -1)
                pivotsFunctionOld[0].options[dotsInd].value = "GROUP";
        }
    }
}

function pivotFieldChanged() {
    var pivotsField = jq$("select[id$='PivotField']");
    var pivotsFunction = jq$("select[id$='PivotFunction']");
    var fIndexes = GetFieldIndexes(pivotsField.val());
    if (fIndexes != null) {
        for (var i = 0; i < selectionsList[fIndexes[0]].Fields[fIndexes[1]].FunctionValues.length; i++)
            if (selectionsList[fIndexes[0]].Fields[fIndexes[1]].FunctionValues[i] == pivotsFunction.val())
                return;
        if (groupingUsed)
            pivotsFunction[0].value = "GROUP";
        else
            pivotsFunction[0].value = "None";
    }
}

function updatePivots(arg1, arg2, id) {
  var pivotsField = jq$("select[id$='PivotField']");
  var pivotsFunction = jq$("select[id$='PivotFunction']");
  if (pivotsField && pivotsFunction)
    responseServer.ExecuteCommand("changePivot", "field=" + pivotsField.val() + "&" + "function=" + pivotsFunction.val(), true, updateReport, id);
}
//------------------------------------------------------------------------------------------------------------------

//Field advanced properties-------------------------------------------------------------------------------------------------------
function ShowFieldProperties() {
    var fieldInd = GetSelectedFieldInd();
    var fieldCb = document.getElementById('ufcb' + fieldInd);
    if (fieldCb == null)
        return;
    curPropCdsInd = fieldCb.getAttribute('cdsInd');
    curPropFInd = fieldCb.getAttribute('fInd');
    var titleDiv = document.getElementById('titleDiv');
        titleDiv.innerHTML = 'Field Properties for ' + selectionsList[curPropCdsInd].Fields[curPropFInd].FriendlyName;
    document.getElementById('propDescription').value = selectionsList[curPropCdsInd].Fields[curPropFInd].Description;
    var propTotal = document.getElementById('propTotal');
    propTotal.checked = false;
    if (selectionsList[curPropCdsInd].Fields[curPropFInd].Total == 1)
        propTotal.checked = true;
    var propVG = document.getElementById('propVG');
    propVG.checked = false;
    if (selectionsList[curPropCdsInd].Fields[curPropFInd].VG == 1)
        propVG.checked = true;
    var propFormats = document.getElementById('propFormats');
    propFormats.options.length = 0;
    for (var formatCnt = 0; formatCnt < selectionsList[curPropCdsInd].Fields[curPropFInd].FormatValues.length; formatCnt++) {
        var opt = new Option();
        opt.value = selectionsList[curPropCdsInd].Fields[curPropFInd].FormatValues[formatCnt];
        opt.text = selectionsList[curPropCdsInd].Fields[curPropFInd].FormatNames[formatCnt];
        if (selectionsList[curPropCdsInd].Fields[curPropFInd].Format == selectionsList[curPropCdsInd].Fields[curPropFInd].FormatValues[formatCnt])
            opt.selected = 'selected';
        propFormats.add(opt);
    }
    var fieldsCtlTable = document.getElementById('fieldsCtlTable');
    var propertiesDiv = document.getElementById('propertiesDiv');
    fieldsCtlTable.style.display = 'none';
    propertiesDiv.style.display = '';
    var labelJ = document.getElementById('labelJ');
    var msvs = labelJ.getAttribute('msvs').split(',');
    labelJ.innerHTML = msvs[selectionsList[curPropCdsInd].Fields[curPropFInd].LabelJ - 1];
    labelJ.setAttribute('msv', msvs[selectionsList[curPropCdsInd].Fields[curPropFInd].LabelJ - 1]);
    var valueJ = document.getElementById('valueJ');
    msvs = valueJ.getAttribute('msvs').split(',');
    valueJ.innerHTML = msvs[selectionsList[curPropCdsInd].Fields[curPropFInd].ValueJ];
    valueJ.setAttribute('msv', msvs[selectionsList[curPropCdsInd].Fields[curPropFInd].ValueJ]);
    if (IsIE()) {
        labelJ.style.left = '-17px';
        valueJ.style.left = '-17px';
    }
}

function updateFieldProperties() {
    selectionsList[curPropCdsInd].Fields[curPropFInd].Description = document.getElementById('propDescription').value;
    var propTotal = document.getElementById('propTotal');
    if (propTotal.checked)
        selectionsList[curPropCdsInd].Fields[curPropFInd].Total = 1;
    else
        selectionsList[curPropCdsInd].Fields[curPropFInd].Total = 0;
    var propVG = document.getElementById('propVG');
    if (propVG.checked)
        selectionsList[curPropCdsInd].Fields[curPropFInd].VG = 1;
    else
        selectionsList[curPropCdsInd].Fields[curPropFInd].VG = 0;
    var propFormats = document.getElementById('propFormats');
    selectionsList[curPropCdsInd].Fields[curPropFInd].Format = propFormats.value;
    var labelJ = document.getElementById('labelJ');
    var msvs = labelJ.getAttribute('msvs').split(',');
    var msv = labelJ.getAttribute('msv');
    var curInd = 0;
    for (var ind = 0; ind < msvs.length; ind++) {
        if (msvs[ind] == msv) {
            curInd = ind;
            break;
        }
    }
    selectionsList[curPropCdsInd].Fields[curPropFInd].LabelJ = curInd + 1;
    var valueJ = document.getElementById('valueJ');
    var msvs = valueJ.getAttribute('msvs').split(',');
    var msv = valueJ.getAttribute('msv');
    var curInd = 0;
    for (var ind = 0; ind < msvs.length; ind++) {
        if (msvs[ind] == msv) {
            curInd = ind;
            break;
        }
    }
    selectionsList[curPropCdsInd].Fields[curPropFInd].ValueJ = curInd;
    updateFields(false);
}
//------------------------------------------------------------------------------------------------------------------

//Fields list-----------------------------------------------------------------------------------------------------------
function AddRemainingFields() {
    var newInd = -1;
    cdsBegin = 0;
    cdsEnd = selectionsList.length;
    for (var cds = cdsBegin; cds < cdsEnd; cds++) {
        for (var fCnt = 0; fCnt < selectionsList[cds].Fields.length; fCnt++) {
            if (newInd < selectionsList[cds].Fields[fCnt].Selected)
                newInd = selectionsList[cds].Fields[fCnt].Selected;
        }
    }
    newInd++;
    var idCnt = 0;
    while (true) {
        var cb = document.getElementById('rfcb' + idCnt);
        if (cb == null)
            break;
        if (cb.checked) {
            var ci = cb.getAttribute('cdsInd');
            var fi = cb.getAttribute('fInd');
            selectionsList[ci].Fields[fi].Selected = newInd;
            selectionsList[ci].Fields[fi].LabelJ = 1;
            selectionsList[ci].Fields[fi].ValueJ = 0;
            selectionsList[ci].Fields[fi].Description = selectionsList[ci].Fields[fi].FriendlyName;
            newInd++;
        }
        idCnt++;
    }
    wereChecked.length = 0;
    RefreshFieldsList();
}

function RemoveUsedFields() {
    var idCnt = 0;
    while (true) {
        var cb = document.getElementById('ufcb' + idCnt);
        if (cb == null)
            break;
        if (cb.checked) {
            selectionsList[cb.getAttribute('cdsInd')].Fields[cb.getAttribute('fInd')].Selected = -1;
        }
        idCnt++;
    }
    var selectedFields = new Array();
    cdsBegin = 0;
    cdsEnd = selectionsList.length;
    for (var cds = cdsBegin; cds < cdsEnd; cds++) {
        for (var fCnt = 0; fCnt < selectionsList[cds].Fields.length; fCnt++) {
            if (selectionsList[cds].Fields[fCnt].Selected > -1) {
                var selectedHtml = new Object();
                selectedHtml.DsNum = cds;
                selectedHtml.FNum = fCnt;
                selectedHtml.OrderNum = selectionsList[cds].Fields[fCnt].Selected;
                selectedFields[selectedFields.length] = selectedHtml;
            }
        }
    }
    for (var ind1 = 0; ind1 < selectedFields.length - 1; ind1++) {
        for (var ind2 = ind1 + 1; ind2 < selectedFields.length; ind2++) {
            if (selectedFields[ind1].OrderNum > selectedFields[ind2].OrderNum) {
                var tmpDsNum = selectedFields[ind1].DsNum;
                var tmpFNum = selectedFields[ind1].FNum;
                var tmpOrder = selectedFields[ind1].OrderNum;
                selectedFields[ind1].DsNum = selectedFields[ind2].DsNum;
                selectedFields[ind1].FNum = selectedFields[ind2].FNum;
                selectedFields[ind1].OrderNum = selectedFields[ind2].OrderNum;
                selectedFields[ind2].DsNum = tmpDsNum;
                selectedFields[ind2].FNum = tmpFNum;
                selectedFields[ind2].OrderNum = tmpOrder;
            }
        }
    }
    for (var index = 0; index < selectedFields.length; index++)
        selectionsList[selectedFields[index].DsNum].Fields[selectedFields[index].FNum].Selected = index;
    wereChecked.length = 0;
    RefreshFieldsList();
}

function MoveUp() {
    var selectedFields = new Array();
    for (var dsCnt = 0; dsCnt < selectionsList.length; dsCnt++) {
        for (var fCnt = 0; fCnt < selectionsList[dsCnt].Fields.length; fCnt++) {
            if (selectionsList[dsCnt].Fields[fCnt].Selected > -1) {
                var usedField = new Object();
                usedField.FriendlyName = selectionsList[dsCnt].Fields[fCnt].FriendlyName;
                usedField.DbName = selectionsList[dsCnt].Fields[fCnt].DbName;
                usedField.Selected = selectionsList[dsCnt].Fields[fCnt].Selected;
                usedField.ToMove = false;
                usedField.DbNum = dsCnt;
                usedField.FNum = fCnt;
                selectedFields[selectedFields.length] = usedField;
            }
        }
    }
    var idCnt = 0;
    wereChecked = new Array();
    while (true) {
        var cb = document.getElementById('ufcb' + idCnt);
        if (cb == null)
            break;
        if (cb.checked) {
            for (var sCnt = 0; sCnt < selectedFields.length; sCnt++) {
                if (selectedFields[sCnt].DbName == cb.value) {
                    selectedFields[sCnt].ToMove = true;
                    wereChecked[wereChecked.length] = selectedFields[sCnt].DbName;
                }
            }
        }
        idCnt++;
    }
    for (var ind1 = 0; ind1 < selectedFields.length - 1; ind1++) {
        for (var ind2 = ind1 + 1; ind2 < selectedFields.length; ind2++) {
            if (selectedFields[ind1].Selected > selectedFields[ind2].Selected) {
                var tmp = selectedFields[ind1];
                selectedFields[ind1] = selectedFields[ind2];
                selectedFields[ind2] = tmp;
            }
        }
    }
    for (var cnt = 1; cnt < selectedFields.length; cnt++) {
        if (selectedFields[cnt].ToMove && !selectedFields[cnt - 1].ToMove) {
            var tmp = selectedFields[cnt - 1];
            selectedFields[cnt - 1] = selectedFields[cnt];
            selectedFields[cnt] = tmp;
        }
    }
    for (var cnt = 0; cnt < selectedFields.length; cnt++)
        selectionsList[selectedFields[cnt].DbNum].Fields[selectedFields[cnt].FNum].Selected = cnt;
    RefreshFieldsList();
}

function MoveDown() {
    var selectedFields = new Array();
    for (var dsCnt = 0; dsCnt < selectionsList.length; dsCnt++) {
        for (var fCnt = 0; fCnt < selectionsList[dsCnt].Fields.length; fCnt++) {
            if (selectionsList[dsCnt].Fields[fCnt].Selected > -1) {
                var usedField = new Object();
                usedField.FriendlyName = selectionsList[dsCnt].Fields[fCnt].FriendlyName;
                usedField.DbName = selectionsList[dsCnt].Fields[fCnt].DbName;
                usedField.Selected = selectionsList[dsCnt].Fields[fCnt].Selected;
                usedField.ToMove = false;
                usedField.DbNum = dsCnt;
                usedField.FNum = fCnt;
                selectedFields[selectedFields.length] = usedField;
            }
        }
    }
    var idCnt = 0;
    wereChecked = new Array();
    while (true) {
        var cb = document.getElementById('ufcb' + idCnt);
        if (cb == null)
            break;
        if (cb.checked) {
            for (var sCnt = 0; sCnt < selectedFields.length; sCnt++) {
                if (selectedFields[sCnt].DbName == cb.value) {
                    selectedFields[sCnt].ToMove = true;
                    wereChecked[wereChecked.length] = selectedFields[sCnt].DbName;
                }
            }
        }
        idCnt++;
    }
    for (var ind1 = 0; ind1 < selectedFields.length - 1; ind1++) {
        for (var ind2 = ind1 + 1; ind2 < selectedFields.length; ind2++) {
            if (selectedFields[ind1].Selected > selectedFields[ind2].Selected) {
                var tmp = selectedFields[ind1];
                selectedFields[ind1] = selectedFields[ind2];
                selectedFields[ind2] = tmp;
            }
        }
    }
    for (var cnt = selectedFields.length - 2; cnt >= 0; cnt--) {
        if (selectedFields[cnt].ToMove && !selectedFields[cnt + 1].ToMove) {
            var tmp = selectedFields[cnt + 1];
            selectedFields[cnt + 1] = selectedFields[cnt];
            selectedFields[cnt] = tmp;
        }
    }
    for (var cnt = 0; cnt < selectedFields.length; cnt++)
        selectionsList[selectedFields[cnt].DbNum].Fields[selectedFields[cnt].FNum].Selected = cnt;
    RefreshFieldsList();
}
//------------------------------------------------------------------------------------------------------------------------


//Save and Save As code----------------------------------------------------------------------------------------------------------
function GetCategoriesList() {
    var requestString = 'wscmd=crscategories';
    AjaxRequest('./rs.aspx', requestString, GotCategoriesList, null, 'crscategories');
}

function GotCategoriesList(returnObj, id) {
    if (id != 'crscategories' || returnObj == undefined || returnObj == null)
        return;
    var fieldWithRn = document.getElementById('reportNameFor2ver');
    var frn = decodeURIComponent(fieldWithRn.value);
    while (frn.indexOf('+') >= 0) {
      frn = frn.replace('+', ' ');
    }
    //11328?
    var nodes = frn.split('\\\\');
    var curCatName = '';
    var curRepName = nodes[0];
    if (nodes.length > 1) {
        curCatName = nodes[0];
        curRepName = nodes[1];
    }
    var newReportName = document.getElementById('newReportName');
    var newCategoryName = document.getElementById('newCategoryName');
    newReportName.value = curRepName;
    var catsArray = new Array();
    catsArray[catsArray.length] = '';
    for (var acCnt = 0; acCnt < additionalCategories.length; acCnt++)
        catsArray[catsArray.length] = additionalCategories[acCnt];
    if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
        for (var index = 0; index < returnObj.AdditionalData.length; index++)
            catsArray[catsArray.length] = returnObj.AdditionalData[index];
    newCategoryName.options.length = 0;
    //var opt = new Option();
    //opt.value = '(Create new)';
    //opt.text = '(Create new)';
    //newCategoryName.add(opt);    
    for (var index = 0; index < catsArray.length; index++) {
        var opt = new Option();
        opt.value = catsArray[index];
        var orn = catsArray[index];
        while (orn.indexOf('+') >= 0) {
          orn = orn.replace('+', ' ');
        }
        opt.text = orn;
        if (opt.text == curCatName && additionalCategories.length == 0)
            opt.selected = 'selected';
        if (additionalCategories.length > 0 && opt.value == additionalCategories[additionalCategories.length - 1])
            opt.selected = 'selected';
        newCategoryName.add(opt);
    }
    var saveAsDialog = document.getElementById('saveAsDialog');
    var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
    saveAsDialog.style.height = windowHeight + 'px';
    saveAsDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
    saveAsDialog.style.display = '';
    prevCatValue = newCategoryName.value;
}

function ShowSaveAsDialog() {
    additionalCategories.length = 0;
    GetCategoriesList();
}

function SaveReportAs() {
    var newRepName = document.getElementById('newReportName').value;
    var newCatName = document.getElementById('newCategoryName').value;
    var fieldWithRn = document.getElementById('reportNameFor2ver');
    var newFullName = newRepName;
    if (newCatName != null && newCatName != '' && newCatName != 'Uncategorized') {
      //11328?
      newFullName = newCatName + '\\\\' + newFullName;
    }
    fieldWithRn.value = newFullName;
    var saveAsDialog = document.getElementById('saveAsDialog');
    saveAsDialog.style.display = 'none';
    SaveReportSet();
}

function SaveReportSet() {
  updateFields(true);
}

function SaveAfterUpdate() {
    var fieldWithRn = document.getElementById('reportNameFor2ver');
    var rnVal = fieldWithRn.value;
    if (rnVal == null || rnVal == '') {
      ShowSaveAsDialog();
      return;
    }
    var loadingrv2 = document.getElementById('loadingrv2');
    var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
    loadingrv2.style.height = windowHeight + 'px';
    loadingrv2.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
    loadingrv2.style.display = '';
    var requestString = 'wscmd=savecurrentreportset';
        requestString += '&wsarg0=' + rnVal;
    AjaxRequest('./rs.aspx', requestString, ReportSetSaved, null, 'savecurrentreportset');
}

function ReportSetSaved(returnObj, id) {
    if (id != 'savecurrentreportset' || returnObj == undefined || returnObj == null || returnObj.Value == null)
        return;
    document.getElementById('loadingrv2').style.display = 'none';
    if (returnObj.Value != 'OK') {
      alert(returnObj.Value);
    }
    else {
      var fieldWithRn = document.getElementById('reportNameFor2ver');
      modifyUrl('rn', fieldWithRn.value);
    }
}

function ShowNewCatDialog() {
    document.getElementById('addedCatName').value = '';
    var saveAsDialog = document.getElementById('saveAsDialog');
    saveAsDialog.style.display = 'none';
    var newCatDialog = document.getElementById('newCatDialog');
    var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
    newCatDialog.style.height = windowHeight + 'px';
    newCatDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
    newCatDialog.style.display = '';
}

function AddNewCategory() {
    additionalCategories[additionalCategories.length] = document.getElementById('addedCatName').value;
    var newCatDialog = document.getElementById('newCatDialog').style.display = 'none';
    GetCategoriesList();
}
//------------------------------------------------------------------------------------------------------------------------


//Initialization----------------------------------------------------------------------------------------------------------------------
function GetDatasourcesList() {
    var requestString = 'wscmd=crsdatasources';
    AjaxRequest('./rs.aspx', requestString, GotDatasourcesList, null, 'crsdatasources');
}

function GotDatasourcesList(returnObj, id) {
    if (id != 'crsdatasources' || returnObj == undefined || returnObj == null)
        return;
    if (returnObj.SelectionsList == null || returnObj.SelectionsList.length == 0)
        return;
    selectionsList = returnObj.SelectionsList;
    var dsUlList = document.getElementById('dsUlList');
    var allOpt = new Option();
    allOpt.value = "###all###";
    allOpt.text = "All";
    dsUlList.add(allOpt);
    for (var dsCnt = 0; dsCnt < selectionsList.length; dsCnt++) {
        var opt = new Option();
        opt.value = selectionsList[dsCnt].DbName;
        opt.text = selectionsList[dsCnt].FriendlyName;
        dsUlList.add(opt);
    }
    if (selectionsList.length == 1) {
        var dsUlList = document.getElementById('dsUlList');
        dsUlList.style.display = 'none';
    }
    currentDatasource = -1;
    wereChecked.length = 0;
    RefreshFieldsList();
    var saveControls = document.getElementById('saveControls');
    /*if (returnObj.CanSaveReport)
        saveControls.style.display = '';
    else
        saveControls.style.display = 'none';*/
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
    saveAsDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
    saveAsDialog.style.display = '';
    var newCategoryName = document.getElementById('newCategoryName');
    newCategoryName.value = prevCatValue;
}
//---------------------------------------------------------------------------------------------------------------------------
