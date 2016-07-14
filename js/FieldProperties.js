var FP_CurrentlyBeingEditedField;

function FP_ShowFilterProperties(filter, dialog) {
	document.getElementById('propDialogMode').value = 'filter';
	jq$('.field-prop-row').hide();
	jq$('.filter-prop-row').show();
	document.getElementById('fieldPropDiv').style.display = 'none';
	var titleDiv = document.getElementById('titleDiv');
	var fieldFriendlyName = filter.FilterFriendlyName ? filter.FilterFriendlyName : filter.FriendlyName;
	if (filter.TableJoinAlias)
		fieldFriendlyName += " (" + filter.TableJoinAlias + ")";
	titleDiv.innerHTML = IzLocal.Res('js_FilterPropertyForField', 'Filter Properties for {0}').replace(/\{0\}/g, fieldFriendlyName);
	var propDescription = document.getElementById('propDescription');
	propDescription.value = filter.Description;
	var propFilterOperators = document.getElementById('propFilterOperators');
	if (typeof propFilterOperators.options.hasChildNodes != 'undefined') {
		while (propFilterOperators.options.hasChildNodes())
			propFilterOperators.options.removeChild(propFilterOperators.options.firstChild);
	}
	else if (typeof propFilterOperators.options.length != 'undefined') {
		jq$(propFilterOperators).html('');
	}
	var currentOptGroup = null;
	for (var filterOperatorCnt = 0; filterOperatorCnt < filter.FilterOperatorValues.length; filterOperatorCnt++) {
		if (filter.FilterOperatorValues[filterOperatorCnt] == '###OPTGROUP###') {
			if (filter.FilterOperatorNames[filterOperatorCnt] != '') {
				currentOptGroup = document.createElement('optgroup');
				currentOptGroup.label = filter.FilterOperatorNames[filterOperatorCnt];
				propFilterOperators.appendChild(currentOptGroup);
			}
			continue;
		}
		var optOper = document.createElement('option');
		optOper.value = filter.FilterOperatorValues[filterOperatorCnt];
		optOper.innerHTML = filter.FilterOperatorNames[filterOperatorCnt];
		if (filter.FilterOperator == filter.FilterOperatorValues[filterOperatorCnt])
			optOper.selected = 'selected';
		if (currentOptGroup == null)
			propFilterOperators.appendChild(optOper);
		else
			currentOptGroup.appendChild(optOper);
	}
	if (filter.DupFilter)
		jq$('#dupFilterNote').show();
	else
		jq$('#dupFilterNote').hide();
	document.getElementById('propFilterGUID').value = filter.FilterGUID;
	dialog.dialog("option", "title", fieldFriendlyName);
	dialog.dialog("open");
}

function FP_ShowFieldProperties(field, dialog) {
	FP_CurrentlyBeingEditedField = field;
	document.getElementById('propDialogMode').value = 'field';
	document.getElementById('propFieldDbName').value = field.DbName;
	document.getElementById('propFieldFriendlyName').value = field.FriendlyName;
	jq$('.filter-prop-row').hide();
	jq$('.field-prop-row').show();
	document.getElementById('fieldPropDiv').style.display = '';
	var titleDiv = document.getElementById('titleDiv');
	var fieldFriendlyName = field.FriendlyName;
	if (field.AliasTable)
		fieldFriendlyName += " (" + field.AliasTable + ")";
	titleDiv.innerHTML = IzLocal.Res('js_FieldPropertyForField', 'Field Properties for {0}').replace(/\{0\}/g, fieldFriendlyName);
	var propDescription = document.getElementById('propDescription');
	propDescription.value = field.Description;
	var propVG = document.getElementById('propVG');
	propVG.checked = false;
	if (field.VG)
		propVG.checked = true;
	var propMultilineHeader = document.getElementById('propMultilineHeader');
	propMultilineHeader.checked = false;
	if (field.MultilineHeader)
		propMultilineHeader.checked = true;
	var propFormats = document.getElementById('propFormats');
	propFormats.options.length = 0;
	for (var formatCnt = 0; formatCnt < field.FormatValues.length; formatCnt++) {
		var optFormat = new Option();
		optFormat.value = field.FormatValues[formatCnt];
		optFormat.text = field.FormatNames[formatCnt];
		if (field.FormatString == field.FormatValues[formatCnt])
			optFormat.selected = 'selected';
		propFormats.add(optFormat);
	}

	var propSTFunctions = document.getElementById('propSTFunctions');
	propSTFunctions.options.length = 0;
	for (var stFunctionsCnt = 0; stFunctionsCnt < field.STFunctionValues.length; stFunctionsCnt++) {
		var optSTFunction = new Option();
		optSTFunction.value = field.STFunctionValues[stFunctionsCnt];
		optSTFunction.text = field.STFunctionNames[stFunctionsCnt];
		if (field.STFunction == field.STFunctionValues[stFunctionsCnt])
			optSTFunction.selected = 'selected';
		propSTFunctions.add(optSTFunction);
	}

	var propStExpression = document.getElementById('propStExpression');
	if (field.STFunction == 'EXPRESSION')
		propStExpression.style.display = '';
	else
		propStExpression.style.display = 'none';
	propStExpression.value = field.SubtotalExpression;

	jq$('#dupFilterNote').hide();

	function getAlignNumber(str) {
		var value = 0;
		if (str == "Left")
			value = 1;
		else if (str == "Center")
			value = 2;
		else if (str == "Right")
			value = 3;
		return value;
	}

	var labelJ = document.getElementById('labelJ');
	var msvs = labelJ.getAttribute('msvs').split(',');
	var labelJNumber = getAlignNumber(field.LabelJustification);
	labelJ.innerHTML = msvs[labelJNumber - 1];
	labelJ.setAttribute('msv', msvs[labelJNumber - 1]);

	var valueJ = document.getElementById('valueJ');
	msvs = valueJ.getAttribute('msvs').split(',');
	var valueJNumber = getAlignNumber(field.ValueJustification);
	valueJ.innerHTML = msvs[valueJNumber];
	valueJ.setAttribute('msv', msvs[valueJNumber]);

	if (IsIE()) {
		jq$('.multi-valued-check-advanced').css("margin-left", '3px');
	}
	var propWidth = document.getElementById('propWidth');
	propWidth.value = field.Width;
	dialog.dialog("option", "title", fieldFriendlyName);
	dialog.dialog("open");
}

function FP_CollectFilterProperties() {
	var filter = new Object();
	var propFilterOperators = document.getElementById('propFilterOperators');
	filter.FilterOperator = propFilterOperators.value;
	filter.FilterGUID = document.getElementById('propFilterGUID').value;
	filter.Alias = document.getElementById('propDescription').value;
	return filter;
}

function FP_CollectFieldProperties() {
	var field = new Object();

	function getAlignString(value) {
		var str = "NotSet";
		if (value == "L")
			str = "Left";
		else if (value == "M")
			str = "Center";
		else if (value == "R")
			str = "Right";
		return str;
	}
	field.AdditionalFields = FP_CurrentlyBeingEditedField.AdditionalFields;
	field.AggregateFunction = FP_CurrentlyBeingEditedField.AggregateFunction;
	field.AliasTable = FP_CurrentlyBeingEditedField.AliasTable;
	field.Bold = FP_CurrentlyBeingEditedField.Bold;
	field.CalcDescription = FP_CurrentlyBeingEditedField.CalcDescription;
	field.CellHighlight = FP_CurrentlyBeingEditedField.CellHighlight;
	field.ColumnGroup = FP_CurrentlyBeingEditedField.ColumnGroup;
	field.ColumnName = document.getElementById('propFieldDbName').value;
	field.ColumnSql = FP_CurrentlyBeingEditedField.ColumnSql;
	field.DbName = document.getElementById('propFieldDbName').value;
	field.Definition = FP_CurrentlyBeingEditedField.Definition;
	field.Description = document.getElementById('propDescription').value;
	field.DrillDownStyle = FP_CurrentlyBeingEditedField.DrillDownStyle;
	field.Expression = FP_CurrentlyBeingEditedField.Expression;
	field.ExpressionType = FP_CurrentlyBeingEditedField.ExpressionType;
	field.FormatString = document.getElementById('propFormats').value;
	field.STFunction = document.getElementById('propSTFunctions').value;
	field.FriendlyName = document.getElementById('propFieldFriendlyName').value;
	field.GUID = FP_CurrentlyBeingEditedField.GUID;
	field.GaugeColor = FP_CurrentlyBeingEditedField.GaugeColor;
	field.GaugeMax = FP_CurrentlyBeingEditedField.GaugeMax;
	field.GaugeMin = FP_CurrentlyBeingEditedField.GaugeMin;
	field.GaugeStyle = FP_CurrentlyBeingEditedField.GaugeStyle;
	field.GaugeTargetEffect = FP_CurrentlyBeingEditedField.GaugeTargetEffect;
	field.GaugeTargetReport = FP_CurrentlyBeingEditedField.GaugeTargetReport;
	field.GaugeValuesInCurrencyFormat = FP_CurrentlyBeingEditedField.GaugeValuesInCurrencyFormat;
	field.Gradient = FP_CurrentlyBeingEditedField.Gradient;
	field.GroupBy = FP_CurrentlyBeingEditedField.GroupBy;
	field.GroupByExpression = FP_CurrentlyBeingEditedField.GroupByExpression;
	field.Italic = FP_CurrentlyBeingEditedField.Italic;

	var labelJ = document.getElementById('labelJ');
	var msvs = labelJ.getAttribute('msvs').split(',');
	var msv = labelJ.getAttribute('msv');
	var curValue = "Center";
	for (var ind = 0; ind < msvs.length; ind++) {
		if (msvs[ind] == msv) {
			curValue = getAlignString(msv);
			break;
		}
	}
	field.LabelJustification = curValue;

	field.VG = document.getElementById('propVG').checked;
	field.MultilineHeader = document.getElementById('propMultilineHeader').checked;
	field.Operator = FP_CurrentlyBeingEditedField.Operator;
	field.OrderType = FP_CurrentlyBeingEditedField.OrderType;
	field.PageBreak = FP_CurrentlyBeingEditedField.PageBreak;
	field.Separator = FP_CurrentlyBeingEditedField.Separator;
	field.ShouldBeFormatted = FP_CurrentlyBeingEditedField.ShouldBeFormatted;
	field.SubtotalExpression = document.getElementById('propStExpression').value;
	field.SubtotalFunction = FP_CurrentlyBeingEditedField.SubtotalFunction;
	field.SubtotalTitle = FP_CurrentlyBeingEditedField.SubtotalTitle;
	field.TargetReport = FP_CurrentlyBeingEditedField.TargetReport;
	field.TextHighlight = FP_CurrentlyBeingEditedField.TextHighlight;
	field.Url = FP_CurrentlyBeingEditedField.Url;

	var valueJ = document.getElementById('valueJ');
	var msvs = valueJ.getAttribute('msvs').split(',');
	var msv = valueJ.getAttribute('msv');
	var curValue = "NotSet";
	for (var ind = 0; ind < msvs.length; ind++) {
		if (msvs[ind] == msv) {
			curValue = getAlignString(msv);
			break;
		}
	}
	field.ValueJustification = curValue;

	field.ValueRanges = FP_CurrentlyBeingEditedField.ValueRanges;
	field.ValueString = FP_CurrentlyBeingEditedField.ValueString;
	field.Visible = FP_CurrentlyBeingEditedField.Visible;
	field.Width = document.getElementById('propWidth').value;
	field.WidthSettedManually = FP_CurrentlyBeingEditedField.WidthSettedManually;

	return field;
}

function UpdateMSV(lid, updatePreview) {
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
	if (updatePreview)
		PreviewFieldDelayed(1000);
}