String.prototype.endsWith = function (suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var filtersData = new Array();
var subreportsFiltersData;
var showingC = false;
var calendars;
var filtersDataObtained = false;
var makeFiltersFloat;
var refreshFiltersLastGUID = '';
var useGetRenderedReportSetForFilters = true;

(function (ns) {
	ns.reportViewerFilter = ns.reportViewerFilter || {};

	ns.reportViewerFilter.datepickerReadyToShow = true;

})(window.izenda || (window.izenda = {}));

function ToggleFilters() {
	var filtersBodyDiv$ = jq$('#filtersBodyDiv');
	if (filtersBodyDiv$.css('visibility') == 'hidden') {
		filtersBodyDiv$.css('visibility', 'visible');
		filtersBodyDiv$.css('height', 'auto');
	}
	else {
		filtersBodyDiv$.css('visibility', 'hidden');
		filtersBodyDiv$.css('height', '0px');
	}
}

/**
* Returns value(s) for filter with number (index)
*/
function GetFilterValues(index, filters, id) {
	if (filters == null)
		filters = filtersData;
	if (id == null)
		id = index;

	var result = new Array();
	result[0] = '';
	switch (filters[index].ControlType) {
		case 1:
		case 11:
		case 100:
			var pItem = document.getElementById('ndbfc' + id).parentElement;
			if (filters[index].ControlType == 11)
				pItem = pItem.parentElement;
			result[0] = pItem.id;
			result[1] = document.getElementById('ndbfc' + id).value;
			break;
		case 2:
			result[0] = document.getElementById('ndbfc' + id + '_l').parentElement.id;
			result[1] = document.getElementById('ndbfc' + id + '_l').value;
			result[2] = document.getElementById('ndbfc' + id + '_r').value;
			break;
		case 3:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			result[1] = document.getElementById('ndbfc' + id).value;
			break;
		case 4:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			result[1] = document.getElementById('ndbfc' + id).value;
			break;
		case 5:
			result[0] = document.getElementById('ndbfc' + id + '_1').parentElement.id;
			result[1] = document.getElementById('ndbfc' + id + '_1').value;
			result[2] = document.getElementById('ndbfc' + id + '_2').value;
			break;
		case 6:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			result[1] = document.getElementById('ndbfc' + id).value || "...";
			break;
		case 7:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			result[1] = document.getElementById('ndbfc' + id).value;
			break;
		case 8:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			var combinedRes8 = '...';
			var cnt8 = 0;
			var cb = document.getElementById('ndbfc' + id + '_cb' + cnt8);
			while (cb != null) {
				if (cb.checked) {
					if (combinedRes8 == '...')
						combinedRes8 = '';
					combinedRes8 += cb.value + ',';
				}
				cnt8++;
				cb = document.getElementById('ndbfc' + id + '_cb' + cnt8);
			}
			if (combinedRes8 && combinedRes8 != '...')
				combinedRes8 = combinedRes8.substring(0, combinedRes8.length - 1);
			result[1] = combinedRes8;
			break;
		case 9:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			result[1] = document.getElementById('ndbfc' + id).value;
			break;
		case 10:
			result[0] = document.getElementById('ndbfc' + id).parentElement.id;
			var combinedRes = '...';
			var selCtl = document.getElementById('ndbfc' + id);
			for (var cnt10 = 0; cnt10 < selCtl.options.length; cnt10++) {
				if (selCtl.options[cnt10].selected) {
					if (combinedRes == '...')
						combinedRes = '';
					combinedRes += selCtl.options[cnt10].value + ',';
				}
			}
			if (combinedRes && combinedRes != '...')
				combinedRes = combinedRes.substring(0, combinedRes.length - 1);
			result[1] = combinedRes;
			break;
		default:
			break;
	}
	for (var i = 0; i < result.length; i++)
		result[i] = result[i].NormalizeLineBreaks();
	return result;
}

/**
* Save filters stored in 'filtersData' variable.
*/
function CommitChangedFilter(field) {
	if (field.FilterGUID) {	
		for (var i = 0; i < filtersData.length; i++)
			if (filtersData[i].GUID == field.FilterGUID) {
				if (filtersData[i].OperatorValue.endsWith('Field') && !field.FilterOperator.endsWith('Field'))
					filtersData[i].ClearValue = true;
				filtersData[i].OperatorValue = field.FilterOperator;
				filtersData[i].Alias = field.Alias;
				break;
			}
	}
	CommitFiltersData(false);
}

function CommitFiltersData(updateReportSet) {
	// Handle situation when server-side sort caused sorting exception
	var sortErrorControl = jq$('[name="iz-critical_report_error"]');
	if (sortErrorControl && sortErrorControl.length > 0 && typeof sortedFieldGuid != 'undefined' && sortedFieldGuid) {
		for (var i = 0; i < fieldsList.length; i++)
			if (fieldsList[i].GUID == sortedFieldGuid) {
				fieldsList[i].OrderType = 'NONE';
				sortedFieldGuid = null;
				break;
			}
		if (typeof UpdateFieldsAndRefresh == 'function')
			UpdateFieldsAndRefresh();
		return;
	}

	var dataToCommit = new Array();
	dataToCommit = dataToCommit.concat(GetFiltersDataToCommit());
	dataToCommit = dataToCommit.concat(GetSubreportsFiltersDataToCommit());

	if (dataToCommit.length == 0) {
		GetRenderedReportSet(true);
		return;
	}

	filtersDataObtained = false;

	// Save scroll position within the checkbox filters' divs
	var positions = [];
	jq$('#htmlFilters .saveScroll').each(function () {
		if (!jq$(this).attr('id') || this.scrollTop == 0)
			return;
		positions.push(
				{
        	id: jq$(this).attr('id'),
        	scroll: this.scrollTop
				});
	});
	// Disable filters so they cannot be changed until they are in the relevant state
	jq$('#htmlFilters :input').prop('disabled', true);

	var cmd = 'setfiltersdata';
	if (!updateReportSet)
		cmd = 'refreshcascadingfilters';
	var requestString = 'wscmd=' + cmd + '&wsarg0=' + encodeURIComponent(JSON.stringify(dataToCommit));
	// Instant Report handling
	if (typeof nirConfig != 'undefined' && nirConfig != null && typeof dataSources != 'undefined' && dataSources != null) {
		var ds = new Array();
		for (var i = 0; i < dataSources.length; i++)
			ds.push(dataSources[i].DbName);
		requestString += '&wsarg1=' + encodeURIComponent(JSON.stringify(ds));
	}
	refreshFiltersLastGUID = GenerateGuid();
	if (updateReportSet)
		AjaxRequest(urlSettings.urlRsPage, requestString, FiltersDataSet, null, 'setfiltersdata');
	else
		AjaxRequest(urlSettings.urlRsPage, requestString, function (returnObj, id) {
			CascadingFiltersChanged(returnObj, id);
			for (var i = 0; i < positions.length; i++) {
				if (jq$('#' + positions[i].id) != null)
					jq$('#' + positions[i].id)[0].scrollTop = positions[i].scroll;
			}
		}, null, 'refreshcascadingfilters-' + refreshFiltersLastGUID);
}

function GetFiltersDataToCommit() {
	var dataToCommit = new Array();
	if (filtersData == null || filtersData.length <= 0)
		return dataToCommit;

	for (var index = 0; index < filtersData.length; index++) {
		var filterObj = new Object();
		filterObj.Removed = filtersData[index].Removed;
		filterObj.Uid = filtersData[index].Uid;
		filterObj.GUID = filtersData[index].GUID;
		filterObj.Column = filtersData[index].ColumnName;
		filterObj.FieldFilter = filtersData[index].FieldFilter;
		filterObj.OperatorValue = filtersData[index].OperatorValue;
		filterObj.AliasTable = filtersData[index].AliasTable;
		filterObj.Alias = encodeURIComponent(filtersData[index].Alias);
		if (!filtersData[index].Removed && !filtersData[index].ClearValue && filtersData[index].GUID != "") {
			filterObj.Values = GetFilterValues(index, filtersData).slice(1);
			if (filterObj.Values && filterObj.Values.length)
				for (var j = 0; j < filterObj.Values.length; j++)
					filterObj.Values[j] = encodeURIComponent(filterObj.Values[j]);
		}
		else
			filterObj.Values = [""];
		dataToCommit[index] = filterObj;
	}
	return dataToCommit;
}

function UpdateFiltersDataValuesFromUI() {
	for (var index = 0; index < filtersData.length; index++) {
		var filterValues = GetFilterValues(index, filtersData);
		filtersData[index].Values = filterValues;
		filtersData[index].Value = filterValues.slice(1);
	}
}

function GetSubreportsFiltersDataToCommit() {
	var dataToCommit = new Array();
	if (subreportsFiltersData == null || subreportsFiltersData.length <= 0)
		return dataToCommit;

	var globalIndex = 0;
	for (var i = 0; i < subreportsFiltersData.length; i++) {
		for (var index = 0; index < subreportsFiltersData[i].FiltersData.Filters.length; index++) {
			var filter = subreportsFiltersData[i].FiltersData.Filters[index];
			var filterObj = new Object();
			filterObj.Removed = filter.Removed;
			filterObj.Uid = filter.Uid;
			filterObj.GUID = filter.GUID;
			filterObj.IsSubreportFilter = true;
			filterObj.SubreportName = subreportsFiltersData[i].SubreportFullName;
			filterObj.AliasTable = subreportsFiltersData[i].AliasTable;
			if (!filter.Removed) {
				filterObj.Values = GetFilterValues(index, subreportsFiltersData[i].FiltersData.Filters, filter.GUID).slice(1);
				if (filterObj.Values && filterObj.Values.length)
					for (var j = 0; j < filterObj.Values.length; j++)
						filterObj.Values[j] = encodeURIComponent(filterObj.Values[j]);
			}
			dataToCommit[globalIndex] = filterObj;
			globalIndex++;
		}
	}

	return dataToCommit;
}

/**
* Reload and render filters
*/
function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function RemoveFilterByFieldGuid(fieldGuid) {
	for (var index = 0; index < filtersData.length; index++) {
		var filter = filtersData[index];
		if (filter.FieldGuid == fieldGuid) {
			var uid = filter.Uid;
			filter.Removed = true;
			for (var i = 0; i < fieldsList.length; i++)
				if (fieldsList[i].DbName == filter.ColumnName)
					fieldsList[i].FilterOperator = '';
			var filterDiv = document.getElementById(uid);
			if (filterDiv != null)
				filterDiv.style.visibility = 'hidden';
			break;
		}
	}

	var updateReportSet = true;
	// Instant Report page
	if (typeof nirConfig != 'undefined' && nirConfig != null)
		updateReportSet = false;
	CommitFiltersData(updateReportSet);
}

function RemoveFilterByUid(uid) {
	for (var index = 0; index < filtersData.length; index++) {
		if (filtersData[index].Uid == uid) {
			filtersData[index].Removed = true;
			for (var i = 0; i < fieldsList.length; i++)
				if (fieldsList[i].DbName == filtersData[index].ColumnName)
					fieldsList[i].FilterOperator = '';
			var filterDiv = document.getElementById(uid);
			if (filterDiv != null)
				filterDiv.style.visibility = 'hidden';
			break;
		}
	}

	var updateReportSet = true;
	// Instant Report page
	if (typeof nirConfig != 'undefined' && nirConfig != null)
		updateReportSet = false;
	CommitFiltersData(updateReportSet);
}

function ShowHideAddFilter() {
	var dNewFilterDiv = document.getElementById('dNewFilter');
	var newFilterColumnSelDiv = document.getElementById('newFilterColumnSel');
	var fuidNewFilterDiv = document.getElementById('fuidNewFilter');
	var isExpanded = fuidNewFilterDiv.getAttribute('expanded') == 'true';
	if (isExpanded) {
		fuidNewFilterDiv.style.width = '30px';
		dNewFilterDiv.innerHTML = '+';
		newFilterColumnSelDiv.style.display = 'none';
		fuidNewFilterDiv.setAttribute('expanded', 'false');
	}
	else {
		fuidNewFilterDiv.style.width = '300px';
		dNewFilterDiv.innerHTML = 'x';
		newFilterColumnSelDiv.style.display = '';
		fuidNewFilterDiv.setAttribute('expanded', 'true');
	}
}

function AddNewFilterField() {
	var newFilterFieldDropDown = document.getElementById('newFilterFieldDropDown');
	if (newFilterFieldDropDown.value == null || newFilterFieldDropDown.value == '' || newFilterFieldDropDown.value == '...')
		return;

	var dupFieldFilter = false;
	for (var i = 0; i < filtersData.length; i++)
		if (filtersData[i].ColumnName == newFilterFieldDropDown.value) {
			dupFieldFilter = true;
			break;
		}

	if (!dupFieldFilter)
		for (var i = 0; i < fieldsList.length; i++) {
			if (fieldsList[i].DbName == newFilterFieldDropDown.value)
				fieldsList[i].FilterOperator == 'Equals';
		}

	var filterObj = new Object();
	filterObj.Removed = false;
	filterObj.Uid = '';
	filterObj.GUID = '';
	filterObj.Value = null;
	filterObj.Values = null;
	filterObj.ControlType = 1;
	filterObj.ColumnName = newFilterFieldDropDown.value;
	filterObj.AliasTable = jq$(newFilterFieldDropDown).find('option[value="' + newFilterFieldDropDown.value + '"]').data('alias');

	filtersData.push(filterObj);
	CommitFiltersData(false);
}

function GenerateNewFilterDropDown() {
	var result = '<select style="width:100%;" id="newFilterFieldDropDown" onchange="AddNewFilterField();">';
	var optionsAdded = false;
	result += '<option value="..." selected="selected">...</option>';

	var existingParamFilters = new Array();
	if (filtersData != null) {
		for (var i = 0; i < filtersData.length; i++) {
			var column = filtersData[i].ColumnName;
			var isParam = column.substr(column.lastIndexOf('[') + 1).indexOf('PARAM') == 0;
			if (isParam)
				existingParamFilters.push(column);
		}
	}

	for (var dsCnt = 0; dsCnt < dataSources.length; dsCnt++) {
		if (dataSources.length > 1)
			result += '<optgroup label="' + dataSources[dsCnt].FriendlyName + '">';

		for (var fCnt = 0; fCnt < dataSources[dsCnt].Columns.length; fCnt++) {
			if (!dataSources[dsCnt].Columns[fCnt].FilterHidden && existingParamFilters.indexOf(dataSources[dsCnt].Columns[fCnt].DbName) < 0) {
				result += '<option value="' + dataSources[dsCnt].Columns[fCnt].DbName + '" data-alias="' + dataSources[dsCnt].JoinAlias + '">' + (dataSources[dsCnt].Columns[fCnt].FilterFriendlyName ? dataSources[dsCnt].Columns[fCnt].FilterFriendlyName : dataSources[dsCnt].Columns[fCnt].FriendlyName) + '</option>';
				optionsAdded = true;
			}
		}

		if (dataSources.length > 1)
			result += '</optgroup>';
	}
	result += '</select>';
	if (!optionsAdded)
		return '';
	return result;
}

function CheckShowAddFilterControls() {
	if (nrvConfig == null || (nrvConfig.AllowNewFiltersInReportViewer && (nrvConfig.ReportIsLocked == null || nrvConfig.ReportIsLocked == false))) {
		var newFilterDataDropDown = GenerateNewFilterDropDown();
		if (newFilterDataDropDown == '')
			return;

		var addFilterButton$ = jq$(jq$('.fuidNewFilterTemplate').clone()[0]);
		addFilterButton$.prop('id', 'fuidNewFilter');
		if (makeFiltersFloat)
			addFilterButton$.css('float', 'left');
		else
			addFilterButton$.css('float', '');

		addFilterButton$.find('#newFilterColumnSel').html(newFilterDataDropDown);
		addFilterButton$.show();

		jq$('#addFilterControls').html(addFilterButton$);
		jq$('#addFilterControls').show();
	}
}

function RefreshFilters(returnObj) {
	jq$.datepicker.markerClassName = "hasDateTimePickerJq";
	var htmlFilters = jq$('#htmlFilters');
	htmlFilters.find('.filtersContent').html('');

	// Show Filters tab content instead of Loading
	if (htmlFilters.is(':hidden'))
		htmlFilters.show();
	jq$('#tab1 #loadingDiv').hide();

	filtersData = returnObj.Filters;
	calendars = new Array();

	var controlsIds = new Array();
	var index = 0;
	var hasFilterLogic = false;
	if (returnObj.FilterLogic != null && returnObj.FilterLogic.toString().indexOf('example') == -1)
		hasFilterLogic = true;
	while (index < returnObj.Filters.length) {
		var divsId = 'd' + s4() + s4();
		controlsIds[controlsIds.length] = new Object();
		controlsIds[controlsIds.length - 1].Id = divsId;
		controlsIds[controlsIds.length - 1].filterDesc = returnObj.Filters[index].Description;

		var filterContent = GetFilterContent(returnObj.Filters, index, divsId, hasFilterLogic, false);
		htmlFilters.find('.filtersContent').append(filterContent);
		index++;
	}
	var addFilterControl = jq$('.addFilterTemplate').clone();
	addFilterControl.prop('id', 'addFilterControls');
	htmlFilters.find('.filtersContent').append(addFilterControl);

	filtersDataObtained = true;

	PopulateSubreportsFilters(returnObj);

	var dateFormatString = 'mm/dd/yy';
	var showTimeInFilterPickers = false;
	if (typeof nrvConfig != 'undefined' && nrvConfig != null)
	{
		if (typeof nrvConfig.DateFormat != 'undefined' && nrvConfig.DateFormat != null && nrvConfig.DateFormat != '')
			dateFormatString = nrvConfig.DateFormat;
		if (typeof nrvConfig.ShowTimeInFilterPickers != 'undefined' && nrvConfig.ShowTimeInFilterPickers != null && nrvConfig.ShowTimeInFilterPickers != '')
			showTimeInFilterPickers = nrvConfig.ShowTimeInFilterPickers;
	}
	if (typeof nirConfig != 'undefined' && nirConfig != null) {
		if (typeof nirConfig.DateFormat != 'undefined' && nirConfig.DateFormat != null && nirConfig.DateFormat != '')
			dateFormatString = nirConfig.DateFormat;
		if (typeof nirConfig.ShowTimeInFilterPickers != 'undefined' && nirConfig.ShowTimeInFilterPickers != null && nirConfig.ShowTimeInFilterPickers != '')
			showTimeInFilterPickers = nirConfig.ShowTimeInFilterPickers;
	}
	izenda.reportViewerFilter.datepickerReadyToShow = true;
	for (var cc = 0; cc < calendars.length; cc++) {
		if (showTimeInFilterPickers) {
			jq$(document.getElementById(calendars[cc])).datetimepickerJq("destroy");
			jq$(document.getElementById(calendars[cc])).datetimepickerJq({
				buttonImage: urlSettings.urlRpPage + '?image=calendar_icon.png',
				showOn: "both",
				buttonImageOnly: true,
				altRedirectFocus: false,
				showSecond: true,
				timeInput: true,
				dateFormat: dateFormatString,
				onClose: function () {
					izenda.reportViewerFilter.datepickerReadyToShow = false;
					if (this.getAttribute('autoSetEndDay') == '1') {
						var enteredDate = jq$(this).datetimepickerJq("getDate");
						if (typeof enteredDate != 'undefined' && enteredDate != null && enteredDate.getHours() + enteredDate.getMinutes() + enteredDate.getSeconds() <= 0) {
							var fixedDate = new Date(enteredDate.getFullYear(), enteredDate.getMonth(), enteredDate.getDate(), 23, 59, 59, 0)
							jq$(this).datetimepickerJq("setDate", fixedDate)
						}
					}
					setTimeout(function () {
						CommitFiltersData(false);
					}, 401);
				},
				beforeShow: function (e, o) {
					function waitReadyToShow() {
						setTimeout(function () {
							if (izenda.reportViewerFilter.datepickerReadyToShow) {
								jq$("#" + o.id).datetimepickerJq('show');
							} else {
								waitReadyToShow();
							}
						}, 100);
					}
					if (!izenda.reportViewerFilter.datepickerReadyToShow) {
						waitReadyToShow();
						return false;
					}
				}
			});
		}
		else {
			jq$(document.getElementById(calendars[cc])).datepicker("destroy");
			jq$(document.getElementById(calendars[cc])).datepicker({
				dateFormat: dateFormatString,
				buttonImage: urlSettings.urlRpPage + '?image=calendar_icon.png',
				showOn: "both",
				buttonImageOnly: true,
				onClose: function () {
					izenda.reportViewerFilter.datepickerReadyToShow = false;
					setTimeout(function () {
						CommitFiltersData(false);
					}, 401);
				},
				beforeShow: function (e, o) {
					function waitReadyToShow() {
						setTimeout(function () {
							if (izenda.reportViewerFilter.datepickerReadyToShow) {
								jq$("#" + o.id).datepicker('show');
							} else {
								waitReadyToShow();
							}
						}, 100);
					}
					if (!izenda.reportViewerFilter.datepickerReadyToShow) {
						waitReadyToShow();
						return false;
					}
				}
			});
		}
	}

	htmlFilters.find(".comboboxTreeMultyselect").each(function () {
		var treeControl = jq$(this);
		var index = treeControl.attr("index");
		var possibleLabels = returnObj.Filters[index].ExistingLabels;
		var possibleValues = returnObj.Filters[index].ExistingValues;
		CC_InitializeComboTreeView(treeControl);
		CC_TreeUpdateValues(treeControl.parent(), possibleLabels, possibleValues);
	});

	if (typeof (switchTabAfterRefreshCycle) === 'boolean' && switchTabAfterRefreshCycle) {
		switchTabAfterRefreshCycle = false;
		if (!jq$(document.getElementById('tab1')).hasClass('active'))
			document.getElementById('tab1a').click();
	}
	makeFiltersFloat = true;

	InitAutoComplete();

	if (filtersDataObtained && fieldsDataObtained)
		CheckShowAddFilterControls();

	// update description
	for (var idx = 0; idx < controlsIds.length; idx++) {
		var labelDiv = document.getElementById(controlsIds[idx].Id);
		if (labelDiv !== null)
			labelDiv.innerHTML = controlsIds[idx].filterDesc;
	}
}

function GetFilterContent(filters, index, divsId, hasFilterLogic, isSimpleFilter) {
	var filter = filters[index];
	var filterContent = jq$('.filterViewerTemplate').clone();
	filterContent.removeClass('filterViewerTemplate');
	filterContent.show();
	filterContent.find('.filterInnerContent').prop('id', filter.Uid);

	var escapedDescription = jq$("<div>").text(filter.Description).html();

	var mouseOverScript = 'if(this.children[2]) { this.children[2].style.opacity=0.5; this.children[2].style.backgroundImage= \'url(\\\'\' + this.children[2].getAttribute("data-img") + \'\\\')\'; } if(this.children[3]) { this.children[2].style.opacity=0.5; this.children[3].style.backgroundImage=\'url(\\\'\' + this.children[3].getAttribute("data-img") + \'\\\')\'; } document.getElementById(\''
						+ divsId
						+ '\').innerHTML = \''
						+ escapedDescription
						+ ' - '
						+ filter.OperatorFriendlyName
						+ '\';'
						+ 'document.getElementById(\''
						+ divsId
						+ '\').setAttribute("title", "'
						+ filter.Description
						+ ' - '
						+ filter.OperatorFriendlyName
						+ '");';
	var mouseOutScript = 'for(var index = 2; index < this.children.length; index++){this.children[index].style.backgroundImage=\'none\';}document.getElementById(\''
						+ divsId
						+ '\').innerHTML = \''
						+ escapedDescription
						+ '\';';
	if (!isSimpleFilter) {
		filterContent.find('.filterHeader').attr('onmouseover', mouseOverScript);
		filterContent.find('.filterHeader').attr('onmouseout', mouseOutScript);
	}
	if (!isSimpleFilter && (typeof nrvConfig == 'undefined' || nrvConfig == null || typeof nrvConfig.ReportIsLocked == 'undefined' || nrvConfig.ReportIsLocked == null || nrvConfig.ReportIsLocked == false)) {
		filterContent.find('.filterRemoveButton').attr('onclick', 'RemoveFilterByUid(\'' + filter.Uid + '\')');
		filterContent.find('.filterPropertiesButton').attr('onclick', 'ShowFilterPropertiesByFieldName(\'' + filter.ColumnName + '\', \'' + filter.GUID + '\')');
	}
	else {
		filterContent.find('.filterRemoveButton').hide();
		filterContent.find('.filterPropertiesButton').hide();
	}
	if (isSimpleFilter)
		filterContent.find('.filterTitle, .filterTitleContainer').attr('onmouseover', '');
	filterContent.find('.filterTitle').prop('id', divsId);
	var escapedDescription = jq$("<div>").text(filter.Description).html();
	filterContent.find('.filterTitle').text(escapedDescription + ' - ' + filter.OperatorFriendlyName);
	var filterInnerContent = GenerateFilterControl(isSimpleFilter ? filter.GUID : index, filter.ControlType, filter.Value, filter.Values, filter.ExistingLabels, filter.ExistingValues, index == filters.length - 1 && !hasFilterLogic);
	filterContent.find('.filterInnerContent').append(filterInnerContent);
	if (filter.Required)
		filterContent.find('.filterRequiredFlag').show();

	if (filter.Parameter != false && filter.AgainstHiddenField)
		filterContent.hide();

	return filterContent;
}

function PopulateSubreportsFilters(returnObj) {
	var subreportFiltersControl = jq$('#htmlFilters .subreportsFiltersTable');
	if (returnObj.SubreportsFilters == null || returnObj.SubreportsFilters.length <= 0) {
		subreportsFiltersData = null;
		subreportFiltersControl.hide();
		return;
	}
	subreportFiltersControl.html('');
	subreportFiltersControl.show();
	var titlesPopulated = false;
	for (var i = 0; i < returnObj.SubreportsFilters.length; i++) {
		ProcessSubreportFilters(returnObj.SubreportsFilters[i], returnObj.SubreportsFilters.length > 1);
		if (!titlesPopulated) {
			var numOfSubreportFilters = returnObj.SubreportsFilters[i].FiltersData.Filters.length;
			if (numOfSubreportFilters >= 1) {
				if (returnObj.SubreportsFilters.length > 1)
					jq$('.subreportsFiltersContent .subreportsTitleText').text('Subreports');
				else
					jq$('.subreportsFiltersContent .subreportsTitleText').text(returnObj.SubreportsFilters[i].SubreportFullName);
				jq$('.subreportsFiltersContent').show();
				titlesPopulated = true;
			}
		}
	}
	subreportsFiltersData = returnObj.SubreportsFilters;
}

function ProcessSubreportFilters(subreportFilters, addTitle) {
	if (subreportFilters.FiltersData == null || subreportFilters.FiltersData.Filters == null || subreportFilters.FiltersData.Filters.length == 0)
		return;

	var filtersControl = jq$('#htmlFilters .subreportsFiltersTable');

	if (addTitle) {
		var subreportTitle = jq$('.subreportTitleTemplate').clone();
		subreportTitle.removeClass('subreportTitleTemplate');
		subreportTitle.find('span').html(subreportFilters.SubreportFullName);
		var subreportTitleRow = jq$('<tr>').append(jq$("<td>").html(subreportTitle));
		filtersControl.append(subreportTitleRow);
	}

	var subreportFiltersCell = jq$('<td>');

	var hasFilterLogic = false;
	if (subreportFilters.FiltersData.FilterLogic != null && subreportFilters.FiltersData.FilterLogic.toString().indexOf('example') == -1)
		hasFilterLogic = true;

	var controlsIds = new Array();
	for (var index = 0; index < subreportFilters.FiltersData.Filters.length; index++) {
		var divsId = 'd' + s4() + s4();
		controlsIds[controlsIds.length] = new Object();
		controlsIds[controlsIds.length - 1].Id = divsId;
		controlsIds[controlsIds.length - 1].filterDesc = subreportFilters.FiltersData.Filters[index].Description;

		var filterContent = GetFilterContent(subreportFilters.FiltersData.Filters, index, divsId, hasFilterLogic, true);

		subreportFiltersCell.append(filterContent);
	}
	filtersControl.append(jq$('<tr>').append(subreportFiltersCell));

	// Process all levels of subreports recursively
	if (subreportFilters.FiltersData.SubreportsFilters != null && subreportFilters.FiltersData.SubreportsFilters.length > 0)
		for (var i = 0; i < subreportFilters.FiltersData.SubreportsFilters.length; i++)
			ProcessSubreportFilters(subreportFilters.FiltersData.SubreportsFilters[i]);
}

function ToggleSubreportsFiltersControl() {
	jq$('.subreportsFiltersTable').toggle('slide', { direction: 'up' });
	jq$('.subreportsCollapse').toggle();
	jq$('.subreportsExpand').toggle();
}

function CascadingFiltersChanged(returnObj, id) {
	if (id != ('refreshcascadingfilters-' + refreshFiltersLastGUID) || returnObj == null)
		return;
	if (nrvConfig && nrvConfig.ReportIsLocked == true && nrvConfig.HideFiltersWhenLocked == true)
		return;
	RefreshFilters(returnObj);
}

function FiltersDataSet(returnObj, id) {
	if (id != 'setfiltersdata' || returnObj == null)
		return;
	if (returnObj.Value != 'OK')
		return;
	GetFiltersData();
	if (useGetRenderedReportSetForFilters)
		GetRenderedReportSet(true);
	if (typeof GetDatasourcesList != 'undefined')
		GetDatasourcesList();
}

function HideEqualsPopupDialog(result) {
	if (result == jsResources.OK) {
		var filterIndex = document.getElementById('popupDlgFilterIndex').value;
		var newVal = '...';
		var cnt6 = 0;
		var cb = document.getElementById('ndbfc' + filterIndex + '_cb' + cnt6);
		while (cb != null) {
			if (cb.checked) {
				if (newVal == '...')
					newVal = '';
				newVal += cb.value + ',';
			}
			cnt6++;
			cb = document.getElementById('ndbfc' + filterIndex + '_cb' + cnt6);
		}
		if (newVal && newVal != '...')
			newVal = newVal.substring(0, newVal.length - 1);
		var popupDlgValuesContainer = document.getElementById('ndbfc' + filterIndex);
		popupDlgValuesContainer.value = newVal;
		CommitFiltersData(false);
	}
}

function ShowEqualsPopupDialog(filterInd) {
	var filter = filtersData[filterInd];
	if (filter == null && subreportsFiltersData != null && subreportsFiltersData.length > 0)
		for (var i = 0; i < subreportsFiltersData.length; i++) {
			if (filter != null)
				break;
			if (subreportsFiltersData[i].FiltersData != null && subreportsFiltersData[i].FiltersData.Filters != null)
				for (var j = 0; j < subreportsFiltersData[i].FiltersData.Filters.length; j++)
					if (subreportsFiltersData[i].FiltersData.Filters[j].GUID == filterInd) {
						filter = subreportsFiltersData[i].FiltersData.Filters[j];
						break;
					}
		}

	var valInputId = 'ndbfc' + filterInd;
	var valueInput = document.getElementById(valInputId);
	var valuesSet6 = valueInput.value.split(',');

	if (filter.CustomDestination) {
		var colValInputId = 'ndbfc_col' + filterInd;
		var colValInput = jq$('#' + colValInputId);
		if (colValInput.length <= 0)
			jq$('#' + valInputId).after('<input id="' + colValInputId + '" value="' + filter.ColumnName + '" type="hidden"></input>');
		else
			colValInput.val(filter.ColumnName);
		var epdHtml = "<iframe src=\"" + filter.CustomDestination + "?valueeditid=" + valInputId + "&columneditid=" + colValInputId + "\" name=\"CustomAspx\" width=\"100%\" height=\"530\"></iframe>";
		ReportingServices.showModal(epdHtml, {
			tipStyle: "background-color: white; padding: 10px; border: 1px solid #d5d5d5;",
			containerStyle: "padding: 7px 7px 15px 7px; margin: 0; font-family: Verdana; font-size: 12px; white-space: nowrap;",
			footerStyle: "padding: 15px 7px 7px 7px; text-align: right; border-top: 1px solid #d5d5d5;",
			width: 800
		});
		return;
	}

	var table = jq$("<table>").css("width", "100%");
	var tr = jq$("<tr>");
	var ci = 0;
	for (var i = 0; i < filter.ExistingValues.length; i++, ci++) {
		if (filter.ExistingValues[i] == '...') {
			ci--;
			continue;
		}
		if (ci % 3 == 0) {
			table.append(tr);
			tr = jq$("<tr>");
		}

		var attrs = {
			id: "ndbfc" + filterInd + "_cb" + ci,
			type: "checkbox",
			value: filter.ExistingValues[i]
		};
		for (var cCnt = 0; cCnt < valuesSet6.length; cCnt++) {
			if (valuesSet6[cCnt] == filter.ExistingValues[i]) {
				attrs.checked = "checked";
				break;
			}
		}

		var td = jq$("<td>").css({ "width": "33%", "text-align": "left" });
		var div = jq$("<div>").addClass("izenda-checkbox");
		var label = jq$("<label>");
		label.append(jq$('<input>', attrs));
		label.append(filter.ExistingLabels[i]);
		tr.append(td.append(div.append(label)));
	}
	table.append(tr);

	var epdHtml = '{data}\n\
		<input type="hidden" id="popupDlgFilterIndex" value="{value}" />'.format({ data: table.get(0).outerHTML, value: filterInd });

	ReportingServices.showModal(epdHtml, {
		buttons: [{ value: jsResources.OK, classes: "izenda-dialog-btn-primary", style: "margin-right: 10px;" }, { value: jsResources.Cancel, classes: "izenda-dialog-btn-default" }],
		buttonTemplate: '<button type="button" class="izenda-btn izenda-width-100">{value}</button>',
		callback: HideEqualsPopupDialog,
		tipStyle: "background-color: white; padding: 10px; border: 1px solid #d5d5d5;",
		containerStyle: "padding: 7px 7px 15px 7px; margin: 0; font-family: Verdana; font-size: 12px; white-space: nowrap;",
		footerStyle: "padding: 15px 7px 7px 7px; text-align: right; border-top: 1px solid #d5d5d5;",
		width: 800
	});
}

// Old Filters compatibility function for custom Popups. Do not delete.
function CC_CustomFilterPageValueReceived() {
}

function GenerateFilterControl(index, cType, value, values, existingLabels, existingValues, isLastFilter) {
	var notRefreshFilters = isLastFilter || nrvConfig && nrvConfig.CascadeFilterValues == false;
	var onChangeCmd = notRefreshFilters ? '' : 'onchange="CommitFiltersData(false);"';
	var result = '';
	switch (cType) {
		case 1:
			if (value == '...') value = '';
			result = '<input style="width:99%;" type="text" id="ndbfc' + index + '" value="' + value.replaceAll('"', "&quot;") + '" ' + onChangeCmd + ' />';
			break;
		case 2:
			if (values[0] == '...') values[0] = '';
			if (values[1] == '...') values[1] = '';
			result = '<input style="width:99%;" type="text" id="ndbfc' + index + '_l" value="' + values[0].replaceAll('"', "&quot;") + '" ' + onChangeCmd + ' />';
			result += '<input style="width:99%;" type="text" id="ndbfc' + index + '_r" value="' + values[1].replaceAll('"', "&quot;") + '" ' + onChangeCmd + ' />';
			break;
		case 3:
			result += '<select style="width:100%;" id="ndbfc' + index + '" ' + onChangeCmd + '>';
			var groupOpened = false;
			for (var cnt3 = 0; cnt3 < existingValues.length; cnt3++) {
				var selected3 = '';
				if (existingValues[cnt3] != null && existingValues[cnt3].LinelessEquals(value))
					selected3 = 'selected="selected"';
				if (existingValues[cnt3] == null) {
					if (groupOpened)
						result += '</optgroup>';
					result += '<optgroup label="' + existingLabels[cnt3] + '">';
					groupOpened = true;
				} else
					result += '<option value="' + existingValues[cnt3].replace(/"/g, '&quot;') + '" ' + selected3 + '>' + existingLabels[cnt3] + '</option>';
			}
			if (groupOpened)
				result += '</optgroup>';
			result += '</select>';
			break;
		case 4:
			result += '<select style="width:100%" id="ndbfc' + index + '" ' + onChangeCmd + '>';
			for (var cnt4 = 0; cnt4 < existingValues.length; cnt4++) {
				var selected4 = '';
				if (existingValues[cnt4] == value)
					selected4 = 'selected="selected"';
				result += '<option value="' + existingValues[cnt4].replace(/"/g, '&quot;') + '" ' + selected4 + '>' + existingLabels[cnt4] + '</option>';
			}
			result += '</select>';
			break;
		case 5:
			if (values[0] == '...') values[0] = '';
			if (values[1] == '...') values[1] = '';
			onChangeCmd = notRefreshFilters ? '' : 'onchange="setTimeout(function(){CommitFiltersData(false);},401);"';
			onChangeCmd = 'onchange="javascript:checkDatesInterval(this); checkDateFormat(this);"';
			result += '<input type="text" ' + onChangeCmd + ' value="' + values[0].replaceAll('"', "&quot;") + '" style="width:248px" id="ndbfc' + index + '_1" />';
			calendars[calendars.length] = 'ndbfc' + index + '_1';
			result += '<br />';
			result += '<input autoSetEndDay="1" type="text" ' + onChangeCmd + ' value="' + values[1].replaceAll('"', "&quot;") + '" style="width:248px" id="ndbfc' + index + '_2" />';
			calendars[calendars.length] = 'ndbfc' + index + '_2';
			break;
		case 6:
			result += '<input type="button" style="height:30px;width:300px;background-color:LightGray;border:1px solid DarkGray" onclick="ShowEqualsPopupDialog(\'' + index + '\');" value="...">';
			var input = jq$('<input>', {
				id: 'ndbfc' + index,
				type: 'hidden',
				value: value
			});
			result += input.get(0).outerHTML;
			break;
		case 7:
			if (value == '...') value = '';
			result += '<textarea style="width:99%;" rows="2" id="ndbfc' + index + '" ' + onChangeCmd + '>' + value + '</textarea>';
			break;
		case 8:
			result += '<div id="ndbfc' + index + '" class="saveScroll" style="padding-left:8px; overflow-y:auto; overflow-x:hidden; max-height: 100px;background-color: white;border: 1px solid #A5A5A5; -webkit-box-sizing: content-box; -moz-box-sizing: content-box; box-sizing: content-box;">';
			var valuesSet8 = value.split(',');
			for (var cnt8 = 0; cnt8 < existingValues.length; cnt8++) {
				var checked8 = '';
				for (var subCnt8 = 0; subCnt8 < valuesSet8.length; subCnt8++) {
					if (existingValues[cnt8] == valuesSet8[subCnt8]) {
						checked8 = ' checked="checked"';
						break;
					}
				}
				result += '<nobr><input type="checkbox" id="ndbfc' + index + '_cb' + cnt8 + '" ' + onChangeCmd + ' value="' + existingValues[cnt8].replace(/"/g, '&quot;') + '"' + checked8 + ' />' + existingLabels[cnt8] + '</nobr><br>';
			}
			result += '</div>';
			break;
		case 9:
			if (value == '...') value = '';
			onChangeCmd = notRefreshFilters ? '' : 'onchange="setTimeout(function(){CommitFiltersData(false);},401);"';
			onChangeCmd = 'onchange="checkDateFormat(this);"';
			result += '<input type="text" ' + onChangeCmd + ' value="' + value.replaceAll('"', "&quot;") + '" style="width:248px" id="ndbfc' + index + '" />';
			calendars[calendars.length] = 'ndbfc' + index;
			break;
		case 10:
			result += '<select class="saveScroll" style="width:100%" size="5" multiple="" id="ndbfc' + index + '" ' + onChangeCmd + '>';
			var valuesSet10 = value.split(',');
			for (var cnt10 = 0; cnt10 < existingValues.length; cnt10++) {
				var selected10 = '';
				for (var subCnt = 0; subCnt < valuesSet10.length; subCnt++) {
					if (existingValues[cnt10] == valuesSet10[subCnt]) {
						selected10 = 'selected="selected"';
						break;
					}
				}
				result += '<option value="' + existingValues[cnt10].replace(/"/g, '&quot;') + '" ' + selected10 + '>' + existingLabels[cnt10] + '</option>';
			}
			result += '</select>';
			break;
		case 11:
			if (value == '...') value = '';
			result += '<div style="display: none;" visibilitymode="1"><input type="text" id="ndbfc' + index + '" value="' + value.replaceAll('"', "&quot;") + '"/></div>';
			result += '<div class="comboboxTreeMultyselect" index=' + index + '></div>';
			break;
		case 100:
			if (value == '...') value = '';
			result = '<input style="width:99%;" type="text" name="autocomplete-filter" id="ndbfc' + index + '" value="' + value.replaceAll('"', "&quot;") + '" ' + (notRefreshFilters ? '' : 'refresh="true"') + ' />';
			break;
		default:
			result = '';
	}
	return result;
}

/**
* Load filters
*/
function GetFiltersData(filterUrlParameters) {
	if (nrvConfig && nrvConfig.ReportIsLocked == true && nrvConfig.HideFiltersWhenLocked == true) {
		jq$('#tab1 #loadingDiv').hide();
		return;
	}
	var requestString = 'wscmd=getfiltersdata';
	if (typeof (filterUrlParameters) === 'string')
		requestString += filterUrlParameters;
	AjaxRequest(urlSettings.urlRsPage, requestString, GotFiltersData, null, 'getfiltersdata');
}

function GotFiltersData(returnObj, id) {
	if (id != 'getfiltersdata' || returnObj == null)
		return;
	RefreshFilters(returnObj);
	jq$('#htmlFilters :input').prop('disabled', false);
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
		if(ivi > -1)
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
		var responseServerUrl = urlSettings.urlRpPage + '?';
		// From ReportViewer.js
		if (typeof nrvConfig != 'undefined')
			responseServerUrl = nrvConfig.ResourcesProviderUrl + nrvConfig.serverDelimiter;
		cValid.html('<nobr>' + displayText + '<img src="' + responseServerUrl + 'image=icon-blue-x.gif" class="chunkX"></nobr>');
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

CC_TreeUpdateValues = function (row, labels, values) {

	var selectedValues = jq$(row).find("div[visibilitymode=1] input").attr("value");

	var tree = jq$(row).find(".comboboxTreeMultyselect .tree");
	var selectedValuesControl = jq$(row).find(".comboboxTreeMultyselect .selectedValues");
	tree.empty();
	for (var i = 0; i < values.length; i++) {
		CC_appendItem(tree, labels[i], values[i], "", "", tree, selectedValuesControl, row);
	}

	var valueList = selectedValues.split(", ");
	for (var i = 0; i < valueList.length; i++)
		tree.find('.node[value]').each(function () {
			var node = jq$(this);
			if (node.attr("value") == valueList[i])
				CC_CheckUnchekChild(jq$(this), true);
		});
	CC_CheckStatusWasChanged(selectedValuesControl, tree.find("> .node"), tree, row);
};

function InitAutoComplete() {
	var autocompleteElements = jq$('input[name="autocomplete-filter"]');
	if (autocompleteElements.length === 0)
		return;
	for (var i = 0; i < autocompleteElements.length; i++) {
		var currInput = autocompleteElements[i];
		jq$(currInput).tagit({
			tagSource: function (req, responeFunction) {
				var possibleText = CC_extractLast(req.term);
				var filterIndex = jq$(this.element).attr('id').toString().replace('ndbfc', '');
				var fullColumnName = filtersData[filterIndex].ColumnName;
				var cmd = '&possibleValue=' + possibleText.replace('&', '%26') + "&resultType=json";;

				// Make sure not to cache request if cascade filters were changed
				var prevFiltersSignature = '';
				if (window.utility.checksum != undefined) {
					for (var f = 0; f < filtersData.length; f++) {
						if (f == filterIndex)
							continue;
						prevFiltersSignature += JSON.stringify(filtersData[f]);
					}
					prevFiltersSignature = window.utility.checksum(prevFiltersSignature).toString();
				}
				else if (typeof (GenerateGuid) != 'undefined')
					prevFiltersSignature = GenerateGuid();

				EBC_LoadData('ExistentValuesList', 'columnName=' + fullColumnName + cmd + '&h=' + prevFiltersSignature, null, true, function (responseResult) {
					var result = new Array();
					jq$.each(responseResult[0].options, function (i, item) {
						if (item.value == null || item.value == "" || item.value == '...')
							return;
						result.push(item.value.replaceAll('#||#', ','));
					});
					responeFunction(result);
				});
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

function CC_split(val) {
	return val.split(/,\s*/);
}

function CC_extractLast(term) {
	return CC_split(term).pop();
}