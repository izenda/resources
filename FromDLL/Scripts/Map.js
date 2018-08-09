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

var DMC_DescSet = false;
var DMC_isErrorNow = false;
var DMC_wasMapType = '...';
var lastCallParams_MC_OnTableListChangedHandler = new Array();

(function (ns) {
	ns.isDefined = function (value) {
		return typeof value !== 'undefined';
	};

	ns.isUndefined = function (value) {
		return typeof value === 'undefined';
	};

	ns.getValue = function (value, defaultValue) {
		return ns.isDefined(value) ? value : defaultValue;
	};

	ns.pages = ns.pages || {};
	ns.pages.designer = ns.pages.designer || {};
	ns.pages.designer.context = ns.pages.designer.context || {};

	var context = ns.pages.designer.context;
	context.qac_works = ns.getValue(context.qac_works, false);
	context.qac_requests = ns.getValue(context.qac_requests, 0);
	context.qac_timers = ns.getValue(context.qac_timers, 0);

})(window.izenda || (window.izenda = {}));

function MC_OnTableListChangedHandlerWithStoredParams() {
	if (lastCallParams_MC_OnTableListChangedHandler == null || lastCallParams_MC_OnTableListChangedHandler.length !== 2)
		return;
	MC_OnTableListChangedHandler(lastCallParams_MC_OnTableListChangedHandler[0], lastCallParams_MC_OnTableListChangedHandler[1]);
}

function MC_OnTableListChangedHandler(id, tables) {
	if (tables == null)
		return;

	var pageContext = izenda.pages.designer.context;
	var scWacWorksVal = pageContext.qac_works;

	var jtcsInitExecutesVal = false;
	if (typeof JTCS_Init_executes != 'undefined' && JTCS_Init_executes != null && JTCS_Init_executes === true)
		jtcsInitExecutesVal = true;
	if (scWacWorksVal || jtcsInitExecutesVal) {
		lastCallParams_MC_OnTableListChangedHandler = new Array();
		lastCallParams_MC_OnTableListChangedHandler[0] = id;
		lastCallParams_MC_OnTableListChangedHandler[1] = tables;
		return;
	}
	if (typeof tables.join == 'function')
		tables = tables.join('\'');
	tablesSave[id] = tables;
	var additionalData = null;
	if (typeof descriptions != 'undefined' && descriptions != null && descriptions.length > 0) {
		additionalData = [{ name: '', options: [{ value: '', text: '------', disabled: true }] }];
		for (var i = 0; i < descriptions.length; i++) {
			var calcField = descriptions[i];
			var option = {
				value: calcFieldPrefix + calcField.fldId,
				text: '[' + calcField.description + '] (calc)',
				fieldIndex: calcField.fieldIndex
			};
			if (calcField.datatype != null) {
				option.datatype = calcField.datatype;
			}
			additionalData[0].options.push(option);
		}
	}

	var sel = document.getElementById(id + '_CountryState');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel);
	sel = document.getElementById(id + '_City');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel);
	sel = document.getElementById(id + '_Postal');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel);
	sel = document.getElementById(id + '_Longitude');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel);
	sel = document.getElementById(id + '_Latitude');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel);
	sel = document.getElementById(id + '_ShadingValue');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel, true, null, additionalData);
	sel = document.getElementById(id + '_DotSizeValue');
	EBC_LoadData('CombinedColumnList', 'tables=' + tables, sel, true, null, additionalData);
}

function MC_OnFieldsListChangedHandler(id, fields) {
	DMC_PopulateDescriptions(fields);
	MC_OnTableListChangedHandler(id, tablesSave[id]);
}

function DMC_GetMapType(id) {
	var mapTypeValue = document.getElementById(id + '_MapType').value;
	return {
		usaMap: mapTypeValue === 'USA',
		worldMap: mapTypeValue === 'World',
		europeMap: mapTypeValue === 'Europe',
		australiaMap: mapTypeValue === 'Australia'
	};
}

function DMC_UpdateVisibility(id, visibility) {
	var row = document.getElementById(id + '_countryStateRow');
	var mapType = DMC_GetMapType(id);
	if (mapType.usaMap || mapType.australiaMap)
		row.cells[0].innerHTML = jsResources.State;
	if (mapType.worldMap || mapType.europeMap)
		row.cells[0].innerHTML = jsResources.Country;

	['countryStateRow', 'autoRow', 'shadingLabelRow', 'indicatorLabelRow', 'cityRow', 'postalRow',
		'longitudeRow', 'latitudeRow', 'shadingRow', 'fillFromColorRow', 'fillToColorRow',
		'dotsizevalueRow', 'shadingTargetreportRow', 'valueTargetreportRow',
		'labelRow1', 'labelRow2', 'labelRow3', 'labelRow4'].forEach(function(value) {
		row = document.getElementById(id + '_' + value);
		row.style.visibility = visibility;
	});
}

function DMC_SelectValue(id, selectId, valueIndex) {
	var options = document.getElementById(id + selectId);
	var optionsCount = options.length;
	for (var i = 0; i < optionsCount; i++) {
		if (i !== valueIndex && options[i].selected)
			options[i].selected = false;
		if (i === valueIndex && !options[i].selected)
			options[i].selected = true;
	}
}

function DMC_AutoSelect(id) {
	var options = document.getElementById(id + '_CountryState');

	var fields = new Array();
	for (var i = 0; i < options.length; i++) {
		var fName = options[i].innerHTML;
		if (fName.charAt(fName.length - 1) === ']') {
			fName = fName.substr(0, fName.length - 1);
			var lastBracket = fName.lastIndexOf('[');
			fName = fName.substr(lastBracket + 1);
		}
		fields[i] = fName.toLowerCase();
	}

	var matchCity = -1;
	var matchCountryState = -1;
	var closestCountryState = -1;
	var mapType = DMC_GetMapType(id);
	for (var i = 0; i < fields.length; i++) {
		if (fields[i] === 'country' && !mapType.usaMap)
			matchCountryState = i;
		if (fields[i] === 'state' && (mapType.usaMap || mapType.australiaMap))
			matchCountryState = i;
		if (fields[i] === 'city')
			matchCity = i;
		if (fields[i].indexOf('country') >= 0 && !mapType.usaMap)
			closestCountryState = i;
		if (fields[i].indexOf('state') >= 0 && (mapType.usaMap || mapType.australiaMap))
			closestCountryState = i;
	}

	if (matchCountryState >= 0)
		DMC_SelectValue(id, '_CountryState', matchCountryState);

	if (matchCity >= 0 || matchCountryState >= 0)
		return;

	if (closestCountryState >= 0)
		DMC_SelectValue(id, '_CountryState', closestCountryState);
}

function DMC_CheckFieldAllowed(columnSel) {
	try {
		var oldValue = columnSel.getAttribute('oldValue');
		if (columnSel.options[columnSel.selectedIndex].restrictselecting === 'true') {
			if (oldValue != null && columnSel.options[columnSel.selectedIndex].value !== oldValue) {
				EBC_SetSelectedIndexByValue(columnSel, oldValue);
				alert(jsResources.ThisFieldCannotBeSelected);
			}
		}
		columnSel.setAttribute('oldValue', columnSel.options[columnSel.selectedIndex].value);
	} catch (exc) { }
}

function DMC_FieldsChanged(id) {
	function getControlState(name, checkAllowed, functionName) {
		var state = {};

		var selectControl = document.getElementById(id + '_' + name);
		if(checkAllowed)
			DMC_CheckFieldAllowed(selectControl);
		var value = selectControl.value;
		var fieldSelected = value !== '...' && value !== 'None';
		var isCalcFieldSelected = izenda.utils.string.startsWith(value, calcFieldPrefix);

		state.value = value;
		state.selected = fieldSelected;

		if (functionName) {
			var functionControl = document.getElementById(id + '_' + functionName);
			var functionSelected = (functionControl.value !== '...' && functionControl.value !== 'None') || isCalcFieldSelected;
			if (!fieldSelected && functionSelected) {
				DMC_SelectValue(id, '_' + functionName, 0);
				functionSelected = (functionControl.value !== '...' && functionControl.value !== 'None') || isCalcFieldSelected;
			}
			state.function = {
				selected: functionSelected
			};
		}

		return state;
	}

	var isError = false;
	var count = 0;

	var mapType = getControlState('MapType');
	var visibility = mapType.selected ? '' : 'hidden';
	if (mapType.value !== DMC_wasMapType)
		DMC_UpdateVisibility(id, visibility);

	if (mapType.selected) {
		var countryState = getControlState('CountryState', true);
		var city = getControlState('City', true);
		var postal = getControlState('Postal', true);
		var longitude = getControlState('Longitude', true);
		var latitude = getControlState('Latitude', true);
		var shadingValue = getControlState('ShadingValue', true, 'ShadingFunction');
		var dotSizeValue = getControlState('DotSizeValue', true, 'DotFunction');

		if (!(countryState.selected || city.selected || postal.selected || longitude.selected || latitude.selected || shadingValue.selected || shadingValue.function.selected
			|| dotSizeValue.selected || dotSizeValue.function.selected)) {
			if (DMC_wasMapType === '...') 
				DMC_AutoSelect(id);
		}

		var coordsSelected = longitude.selected && latitude.selected;
		var pointItemSelected = city.selected || postal.selected || coordsSelected;

		if (((dotSizeValue.selected && dotSizeValue.function.selected) || (shadingValue.selected && shadingValue.function.selected))
			&& (countryState.selected || pointItemSelected)) {
			count = 1;
		}

		if (dotSizeValue.selected !== pointItemSelected)
			isError = true;
		if (shadingValue.selected !== countryState.selected)
			isError = true;
		if ((dotSizeValue.selected !== dotSizeValue.function.selected) || (shadingValue.selected !== shadingValue.function.selected)
			|| (!dotSizeValue.selected && !shadingValue.selected))
			isError = true;
		if (longitude.selected !== latitude.selected)
			isError = true;
	}

	DMC_wasMapType = mapType.value;

	if (!isError) {
		if (DMC_isErrorNow) {
			DisableEnablePreviewTab(isError);
			DisableEnableToolbar(isError);
		}
		EBC_CheckFieldsCount(id, count);
	}
	else {
		if (!DMC_isErrorNow) {
			DisableEnablePreviewTab(isError);
			DisableEnableToolbar(isError);
		}
	}
	DMC_isErrorNow = isError;
}

function DMC_OnValueColumnChanged(e, columnID, functionID) {
	if (e) ebc_mozillaEvent = e;

	var row = EBC_GetRow(e);
	if (row == null)
		return;

	var tryToSetDefaultFunction = false;
	var defaultAggregateFunction = 'None';

	var rowFunc = EBC_GetSelectByName(row, functionID);
	rowFunc.removeAttribute('disabled');
	if (e.options[e.selectedIndex].value.indexOf(calcFieldPrefix) === 0) {
		rowFunc.setAttribute('disabled', 'disabled');
		defaultAggregateFunction = 'ForceNone';
		tryToSetDefaultFunction = true;
	}

	EBC_SetFunctions(row, false, true, defaultAggregateFunction, true, functionID, false, null, columnID, null, tryToSetDefaultFunction, true);
}

function DMC_PopulateDescriptions(fields) {
	EBC_PopulateDescriptions(fields);
}

function DMC_OnFieldsListInitialized(id, fields) {
	if (!DMC_DescSet) {
		DMC_PopulateDescriptions(fields);
		MC_OnTableListChangedHandler(id, tablesSave[id]);
	}
	DMC_DescSet = true;
}
