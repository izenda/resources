/* Copyright (c) 2005 Izenda, Inc.

 ____________________________________________________________________
|                                                                   |
|   Izenda .NET Component Library                                   |
|                                                                   |
|   Copyright (c) 2005 Izenda, Inc.                                 |
|   ALL RIGHTS RESERVED                                             |
|                                                                   |
|   The entire contents of this file is protected by U.S. and       |
|   International Copyright Laws. Unauthorized reproduction,        |
|   reverse-engineering, and distribution of all or any portion of  |
|   the code contained in this file is strictly prohibited and may  |
|   result in severe civil and criminal penalties and will be       |
|   prosecuted to the maximum extent possible under the law.        |
|                                                                   |
|   RESTRICTIONS                                                    |
|                                                                   |
|   THIS SOURCE CODE AND ALL RESULTING INTERMEDIATE FILES           |
|   ARE CONFIDENTIAL AND PROPRIETARY TRADE                          |
|   SECRETS OF DEVELOPER EXPRESS INC. THE REGISTERED DEVELOPER IS   |
|   LICENSED TO DISTRIBUTE THE PRODUCT AND ALL ACCOMPANYING .NET    |
|   CONTROLS AS PART OF AN EXECUTABLE PROGRAM ONLY.                 |
|                                                                   |
|   THE SOURCE CODE CONTAINED WITHIN THIS FILE AND ALL RELATED      |
|   FILES OR ANY PORTION OF ITS CONTENTS SHALL AT NO TIME BE        |
|   COPIED, TRANSFERRED, SOLD, DISTRIBUTED, OR OTHERWISE MADE       |
|   AVAILABLE TO OTHER INDIVIDUALS WITHOUT EXPRESS WRITTEN CONSENT  |
|   AND PERMISSION FROM DEVELOPER EXPRESS INC.                      |
|                                                                   |
|   CONSULT THE END USER LICENSE AGREEMENT(EULA FOR INFORMATION ON  |
|   ADDITIONAL RESTRICTIONS.                                        |
|                                                                   |
|___________________________________________________________________|
*/

AdHoc.MatrixEditorBaseControl = function(id) {
	if (typeof(id) == "string") {
		this.id = id;
		this.table = document.getElementById(id);
	}
	else {
		this.table = id;
		this.id = this.table.id;
	}
	this.maxrowcount = this.table.getAttribute("maxrow");
	this.minrowcount = this.table.getAttribute("minrow");
	this.maxcolcount = this.table.getAttribute("maxcol");
	this.mincolcount = this.table.getAttribute("mincol");
	this.curcolcount = this.table.getAttribute("curcol");
	var body = this.table.tBodies[0];
	var rows = body.rows;
	var rowsLength = rows.length;
	var ri = 0;
	var ci = 0;
	var isfull = true;	
	for (; ri < rowsLength; ri++) {
		for (ci = 0; ci < this.curcolcount; ci++)
			if (this.getCellContent(ri, ci) == "") {
				isfull = false;
				break;
			}
		if (!isfull) break;
	}
	this.emptycellrowindex = ri;
	this.emptycellcolindex = ci;
	this.currowcount = this.emptycellcolindex == 0 ? this.emptycellrowindex : this.emptycellrowindex + 1;
}

AdHoc.MatrixEditorBaseControl.controls = new Array();
AdHoc.MatrixEditorBaseControl.RegisterControl = function(id) {
	AdHoc.MatrixEditorBaseControl.controls.push(id);
}
AdHoc.MatrixEditorBaseControl.Init = function() {
	AdHoc.ResponseServer.RegisterBeforeSubmitHandler("AdHoc.MatrixEditorBaseControl.RenameControls()");
	AdHoc.ResponseServer.RegisterAfterSubmitHandler("AdHoc.MatrixEditorBaseControl.RenameControls(true)");
}
AdHoc.MatrixEditorBaseControl.RenameControls = function(undo) {
	if(undo==null) undo = false;
	var controls = AdHoc.MatrixEditorBaseControl.controls;
	var controlsCount = controls.length;
	for (var i = 0; i < controlsCount; i++) {
		var table = document.getElementById(controls[i]);
		if (table != null) {
			var body = table.tBodies[0];
			if(body!=null) {
				var rows = body.rows;
				var rowsCount = rows.length;
				for (var j = 0; j < rowsCount; j++)	{
					var cells = rows[j].cells;
					var cellsCount = cells.length;
					for (var k = 0; k < cellsCount; k++) {
						var children;
						if(isNetscape)
							children = cells[k].childNodes;
						else
							children = cells[k].children;
						if (children != null)
							for (var l = 0; l < children.length; l++)
								AdHoc.MatrixEditorBaseControl.internalSetName(children[l], j, k, undo);
					}
				}
			}
		}
	}
}	
AdHoc.MatrixEditorBaseControl.internalSetName = function(elem, n, m, undo) {
	if(undo==null) undo = false;
	if (elem.name != null) {
		var suffix = n + "_" + m;
		if(undo) elem.name = elem.name.substring(0, elem.name.length - suffix.length);
		else elem.name = elem.name + suffix;
	}
	var children;
	if(isNetscape) children = elem.childNodes;
	else children = elem.children;
	if (children != null)
		for (var i = 0; i < children.length; i++)
			AdHoc.MatrixEditorBaseControl.internalSetName(children[i], n, m, undo);
}

AdHoc.MatrixEditorBaseControl.prototype = {

// public methods

	// move up cell content
	moveUpCell: function(rowIndex, colIndex) {
		if (colIndex == null) {
			colIndex = this.getCellColIndex(rowIndex);
			rowIndex = this.getCellRowIndex(rowIndex);
		}
		if (rowIndex == 0) return;
		this.exchangeCellsContent(rowIndex, colIndex, rowIndex - 1, colIndex);
	},
	
	// move down cell content
	moveDownCell: function(rowIndex, colIndex) {
		if (colIndex == null) {
			colIndex = this.getCellColIndex(rowIndex);
			rowIndex = this.getCellRowIndex(rowIndex);
		}
		if (rowIndex == this.getRowsCount() - 1) return;
		if (rowIndex == this.emptycellrowindex - 1 && colIndex >= this.emptycellcolindex) return;
		this.exchangeCellsContent(rowIndex, colIndex, rowIndex + 1, colIndex);
	},
	
	// move left cell content
	moveLeftCell: function(rowIndex, colIndex) {
		if (colIndex == null) {
			colIndex = this.getCellColIndex(rowIndex);
			rowIndex = this.getCellRowIndex(rowIndex);
		}
		if (colIndex == 0) {
			if (rowIndex == 0) return;
			this.exchangeCellsContent(rowIndex, colIndex, rowIndex - 1, this.curcolcount - 1);
		}
		else
			this.exchangeCellsContent(rowIndex, colIndex, rowIndex, colIndex - 1);
	},
	
	// move right cell content
	moveRightCell: function(rowIndex, colIndex) {
		if (colIndex == null) {
			colIndex = this.getCellColIndex(rowIndex);
			rowIndex = this.getCellRowIndex(rowIndex);
		}
		if (colIndex == this.curcolcount - 1) {
			if (rowIndex == this.getRowsCount() - 1 || rowIndex == this.currowcount - 1) return;
			this.exchangeCellsContent(rowIndex, colIndex, rowIndex + 1, 0);
		}
		else if (colIndex == this.emptycellcolindex - 1 && rowIndex == this.emptycellrowindex) return;
		else this.exchangeCellsContent(rowIndex, colIndex, rowIndex, colIndex + 1);
	},
	
	// set content for the first empty cell
	addCell: function(content) {
		if (this.isFull()) return;
		this.setCellContent(content, this.emptycellrowindex,this.emptycellcolindex);
		this.currowcount = (this.emptycellcolindex = 0) ? this.emptycellrowindex : this.emptycellrowindex + 1;
	},
	
	// remove cell content
	removeCell: function(rowIndex, colIndex) {
		if (colIndex == null)
		{
			colIndex = this.getCellColIndex(rowIndex);
			rowIndex = this.getCellRowIndex(rowIndex);
		}
		this.setCellContent("", rowIndex, colIndex);
		var k = colIndex + 1;
		var l = rowIndex;
		if (colIndex == this.curcolcount - 1) {
			l++;
			k = 0;
		}
		for (var ri = l; ri < this.maxrowcount; ri++)
		{
			for (var ci = k; ci < this.curcolcount; ci++)
			{
				this.exchangeCellsContent(rowIndex, colIndex, ri, ci);
				rowIndex = ri;
				colIndex = ci;
			}
			k = 0;
		}
		return ri+","+ci;
		//this.currowcount = (this.emptycellcolindex = 0) ? this.emptycellrowindex : this.emptycellrowindex + 1;
	},
	
	getAllCells: function() {
		var body = this.table.tBodies[0];
		var rows = body.rows;
		var rowsLength = rows.length;
		var cellsCollection = new Array();
		for (var i=0;i<rowsLength;i++) {
			var cells = rows[i].cells;
			var cellsLength = cells.length;
			for (var j=0;j<cellsLength;j++)
				if (cells[j].innerHTML != "")
				 cellsCollection.push(cells[j]);
		}
		return cellsCollection;
	},
	
// private methods
	
	// get columns count
	getColumnsCount: function() {
		return this.curcolcount;
	},
	
	// get rows count
	getRowsCount: function() {
		return this.currowcount;
	},
	
	// are all cells of matrix not empty
	isFull: function() {
		var body = this.table.tBodies[0];
		var rows = body.rows;
		var rowsLength = rows.length;
		var ri = 0;
		var ci = 0;
		var isfull = true;
		for (; ri < rowsLength; ri++) {
			for (ci = 0; ci < this.curcolcount; ci++)
				if (this.getCellContent(ri, ci) == "") {
					isfull = false;
					break;
				}
			if (!isfull) break;
		}
		this.emptycellrowindex = ri;
		this.emptycellcolindex = ci;
		return isfull;
	},
	
	// get row by index
	getRow: function(index) {
		return this.table.tBodies[0].rows[index];
	},
	
	// get cell by row and column indeces
	getCell: function(rowIndex, colIndex) {
		if (colIndex == null) return rowIndex;
		var row = this.getRow(rowIndex);
		return row.cells[colIndex];
	},
	
	getCellColIndex: function(cell) {
		return cell.cellIndex;
	},
	
	getCellRowIndex: function(cell) {
		var rows = this.table.rows;
		var rowlength = rows.length;
		for (var i = 0;i < rowlength;i++)
		{
			var cells = rows[i].cells;
			for (var j = 0;j < cells.length;j++)
				if (cells[j] == cell)
					return i;
		}
	},
	
	// change columns count
	//TODO: implement changing of columns count on client
	
	
	// get content of specified cell
	getCellContent: function(rowIndex, colIndex) {
		var cell;
		if (colIndex == null) cell = rowIndex;
		else cell = this.getCell(rowIndex, colIndex);
		return cell.innerHTML;
	},
	
	// set new content for specified cell
	setCellContent: function(newContent, rowIndex, colIndex) {
		var cell;
		if (colIndex != null) cell = this.getCell(rowIndex, colIndex);
		else cell = rowIndex;
		var oldContent = cell.innerHTML;
		cell.innerHTML = newContent;
		return oldContent;
	},
	
	// exchange content of specified cells
	exchangeCellsContent: function(rowIndex1, colIndex1, rowIndex2, colIndex2) {
		if (colIndex2 == null) {
			colIndex2 = rowIndex2;
			rowIndex2 = colIndex1;
			colIndex1 = this.getCellColIndex(rowIndex1);
			rowIndex1 = this.getCellRowIndex(rowIndex1);
		}
		var content1 = this.getCellContent(rowIndex1, colIndex1);
		var content2 = this.setCellContent(content1, rowIndex2, colIndex2);
		this.setCellContent(content2, rowIndex1, colIndex1);
	}
}