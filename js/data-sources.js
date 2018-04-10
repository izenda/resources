// Copyright (c) 2005-2013 Izenda, L.L.C. - ALL RIGHTS RESERVED    

var currentPreview = null;
var tInd = 0;
var fieldsIndex;
var csOrder = 0;
var dsSelections = new Array();
var fieldsOpts = new Object();
var curPropField = '';
var curFieldIndexes = '';
var previewFieldTimeout;
var previewReportTimeout;
var dsState = new Array();
var databaseSchema;
var origRsData = '';
var nirConfig;
var oDatatable;
var subtotalsAdded = false;
var chartAvailable = false;
var chartAdded = false;
var IR_CurrentChartProps = '';

function IsIE() {
	if (navigator.appName == 'Microsoft Internet Explorer')
		return true;
	return false;
}

function CurrentRn() {
	var queryParameters = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
	while (m = re.exec(queryString)) {
		queryParameters[decodeURIComponent(m[1]).toLowerCase()] = decodeURIComponent(m[2]);
	}
	reportName = '';
	if (queryParameters['rn'] != null && queryParameters['rn'].length > 0) {
		reportName = queryParameters['rn'];
	}
	return reportName;
}

function initDataSources(url) {
	AjaxRequest(url, null, function (returnObj, id) {
		if (id != 'getjsonschema' || typeof returnObj === 'undefined' || returnObj == null)
			return;
		databaseSchema = returnObj;
		if (databaseSchema != null) {
			var datasourcesSearch = new IzendaDatasourcesSearch(databaseSchema);
			jq$(".database").remove();
			tInd = 0;
			var html = "";
			for (var i = 0; i < databaseSchema.length; i++)
				html += renderDatabase(databaseSchema[i], i);
			jq$(html).prependTo("#databases");
			NDS_Init();

			setTimeout(function () {
				var length = databaseSchema.length;
				for (var i = 0; i < length; i++) {
					var dbh = document.getElementById('rdbh' + i);
					if (typeof dbh != 'undefined' && dbh != null) {
						dbh = jq$(dbh);
						initializeTables(dbh);
						if (length == 1) {
							dbh.toggleClass("opened", animationTime);
							setTimeout(DsDomChanged, animationTime + 100);
						}
					}
				}
			}, 100);
		};
	}, null, 'getjsonschema', null, false);
}

function renderDatabase(database, key) {
	database.domIdHeader = 'rdbh' + key;
	var element = " \
	<div class='database' id='rdbh" + key + "'> \
		<div class='database-header'> \
			<a href='#" + database.DataSourceCategory + "'> \
				<span class='plus-minus'></span> \
				<span class='database-name'>" + database.DataSourceCategory + "</span> \
			</a> \
		</div> \
 \
		<div class='database-tables' id='rdb" + key + "'>" + IzLocal.Res("js_Loading", "Loading...") + "</div> \
	</div> \ ";
	return element;
}

function clearView(table) {
	table.each(function () {
		var arrayClasses = jq$(this).attr("class").split(" ");
		for (var i = 0; i < arrayClasses.length; i++) {
			if (arrayClasses[i].indexOf('-view') != -1) jq$(this).removeClass(arrayClasses[i]);
		}
	});
}

function selectTrigger(trigger) {
	trigger.parent().children().removeClass("selected");
	trigger.addClass("selected");
}

function setView(table, view) {
	clearView(table);
	table.addClass(view);
	table.attr('data-view', view);
	var trigger = table.find("span[data-view=" + view + "]");
	selectTrigger(trigger);
}

function initializeTables(database$) {
	if (database$.length > 0) {
		var hId = database$[0].id;
		hId = hId.substr(4);
		var contentDiv = document.getElementById('rdb' + hId);
		var currHtml = contentDiv.innerHTML;
		if (currHtml != IzLocal.Res("js_Loading", "Loading..."))
			return;
		var html = renderTables(databaseSchema[hId].tables, hId);
		contentDiv.innerHTML = html;

		//begin some app
		initDraggable();
		jq$(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
			event.preventDefault();
		});
		var triggersHtml = "<span class='f-trigger' data-view='fields-view'> \
								<img src='###RS###image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
							</span> \
							<span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
							<span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
							<span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";

		jq$(".table-view-triggers").filter(function (index) {
			var shouldBeReturned = false;
			var npAttr;
			try {
				npAttr = this.getAttribute('notProcessed1');
			}
			catch (e) {
				npAttr = '0';
			}
			if (npAttr == '1') {
				shouldBeReturned = true;
				this.setAttribute('notProcessed1', '0');
			}
			return shouldBeReturned;
		}).append(triggersHtml);

		jq$(".table").each(function () {
			setView(jq$(this), "fields-view");
		});

		jq$(".field-popup-trigger").mouseup(function (event) {
			event.cancelBubble = true;
			(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
			(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
			var parent = this.parentElement;
			var fieldSqlName = parent.getAttribute('fieldid');
			if (fieldSqlName != null && fieldSqlName != '') {
				ShowFieldProperties(fieldSqlName, parent.children[2].innerHTML, parent.getAttribute('id'));
			}
			return false;
		});
	}
}

function renderTables(tables, dbKey) {
	var html = "",
		length = tables.length;
	for (var i = 0; i < length; ++i) {
		var table = tables[i];
		html += renderTable(dbKey, table, table.name, table.sysname, tInd);
		tInd++;
	}
	return html;
}

function renderTable(dbKey, table, name, tableId, ind) {
	var tid = createTableIndetifier(ind);
	table.domId = tid;
	var tableIdPart = tableId.replace(/[\]\[\.]/g, "");
	var element = " \
			<div class='table'> \
				<div class='table-header'> \
					<a href='#" + name + "' tableInd='" + ind + "' id='rdbh" + dbKey + "_" + tableIdPart + "'> \
						<span class='checkbox-container' locked='false' sorder='-1' id='" + tid + "' tableid='" + tableId + "' onclick='DsClicked(" + ind + ")'><span class='checkbox'></span></span> \
						<span class='table-name'>" + name + "</span> \
						<div class='clearfix'></div> \
					</a> \
				</div> \
				<div class='table-fields' id='rdb" + dbKey + "_" + tableIdPart + "'>" + IzLocal.Res("js_Loading", "Loading...") + "</div> \
			</div> \ ";
	return element;
}

function renderSections(tableIndex, fields) {
	var html = "";

	var textSectionContent = renderFields(tableIndex, fields, "text");
	if (textSectionContent.length > 1) {
		html += " \
					<div class='fields-section' sectionDataType='text'> \
						<div class='fields-section-name'> \
							<span>" + IzLocal.Res("js_text", "text") + "</span> \
						</div> \ " + textSectionContent + " \
					</div> \ ";
	}

	var datesSectionContent = renderFields(tableIndex, fields, "dates");
	if (datesSectionContent.length > 1) {
		html += " \
					<div class='fields-section' sectionDataType='dates'> \
						<div class='fields-section-name'> \
							<span>" + IzLocal.Res("js_dates", "dates") + "</span> \
						</div> \ " + datesSectionContent + " \
					</div> \ ";
	}

	var numbersSectionContent = renderFields(tableIndex, fields, "numeric") + renderFields(tableIndex, fields, "money");
	if (numbersSectionContent.length > 1) {
		html += " \
					<div class='fields-section' sectionDataType='numbers'> \
						<div class='fields-section-name'> \
							<span>" + IzLocal.Res("js_numbers", "numbers") + "</span> \
						</div> \ " + numbersSectionContent + " \
					</div> \ ";
	}

	var identifiersSectionContent = renderFields(tableIndex, fields, "identifiers");
	if (identifiersSectionContent.length > 1) {
		html += " \
					<div class='fields-section'> \
						<div class='fields-section-name' sectionDataType='identifiers'> \
							<span>" + IzLocal.Res("js_identifiers", "identifiers") + "</span> \
						</div> \ " + identifiersSectionContent + " \
					</div> \ ";
	}

	return html;
}

function renderFields(tableIndex, fields, sectionName) {
	var html = "";
	for (var i = 0; i < fields.length; ++i)
		if (fields[i] != null && fields[i].type == sectionName)
			html += renderField(tableIndex, fields[i]);
	return html;
}

function renderField(tableIndex, fieldObj) {
	var fid = createFieldIdentifier(tableIndex, fieldsIndex);
	fieldObj.domId = fid;
	var html = " \
					<a class='field' href='#" + fieldObj.name + "' sorder='-1' locked='false' id='" + fid + "' fieldId='" + fieldObj.sysname + "' typeGroup='" + fieldObj.typeGroup + "' tableIndex='" + tableIndex + "' fieldIndex='" + fieldsIndex + "' onmouseup='FiClick(" + tableIndex + ", " + fieldsIndex + ", false, false)'> \
						<span class='preview-image'></span> \
						<span class='checkbox' style='margin-top: 3px; margin-right: 6px;'></span> \
						<span class='field-name' style=''>" + fieldObj.name + "</span> \
						<span class='field-popup-trigger' style='float:right; margin-top: 2px; left:2px;' title='" + IzLocal.Res("js_Options", "Options") + "' fieldId='" + fieldObj.sysname + "' style='float:right;'></span> \
						<span style='visibility:hidden;  margin-top: 2px; left:2px; width:20px; float:right;height:0px;'>&nbsp;&nbsp;&nbsp;&nbsp;</span> \
						<span class='clearfix'></span> \
					</a> \ ";
	fieldsIndex++;
	return html;
}


function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStyle(x, styleProp) {
	var y = null;
	if (x.currentStyle)
		y = x.currentStyle[styleProp];
	else if (window.getComputedStyle)
		y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
	return y;
}

function CollectReportData() {
	var dsList = new Array();
	var fieldsList = new Array();
	var fieldsOrders = new Array();
	var fieldWidths = new Array();
	var fOptions = new Array();
	var idList = new Array();
	var sortsList = new Array();
	var index = 0;
	var cb;
	var soVal;
	var sortingData = new Array();
	if (currentPreview != null)
		sortingData = currentPreview.GetSortingData();
	while (true) {
		cb = getTableElement(index);
		if (cb == null)
			break;
		soVal = cb.getAttribute('sorder');
		if (soVal == '-1') {
			index++;
			continue;
		}
		dsList[dsList.length] = cb.getAttribute('tableid');
		var fIndex = 0;
		while (true) {
			cb = getFieldElement(index, fIndex);
			if (cb == null)
				break;
			soVal = cb.getAttribute('sorder');
			if (soVal == '-1') {
				fIndex++;
				continue;
			}
			var widthVal = cb.getAttribute('itemwidth');
			if (!widthVal)
				widthVal = 0;
			idList[fieldsList.length] = createFieldIdentifier(index, fIndex);
			fieldsList[fieldsList.length] = cb.getAttribute('fieldid');
			fieldsOrders[fieldsOrders.length] = soVal;
			fieldWidths[fieldWidths.length] = widthVal;
			fOptions[fOptions.length] = fieldsOpts[cb.getAttribute('fieldid')];
			var fSort = '0';
			if (typeof sortingData[idList[fieldsList.length - 1]] != 'undefined' && sortingData[idList[fieldsList.length - 1]] != null)
				fSort = sortingData[idList[fieldsList.length - 1]];
			sortsList[sortsList.length] = fSort;
			cb.setAttribute('sorting', fSort);
			fIndex++;
		}
		index++;
	}

	for (var i = 0; i < sortsList.length; i++)
		if (sortsList[i] == 1 && fOptions[i])
			fOptions[i].OrderType = "ASC";

	var repObj = new Object();
	repObj.DsList = dsList;
	repObj.FldList = fieldsList;
	repObj.OrdList = fieldsOrders;
	repObj.WidthList = fieldWidths;
	repObj.FldOpts = fOptions;
	repObj.SortsList = sortsList;
	repObj.SubtotalsAdded = subtotalsAdded;
	repObj.ChartAdded = chartAdded;
	repObj.ChartProps = IR_CurrentChartProps;
	repObj.Filters = typeof filtersData != 'undefined' ? GetFiltersDataToCommit() : null;
	var uriResult = encodeURIComponent(JSON.stringify(repObj));
	return uriResult;
}

function DesignReportRequest(s) {
	var requestString = 'wscmd=designreport';
	requestString += '&wsarg0=' + s;
	AjaxRequest('./rs.aspx', requestString, ReportDesigned, null, 'designreport');
}

function ReportDesigned(returnObj, id) {
	if (id != 'designreport' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value == "OK")
		window.location = nirConfig.ReportDesignerUrl + "?tab=fields";
	else
		alert("Error: " + returnObj.Value);
}

function ViewReportRequest(s) {
	var requestString = 'wscmd=viewreport';
	requestString += '&wsarg0=' + s;
	AjaxRequest('./rs.aspx', requestString, ReportViewed, null, 'viewreport');
}

function ReportViewed(returnObj, id) {
	if (id != 'viewreport' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value == "OK")
		window.location = nirConfig.ReportViewerUrl;
	else
		alert("Error: " + returnObj.Value);
}

function DS_ShowFilterProperties(fieldSqlName, friendlyName, fiIds, filterGUID) {
	curPropField = fieldSqlName;
	var filter = DS_GetFullField(fieldSqlName, friendlyName);
	if (filterGUID != null)
		filter.FilterGUID = filterGUID;
	var requestString = 'wscmd=fieldoperatorsandformatswithdefault';
	requestString += '&wsarg0=' + curPropField;
	AjaxRequest('./rs.aspx', requestString, FilterPropFormatsGot, null, 'fieldoperatorsandformatswithdefault', filter);
}

function DS_ShowFieldProperties(fieldSqlName, friendlyName, fiIds, filterGUID) {
	curFieldIndexes = fiIds;
	var autoTotal = false;
	var aRef = document.getElementById(fiIds);
	var selected = -1;
	var typeGrp = "None";
	if (typeof aRef != 'undefined' && aRef != null) {
		typeGrp = aRef.getAttribute('typegroup');
		if (typeof typeGrp == 'undefined' || typeGrp == null)
			typeGrp = "None";
		selected = aRef.getAttribute('sorder');
		if (typeof selected == 'undefined' || selected == null)
			selected = -1;
		do {
			aRef = aRef.parentNode;
		} while (typeof aRef != 'undefined' && aRef != null && aRef.className != 'fields-section');
		if (typeof aRef != 'undefined' && aRef != null) {
			var sDataType = aRef.getAttribute('sectionDataType');
			if (sDataType == 'numbers' || sDataType == 'identifiers')
				autoTotal = true;
		}
	}
	curPropField = fieldSqlName;
	var field = DS_GetFullField(fieldSqlName, friendlyName);
	field.Selected = selected;
	var tgNum = -1;
	for (var ind = 0; ind < nirConfig.TypeGroups.length; ind++)
	{
		if (nirConfig.TypeGroups[ind] == typeGrp)
		{
			tgNum = ind;
			break;
		}
	}
	field.STFunctionValues = new Array();
	field.STFunctionNames = new Array();
	if (tgNum >= 0)
	{
		for (var index = 0; index < nirConfig.DefaultSTFNames[tgNum].length; index++)
		{
			field.STFunctionValues[field.STFunctionValues.length] = nirConfig.DefaultSTFValues[tgNum][index];
			field.STFunctionNames[field.STFunctionNames.length] = nirConfig.DefaultSTFNames[tgNum][index];
		}
	}
	if (typeof field.STFunction == 'undefined' || field.STFunction == null || field.STFunction == '' || field.STFunction == '...')
		field.STFunction = 'DEFAULT';
	if (field.Total == null)
		field.Total = 1;
	var requestString = 'wscmd=fieldoperatorsandformatswithdefault';
	requestString += '&wsarg0=' + curPropField;
	AjaxRequest('./rs.aspx', requestString, FieldPropFormatsGot, null, 'fieldoperatorsandformatswithdefault', field);
}

function DS_GetFullField(fieldSqlName, friendlyName) {
	var field = new Object();

	field.AdditionalFields = [];
	field.AggregateFunction = "None";
	field.Alias = "";
	field.AliasTable = "";
	field.Bold = false;
	field.CalcDescription = "";
	field.CellHighlight = "";
	field.ColumnGroup = "";
	field.ColumnName = fieldSqlName;
	field.ColumnSql = "";
	field.Definition = "";
	field.Description = EBC_Humanize("", friendlyName, "");
	field.DrillDownStyle = "";
	field.Expression = "";
	field.ExpressionType = "...";
	field.FormatString = "";
	field.GUID = "";
	field.GaugeColor = "";
	field.GaugeMax = "";
	field.GaugeMin = "";
	field.GaugeStyle = "";
	field.GaugeTargetEffect = "";
	field.GaugeTargetReport = "";
	field.GaugeValuesInCurrencyFormat = false;
	field.Gradient = false;
	field.GroupBy = false;
	field.GroupByExpression = false;
	field.Italic = false;
	field.LabelJustification = "Center";
	field.VG = false;
	field.MultilineHeader = false;
	field.Operator = "";
	field.OrderType = "";
	field.PageBreak = false;
	field.Separator = false;
	field.ShouldBeFormatted = true;
	field.SubtotalExpression = "";
	field.SubtotalFunction = "";
	field.SubtotalTitle = "";
	field.TargetReport = "";
	field.TextHighlight = "";
	field.Url = "";
	field.ValueJustification = "";
	field.ValueRanges = "";
	field.ValueString = "";
	field.Visible = true;
	field.Width = "";
	field.WidthSettedManually = false;

	field.DbName = fieldSqlName;
	field.FriendlyName = friendlyName;
	field.Total = 0;

	var opts = fieldsOpts[fieldSqlName];
	if (opts != null) {
		for (var property in opts) {
			if (opts.hasOwnProperty(property)) {
				field[property] = opts[property];
			}
		}
	}
	return field;
}

function FilterPropFormatsGot(returnObj, id, field) {
	if (id != 'fieldoperatorsandformatswithdefault' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value != "Field not set" && returnObj.AdditionalData != null && returnObj.AdditionalData.length > 1) {
		var operatorsData = returnObj.AdditionalData.slice(0, returnObj.Value);
		field.FilterOperatorNames = new Array();
		field.FilterOperatorValues = new Array();
		fCnt = 0;
		avCnt = 0;
		while (avCnt < operatorsData.length) {
			field.FilterOperatorNames[fCnt] = operatorsData[avCnt];
			avCnt++;
			field.FilterOperatorValues[fCnt] = operatorsData[avCnt];
			avCnt++;
			fCnt++;
		}
		field.FilterOperator = '...';
		if (fieldsOpts[curPropField] != null)
			field.FilterOperator = fieldsOpts[curPropField].FilterOperator;
		if (field.FilterGUID == null) {
			for (var find = 0; find < filtersData.length; find++)
				if (filtersData[find].ColumnName == field.ColumnName) {
					field.FilterGUID = filtersData[find].GUID;
					break;
				}
		}
		if (field.FilterGUID != null) {
			for (var find = 0; find < filtersData.length; find++)
				if (filtersData[find].GUID == field.FilterGUID) {
					field.FilterOperator = filtersData[find].OperatorValue;
					break;
				}
		}
		FP_ShowFilterProperties(field, fieldPopup);
	}
}

function FieldPropFormatsGot(returnObj, id, field) {
	if (id != 'fieldoperatorsandformatswithdefault' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value != "Field not set" && returnObj.AdditionalData != null && returnObj.AdditionalData.length > 1) {
		var formatsData = returnObj.AdditionalData.slice(returnObj.Value);
		field.FormatString = '...';
		if (fieldsOpts[curPropField] != null)
			field.FormatString = fieldsOpts[curPropField].FormatString;
		else
			field.FormatString = formatsData[formatsData.length - 1];
		field.FormatNames = new Array();
		field.FormatValues = new Array();
		var fCnt = 0;
		var avCnt = 0;
		while (avCnt < formatsData.length - 1) {
			field.FormatNames[fCnt] = formatsData[avCnt];
			avCnt++;
			field.FormatValues[fCnt] = formatsData[avCnt];
			avCnt++;
			fCnt++;
		}
		FP_ShowFieldProperties(field, fieldPopup);
		PreviewFieldDelayed(500);
	}
}

/**
 * Parse field identifier in format "tcb{0}fcb{1}", where {0} - table index, {1} - field index;
 * @param {string} fieldId 
 * @returns {object}
 */
function parseFieldIdentifier(fieldId) {
	var s = fieldId.split('fcb');
	if (s.length === 2 && s[0].length >= 4) {
		var tcbInd = s[0].substr(3);
		var fcbInd = s[1];
		return {
			tableIndex: tcbInd,
			fieldIndex: fcbInd
		};
	}
	throw 'Unknown field id format: ' + fieldId;
}

/**
 * Create table id
 */
function createTableIndetifier(tableIndex) {
	return 'tcb' + tableIndex;
}

/**
 * Get table dom element
 */
function getTableElement(tableIndex) {
	return document.getElementById(createTableIndetifier(tableIndex));
};

/**
 * Create field id
 */
function createFieldIdentifier(tableIndex, fieldIndex) {
	return createTableIndetifier(tableIndex) + 'fcb' + fieldIndex;
}

/**
 * Get field dom element
 */
function getFieldElement(tableIndex, fieldIndex) {
	return document.getElementById(createFieldIdentifier(tableIndex, fieldIndex));
}

function StoreFieldProps(newField) {
	fieldsOpts[curPropField] = newField;
	if (curFieldIndexes) {
		var idObject = parseFieldIdentifier(curFieldIndexes);
		FiClick(idObject.tableIndex, idObject.fieldIndex, true, true);
	}
}

function PreviewFieldManual() {
	jq$(document.getElementById('fieldSamplePreview')).html('<table width="100%"><tr width="100%"><td width="100%" align="center"><img src="###RS###image=loading.gif"/></tr></td></table>');
	PreviewFieldToDiv();
}

function PreviewFieldDelayed(timeOut) {
	try {
		clearTimeout(previewFieldTimeout);
	}
	catch (e) {
	}
	jq$(document.getElementById('fieldSamplePreview')).html('<table width="100%"><tr width="100%"><td width="100%" align="center"><img src="###RS###image=loading.gif"/></tr></td></table>');
	previewFieldTimeout = setTimeout(PreviewFieldToDiv, timeOut);
}

function PreviewFieldToDiv() {
	PreviewField(curPropField, document.getElementById('fieldSamplePreview'));
}

function PreviewField(field, container) {
	var requestString = 'wscmd=getfieldpreview';
	var fProps = FP_CollectFieldProperties();
	var properties = JSON.stringify(fProps)
	var fieldOpts = ',\'Total\':\'' + fProps.Total + '\',' + properties.substr(1, properties.length - 2);
	requestString += "&wsarg0=" + encodeURIComponent("{'Na':'" + field + "','Cnt':'10'" + fieldOpts + "}");

	var thisRequestObject;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
	thisRequestObject.requestId = 'getfieldpreview';
	thisRequestObject.dtk = container;
	thisRequestObject.onreadystatechange = FieldPreviewed;

	thisRequestObject.open('GET', './rs.aspx?' + requestString, true);
	thisRequestObject.send();

	function FieldPreviewed(returnObj, id) {
		if (thisRequestObject.readyState == 4 && thisRequestObject.status == 200)
			jq$(container).html(thisRequestObject.responseText);
	}
}

function ShowReportPreviewContent(showContent) {
	if (showContent) {
		jq$('#previewLoading').hide();
		jq$('#previewWrapper').children().show();
	}
	else {
		jq$('#previewLoading').show();
		jq$('#previewWrapper').children().hide();
	}
}

function PreviewReportManual() {
	ShowReportPreviewContent(false);
	PreviewReportToDiv();
}

function PreviewReportDelayed(timeOut) {
	try {
		clearTimeout(previewReportTimeout);
	}
	catch (e) {
	}
	ShowReportPreviewContent(false);
	previewReportTimeout = setTimeout(PreviewReportToDiv, timeOut);
}

function PreviewReportToDiv() {
	PreviewReport(document.getElementById('rightHelpDiv'));
}

function InitEmptyPreviewArea(container) {
	var container$ = jq$(container);

	var subtotalsGrey = 'button default';
	var subtotalsImgName = 'subtotalsplusW.png';
	if (subtotalsAdded) {
		subtotalsGrey = 'button';
		subtotalsImgName = "subtotalsplus.png";
	}

	jq$('#appendSubtotalsBtn').attr('class', subtotalsGrey);
	jq$('#appendSubtotalsBtn img').attr('src', '###RS###image=' + subtotalsImgName);

	var chartGrey = 'button default';
	var chartImgName = 'chartplusW.png';
	if (chartAdded) {
		chartGrey = 'button';
		chartImgName = "chartplus.png";
	}

	jq$('#appendChartBtn').attr('class', chartGrey);
	jq$('#appendChartBtn img').attr('src', '###RS###image=' + chartImgName);
	if (!chartAvailable)
		jq$('#appendChartBtn').hide();

	container$.droppable({
		accept: 'a.field',
		drop: function (event, ui) {
			fieldsDragPreformingNow = false;
		}
	});
}

function PreviewReport(container) {
	var requestString = 'wscmd=getreportpreview';
	requestString += "&wsarg0=" + CollectReportData();
	var origRn = CurrentRn();
	if (origRn != '') {
		requestString += "&wsarg1=" + encodeURIComponent(origRn);
		requestString += "&wsarg2=" + encodeURIComponent(origRsData);
	}

	// run get preview ajax request
	jq$.ajax({
		type: 'POST',
		url: urlSettings.urlRsPage,
		data: requestString,
		contentType: 'application/x-www-form-urlencoded',
		dataType: 'text'
	}).done(function (data) {
		reportPreviewed(data);
	});

	function reportPreviewed(data) {
		ShowReportPreviewContent(true);

		// subtotals btn
		var subtotalsGrey = 'button';
		var subtotalsImgName = 'subtotalsplus.png';
		if (!subtotalsAdded) {
			subtotalsGrey += ' default';
			subtotalsImgName = "subtotalsplusW.png";
		}
		jq$('#appendSubtotalsBtn').attr('class', subtotalsGrey);
		jq$('#appendSubtotalsBtn img').attr('src', '###RS###image=' + subtotalsImgName);

		// chart btn
		var chartGrey = 'button';
		var chartImgName = 'chartplus.png';
		if (!chartAdded) {
			chartGrey += ' default';
			chartImgName = "chartplusW.png";
		}
		jq$('#appendChartBtn').attr('class', chartGrey);
		jq$('#appendChartBtn img').attr('src', '###RS###image=' + chartImgName);
		if (!chartAvailable)
			jq$('#appendChartBtn').hide();

		// find or create preview wrapper
		var containerWrapper$ = jq$('#previewWrapper');
		if (containerWrapper$ == null || containerWrapper$.length === 0)
			containerWrapper$ = jq$('<div id="previewWrapper">');
		containerWrapper$.html(data);
		jq$('#previewWrapperEmpty').hide();
		containerWrapper$.insertAfter(jq$('#previewWrapperEmpty'));

		var index = 0;
		var cb;
		var soVal;
		var widthChanged = false;
		while (true && !widthChanged) {
			cb = getTableElement(index);
			if (cb == null)
				break;
			soVal = cb.getAttribute('sorder');
			if (soVal == '-1') {
				index++;
				continue;
			}
			var fIndex = 0;
			while (true && !widthChanged) {
				cb = getFieldElement(index, fIndex);
				if (cb == null)
					break;
				soVal = cb.getAttribute('sorder');
				if (soVal == '-1') {
					fIndex++;
					continue;
				}
				var widthVal = cb.getAttribute('itemwidth');
				if (typeof widthVal != 'undefined' && widthVal != null && widthVal > 0)
					widthChanged = true;
				fIndex++;
			}
			index++;
		}
		if (!widthChanged) jq$('.preview-wrapper table.ReportTable').css('width', '100%');

		var visualGroupUsed = (data.indexOf('class=\'VisualGroup\'') >= 0);
		if (visualGroupUsed) {
			currentPreview = null;
			var tablesContainer$ = jq$('<div>');
			var mainTableTemplate$ = jq$('.preview-wrapper table.ReportTable').clone().html('');
			var tableIndex = 1;
			jq$('.preview-wrapper table.ReportTable').find('tr').each(function (i) {
				if (jq$(this).attr("class") == 'VisualGroup' && i == 0) {
					var vgTitleTable$ = jq$('<table>');
					vgTitleTable$.attr('targettable', 'ReportTable_1');
					vgTitleTable$.append(jq$(this).clone());
					tablesContainer$.append(vgTitleTable$);
				}
				else if (jq$(this).attr("class") == 'VisualGroup' && i != 0) {
					var tblToInsert = mainTableTemplate$.clone();
					tblToInsert.attr('class', 'ReportTable_' + tableIndex).attr('name', 'ReportTable_' + tableIndex);
					tablesContainer$.append(tblToInsert);

					var vgTitleTable$ = jq$('<table>');
					var nextIndex = tableIndex + 1;
					vgTitleTable$.attr('targettable', 'ReportTable_' + nextIndex);
					vgTitleTable$.append(jq$(this).clone());
					tablesContainer$.append(vgTitleTable$);

					tableIndex++;
					mainTableTemplate$.html('');
					//mainTableTemplate$.append($(this).clone());
				}
				else if (i == jq$('.preview-wrapper table.ReportTable').find('tr').length - 1) {
					mainTableTemplate$.append(jq$(this).clone());
					tablesContainer$.append(mainTableTemplate$.clone().attr('class', 'ReportTable_' + tableIndex).attr('name', 'ReportTable_' + tableIndex));
					tableIndex++;
				}
				else {
					mainTableTemplate$.append(jq$(this).clone());
				}
			});
			tablesContainer$.find('tr.VisualGroup').find('td').attr('style', 'border-width:0px;overflow:hidden;white-space: nowrap;');
			tablesContainer$.find('tr.VisualGroup').attr('onclick', 'javascript:EBC_ExpandTable_New(this);');
			jq$('.preview-wrapper table.ReportTable').replaceWith(tablesContainer$.html());
			try {
				var preview;
				var masterTable;
				for (var i = 1 ; i < tableIndex ; i++) {
					preview = new DataSourcesPreview('table.ReportTable_' + i);
					if (i == 1)
						masterTable = preview;
					if (i == tableIndex - 1)
						setTimeout(function () {
							preview.InitialResizeColumns();
							preview.ResizeColumnsInAllTables(jq$('table.ReportTable_1'));
							jq$('table.ReportTable_1').width(jq$('table.ReportTable_1').width());
							masterTable.initResize();
						}, 0);
				}
			}
			catch (e) {
			}
		}
		else {
			try {
				var preview = new DataSourcesPreview('table.ReportTable');
				currentPreview = preview;
			}
			catch (e) {
			}
		}
		setTimeout(updatePreviewPosition, 100);
	}
}

function AppendSubtotals() {
	subtotalsAdded = !subtotalsAdded;
	setTimeout(PreviewReportManual, 100);
}

function AppendChart() {
	chartAdded = !chartAdded;
	setTimeout(PreviewReportManual, 100);
}

/**
 * Drag'n'drop from datasource fields to preview table
 */
var fieldsDragPreformingNow = false;
var fieldDragged$ = null;
var isEmptyTable = false;
var newThCurrent = null;
var newThCurrent_index = null;

function initDraggable() {
	jq$('a.field').draggable({
		cancel: 'a.field.checked, a.field[locked="true"], span.field-popup-trigger',
		cursor: 'move',
		distance: 10,
		accept: 'table.ReportTable, div.preview-wrapper-empty',
		helper: function (event, ui) {
			var foo = jq$('<span style="z-index: 1001; background-color: #1C4E89; white-space: nowrap;"></span>');
			var target = jq$(event.currentTarget).clone();
			target.css('background-color', '#1C4E89');
			foo.append(target);
			return foo;
		},
		//helper: 'clone',
		revert: false,
		opacity: 0.5,

		start: function (event, ui) {
			fieldsDragPreformingNow = true;
			fieldDragged$ = jq$(event.currentTarget);
			if (jq$('table.ReportTable').length == 0 && jq$('table.ReportTable_1').length == 0) {
				// no preview
				isEmptyTable = true;
			} else {
				// preview exists
				isEmptyTable = false;
			}
		},

		drag: function (event, ui) {
			var dragTarget = jq$('table.ReportTable');
			var rTableOffset = dragTarget.offset();
			var w = jq$(dragTarget).width();
			var h = jq$(dragTarget).height();
			if (rTableOffset != null) {
				if (ColReorder.aoInstances == 0)
					return;
				var colReorder = ColReorder.aoInstances[ColReorder.aoInstances.length - 1];
				if (colReorder == null)
					return;
				if (event.pageX < rTableOffset.left - 100 || event.pageX > rTableOffset.left + w + 100
										|| event.pageY < rTableOffset.top || event.pageY > rTableOffset.top + h) {
					if (newThCurrent != null)
						newThCurrent.remove();
					newThCurrent = null;
					colReorder._fnClearDrag.call(colReorder, event);
					return;
				} else {
					if (newThCurrent != null)
						return;
					var nTh = jq$('table.ReportTable thead tr:first-child');
					newThCurrent = jq$('<th>');
					event['target'] = newThCurrent[0];
					colReorder._fnMouseDownHiddenHelper.call(colReorder, event, nTh);
				}
			}
			else {
				// Dirty workaround. Need to know the exact tables count
				for (var i = 1; i < 1000; i++) {
					{
						var table = jq$('table.ReportTable_' + i);
						if (table == undefined || table == null)
							break;

						var rTableOffset_i = table.offset();
						var w_i = jq$(table).width();
						var h_i = jq$(table).height();
						if (rTableOffset_i != null) {
							if (oDatatable['table.ReportTable_' + i] == null || oDatatable['table.ReportTable_' + i]._oPluginColReorder == null)
								return;
							var colReorder = oDatatable['table.ReportTable_' + i]._oPluginColReorder;
							if (event.pageX < rTableOffset_i.left - 100 || event.pageX > rTableOffset_i.left + w_i + 100
													|| event.pageY < rTableOffset_i.top || event.pageY > rTableOffset_i.top + h_i) {
								if (newThCurrent_index == i) {
									if (newThCurrent != null)
										newThCurrent.remove();
									newThCurrent = null;
									colReorder._fnClearDrag.call(colReorder, event);
								}
								continue;
							} else {
								if (newThCurrent != null && newThCurrent_index == i)
									return;
								var nTh = jq$('table.ReportTable_' + i + ' thead tr:first-child');
								newThCurrent = jq$('<th>');
								event['target'] = newThCurrent[0];

								if (oDatatable['table.ReportTable_' + newThCurrent_index] != null && oDatatable['table.ReportTable_' + newThCurrent_index]._oPluginColReorder != null) {
									var colReorder_prev = oDatatable['table.ReportTable_' + newThCurrent_index]._oPluginColReorder;
									colReorder_prev._fnClearDrag.call(colReorder_prev, event);
								}
								newThCurrent_index = i;
								colReorder._fnMouseDownHiddenHelper.call(colReorder, event, nTh);
							}
						}
					} (i);
				}
			}
		},

		stop: function (event, ui) {
			fieldsDragPreformingNow = false;
			if (isEmptyTable) {
				var dragTarget = jq$('div.preview-wrapper-empty');
				var rTableOffset = dragTarget.offset();
				var w = jq$(dragTarget).outerWidth();
				var h = jq$(dragTarget).outerHeight();
				if (rTableOffset != null)
					if (event.pageX < rTableOffset.left || event.pageX > rTableOffset.left + w
						|| event.pageY < rTableOffset.top || event.pageY > rTableOffset.top + h)
						return;
				fieldDragged$.attr('sorder', 1);
				var tableIndex = Number(fieldDragged$.attr('tableIndex'));
				var fieldIndex = Number(fieldDragged$.attr('fieldIndex'));
				if (!isNaN(tableIndex) && !isNaN(fieldIndex)) {
					FiClickForcedDrag(tableIndex, fieldIndex, false, false);
				}
			}
			if (updateOnDrag)
				setTimeout(PreviewReportManual, 100);
		}
	});

}

function NDS_CanBeJoined(dsArray) {
	if (dsArray.length < 2)
		return true;
	for (var i = 0; i < dsArray.length; i++) {
		var canBeJoined = false;
		for (var j = 0; j < dsArray.length; j++) {
			if (i == j)
				continue;
			for (var k = 0; k < ebc_constraintsInfo.length; k++) {
				if (ebc_constraintsInfo[k][0] == dsArray[i] && ebc_constraintsInfo[k][1] == dsArray[j]) {
					canBeJoined = true;
					break;
				}
				if (ebc_constraintsInfo[k][0] == dsArray[j] && ebc_constraintsInfo[k][1] == dsArray[i]) {
					canBeJoined = true;
					break;
				}
			}
			if (canBeJoined)
				break;
		}
		if (!canBeJoined)
			return false;
	}
	return true;
}

function NDS_CanBeJoinedWithGiven(dsArray, dsAdded) {
	dsArray[dsArray.length] = dsAdded;
	var canBe = NDS_CanBeJoined(dsArray);
	dsArray.splice(dsArray.length - 1, 1);
	return canBe;
}

function NDS_CanBeJoinedWithoutGiven(dsArray, dsRemoved) {
	var canBe = NDS_CanBeJoined(dsArray);
	for (var i = 0; i < dsArray.length; i++) {
		if (dsArray[i] == dsRemoved) {
			dsArray.splice(i, 1);
			canBe = NDS_CanBeJoined(dsArray);
			dsArray[dsArray.length] = dsRemoved;
			break;
		}
	}
	return canBe;
}

/**
 * Check/uncheck field item.
 * @param {object} field dom element
 * @param {number} field new sorder
 */
function NDS_SetFiSOrd(fcb, fiOrd) {
	var $fcb = jq$(fcb);
	$fcb.attr('sorder', fiOrd);
	if (fiOrd >= 0)
		$fcb.addClass('checked');
	else
		$fcb.removeClass('checked');
}

function NDS_SetFiAvailability(fcb, available, checkBoxChildInd) {
	if (available) {
		fcb.childNodes[checkBoxChildInd].style.backgroundColor = '#FFFFFF';
		fcb.setAttribute('locked', false);
	}
	else {
		fcb.childNodes[checkBoxChildInd].style.backgroundColor = '#CCCCCC';
		fcb.setAttribute('locked', true);
	}
}

function NDS_UpdateFiOpacity(fcb) {
	var locked = fcb.getAttribute('locked');
	var fiOrd = fcb.getAttribute('sorder');
	if (fiOrd != '-1' || locked == 'true')
		fcb.childNodes[3].style.opacity = '1';
	else
		fcb.childNodes[3].style.opacity = '0.25';
}

function NDS_SetDsSOrd(cb, sord, dsInd, forceRefresh) {
	var wasOrd = cb.getAttribute('sorder');
	if (wasOrd == '-1' && sord == '-1' && !forceRefresh)
		return;
	cb.setAttribute('sorder', sord);
	var pe = cb.parentElement.parentElement.parentElement;
	jq$(pe).removeClass('checked');
	if (sord >= 0)
		jq$(pe).addClass('checked');
	if (sord == '-1') {
		var fdInd = 0;
		var fcb;
		while (true) {
			fcb = getFieldElement(dsInd, fdInd);
			if (fcb == null)
				break;
			NDS_SetFiSOrd(fcb, -1);
			fdInd++;
		}
	}
}

function NDS_SetDsAvailability(cb, available, tInd) {
	if (available) {
		cb.childNodes[0].style.backgroundColor = '#FFFFFF';
		cb.setAttribute('locked', false);
	}
	else {
		cb.childNodes[0].style.backgroundColor = '#CCCCCC';
		cb.setAttribute('locked', true);
	}
	if (dsState[tInd] < 2)
		return;
	var dsSelected = cb.getAttribute('sorder');
	var fInd = 0;
	var f;
	var firstField = getFieldElement(tInd, 0);
	if (firstField != null) {
		var checkBoxChildInd = -1;
		for (var ci = 0; ci < firstField.childNodes.length; ci++) {
			if (typeof firstField.childNodes[ci].getAttribute != 'undefined' && firstField.childNodes[ci].getAttribute('class') == 'checkbox') {
				checkBoxChildInd = ci;
				break;
			}
		}
		if (checkBoxChildInd < 0) {
			checkBoxChildInd = 3;
		}
		while (true) {
			f = getFieldElement(tInd, fInd);
			if (f == null)
				break;
			NDS_SetFiAvailability(f, available || dsSelected != '-1', checkBoxChildInd);
			fInd++;
		}
	}
}

function NDS_UpdateDsOpacity(cb, dsInd) {
	var locked = cb.getAttribute('locked');
	var sorder = cb.getAttribute('sorder');
	if (locked == 'false' && sorder == '-1')
		cb.childNodes[0].style.opacity = '0.25';
	else
		cb.childNodes[0].style.opacity = '1';
	if (dsState[dsInd] < 1)
		return;
	var fdInd = 0;
	var fcb;
	while (true) {
		fcb = getFieldElement(dsInd, fdInd);
		if (fcb == null)
			break;
		NDS_UpdateFiOpacity(fcb);
		fdInd++;
	}
}

/**
 * Check constraints and update datasources availability.
 * @param {boolean} forceRefresh 
 */
function NDS_UpdateDatasourcesAvailability(forceRefresh) {
	var dsArr = new Array();
	var dsNames = new Array();
	var dsChecked = new Array();
	var dsSelected = new Array();
	var cb;
	var soVal;
	var index = 0;
	while (true) {
		cb = getTableElement(index);
		if (cb == null)
			break;
		dsArr[dsArr.length] = cb;
		dsNames[dsNames.length] = cb.getAttribute('tableid');
		dsChecked[dsChecked.length] = false;
		soVal = cb.getAttribute('sorder');
		if (soVal == null || soVal == '-1') {
			index++;
			continue;
		}
		dsChecked[dsChecked.length - 1] = true;
		dsSelected[dsSelected.length] = dsNames[dsNames.length - 1];
		index++;
	}
	var allowMore = dsSelected.length < nirConfig.AllowedMaxTables;
	for (var i = 0; i < dsArr.length; i++) {
		var toDisable = true;
		if (!dsChecked[i]) {
			if (allowMore && NDS_CanBeJoinedWithGiven(dsSelected, dsNames[i])) {
				toDisable = false;
			}
		}
		else {
			if (NDS_CanBeJoinedWithoutGiven(dsSelected, dsNames[i])) {
				toDisable = false;
			}
		}
		if (dsState[i] > 0) {
			if (toDisable) {
				NDS_SetDsAvailability(dsArr[i], false, i);
			} else {
				NDS_SetDsAvailability(dsArr[i], true, i);
			}
		}
		NDS_SetDsSOrd(dsArr[i], dsArr[i].getAttribute('sorder'), i, forceRefresh);
		if (dsState[i] > 0)
			NDS_UpdateDsOpacity(dsArr[i], i);
	}

	UpdateFiltersAvailability();
}

function NDS_RefreshOpenedList() {
	dsState.length = 0;
	var tInd = -1;
	while (true) {
		tInd++;
		var ds = getTableElement(tInd);
		if (ds == null)
			break;
		dsState[tInd] = 0;
		ds = ds.parentElement.parentElement.parentElement;
		var isOpened = false;
		if (jq$(ds).hasClass('opened'))
			isOpened = true;
		ds = ds.parentElement.parentElement;
		var isShown = false;
		if (jq$(ds).hasClass('opened'))
			isShown = true;
		if (isShown) {
			dsState[tInd] = 1;
			if (isOpened)
				dsState[tInd] = 2;
		}
	}
}

function DsDomChanged() {
	NDS_RefreshOpenedList();
	NDS_UpdateDatasourcesAvailability(false);
}

function NDS_Init() {
	EBC_Init("rs.aspx?", 0, false, 0, "###RS###");
	EBC_LoadConstraints();
}

/**
 * Set next counter value for dom element, if "sorder" attribute was not set or equals "-1".
 * @param {object} Html dom element.
 */
function EngageDs(clicked) {
	var cso = clicked.getAttribute('sorder');
	if (!cso || cso === '-1') {
		clicked.setAttribute('sorder', csOrder);
		csOrder++;
	}
}

/**
 * Set "sorder" attribute value "-1" for dom element.
 * @param {object} Html dom element
 */
function DisengageDs(clicked) {
	clicked.setAttribute('sorder', '-1');
}

/**
 * Store pairs of field index and sorder to array for selected table.
 * @param {Number} table id
 */
function NDS_StoreDsSelection(tind) {
	var fi;
	var fIndex = 0;
	var selected = new Array();
	while (true) {
		fi = getFieldElement(tind, fIndex);
		if (fi == null)
			break;
		var so = fi.getAttribute('sorder');
		if (so != '-1')
			selected[selected.length] = fIndex + '-' + so;
		fIndex++;
	}
	dsSelections[tind] = selected;
}

/**
 * Set previous stored field selection and order.
 * @param {number} Id of datasource.
 */
function NDS_RestoreDsSelection(tind) {
	var dsSelection = dsSelections[tind];
	if (dsSelection != null && dsSelection.length > 0) {
		for (var dsCnt = 0; dsCnt < dsSelection.length; dsCnt++) {
			var sVals = dsSelection[dsCnt].split('-');
			if (sVals.length === 2) {
				var fc = getFieldElement(tind, sVals[0]);
				NDS_SetFiSOrd(fc, sVals[1]);
			}
		}
	}
}

/**
 * Initialize table element content.
 * @param {string} id of table element header. Table element content has similar id.
 */
function _initFieldsDsp(hId, onInitComplete) {
	var nwid = document.getElementById(hId);
	hId = hId.substr(4); // remove "rdbh" prefix
	var contentDiv = document.getElementById('rdb' + hId);
	var currHtml = contentDiv.innerHTML;
	if (currHtml != IzLocal.Res("js_Loading", "Loading...")) {
		if (typeof (onInitComplete) === 'function') {
			onInitComplete();
		}
		return;
	}
	// if table element content wasn't loaded, initialize it:
	var firstUnder = hId.indexOf('_');
	var dbKey = hId.substr(0, firstUnder);
	var tKey = hId.substr(firstUnder + 1);

	var willBeTableIndex = jq$(nwid).attr('tableInd');
	var getFieldsByTableKey = function (key) {
		var tables = databaseSchema[dbKey].tables,
		length = tables.length,
		result = {};
		for (var i = 0; i < length; ++i) {
			var table = tables[i];
			if (table.sysname.replace(/[\]\[\.]/g, "") == key) {
				result = table.fields;
				break;
			}
		}
		return result;
	};
	var fieldsData = getFieldsByTableKey(tKey);
	if (fieldsData == 'LAZIED') {
		var furtherWorkData = new Object();
		furtherWorkData.ContentDiv = contentDiv;
		furtherWorkData.WillBeTableIndex = willBeTableIndex;
		furtherWorkData.onInitComplete = onInitComplete;
		var tableFullName = '';
		for (var index = 0; index < nwid.children.length; index++) {
			if (nwid.children[index].id.indexOf('tcb') >= 0) {
				tableFullName = nwid.children[index].getAttribute('tableid');
				break;
			}
		}
		furtherWorkData.TableFullName = tableFullName;
		AjaxRequest('./rs.aspx', 'wscmd=getfieldsinfo&wsarg0=' + tableFullName, FieldsInfoGot, null, 'getfieldsinfo', furtherWorkData);
	}
	else
		finalizeInitFieldsDsp(contentDiv, willBeTableIndex, fieldsData, onInitComplete);
}

/**
 * Initialize table element content.
 * @param {string} id of table element header. Table element content has similar id.
 */
function initFieldsDsp(nwid, onInitComplete) {
	var hId = nwid.id; // get table header element Id
	_initFieldsDsp(hId, onInitComplete);
}

function FieldsInfoGot(returnObj, id, furtherWorkData) {
	if (id != 'getfieldsinfo' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.fields != null) {
		for (var catCnt = 0; catCnt < databaseSchema.length; catCnt++) {
			for (var tabCnt = 0; tabCnt < databaseSchema[catCnt].tables.length; tabCnt++) {
				if (databaseSchema[catCnt].tables[tabCnt].sysname == furtherWorkData.TableFullName && databaseSchema[catCnt].tables[tabCnt].fields == 'LAZIED') {
					databaseSchema[catCnt].tables[tabCnt].fields = returnObj.fields;
					break;
				}
			}
		}
		finalizeInitFieldsDsp(furtherWorkData.ContentDiv, furtherWorkData.WillBeTableIndex, returnObj.fields, furtherWorkData.onInitComplete);
	}
}

function finalizeInitFieldsDsp(contentDiv, willBeTableIndex, fieldsData, onInitComplete) {
	fieldsIndex = 0;
	var html = renderSections(willBeTableIndex, fieldsData);
	html = '<div class=\'table-fields-sections-background\'></div>' + html;
	contentDiv.innerHTML = html;
	initDraggable();
	jq$(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
		event.preventDefault();
	});
	var triggersHtml = "<span class='f-trigger' data-view='fields-view'> \
							<img src='###RS###image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
						</span> \
						<span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
						<span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
						<span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";
	jq$(".table-view-triggers").filter(function (index) {
		var shouldBeReturned = false;
		var npAttr;
		try {
			npAttr = this.getAttribute('notProcessed1');
		} catch (e) {
			npAttr = '0';
		}
		if (npAttr == '1') {
			shouldBeReturned = true;
			this.setAttribute('notProcessed1', '0');
		}
		return shouldBeReturned;
	}).append(triggersHtml);

	jq$(".table").each(function () {
		setView(jq$(this), "fields-view");
	});

	jq$(".field-popup-trigger").mouseup(function (event) {
		event.cancelBubble = true;
		(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
		(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
		var parent = this.parentElement;
		var fieldSqlName = parent.getAttribute('fieldid');
		if (fieldSqlName != null && fieldSqlName != '') {
			var friendlyName = jq$(parent).find('.field-name').html();
			DS_ShowFieldProperties(fieldSqlName, friendlyName, parent.getAttribute('id'));
		}
		return false;
	});

	// apply delayed search highlights
	var $table = jq$(contentDiv).closest('.table');
	var highlights = $table.attr('highlight');
	if (typeof (highlights) === 'string') {
		jq$.each(highlights.split(','), function () {
			var fieldSysName = this;
			var $field = $table.find('.field[fieldid="' + fieldSysName + '"]');
			var $fieldName = $field.find("span.field-name");
			$fieldName.addClass("autocomplete-item-field-selection");
			highlightedFieldsCache.push($fieldName);
		});
	}

	if (typeof (onInitComplete) === 'function') {
		onInitComplete(fieldsData);
	}
}

/**
 * Datasource checkbox click handler.
 * @param {Number} datasource id
 */
function DsClicked(datasourceIndex) {
	var clicked = getTableElement(datasourceIndex);
	var $clicked = jq$(clicked);
	var $table = $clicked.closest("div.table");

	if ($clicked.attr('locked') === 'false') {
		var cso = $clicked.attr('sorder');
		if (!cso || cso === '-1') {
			// set next sorder for datasource dom element:
			EngageDs(clicked);
			// restore previously saved sorders
			NDS_RestoreDsSelection(datasourceIndex);
		} else {
			// reset sorder
			DisengageDs(clicked);
		}
	}

	// initialize table content when first time clicked.
	initFieldsDsp(clicked.parentNode, function () {
		// uncheck table and all its fields if checked
		if ($table.hasClass('checked')) {
			$table.removeClass('checked');
			jq$.each($table.find('a.field'), function () {
				var $field = jq$(this);
				var sorder = $field.attr('sorder');
				if (sorder && sorder !== '-1') {
					var fid = parseFieldIdentifier($field.attr('id'));
					FiClick(fid.tableIndex, fid.fieldIndex, false, false, true);
				}
			});
		}

		// open table
		$table.addClass("opened");

		// update tree items availability:
		NDS_UpdateDatasourcesAvailability(false);

		// run preview report
		PreviewReportManual();
	});
}

function NDS_UnckeckAllDs() {
	var index = 0;
	var cb;
	while (true) {
		cb = getTableElement(index);
		if (cb == null)
			break;
		DisengageDs(cb);
		index++;
	}
	NDS_UpdateDatasourcesAvailability(true);
}

/**
 * Field checkbox click handler. Adds/removes field to preview.
 * @param {number} tind - table index
 * @param {number} find - field index
 * @param {boolean} programmatic 
 * @param {boolean} enableOnly 
 */
function FiClick(tind, find, programmatic, enableOnly, disablePreviewUpdate) {
	if (fieldsDragPreformingNow && !programmatic)
		return;
	var storeSelection = false;
	var clickedDs = getTableElement(tind); // datasource checkbox
	if (clickedDs.getAttribute('locked') === 'false' || (clickedDs.hasAttribute('sorder') && clickedDs.getAttribute('sorder') !== '-1')) {
		var clickedFi = getFieldElement(tind, find); // field checkbox (and label)
		var cso = clickedFi.getAttribute('sorder');
		if (!cso || cso === '-1') {
			EngageDs(clickedDs); // set next table order
			NDS_SetFiSOrd(clickedFi, csOrder++);
			storeSelection = true;
		} else {
			if (!enableOnly)
				NDS_SetFiSOrd(clickedFi, '-1');
		}
	}
	NDS_UpdateDatasourcesAvailability(false);
	if (storeSelection)
		NDS_StoreDsSelection(tind);
	if (updateOnClick && !disablePreviewUpdate)
		PreviewReportManual();
}

function FiClickForcedDrag(tind, find, programmatic, enableOnly) {
	var clickedDs = getTableElement(tind);
	if (clickedDs.getAttribute('locked') == 'false' || clickedDs.getAttribute('sorder') != '-1') {
		var clickedFi = getFieldElement(tind, find);
		EngageDs(clickedDs);
		jq$(clickedFi).addClass('checked');
		csOrder++;
	}
	NDS_UpdateDatasourcesAvailability(false);
	NDS_StoreDsSelection(tind);
	if (updateOnDrag)
		PreviewReportManual();
}

function GetInstantReportConfig() {
	var requestString = 'wscmd=instantreportconfig';
	AjaxRequest('./rs.aspx', requestString, GotInstantReportConfig, null, 'instantreportconfig');
}

function GotInstantReportConfig(returnObj, id) {
	if (id != 'instantreportconfig' || returnObj == undefined || returnObj == null)
		return;
	nirConfig = returnObj;
	chartAvailable = nirConfig.VisualizationsAvailable;
	InitEmptyPreviewArea('#rightHelpDiv');
	jq$("#previewH2").show();
	jq$(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
		event.preventDefault();
	});

	var triggersHTML = "<span class='f-trigger' data-view='fields-view'> \
							<img src='###RS###image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
						</span> \
						<span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
						<span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
						<span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";
	jq$(triggersHTML).appendTo(".table-view-triggers");

	jq$(".table-header a .table-view-triggers span").live("click", function (event) {
		event.cancelBubble = true;
		(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
		(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
		var trigger = jq$(this);
		var table = jq$(this).closest(".table");
		var view = trigger.attr("data-view");
		setView(table, view);
		if (!table.hasClass('opened')) {
			collapseTables();
			table.addClass("opened", animationTime);
		}
	});

	jq$(".table").each(function () {
		setView(jq$(this), "fields-view");
	});

	rootRightDiv = document.getElementById('rootRightDiv');
	leftDiv = document.getElementById('leftDiv');
	pdiv = document.getElementById('rightHelpDiv');
	defaultPdivPos = '';
	databasesDiv = document.getElementById('databases');
	defaultDbHeight = databasesDiv.style.height;
	defaultDbOverflowY = databasesDiv.style.overflowY;
	previewWrapperDiv = null;
	defaultPwHeight = '';
	defaultPwOverflowY = '';
	defaultPwPaddingRight = '';

	whiteHeader = document.getElementById('whiteHeader');
	blueHeader = document.getElementById('blueHeader');
	setInterval(checkLeftHeight, 100);

	jq$(window).resize(function (event) {
		checkLeftHeight();
		updatePreviewPosition(event);
		PreviewReportDelayed(10);
	});
	jq$(window).scroll(function (event) {
		updatePreviewPosition(event);
	});
	checkLeftHeight();
	updatePreviewPosition(null);
	InitInstantFilters();
}

/* ----------------- */
/* ---- Filters ---- */
/* ----------------- */
var dataSources = [];
var fieldsList = [];
var fieldsDataObtained;
var filtersDataObtained;
var nrvConfig = null;
var urlSettings = {};

function InitInstantFilters() {
	fieldsDataObtained = true;
	filtersDataObtained = true;
	urlSettings.urlRsPage = nirConfig.ResponseServerUrl;
	urlSettings.urlRpPage = nirConfig.ResourcesProviderUrl;
}

function GetSelectedDataSources() {
	var dsList = new Array();
	var index = 0;
	var cb;
	var soVal;
	while (true) {
		cb = getTableElement(index);
		if (cb == null)
			break;
		soVal = cb.getAttribute('sorder');
		if (soVal == '-1') {
			index++;
			continue;
		}
		dsList[dsList.length] = cb.getAttribute('tableid');
		index++;
	}
	return dsList;
}

function UpdateDataSources() {
	if (typeof databaseSchema == 'undefined' || typeof dataSources == 'undefined' || databaseSchema == null)
		return;

	var selectedDataSources = GetSelectedDataSources();
	dataSources = new Array();
	for (var cat = 0; cat < databaseSchema.length; cat++)
		for (key in databaseSchema[cat].tables) {
			var table = databaseSchema[cat].tables[key];

			// Only selected data sources are available
			if (jq$.inArray(table.sysname, selectedDataSources) < 0)
				continue;

			var ds = {
				FriendlyName: table.name,
				DbName: table.sysname,
				DataType: 0,
				IsStoredProc: false,
				JoinAlias: ''
			};
			var columns = new Array();
			for (var i = 0; i < table.fields.length; ++i) {
				var field = table.fields[i];
				var column = {
					FriendlyName: field.name,
					DbName: field.sysname
				};
				columns.push(column);
			}
			ds.Columns = columns;
			dataSources.push(ds);
		}
}

function UpdateFiltersAvailability() {
	if (typeof filtersData == 'undefined' || filtersData == null)
		return;
	UpdateDataSources();

	var availableColumns = new Array();
	for (var ds = 0; ds < dataSources.length; ds++)
		for (var col = 0; col < dataSources[ds].Columns.length; col++)
			availableColumns.push(dataSources[ds].Columns[col].DbName);

	var availableFilters = new Array();
	for (var i = 0; i < filtersData.length; i++)
		if (availableColumns.indexOf(filtersData[i].ColumnName) >= 0) {
			var filterObj = filtersData[i];
			if (!filtersData[i].Removed)
				filterObj.Value = GetFilterValues(i, filtersData).slice(1)[0];
			availableFilters.push(filterObj);
		}

	var returnObject = {
		Filters: availableFilters,
		SubreportsFilters: null,
		FilterLogic: ''
	};
	RefreshFilters(returnObject);
}

// Report Viewer override
function ShowFilterPropertiesByFieldName(fieldName, GUID) {
	for (var dsInd = 0; dsInd < dataSources.length; dsInd++)
		for (var colInd = 0; colInd < dataSources[dsInd].Columns.length; colInd++)
			if (dataSources[dsInd].Columns[colInd].DbName == fieldName) {
				DS_ShowFilterProperties(fieldName, dataSources[dsInd].Columns[colInd].FriendlyName, null, GUID);
				return;
			}
	return;
}