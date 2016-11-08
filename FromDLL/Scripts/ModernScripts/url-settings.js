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

	if (typeof (blockNetworkActivity) == 'undefined' || !blockNetworkActivity) {
		var urlBase = window.location.pathname.replace(/\/[^\/]+$/g, "");
		if (urlBase === '/')
			urlBase = '';
		var baseUrlFromServer = urlBase;
		baseUrlFromServer += '/rs.aspx';

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
					urlRsPage: getPath(urlBase, 'rs.aspx'),
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
	// start process url
	var location = window.location.href;
	var url = (typeof (jq$.url) == 'undefined') ? window.purl(location) : jq$.url(location);

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
		reportInfo: reportInfo
	});
	return result;
}
