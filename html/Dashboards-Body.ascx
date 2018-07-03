<%@ Control Language="C#" AutoEventWireup="true" %>

<%@ Import Namespace="Izenda.AdHoc" %>

<script runat="server">

	private string GetReportName(string category, string reportName)
	{
		var result = reportName;
		if (!String.IsNullOrEmpty(category) && category != "Uncategorized")
			result = category + AdHocSettings.CategoryCharacter + result;
		return result;
	}

	private string CropSlashes(string value)
	{
		var result = value;
		while (result.Contains("\\\\"))
			result = result.Replace("\\\\", "\\");
		return result;
	}

	private void UpdateReferenceGenerated(string href)
	{
		updateRef.Attributes.Add("onclick", href.Replace("null", "'ActivateNewDashboardViewerControls()'"));
	}

	private string GetSecurityConfigScript()
	{
		var crs = AdHocContext.CurrentReportSet;
		var config = String.Format("var dashboardConfig = {{ ReportIsReadOnly: {0}, ReportIsViewOnly: {1}, ReportIsLocked: {2}}};",
			crs.ReadOnly.ToString().ToLower(),
			crs.ViewOnly.ToString().ToLower(),
			crs.IsLocked.ToString().ToLower());
		return String.Format("<scr" + "ipt language='javascript'>{0}</scr" + "ipt>", config);
	}

	protected override void OnInit(EventArgs e)
	{
		Session["sFrom"] = null;
		Session["sTo"] = null;
	}

	private void RenderCategories(string rn, ReportInfo[] reportInfoItems, out string currentCategory)
	{
		currentCategory = Request.Params["catSel"];
		if (String.IsNullOrEmpty(currentCategory))
		{
			var nodes = CropSlashes(rn).Split(AdHocSettings.CategoryCharacter);
			currentCategory = "Uncategorized";
			if (nodes.Length > 1)
				currentCategory = String.Join(AdHocSettings.CategoryCharacter.ToString(), nodes, 0, nodes.Length - 1);
		}
		catSel.Items.Clear();

		var categories = new HashSet<string>();
		var frs = new Dictionary<string, List<string>>();
		foreach (var reportInfo in reportInfoItems)
		{
			if (!reportInfo.Dashboard)
				continue;
			var category = reportInfo.Category;
			if (String.IsNullOrEmpty(category))
				category = "Uncategorized";

			if (!categories.Contains(category))
			{
				if (String.IsNullOrEmpty(currentCategory))
					currentCategory = category;
				categories.Add(category);
			}

			if (!frs.ContainsKey(category))
				frs.Add(category, new List<string>());
			frs[category].Add(reportInfo.Name);
		}

		foreach (var category in categories)
		{
			var li = new ListItem(category);
			if (category == currentCategory)
				li.Selected = true;
			var sortedRs = frs[category].ToArray();
			Array.Sort(sortedRs);
			li.Attributes.Add("catName", category);
			li.Attributes.Add("tabInd", "0");
			li.Attributes.Add("repName", GetReportName(category, sortedRs[0]).Replace("\\", "\\\\"));
			catSel.Items.Add(li);
		}

		Session["ReloadScriptDBS"] = "";
	}

	private string[] GetTabs(ReportInfo[] reportInfoItems, string currentCategory)
	{
		var tabsList = new List<string>();
		foreach (var reportInfo in reportInfoItems)
		{
			var category = reportInfo.Category;
			if (String.IsNullOrEmpty(category))
				category = "Uncategorized";
			if (!reportInfo.Dashboard || category != currentCategory)
				continue;
			tabsList.Add(reportInfo.Name);
		}

		var tabs = tabsList.ToArray();
		Array.Sort(tabs);

		return tabs;
	}

	private void RenderTabs(string rn, ReportInfo[] reportInfoItems, string currentCategory)
	{
		var tabs = GetTabs(reportInfoItems, currentCategory);

		var currentTab = -1;
		var tabsStr = "";
		var tabsOtherStr = "";
		for (var index = tabs.Length - 1; index >= 0; index--)
		{
			var reportName = tabs[index];
			var curRn = GetReportName(currentCategory, reportName);
			if (!String.IsNullOrEmpty(curRn))
				if (currentTab < 0 && CropSlashes(curRn.Replace("\\", "\\\\")) == CropSlashes(rn))
					currentTab = index;
			var clickScript = "";
			if (currentTab != index)
				clickScript = " onclick=\"GoToCatTab('" + GetReportName(currentCategory, reportName).Replace("\\", "\\\\").Replace("'", "\\'") + "');\"";
			tabsStr += "<li><a href=\"#tabs-" + index + "\"" + clickScript + ">" + tabs[index] + "</a></li>";
			tabsOtherStr += "<div id=\"tabs-" + index + "\" class=\"dashboard-tab\"></div>";
		}

		if (AdHocSettings.ShowDesignLinks)
		{
			tabsStr += "<li><a id=\"addDashboardLink\" href=\"#tabs-1000\">+</a></li>";
			tabsOtherStr += "<div id=\"tabs-1000\" class=\"dashboard-tab\"></div>";
		}

		dbList.Controls.Add(new LiteralControl(tabsStr));
		otherTabs.Controls.Add(new LiteralControl(tabsOtherStr));

		if (currentTab >= 0)
		{
			var currentTabInv = tabs.Length - currentTab - 1;
			Session["StartUpScriptDBS"] = "<scr" + "ipt language='javascript'>function SwitchTab() {jqdb$(\"#cdTabs\").tabs({ active: " + currentTabInv + "});}</scr" + "ipt>";
		}
	}

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!AdHocContext.DashboardsAllowed)
			return;

		crv.NoToolbar = true;
		crv.UpdateReferenceGenerated = UpdateReferenceGenerated;

		var crs = AdHocContext.CurrentReportSet;
		var cachedInfos = AdHocSettings.AdHocConfig.FilteredListReports();

		var rn = Request.Params["rn"];
		if (String.IsNullOrEmpty(rn))
		{
			if (crs.IsDashBoard && Request.Params["emptyreport"] == "1")
				return;

			var demoUrl = "";
			var normalUrl = "";
			foreach (var reportInfo in cachedInfos)
				if (reportInfo.Dashboard)
				{
					if (String.IsNullOrEmpty(normalUrl))
						normalUrl = AdHocSettings.DashboardViewer + "?rn=" + HttpUtility.UrlEncode(reportInfo.FullName);
					if (String.IsNullOrEmpty(demoUrl) && reportInfo.Name.ToLower() == "dashboard")
						demoUrl = AdHocSettings.DashboardViewer + "?rn=" + HttpUtility.UrlEncode(reportInfo.FullName);
				}

			if (!String.IsNullOrEmpty(demoUrl))
				Response.Redirect(demoUrl);
			else
			{
				if (String.IsNullOrEmpty(normalUrl))
					normalUrl = AdHocSettings.DashboardDesignerUrlWithDelimiter + "clear=1";
				Response.Redirect(normalUrl);
			}

			Response.End();
			return;
		}

		if (crs.IsDashBoard)
		{
			try
			{
				if (crs.ReportName == "Dashboard")
					rn = crs.ReportName;
				else if (crs.ReportName == "Dashboard Preview")
				{
					crs.ReportName = null;
					return;
				}
			}
			catch
			{
				// ignored
			}
		}

		string currentCategory;
		RenderCategories(rn, cachedInfos, out currentCategory);
		RenderTabs(rn, cachedInfos, currentCategory);
	}

	protected override void OnPreRender(EventArgs e)
	{
		if (!AdHocContext.DashboardsAllowed)
			return;

		var reloadScript = Session["ReloadScriptDBS"];
		if (reloadScript == null)
			return;
		var strReloadScript = reloadScript.ToString();
		if (!String.IsNullOrEmpty(strReloadScript))
			Page.ClientScript.RegisterStartupScript(typeof(object), "reloadF", strReloadScript);

		var startUpScript = Session["StartUpScriptDBS"];
		if (startUpScript == null)
			return;
		var strStartUpScript = startUpScript.ToString();
		if (!String.IsNullOrEmpty(strStartUpScript))
			Page.ClientScript.RegisterStartupScript(typeof(object), "switchTabF", strStartUpScript);

		Page.ClientScript.RegisterStartupScript(typeof(object), "securityCOnfig", GetSecurityConfigScript());
	}

</script>

<%  if (AdHocContext.DashboardsAllowed)
    { %>

<%@ Register TagPrefix="cc1" Namespace="Izenda.Web.UI" Assembly="Izenda.AdHoc" %>
<%@ Register TagPrefix="ss1" Namespace="Izenda.Web.UI.Slider" Assembly="Izenda.AdHoc" %>

<div id="loadingrv2" style="z-index: 500; top: 0; left: 0; width: 100%; background-color: #FFFFFF; position: fixed; display: none; text-align: center; vertical-align: middle;" lang-text="js_Loading">Loading...<br />
	<img alt="" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=loading.gif" />
</div>

<div id="saveAsDialog" style="z-index: 500; top: 0px; left: 0px; width: 100%; background-color: #FFFFFF; position: fixed; display: none; text-align: center; vertical-align: middle;">
	<div style="padding: 20px; border-style: solid; border-width: 1px; display: table; margin: 0 auto;">
		<div lang-text="js_InputReportName">Input report name</div>
		<div>
			<input type="text" id="newReportName" style="width: 200px; margin: 0px; border-style: solid; border-width: 1px;" value="" />
		</div>
		<div style="margin-top: 5px;" lang-text="js_Category">Category</div>
		<div>
			<select onchange="CheckNewCatName();" id="newCategoryName" style="width: 206px; border-style: solid; border-width: 1px;"></select>
		</div>
		<div style="margin-top: 5px;">
			<div class="f-button" style="margin-bottom: 4px;">
				<a class="blue" onclick="javascript:SaveReportAs();" href="javascript:void(0);" style="width: 50px;"><span class="text" lang-text="js_Ok">OK</span></a>
			</div>
			<div class="f-button">
				<a class="gray" onclick="javascript:CancelSave();" href="javascript:void(0);" style="width: 120px;"><span class="text" lang-text="js_Cancel">Cancel</span></a>
			</div>
		</div>
	</div>
</div>

<div id="newCatDialog" style="z-index: 500; top: 0px; left: 0px; width: 100%; background-color: #FFFFFF; position: fixed; display: none; text-align: center; vertical-align: middle;">
	<div style="padding: 20px; border-style: solid; border-width: 1px; display: table; margin: 0 auto;">
		<div lang-text="js_NewCategoryName">New category name</div>
		<div>
			<input type="text" id="addedCatName" style="width: 200px; margin: 0px; border-style: solid; border-width: 1px;" value="" />

		</div>
		<div style="margin-top: 5px;">
			<div class="f-button" style="margin-bottom: 4px;">
				<a class="blue" onclick="javascript:AddNewCategory();" href="javascript:void(0);" style="width: 120px;"><span class="text" lang-text="js_Create">Create</span></a>
			</div>
			<div class="f-button">
				<a class="gray" onclick="javascript:CancelAddCategory();" href="javascript:void(0);" style="width: 120px;"><span class="text" lang-text="js_Cancel">Cancel</span></a>
			</div>
		</div>
	</div>
</div>

<div id="dashboardsDiv" class="report-page" style="margin: 0 8px; padding: 0 6px;">
	<form id="form1" runat="server">
		<div style="display: none">
			<cc1:ReportPart ID="ReportPart1" runat="server" Report="" Part="" />
		</div>
		<div id="loadingBg" style="margin-top: 113px; top: 0; left: 0; padding-top: 140px; z-index: 9998; background-color: #FFFFFF; position: fixed; width: 100%; height: 100%;"></div>
		<div id="loadingScreen" style="margin-top: 113px; top: 0; left: 0; padding-top: 140px; z-index: 9999; background-color: #FFFFFF; position: fixed; width: 100%; height: 100%;">
			<div id="loadingWord" style="font-size: 20px; margin-left: 70px;">&nbsp;</div>
			<img id="limg" style="display: none; margin-left: 70px;" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=loading.gif" alt="" />
		</div>

		<div class="btn-toolbar" style="margin: 12px 10px 4px 8px; z-index: 2; position: relative; float: left; white-space: nowrap;">
			<div class="btn-group">
				<a class="btn" title="Refresh" lang-title="js_Refresh" runat="server" id="updateRef">
					<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.refresh-18.png" alt="Refresh" lang-alt="js_Refresh" />
					<span lang-text="js_Refresh">Refresh</span>
				</a>
			</div>

			<div class="btn-group cool designer-only hide-locked hide-viewonly" id="saveControls">
				<button type="button" class="btn" title="Save" lang-title="js_Save" id="btnSaveDirect" onclick="javascript:if(event.returnValue){event.returnValue=false;}if(event.preventDefault){event.preventDefault();} SaveReportSet();">
					<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.floppy.png" alt="Save" lang-alt="js_Save" />
					<span class="hide" lang-text="js_Save">Save</span>
				</button>
				<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
					<span class="caret"></span>
				</button>
				<ul class="dropdown-menu">
					<li class="hide-readonly">
						<a href="javascript:void(0)" style="min-width: 18em;" onclick="javascript:SaveReportSet();">
							<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.save-32.png" alt="Save changes" lang-alt="js_SaveChanges" />
							<b lang-text="js_Save">Save</b><br>
							<span lang-text="js_SaveChangesDashboardMessage">Save changes to the dashboard for everyone it is shared with</span>
						</a>
					</li>
					<li>
						<a href="javascript:void(0)" style="min-width: 18em;" onclick="javascript:ShowSaveAsDialog();">
							<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.save-as-32.png" alt="Save a copy" lang-alt="js_SaveACopy" />
							<b lang-text="js_SaveAs">Save As</b><br>
							<span lang-text="js_SaveACopyMessage">Save a copy with a new name, keeping the original intact</span>
						</a>
					</li>
				</ul>
			</div>

			<div class="btn-group cool">
				<button type="button" class="btn" lang-title="js_Print" title="Print" onclick="responseServer.OpenUrl('rs.aspx?p=htmlreport&print=1', clientControlId ? formId[clientControlId] : 'aspnetForm', '');">
					<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.print.png" alt="Printer" />
					<span class="hide" lang-text="js_Print">Print</span>
				</button>
				<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
					<span class="caret"></span>
				</button>
				<ul class="dropdown-menu">
					<li>
						<a href="javascript:void(0)" title="" style="min-width: 18em;" onclick="responseServer.OpenUrl('rs.aspx?p=htmlreport&print=1', clientControlId ? formId[clientControlId] : 'aspnetForm', '');">
							<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.print-32.png" alt="" />
							<b lang-text="js_PrintHTML">Print HTML</b><br>
							<span lang-text="js_PrintDirectlyMessage">Print directly from your browser, the fastest way for modern browsers</span>
						</a>
					</li>
					<li>
						<a href="javascript:void(0)" title="" onclick="responseServer.OpenUrlWithModalDialogNew('rs.aspx?output=PDF', clientControlId ? formId[clientControlId] : 'aspnetForm', 'reportFrame');">
							<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.html-to-pdf-32.png" alt="" />
							<b lang-text="js_HTML2PDF">HTML-powered PDF</b><br>
							<span lang-text="js_HTML2PDFMessage">One-file compilation of all the report's pages</span>
						</a>
					</li>
					<li style="display: none;">
						<a href="javascript:void(0)" title="" onclick="responseServer.OpenUrlWithModalDialogNew('rs.aspx?output=PDF', clientControlId ? formId[clientControlId] : 'aspnetForm', 'reportFrame');">
							<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.pdf-32.png" alt="" />
							<b lang-text="js_StandardPDF">Standard PDF</b><br>
							<span lang-text="js_NonHTMLPDF">Non-HTML PDF generation</span>
						</a>
					</li>
				</ul>
			</div>

			<div class="btn-group designer-only hide-locked hide-viewonly">
				<a id="designDbBtn" class="btn" lang-title="js_OpenInDesigner" title="Open in designer" href="<%=AdHocSettings.DashboardDesignerUrl%>">
					<img class="icon" src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=ModernImages.design.png" lang-alt="js_OpenInDesigner" alt="Open in designer" />
					<span class="hide" lang-text="js_OpenInDesigner">Open in designer</span>
				</a>
			</div>

			<div class="btn-group" style="color: #555; font-size: 13px; margin-left: 12px;">
				<span lang-text="js_Category">Category</span>:
				<select id="catSel" runat="server" onchange="var so = this[selectedIndex]; GoToCatTab(so.getAttribute('repName'));" style="font-size: 13px;"></select>
			</div>
		</div>

		<div id="refreshToolbar"></div>

		<div id="cdTabs" style="border: none; padding: 4px 0 0 0;">
			<div style="display: inline-block; height: 44px;" class="tabs-header-spacer">&nbsp;</div>
			<div style="display: inline-block; border-bottom: 1px solid #c4c4c4; height: 44px; margin: 0; padding: 0; position: absolute; width: 100%; left: 0;">&nbsp;</div>
			<ul style="line-height: 20px; display: inline-block; float: right; padding-right: 36px;" class="tabs-header">
				<asp:PlaceHolder ID="dbList" runat="server"></asp:PlaceHolder>
			</ul>
			<div class="clearfix" style="border-bottom: 1px solid #c4c4c4;"></div>
			<asp:PlaceHolder ID="otherTabs" runat="server"></asp:PlaceHolder>
			<cc1:DashboardViewer ID="crv" runat="server" />
		</div>
	</form>
</div>

<%  }
    else
    { %>

<div style="padding: 100px; text-align: center;">
	<p>Dashboard Extension Required. Please contact <a href="mailto:sales@izenda.com">sales@izenda.com</a> for details.</p>
</div>

<%  } %>