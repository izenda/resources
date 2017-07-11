/**
 * Few notes:
 * 1. jq$ object is required.
 * 2. jquery.purl.js jquery plugin is required.
 * 3. AdHocQuery is required
 */

// default configuration object
UrlSettingsPaths = {
	urlBase: '/',
	urlRsPage: '',
	urlRpPage: '',
	urlDashboardDesigner: '',
	urlDashboardViewer: '',
	urlInstantReport: '',
	urlSettings: '',
	urlReportDesigner: '',
	urlReportList: '',
	urlReportViewer: '',
	urlResources: ''
};

// load url configuration from server synchronously (static url settings which doesn't change during page lifecycle)
(function () {
	var getPath = function (base, location) {
		// do not change url if it starts with "xxxx://", otherwise add base url
		return (location && location.match(/^\w+\:\/\//i))
			? location
			: base + '/' + (location ? location : '');
	};
	var getPathname = function (url) {
		var l = document.createElement("a");
		l.href = url;
		return l.pathname;
	};

	if (typeof (blockNetworkActivity) == 'undefined' || !blockNetworkActivity) {
		var urlBase = (typeof resposeServerUrl === 'undefined' ? window.location.pathname : getPathname(resposeServerUrl)).replace(/\/[^\/]+$/g, '');
		if (urlBase === '/')
			urlBase = '';
		var baseUrlFromServer = urlBase + '/rs.aspx';

		// request to response server: we need to get config synchronously before continue
		var url = baseUrlFromServer + '?wscmd=reportviewerconfig';
		url = appendParameterToUrl(url, 'izpid', window.izendaPageId$);
		url = appendParameterToUrl(url, 'anpid', window.angularPageId$);
		jq$.ajax({
			url: url,
			success: function (config) {
				// create paths object:
				UrlSettingsPaths = {
					urlBase: urlBase,
					urlRsPage: getPath(urlBase, config.ResponseServerUrl),
					urlRpPage: getPath(urlBase, config.ResourcesProviderUrl),
					urlDashboardDesigner: getPath(urlBase, config.DashboardDesignerUrl),
					urlDashboardViewer: getPath(urlBase, config.DashboardViewerUrl),
					urlInstantReport: getPath(urlBase, config.InstantReportUrl),
					urlSettings: getPath(urlBase, config.SettingsUrl),
					urlReportDesigner: getPath(urlBase, config.ReportDesignerUrl),
					urlReportList: getPath(urlBase, config.ReportListUrl),
					urlReportViewer: getPath(urlBase, config.ReportViewerUrl),
					urlResources: getPath(urlBase, config.ResourcesPath)
				};
			},
			async: false
		});
	}
})();

/**
 * Url settings object. Contains information about izenda urls and report url parameters.
 */
function UrlSettings() {
	function _parseFilterParameters(url) {
		var urlParams = url.data.param.query;
		var result = [];
		for (var paramName in urlParams) {
			if (urlParams.hasOwnProperty(paramName)) {
				if (paramName.match(/p\d+value[2]{0,1}/gi) != null) {
					result.push([paramName, urlParams[paramName]]);
				}
			}
		}
		return result;
	}

	// start process url
	var location = window.location.href;
	var url = (typeof (jq$.url) == 'undefined') ? window.purl(location) : jq$.url(location);

	// parse filter parameters
	var filterParameters = _parseFilterParameters(url);

	// parse report full name
	var reportFullName = url.param('rn');
	var reportName = null;
	var reportCategoryName = null;
	if (reportFullName != null) {
		var separatorIndex = reportFullName.lastIndexOf(jsResources.categoryCharacter);
		reportName = reportFullName.substring(separatorIndex + 1);
		if (separatorIndex > 0) {
			reportCategoryName = reportFullName.substring(0, separatorIndex);
			if (reportCategoryName === '')
				reportCategoryName = null;
		}
	}

	// create report info object
	var reportInfo = {
		fullName: reportFullName,
		name: reportName,
		category: reportCategoryName,
		isNew: url.param('isNew') === '1',
		exportType: url.param('exportType')
	};

	var result = jq$.extend({}, UrlSettingsPaths, {
		reportInfo: reportInfo,
		filterParameters: filterParameters
	});
	return result;
}
