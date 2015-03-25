(function(){
	var SECONDS_TO_MILLISECONDS_MULTIPLIER = 1000;

	var refreshInterval = null;

	function ajaxRequest(url, parameters, callbackSuccess, callbackError, id) {
		var thisRequestObject = null;
		if (window.XMLHttpRequest)
			thisRequestObject = new XMLHttpRequest();
		else if (window.ActiveXObject)
			thisRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
		else
			return;

		thisRequestObject.requestId = id;
		thisRequestObject.onreadystatechange = processRequest;

		thisRequestObject.open('GET', url + '?' + parameters, true);
		thisRequestObject.send();

		function deserializeJson() {
			var responseText = thisRequestObject.responseText;
			while (responseText.indexOf('"\\/Date(') >= 0) {
				responseText = responseText.replace('"\\/Date(', 'eval(new Date(');
				responseText = responseText.replace(')\\/"', '))');
			}
			if (responseText.charAt(0) != '[' && responseText.charAt(0) != '{')
				responseText = '{' + responseText + '}';
			var isArray = true;
			if (responseText.charAt(0) != '[') {
				responseText = '[' + responseText + ']';
				isArray = false;
			}
			var retObj = eval(responseText);
			if (!isArray)
				return retObj[0];
			return retObj;
		}

		function processRequest() {
			if (thisRequestObject.readyState == 4) {
				if (thisRequestObject.status == 200 && callbackSuccess) {
					callbackSuccess(deserializeJson(), thisRequestObject.requestId, parameters);
				}
				else if (callbackError) {
					callbackError(thisRequestObject);
				}
			}
		}
	}

	function createDropDownControl(data) {
		if (typeof data === "object" && !jq$.isEmptyObject(data)) {
			var refreshToolbar = jq$("#refreshToolbar");
			refreshToolbar.css({
				"position": "relative",
				"float": "left",
				"z-index": 6,
				"margin": "12px 0 0 8px",
				"white-space": "nowrap"
			});

			refreshToolbar.append(jq$("<label></label>").css({ "font-size": "13px", "margin-right": "6px" }).text("Refresh Every:"));

			var selectElement = jq$("<select></select>").attr("id", "refreshReportIntervals").css({
				"font-size": "13px",
				"width": "120px"
			});

			jq$.each(data, function (key, value) {
				selectElement.append(jq$("<option></option>").attr("value", value).text(key));
			});

			refreshToolbar.append(selectElement);

			refreshToolbar.bind('change', refresh);
			refresh();
		}
	}

	function validate(timeout) {
		return timeout >= 1;
	}

	function refresh() {
		var timeout = parseInt(jq$('#refreshReportIntervals').find(":selected").val());
		clearInterval(refreshInterval);
		if (validate(timeout)) {
			timeout *= SECONDS_TO_MILLISECONDS_MULTIPLIER;
			refreshInterval = setInterval(function () {
				if (typeof (GetRenderedReportSet) == "function")
					GetRenderedReportSet();
				if (jq$('a[title="Refresh"]')) {
					jq$('a[title="Refresh"]').click();
				}
			}, timeout);
		}
	}

	jq$(document).ready(function () {
		var requestString = 'wscmd=autorefreshintervals';
		ajaxRequest('./rs.aspx', requestString, createDropDownControl, null, 'autorefreshintervals');
	});
})();