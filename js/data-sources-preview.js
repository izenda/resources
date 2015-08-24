function DataSourcesPreview(domTable) {
    var that = this;
    var previewTable = null;
    var columnWidths = null;
    var columnData = null;
    var min = 100000, max = 0;
    var originalSelector = null;

    /**
	 * Table initialization
	 */
    var initialize = function (domTableSelector) {
        originalSelector = domTableSelector;
        previewTable = jq$(domTableSelector);
        if (!collectSelectedFields()) {
            return;
        }
        columnWidths = collectColumnWidths();
        log(previewTable.parent(), previewTable.clone());
        prepareToDataTable();
        initDataTable();
        resizeHandler();
        initResize();
    };

    /**
	 * Data tables initialization
	 */
    var initDataTable = function () {
        if (oDatatable == undefined || oDatatable == null)
            oDatatable = {};

        var columnsCount = jq$(originalSelector).find('tr.ReportHeader').find('th').length;
        var order = [];
        for (var i = 0; i < columnsCount; i++)
            order.push(i);

    	// init datatable
        var aaSortingArr = new Array();
        for (var index = 0; index < columnData.length; index++) {
        	if (typeof columnData[index]['sorting'] == 'undefined' || columnData[index]['sorting'] == null)
        		continue;
        	if (columnData[index]['sorting'] == '1')
        		aaSortingArr[aaSortingArr.length] = [index, 'asc'];
        	else if (columnData[index]['sorting'] == '-1')
        		aaSortingArr[aaSortingArr.length] = [index, 'desc'];
        }
        if (aaSortingArr.length == 0)
        	aaSortingArr[aaSortingArr.length] = [0, 'asc'];
        oDatatable[originalSelector] = previewTable.dataTable({
        	"aaSorting": aaSortingArr,
            "sDom": 'R',
            "bPaginate": false,
            "bDestroy": true,
            "bAutoWidth": false,
            "oColReorder": {
                "aiOrder" : order,
                "fnReorderCallback": function (fromIndex, toIndex) {
                    // reorder items
                	var previewHeaders$ = previewHeaders$ = jq$(this.s.dt.nTable).find('tr.ReportHeader th');
                    if (previewHeaders$ && previewHeaders$.length > 0) {
                        for (var j = 0; j < previewHeaders$.length; j++) {
                        	var th$ = jq$(previewHeaders$[j]);
                            var itmId = th$.attr('itmId');
                            var itm$ = jq$('#' + itmId);
                            itm$.attr('sorder', min + j);
                        }
                    }
                    initResize();

                    ReorderColumnsInAllTables(fromIndex, toIndex);
                },
                "fnInsertCallback": function (evt, toIndex) {
                    var rTableOffset = previewTable.offset();
                    var w = jq$(previewTable).width();
                    var h = jq$(previewTable).height();
                    if (rTableOffset != null)
                        if (evt.pageX < rTableOffset.left - 100 || evt.pageX > rTableOffset.left + w + 100
							|| evt.pageY < rTableOffset.top || evt.pageY > rTableOffset.top + h)
                            return;
                    var previewHeaders$ = previewTable.find('tr.ReportHeader th');
                    if (previewHeaders$ && previewHeaders$.length > 0) {
                        fieldDragged$.attr('sorder', toIndex + min);
                        for (var j = 0; j < previewHeaders$.length; j++) {
                        	var th$ = jq$(previewHeaders$[j]);
                            var itmId = th$.attr('itmId');
                            var itm$ = jq$('#' + itmId);
                            if (j >= toIndex) {
                                itm$.attr('sorder', min + j + 1);
                            }
                        }
                    }

                    var helperAttr = fieldDragged$.attr('onmouseup');
                    if (helperAttr != null) {
                        eval(helperAttr.replace('FiClick', 'FiClickForcedDrag'));
                    }
                },
                'fnRemoveCallback': function(evt, index) {
                    var previewHeaders$ = previewTable.find('tr.ReportHeader th');
                    if (previewHeaders$ && previewHeaders$.length > 0)
                        for (var j = 0; j < previewHeaders$.length; j++)
                            if (j == index) {
                            	var th$ = jq$(previewHeaders$[j]);
                                var itmId = th$.attr('itmId');
                                var itm$ = jq$('#' + itmId);
                                itm$.attr('sorder', '-1');
                                var helperAttr = itm$.attr('onmouseup');
                                if (helperAttr != null)
                                    eval(helperAttr.replace('FiClick', 'FiClickForcedDrag'));
                                itm$.removeClass('checked');
                            }
                } 
            }
        });
        ColReorder.fnReset(oDatatable[originalSelector]);

        initResize();
        // init droppable
        previewTable.droppable({
            accept: 'a.field',
            drop: function (event, ui) {
                fieldsDragPreformingNow = false;
            }
        });
    };
	
    // handle resize:
    var resizeHandler = function (e) {
        var getBorderIndex = function (border) {
            var sibling = border;
            var childrenCount = border.parentElement.childElementCount;
            if (childrenCount == undefined)
                childrenCount = border.parentElement.children.length;
            for (var i = 0; i < childrenCount; i++) {
                if (sibling.previousSibling == null) {
                    return i;
                    break;
                }
                else
                    sibling = sibling.previousSibling;
            }
        };
        var previewHeaders$ = previewTable.find('tr.ReportHeader th');
        if (previewHeaders$ && previewHeaders$.length > 0) {
            for (var j = 0; j < previewHeaders$.length; j++) {
                if (e == undefined || e.target == undefined || e.target == null)
                    break;
                var th$ = jq$(previewHeaders$[j]);
                var itmId = th$.attr('itmId');
                var width = th$.width();
                var itm$ = jq$('#' + itmId);
                var borderIndex = getBorderIndex(e.target.parentElement);
                if (j == borderIndex || j == borderIndex - 1)
                    itm$.attr('itemWidth', width);
            }
        }
        if (e != undefined && e.currentTarget != undefined && e.currentTarget != null)
		    ResizeColumnsInAllTables(e.currentTarget);
		logCurrentWidth();
    };

    var initResize = function () {
        if (originalSelector == "table.ReportTable" || originalSelector == "table.ReportTable_1") {
            // column resize
            previewTable.colResizable({
                disable: true
            });
            previewTable.colResizable({
                liveDrag: false,
                onResize: resizeHandler
            });
        }
    }

	var prepareToDataTable = function () {
		
		// remove old report header and footer
		var trContent = [];
		var trFooterContent = [];
		var isReportFooterExist = false;
		var collectHeaderInfo = function() {
			jq$.each(previewTable.find('tr.ReportHeader').children(), function (idx, item) {
				var html = jq$(item).html();
			    var htmlInd = -1;
			    try {
			        htmlInd = trContent.indexOf(html);
			    }
			    catch (e) {
			        htmlInd = -1;
			    }
			    if (htmlInd < 0)
			        trContent.push(html);
			});
		};
		var collectFooterInfo = function() {
			jq$.each(previewTable.find('tr.ReportFooter').children(), function (idx, item) {
				var html = jq$(item).html();
				trFooterContent.push(html);
				isReportFooterExist = true;
			});
		};
		collectHeaderInfo();
		collectFooterInfo();

		var headerAligns = new Array();
		previewTable.find('tr.ReportHeader td').each(function (idx) {
			var elem$ = jq$(this);
			if (elem$.attr('align'))
				headerAligns.push(elem$.attr('align'));
		});
		previewTable.find('tr.ReportHeader').remove();
		
		var footerAligns = new Array();
		if (isReportFooterExist) {
		  if (previewTable.find('tr.ReportFooter').length > 0) {
		    for (var i = 0; i < previewTable.find('tr.ReportFooter')[0].children.length; i++) {
  		    footerAligns[footerAligns.length] = previewTable.find('tr.ReportFooter')[0].children[i].getAttribute('align');
  		    if (footerAligns[footerAligns.length - 1] != 'left' && footerAligns[footerAligns.length - 1] != 'right' && footerAligns[footerAligns.length - 1] != 'center') {
  		      footerAligns[footerAligns.length - 1] = 'right';
  		    }
		    }
		  }
			previewTable.find('tr.ReportFooter').remove();
	  }
		
		// create table header
		var createHeader = function () {
			var thead$ = jq$('<thead>');
			thead$.prependTo(previewTable);
			var tr$ = jq$('<tr>');
			tr$.prependTo(thead$);
			tr$.addClass('ReportHeader');
			var i = 0;
			var vg$ = jq$(previewTable).find('tr.VisualGroup').clone();
			if (vg$.length > 0) 
			    i = 1;
			jq$(previewTable).find('tr.VisualGroup').remove();
			jq$.each(trContent, function (idx, item) {
				var th$ = jq$('<th>');
				th$.attr('sorder', columnData[i]['sorder']);
				th$.attr('itmId', columnData[i]['id']);
				th$.css('width', columnWidths[i]);
				if (headerAligns.length >= idx)
					th$.attr('align', headerAligns[idx]);
				th$.html(item);
				th$.appendTo(tr$);
				i++;
			});
			vg$.prependTo(thead$);
		};
		createHeader();
		
		// create table footer
		var createFooter = function() {
			var tfoot$ = jq$('<tfoot>');
			tfoot$.appendTo(previewTable);
			var trfoot$ = jq$('<tr>');
			trfoot$.prependTo(tfoot$);
			trfoot$.addClass('ReportFooter');
			jq$.each(trFooterContent, function (idx, item) {
				if (idx < trContent.length) {
					var th$ = jq$('<th>');
					if (footerAligns.length > 0 && idx < footerAligns.length) {
					  th$.css('text-align', footerAligns[idx]);
					}
					th$.html(item);
					th$.appendTo(trfoot$);
				}
			});
		};
		if (isReportFooterExist) {
			createFooter();
		}

		// reset izenda styles
		var resetIzendaStyles = function (reportTable) {
			var itms = jq$(reportTable).find('tr.ReportItem');
			itms.removeClass('ReportItem');
			itms.removeClass('odd');
			itms.removeClass('even');

			itms = jq$(reportTable).find('tr.AlternatingItem');
			itms.removeClass('AlternatingItem');
			itms.removeClass('odd');
			itms.removeClass('even');

			var tds$ = jq$('table.ReportTable>tbody>tr>td');
			tds$.css('min-width', '');
			tds$.css('max-width', '');
			tds$.css('width', '');
		};
		resetIzendaStyles(previewTable);
	};

	/**
	 * Collect field widths in the 
	 */
	var collectColumnWidths = function () {
		var result = [];
		var tdWidthItems = previewTable.find('tr.ReportItem:first td');
		jq$.each(tdWidthItems, function (idx, item) {
			var width = jq$(item).css('width');
			result.push(width);
/*			$(item).css('min-width', width);
			$(item).css('max-width', width);*/
		});
		return result;
	};

	/**
	 * Collect field information from datasources
	 */
	var collectSelectedFields = function () {
		var selectedFields$ = jq$('a.field:not([sorder="-1"])');
		if (selectedFields$ == null || selectedFields$.length == 0) {
			InitEmptyPreviewArea('#rightHelpDiv');
			return false;
		}
		columnData = [];
		jq$.each(selectedFields$, function (idx, item) {
			var itm$ = jq$(item);
			var itmId = itm$.attr('id');
			var sorder = parseInt(itm$.attr('sorder'));
			var sorting = '0';
			if (typeof itm$.attr('sorting') != 'undefined' && itm$.attr('sorting') != null)
				sorting = itm$.attr('sorting');
			var name = itm$.find('span.field-name').text();

			if (fieldsOpts != undefined && fieldsOpts != null
                && fieldsOpts[itm$.attr('fieldid')] != undefined
                && fieldsOpts[itm$.attr('fieldid')] != null
                && fieldsOpts[itm$.attr('fieldid')].VgChecked == true)
			{ } else {

			    if (min > sorder)
			        min = sorder;
			    if (max < sorder)
			        max = sorder;

			    columnData.push({ id: itmId, sorder: sorder, name: name, sorting: sorting });
			}
		});
		columnData = columnData.sort(function (a, b) {
			return a['sorder'] > b['sorder'];
		});
		return true;
	};
	
	/**
	 * log table info
	 */
	var log = function (container, table) {
		return;
		var tableParent = container;
		var logItem = jq$('#previewLog');
		if (logItem.length == 0) {
			var logDiv = jq$('<div></div>');
			logDiv.attr('id', 'previewLog');
			logDiv.css('width', '100%');
			logDiv.css('height', '500px');
			logDiv.css('overflow', 'auto');
			logDiv.css('border', '1px solid red');
			logDiv.css('position', 'absolute');
			logDiv.appendTo(tableParent);

			logDiv.append('initial table:<br/>');
			table.attr('log', 'true');
			logDiv.append(table);

			logDiv.append('widths:<br/>');
			jq$.each(columnWidths, function (idx, item) {
				if (idx < columnWidths.length - 1)
					logDiv.append(item + ', ');
				else
					logDiv.append(item);
			});

			logDiv.append('<br/>data:<br/>');
			jq$.each(columnData, function (idx, item) {
				logDiv.append('id=' + item['id'] + ', sorder=' + item['sorder'] + ', name=' + item['name'] + '<br/>');
			});
		}
	};

	var logCurrentWidth = function () {
		return;
		var logDiv = jq$('#previewLog');
		var items = previewTable.find('tr.ReportHeader th');
		logDiv.append('widths:<br/>');
		jq$.each(items, function (idx, item) {
			if (idx < items.length - 1)
				logDiv.append(jq$(item).width() + ', ');
			else
				logDiv.append(jq$(item).width());
		});
		logDiv.append('<br/>');
	};

	var ReorderColumnsInAllTables = function (fromIndex, toIndex) {
	    // Dirty workaround. Need to know the exact tables count
	    for (var i = 1; i < 1000; i++) {
	        var table = oDatatable['table.ReportTable_' + i];
	        if (table == undefined || table == null)
	            break;
	        {
	            if ('table.ReportTable_' + i != originalSelector)
	                oDatatable['table.ReportTable_' + i]._oPluginColReorder.s.dt.oInstance.fnColReorder(fromIndex, toIndex);
	        } (i);
	    }
	    var masterTable = jq$('table.ReportTable_1');
	    if (masterTable) {
	        masterTable.colResizable({
	            disable: true
	        });
	        masterTable.colResizable({
	            liveDrag: false,
	            onResize: resizeHandler
	        });
	    }
	};

	var InitialResizeColumns = function () {
	    // Dirty workaround. Need to know the exact tables count
	    var maxWidths = [];
	    for (var i = 1; i < 1000; i++) {
	    	var table = jq$('table.ReportTable_' + i);
	        if (table == undefined || table == null)
	            break;
	        table.find('tr.ReportHeader th').each(function (index) {
	            if (index + 1 > maxWidths.length)
	            	maxWidths.push(jq$(this).width());
	            else if (jq$(this).width() > maxWidths[index])
	            	maxWidths[index] = jq$(this).width();
	        });
	    }
	    var sourceTable = jq$('table.ReportTable_1');
	    sourceTable.find('tr.ReportHeader th').each(function (index) {
	    	jq$(this).width(maxWidths[index]);
	        //$(this).css('min-width', maxWidths[index]);
	        //$(this).css('max-width', maxWidths[index]);
	    });
	}

	var GetSortingData = function () {
		var result = new Array();
		var previewHeaders$ = previewTable.find('tr.ReportHeader th');
		if (previewHeaders$ && previewHeaders$.length > 0) {
			for (var j = 0; j < previewHeaders$.length; j++) {
				var th$ = jq$(previewHeaders$[j]);
				var itmId = th$.attr('itmId');
				var sortAttr = th$.attr('aria-sort');
				var sorting = '0';
				if (typeof sortAttr != 'undefined' && sortAttr != null) {
					if (sortAttr == 'ascending')
						sorting = '1';
					else if (sortAttr == 'descending')
						sorting = '-1';
				}
				result[itmId] = sorting;
			}
		}
		return result;
	}

	var ResizeColumnsInAllTables = function (sourceTable) {
	    // Dirty workaround. Need to know the exact tables count
	    for (var i = 2; i < 1000; i++) {
	    	var table = jq$('table.ReportTable_' + i);
	        if (table == undefined || table == null)
	            break;
	        if (i != 1) {
	        	jq$('table.ReportTable_' + i).width('');
	        	jq$('table.ReportTable_' + i).find('tr.ReportHeader th').each(function (index) {
	        		jq$(this).width('');
	        		jq$(this).css("min-width", '');
	        		jq$(this).css("max-width", '');
	            });

	        	jq$('table.ReportTable_' + i).width(jq$(sourceTable).width());
	        	jq$('table.ReportTable_' + i).find('tr.ReportHeader th').each(function (index) {
	        		if (jq$(sourceTable).find('tr.ReportHeader th')[index].style.width)
	        			this.style.width = jq$(sourceTable).find('tr.ReportHeader th')[index].style.width;
                    else
	        			jq$(this).width(jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).width());
	        		if (jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("min-width") != null
                            && jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("min-width") != 'none'
                            && jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("min-width") != '0px'
                            && jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("min-width") != '0')
	        			jq$(this).css("min-width", jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("min-width"));
	                else
	        			jq$(this).css("min-width", '');
	        		if (jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("max-width") != null
                            && jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("max-width") != 'none'
                            && jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("max-width") != '0px'
                            && jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("max-width") != '0')
	        			jq$(this).css("max-width", jq$(jq$(sourceTable).find('tr.ReportHeader th')[index]).css("max-width"));
	                else
	        			jq$(this).css("max-width", '');
	            });
	        }(i);
	    }
	};

	// call constructor
	initialize(domTable);

	// api
	return {
	    initialize: initialize,
	    ResizeColumnsInAllTables: ResizeColumnsInAllTables,
	    InitialResizeColumns: InitialResizeColumns,
	    initResize: initResize,
			GetSortingData: GetSortingData
	};
}

function EBC_ExpandTable_New(row) {
    var rowIndex = row.rowIndex;
    var table = row.parentNode.parentNode;
    var targetTable$ = jq$('.' + jq$(table).attr('targettable'));
    if (targetTable$.is(":visible"))
        targetTable$.hide();
    else
        targetTable$.show();
}