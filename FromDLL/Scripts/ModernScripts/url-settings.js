/**
 * jquery plugin required jquery.purl.js
 */
function UrlSettings(customUrlRsPage) {
	var location = window.location.href;
	var url = typeof (jq$.url == 'undefined') ? window.purl(location) : jq$.url(location);

	// root url
	var path = url.attr('path').split('/');
	var urlBase = '';
	for (var i = path.length - 2; i >= 0; i--) {
		if (path[i].replace(/^\s+|\s+$/g, '') != '')
			urlBase = '/' + path[i].replace(/^\s+|\s+$/g, '') + urlBase;
	}

	// pages
	var urlRsPage;
	if (customUrlRsPage == undefined || customUrlRsPage == null || customUrlRsPage == '') {
	  urlRsPage = urlBase + '/rs.aspx';
	}
	else {
	  urlRsPage = customUrlRsPage;
	}
	var urlDashboardsPage = urlBase + '/Dashboards.aspx';
	var urlReportViewer = urlBase + '/ReportViewer.aspx';
	var urlReportDesigner = urlBase + '/ReportDesigner.aspx';
	var urlReportList = urlBase + '/ReportList.aspx';
	var urlResources = urlBase + '/Resources';

	// process parameters
	var reportFullName = url.param('rn');
	var reportName = null;
	var reportCategoryName = null;
	if (reportFullName != null) {
	  //11328?
		var reportFullNameParts = reportFullName.split('\\');
		if (reportFullNameParts.length == 2) {
			reportName = reportFullNameParts[1];
			reportCategoryName = reportFullNameParts[0];
		} else
			reportName = reportFullNameParts[0];
	}
	var isNew = url.param('isNew') === '1';
	var exportType = url.param('exportType');

  /**
   * Replace "rn=category\name" parameter to "#/category/name" for angular app
   */
	var replaceRnForAngularApp = function () {
	  var locationFunc = window.location;
	  var historyFunc = window.history;
	  var urlStr = window.location.href;
	  var reportNameParameter = url.param('rn');
	  if (reportNameParameter) {
	    var replaceString;
	    if (urlStr.indexOf('?rn=') >= 0) {
	      replaceString = '?rn=' + reportNameParameter.split(' ').join('+');
	    } else if (urlStr.indexOf('&rn=') >= 0) {
	      replaceString = '&rn=' + reportNameParameter.split(' ').join('+');
	    } else {
	      replaceString = 'rn=' + reportNameParameter.split(' ').join('+');
	    }
	    var modifiedUrl = urlStr.replace(replaceString, '');
	    modifiedUrl = modifiedUrl.replace(replaceString.split(' ').join('+'), '');
	    modifiedUrl += '#/' + reportNameParameter.split('\\').join('/');
	    if (historyFunc && historyFunc.replaceState) {
	      historyFunc.replaceState(null, window.document.title, modifiedUrl);
	    } else if (historyFunc && historyFunc.pushState) {
	      historyFunc.pushState(null, window.document.title, modifiedUrl);
	    } else if (locationFunc && locationFunc.replace) {
	      locationFunc.replace(modifiedUrl);
	    }
	  }
	};

	return {
	  replaceRnForAngularApp: replaceRnForAngularApp,
		urlBase: urlBase,
		urlRsPage: urlRsPage,
		urlDashboardsPage: urlDashboardsPage,
		urlReportViewer: urlReportViewer,
		urlReportDesigner: urlReportDesigner,
        urlReportList: urlReportList,
		urlResources: urlResources,
		reportInfo: {
			fullName: reportFullName,
			name: reportName,
			category: reportCategoryName,
			isNew: isNew,
			exportType: exportType
		}
	};
}