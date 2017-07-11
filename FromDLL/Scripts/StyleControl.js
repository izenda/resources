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


var isNetscape = window.navigator.appName == 'Netscape';
var STC_Table;
var borderColorListId, headerColorListId, headerForegroundColorListId, itemColorListId, itemForegroundColorListId, alternatingItemColorListId;

function STC_ColorItemMouseOver(obj)
{
	if(obj.options.length<2)
	{
		var idElems = obj.id.split("_");
		var path = idElems[idElems.length-1];
		EBC_LoadData(path, null, obj);
	}
}
function SavedRule(filter,cssText)
{
	this.filter = filter;
	this.cssText = cssText;
}
function STC_ColorItemChanged() {
	borderColorList = document.getElementById(borderColorListId);
	headerColorList = document.getElementById(headerColorListId);
	headerForegroundColorList = document.getElementById(headerForegroundColorListId);
	itemColorList = document.getElementById(itemColorListId);
	itemForegroundColorList = document.getElementById(itemForegroundColorListId);
	alternatingItemColorList = document.getElementById(alternatingItemColorListId);
	var asCnt = 0;
	var style = document.getElementById('additionalStyle');
	while (style != null) {
		var borderColorListValue = TrimDefault(borderColorList.value);
		var headerColorListValue = TrimDefault(headerColorList.value);
		var headerForegroundColorListValue = TrimDefault(headerForegroundColorList.value);
		var itemColorListValue = TrimDefault(itemColorList.value);
		var itemForegroundColorListValue = TrimDefault(itemForegroundColorList.value);
		var alternatingItemColorListValue = TrimDefault(alternatingItemColorList.value);

		var rules = isNetscape ? style.sheet.cssRules : style.styleSheet.rules;

		for (var i = 0; i < rules.length; i++) {
			if (rules[i].selectorText.toLowerCase().indexOf('reportstyle') == -1) {
				if (rules[i].selectorText.toLowerCase().indexOf('reportitem') != -1) {
					rules[i].style.color = itemForegroundColorListValue;
					rules[i].style.backgroundColor = itemColorListValue;
				}
				else if (rules[i].selectorText.toLowerCase().indexOf('alternatingitem') != -1) {
					rules[i].style.color = itemForegroundColorListValue;
					rules[i].style.backgroundColor = alternatingItemColorListValue;
				}
				else if (rules[i].selectorText.toLowerCase().indexOf('reportfooter') != -1) {
					rules[i].style.color = itemForegroundColorListValue;
					rules[i].style.backgroundColor = itemColorListValue;
				}
				else if (rules[i].selectorText.toLowerCase().indexOf('reportheader') != -1) {
					rules[i].style.color = headerForegroundColorListValue;
					rules[i].style.backgroundColor = headerColorListValue;
				}
				else if (rules[i].selectorText.toLowerCase().indexOf('reporttable') != -1)
					rules[i].style.borderColor = borderColorListValue;
			}
		}

		asCnt += 1;
		style = document.getElementById('additionalStyle_' + asCnt);
	}
	jq$(STC_Table).hide().show(0);
}

function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function rgbToHex (r, g, b)
{ 
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    if (r.length == 1) r = '0' + r;
    if (g.length == 1) g = '0' + g;
    if (b.length == 1) b = '0' + b;
    return r + g + b;
}

function STC_SetDefault()
{
	STC_InternalSetDefault(borderColorListId);
	STC_InternalSetDefault(headerColorListId);
	STC_InternalSetDefault(headerForegroundColorListId);
	STC_InternalSetDefault(itemColorListId);
	STC_InternalSetDefault(itemForegroundColorListId);
	STC_InternalSetDefault(alternatingItemColorListId);
	STC_ColorItemChanged();
}

function STC_InternalSetDefault(selId)
{
	var sel = document.getElementById(selId);
	if(sel==null || sel.options==null)
		return;
	if(sel.options.length<2)
	{
		var text = sel.getAttribute("DefaultText");
		var value = sel.getAttribute("DefaultValue");
		sel.options[0].text = text;
		sel.options[0].value = value;
	}
	else
	{
		for(var i=0;i<sel.options.length;i++)
		{
		    if (sel.options[i].getAttribute("default") == "true" || sel.options[i].getAttribute("default") == "default")
			{
				sel.selectedIndex = i;
				break;
			}
		}
	}
}

function TrimDefault(str)
{
	if(str.substr(0, 7) == "Default")
		return str.substr(7, str.length - 7);
	else
		return str;
}

function STC_Init(id, b, h, hf, i, ifc, ai, tableId)
{
	EBC_RegisterControl(id);
	
	borderColorListId = b;
	headerColorListId = h;
	headerForegroundColorListId = hf;
	itemColorListId = i;
	itemForegroundColorListId = ifc;
	alternatingItemColorListId = ai;
	
	borderColorList = document.getElementById(borderColorListId);
	headerColorList = document.getElementById(headerColorListId);
	headerForegroundColorList = document.getElementById(headerForegroundColorListId);
	itemColorList = document.getElementById(itemColorListId);
	itemForegroundColorList = document.getElementById(itemForegroundColorListId);
	alternatingItemColorList = document.getElementById(alternatingItemColorListId);
	STC_Table = document.getElementById(tableId);
}

function STC_ChangeVisualGroupStyle(select) {
	if (select.value == "AnalysisGrid" || select.value == "VGHierarchy")
		jq$('input[name$="ItemsPerPage"]').prop('disabled', true);
	else
		jq$('input[name$="ItemsPerPage"]').removeAttr('disabled');
}