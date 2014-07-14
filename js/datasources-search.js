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
		jq$.each(jq$("div.database.opened"), function (index, item) {
			var id = jq$(item).find("div.database-header").find("a").attr("href");
			databaseStateCache.push(id);
		});

		jq$.each(jq$("div.table.opened"), function (index, item) {
			var id = jq$(item).find("div.table-header").find("a").attr("href");
			tableStateCache.push(id);
		});
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
				jq$.each(database["tables"], function (tableNameText, table) {
					var complexSearchTableResult = true;
					if (complexSearch && searchTextTable) {
						complexSearchTableResult = tableNameText.toLowerCase().indexOf(searchTextTable) >= 0;
					} else {
						var htmlResultTable = getTextDataResult(tableNameText, text);
						if (htmlResultTable) {
							result.push({
								databaseName: databaseNameText,
								tableName: tableNameText,
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
		for (var i = 0; i < autocompleteData.length; i++) {
			var data = autocompleteData[i];
			var htmlResult = data["htmlResult"];

			// create autocomplete item
			jq$("<div>", {
				"class": "autocomplete-item",
				"database": data["databaseName"] != null ? data["databaseName"] : "",
				"table": data["tableName"] != null ? data["tableName"] : "",
				"field": data["fieldName"] != null ? data["fieldName"] : ""
			}).appendTo(searchAutocomplete$);

			var childs = searchAutocomplete$.children();
			var autocompleteResult$ = jq$(childs[childs.length - 1]);
			autocompleteResult$.live("click", function (e) {
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

			// create autocomplete item header and field

			jq$("<span>", { "class": "autocomplete-item-field" }).appendTo(autocompleteResult$);
			jq$("<span>", { "class": "autocomplete-item-header" }).appendTo(autocompleteResult$);

			var headerString = "";
			if (data["tableName"] != null) {
				headerString = "&nbsp;-&nbsp;&nbsp;<b>" + data["databaseName"] + "</b>";
			}
			if (data["fieldName"] != null) {
				headerString += " &rarr; " + "<i>" + data["tableName"] + "</i>";
			}
			var header$ = autocompleteResult$.find("span.autocomplete-item-header");
			header$.html(headerString);

			var body$ = autocompleteResult$.find("span.autocomplete-item-field");
			body$.html(htmlResult);
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
		jq$.each(jq$("div.database"), function (i, database) {
			var database$ = jq$(database);
			var databaseTables$ = database$.find('div.database-tables');
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
		});
	};

	var preloadFound = function(searchObject) {
	  var isTextSearch = searchObject["type"] == "string";
	  var text = searchObject["text"];
	  if (isTextSearch && !text)
	    return;
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
	    jq$.each(database["tables"], function (tableNameText, table) {
	      var tableFound = false;
	      var tableid = table["sysname"];
	      if (!isTextSearch && tableNameText) {
	        if (!searchObject["isPartial"] && searchObject["database"] == databaseNameText && tableNameText == searchObject["table"]) {
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
									&& searchObject["table"] == tableNameText && searchObject["database"] == databaseNameText) {
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
	    var database$;
	    jq$.each(jq$('span.database-name'), function (idatabase, databaseDom) {
	    	var txt = jq$(databaseDom).text();
	      if (txt && txt.toLowerCase() == database["DataSourceCategory"].toLowerCase())
	      	database$ = jq$(databaseDom).closest("div.database");
	    });
	    if (database$) {
	      if (databaseFound) {
	        var cte = new Object();
	        cte.CategoryToExpand = database$[0].id;
	        cte.TablesToExpand = tablesToExpand;
	        categoriesToExpand[categoriesToExpand.length] = cte;
	      }
	    }
	  });
	  for (var cCnt = 0; cCnt < categoriesToExpand.length; cCnt++) {
	    var db = document.getElementById(categoriesToExpand[cCnt].CategoryToExpand);
	    initializeTables(jq$(db));
	    for (var tCnt = 0; tCnt < categoriesToExpand[cCnt].TablesToExpand.length; tCnt++) {
	      var tableSysName = categoriesToExpand[cCnt].TablesToExpand[tCnt];
	      var tableTitleSpan = jq$('span[tableid="' + tableSysName + '"]');
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
	  if (isTextSearch && !text)
	    return;

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
	    if (database == null) return;
	    var databaseFound = false;
	    var databaseNameText = database["DataSourceCategory"];

	    jq$.each(database["tables"], function (tableNameText, table) {
	      var tableFound = false;
	      var tableHighlight = false;
	      var tableid = table["sysname"];

	      // Table search from autosuggest
	      if (!isTextSearch && tableNameText) {
	        if (!searchObject["isPartial"] && searchObject["database"] == databaseNameText && tableNameText == searchObject["table"]) {
	          databaseFound = true;
	          tableFound = true;
	          tableHighlight = true;
	        }
	      }
	      // Text search
	      if (isTextSearch && tableNameText && tableNameText.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
	        databaseFound = true;
	        tableFound = true;
	        tableHighlight = true;
	      }

	      // Field search
	      jq$.each(table["fields"], function (fieldNameText, field) {
	        var fieldHighLight = false;
	        var fieldFound = false;
	        var needToCheck = false;

	        // Field search
	        if (!isTextSearch && fieldNameText) {
	          if (!searchObject["isPartial"] && fieldNameText == searchObject["field"]
									&& searchObject["table"] == tableNameText && searchObject["database"] == databaseNameText) {
	            databaseFound = true;
	            tableFound = true;
	            fieldFound = true;
	            tableHighlight = true;
	            fieldHighLight = true;
	            needToCheck = true;
	          } else if (searchObject["isPartial"]
									&& (!searchObject["database"] || databaseNameText.toLowerCase().indexOf(searchObject["database"]) >= 0)
									&& tableNameText.toLowerCase().indexOf(searchObject["table"]) >= 0
									&& fieldNameText.toLowerCase().indexOf(searchObject["field"]) >= 0) {
	            databaseFound = true;
	            tableFound = true;
	            fieldFound = true;
	            tableHighlight = true;
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
	        	jq$.each(jq$('a.field[fieldid="' + field["sysname"] + '"]'), function (fieldIdx, fieldDom) {
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

	      // found ?
	      var table$ = jq$('div.table-header a span.checkbox-container[tableid="' + table["sysname"] + '"]')
							.closest("div.table");
	      if (tableFound) {
	        var tableName$ = table$.find("span.table-name");
	        tableName$.addClass("autocomplete-item-field-selection");
	        table$.addClass("opened");
	      } else {
	        table$.addClass("closed");
	      }
	    });

	    // found ?
	    var database$;
	    jq$.each(jq$('span.database-name'), function (idatabase, databaseDom) {
	    	var txt = jq$(databaseDom).text();
	      if (txt && txt.toLowerCase() == database["DataSourceCategory"].toLowerCase())
	      	database$ = jq$(databaseDom).closest("div.database");
	    });
	    if (database$) {
	      if (databaseFound) {
	        database$.addClass("opened");
	      } else {
	        database$.addClass("closed");
	      }
	    }
	  });

	  jq$.each(jq$("div.table.checked"), function (idx, table) {
	  	var table$ = jq$(table);
	    table$.addClass("opened").removeClass("closed");
	    table$.closest("div.database").addClass("opened").removeClass("closed");
	  });
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