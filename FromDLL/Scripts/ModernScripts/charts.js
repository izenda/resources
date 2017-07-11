// Copyright (c) 2005-2013 Izenda, L.L.C. - ALL RIGHTS RESERVED    

// Add new chart

$(function () {
	$('#add_chart').dialog({
		autoOpen: true,
		width: 960,
		height: "auto", height: 640,
		modal: true,
		buttons: {
			"Continue": function () {
				$(this).dialog("close");
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
	$('#dialog_link').click(function () {
		$('#dialog').dialog('open');
		return false;
	});
	$('#add_chart_link').click(function () {
		$('#add_chart').dialog('open');
		return false;
	});

	$('.ui-widget-overlay').live("click", function() {
		//Close the dialog
		$("#add_chart").dialog("close");
		$("#dialog").dialog("close");
	});

	$(function() {
		$( "#v-tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
	});
});


$(document).keydown(function(e)
{
    if (e.which == 116) // key code of the F5 button
    {
        document.location.reload();
     }
}); 


$(document).ready(function() {
//	$("#myModal").modal("show");
	$(".chart-type-selector").parent().parent().addClass("has-chart-type-selector");

	$('a[href="#edit_title"], .h2').live("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).closest("h2").find("input").removeClass("h2").focus().focusout(function() {
			$(this).closest("h2").find("input").addClass("h2");
		});

	});
});


