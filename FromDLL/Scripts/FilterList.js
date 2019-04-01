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

(function (ns) {
	ns.pages = ns.pages || {};
	ns.pages.designer = ns.pages.designer || {};

	ns.pages.designer.context = ns.pages.designer.context || {};

	var context = ns.pages.designer.context;
	context.qac_works = ns.getValue(context.qac_works, false);
	context.qac_requests = ns.getValue(context.qac_requests, 0);
	context.qac_timers = ns.getValue(context.qac_timers, 0);

	context.tableListById = ns.getValue(context.tableListById, {});
	context.descriptions = ns.getValue(context.descriptions, []);

	var tableListOnChangeLastCallParams = new Array();

	var dataKeys = {};
	var oldDataKey = null;
	var isFieldListInitialized = false;
	var allowNewFiltersValue;
	var showFieldAsValueDropDown = null;

	var Operators = {
		Blank: 'Blank',
		NotBlank: 'NotBlank',
		UsePreviousOR: 'UsePreviousOR',

		/*
		 * Boolean
		 */
		True: 'True',
		False: 'False',

		/*
		 * Comparison
		 */
		LessThan: 'LessThan',
		GreaterThan: 'GreaterThan',
		Between: 'Between',
		NotLessThan: 'LessThanNot',
		NotGreaterThan: 'GreaterThanNot',
		NotBetween: 'NotBetween',

		/*
		 * Date & Time
		 */
		EqualsCalendar: 'EqualsCalendar',
		NotEqualsCalendar: 'NotEqualsCalendar',
		BetweenCalendar: 'BetweenTwoDates',
		NotBetweenCalendar: 'NotBetweenTwoDates',
		InTimePeriod: 'InTimePeriod',
		LessThanDaysOld: 'LessThan_DaysOld',
		GreaterThanDaysOld: 'GreaterThan_DaysOld',
		EqualsDaysOld: 'Equals_DaysOld',

		/*
		 * Equivalence
		 */
		Equals: 'Equals',
		EqualsList: 'Equals_TextArea',
		EqualsAutocomplete: 'Equals_Autocomplete',
		EqualsSelect: 'Equals_Select',
		EqualsMultiple: 'Equals_Multiple',
		EqualsPopup: 'EqualsPopup',
		EqualsCheckboxes: 'Equals_CheckBoxes',
		EqualsTree: 'Equals_TreeView',
		NotEquals: 'NotEquals',
		NotEqualsSelect: 'NotEquals_Select',
		NotEqualsMultiple: 'NotEquals_Multiple',
		NotEqualsPopup: 'NotEqualsPopup',
		NotEqualsTree: 'NotEquals_TreeView',

		/*
		 * FieldComparison
		 */
		LessThanField: 'LessThanField',
		GreaterThanField: 'GreaterThanField',
		EqualsField: 'EqualsField',
		NotEqualsField: 'NotEqualsField',

		/*
		 * String
		 */
		Like: 'Like',
		NotLike: 'NotLike',
		BeginsWith: 'BeginsWith',
		EndsWith: 'EndsWith'
	};

	function OperatorInfo(operator) {
		var instance = this;

		instance.is = function (args) {
			return ns.matchAny(operator, Array.prototype.slice.call(arguments));
		};

		instance.isNotSelected = function() {
			return operator === '...';
		};

		instance.isComparisonGroup = function () {
			return instance.is(Operators.LessThan, Operators.GreaterThan, Operators.Between,
				Operators.NotLessThan, Operators.NotGreaterThan, Operators.NotBetween);
		};

		instance.isFieldComparisonGroup = function () {
			return instance.is(Operators.LessThanField, Operators.GreaterThanField, Operators.EqualsField, Operators.NotEqualsField);
		};

		instance.isStringGroup = function () {
			return instance.is(Operators.Like, Operators.NotLike, Operators.BeginsWith, Operators.EndsWith);
		};

		instance.isSimpleEditControl = function() {
			return instance.is(Operators.Equals, Operators.NotEquals, Operators.EqualsAutocomplete) ||
				instance.isComparisonGroup() || instance.isStringGroup() ||
				instance.is(Operators.LessThanDaysOld, Operators.GreaterThanDaysOld, Operators.EqualsDaysOld) ||
				(!showFieldAsValueDropDown && instance.isFieldComparisonGroup());
		};

		instance.isSelectControl = function() {
			return instance.is(Operators.EqualsSelect, Operators.NotEqualsSelect, Operators.EqualsMultiple, Operators.NotEqualsMultiple) ||
				(showFieldAsValueDropDown && instance.isFieldComparisonGroup());
		};

		instance.getVisibilityModes = function () {
			if (instance.is(Operators.Between, Operators.NotBetween))
				return [1, 2];
			if (instance.isSimpleEditControl())
				return [1];
			if (instance.isSelectControl())
				return [3];
			if (instance.is(Operators.InTimePeriod))
				return [4];
			if (instance.is(Operators.BetweenCalendar, Operators.NotBetweenCalendar))
				return [5];
			if (instance.is(Operators.EqualsPopup, Operators.NotEqualsPopup))
				return [6];
			if (instance.is(Operators.EqualsList))
				return [7];
			if (instance.is(Operators.EqualsCheckboxes))
				return [8];
			if (instance.is(Operators.EqualsCalendar, Operators.NotEqualsCalendar))
				return [9];
			if (instance.is(Operators.EqualsTree, Operators.NotEqualsTree))
				return [11];
			return [];
		};
	}

	function ParamsBuilder() {
		var instance = this;

		var params = [];

		instance.addParam = function (name, value) {
			if (!ns.isString(name) || ns.isEmptyString(name))
				throw ns.error.InvalidArgumentError();

			params.push({
				name: name,
				value: value
			});
		};

		instance.addIndexedParam = function (name, index, value) {
			if (!ns.isString(name) || ns.isEmptyString(name))
				throw ns.error.InvalidArgumentError();

			if (!ns.isInteger(index) || index < 0)
				throw ns.error.InvalidArgumentError();

			instance.addParam(name + index, value);
		};

		instance.toString = function () {
			return params.map(function(p) {
				return p.name + '=' + p.value;
			}).join('&');
		};
	}

	/*
	 * private methods
	 */

	function getOperatorInfoByRow(row) {
		var operatorSelect = EBC_GetSelectByName(row, 'Operator');
		if (operatorSelect == null)
			return null;

		var operatorValue = operatorSelect.value;
		var operatorInfo = new OperatorInfo(operatorValue);

		return operatorInfo;
	}

	function loadRowData(row) {
		var id = EBC_GetParentTable(row).id;
		if (dataKeys[id] != null)
			loadColumns(id, dataKeys[id].path, dataKeys[id].options, null, row);

		var tables = 'tables=' + context.tableListById[id];
		var operatorSelect = EBC_GetSelectByName(row, 'Operator');
		if (operatorSelect != null)
			EBC_LoadData('OperatorList', tables, operatorSelect);

		var timePeriodSelect = EBC_GetSelectByName(row, 'TimePeriod');
		if (timePeriodSelect != null)
			EBC_LoadData('PeriodList', null, timePeriodSelect);
	}

	function initNewRow(row) {
		var inputs = row.getElementsByTagName('INPUT');
		ns.each(inputs, function(input) {
			if (input.type === 'checkbox')
				input.checked = false;
			else if (input.type === 'text')
				input.value = '';
		});

		var columnSelect = EBC_GetSelectByName(row, 'Column');
		if (columnSelect != null)
			columnSelect.setAttribute('oldValue', '');

		loadRowData(row);

		setValueControlsVisibility(row);

		var parameterCheck = EBC_GetInputByName(row, 'Parameter');
		if (parameterCheck != null)
			parameterCheck.checked = true;

		initAutoComplete(row);
		initTreeFilter(row);
	}

	function initTreeFilter(row) {
		var comboboxTreeMultyselect = jq$(row).find('.comboboxTreeMultyselect');
		if (!comboboxTreeMultyselect || !comboboxTreeMultyselect[0])
			return;
		initTreeCombo(comboboxTreeMultyselect);
		var operatorName = EBC_GetSelectByName(row, 'Operator').value;
		if (operatorName === Operators.EqualsTree) {

			var fullColumnName = EBC_GetSelectByName(row, 'Column').value;

			var paramsBuilder = new ParamsBuilder();
			paramsBuilder.addParam('columnName', fullColumnName);
			fillFilterCommandParams(row, paramsBuilder);
			paramsBuilder.addParam('forTree', '1');
			paramsBuilder.addParam('resultType', 'json');

			EBC_LoadData('ExistentValuesList', paramsBuilder.toString(), null, true,
				function (responseResult) {
					updateTreeFilterValues(row, responseResult[0].options);
				});
		}
	}

	function initTreeCombo(mainControl) {
		mainControl.addClass('comboboxTreeMultyselect');
		mainControl.each(function() {
			var currentControl = jq$(this);
			currentControl.empty();

			var combobox = jq$(document.createElement('div')).addClass('textArea');
			currentControl.append(combobox);

			var selectedValues = jq$(document.createElement('div')).addClass('selectedValues').addClass('hiddenTree');
			currentControl.append(selectedValues);

			var tree = jq$(document.createElement('div')).addClass('tree').addClass('hiddenTree');
			currentControl.append(tree);

			var search = jq$(document.createElement('input')).addClass('search');
			combobox.append(search);

			combobox.on('click', function () {
				search.focus();
			});

			search.keyup(function() {
				var realText = search.val();
				var text = realText.toLowerCase();

				var list = new Array();
				tree.find('.node').each(function() {
					var node = jq$(this);
					if (node.hasClass('haschild')) {
						node.addClass('searchHide');
					} else {
						var val = node.attr('value').toLowerCase();
						var index = val.indexOf(text);
						if (index > -1) {
							list.push(node);
						} else {
							node.addClass('searchHide');
						}
					}
				});
				for (var i = 0; i < list.length; i++) {
					var parent = list[i].parent();
					while (!parent.hasClass('tree')) {
						parent.removeClass('searchHide');
						parent = parent.parent();
					}
				}

				tree.find('.hiddenBySearch').each(function() {
					var node = jq$(this);
					if (!node.hasClass('searchHide'))
						node.removeClass('hiddenBySearch');
				});

				tree.find('.searchHide').addClass('hiddenBySearch').removeClass('searchHide');

				tree.find('.node').each(function() {
					var node = jq$(this);
					if (!node.hasClass('hiddenBySearch')) {
						var textToReplace = node.attr('text');
						var resultText = textToReplace;
						var lowerText = textToReplace.toLowerCase();

						var index = lowerText.indexOf(text);
						if (index > -1) {
							resultText = textToReplace.substring(0, index);
							resultText += '<span class="highlight">' + textToReplace.substring(index, index + realText.length) + '</span>';
							resultText += textToReplace.substring(index + realText.length);
						}
						node.find('> span.text').html(resultText);
					} else
						node.find('> span.text').html(node.attr('text'));
				});

				if (tree.hasClass('hiddenTree'))
					tree.removeClass('hiddenTree');
			});


			var showHide = jq$(document.createElement('div')).addClass('showHide');
			showHide.click(function() {
				if (tree.hasClass('hiddenTree'))
					tree.removeClass('hiddenTree');
				else
					tree.addClass('hiddenTree');
			});
			combobox.append(showHide);

			jq$(document).click(function(e) {
				var target = jq$(e.target);
				if (target.hasClass('chunkX')) return;
				if (target.closest(tree).length !== 0) return;
				if (target.closest(combobox).length !== 0) return;
				tree.addClass('hiddenTree');
			});
		});
	}

	function appendTreeItem(node, itemText, itemValue, prevText, prevValue, tree, selectedValues, row) {
		var iti = itemText.indexOf('|');
		var text = iti > -1 ? itemText.substr(0, iti) : itemText;
		var displayText = prevText !== '' ? prevText + '|' + text : text;

		var ivi = itemValue.indexOf('|');
		var value = itemValue;
		if (ivi > -1) {
			var pos = 0;
			var commaSequence = -1;
			while ((commaSequence = value.indexOf('#||#', pos)) > -1 && commaSequence === ivi - 1) {
				pos = commaSequence + 4;
				ivi = value.indexOf('|', pos);
			}
			if (ivi > -1)
				value = value.substr(0, ivi);
		}
		if (prevValue !== '')
			value = prevValue + '|' + value;

		var subNodeExist = iti > -1 && ivi > -1;
		var newNode = node.find('> .node[value=\'' + value.replace(/'/g, "''") + '\']');
		if (newNode.length === 0) {
			newNode = jq$('<div>').addClass('node').attr('value', value).attr('text', text).attr('text-value', displayText);
			if (subNodeExist)
				newNode.addClass('haschild');
			newNode.html('<div class="collapse" ></div><input type="checkbox" class="checkbox"/><span class="text">' + text + '</span>');
			node.append(newNode);

			newNode.find('> .collapse').click(function () {
				if (newNode.hasClass('haschild'))
					newNode.toggleClass('collapsed');
			});

			newNode.find('> .checkbox').click(function () {
				var isChecked = jq$(this).is(':checked');
				checkTreeFilterUnchekChild(newNode.find('> .node'), isChecked);
				if (!isChecked) {
					var parent = newNode.parent();
					while (parent.hasClass('node')) {
						parent.find('> .checkbox').prop('checked', isChecked);
						parent = parent.parent();
					}
				}
				checkTreeFilterStatusIsChanged(selectedValues, tree.find('> .node'), tree, row);
			});
		}

		if (subNodeExist)
			appendTreeItem(newNode, itemText.substr(iti + 1), itemValue.substr(ivi + 1), displayText, value, tree, selectedValues, row);
	}

	function checkTreeFilterUnchekChild(element, check) {
		element.find('> .checkbox').prop('checked', check);
		element.find('> .node').each(function () {
			checkTreeFilterUnchekChild(jq$(this), check);
		});
	}

	function checkTreeFilterStatusIsChanged(selectedValues, nodes, tree, row) {
		selectedValues.empty();
		nodes.each(function () {
			fillTreeFilterCombobox(selectedValues, jq$(this), row);
		});

		var strVal = '';
		selectedValues.find('.cValid').each(function () {
			strVal += ', ' + jq$(this).attr('value');
		});
		strVal = strVal.substr(2);
		if (strVal == '')
			selectedValues.addClass('hiddenTree');
		else
			selectedValues.removeClass('hiddenTree');

		jq$(row).find('div[visibilitymode=1] input').attr('value', strVal);
	}

	function fillTreeFilterCombobox(selectedValues, node, row) {
		if (node.find('> .checkbox').is(':checked')) {
			var hasChild = node.hasClass('haschild');

			var text = node.attr('text');
			var val = node.attr('value');
			var textValue = node.attr('text-value');

			if (ns.isNullOrEmptyString(text) || ns.isNullOrEmptyString(text))
				return;

			var cValid = jq$(document.createElement('a'));

			var displayText = textValue.replace(/\|/g, '\\');
			if (displayText.length > 50) {
				var newText = '...\\' + text;
				var len = newText.length;
				var i = 0;
				var s = '';
				while (len < 40) {
					s += displayText[i];
					i++;
					len++;
				}
				displayText = s + newText;
			}

			if (hasChild)
				displayText += '+\\';

			cValid.addClass('cValid');
			cValid.attr('value', val);
			cValid.html('<nobr>' + displayText + '<img src="###RS###image=icon-blue-x.gif" class="chunkX"></nobr>');
			selectedValues.append(cValid);
			cValid.find('.chunkX').click(function () {
				cValid.remove();
				node.find('> .checkbox').prop('checked', false);
				checkTreeFilterUnchekChild(node, false);

				var strVal = '';
				selectedValues.find('.cValid').each(function () {
					strVal += ', ' + jq$(this).attr('value');
				});
				strVal = strVal.substr(2);
				jq$(row).find('div[visibilitymode=1] input').attr('value', strVal);

				if (strVal === '')
					selectedValues.addClass('hiddenTree');
				else
					selectedValues.removeClass('hiddenTree');
			});
		} else
			node.find('> .node').each(function () {
				fillTreeFilterCombobox(selectedValues, jq$(this), row);
			});
	}

	function updateTreeFilterValues(row, options) {
		var jqRow = jq$(row);
		var selectedValues = jqRow.find('div[visibilitymode=1] input').attr('value');
		var jqTree = jqRow.find('.comboboxTreeMultyselect .tree');
		var jqSelectedValuesControl = jqRow.find('.comboboxTreeMultyselect .selectedValues');

		jqTree.empty();
		for (var i = 0; i < options.length; i++)
			appendTreeItem(jqTree, options[i].text, options[i].value, '', '', jqTree, jqSelectedValuesControl, row);

		var valueList = selectedValues.split(/,\s*/);
		for (var j = 0; j < valueList.length; j++)
			jqTree.find('.node[value="' + valueList[j] + '"]').each(function () {
				checkTreeFilterUnchekChild(jq$(this), true);
			});
		checkTreeFilterStatusIsChanged(jqSelectedValuesControl, jqTree.find('> .node'), jqTree, row);
	}

	function updateCheckboxFilterValues(row, options) {
		var checkboxesParent = EBC_GetElementByName(row, 'CheckBoxSelectInner', 'div');
		if (!checkboxesParent)
			return;

		var preCheckedItems = ns.utils.dom.checkbox.getCheckedOptions(checkboxesParent);

		checkboxesParent.innerHTML = '';
		ns.each(options, function(item) {
			if (item.value == null || item.value === '...')
				return;

			var checked = preCheckedItems.indexOf(item.value) >= 0;

			var label = document.createElement('label');
			label.style.display = 'block';

			var input = document.createElement('input');
			input.type = 'checkbox';
			input.value = item.value;
			input.checked = checked;
			input.addEventListener('click', function () {
				izenda.pages.designer.FilterCheckBoxValue_OnChange(this);
			});

			label.innerText = item.text;
			label.insertBefore(input, label.firstChild);
			checkboxesParent.appendChild(label);
		});
	}

	function updateSelectboxFilterValues(row, options) {
		var valueSelect = EBC_GetSelectByName(row, 'SelectValue');
		if (!valueSelect)
			return;

		var values = ns.utils.dom.select.getSelectedOptionValues(valueSelect);
		valueSelect.innerHTML = '';
		var filter = document.createElement('textarea');
		ns.each(options, function (item) {
			filter.innerHTML = item.text;
			item.text = filter.innerText;

			var option = document.createElement('option');
			option.value = item.value;
			option.innerText = item.text;
			valueSelect.appendChild(option);
		});
		ns.utils.dom.select.setOptionsByValues(valueSelect, values);
	}

	function loadValues(row) {
		var operatorSelect = EBC_GetSelectByName(row, 'Operator');
		var operatorValue = operatorSelect.value;
		var operatorInfo = new OperatorInfo(operatorValue);
		if (!operatorInfo.isFieldComparisonGroup()) {
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			var columnName = columnSelect.value;
			if (columnName !== '' && columnName !== '...') {
				var paramsBuilder = new ParamsBuilder();
				paramsBuilder.addParam('columnName', columnName);
				fillFilterCommandParams(row, paramsBuilder);
				paramsBuilder.addParam('resultType', 'json');
				if (row && row.rowIndex)
					paramsBuilder.addParam('forRowIndex', row.rowIndex);
				if (operatorValue === Operators.EqualsTree)
					paramsBuilder.addParam('forTree', '1');

				EBC_LoadData('ExistentValuesList', paramsBuilder.toString(), null, null,
					function(responseResult) {
						if (operatorValue === Operators.EqualsCheckboxes)
							updateCheckboxFilterValues(row, responseResult[0].options);
						else if (operatorValue === Operators.EqualsTree)
							updateTreeFilterValues(row, responseResult[0].options);
						else
							updateSelectboxFilterValues(row, responseResult[0].options);
					});
			} else {
				var valueSelect = EBC_GetSelectByName(row, 'SelectValue');
				EBC_LoadData('@CC/Empty', null, valueSelect);
			}
		} else {
			var table = EBC_GetParentTable(row);
			var id = table.id;
			loadFieldValues(id, context.tableListById[id], true, 'SelectValue', row);
		}
			
	}

	function loadFieldValues(id, tables, loadFields, selectName, row) {
		if (tables == null)
			return;

		if (context.qac_works) {
			tableListOnChangeLastCallParams = [id, tables, loadFields, selectName, row];
			return;
		}

		if (tables.join != null)
			tables = tables.join('\'');
		context.tableListById[id] = tables;
		dataKeys[id] = { path: 'CombinedColumnList', options: 'tables=' + tables };
		if (loadFields)
			loadColumns(id, 'CombinedColumnList', 'tables=' + tables, selectName, row);
	}

	function loadColumns(id, path, options, selectName, row) {
		if (selectName == null)
			selectName = 'Column';

		dataKeys[id] = { path: path, options: options };

		var table = document.getElementById(id);
		var additionalData = null;

		if (context.descriptions && context.descriptions.length > 0) {
			additionalData = [{
				name: IzLocal.Res('js_calcFields', 'Calc fields'),
				options: []
			}];
			context.descriptions.forEach(function (calcField) {
				var option = {
					value: context.calcFieldPrefix + calcField.fldId,
					text: '[' + calcField.description + '] (calc)',
					fieldIndex: calcField.fieldIndex
				};
				if (calcField.datatype !== null)
					option.datatype = calcField.datatype;
				if (calcField.dataTypeGroup !== null)
					option.dataTypeGroup = calcField.dataTypeGroup;
				if (calcField.expressionType !== null)
					option.expressionType = calcField.expressionType;
				additionalData[0].options.push(option);
			});
		}

		var rows;
		if (row) {
			rows = [row];
			oldDataKey = null;
		} else
			rows = table.tBodies[0].querySelectorAll('tr');

		var newDataKey = path + options;
		if (additionalData)
			newDataKey = newDataKey + JSON.stringify(additionalData);

		if (oldDataKey === newDataKey)
			return;

		oldDataKey = newDataKey;

		ns.each(rows, function(row) {
			var columnSelect = EBC_GetSelectByName(row, selectName);
			var value = columnSelect.getAttribute('oldValue');
			if (!value || value.indexOf(context.calcFieldPrefix) === 0)
				value = EBC_GetSelectValue(columnSelect);
			columnSelect.value = value;
			EBC_LoadData(path, options, columnSelect, true, null, additionalData, function (newOpt) {
				if (newOpt.attr('prohibitedInFilters') === 'true')
					return false;
				var filterAlias = newOpt.attr('filterListAlias');
				if (filterAlias && newOpt.length > 0)
					newOpt[0].text = filterAlias;
				return true;
			});
		});
	}

	function getSectionRowIndex(row) {
		return jq$(row).prevAll().length;
	}

	function getCurrentFilterLogic() {
		var filterLogic = '';
		var filterLogicInput = document.querySelector('input[name$="FilterLogicValue"]');
		if (filterLogicInput && filterLogicInput.value && filterLogicInput.value.indexOf('Ex:') === -1)
			filterLogic = filterLogicInput.value;
		return filterLogic;
	}

	function isFilterLogicValid() {
		var filterLogic = getCurrentFilterLogic();
		return !ns.isNullOrEmptyString(filterLogic);
	}

	function updateFilterRows(row) {
		var table = EBC_GetParentTable(row);
		var rows = table.tBodies[0].querySelectorAll('tr');

		var startRow = isFilterLogicValid() ? 0 : getSectionRowIndex(row) + 1;
		for (var i = startRow; i < rows.length; ++i) {
			var operatorInfo = getOperatorInfoByRow(rows[i]);
			if (operatorInfo) {
				if (operatorInfo.isSelectControl() || operatorInfo.is(Operators.EqualsCheckboxes))
					loadValues(rows[i]);
			}
		}
	}

	function updateFilterLogic() {
		var table = document.querySelector('table[id$="_cc"]');
		if (table)
			updateFilterRows(table.querySelector('tr'));
	}

	function removeRow(id) {
		var table = document.getElementById(id);
		if (table == null)
			return;

		setValueHeaderVisibility(table);
		ns.pages.designer.RenumFilters(table);

		var rows = table.tBodies[0].querySelectorAll('tr');
		ns.each(rows, function(row) {
			var operatorInfo = getOperatorInfoByRow(row);
			if (operatorInfo) {
				if (operatorInfo.isSelectControl())
					loadValues(row);
			}
		});
	}

	function getTables(tableId) {
		var tables = [];
		var pos = tableId.lastIndexOf('_cc');
		if (pos > 0) {
			var id = tableId.substring(0, pos + 1) + 'jtc';
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
					if (value.table != null && value.table !== '...') {
						value.alias = tableAliases[i].value;
						if (i > 0) {
							value.column = columnSels[i].value;
							value.rightColumn = rightColumnSel[i].value;
							value.join = joinSel[i].value;
							if (joinSel[i].getAttribute('additional') === 'true' && additionalOperators != null)
								value.additionalOperator = additionalOperators[i].value;
						}
						tables.push(value);
					}
				}
			}
			else {
				id += 's';
				if (document.getElementById(id) != null) {
					var valueArray = new Array();
					var tableList = dataKeys[tableId].options;
					valueArray.table = tableList.substring(7, tableList.length);
					tables.push(valueArray);
				}
			}
		}
		return tables;
	}

	function getAllowNulls(tableId) {
		var allowNulls = '0';
		var pos = tableId.lastIndexOf('_cc');
		if (pos > 0) {
			var id = tableId.substring(0, pos + 1) + 'jtc';
			if (document.getElementById(id) == null)
				id += 's';
			var allowNullsInput = document.getElementsByName(id + '_AllowNulls');
			if (allowNullsInput != null && allowNullsInput[0] != null && allowNullsInput[0].checked)
				allowNulls = '1';
		}
		return allowNulls;
	}

	function getFiltersInRange(row, startIndex, endIndex) {
		var filters = new Array();

		var parentTable = EBC_GetParentTable(row);
		var id = parentTable.id;
		var columns = document.querySelectorAll('select[name="' + id + '_Column"]');
		var operator = document.querySelectorAll('select[name="' + id + '_Operator"]');

		if (endIndex == null)
			endIndex = parentTable.rows.length - 1;

		var rows = parentTable.tBodies[0].querySelectorAll('tr');

		for (var i = startIndex; i < endIndex; i++) {
			var prevRow = rows[i];
			var value = new Array();
			value.Column = columns[i].value;
			if (value.Column != null && value.Column !== '...') {
				value.Operator = operator[i].value;
				if (value.Operator != null && value.Operator !== '...') {
					var operatorInfo = getOperatorInfoByRow(prevRow);
					if (operatorInfo) {
						if (operatorInfo.isSimpleEditControl()) {
							value.val1 = EBC_GetInputByName(prevRow, 'Edit1').value;
							if (operatorInfo.is(Operators.Between, Operators.NotBetween))
								value.val2 = EBC_GetInputByName(prevRow, 'Edit2').value;
						}
						if (operatorInfo.isSelectControl())
							value.val1 = EBC_GetSelectValue(EBC_GetSelectByName(prevRow, 'SelectValue'));
						if (operatorInfo.is(Operators.InTimePeriod))
							value.val1 = EBC_GetSelectByName(prevRow, 'TimePeriod').value;
						if (operatorInfo.is(Operators.BetweenCalendar, Operators.NotBetweenCalendar)) {
							var startDate = EBC_GetInputByName(prevRow, 'startDate');
							if (startDate == null) {
								var starDateTable = EBC_GetElementByName(prevRow, 'StartDate', 'Table');
								startDate = EBC_GetInputByName(starDateTable, 'selecteddates');
							}
							if (startDate == null)
								startDate = EBC_GetInputByName(prevRow, 'bcStartDateJQ');
							value.val1 = startDate.value;
							if (value.val1.length > 11)
								value.val1 = value.val1.substring(0, 10);

							var endDate = EBC_GetInputByName(prevRow, 'endDate');
							if (endDate == null) {
								var endDateTable = EBC_GetElementByName(prevRow, 'EndDate', 'Table');
								endDate = EBC_GetInputByName(endDateTable, 'selecteddates');
							}
							if (endDate == null)
								endDate = EBC_GetInputByName(prevRow, 'bcEndDateJQ');
							value.val2 = endDate.value;
							if (value.val2.length > 11)
								value.val2 = value.val2.substring(0, 10);
						}
						if (operatorInfo.is(Operators.EqualsCalendar, Operators.NotEqualsCalendar)) {
							var eqDate = EBC_GetInputByName(prevRow, 'equalsDateJQ');
							value.val1 = eqDate.value;
							if (value.val1.length > 11)
								value.val1 = value.val1.substring(0, 10);
						}
						if (operatorInfo.is(Operators.EqualsPopup, Operators.NotEqualsPopup)) {
							var popupValueHandler = EBC_GetInputByName(prevRow, 'popup_value_handler').value;
							if (popupValueHandler !== '...')
								value.val1 = popupValueHandler;
						}
						if (operatorInfo.is(Operators.EqualsCheckboxes)) {
							var checkboxesParent = EBC_GetElementByName(prevRow, 'CheckBoxSelectInner', 'div');
							value.val1 = null;
							if (checkboxesParent) {
								var checkedValues = ns.utils.dom.checkbox.getCheckedOptions(checkboxesParent);
								if (checkedValues.length > 0)
									value.val1 = checkedValues.join(',');
							}
						}
						filters.push(value);
					}
				}
			}
		}
		return filters;
	}

	function getAllFilters(row) {
		var prevFilters = getFiltersInRange(row, 0, getSectionRowIndex(row));
		var nextFilters = getFiltersInRange(row, getSectionRowIndex(row), null);
		return prevFilters.concat(nextFilters);
	}

	function cropDate(value) {
		return value.split('.').slice(0, 3).join('.');
	}

	function fillFilterCommandParams(row, paramsBuilder) {
		var parentTable = EBC_GetParentTable(row);
		var id = parentTable.id;
		var tables = getTables(id);
		var allowNulls = getAllowNulls(id);
		var filterLogic = getCurrentFilterLogic();

		if (tables.length === 0) {
			var els = jq$('[id$="_SavedReportName"]');
			var savedReportName = els.length > 0 ? els[0] : null;
			if (savedReportName != null) {
				var rn = savedReportName.value;
				if (!ns.isNullOrEmptyString(rn)) {
					var val = new Array();
					val.table = '-1&rn=' + rn;
					tables.push(val);
				}
			}
		}

		if (tables.length > 0) {
			for (var i = 0; i < tables.length; ++i) {
				var table = tables[i];
				paramsBuilder.addIndexedParam('tbl', i, table.table);
				paramsBuilder.addIndexedParam('ta', i, (table.alias == null ? '' : table.alias));
				if (i > 0) {
					paramsBuilder.addIndexedParam('lclm', i, table.column);
					paramsBuilder.addIndexedParam('rclm', i, table.rightColumn);
					paramsBuilder.addIndexedParam('jn', i, table.join);
					if (table.additionalOperator != null)
						paramsBuilder.addIndexedParam('aop', i, table.additionalOperator);
				}
			}

			var filters = filterLogic !== '' ? getAllFilters(row) : getFiltersInRange(row, 0, getSectionRowIndex(row));
			for (var j = 0; j < filters.length; ++j) {
				var filter = filters[j];
				paramsBuilder.addIndexedParam('fc', j, filter.Column);
				paramsBuilder.addIndexedParam('fo', j, filter.Operator);
				var isCalendarOperator = ns.matchAny(filter.Operator, ['BetweenTwoDates', 'NotBetweenTwoDates', 'EqualsCalendar', 'NotEqualsCalendar']);
				if (filter.val1 != null) {
					var v1 = filter.val1.replace('&', '%26');
					if (isCalendarOperator)
						v1 = cropDate(v1);
					paramsBuilder.addIndexedParam('fvl', j, encodeURIComponent(v1));
				}
				if (filter.val2 != null) {
					var v2 = filter.val2.replace('&', '%26');
					if (isCalendarOperator)
						v2 = cropDate(v2);
					paramsBuilder.addIndexedParam('fvr', j, encodeURIComponent(v2));
				}
			}
		}

		if (filterLogic !== '')
			paramsBuilder.addParam('filterLogic', filterLogic);

		if (allowNulls === '1')
			paramsBuilder.addParam('nulls', allowNulls);
	}

	function getLastDayInMonth(year, month) {
		var date = new Date(year, month, 31);
		var i = 30;
		while (date.getMonth() !== month && i > 27) {
			date.setMonth(month);
			date.setDate(i);
			i--;
		}
		return (i + 1);
	}

	function initAutoComplete(row) {
		var editForAutoComplete = EBC_GetInputByName(row, 'Edit1');
		var operatorObject = EBC_GetSelectByName(row, 'Operator');

		if (editForAutoComplete != null && operatorObject != null) {
			removeAutocomplete(row);
			editForAutoComplete.parentNode.className = 'izenda-filter-control izenda-filter-autocomplete';

			jq$(editForAutoComplete).tagit({
				tagSource: function (req, responeFunction) {
					var currentRow = EBC_GetRow(editForAutoComplete);
					var operatorValue = EBC_GetSelectByName(currentRow, 'Operator').value;
					if (operatorValue === Operators.EqualsAutocomplete) {
						var possibleText = req.term.split(/,\s*/).pop();

						var fullColumnName = EBC_GetSelectByName(currentRow, 'Column').value;
						if (fullColumnName !== '' && fullColumnName !== '...') {
							var paramsBuilder = new ParamsBuilder();
							paramsBuilder.addParam('columnName', fullColumnName);
							fillFilterCommandParams(currentRow, paramsBuilder);
							paramsBuilder.addParam('possibleValue', possibleText.replace('&', '%26'));
							paramsBuilder.addParam('resultType', 'json');

							EBC_LoadData('ExistentValuesList', paramsBuilder.toString(), null, true, function (responseResult) {
								if (responseResult == null || responseResult.length === null || responseResult.length <= 0) {
									responeFunction('');
									return;
								}

								var result = new Array();
								ns.each(responseResult[0].options, function (item) {
									if (ns.isNullOrEmptyString(item.value) || item.value === '...')
										return;
									result.push(item.value.replaceAll('#||#', ','));
								});
								responeFunction(result);
							});
						}
						else
							responeFunction('');
					}
					else
						responeFunction('');
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

	function removeAutocomplete(row) {
		var editForAutoComplete = EBC_GetInputByName(row, 'Edit1');
		if (editForAutoComplete != null) {
			editForAutoComplete.parentNode.className = 'izenda-filter-control izenda-filter-equals';
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

	function showPopupFilter(element) {
		var row = EBC_GetRow(element);
		var columnSelect = EBC_GetSelectByName(row, 'Column');
		var isColumnSelected = columnSelect != null && columnSelect.selectedIndex !== -1 && columnSelect.value !== '' && columnSelect.value !== '...';
		if (isColumnSelected) {
			ReportingServices.showLoading();

			var paramsBuilder = new ParamsBuilder();
			paramsBuilder.addParam('columnName', columnSelect.value);
			fillFilterCommandParams(row, paramsBuilder);
			paramsBuilder.addParam('resultType', 'json');
			EBC_LoadData('ExistentPopupValuesList', paramsBuilder.toString(), null, false, function (data) {
				if (data.userpage != null)
					renderPopupUserPage(row, data);
				else
					renderPopupItems(row, data);
			});
		}
	}

	function renderPopupUserPage(row, data) {
		CC_CurrentRowForCustomFilterPage = row;

		var columnSelect = EBC_GetSelectByName(row, 'Column');
		var columnEditId = row.parentNode.parentNode.id + '_zEditColumnId';
		var columnEdit = document.getElementById(columnEditId);
		columnEdit.value = columnSelect.value;

		var editInput = EBC_GetInputByName(row, 'Edit1');
		var valueEditId = row.parentNode.parentNode.id + '_EditValueId';
		var valueEdit = document.getElementById(valueEditId);
		valueEdit.value = editInput.value;

		var file = data.userpage;
		ReportingServices.showModal('<iframe src="' +
			file +
			'?valueeditid=' +
			valueEditId +
			'&columneditid="' +
			columnEditId +
			'" name="CustomAspx" width="290" height="530"></iframe>');
	}

	function renderPopupItems(row, data) {
		var popupValueHandlerInput = EBC_GetInputByName(row, 'popup_value_handler');
		var value = popupValueHandlerInput.value;
		var values = value.split(/,\s*/);

		var table = document.createElement('table');
		table.id = 'AdHocFilerTable';
		table.style.textAlign = 'left';
		var tr = document.createElement('tr');
		var ci = 0;
		ns.each(data[0].options, function(item) {
			if (item.value == null || item.value === '...')
				return;

			if (ci++ % 3 === 0) {
				table.appendChild(tr);
				tr = document.createElement('tr');
			}

			var td = document.createElement('td');
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.value = item.value;
			var label = document.createElement('label');
			label.style.display = 'block';
			label.innerText = item.text;
			label.insertBefore(input, label.firstChild);
			td.appendChild(label);
			tr.appendChild(td);
		});
		table.appendChild(tr);

		var checkboxes = table.querySelectorAll('input[type="checkbox"]');
		ns.each(values, function (value) {
			ns.each(checkboxes, function (checkbox) {
				if (checkbox.value === value || checkbox.value == null && value === '')
					checkbox.checked = true;
			});
		});

		ReportingServices.showConfirm(table, function(result) {
			confirmPopupSelectedValues(row, result);
		});
	}

	function confirmPopupSelectedValues(row, result) {
		if (result === jsResources.OK) {
			var edit1 = EBC_GetInputByName(row, 'Edit1');
			var valueHandler = EBC_GetInputByName(row, 'popup_value_handler');
			if (edit1 == null || valueHandler == null)
				return;

			var table = document.getElementById('AdHocFilerTable');
			var checkboxes = table.querySelectorAll('input[type="checkbox"]');
			var values = [];
			ns.each(checkboxes, function(checkbox) {
				if (checkbox.checked)
					values.push(checkbox.value);
			});
			var strValues = values.length === 0 ? '...' : values.join(',');
			edit1.value = strValues;
			valueHandler.value = strValues;
			updateFilterRows(row);
		}
		ReportingServices.hideTip();
	}

	function setValueHeaderVisibility(table) {
		var rows = Array.prototype.slice.call(table.tBodies[0].querySelectorAll('tr'));
		var showFilterValueHeader = rows.some(function(row) {
			var operatorInfo = getOperatorInfoByRow(row);
			if (!operatorInfo)
				return false;

			return !(operatorInfo.isNotSelected() ||
				operatorInfo.is(Operators.Blank, Operators.NotBlank, Operators.UsePreviousOR, Operators.True, Operators.False));
		});

		var filterValueHeader = table.querySelector('th[name="filter-value-header"]');
		filterValueHeader.style.visibility = showFilterValueHeader ? 'visible' : 'hidden';
	}

	function setValueControlsVisibility(row) {
		var operatorInfo = getOperatorInfoByRow(row);
		if (!operatorInfo)
			return;

		var table = EBC_GetParentTable(row);
		setValueHeaderVisibility(table);

		var visibilityModes = operatorInfo.getVisibilityModes();
		var divElems = row.getElementsByTagName('DIV');
		ns.each(divElems, function(elem) {
			var visibilityModeAttr = parseInt(elem.getAttribute('visibilitymode'));
			if (ns.isInteger(visibilityModeAttr)) {
				var displayMode = 'none';
				for (var j = 0; j < visibilityModes.length; ++j)
					if (visibilityModeAttr === visibilityModes[j])
						displayMode = '';
				elem.style.display = displayMode;
			}
		});
	}

	function hasAtLeastOneSelectedColumn(table) {
		if (table == null)
			return;

		var rows = Array.prototype.slice.call(table.tBodies[0].querySelectorAll('tr'));
		return rows.some(function (row) {
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			var isColumnSelected = columnSelect != null && columnSelect.selectedIndex !== -1 && columnSelect.value !== '' && columnSelect.value !== '...';
			return isColumnSelected;
		});
	}

	function setShowFiltersInReportDescriptionVisibility(table) {
		if (table == null)
			return;

		var showReportParamTable = document.getElementById(table.id + '_ShowReportParametersTable');
		if (showReportParamTable == null)
			return;

		var showParams = hasAtLeastOneSelectedColumn(table);
		showReportParamTable.style.display = showParams ? '' : 'none';
	}

	/*
	 * event handlers
	 */

	ns.pages.designer.ShowFiltersInReportDescription_OnChange = function (element) {
		var jqMultiPageControl = jq$(element).closest('[id$="_MultiPage"]');
		var jqFilterFormatHeader = jqMultiPageControl.find('th[name="filter-format-header"]');
		var jqFilterFormatControl = jqMultiPageControl.find('select[name$="_DisplayFormat"]');

		if (element.checked) {
			jqFilterFormatHeader.show();
			jqFilterFormatControl.parent().show();
			
		} else {
			jqFilterFormatHeader.hide();
			jqFilterFormatControl.parent().hide();
		}
	};

	ns.pages.designer.FilterLogicEdit_OnChange = function() {
		updateFilterLogic();
	};

	ns.pages.designer.FilterColumnSelect_OnChange = function(element) {
		var row = EBC_GetRow(element);

		if (row != null) {
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			var operatorSelect = EBC_GetSelectByName(row, 'Operator');
			var operatorValue = operatorSelect.value;
			var operatorInfo = new OperatorInfo(operatorValue);
			if (operatorSelect && operatorInfo.is(Operators.EqualsSelect, Operators.NotEqualsSelect, Operators.EqualsMultiple, Operators.NotEqualsMultiple,
				Operators.EqualsCheckboxes, Operators.EqualsTree, Operators.NotEqualsTree))
				loadValues(row);

			var dataType = null;
			var dataTypeGroup = null;
			var expressionType = null;
			var columnFullName = null;
			if (columnSelect.selectedIndex !== -1) {
				dataType = columnSelect.options[columnSelect.selectedIndex].getAttribute('datatype');
				dataTypeGroup = columnSelect.options[columnSelect.selectedIndex].getAttribute('dataTypeGroup');
				expressionType = columnSelect.options[columnSelect.selectedIndex].getAttribute('expressionType');
				columnFullName = columnSelect.options[columnSelect.selectedIndex].value;
			}

			if (dataType == null || dataType === 'Unknown')
				dataType = '';
			if (dataTypeGroup == null)
				dataTypeGroup = '';
			if (columnFullName == null)
				columnFullName = '';

			var id = EBC_GetParentTable(row).id;
			var tables = 'tables=' + context.tableListById[id];
			EBC_LoadData('OperatorList', EBC_JoinParams('typeGroup', dataType) + '&' + tables + '&colFullName=' + columnFullName, operatorSelect);
			if (allowNewFiltersValue != null && (allowNewFiltersValue == null || allowNewFiltersValue)) {
				columnSelect = EBC_GetSelectByName(row, 'Column');
				if (columnSelect.value !== '' && columnSelect.value !== '...')
					EBC_AddEmptyRow(row);
			}
			setShowFiltersInReportDescriptionVisibility(EBC_GetParentTable(row));

			var formatSelect = EBC_GetSelectByName(row, 'DisplayFormat');
			if (formatSelect != null)
				EBC_LoadData('FormatList',
					EBC_JoinParams('typeGroup', ((expressionType && expressionType !== '...') ? expressionType : dataTypeGroup)) +
					'&onlySimple=true&forceSimple=true&colFullName=' + columnFullName, formatSelect);
		}
	};

	ns.pages.designer.FilterOperatorSelect_OnChange = function(element) {
		var row = EBC_GetRow(element);
		if (row != null) {
			var edit2Shown = false;
			var divElems = row.getElementsByTagName('DIV');
			var divCount = divElems.length;
			for (var i = 0; i < divCount; i++) {
				var elem = divElems[i];
				if (elem.getAttribute('visibilityMode') === 2) {
					edit2Shown = elem.style.display !== 'none';
					break;
				}
			}

			setValueControlsVisibility(row);
			var operatorValue = EBC_GetSelectByName(row, 'Operator').value;
			var operatorInfo = new OperatorInfo(operatorValue);
			var valueSelect = EBC_GetSelectByName(row, 'SelectValue');
			if (operatorInfo.is(Operators.EqualsMultiple, Operators.NotEqualsMultiple, Operators.EqualsCheckboxes)) {
				valueSelect.parentNode.className = 'izenda-filter-control izenda-filter-multiple';
				valueSelect.multiple = true;
				valueSelect.size = 5;
			} else {
				valueSelect.parentNode.className = 'izenda-filter-control izenda-filter-select';
				valueSelect.multiple = false;
				valueSelect.size = 1;

				var edit1 = EBC_GetInputByName(row, 'Edit1');
				var oldValue = edit1.value;
				if (!edit2Shown && operatorInfo.is(Operators.Between, Operators.NotBetween)) {
					var edit2 = EBC_GetInputByName(row, 'Edit2');
					edit1.value = '';
					edit2.value = '';
				} else if (oldValue.length > 0 && (oldValue.charAt(0) === '['))
					edit1.value = '';
				else if (oldValue === '...')
					edit1.value = '';
				else if (oldValue === '' && operatorInfo.is(Operators.EqualsPopup))
					edit1.value = '...';

				if (operatorInfo.is(Operators.EqualsAutocomplete))
					initAutoComplete(row);
				else
					removeAutocomplete(row);
			}
			if (operatorInfo.is(Operators.EqualsSelect, Operators.NotEqualsSelect, Operators.EqualsMultiple, Operators.NotEqualsMultiple,
				Operators.EqualsTree, Operators.NotEqualsTree, Operators.EqualsCheckboxes))
				loadValues(row);

			if (showFieldAsValueDropDown && operatorInfo.isFieldComparisonGroup()) {
				var table = EBC_GetParentTable(row);
				var id = table.id;
				loadFieldValues(id, context.tableListById[id], true, 'SelectValue', row);
			}
		}
	};

	ns.pages.designer.FilterTimePeriodSliderSelect_OnChange = function(element, name, value, sliderStep) {
		var table = EBC_GetParentTable(element);
		var row = table.rows[0];
		var input = EBC_GetInputByName(row, name);
		var oldValue = new Date(input.value);
		var newDate = new Date(value);
		if (!ns.isUndefined(moment) && !ns.isUndefined(HORR_shortDateFormat)) {
			oldValue = moment(input.value, HORR_shortDateFormat)._d;
			newDate = moment(value, HORR_shortDateFormat)._d;
		}

		if (isNaN(oldValue.getDate())) {
			oldValue = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
			if (name === 'SliderValueTo') {
				switch (sliderStep) {
				case 'Day':
					break;
				case 'Month':
					oldValue.setDate(getLastDayInMonth(newDate.getFullYear(), newDate.getMonth()));
					break;
				case 'Quarter':
					{
						var month = oldValue.getMonth();
						month = month + (3 - ((month + 1) % 3)) % 3;
						oldValue.setMonth(month);
						oldValue.setDate(getLastDayInMonth(oldValue.getFullYear(), month));
					}
					break;
				case 'Year':
					oldValue.setMonth(11);
					oldValue.setDate(31);
					break;
				}
			}
		}
		var resultDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
		switch (sliderStep) {
		case 'Day':
			break;
		case 'Month':
			if (oldValue.getDate() === getLastDayInMonth(oldValue.getFullYear(), oldValue.getMonth())) {
				resultDate.setDate(getLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
			} else {
				resultDate.setDate(oldValue.getDate());
				if (resultDate.getMonth() !== newDate.getMonth()) {
					resultDate.setMonth(newDate.getMonth());
					resultDate.setDate(getLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
				}
			}
			break;
		case 'Quarter':
			{
				var day = oldValue.getDate();
				var monthDiv = oldValue.getMonth() % 3;
				var month = resultDate.getMonth() + monthDiv;

				if (day === getLastDayInMonth(oldValue.getFullYear(), oldValue.getMonth())) {
					day = getLastDayInMonth(resultDate.getYear(), month);
				}
				resultDate.setMonth(month);
				resultDate.setDate(day);
			}
			break;
		case 'Year':
			resultDate.setMonth(oldValue.getMonth());
			if (oldValue.getDate() === getLastDayInMonth(oldValue.getFullYear(), oldValue.getMonth())) {
				resultDate.setDate(getLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
			} else {
				resultDate.setDate(oldValue.getDate());
				if (resultDate.getMonth() !== oldValue.getMonth()) {
					resultDate.setMonth(oldValue.getMonth());
					resultDate.setDate(getLastDayInMonth(resultDate.getFullYear(), resultDate.getMonth()));
				}
			}
			break;
		}
		if (!ns.isUndefined(moment) && !ns.isUndefined(HORR_shortDateFormat))
			input.value = moment(resultDate).format(HORR_shortDateFormat);
		else
			input.value = resultDate.format('m/d/Y');
	};

	ns.pages.designer.FilterTimePeriodSliderEdit_OnChange = function(element, name, value) {
		var table = EBC_GetParentTable(element);
		var row = table.rows[0];
		var editValue = null;

		if (name === 'SliderValueFrom')
			editValue = EBC_GetSelectByName(row, 'value1');
		else if (name === 'SliderValueTo')
			editValue = EBC_GetSelectByName(row, 'value2');

		if (!editValue)
			return;

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
	};

	ns.pages.designer.FilterValue_OnChange = function(element) {
		var row = EBC_GetRow(element);
		updateFilterRows(row);
	};

	ns.pages.designer.FilterTableList_OnInit = function (id, tables) {
		context.tableListById[id] = tables;
		dataKeys[id] = { path: 'CombinedColumnList', options: 'tables=' + tables };
	};

	ns.pages.designer.FilterTableList_OnChange = function (id, tables, loadFields, selectName, row) {
		loadFieldValues(id, tables, loadFields, selectName, row);
	};

	ns.pages.designer.FilterSelectValue_OnChange = function(element) {
		var row = EBC_GetRow(element);
		if (row == null)
			return;

		var valueSelect = EBC_GetSelectByName(row, 'SelectValue');
		if (valueSelect == null)
			return;

		if (valueSelect.value === 'Loading ...')
			return;

		var edit = EBC_GetInputByName(row, 'Edit1');
		if (valueSelect.value === '...')
			edit.value = '';
		else {
			edit.value = EBC_GetSelectValue(valueSelect);
			var checkboxesParent = EBC_GetElementByName(row, 'CheckBoxSelectInner', 'div');
			if (checkboxesParent) {
				var allVals = valueSelect.value;
				var isString = ns.isString(allVals);
				var checkboxes = checkboxesParent.querySelectorAll('input[type="checkbox"]');
				ns.each(checkboxes, function (checkbox) {
					var currentValue = checkbox.value;
					var checked = (isString && currentValue === allVals) || (!isString &&  allVals.indexOf(currentValue) > -1);
					checkbox.checked = checked;
				});
			}
		}
		updateFilterRows(row);
	};

	ns.pages.designer.FilterCheckBoxValue_OnChange = function (element) {
		var row = EBC_GetRow(element);
		if (row == null)
			return;

		var edit = EBC_GetInputByName(row, 'Edit1');
		if (!edit)
			return;

		var checkboxesParent = EBC_GetElementByName(row, 'CheckBoxSelectInner', 'div');
		var checkedValues = ns.utils.dom.checkbox.getCheckedOptions(checkboxesParent);
		
		edit.value = checkedValues.join(',');

		if (checkedValues.length === 0)
			checkedValues.push('...');

		var valueSelect = EBC_GetSelectByName(row, 'SelectValue');
		valueSelect.innerHTML = '';
		ns.each(checkedValues, function(checkedValue) {
			var option = document.createElement('option');
			option.value = checkedValue;
			option.innerText = checkedValue;
			valueSelect.appendChild(option);
		});

		updateFilterRows(row);
	};

	ns.pages.designer.FilterFieldList_OnChange = function (id, fields) {
		EBC_PopulateDescriptions(fields);
		loadFieldValues(id, context.tableListById[id], true);
	};

	ns.pages.designer.FilterFieldList_OnInit = function (id, fields) {
		if (!isFieldListInitialized) {
			setTimeout(function () { ns.pages.designer.FilterFieldList_OnInit(id, fields); }, 100);
			return;
		}

		EBC_PopulateDescriptions(fields);

		var table = document.getElementById(id);
		var rows = table.querySelectorAll('tr');
		ns.each(rows, function (row) {
			setValueControlsVisibility(row);
		});
	};

	ns.pages.designer.FilterEqualsPopupButton_OnClick = function (element) {
		showPopupFilter(element);
	};

	/*
	 * public methods
	 */

	ns.pages.designer.CallFilterTableListChangeHandlerWithStoredParams = function() {
		var params = tableListOnChangeLastCallParams;
		if (params == null || params.length !== 5)
			return;

		loadFieldValues(params[0], params[1], params[2], params[3], params[4]);
	};

	ns.pages.designer.InitFilterTable = function(id, showFieldAdValue, allowNewFilters, dateFormatString, showTimeInPickers) {
		jq$.datepicker.markerClassName = 'hasDateTimePickerJq';

		var eqInputs = document.getElementsByName(id + '_equalsDateJQ');
		var startInputs = document.getElementsByName(id + '_bcStartDateJQ');
		var endInputs = document.getElementsByName(id + '_bcEndDateJQ');

		if (showTimeInPickers) {
			jq$(eqInputs).datetimepickerJq({
				buttonImage: resourcesProvider.ResourcesProviderUrl + 'image=calendar_icon.png',
				showOn: 'both',
				buttonImageOnly: true,
				altRedirectFocus: false,
				showSecond: true,
				timeInput: true,
				dateFormat: dateFormatString
			});

			jq$(startInputs).datetimepickerJq({
				buttonImage: resourcesProvider.ResourcesProviderUrl + 'image=calendar_icon.png',
				showOn: 'both',
				buttonImageOnly: true,
				altRedirectFocus: false,
				showSecond: true,
				timeInput: true,
				dateFormat: dateFormatString
			});

			jq$(endInputs).attr('autoSetEndDay', '1');
			jq$(endInputs).datetimepickerJq({
				buttonImage: resourcesProvider.ResourcesProviderUrl + 'image=calendar_icon.png',
				showOn: 'both',
				buttonImageOnly: true,
				altRedirectFocus: false,
				showSecond: true,
				timeInput: true,
				dateFormat: dateFormatString,
				onClose: function() {
					var enteredDate = jq$(this).datetimepickerJq('getDate');
					if (!ns.isNullOrUndefined(enteredDate) &&
						enteredDate.getHours() + enteredDate.getMinutes() + enteredDate.getSeconds() <= 0) {
						var fixedDate = new Date(enteredDate.getFullYear(),
							enteredDate.getMonth(),
							enteredDate.getDate(),
							23,
							59,
							59,
							0);
						jq$(this).datetimepickerJq('setDate', fixedDate);
					}
				}
			});
		} else {
			jq$(eqInputs).datepicker({
				dateFormat: dateFormatString,
				buttonImage: resourcesProvider.ResourcesProviderUrl + 'image=calendar_icon.png',
				showOn: 'both',
				buttonImageOnly: true
			});

			jq$(startInputs).datepicker({
				dateFormat: dateFormatString,
				buttonImage: resourcesProvider.ResourcesProviderUrl + 'image=calendar_icon.png',
				showOn: 'both',
				buttonImageOnly: true
			});

			jq$(endInputs).datepicker({
				dateFormat: dateFormatString,
				buttonImage: resourcesProvider.ResourcesProviderUrl + 'image=calendar_icon.png',
				showOn: 'both',
				buttonImageOnly: true
			});
		}

		var datepickerDiv = document.getElementById('iz-ui-datepicker-div');
		if (!ns.isNullOrUndefined(datepickerDiv))
			datepickerDiv.style.display = 'none';

		showFieldAsValueDropDown = showFieldAdValue;
		allowNewFiltersValue = allowNewFilters;

		EBC_RegisterControl(id);
		EBC_SetData('@CC/Empty', [{ name: '', options: [{ value: '...', text: '...' }] }]);
		if (dataKeys[id] != null)
			EBC_SetData(dataKeys[id].path + dataKeys[id].options, [{ name: '', options: [{ value: '...', text: '...' }] }]);

		var table = document.getElementById(id);
		EBC_RegisterRowInsertHandler(table, initNewRow);
		EBC_RegisterRowRemoveHandler(table, removeRow);

		var rows = table.tBodies[0].querySelectorAll('tr');
		ns.each(rows, function(row) {
			var operatorValue = EBC_GetSelectByName(row, 'Operator').value;
			if (operatorValue === 'Equals_Autocomplete')
				initAutoComplete(row);
			else
				removeAutocomplete(row);
			initTreeFilter(row);
		});

		EBC_RegiserForUnusedRowsRemoving(table);
		isFieldListInitialized = true;
	};

	ns.pages.designer.RenumFilters = function (table) {
		var rows = table.tBodies[0].querySelectorAll('tr');
		for (var i = 0, length = rows.length; i < length; i++) {
			var filterNumber = EBC_GetInputByName(rows[i], 'FilterNumber');
			if (filterNumber != null)
				filterNumber.value = i + 1;
		}
	};

})(window.izenda || (window.izenda = {}));

var CC_CurrentRowForCustomFilterPage = null;
function CC_CustomFilterPageValueReceived() {
	var valueEditId = CC_CurrentRowForCustomFilterPage.parentNode.parentNode.id + '_EditValueId';
	var valueEdit = document.getElementById(valueEditId);
	var valueField = EBC_GetInputByName(CC_CurrentRowForCustomFilterPage, 'Edit1');
	var popupValueField = EBC_GetInputByName(CC_CurrentRowForCustomFilterPage, 'popup_value_handler');
	if (valueField)
		valueField.value = valueEdit.value;
	if (popupValueField)
		popupValueField.value = valueEdit.value;
}
