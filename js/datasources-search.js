// Copyright (c) 2005-2013 Izenda, L.L.C. - ALL RIGHTS RESERVED    

function IzendaDatasourcesSearch(databaseSchema, options) {
	var datasourcesSearchOptions = {
		applySearchOnDelay: false
	};
	if (options != null) {
		for (var key in datasourcesSearchOptions) {
			if (key in options) {
				datasourcesSearchOptions[key] = options[key];
			}
		}
	}

	var inputCtrl$ = jq$("#fieldSearch");
	var clearBtn$ = jq$("#fieldSearchClearBtn");
	var searchBtn$ = jq$("#fieldSearchBtn");
	var waitMessage$ = jq$("#fieldSearchMessage");
	var searchAutocomplete$ = jq$("#fieldSearchAutoComplete");
	var currentItem$ = null;
	var autocompleteHover = false;
	var autocompleteTimer = null;

	// Maximum count of items for autocomplete search feature
	var maxAutocompleteItems = 150;

	var databaseStateCache = [];
	var tableStateCache = [];

	/******************************************************************************************
	 * UI handlers
	 ******************************************************************************************/

	/**
	 * Search input key press hadler
	 */
	inputCtrl$.keydown(function (event) {
		var code = (event.keyCode ? event.keyCode : e.which);
		var ctrl = event.ctrlKey;
		if (code == 13) {
			if (autocompleteTimer != null) {
				clearTimeout(autocompleteTimer);
			}
			var searchString = inputCtrl$.val();
			if (searchString) {
				hideAutocomplete();
				if (currentItem$ == null) {
					applySearch({
						type: "string",
						text: searchString
					});
				} else {
					var db = currentItem$.attr("database");
					var table = currentItem$.attr("table");
					var field = currentItem$.attr("field");
					applySearch({
						type: "field",
						database: db,
						table: table,
						field: field
					});
				}
			} else {
				clear(true, true);
			}
		} else if (ctrl && code == 32) {
			// ctrl + space
			event.preventDefault();
			openAutocomplete();
			return false;
		} else if (code == 38) {
			// up
			event.preventDefault();
			searchAutocomplete$.stop();
			navigatePrevItem();
			return false;
		} else if (code == 40) {
			// down
			event.preventDefault();
			searchAutocomplete$.stop();
			navigateNextItem();
			return false;
		} else if (code == 33) {
			// page up
			event.preventDefault();
			searchAutocomplete$.stop();
			searchAutocomplete$.animate({ scrollTop: searchAutocomplete$.scrollTop() - searchAutocomplete$.height() }, "slow");
			return false;
		} else if (code == 34) {
			// page down
			event.preventDefault();
			searchAutocomplete$.stop();
			searchAutocomplete$.animate({ scrollTop: searchAutocomplete$.scrollTop() + searchAutocomplete$.height() }, "slow");
			return false;
		} else if (code == 27) {
			// esc
			event.preventDefault();
			searchAutocomplete$.stop();
			clear(true, true);
			inputCtrl$.val(null);
			return false;
		} else {
			openAutocomplete();
		}
		return true;
	});

	inputCtrl$.focus(function () {
		currentItem$ = null;
		initializeCache();
	});

	inputCtrl$.blur(function (event) {
		event.preventDefault();
		if (!autocompleteHover) {
			currentItem$ = null;
			hideAutocomplete();
		}
	});

	searchAutocomplete$.hover(
		function () { autocompleteHover = true; },
		function () { autocompleteHover = false; }
	);

	/**
	 * Clear search button clicked
	 */
	clearBtn$.click(function () {
		clear(true, true);
		inputCtrl$.val(null);
	});

	/**
	 * Search button clicked
	 */
	searchBtn$.click(function () {
		var searchString = inputCtrl$.val();
		currentItem$ = null;
		hideAutocomplete();
		if (searchString) {
			applySearch({
				type: "string",
				text: searchString
			});
		}
	});

	/******************************************************************************************
	 * Search
	 ******************************************************************************************/

	var openAutocomplete = function () {
		if (autocompleteTimer != null) {
			clearTimeout(autocompleteTimer);
		}
		searchAutocomplete$.stop();
		searchAutocomplete$.animate({ scrollTop: 0 }, 0);

		autocompleteTimer = setTimeout(function () {
			var searchStringA = inputCtrl$.val();
			if (searchStringA) {
				currentItem$ = null;
				autocomplete(searchStringA);
				if (datasourcesSearchOptions['applySearchOnDelay']) {
					applySearch({
						type: "string",
						text: searchStringA
					});
				}
			} else {
				clear(true, true);
			}
		}, 500);
	};

	var initializeCache = function () {
		databaseStateCache = [];
		tableStateCache = [];
		var rdbhInd = -1;
		while (true) {
			rdbhInd++;
			var dbh = document.getElementById('rdbh' + rdbhInd);
			if (typeof dbh == 'undefined' || dbh == null)
				break;
			if (dbh.nodeName != 'DIV')
				continue;
			var classes = ' ' + dbh.className + ' ';
			if (classes.indexOf(' database ') < 0 || classes.indexOf(' opened ') < 0)
				continue;
			var id = jq$(dbh).find("div.database-header").find("a").attr("href");
			databaseStateCache.push(id);
		}
		var tbCnt = -1;
		while (true) {
			tbCnt++;
			var tableChChCh = document.getElementById('tcb' + tbCnt);
			if (typeof tableChChCh == 'undefined' || tableChChCh == null)
				break;
			var tableObj = tableChChCh.parentElement.parentElement.parentElement;
			if (tableObj.nodeName != 'DIV')
				continue;
			var classes = ' ' + tableObj.className + ' ';
			if (classes.indexOf(' table ') < 0 || classes.indexOf(' opened ') < 0)
				continue;
			var id = jq$(tableObj).find("div.table-header").find("a").attr("href");
			tableStateCache.push(id);
		}
		return null;
	};

	/**
	 * Return html string for autosuggest result
	 */
	var getTextDataResult = function (text, searchText) {
		var searchTextLo = searchText.toLowerCase();
		var index = text.toLowerCase().indexOf(searchTextLo);
		if (index < 0)
			return null;

		var part1 = text.substring(0, index);
		var part2 = text.substring(index, index + searchText.length);
		var part3 = text.substring(index + searchText.length, text.length);
		//var fieldNameHtml = part1 + "<span class='autocomplete-item-field-selection'>" + part2 + "</span>" + part3;
		var fieldNameHtml = part1 + "<b>" + part2 + "</b>" + part3;
		return fieldNameHtml;
	};

	/**
	 * parse search string
	 */
	var getFieldSearchResult = function (text) {
		var complexSearch = false;
		var searchTextParts = text.toLowerCase().split(".");
		var searchTextField = searchTextParts[searchTextParts.length - 1];
		var searchTextTable = null;
		var searchTextDatabase = null;
		if (searchTextParts.length > 1) {
			searchTextTable = searchTextParts[searchTextParts.length - 2];
			complexSearch = true;
		}
		if (searchTextParts.length > 2) {
			searchTextDatabase = searchTextParts[searchTextParts.length - 3];
		}
		return {
			searchTextDatabase: searchTextDatabase,
			searchTextTable: searchTextTable,
			searchTextField: searchTextField,
			isComplexSearch: complexSearch
		};
	};

	/**
	 * Find data for autocomplete
	 */
	var getData = function (text) {
		if (!text)
			return [];
		var result = [];

		// check if used "datasource.table.field" search string
		var complexResult = getFieldSearchResult(text);
		var complexSearch = complexResult["isComplexSearch"];
		var searchTextField = complexResult["searchTextField"];
		var searchTextTable = complexResult["searchTextTable"];
		var searchTextDatabase = complexResult["searchTextDatabase"];

		if (databaseSchema == null)
			return result;
		
		// database search
		jq$.each(databaseSchema, function (i, database) {
			if (database == null) return;
			var databaseNameText = database["DataSourceCategory"];
			var complexSearchDatabaseResult = true;
			if (complexSearch && searchTextDatabase) {
				complexSearchDatabaseResult = databaseNameText.toLowerCase().indexOf(searchTextDatabase) >= 0;
			}
			
			if (complexSearchDatabaseResult) {
				// table search
				jq$.each(database["tables"], function (i, table) {
					var tableNameText = table["name"],
						tableSysnameText = table["sysname"];
					var complexSearchTableResult = true;
					if (complexSearch && searchTextTable) {
						complexSearchTableResult = tableNameText.toLowerCase().indexOf(searchTextTable) >= 0;
					} else {
						var htmlResultTable = getTextDataResult(tableNameText, text);
						if (htmlResultTable) {
							result.push({
								databaseName: databaseNameText,
								tableName: tableNameText,
								tableSysname: tableSysnameText,
								fieldName: null,
								htmlResult: htmlResultTable
							});
						}
					}
					
					if (complexSearchTableResult) {
						// field search
						jq$.each(table["fields"], function (fieldNameText, field) {
							var htmlResultField;
							if (complexSearch) {
								htmlResultField = getTextDataResult(fieldNameText, searchTextField);
							} else {
								htmlResultField = getTextDataResult(fieldNameText, text);
							}
							if (htmlResultField) {
								result.push({
									databaseName: databaseNameText,
									tableName: tableNameText,
									tableSysname: tableSysnameText,
									fieldName: fieldNameText,
									htmlResult: htmlResultField
								});
							}
						});
					}
				});
			}
		});
		return result;
	};

	/**
	 * Hide autocomplete control
	 */
	var hideAutocomplete = function () {
		searchAutocomplete$.empty();
		searchAutocomplete$.addClass("hidden");
	};

	/**
	 * Find autocomplete results
	 */
	var autocomplete = function (text) {
		if (!text) {
			currentItem$ = null;
			hideAutocomplete();
			return;
		}
		var autocompleteData = getData(text);
		if (autocompleteData.length == 0) {
			currentItem$ = null;
			hideAutocomplete();
			return;
		}
		searchAutocomplete$.empty();
		searchAutocomplete$.removeClass("hidden");

		// Use vanilla JS to fill a list of items because in case of many items this approach is much faster than jQuery
		var itemsCount = autocompleteData.length > maxAutocompleteItems ? maxAutocompleteItems : autocompleteData.length;
		for (var i = 0; i < itemsCount; i++) {
			var data = autocompleteData[i];
			var htmlResult = data["htmlResult"];

			// Create autocomplete item header and field
			var headerString = "";
			if (data["tableName"] != null)
				headerString = "&nbsp;-&nbsp;&nbsp;<b>" + data["databaseName"] + "</b>";
			if (data["fieldName"] != null)
				headerString += " &rarr; " + "<i>" + data["tableName"] + "</i>";

			var itemField = '<span class="autocomplete-item-field">' + htmlResult + '</span>';
			var itemHeader = '<span class="autocomplete-item-header">' + headerString + '</span>';

			// Create autocomplete item
			var itemContainerDiv = '<div class="autocomplete-item" database="'
								+ (data["databaseName"] != null ? data["databaseName"] : "")
								+ '" table="' + (data["tableSysname"] != null ? data["tableSysname"] : "")
								+ '" field="' + (data["fieldName"] != null ? data["fieldName"] : "")
								+ '">'
								+ itemField + itemHeader
								+'</div>';

			var itemContainer$ = jq$(itemContainerDiv);
			itemContainer$.click(function (e) {
				var target = jq$(e.currentTarget);
				var db = target.attr("database");
				var table = target.attr("table");
				var field = target.attr("field");
				applySearch({
					type: "field",
					database: db,
					table: table,
					field: field
				});
				currentItem$ = null;
				hideAutocomplete();
			});

			searchAutocomplete$.append(itemContainer$);
		}

		if (autocompleteData.length > maxAutocompleteItems) {
			var messageDiv$ = jq$('<div>', { 'class': 'autocomplete-item' }).appendTo(searchAutocomplete$);
			var messageSpan$ = jq$('<span>', { 'class': 'autocomplete-item-header' });
			messageSpan$.text('... and ' + (autocompleteData.length - maxAutocompleteItems) + ' more. Please clarify search parameters.');
			messageDiv$.append(messageSpan$);
		}
	};

	/**
	 * highlight and scroll to current item in autosuggest
	 */
	var scrollToItem = function () {
		if (currentItem$ == null || currentItem$.offset() == null)
			return;
		currentItem$.addClass("autocomplete-item-active");
		var top = searchAutocomplete$.offset().top;
		var itemTop = currentItem$.offset().top;
		var height = searchAutocomplete$.height();
		var itemHeight = currentItem$.height();
		var scrollTop = searchAutocomplete$.scrollTop();
		if (itemTop < top) {
			searchAutocomplete$.scrollTo(currentItem$);
		}
		if (itemTop + itemHeight > scrollTop + height + top) {
			searchAutocomplete$.scrollTo(currentItem$);
		}
	};

	/**
	 * up key handler
	 */
	var navigatePrevItem = function () {
		if (searchAutocomplete$.is(":empty"))
			return;
		if (currentItem$ != null)
			currentItem$.removeClass("autocomplete-item-active");
		if (currentItem$ == null || currentItem$.is(":first-child")) {
			currentItem$ = searchAutocomplete$.find("div:last-child");
		} else {
			currentItem$ = currentItem$.prev();
		}
		scrollToItem();
	};

	/**
	 * down key handler
	 */
	var navigateNextItem = function () {
		if (searchAutocomplete$.is(":empty"))
			return;
		if (currentItem$ != null)
			currentItem$.removeClass("autocomplete-item-active");
		if (currentItem$ == null || currentItem$.is(":last-child")) {
			currentItem$ = searchAutocomplete$.find("div:first-child");
		} else {
			currentItem$ = currentItem$.next();
		}
		scrollToItem();
	};

	/**
	 * Clear search
	 */
	var clear = function (isHideAutocomplete, isRestoreState) {
		if (isHideAutocomplete) {
			currentItem$ = null;
			hideAutocomplete();
		}
		// clear selection
		var rdbhInd = -1;
		while (true) {
			rdbhInd++;
			var dbh = document.getElementById('rdbh' + rdbhInd);
			if (typeof dbh == 'undefined' || dbh == null)
				break;
			if (dbh.nodeName != 'DIV')
				continue;
			var classes = ' ' + dbh.className + ' ';
			if (classes.indexOf(' database ') < 0)
				continue;
			var database$ = jq$(dbh);
			var databaseName$ = database$.find("span.database-name");
			databaseName$.removeClass("autocomplete-item-field-selection");
			if (database$.hasClass("closed")) {
				database$.stop();
				database$.removeClass("closed");
			}
			if (isRestoreState) {
				var idDatabase = database$.find("div.database-header").find("a").attr("href");
				if (database$.hasClass("opened") && databaseStateCache.indexOf(idDatabase) < 0)
					database$.removeClass("opened");
				if (!database$.hasClass("opened") && databaseStateCache.indexOf(idDatabase) >= 0)
					database$.addClass("opened");
			}
			jq$.each(database$.find("div.table"), function (j, table) {
				var table$ = jq$(table);
				var tableName$ = table$.find("span.table-name");
				tableName$.removeClass("autocomplete-item-field-selection");
				if (table$.hasClass("closed")) {
					table$.stop();
					table$.removeClass("closed");
				}
				if (isRestoreState) {
					var idTable = table$.find("div.table-header").find("a").attr("href");
					if (table$.hasClass("opened") && tableStateCache.indexOf(idTable) < 0)
						table$.removeClass("opened");
					if (!table$.hasClass("opened") && tableStateCache.indexOf(idTable) >= 0)
						table$.addClass("opened");
				}
				jq$.each(table$.find("a.field"), function (k, field) {
					var field$ = jq$(field);
					var fieldName$ = field$.find("span.field-name");
					if (field$.hasClass("closed")) {
						field$.stop();
						field$.removeClass("closed");
					}
					fieldName$.removeClass("autocomplete-item-field-selection");
				});
			});
		}
	};

	var preloadFound = function(searchObject) {
		var isTextSearch = searchObject["type"] == "string";
		var text = searchObject["text"];
		if (isTextSearch && !text) {
			return;
		}
		if (isTextSearch) {
			var complexResult = getFieldSearchResult(text);
			var complexSearch = complexResult["isComplexSearch"];
			var searchTextField = complexResult["searchTextField"];
			var searchTextTable = complexResult["searchTextTable"];
			var searchTextDatabase = complexResult["searchTextDatabase"];
			if (complexSearch) {
				searchObject = {
					type: "field",
					isPartial: true,
					database: searchTextDatabase,
					table: searchTextTable,
					field: searchTextField
				};
				isTextSearch = false;
			}
		}
		var categoriesToExpand = new Array();
		jq$.each(databaseSchema, function (i, database) {
			if (database == null) {
				return;
			}
			var databaseFound = false;
			var databaseNameText = database["DataSourceCategory"];
			var tablesToExpand = new Array();
			jq$.each(database["tables"], function (i, table) {
				var tableFound = false;
				var tableid = table.domId;
				var tableNameText = table["name"],
					tableSysnameText = table["sysname"];
				if (!isTextSearch && tableNameText) {
					if (!searchObject["isPartial"] && searchObject["database"] == databaseNameText && tableSysnameText == searchObject["table"]) {
						databaseFound = true;
						tableFound = true;
					}
				}
				if (isTextSearch && tableNameText && tableNameText.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
					databaseFound = true;
					tableFound = true;
				}
				jq$.each(table["fields"], function (fieldNameText, field) {
					if (!isTextSearch && fieldNameText) {
						if (!searchObject["isPartial"] && fieldNameText == searchObject["field"]
									&& searchObject["table"] == tableSysnameText && searchObject["database"] == databaseNameText) {
							databaseFound = true;
							tableFound = true;
						} else if (searchObject["isPartial"]
									&& (!searchObject["database"] || databaseNameText.toLowerCase().indexOf(searchObject["database"]) >= 0)
									&& tableNameText.toLowerCase().indexOf(searchObject["table"]) >= 0
									&& fieldNameText.toLowerCase().indexOf(searchObject["field"]) >= 0) {
							databaseFound = true;
							tableFound = true;
						}
					}
					if (isTextSearch && fieldNameText && fieldNameText.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
						databaseFound = true;
						tableFound = true;
					}
				});
				if (tableFound) {
					tablesToExpand[tablesToExpand.length] = tableid;
				}
			});
			if (databaseFound) {
				var cte = new Object();
				cte.CategoryToExpand = database.domIdHeader;
				cte.TablesToExpand = tablesToExpand;
				categoriesToExpand[categoriesToExpand.length] = cte;
			}
		});
		for (var cCnt = 0; cCnt < categoriesToExpand.length; cCnt++) {
			var db = document.getElementById(categoriesToExpand[cCnt].CategoryToExpand);
			initializeTables(jq$(db));
			for (var tCnt = 0; tCnt < categoriesToExpand[cCnt].TablesToExpand.length; tCnt++) {
				var tableTitleSpan = jq$(document.getElementById(categoriesToExpand[cCnt].TablesToExpand[tCnt]));
				if (tableTitleSpan.length > 0) {
					initFieldsDsp(tableTitleSpan[0].parentElement);
				}
			}
		}
	};

	var _applySearch = function(searchObject, isHideAutocomplete) {
		preloadFound(searchObject);
		clear(isHideAutocomplete);

		var isTextSearch = searchObject["type"] == "string";
		var text = searchObject["text"];
		if (isTextSearch && !text) {
			return;
		}

		if (isTextSearch) {
			var complexResult = getFieldSearchResult(text);
			var complexSearch = complexResult["isComplexSearch"];
			var searchTextField = complexResult["searchTextField"];
			var searchTextTable = complexResult["searchTextTable"];
			var searchTextDatabase = complexResult["searchTextDatabase"];
			if (complexSearch) {
				searchObject = {
					type: "field",
					isPartial: true,
					database: searchTextDatabase,
					table: searchTextTable,
					field: searchTextField
				};
				isTextSearch = false;
			}
		}

		jq$.each(databaseSchema, function (i, database) {
			if (database == null) {
				return;
			}
			var databaseFound = false;
			var databaseNameText = database["DataSourceCategory"];

			jq$.each(database["tables"], function (i, table) {
				var tableFound = false;
				var tableNameText = table["name"],
					tableSysnameText = table["sysname"];

				// Table search from autosuggest
				if (!isTextSearch && tableSysnameText) {
					if (!searchObject["isPartial"] && searchObject["database"] == databaseNameText && tableSysnameText == searchObject["table"]) {
						databaseFound = true;
						tableFound = true;
					}
				}
				// Text search
				if (isTextSearch && tableNameText && tableNameText.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
					databaseFound = true;
					tableFound = true;
				}

				// Field search
				if (isTextSearch || tableFound) {
					jq$.each(table["fields"], function (fieldNameText, field) {
						var fieldHighLight = false;
						var fieldFound = false;
						var needToCheck = false;

						// Field search
						if (!isTextSearch && fieldNameText) {
							if (!searchObject["isPartial"] && fieldNameText == searchObject["field"]
										&& searchObject["table"] == tableSysnameText && searchObject["database"] == databaseNameText) {
								databaseFound = true;
								tableFound = true;
								fieldFound = true;
								fieldHighLight = true;
								needToCheck = true;
							} else if (searchObject["isPartial"]
										&& (!searchObject["database"] || databaseNameText.toLowerCase().indexOf(searchObject["database"]) >= 0)
										&& tableNameText.toLowerCase().indexOf(searchObject["table"]) >= 0
										&& fieldNameText.toLowerCase().indexOf(searchObject["field"]) >= 0) {
								databaseFound = true;
								tableFound = true;
								fieldFound = true;
								fieldHighLight = true;
							}
						}

						// Text search
						if (isTextSearch && fieldNameText && fieldNameText.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
							databaseFound = true;
							tableFound = true;
							fieldFound = true;
							fieldHighLight = true;
						}

						// found ?
						if (fieldFound) {
							var fieldEnumVar$ = jq$(document.getElementById(field.domId));
							jq$.each(fieldEnumVar$, function (fieldIdx, fieldDom) {
								// find all fields
								var field$ = jq$(fieldDom);
								if (fieldHighLight) {
									field$.find("span.field-name").addClass("autocomplete-item-field-selection");
								}
								if (needToCheck) {
									var locked = (field$.attr("locked") == "true");
									var checkScript = field$.attr("onmouseup");
									if (!locked && checkScript) {
										eval(checkScript);
									}
								}
							});
						}
					});
				}

				// found ?
				var table$ = jq$(document.getElementById(table.domId).parentElement.parentElement.parentElement);
				if (tableFound) {
					var tableName$ = table$.find("span.table-name");
					tableName$.addClass("autocomplete-item-field-selection");
					table$.addClass("opened");
				} else {
					table$.addClass("closed");
				}
			});

			// found ?
			var database$ = jq$(document.getElementById(database.domIdHeader));
			if (databaseFound) {
				database$.addClass("opened");
			} else {
				database$.addClass("closed");
			}
		});

		var tbCnt = -1;
		while (true) {
			tbCnt++;
			var tableChChCh = document.getElementById('tcb' + tbCnt);
			if (typeof tableChChCh == 'undefined' || tableChChCh == null) {
				break;
			}
			var tableObj = tableChChCh.parentElement.parentElement.parentElement;
			if (tableObj.nodeName != 'DIV') {
				continue;
			}
			var classes = ' ' + tableObj.className + ' ';
			if (classes.indexOf(' table ') < 0 || classes.indexOf(' checked ') < 0) {
				continue;
			}
			var table$ = jq$(tableObj);
			table$.addClass("opened").removeClass("closed");
			table$.closest("div.database").addClass("opened").removeClass("closed");
		}
	};

	/**
	 * Perform search text (hide not matched data)
	 */
	var applySearch = function (searchObject, isHideAutocomplete) {
		waitMessage$.removeClass("hidden");
		setTimeout(function () {
			_applySearch(searchObject, isHideAutocomplete);
			waitMessage$.addClass("hidden");
		});
	};
}