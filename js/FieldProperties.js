function FP_ShowFieldProperties(field, dialog) {
  var titleDiv = document.getElementById('titleDiv');
  titleDiv.innerHTML = IzLocal.Res('js_FieldPropertyForField', 'Field Properties for {0}').replace(/\{0\}/g, field.FriendlyName);
  var propDescription = document.getElementById('propDescription');
  if (field.Selected >= 0)
  	propDescription.disabled = false;
  else
  	propDescription.disabled = true;
  propDescription.value = field.Description;
  var propTotal = document.getElementById('propTotal');
  propTotal.checked = false;
  if (field.Total == 1)
    propTotal.checked = true;
  var propVG = document.getElementById('propVG');
  propVG.checked = false;
  if (field.VG == 1)
    propVG.checked = true;
  var propFormats = document.getElementById('propFormats');
  propFormats.options.length = 0;
  for (var formatCnt = 0; formatCnt < field.FormatValues.length; formatCnt++) {
    var optFormat = new Option();
    optFormat.value = field.FormatValues[formatCnt];
    optFormat.text = field.FormatNames[formatCnt];
    if (field.Format == field.FormatValues[formatCnt])
      optFormat.selected = 'selected';
    propFormats.add(optFormat);
  }
  var propFilterOperators = document.getElementById('propFilterOperators');
  propFilterOperators.options.length = 0;
  while (propFilterOperators.hasChildNodes())
    propFilterOperators.removeChild(propFilterOperators.firstChild);
  var currentOptGroup = null;
  for (var filterOperatorCnt = 0; filterOperatorCnt < field.FilterOperatorValues.length; filterOperatorCnt++) {
    if (field.FilterOperatorValues[filterOperatorCnt] == '###OPTGROUP###') {
      if (field.FilterOperatorNames[filterOperatorCnt] != '') {
        currentOptGroup = document.createElement('optgroup');
        currentOptGroup.label = field.FilterOperatorNames[filterOperatorCnt];
        propFilterOperators.appendChild(currentOptGroup);
      }
      continue;
    }
    var optOper = document.createElement('option');
    optOper.value = field.FilterOperatorValues[filterOperatorCnt];
    optOper.innerHTML = field.FilterOperatorNames[filterOperatorCnt];
    if (field.FilterOperator == field.FilterOperatorValues[filterOperatorCnt])
      optOper.selected = 'selected';
    if (currentOptGroup == null)
      propFilterOperators.appendChild(optOper);
    else
      currentOptGroup.appendChild(optOper);
  }
  var labelJ = document.getElementById('labelJ');
  var msvs = labelJ.getAttribute('msvs').split(',');
  labelJ.innerHTML = msvs[field.LabelJ - 1];
  labelJ.setAttribute('msv', msvs[field.LabelJ - 1]);
  var valueJ = document.getElementById('valueJ');
  msvs = valueJ.getAttribute('msvs').split(',');
  valueJ.innerHTML = msvs[field.ValueJ];
  valueJ.setAttribute('msv', msvs[field.ValueJ]);
	if (IsIE()) {
	    $('.multi-valued-check-advanced').css("margin-left", '3px');
	}
  dialog.dialog("option", "title", field.FriendlyName);
  dialog.dialog("open");
}

function FP_CollectProperties() {
	var field = new Object();
  field.Description = document.getElementById('propDescription').value;
  var propTotal = document.getElementById('propTotal');
  if (propTotal.checked)
      field.Total = 1;
  else
      field.Total = 0;
  var propVG = document.getElementById('propVG');
  if (propVG.checked)
      field.VG = 1;
  else
      field.VG = 0;
  var propFormats = document.getElementById('propFormats');
  field.Format = propFormats.value;
  var propFilterOperators = document.getElementById('propFilterOperators');
  field.FilterOperator = propFilterOperators.value;
  var labelJ = document.getElementById('labelJ');
  var msvs = labelJ.getAttribute('msvs').split(',');
  var msv = labelJ.getAttribute('msv');
  var curInd = 0;
  for (var ind = 0; ind < msvs.length; ind++) {
      if (msvs[ind] == msv) {
          curInd = ind;
          break;
      }
  }
  field.LabelJ = curInd + 1;
  var valueJ = document.getElementById('valueJ');
  var msvs = valueJ.getAttribute('msvs').split(',');
  var msv = valueJ.getAttribute('msv');
  var curInd = 0;
  for (var ind = 0; ind < msvs.length; ind++) {
      if (msvs[ind] == msv) {
          curInd = ind;
          break;
      }
  }
  field.ValueJ = curInd;
  return field;
}

function FP_AppendDialogMarkup(parent, forInstantReports) {
	parent.innerHTML = FP_DialogMarkup(forInstantReports);
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

function FP_DialogMarkup(forInstantReports) {
	var preview = '';
	var previewChangeEvent = '';
	var previewKeyUpEvent = '';
	var previewMouseUpEvent = '';
	if (forInstantReports) {
		preview = '<td style="vertical-align:top"><div id="fieldSamplePreview" style="width:200px;"></div></td>';
		previewChangeEvent = ' onchange="PreviewFieldDelayed(1000);"';
		previewKeyUpEvent = ' onkeyup="PreviewFieldDelayed(1000);"';
		previewMouseUpEvent = ' onmouseup="PreviewFieldDelayed(1000);"';
	}
	var markup = '\
			<div id="data-source-field" title="Field name" lang-title="js_FieldName">\
			<div id="propertiesDiv" style="height: 340px;">\
				<table style="width:100%;">\
					<tr>\
						<td>\
							<div id="titleDiv" style="width:392px; text-align:left;text-transform:capitalize;color:#000000;background-color:#CCEEFF;padding:6px;"></div>\
							<table cellpadding="0" cellspacing="0">\
								<tr>\
									<td style="vertical-align:top">\
										<table cellpadding="0" cellspacing="0">\
											<tr><td style="padding-top:10px;" lang-text="js_Description">Description</td></tr>\
											<tr><td><input id="propDescription" type="text" value="" style="width:400px;margin:0px;"' + previewKeyUpEvent + ' /></td></tr>\
											<tr><td style="padding-top:10px;" lang-text="js_Format">Format</td></tr>\
											<tr><td><select id="propFormats" style="margin:0px;width:406px;"' + previewChangeEvent + ' ></select></td></tr>\
											<tr><td style="padding-top:10px;" lang-text="js_FilterOperator">Filter Operator</td></tr>\
											<tr><td><select id="propFilterOperators" style="margin:0px;width:406px;"' + previewChangeEvent + ' ></select></td></tr>\
										</table>\
									</td>\
									<td style="vertical-align:top; padding: 20px;">\
										<table>\
											<tr><td><input id="propTotal" type="checkbox"' + previewKeyUpEvent + previewMouseUpEvent + ' /><label style="cursor:pointer;" for="propTotal" lang-text="js_Total">Total</label></td></tr>\
											<tr><td><input id="propVG" type="checkbox"' + previewKeyUpEvent + previewMouseUpEvent + ' /><label style="cursor:pointer;" for="propVG" lang-text="js_VisualGroup">Visual Group</label></td></tr>\
											<tr>\
												<td>\
													<div style="width:100%;">\
														<div class="multi-valued-check-advanced"><label msv="L" msvs="L,M,R" id="labelJ" onclick="javascript:UpdateMSV(\'labelJ\', ' + forInstantReports + ');">L</label></div>\
														<label onclick="javscript:UpdateMSV(\'labelJ\', ' + forInstantReports + ');" style="cursor:pointer;" lang-text="js_LabelJustification">Label Justification</label>\
													</div>\
												</td>\
											</tr>\
											<tr>\
												<td>\
													<div style="width:100%;">\
													<div class="multi-valued-check-advanced"><label msv="&nbsp;" msvs="&nbsp;,L,M,R" id="valueJ" onclick="javascript:UpdateMSV(\'valueJ\', ' + forInstantReports + ');">&nbsp;</label></div>\
													<label onclick="javascript:UpdateMSV(\'valueJ\', ' + forInstantReports + ');" style="cursor:pointer;" lang-text="js_ValueJustification">Value Justification</label>\
													</div>\
												</td>\
											</tr>\
										</table>\
									</td>\
									' + preview + '\
								</tr>\
							</table>\
						</td>\
					</tr>\
				</table>\
			</div>\
		</div>';
	return markup;
}