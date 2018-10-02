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

	context.ChartTypes = ns.getValue(context.ChartTypes, {});
	context.ChartTypeInfo = ns.getValue(context.ChartTypeInfo, {});

	var chartTypes = {};
	var chartTypeSelectIds = {};

	var advancedEnabledIds = {};
	var chartFieldListInitialized = false;
	var tableListOnChangeLastCallParams = new Array();

	/*
	 * private methods
	 */

	var updateOrderByAggregateFunction = function (row, chartType) {
		var sortCheckbox = EBC_GetInputByName(row, 'OrderAsc');
		if (sortCheckbox != null)
			sortCheckbox.checked = chartType === 'Trend';
	};

	var updateGrouping = function (functionSelect, table) {
		if (functionSelect.value === 'None')
			return;

		var rows = table.tBodies[0].rows;
		var rowsCount = rows.length;
		var row = AdHoc.Utility.findParentElement(functionSelect, 'tr');
		var rowIndex = row['sectionRowIndex'];
		for (var i = 0; i < rowsCount; i++) {
			if (i === rowIndex)
				continue;

			var funcSelect = EBC_GetSelectByName(rows[i], 'Function');
			var columnSelect = EBC_GetSelectByName(rows[i], 'Column');
			if (funcSelect.value === 'None' && (columnSelect.value !== '...' && columnSelect.value != null))
				EBC_SetSelectedIndexByValue(funcSelect, 'GROUP');
		}
	};

	var showHideEffect = function (element) {
		var table = EBC_GetParentTable(element);
		var row = EBC_GetRow(element);
		var rowIndex = row.rowIndex;
		var rows = table.tBodies[0].rows;
		if (rowIndex + 1 < rows.length)
			rows[rowIndex + 1].style['display'] = element.value === '' || element.value === '...' ? 'none' : '';
	};

	var showHideProperties = function (element, id) {
		element.disabled = true;

		var propertiesTable = document.getElementById(id + '_Properties');
		var show = false;
		if (propertiesTable.style.display === 'none') {
			propertiesTable.style.display = 'block';
			show = true;
		} else
			propertiesTable.style.display = 'none';

		var chartTypeSelect = document.getElementById(id + '_ChartTypeSelect');
		var chartType = chartTypeSelect.options[chartTypeSelect.selectedIndex].value;
		var chartItems = context.ChartTypes[chartType];

		var fieldTable = document.getElementById(id);
		var body = fieldTable.tBodies[0];
		var count = body.rows.length;
		for (var i = 0; i < count; i++) {
			var funcVisible = '';
			if (chartItems == null)
				funcVisible = 'none';
			else {
				var item = chartItems[i];
				if (item == null || (item.advanced && !show))
					funcVisible = 'none';
				if (show && item != null && item.advanced)
					funcVisible = '';
			}
			body.rows[i].style.display = funcVisible;

			var divVisible = show ? '' : 'none';
			var divElements = body.rows[i].getElementsByTagName('DIV');
			var divCount = divElements.length;
			for (var j = 0; j < divCount; j++) {
				var elem = divElements[j];
				var visibilityMode = elem.getAttribute('visibilityMode');
				var caBeVisible = elem.getAttribute("canBeVisible") !== "false";

				if (visibilityMode === 'Advanced' ||
					(visibilityMode === 'Advanced_2' && caBeVisible))
					elem.style.display = divVisible;
			}
		}

		var advancedEnabledId = advancedEnabledIds[id];
		var advancedEnabled = document.getElementById(advancedEnabledId);
		if (advancedEnabled != null)
			advancedEnabled.value = 'true';
	};

	var createAdditionalOptions = function (hasDateChartItem) {
		var additionalOptions = null;
		if (context.descriptions != null && context.descriptions.length > 0) {
			additionalOptions = [{ name: '', options: [{ value: '', text: '------', disabled: true }] }];
			for (var l = 0; l < context.descriptions.length; l++) {
				var calcField = context.descriptions[l];

				if (hasDateChartItem) {
					var dateTypes = ['DateTime', 'Date'];
					if (dateTypes.indexOf(calcField.initialDataType) === -1)
						continue;
				}

				var option = {
					value: context.calcFieldPrefix + calcField.fldId,
					text: '[' + calcField.description + '] (calc)',
					fieldIndex: calcField.fieldIndex
				};

				if (calcField.datatype != null)
					option.datatype = calcField.datatype;

				if (calcField.expressionType !== '...')
					option.dataTypeGroup = calcField.expressionType;
				else if (calcField.dataTypeGroup)
					option.dataTypeGroup = calcField.dataTypeGroup;

				additionalOptions[0].options.push(option);
			}

			if (additionalOptions[0].options.length === 1)
				additionalOptions = null;
		}

		return additionalOptions;
	};

	var getChartItemContext = function (chartItems, index) {
		var context = {};

		context.label = null;
		context.advanced = false;

		context.filter = 'all';
		context.includeBlank = true;
		context.numericOnly = false;
		context.forbidAutoSelect = false;
		context.defaultAdvancedTypeGroup = 'None';
		context.isDateType = false;

		context.functionVisible = 'none';
		context.orderVisible = 'none';
		context.ascChecked = false;
		context.descChecked = false;
		context.valueRangeVisible = false;

		if (chartItems != null) {
			var chartItem = chartItems[index];
			if (chartItem != null) {
				context.label = chartItem.label;
				context.advanced = chartItem.advanced;

				context.isDateType = chartItem.type === 'Date';
				if (chartItem.label != null) {
					context.filter = chartItem.filter;
					context.includeBlank = !chartItem.shouldBeSetted;
					context.numericOnly = chartItem.numericOnly;
					context.forbidAutoSelect = chartItem.forbidAutoSelect;
					if (chartItem.defaultAdvancedTypeGroup)
						context.defaultAdvancedTypeGroup = chartItem.defaultAdvancedTypeGroup;

					context.functionVisible = chartItem.functionVisible ? '' : 'none';
					context.orderVisible = chartItem.canBeSorted ? '' : 'none';
					context.ascChecked = chartItem.orderType === 'ASC';
					context.descChecked = chartItem.orderType === 'DESC';
					context.valueRangeVisible = chartItem.type === 'Separator';
				}
			}
		}

		return context;
	};

	var loadColumnSelectData = function (id, columnSelect, chartItemContext) {
		var additionalData = createAdditionalOptions(chartItemContext.isDateType);

		var typeGroupsObj;
		if (chartItemContext.numericOnly) {
			typeGroupsObj = EBC_GetTypesValidator('NotBinary');
			var typesObj = EBC_GetTypesValidator('NotText');
			(function (tgo, to, ib, cs, ad) {
				var validator = function (newOpt) {
					var isEmptyValue = newOpt.attr('value') === '...';
					if (!ib && isEmptyValue)
						return false;
					var dataTypeGroup = newOpt.attr('dataTypeGroup') || 'unknown';
					var dataType = newOpt.attr('dataType') || 'unknown';
					//TODO Check validators
					return isEmptyValue || (tgo.TypeAllowed(dataTypeGroup.toLowerCase()) && to.TypeAllowed(dataType.toLowerCase()));
				};

				EBC_LoadData('CombinedColumnList', 'tables=' + context.tableListById[id], cs, null, null, ad, validator);
			})(typeGroupsObj, typesObj, chartItemContext.includeBlank, columnSelect, additionalData);
		} else {
			typeGroupsObj = EBC_GetTypesValidator(chartItemContext.filter);
			(function (tgo, ib, datg, cs, ad) {
				var validator = function (newOpt) {
					var isEmptyValue = newOpt.attr('value') === '...';
					if (!ib && isEmptyValue)
						return false;
					var dataTypeGroup = newOpt.attr('dataTypeGroup') || 'unknown';
					if (!isEmptyValue && !tgo.TypeAllowed(dataTypeGroup.toLowerCase()))
						return false;
					if (!ib && datg !== 'None' && dataTypeGroup === datg)
						newOpt.attr('default', true);
					return true;
				};

				EBC_LoadData('CombinedColumnList', 'tables=' + context.tableListById[id], cs, null, null, ad, validator);
			})(typeGroupsObj,
				chartItemContext.includeBlank,
				chartItemContext.defaultAdvancedTypeGroup,
				columnSelect,
				additionalData);
		}
	};

	var loadChartColumnsData = function (id) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];

		var chartItems = context.ChartTypes[chartTypes[id]];

		var count = body.rows.length;
		for (var k = 0; k < count; k++) {
			var row = body.rows[k];
			var columnSelect = EBC_GetSelectByName(row, 'Column');
			if (columnSelect.value !== '...')
				row.setAttribute('userChanged', 'true');

			var currentChartItemContext = getChartItemContext(chartItems, k);
			columnSelect.forbidAutoSelect = currentChartItemContext.forbidAutoSelect;

			loadColumnSelectData(id, columnSelect, currentChartItemContext);
		}
	};

	var setRowsVisibility = function (id) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var count = body.rows.length;

		var chartItems = context.ChartTypes[chartTypes[id]];

		var isAdvancedPropertiesVisible = false;
		var properties = document.getElementById(id + '_Properties');
		if (properties != null && properties.style.display === 'block')
			isAdvancedPropertiesVisible = true;

		var advancedEnabledId = advancedEnabledIds[id];
		var advancedEnabled = document.getElementById(advancedEnabledId);

		for (var i = 0; i < count; ++i) {
			var row = body.rows[i];

			var columnSelect = EBC_GetSelectByName(row, 'Column');
			if (columnSelect != null)
				columnSelect.disabled = chartTypes[id] === '';

			var currentChartItemContext = getChartItemContext(chartItems, i);

			var labels = document.getElementsByName(id + '_CHCLabel');
			var label = labels.length > 0 && i < labels.length ? labels[i] : null;
			if (label != null)
				label.innerText = currentChartItemContext.label || '';

			var tdElements = row.getElementsByTagName('TD');
			var tdCount = tdElements.length;
			for (var j = 0; j < tdCount; ++j) {
				var tdElement = tdElements[j];
				var tdVisibilityMode = tdElement.getAttribute('visibilitymode');
				if (tdVisibilityMode === '2')
					tdElement.style.display = currentChartItemContext.orderVisible;
				else if (tdVisibilityMode === '3')
					tdElement.style.display = currentChartItemContext.valueRangeVisible ? '' : 'none';
				else if (tdVisibilityMode === '-3')
					tdElement.style.display = currentChartItemContext.valueRangeVisible ? 'none' : '';
			}


			var divElements = row.getElementsByTagName('DIV');
			var divCount = divElements.length;
			for (var k = 0; k < divCount; ++k) {
				var divElement = divElements[k];
				var divVisibilityMode = divElement.getAttribute('visibilityMode');
				if (divVisibilityMode === '1')
					divElement.style.display = currentChartItemContext.functionVisible;
				if (divVisibilityMode === '2')
					divElement.style.display = currentChartItemContext.orderVisible;
				if (divVisibilityMode === '3')
					divElement.style.display = currentChartItemContext.valueRangeVisible ? '' : 'none';
				if (divVisibilityMode === 'Advanced_2') {
					if (advancedEnabled != null && advancedEnabled.value === 'true')
						divElement.style.display = currentChartItemContext.orderVisible;

					divElement.setAttribute('canBeVisible', currentChartItemContext.orderVisible === '' ? 'true' : 'false');
				}
			}

			if (currentChartItemContext.functionVisible === 'none') {
				var functionSelect = EBC_GetSelectByName(row, 'Function');
				if (functionSelect != null)
					functionSelect.selectedIndex = 0;
			}

			var orderAscCheckbox = EBC_GetElementByName(row, 'OrderAsc', 'INPUT');
			if (orderAscCheckbox != null)
				orderAscCheckbox.checked = currentChartItemContext.ascChecked;

			var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
			if (orderDescCheckbox != null)
				orderDescCheckbox.checked = currentChartItemContext.descChecked;

			var rowVisibility = izenda.isNull(currentChartItemContext.label) ||
				(!isAdvancedPropertiesVisible && currentChartItemContext.advanced)
				? 'none'
				: '';
			row.style.display = rowVisibility;
		}
	};

	var setPropertiesVisibility = function (id) {
		var propertiesDiv = document.getElementById(id + '_PropertiesDiv');
		if (propertiesDiv != null) {
			var chartItems = context.ChartTypes[chartTypes[id]];
			if (chartItems == null || !chartItems.haveProperties)
				propertiesDiv.style.display = 'none';
			else {
				propertiesDiv.style.display = '';

				var propertiesTable = document.getElementById(id + '_Properties');
				if (propertiesTable != null)
					for (var m = 0; m < propertiesTable.rows.length; m++) {
						var propertyRow = propertiesTable.rows[m];
						var mChartType = propertyRow.getAttribute('chartType');
						propertyRow.style.display = mChartType === chartTypes[id] ? '' : 'none';
					}
			}
		}
	};

	var setTitleDivVisibility = function (id, chartTypeSelect) {
		var titleDiv = document.getElementById(id + '_ChartTitleDiv');
		titleDiv.style.display = chartTypeSelect.value === '' || chartTypeSelect.value === '...' ? 'none' : 'block';

		var visualizationsDiv = document.getElementById(id + '_visualizationsDiv');
		if (visualizationsDiv != null) {
			var isVisualizationSelected = chartTypeSelect.value === 'Visualization';
			var displayType = isVisualizationSelected ? 'none' : 'table-cell';
			jq$(titleDiv).find('td[id$="_ChartRecordsLabel"], td[id$="_ChartRecords"]').css('display', displayType);
		}
	};

	var setVisualizationDivVisibility = function (id, chartTypeSelect) {
		var visualizationsDiv = document.getElementById(id + '_visualizationsDiv');
		if (visualizationsDiv != null) {
			var isVisualizationSelected = chartTypeSelect.value === 'Visualization';
			visualizationsDiv.style.display = isVisualizationSelected ? 'block' : 'none';
		}
	};

	var changeChartType = function (element, chartType, id) {
		if (element)
			ebc_mozillaEvent = element;

		var chartTypeSelect;
		if (element != null) {
			chartTypeSelect = element;
			chartTypes[id] = chartTypeSelect.value;
		} else {
			chartTypeSelect = document.getElementById(id + '_ChartTypeSelect');
			chartTypeSelect.value = chartType;
			chartTypes[id] = chartType;
		}

		var tableListExists = context.tableListById[id] != null &&
			context.tableListById[id] !== '' &&
			context.tableListById[id].length > 0;

		chartTypeSelect.disabled = !tableListExists;

		if (tableListExists) {
			if (context.tableListById[id].join != null)
				context.tableListById[id] = context.tableListById[id].join('\'');

			loadChartColumnsData(id);
		}

		setRowsVisibility(id);

		setPropertiesVisibility(id);

		setTitleDivVisibility(id, chartTypeSelect);

		setVisualizationDivVisibility(id, chartTypeSelect);
	};

	var getCurrentChartFields = function (id) {
		var chartType = document.getElementById(chartTypeSelectIds[id]).value;
		return context.ChartTypes[chartType];
	};

	var resetFirstRowProperties = function (id) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var count = body.rows.length;
		if (count > 0) {
			var firstRow = body.rows[0];
			var func = EBC_GetSelectByName(firstRow, 'Function');
			var column = EBC_GetSelectByName(firstRow, 'Column');
			if (func) {
				func.selectedIndex = 0;
				izenda.pages.designer.ChartColumnSelect_OnChange(column);
				updateOrderByAggregateFunction(firstRow, chartTypes[id]);
			}
		}
	};

	var getCurrentChartInfo = function (id) {
		var chartTypeSelect = document.getElementById(chartTypeSelectIds[id]);
		if (chartTypeSelect && chartTypeSelect.value !== '...')
			return context.ChartTypeInfo[chartTypeSelect.value];
	};

	/*
	 * event handlers
	 */

	ns.pages.designer.ChartFieldList_OnInit = function (id, fields) {
		if (!chartFieldListInitialized) {
			EBC_PopulateDescriptions(fields);
			izenda.pages.designer.ChartTableList_OnChange(id, context.tableListById[id]);
		}
		chartFieldListInitialized = true;
	};

	ns.pages.designer.ChartFieldList_OnChange = function(id, fields) {
		var pageContext = izenda.pages.designer.context;

		if (pageContext.qac_works)
			pageContext.qac_timers++;

		setTimeout(function() {
			EBC_PopulateDescriptions(fields);
			izenda.pages.designer.ChartTableList_OnChange(id, context.tableListById[id]);
			if (pageContext.qac_works) {
				pageContext.qac_timers--;
				izenda.pages.designer.QuickAdd_Close_Callback();
			}
		}, 0);
	};

	ns.pages.designer.ChartTargetReport_OnChange = function(element) {
		showHideEffect(element);
	};

	ns.pages.designer.ChartAdvancedPropertiesButton_OnClick = function(element, id) {
		showHideProperties(element, id);

		var table = document.getElementById(id);
		var body = table.tBodies[0];
		for (var i = 0; i < body.rows.length; i++) {
			var columnSelect = EBC_GetSelectByName(body.rows[i], 'Column');
			if (columnSelect != null && columnSelect.value === '...' && !columnSelect.forbidAutoSelect) {
				var optionCount = columnSelect.options.length;
				for (var j = 0; j < optionCount; j++)
					if (columnSelect.options[j].attributes['default'] != null &&
						columnSelect.options[j].attributes['default'].value === 'true') {
						columnSelect.selectedIndex = j;
						izenda.pages.designer.ChartColumnSelect_OnChange(columnSelect);
						break;
					}
			}

		}
	};

	ns.pages.designer.ChartFieldSortCheckbox_OnChange = function(element, id) {
		if (!element.checked)
			return;

		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var count = body.rows.length;
		for (var i = 0; i < count; i++) {
			var orderAscCheckbox = EBC_GetElementByName(body.rows[i], 'OrderAsc', 'INPUT');
			if (orderAscCheckbox != null && orderAscCheckbox !== element)
				orderAscCheckbox.checked = false;

			var orderDescCheckbox = EBC_GetElementByName(body.rows[i], 'OrderDesc', 'INPUT');
			if (orderDescCheckbox != null && orderDescCheckbox !== element)
				orderDescCheckbox.checked = false;
		}
	};

	ns.pages.designer.ChartColumnSelect_OnChange = function (element) {
		if (element)
			ebc_mozillaEvent = element;

		var row = EBC_GetRow(element);
		var columnSelect = EBC_GetSelectByName(row, 'Column');

		try {
			var oldValue = columnSelect.getAttribute('oldValue');
			var selectedIndex = columnSelect.selectedIndex;
			if (selectedIndex >= 0) {
				var selectedOption = columnSelect.options[selectedIndex];
				if (selectedOption.restrictselecting === 'true') {
					if (oldValue != null && selectedOption.value !== oldValue) {
						EBC_SetSelectedIndexByValue(columnSelect, oldValue);
						alert('This field cannot be selected.');
					}
				}
				columnSelect.setAttribute('oldValue', selectedOption.value);
			}
		} catch (exc) {
		}

		var id = EBC_GetParentTable(row).id;
		var table = document.getElementById(id);
		var rowIndex = row['sectionRowIndex'];

		var chartFields = getCurrentChartFields(id);
		var chartField = chartFields && rowIndex < chartFields.length ? chartFields[rowIndex] : null;
		var numericOnly = chartField != null && chartField.numericOnly;
		var defaultAggregateFunction = chartField == null ? 'None' : chartField.defaultAggregateFunction;

		// If typeGroup changed then try to set default function
		var tryToSetDefaultFunction = false;
		if (defaultAggregateFunction !== 'None') {
			if (columnSelect.selectedIndex >= 0) {
				var option = columnSelect.options[columnSelect.selectedIndex];
				var type = option.getAttribute('dataType');
				var oldType = row.getAttribute('oldDataType');
				if (!izenda.isNullOrEmptyString(oldType) && oldType !== type)
					tryToSetDefaultFunction = true;
				row.setAttribute('oldDataType', type);
			}
		}

		var functionSelect = EBC_GetSelectByName(row, 'Function');
		functionSelect.disabled = false;
		if (columnSelect.options.length === 0
			|| columnSelect.selectedIndex < 0
			|| columnSelect.selectedIndex > columnSelect.options.length - 1
			|| columnSelect.options[columnSelect.selectedIndex].value.indexOf(context.calcFieldPrefix) === 0) {
			functionSelect.disabled = true;
			defaultAggregateFunction = 'ForceNone';
			tryToSetDefaultFunction = true;
		}

		EBC_SetFunctions(row, true, numericOnly, defaultAggregateFunction,
			true, null, null, null, null, null, tryToSetDefaultFunction);
		EBC_SetFormat(row, true);

		if (chartField != null && izenda.isFunction(chartField.onChange))
			chartField.onChange(element);

		var body = table.tBodies[0];
		var count = 1;
		for (var i = 0; i < body.rows.length; i++) {
			var select = EBC_GetSelectByName(body.rows[i], 'Column');
			if (select == null || select.value === '' || select.disabled) {
				count = 0;
				break;
			}
		}

		EBC_CheckFieldsCount(id, count);
	};

	ns.pages.designer.ChartFunctionSelect_OnChange = function(event) {
		var selectElement = AdHoc.Utility.getElementByEvent(event);
		var row = AdHoc.Utility.findParentElement(selectElement, 'tr');

		if (row == null)
			return;

		var table = AdHoc.Utility.findParentElement(row, 'table');
		updateGrouping(selectElement, table);

		EBC_SetFormat(row, true);
	};

	ns.pages.designer.ChartTypeSelect_OnChange = function(element, chartType, id) {
		changeChartType(element, chartType, id);
		resetFirstRowProperties(id);
	};

	ns.pages.designer.ChartSeparator_OnChange = function(element) {
		if (element)
			ebc_mozillaEvent = element;

		var row = EBC_GetRow(element);
		var table = EBC_GetParentTable(row);
		var chartType = '';

		var chartTypeSelect = document.getElementById(chartTypeSelectIds[table.id]);
		if (chartTypeSelect && chartTypeSelect.value !== '...')
			chartType = chartTypeSelect.value;

		var prevValue = jq$(element).prop('prevvalue');
		if (chartType && prevValue != null && prevValue !== jq$(element).val()) {
			var legend = jq$(table).siblings('[id$="PropertiesDiv"]').find('[charttype="' + chartType + '"]')
				.find('input[name$="ShowLegend"]');
			var stacked = jq$(table).siblings('[id$="PropertiesDiv"]').find('[charttype="' + chartType + '"]')
				.find('input[name$="Stacked"]');

			var showSeparatorFeatures = element.value !== '...';

			if (legend.length > 0) {
				legend[0].checked = showSeparatorFeatures;
				legend[0].disabled = !showSeparatorFeatures;
				if (!showSeparatorFeatures)
					jq$(legend).attr('title',
						jsResources.RequireSeparatorSelection0.toString().replace(/\{0\}/g, jsResources.ShowLegend));
			}
			if (stacked.length > 0) {
				stacked[0].checked = showSeparatorFeatures;
				stacked[0].disabled = !showSeparatorFeatures;
				if (!showSeparatorFeatures)
					jq$(stacked).attr('title',
						jsResources.RequireSeparatorSelection0.toString().replace(/\{0\}/g, jsResources.Stacked));
			}
		}
		jq$(element).prop('prevvalue', jq$(element).val());
	};

	ns.pages.designer.ChartParetoCheckBox_OnChange = function(element) {
		if (element)
			ebc_mozillaEvent = element;

		var row = EBC_GetRow(element);
		var table = EBC_GetParentTable(row);
		var row2 = EBC_GetRow(table);
		var table2 = EBC_GetParentTable(row2);
		var table2Id = table2.id;
		var lastSub = table2Id.lastIndexOf('_');
		var searchId = table2Id.substr(0, lastSub);
		var chartInfo = getCurrentChartInfo(searchId);
		if (chartInfo != null) {
			var showRigthTitleValueControl = document.getElementsByName(chartInfo.showRightTitleValueControlName)[0];
			var fieldValueControl = document.getElementById(searchId + '_FieldValue');
			if (showRigthTitleValueControl == null || fieldValueControl == null)
				return;
			showRigthTitleValueControl.disabled = !element.checked && fieldValueControl.value === '...';
		}
	};

	ns.pages.designer.ChartHorizontalCheckBox_OnChange = function(element) {
		if (element)
			ebc_mozillaEvent = element;

		var isChecked = element.checked;
		var row = EBC_GetRow(element);
		var table = EBC_GetParentTable(row);
		var row2 = EBC_GetRow(table);
		var table2 = EBC_GetParentTable(row2);
		var tableId = table2.id;
		var lastSub = tableId.lastIndexOf('_');
		var searchName = tableId.substr(0, lastSub) + '_Bar_Pareto';

		var pareto = document.getElementsByName(searchName)[0];
		if (pareto != null && isChecked)
			pareto.checked = false;
		if (pareto != null)
			pareto.disabled = isChecked;

		var jqtable = jq$(table);
		jqtable.find('[name=ChartLabelTitleBottom]').toggle(!isChecked);
		jqtable.find('[name=ChartValueTitleLeft]').toggle(!isChecked);
		jqtable.find('[name=ChartRightValueTitleRight]').toggle(!isChecked);
		jqtable.find('[name=ChartLabelTitleLeft]').toggle(isChecked);
		jqtable.find('[name=ChartValueTitleBottom]').toggle(isChecked);
		jqtable.find('[name=ChartRightValueTitleTop]').toggle(isChecked);
	};

	ns.pages.designer.ChartLine_OnChange = function(element) {
		if (element)
			ebc_mozillaEvent = element;

		var row = EBC_GetRow(element);
		var table = EBC_GetParentTable(row);
		var chartInfo = getCurrentChartInfo(table.id);
		if (chartInfo != null) {
			var showAreaValueControl = document.getElementsByName(chartInfo.showAreaControlName)[0];
			showAreaValueControl.disabled = (element.value === '...');
			if (showAreaValueControl.disabled)
				showAreaValueControl.checked = false;

			var showParetoValueControl = document.getElementsByName(chartInfo.showParetoControlName)[0];
			showParetoValueControl.disabled = element.value !== '...';
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
			showRigthTitleValueControl.disabled = element.value === '...' && !paretoAllow;
		}
	};

	ns.pages.designer.Chart_OnInit = function (id, chartType, advancedEnabledId) {
		chartTypeSelectIds[id] = id + '_ChartTypeSelect';
		chartTypes[id] = chartType;
		advancedEnabledIds[id] = advancedEnabledId;

		if (chartTypes[id] == null || chartTypes[id] === '...')
			chartTypes[id] = '';

		EBC_RegisterControl(id);

		var el = document.getElementById(chartTypeSelectIds[id]);
		el.value = chartTypes[id];
		if (chartTypes[id] === '')
			changeChartType(null, chartTypes[id], id);
	};

	ns.pages.designer.ChartTableList_OnChange = function (id, tables) {
		var pageContext = izenda.pages.designer.context;

		var JTCS_Init_executes_val = ns.isDefined(JTCS_Init_executes) && JTCS_Init_executes === true;

		if (pageContext.qac_works || JTCS_Init_executes_val) {
			tableListOnChangeLastCallParams = new Array();
			tableListOnChangeLastCallParams[0] = id;
			tableListOnChangeLastCallParams[1] = tables;
			return;
		}
		context.tableListById[id] = tables;
		changeChartType(null, chartTypes[id], id);
	};

	/*
	 * public methods
	 */

	ns.pages.designer.CallChartTableListChangeHandlerWithStoredParams = function () {
		if (tableListOnChangeLastCallParams == null || tableListOnChangeLastCallParams.length !== 2)
			return;
		izenda.pages.designer.ChartTableList_OnChange(tableListOnChangeLastCallParams[0], tableListOnChangeLastCallParams[1]);
	};

})(window.izenda || (window.izenda = {}));
