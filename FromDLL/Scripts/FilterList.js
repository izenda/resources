/* Copyright (c) 2005 Izenda, Inc.

_____________________________________________________________________
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
				rows = jq$(table.tBodies[0]).find("tr");

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
						var additionalOperators = document.getElementsByName(id + '_ConditionOperator');

						for (var i = 0; i < tableSels.length; i++) {
								var value = new Array();
								value.table = tableSels[i].value;
								if (value.table != null && value.table != '...') {
									value.alias = tableAliases[i].value;
										if (i > 0) {
												value.column = columnSels[i].value;
												value.rightColumn = rightColumnSel[i].value;
												value.join = joinSel[i].value;
												if (joinSel[i].getAttribute('additional') == 'true' && additionalOperators != null)
													value.additionalOperator = additionalOperators[i].value;
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

function CC_GetSectionRowIndex(row) {
	return jq$(row).prevAll().length;
}

function CC_CaCalDateChanged(elem) {
		var parent = jq$("#" + elem);
		if (!parent)
				return;

		var row = EBC_GetRow(parent[0]);
		var table = EBC_GetParentTable(row);
		var rows = jq$(table.tBodies[0]).find("tr");

		for (var i = CC_GetSectionRowIndex(row) + 1; i < rows.length; i++) {
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
		var prevRow = jq$(parentTable.tBodies[0]).find("tr")[i];
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
					var popupVal = EBC_GetInputByName(prevRow, "popup_value_handler").value;
					if (popupVal != '...')
						value.val1 = popupVal;
				}
				if (showEditForRow.length > 7 && showEditForRow[7]) {
					var checkBoxSelect = EBC_GetElementByName(prevRow, "CheckBoxSelectInner", "div");
					value.val1 = null;
					if (checkBoxSelect)
						jq$(checkBoxSelect).find(":checked").each(function (i) {
							if (i > 0)
								value.val1 += ",";
							else
								value.val1 = "";
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
	var nextFilters = CC_GetFiltersInRange(row, CC_GetSectionRowIndex(row), null);
	return prevFilters.concat(nextFilters);
}

function CC_GetPrewRows(row) {
	return CC_GetFiltersInRange(row, 0, CC_GetSectionRowIndex(row));
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
								if (tables[i].additionalOperator != null)
									cmd = cmd + "&" + "aop" + i + "=" + tables[i].additionalOperator;
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
								if (filters[i].Operator == "BetweenTwoDates" || filters[i].Operator == "NotBetweenTwoDates" || filters[i].Operator == "EqualsCalendar" || filters[i].Operator == "NotEqualsCalendar") {
										v1 = CC_CropDate(v1);
								}
								cmd = cmd + "&" + "fvl" + i + "=" + encodeURIComponent(v1);
						}
						if (filters[i].val2 != null) {
								var v2 = filters[i].val2.replace('&', '%26');
								if (filters[i].Operator == "BetweenTwoDates" || filters[i].Operator == "NotBetweenTwoDates" || filters[i].Operator == "EqualsCalendar" || filters[i].Operator == "NotEqualsCalendar") {
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
		if (fullColumnName != '' && fullColumnName != '...') {
			var cmd = CC_GetFilterCMD(row);
			cmd += "&resultType=json";
			if (operatorName == "Equals_CheckBoxes")
				EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, null,
					function (responseResult) {
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

							var control = jq$(valueCheckBoxes);
							control.html("");
							jq$.each(responseResult[0].options, function (i, item) {
								if (item.value == null || item.value == '...')
									return;
								var label = jq$('<label>').css('display', 'block');
								label.append(jq$('<input>', {
									type: 'checkbox',
									value: item.value,
									onclick: 'CC_OnCheckBoxValueChangedHandler(this)'
								}));
								label.append(item.text);
								control.append(label);
							});

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
						CC_TreeUpdateValues(row, responseResult[0].options);
					});
			}
			else
				EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, null,
					function (responseResult) {
						var value = EBC_GetSelectValue(valueSel);
						var control = jq$(valueSel);
						control.html("");
						jq$.each(responseResult[0].options, function (i, item) {
							control.append(jq$('<option>', {
								value: item.value,
								text: jq$('<textarea />').html(item.text).text()
							}));
						});
						EBC_SetSelectedIndexByValue(valueSel, value);
					});
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
	var rows = jq$(table.tBodies[0]).find("tr");

	var startRow = CC_GetSectionRowIndex(row) + 1;

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
	var row = EBC_GetRow(e);
	CC_UpdateFilterRows(row);
}

function CC_RemoveRow(id) {
	var table = document.getElementById(id);
	CC_RenumFilters(table);
	if (table != null) {
		var rows = jq$(table.tBodies[0]).find("tr");
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
	var somethingChecked = false;
	jq$(checkList).find("input:checked").each(function (i) {
		somethingChecked = true;
		if (concatValue == "")
			concatValue = jq$(this).val();
		else
			concatValue += "," + jq$(this).val();
	});
	jq$(edit).val(concatValue);
	if (!somethingChecked)
		concatValue = "...";
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
	CC_InitAutoComplete(row);
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
	var rows = jq$(table.tBodies[0]).find("tr");
	var count = rows.length;
	for (var i = 0; i < count; i++) {
		var filterNumber = EBC_GetInputByName(rows[i], 'FilterNumber');
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
		var dataTypeGroup = null;
		var colFullName = null;
		if (columnSel.selectedIndex != -1) {
			dataType = columnSel.options[columnSel.selectedIndex].getAttribute("dataType");
			dataTypeGroup = columnSel.options[columnSel.selectedIndex].getAttribute("dataTypeGroup");
			colFullName = columnSel.options[columnSel.selectedIndex].value;
		}
		if (dataType == null || dataType == "Unknown")
			dataType = "";
		if (dataTypeGroup == null)
			dataTypeGroup = "";
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

		var formatSel = EBC_GetSelectByName(row, 'DisplayFormat');
		if (formatSel != null)
			EBC_LoadData('FormatList', 'typeGroup=' + dataTypeGroup + '&onlySimple=true&forceSimple=true', formatSel);
	}
}

function CC_CheckShowReportParameters(filteTable) {
	if (filteTable == null)
		return;
	var showReportParamTable = document.getElementById(filteTable.id + '_ShowReportParametersTable');
	if (showReportParamTable == null)
		return;
	var rows = jq$(filteTable.tBodies[0]).find("tr");
	var rowCount = rows.length;
	var showParams = false;
	if (rowCount > 0) {
		for (var i = 0; i < rowCount && !showParams; i++) {
			var row = rows[i];
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
		var showEdit5 = (operatorValue == "BetweenTwoDates" || operatorValue == "NotBetweenTwoDates");
		var showEdit6 = (operatorValue == "EqualsPopup" || operatorValue == "NotEqualsPopup");
		var showEdit7 = (operatorValue == 'Equals_TextArea');
		var showEdit8 = (operatorValue == 'Equals_CheckBoxes');
		var showEdit9 = (operatorValue == "EqualsCalendar" || operatorValue == "NotEqualsCalendar");
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
			else if (oldValue == '...')
				edit1.value = '';
			else if (oldValue == '' && operatorValue == 'EqualsPopup')
				edit1.value = '...';

			if (operatorValue == "Equals_Autocomplete")
				CC_InitAutoComplete(row);
			else
				CC_RemoveAutocomplete(row);
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
	cmd += "&forTree=1&resultType=json";
	var operatorName = EBC_GetSelectByName(row, 'Operator').value;
	if (operatorName == "Equals_TreeView") {
		EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, true,
			function (responseResult) {
				CC_TreeUpdateValues(row, responseResult[0].options);
			});
	}
}

function CC_RemoveAutocomplete(row) {
	var editForAutoComplete = EBC_GetInputByName(row, "Edit1");
	if (editForAutoComplete != null) {
		jq$(editForAutoComplete).tagit('destroy');
		// Manually destroy autocomplete elements because plugin won't do it for some reason
		jq$(editForAutoComplete).removeClass([
				'tagit',
				'ui-widget',
				'ui-widget-content',
				'ui-corner-all',
				'tagit-hidden-field'
		].join(' '));
		var nextElem = jq$(editForAutoComplete).next();
		if (nextElem && nextElem.hasClass('tagit'))
			nextElem.remove();
	}
}

function CC_InitAutoComplete(row) {
	var editForAutoComplete = EBC_GetInputByName(row, "Edit1");
	var operatorObject = EBC_GetSelectByName(row, 'Operator');

	if (editForAutoComplete != null && operatorObject != null) {
		CC_RemoveAutocomplete(row);
		jq$(editForAutoComplete).tagit({
			tagSource: function (req, responeFunction) {
				var currentRow = EBC_GetRow(editForAutoComplete);
				var operatorValue = EBC_GetSelectByName(currentRow, 'Operator').value;
				if (operatorValue == 'Equals_Autocomplete') {
					var possibleText = CC_extractLast(req.term);

					var fullColumnName = EBC_GetSelectByName(currentRow, 'Column').value;
					if (fullColumnName != '' && fullColumnName != '...') {
						var cmd = CC_GetFilterCMD(currentRow);
						cmd += "&possibleValue=" + possibleText.replace('&', '%26') + "&resultType=json";
						EBC_LoadData("ExistentValuesList", "columnName=" + fullColumnName + cmd, null, true, function (responseResult) {
							var result = new Array();
							jq$.each(responseResult[0].options, function (i, item) {
								if (item.value == null || item.value == "" || item.value == '...')
									return;
								result.push(item.value.replaceAll('#||#', ','));
							});
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
			caseSensitive: true,
			allowDuplicates: false,
			singleFieldDelimiter: jsResources.literalComma,
			processValuesForSingleField: function (tags) {
				for (var i = 0; i < tags.length; i++)
					tags[i] = tags[i].replaceAll(',', '#||#');
				return tags;
			},
			processValuesFromSingleField: function (tags) {
				for (var i = 0; i < tags.length; i++)
					tags[i] = tags[i].replaceAll('#||#', ',');
				return tags;
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

function CC_Init(id, s, allowNewFilters, dateFormatString, showTimeInPicker) {
	jq$.datepicker.markerClassName = "hasDateTimePickerJq";
	var eqInputs = document.getElementsByName(id + "_equalsDateJQ");
	var startInputs = document.getElementsByName(id + "_bcStartDateJQ");
	var endInputs = document.getElementsByName(id + "_bcEndDateJQ");
	if (showTimeInPicker) {
		jq$(eqInputs).datetimepickerJq({
			buttonImage: responseServer.ResponseServerUrl + 'image=calendar_icon.png',
			showOn: "both",
			buttonImageOnly: true,
			altRedirectFocus: false,
			showSecond: true,
			timeInput: true,
			dateFormat: dateFormatString
		});
		jq$(startInputs).datetimepickerJq({
			buttonImage: responseServer.ResponseServerUrl + 'image=calendar_icon.png',
			showOn: "both",
			buttonImageOnly: true,
			altRedirectFocus: false,
			showSecond: true,
			timeInput: true,
			dateFormat: dateFormatString
		});
		jq$(endInputs).attr('autoSetEndDay', '1');
		jq$(endInputs).datetimepickerJq({
			buttonImage: responseServer.ResponseServerUrl + 'image=calendar_icon.png',
			showOn: "both",
			buttonImageOnly: true,
			altRedirectFocus: false,
			showSecond: true,
			timeInput: true,
			dateFormat: dateFormatString,
			onClose: function () {
				var enteredDate = jq$(this).datetimepickerJq("getDate");
				if (typeof enteredDate != 'undefined' && enteredDate != null && enteredDate.getHours() + enteredDate.getMinutes() + enteredDate.getSeconds() <= 0) {
					var fixedDate = new Date(enteredDate.getFullYear(), enteredDate.getMonth(), enteredDate.getDate(), 23, 59, 59, 0)
					jq$(this).datetimepickerJq("setDate", fixedDate)
				}
			}
		});
	}
	else {
		jq$(eqInputs).datepicker({
			dateFormat: dateFormatString,
			buttonImage: responseServer.ResponseServerUrl + 'image=calendar_icon.png',
			showOn: "both",
			buttonImageOnly: true
		});
		jq$(startInputs).datepicker({
			dateFormat: dateFormatString,
			buttonImage: responseServer.ResponseServerUrl + 'image=calendar_icon.png',
			showOn: "both",
			buttonImageOnly: true
		});
		jq$(endInputs).datepicker({
			dateFormat: dateFormatString,
			buttonImage: responseServer.ResponseServerUrl + 'image=calendar_icon.png',
			showOn: "both",
			buttonImageOnly: true
		});
	}

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
	var rows = jq$(table.tBodies[0]).find("tr");
	var count = rows.length;
	for (var i = 0; i < count; i++) {
		var operatorValue = EBC_GetSelectByName(rows[i], 'Operator').value;
		if (operatorValue == "Equals_Autocomplete")
			CC_InitAutoComplete(rows[i]);
		else
			CC_RemoveAutocomplete(rows[i]);
		CC_InitTreeView(rows[i]);
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
		ReportingServices.showLoading();
		var cmd = CC_GetFilterCMD(row) + "&resultType=json";
		EBC_LoadData("ExistentPopupValuesList", "columnName=" + columnSel.value + cmd, null, false, CC_ShowPopupFilterResponse);
	}
}

var CC_CurrentRowForCustomFilterPage = null;

function CC_CustomFilterPageValueReceived() {
	var valueEditId = CC_CurrentRowForCustomFilterPage.parentNode.parentNode.id + "_EditValueId";
	var valueEdit = document.getElementById(valueEditId);
	var valueField = EBC_GetInputByName(CC_CurrentRowForCustomFilterPage, "Edit1");
	var popupValueField = EBC_GetInputByName(CC_CurrentRowForCustomFilterPage, "popup_value_handler");
	if (valueField)
		valueField.value = valueEdit.value;
	if (popupValueField)
		popupValueField.value = valueEdit.value;
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
		ReportingServices.showModal("<iframe src=\"" + file + "?valueeditid=" + valueEditId + "&columneditid=" + columnEditId + "\" name=\"CustomAspx\" width=\"290\" height=\"530\"></iframe>");
		return;
	}

	var row = EBC_GetRow(wasEqualsPopupEvent);
	var value = EBC_GetInputByName(row, "popup_value_handler").value;
	var values = value.split(",");

	var table = jq$("<table>");
	var tr = jq$("<tr>");
	var ci = 0;
	jq$.each(data[0].options, function (i, item) {
		if (item.value == null || item.value == '...')
			return;
		if (ci % 3 == 0) {
			table.append(tr);
			tr = jq$("<tr>");
		}
		ci++;
		var td = jq$("<td>");
		var label = jq$('<label>').css('display', 'block');
		label.append(jq$('<input>', {
			type: 'checkbox',
			value: item.value
		}));
		label.append(item.text);
		tr.append(td.append(label));
	});
	table.append(tr);
	data = table.get(0).outerHTML;

	if (values.length > 0) {
		data = ReportingServices.parseElement(data)[0];
		data.id = 'AdHocFilerTable';
		data.style.textAlign = 'left';
		var rows = data.rows;
		for (var i = 0; i < values.length; i++) {
			var curentValue = values[i];
			for (var j = 0; j < rows.length; j++) {
				for (var k = 0; k < rows[j].cells.length; k++) {
					var label = rows[j].cells[k].firstChild;
					var checkbox = label.firstChild;
					if (checkbox.value == curentValue || checkbox.value == null && curentValue == "") {
						checkbox.checked = true;
					}
				}
			}
		}
	}
	ReportingServices.showConfirm(data, CC_PopupFiltersConfirm);
}

function CC_PopupFiltersConfirm(result) {
	if (result == jsResources.OK) {
		var row = EBC_GetRow(wasEqualsPopupEvent);
		if (row == null)
			return;
		var edit1 = EBC_GetInputByName(row, "Edit1");
		var valueHandler = EBC_GetInputByName(row, "popup_value_handler");
		if (edit1 == null || valueHandler == null)
			return;

		var table = document.getElementById('AdHocFilerTable');
		var rows = table.rows;
		var values = '...';
		for (var i = 0; i < rows.length; i++) {
			for (var j = 0; j < rows[i].cells.length; j++) {
				var label = rows[i].cells[j].firstChild;
				var checkbox = label.firstChild;
				if (checkbox.checked) {
					if (values == '...')
						values = '';
					values += checkbox.value + ',';
				}
			}
		}
		if (values && values != '...')
			values = values.substring(0, values.length - 1);
		edit1.value = values;
		valueHandler.value = values;
		CC_ValueChanged(row);
	}
	ReportingServices.hideTip();
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

var CC_appendItem = function (node, itemText, itemValue, prevText, prevValue, tree, selectedValues, row) {
	var iti = itemText.indexOf("|");
	var text = itemText;
	if (iti > -1) {
		text = itemText.substr(0, iti);
	}

	var ivi = itemValue.indexOf("|");
	var value = itemValue;
	if (ivi > -1) {
		var pos = 0;
		var commaSequence = -1;
		while ((commaSequence = value.indexOf("#||#", pos)) > -1 && commaSequence == ivi - 1) {
			pos = commaSequence + 4;
			ivi = value.indexOf("|", pos);
		}
		if (ivi > -1)
			value = value.substr(0, ivi);
	}
	if (prevValue != "")
		value = prevValue + "|" + value;

	var displayText = text;
	if (prevText != "") {
		displayText = prevText + "|" + text;
	}

	var subNodeExist = iti > -1 && ivi > -1;

	var newNode = node.find("> .node[value='" + value.replace(/'/g, "''") + "']");
	if (newNode.length == 0) {
		newNode = jq$(document.createElement("div")).addClass("node").attr("value", value).attr("text", text).attr("text-value", displayText);
		if (subNodeExist)
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
	if (subNodeExist) {
		CC_appendItem(newNode, itemText.substr(iti + 1), itemValue.substr(ivi + 1), displayText, value, tree, selectedValues, row);
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
		var textValue = node.attr("text-value");

		if (text == null || text == "" || val == "" || val == null)
			return;

		var cValid = jq$(document.createElement("a"));

		var displayText = textValue.replace(/\|/g, "\\");
		if (displayText.length > 50) {
			var newText = "...\\" + text;
			var len = newText.length;
			var i = 0;
			var s = "";
			while (len < 40) {
				s += displayText[i];
				i++;
				len++;
			}
			displayText = s + newText;
		}

		if (hasChild)
			displayText += "\\";

		cValid.addClass("cValid");
		cValid.attr("value", val);
		cValid.html('<nobr>' + displayText + '<img src="rs.aspx?image=icon-blue-x.gif" class="chunkX"></nobr>');
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

CC_TreeUpdateValues = function (row, options) {

	var selectedValues = jq$(row).find("div[visibilitymode=1] input").attr("value");

	var tree = jq$(row).find(".comboboxTreeMultyselect .tree");
	var selectedValuesControl = jq$(row).find(".comboboxTreeMultyselect .selectedValues");
	tree.empty();
	for (var i = 0; i < options.length; i++) {
		CC_appendItem(tree, options[i].text, options[i].value, "", "", tree, selectedValuesControl, row);
	}

	var valueList = selectedValues.split(", ");
	for (var i = 0; i < valueList.length; i++)
		tree.find('.node[value="' + valueList[i] + '"]').each(function () {
			CC_CheckUnchekChild(jq$(this), true);
		});
	CC_CheckStatusWasChanged(selectedValuesControl, tree.find("> .node"), tree, row);
};

function CC_ShowReportParametersChanged() {
	var targetCheckbox = jq$('input[name$="_ShowReportParameters"]');
	var showFormat = targetCheckbox != null && targetCheckbox.length > 0 && targetCheckbox[0].checked;
	if (showFormat) {
		jq$('select[name$="_DisplayFormat"]').parent().show();
		jq$('th[name="filter-format-header"]').show();
	} else {
		jq$('select[name$="_DisplayFormat"]').parent().hide();
		jq$('th[name="filter-format-header"]').hide();
	}
}
