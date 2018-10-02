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

	var loadCalled = [];
	var groupByMonthName = null;
	var allowComparativeArithmetic = null;
	var fieldValueCheckedList = {};
	var mustGroupOrFunctionList = {};
	var onColumnInitHandlers = {};
	var onColumnFunctionChangeHandlers = {};

	var groupingContext = {};
	groupingContext.oldIsCorrect = true;
	groupingContext.isCorrect = true;
	groupingContext.showWarning = false;
	groupingContext.lastCallParams = new Array();

	var context = ns.pages.designer.context;
	context.fieldtab_tables = {};
	context.qac_works = ns.getValue(context.qac_works, false);
	context.qac_requests = ns.getValue(context.qac_requests, 0);
	context.qac_timers = ns.getValue(context.qac_timers, 0);

	/*
	 * private methods
	 */

	function callFunctionSelectOnChangeHandlers(id, columnName, functionName) {
		columnName = columnName == null ? 'Column' : columnName;
		functionName = functionName == null ? 'Function' : functionName;

		var handlers = onColumnFunctionChangeHandlers[id];
		var fields = ns.pages.designer.GetFieldsList(id, columnName, functionName);
		EBC_CheckFieldsCount(id, fields.length);
		if (handlers != null)
			for (var i = 0; i < handlers.length; i++)
				handlers[i].func(handlers[i].id, fields);
	}

	function setAcceptableValues(row, operationElem, columnName, functionName) {
		if (operationElem.ElementExists()) {
			var columnSelect = EBC_GetSelectByName(row, columnName == null ? 'Column' : columnName);

			if (columnSelect.selectedIndex > -1) {
				var funcSelect = EBC_GetSelectByName(row, functionName == null ? 'Function' : functionName);

				var dataTypeGroup = columnSelect.options[columnSelect.selectedIndex].getAttribute('dataTypeGroup');
				var isDateDataTypeGroup = dataTypeGroup === 'DateTime' || dataTypeGroup === 'Date';
				var isNumericDataTypeGroup = dataTypeGroup === 'Numeric' || dataTypeGroup === 'Real' || dataTypeGroup === 'Money';
				var isNumericFunction = funcSelect.value === 'COUNT' ||
					funcSelect.value === 'COUNT_DISTINCT' ||
					funcSelect.value === 'DAYS_OLD' ||
					funcSelect.value === 'AVG_DAYS_OLD' ||
					funcSelect.value === 'SUM_DAYS_OLD';

				var acceptableValues = null;
				if (isNumericDataTypeGroup || isNumericFunction)
					acceptableValues = allowComparativeArithmetic ? 'arithmetic1' : 'arithmetic2';
				else if (isDateDataTypeGroup)
					acceptableValues = allowComparativeArithmetic ? 'arithmetic5' : 'arithmetic6';
				else
					acceptableValues = allowComparativeArithmetic ? 'arithmetic3' : 'arithmetic4';

				operationElem.setAcceptableValues(acceptableValues);
			}
		}
	}

	function loadColumns(id, path, options, columnName) {
		if (JTCS_Init_executes)
			return;

		columnName = columnName != null && columnName !== '' ? columnName : 'Column';

		var table = document.getElementById(id);
		var body = table.tBodies[0];
		for (var i = 0; i < body.rows.length; i++) {
			loadCalled[i] = true;
			var row = body.rows[i];
			var columnSelect = EBC_GetSelectByName(row, columnName);
			if (columnSelect != null)
				EBC_LoadData(path, options, columnSelect);
		}
	}

	function resetRowToDefault(context) {
		var row = context.row,
			strColumn = context.strColumn,
			strFunction = context.strFunction,
			isExtraColumn = context.strColumn === 'ExtraValue',
			emptyRow = context.emtpyRow;

		var prefix = isExtraColumn ? 'Extra' : '';
		var columnSelect = EBC_GetSelectByName(row, strColumn);
		if (emptyRow) {
			columnSelect.PreparingNewRow = true;
			columnSelect.selectedIndex = 0;
			columnSelect.disabled = false;
			columnSelect.PreparingNewRow = false;
		}
		var isColumnSelected =
			!(columnSelect.value === '' || columnSelect.value === '...' || columnSelect.selectedIndex === -1);

		if (row && columnSelect) {
			if (EBC_IsRealChangedSelValue(columnSelect)) {
				row.setAttribute('userChanged', 'false');
			}

			var parentTable = EBC_GetParentTable(row);

			var dataTypeGroup = '';
			if (columnSelect.selectedIndex !== -1) {
				dataTypeGroup = EBC_GetDataTypeGroup(row, strColumn, strFunction, null);
				if (dataTypeGroup == null)
					dataTypeGroup = '';
			}

			var isBinaryDataTypeGroup = dataTypeGroup === 'Binary';
			var disabledSort = isBinaryDataTypeGroup;

			/* 
			 * General Field Settings
			 */

			/* Description */
			var descriptionInput = EBC_GetInputByName(row, prefix + 'Description');
			if (descriptionInput) {
				descriptionInput.value = '';
				descriptionInput.disabled = false;

				if (!emptyRow)
					EBC_SetDescription(row, true);
			}

			/* Function */
			var funcSelect = EBC_GetSelectByName(row, strFunction);
			if (funcSelect) {
				funcSelect.PreparingNewRow = true;
				funcSelect.selectedIndex = 0;
				funcSelect.disabled = false;
				funcSelect.PreparingNewRow = false;
			}

			var mustGroupOrFunction = false;
			var body = parentTable.tBodies[0];
			var rows = body.rows;
			var i = 0;
			var count = rows.length;
			while (!mustGroupOrFunction && i < count) {
				var funcTemp = EBC_GetSelectByName(rows[i], strFunction);
				var groupCheckboxTemp = EBC_GetElementByName(rows[i], prefix + 'Group', 'INPUT');
				var isGruopChecked = groupCheckboxTemp && groupCheckboxTemp.checked;
				var isScalar = funcTemp == null ? null : funcTemp.options[funcTemp.selectedIndex].getAttribute('isScalar');
				isScalar = isScalar == null || isScalar.length === 0 ? '0' : isScalar;
				mustGroupOrFunction =
					(funcTemp == null ? false : (funcTemp.selectedIndex > 0 || isGruopChecked) && isScalar === '0');
				i++;
			}

			/* Group */
			var groupCheckbox = EBC_GetElementByName(row, prefix + 'Group', 'INPUT');
			if (groupCheckbox) {
				groupCheckbox.checked = mustGroupOrFunction && isColumnSelected;
				groupCheckbox.disabled = false;
				mustGroupOrFunction = false;
			}

			/* Sort */
			var orderCheckbox = EBC_GetElementByName(row, prefix + 'Order', 'INPUT');
			if (orderCheckbox) {
				orderCheckbox.checked = false;
				orderCheckbox.disabled = disabledSort;
			}

			/* VG */
			var masterCheckbox = EBC_GetElementByName(row, prefix + 'Master', 'INPUT');
			if (masterCheckbox) {
				masterCheckbox.checked = false;
				masterCheckbox.disabled = false;
			}

			/* A */
			var arithmeticOperationElem = new AdHoc.MultivaluedCheckBox(prefix + 'ArithmeticOperation', row);
			if (arithmeticOperationElem.ElementExists()) {
				if (!isColumnSelected || isBinaryDataTypeGroup) {
					arithmeticOperationElem.disable();
				} else {
					arithmeticOperationElem.enable();
					var wasValue = arithmeticOperationElem.valueElement.value;
					arithmeticOperationElem.setValueInternal(' ');
					if (wasValue !== ' ')
						izenda.pages.designer.ArithmeticOperationElement_AfterChange(ebc_mozillaEvent);
				}
			}

			/* 
			 * Advanced Field Settings
			 */

			/* Column Group */
			var columnGroupInput = EBC_GetInputByName(row, prefix + 'ColumnGroup');
			if (columnGroupInput) {
				columnGroupInput.value = columnGroupInput.getAttribute('data-default') || '';;
				columnGroupInput.disabled = false;
			}

			/* Break Page After VG (PDF) */
			var breakPageCheckbox = EBC_GetElementByName(row, prefix + 'BreakPage', 'INPUT');
			if (breakPageCheckbox) {
				breakPageCheckbox.checked = false;
				breakPageCheckbox.disabled = true;
			}

			/* Multiline Header */
			var multilineHeaderCheckbox = EBC_GetElementByName(row, prefix + 'IsMultilineHeader', 'INPUT');
			if (multilineHeaderCheckbox) {
				multilineHeaderCheckbox.checked = false;
				multilineHeaderCheckbox.disabled = false;
			}

			/* Hide this field */
			var invisibleCheckbox = EBC_GetElementByName(row, prefix + 'Invisible', 'INPUT');
			if (invisibleCheckbox) {
				invisibleCheckbox.checked = false;
				invisibleCheckbox.disabled = false;
			}

			/* Separator */
			var separatorCheckbox = EBC_GetElementByName(row, prefix + 'Separator', 'INPUT');
			if (separatorCheckbox) {
				separatorCheckbox.checked = false;
				separatorCheckbox.disabled = true;
			}

			/* Sort (z-a) */
			var orderDescCheckbox = EBC_GetElementByName(row, prefix + 'OrderDesc', 'INPUT');
			if (orderDescCheckbox) {
				orderDescCheckbox.checked = false;
				orderDescCheckbox.disabled = disabledSort;
			}

			/* Italic */
			var italicCheckbox = EBC_GetElementByName(row, prefix + 'Italic', 'INPUT');
			if (italicCheckbox) {
				italicCheckbox.checked = false;
				italicCheckbox.disabled = false;
			}

			/* Bold */
			var boldCheckbox = EBC_GetElementByName(row, prefix + 'Bold', 'INPUT');
			if (boldCheckbox) {
				boldCheckbox.checked = false;
				boldCheckbox.disabled = false;
			}

			/* Width */
			var widthInput = EBC_GetInputByName(row, prefix + 'Width');
			if (widthInput) {
				widthInput.value = widthInput.getAttribute('data-default') || '';
				widthInput.disabled = false;
			}

			/* Label Justification */
			var labelJustificationElem = new AdHoc.MultivaluedCheckBox(prefix + 'LabelJustification', row);
			if (labelJustificationElem.ElementExists()) {
				labelJustificationElem.enable();
				labelJustificationElem.setValueInternal('M');
			}

			/* Value Justification */
			var justificationElem = new AdHoc.MultivaluedCheckBox(prefix + 'Justification', row);
			if (justificationElem.ElementExists()) {
				justificationElem.enable();
				justificationElem.setValueInternal(' ');
			}

			/* Subreport */
			var subreportSelect = EBC_GetSelectByName(row, prefix + 'Subreport');
			if (subreportSelect) {
				subreportSelect.selectedIndex = 0;
				subreportSelect.disabled = false;
			}

			/* Drill-Down Style */
			var drillDownStyleSelect = EBC_GetSelectByName(row, prefix + 'DrillDownStyle');
			if (drillDownStyleSelect) {
				drillDownStyleSelect.selectedIndex = 0;
				drillDownStyleSelect.disabled = true;
			}

			/* Url */
			var urlInput = EBC_GetInputByName(row, prefix + 'Url');
			if (urlInput) {
				urlInput.value = urlInput.getAttribute('data-default') || '';
				urlInput.disabled = false;
			}

			/* Subtotal Function */
			var subtotalFunctionSelect = EBC_GetSelectByName(row, prefix + 'SubtotalFunction');
			if (subtotalFunctionSelect) {
				subtotalFunctionSelect.selectedIndex = 0;
				subtotalFunctionSelect.disabled = false;
			}

			/* Subtotal Expression */
			var subtotalExpressionInput = EBC_GetElementByName(row, prefix + 'SubtotalExpression', 'TEXTAREA');
			if (subtotalExpressionInput) {
				subtotalExpressionInput.value = subtotalExpressionInput.getAttribute('data-default') || '';
				subtotalExpressionInput.disabled = false;
			}

			/* Gradient Cells Shading */
			var gradientCheckbox = EBC_GetElementByName(row, prefix + 'Gradient', 'INPUT');
			if (gradientCheckbox) {
				gradientCheckbox.checked = false;
				gradientCheckbox.disabled = false;
			}

			/* Text Highlight */
			var textHighlightInput = EBC_GetInputByName(row, prefix + 'TextHighlight');
			if (textHighlightInput) {
				textHighlightInput.value = textHighlightInput.getAttribute('data-default') || '';
				textHighlightInput.disabled = false;
			}

			/* Cell Highlight */
			var cellHighlightInput = EBC_GetInputByName(row, prefix + 'CellHighlight');
			if (cellHighlightInput) {
				cellHighlightInput.value = cellHighlightInput.getAttribute('data-default') || '';
				cellHighlightInput.disabled = false;
			}

			/* Value Ranges */
			var valueRangesInput = EBC_GetInputByName(row, prefix + 'ValueRanges');
			if (valueRangesInput) {
				valueRangesInput.value = valueRangesInput.getAttribute('data-default') || '';
				valueRangesInput.disabled = false;
			}

			/* Expression */
			var expressionInput = EBC_GetElementByName(row, prefix + 'Coefficient', 'TEXTAREA');
			if (expressionInput) {
				expressionInput.value = expressionInput.getAttribute('data-default') || '';
				expressionInput.disabled = false;
			}

			/* Expression type */
			var expressionTypeSelect = EBC_GetSelectByName(row, prefix + 'ExpressionType');
			if (expressionTypeSelect) {
				expressionTypeSelect.selectedIndex = 0;
				expressionTypeSelect.disabled = true;
			}

			/* Group By Expression */
			var groupByExpressionCheckbox = EBC_GetElementByName(row, prefix + 'GroupByExpression', 'INPUT');
			if (groupByExpressionCheckbox) {
				groupByExpressionCheckbox.checked = false;
				groupByExpressionCheckbox.disabled = false;
			}

			/* 
			 * Post-Actions
			 */
			if (!row.ThisRowIsBeingAddedAsNew) {
				EBC_SetFunctions(row, mustGroupOrFunction, false, null, true, strFunction, null, null, strColumn);
				EBC_SetFunctions(row, mustGroupOrFunction, false, null, true, prefix + 'SubtotalFunction', false, true, strColumn);
			}

			if (isColumnSelected && strColumn === (prefix + 'Column'))
				checkAdvancedPropertiesModified(row);

			if (arithmeticOperationElem.ElementExists())
				setAcceptableValues(row, arithmeticOperationElem);

			var fieldIdInput = EBC_GetInputByName(row, prefix + 'FldId');
			if (fieldIdInput)
				fieldIdInput.value = GenerateGuid();
		}
	}

	function checkGroupingAndFunctions(id) {
		if (context.qac_works) {
			groupingContext.lastCallParams = new Array();
			groupingContext.lastCallParams[0] = id;
			return;
		}

		var table = document.getElementById(id);
		if (table.attributes['eventID'] != null) {
			id = table.attributes['eventID'].value;
			table = document.getElementById(id);
		}

		var mustGroupOrFunction = mustGroupOrFunctionList[id];
		if (fieldValueCheckedList[id])
			mustGroupOrFunction = false;

		var body = table.tBodies[0];
		groupingContext.oldIsCorrect = groupingContext.isCorrect;
		groupingContext.isCorrect = true;

		var isArithmeticProblem = false;
		var rowCount = body.rows.length;
		if (rowCount > 0) {
			var isGrouped = 'NotSet';
			for (var i = 0; i < rowCount; i++) {
				var row = body.rows[i];
				if (row._scColumnChangeFired)
					continue;

				//Gets the name of the first control in the row with an onchange attribute like ColumnSelect_OnChange
				var strSelectName = jq$(body.rows[i]).find('select[onchange*=ColumnSelect_OnChange]').attr('name');
				if (strSelectName == null)
					continue; //not a row with a valid select element

				strSelectName = strSelectName.substr(strSelectName.lastIndexOf('_') + 1);

				//Gets the name of the first control in the row with an onchange attribute like FunctionSelect_OnChange
				var strFunctionName = jq$(body.rows[i]).find('select[onchange*=FunctionSelect_OnChange]').attr('name');
				strFunctionName = strFunctionName.substr(strFunctionName.lastIndexOf("_") + 1);

				var columnSelect = EBC_GetSelectByName(row, strSelectName);
				var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
				var isOperation = operationElem.ElementExists() && !operationElem.isDefault();

				if (columnSelect != null) {
					if (columnSelect.value !== '...') {
						var funcSelect = EBC_GetSelectByName(row, strFunctionName);
						var functionIsNoneOrNotSelected = funcSelect.value === 'None' || funcSelect.value === '...';

						var isScalar = funcSelect.options[funcSelect.selectedIndex].getAttribute('isScalar');
						if (isScalar == null || isScalar.length === 0)
							isScalar = '0';

						if (!isOperation) {
							var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
							var groupChecked = groupCheckbox != null && groupCheckbox.checked;

							if (mustGroupOrFunction) {
								if (!groupChecked && (functionIsNoneOrNotSelected || isScalar == '1')) {
									groupingContext.isCorrect = false;
									break;
								}
							} else if (isGrouped === 'NotSet')
								isGrouped = (groupChecked || (!functionIsNoneOrNotSelected && isScalar == '0'));
							else if ((groupChecked || (!functionIsNoneOrNotSelected && isScalar == '0')) !== isGrouped) {
								groupingContext.isCorrect = false;
								break;
							}
						} else if (funcSelect.value === 'GROUP')
							isArithmeticProblem = true;
					}
				}
			}
		}

		var messageText = mustGroupOrFunctionList[id]
			? jsResources.EachSelectionMustBeEitherGroupedOrAFunction
			: messageText = jsResources.IfFunctionsAreUsedEachSelectionMustBeAFunction;

		var message = document.getElementById(table.id + '_Message');
		if (message) {
			message.innerHTML = messageText;
			message.style.display = groupingContext.isCorrect ? 'none' : 'block';
		}

		if (!groupingContext.showWarning && groupingContext.isCorrect !== groupingContext.oldIsCorrect) {
			if (typeof DisableEnablePreviewTab !== 'undefined')
				izenda.callIfFunction(DisableEnablePreviewTab, !groupingContext.isCorrect);
			if (typeof DisableEnableToolbar !== 'undefined')
				izenda.callIfFunction(DisableEnableToolbar, !groupingContext.isCorrect);
		}

		checkTotals(id);
	}

	function checkGroupingAndFunctionsWithStoredParams() {
		if (groupingContext.lastCallParams == null || groupingContext.lastCallParams.length !== 1)
			return;
		checkGroupingAndFunctions(groupingContext.lastCallParams[0]);
	}

	function toogleAdvancedPropertiesButtonState(row, state) {
		var advancedPropertiesButtonImage = EBC_GetElementByName(row, 'AdvancedButton', 'IMG');
		var src = advancedPropertiesButtonImage.getAttribute('src');
		var index = src.indexOf('advanced-settings');
		src = src.substring(0, index);
		src += 'advanced-settings' + (state ? '-dot' : '') + '.png';
		advancedPropertiesButtonImage.setAttribute('src', src);
	}

	function checkAdvancedPropertiesModified(row) {
		var result = false;

		var propertiesTable = EBC_GetElementByName(row, 'PropertiesTable', 'table');
		if (propertiesTable != null) {
			var propertyRow = propertiesTable.rows;
			for (var i = 0; i < propertyRow.length && !result; i++) {
				var cell = propertyRow[i].cells[1];
				if (cell != null) {
					var element = cell.firstChild;
					if (element != null) {
						var tagName = element.nodeName;
						var elType = element.getAttribute('type');
						if (tagName === 'TABLE') {
							element = element.rows[0].cells[0].firstChild;
							tagName = element.nodeName;
							elType = element.getAttribute('type');
						}
						switch (tagName) {
							case 'INPUT':
								switch (elType) {
									case 'text':
										var textValue = element.value;
										result = !izenda.isNullOrEmptyString(textValue) && !izenda.isExampleString(textValue);
										break;
									case 'checkbox':
										result = element.checked;
										break;
									case 'hidden':
										var hiddenValue = element.value;
										var defaultValue = element.getAttribute('data-default');
										result = hiddenValue && defaultValue && hiddenValue !== defaultValue && hiddenValue !== '&nbsp;';
										break;
								}
								break;
							case 'SELECT':
								var selectValue = element.value;
								result = !(izenda.isNullOrEmptyString(selectValue) ||
									izenda.matchAny(selectValue, ['...', 'DEFAULT']) ||
									izenda.isExampleString(selectValue));
								break;
							case 'DIV':
								var childNode = element.firstChild;
								if (childNode.nodeName === 'INPUT') {
									var cnName = childNode.getAttribute('name');
									if (cnName.indexOf('_LabelJustificationCurrentValue') >= 0 ||
										cnName.indexOf('_ExtraLabelJustificationCurrentValue') >= 0)
										result = (childNode.value !== 'M');
									else if (cnName.indexOf('_JustificationCurrentValue') >= 0 ||
										cnName.indexOf('_ExtraJustificationCurrentValue') >= 0)
										result = childNode.value !== ' ' && childNode.value !== String.fromCharCode(160);
								}
								break;
							case 'TEXTAREA':
								var taValue = element.value;
								result = !izenda.isNullOrEmptyString(taValue) && !izenda.isExampleString(taValue);
								break;
						}
					}
				}
			}
		}

		toogleAdvancedPropertiesButtonState(row, result);

		return result;
	}

	function smartMarkingGroupingAndFunctions(id, groupOn) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var rowCount = body.rows.length;

		if (rowCount > 0) {
			var groupingCount = 0;
			var functionsCount = 0;
			var notEmptyRowCount = 0;

			for (var i = 0; i < rowCount; i++) {
				var row = body.rows[i];

				var columnSelect = EBC_GetSelectByName(row, 'Column');
				var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
				if (operationElem.ElementExists() && !operationElem.isDefault())
					continue;
				if (columnSelect == undefined || columnSelect == null || columnSelect.value === '...')
					continue;

				notEmptyRowCount++;
				var funcSelect = EBC_GetSelectByName(row, 'Function');
				var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');

				var isScalar = funcSelect.options[funcSelect.selectedIndex].getAttribute("isScalar");
				if (isScalar == null || isScalar.length === 0)
					isScalar = '0';

				if ((groupCheckbox != null && groupCheckbox.checked) || funcSelect.value === 'GROUP')
					groupingCount++;
				else if (funcSelect.value !== 'None' && isScalar == '0')
					functionsCount++;
			}

			if ((functionsCount === 1 && groupingCount === 0 || functionsCount === 0 && groupingCount === 1) && groupOn) {
				for (var j = 0; j < rowCount; j++) {
					var row = body.rows[j];
					var columnSelect = EBC_GetSelectByName(row, 'Column');
					var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
					if (operationElem.ElementExists() && !operationElem.isDefault())
						continue;
					if (columnSelect != null && columnSelect.value !== '...') {
						var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
						var funcSelect = EBC_GetSelectByName(row, 'Function');
						if (funcSelect.value === 'None') {
							if (groupCheckbox != null)
								groupCheckbox.checked = true;
							else {
								EBC_SetSelectedIndexByValue(funcSelect, 'GROUP');
							}
						}
					}
				}
			} else if (functionsCount === 0 && groupingCount === notEmptyRowCount - 1 && !groupOn) {
				for (var k = 0; k < rowCount; k++) {
					var row = body.rows[k];
					var columnSelect = EBC_GetSelectByName(row, 'Column');
					var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
					if (operationElem.ElementExists() && !operationElem.isDefault())
						continue;
					if (columnSelect != null && columnSelect.value !== '...') {
						var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
						var funcSelect = EBC_GetSelectByName(row, 'Function');
						if (groupCheckbox != null)
							groupCheckbox.checked = false;
						else
							funcSelect.value = 'None';
					}
				}
			}
		}
	}

	function checkTotals(id) {
		var index = id.indexOf('_ExtraColumn');
		if (index > 0)
			id = id.substring(id.length - 12, 0);

		var totalsSelect = document.getElementsByName(id + '_SubtotalsFunction')[0];
		var totalsDiv = document.getElementById(id + '_TotalsDiv');
		if (totalsSelect == null)
			return;

		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var rowCount = body.rows.length;
		var numerics = false;
		if (rowCount > 0) {
			for (var i = 0; i < rowCount; i++) {
				var row = body.rows[i];
				var columnSelect = EBC_GetSelectByName(row, 'Column');
				if (columnSelect == null)
					continue;
				if (columnSelect.selectedIndex == -1)
					continue;
				var dataTypeGroup = EBC_GetDataTypeGroup(row);
				if (dataTypeGroup === 'Numeric' || dataTypeGroup === 'Real' || dataTypeGroup === 'Money') {
					numerics = true;
					break;
				}
			}
		}

		if (!numerics) {
			var extraRow = document.getElementById(id + '_ExtraColumn_valueTR');
			if (extraRow != null) {
				if (extraRow.style.display !== 'none') {
					var dataTypeGroup = EBC_GetDataTypeGroup(extraRow, 'ExtraValue', 'ExtraValueFunction', 'ExtraFormat');
					numerics = (dataTypeGroup === 'Numeric' || dataTypeGroup === 'Real' || dataTypeGroup === 'Money');
				}
			}
		}

		if (!numerics) {
			totalsSelect.disabled = true;
			totalsDiv.style.display = 'none';
		} else {
			totalsSelect.disabled = false;
			totalsDiv.style.display = '';
		}
	}

	function clearRowInputs(row) {
		var inputs = row.getElementsByTagName('INPUT');
		for (var i = 0; i < inputs.length; i++) {
			var input = inputs[i];

			var dataDefaultAttr = input.getAttribute('data-default');
			var isDataDefaultAttrExists = typeof dataDefaultAttr !== 'undefined' && dataDefaultAttr != null;

			if (input.type === 'checkbox')
				input.value = isDataDefaultAttrExists ? dataDefaultAttr.toLower() === 'true' : false;
			else if (input.type === 'text')
				input.value = isDataDefaultAttrExists ? dataDefaultAttr : input.value = '';
			else if (input.type === 'hidden')
				if (isDataDefaultAttrExists)
					input.value = dataDefaultAttr;
		}

		toogleAdvancedPropertiesButtonState(row, false);
	}

	function clearRowSelects(row) {
		var selElems = row.getElementsByTagName('SELECT');
		var selCount = selElems.length;
		for (var i = 0; i < selCount; i++) {
			var sel = selElems[i];
			if (sel.options.length > 0)
				sel.selectedIndex = 0;
		}
	}

	function initNewRow(row) {
		row.setAttribute('userChanged', 'false');
		initRow(row);
		clearRowInputs(row);
		checkGroupingAndFunctions(EBC_GetParentTable(row).id);
		row._scColumnChangeFired = false;
		row._scFunctionChangeFired = false;
		row._scFormatChangeFired = false;

		var strColumn = jq$(row).find('select[name$=_Column]').length > 0
			? 'Column'
			: jq$(row).find('select[name$=_ExtraValue]').length > 0
				? 'ExtraValue'
				: null,
			strFunction = jq$(row).find('select[name$=_Function]').length > 0
				? 'Function'
				: jq$(row).find('select[name$=_ExtraValueFunction]')
					? 'ExtraValueFunction'
					: null;
		resetRowToDefault({
			row: row,
			strColumn: strColumn,
			strFunction: strFunction,
			emtpyRow: true
		});
	}

	function initRow(row) {
		var id = EBC_GetParentTable(row).id;
		var context = izenda.pages.designer.context;

		var columnSelect = EBC_GetSelectByName(row, 'Column');
		if (columnSelect != null && context.fieldtab_tables[id] != null) {
			columnSelect.PreparingNewRow = true;
			EBC_LoadData('CombinedColumnList', 'tables=' + context.fieldtab_tables[id], columnSelect);
			columnSelect.PreparingNewRow = false;
		}

		var functionSelect = EBC_GetSelectByName(row, 'Function');
		if (functionSelect != null) {
			functionSelect.PreparingNewRow = true;
			EBC_LoadData('FunctionList', null, functionSelect);
			functionSelect.PreparingNewRow = false;
		}

		var formatSelect = EBC_GetSelectByName(row, 'Format');
		if (formatSelect != null) {
			formatSelect.PreparingNewRow = true;
			EBC_LoadData('FormatList', null, formatSelect);
			formatSelect.PreparingNewRow = false;
		}

		var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
		if (operationElem.ElementExists())
			izenda.pages.designer.ChangeArithmeticOperationForRow(row);
	}

	function changeAllTablesSelect(id, tables) {
		var allTablesSelect = document.getElementById(id + '_AllTables');
		if (allTablesSelect != null && tables != null && tables.join)
			EBC_LoadData('UsedTableList', 'tables=' + tables.join('\''), allTablesSelect);
	}

	function showExtraColumns(id) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var columnSelect = EBC_GetSelectByName(body.rows[0], 'ExtraColumn');
		var visibility = columnSelect != null && columnSelect.value !== '...';

		for (var i = 1; i < table.rows.length; i++) {
			var row = table.rows[i];
			row.style.display = visibility ? '' : 'none';
		}
	}

	function showAdvancedProperties(id) {
		var dialogRow = EBC_GetRow();
		context.propertiesTable = EBC_GetElementByName(dialogRow, 'PropertiesTable', 'table');

		ReportingServices.showOk(context.propertiesTable, function () {
			hideAdvancedProperties(id);
		}, { title: jsResources.AdvancedProperties, movable: true });
	}

	function hideAdvancedProperties(id) {
		ReportingServices.hideTip();

		var row = EBC_GetRow(context.propertiesTable);

		checkAdvancedPropertiesModified(row);

		var expressionTypeSelect = EBC_GetSelectByName(row, 'ExpressionType');
		if (row != null && expressionTypeSelect) {
			EBC_SetFormat(row, true);
			EBC_SetFunctions(row);
		}

		callFunctionSelectOnChangeHandlers(id);
		CC_UpdateFiltersFromLogic();
	}

	function toogleExpressionType(expressionInput) {
		var expressionRow = EBC_GetRow(expressionInput);

		if (!expressionRow)
			return;

		var propertiesTable = EBC_GetParentTable(expressionRow);
		if (!propertiesTable || propertiesTable.rows.length <= expressionRow.rowIndex + 1)
			return;

		var expressionTypeRow = propertiesTable.rows[expressionRow.rowIndex + 1];
		if (!expressionTypeRow)
			return;

		var expressionTypeSelect = EBC_GetSelectByName(expressionTypeRow, 'ExpressionType');
		if (!expressionTypeSelect)
			return;

		expressionTypeSelect.disabled =
			izenda.isNullOrEmptyString(expressionInput.value) || izenda.isExampleString(expressionInput.value);
		if (expressionTypeSelect.disabled)
			EBC_SetSelectedIndexByValue(expressionTypeSelect, '...');
	}

	function showQuickAdd(id, columnNumber, minInColumn, maxFieldWidth) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var rowCount = body.rows.length;
		if (rowCount <= 0)
			return;

		var values = {};
		for (var k = 0; k < rowCount; k++) {
			var row = body.rows[k];
			var select = EBC_GetSelectByName(row, 'Column');
			var value = select.value;
			if (value != null && value !== '...')
				values[value] = true;
		}

		var columnSelect = document.createElement('select');
		var div = document.createElement('div');
		div.appendChild(columnSelect);
		columnSelect = div.firstChild;

		var context = izenda.pages.designer.context;
		var selectResult = EBC_LoadData('CombinedColumnList', '&tables=' + context.fieldtab_tables[id], columnSelect, false);
		if (selectResult)
			columnSelect = selectResult;
		else if (div.childNodes.length > 0) {
			columnSelect = div.childNodes[0];
		}

		var html = '<div align="left" style="text-align:left;" class="quick-add-container"><div style="margin-bottom:6px;">' +
			jsResources.PleaseSelectTheFields +
			'</div>';

		var tables = {};
		var options = columnSelect.options;
		for (var l = 0; l < options.length; l++) {
			var group = options[l].getAttribute('optgroup');
			if (group != null) {
				if (tables[group] == null)
					tables[group] = new Array();
				tables[group].push(options[l]);
			}
		}

		var maxRows = 0;
		var xBase = 0;
		for (var key in tables) {
			if (tables.hasOwnProperty(key)) {
				var currentGroup = tables[key];
				var currentGroupLength = currentGroup.length;
				var rowNumber = Math.min(Math.max(Math.ceil(currentGroupLength / columnNumber), minInColumn), currentGroupLength);
				for (var m = 0; m < currentGroupLength; m++) {
					var y = m % rowNumber;
					var x = Math.floor(m / rowNumber) + xBase;
					var item = currentGroup[m];
					currentGroup[m] = { x: x, y: y, item: item };
				}
				xBase += currentGroup.width = Math.ceil(currentGroupLength / rowNumber);
				if (maxRows < rowNumber)
					maxRows = rowNumber;
			}
		}

		if (maxRows > 0) {
			html += '<style>#mdb table {width: 100%; font-size: 13px; text-align: left;}' +
				'#mdb table tr * {padding-right: 10px;}</style>';
			html += '<table>';
			html += '<tr>';
			for (var tkey in tables)
				if (tables.hasOwnProperty(tkey))
					html += '<th colspan="{colspan}">{key}</th>'.format({ colspan: tables[tkey].width, key: tkey });
			html += '</tr>';

			var optNum = 0;
			for (var i = 0; i < maxRows; i++) {
				html += '<tr>';
				for (var rkey in tables) {
					if (tables.hasOwnProperty(rkey)) {
						var currentTable = tables[rkey];
						var addEmpty = currentTable.width;

						for (var j = 0; j < currentTable.length; j++) {
							if (currentTable[j].y === i) {
								--addEmpty;
								var optionValue = currentTable[j].item.value;
								var optionTitle = currentTable[j].item.innerHTML;
								var optionText = optionTitle;
								if (optionTitle.length > maxFieldWidth)
									optionText = optionTitle.substr(0, maxFieldWidth - 3) + '...';

								var haveValue = values[optionValue];
								html +=
									'<td><nobr><input type=checkbox {attrs} value="{value}" id="FieldList_QuickAdd_{num}"> <span title="{title}">{text}</span></nobr></td>'
										.format({
											attrs: haveValue ? 'checked disabled' : '',
											value: optionValue.replaceAll('"', '&quot;'),
											num: optNum,
											title: optionTitle.replaceAll('"', '&quot;'),
											text: optionText
										});
								optNum++;
							}
						}

						while (addEmpty--)
							html += '<td>&nbsp;</td>';
					}
				}
				html += '</tr>';
			}
			html += '</table>';
		}
		html += '</div>';

		ReportingServices.showConfirm(html, closeQuickAdd, { ctx: id, title: jsResources.QuickAdd, movable: true });

		if (selectResult == null) {
			jq$('.quick-add-container').css('cursor', 'wait');
			setTimeout(function () { refreshQuickAdd(id, columnNumber, minInColumn, maxFieldWidth); }, 500);
		}
	}

	function refreshQuickAdd(id, columnNumber, minInColumn, maxFieldWidth) {
		var columnSel = document.createElement('select');
		var context = izenda.pages.designer.context;
		var selectResult = EBC_LoadData('CombinedColumnList', '&tables=' + context.fieldtab_tables[id], columnSel, false);

		if (selectResult)
			showQuickAdd(id, columnNumber, minInColumn, maxFieldWidth);
		else if (jq$('.quick-add-container').length > 0)
			setTimeout(function () { refreshQuickAdd(id, columnNumber, minInColumn, maxFieldWidth); }, 500);
	}

	function closeQuickAdd(result, context) {
		context.qac_timers = 0;
		context.qac_requests = 0;
		context.qac_works = true;

		try {
			if (result === jsResources.OK) {
				var table = document.getElementById(context.ctx);
				var max = table.getAttribute('max');
				var body = table.tBodies[0];
				var rowCount = body.rows.length;
				var needsGroup = false;
				var values = {};
				for (var i = 0; i < rowCount; i++) {
					var row = body.rows[i];
					var funcSelect = EBC_GetSelectByName(row, 'Function');
					var isScalar = funcSelect.options[funcSelect.selectedIndex].getAttribute('isScalar');
					if (isScalar == null || isScalar.length == 0)
						isScalar = '0';
					if (funcSelect.value !== 'None' && funcSelect.value !== '...' && isScalar == '0')
						needsGroup = true;
					var columnSel = EBC_GetSelectByName(row, 'Column');
					var v = columnSel.value;
					if (v != null && v != '...')
						values[columnSel.value] = true;
				}

				var lastRow = body.rows[rowCount - 1];
				var columnSel = EBC_GetSelectByName(lastRow, 'Column');
				var newColumnSel, newRow;
				var currentCheckBox;
				var added = false;
				for (var j = columnSel.options.length - 1; j >= 0; j--) {
					var chbId = 'FieldList_QuickAdd_' + j;
					currentCheckBox = document.getElementById(chbId);
					if (currentCheckBox == null || !currentCheckBox.checked)
						continue;

					var haveValue = values[currentCheckBox.value];
					if (haveValue)
						continue;

					if (max < table.tBodies[0].rows.length)
						continue;

					added = true;
					newRow = EBC_InsertRow(table, rowCount - 1);
					newRow.setAttribute('userChanged', '');
					clearRowInputs(newRow);
					clearRowSelects(newRow);
					newColumnSel = EBC_GetSelectByName(newRow, 'Column');
					newColumnSel.value = currentCheckBox.value;

					if (needsGroup) {
						var funcSelect = EBC_GetSelectByName(newRow, 'Function');
						EBC_SetSelectedIndexByValue(funcSelect, 'GROUP');
					}
					EBC_FireOnChange(newColumnSel);
				}

				while (max < table.tBodies[0].rows.length)
					EBC_RemoveRow(table.tBodies[0].rows[max]);

				if (added)
					callFunctionSelectOnChangeHandlers(context.ctx);
			}
		} finally {
		}
	}

	/*
	 * event handlers
	 */

	ns.pages.designer.TableList_OnInit = function (id, tables) {
		var context = izenda.pages.designer.context;
		context.fieldtab_tables[id] = tables;

		var fields = ns.pages.designer.GetFieldsList(id, 'Column', 'Function');
		EBC_CheckFieldsCount(id, fields.length);

		var handlers = onColumnInitHandlers[id];
		if (handlers != null) {
			for (var i = 0; i < handlers.length; i++)
				handlers[i].func(handlers[i].id, fields);
		}

		if (typeof TS_activateDefaultTab !== 'undefined')
			TS_activateDefaultTab();
	};

	ns.pages.designer.TableListWithExtraColumns_OnInit = function (id, tables) {
		var context = izenda.pages.designer.context;
		context.fieldtab_tables[id + '_ExtraColumn'] = tables;
		var fields = ns.pages.designer.GetFieldsList(id, 'ExtraColumn', 'ExtraFunction');
		EBC_CheckFieldsCount(id + '_ExtraColumn', fields.length);
		izenda.pages.designer.TableList_OnInit(id, tables);
	};

	ns.pages.designer.TableList_OnChange = function (id, tables, loadFields, extraColumn) {
		var isExtraColumn = extraColumn === true;

		var message = document.getElementById(id + '_Message');
		if (message) {
			message.innerHTML = jsResources.NoTablesSelected;
			message.style.display = tables === '' ? 'block' : 'none';
		}

		if (tables.join != null) {
			changeAllTablesSelect(id, tables);
			tables = tables.join('\'');
		}
		else {
			var tablesArray = tables.split("'");
			changeAllTablesSelect(id, tablesArray);
		}

		var context = izenda.pages.designer.context;
		context.fieldtab_tables[id] = tables;
		if (isExtraColumn) {
			loadColumns(id, 'CombinedColumnList', 'tables=' + tables, 'ExtraColumn');
			loadColumns(id, 'CombinedColumnList', 'tables=' + tables, 'ExtraValue');
		}
		else
			loadColumns(id, 'CombinedColumnList', 'tables=' + tables);
	};

	ns.pages.designer.TableListWithExtraColumns_OnChange = function (id, tables) {
		izenda.pages.designer.TableList_OnChange(id, tables);
		izenda.pages.designer.TableList_OnChange(id + '_ExtraColumn', tables, null, true);
	};

	ns.pages.designer.ColumnSelect_OnChange = function(event, element) {
		if (typeof element != 'undefined' &&
			element != null &&
			typeof element.PreparingNewRow != 'undefined' &&
			element.PreparingNewRow)
			return;

		if (event)
			ebc_mozillaEvent = event;

		var row = EBC_GetRow();
		if (typeof row === 'undefined' || row === null || row.parentNode === null || row._scColumnChangeFired)
			return;

		row._scColumnChangeFired = true;
		row._ignoreDescriptor = 0;

		var parentTable = EBC_GetParentTable(row);
		var savedAutogrouping = parentTable.skipAutogrouping;
		parentTable.skipAutogrouping = true;

		try {
			var strColumn = 'Column';
			var strFunction = 'Function';

			var columnSelect = EBC_GetSelectByName(row, strColumn);
			var isValueSelected = columnSelect.selectedIndex !== -1;
			var currentOption = columnSelect.options[columnSelect.selectedIndex];
			var currentValue = isValueSelected ? currentOption.value : null;
			var oldValue = columnSelect.getAttribute('oldValue');
			var isColumnSelected = isValueSelected && currentValue !== '' && currentValue !== '...';
			var isValueChanged = currentValue !== oldValue;

			var isFieldCannotBeSelected = false;
			var isShownChangeRowCheckDialog = false;

			var context = {
				row: row,
				strColumn: strColumn,
				strFunction: strFunction
			};

			if (isValueChanged) {
				function changeRowCheckDialogResult(result) {
					if (result === jsResources.OK) {
						resetRowToDefault(context);
					} else {
						if (typeof oldValue != 'undefined' && oldValue != null) {
							EBC_SetSelectedIndexByValue(columnSelect, oldValue);
							if (oldValue === '' || oldValue === '...') {
								resetRowToDefault(context);
							}
						}
					}
				}

				var expressionInput = EBC_GetElementByName(row, 'Coefficient', 'TEXTAREA');
				var isExpressionUsed = expressionInput.value != null && expressionInput.value.trim().indexOf('example') !== 0;

				if (!isValueSelected || currentOption.restrictselecting === 'true') {
					ReportingServices.showOk('This field cannot be selected.',
						function() { changeRowCheckDialogResult(jsResources.Cancel); });
					isFieldCannotBeSelected = true;
					isShownChangeRowCheckDialog = true;
				} else if (isColumnSelected && isExpressionUsed) {
					ReportingServices.showConfirm('You will lose Expression data if you select a different field. Continue?',
						changeRowCheckDialogResult);
					isShownChangeRowCheckDialog = true;
				}
			}

			var isLoadCalled = loadCalled[row.rowIndex - 1];
			if (isLoadCalled)
				loadCalled[row.rowIndex - 1] = false;

			if (isColumnSelected && !isFieldCannotBeSelected)
				EBC_AddEmptyRow(row);

			if (isValueChanged && !isShownChangeRowCheckDialog)
				resetRowToDefault(context);
		} finally {
			row._scColumnChangeFired = false;
			parentTable.skipAutogrouping = savedAutogrouping;
		}

	};

	ns.pages.designer.ColumnSelect_OnInit_RegisterHandler = function (id, controlId, func) {
		var handlers = onColumnInitHandlers[id];
		if (handlers == null) {
			handlers = new Array();
			onColumnInitHandlers[id] = handlers;
		}

		var handler = {};
		handler.id = controlId;
		handler.func = func;
		handlers.push(handler);
	};

	ns.pages.designer.DescriptionEdit_OnChange = function (event) {
		if (event)
			ebc_mozillaEvent = event;

		var isEmptyValue = false;

		if (event) {
			var element = event.target ? event.target : event.srcElement;
			if (!element.ChangedAutomatically) {
				element.UserModified = true;
				isEmptyValue = izenda.isEmptyString(element.value);
			}
		}

		var row = EBC_GetRow();

		if (isEmptyValue)
			EBC_SetDescription(row);

		var id = EBC_GetParentTable(row).id;
		callFunctionSelectOnChangeHandlers(id);
	};

	ns.pages.designer.SortCheckbox_OnChange = function (event) {
		if (event)
			ebc_mozillaEvent = event;

		var row = EBC_GetRow();
		var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
		var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
		if (orderCheckbox.checked)
			orderDescCheckbox.checked = false;
	};

	ns.pages.designer.GroupCheckbox_OnChange = function (event, element, isNeedToSetDescription, functionName) {
		if (event)
			ebc_mozillaEvent = event;

		var row = EBC_GetRow();
		var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
		var funcSelect = EBC_GetSelectByName(row, functionName == null ? 'Function' : functionName);

		element = element != null ? element : (event.target ? event.target : event.srcElement);

		if (groupCheckbox != null && element === groupCheckbox && groupCheckbox.checked)
			funcSelect.value = 'None';

		if (element === funcSelect && funcSelect.value !== 'None' && groupCheckbox != null)
			groupCheckbox.checked = false;

		EBC_SetDescription(row);

		var parentTable = EBC_GetParentTable(row);
		var id = parentTable.id;

		// Second argument specifies whether grouping should "TURN ON" or "TURN OFF"
		if (!parentTable.skipAutogrouping && !element.Loading) {
			smartMarkingGroupingAndFunctions(id,
				(element === funcSelect && element.value !== 'None') ||
				(element === groupCheckbox && element.checked));
		}

		checkGroupingAndFunctions(id);
	};

	ns.pages.designer.VisualGroupCheckbox_OnChange = function (event) {
		if (event)
			ebc_mozillaEvent = event;

		var row = EBC_GetRow();
		var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
		var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
		var masterCheckbox = EBC_GetElementByName(row, 'Master', 'INPUT');
		var pageBreakCheckbox = EBC_GetElementByName(row, 'BreakPage', 'INPUT');
		var separatorCheckbox = EBC_GetElementByName(row, 'Separator', 'INPUT');

		if (masterCheckbox != null && masterCheckbox.checked)
			if (orderCheckbox != null && !orderCheckbox.checked && orderDescCheckbox != null && !orderDescCheckbox.checked)
				orderCheckbox.checked = true;

		if (pageBreakCheckbox != null && masterCheckbox != null) {
			pageBreakCheckbox.checked = false;
			pageBreakCheckbox.disabled = !masterCheckbox.checked;
		}
		if (separatorCheckbox != null && masterCheckbox != null) {
			separatorCheckbox.checked = false;
			separatorCheckbox.disabled = !masterCheckbox.checked;
		}

		checkAdvancedPropertiesModified(row);
	};

	ns.pages.designer.ArithmeticOperationElement_AfterChange = function (event) {
		if (event)
			ebc_mozillaEvent = event;

		izenda.pages.designer.ChangeArithmeticOperationForRow(EBC_GetRow());
	};

	ns.pages.designer.FunctionSelect_OnChange = function (event, element, columnName, functionName, formatName) {
		if (typeof element != 'undefined' && element != null &&
			typeof element.PreparingNewRow != 'undefined' && element.PreparingNewRow)
			return;

		if (event)
			ebc_mozillaEvent = event;

		columnName = columnName == null ? 'Column' : columnName;
		functionName = functionName == null ? 'Function' : functionName;
		formatName = formatName == null ? 'Format' : formatName;

		var row = EBC_GetRow();
		if (row._scFunctionChangeFired)
			return;

		row._scFunctionChangeFired = true;
		try {
			var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
			var funcSelect = EBC_GetSelectByName(row, functionName);
			if (EBC_IsRealChangedSelValue(funcSelect))
				row.setAttribute('userChanged', 'false');

			var isNeedToSetFormat = !operationElem.ElementExists() || operationElem.isDefault();
			if (isNeedToSetFormat)
				EBC_SetFormat(row, null, columnName, functionName, formatName);

			var id = EBC_GetParentTable(row).id;

			var mustGroupOrFunction = mustGroupOrFunctionList[id];
			if (mustGroupOrFunction && funcSelect.value === groupByMonthName) {
				var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
				orderCheckbox.checked = true;
			}

			setAcceptableValues(row, operationElem);

			izenda.pages.designer.GroupCheckbox_OnChange(ebc_mozillaEvent, element, isNeedToSetFormat, functionName);
			callFunctionSelectOnChangeHandlers(id, columnName, functionName);
			EBC_SetFunctions(row, mustGroupOrFunction, false, null, true, 'SubtotalFunction', false, true);
		} finally {
			row._scFunctionChangeFired = false;
		}
	};

	ns.pages.designer.FunctionSelect_OnChange_RegisterHandler = function (id, controlId, func) {
		var handlers = onColumnFunctionChangeHandlers[id];
		if (handlers == null) {
			handlers = new Array();
			onColumnFunctionChangeHandlers[id] = handlers;
		}

		var handler = {};
		handler.id = controlId;
		handler.func = func;
		handlers.push(handler);
	};

	ns.pages.designer.FormatSelect_OnChange = function (event, element) {
		if (typeof element != 'undefined' && element != null &&
			typeof element.PreparingNewRow != 'undefined' && element.PreparingNewRow)
			return;

		if (event)
			ebc_mozillaEvent = event;

		var row = EBC_GetRow();
		if (row._scFormatChangeFired)
			return;

		row._scFormatChangeFired = true;
		try {
			var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);

			var isNeedToSetDescription = !operationElem.ElementExists() || operationElem.isDefault();
			if (isNeedToSetDescription)
				EBC_SetDescription(row);
		} finally {
			row._scFormatChangeFired = false;
		}
	};

	ns.pages.designer.AdvancedPropertiesButton_OnClick = function (event, id) {
		if (event)
			ebc_mozillaEvent = event;

		showAdvancedProperties(id);
	};

	ns.pages.designer.SubreportSelect_OnChange = function (element) {
		if (element == null)
			return;

		var value = element.value;
		var isSubreportSelected = value !== '' && value !== '...';

		var subreportTable = EBC_GetParentTable(element);

		var subreportRow = null;
		var drillDownStyleRow = null;
		var urlRow = null;
		if (subreportTable != null)
			subreportRow = EBC_GetRow(subreportTable);

		if (subreportRow != null) {
			subreportTable = EBC_GetParentTable(subreportRow);
			if (subreportTable != null) {
				var rowIndex = subreportRow.rowIndex;
				drillDownStyleRow = subreportTable.tBodies[0].rows[rowIndex + 1];
				urlRow = subreportTable.tBodies[0].rows[rowIndex + 2];
			}
		}

		if (drillDownStyleRow != null) {
			var drillDownStyleSelect = null;
			var drillDownSelectTags = drillDownStyleRow.getElementsByTagName('SELECT');
			if (drillDownSelectTags.length > 0)
				drillDownStyleSelect = drillDownSelectTags[0];

			if (drillDownStyleSelect != null) {
				var reportNameInput = document.getElementById('reportNameFor2ver');
				var reportName = null;
				if (reportNameInput && reportNameInput.value) {
					reportName = decodeURIComponent(reportNameInput.value.replace(/\\'/g, "'"));
					reportName = reportName.replaceAll('+', ' ').replaceAll('\\\\', '\\');
				}

				drillDownStyleSelect.disabled = !isSubreportSelected;
				if (!isSubreportSelected)
					EBC_SetSelectedIndexByValue(drillDownStyleSelect, '');

				var drillDownStyleItems = drillDownStyleSelect.getElementsByTagName('OPTION');
				if (drillDownStyleItems.length > 0)
					for (var i = 0; i < drillDownStyleItems.length; i++) {
						var isEmbeddedDetailStyle = drillDownStyleItems[i].value === 'EmbeddedDetail';
						if (isEmbeddedDetailStyle)
							drillDownStyleItems[i].disabled = value === '(AUTO)' || (reportName && reportName === value);
					}

				var isDrillDownSelected = drillDownStyleSelect.value !== '' && drillDownStyleSelect.value !== '...';
				var isEmbeddedDetailStyleSelected = drillDownStyleSelect.value === 'EmbeddedDetail';
				if (isSubreportSelected && (!isDrillDownSelected || (value === '(AUTO)' && isEmbeddedDetailStyleSelected)))
					EBC_SetSelectedIndexByValue(drillDownStyleSelect, 'DetailLinkNewWindow');
			}
		}

		if (urlRow != null) {
			var urlInput = null;
			var urlInputTags = urlRow.getElementsByTagName('input');
			if (urlInputTags.length > 0)
				urlInput = urlInputTags[0];

			if (urlInput != null)
				urlInput.disabled = isSubreportSelected;
		}
	};

	ns.pages.designer.SubtotalFunctionSelect_OnChange = function (element) {
		if (izenda.isNullOrUndefined(element))
			return;

		if (izenda.isDefined(element.PreparingNewRow) && element.PreparingNewRow)
			return;

		var table = jq$(element).closest('table[name$="PropertiesTable"]');
		if (table != null && table.length > 0) {
			var subtotalExpressionInput = table.find('textarea[name$="SubtotalExpression"]');
			if (subtotalExpressionInput != null && subtotalExpressionInput.length > 0) {
				var closestTr = subtotalExpressionInput.closest('tr');
				if (jq$(element).val() === 'EXPRESSION')
					closestTr.show();
				else
					closestTr.hide();
			}
		}
	};

	ns.pages.designer.ExpressionEdit_OnChange = function (element) {
		toogleExpressionType(element);
	};

	ns.pages.designer.PivotColumn_OnChange = function (event, element, columnName) {
		if (event)
			ebc_mozillaEvent = event;

		columnName = columnName != null ? columnName : 'Column';

		var row = EBC_GetRow();
		if (row != null) {
			var parentTable = EBC_GetParentTable(row);

			parentTable.skipAutogrouping = true;

			var columnSelect = EBC_GetSelectByName(row, columnName);
			if (columnName === 'ExtraColumn') {
				showExtraColumns(parentTable.id);

				var id = EBC_GetParentTable(row).id;
				var funcSelect = EBC_GetSelectByName(row, 'ExtraFunction');

				EBC_SetFunctions(row, true, false, null, true, 'ExtraFunction', null, null, columnName, true);
				checkGroupingAndFunctions(id);

				// TODO should be moved to place where funcSelect initialized
				if (jq$(columnSelect).find(':selected').attr('datatype') === 'DateTime' && jq$(funcSelect).val() === 'GROUP')
					jq$(funcSelect).val('GROUP_BY_YEAR_AND_MONTH');
			} else {
				EBC_SetFunctions(row, true, false, null, false, 'ExtraValueFunction', null, null, columnName, null, null, true);
				EBC_SetFormat(row, null, columnName, 'ExtraFormat');
				resetRowToDefault({
					row: row,
					strColumn: columnName
				});

				var descriptionInput = EBC_GetInputByName(row, 'ExtraDescription');
				if (columnSelect && descriptionInput) {
					var selectedField = columnSelect.options[columnSelect.selectedIndex].text;
					var isFieldSelected = selectedField === '' || selectedField === '...' || selectedField === 'Loading ...';
					if (isFieldSelected)
						descriptionInput.value = '';
					else if (!descriptionInput.value)
						descriptionInput.value = selectedField;
				}
			}
		}
	};

	ns.pages.designer.PivotRowInsertBelowButton_OnClick = function (event, id) {
		EBC_InsertBelowHandler(event, 1);
		if (jq$('#' + id + '_ExtraColumn').children().children().length > 1) {
			jq$('.' + id + '_ExtraDescription_Label1').show();
			jq$('.' + id + '_ExtraDescription').show();
			jq$(this).parents('tr').next().find('.' + id + '_ExtraDescription').val('');
			jq$('.' + id + '_ExtraDescription_Label2').show();
		}
	};

	ns.pages.designer.PivotRowRemoveButton_OnClick = function (event, id, force) {
		EBC_RemoveNotLastRowHandler('ExtraValue', event, force);
		if (jq$('#' + id + '_ExtraColumn').children().children().length < 3) {
			jq$('.' + id + '_ExtraDescription_Label1').hide();
			jq$('.' + id + '_ExtraDescription').hide();
			jq$('.' + id + '_ExtraDescription_Label2').hide();
		}
	};

	ns.pages.designer.QuickAddButton_OnClick = function (id, columnNumber, minInColumn, maxFieldWidth) {
		showQuickAdd(id, columnNumber, minInColumn, maxFieldWidth);
	};

	ns.pages.designer.PivotButton_OnClick = function (id, element) {
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		var zeroRow = body.rows[0];
		var display = zeroRow.style.display;

		var pivotSideTotal = jq$('table[id$="ExtraColumn_Subtotal"]');

		if (display === 'none') {
			body.rows[0].style.display = '';
			element.value = jsResources.RemovePivot;
			pivotSideTotal.show();
		} else {
			EBC_GetSelectByName(zeroRow, 'ExtraColumn').value = '...';
			EBC_SetFunctions(zeroRow, true, false, null, true, 'ExtraFunction', null, null, 'ExtraColumn', true);
			EBC_GetSelectByName(zeroRow, 'ExtraFunction').value = 'None';
			EBC_internalInsertHandler(zeroRow, table.rows.length, table.rows.length - 1);

			while (table.rows.length > 2)
				table.deleteRow(1);

			var controlId = id.substr(0, id.length - '_ExtraColumn'.length);
			jq$('.' + controlId + '_ExtraDescription_Label1').hide();
			jq$('.' + controlId + '_ExtraDescription').hide();
			jq$('.' + controlId + '_ExtraDescription_Label2').hide();

			zeroRow.style.display = 'none';

			body.rows[1].style.display = 'none';
			element.value = jsResources.AddPivot;
			pivotSideTotal.hide();

			checkTotals(id);
		}
	};

	ns.pages.designer.AddAllButton_OnClick = function (id) {
		var table = document.getElementById(id);
		var max = table.getAttribute('max');
		var body = table.tBodies[0];
		var rowCount = body.rows.length;
		if (rowCount > 0) {
			var allTablesSelect = document.getElementById(id + '_AllTables');
			if (allTablesSelect.value === '')
				return;

			var values = new Array();
			for (var j = 0; j < rowCount; j++) {
				var columnSelect = EBC_GetSelectByName(body.rows[j], 'Column');
				var columnValue = columnSelect.value;
				var columnValueIsEmpty = columnValue != null && columnValue !== '' && columnValue !== '...';
				if (columnValueIsEmpty)
					values.push(columnValue);
			}

			var lastRow = body.rows[rowCount - 1];
			var lastColumnSelect = EBC_GetSelectByName(lastRow, 'Column');

			var filterRegExp = new RegExp(addAllFilterRegexp, 'i');

			var elems = allTablesSelect.value.split("'");
			var selectedTableName = elems[0];
			var selectedAlias = null;
			if (elems.length > 1)
				selectedAlias = elems[1];

			var currentRow = rowCount - 1;
			if (currentRow < 0)
				currentRow = 0;

			for (var i = 0; i < lastColumnSelect.options.length && (max == null || max > rowCount); i++) {
				var optionValue = lastColumnSelect.options[i].value;
				// add new row when option value is not empty, not ..., not .*
				// and having our table name before dot.
				if (optionValue == null || optionValue === '...')
					continue;

				var currElems = optionValue.split("'");
				var alias = null;
				if (currElems.length > 1)
					alias = currElems[1];

				var dotIndex = optionValue.lastIndexOf('.');
				if (optionValue.substring(0, dotIndex) === selectedTableName &&
					alias === selectedAlias &&
					!filterRegExp.test(optionValue.substring(dotIndex + 2, currElems[0].length - 1))) {
					var haveValue = false;
					for (var k = 0; k < values.length; ++k)
						if (values[k] === optionValue) {
							haveValue = true;
							break;
						}

					if (haveValue)
						continue;

					var newRow = EBC_InsertRow(table, currentRow);

					currentRow++;
					clearRowInputs(newRow);
					clearRowSelects(newRow);

					var newColumnSel = EBC_GetSelectByName(newRow, 'Column');
					newColumnSel.value = optionValue;

					EBC_FireOnChange(newColumnSel);

					rowCount = body.rows.length;
				}
			}

			callFunctionSelectOnChangeHandlers(id);
		}
	};

	ns.pages.designer.RemoveAllButton_OnClick = function (id) {
		EBC_RemoveAllRows(id);
		callFunctionSelectOnChangeHandlers(id);
	};

	/*
	 * public methods
	 */

	ns.pages.designer.GetFieldsList = function (id, columnName, functionName) {
		columnName = columnName == null ? 'Column' : columnName;
		functionName = functionName == null ? 'Function' : functionName;

		var fields = new Array();
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		for (var i = 0; i < body.rows.length; i++) {
			var columnSelect = EBC_GetSelectByName(body.rows[i], columnName);
			if (columnSelect != null) {
				var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', body.rows[i]);
				var columnValue = columnSelect.value;
				var isColumnSelected = columnValue !== '' && columnValue !== '...';
				if (isColumnSelected) {
					var field = {};
					field.index = i;
					field.column = columnValue;

					var selectedColumn = columnSelect.options[columnSelect.selectedIndex];
					if (selectedColumn != null)
						field.initialDataType = selectedColumn.getAttribute('datatype');

					if (operationElem.ElementExists()) {
						var isOperationEmpty = izenda.isEmptyOrWhiteSpaceString(operationElem.valueElement.value);
						field.operationElem = isOperationEmpty ? '~' : operationElem.valueElement.value;
					} else
						field.operationElem = '~';

					var funcSelect = EBC_GetSelectByName(body.rows[i], functionName);
					if (funcSelect != null) {
						field.func = funcSelect.value;
						var selectedFunc = funcSelect.options[funcSelect.selectedIndex];
						if (selectedFunc != null) {
							field.datatype = selectedFunc.getAttribute('datatype');
							field.dataTypeGroup = selectedFunc.getAttribute('dataTypeGroup');

							if ((!field.dataTypeGroup || field.dataTypeGroup === 'None') && columnSelect.selectedIndex > -1)
								field.dataTypeGroup = selectedColumn.getAttribute('dataTypeGroup');
						}
					}

					var descriptionInput = EBC_GetInputByName(body.rows[i], 'Description');
					if (descriptionInput != null)
						field.description = descriptionInput.value;

					var fieldIdInput = EBC_GetInputByName(body.rows[i], 'FldId');
					if (fieldIdInput != null)
						field.fldId = fieldIdInput.value;

					var expressionInput = EBC_TextAreaByName(body.rows[i], 'Coefficient');
					if (expressionInput != null) {
						field.coefficient = '';

						var expressionValue = expressionInput.value;
						var isExpressionSpecified = expressionValue.trim() !== '' && expressionValue.indexOf('example:') !== 0;
						if (isExpressionSpecified)
							field.coefficient = expressionValue;
					}

					var expressionTypeElem = EBC_GetSelectByName(body.rows[i], 'ExpressionType');
					field.expressionType = expressionTypeElem == null ? '' : expressionTypeElem.value;

					fields.push(field);
				} else if (operationElem.ElementExists())
					operationElem.disable();
			}
		}

		return fields;
	};

	ns.pages.designer.QuickAdd_Close_Callback = function () {
		if (context.qac_timers > 0 || context.qac_requests > 0)
			return;

		context.qac_timers = 0;
		context.qac_requests = 0;
		context.qac_works = false;

		checkGroupingAndFunctionsWithStoredParams();

		if (typeof ns.pages.designer.CallChartTableListChangeHandlerWithStoredParams !== 'undefined')
			ns.callIfFunction(izenda.pages.designer.CallChartTableListChangeHandlerWithStoredParams);
		if (typeof GC_OnTableListChangedHandlerWithStoredParams !== 'undefined')
			izenda.callIfFunction(GC_OnTableListChangedHandlerWithStoredParams);
		if (typeof CC_OnTableListChangedHandlerWithStoredParams !== 'undefined')
			izenda.callIfFunction(CC_OnTableListChangedHandlerWithStoredParams);
		if (typeof EBC_CheckFieldsCountWithStoredParams !== 'undefined')
			izenda.callIfFunction(EBC_CheckFieldsCountWithStoredParams);
	};

	ns.pages.designer.InitFieldTable = function (id, checked, mustGroupOrFunction, allowComparativeArithmeticArg, groupByMonthNameArg) {
		groupByMonthName = groupByMonthNameArg;
		allowComparativeArithmetic = allowComparativeArithmeticArg;
		fieldValueCheckedList[id] = checked;
		mustGroupOrFunctionList[id] = mustGroupOrFunction;

		EBC_RegisterControl(id);
		EBC_SetData('@SC/Empty', [{ name: '', options: [{ value: '...', text: '...' }] }]);

		var table = document.getElementById(id);
		EBC_RegisterRowInsertHandler(table, initNewRow);

		var body = table.tBodies[0];
		var count = body.rows.length;
		for (var i = 0; i < count; i++) {
			checkAdvancedPropertiesModified(body.rows[i]);
			var columnSelect = EBC_GetSelectByName(body.rows[i], 'Column');
			var isFieldSelected = columnSelect.value !== '' && columnSelect.value !== '...';
			if (isFieldSelected)
				body.rows[i].setAttribute('userChanged', 'true');
		}

		checkGroupingAndFunctions(id);
		EBC_RegisterRowRemoveHandler(table, function (id) {
			callFunctionSelectOnChangeHandlers(id);
			checkGroupingAndFunctions(id);
		});
		EBC_RegiserForUnusedRowsRemoving(table);
	};

	ns.pages.designer.InitPivotTable = function (id) {
		EBC_RegisterControl(id);

		var table = document.getElementById(id);
		EBC_RegisterRowInsertHandler(table, initNewRow);

		var extraRows = jq$(table).find("[id$='ExtraColumn_valueTR']");
		for (var i = 0; i < extraRows.length; i++)
			checkAdvancedPropertiesModified(extraRows[i]);

		EBC_RegisterRowRemoveHandler(table, function (id) {
			callFunctionSelectOnChangeHandlers(id);
			checkGroupingAndFunctions(id);
		});
		EBC_RegiserForUnusedRowsRemoving(table);
	};

	ns.pages.designer.ChangeArithmeticOperationForRow = function (row) {
		if (row == null)
			return;
		var operationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', row);
		var descriptionEdit = EBC_GetInputByName(row, 'Description');
		var groupCheckbox = EBC_GetElementByName(row, 'Group', 'INPUT');
		var orderCheckbox = EBC_GetElementByName(row, 'Order', 'INPUT');
		var orderDescCheckbox = EBC_GetElementByName(row, 'OrderDesc', 'INPUT');
		var invCheckbox = EBC_GetElementByName(row, 'Invisible', 'INPUT');
		var formatSelect = EBC_GetSelectByName(row, 'Format');
		var masterCheckbox = EBC_GetElementByName(row, 'Master', 'INPUT');

		if (operationElem.ElementExists() && !operationElem.isDefault()) {
			if (descriptionEdit) {
				descriptionEdit.value = '';
				descriptionEdit.disabled = true;
			}
			if (groupCheckbox != null && groupCheckbox) {
				groupCheckbox.checked = false;
				groupCheckbox.disabled = true;
			}
			if (orderCheckbox) {
				orderCheckbox.checked = false;
				orderCheckbox.disabled = true;
			}
			if (orderDescCheckbox) {
				orderDescCheckbox.checked = false;
				orderDescCheckbox.disabled = true;
			}
			if (invCheckbox) {
				invCheckbox.checked = false;
				invCheckbox.disabled = true;
			}
			if (masterCheckbox) {
				masterCheckbox.checked = false;
				masterCheckbox.disabled = true;
			}
			formatSelect.selectedIndex = 0;
			formatSelect.disabled = true;
			var table = EBC_GetParentTable(row);
			var body = table.tBodies[0];
			var index = row['sectionRowIndex'];
			
			var stringFormats = false;
			if (index > 0) {
				for (var i = index - 1; i >= 0; i--) {
					var currRow = body.rows[i];
					var dataTypeGroup = EBC_GetDataTypeGroup(row);
					var isNumericDataTypeGroup = dataTypeGroup === 'Numeric' || dataTypeGroup === 'Real' || dataTypeGroup === 'Money';
					if (!isNumericDataTypeGroup)
						stringFormats = true;

					var currentRowFormatSelect = EBC_GetSelectByName(currRow, 'Format');
					var currentRowOperationElem = new AdHoc.MultivaluedCheckBox('ArithmeticOperation', currRow);
					if (!(currentRowOperationElem.ElementExists() && !currentRowOperationElem .isDefault())) {
						if (stringFormats)
							currentRowFormatSelect.setAttribute('TypeGroup', 'String');
						else
							currentRowFormatSelect.setAttribute('TypeGroup', 'Real');
						break;
					} else
						currentRowFormatSelect.setAttribute('TypeGroup', '');
				}
			}
		} else {
			if (descriptionEdit)
				descriptionEdit.disabled = false;
			if (groupCheckbox != null && groupCheckbox)
				groupCheckbox.disabled = false;
			if (orderCheckbox)
				orderCheckbox.disabled = false;
			if (orderDescCheckbox)
				orderDescCheckbox.disabled = false;
			if (invCheckbox)
				invCheckbox.disabled = false;
			if (masterCheckbox)
				masterCheckbox.disabled = false;
			if (formatSelect)
				formatSelect.disabled = false;
			if (descriptionEdit && izenda.isNullOrEmptyString(descriptionEdit.value))
				EBC_SetDescription(row);
		}
		if (!row.ThisRowIsBeingAddedAsNew) {
			var id = EBC_GetParentTable(row).id;
			checkGroupingAndFunctions(id);
			callFunctionSelectOnChangeHandlers(id);
		}
	};

	ns.pages.designer.GetSelectedFormatsOnFieldsTab = function (id) {
		var formats = new Array();
		var table = document.getElementById(id);
		var body = table.tBodies[0];
		for (var i = 0; i < body.rows.length; i++) {
			var row = body.rows[i];
			var formatSelect = EBC_GetSelectByName(row, 'Format');
			if (!formatSelect || !formatSelect.options)
				continue;
			var formatSelectedOption = formatSelect.options[formatSelect.selectedIndex];
			if (formatSelectedOption != null) {
				var format = formatSelectedOption.value;
				if (format)
					formats.push(format);
			}
		}
		return formats;
	};

})(window.izenda || (window.izenda = {}));
