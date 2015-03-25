/* Copyright (c) 2005-2010 Izenda, L.L.C.

 ____________________________________________________________________
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

function MultivaluedCheckBoxSymbolsMatch(s1, s2) {
	var s1Code = s1.charCodeAt(0);
	if (s1Code == 160)
		s1Code = 32;
	var s2Code = s2.charCodeAt(0);
	if (s2Code == 160)
		s2Code = 32;
	return s1Code == s2Code;
}

AdHoc.MultivaluedCheckBox = function(element, row) {
	if (row)
		this.row = row;
	else
		this.row = EBC_GetRow();
	this.elementexists = true;
	var name;
	if (typeof(element) == 'string') {
		this.element = EBC_GetElementByName(this.row, element + "CurrentValue", 'INPUT');
		if (this.element == null)
			this.elementexists = false;
		name = element;
	} else {
		this.element = element;
		name = element.getAttribute("name");
		var parts = name.split('_');
		name = parts[parts.length > 0 ? parts.length - 1 : 0];
	}
	this.name = name;
	this.valueElement = EBC_GetElementByName(this.row, name + "CurrentValue", 'INPUT');
	//this.checkbox = EBC_GetElementByName(this.row, name + "CheckBox", 'INPUT');
	//this.acceptableValuesElement = EBC_GetElementByName(this.row, name + "AcceptableValues", 'INPUT');
	if (this.elementexists) {
		var key = this.element.parentElement.getAttribute('possiblevalues');
		this.key = key;
		this.acceptableValues = AdHoc.MultivaluedCheckBox.acceptableValuesLists[key];
	}
	this.ValueChangeHandlers = SC_onMultivaluedCheckBoxValueChangedHandlers;
};

AdHoc.MultivaluedCheckBox.acceptableValuesLists = {
	"labelJustification": new Array(" ", "L", "R", "M"),
	"justification": new Array(" ", "L", "R", "M"),
	"arithmetic1": new Array(" ", "*", "\u00f7", "-", "+", "=", "&gt;", "&lt;"),
	"arithmetic2": new Array(" ", "*", "\u00f7", "-", "+"),
	"arithmetic3": new Array(" ", "+", "=", "&gt;", "&lt;"),
	"arithmetic4": new Array(" ", "+"),
	"arithmetic5": new Array(" ", "+", "-", "&gt;", "&lt;"),
	"arithmetic6": new Array(" ", "-")
};

AdHoc.MultivaluedCheckBox.prototype = {
// Public methods

// Is div element exists
	ElementExists: function() {
		return this.elementexists;
	},
	
	isDefault: function() {
		var val = this.element.value;
		return (val == " ") || (val == String.fromCharCode(160)) || (val == "~") || ((val != null && val.trim() == ""));
	},
    
	// Is current operation set arithmetic but current operation is not '&nbsp;'
	isArithmeticOperation: function() {
		if (this.key != null && this.isArithmeticOperationWithDefault() != -1 && !this.isDefault())
			return true;
		return false;
	},
    
	// Is current operation set arithmetic
	isArithmeticOperationWithDefault: function() {
		if (this.key.indexOf("arithmetic") != -1)
			return true;
		return false;
	},
    
	// Sets acceptable operations
	setAcceptableValues: function(key) {
		this.key = key;
		this.acceptableValues = AdHoc.MultivaluedCheckBox.acceptableValuesLists[key];
		this.element.parentElement.setAttribute('possiblevalues', key);
	},
    
	// Is element enabled
	isEnabled: function() {
		return !this.element.disabled;
	},
	
	
	// Disable element
	disable: function() {
		this.valueElement.value = " ";
		this.element.disabled = 'disabled';
		this.element.parentElement.setAttribute('class', 'MultivaluedCheckbox disabled');
	},
	
	// Enable element
	enable: function() {
		if (this.elementexists) {
			this.element.disabled = '';
			this.element.parentElement.setAttribute('class', 'MultivaluedCheckbox');
		}
	},
	
    
// Internal methods
    
	// Gets next operation in the current operation set
	getNextAcceptableValue: function() {
		var value = this.valueElement.value;
		var index;
		var length = this.acceptableValues.length;
		for (index = 0; index < length; index++)
			if (this.acceptableValues[index] == value ||
				(this.acceptableValues[index] == " " && value == "~"))
				break;
		if (index == length)
			return null;
		if (index == length - 1)
			index = 0;
		else
			index++;
		return this.acceptableValues[index];
	},
    
	// Internal setter
	setValueInternal: function(value) {
		this.valueElement.value = value;
		switch (value) {
		case "&nbsp;":
			this.element.value = " ";
			break;
		case "&gt;":
			this.element.value = ">";
			break;
		case "&lt;":
			this.element.value = "<";
			break;
		default:
			this.element.value = value;
			break;
		}
	},
	
	// Gets element value
	getValue: function() {
		return this.valueElement.value;
	},
	
	// Set next operation 
	setNextAcceptableValue: function() {
		this.setValueInternal(this.getNextAcceptableValue());
	}
};

AdHoc.MultivaluedCheckBox.RegisterValueChangedHandler = function(rowIndex, ctrlName, funct) {
	var arr = SC_onMultivaluedCheckBoxValueChangedHandlers[rowIndex];
	if (arr == null) {
		arr = new Array();
		SC_onMultivaluedCheckBoxValueChangedHandlers[rowIndex] = arr;
	}
	var handler = { };
	handler.rowindex = rowIndex;
	handler.name = ctrlName;
	handler.funct = funct;
	arr.push(handler);
};

AdHoc.MultivaluedCheckBox.CallOnValueChanged = function(rowIndex) {
	var handlers = SC_onMultivaluedCheckBoxValueChangedHandlers[rowIndex];
	if (!handlers)
		return;
	for (var i = 0; i < handlers.length; i++)
		handlers[i].funct(handlers[i].rowindex);
};

AdHoc.MultivaluedCheckBox.ValueChangedHandler = function (div) {
	var input = jq$(div).find("input");
	var possibleValues = jq$(div).attr("possibleValues");
	var currentValue = input.val();
	if (currentValue.trim() == "")
		currentValue = " ";
	if (input[0].disabled)
	    return;
	var acceptableValues = this.acceptableValuesLists[possibleValues];
	if (acceptableValues != null) {
		var valFound = false;
		for (var i = 0; i < acceptableValues.length && !valFound; i++) {
			if (MultivaluedCheckBoxSymbolsMatch(currentValue, acceptableValues[i])) {
				var nextVal = i + 1;
				if (!(nextVal < acceptableValues.length))
					nextVal = 0;
				var strVal = acceptableValues[nextVal];
				if (strVal == " ")
					strVal = " ";
				input.val(strVal);
				valFound = true;
			}
		}
	}

	var row = EBC_GetRow(div);

	AdHoc.MultivaluedCheckBox.CallOnValueChanged(row["sectionRowIndex"]);
	SC_AfterArithmeticOperationChanged(row);
};

AdHoc.MultivaluedCheckBox.ValueChangedHandlerWOA = function(div) {
	var input = jq$(div).find("input");
	var possibleValues = jq$(div).attr("possibleValues");
	var currentValue = input.val();
	if (currentValue.trim() == "")
		currentValue = " ";
	if (input[0].disabled)
	    return;
	var acceptableValues = this.acceptableValuesLists[possibleValues];
	if (acceptableValues != null) {
		var valFound = false;
		for (var i = 0; i < acceptableValues.length && !valFound; i++) {
			if (MultivaluedCheckBoxSymbolsMatch(currentValue, acceptableValues[i])) {
				var nextVal = i + 1;
				if (!(nextVal < acceptableValues.length))
					nextVal = 0;
				var strVal = acceptableValues[nextVal];
				if (strVal == " ")
					strVal = " ";
				input.val(strVal);
				valFound = true;
			}
		}
	}

	var row = EBC_GetRow(div);

	AdHoc.MultivaluedCheckBox.CallOnValueChanged(row["sectionRowIndex"]);
};

jq$(document).ready(function(){

jq$('.MultivaluedCheckbox input').focus(function(){
	jq$(this).blur();
});
});

