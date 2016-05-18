﻿/**
* Instant report data sources controller definition
*/
angular
.module('izendaInstantReport')
.controller('InstantReportDataSourceController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$log',
			'$sce',
			'$location',
			'$anchorScroll',
			'$izendaUrl',
			'$izendaLocale',
			'$izendaCompatibility',
			'$izendaInstantReportQuery',
			'$izendaInstantReportPivots',
			'$izendaInstantReportValidation',
			'$izendaInstantReportStorage',
			InstantReportDataSourceController
]);

function InstantReportDataSourceController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$log,
			$sce,
			$location,
			$anchorScroll,
			$izendaUrl,
			$izendaLocale,
			$izendaCompatibility,
			$izendaInstantReportQuery,
			$izendaInstantReportPivots,
			$izendaInstantReportValidation,
			$izendaInstantReportStorage) {
	'use strict';
	var vm = this;
	var angularJq$ = angular.element;
	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	$scope.$izendaCompatibility = $izendaCompatibility;
	$scope.$izendaUrl = $izendaUrl;
	$scope.trustAsHtml = function (value) {
		return $sce.trustAsHtml(value);
	};
	
	vm.searchString = '';
	vm.dataSources = null;
	vm.isDataSourcesLoading = true;
	vm.searchResults = [];
	var previousResultsCount = null;
	vm.searchPanelOpened = false;

	vm.columnSortPanelOpened = false;
	vm.columnSortPanelButtonEnabled = false;

	var searchState = {
		timeoutId: null,
		changing: false
	};

	/**
	 * Turn off search panel and reset it to default state.
	 * @param {boolean} resetSearchResults. Clear search string and results.
	 */
	vm.turnOffSearch = function (resetSearchResults) {
		vm.searchPanelOpened = false;
		if (resetSearchResults) {
			vm.searchString = '';
			vm.searchResults = [];
			previousResultsCount = null;
		}
	}

	/**
	 * Run search query.
	 */
	vm.runSearchQuery = function (clearResults) {
		if (vm.searchQueryRunning)
			return;
		if (!angular.isString(vm.searchString) || vm.searchString.trim() === '') {
			vm.searchPanelOpened = false;
			vm.searchQueryRunning = false;
			return;
		}
		vm.searchQueryRunning = true;
		var count = 50;
		if (clearResults) {
			vm.searchResults = [];
			previousResultsCount = null;
			$location.hash('anchorSearchResultsTop');
		}
		if (previousResultsCount === 0) {
			vm.searchQueryRunning = false;
			return;
		}
		$izendaInstantReportStorage.searchInDataDources(vm.searchString, vm.searchResults.length, vm.searchResults.length + count - 1).then(function (searchResults) {
			previousResultsCount = searchResults.length;
			angular.element.each(searchResults, function () {
				vm.searchResults.push(this);
			});
			vm.searchPanelOpened = true;
			$scope.$applyAsync();
			vm.searchQueryRunning = false;
		});
	};

	/**
	 * Get filtered datasources
	 */
	vm.searchInDataDources = function () {
		if ($izendaCompatibility.isSmallResolution())
			return;
		if (searchState.timeoutId !== null)
			$timeout.cancel(searchState.timeoutId);
		searchState.timeoutId = $timeout(function() {
			vm.runSearchQuery(true);
		}, 500);
	};

	/**
	 * Get classes for category/table folder icons
	 */
	vm.getFolderClass = function(item) {
		var css = '';
		if (!item.collapsed) {
			css += ' open';
		}
		if (item.active) {
			css += ' active';
		}
		return css.trim();
	}

	/**
	 * Get classes for category/table labels
	 */
	vm.getFolderLabelClass = function (item) {
		var css = '';
		if (item.active) {
			css += ' active';
		}
		if (item.highlight) {
			css += ' highlight';
		}
		if (!item.enabled) {
			css += ' disabled';
		}
		if (item.selected) {
			css += ' selected';
		}
		return css.trim();
	};

	vm.getFieldClass = function (item) {
		var css = '';
		if (item.checked) {
			css += ' checked';
		}
		if (item.highlight) {
			css += ' highlight';
		}
		if (!item.enabled) {
			css += ' disabled';
		}
		return css.trim();
	}

	vm.getFieldTextClass = function(item) {
		var css = '';
		if (item.selected) {
			css += ' selected';
		}
		return css.trim();
	}

	vm.getFieldCheckClass = function (item, ignoreFolderIcon) {
		if (!ignoreFolderIcon && item.isMultipleColumns) {
			if (!item.collapsed)
				return 'glyphicon-chevron-down';
			return 'glyphicon-chevron-right';
		}
		var css = '';
		if (item.checked) {
			css += ' glyphicon-check';
		} else {
			css += ' glyphicon-unchecked';
		}
		return css.trim();
	}

	/**
	 * Check if field have group
	 */
	vm.isFieldGrouped = function(field) {
		return field.checked && $izendaInstantReportStorage.isFieldGrouped(field);
	};

	/**
	 * Toggle table collapsed
	 * @param {object} table. Toggling table object 
	 */
	vm.toggleTableCollapse = function (table) {
		return $q(function(resolve) {
			table.collapsed = !table.collapsed;
			// if table is lazy - load fields.
			if (table.lazy) {
				$izendaInstantReportStorage.loadLazyFields(table).then(function () {
					$scope.$applyAsync();
					resolve(table);
				});
			} else {
				resolve(table);
			}
		});
	};

	/**
	 * Update validation state and refresh if needed.
	 */
	vm.updateReportSetValidationAndRefresh = function () {
		var validationResult = $izendaInstantReportValidation.validateReportSet();
		if (validationResult) {
			if (!$izendaCompatibility.isSmallResolution())
				$izendaInstantReportStorage.getReportPreviewHtml();
		} else {
			$izendaInstantReportStorage.clearReportPreviewHtml();
		}
	};

	vm.toggleFieldChecked = function (field) {
		if (!field)
			return;
		var needToCheck = !field.checked;
		var pivotsEnabled = $izendaInstantReportPivots.isPivotEnabled();

		$izendaInstantReportStorage.applyFieldChecked(field, needToCheck, pivotsEnabled).then(function () {
			$izendaInstantReportStorage.updateVisualGroupFieldOrders();
			// turn on autogroup if pivots are turned on
			if (pivotsEnabled && needToCheck) {
				$izendaInstantReportStorage.applyAutoGroups(true);
			}
			vm.updateReportSetValidationAndRefresh();
			$scope.$applyAsync();
		});
	};

	/**
	 * Check/uncheck field handler
	 */
	vm.checkField = function (field) {
		if (field.isMultipleColumns) {
			field.collapsed = !field.collapsed;
			return;
		}
		if (!field.checked)
			vm.selectField(field);
		if (!$izendaCompatibility.isSmallResolution()) {
			// check field occurs in selectField function
			vm.toggleFieldChecked(field);
		}
	};

	/**
	 * Activate/deactivate table
	 */
	vm.activateTable = function (table) {
		$izendaInstantReportStorage.applyTableActive(table);
	}

	/**
	 * Show field options
	 */
	vm.selectField = function (field) {
		if ($izendaCompatibility.isSmallResolution()) {
			vm.toggleFieldChecked(field);
		} else {
			$izendaInstantReportStorage.applyFieldSelected(field, true);
		}
	};

	/**
	 * Show field options button
	 */
	vm.showFieldOptions = function (field) {
		$izendaInstantReportStorage.applyFieldSelected(field, true);
		if ($izendaCompatibility.isSmallResolution()) {
			$scope.irController.setLeftPanelActiveItem(7);
		}
	}

	/**
	 * Is all tables collapsed
	 */
	vm.isTablesCollapsed = function(category) {
		var result = true;
		angularJq$.each(category.tables, function () {
			if (!this.collapsed)
				result = false;
		});
		return result;
	};

	/**
	 * Collapse all tables inside category
	 */
	vm.collapseCategoryTables = function(category) {
		angularJq$.each(category.tables, function() {
			this.collapsed = true;
		});
	}

	/**
	 * Add more than one same fields to report
	 */
	vm.addAnotherField = function(field) {
		var anotherField = $izendaInstantReportStorage.addAnotherField(field, true);
		vm.toggleFieldChecked(anotherField);
	};

	/**
	 * Remove more than one same field
	 */
	vm.removeAnotherField = function(field, multiField) {
		$izendaInstantReportStorage.removeAnotherField(field, multiField);
		vm.updateReportSetValidationAndRefresh();
		$scope.$applyAsync();
	};

	/**
	 * Open/close column sort panel
	 */
	vm.openColumnsSortPanel = function (value) {
		if (angular.isDefined(value))
			vm.columnSortPanelOpened = value;
		else {
			vm.columnSortPanelOpened = !vm.columnSortPanelOpened;
		}
	}

	/**
	 * Go to found field or table
	 * @param {object} searchResultObject. Object, with table sysname and field sysname. 
	 */
	vm.revealSearchResult = function (searchResultObject) {
		vm.selectField(null);
		vm.turnOffSearch(true);
		var isField = searchResultObject.hasOwnProperty('fSysName');
		var tableSysName = searchResultObject['tSysName'];
		var table = $izendaInstantReportStorage.getTableBySysname(tableSysName);
		vm.toggleTableCollapse(table).then(function () {
			if (isField) {
				var fieldSysName = searchResultObject['fSysName'];
				var field = $izendaInstantReportStorage.getFieldBySysName(fieldSysName, true);
				vm.selectField(field);
				$scope.$applyAsync();
			}
			$location.hash('anchor' + tableSysName);
		});
	};

	/**
	* Initialize watchers
	*/
	vm.initWatchers = function () {
		$scope.$watch(angular.bind(vm, function () {
			return this.searchString;
		}), function () {
			vm.searchInDataDources();
		});

		/**
		 * Listen for complete loading page.
		 */
		$scope.$watch('$izendaInstantReportStorage.getPageReady()', function(isPageReady) {
			if (isPageReady) {
				vm.isDataSourcesLoading = false;
			}
		});

		/**
		 * Look for datasources change
		 */
		$scope.$watch('$izendaInstantReportStorage.getDataSources()', function (datasources) {
			vm.dataSources = datasources;
		});

		/**
		 * Look for checked fields count
		 */
		$scope.$watchCollection('$izendaInstantReportStorage.getAllActiveFields()', function (newActiveFields) {
			vm.columnSortPanelButtonEnabled = newActiveFields.length > 1;
		});
	};

	/**
	* Initialize controller
	*/
	vm.init = function () {
	};

	// initialize with controller
	vm.initWatchers();
}
