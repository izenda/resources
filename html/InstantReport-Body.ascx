<%@ Control AutoEventWireup="true" %>

<script type="text/javascript">
    var is_ie9_or_newer = true;
</script>
<!--[if lt IE 9]>
<script type="text/javascript">
is_ie9_or_newer = false;
</script>
<![endif]-->

<div class="page" onclick="hideAllPreview();">
    <div class="row-fluid">

        <div class="span7" id="leftDiv">
            <div class="data-sources">
                <div id="metaDsHead" class="data-sources-header css-only-clearfix">
                  <div class="search-container">
                    <input type="text" class="" id="fieldSearch" title="Search" accesskey="f" value="" lang-title="js_Search">
                    <span id="fieldSearchMessage" class="search-wait hidden" lang-text="js_Searching">Searching...</span>
                    <a id="fieldSearchClearBtn" class="clear" href="#clear" lang-title="js_Clear" title="Clear"></a>
                    <a id="fieldSearchBtn" class="find" href="#find" lang-title="js_Search" title="Search"></a>
                    <div id="fieldSearchAutoComplete" class="searchAutoComplete hidden"></div>
                  </div>
                </div>

                <div class="controls">
                  <div id="msgAboutBottom" style="text-align: left; width: 250px; color: rgb(0, 0, 61); font-weight: bold; font-family: Times New Roman; height: 20px;">Because of limited screen width, your preview has moved to the bottom of the page.</div>
                  <a class="collapse" href="#collapseall" lang-text="js_CollapseAll"><img src="rs.aspx?image=ModernImages.collapse.png" alt="collapse" lang-alt="js_Collapse" style="" />Collapse all</a> 
                  <a class="uncheck" href="#uncheck_all" lang-text="js_UncheckAll" onclick="javascript:NDS_UnckeckAllDs();PreviewReportManual();"><img src="rs.aspx?image=ModernImages.remove-icon.png" alt="remove" lang-alt="js_Remove" style="" />Uncheck all</a>
                </div>

                <div class="database-description css-only-clearfix">
                  <div class="">Database</div>
                  <div class="">Table</div>
                  <div class="">Fields</div>
                </div>

                <div class="databases" id="databases"></div>
              <div id="dottedSeparatorDiv" class="separator" style="position: absolute; width: 0; height: 100%; right: -28px; top: 0;"></div>
            </div>
        </div>

        <div class="span5" id="rootRightDiv" style="height:0px;">
          <div class="right-help" id="rightHelpDiv" style="margin-left: 0px; padding-top: 10px; padding-left: 10px; padding-right: 10px; padding-bottom: 10px;">
            <table id="previewLoading" style="width:100%; display:none;">
                <tr style="width:100%;">
                    <td style="width:100%;text-align: center">
                        <img src="rs.aspx?image=loading.gif"/>
                    </td>
                </tr>
            </table>
            <h2 id="previewH2" style="margin:0px; margin-bottom:20px;">
                <a class="button default" href="#update_preview" title="Update Preview" onclick="javascript:PreviewReportManual();">
                    <img style="margin-bottom:-9px;" src="rs.aspx?image=ModernImages.largerefresh.png"/>
                </a>
                <a id="appendSubtotalsBtn" href="#add_subtotals" title="Add Subtotals" onclick="javascript:AppendSubtotals();">
                    <img style="margin-bottom:-9px;" src="rs.aspx?image=subtotalsplus.png"/>
                </a>
                <a id="appendChartBtn" href="#add_chart" title="Add Chart" onclick="javascript:AppendChart();">
                    <img style="margin-bottom:-9px;" src="rs.aspx?image=chartplus.png"/>
                </a>
                <a class="button" href="#design_report" title="Design Report" onclick="DesignReportRequest(CollectReportData());" lang-text="js_DesignReport">
                    <img style="margin-bottom:-9px;" src="rs.aspx?image=ModernImages.pencilwhite.png"/>
                </a>
                <a class="button default" href="#view_report" title="View Report" onclick="ViewReportRequest(CollectReportData());" lang-text="js_ViewReport">
                    <img style="margin-bottom:-9px;" src="rs.aspx?image=ModernImages.magwhite.png"/>
                </a>
            </h2>
            <div id="htmlFilters" class="css-only-clearfix" style="border-bottom: 3px dotted #ccc; margin-bottom: 10px;">
                <div class="filtersContent"></div>    
                <!-- Filters Templates -->
                <div style="display:none;">
                    <!-- Single Filter Template -->
                    <div class="filterViewerTemplate" style="float:left;margin-right:8px;margin-bottom:16px;min-width:300px;width:auto; display:none;">
                        <div class="filterInnerContent" style="float:left;margin-right:8px;min-width:300px;">
                            <div class="filterHeader" style="background-color:#1C4E89;padding:2px;padding-left:4px;margin-bottom:2px; height:23px;color:white;">
                                <nobr class="filterTitleContainer" onmouseover="javascript:this.parentElement.onmouseover();var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}">
                                    <div class="filterTitle" onmouseover="javascript:this.parentElement.onmouseover();this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" style="float: left; margin-right: 8px; width: 222px;"></div>
                                </nobr>
                                <div class="filterRemoveButton" style="float: right; width: 32px; height: 24px; cursor: pointer; opacity: 0.5; background-image: none; background-position: 8px 4px; background-repeat: no-repeat;" data-img="rs.aspx?image=ModernImages.clear-light-bigger.png" onmouseover="javascript:this.parentElement.onmouseover();this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" onmouseout="javascript:this.style.opacity=0.5;"></div>
                                <div class="filterPropertiesButton" style="float:right; width:32px; height:24px; cursor:pointer; background-position:8px 4px; background-repeat:no-repeat;" data-img="rs.aspx?image=ModernImages.gear-light.png" onmouseover="javascript:this.parentElement.onmouseover();this.style.opacity=1;var e=event?event:window.event;if(e){e.cancelBubble = true;if(e.stopPropagation){e.stopPropagation();}}" onmouseout="javascript:this.style.opacity=0.5;"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Add New Filter Template -->
                    <div class="addFilterTemplate" style="display:none;float:left;margin-right:8px;margin-bottom:16px;" title="Add New Filter"></div>
                    <!-- Add New Filter Button Template -->
                    <div class="fuidNewFilterTemplate" style="margin-right:8px;width:30px;display:none;" expanded="false">
	                    <div style="background-color: #1C4E89;padding-left:4px;margin-bottom:2px; height: 26px;color: white;font-weight: bold;line-height: 22px;">
		                    <nobr>
			                    <div id="dNewFilter" onclick="ShowHideAddFilter();" style="float:right;width:30px;text-align:center;cursor:pointer;">+</div>
		                    </nobr>
	                    </div>
	                    <div id="newFilterColumnSel" style="display:none;"></div>
                    </div>
                </div>
            </div>
            <div id="previewWrapperEmpty" class="preview-wrapper-empty" lang-text="js_DragHereToPreview">Drag field here to preview</div>
          </div>
          <div id="fieldPropertiesDialogContainer">
            <div id="data-source-field" title="Field name" lang-title="js_FieldName">
    	        <div id="propertiesDiv">
		            <div id="titleDiv" style="margin: 0px; text-align:left;text-transform:capitalize;color:#fff;background-color:#1C4E89;padding:6px; width: 100%; max-width: 388px;"></div>
			          <div style="float: left; width: 100%; max-width: 400px;margin-right: 50px;">
				          <table cellpadding="0" cellspacing="0" style="width: 100%;">
					          <tr><td style="padding-top:10px;" lang-text="js_Description">Description</td></tr>
					          <tr><td><input id="propDescription" type="text" value="" style="width:100%;margin:0px;" onkeyup="PreviewFieldDelayed(1000);"/></td></tr>
					          <tr><td style="padding-top:10px;" lang-text="js_Format">Format</td></tr>
					          <tr><td><select id="propFormats" style="margin:0px;width:100%;" onchange="PreviewFieldDelayed(1000);"></select></td></tr>
					          <tr><td style="padding-top:10px;" lang-text="js_FilterOperator">Filter Operator<span id="dupFilterNote" title="Several filters applied to this Field. Use Filters tab to modify specific filter." style="cursor: help; display:none;"> of 1st Filter ( ? )</span></td></tr>
					          <tr><td><select id="propFilterOperators" style="margin:0px;width:100%;" onchange="PreviewFieldDelayed(1000);"></select></td></tr>
    				      </table>
                  <input type="hidden" id="propFilterGUID" value="" />
		    	      </div>
			          <div style="float: left;margin-top: 10px;margin-right: 20px;">
				          <table>
					          <tr><td><input id="propTotal" type="checkbox" onkeyup="PreviewFieldDelayed(1000);" onmouseup="PreviewFieldDelayed(1000);"/><label style="cursor:pointer;" for="propTotal" lang-text="js_Total">Total</label></td></tr>
					          <tr><td><input id="propVG" type="checkbox" onkeyup="PreviewFieldDelayed(1000);" onmouseup="PreviewFieldDelayed(1000);"/><label style="cursor:pointer;" for="propVG" lang-text="js_VisualGroup">Visual Group</label></td></tr>
                    <tr><td><input id="propMultilineHeader" type="checkbox" onkeyup="PreviewFieldDelayed(1000);" onmouseup="PreviewFieldDelayed(1000);"/><label style="cursor:pointer;" for="propMultilineHeader" lang-text="js_MultilineHeader">Multiline Header</label></td></tr>
					          <tr><td>
							        <div style="width:100%;">
								        <div class="multi-valued-check-advanced"><label msv="L" msvs="L,M,R" id="labelJ" onclick="javascript:UpdateMSV('labelJ', true);">L</label></div>
								        <label onclick="javscript:UpdateMSV('labelJ', true);" style="cursor:pointer;" lang-text="js_LabelJustification">Label Justification</label>
							        </div>
						        </td></tr>
					          <tr><td>
							        <div style="width:100%;">
							          <div class="multi-valued-check-advanced"><label msv="&nbsp;" msvs="&nbsp;,L,M,R" id="valueJ" onclick="javascript:UpdateMSV('valueJ', true);">&nbsp;</label></div>
							          <label onclick="javascript:UpdateMSV('valueJ', true);" style="cursor:pointer;" lang-text="js_ValueJustification">Value Justification</label>
							        </div>
						        </td></tr>
                    <tr><td><label lang-text="js_Width">Width</label><input id="propWidth" type="text" style="margin-left:5px;width: 100px;" onkeyup="PreviewFieldDelayed(1000);"/></td></tr>
				          </table>
			          </div>
			          <div style="float: right;margin-top: 10px;"><div id="fieldSamplePreview" style="width:200px;"></div></div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>

<script type="text/javascript">
    var oldLeftHeight = 0;
    var leftDiv;
    var pdiv;
    var whiteHeader;
    var blueHeader;
    var fieldPopup;

    function FixLayoutForIE8() {
        if (is_ie9_or_newer)
            return;
        var span5 = document.getElementById('rootRightDiv');
        span5.style.display = 'inline-block';
        span5.style.marginLeft = '30px';
        span5.style.float = 'none';
        var span7 = document.getElementById('leftDiv');
        span7.style.display = 'inline-block';
        span7.style.width = '57%';
        span7.style.float = 'none';
        var mainContentPh = document.getElementById('mainContentPh');
        if (mainContentPh != null) {
            mainContentPh.style.borderStyle = 'solid';
            mainContentPh.style.borderWidth = '1px';
            mainContentPh.style.borderColor = '#FFFFFF';
        }
    }

    function checkLeftHeight() {
        var newLeftHeight = leftDiv.clientHeight;
        if (newLeftHeight != oldLeftHeight) {
            oldLeftHeight = newLeftHeight;
        }
    }


    function updatePreviewPosition(event) {
        if (whiteHeader == null || blueHeader == null)
            return;
        var y = jq$(this).scrollTop();
        var pdtop = whiteHeader.clientHeight + blueHeader.clientHeight;
        var msgAboutBottom = document.getElementById('msgAboutBottom');
        if (typeof msgAboutBottom == 'undefined')
            msgAboutBottom = null;
        if (window.innerWidth >= 768) {
            if (jq$(leftDiv).width() >= 790) {
                rootRightDiv.style.width = (window.innerWidth - 895) + 'px';
            }
            else {
                rootRightDiv.style.width = '41%';
            }
            document.getElementById('dottedSeparatorDiv').style.display = '';
            pdiv.style.borderTop = '';
            pdiv.style.width = '100%';
            pdiv.style.marginLeft = '0px';
            if (y >= pdtop) {
                var newPos = y - pdtop;
                if (newPos < 0)
                    newPos = 0;
                if (newPos > oldLeftHeight - 400)
                    newPos = oldLeftHeight - 400;
                pdiv.style.top = newPos + "px";
            } else {
                pdiv.style.top = "0px";
            }
            databasesDiv.style.height = (window.innerHeight - 271 - jq$("#metaDsHead").height()) + 'px';
            databasesDiv.style.overflowY = 'auto';
            pdiv.style.position = defaultPdivPos;
            previewWrapperDiv = document.getElementById('previewWrapper');
            if (typeof previewWrapperDiv == 'undefined' || previewWrapperDiv == null)
                previewWrapperDiv = document.getElementById('previewWrapperEmpty');
            if (typeof previewWrapperDiv != 'undefined' && previewWrapperDiv != null) {
                previewWrapperDiv.style.height = (window.innerHeight - 248 - jq$("#previewH2").height()) + 'px';
                previewWrapperDiv.style.overflowX = 'auto';
                previewWrapperDiv.style.overflowY = 'auto';
                previewWrapperDiv.style.paddingRight = '28px';
            }
            if (msgAboutBottom != null)
                msgAboutBottom.style.display = 'none';
        }
        else {
            databasesDiv.style.height = defaultDbHeight;
            databasesDiv.style.overflowY = defaultDbOverflowY;
            pdiv.style.position = 'absolute';
            pdiv.style.marginLeft = '-16px';
            previewWrapperDiv = document.getElementById('previewWrapper');
            if (typeof previewWrapperDiv == 'undefined' || previewWrapperDiv == null)
                previewWrapperDiv = document.getElementById('previewWrapperEmpty');
            if (typeof previewWrapperDiv != 'undefined' && previewWrapperDiv != null) {
                previewWrapperDiv.style.height = defaultPwHeight;
                previewWrapperDiv.style.overflowY = defaultPwOverflowY;
                previewWrapperDiv.style.paddingRight = defaultPwPaddingRight;
            }
            document.getElementById('dottedSeparatorDiv').style.display = 'none';
            pdiv.style.borderTop = '3px dotted #CCCCCC';
            pdiv.style.width = '100%';
            rootRightDiv.style.width = '100%';
            var newPosB = window.innerHeight + y - (212 + pdtop);
            if (newPosB > oldLeftHeight)
                newPosB = oldLeftHeight;
            pdiv.style.top = newPosB + "px";
            if (msgAboutBottom != null)
                msgAboutBottom.style.display = 'inline-block';
        }
    }

    function initializeTables(database$) {
        if (database$.length > 0) {
            var hId = database$[0].id;
            hId = hId.substr(4);
            var contentDiv = document.getElementById('rdb' + hId);
            var currHtml = contentDiv.innerHTML;
            if (currHtml != IzLocal.Res("js_Loading", "Loading..."))
                return;
            var html = renderTables(databaseSchema[hId].tables, hId);
            contentDiv.innerHTML = html;

            //begin some app
            initDraggable();
            jq$(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
                event.preventDefault();
            });
            var triggersHtml = "<span class='f-trigger' data-view='fields-view'> \
              <img src='rs.aspx?image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
            </span> \
            <span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
            <span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
            <span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";
            jq$(".table-view-triggers").filter(function (index) {
                var shouldBeReturned = false;
                var npAttr;
                try {
                    npAttr = this.getAttribute('notProcessed1');
                }
                catch (e) {
                    npAttr = '0';
                }
                if (npAttr == '1') {
                    shouldBeReturned = true;
                    this.setAttribute('notProcessed1', '0');
                }
                return shouldBeReturned;
            }).append(triggersHtml);

            jq$(".table").each(function () {
                setView(jq$(this), "fields-view");
            });

            jq$(".field-popup-trigger").mouseup(function (event) {
                event.cancelBubble = true;
                (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
                (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
                var parent = this.parentElement;
                var fieldSqlName = parent.getAttribute('fieldid');
                if (fieldSqlName != null && fieldSqlName != '') {
                    ShowFieldProperties(fieldSqlName, parent.children[2].innerHTML, parent.getAttribute('id'));
                }
                var fieldName = jq$(this).parent().find(".field-name").text();
                return false;
            });
        }
    }

    jq$(document).ready(function () {
        FixLayoutForIE8();
        GetInstantReportConfig();
    });

    jq$(".database-header a").live("click", function () {
        var dbh = jq$(this).parent().parent();
        initializeTables(dbh);
        dbh.toggleClass("opened", animationTime);
        setTimeout(DsDomChanged, animationTime + 100);
    });

    jq$(".table-header a").live("click", function () {
        initFieldsDsp(this);
        var dsh = jq$(this).parent().parent();
        dsh.toggleClass("opened", animationTime);
        setTimeout(DsDomChanged, animationTime + 100);
    });

    jq$("a.field .preview").live("click", function (event) {
        event.cancelBubble = true;
        (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
        (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
        if (previewWasVisible)
            return;
        var field = jq$(this).closest(".field");
        var isShown = field.hasClass("show-preview");
        hideFieldsPreview();
        if (!field.find('.preview-image').html())
            PreviewField(jq$(this).attr("fieldId"), field.find('.preview-image'));
        if (!isShown)
            field.addClass("show-preview");
        //  if (!isShown) field.addClass("show-preview", animationTime/2);
    });

    jq$(".table-header a .checkbox-container").live("click", function (event) {
        event.cancelBubble = true;
        (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
        (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
    });

    jq$("a.field").live("click", function () {
        hideFieldsPreview();
    });

    jq$("a.collapse").live("click", function () {
        collapseAll();
    });

    function collapseAll() {
        jq$(".database-header a, .table-header a").parent().parent().removeClass("opened", animationTime);
    }

    function collapseTables() {
        var tables = jq$(".table-header a");
        for (var tCnt = 0; tCnt < tables.length; tCnt++)
            if (tables[tCnt].children[0].getAttribute('sorder') == '-1')
                jq$(tables[tCnt]).closest(".table").removeClass("opened", animationTime);
    }

    function checkUsedTables() {
        jq$(".table").each(function (i, el) {
            el = jq$(el);
            if (el.find(".field.checked").length) {
                el.addClass("checked");
            } else {
                el.removeClass("checked");
            };
        });
    }

    function clearView(table) {
        table.each(function () {
            var arrayClasses = jq$(this).attr("class").split(" ");
            for (var i = 0; i < arrayClasses.length; i++) {
                if (arrayClasses[i].indexOf('-view') != -1) jq$(this).removeClass(arrayClasses[i]);
            }
        });
    }

    function setView(table, view) {
        clearView(table);
        table.addClass(view);
        table.attr('data-view', view);
        var trigger = table.find("span[data-view=" + view + "]");
        selectTrigger(trigger);
    }

    function selectTrigger(trigger) {
        trigger.parent().children().removeClass("selected");
        trigger.addClass("selected");
    }

    function restoreViews() {
        jq$(".table.fields-view .table-view-triggers span[data-view='fields-view']").addClass("selected");
    }

    function hideFieldsPreview() {
        var fields = jq$(".field");
        fields.removeClass("show-preview");
    }

    checkUsedTables();

    var animationTime = 200; // Animation animationTime

</script>


<script type="text/javascript">
    function GetDialogWidth() {
        var dialogWidth = 960; // default width for desktop
        if (jq$(window).width() < 1000)
            dialogWidth = jq$(window).width() - 20;
        return dialogWidth;
    }

    jq$(function () {
        jq$("#help").dialog({
            autoOpen: false,
            width: 960,
            height: "auto", height: 640,
            modal: true,
            buttons: {
                "Continue": function () {
                    jq$(this).dialog("close");
                }
            },
            show: { effect: "fade", duration: 200, },
            hide: { effect: "fade", duration: 200, }
        });
        jq$("#help_trigger").click(function () {
            jq$("#help").dialog("open");
            return false;
        });

        fieldPopup = jq$("#data-source-field").dialog({
            autoOpen: false,
            width: GetDialogWidth(),
            height: "auto",
            modal: true,
            buttons: {
                "OK": function () {
                    StoreFieldProps(FP_CollectProperties());
                    jq$(this).dialog("close");
                    if (updateOnAdvancedOk)
                        PreviewReportManual();
                },
                "Cancel": function () {
                    jq$(this).dialog("close");
                }
            },
            open: function () {
                jq$(this).parents(".ui-dialog-buttonpane button:eq(0)").focus();
            },
            show: { effect: "fade", duration: 200, },
            hide: { effect: "fade", duration: 200, },
            beforeClose: function (event, ui) {
                jq$('#fieldSamplePreview').html('');
            }
        });

        jq$(".field-popup-trigger").mouseup(function (event) {
            event.cancelBubble = true;
            (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
            (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
            var parent = this.parentElement;
            var fieldSqlName = parent.getAttribute('fieldid');
            if (fieldSqlName != null && fieldSqlName != '') {
                ShowFieldProperties(fieldSqlName, parent.children[2].innerHTML, parent.getAttribute('id'));
            }
            var fieldName = jq$(this).parent().find(".field-name").text();

            fieldPopup.dialog("option", "title", fieldName);
            fieldPopup.dialog("open");
            return false;
        });

        jq$(".ui-widget-overlay").live("click", function () {
            jq$("#help").dialog("close");
            jq$("#data-source-field").dialog("close");
        });

    });
</script>

<script type="text/javascript">
    initDataSources("rs.aspx?wscmd=getjsonschema");
</script>
