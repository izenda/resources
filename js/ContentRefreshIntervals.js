(function(){
	var SECONDS_TO_MILLISECONDS_MULTIPLIER = 1000;

	var refreshInterval = null;

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
		AjaxRequest('./rs.aspx', requestString, createDropDownControl, null, 'autorefreshintervals', requestString);
	});
})();