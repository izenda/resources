var RE_EditorScriptsLoaded = false;
var RE_EditorsParamsList = new Array();
var RE_ContentSections = null;

function RE_AjaxRequest(url, parameters, callbackSuccess, callbackError, id, dataToKeep) {
	var thisRequestObject;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
	thisRequestObject.requestId = id;
	thisRequestObject.dtk = dataToKeep;
	thisRequestObject.onreadystatechange = RE_ProcessRequest;
	thisRequestObject.open('POST', url, true);
	thisRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	thisRequestObject.send(parameters);

	function RE_ProcessRequest() {
		if (thisRequestObject.readyState == 4) {
			if (thisRequestObject.status == 200 && callbackSuccess) {
				callbackSuccess(thisRequestObject.responseText, thisRequestObject.requestId, thisRequestObject.dtk);
			}
			else if (callbackError) {
				callbackError(thisRequestObject);
			}
		}
	}
}

// Prevent jQuery UI dialog from blocking focusin
jq$(document).on('focusin', function (e) {
	if (jq$(e.target).closest(".mce-window, .moxman-window").length) {
		e.stopImmediatePropagation();
	}
});

function CreateTextareaPopup(baseId, width, height) {
	jq$('<div id="' + baseId + '_iz-richeditor-container"><textarea id="' + baseId + '__textarea"></textarea></div>').dialog({
		width: width,
		height: height + 80,
		minWidth: 600,
		minHeight: 300,
		modal: true,
		dialogClass: 'iz-richeditor-dialog',
		resize: function (event, ui) {
			jq$('#re_popup_win_01__textarea_ifr').css('height', (ui.size.height - 230) + 'px');
		},
		close: function (event, ui) {
			if (typeof tinymce != 'undefined' && tinymce != null && tinymce.editors != null && tinymce.editors.length > 0)
				RE_TerminateRichEditor(tinymce.editors[0]);
			else
				jq$(this).remove();
		}
	});
}

function DisposeTextareaPopup(baseId) {
	jq$('#' + baseId + '_iz-richeditor-container')
		.dialog('destroy')
		.remove();
}

function RE_TerminateRichEditor(editor) {
	RE_EditorsParamsList[editor.settings.selector] = null;
	editor.destroy();
	DisposeTextareaPopup('re_popup_win_01');
}

function RE_EditorContentSent(returnObj, id, editorParamsObj) {
	if (id != 'tinymceresource_setcontentdata')
		return;
	if (typeof editorParamsObj.ContentSaveRequestCallback != 'undefined' && editorParamsObj.ContentSaveRequestCallback != null)
		editorParamsObj.ContentSaveRequestCallback(returnObj);
	RE_TerminateRichEditor(tinymce.get(editorParamsObj.EditorId));
}

function RE_SaveRichEditorContent(editor, deleteForm) {
	var editorParamsObj = RE_EditorsParamsList[editor.settings.selector];
	var content = deleteForm ? '' : editor.getContent({ format: 'raw' });
	if (typeof editorParamsObj.ContentSaveCallback != 'undefined' && editorParamsObj.ContentSaveCallback != null)
		editorParamsObj.ContentSaveCallback(content);
	if (typeof editorParamsObj.ContentRequestMsg != 'undefined' && editorParamsObj.ContentRequestMsg != null && editorParamsObj.ContentRequestMsg != '') {
		var requestString = 'wscmd=tinymceresource&wsarg0=setcontentdata&wsarg1=' + encodeURIComponent(editorParamsObj.ContentRequestMsg) + '&wsarg2=' + encodeURIComponent(content);
		RE_AjaxRequest('./rs.aspx', requestString, RE_EditorContentSent, null, 'tinymceresource_setcontentdata', editorParamsObj);
	}
	else
		RE_TerminateRichEditor(editor);
}

function RE_RichEditorBeforeExecCommandEvent(e) {
	if (e.type != 'beforeexeccommand')
		return;
	var editor = e.target;
	if (e.command == 'mceCancel') {
		RE_TerminateRichEditor(editor);
	}
	else if (e.command == 'mceSave') {
		RE_SaveRichEditorContent(editor, false);
	}
	else
		return;
	e.preventDefault();
	e.stopImmediatePropagation();
	e.stopPropagation();
}

function RE_InitializeEditorInstance(editor) {
	var editorParamsObj = RE_EditorsParamsList[editor.settings.selector];
	editorParamsObj.EditorId = editor.id;
	editor.on('BeforeExecCommand', RE_RichEditorBeforeExecCommandEvent);
	if (typeof editorParamsObj.ContentData == 'undefined' || editorParamsObj.ContentData == null)
		editorParamsObj.ContentData = '';
	editor.setContent(editorParamsObj.ContentData);
	tinymce.DOM.setStyle(tinymce.DOM.get(editorParamsObj.EditorId + '_ifr'), 'width', editorParamsObj.Width + 'px');
	tinymce.DOM.setStyle(tinymce.DOM.get(editorParamsObj.EditorId + '_ifr'), 'height', editorParamsObj.Height + 'px');
}

function RE_InstantiateRichEditor(paramsObj) {
	var editorIdMissing = false;
	if (typeof RE_EditorsParamsList[paramsObj.TargetSelector] == 'undefined' || RE_EditorsParamsList[paramsObj.TargetSelector] == null)
		editorIdMissing = true;
	else if (typeof RE_EditorsParamsList[paramsObj.TargetSelector].EditorId == 'undefined' || RE_EditorsParamsList[paramsObj.TargetSelector].EditorId == null || RE_EditorsParamsList[paramsObj.TargetSelector].EditorId == '')
		editorIdMissing = true;
	var editor = null;
	if (!editorIdMissing)
		editor = tinymce.get(RE_EditorsParamsList[paramsObj.TargetSelector].EditorId);
	if (editor == null) {
		RE_EditorsParamsList[paramsObj.TargetSelector] = paramsObj;
		var lang = '';
		if (typeof serverCulture != 'undefined' && serverCulture != null && serverCulture != '' && serverCulture != 'en-US')
			lang = './rs.aspx?wscmd=tinymceresource&wsarg0=langjs&wsarg1=' + serverCulture;
		tinymce.init({
			forced_root_block: false,
			force_p_newlines: false,
			selector: paramsObj.TargetSelector,
			height: paramsObj.Height,
			mode: "exact",
			plugins: "advlist anchor autolink charmap codemagic colorpicker contextmenu directionality fullscreen hr image insertdatetime layer legacyoutput link lists nonbreaking noneditable pagebreak paste preview save searchreplace tabfocus table template textcolor textpattern visualchars wordcount repeater jqueryspellchecker",
			toolbar: "save cancel delete insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media | forecolor backcolor | codemagic | jqueryspellchecker | iz-fields iz-columns iz-subreports iz-tags | repeater-default repeater-adv",
			skin_url: './rs.aspx?wscmd=tinymceresource&wsarg0=skincss&wsarg1=',
			language_url : lang,
			resize: false,
			init_instance_callback: RE_InitializeEditorInstance,
			setup: function(editor) {
				editor.on('BeforeSetContent', function(e) {
					if (e.content.length > 0) {
						RE_ContentSections = AdHoc.Utility.ExtractSpecialFormSections(e.content);
						e.content = RE_ContentSections.htmlSource;
					}
					else
						e.content = e.content;
				});
				editor.on('SaveContent', function(e) {
					e.content = e.content;
				});
				editor.on('SetContent', function(e) {
					if (RE_ContentSections !== null && e.wasProcessed)
						e.content = RE_ContentSections.formScriptSection + RE_ContentSections.visualizationSection + e.content;
					else
						e.content = e.content;
				});
				RE_InitToolbarItems(editor);
			},
			extended_valid_elements: "repeater[id],repeaterstart,repeaterend",
			custom_elements: "~repeater,repeaterstart,repeaterend"
		});
	}
	else {
		var editorParamsObj = RE_EditorsParamsList[paramsObj.TargetSelector];
		editorParamsObj.ContentData = paramsObj.ContentData;
		editorParamsObj.ContentRequestMsg = paramsObj.ContentRequestMsg;
		editorParamsObj.Height = paramsObj.Height;
		editorParamsObj.ContentSaveCallback = paramsObj.ContentSaveCallback;
		editorParamsObj.ContentSaveRequestCallback = paramsObj.ContentSaveRequestCallback;
		RE_InitializeEditorInstance(editor);
	}
}

function RE_InitToolbarItems(editor) {
	if (editor == null || editor.type != "setupeditor")
		return;

	// Fields descriptions
	var fieldsItems = [];
	try {
		var fields = SC_GetFieldsList(fieldsId);
		if (fields != null)
			for (var i = 0; i < fields.length; i++)
				fieldsItems.push({ text: fields[i].description, onclick: function () { editor.insertContent('[' + this._text + ']'); } });
	} catch (e) { }

	editor.addButton('iz-fields', {
		type: 'splitbutton',
		text: fdtField,
		icon: false,
		onclick : function() {
			editor.insertContent('[]');
		},
		menu: fieldsItems
	});

	editor.addButton('delete', {
	  type: 'button',
	  text: fdtDelete,
	  icon: false,
	  onclick: function () { RE_SaveRichEditorContent(editor, true); }
	});

	// Columns
	var columnItems = [];
	try {
		var tempSelect = jq$(jq$('#' + fieldsId + ' select[name$="Column"]')[0]);
		var currentGroup = "";
		tempSelect.find('option').each(function (idx, e) {
			if (e.text != null && e.text != '' && e.text != '...') {
				if (currentGroup != e.getAttribute('optgroup')) {
					columnItems.push({ text: e.getAttribute('optgroup'), disabled: true });
					currentGroup = e.getAttribute('optgroup');
				}
				columnItems.push({ text: e.text, onclick: function () { editor.insertContent('[' + this._text + ']'); } });
			}
		});
	} catch (e) { }

	editor.addButton('iz-columns', {
		type: 'splitbutton',
		text: fdtColumn,
		icon: false,
		onclick: function () {
			editor.insertContent('[]');
		},
		menu: columnItems
	});

	// Subreports
	var subreportsItems = []
	try {
		var tempSelect = jq$(jq$('#' + fieldsId + ' select[name$="Subreport"]')[0]);
		tempSelect.find('option').each(function (idx, e) {
			if (e.text != null && e.text != '' && e.text != '...' && e.value != null && e.value != "(AUTO)")
				subreportsItems.push({ text: e.text, onclick: function () { editor.insertContent('[[' + this._text + ']]'); } });
		});
	} catch (e) { }

	editor.addButton('iz-subreports', {
		type: 'splitbutton',
		text: fdtSubreport,
		icon: false,
		onclick: function () {
			editor.insertContent('[[]]');
		},
		menu: subreportsItems
	});

	// Smart tags
	editor.addButton('iz-tags', {
		type: 'splitbutton',
		text: fdtSmartTag,
		icon: false,
		menu: [
			{ text: fdtFilters, onclick: function () { editor.insertContent('[Filters]'); } },
			{ text: fdtDate, onclick: function () { editor.insertContent('[Date]'); } },
			{ text: fdtSubtotal, onclick: function () { editor.insertContent('[@Subtotal]'); } },
			{ text: fdtRepeater, onclick: function () { editor.insertContent('[Repeater][/Repeater]'); } }
		]
	});
}

function RE_AcceptEditorContent(returnObj, id, paramsObj) {
	if (id != 'tinymceresource_getcontentdata' || returnObj == undefined || returnObj == null)
		return;
	paramsObj.ContentData = returnObj;
	RE_InstantiateRichEditor(paramsObj);
}

function RE_PrepareEditorContent(paramsObj) {
	if (typeof paramsObj.ContentRequestMsg == 'undefined' || paramsObj.ContentRequestMsg == null || paramsObj.ContentRequestMsg == '')
		RE_InstantiateRichEditor(paramsObj);
	else {
		var requestString = 'wscmd=tinymceresource&wsarg0=getcontentdata&wsarg1=' + encodeURIComponent(paramsObj.ContentRequestMsg);
		RE_AjaxRequest('./rs.aspx', requestString, RE_AcceptEditorContent, null, 'tinymceresource_getcontentdata', paramsObj);
	}
}

function RE_InjectEditorScripts(returnObj, id, paramsObj) {
	if (id != 'tinymceresource_editorcorejs' || returnObj == undefined || returnObj == null)
		return;
	(window.execScript || function (text) { window.eval.call(window, text); })(returnObj);
	RE_EditorScriptsLoaded = true;
	RE_PrepareEditorContent(paramsObj);
}

function RE_ShowRichEditor(targetSelector, width, height, contentData, contentRequestMsg, contentSaveCallback, contentSaveRequestCallback) {
	if (typeof targetSelector == 'undefined' || targetSelector == null || targetSelector == '')
		throw 'Control selector expected';
	var paramsObj = new Object();
	paramsObj.TargetSelector = targetSelector;
	paramsObj.ContentData = contentData;
	paramsObj.ContentRequestMsg = contentRequestMsg;
	paramsObj.Height = height;
	paramsObj.ContentSaveCallback = contentSaveCallback;
	paramsObj.ContentSaveRequestCallback = contentSaveRequestCallback;
	if (!RE_EditorScriptsLoaded) {
	  var requestString = 'wscmd=tinymceresource&wsarg0=editorcorejs&wsarg1=advlist,anchor,autolink,charmap,codemagic,colorpicker,contextmenu,directionality,fullscreen,hr,image,importcss,insertdatetime,layer,legacyoutput,link,lists,nonbreaking,noneditable,pagebreak,paste,preview,save,searchreplace,jqueryspellchecker,tabfocus,table,template,textcolor,textpattern,visualchars,wordcount,repeater';
	    RE_AjaxRequest('./rs.aspx', requestString, RE_InjectEditorScripts, null, 'tinymceresource_editorcorejs', paramsObj);
	}
	else
		RE_PrepareEditorContent(paramsObj);
}

function RE_PopupRichEdit_ClientData(width, height, contentData, contentSaveCallback) {
	CreateTextareaPopup('re_popup_win_01', width + 2, height + 141);
	RE_ShowRichEditor('textarea#re_popup_win_01__textarea', width, height, contentData, null, contentSaveCallback, null);
}

function RE_PopupRichEdit_ServerData(width, height, contentRequestMsg, contentSaveRequestCallback) {
	CreateTextareaPopup('re_popup_win_01', width + 2, height + 141);
	RE_ShowRichEditor('textarea#re_popup_win_01__textarea', width, height, null, contentRequestMsg, null, contentSaveRequestCallback);
}