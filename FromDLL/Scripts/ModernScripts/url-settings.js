/**
 * jquery plugin required jquery.purl.js
 * response server url passed in variable "window.rsUrl$" which added in ResponseServer
 */
function UrlSettings() {
  /**
   * Append base url part if targetUrl is relative.
   */
  var appendBaseUrl = function(baseUrl, targetUrl) {
    var expression = /(http|https):\/\//gi;
    var regex = new RegExp(expression);
    return targetUrl.match(regex) ? targetUrl : baseUrl + '/' + targetUrl;
  };

  // start process url
  var location = window.location.href;
  var url = (typeof (jq$.url) == 'undefined') ? window.purl(location) : jq$.url(location);

  // get base part of url:
  var urlBase = '';
  var path = url.attr('path').split('/');
  for (var i = path.length - 2; i >= 0; i--) {
    if (path[i].replace(/^\s+|\s+$/g, '') !== '')
      urlBase = '/' + path[i].replace(/^\s+|\s+$/g, '') + urlBase;
  }

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

  // load url settings from server:
  var srvConfig, settings;
  var rsUrl = (typeof (window.rsUrl$) != 'undefined') ? window.rsUrl$ : './rs.aspx';
  jq$.ajax({
    url: rsUrl,
    data: 'wscmd=reportviewerconfig&wsarg0=' + window.innerWidth + '&wsarg1=' + window.innerHeight + ((typeof (window.izendaPageId$) !== 'undefined') ? '&izpid=' + window.izendaPageId$ : ''),
    success: function (returnObj) {
      srvConfig = returnObj;
      
      // new
      settings = {
        urlBase: urlBase,
        urlRsPage: appendBaseUrl(urlBase, srvConfig.ResponseServerUrl),
        urlDashboardDesigner: appendBaseUrl(urlBase, srvConfig.DashboardDesignerUrl),
        urlDashboardViewer: appendBaseUrl(urlBase, srvConfig.DashboardViewerUrl),
        urlInstantReport: appendBaseUrl(urlBase, srvConfig.InstantReportUrl),
        urlSettings: appendBaseUrl(urlBase, srvConfig.SettingsUrl),
        urlReportDesigner: appendBaseUrl(urlBase, srvConfig.ReportDesignerUrl),
        urlReportList: appendBaseUrl(urlBase, srvConfig.ReportListUrl),
        urlReportViewer: appendBaseUrl(urlBase, srvConfig.ReportViewerUrl),
        urlResources: appendBaseUrl(urlBase, 'Resources'),
        reportInfo: reportInfo
      }
    },
    async: false
  });
  return settings;
}
