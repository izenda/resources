/**
 * jquery plugin required jquery.purl.js
 * response server url passed in variable "window.rsUrl$" which added in ResponseServer
 */
function UrlSettings() {
  // start process url
  var location = window.location.href;
  var url = (typeof (jq$.url) == 'undefined') ? window.purl(location) : jq$.url(location);

  // process parameters
  var reportFullName = url.param('rn');
  var reportName = null;
  var reportCategoryName = null;
  if (reportFullName != null) {
    var reportFullNameParts = reportFullName.split('\\');
    if (reportFullNameParts.length === 2) {
      reportName = reportFullNameParts[1];
      reportCategoryName = reportFullNameParts[0];
    } else
      reportName = reportFullNameParts[0];
  }
  var isNew = url.param('isNew') === '1';
  var exportType = url.param('exportType');
  var reportInfo = {
    fullName: reportFullName,
    name: reportName,
    category: reportCategoryName,
    isNew: isNew,
    exportType: exportType
  };

  var paths = utility.server.paths;
  return {
  	urlBase: paths.urlBase,
  	urlRsPage: paths.urlRsPage,
  	urlDashboardDesigner: paths.urlDashboardDesigner,
  	urlDashboardViewer: paths.urlDashboardViewer,
  	urlInstantReport: paths.urlInstantReport,
  	urlSettings: paths.urlSettings,
  	urlReportDesigner: paths.urlReportDesigner,
  	urlReportList: paths.urlReportList,
  	urlReportViewer: paths.urlReportViewer,
  	urlResources: paths.urlResources,
  	reportInfo: reportInfo
  };
}
