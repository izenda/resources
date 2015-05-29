function UrlSettings() {
  var urlBase = 'http://testurl';
  // pages
  var urlRsPage = urlBase + '/rs.aspx';
  var urlDashboardsPage = urlBase + '/Dashboards.aspx';
  var urlReportViewer = urlBase + '/ReportViewer.aspx';
  var urlReportDesigner = urlBase + '/ReportDesigner.aspx';
  var urlReportList = urlBase + '/ReportList.aspx';
  var urlResources = urlBase + '/Resources';

  // process parameters
  var reportFullName = 'test category\\test report';
  var reportName = null;
  var reportCategoryName = null;
  var reportFullNameParts = reportFullName.split('\\');
  if (reportFullNameParts.length == 2) {
    reportName = reportFullNameParts[1];
    reportCategoryName = reportFullNameParts[0];
  } else
    reportName = reportFullNameParts[0];
  var isNew = false;
  var exportType = null;

  return {
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