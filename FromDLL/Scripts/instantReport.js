function GetUrlParam(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
}

//ui------------------------------------------------------------------------------------------------------------
var reportName;
var constraintsList;
var typedDbSchema;

function GetConstraintsList() {
  var requestString = 'wscmd=getconstraintslist';
  AjaxRequest('./rs.aspx', requestString, GotConstraintsList, null, 'constraintslist');
}

function GotConstraintsList(returnObj, id) {
  if (id != 'constraintslist' || returnObj == undefined || returnObj == null)
    return;
  constraintsList = returnObj.Data;
}

function GetTypedDbSchema() {
  var requestString = 'wscmd=gettypeddbschema';
  AjaxRequest('./rs.aspx', requestString, GotTypedDbSchema, null, 'typeddbschema');
}

function GotTypedDbSchema(returnObj, id) {
  if (id != 'typeddbschema' || returnObj == undefined || returnObj == null)
    return;
  typedDbSchema = returnObj.PartsForTypeGroups;
}

function GetUsedTypesList(forRn) {
  var requestString = 'wscmd=getusedtypeslist&wsarg0=' + forRn;
  AjaxRequest('./rs.aspx', requestString, GotUsedTypesList, null, 'usedtypeslist');
}

function GotUsedTypesList(returnObj, id) {
  if (id != 'usedtypeslist' || returnObj == undefined || returnObj == null)
    return;
  if (returnObj.ReportSetName != null && returnObj.FieldTemplates != null && returnObj.FieldTemplates.length > 0)
    GenerateTypesList(returnObj.FieldTemplates);
}

function GenerateTypesList(templatesList) {
  var content = '<table>';
  for (var index = 0; index < templatesList.length; index++) {
    content += '<tr><td>' + templatesList[index].TypeGroupName + '</td>';
    content += '<td><input id="idv' + index + '" type="hidden" value="' + templatesList[index].Id + '" />';
    content += '<input id="tgv' + index + '" type="hidden" value="' + templatesList[index].TypeGroup + '" />';    
    content += '<input id="fnv' + index + '" type="hidden" value="" />';
    content += '<input id="fnf' + index + '" type="text" value="" style="width:500px;" /></td>';
    content += '<td>';
    if (templatesList[index].TypeGroupName.indexOf('Number') == 0 && templatesList[index].TypeGroupName.indexOf('- Filter') < 0)
      content += '&nbsp;&nbsp;&nbsp;&nbsp;<input id="cncb' + index + '" type="checkbox" />&nbsp;Count';
    content += '</td></tr>';
  }
  content += '</table>';
  var fsDiv = document.getElementById('fieldsSelectors');
  fsDiv.innerHTML = content;
  for (var index = 0; index < templatesList.length; index++) {
    var editForAutoComplite = document.getElementById('fnf' + index);
    if (editForAutoComplite == null)
      continue;
    jq$(editForAutoComplite).autocomplete({
      source: function(req, responseFunction) {
        var controlIndex = this.element[0].id.substring(3);
        var tgInput = document.getElementById('tgv' + controlIndex);
        var tgValue = tgInput.value;
        var countChecked = document.getElementById('cncb' + controlIndex);
        if (countChecked != null && countChecked.checked == true)
          tgValue = typedDbSchema.length - 1;
        GetPossibleFields(req.term, tgValue, responseFunction);
      },
      search: function() {
        var term = this.value;
        if (term.length < 2)
          return false;
      },
      focus: function() {
        return false;
      },
      select: function(event, ui) {
        this.value = ui.item.label;
        var controlIndex = this.id.substring(3);
        var fvInput = document.getElementById('fnv' + controlIndex);
        fvInput.value = ui.item.value;
        return false;
      }
    });
  }
}

function CollectSelectedFields(namePart) {
  var res = new Array();
  var index = 0;
  while (true) {
    var edit = document.getElementById('fnv' + index);
    if (edit == null)
      break;
    var val = edit.value;
    if (val != '' && val != null && val != namePart)
      res.push(val);
    index++;
  }
  return res;
}

function GetEngagedDatasources(selectedValues) {
  var engagedDs = new Array();
  for (var svIndex = 0; svIndex < selectedValues.length; svIndex++) {
    var nodes = selectedValues[svIndex].split('.');
    if (nodes.length < 3)
      continue;
    var dsName = nodes[nodes.length - 3] + '.' + nodes[nodes.length - 2];
    var exists = false;
    for (var cc = 0; cc < engagedDs.length; cc++) {
      if (engagedDs[cc] == dsName) {
        exists = true;
        break;
      }
    }
    if (exists)
      continue;
    engagedDs.push(dsName);
  }
  return engagedDs;
}

function CanBeJoined(ds1, ds2) {
  if (ds1 == ds2)
    return true;
  var result = false;
  for (var k = 0; k < constraintsList.length; k++) {
    if (constraintsList[k][0] == ds1 && constraintsList[k][1] == ds2) {
      result = true;
      break;
    }
    if (constraintsList[k][0] == ds2 && constraintsList[k][1] == ds1) {
      result = true;
      break;
    }
  }
  return result;
}

function GetJoineableTypedParts(engagedDs, typedDsParts) {
  var possibleParts = new Array();
  for (var index = 0; index < typedDsParts.Parts.length; index++) {
    if (engagedDs.length == 0) {
      possibleParts.push(typedDsParts.Parts[index]);
      continue;
    }
    var joineable = false;
    for (var eCnt = 0; eCnt < engagedDs.length; eCnt++) {
      if (CanBeJoined(engagedDs[eCnt], typedDsParts.Parts[index].Name)) {
        joineable = true;
        break;
      }
    }
    if (joineable)
      possibleParts.push(typedDsParts.Parts[index]);
  }
  return possibleParts;
}

function GetPossibleFields(namePart, typeGroup, responseFunction) {
  var selectedValues = CollectSelectedFields(namePart);
  var engagedDs = GetEngagedDatasources(selectedValues);
  var typedDsParts = typedDbSchema[typeGroup];
  var possibleTypedParts = GetJoineableTypedParts(engagedDs, typedDsParts);
  var result = new Array();
  var lowerNamePart = namePart.toLowerCase();
  for (var dsCnt = 0; dsCnt < possibleTypedParts.length; dsCnt++) {
    for (var fCnt = 0; fCnt < possibleTypedParts[dsCnt].Fields.length; fCnt++) {
      if (possibleTypedParts[dsCnt].GuiNamesLower[fCnt].indexOf(lowerNamePart) >= 0) {
        var item = new Object();
        item.value = possibleTypedParts[dsCnt].Fields[fCnt];
        item.label = possibleTypedParts[dsCnt].GuiNames[fCnt];
        result.push(item);
      }
    }
  }
  responseFunction(result);
}

function LaunchReport() {
  var res = new Array();
  var fieldsData = new Object();
  fieldsData.Assignations = new Array();
  var index = 0;
  while (true) {
    var idEdit = document.getElementById('idv' + index);
    if (idEdit == null)
      break;
    var idVal = idEdit.value;  
    var fnEdit = document.getElementById('fnv' + index);
    if (fnEdit == null)
      break;
    var fnVal = fnEdit.value;
    var cntVal = "0";
    var cntCb = document.getElementById('cncb' + index);
    if (cntCb != null && cntCb.checked == true)
      cntVal = "1"
    fieldsData.Assignations.push([idVal, fnVal, cntVal]);
    index++;
  }
  fieldsData.ReportName = reportName;
  var s = JSON.stringify(fieldsData);
  SendGenerationData(s);
}

function SendGenerationData(data) {
  var requestString = 'wscmd=launchreport&wsarg0=' + data;
  AjaxRequest('./rs.aspx', requestString, DataSent, null, 'launchreport');
}

function DataSent(returnObj, id) {
  if (id != 'launchreport' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value != 'OK')
    alert(returnObj.Value);
  else
    window.location = returnObj.AdditionalData[0];
}

function Initialize() {
  reportName = GetUrlParam('rn');
  GetConstraintsList();
  GetTypedDbSchema();
  GetUsedTypesList(reportName);
}
