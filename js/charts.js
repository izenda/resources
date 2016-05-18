// Copyright (c) 2005-2013 Izenda, L.L.C. - ALL RIGHTS RESERVED    

// Add new chart

jq$(function () {
	jq$('#add_chart').dialog({
		autoOpen: true,
		width: 960,
		height: "auto", height: 640,
		modal: true,
		buttons: {
			"Continue": function () {
				jq$(this).dialog("close");
			}
		},
		show: {
			effect: 'fade',
			duration: 200,
		},
		hide: {
			effect: 'fade',
			duration: 200,
		}
	});

	// Dialog Link
	jq$('#dialog_link').click(function () {
		jq$('#dialog').dialog('open');
		return false;
	});
	jq$('#add_chart_link').click(function () {
		jq$('#add_chart').dialog('open');
		return false;
	});

	jq$('.ui-widget-overlay').live("click", function () {
		//Close the dialog
		jq$("#add_chart").dialog("close");
		jq$("#dialog").dialog("close");
	});

	jq$(function () {
		jq$("#v-tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
	});
});


jq$(document).keydown(function (e)
{
    if (e.which == 116) // key code of the F5 button
    {
        document.location.reload();
     }
}); 


jq$(document).ready(function () {
//	$("#myModal").modal("show");
	jq$(".chart-type-selector").parent().parent().addClass("has-chart-type-selector");

	jq$('a[href="#edit_title"], .h2').live("click", function (event) {
		event.preventDefault();
		event.stopPropagation();
		jq$(this).closest("h2").find("input").removeClass("h2").focus().focusout(function () {
			jq$(this).closest("h2").find("input").addClass("h2");
		});

	});
});


