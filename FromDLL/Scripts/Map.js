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

var DMC_isErrorNow = false;
var DMC_visibilityNow = false;
var DMC_wasMapType = '...';

function MC_OnTableListChangedHandlerWithStoredParams() {
	if (lastCallParams_MC_OnTableListChangedHandler == null || lastCallParams_MC_OnTableListChangedHandler.length != 2)
		return;
	MC_OnTableListChangedHandler(lastCallParams_MC_OnTableListChangedHandler[0], lastCallParams_MC_OnTableListChangedHandler[1]);
}

var lastCallParams_MC_OnTableListChangedHandler = new Array();
function MC_OnTableListChangedHandler(id, tables) {
	if (tables == null)
		return;
	var sc_wac_works_val = false;
	if (typeof sc_qac_works != 'undefined' && sc_qac_works != null && sc_qac_works == true)
		sc_wac_works_val = true;
	var JTCS_Init_executes_val = false;
	if (typeof JTCS_Init_executes != 'undefined' && JTCS_Init_executes != null && JTCS_Init_executes == true)
		JTCS_Init_executes_val = true;
	if (sc_wac_works_val || JTCS_Init_executes_val) {
		lastCallParams_MC_OnTableListChangedHandler = new Array();
		lastCallParams_MC_OnTableListChangedHandler[0] = id;
		lastCallParams_MC_OnTableListChangedHandler[1] = tables;
		return;
	}
	var table = document.getElementById(id+"_Table");
	var body = table.tBodies[0];

	if (tables.join != null)
		tables = tables.join('\'');
	tablesSave[id] = tables;

	var additionalData = null;
	if (descriptions != null && descriptions.length > 0) {
		additionalData = "<option disabled=''>------</option>";
		for (var j = 0; j < descriptions.length; j++) {
			var calcField = descriptions[j];
			additionalData = additionalData + '<option value="Desciption!' + calcField.description + '"' + (calcField.datatype != null ? (' datatype="' + calcField.datatype + '"') : '') + ' fieldIndex="' + calcField.fieldIndex + '">[' + calcField.description + '] (calc)</option>';
		}
	}

	var sel = document.getElementById(id + '_CountryState');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true", sel);
	sel = document.getElementById(id + '_City');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true", sel);
	sel = document.getElementById(id + '_Postal');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true", sel);
	sel = document.getElementById(id + '_Longitude');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true", sel);
	sel = document.getElementById(id + '_Latitude');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true", sel);
	sel = document.getElementById(id + '_ShadingValue');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true&map=1", sel, true, null, additionalData);
	sel = document.getElementById(id + '_DotSizeValue');
	EBC_LoadData("CombinedColumnList", "tables=" + tables + "&includeBlank=true&map=1", sel, true, null, additionalData);
}

function MC_OnFieldsListChangedHandler(id, fields) {
	DMC_PopulateDescriptions(fields);
	MC_OnTableListChangedHandler(id, tablesSave[id]);
}

function DMC_UpdateVisibility(id, visibility) {
  var usaMap = (document.getElementById(id + '_MapType').value == 'USA') ? true : false;
  var australiaMap = (document.getElementById(id + '_MapType').value == 'Australia') ? true : false;
  var countryMap = (document.getElementById(id + '_MapType').value == 'World') ? true : false;
  var europeMap = (document.getElementById(id + '_MapType').value == 'Europe') ? true : false;
  var row = document.getElementById(id + '_countryStateRow');
  row.style.visibility = visibility;
  if (usaMap || australiaMap) { 
    row.cells[0].innerHTML = jsResources.State;
  }
  if (countryMap || europeMap) {
    row.cells[0].innerHTML = jsResources.Country;
  }
  row = document.getElementById(id + '_autoRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_shadingLabelRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_indicatorLabelRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_cityRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_postalRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_longitudeRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_latitudeRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_shadingRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_fillFromColorRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_fillToColorRow');
  row.style.visibility = visibility;  
  row = document.getElementById(id + '_dotsizevalueRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_shadingTargetreportRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_valueTargetreportRow');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_labelRow1');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_labelRow2');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_labelRow3');
  row.style.visibility = visibility;
  row = document.getElementById(id + '_labelRow4');
  row.style.visibility = visibility;
}

function DMC_SelectValue(id, sId, valueInd) {
  var options = document.getElementById(id + sId);
  for (var i = 0; i < options.length; i++) {
    if (i != valueInd && options[i].selected) {
      options[i].selected = false;
    }
    if (i == valueInd && !options[i].selected) {
      options[i].selected = true;
    }    
  }
}

function DMC_AutoSelect(id) {
  var options = document.getElementById(id + '_CountryState');
  var fNum = 0;
  var fields = new Array();
  for (var i = 0; i < options.length; i++) {
    var fName = options[i].innerHTML;
    if (fName.charAt(fName.length - 1) == ']') {
      fName = fName.substr(0, fName.length - 1);
      var lastBracket = fName.lastIndexOf('[');
      fName = fName.substr(lastBracket + 1);
    }
    fNum++;
    fields[fNum - 1] = fName.toLowerCase();
  }
  var usaMap = (document.getElementById(id + '_MapType').value == 'USA') ? true : false;
  var australiaMap = (document.getElementById(id + '_MapType').value == 'Australia') ? true : false;
  var matchCountryState = -1;
  var matchCity = -1;
  var matchLongitude = -1;
  var matchLatitude = -1;
  var closestCountryState = -1;
  var closestState = -1;
  var closestCity = -1;
  var closestPostal = -1;
  var closestLongitude = -1;
  var closestLatitude = -1;
  for (var i = 0; i < fields.length; i++) {
    if (fields[i] == 'country' && !usaMap) {
      matchCountryState = i;
    }
    if (fields[i] == 'state' && (usaMap || australiaMap)) {
      matchCountryState = i;
    }
    if (fields[i] == 'city') {
      matchCity = i;
    }
    if (fields[i] == 'longitude') {
      matchLongitude = i;
    }
    if (fields[i] == 'latitude') {
      matchLatitude = i;
    }
    if (fields[i].indexOf('country') >= 0 && !usaMap) {
      closestCountryState = i;
    }
    if (fields[i].indexOf('state') >= 0 && (usaMap || australiaMap)) {
      closestCountryState = i;
    }
    if (fields[i].indexOf('city') >= 0) {
      closestCity = i;
    }
    if (fields[i].indexOf('postal') >= 0 || fields[i].indexOf('zip') >= 0) {
      closestPostal = i;
    }    
    if (fields[i].indexOf('longitude') >= 0) {
      closestLongitude = i;
    }
    if (fields[i].indexOf('latitude') >= 0) {
      closestLatitude = i;
    }
  }
  //if (matchLongitude >= 0 && matchLatitude >= 0) {
  //  DMC_SelectValue(id, '_Longitude', matchLongitude);
  //  DMC_SelectValue(id, '_Latitude', matchLatitude);
  //  return;
  //}
  //if (matchCity >= 0) {
  //  DMC_SelectValue(id, '_City', matchCity);
  //}
  if (matchCountryState >= 0) {
    DMC_SelectValue(id, '_CountryState', matchCountryState);
  }
  //if (closestPostal >= 0) {
  //  DMC_SelectValue(id, '_Postal', closestPostal);
  //}
  if (matchCity >= 0 || matchCountryState >= 0) {
    return;
  }
  //if (closestLatitude >= 0 && closestLatitude >= 0 && closestPostal < 0) {
  //  DMC_SelectValue(id, '_Longitude', closestLongitude);
  //  DMC_SelectValue(id, '_Latitude', closestLatitude);    
  //}
  else {
    //if (closestCity >= 0) {
    //  DMC_SelectValue(id, '_City', closestCity);
    //}
    if (closestCountryState >= 0) {
      DMC_SelectValue(id, '_CountryState', closestCountryState);
    }
  }
}

function DMC_CheckFieldAllowed(columnSel) {
  try {
    var oldValue = columnSel.getAttribute("oldValue");
    if (columnSel.options[columnSel.selectedIndex].restrictselecting == "true") {
      if (oldValue != null && columnSel.options[columnSel.selectedIndex].value != oldValue) {
        EBC_SetSelectedIndexByValue(columnSel, oldValue);
        alert(jsResources.ThisFieldCannotBeSelected);
      }
    }
    columnSel.setAttribute("oldValue", columnSel.options[columnSel.selectedIndex].value);
  }
  catch (exc) {
  }
}

function DMC_FieldsChanged(id) {
  var isError = false;
  var count = 0;
  var selValue = document.getElementById(id + '_MapType');
  var mapTypeSelected = !(selValue.value == '...' || selValue.value == 'None');
  var visibility = '';
  if (!mapTypeSelected) {
    visibility = 'hidden';
  }
  var mapType = selValue.value;
  if (mapType != DMC_wasMapType) {
    DMC_visibilityNow = visibility;
    DMC_UpdateVisibility(id, visibility);
  }
  if (mapTypeSelected) {
    var usaMap = (document.getElementById(id + '_MapType').value == 'USA') ? true : false;
    var australiaMap = (document.getElementById(id + '_MapType').value == 'Australia') ? true : false;
    var sel;
    sel = document.getElementById(id + '_CountryState');
    DMC_CheckFieldAllowed(sel);
    var countryStateSelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    sel = document.getElementById(id + '_City');
    DMC_CheckFieldAllowed(sel);
    var citySelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    sel = document.getElementById(id + '_Postal');
    DMC_CheckFieldAllowed(sel);
    var postalSelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    sel = document.getElementById(id + '_Longitude');
    DMC_CheckFieldAllowed(sel);
    var longitudeSelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    sel = document.getElementById(id + '_Latitude');
    DMC_CheckFieldAllowed(sel);
    var latitudeSelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    sel = document.getElementById(id + '_ShadingValue');
    DMC_CheckFieldAllowed(sel);
    var shadingValueSelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    var shadingFunctionSelected = (document.getElementById(id + '_ShadingFunction').value == '...' || document.getElementById(id + '_ShadingFunction').value == 'None') && !sel.value.startsWith('Desciption!') ? false : true;
    if (!shadingValueSelected && shadingFunctionSelected)
      DMC_SelectValue(id, '_ShadingFunction', 0);
    sel = document.getElementById(id + '_DotSizeValue');
    DMC_CheckFieldAllowed(sel);
    var dotSizeValueSelected = (sel.value == '...' || sel.value == 'None') ? false : true;
    var dotSizeFunctionSelected = (document.getElementById(id + '_DotFunction').value == '...' || document.getElementById(id + '_DotFunction').value == 'None') && !sel.value.startsWith('Desciption!') ? false : true;
    if (!dotSizeValueSelected && dotSizeFunctionSelected)
      DMC_SelectValue(id, '_DotFunction', 0);
    if (!countryStateSelected && !citySelected && !postalSelected && !longitudeSelected && !latitudeSelected && !shadingValueSelected && !shadingFunctionSelected && !dotSizeValueSelected && !dotSizeFunctionSelected) {
      if (DMC_wasMapType == '...') {
        DMC_AutoSelect(id);
      }
    }
    if (((dotSizeValueSelected && dotSizeFunctionSelected) || (shadingValueSelected && shadingFunctionSelected)) && (countryStateSelected || citySelected || postalSelected || (longitudeSelected && latitudeSelected))) {
      count = 1;
    }
    if (dotSizeValueSelected != (longitudeSelected || citySelected || postalSelected))
    	isError = true;
    if (shadingValueSelected != countryStateSelected)
	    isError = true;
    if ((dotSizeValueSelected != dotSizeFunctionSelected) || (shadingValueSelected != shadingFunctionSelected) || (!dotSizeValueSelected && !shadingValueSelected)) {
      isError = true;
    }
    if (longitudeSelected != latitudeSelected) {
      isError = true;
    }
    if (longitudeSelected && (citySelected || countryStateSelected || postalSelected)) {
      isError = true;
    }
  }
  DMC_wasMapType = document.getElementById(id + '_MapType').value;
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

function DMC_OnValueColumnChanged(e, columnID, functionID){
	if (e)
		ebc_mozillaEvent = e;
	var row = EBC_GetRow(e);
	if (row == null)
		return;

	var tryToSetDefaultFunction = false;
	var defaultAggregateFunction = "None";

	var rowFunc = EBC_GetSelectByName(row, functionID);
	jq$(rowFunc).removeAttr('disabled');
	if (e.options[e.selectedIndex].value.indexOf('Desciption!') == 0) {
		jq$(rowFunc).attr('disabled', 'true');
		defaultAggregateFunction = "ForceNone";
		tryToSetDefaultFunction = true;
	}

	EBC_SetFunctions(row, true, false, defaultAggregateFunction, true, functionID, null, null, columnID, null, tryToSetDefaultFunction);
}

function DMC_PopulateDescriptions(fields) {
	EBC_PopulateDescriptions(fields);
}

var DMC_DescSet = false;
function DMC_OnFieldsListInitialized(id, fields) {
	if (!DMC_DescSet) {
		DMC_PopulateDescriptions(fields);
		MC_OnTableListChangedHandler(id, tablesSave[id]);
	}
	DMC_DescSet = true;
}