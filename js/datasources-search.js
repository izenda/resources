var highlightedTablesCache = [];
var highlightedFieldsCache = [];

function IzendaDatasourcesSearch(databaseSchema, options) {
	// set up options:
	var searchOptions = {
		applySearchOnDelay: false
	};
	jq$.extend(searchOptions, options);

	var autocompleteTimer = null;
	var autocompleteHover = false;
	var previousSearchString = null;
	var $currentItem = null;

	//////////////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////////////

	// set up dom elements:
	var controls = {
		$inputCtrl: jq$("#fieldSearch"),
		$clearBtn: jq$("#fieldSearchClearBtn"),
		$searchBtn: jq$("#fieldSearchBtn"),
		$waitMessage: jq$("#fieldSearchMessage"),
		$searchAutocomplete: jq$("#fieldSearchAutoComplete")
	};

	/**
	 * Search input key press event handler
	 */
	controls.$inputCtrl.keyup(function (event) {
		var code = (event.keyCode ? event.keyCode : e.which);
		var ctrl = event.ctrlKey;
		if (code == 13) {
			// enter
			var searchString = jq$(this).val();
			if ($currentItem === null)
				runTextSearch(searchString);
			else
				$currentItem.click();
		} else if (ctrl && code == 32) {
			// ctrl + space or down
			event.preventDefault();
			var searchString = jq$(this).val();
			runAutocompleteSearch(searchString);
			return false;
		} else if (code == 27) {
			// esc
			event.preventDefault();
			hideAutocomplete();
			return false;
		} else if (code == 38) {
			// up
			event.preventDefault();
			goToPreviousItem();
			return false;
		} else if (code == 40) {
			// down
			event.preventDefault();
			goToNextItem();
			return false;
		} else if (code == 33) {
			// page up
			event.preventDefault();
			controls.$searchAutocomplete.stop();
			controls.$searchAutocomplete.animate({
				scrollTop: controls.$searchAutocomplete.scrollTop() - controls.$searchAutocomplete.height()
			}, "slow");
			return false;
		} else if (code == 34) {
			// page down
			event.preventDefault();
			controls.$searchAutocomplete.stop();
			controls.$searchAutocomplete.animate({
				scrollTop: controls.$searchAutocomplete.scrollTop() + controls.$searchAutocomplete.height()
			}, "slow");
			return false;
		} else {
			// default:
			var searchString = jq$(this).val();
			if (searchString !== previousSearchString)
				runAutocompleteTimer(searchString);
			previousSearchString = searchString;
		}
		return true;
	});

	controls.$searchAutocomplete.hover(
		function () { autocompleteHover = true; },
		function () { autocompleteHover = false; }
	);

	/**
	 * Blur event handler
	 */
	controls.$inputCtrl.blur(function () {
		event.preventDefault();
		if (!autocompleteHover) {
			hideAutocomplete();
		}
	});

	/**
	 * Clear search button clicked
	 */
	controls.$clearBtn.click(function () {
		clearSearch();
	});

	/**
	 * Search button clicked
	 */
	controls.$searchBtn.click(function () {
		var searchString = controls.$inputCtrl.val();
		runTextSearch(searchString);
	});

	function stringIsNullOrEmpty(str) {
		return typeof (str) !== 'string' || str.trim() === '';
	}

	/**
	 * Clear autcomplete timer
	 */
	function clearAutocompleteTimer() {
		if (autocompleteTimer !== null) {
			clearTimeout(autocompleteTimer);
			autocompleteTimer = null;
		}
	};

	/**
	 * Run timer, which allow to keep minimum delay between autocomplete queries
	 */
	function runAutocompleteTimer(searchText) {
		openAutocomplete();
		addAutocompleteLoadingMessage(searchText);

		// run timer
		clearAutocompleteTimer();
		if (!stringIsNullOrEmpty(searchText)) {
			autocompleteTimer = setTimeout(function () {
				var searchString = controls.$inputCtrl.val();
				runAutocompleteSearch(searchString);
			}, 1000);
		} else {
			hideAutocomplete();
		}
	};

	/**
	 * Add autocomplete loading message
	 */
	function addAutocompleteLoadingMessage(searchString) {
		var $message = controls.$searchAutocomplete.children('.izenda-autocomplete-loading');
		if ($message.length === 0) {
			$currentItem = null;
			controls.$searchAutocomplete.empty();
			$message = jq$('<div class="izenda-autocomplete-loading"></div>');
			controls.$searchAutocomplete.append($message);
		}
		$message.text('Finding results for "' + searchString + '"...');
	};

	/**
	 * Open autocomplete
	 */
	function openAutocomplete(clear) {
		if (clear)
			controls.$searchAutocomplete.empty();
		controls.$searchAutocomplete.removeClass("hidden");
	};

	/**
	 * Hide autocomplete
	 */
	function hideAutocomplete() {
		clearAutocompleteTimer();
		$currentItem = null;
		controls.$searchAutocomplete.empty();
		controls.$searchAutocomplete.addClass("hidden");
	}

	/**
	 * Navigate among autocomplete items
	 */
	function goToNextItem() {
		var $items = controls.$searchAutocomplete.find('.autocomplete-item');
		$items.removeClass('autocomplete-item-active');
		if ($currentItem == null || $currentItem.is(":last-child")) {
			if ($items.length > 0) {
				$currentItem = jq$($items[0]);
				$currentItem.addClass('autocomplete-item-active');
			}
		} else {
			$currentItem = $currentItem.next();
			$currentItem.addClass('autocomplete-item-active');
		}
		// scroll if $currentItem out of current scroll position
		if ($currentItem !== null) {
			var itemHeight = $currentItem.height();
			var itemIndex = $currentItem.index();
			var itemPos = $currentItem.position();
			var itemRealTop = itemHeight * itemIndex;
			var height = controls.$searchAutocomplete.height();
			if (itemPos.top + $currentItem.height() - height > 0) {
				controls.$searchAutocomplete.animate({
					scrollTop: itemRealTop + $currentItem.height() - height
				}, "fast");
			} else if (itemPos.top < 0) {
				controls.$searchAutocomplete.animate({
					scrollTop: 0
				}, "fast");
			}
		}
	}

	/**
	 * Navigate among autocomplete items
	 */
	function goToPreviousItem() {
		var $items = controls.$searchAutocomplete.find('.autocomplete-item');
		$items.removeClass('autocomplete-item-active');
		if ($currentItem == null || $currentItem.is(":first-child")) {
			if ($items.length > 0) {
				$currentItem = jq$($items[$items.length - 1]);
				$currentItem.addClass('autocomplete-item-active');
			}
		} else {
			$currentItem = $currentItem.prev();
			$currentItem.addClass('autocomplete-item-active');
		}
		// scroll if $currentItem out of current scroll position
		if ($currentItem !== null) {
			var itemHeight = $currentItem.height();
			var itemIndex = $currentItem.index();
			var itemPos = $currentItem.position();
			var itemRealTop = itemHeight * itemIndex;
			var height = controls.$searchAutocomplete.height();
			if (itemPos.top < 0) {
				controls.$searchAutocomplete.animate({
					scrollTop: controls.$searchAutocomplete.scrollTop() + itemPos.top
				}, "fast");
			} else if (itemPos.top > controls.$searchAutocomplete.scrollTop() + height) {
				controls.$searchAutocomplete.animate({
					scrollTop: itemRealTop
				}, "fast");
			}
		}
	}

	//////////////////////////////////////////////////////////////
	// Search
	//////////////////////////////////////////////////////////////

	/**
	 * Fetch search results from server and create autocomplete content.
	 */
	function runAutocompleteSearch(searchString) {
		openAutocomplete(true);
		getData(searchString, false, function (searchResults) {
			fillAutocomplete(searchResults);
		});
	}

	/**
	 * Run search by text
	 */
	function runTextSearch(searchString) {
		clearAutocompleteTimer();
		if (stringIsNullOrEmpty(searchString)) {
			clearSearch();
			return;
		}
		openAutocomplete(true);
		controls.$searchAutocomplete.append('<div class="izenda-autocomplete-loading">Finding results for "' + searchString + '"...</div>');
		getData(searchString, true, function (searchResults) {
			hideAutocomplete();
			applySearch({
				isFieldSearch: false,
				results: searchResults
			});
		});
	};

	/**
	 * Clear search
	 */
	function clearSearch() {
		previousSearchString = null;
		removeHighlights();
		hideAutocomplete();
		controls.$inputCtrl.val(null);
		jq$('.data-sources .table').show();
	};

	/**
	 * Find data for autocomplete
	 */
	var getData = function (text, getAllResults, callback) {
		var queryParams = [
			'wscmd=findfields',
			'wsarg0=' + encodeURIComponent(text),
			'wsarg1=0',
			'wsarg2=' + (getAllResults ? 100000 : 49),
			'wsarg3=false'
		];
		var url = './rs.aspx?' + queryParams.join('&');
		AjaxRequest(url, null, function (returnObj, id) {
			if (typeof callback === 'function') {
				callback(returnObj);
			}
		}, function (responseObject) {
			var stacktrace = izenda.error.extractStackTrace(responseObject);
			var message = responseObject.status + ": " + responseObject.statusText + "\r\n" + stacktrace;
			izenda.logger.error(message);
		});
	}

	/**
	 * Generate autocomplete content.
	 */
	var fillAutocomplete = function (dataArray) {
		$currentItem = null;
		controls.$searchAutocomplete.empty();

		if (!dataArray || dataArray.length === 0) {
			controls.$searchAutocomplete.append('<div class="izenda-autocomplete-loading">No results found</div>');
			return;
		}
		jq$.each(dataArray, function () {
			var data = this;
			var isTable = data.found === 't';
			var tableNameFormatted = data['tNameFmt']
					? data['tNameFmt'].replaceAll('[h]', '<b>').replaceAll('[/h]', '</b>')
					: null;
			var fieldNameFormatted = data['fNameFmt']
				? data['fNameFmt'].replaceAll('[h]', '<b>').replaceAll('[/h]', '</b>')
				: null;
			var htmlResult = isTable ? tableNameFormatted : fieldNameFormatted;

			// Create autocomplete item header and field
			var headerString = "";
			if (tableNameFormatted != null)
				headerString = data["dName"] + " &rarr; ";
			if (fieldNameFormatted != null)
				headerString += tableNameFormatted + " &rarr; ";
			var itemHeader = '<span class="autocomplete-item-header">' + headerString + '</span>';
			var itemField = '<span class="autocomplete-item-field">' + htmlResult + '</span>';
			// Create autocomplete item
			var dataBaseParameter = data["dName"] != null ? data["dName"] : "";
			var tableParameter = data["tSysName"] != null ? data["tSysName"] : "";
			var fieldParameter = data["fSysName"] != null ? data["fSysName"] : "";

			var itemContainerDiv =
				'<div class="autocomplete-item" ' +
					'database="' + dataBaseParameter + '" ' +
					'table="' + tableParameter + '" ' +
					'field="' + fieldParameter + '">' +
					itemHeader + itemField +
				'</div>';
			var $itemContainer = jq$(itemContainerDiv);
			$itemContainer.click(function () {
				var $item = jq$(this);
				var db = $item.attr("database");
				var table = $item.attr("table");
				var field = $item.attr("field");
				hideAutocomplete();
				applySearch({
					isFieldSearch: true,
					database: db,
					table: table,
					field: field
				});
			});
			controls.$searchAutocomplete.append($itemContainer);
		});
	}

	/**
	 * Reveal search results in datasource tree.
	 */
	function applySearch(searchResultObject) {
		if (searchResultObject.isFieldSearch) {
			applyFieldSearch(searchResultObject);
		} else {
			applyTextSearch(searchResultObject);
		}
	}

	/**
	 * Remove item highlight
	 */
	function removeHighlights() {
		jq$.each(highlightedTablesCache, function () {
			this.removeClass('autocomplete-item-field-selection');
			this.closest('.data-sources .table').attr('highlight', '');
		});
		jq$.each(highlightedFieldsCache, function () {
			this.removeClass('autocomplete-item-field-selection');
		});
		highlightedTablesCache = [];
		highlightedFieldsCache = [];
	}

	/**
	 * Open expand in tree
	 */
	function expandDatabaseInTree(databaseName) {
		jq$.each(databaseSchema, function () {
			var database = this;
			if (database.DataSourceCategory === databaseName) {
				var $database = jq$('#' + database.domIdHeader);
				if (!$database.hasClass('opened'))
					$database.addClass('opened');
			}
		});
	}

	/**
	 * Find table element in tree
	 */
	function findTableInTree(tableSysName) {
		var table = null;
		jq$.each(databaseSchema, function () {
			var database = this;
			var i = 0;
			while (table === null && i < database.tables.length) {
				if (database.tables[i].sysname === tableSysName) {
					table = database.tables[i];
				}
				i++;
			}
		});
		if (table) {
			var $tableCheckbox = jq$('#' + table.domId);
			var $table = $tableCheckbox.closest('.data-sources .table');
			return $table;
		}
		return null;
	}

	/**
	 * Highlight field item in datasource tree
	 */
	function highlightField($table, fieldSysname) {
		if (!stringIsNullOrEmpty(fieldSysname)) {
			var $field = $table.find('.field[fieldid="' + fieldSysname + '"]');
			if ($field.length === 0)
				return false;
			var $fieldName = $field.find("span.field-name");
			$fieldName.addClass("autocomplete-item-field-selection");
			highlightedFieldsCache.push($fieldName);
			return true;
		}
		return false;
	}

	/**
	 * Open text search results
	 */
	function applyTextSearch(searchResultObject) {
		removeHighlights();
		jq$('.data-sources .table').hide();
		var results = searchResultObject.results;
		jq$.each(results, function () {
			var result = this;
			// open database
			expandDatabaseInTree(result.dName);

			// open table and hide others
			var $table = findTableInTree(result.tSysName);
			$table.show();
			// highlight table
			var $tableName = $table.find('span.table-name');
			$tableName.addClass('autocomplete-item-field-selection');
			highlightedTablesCache.push($tableName);

			var highlightedField = !stringIsNullOrEmpty(result.fSysName);
			var tryToHighlighedImmediately = highlightField($table, result.fSysName);
			if (!tryToHighlighedImmediately && highlightedField) {
				var tableHighlights = $table.attr('highlight');
				if (tableHighlights)
					tableHighlights += ',';
				else
					tableHighlights = '';
				tableHighlights += result.fSysName;
				$table.attr('highlight', tableHighlights);
			}
		});
	}

	/**
	 * Open field
	 */
	function applyFieldSearch(searchResultObject) {
		jq$('.data-sources .table').hide();
		removeHighlights();

		// open database
		expandDatabaseInTree(searchResultObject.database);

		// open table and hide others
		var $table = findTableInTree(searchResultObject.table);
		var $tableCheckbox = $table.find('.table-header > a > .checkbox-container');
		$table.siblings().hide();
		$table.show();

		// highlight table
		var $tableName = $table.find('span.table-name');
		$tableName.addClass('autocomplete-item-field-selection');
		highlightedTablesCache.push($tableName);

		// open table
		if (!$table.hasClass('opened')) {
			var tableIndex = parseInt($tableCheckbox.parent().attr('tableind'));
			_initFieldsDsp($tableCheckbox.parent().attr('id'), function () {
				$table.addClass('opened');
				// highlight field
				highlightField($table, searchResultObject.field);
			});
		} else {
			// highlight field
			highlightField($table, searchResultObject.field);
		}
	}
}