function ActivateNewDashboardViewerControls() {
	if (typeof(jq2$) == 'undefined') {
		jq2$ = jq$;
	}
  var animationEnded = false;

  function ToggleReport(button) {
    var content = jq2$(button).parent().parent().find(".db-dashboard-report-content");
    var innerContent = content.find(".db-report-part-container");
    var isVisible = jq2$(content).is(":visible");
    var options = {};
    var effectType = jq2$("#effect-type").val();
    var effectDuration = parseInt(jq2$("#effect-duration").val());
    if (effectDuration == undefined || isNaN(effectDuration))
      effectDuration = 1000;
    var chartEffectType = jq2$("#charts-effect-type").val();
    var chartEffectDuration = parseInt(jq2$("#charts-duration").val());
    if (chartEffectDuration == undefined || isNaN(chartEffectDuration))
      chartEffectDuration = 1000;
    animationEnded = false;
    if (isVisible) {
      if (chartEffectType == "") {
        animationEnded = true;
        jq2$(content).hide(effectType, options, effectDuration);
        jq2$(button).button({ icons: { primary: 'db-ui-icon-triangle-1-n' }, text: false });
        return;
      }
      if (jq2$(innerContent).find("imgff").filter(function() {
        return (jq2$(this).width() > 50 || jq2$(this).height() > 50 || jq2$(this).attr("usemap") != undefined)
      }).length > 0)
        jq2$(innerContent).find("imgff").filter(function() {
          return (jq2$(this).width() > 50 || jq2$(this).height() > 50 || jq2$(this).attr("usemap") != undefined)
        }).hide(chartEffectType, options, chartEffectDuration, function() {
          if (animationEnded)
            return;
          animationEnded = true;
          jq2$(content).hide(effectType, options, effectDuration);
          jq2$(button).button({ icons: { primary: 'db-ui-icon-triangle-1-n' }, text: false });
        });
      else {
        jq2$(content).hide(effectType, options, effectDuration);
        jq2$(button).button({ icons: { primary: 'db-ui-icon-triangle-1-n' }, text: false });
      }
    } else {
      if (effectType == "") {
        animationEnded = true;
        jq2$(content).show();
        jq2$(innerContent).find("imgff").filter(function() {
          return (jq2$(this).width() > 50 || jq2$(this).height() > 50 || jq2$(this).attr("usemap") != undefined)
        }).show(chartEffectType, options, chartEffectDuration);
        jq2$(button).button({ icons: { primary: 'db-ui-icon-triangle-1-s' }, text: false });
        return;
      }
      jq2$(content).show(effectType, options, effectDuration, function() {
        if (animationEnded)
          return;
        animationEnded = true;
        jq2$(innerContent).find("imgff").filter(function() {
          return (jq2$(this).width() > 50 || jq2$(this).height() > 50 || jq2$(this).attr("usemap") != undefined)
        }).show(chartEffectType, options, chartEffectDuration);
        jq2$(button).button({ icons: { primary: 'db-ui-icon-triangle-1-s' }, text: false });
      });
    }
  }

  jq2$(".db-dashboard-view-button").button({ icons: { primary: 'db-ui-icon-search' }, text: false });
  jq2$(".db-dashboard-design-button").button({ icons: { primary: 'db-ui-icon-gear' }, text: false });
  jq2$(".db-dashboard-hide-button").button({ icons: { primary: 'db-ui-icon-triangle-1-s' }, text: false });
  jq2$(".db-dashboard-hide-button").click(function() { ToggleReport(this); });

}