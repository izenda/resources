var JTCS_dsListId = new Array();
var JTCS_categoryComboId = new Array();
var JTCS_recentComboId = new Array();
var JTCS_lastAllowed = new Array();
var JTCS_oldTablesHash = new Array();
var JTCS_initialTfns = new Array();
var JTCS_initialTexts = new Array();
var JTCS_initialTitles = new Array();
var JTCS_onListChangedHandler = {};

function JTCS_RegisterOnListChangedHandler(id, ctrlId, func) {
	var arr = JTCS_onListChangedHandler[id];
	if (arr == null) {
		arr = new Array();
		JTCS_onListChangedHandler[id] = arr;
	}
	var handler = { };
	handler.id = ctrlId;
	handler.func = func;
	arr.push(handler);
}

function JTCS_PrepareTabStrip(id) {
	if (window.tabStripId && !window.tabStriptIdisIlligal)
		return;
	var table = document.getElementById(id);
	while (table != null && table.tagName != 'SPAN')
		table = table.parentNode;
	table = table.firstChild.childNodes;
	A: for (var i = table.length - 1; i >= 0; --i) {
		   var node = table[i];
		   if (node.tagName == 'DIV' && node.className == 'TabStrip')
			   for (var j = node.childNodes.length - 1; j >= 0; --j)
				   if (node.childNodes[j].tagName == 'TABLE') {
					   var tid = node.childNodes[j].tBodies[0].rows[0].id;
					   window.tabStripId = tid.substr(0, tid.length - 4);
					   break A;
				   }
	   }
	window.tabStriptIdisIlligal = true;
}

function JTCS_SelectJoinPresetFromCombo(id) {
	if (JTCS_dsListId[id] == null)
		return;
	var dsList = document.getElementById(JTCS_dsListId[id]);
	if (dsList == null)
		return;
	if (JTCS_recentComboId[id] == null)
		return;
	var recentCombo = document.getElementById(JTCS_recentComboId[id]);
	if (recentCombo == null)
		return;
	var recentValue = recentCombo.value;
	if (recentValue == '' || recentValue == '...') {
		JTCS_UpdateDatasourcesAvailability(id, false);
		return;
	}
	var datasources = recentValue.split('#');
	var dsArr = dsList.getElementsByTagName('input');
	for (var dsCnt = 0; dsCnt < dsArr.length; dsCnt++) {
		dsArr[dsCnt].disabled = 'disabled';
		dsArr[dsCnt].checked = false;
		for (var rlCnt = 0; rlCnt < datasources.length; rlCnt++)
			if (datasources[rlCnt].toString().toLowerCase() == dsArr[dsCnt].parentNode.attributes['tfn'].nodeValue.toLowerCase())
				dsArr[dsCnt].checked = true;
	}
	JTCS_UpdateDatasourcesAvailability(id, true);
}

function JTCS_OnListChanged(id, tablesList) {
	var handlers = JTCS_onListChangedHandler[id];
	if (handlers != null) {
		for (var i = 0; i < handlers.length; i++)
			handlers[i].func(handlers[i].id, tablesList, true);
	}
	allTabsFilled = true;
}

function JTCS_UpdateTabStrip(id, allowContinue) {
	if (window.DisableEnableTabsFrom && window.firstDisabledTabIndex) {
		JTCS_PrepareTabStrip(id);
		if (allowContinue != JTCS_lastAllowed[id]) {
			JTCS_lastAllowed[id] = allowContinue;
			DisableEnableTabsFrom(JTCS_lastAllowed[id], firstDisabledTabIndex);
		}
	}
}

function JTCS_IsPath(nodes, ribs, exceptIndex) {
	var excludeNodes = 0;
	if (exceptIndex > -1)
		excludeNodes = 1;
	if (nodes.length - excludeNodes  > 0) {
		for (var i=0;i<nodes.length;i++) {
			if (i != exceptIndex)
				nodes[i].PathTo = false;
			else 
				nodes[i].PathTo = true;
		}
		var arrayWithPath = new Array();
		var firstNode = nodes[0];
		if (exceptIndex ==0)
			firstNode = nodes[1];
		firstNode.PathTo = true;
		arrayWithPath.push(firstNode);
		for (var i=0;i<arrayWithPath.length;i++) {
			for (var j=0;j<ribs.length;j++) {
				if (ribs[j][0] == arrayWithPath[i].Name || ribs[j][1] == arrayWithPath[i].Name) {
					if (!nodes[ribs[j][0]].PathTo) {
						nodes[ribs[j][0]].PathTo = true;
						arrayWithPath.push(nodes[ribs[j][0]]);
					}
					if (!nodes[ribs[j][1]].PathTo) {
						nodes[ribs[j][1]].PathTo = true;
						arrayWithPath.push(nodes[ribs[j][1]]);
					}
				}
			}
		}
		var pathTo = true;
		for (var i=0; pathTo && i<nodes.length;i++) {
			pathTo = nodes[i].PathTo;
		}
		return pathTo;
	}
	return true;
	
}

function JTCS_UpdateDatasourcesAvailability(id, fromPopular) {
	if (JTCS_dsListId[id] == null)
		return;
	var dsList = document.getElementById(JTCS_dsListId[id]);
	if (dsList == null)
		return;
	var dsArr = dsList.getElementsByTagName('input');

	var allDatasources = new Array();
	var checkedDatasources = new Array();
	var dsSelected = new Array();


	var tablesHash = '';
	for (var i = 0; i < dsArr.length; i++) {

		var dsInfo = new Object();
		dsInfo.Name = dsArr[i].parentNode.attributes['tfn'].nodeValue;
		dsInfo.Checked = dsArr[i].checked;
		dsInfo.CanBeExcludedOrAdded = false;
		dsInfo.PathTo = false;
		dsInfo.JoinAlias = dsArr[i].parentNode.getAttribute('joinalias');
		allDatasources[dsInfo.Name] = dsInfo;
		allDatasources.push(dsInfo);
		if (dsInfo.Checked) {
			dsSelected.push(dsInfo.Name);
			checkedDatasources[dsInfo.Name] = dsInfo;
			checkedDatasources.push(dsInfo);
			tablesHash += dsInfo.Name + ',';
			if (typeof dsInfo.JoinAlias != 'undefined' && dsInfo.JoinAlias != null && dsInfo.JoinAlias != '')
				tablesHash += dsInfo.JoinAlias;
			tablesHash += ',';
		}
	}
	var allowNullsId = id + '_AllowNullsDiv';
	var allowNullsCtl = document.getElementById(allowNullsId);
	if (allowNullsCtl) {
		if (checkedDatasources.length > 1)
			allowNullsCtl.style.visibility = '';
		else
			allowNullsCtl.style.visibility = 'hidden';
	}
	var selectedDatasourcesId = id + '_SelectedDatasources';
	var selectedDatasources = document.getElementById(selectedDatasourcesId);
	if (selectedDatasources == null)
		return;

	if (checkedDatasources.length == 0) {
		for (var i = 0; i < allDatasources.length; i++) {
			allDatasources[i].CanBeExcludedOrAdded = true;
		}
	} else {
		var ribBeweenChecked = new Array();
		var ribBeweenCheckedAndUnchecked = new Array();
		for (var i = 0; i < ebc_constraintsInfo.length; i++) {
			if (checkedDatasources[ebc_constraintsInfo[i][0]] != null) {
				if (checkedDatasources[ebc_constraintsInfo[i][1]] != null) {
					ribBeweenChecked.push(ebc_constraintsInfo[i]);
				} else {
					ribBeweenCheckedAndUnchecked.push(ebc_constraintsInfo[i]);
				}
			} else {
				if (checkedDatasources[ebc_constraintsInfo[i][1]] != null)
					ribBeweenCheckedAndUnchecked.push(ebc_constraintsInfo[i]);
			}
		}

		var isPathTo = JTCS_IsPath(checkedDatasources, ribBeweenChecked, -1);
		if (!isPathTo) {
			for (var i = 0; i < dsArr.length; i++) {
				dsArr[i].checked = false;
				if (!fromPopular)
					dsArr[i].disabled = '';
			}
			JTCS_UpdateTabStrip(id, false);
			if (DisableEnableToolbar)
				DisableEnableToolbar(false, false);
			return;
		} else {
			for (var i = 0; i < checkedDatasources.length; i++) {
				checkedDatasources[i].CanBeExcludedOrAdded = JTCS_IsPath(checkedDatasources, ribBeweenChecked, i);
			}
		}
		for (var i = 0; i < ribBeweenCheckedAndUnchecked.length; i++) {
			if (ribBeweenCheckedAndUnchecked[i][0] in allDatasources && ribBeweenCheckedAndUnchecked[i][1] in allDatasources) {
				if (!allDatasources[ribBeweenCheckedAndUnchecked[i][0]].Checked)
					allDatasources[ribBeweenCheckedAndUnchecked[i][0]].CanBeExcludedOrAdded = true;
				if (!allDatasources[ribBeweenCheckedAndUnchecked[i][1]].Checked)
					allDatasources[ribBeweenCheckedAndUnchecked[i][1]].CanBeExcludedOrAdded = true;
			}
		}
	}

	selectedDatasources.value = '';
	selectedDatasources.value = tablesHash;
	if (checkedDatasources.length > 0) {
		JTCS_UpdateTabStrip(id, true);
		if (JTCS_oldTablesHash[id] != tablesHash) {
			JTCS_oldTablesHash[id] = tablesHash;
			JTCS_OnListChanged(id, dsSelected);
		}
		if (EBC_CheckFieldsCount)
			EBC_CheckFieldsCount('', 0);
	} else {
		JTCS_UpdateTabStrip(id, false);
		if (DisableEnableToolbar)
			DisableEnableToolbar(false, false);
	}
	if (!fromPopular) {
		for (var i = 0; i < allDatasources.length; i++) {
			dsArr[i].disabled = allDatasources[i].CanBeExcludedOrAdded ? '' : 'disabled';
		}


	}
	for (var i = 0; i < dsArr.length; i++) {
		if (!allDatasources[i].Checked)
			dsArr[i].parentNode.style.fontWeight = 'normal';
		else
			dsArr[i].parentNode.style.fontWeight = 'bold';
		if (dsArr[i].disabled)
			dsArr[i].parentNode.style.color = '#808080';
		else
			dsArr[i].parentNode.style.color = '#000000';
	}
}

function JTCS_UpdateControls(id, dsListId, initialDatasources) {
	initialArr = initialDatasources.split(',');
	var dsList = document.getElementById(dsListId);
	if (dsList == null)
		return;
	var dsArr = dsList.getElementsByTagName('input');
	for (var i = 0; i < dsArr.length; i++) {
		dsArr[i].checked = false;
		var initialCnt = 0;
		while (initialCnt < initialArr.length - 1) {
			if (initialArr[initialCnt].toString().toLowerCase() == dsArr[i].parentNode.attributes['tfn'].nodeValue.toString().toLowerCase()) {
				dsArr[i].checked = true;
				if (initialArr[initialCnt + 1].toString() != '') {
					dsArr[i].parentNode.setAttribute('joinalias', initialArr[initialCnt + 1].toString());
				}
				break;
			}
			initialCnt += 2;
		}
	}
}

var JTCS_Init_executes = false;

function JTCS_Init(id, dsListId, categoryComboId, recentComboId, initialDatasources) {
	JTCS_Init_executes = true;
	var m = document.getElementById('JTCS_DataSourceTabModeHF');
	if (m != null)
		m.value = 'checkbox';
	JTCS_categoryComboId[id] = categoryComboId;
	JTCS_recentComboId[id] = recentComboId;
	JTCS_dsListId[id] = dsListId;
	JTCS_lastAllowed[id] = null;
	JTCS_oldTablesHash[id] = '';
	JTCS_PrepareTabStrip(id);
	//if (typeof (DisableEnableTabsFrom) != 'undefined' && typeof (firstDisabledTabIndex) != 'undefined')
	//  DisableEnableTabsFrom(false, firstDisabledTabIndex);
	EBC_RegisterControl(id);
	EBC_LoadConstraints();
//  JTCS_StoreInitialOrder(id);
	JTCS_UpdateControls(id, dsListId, initialDatasources);
	JTCS_UpdateDatasourcesAvailability(id, false);
	JTCS_Init_executes = false;
	if (typeof CHC_OnTableListChangedHandlerWithStoredParams === "function")
		CHC_OnTableListChangedHandlerWithStoredParams();
	if (typeof GC_OnTableListChangedHandlerWithStoredParams === "function")
		GC_OnTableListChangedHandlerWithStoredParams();
	if (typeof MC_OnTableListChangedHandlerWithStoredParams === "function")
		MC_OnTableListChangedHandlerWithStoredParams();
	if (typeof RC_OnTableListChangedHandlerWithStoredParams === "function")
		RC_OnTableListChangedHandlerWithStoredParams();
}
