var RP_Base64 = {
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	encode: function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = RP_Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},

	_utf8_encode: function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	}
}

var PartsScriptsInitialized = false;

/* Report Part name is case sensitive */
function CapitaliseString(string) {
	if (string == null)
		return '';
	string = string.toLowerCase();
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function GerReportPartUrl(rn, part, first, embedScripts, rsp, params) {
	var url = resposeServerUrl + '?wscmd=renderedreportpart&wsarg0=' + rn + '&wsarg1=' + part;
	url += '&wsarg2=' + (first ? '' : 'alonenext');
	url += '&wsarg3=' + (embedScripts ? 'embedScriptsForHtmlPart' : '');
	url += '&wsarg4=' + encodeURIComponent(RP_Base64.encode(rsp));
	if (params != null)
		url += '&' + params;
	return url;
}

function LoadReportPart(div, first, params) {
	jq$(div).text('Loading...');
	var rn = jq$(div).data('report');
	var part = CapitaliseString(jq$(div).data('part'));
	var embedScriptsObj = jq$(div).data('embedscripts');
	var embedScripts = false;
	if (typeof embedScriptsObj != 'undefined' && embedScriptsObj != null && embedScriptsObj.toString().toLowerCase() == 'true')
		embedScripts = true;
	var rspObj = jq$(div).data('responseserverpath');
	var rsp = '';
	if (typeof rspObj != 'undefined' && rspObj != null && rspObj.toString() != '')
		rsp = rspObj.toString();
	var filters = '';
	jq$.each(jq$(div).data(), function (key, data) {
		if (key.indexOf('filter') == 0) {
			var num = key.replace(/filter/, '');
			if (filters != '')
				filters += '&';
			filters += 'p' + num + 'value=' + data;
		}
	});

	if (filters) {
		if (params == undefined)
			params = '';
		else
			params += '&';
		params += filters;
	}
	jQ.ajaxSetup({ cache: true });
	jq$.ajax({
		url: GerReportPartUrl(rn, part, first, embedScripts, rsp, params)
	}).done(function (html) {
		if (first) {
			var headIdx = html.indexOf('</head>');
			if (headIdx > 0)
				html = html.slice(0, headIdx) + '<script type="text/javascript">PartsScriptsInitialized = true;</script>' + html.slice(headIdx);
		}
		UpdateReportPartContainer(div, html, first);
	});
}

function UpdateReportPartContainer(div, html, first) {
	if (first || (typeof(PartsScriptsInitialized) != 'undefined' && PartsScriptsInitialized))
		jq$(div).html(html);
	else
		setTimeout(function () { { UpdateReportPartContainer(div, html); } }, 500);
}

function InitializeReportParts() {
	if (typeof (resposeServerUrl) == 'undefined')
		return;
	var reportParts = jq$('.report-part');
	reportParts.each(function (idx) {
		LoadReportPart(this, idx == 0);
	});
}

jq$(window).load(function () {
	InitializeReportParts();
});

/* Report Viewer override */
function GetRenderedReportSet(invalidateInCache, additionalParams, caller) {
	var reportPart = jq$(caller).closest('.report-part');
	if (reportPart != null)
		LoadReportPart(reportPart, false, additionalParams);
}