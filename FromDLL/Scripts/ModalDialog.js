//MODAL DIALOG
///--------------------------------------COMMON PART
var initComplete = false;
var isNetscape = window.navigator.appName == 'Netscape' || window.navigator.appName == 'Opera';

function is_ie6() {
    return ((window.XMLHttpRequest == undefined) && (ActiveXObject != undefined));
}

function getElementsByName_iefix(tag, name) {
    var elem = document.getElementsByTagName(tag);
    var arr = new Array();
    for (i = 0, iarr = 0; i < elem.length; i++) {
        att = elem[i].getAttribute("name");
        if (att == name) {
            arr[iarr] = elem[i];
            iarr++;
        }
    }
    return arr;
}

function SetHiddableControlsVisibility(isVisible) {
    divs = getElementsByName_iefix('div', 'showHideMeInIE6');
    for (var i = 0; i < divs.length; i++) {
        if (isVisible) {
            divs[i].style.position = '';
            divs[i].style.left = '';
        }
        else {
            divs[i].style.position = 'absolute';
            divs[i].style.left = '-5000px';
        }
    }
}

function pageWidth() {
    return document.body != null ?
          document.body.offsetWidth : window.innerWidth != null ? window.innerWidth : document.documentElement
          && document.documentElement.offsetWidth ?
          document.documentElement.offsetWidth : null;
}

function pageHeight() {
    return document.body != null ? document.body.offsetHeight : window.innerHeight != null ? window.innerHeight : document.documentElement && document.documentElement.offsetHeight ?
          document.documentElement.offsetHeight : null;
}

function posLeft() {
    return typeof window.pageXOffset != 'undefined' ?
		window.pageXOffset : document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0;
}

function posTop() {
    return typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0;
}

function ElementById(x) {
    return document.getElementById(x);
}

function scrollFix() {
    var backDiv = ElementById('ol');
    backDiv.style.top = (posTop() - (isNetscape ? 17 : 20)) + 'px';
    backDiv.style.left = (posLeft() - (isNetscape ? 17 : 20)) + 'px';
}

function sizeFix() {
    var backDiv = ElementById('ol');
    backDiv.style.height = pageHeight() + 'px';
    backDiv.style.width = pageWidth() + 'px';
}

function kp(e) {
    ky = e ? e.which : event.keyCode;
    if (ky == 88 || ky == 120) hm();
    return false;
}

function inf(h) {
    return;
    tag = document.getElementsByTagName('select');
    for (i = tag.length - 1; i >= 0; i--)
        tag[i].style.visibility = h;
    tag = document.getElementsByTagName('iframe');
    for (i = tag.length - 1; i >= 0; i--)
        tag[i].style.visibility = h;
    tag = document.getElementsByTagName('object');
    for (i = tag.length - 1; i >= 0; i--)
        tag[i].style.visibility = h;
}

//Init Variables
function initmb(autoResize) {
    if ((initComplete) || (ElementById('mbox') != null))
        return;
    var ab = 'absolute';
    var n = 'none';
    var obody = document.getElementsByTagName('body')[0];
    var frag = document.createDocumentFragment();
    var backDiv = document.createElement('div');
    backDiv.setAttribute('id', 'ol');
    backDiv.style.display = n;
    backDiv.style.position = ab;
    backDiv.style.top = posTop() + 'px';
    backDiv.style.left = posLeft() + 'px';
    backDiv.style.zIndex = 998;
    if (isNetscape) {
        backDiv.style.width = '100%';
        backDiv.style.height = '100%';
    }
    else {
        backDiv.style.width = '50%';
        backDiv.style.height = '50%';
    }

    frag.appendChild(backDiv);

    var centralDiv = document.createElement('div');
    centralDiv.setAttribute('id', 'mbox');
    if (autoResize == false)
        centralDiv.setAttribute('autoResize', 'false');
    centralDiv.style.display = n;
    centralDiv.style.position = ab;
    centralDiv.style.zIndex = 999;

    if (document.addEventListener)
        document.addEventListener('load', modal_resized, true);
    else if (window.attachEvent) {
        centralDiv.attachEvent('onresize', modal_resized);
    }

    obl = document.createElement('span');
    centralDiv.appendChild(obl);
    var contentDiv = document.createElement('div');
    contentDiv.setAttribute('id', 'mbd');

    obl.appendChild(contentDiv);
    frag.insertBefore(centralDiv, backDiv.nextSibling);
    obody.appendChild(frag);
    window.onscroll = scrollFix;
    window.onresize = sizeFix;
}

//Hide Dialog 
function hm() {
    if (is_ie6()) {
        SetHiddableControlsVisibility(true);
    }
    var v = 'visible';
    var n = 'none';
    try {
        ElementById('ol').style.display = n;
        ElementById('mbox').style.display = n;
        inf(v);
        document.onkeypress = '';
    }
    catch (e) {
    }
}


var currentDialogObject;
var lastDialogObject;

function HideDialog(obj, removeChild) {
    if (removeChild == null)
        removeChild = true;

    currentDialogObject = null;

    var container = obj.popUpContainer;

    //var checkBoxesState = AdHoc.Utility.GetCheckboxesState(obj);

    if (removeChild)
        obj.parentNode.removeChild(obj);
    obj.style["display"] = "none";

    if (container != null)
        container.appendChild(obj);

    //AdHoc.Utility.SetCheckboxesState(obj, checkBoxesState);

    hm();
    if (lastDialogObject != null) {
        ShowDialog(document.getElementById(lastDialogObject));
        lastDialogObject = null;
    }
}

function modal_resized() {
    var centralDiv = ElementById('mbox');

    if (centralDiv.getAttribute('autoResize') == "false")
        return;

    var p = 'px';
    var tp = posTop() + ((pageHeight() - centralDiv.offsetHeight) / 2) + 12;
    var lt = posLeft() + ((pageWidth() - centralDiv.offsetWidth) / 2) - 12;
    centralDiv.style.top = (tp < 0 ? 0 : tp) + p;
    centralDiv.style.left = (lt < 0 ? 0 : lt) + p;
}

// obj - Html text with Dialog Window
// wd - Window width
// ht - Window heigth
function ShowDialog(obj, wd, ht, top, left, autoResize) {
	if (!initComplete)
		initmb(autoResize);

	if (is_ie6()) {
		SetHiddableControlsVisibility(false);
	}

	//find elements 
	var backDiv = ElementById('ol');
	var contentDiv = ElementById('mbd');
	var centralDiv = ElementById('mbox');

	var obody = document.getElementsByTagName('body')[0];
	obody.appendChild(backDiv);
	obody.appendChild(centralDiv);

	//place controls
	var h = 'hidden';
	var b = 'block';
	var p = 'px';
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

		contentDiv.innerHTML = "";

		var checkBoxesState = AdHoc.Utility.GetCheckboxesState(obj);

		if (obj.parentNode != null)
			obj.parentNode.removeChild(obj);
		inf(h);
		contentDiv.appendChild(obj);

		AdHoc.Utility.SetCheckboxesState(obj, checkBoxesState);
		contentDiv.style.width = obj.style.width;
		obj.style["display"] = "block";

	}
	else {
		inf(h);
		contentDiv.innerHTML = obj;
	}

	if (wd != null && wd != 0)
		contentDiv.style.width = wd;
	else
		contentDiv.style.width = "";

	//show all
	backDiv.style.display = b;
	centralDiv.style.display = b;

	//place back div
	backDiv.style.height = pageHeight() + p;
	backDiv.style.width = pageWidth() + p;
	backDiv.style.top = posTop() + p;
	backDiv.style.left = posLeft() + p;
	var tp, lt;

	var offsetHeightGlobal = pageHeight();
	var offsetWidthGlobal = pageWidth();
	if (window.innerHeight)
		offsetHeightGlobal = window.innerHeight;
	if (window.innerWidth)
		offsetWidthGlobal = window.innerWidth;

	if (top != null)
		tp = top;
	else
		tp = posTop() + ((offsetHeightGlobal - centralDiv.offsetHeight) / 2) + 12;
	if (left != null)
		lt = left;
	else
		lt = posLeft() + ((offsetWidthGlobal - centralDiv.offsetWidth) / 2) - 12;

	centralDiv.style.top = (tp < 0 ? 0 : tp) + p;
	centralDiv.style.left = (lt < 0 ? 0 : lt) + p;

	var backDiv = ElementById('ol');
	var centralDiv = ElementById('mbox');
	var obody = document.getElementsByTagName('body')[0];
	obody.appendChild(backDiv);
	obody.appendChild(centralDiv);

	return obj.style == null ? false : obj;
}

ShowLoading = function (rsUrl) {
    ShowDialog(jsResources.Loading + "...<br><div style=\"font-size:1px;height:10px;width:70px;background-Image:url("
	+ (rsUrl ? rsUrl : responseServerWithDelimeter) +
	"image=loading.gif);\">&nbsp;</div>");
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

    var genHtml = "<span>" + text + "</span><br>";
    genHtml += "<input type='button' value='" + jsResources.OK + "' onclick='modal_ok_hide()'>";
    ShowDialog(genHtml);
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

    var genHtml = "<span>" + text + "</span><br>";
    genHtml += "<input type='button' value='" + jsResources.OK + "' onclick='modal_confirm_hide(true)'>&nbsp;";
    genHtml += "<input type='button' value='" + jsResources.Cancel + "' onclick='modal_confirm_hide(false)'>";
    ShowDialog(genHtml);
}
//--------------------------------------END CONFIRM


///--------------------------------------PROMPT MODAL DIALOG
function modal_prompt_hide(res) {
    hm();
    var InputValue = document.getElementById('promt_input').value;
    if (isNetscape)
        document.removeEventListener('keydown', modal_promt_keydown, true);
    else
        document.detachEvent('onkeydown', modal_promt_keydown);

    if (CallBackFunctionName != null)
        window.CallBackFunctionName(window.UserDataObject, InputValue, res);
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

    if (defaultValue == null)
        defaultValue = "";

    var genHtml = "<span>" + text + "</span><br><input type='text' value='" + defaultValue + "' id='promt_input'><br>";
    genHtml += "<input class='iz-button' type='button' value='" + jsResources.OK + "' onclick='modal_prompt_hide(true)'>&nbsp;";
    genHtml += "<input class='iz-button' type='button' value='" + jsResources.Cancel + "' onclick='modal_prompt_hide(false)'>";
    if (isNetscape)
        document.addEventListener('keydown', modal_promt_keydown, true);
    else
        document.attachEvent('onkeydown', modal_promt_keydown);

    ShowDialog(genHtml);
    document.getElementById("promt_input").focus();
}

function modal_promt_keydown(evt) {
    var evt = (evt) ? evt : window.event;
    if (evt.keyCode == 10 || evt.keyCode == 13)
        modal_prompt_hide(true);
    if (evt.keyCode == 27)
        modal_prompt_hide(false);
}

function Modal_ShowPopupDiv(url) {
    if (url == '')
        return;
    var content = responseServer.RequestData(url, null, false);

    if (content != "") {
      ShowDialog("<div onclick='hm()' onmouseover = 'Modal_OnMouseOver(this, true)' onmouseout = 'Modal_OnMouseOver(this, false)' style ='border:lightgrey 0px solid; width:auto; height:auto'><div id=\"popupDiv\"></div></div>", 0, 0);
      ReportScripting.loadReportResponse(content, "#popupDiv");
      modal_resized();
      AdHoc.Utility.InitGaugeAnimations(null, null, true);
      jq$('.highcharts-container').click(function () {
        hm();
      });
    }
    else {
        ShowDialog("<iframe onclick='hm()' src='" + url + "'></iframe>", 1000, 800);
    }
}

function Modal_OnMouseOver(obj, over) {
    if (obj != null && obj.style != null) {
        if (over) {
            obj.style.border = 'lightgrey 0px solid';
        }
        else {
            obj.style.border = 'lightgrey 0px solid';
        }
    }
}

///--------------------------------------END PROMPT MODAL DIALOG


//common variables
window.UserDataObject = null;
window.CallBackFunctionName = null;
if (!initComplete)
    window.onload = initmb;