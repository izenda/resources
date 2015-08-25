//MODAL DIALOG
///--------------------------------------COMMON PART
var initComplete = false;
var isNetscape = window.navigator.appName == 'Netscape' || window.navigator.appName == 'Opera';

function SetHiddableControlsVisibility(isVisible) {
	jq$("div[name=showHideMeInIE6]")
		.css({
			position: isVisible ? '' : 'absolute',
			left: isVisible ? '' : '-5000px'
		});
}

function scrollFix() {
	jq$('#ol').css({
		top: (jq$(window).scrollTop() - (isNetscape ? 17 : 20)) + 'px',
		left: (jq$(window).scrollLeft() - (isNetscape ? 17 : 20)) + 'px'
	});
}
function sizeFix() {
	jq$('#ol').css({
		height: jq$(window).height() + 'px',
		width: jq$(window).width() + 'px'
	});
}
function positionFix(top, left) {
	var offHeight = window.innerHeight ? window.innerHeight : jq$(window).height();
	var offWidth = window.innerWidth ? window.innerWidth : jq$(window).width();

	var $mbox = jq$('#mbox');
	$mbox.css({
		top: Math.max(0, top != null ? top : jq$(window).scrollTop() + ((offHeight - $mbox.outerHeight()) / 2) + 12) + 'px',
		left: Math.max(0, left != null ? left : jq$(window).scrollLeft() + ((offWidth - $mbox.outerWidth()) / 2) - 12) + 'px'
	});
}

//Init Variables
function initmb(autoResize) {
	if (initComplete || jq$('#mbox').length > 0)
		return;

	var wrap = jq$('<div id="wrap"><div id="ol" style="display: none; position: absolute; top: 0px; left: 0px; z-index: 998; width: {factor}; height: {factor};"></div>\
<div id="mbox" style="display: none; position: absolute; z-index: 999;" autoResize="{autoResize}">\
	<span><div id="mbd"></div></span>\
</div></div>'.format({ factor: isNetscape ? '100%' : '50%', autoResize: autoResize + '' }));

	if (document.addEventListener)
		document.addEventListener('load', modal_resized, true);
	else if (window.attachEvent)
		wrap.children("#ol")[0].attachEvent('onresize', modal_resized);

	jq$("body").append(wrap.children());
	window.onscroll = scrollFix;
	window.onresize = sizeFix;
}
function finmb() {
	initComplete = false;

	jq$("#ol,#mbox").remove();

	if (document.addEventListener)
		document.removeEventListener('load', modal_resized);
	else if (window.attachEvent)
		wrap.children("#ol")[0].detachEvent('onresize', modal_resized);

	window.onscroll = scrollFix;
	window.onresize = sizeFix;
}

//Hide Dialog 
function hm() {
	if (utility.ie() == 6)
		SetHiddableControlsVisibility(true);

	jq$("#ol,#mbox").css({ "display": "none" });
	finmb();
}

var currentDialogObject;
var lastDialogObject;

function HideDialog(obj, removeChild) { // todo
	if (removeChild == null)
		removeChild = true;

	currentDialogObject = null;

	var container = obj.popUpContainer;

	if (obj.parentNode != null && removeChild)
		obj.parentNode.removeChild(obj);
	obj.style["display"] = "none";

	if (container != null)
		container.appendChild(obj);

	hm();
	if (lastDialogObject != null) {
		ShowDialog(document.getElementById(lastDialogObject));
		lastDialogObject = null;
	}
}

function modal_resized() {
	var $mbox = jq$('#mbox');
	if ($mbox.length < 1 || $mbox.attr('autoResize') == "false")
		return;

	positionFix();
}

// obj - Html text with Dialog Window
// wd - Window width
// ht - Window heigth
function ShowDialog(obj, wd, ht, top, left, autoResize, showClose, extraClass) {
	if (!initComplete)
		initmb(autoResize);

	if (utility.ie() == 6)
		SetHiddableControlsVisibility(false);

	//find elements 
	var $mbd = jq$('#mbd'),
		$obj = jq$(obj);

	//fill content div
	if (obj.style != null) {
		if (currentDialogObject != null && currentDialogObject != '') {
			var cd = currentDialogObject;
			lastDialogObject = null;
			HideDialog(document.getElementById(currentDialogObject));
			lastDialogObject = cd;
		}
		currentDialogObject = obj.id;

		obj.popUpContainer = obj.parentNode;

		$mbd.empty();

		var checkBoxesState = AdHoc.Utility.GetCheckboxesState(obj);
		$obj.appendTo($mbd);
		AdHoc.Utility.SetCheckboxesState(obj, checkBoxesState);

		$mbd.css({ width: obj.style.width });
		$obj.css({display: "block"});
	}
	else {
		$mbd.html(obj);
	}

	if (showClose)
		$mbd.prepend('<div style="width: 100%; text-align: right;"><a href="#" onclick="hm();" style="padding:2px;background-color:#1C4E89; display: inline-block;" role="button"><span class="iz-ui-icon iz-ui-icon-light iz-ui-icon-closethick"></span></a></div>');

	$mbd.width((wd != null && wd != 0) ? wd : "");

	jq$('#ol').css({
		display: 'block',
		height: jq$(window).height() + 'px',
		width: jq$(window).width() + 'px',
		top: jq$(window).scrollTop() + 'px',
		left: jq$(window).scrollLeft() + 'px'
	});

	jq$('#mbox').addClass(extraClass)
		.css({ display: 'block' });

	positionFix(top, left);

	return obj.style == null ? false : obj;
}

ShowLoading = function(rsUrl) {
	ShowDialog("{notification}...<br><div style=\"font-size:1px;height:10px;width:70px;background-Image:url({rs}image=loading.gif);\">&nbsp;</div>".format({
		notification: jsResources.Loading,
		rs: rsUrl ? rsUrl : responseServerWithDelimeter
	}));
}
///--------------------------------------END COMMON PART


//--------------------------------------OK
function modal_ok_hide() {
	hm();
	if (CallBackFunctionName != null)
		window.CallBackFunctionName(window.UserDataObject);
}

// Call back function must have arguments like myFunction(UserData,Value,IsOk)
// text - Label Text
// UserDataObject - User Data to pass callBackFunction
// CallBackFunctionName - function name to call then Dialog Closes
function modal_ok(text, UserDataObject, CallBackFunctionName) {
	if (UseDefaultDialogs) {
		alert(text);
		if (CallBackFunctionName != null)
			CallBackFunctionName(UserDataObject);
		return;
	}
	window.UserDataObject = UserDataObject;
	window.CallBackFunctionName = CallBackFunctionName;

	ShowDialog("<span>{text}</span><br>\
		<input type='button' value='{ok}' onclick='modal_ok_hide()'>"
		.format({ text: text, ok: jsResources.OK })
	);
}
//--------------------------------------END CONFIRM


//--------------------------------------CONFIRM MODAL DIALOG
function modal_confirm_hide(res) {
	hm();
	window.CallBackFunctionName(window.UserDataObject, res);
}

// Call back function must have arguments like myFunction(UserData,IsOk)
// text - Label Text
// UserDataObject - User Data to pass callBackFunction
// CallBackFunctionName - function name to call then Dialog Closes
function modal_confirm(text, UserDataObject, CallBackFunctionName) {
	window.UserDataObject = UserDataObject;
	window.CallBackFunctionName = CallBackFunctionName;

	if (UseDefaultDialogs) {
		if (CallBackFunctionName != null)
			CallBackFunctionName(UserDataObject, confirm(text));
		return;
	}

	ShowDialog("<span>{text}</span><br>\
		<input type='button' value='{ok}' onclick='modal_confirm_hide(true)'>&nbsp;\
		<input type='button' value='{cancel}' onclick='modal_confirm_hide(false)'>"
		.format({ text: text, ok: jsResources.OK, cancel: jsResources.Cancel })
	);
}
//--------------------------------------END CONFIRM


///--------------------------------------PROMPT MODAL DIALOG
function modal_prompt_hide(res) {
	var value = jq$('#promt_input').val();
	hm();
	jq$(document).unbind('keydown.modal_prompt');

	if (CallBackFunctionName != null)
		window.CallBackFunctionName(window.UserDataObject, value, res);
}


// Call back function must have arguments like myFunction(UserData,Value,IsOk)
// text - Label Text
// UserDataObject - User Data to pass callBackFunction
// CallBackFunctionName - function name to call then Dialog Closes
function modal_prompt(text, UserDataObject, CallBackFunctionName, ForceDefaultDialog, defaultValue) {
	if (UseDefaultDialogs || ForceDefaultDialog) {
		var result = prompt(text, defaultValue);

		CallBackFunctionName(UserDataObject, result, result != null);
		return;
	}
	window.UserDataObject = UserDataObject;
	window.CallBackFunctionName = CallBackFunctionName;

	jq$(document).bind('keydown.modal_prompt', modal_promt_keydown);

	if (defaultValue == null)
		defaultValue = "";

	ShowDialog("<span>{text}</span><br><input type='text' value='{value}' id='promt_input'><br>\
		<input class='iz-button' type='button' value='{ok}' onclick='modal_prompt_hide(true)'>&nbsp;\
		<input class='iz-button' type='button' value='{cancel}' onclick='modal_prompt_hide(false)'>"
		.format({ text: text, value: defaultValue, ok: jsResources.OK, cancel: jsResources.Cancel })
	);
	jq$('#promt_input').focus();
}

function modal_promt_keydown(e) {
	e = e ? e : window.event;
	if (e.which == 10 || e.which == 13)
		modal_prompt_hide(true);
	if (e.which == 27)
		modal_prompt_hide(false);
}

function Modal_ShowPopupDiv(url) {
	if (url == '')
		return;
	var content = responseServer.RequestData(url, null, false);

	if (content != "") {
		ShowDialog("<div onmouseover = 'Modal_OnMouseOver(this, true)' onmouseout = 'Modal_OnMouseOver(this, false)' style ='border:lightgrey 0px solid; width:auto; height:auto'><div id=\"popupDiv\"></div></div>", 0, 0, null, null, null, true);
		ReportScripting.loadReportResponse(content, "#popupDiv");
		modal_resized();
		AdHoc.Utility.InitGaugeAnimations(null, null, true);
		jq$('.highcharts-container').click(function() {
			hm();
		});
	}
	else {
		ShowDialog("<iframe src='" + url + "'></iframe>", 1000, 800, null, null, null, true);
	}
}

function Modal_OnMouseOver(obj, over) {
	jq$(obj).css({ border: over ? 'lightgrey 0px solid' : 'black 0px solid' });
}

///--------------------------------------END PROMPT MODAL DIALOG


//common variables
window.UserDataObject = null;
window.CallBackFunctionName = null;
