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
                <div class="data-sources-header css-only-clearfix">
                  <h6 lang-text="js_CreateNewReport">Create a new report</h6>
                  <h1 lang-text="js_SelectDataSources" style="float: left;">Select Data Sources</h1>
                  <div class="search-container">
                    <input type="text" class="" id="fieldSearch" title="Search" accesskey="f" value="" lang-title="js_Search">
                    <span id="fieldSearchMessage" class="search-wait hidden" lang-text="js_Searching">Searching...</span>
                    <a id="fieldSearchClearBtn" class="clear" href="#clear"></a>
                    <a id="fieldSearchBtn" class="find" href="#find"></a>
                    <div id="fieldSearchAutoComplete" class="searchAutoComplete hidden"></div>
                  </div>
                </div>

                <div class="controls">
                  <a class="collapse" href="#collapseall" lang-text="js_CollapseAll"><img src="rs.aspx?image=ModernImages.collapse.png" alt="collapse" lang-alt="js_Collapse" style="" />Collapse all</a> 
                  <a class="uncheck" href="#all" lang-text="js_UncheckAll"><img src="rs.aspx?image=ModernImages.remove-icon.png" alt="remove" lang-alt="js_Remove" style="" />Uncheck all</a>
                </div>

                <div class="database-description css-only-clearfix">
                  <div class="">Database</div>
                  <div class="">Table</div>
                  <div class="">Fields</div>
                </div>

                <div class="databases" id="databases"></div>
              <div class="buttons">
                <a class="button" href="#back" lang-text="js_Back">Back</a>
                <a class="button" href="#design_report" onclick="DesignReportRequest(CollectReportData());" lang-text="js_DesignReport">Design report</a> 
                <a class="button default" href="#view_report" onclick="ViewReportRequest(CollectReportData());" lang-text="js_ViewReport">View report</a> 
              </div>
              <div id="dottedSeparatorDiv" class="separator" style="position: absolute; width: 0; height: 100%; right: -28px; top: 0;"></div>
            </div>
        </div>

        <div class="span5" id="rootRightDiv" style="height:0px;">
            <div class="right-help" id="rightHelpDiv" style="margin-left: 0px; padding-top: 10px; padding-left: 10px; padding-right: 10px; padding-bottom: 10px;">
              <!--
              <h2>Help</h2>
              <p>This help moves down on phones and other narrow screens.</p>
              <a href="#" id="help_trigger">Open modal help</a>
              <div id="help" title="Modal help">
                <p>
                  Some help information goes here.
                </p>
              </div>
              -->
            </div>
            <div id="fieldPropertiesDialogContainer"></div>
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
    var y = $(this).scrollTop();
    var rhdLeft = pdiv.offsetLeft;
    var pdtop = whiteHeader.clientHeight + blueHeader.clientHeight;
    if (rhdLeft > 100) {
      document.getElementById('dottedSeparatorDiv').style.display = '';
      pdiv.style.borderTop = '';
      pdiv.style.width = 'auto';
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
    }
    else {
            document.getElementById('dottedSeparatorDiv').style.display = 'none';
        pdiv.style.borderTop = '3px dotted #CCCCCC';
        if (!is_ie9_or_newer)
            pdiv.style.width = '100%';
        var newPosB = window.innerHeight + y - (212 + pdtop);
        if (newPosB > oldLeftHeight)
          newPosB = oldLeftHeight;
        pdiv.style.top = newPosB + "px";
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
      $(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
        event.preventDefault();
      });
      var triggersHtml = "<span class='f-trigger' data-view='fields-view'> \
              <img src='rs.aspx?image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
            </span> \
            <span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
            <span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
            <span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";
      $(".table-view-triggers").filter(function (index) {
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

      $(".table").each(function () {
        setView($(this), "fields-view");
      });

      $(".field-popup-trigger").mouseup(function (event) {
          event.cancelBubble = true;
          (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
          (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
        var parent = this.parentElement;
        var fieldSqlName = parent.getAttribute('fieldid');
        if (fieldSqlName != null && fieldSqlName != '') {
          ShowFieldProperties(fieldSqlName, parent.children[2].innerHTML, parent.getAttribute('id'));
        }
        var fieldName = $(this).parent().find(".field-name").text();
        return false;
      });
    }
  }

  $(document).ready(function () {
      FixLayoutForIE8();
      GetInstantReportConfig();
  });

  $(".database-header a").live("click", function () {
    var dbh = $(this).parent().parent();
    initializeTables(dbh);
    dbh.toggleClass("opened", animationTime);
    setTimeout(DsDomChanged, animationTime + 100);
  });

  $(".table-header a").live("click", function() {
    initFieldsDsp(this);
    var dsh = $(this).parent().parent();
    dsh.toggleClass("opened", animationTime);
    setTimeout(DsDomChanged, animationTime + 100);
  });

  $("a.field .preview").live("click", function (event) {
      event.cancelBubble = true;
      (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
      (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
    if (previewWasVisible)
      return;
    var field = $(this).closest(".field");
    var isShown = field.hasClass("show-preview");
    hideFieldsPreview();
    if (!field.find('.preview-image').html())
      PreviewField($(this).attr("fieldId"), field.find('.preview-image'));
    if (!isShown)
      field.addClass("show-preview");
    //  if (!isShown) field.addClass("show-preview", animationTime/2);
  });

  $(".table-header a .checkbox-container").live("click", function (event) {
      event.cancelBubble = true;
      (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
      (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
  });

  $("a.field").live("click", function () {
    hideFieldsPreview();
  });

  $("a.uncheck").live("click", function () {
    NDS_UnckeckAllDs();
  });

  $("a.collapse").live("click", function () {
    collapseAll();
  });

  function collapseAll() {
    $(".database-header a, .table-header a").parent().parent().removeClass("opened", animationTime);
  }

  function collapseTables() {
    var tables = $(".table-header a");
    for (var tCnt = 0; tCnt < tables.length; tCnt++)
      if (tables[tCnt].children[0].getAttribute('sorder') == '-1')
        $(tables[tCnt]).closest(".table").removeClass("opened", animationTime);
  }

  function checkUsedTables() {
    $(".table").each(function (i, el) {
      el = $(el);
      if (el.find(".field.checked").length) {
        el.addClass("checked");
      } else {
        el.removeClass("checked");
      };
    });
  }

  function clearView(table) {
    table.each(function () {
      var arrayClasses = $(this).attr("class").split(" ");
      for (var i = 0; i < arrayClasses.length; i++) {
        if (arrayClasses[i].indexOf('-view') != -1) $(this).removeClass(arrayClasses[i]);
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
    $(".table.fields-view .table-view-triggers span[data-view='fields-view']").addClass("selected");
  }

  function hideFieldsPreview() {
    var fields = $(".field");
    fields.removeClass("show-preview");
  }

  checkUsedTables();
  InitEmptyPreviewArea('#rightHelpDiv');
  var animationTime = 200; // Animation animationTime

</script>


<script type="text/javascript">
  $(function () {
    $("#help").dialog({
      autoOpen: false,
      width: 960,
      height: "auto", height: 640,
      modal: true,
      buttons: {
        "Continue": function () {
          $(this).dialog("close");
        }
      },
      show: { effect: "fade", duration: 200, },
      hide: { effect: "fade", duration: 200, }
    });
    $("#help_trigger").click(function () {
      $("#help").dialog("open");
      return false;
    });

    var fieldPropertiesDialogContainer = document.getElementById('fieldPropertiesDialogContainer');
    FP_AppendDialogMarkup(fieldPropertiesDialogContainer, true);
    fieldPopup = $("#data-source-field").dialog({
      autoOpen: false,
      width: 950,
      height: "auto",
      modal: true,
      buttons: {
        "OK": function () {
          StoreFieldProps(FP_CollectProperties());
          $(this).dialog("close");
          if (updateOnAdvancedOk)
            PreviewReportManual();
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      },
      open: function () {
        $(this).parents(".ui-dialog-buttonpane button:eq(0)").focus();
      },
      show: { effect: "fade", duration: 200, },
      hide: { effect: "fade", duration: 200, },
      beforeClose: function (event, ui) {
          $('#fieldSamplePreview').html('');
      }
    });

    $(".field-popup-trigger").mouseup(function (event) {
        event.cancelBubble = true;
        (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
        (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
      var parent = this.parentElement;
      var fieldSqlName = parent.getAttribute('fieldid');
      if (fieldSqlName != null && fieldSqlName != '') {
        ShowFieldProperties(fieldSqlName, parent.children[2].innerHTML, parent.getAttribute('id'));
      }
      var fieldName = $(this).parent().find(".field-name").text();

      fieldPopup.dialog("option", "title", fieldName);
      fieldPopup.dialog("open");
      return false;
    });

    $(".ui-widget-overlay").live("click", function () {
      $("#help").dialog("close");
      $("#data-source-field").dialog("close");
    });

  });
</script>

<script type="text/javascript">
  initDataSources("rs.aspx?wscmd=getjsonschema");
</script>
