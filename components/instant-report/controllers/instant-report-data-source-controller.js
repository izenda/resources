/**
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
			'$izendaUrl',
			'$izendaInstantReportQuery',
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
			$izendaUrl,
			$izendaInstantReportQuery,
			$izendaInstantReportStorage) {
	'use strict';
	var vm = this;
	var angularJq$ = angular.element;
	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	$scope.$izendaUrl = $izendaUrl;
	
	vm.searchString = '';
	vm.dataSources = null;
	vm.isDataSourcesLoading = true;

	vm.columnSortPanelOpened = false;
	vm.columnSortPanelButtonEnabled = false;

	var searchState = {
		timeoutId: null,
		changing: false
	};

	var performFiltering = function () {
		$izendaInstantReportStorage.filterDataSources(vm.searchString);
		$scope.$applyAsync();
	};

	/**
	 * Get filtered datasources
	 */
	vm.filterDataSources = function () {
		if (searchState.timeoutId !== null)
			clearTimeout(searchState.timeoutId);
		searchState.timeoutId = setTimeout(performFiltering, 500);
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
	vm.isFieldGrouped = function (field) {
		return field.checked && $izendaInstantReportStorage.isFieldGrouped(field);
	}

	/**
	 * Check/uncheck field handler
	 */
	vm.checkField = function (field) {
		if (field.isMultipleColumns) {
			field.collapsed = !field.collapsed;
			return;
		}
		vm.selectField(field);
		$izendaInstantReportStorage.applyFieldChecked(field);
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
		$izendaInstantReportStorage.applyFieldSelected(field, true);
	};

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
		$izendaInstantReportStorage.applyFieldChecked(anotherField);
	};

	/**
	 * Remove more than one same field
	 */
	vm.removeAnotherField = function(field, multiField) {
		$izendaInstantReportStorage.removeAnotherField(field, multiField);
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
	* Initialize watchers
	*/
	vm.initWatchers = function () {
		$scope.$watch(angular.bind(vm, function () {
			return this.searchString;
		}), function () {
			vm.filterDataSources();
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
