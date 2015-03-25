// ------------------------------

AdHoc.TableRowDragZone = function(table, dragGroup) {
	this.dragGroup = dragGroup;
	this.maintainOffeset = true;
	AdHoc.TableRowDragZone.superclass.constructor.call(this, table);
}

Ext.extend(AdHoc.TableRowDragZone, Ext.dd.DragZone, {
	getDragData : function(e) {
		this.maintainOffeset = true;
		var el = Ext.lib.Event.getTarget(e);
		var td = AdHoc.Utility.findParentElement(el, "td");
		if (td==null || AdHoc.Utility.getName(td)!='dragIcon')
			return;
		var tr = AdHoc.Utility.findParentElement(el, "tr");
		var table = AdHoc.Utility.findParentElement(tr, "table");
		
		if (tr.rowIndex>table.rows.length-2)
			return;
			
		return { ddel: tr }
	},
	
	onInitDrag : function(e) {
		this.maintainOffeset = true;
	    	var tr = this.dragData.ddel;
		var r = Ext.lib.Dom.getRegion(tr);
    		tr.style.display='none';
	    	var dragElement = AdHoc.Utility.cloneRow(tr);
		dragElement.style.width = r.right-r.left;
		dragElement.width = r.right-r.left;
		this.proxy.update(dragElement);
	},
	
	autoOffset: function(iPageX, iPageY) {
	        var x = iPageX - this.startPageX;
        	var y = -15;
	        this.setDelta(x, y);
	},

	getRepairXY : function() {
	
	}


});
// ------------------------------
AdHoc.RowInsertPosition = function(row, relativePosition) {
	this.row = row;
	this.relativePosition = relativePosition;
}
// ------------------------------

AdHoc.TableRowDropZone = function(table, dragGroup) {
	this.table = table;
	this.dragGroup = dragGroup;
	this.glyphDrawer = null;
	this.rowInsertPosition = null;
	AdHoc.TableRowDropZone.superclass.constructor.call(this, table);
}

Ext.extend(AdHoc.TableRowDropZone, Ext.dd.DropZone, {
	
	ensureGlyphDrawerInitialized : function() {
		if (this.glyphDrawer!=null)
			return;
		this.glyphDrawer = new AdHoc.RowDDGlyphDrawer(this.table);
	},
	
	getTargetFromEvent : function(e){
		return this.table;
	},
	
	onNodeOut : function(n, dd, e, data){
		this.hideGlyph();
    },
    
	onNodeOver : function(n, dd, e, data) {
	//document.getElementById("status").value = "w:"+ data.ddel.style.width;
		var t = Ext.lib.Event.getTarget(e);
		if (!AdHoc.Utility.isParent(t, this.table) && t!=this.table) {
			this.rowInsertPosition = null;
			this.hideGlyph();
			return false;
		}
		var tr = t==this.table ? null : AdHoc.Utility.findParentElement(t, "tr");
		
		var tHead = (AdHoc.Utility.findParentElement(tr, "thead") != null);
		
		if (tHead)
		{
			this.rowInsertPosition = null;
			this.hideGlyph();
			return false;
		}
		
		if (this.glyphDrawer && this.glyphDrawer.isGlyphElement(tr)) 
			return true;

		if (!tr)
			if (!this.rowInsertPosition) {
				this.rowInsertPosition = null;
				this.hideGlyph();
				return false;
			}
			else {
				this.showGlyph();
				return true;
			}
			
		if (tr.rowIndex<0 || tr.rowIndex>this.table.rows.length-2) 
		{
			this.rowInsertPosition = null;
			this.hideGlyph();
			return false;
		}		

		var newRowInsertPosition = this.getRowInsertPosition(e, tr);
		if (newRowInsertPosition) {
			this.rowInsertPosition = newRowInsertPosition;
			this.showGlyph();
			return true;
		}
		else {
			this.rowInsertPosition = null;
			this.hideGlyph();
			return false;
		}
	},
	
	hideGlyph : function() {
		if (this.glyphDrawer!=null)
			this.glyphDrawer.hideGlyph();
		// show drop-no icon
	},
	
	showGlyph : function() {
		if (!this.rowInsertPosition)
			return;
		this.ensureGlyphDrawerInitialized();
		this.glyphDrawer.showGlyph(this.rowInsertPosition);
		// hide drop-no icon
	},

	getRowInsertPosition : function(e, tr) {
		var y = Ext.lib.Event.getPageY(e);
		var r = Ext.lib.Dom.getRegion(tr);
		if (y>=r.top && y<=r.top+4)
			return new AdHoc.RowInsertPosition(tr, AdHoc.RelativePosition.Before);
		if (y<=r.bottom && y>=r.bottom-4)
			return new AdHoc.RowInsertPosition(tr, AdHoc.RelativePosition.After);
		return null;
	},
	
	onNodeDrop : function(n, dd, e, data) {
		if (!this.rowInsertPosition)
			return false;
		var draggedTr = data.ddel;
		AdHoc.Utility.moveRow(draggedTr, this.rowInsertPosition);
		draggedTr.style.display = "";
		return true;
	}
});
// ------------------------------

AdHoc.RowDDGlyphDrawer = function(table) {
		this.table = table;
		this.glyphRow = null;
	}
	
AdHoc.RowDDGlyphDrawer.prototype = {
	createGlyphRow : function(rowPosition) {
		var initialIndex = rowPosition.relativePosition==AdHoc.RelativePosition.Before 
			? rowPosition.row.rowIndex 
			: rowPosition.row.rowIndex+1;
			
		var colCount = AdHoc.Utility.getColumnCount(this.table);
		var newRow = this.table.insertRow(initialIndex);
		var newCell = newRow.insertCell(0);
		newCell.colSpan = colCount;
		var glyph = document.createElement('div');
		glyph.innerHTML = '<div class="InsertTableRowGlyph" id="InsertTableRowGlyphElement" ></div>';
		newCell.appendChild(glyph.firstChild);
		return newRow;
	},
	
	hideGlyph : function() {
		if (this.glyphRow==null)
			return;
		this.glyphRow.parentNode.removeChild(this.glyphRow);
		this.glyphRow = null;
	},
	
	isGlyphElement : function(element) {
		if (this.glyphRow==null)
			return false;
		return AdHoc.Utility.isParent(element,this.glyphRow);
	},

	showGlyph : function(rowInsertPosition)	{
		if (this.glyphRow==null)
			this.glyphRow = this.createGlyphRow(rowInsertPosition);
		else 
			AdHoc.Utility.moveRow(this.glyphRow, rowInsertPosition);
	}
}	
//-----------------------------
