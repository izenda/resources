<%@ Control Language="C#" AutoEventWireup="true" Inherits="Resources_Html_Dashboards_Body" Codebehind="Dashboards-Body.ascx.cs" %>

<%@ Register TagPrefix="cc1" Namespace="Izenda.Web.UI" Assembly="Izenda.AdHoc" %>
<%@ Register TagPrefix="ss1" Namespace="Izenda.Web.UI.Slider" Assembly="Izenda.AdHoc" %>

    <div id="loadingrv2" style="z-index:500;top:0px;left:0px;width:100%;background-color:#FFFFFF;position:fixed;display:none;text-align:center;vertical-align:middle;">
        Loading...<br />
        <img alt="" src="rs.aspx?image=loading.gif" />
    </div>

    <div id="saveAsDialog" style="z-index:500;top:0px;left:0px;width:100%;background-color:#FFFFFF;position:fixed;display:none;text-align:center;vertical-align:middle;">
        <table width="100%">
            <tr>
                <td width="50%" style="text-align:right;">Report Name:</td>
                <td width="50%" style="text-align:left;"><input type="text" id="newReportName" style="width:200px;margin:0px;" value="" /></td>
            </tr>
            <tr>
                <td width="50%" style="text-align:right;">Category Name:</td>
                <td width="50%" style="text-align:left;"><select id="newCategoryName" style="width:206px;"></select><input type="button" value="Create new" onclick="javascript:ShowNewCatDialog();" /></td>
            </tr>
            <tr><td width="100%" colspan="2" style="text-align:center;"><input type="button" value="Save" onclick="SaveReportAs();" /></td></tr>
        </table>
    </div>
    <div id="newCatDialog" style="z-index:500;top:0px;left:0px;width:100%;background-color:#FFFFFF;position:fixed;display:none;text-align:center;vertical-align:middle;">
        <table width="100%">
            <tr>
                <td width="50%" style="text-align:right;">New Category Name:</td>
                <td width="50%" style="text-align:left;"><input type="text" id="addedCatName" style="width:200px;margin:0px;" value="" /><input type="button" value="Create" onclick="javascript:AddNewCategory();" /></td>
            </tr>
        </table>
    </div>

  <div id="dashboardsDiv" class="report-page">

    <form id="form1" runat="server">
      <div style="display: none">
        <cc1:ReportPart ID="ReportPart1" runat="server" Report="" Part="" />
      </div>
      <div id="loadingBg" style=" margin-top: 105px; top:0px; left:0px; padding-top: 140px; z-index: 9998; background-color: #FFFFFF; position: fixed; width: 100%; height: 100%;"></div>
      <div id="loadingScreen" style=" margin-top: 105px; top:0px; left:0px; padding-top: 140px; z-index: 9999; background-color: #FFFFFF; position: fixed; width: 100%; height: 100%;">
        <div id="loadingWord" style="font-size: 20px;margin-left: 70px;">&nbsp;</div>
        <img id="limg" style="display:none;margin-left: 70px;" src="rs.aspx?image=loading.gif" alt="" />
      </div>


      <div class="btn-toolbar" style="margin: 4px 8px; z-index: 6; position: absolute; top: 12px; white-space: nowrap;">

        <div class="btn-group">
          <a class="btn" title="Refresh" runat="server" id="updateRef" href="#refresh">
            <img class="icon" src="rs.aspx?image=ModernImages.refresh-18.png" alt="Refresh" />
            <span>Refresh</span>
          </a>
        </div>

                <div class="btn-group cool designer-only" id="saveControls">
                  <button type="button" class="btn" title="Save" onclick="javascript:event.preventDefault(); SaveReportSet();">
                    <img class="icon" src="rs.aspx?image=ModernImages.floppy.png" alt="Save" />
                    <span class="hide">Save</span>
                  </button>
                  <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu">
                    <li><a href="javascript:void(0)" style="min-width: 18em;"
                      onclick="javascript:SaveReportSet();">
                      <img class="icon" src="rs.aspx?image=ModernImages.save-32.png" alt="Save changes" />
                      <b>Save</b><br>
                      Save changes to the dashboard for everyone it is shared with
                    </a></li>
                    <li><a href="javascript:void(0)" 
                      onclick="javascript:ShowSaveAsDialog();">
                      <img class="icon" src="rs.aspx?image=ModernImages.save-as-32.png" alt="Save a copy" />
                      <b>Save As</b><br>
                      Save a copy with a new name, keeping the original intact
                    </a></li>
                  </ul>
                </div>
  
        <div class="btn-group cool">
          <button type="button" class="btn" title="Print"
            onclick="responseServer.OpenUrl('rs.aspx?p=htmlreport&print=1', 'aspnetForm', '');">
            <img class="icon" src="rs.aspx?image=ModernImages.print.png" alt="Printer" />
            <span class="hide">Print</span>
          </button>
          <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li><a href="javascript:void(0)" title="" style="min-width: 18em;"
              onclick="responseServer.OpenUrl('rs.aspx?p=htmlreport&print=1', 'aspnetForm', '');">
              <img class="icon" src="rs.aspx?image=ModernImages.print-32.png" alt="" />
              <b>Print HTML</b><br>
              Print directly from your browser, the fastest way for modern browsers
            </a></li>
            <li><a href="javascript:void(0)" title="" onclick="responseServer.OpenUrlWithModalDialogNew('rs.aspx?output=PDF', 'aspnetForm', 'reportFrame');">
              <img class="icon" src="rs.aspx?image=ModernImages.html-to-pdf-32.png" alt="" />
              <b>HTML-powered PDF</b><br>
              One-file compilation of all the report's pages
            </a></li>
            <li><a href="javascript:void(0)" title=""
              onclick="responseServer.OpenUrlWithModalDialogNew('rs.aspx?output=PDF', 'aspnetForm', 'reportFrame');">
              <img class="icon" src="rs.aspx?image=ModernImages.pdf-32.png" alt="" />
              <b>Standard PDF</b><br>
              Non-HTML PDF generation
            </a></li>
          </ul>
        </div>

        <div class="btn-group designer-only">
          <a id="designDbBtn" class="btn" title="Open in designer" href="DashboardDesigner.aspx">
            <img class="icon" src="rs.aspx?image=ModernImages.design.png" alt="Open in designer" />
            <span class="hide">Open in designer</span>
          </a>
        </div>

        <div class="btn-group" style="color: #555; font-size: 13px; margin-left: 12px;">
          Category: <select id="catSel" runat="server" onchange="var so = this[selectedIndex]; GoToCatTab(so.getAttribute('repName'));" style="font-size: 13px;"></select>
        </div>

      </div>

      <div id="cdTabs">
                <div style="display: inline-block;height: 44px;border-bottom: 1px solid #c4c4c4;" class="tabs-header-spacer">&nbsp;</div>
                <div style="display: inline-block;border-bottom: 1px solid #c4c4c4;height: 44px;margin: 0;padding: 0;position: absolute;width: 100%;left: 0;">&nbsp;</div>
                <ul style="line-height: 20px;display: inline-block;float: right;" class="tabs-header">
          <asp:PlaceHolder ID="dbList" runat="server"></asp:PlaceHolder>
        </ul>
                <div class="clearfix"></div>
        <asp:PlaceHolder ID="otherTabs" runat="server"></asp:PlaceHolder>
        <cc1:DashboardViewer ID="crv" runat="server" />
      </div>
    </form>

  </div>
