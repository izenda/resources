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

var categoryId;
var drillDownKeyListIds;

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

function RC_Init(id, ddklIds)
{
	categoryId = id;
	drillDownKeyListIds = ddklIds;
}

function RC_SetCategory(category)
{
	var categoryControl = document.getElementById(categoryId);
	if(categoryControl!=null)
		categoryControl.value = category;
}

function RC_OnVisibilityDropDownListChange(obj, visibleToId, visibilityTextBoxId)
{
	var visibleTo = document.getElementById(visibleToId);
	var visibilityTextBox = document.getElementById(visibilityTextBoxId);
	if(obj.value=="Multiple")
	{
		visibleTo.style["visibility"] = "visible";
		visibilityTextBox.style["visibility"] = "visible";
	}
	else
	{
		visibleTo.style["visibility"] = "hidden";
		visibilityTextBox.style["visibility"] = "hidden";
	}
	
}

function RC_OnVisibilityTextBoxActivate(obj)
{
	obj.value = "";
}

function RC_OnTableListChangedHandlerWithStoredParams() {
	if (lastCallParams_RC_OnTableListChangedHandler == null || lastCallParams_RC_OnTableListChangedHandler.length != 2)
		return;
	RC_OnTableListChangedHandler(lastCallParams_RC_OnTableListChangedHandler[0], lastCallParams_RC_OnTableListChangedHandler[1]);
}

var lastCallParams_RC_OnTableListChangedHandler = new Array();
function RC_OnTableListChangedHandler(id, tables) {
	var pageContext = izenda.pages.designer.context;

	var JTCS_Init_executes_val = izenda.isDefined(JTCS_Init_executes) && JTCS_Init_executes === true;

	if (pageContext.qac_works || JTCS_Init_executes_val) {
		lastCallParams_RC_OnTableListChangedHandler = new Array();
		lastCallParams_RC_OnTableListChangedHandler[0] = id;
		lastCallParams_RC_OnTableListChangedHandler[1] = tables;
		return;
	}
	if(tables.join!=null)
		tables = tables.join('\'');
	for (var index = 0; index < drillDownKeyListIds.length; index++) {
		var drillDownKeyList = document.getElementById(drillDownKeyListIds[index]);
		EBC_LoadData("CombinedColumnList", "tables=" + tables, drillDownKeyList);
	}
}
