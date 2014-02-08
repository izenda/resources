using System.Web.UI;
using Izenda.AdHoc;

public partial class Resources_Html_Dashboards_Head : UserControl {
  public string getDashboardViewer() {
    return AdHocSettings.DashboardViewer;
  }
  public string getDashboardDesignerUrl() {
    return AdHocSettings.DashboardDesignerUrl;
  }
}
