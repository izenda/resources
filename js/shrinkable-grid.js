function ToggleReportGrid(table, columnsToHide) {
	var innerTables = new Array();

	// Show all columns in case there is hidden columns already
	jq$(table).find('tr > td').show();
	// Remove previously created inner tables
	jq$(table).find('.inner-field-value-table').closest('tr').remove();
	// Remove show/hide control
	jq$(table).find('.inner-grid-toggle-control').remove();

	if (columnsToHide <= 0)
		return;

	// Extract header
	var headerValues = new Array();
	var headerRowCells$ = jq$(table).find('tr.ReportHeader td:nth-last-child(-n+' + columnsToHide + ')');
	headerRowCells$.each(function () {
		headerValues.push(jq$(this).text());
	});

	// Generate inner tables for each row
	jq$(table).find('tr:not(.ReportHeader)').each(function (idx) {
		var row$ = jq$(this);
		var cells$ = row$.find('td:nth-last-child(-n+' + columnsToHide + ')');

		var innerTable$ = jq$(document.createElement('table'));
		innerTable$.attr('class', 'inner-field-value-table');
		cells$.each(function (i) {
			var innerRow$ = jq$(document.createElement('tr'));

			var headerCell$ = jq$(document.createElement('td'));
			headerCell$.attr('class', 'field');
			headerCell$.text(headerValues[i]);

			var valueCell$ = jq$(document.createElement('td'));
			valueCell$.attr('class', 'value');
			valueCell$.html(jq$(this).html());

			innerRow$.append(headerCell$);
			innerRow$.append(valueCell$);
			innerTable$.append(innerRow$);
		});
		innerTables.push(innerTable$);
	});

	// Modify Report Grid
	jq$(table).find('tr').each(function (i) {
		row$ = jq$(this);

		// Hide columns wich were copied to the inner grid
		row$.find('td:nth-last-child(-n+' + columnsToHide + ')').hide();

		// Insert hiddable row with inner grid
		if (!row$.hasClass("ReportHeader")) {
			var newRow$ = jq$(document.createElement('tr'));
			newRow$.attr('class', row$.attr('class') + ' hiddable');
			var newCell$ = jq$(document.createElement('td'));
			newCell$.attr('colspan', row$.find('td').length - columnsToHide);
			newCell$.append(innerTables[i - 1]);

			newRow$.append(newCell$);
			newRow$.hide();
			row$.after(newRow$);

			// Add show/hide control to the target row
			row$.find('td:first').prepend('<img class="inner-grid-toggle-control" onclick="ToggleInnerGrid(this)" src="rs.aspx?image=plus.gif"/>');
		}
	});
}

function ToggleReportGrids() {
	if (jq$('.ReportTable.SimpleGrid tr').length > 5001)
		return;
	var reportTables$ = jq$('.ReportTable.SimpleGrid');
	reportTables$.each(function () {
		var this$ = jq$(this);
		var columnsToHide = 0;
		jq$(this$.find('.ReportHeader td').get().reverse()).each(function () {
			if (NeedHideColumn(this))
				columnsToHide++;
		});
		
		var oldColumnsToHide = this$.data('columns-to-hide');
		if (oldColumnsToHide == null || oldColumnsToHide != columnsToHide)
			ToggleReportGrid(this$, columnsToHide);
		this$.data('columns-to-hide', columnsToHide);
	});
}

function ToggleInnerGrid(element) {
	jq$(element).closest('tr').next('.hiddable').toggle(500);
	ToggleControlIcon(element);
}

function ToggleControlIcon(element) {
	var baseUrl = 'rs.aspx?image=';
	var src = jq$(element).attr('src').toString();
	if (src.indexOf('plus.gif', src.length - 'plus.gif'.length) !== -1)
		jq$(element).attr('src', baseUrl + 'minus.gif');
	else
		jq$(element).attr('src', baseUrl + 'plus.gif');
}

function NeedHideColumn(header) {
	header$ = jq$(header);
	var rightBorder = header$.offset().left + header$.width();
	if (header$.data('right-border'))
		rightBorder = header$.data('right-border');
	if (rightBorder > jq$('body').innerWidth()) {
		header$.data('right-border', rightBorder);
		return true;
	}
	return false;
}

jq$(window).resize(function () {
	ToggleReportGrids();
});

jq$(document).ready(function () {
	if (typeof (ReportScripting) != 'undefined' && ReportScripting.postRenderHandlers != undefined)
		ReportScripting.postRenderHandlers.push(function () { ToggleReportGrids(); });
});