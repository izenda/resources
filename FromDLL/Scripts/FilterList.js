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


var cc_paths = {};
var showFieldAsValueDropDown;
var CC_allowNewFilters;
var CC_oldData;
var CC_FirstTimeOperatorUpdated;
var showingC = false;
var CC_Initialized = false;

function CC_LoadColumns(id, path, options, selectName, row) {
    if (selectName == null)
        selectName = "Column";
    cc_paths[id] = { path: path, options: options };
    var table = document.getElementById(id);
    var body = table.tBodies[0];
    var additionalData = null;
    if (descriptions != null && descriptions.length > 0) {
        additionalData = "<option disabled=''>------</option>";
        for (var i = 0; i < descriptions.length; i++) {
            var calcField = descriptions[i];
            additionalData = additionalData + '<option value="Desciption!' + calcField.description + '"' + (calcField.datatype != null ? (' datatype="' + calcField.datatype + '"') : '') + ' fieldIndex="' + calcField.fieldIndex + '">[' + calcField.description + '] (calc)</option>';
        }
    }
    var rows = null;
    if (row != null) {
        rows = new Array();
        rows.push(row);
        CC_oldData = null;
    }
    else
        rows = body.rows;


    var cc_newData = path + options + "&" + "filterList=true";
    if (additionalData != null)
        cc_newData = cc_newData + additionalData;

    if (CC_oldData == cc_newData)
        return;
    CC_oldData = cc_newData;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var columnSel = EBC_GetSelectByName(row, selectName);
        var value = columnSel.getAttribute("oldValue");
        if (value == "" || value == null || value.indexOf('Desciption!') == 0)
            value = EBC_GetSelectValue(columnSel);
        columnSel.value = value;
        //columnSel.setAttribute("oldValue", null);
        // not async because response getting after the next column sending request
        EBC_LoadData(path, options + "&" + "filterList=true", columnSel, true, null, additionalData);
    }
}

function CC_GetTables(tableID) {
    var tables = new Array();
    var pos = tableID.lastIndexOf("_cc");
    if (pos > 0) {
        var id = tableID.substring(0, pos + 1) + "jtc";
        if (document.getElementById(id) != null) {
            var tableSels = document.getElementsByName(id + '_Table');
            var columnSels = document.getElementsByName(id + '_Column');
            var rightColumnSel = document.getElementsByName(id + '_RightColumn');
            var joinSel = document.getElementsByName(id + '_Join');
            var tableAliases = document.getElementsByName(id + '_TableAlias');
            for (var i = 0; i < tableSels.length; i++) {
                var value = new Array();
                value.table = tableSels[i].value;
                if (value.table != null && value.table != '...') {
                	value.alias = tableAliases[i].value;
                    if (i > 0) {
                        value.column = columnSels[i].value;
                        value.rightColumn = rightColumnSel[i].value;
                        value.join = joinSel[i].value;
                    }
                    tables.push(value);
                }
            }
        }
        else {
            id += "s";
            if (document.getElementById(id) != null) {
                var value = new Array();
                var tableList = cc_paths[tableID].options;
                value.table = tableList.substring(7, tableList.length);
                tables.push(value);
            }
        }
    }
    return tables;
}

function CC_GetAllowNulls(tableID) {
    var allowNulls = "0";
    var pos = tableID.lastIndexOf("_cc");
    if (pos > 0) {
        var id = tableID.substring(0, pos + 1) + "jtc";
        if (document.getElementById(id) == null)
            id += "s";
        var allowNullsInput = document.getElementsByName(id + "_AllowNulls");
        if (allowNullsInput != null && allowNullsInput[0] != null && allowNullsInput[0].checked == true)
            allowNulls = "1";
    }
    return allowNulls;
}

function CC_CaCalDateChanged(elem) {
    var parent = jq$("#" + elem);
    if (!parent)
        return;

    var row = EBC_GetRow(parent[0]);
    var table = EBC_GetParentTable(row);
    var rows = table.tBodies[0].rows;

    for (var i = row["sectionRowIndex"] + 1; i < rows.length; i++) {
        var showEditForRow = CC_GetShowEditForRow(rows[i]);
        if (showEditForRow[2] || showEditForRow[7] || showEditForRow[11])
            CC_LoadValues(rows[i]);
    }
}

function CC_GetFiltersInRange(row, startIndex, endIndex) {
	var parentTable = EBC_GetParentTable(row);
	var id = parentTable.id;
	var columns = jq$('select[name="' + id + '_Column"]');
	var operator = jq$('select[name="' + id + '_Operator"]');
	var filters = new Array();

	if (endIndex == null)
		endIndex = parentTable.rows.length - 1;

	for (var i = startIndex; i < endIndex; i++) {
		var prevRow = parentTable.tBodies[0].rows[i];
		var value = new Array();
		value.Column = columns[i].value;
		if (value.Column != null && value.Column != '...') {
			value.Operator = operator[i].value;
			if (value.Operator != null && value.Operator != '...') {
				var showEditForRow = CC_GetShowEditForRow(prevRow);
				if (showEditForRow[0]) {
					value.val1 = EBC_GetInputByName(prevRow, "Edit1").value;
					if (showEditForRow[1])
						value.val2 = EBC_GetInputByName(prevRow, "Edit2").value;
				}
				if (showEditForRow[2])
					value.val1 = EBC_GetSelectValue(EBC_GetSelectByName(prevRow, "SelectValue"));
				if (showEditForRow[3])
					value.val1 = EBC_GetSelectByName(prevRow, "TimePeriod").value;
				if (showEditForRow[4]) {
					var startDate = EBC_GetInputByName(prevRow, "startDate");
					if (startDate == null) {
						var starDateTable = EBC_GetElementByName(prevRow, "StartDate", "Table");
						startDate = EBC_GetInputByName(starDateTable, "selecteddates");
					}
					if (startDate == null) {
						startDate = EBC_GetInputByName(prevRow, "bcStartDateJQ");
					}
					var endDate = EBC_GetInputByName(prevRow, "endDate");
					if (endDate == null) {
						var endDateTable = EBC_GetElementByName(prevRow, "EndDate", "Table");
						endDate = EBC_GetInputByName(endDateTable, "selecteddates");
					}
					if (endDate == null) {
						endDate = EBC_GetInputByName(prevRow, "bcEndDateJQ");
					}
					value.val1 = startDate.value;
					if (value.val1.length > 11)
						value.val1 = value.val1.substring(0, 10);
					value.val2 = endDate.value;
					if (value.val2.length > 11)
						value.val2 = value.val2.substring(0, 10);
				}
				if (showEditForRow[8]) {
					var eqDate = EBC_GetInputByName(prevRow, "equalsDateJQ");
					value.val1 = eqDate.value;
					if (value.val1.length > 11)
						value.val1 = value.val1.substring(0, 10);
				}
				if (showEditForRow.length > 5 && showEditForRow[5]) {
					value.val1 = EBC_GetInputByName(prevRow, "Edit1").value;
				}
				if (showEditForRow.length > 7 && showEditForRow[7]) {
					var checkBoxSelect = EBC_GetElementByName(prevRow, "CheckBoxSelectInner", "div");
					value.val1 = "";
					if (checkBoxSelect)
						jq$(checkBoxSelect).find(":checked").each(function (i) {
							if (i > 0)
								value.val1 += ",";
							value.val1 += jq$(this).val();
						});
				}
				filters.push(value);
			}
		}
	}
	return filters;
}

function CC_GetAllFilters(row) {
	var prevFilters = CC_GetPrewRows(row);
	var nextFilters = CC_GetFiltersInRange(row, row.sectionRowIndex, null);
	return prevFilters.concat(nextFilters);
}

function CC_GetPrewRows(row) {
	return CC_GetFiltersInRange(row, 0, row.sectionRowIndex);
}

function CC_CropDate(s) {
    var newS = "";
    var stop = false;
    var i = 0;
    var dotNum = 0;
    while (!stop) {
        var c = s.charAt(i);
        if (c == '.') {
            dotNum++;
        }
        if (dotNum < 3) {
            newS += c;
        }
        else {
            stop = true;
        }
        i++;
        if (i >= s.length) {
            stop = true;
        }
    }
    return newS;
}

function CC_GetCurrentFilterLogic() {
	var filterLogic = '';
	if (jq$('input[name$="FilterLogicValue"]').length > 0 && jq$('input[name$="FilterLogicValue"]').val().indexOf('Ex:') == -1)
		filterLogic = jq$('input[name$="FilterLogicValue"]').val();
	return filterLogic;
}
function CC_IsFilterLogicValid() {
	var filterLogic = CC_GetCurrentFilterLogic();
	if (filterLogic != null && filterLogic != '' && filterLogic.indexOf('Ex') == -1)
		return true;
	else
		return false;
}

function CC_GetFilterCMD(row) {
    var cmd = "";
    var parentTable = EBC_GetParentTable(row);
    var id = parentTable.id;
    var tables = CC_GetTables(id);
    var allowNulls = CC_GetAllowNulls(id);
    var filterLogic = CC_GetCurrentFilterLogic();

    if (tables.length == 0) {
        var els = jq$("[id$='_SavedReportName']");
        var savedReportName = null;
        if (els.length > 0)
            savedReportName = els[0];
        if (savedReportName != null) {
            var rn = savedReportName.value;
            if (rn != null && rn != "") {
                var val = new Array();
                val.table = "-1" + "&" + "rn=" + rn;
                tables.push(val);
            }
        }
    }
    if (tables.length > 0) {
        var i;
        for (i = 0; i < tables.length; i++) {
        	cmd = cmd + "&" + "tbl" + i + "=" + tables[i].table;
        	cmd += "&ta" + i + "=" + (tables[i].alias == null ? '' : tables[i].alias);
            if (i > 0) {
                cmd = cmd + "&" + "lclm" + i + "=" + tables[i].column;
                cmd = cmd + "&" + "rclm" + i + "=" + tables[i].rightColumn;
                cmd = cmd + "&" + "jn" + i + "=" + tables[i].join;
            }
        }
        var filters = new Array();
        if (filterLogic != '')
        	filters = CC_GetAllFilters(row);
		else
        	filters = CC_GetPrewRows(row);
        for (i = 0; i < filters.length; i++) {
            cmd = cmd + "&" + "fc" + i + "=" + filters[i].Column;
            cmd = cmd + "&" + "fo" + i + "=" + filters[i].Operator;
            if (filters[i].val1 != null) {
                var v1 = filters[i].val1.replace('&', '%26');
                if (filters[i].Operator == "BetweenTwoDates" || filters[i].Operator == "EqualsCalendar") {
                    v1 = CC_CropDate(v1);
                }
                cmd = cmd + "&" + "fvl" + i + "=" + encodeURIComponent(v1);
            }
            if (filters[i].val2 != null) {
                var v2 = filters[i].val2.replace('&', '%26');
                if (filters[i].Operator == "BetweenTwoDates" || filters[i].Operator == "EqualsCalendar") {
                    v2 = CC_CropDate(v2);
                }
                cmd = cmd + "&" + "fvr" + i + "=" + encodeURIComponent(v2);
            }
        }
    }
    if (filterLogic != '')
    	cmd += '&filterLogic=' + filterLogic;

    if (allowNulls == "1")
        cmd += "&nulls=1";
    return cmd;
}


function CC_LoadValues(row) {
    var operatorName = EBC_GetSelectByName(row, 'Operator').value;
    var isNotFieldOperator = true;

    if (operatorName != null) {
        var len = operatorName.length;
        if (len > 5) {
            var str = operatorName.substring(len - 5, len);
            isNotFieldOperator = (str != 'Field');
        }
    }
    if (isNotFieldOperator) {
        var fullColumnName = EBC_GetSelectByName(row, 'Column').value;
        var valueSel = EBC_GetSelectByName(row, 'SelectValue');
        //jq$(valueSel).html("<option>Loading ...</option>")
        if (fullColumnName != '' && fullColumnName != '...') {
            var cmd = CC_GetFilterCMD(row);
            if (operatorName == "Equals_CheckBoxes")
                EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, null,
				function (responseResult) {
				    var options = jq$(responseResult);
				    var cnt = options.length;
				    var result = "";
				    var itemTemplate = "<input type=\"checkbox\" value=\"{1}\" onclick=\"CC_OnCheckBoxValueChangedHandler(this)\">{0}</input><br/>";
				    for (var i = 0; i < cnt; i++) {
				        var value = jq$(options[i]).val();
				        var text = jq$(options[i]).text();
				        if (value != null && value != "" && value != "...")
				            result += itemTemplate.replace("{0}", text).replace("{1}", value);
				    }
				    var valueCheckBoxes = EBC_GetElementByName(row, 'CheckBoxSelectInner', 'div');
				    if (valueCheckBoxes) {
				        var preCheckedArray = new Array();
				        if (jq$(valueCheckBoxes).html() != "")
				            jq$(valueCheckBoxes).find("input:checked").each(function (i) {
				                preCheckedArray.push(jq$(this).val());
				            });
				        else {
				            if (jq$.isArray(jq$(valueSel).val()))
				                preCheckedArray = jq$(valueSel).val()[0].split(',');
				            else
				                preCheckedArray = jq$(valueSel).val().split(',');
				        }

				        jq$(valueCheckBoxes).html(result);

				        jq$(valueCheckBoxes).find("input:checkbox").each(function (i) {
				            if (jq$.inArray(jq$(this).val(), preCheckedArray) > -1)
				                jq$(this).prop("checked", true);
				            else
				                jq$(this).prop("checked", false);
				        });
				    }
				});
            else if (operatorName == "Equals_TreeView") {
                cmd += "&forTree=1";
                EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, null,
					function (responseResult) {
					    var result = responseResult.substr(2, responseResult.length - 4);
					    CC_TreeUpdateValues(row, result.split('", "'));
					});
            }
            else
                EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, valueSel);
        }
        else
            EBC_LoadData('@CC/Empty', null, valueSel);
    }
    else
        CC_LoadFields(row);
}

function CC_UpdateFiltersFromLogic(){
	var table = jq$('table[id$="_cc"]');
	if (table.length > 0) {
		CC_UpdateFilterRows(table.find("tr")[0]);
	}
}

function CC_UpdateFilterRows(row) {
	var table = EBC_GetParentTable(row);
	var rows = table.tBodies[0].rows;

	var startRow = row["sectionRowIndex"] + 1;
	if (CC_IsFilterLogicValid())
		startRow = 0;

	for (var i = startRow; i < rows.length; i++) {
		var showEditForRow = CC_GetShowEditForRow(rows[i]);
		if (showEditForRow[2] || showEditForRow[7] || showEditForRow[11])
			CC_LoadValues(rows[i]);
	}
}

function CC_ValueChanged(e) {
	if (e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	CC_UpdateFilterRows(row);
}

function CC_RemoveRow(id) {
	var table = document.getElementById(id);
	CC_RenumFilters(table);
	if (table != null) {
		var rows = table.tBodies[0].rows;
		for (var i = 0; i < rows.length; i++) {
			var showEditForRow = CC_GetShowEditForRow(rows[i]);
			if (showEditForRow[2])
				CC_LoadValues(rows[i]);
		}
	}
}

function CC_LoadFields(row) {
	var id = EBC_GetParentTable(row).id;
	CC_OnTableListChangedHandler(id, tablesSave[id], true, "SelectValue", row);
}

function CC_OnTableListInitialized(id, tables) {
	tablesSave[id] = tables;
	cc_paths[id] = { path: "CombinedColumnList", options: "tables=" + tables };
}

function CC_OnTableListChangedHandlerWithStoredParams() {
	if (lastCallParams_CC_OnTableListChangedHandler == null || lastCallParams_CC_OnTableListChangedHandler.length != 5)
		return;
	CC_OnTableListChangedHandler(lastCallParams_CC_OnTableListChangedHandler[0], lastCallParams_CC_OnTableListChangedHandler[1], lastCallParams_CC_OnTableListChangedHandler[2], lastCallParams_CC_OnTableListChangedHandler[3], lastCallParams_CC_OnTableListChangedHandler[4]);
}

var lastCallParams_CC_OnTableListChangedHandler = new Array();
function CC_OnTableListChangedHandler(id, tables, loadFields, selectName, row) {
	if (tables == null)
		return;
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true) {
		lastCallParams_CC_OnTableListChangedHandler = new Array();
		lastCallParams_CC_OnTableListChangedHandler[0] = id;
		lastCallParams_CC_OnTableListChangedHandler[1] = tables;
		lastCallParams_CC_OnTableListChangedHandler[2] = loadFields;
		lastCallParams_CC_OnTableListChangedHandler[3] = selectName;
		lastCallParams_CC_OnTableListChangedHandler[4] = row;
		return;
	}
	if (loadFields == null)
		loadFields = false;
	if (selectName == null)
		selectName = "Column";
	if (tables.join != null)
		tables = tables.join('\'');
	tablesSave[id] = tables;
	cc_paths[id] = { path: "CombinedColumnList", options: "tables=" + tables };
	if (loadFields)
		CC_LoadColumns(id, "CombinedColumnList", "tables=" + tables, selectName, row);
}

function CC_OnSelectValueChangedHandler(e) {
	if (e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if (row == null)
		return;
	var sel = EBC_GetSelectByName(row, 'SelectValue');
	var edit = EBC_GetInputByName(row, "Edit1");
	if (sel == null)
		return;

	if (sel.value == "Loading ...")
		return;

	if (sel.value == "...") {
		edit.value = "";
	} else {
		edit.value = EBC_GetSelectValue(sel);
		var checkList = EBC_GetElementByName(row, 'CheckBoxSelectInner', 'div');
		if (checkList) {
			var allVals = jq$(sel).val();
			var isString = typeof(allVals) == "string";
			jq$(checkList).find("input:checkbox").each(function(i) {
				var currentVal = jq$(this).val();
				if ((isString && currentVal == allVals) || (!isString && jq$.inArray(currentVal, allVals) > -1)) 
					jq$(this).prop("checked", true);
				else
					jq$(this).prop("checked", false);
			});
		}
	}
	CC_ValueChanged(e);
}

function CC_OnCheckBoxValueChangedHandler(e) {
	if (e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if (row == null)
		return;
	var checkList = EBC_GetElementByName(row, 'CheckBoxSelectInner', 'div');
	var edit = EBC_GetInputByName(row, "Edit1");
	var sel = EBC_GetSelectByName(row, 'SelectValue');
	if (!edit)
		return;
	var concatValue = "";
	jq$(checkList).find("input:checked").each(function (i) {
		if (concatValue == "")
			concatValue = jq$(this).val();
		else
			concatValue += "," + jq$(this).val();
	});

	jq$(edit).val(concatValue);
	if (jq$(sel).val() != "Loading ...") {
		jq$(sel).attr('multiple', true);
		jq$(sel).val(concatValue.split(','));
	}
	CC_ValueChanged(e);
}

function CC_InitNewRow(row) {
	var inputs = row.getElementsByTagName('INPUT');
	for (var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		if (input.type == 'checkbox')
			input.checked = false;
		else if (input.type == 'text')
			input.value = '';
	}
	CC_InitRow(row);
	var parameterCheck = EBC_GetInputByName(row, 'Parameter');
	if (parameterCheck != null)
		parameterCheck.checked = true;
	CC_InitAutoComplite(row);
	CC_InitTreeView(row);

}
function CC_InitRow(row) {
	var column = EBC_GetSelectByName(row, 'Column');
	if (column != null)
		column.setAttribute("oldValue", "");
	var operatorSel = EBC_GetSelectByName(row, 'Operator');
	//var selectValueSel = EBC_GetSelectByName(row, 'SelectValue');
	var timePeriodSel = EBC_GetSelectByName(row, 'TimePeriod');
	var id = EBC_GetParentTable(row).id;
	if (cc_paths[id] != null) {
		var url = cc_paths[id];
		CC_LoadColumns(id, cc_paths[id].path, cc_paths[id].options, null, row);
		//EBC_LoadData("CombinedColumnList", "tables=" + url, columnSel);

		//CC_LoadColumns(id, cc_paths[id].path, cc_paths[id].options);
	}

	var tables = "tables=" + tablesSave[id];
	if (operatorSel != null)
		EBC_LoadData('OperatorList', tables, operatorSel);
	if (timePeriodSel != null)
		EBC_LoadData('PeriodList', null, timePeriodSel);
	CC_ShowHideParamsForRow(row);
}

function CC_RenumFilters(table) {
	var body = table.tBodies[0];
	var count = body.rows.length;
	for (var i = 0; i < count; i++) {
		var filterNumber = EBC_GetInputByName(body.rows[i], 'FilterNumber');
		if (filterNumber != null)
			filterNumber.value = i + 1;
	}
}


function CC_OnColumnChangedHandler(e) {
	if (e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();

	if (row != null) {
		var columnSel = EBC_GetSelectByName(row, 'Column');
		var operatorSel = EBC_GetSelectByName(row, 'Operator');
		if (operatorSel && (operatorSel.value == 'Equals_Select' ||
			operatorSel.value == 'NotEquals_Select' ||
			operatorSel.value == 'Equals_Multiple' || operatorSel.value == 'NotEquals_Multiple' ||
			operatorSel.value == 'Equals_CheckBoxes' ||
			operatorSel.value == 'Equals_TreeView' || operatorSel.value == 'NotEquals_TreeView'))
			CC_LoadValues(row);
		var dataType = null;
		var colFullName = null;
		if (columnSel.selectedIndex != -1) {
			dataType = columnSel.options[columnSel.selectedIndex].getAttribute("dataType");
			colFullName = columnSel.options[columnSel.selectedIndex].value;
		}
		if (dataType == null || dataType == "Unknown")
			dataType = "";
		if (colFullName == null)
			colFullName = "";            
		var id = EBC_GetParentTable(row).id;
		var tables = "tables=" + tablesSave[id];
		EBC_LoadData("OperatorList", "typeGroup=" + dataType + "&" + tables + "&colFullName=" + colFullName, operatorSel);
		if (CC_allowNewFilters != null && (CC_allowNewFilters == null || CC_allowNewFilters)) {
			var columnSel = EBC_GetSelectByName(row, 'Column');
			if (columnSel.value != '' && columnSel.value != '...') {
				EBC_AddEmptyRow(row);
			}
		}
		CC_CheckShowReportParameters(EBC_GetParentTable(row));
	}
}

function CC_CheckShowReportParameters(filteTable) {
	if (filteTable == null)
		return;
	var showReportParamTable = document.getElementById(filteTable.id + '_ShowReportParametersTable');
	if (showReportParamTable == null)
		return;
	var body = filteTable.tBodies[0];
	var rowCount = body.rows.length;
	var showParams = false;
	if (rowCount > 0) {
		for (var i = 0; i < rowCount && !showParams; i++) {
			var row = body.rows[i];
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			if (columnSelect == null)
				continue;
			if (columnSelect.selectedIndex == -1)
				continue;

			if (columnSelect.value == '...')
				continue;
			showParams = true;
		}
	}
	if (showParams) {
		showReportParamTable.style["display"] = "";
	}
	else {
		showReportParamTable.style["display"] = "none";
	}
}

function CC_innerShowHideParams(row, show, visibilityMode) {
	var divElems = row.getElementsByTagName('DIV');
	var divCount = divElems.length;
	for (var i = 0; i < divCount; i++) {
		var elem = divElems[i];
		if (elem.getAttribute("visibilityMode") == visibilityMode) {
			elem.style.display = show ? '' : 'none';
		}
	}
}

function CC_GetShowEditForRow(row) {
	var result = new Array();
	var operatorSel = EBC_GetSelectByName(row, 'Operator');
	if (operatorSel != null) {
		var operatorValue = operatorSel.value;

		var showEdit2 = (operatorValue == 'NotBetween' || operatorValue == 'Between');
		var showEdit1 = (showEdit2 || operatorValue == 'Equals' || operatorValue == 'Like' || operatorValue == 'Equals_Autocomplete'
			|| operatorValue == 'BeginsWith' || operatorValue == 'EndsWith'
			|| operatorValue == 'NotEquals' || operatorValue == 'NotLike' || operatorValue == 'NotEquals_TextArea'
			|| operatorValue == 'LessThan' || operatorValue == 'GreaterThan'
			|| operatorValue == 'LessThanNot' || operatorValue == 'GreaterThanNot'
			|| (!showFieldAsValueDropDown && (operatorValue == 'NotEqualsField' || operatorValue == 'EqualsField' || operatorValue == 'LessThanField' || operatorValue == 'GreaterThanField'))
			|| operatorValue == 'LessThan_DaysOld' || operatorValue == 'GreaterThan_DaysOld' || operatorValue == 'Equals_DaysOld');
		var showEdit3 = (operatorValue == 'Equals_Select' || operatorValue == 'NotEquals_Select' || operatorValue == 'Equals_Multiple' || operatorValue == 'NotEquals_Multiple' ||
						(showFieldAsValueDropDown && (operatorValue == 'EqualsField' || operatorValue == 'LessThanField' || operatorValue == 'GreaterThanField' || operatorValue == 'NotEqualsField')));
		var showEdit4 = (operatorValue == 'InTimePeriod');
		var showEdit5 = (operatorValue == "BetweenTwoDates");
		var showEdit6 = (operatorValue == "EqualsPopup" || operatorValue == "NotEqualsPopup");
		var showEdit7 = (operatorValue == 'Equals_TextArea');
		var showEdit8 = (operatorValue == 'Equals_CheckBoxes');
		var showEdit9 = (operatorValue == "EqualsCalendar");
		var showEdit10 = false;
		var showEdit11 = (operatorValue == "Equals_TreeView" || operatorValue == "NotEquals_TreeView");

		var isListEqauls = operatorValue == "Equals_TextArea";
		var edit1 = EBC_GetElementByName(row, "Edit1Ta", "TEXTAREA");
		jq$(edit1).attr("rows", isListEqauls ? 2 : 1);
		jq$(edit1).css("overflow-y", isListEqauls ? "scroll" : "hidden");
		var isIE = window.ActiveXObject ? true : false;
		var xs = "hidden";
		if (!isIE)
			xs = "auto";
		jq$(edit1).css("overflow-x", isListEqauls ? "" : xs);
		if (navigator.userAgent && navigator.userAgent.indexOf('Firefox') != -1)
			jq$(edit1).css("height", "");

		result.push(showEdit1);
		result.push(showEdit2);
		result.push(showEdit3);
		result.push(showEdit4);
		result.push(showEdit5);
		result.push(showEdit6);
		result.push(showEdit7);
		result.push(showEdit8);
		result.push(showEdit9);
		result.push(showEdit10);
		result.push(showEdit11);
	}
	return result;
}

function CC_ShowHideParamsForRow(row) {
	var showEdit = CC_GetShowEditForRow(row);
	for (var i = 0; i < showEdit.length; i++) {
		CC_innerShowHideParams(row, showEdit[i], i + 1);
	}
}

function CC_OnOperatorChangedHandler(e) {
	if (e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	if (row != null) {
		var edit2Shown = false;
		var divElems = row.getElementsByTagName('DIV');
		var divCount = divElems.length;
		for (var i = 0; i < divCount && !edit2Shown; i++) {
			var elem = divElems[i];
			if (elem.getAttribute("visibilityMode") == 2) {
				edit2Shown = elem.style.display != 'none';
				break;
			}
		}
		CC_ShowHideParamsForRow(row);
		var operatorValue = EBC_GetSelectByName(row, 'Operator').value;
		var valueSel = EBC_GetSelectByName(row, 'SelectValue');
		if (operatorValue == 'Equals_Multiple' || operatorValue == 'NotEquals_Multiple' || operatorValue == 'Equals_CheckBoxes') {
			valueSel.multiple = true;
			valueSel.size = 5;
		}
		else {
			valueSel.size = 1;
			valueSel.multiple = false;

			var edit1 = EBC_GetInputByName(row, "Edit1");
			var oldValue = edit1.value;
			if (!edit2Shown && (operatorValue == 'NotBetween' || operatorValue == 'Between')) {
				var edit2 = EBC_GetInputByName(row, "Edit2");
				edit1.value = '';
				edit2.value = '';
			}
			else if (oldValue.length > 0 && (oldValue.charAt(0) == '['))
				edit1.value = '';

			CC_InitRowWidthAutoComplite(row);

		}
		if (operatorValue == 'Equals_Select' || operatorValue == 'NotEquals_Select' ||
			operatorValue == 'Equals_Multiple' || operatorValue == 'NotEquals_Multiple' ||
			operatorValue == 'Equals_TreeView' || operatorValue == 'NotEquals_TreeView' ||
			operatorValue == 'Equals_CheckBoxes')
			CC_LoadValues(row);

		if (showFieldAsValueDropDown &&
				(operatorValue == 'NotEqualsField' || operatorValue == 'EqualsField' ||
				operatorValue == 'LessThanField' || operatorValue == 'GreaterThanField')) {
			CC_LoadFields(row);
		}
	}
}

function CC_InitRowWidthAutoComplite(row) {
	/*var edit1 = EBC_GetElementByName(row, "Edit1", "TEXTAREA");
	var operatorValue = EBC_GetSelectByName(row, 'Operator').value;
		
	var defaultWidth = jq$(edit1).attr("defaultWidth");
	var autocompliteWidth = jq$(edit1).attr("autocompliteWidth");
	if (defaultWidth == "" || defaultWidth == null)
	{
		var width = jq$(edit1).width();
		defaultWidth = width;
		autocompliteWidth = width;
		jq$(edit1).attr("defaultWidth", defaultWidth);
		jq$(edit1).attr("autocompliteWidth", autocompliteWidth);
	}
	if (operatorValue == "Equals_Autocomplete")
		jq$(edit1).width(autocompliteWidth);
	else
		jq$(edit1).width(defaultWidth);*/
}

function CC_split(val) {
	return val.split(/,\s*/);
}
function CC_extractLast(term) {
	return CC_split(term).pop();
}

function CC_InitTreeView(row) {
	var comboboxTreeMultyselect = jq$(row).find(".comboboxTreeMultyselect");
	if (!comboboxTreeMultyselect || !comboboxTreeMultyselect[0])
		return true;
	CC_InitializeComboTreeView(comboboxTreeMultyselect);
	var fullColumnName = EBC_GetSelectByName(row, 'Column').value;
	var cmd = CC_GetFilterCMD(row);
	cmd += "&forTree=1";
	var operatorName = EBC_GetSelectByName(row, 'Operator').value;
	if (operatorName == "Equals_TreeView") {
		EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, true, function (responseResult) {
			var result = responseResult.substr(2, responseResult.length - 4);
			CC_TreeUpdateValues(row, result.split('", "'));
		});
	}
}


function CC_InitAutoComplite(row) {
	var editForAutoComplite = EBC_GetInputByName(row, "Edit1");
	var operatorObject = EBC_GetSelectByName(row, 'Operator');

	if (editForAutoComplite != null && operatorObject != null) {
		var name = editForAutoComplite.getAttribute("name");
		var id = editForAutoComplite.getAttribute("id");
		var value = editForAutoComplite.value;
		var parent = editForAutoComplite.parentNode;
		parent.innerHTML = "";
		var referenceTextArea = jq$(jq$("input[name$='Iz-TextArea-ReferenceControl']")[0]).clone()[0];
		if (referenceTextArea) {
		}
		else {
			var edit2 = EBC_GetInputByName(row, "Edit2");
			referenceTextArea = document.createElement("INPUT");
			jq$(referenceTextArea).attr("style", jq$(edit2).attr("style"));
			referenceTextArea.setAttribute('type', 'text');
			//referenceTextArea.setAttribute('style','width:300px');
			//referenceTextArea.setAttribute('wrap','off');
			//referenceTextArea.setAttribute('style','OVERFLOW-X: auto; OVERFLOW-Y: hidden; height: 22px; vertical-align: top; resize: none');
			//referenceTextArea.setAttribute('cols', '1000');
			//referenceTextArea.setAttribute('rows', '1');
			referenceTextArea.setAttribute('onchange', 'javascript:CC_ValueChanged(this);');
		}
		referenceTextArea.setAttribute('name', name);
		referenceTextArea.setAttribute('id', id);
		referenceTextArea.value = value;
		jq$(parent).append(referenceTextArea);

		var edit2 = EBC_GetInputByName(row, "Edit2");
		if (edit2 != null) {
			jq$(referenceTextArea).css('font-family', jq$(edit2).css('font-family')).css('font-size', jq$(edit2).css('font-size'));
		}


		var browser = jq$.browser;
		if (browser.msie) {
			var browserVersion = 1 * browser.version;
			if (browserVersion < 9)
				return;
		}
		jq$(referenceTextArea).autocomplete({
			source: function (req, responeFunction) {
				var currentRow = EBC_GetRow(referenceTextArea);
				var operatorValue = EBC_GetSelectByName(currentRow, 'Operator').value;
				if (operatorValue == 'Equals_Autocomplete') {
					var possibleText = CC_extractLast(req.term);

					var fullColumnName = EBC_GetSelectByName(currentRow, 'Column').value;
					if (fullColumnName != '' && fullColumnName != '...') {
						var cmd = CC_GetFilterCMD(currentRow);
						cmd += "&possibleValue=" + possibleText.replace('&', '%26');
						EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, true, function (responseResult) {
							var options = jq$(responseResult);
							var cnt = options.length;
							var result = new Array();
							for (var i = 0; i < cnt; i++) {
								var text = options[i].value;
								if (text != null && text != "" && text != "...")
									result.push(text);
							}
							responeFunction(result);
						});
					}
					else {
						responeFunction("");
					}
				}
				else {
					responeFunction("");
				}
			},
			search: function () {
				var term = CC_extractLast(this.value);
				if (term.length < 1) {
					return false;
				}
			},
			focus: function () {
				return false;
			},
			select: function (event, ui) {
				var terms = CC_split(this.value);
				terms.pop();
				terms.push(ui.item.value);
				this.value = terms.join(", ");
				return false;
			}
		});
	}
}

function CC_OnFieldsListChangedHandler(id, fields) {
	EBC_PopulateDescriptions(fields);
	CC_OnTableListChangedHandler(id, tablesSave[id], true);
}

function CC_OnFieldsListInitialized(id, fields) {
	if (CC_Initialized == 'undefined' || CC_Initialized == null || CC_Initialized == false) {
		setTimeout(function () { CC_OnFieldsListInitialized(id, fields); }, 100);
		return;
	}

	EBC_PopulateDescriptions(fields);

	table = document.getElementById(id);
	jq$(table).find('tr').each(function () {
		CC_ShowHideParamsForRow(this);
	});
}

function CC_IsFirstTimeOperatorUpdated() {
	var result = CC_FirstTimeOperatorUpdated;
	CC_FirstTimeOperatorUpdated = false;
	return result;
}

function CC_Init(id, s, allowNewFilters, dateFormatString) {
	var eqInputs = document.getElementsByName(id + "_equalsDateJQ");
	if (dateFormatString)
		jq$(eqInputs).datepicker({ dateFormat: dateFormatString });
	else
		jq$(eqInputs).datepicker();
	var startInputs = document.getElementsByName(id + "_bcStartDateJQ");
	if (dateFormatString)
		jq$(startInputs).datepicker({ dateFormat: dateFormatString });
	else
		jq$(startInputs).datepicker();
	var endInputs = document.getElementsByName(id + "_bcEndDateJQ");
	if (dateFormatString)
		jq$(endInputs).datepicker({ dateFormat: dateFormatString });
	else
		jq$(endInputs).datepicker();
    var izDiv = document.getElementById('iz-ui-datepicker-div');
    if (typeof izDiv != 'undefined' && izDiv != null)
	    izDiv.style.display = 'none';
	showFieldAsValueDropDown = s;
	CC_FirstTimeOperatorUpdated = true;
	CC_allowNewFilters = allowNewFilters;
	EBC_RegisterControl(id);
	EBC_SetData('@CC/Empty', '<option value=\'...\'>...</option>');
	if (cc_paths[id] != null)
		EBC_SetData(cc_paths[id].path + cc_paths[id].options, '<option value=\'...\'>...</option>');

	table = document.getElementById(id);
	EBC_RegisterRowInsertHandler(table, CC_InitNewRow);
	EBC_RegisterRowRemoveHandler(table, CC_RemoveRow);
	var body = table.tBodies[0];
	var count = body.rows.length;
	for (var i = 0; i < count; i++) {
		CC_InitAutoComplite(body.rows[i]);
		CC_InitTreeView(body.rows[i]);
		CC_InitRowWidthAutoComplite(body.rows[i]);
	}
	EBC_RegiserForUnusedRowsRemoving(table);
	CC_Initialized = true;
}

function CC_ButtonFrom_OnClick(event, cf, pf) {
	if (cf.get_popUpShowing()) {
		cf.hide();
	}
	else {
		cf.setSelectedDate(pf.getSelectedDate());
		cf.show();
	}
}

function CC_ButtonFrom_OnMouseUp(event, cf, pf) {
	if (cf.get_popUpShowing()) {
		event.cancelBubble = true;
		event.returnValue = false;
		return false;
	}
	else {
		return true;
	}
}

function CC_ButtonTo_OnClick(event, ct, pt) {
	if (ct.get_popUpShowing()) {
		ct.hide();
	}
	else {
		ct.setSelectedDate(pt.getSelectedDate());
		ct.show();
	}
}

function CC_ButtonTo_OnMouseUp(event, ct, pt) {
	if (ct.get_popUpShowing()) {
		event.cancelBubble = true;
		event.returnValue = false;
		return false;
	}
	else {
		return true;
	}
}

var wasEqualsPopupEvent;

function CC_ShowPopupFilter(e) {
	wasEqualsPopupEvent = e;
	if (e) ebc_mozillaEvent = e;
	var row = EBC_GetRow();
	var columnSel = EBC_GetSelectByName(row, 'Column');
	if (columnSel != null && columnSel.value != '' && columnSel.value != '...') {
		ShowLoading();
		var cmd = CC_GetFilterCMD(row);
		EBC_LoadData("ExistentPopupValuesList", "columnName=" + columnSel.value + cmd, null, false, CC_ShowPopupFilterResponse);
	}
}

var CC_CurrentRowForCustomFilterPage = null;

function CC_CustomFilterPageValueReceived() {
	var valueEditId = CC_CurrentRowForCustomFilterPage.parentNode.parentNode.id + "_EditValueId";
	var valueEdit = document.getElementById(valueEditId);
	var valueField = EBC_GetInputByName(CC_CurrentRowForCustomFilterPage, "Edit1");
	valueField.value = valueEdit.value;
}

function CC_ShowPopupFilterResponse(data) {
	if (data.indexOf("###USEPAGE###") != -1) {
		var row = EBC_GetRow(wasEqualsPopupEvent);
		CC_CurrentRowForCustomFilterPage = row;
		var columnEditId = row.parentNode.parentNode.id + "_EditColumnId";
		var columnEdit = document.getElementById(columnEditId);
		columnEdit.value = EBC_GetSelectByName(row, 'Column').value;
		var valueEditId = row.parentNode.parentNode.id + "_EditValueId";
		var valueEdit = document.getElementById(valueEditId);
		valueEdit.value = EBC_GetInputByName(row, "Edit1").value;
		var file = data.substring(13, data.length - 3);
		hm();
		ShowDialog("<iframe src=\"" + file + "?valueeditid=" + valueEditId + "&columneditid=" + columnEditId + "\" name=\"CustomAspx\" width=\"290\" height=\"530\"></iframe>");
		return;
	}

	var s = data.substring(0, 3);
	if (s == "url") {
		// loading url
		var url = data.substring(4, data.length - 4);

	}
	else {
		var row = EBC_GetRow(wasEqualsPopupEvent);
		var value = EBC_GetInputByName(row, "Edit1").value;
		var values = value.split(",");

		var genHtml = "<table id='AdHocPopupFilerTable'><tr><td>" + data + "</td></tr>";
		genHtml += "<tr><td align='center'>";
		genHtml += "<input type='button' name='" + row.parentNode.parentNode.id + "_Popup_Ok' value='" + jsResources.OK + "' onclick='CC_PopupFiltersConfirm(true)'>&nbsp;";
		genHtml += "<input type='button' name='" + row.parentNode.parentNode.id + "_Popup_Cancel' value='" + jsResources.Cancel + "' onclick='CC_PopupFiltersConfirm(false)'>";
		genHtml += "</td></tr></table>";

		/*for (var i=0;i<values.length;i++)
		{
			var currentValue = values[i];
			// seraching in data
			var element = EBC_GetElementByName(data, currentValue);
			element.checked = true;
		}*/
		hm();
		ShowDialog(genHtml);
		if (values.length > 0) {
			var table = document.getElementById('AdHocPopupFilerTable');
			table.style.textAlign = 'left';
			var parentRow = table.rows[0];
			var subtable = parentRow.firstChild.firstChild;
			var rows = subtable.rows;

			for (var i = 0; i < values.length; i++) {
				var curentValue = values[i];
				var currentValueReplaced = curentValue.replace('||', ',');
				while (curentValue != currentValueReplaced) {
					curentValue = currentValueReplaced;
					currentValueReplaced = curentValue.replace('||', ',');
				}

				for (var j = 0; j < rows.length; j++) {
					for (var k = 0; k < rows[j].cells.length; k++) {
						var checkbox = rows[j].cells[k].firstChild;
						if (checkbox.nextSibling != null && checkbox.nextSibling.nodeValue == curentValue || checkbox.nextSibling == null && curentValue == "") {
							checkbox.checked = true;
						}
					}
				}
			}
		}
	}
}

function CC_PopupFiltersConfirm(act) {
	hm();
	if (act) {
		var row = EBC_GetRow(wasEqualsPopupEvent);
		if (row == null)
			return;
		var edit1 = EBC_GetInputByName(row, "Edit1");
		if (edit1 == null)
			return;


		var table = document.getElementById('AdHocPopupFilerTable');
		var parentRow = table.rows[0];
		var subtable = parentRow.firstChild.firstChild;
		var rows = subtable.rows;
		var values = '';
		for (var i = 0; i < rows.length; i++) {
			for (var j = 0; j < rows[i].cells.length; j++) {
				var checkbox = rows[i].cells[j].firstChild;
				if (checkbox.checked) {
					var nextNode = checkbox.nextSibling != null ? checkbox.nextSibling.nodeValue : "";
					var nextNodeWithReplaced = nextNode.replace(',', '||');
					while (nextNode != nextNodeWithReplaced) {
						nextNode = nextNodeWithReplaced;
						nextNodeWithReplaced = nextNode.replace(',', '||');
					}
					values += nextNode + ',';
				}
			}
		}
		if (values.length > 0)
			values = values.substring(0, values.length - 1);
		edit1.value = values;
		CC_ValueChanged(row);
	}
}

function CC_GetDateByString(val) {

}

function CC_GetLastDayInMonth(year, month) {
	var date = new Date(year, month, 31);
	var i = 30;
	while (date.getMonth() != month && i > 27) {
		date.setMonth(month);
		date.setDate(i);
		i--;
	}
	return (i + 1);
}

function CC_GetSliderTimePeriodValue(e, name, value, sliderStep) {
	var table = EBC_GetParentTable(e);
	var row = table.rows[0];
	var input = EBC_GetInputByName(row, name);
	var oldValue = new Date(input.value);
	var newDate = new Date(value);
	if (typeof moment != 'undefined' && typeof HORR_shortDateFormat != 'undefined') {
		oldValue = moment(input.value, HORR_shortDateFormat)._d;
		newDate = moment(value, HORR_shortDateFormat)._d;
	}

	if (isNaN(oldValue.getDate())) {
		oldValue = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
		if (name == 'SliderValueTo') {
			switch (sliderStep) {
				case "Day":
					break;
				case "Month":
					oldValue.setDate(CC_GetLastDayInMonth(newDate.getFullYear(), newDate.getMonth()));
					break;
				case "Quarter":
					{
						var month = oldValue.getMonth();
						month = month + (3 - ((month + 1) % 3)) % 3;
						oldValue.setMonth(month);
						oldValue.setDate(CC_GetLastDayInMonth(oldValue.getFullYear(), month));
					}
					break;
				case "Year":
					oldValue.setMonth(11);
					oldValue.setDate(31);
					break;
			}
		}
	}
	var resultDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
	switch (sliderStep) {
		case "Day":
			break;
		case "Month":
			if (oldValue.getDate() == CC_GetLastDayInMonth(oldValue.getFullYear(), oldValue.getMonth())) {
				resultDate.setDate(CC_GetLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
			}
			else {
				resultDate.setDate(oldValue.getDate());
				if (resultDate.getMonth() != newDate.getMonth()) {
					resultDate.setMonth(newDate.getMonth());
					resultDate.setDate(CC_GetLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
				}
			}
			break;
		case "Quarter":
			{
				var day = oldValue.getDate();
				var monthDiv = oldValue.getMonth() % 3;
				var month = resultDate.getMonth() + monthDiv;

				if (day == CC_GetLastDayInMonth(oldValue.getFullYear(), oldValue.getMonth())) {
					day = CC_GetLastDayInMonth(resultDate.getYear(), month);
				}
				resultDate.setMonth(month);
				resultDate.setDate(day);
			}
			break;
		case "Year":
			resultDate.setMonth(oldValue.getMonth());
			if (oldValue.getDate() == CC_GetLastDayInMonth(oldValue.getFullYear(), oldValue.getMonth())) {
				resultDate.setDate(CC_GetLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
			}
			else {
				resultDate.setDate(oldValue.getDate());
				if (resultDate.getMonth() != oldValue.getMonth()) {
					resultDate.setMonth(oldValue.getMonth());
					resultDate.setDate(CC_GetLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
				}
			}
			break;
	}
	if (typeof moment != 'undefined' && typeof HORR_shortDateFormat != 'undefined')
		input.value = moment(resultDate).format(HORR_shortDateFormat);
	else
		input.value = resultDate.format("m/d/Y");
}

function CC_SetSliderTimePeriodValue(e, name, value) {
	var table = EBC_GetParentTable(e);
	var row = table.rows[0];
	var editValue;
	switch (name) {
		case "SliderValueFrom":
			editValue = EBC_GetSelectByName(row, "value1");
			break;
		case "SliderValueTo":
			editValue = EBC_GetSelectByName(row, "value2");
			break;
	}
	var dateValue = new Date(value);
	if (isNaN(dateValue.getDate())) {
		jq$(editValue).change();
		return;
	}

	var options = editValue.options;
	var found = false;
	for (var i = 0; i < options.length && !found; i++) {
		var currentDate = new Date(options[i].value);
		found = (currentDate > dateValue);
		if (found) {
			var j = i - 1;
			if (j < 0)
				j = 0;
			if (j < options.length) {
				jq$(options[j]).attr('selected', 'selected');
				jq$(editValue).change();
			}
		}
	}
	if (!found && options.length > 1) {
		jq$(options[options.length - 1]).attr('selected', 'selected');
		jq$(editValue).change();
	}
}

CC_InitializeComboTreeView = function (mainControl) {
	mainControl.addClass("comboboxTreeMultyselect");
	mainControl.each(function () {
		var currentControl = jq$(this);
		currentControl.empty();

		var combobox = jq$(document.createElement("div")).addClass("textArea");
		currentControl.append(combobox);

		var selectedValues = jq$(document.createElement("div")).addClass("selectedValues").addClass("hiddenTree");
		currentControl.append(selectedValues);

		var tree = jq$(document.createElement("div")).addClass("tree").addClass("hiddenTree");
		currentControl.append(tree);

		var search = jq$(document.createElement("input")).addClass("search");
		combobox.append(search);

		combobox.click(function () {
			search.focus();
		});

		search.keyup(function () {
			var realText = search.val();
			var text = realText.toLowerCase();

			var list = new Array();
			tree.find(".node").each(function () {
				var node = jq$(this);
				if (node.hasClass("haschild")) {
					node.addClass("searchHide");
				}
				else {
					var val = node.attr("value").toLowerCase();
					var index = val.indexOf(text);
					if (index > -1) {
						list.push(node);
					}
					else {
						node.addClass("searchHide");
					}
				}
			});
			for (var i = 0; i < list.length; i++) {
				var parent = list[i].parent();
				while (!parent.hasClass("tree")) {
					parent.removeClass("searchHide");
					parent = parent.parent();
				}
			}

			tree.find(".hiddenBySearch").each(function () {
				var node = jq$(this);
				if (!node.hasClass("searchHide"))
					node.removeClass("hiddenBySearch");
			});

			tree.find(".searchHide").addClass("hiddenBySearch").removeClass("searchHide");

			tree.find(".node").each(function () {
				var node = jq$(this);
				if (!node.hasClass("hiddenBySearch")) {
					var textToReplace = node.attr("text");
					var resultText = textToReplace;
					var lowerText = textToReplace.toLowerCase();

					var index = lowerText.indexOf(text);
					if (index > -1) {
						resultText = textToReplace.substring(0, index);
						resultText += "<span class='highlight'>" + textToReplace.substring(index, index + realText.length) + "</span>";
						resultText += textToReplace.substring(index + realText.length);
					}
					node.find("> span.text").html(resultText);
				}
				else {
					node.find("> span.text").html(node.attr("text"));
				}
			});


			if (tree.hasClass("hiddenTree"))
				tree.removeClass("hiddenTree");

		});


		var showHide = jq$(document.createElement("div")).addClass("showHide");
		showHide.click(function () {
			CC_ClickShowHide(tree);
		});
		combobox.append(showHide);

		jq$(document).click(function (e) {
			var target = jq$(e.target);
			if (target.hasClass("chunkX")) return;
			if (target.closest(tree).length != 0) return;
			if (target.closest(combobox).length != 0) return;
			tree.addClass("hiddenTree");
		});
	});
};

var CC_appendItem = function (node, itemText, prevText, tree, selectedValues, row) {
	var itemParts = itemText.split('"-"');
	itemText = itemParts[0];
	var itemValue = itemParts.length > 1 ? itemParts[1].substring(0, itemParts[1].length) : itemText;
	var index = itemText.indexOf("|");
	var text = itemText;
	var subNode = "";
	if (index > -1) {
		text = itemText.substr(0, index);
		subNode = itemText.substr(index + 1);
	}

	var value = text;
	if (prevText != "")
		value = prevText + "|" + value;

	var newNode = node.find("> .node[value='" + value.replace(/'/g, "''") + "']");
	if (newNode.length == 0) {
		newNode = jq$(document.createElement("div")).addClass("node").attr("value", value).attr("text", text).attr("text-value", itemValue);
		if (subNode != "")
			newNode.addClass("haschild");
		newNode.html('<div class="collapse" ></div><input type="checkbox" class="checkbox"/><span class="text">' + text + "</span>");
		node.append(newNode);

		newNode.find("> .collapse").click(function () {
			if (newNode.hasClass("haschild")) {
				if (newNode.hasClass("collapsed")) {
					newNode.removeClass("collapsed");
				} else {
					newNode.addClass("collapsed");
				}
			}
		});

		newNode.find("> .checkbox").click(function () {
			var isChecked = jq$(this).is(':checked');
			CC_CheckUnchekChild(newNode.find("> .node"), isChecked);
			if (!isChecked) {
				var parent = newNode.parent();
				while (parent.hasClass("node")) {
					parent.find("> .checkbox").prop('checked', isChecked);
					parent = parent.parent();
				}
			}
			CC_CheckStatusWasChanged(selectedValues, tree.find("> .node"), tree, row);
		});

	}

	if (subNode != "") {
		CC_appendItem(newNode, subNode + "\"-\"" + itemValue, value, tree, selectedValues, row);
	}

};

CC_CheckUnchekChild = function (element, check) {
	element.find("> .checkbox").prop('checked', check);
	element.find("> .node").each(function () {
		CC_CheckUnchekChild(jq$(this), check);
	});
};

CC_CheckStatusWasChanged = function (selectedValues, nodes, tree, row) {
	selectedValues.empty();
	nodes.each(function () {
		CC_FillCombobox(selectedValues, jq$(this), row);
	});

	var strVal = "";
	selectedValues.find(".cValid").each(function () {
		strVal += ", " + jq$(this).attr("value");
	});
	strVal = strVal.substr(2);
	if (strVal == "")
		selectedValues.addClass("hiddenTree");
	else
		selectedValues.removeClass("hiddenTree");

	jq$(row).find("div[visibilitymode=1] input").attr("value", strVal);
};

CC_ClickShowHide = function (tree) {
	if (tree.hasClass("hiddenTree"))
		tree.removeClass("hiddenTree");
	else
		tree.addClass("hiddenTree");
};

CC_FillCombobox = function (selectedValues, node, row) {
	if (node.find("> .checkbox").is(':checked')) {

		var hasChild = node.hasClass("haschild");

		var text = node.attr("text");
		var val = node.attr("value");

		if (text == null || text == "" || val == "" || val == null)
			return;


		var cValid = jq$(document.createElement("a"));

		var displayTesxt = val.replace(/\|/g, "\\");
		if (displayTesxt.length > 50) {
			var newText = "...\\" + text;
			var len = newText.length;
			var i = 0;
			var s = "";
			while (len < 40) {
				s += displayTesxt[i];
				i++;
				len++;
			}
			displayTesxt = s + newText;
		}

		if (hasChild)
			displayTesxt += "\\";

		cValid.addClass("cValid");
		cValid.attr("value", val);
		cValid.html('<nobr>' + displayTesxt + '<img src="rs.aspx?image=icon-blue-x.gif" class="chunkX"></nobr>');
		selectedValues.append(cValid);
		cValid.find(".chunkX").click(function () {
			cValid.remove();
			node.find("> .checkbox").prop("checked", false);
			CC_CheckUnchekChild(node, false);

			var strVal = "";
			selectedValues.find(".cValid").each(function () {
				strVal += ", " + jq$(this).attr("value");
			});
			strVal = strVal.substr(2);
			jq$(row).find("div[visibilitymode=1] input").attr("value", strVal);

			if (strVal == "")
				selectedValues.addClass("hiddenTree");
			else
				selectedValues.removeClass("hiddenTree");
		});
	} else {
		node.find("> .node").each(function () {
			CC_FillCombobox(selectedValues, jq$(this), row);
		});
	}
};

CC_TreeUpdateValues = function (row, values) {

	var selectedValues = jq$(row).find("div[visibilitymode=1] input").attr("value");

	var tree = jq$(row).find(".comboboxTreeMultyselect .tree");
	var selectedValuesControl = jq$(row).find(".comboboxTreeMultyselect .selectedValues");
	tree.empty();
	for (var i = 0; i < values.length; i++) {
		CC_appendItem(tree, values[i], "", tree, selectedValuesControl, row);
	}

	var valueList = selectedValues.split(", ");
	for (var i = 0; i < valueList.length; i++)
		tree.find('.node[value="' + valueList[i] + '"]').each(function () {
			CC_CheckUnchekChild(jq$(this), true);
		});
	CC_CheckStatusWasChanged(selectedValuesControl, tree.find("> .node"), tree, row);
	tree.find(".node .collapse").click();
};