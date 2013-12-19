<%@ Control Language="C#" AutoEventWireup="true" %>


  <title>Dashboards</title>

  <link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jquery-ui-1.8.21.custom2" />
  <link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.custom_dashboard" />
  <link rel="stylesheet" type="text/css" href="./rs.aspx?css=DashboardViewer" />
  <link rel="stylesheet" type="text/css" href="rs.aspx?css=ModernStyles.jqui_modified2" />
  <link rel="stylesheet" type="text/css" href="./Resources/css/base.css"/>
  <link rel="stylesheet" type="text/css" href="./Resources/css/report-list-modal.css" />
  <script type="text/javascript" src="./rs.aspx?js=jQuery.DashboardViewer"></script>
  <script type="text/javascript" src="./rs.aspx?js=jQuery.NewDashboardControls"></script>
  <script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery-1.9.1.min"></script>
  <script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery-ui-1.10.0.min"></script>
  <script type="text/javascript" src="rs.aspx?js=ModernScripts.jquery.blockUI"></script>

  <script type="text/javascript">

    //Save and Save As code----------------------------------------------------------------------------------------------------------
    var additionalCategories = new Array();

    function GetCategoriesList() {
      var requestString = 'wscmd=crscategories';
      AjaxRequest('./rs.aspx', requestString, GotCategoriesList, null, 'crscategories');
    }

    function GotCategoriesList(returnObj, id) {
      if (id != 'crscategories' || returnObj == undefined || returnObj == null)
        return;
      var fieldWithRn = document.getElementById('reportNameFor2ver');
      var nodes = fieldWithRn.value.split('\\\\');
      var curCatName = '';
      var curRepName = nodes[0];
      if (nodes.length > 1) {
        curCatName = nodes[0];
        curRepName = nodes[1];
      }
      var newReportName = document.getElementById('newReportName');
      var newCategoryName = document.getElementById('newCategoryName');
      newReportName.value = curRepName;
      var catsArray = new Array();
      catsArray[catsArray.length] = '';
      for (var acCnt = 0; acCnt < additionalCategories.length; acCnt++)
        catsArray[catsArray.length] = additionalCategories[acCnt];
      if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
        for (var index = 0; index < returnObj.AdditionalData.length; index++)
        catsArray[catsArray.length] = returnObj.AdditionalData[index];
      newCategoryName.options.length = 0;
      for (var index = 0; index < catsArray.length; index++) {
        var opt = new Option();
        opt.value = catsArray[index];
        opt.text = catsArray[index].replace('+', ' ');
        if (opt.value == curCatName && additionalCategories.length == 0)
          opt.selected = 'selected';
        if (additionalCategories.length > 0 && opt.value == additionalCategories[additionalCategories.length - 1])
          opt.selected = 'selected';
        newCategoryName.add(opt);
      }
      var saveAsDialog = document.getElementById('saveAsDialog');
      var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
      saveAsDialog.style.height = windowHeight + 'px';
      saveAsDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
      saveAsDialog.style.display = '';
    }

    function ShowSaveAsDialog() {
      additionalCategories.length = 0;
      GetCategoriesList();
    }

    function SaveReportAs() {
      var newRepName = document.getElementById('newReportName').value;
      var newCatName = document.getElementById('newCategoryName').value;
      var fieldWithRn = document.getElementById('reportNameFor2ver');
      fieldWithRn.value = newCatName + '\\\\' + newRepName;
      saveAsDialog.style.display = 'none';
      SaveReportSet();
    }

    function SaveReportSet() {
      var fieldWithRn = document.getElementById('reportNameFor2ver');
      var rnVal = fieldWithRn.value;
      if (rnVal == null || rnVal == '') {
        setTimeout(ShowSaveAsDialog, 100);
        return;
      }
      var loadingrv2 = document.getElementById('loadingrv2');
      var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
      loadingrv2.style.height = windowHeight + 'px';
      loadingrv2.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
      loadingrv2.style.display = '';
      var requestString = 'wscmd=savecurrentreportset';
      requestString += '&wsarg0=' + rnVal;
      AjaxRequest('./rs.aspx', requestString, ReportSetSaved, null, 'savecurrentreportset');
    }

    function ReportSetSaved(returnObj, id) {
      if (id != 'savecurrentreportset' || returnObj == undefined || returnObj == null || returnObj.Value == null)
        return;
      document.getElementById('loadingrv2').style.display = 'none';
      if (returnObj.Value != 'OK')
        alert(returnObj.Value);
    }

    function ShowNewCatDialog() {
      document.getElementById('addedCatName').value = '';
      var saveAsDialog = document.getElementById('saveAsDialog');
      saveAsDialog.style.display = 'none';
      var newCatDialog = document.getElementById('newCatDialog');
      var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
      newCatDialog.style.height = windowHeight + 'px';
      newCatDialog.style.paddingTop = ((windowHeight / 2) - 20) + 'px';
      newCatDialog.style.display = '';
    }

    function AddNewCategory() {
      additionalCategories[additionalCategories.length] = document.getElementById('addedCatName').value;
      var newCatDialog = document.getElementById('newCatDialog').style.display = 'none';
      GetCategoriesList();
    }
    //------------------------------------------------------------------------------------------------------------------------



    function FixLoadingPos() {
      var ls = document.getElementById('loadingScreen');
      var limg = document.getElementById('limg');
      var lw = document.getElementById('loadingWord');
      if (document.body == null || ls == null || limg == null || lw == null) {
        setTimeout(FixLoadingPos, 10);
        return;
      }
      var vSize = document.body.offsetHeight;
      ls.style.paddingTop = (vSize / 3) + 'px';
      limg.style.display = '';
      lw.innerHTML = 'Loading...';
  }
  setTimeout(FixLoadingPos, 10);

    function GoToCatTab(rn) {
      $('#loadingBg')
        .fadeIn(1000, function() {
          $('#loadingScreen').fadeIn(400, function() {
            window.location = 'dashboards?rn=' + rn;
          });
        });
      return;
    }

    $(function() {
      $(".cbControlTab > input:button").button();
      $(".dashboard-view-button").button({ icons: { primary: 'ui-icon-search' }, text: false });
      $(".dashboard-design-button").button({ icons: { primary: 'ui-icon-gear' }, text: false });
      $(".refresh-button").button({ icons: { primary: 'ui-icon-refresh'} });
      $(".dashboard-hide-button").button({ icons: { primary: 'ui-icon-triangle-1-s' }, text: false });
      $(".dashboard-hide-button").click(function() { ToggleReport(this); });

      $("#btn-effects-apply").button();

      $("#cdTabs").tabs({
      });
      $('#cdTabs .tabs-header').css('padding-left', $('.btn-toolbar').width());

    $("#btn-effects-apply").click(function() {
      var speed = parseInt($("#tabselect-duration").val(), 10);
      if (isNaN(speed) || speed == undefined)
        speed = 1000;
      var fxOptions = { duration: speed };
      if ($("#chk-effect-height").attr("checked") == "checked")
        fxOptions.height = "toggle";
      if ($("#chk-effect-width").attr("checked") == "checked")
        fxOptions.width = "toggle";
      if ($("#chk-effect-opacity").attr("checked") == "checked")
        fxOptions.opacity = "toggle";
      $("#cdTabs").tabs("option", "fx", fxOptions);
    });



    var animationEnded = false;
    function ToggleReport(button) {
      var content = $(button).parent().parent().find(".dashboard-report-content");
      var innerContent = content.find(".report-part-container");

      var isVisible = $(content).is(":visible");
      var options = {};
      var effectType = $("#effect-type").val();
      var effectDuration = parseInt($("#effect-duration").val());
      if (effectDuration == undefined || isNaN(effectDuration))
        effectDuration = 1000;

      var chartEffectType = $("#charts-effect-type").val();
      var chartEffectDuration = parseInt($("#charts-duration").val());
      if (chartEffectDuration == undefined || isNaN(chartEffectDuration))
        chartEffectDuration = 1000;

      animationEnded = false;
      if (isVisible) {
        if (chartEffectType == "") {
          animationEnded = true;
          $(content).hide(effectType, options, effectDuration);
          $(button).button({ icons: { primary: 'ui-icon-triangle-1-n' }, text: false });
          return;
        }

        if ($(innerContent).find("imgff").filter(function() {
          return ($(this).width() > 50 || $(this).height() > 50 || $(this).attr("usemap") != undefined)
        }).length > 0)
          $(innerContent).find("imgff").filter(function() {
            return ($(this).width() > 50 || $(this).height() > 50 || $(this).attr("usemap") != undefined)
          }).hide(chartEffectType, options, chartEffectDuration, function() {
            if (animationEnded)
              return;
            animationEnded = true;
            $(content).hide(effectType, options, effectDuration);
            $(button).button({ icons: { primary: 'ui-icon-triangle-1-n' }, text: false });
          });
        else {
          $(content).hide(effectType, options, effectDuration);
          $(button).button({ icons: { primary: 'ui-icon-triangle-1-n' }, text: false });
        }
      }
      else {
        if (effectType == "") {
          animationEnded = true;
          $(content).show();
          $(innerContent).find("imgff").filter(function() {
            return ($(this).width() > 50 || $(this).height() > 50 || $(this).attr("usemap") != undefined)
          }).show(chartEffectType, options, chartEffectDuration);
          $(button).button({ icons: { primary: 'ui-icon-triangle-1-s' }, text: false });
          return;
        }

        $(content).show(effectType, options, effectDuration, function() {
          if (animationEnded)
            return;
          animationEnded = true;
          $(innerContent).find("imgff").filter(function() {
            return ($(this).width() > 50 || $(this).height() > 50 || $(this).attr("usemap") != undefined)
          }).show(chartEffectType, options, chartEffectDuration);
          $(button).button({ icons: { primary: 'ui-icon-triangle-1-s' }, text: false });
        });
      }
    }

    function FixReportsWidth() {
      var mainDiv = document.getElementById('dashboardsDiv');
      if (window.innerWidth >= 1050) {
        mainDiv.style.paddingLeft = '36px';
        mainDiv.style.paddingRight = '36px';
      }
      else {
        mainDiv.style.paddingLeft = '0px';
        mainDiv.style.paddingRight = '0px';
      }
      var newWidth = $("#cdTabs").width();
      var halfWidth = (newWidth - 4 - 5 * 4) * 0.5 - 4;
      var fullWidth = newWidth - 4 - 5 * 2;
      $(".dashboard-content-row").each(function() {
        var reportsInRow = $(this).find(".dashboard-part").length;
        if (reportsInRow == 2)
          $(this).find(".dashboard-part").css("width", halfWidth + "px");
        else if (reportsInRow == 1)
          $(this).find(".dashboard-part").css("width", fullWidth + "px");
      });

      return;

      var newWidth = $("#cdTabs").width();
      $(".dashboard-part-table").each(function() {
        $(this).find(" > tbody > tr").each(function() {
          var reportsInRow = $(this).find(".dashboard-part").length;
          if (reportsInRow > 0) {
            var reports = $(this).find(".dashboard-part");
            var rowWidth = 0;
            for (var i = 0; i < reports.length; i++)
              rowWidth += $(reports[0]).width();
            if (rowWidth > newWidth - 10 - 10 * (reportsInRow - 1) - 6 * reportsInRow)
              $(this).find(".dashboard-part").css("width", (newWidth / reportsInRow - 10 * (reportsInRow - 1) - 5 * reportsInRow) + "px");
            else
              $(this).find(".dashboard-part").css("width", "");
          }
        });
      });
    }

    $(window).resize(function(e) {
      FixReportsWidth();
    });

    // Init

    $(window).load(function() {
      $('#loadingScreen').fadeOut(400, function() {
        $('#loadingBg').fadeOut(1000, function() {
          //fixSelectsInIE();
        });
      });
      FixReportsWidth();
    });

    fixSelectsInIE();
    function fixSelectsInIE() {
      try {
        var tmpStyle1 = jq$('select[name$="_Filters_Column"]').attr("style");
        if (!tmpStyle1)
          tmpStyle1 = "";
        jq$('select[name$="_Filters_Column"]').css("_wa", "_blank").attr("style", tmpStyle1);
        var tmpStyle2 = jq$('select[name$="_Filters_SelectValue"]').attr("style");
        if (!tmpStyle2)
          tmpStyle2 = "";
        jq$('select[name$="_Filters_SelectValue"]').css("_wa", "_blank").attr("style", tmpStyle2);
      }
      catch (exc) { }
    }

    if (typeof (SwitchTab) != typeof (undefined))
      SwitchTab();

  });

  function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
    );
  }

  $(document).ready(function() {
    var rn = getURLParameter('rn');
    if (rn != undefined && rn != '') {
      var designDbBtn = document.getElementById('designDbBtn');
      var href = $(designDbBtn).attr('href');
      var separator = '?';
      if (href.indexOf('?') >= 0)
          separator = '&';
      if (rn != '' && rn != null && rn != 'null')
          href += separator + 'rn=' + rn;
      designDbBtn.setAttribute('href', href);
    }

    $('#addDashboardLink').click(function() {
      $(location).attr('href', 'DashboardDesigner.aspx?clear=1');
    });
    //      $('#addDashboardLink').click(function () {
    //        var reportListSelector = new ReportListSelector({
    //          selectedHandler: function (e) {
    //            e.preventDefault();
    //            var url = 'rs.aspx?wscmd=addparttocurrentdashboard&wsarg0=';
    //            url += e.report.encodedUrl.replace(/\\\\\\\\/, '\\\\');
    //            url += '&wsarg1=';
    //            url += e.report.subreport;
    //            console.log(url);
    //            $.ajax({
    //              url: url
    //            }).done(function (data) {
    //              console.log('add: ');
    //              console.log(data);
    //
    //              $.urlParam = function (name) {
    //                var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    //                if (results == null)
    //                  return null;
    //                return results[1] || 0;
    //              };
    //              var fieldWithRn = $.urlParam('rn');
    //              url = 'rs.aspx?wscmd=savecurrentreportset';
    //              if (fieldWithRn != null) {
    //                url += '&wsarg0=' + fieldWithRn;
    //              }
    //              console.log(url);
    //              $.ajax({
    //                url: url
    //              }).done(function (data2) {
    //                console.log('save: ');
    //                console.log(data2);
    //                location.reload();
    //              });
    //            });
    //          }
    //        });
    //        reportListSelector.openModalReportList();
    //    });
  });
  </script>
