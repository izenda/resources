using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Izenda.AdHoc;

public partial class Resources_Html_Dashboards_Body : UserControl
{
  public class ReportCachedInfo
  {
    public string Category;
    public string Name;
    public string FullName;
    public bool Dashboard;
  }

  public string getDashboardDesignerUrl() {
    return AdHocSettings.DashboardDesignerUrl;
  }

  protected override void OnInit(EventArgs e)
  {
    Session["sFrom"] = null;
    Session["sTo"] = null;
  }

  public void UpdateReferenceGenerated(string href)
  {
    updateRef.Attributes.Add("onclick", href.Replace("null", "'ActivateNewDashboardViewerControls()'"));
  }

  private string GetReportName(string cat, string repN)
  {
    string result = repN;
    if (!String.IsNullOrEmpty(cat) && cat != "Uncategorized")
      result = cat + AdHocSettings.CategoryCharacter + result;
    return result;
  }

  private string CropSlashes(string s)
  {
    string res = s;
    while (res.Contains("\\\\"))
      res = res.Replace("\\\\", "\\");
    return res;
  }

  protected void Page_Load(object sender, EventArgs e)
  {
    ReportInfo[] cachedInfos = AdHocSettings.AdHocConfig.FilteredListReports();
    string rn = Request.Params["rn"];
		crv.NoToolbar = true;
		crv.UpdateReferenceGenerated = UpdateReferenceGenerated;
    if (AdHocContext.CurrentReportSet.IsDashBoard) {
      try {
        if (AdHocContext.CurrentReportSet.ReportName == "Dashboard")
          rn = AdHocContext.CurrentReportSet.ReportName;
				else if (AdHocContext.CurrentReportSet.ReportName == "Dashboard Preview") {
					AdHocContext.CurrentReportSet.ReportName = null;
					return;
				}
      }
      catch { }
			if (Request.Params["emptyreport"] == "1" && String.IsNullOrEmpty(Request.Params["rn"]))
				return;
    }
    if (String.IsNullOrEmpty(Request.Params["rn"])) {
      string demoUrl = "";
      string normalUrl = "";
      foreach (ReportInfo reportInfo in cachedInfos)
        if (reportInfo.Dashboard) {
          if (String.IsNullOrEmpty(normalUrl))
            normalUrl = AdHocSettings.DashboardViewer + "?rn=" + HttpUtility.UrlEncode(reportInfo.FullName);
          if (String.IsNullOrEmpty(demoUrl) && reportInfo.Name.ToLower() == "dashboard")
            demoUrl = AdHocSettings.DashboardViewer + "?rn=" + HttpUtility.UrlEncode(reportInfo.FullName);
        }
      if (!String.IsNullOrEmpty(demoUrl))
        Response.Redirect(demoUrl);
      else {
        if (String.IsNullOrEmpty(normalUrl))
          normalUrl = AdHocSettings.DashboardDesignerUrlWithDelimiter + "clear=1";
        Response.Redirect(normalUrl);
      }
      Response.End();
      return;
    }
    string currentCat = Request.Params["catSel"];
    if (String.IsNullOrEmpty(currentCat) && !String.IsNullOrEmpty(rn)) {
      string[] nodes = CropSlashes(rn).Split(AdHocSettings.CategoryCharacter);
      currentCat = "Uncategorized";
      if (nodes.Length > 1)
        currentCat = nodes[0];
    }
    catSel.Items.Clear();
    Dictionary<string, string> cats = new Dictionary<string, string>();
    Dictionary<string, List<string>> frs = new Dictionary<string, List<string>>();
    foreach (ReportInfo info in cachedInfos) {
      if (!info.Dashboard)
        continue;
      string cat = info.Category;
      if (String.IsNullOrEmpty(cat))
        cat = "Uncategorized";
      if (!cats.ContainsKey(cat)) {
        if (String.IsNullOrEmpty(currentCat))
          currentCat = cat;
        cats.Add(cat, "");
      }
      if (!frs.ContainsKey(cat))
        frs.Add(cat, new List<string>());
      frs[cat].Add(info.Name);
    }
    foreach (string cat in cats.Keys) {
      ListItem li = new ListItem(cat);
      if (cat == currentCat)
        li.Selected = true;
      string[] sortedRs = frs[cat].ToArray();
      Array.Sort(sortedRs);
      li.Attributes.Add("catName", cat);
      li.Attributes.Add("tabInd", "0");
      li.Attributes.Add("repName", GetReportName(cat, sortedRs[0]).Replace("\\", "\\\\"));
      catSel.Items.Add(li);
    }
    int currentTab = -1;
    List<string> tabsL = new List<string>();
    foreach (ReportInfo info in cachedInfos) {
      string iCat = info.Category;
      if (String.IsNullOrEmpty(info.Category))
        iCat = "Uncategorized";
      if (!info.Dashboard || iCat != currentCat)
        continue;
      tabsL.Add(info.Name);
    }
    string[] tabs = tabsL.ToArray();
    Array.Sort(tabs);
    if (currentTab >= tabs.Length)
      currentTab = tabs.Length - 1;
    string tabsStr = "";
    string tabsOtherStr = "";
    for (int index = tabs.Length - 1; index >= 0; index--) {
      string reportName = tabs[index];
      string curRn = GetReportName(currentCat, reportName);
      if (!String.IsNullOrEmpty(curRn) && !String.IsNullOrEmpty(rn)) {
        if (currentTab < 0 && CropSlashes(curRn.Replace("\\", "\\\\")) == CropSlashes(rn))
          currentTab = index;
      }
      string clickScript = "";
      if (currentTab != index)
        clickScript = " onclick=\"GoToCatTab('" + GetReportName(currentCat, reportName).Replace("\\", "\\\\") + "');\"";
      else {
        /*dbTitle.InnerHtml = reportName;
        viewButton.HRef = "ReportViewer.aspx?rn=" + HttpUtility.UrlEncode(GetReportName(currentCat, tabs[index]));
        designButton.HRef = "DashboardDesigner.aspx?rn=" + HttpUtility.UrlEncode(GetReportName(currentCat, tabs[index]));*/
      }
      tabsStr += "<li><a href=\"#tabs-" + index + "\"" + clickScript + ">" + tabs[index] + "</a></li>";
      tabsOtherStr += "<div id=\"tabs-" + index + "\" class=\"dashboard-tab\"></div>";
    }
    if (AdHocSettings.ShowDesignLinks) {
      //tabsStr += "<li><a href=\"#tabs-1000\" onclick=\"window.location = 'DashboardDesigner.aspx?clear=1';\">+</a></li>";
      tabsStr += "<li><a id=\"addDashboardLink\" href=\"#tabs-1000\">+</a></li>";
      tabsOtherStr += "<div id=\"tabs-1000\" class=\"dashboard-tab\"></div>";
    }
    dbList.Controls.Add(new LiteralControl(tabsStr));
    otherTabs.Controls.Add(new LiteralControl(tabsOtherStr));
    if (currentTab >= 0) {
      int currentTabInv = tabs.Length - currentTab - 1;
      Session["StartUpScriptDBS"] = "<script language='javascript'>function SwitchTab() {jqdb$(\"#cdTabs\").tabs({ active: " + currentTabInv + "});}</script>";
    }
    if (String.IsNullOrEmpty(rn) && !string.IsNullOrEmpty(currentCat)) {
      string[] sortedRs = frs[currentCat].ToArray();
      Array.Sort(sortedRs);
      Session["ReloadScriptDBS"] = "<script language='javascript'>GoToCatTab('" + GetReportName(currentCat, sortedRs[0]).Replace("\\", "\\\\") + "');</script>";
    }
    else
      Session["ReloadScriptDBS"] = "";
  }

  protected override void OnPreRender(EventArgs e)
  {
    object rs = Session["ReloadScriptDBS"];
    if (rs == null)
      return;
    string r = rs.ToString();
    if (!String.IsNullOrEmpty(r))
      Page.ClientScript.RegisterStartupScript(typeof(object), "reloadF", r);
    object ss = Session["StartUpScriptDBS"];
    if (ss == null)
      return;
    string s = ss.ToString();
    if (!String.IsNullOrEmpty(s))
      Page.ClientScript.RegisterStartupScript(typeof(object), "switchTabF", s);
	Page.ClientScript.RegisterStartupScript(typeof(object), "securityCOnfig", GetSecurityConfigScript());
  }

	private string GetSecurityConfigScript()
	{
		string config = string.Format("var dashboardConfig = {{ ReportIsReadOnly: {0}, ReportIsViewOnly: {1}, ReportIsLocked: {2}}};"
										, AdHocContext.CurrentReportSet.ReadOnly.ToString().ToLower()
										, AdHocContext.CurrentReportSet.ViewOnly.ToString().ToLower()
										, AdHocContext.CurrentReportSet.IsLocked.ToString().ToLower());
		return string.Format("<script language='javascript'>{0}</script>", config);
	}
}
