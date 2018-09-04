//MODAL DIALOG
///--------------------------------------COMMON PART
var initComplete = false;

function SetHiddableControlsVisibility(isVisible) {
	jq$("div[name=showHideMeInIE6]")
		.css({
			position: isVisible ? '' : 'absolute',
			left: isVisible ? '' : '-5000px'
		});
}

function scrollFix() {
	jq$('#ol').css({
		top: (jq$(window).scrollTop() - 17) + 'px',
		left: (jq$(window).scrollLeft() - 17) + 'px'
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
</div></div>'.format({ factor: '100%', autoResize: autoResize + '' }));

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

	if (document.addEventListener)
		document.removeEventListener('load', modal_resized);
	else if (window.attachEvent)
		jq$("body").children("#ol")[0].detachEvent('onresize', modal_resized);

	jq$("#ol,#mbox").remove();

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
		$mbd.prepend('<div style="width: 100%; text-align: right;"><div onclick="hm();" style="cursor:pointer; padding:2px;background-color:#1C4E89; display: inline-block;"><span class="iz-ui-icon iz-ui-icon-light iz-ui-icon-closethick"></span></div></div>');

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
///--------------------------------------END COMMON PART


//common variables
window.UserDataObject = null;
window.CallBackFunctionName = null;
