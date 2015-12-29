<%@ Control AutoEventWireup="true" Language="C#" %>

<iframe style="display: none" name="reportFrame" id='reportFrame' width='0' height='0'></iframe>
<div id="loadingrv2" style="z-index: 500; top: 0px; left: 0px; width: 100%; background-color: #FFFFFF; position: fixed; display: none; text-align: center; vertical-align: middle;" lang-text="js_Loading">
        Loading...<br />
        <img alt="" src="rs.aspx?image=loading.gif" />
</div>

<div id="saveAsDialog" style="z-index: 515; top: 0px; left: 0px; width: 100%; position: absolute; display: none; text-align: center; vertical-align: middle;">
    <div style="padding: 20px; border-style: solid; border-width: 1px; background-color: #FFFFFF; display: table; margin: 0 auto;">
    <div lang-text="js_InputReportName">Input report name</div>
        <div>
            <input type="text" id="newReportName" style="width: 200px; margin: 0px; border-style: solid; border-width: 1px;" value="" /></div>
        <div style="margin-top: 5px;" lang-text="js_Category">Category</div>
        <div>
            <select onchange="CheckNewCatName();" id="newCategoryName" style="width: 206px; border-style: solid; border-width: 1px;"></select></div>
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

<div id="newCatDialog" style="z-index: 515; top: 0px; left: 0px; width: 100%; position: absolute; display: none; text-align: center; vertical-align: middle;">
    <div style="padding: 20px; border-style: solid; border-width: 1px; background-color: #FFFFFF; display: table; margin: 0 auto;">
    <div lang-text="js_NewCategoryName">New category name</div>
        <div>
            <input type="text" id="addedCatName" style="width: 200px; margin: 0px; border-style: solid; border-width: 1px;" value="" /></div>
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

<div id="loadingDiv" style="width: 100%; text-align: center; display: none;">
    <div id="loadingWord" style="font-size: 20px; color: #1D5987; font-family: Verdana,Arial,Helvetica,sans-serif; font-weight: normal !important; font-size: 20px; font-style: normal;" lang-text="js_Loading">Loading...</div>
    <img style="padding-top: 40px;" id="loadingImg" alt="" src="rs.aspx?image=loading.gif" />
</div>

<div style="position: relative; margin: 0 8px; padding: 0px 6px;">
    <div class="btn-toolbar" style="margin: 12px 50px 4px 8px; z-index: 6; position: relative; float: left; white-space: nowrap;">
  <div class="btn-group">
    <a class="btn" id="rlhref" href="ReportList.aspx" lang-title="js_Reportlist" title="Report list">
      <img class="icon" src="rs.aspx?image=ModernImages.report-list.png" lang-alt="js_Reportlist" alt="Report list" />
      <span class="hide" lang-text="js_Reportlist">Report list</span>
    </a>
        </div>
  <div class="btn-group cool designer-only hide-locked hide-viewonly" id="saveControls">
    <button type="button" class="btn" lang-title="js_Save" title="Save" id="btnSaveDirect" onclick="javascript:event.preventDefault();SaveReportSet();">
      <img class="icon" src="rs.aspx?image=ModernImages.floppy.png" lang-alt="js_Save" alt="Save" />
      <span class="hide" lang-text="js_Save">Save</span>
    </button>
    <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li class="hide-readonly"><a href="javascript:void(0)" style="min-width: 18em;"
        onclick="javascript:SaveReportSet();">
        <img class="icon" src="rs.aspx?image=ModernImages.save-32.png" lang-alt="js_SaveChanges" alt="Save changes" />
        <b lang-text="js_Save">Save</b><br>
        <span lang-text="js_SaveChangesMessage">Save changes to the report for everyone it is shared with</span>
      </a></li>
      <li><a href="javascript:void(0)" style="min-width: 18em;"
        onclick="javascript:ShowSaveAsDialog();">
        <img class="icon" src="rs.aspx?image=ModernImages.save-as-32.png" lang-alt="js_SaveACopy" alt="Save a copy" />
        <b lang-text="js_SaveAs">Save As</b><br>
        <span lang-text="js_SaveACopyMessage">Save a copy with a new name, keeping the original intact</span>
      </a></li>
    </ul>
  </div>
  <div class="btn-group cool" id="printBtnContainer">
            <button type="button" class="btn" lang-title="js_Print" title="Print"
      onclick="responseServer.OpenUrl('rs.aspx?p=htmlreport&print=1', 'aspnetForm', '');">
      <img class="icon" src="rs.aspx?image=ModernImages.print.png" alt="Printer" />
      <span class="hide" lang-text="js_Print">Print</span>
    </button>
    <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li><a id="htmlPrintBtn" href="javascript:void(0)" title="" style="min-width: 18em;"
        onclick="ExtendReportExport(responseServer.OpenUrl, 'rs.aspx?p=htmlreport&print=1', 'aspnetForm', '');">
        <img class="icon" src="rs.aspx?image=ModernImages.print-32.png" alt="" />
        <b lang-text="js_PrintHTML">Print HTML</b><br>
        <span lang-text="js_PrintDirectlyMessage">Print directly from your browser, the fastest way for modern browsers</span>
      </a></li>
      <li><a href="javascript:void(0)" title="" onclick="ExtendReportExport(responseServer.OpenUrlWithModalDialogNewCustomRsUrl, 'rs.aspx?output=PDF', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class="icon" src="rs.aspx?image=ModernImages.html-to-pdf-32.png" alt="" />
        <b lang-text="js_HTML2PDF">HTML-powered PDF</b><br>
        <span lang-text="js_HTML2PDFMessage">One-file compilation of all the report's pages</span></a>
                    <a style="display: none;" id="testsharpPrintBtn" href="javascript:void(0)" title="" onclick="responseServer.OpenUrlWithModalDialogNewCustomRsUrl('rs.aspx?output=PDF', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class="icon" src="rs.aspx?image=ModernImages.pdf-32.png" alt="" />
        <b lang-text="js_StandardPDF">Standard PDF</b><br>
        <span lang-text="js_NonHTMLPDF">Non-HTML PDF generation</span></a>
      </li>
    </ul>
        </div>
  <div class="btn-group cool">
            <button type="button" class="btn" title="Excel"
      onclick="ExtendReportExport(responseServer.OpenUrlWithModalDialogNewCustomRsUrl, 'rs.aspx?output=XLS(MIME)', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
      <img class="icon" src="rs.aspx?image=ModernImages.excel.png" alt="Get Excel file" />
      <span class="hide" lang-text="js_ExportToExcel">Export to Excel</span>
    </button>
    <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li><a href="javascript:void(0)" title="" style="min-width: 18em;"
        onclick="ExtendReportExport(responseServer.OpenUrlWithModalDialogNewCustomRsUrl, 'rs.aspx?output=XLS(MIME)', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class="icon" src="rs.aspx?image=ModernImages.xls-32.png" alt="" />
        <b lang-text="js_ExportToExcel">Export to Excel</b><br>
        <span lang-text="js_ExportToExcelMessage">File for Microsoft's spreadsheet application</span>
      </a></li>
                <li><a href="javascript:void(0)" title=""
        onclick="ExtendReportExport(responseServer.OpenUrlWithModalDialogNewCustomRsUrl, 'rs.aspx?output=DOC', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class="icon" src="rs.aspx?image=ModernImages.word-32.png" alt="" />
        <b lang-text="js_WordDocument">Word document</b><br>
        <span lang-text="js_WordDocumentMessage">File for Microsoft's word processor, most widely-used office application</span>
      </a></li>
                <li><a id="csvExportBtn" href="javascript:void(0)" title=""
        onclick="responseServer.OpenUrlWithModalDialogNewCustomRsUrl('rs.aspx?output=CSV', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class="icon" src="rs.aspx?image=ModernImages.csv-32.png" alt="" />
        <b lang-text="js_CSV">CSV</b><br>
        <span lang-text="js_CSVMessage">Stores tabular data in text file, that can be used in Google Docs</span>
      </a></li>
                <li><a href="javascript:void(0)" title=""
        onclick="responseServer.OpenUrlWithModalDialogNewCustomRsUrl('rs.aspx?output=XML', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class="icon" src="rs.aspx?image=ModernImages.xml-32.png" alt="" />
        <b lang-text="js_XML">XML</b><br>
        <span lang-text="js_XMLMessage">Both human-readable and machine-readable text file</span>
      </a></li>
      <!--
        http://fogbugz.izenda.us/default.asp?15858#BugEvent.185759
      <li id="RTFExportButton"><a href="javascript:void(0)" title="" 
        onclick="responseServer.OpenUrlWithModalDialogNewCustomRsUrl('rs.aspx?output=RTF', 'aspnetForm', 'reportFrame', nrvConfig.ResponseServerUrl);">
        <img class='icon' src="rs.aspx?image=ModernImages.rtf-32.png" alt="" />
        <b lang-text='js_RTF'>RTF</b><br>
        <span lang-text='js_RTFMessage'>File format for cross-platform document interchange</span>
        </a>
      </li>
        -->
    </ul>
  </div>
  <div class="btn-group">
            <button type="button" class="btn" lang-title="js_SendReport" title="Send report"
      onclick="InitiateEmail();">
      <img class="icon" src="rs.aspx?image=ModernImages.mail.png" lang-alt="js_SendReport" alt="Send report" />
      <span class="hide" lang-text="js_SendReport">Send report</span>
    </button>
        </div>
  <div class="btn-group cool" data-toggle="buttons-radio">
    <button type="button" class="btn" lang-title="js_ResultsPerPage" title="Results per page" onclick="">
      <img class="icon" id="resNumImg" src="rs.aspx?image=ModernImages.rows-100.png" alt="Results per page" />
      <span class="hide" lang-text="js_ResultsPerPage">Results per page</span>
    </button>
    <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li onclick="ChangeTopRecords(1, true);" id="resNumLi0"><a href="javascript:void(0)" title="" style="min-width: 12em;">
        <img class="icon" src="rs.aspx?image=ModernImages.result-1-32.png" alt="" />
        <b lang-text="js_Result_1">1 Result</b><br />
        <span lang-text="js_Result_1_Message">Ideal for large forms</span>
      </a></li>
      <li onclick="ChangeTopRecords(10, true);" id="resNumLi1"><a href="javascript:void(0)" title="">
        <img class="icon" src="rs.aspx?image=ModernImages.results-10-32.png" alt="" />
        <b lang-text="js_Result_10">10 Results</b><br />
        <span lang-text="js_Result_10_Message">Good for single parameter reports</span>
      </a></li>
      <li onclick="ChangeTopRecords(100, true);" id="resNumLi2"><a href="javascript:void(0)" title="">
        <img class="icon" src="rs.aspx?image=ModernImages.results-100-32.png" alt="" />
        <b lang-text="js_Result_100">100 Results</b><br />
        <span lang-text="js_Result_100_Message">Default and recommended value</span>
      </a></li>
      <li onclick="ChangeTopRecords(1000, true);" id="resNumLi3"><a href="javascript:void(0)" title="">
        <img class="icon" src="rs.aspx?image=ModernImages.results-1000-32.png" alt="" />
        <b lang-text="js_Result_1000">1000 Results</b><br />
        <span lang-text="js_Result_1000_Message">Good for larger reports</span>
      </a></li>
      <li onclick="ChangeTopRecords(10000, true);" id="resNumLi5"><a href="javascript:void(0)" title="">
        <img class="icon" src="rs.aspx?image=ModernImages.results-10000-32.png" alt="" />
        <b lang-text="js_Result_10000">10000 Results</b><br />
        <span lang-text="js_Result_10000_Message">10000 Results</span>
                </a></li>
      <li class="divider"></li>
      <li onclick="ChangeTopRecords(-1, true);" id="resNumLi4"><a href="javascript:void(0)" title="">
        <img class="icon" src="rs.aspx?image=ModernImages.results-all-32.png" alt="" />
        <b lang-text="js_Result_All">Show all results</b><br>
        <span lang-text="js_Result_All_Message">Use carefully as this may overload the browser</span>
      </a></li>
    </ul>
        </div>
  <div class="btn-group">
    <button type="button" class="btn designer-only hide-locked hide-viewonly" lang-title="js_OpenInDesigner" title="Open in designer" id="designerBtn">
      <img class="icon" src="rs.aspx?image=ModernImages.design.png" lang-alt="js_OpenInDesigner" alt="Open in designer" />
      <span class="hide" lang-text="js_OpenInDesigner">Open in designer</span>
    </button>
  </div>
    </div>

    <div id="refreshToolbar"></div>

    <div class="tabbable" id="navdiv">
  <div style="display: inline-block" class="tabs-header-spacer">&nbsp;</div>
        <ul class="nav nav-tabs tabs-header" style="line-height: 20px; display: inline-block; float: right;">
            <li class="visibility-pivots designer-only hide-locked"><a href="#tab3" data-toggle="tab" lang-text="js_Pivots">
                <img src="rs.aspx?image=ModernImages.pivots.png" alt="" class="icon" />Pivots</a></li>
            <li class="designer-only hide-locked hide-viewonly"><a href="#tab2" data-toggle="tab" lang-text="js_Fields">
                <img src="rs.aspx?image=ModernImages.fields.png" alt="" class="icon" />Fields</a></li>
            <li id="tab1li"><a href="#tab1" data-toggle="tab" id="tab1a" lang-text="js_Filters">
                <img src="rs.aspx?image=ModernImages.filter.png" alt="" class="icon" />Filters</a></li>
  </ul>
  <div class="clearfix" style="border-bottom: 1px solid #c4c4c4;"></div>
  <div id="repHeader"></div>
        <div id="updateBtnPC" class="f-button" style="margin-bottom: 4px; margin-left: 40px; display: none;">
            <a id="btnUpdateResultsC" class="blue" onclick="GetRenderedReportSet(true);" href="javascript:void(0);">
                <img src="rs.aspx?image=ModernImages.refresh-white.png" alt="Refresh" /><span class="text" lang-text="js_UpdateResults">Update results</span></a>
  </div>

  <div class="tab-content" id="tabsContentsDiv">
    <div class="tab-pane" id="tab1">
        <div id="htmlFilters">
                    <table style="width: 100%;">
                <tr>
                    <td class="filtersContent"></td>
                </tr>
                <tr>
                            <td class="subreportsFiltersContent" style="display: none;">
                        <div class="subreportsFiltersTitle" onclick="ToggleSubreportsFiltersControl();" style="height: 1px; background-color: #aaa; text-align: center; cursor: pointer;">
                                    <span class="subreportsCollapse" style="background-color: white; position: relative; color: #aaa; top: -13px; font-size: 18px; padding: 0px 10px; float: left; margin-left: 10px; display: none;">+</span>
                                    <span class="subreportsExpand" style="background-color: white; position: relative; color: #aaa; top: -13px; font-size: 18px; padding: 0px 10px; float: left; margin-left: 10px;">-</span>
                                    <span class="subreportsTitleText" style="background-color: white; position: relative; color: #aaa; top: -13px; font-size: 18px; padding: 0px 10px;">Subreports</span>
                                    <span class="subreportsCollapse" style="background-color: white; position: relative; color: #aaa; top: -13px; font-size: 18px; padding: 0px 10px; float: right; margin-right: 10px; display: none;">+</span>
                                    <span class="subreportsExpand" style="background-color: white; position: relative; color: #aaa; top: -13px; font-size: 18px; padding: 0px 10px; float: right; margin-right: 10px;">-</span>
                        </div>
                                <table class="subreportsFiltersTable" style="width: 100%;">
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="filtersButtons">
                                <div id="updateBtnP" class="f-button" style="margin: 10px; margin-left: 8px;">
                            <a class="blue" onclick="javascript:CommitFiltersData(true);" href="javascript:void(0);">
                                <img src="rs.aspx?image=ModernImages.refresh-white.png" lang-alt="js_Refresh" alt="Refresh">
                                <span class="text" lang-text="js_UpdateResults">Update Results</span>
                            </a>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <!-- Filters Templates -->
        <div style="display: none;">
            <!-- Single Filter Template -->
            <div class="filterViewerTemplate" style="float: left; margin-right: 8px; margin-bottom: 16px; min-width: 300px; width: auto; display: none;">
                <div class="filterInnerContent" style="float: left; margin-right: 8px; min-width: 300px;">
                        <div class="filterHeader" style="background-color: #1C4E89; padding: 2px; padding-left: 4px; margin-bottom: 2px; height: 23px; color: white;">
                            <span class="filterRequiredFlag" style="float: left; font-size: x-large; margin: 0px 3px; cursor: default; height: 23px; display:none;" title="Required">*</span>
                            <nobr class="filterTitleContainer" onmouseover="javascript:this.parentElement.onmouseover();var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}">
                                <div class="filterTitle" onmouseover="javascript:this.parentElement.onmouseover();this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" style="float: left; margin-right: 8px; width: 222px; overflow: hidden; text-overflow: ellipsis;"></div>
                            </nobr>
                            <div class="filterRemoveButton" style="float: right; width: 32px; height: 24px; cursor: pointer; opacity: 0.5; background-image: none; background-position: 8px 4px; background-repeat: no-repeat;" data-img="rs.aspx?image=ModernImages.clear-light-bigger.png" onmouseover="javascript:this.parentElement.onmouseover();this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" onmouseout="javascript:this.style.opacity=0.5;"></div>
                            <div class="filterPropertiesButton" style="float: right; width: 32px; height: 24px; cursor: pointer; background-position: 8px 4px; background-repeat: no-repeat;" data-img="rs.aspx?image=ModernImages.gear-light.png" onmouseover="javascript:this.parentElement.onmouseover();this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" onmouseout="javascript:this.style.opacity=0.5;"></div>
                        </div>
                </div>
            </div>
            <!-- Add New Filter Template -->
                    <div class="addFilterTemplate" style="display: none; float: left; margin-right: 8px; margin-bottom: 16px;" title="Add New Filter"></div>
            <!-- Add New Filter Button Template -->
                    <div class="fuidNewFilterTemplate" style="margin-right: 8px; width: 30px; display: none;" expanded="false">
                        <div style="background-color: #1C4E89; padding-left: 4px; margin-bottom: 2px; height: 26px; color: white; font-weight: bold; line-height: 22px;">
		            <nobr>
			            <div id="dNewFilter" onclick="ShowHideAddFilter();" style="float:right;width:30px;text-align:center;cursor:pointer;">+</div>
		            </nobr>
	            </div>
                        <div id="newFilterColumnSel" style="display: none;"></div>
            </div>
            <!-- Subreport Title Template-->
                    <div class="subreportTitleTemplate" style="height: 1px; background-color: #aaa; margin-top: 16px; margin-bottom: 16px; text-align: center;">
                        <span style="background-color: white; position: relative; color: #aaa; top: -11px; font-size: 16px; padding: 0px 10px;"></span>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="tab2">
        <div id="fieldPropertiesDialogContainer">
            <div id="data-source-field" title="Field name" lang-title="js_FieldName">
	            <div id="propertiesDiv">
                            <div id="titleDiv" style="margin: 0px; text-align: left; text-transform: capitalize; color: #fff; background-color: #1C4E89; padding: 6px; width: 100%; max-width: 388px;"></div>
		            <div>
                                <div style="float: left; width: 100%; max-width: 400px; margin-right: 50px;">
				            <table cellpadding="0" cellspacing="0" style="width: 100%;">
                                        <tr class="field-prop-row filter-prop-row">
                                            <td style="padding-top: 10px;" lang-text="js_Description">Description</td>
                                        </tr>
                                        <tr class="field-prop-row filter-prop-row">
                                            <td><input id="propDescription" type="text" value="" style="width: 100%; margin: 0px;" /></td>
                                        </tr>
                                        <tr class="field-prop-row">
                                            <td style="padding-top: 10px;" lang-text="js_Format">Format</td>
                                        </tr>
                                        <tr class="field-prop-row">
                                            <td><select id="propFormats" style="margin: 0px; width: 100%;"></select></td>
                                        </tr>
                                        <tr class="filter-prop-row">
                                            <td style="padding-top: 10px;" lang-text="js_FilterOperator">Filter Operator<span id="dupFilterNote" title="Several filters applied to this Field. Use Filters tab to modify specific filter." style="cursor: help; display: none;"> of 1st Filter ( ? )</span></td>
                                        </tr>
                                        <tr class="filter-prop-row">
                                            <td><select id="propFilterOperators" style="margin: 0px; width: 100%;"></select></td>
                                        </tr>
				            </table>
                            <input type="hidden" id="propFilterGUID" value="" />
                                  <input type="hidden" id="propDialogMode" value="" />
			            </div>
                                <div style="float: left; margin-top: 10px;" id="fieldPropDiv">
				            <table>
					            <tr>
						            <td>
                                                <input id="propTotal" type="checkbox" /><label style="cursor: pointer;" for="propTotal" lang-text="js_Total">Total</label></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input id="propVG" type="checkbox" /><label style="cursor: pointer;" for="propVG" lang-text="js_VisualGroup">Visual Group</label></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input id="propMultilineHeader" type="checkbox" /><label style="cursor: pointer;" for="propMultilineHeader" lang-text="js_MultilineHeader">Multiline Header</label></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style="width: 100%;">
                                                    <div class="multi-valued-check-advanced">
                                                        <label msv="L" msvs="L,M,R" id="labelJ" onclick="javascript:UpdateMSV('labelJ', false);">L</label></div>
                                                    <label onclick="javscript:UpdateMSV('labelJ', false);" style="cursor: pointer;" lang-text="js_LabelJustification">Label Justification</label>
							            </div>
						            </td>
					            </tr>
					            <tr>
						            <td>
                                                <div style="width: 100%;">
                                                    <div class="multi-valued-check-advanced">
                                                        <label msv="&nbsp;" msvs="&nbsp;,L,M,R" id="valueJ" onclick="javascript:UpdateMSV('valueJ', false);">&nbsp;</label></div>
                                                    <label onclick="javascript:UpdateMSV('valueJ', false);" style="cursor: pointer;" lang-text="js_ValueJustification">Value Justification</label>
							            </div>
						            </td>
					            </tr>
                                        <tr>
                                            <td>
                                                <label lang-text="js_Width">Width</label><input id="propWidth" type="text" style="margin-left: 5px; width: 100px;"></td>
                                        </tr>
				            </table>
			            </div>
		            </div>
	            </div>
            </div>
        </div>
        <div id="fieldsCtlTable">
            <div>
                        <select id="dsUlList" onchange="DetectCurrentDs(this.value); wereChecked.length = 0; RefreshFieldsList();"></select>
            </div>

            <div>
                        <div id="remainingFieldsSel" class="field-selector-container" style="display: inline-block; float: inherit;"></div>

                        <div style="display: inline-block; width: 45px; padding: 0 9px; text-align: center; float: inherit; vertical-align: top;">
                    <div class="f-button middle">
                                <a class="gray" onclick="javascript:AddRemainingFields();" href="javascript:void(0);">
                                    <img src="rs.aspx?image=ModernImages.right-add-white.png" alt="Right" /><span class="text" lang-text="js_Add">Add</span></a>
                    </div>
                    <br />
                    <div class="f-button middle">
                                <a class="gray" onclick="javascript:RemoveUsedFields();" href="javascript:void(0);">
                                    <img src="rs.aspx?image=ModernImages.left-remove-white.png" alt="Refresh" /><span class="text" lang-text="js_Remove">Remove</span></a>
                    </div>
                        </div>

                        <div id="usedFieldsSel" class="field-selector-container" style="display: inline-block; float: inherit;"></div>
            </div>

            <div>
                <div class="f-button">
                            <a class="blue" onclick="UpdateFieldsAndRefresh();" href="javascript:void(0);">
                                <img src="rs.aspx?image=ModernImages.refresh-white.png" alt="Refresh" /><span class="text" lang-text="js_UpdateResults">Update results</span></a>
                </div>
                <div class="f-button right">
                            <a class="gray" id="A1" onclick="javascript:ShowFieldProperties();" href="javascript:void(0);">
                                <img src="rs.aspx?image=ModernImages.properties-white.png" alt="Cancel" /><span class="text" lang-text="js_FieldProperties">Field properties</span></a>
                </div>
                <div class="f-button right">
                            <a class="gray" onclick="javascript:MoveDown();" href="javascript:void(0);">
                                <img src="rs.aspx?image=ModernImages.down-white.png" alt="Down" /><span class="text" lang-text="js_Down">Down</span></a>
                </div>
                <div class="f-button right">
                            <a class="gray" onclick="javascript:MoveUp();" href="javascript:void(0);">
                                <img src="rs.aspx?image=ModernImages.up-white.png" alt="Up" /><span class="text" lang-text="js_Up">Up</span></a>
                </div>
            </div>
        </div>
    </div>
        <div class="tab-pane" id="tab3">
            <div class="pivot-selector" id="pivot-selector">
             </div>
            <div class="pivots-count" style="margin:10px 0px;">
                <input class="pivots-count-text" type="text" style="width:35px; margin-right:5px;" onblur="SetPivotCount();" value="">
                <span style="text-transform:uppercase;">Pivots per exported page</span>
            </div>
             <div class="f-button">
                    <a class="blue" name="update-button-pivots" href="javascript:void(0);" onclick="GetRenderedReportSet(true);">
                        <img src="rs.aspx?image=ModernImages.refresh-white.png" alt="Refresh" /><span class="text" lang-text="js_UpdateResults">Update results</span></a>
             </div>
    </div>
  </div>

    </div>
</div>
<script type="text/javascript">
    var urlSettings;
    var responseServer;
    var responseServerWithDelimeter;
    var switchTabAfterRefreshCycle = false;

    jq$(document).ready(function () {
        InitializeViewer();
    });
</script>

<div class="page">
  <div id="renderedReportDiv"></div>
</div>
