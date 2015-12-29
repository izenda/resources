/**
* Instant report field options controller
*/
angular
.module('izendaInstantReport')
.controller('InstantReportFieldOptionsController', [
			'$rootScope',
			'$scope',
			'$window',
			'$timeout',
			'$q',
			'$sce',
			'$log',
			'$izendaInstantReportQuery',
			'$izendaInstantReportStorage',
			InstantReportFieldOptionsController
]);

function InstantReportFieldOptionsController(
			$rootScope,
			$scope,
			$window,
			$timeout,
			$q,
			$sce,
			$log,
			$izendaInstantReportQuery,
			$izendaInstantReportStorage) {
	'use strict';
	var vm = this;
	var primaryButtonClass = "btn-izenda-dark",
			activeButtonClass = "btn-izenda-dark active";


	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	vm.field = null;
	vm.currentSortFunction = 'asc';
	vm.isSubtotalsEnabled = false;

	vm.drillDownStyles = $izendaInstantReportStorage.getDrillDownStyles();
	vm.subreports = $izendaInstantReportStorage.getSubreports();
	vm.expanded = false;
	vm.ddkValuesMaxAmount = -1;

	/**
	 * Get class 
	 */
	vm.getPanelClass = function () {
		if (!angular.isObject(vm.field) || !$scope.irController.isLeftPanelBodyActive(0))
			return 'collapsed';
		if (vm.expanded)
			return 'expanded';
		return '';
	};

	/**
	 * Get classes for validate messages icon
	 */
	vm.getValidateMessageIconClass = function (message) {
		return message;
	};

	/**
	 * Fires when description was set manually.
	 */
	vm.onDescriptionWasSet = function () {
		vm.field.isDescriptionSetManually = vm.field.description !== '';
	};

	/**
	 * Fires when group was selected
	 */
	vm.onFunctionSelected = function () {
		if (vm.field.groupByFunction === null)
			return;
		$izendaInstantReportStorage.onFieldFunctionApplyed(vm.field);
	};

	/**
	 * Fires when typegroup was selected
	 */
	vm.onTypeGroupSelected = function() {
		$izendaInstantReportStorage.onExpressionTypeGroupApplyed(vm.field);
	};

	/**
	 * Update preview
	 */
	vm.applyChanges = function () {
		$izendaInstantReportStorage.getReportPreviewHtml();
	};

	/**
	 * Get sort button class
	 */
	vm.getSortButtonClass = function () {
		if (vm.field === null)
			return primaryButtonClass;
		var cls = '';
		cls += ' ' + (vm.field.sort !== null ? activeButtonClass : primaryButtonClass);
		return cls.trim();
	}

	/**
	 * Get sort button icon class
	 */
	vm.getSortButtonGlyphClass = function () {
		return vm.currentSortFunction === 'desc' ? 'glyphicon-sort-by-alphabet-alt' : 'glyphicon-sort-by-alphabet';
	}

	/**
	 * Apply field sort. Parameter should be 'asc', 'desc' or null
	 */
	vm.applyFieldSort = function (sortFunction) {
		if (!angular.isDefined(sortFunction)) {
			if (vm.field.sort === null) {
				// enable selected sort
				$izendaInstantReportStorage.applyFieldSort(vm.field, vm.currentSortFunction);
			} else {
				// disable selected sort
				$izendaInstantReportStorage.applyFieldSort(vm.field, null);
			}
		} else {
			// set and enable selected sort
			vm.currentSortFunction = sortFunction;
			$izendaInstantReportStorage.applyFieldSort(vm.field, vm.currentSortFunction);
		}
	};

	/**
	 * Get italic button class
	 */
	vm.getItalicButtonClass = function () {
		if (vm.field === null)
			return primaryButtonClass;
		return vm.field.italic ? activeButtonClass : primaryButtonClass;
	};

	/**
	 * Apply field italic.
	 */
	vm.applyFieldItalic = function () {
		$izendaInstantReportStorage.applyFieldItalic(vm.field, !vm.field.italic);
	};

	/**
	 * Get visible button class
	 */
	vm.getVisibleButtonClass = function() {
		if (vm.field === null)
			return primaryButtonClass;
		return vm.field.visible ? primaryButtonClass : activeButtonClass;
	};

	/**
	 * Apply field italic.
	 */
	vm.applyFieldVisible = function () {
		$izendaInstantReportStorage.applyFieldVisible(vm.field, !vm.field.visible);
	};

	/**
	 * Get bold button class
	 */
	vm.getBoldButtonClass = function () {
		if (vm.field === null)
			return primaryButtonClass;
		return vm.field.bold ? activeButtonClass : primaryButtonClass;
	};

	/**
	 * Apply field bold.
	 */
	vm.applyFieldBold = function () {
		$izendaInstantReportStorage.applyFieldBold(vm.field, !vm.field.bold);
	};

	/**
	 * Get visual group button class
	 */
	vm.getVgButtonClass = function () {
		if (vm.field === null)
			return primaryButtonClass;
		return vm.field.isVgUsed ? activeButtonClass : primaryButtonClass;
	};

	/**
	 * If user selects non-default subtotal function, we need to turn on subtotals.
	 */
	vm.onSubtotalFunctionSelect = function () {
		var subtotalFunction = vm.field.groupBySubtotalFunction;
		if (subtotalFunction !== 'DEFAULT')
			$izendaInstantReportStorage.getOptions().isSubtotalsEnabled = true;
	};

	/**
	 * Apply visual group changed
	 */
	vm.applyVg = function () {
		$izendaInstantReportStorage.applyVisualGroup(vm.field, !vm.field.isVgUsed);
	};

	/**
	 * Check is subtotal group function === expression
	 */
	vm.isSubtotalExpressionDisabled = function () {
		if (!angular.isObject(vm.field))
			return true;
		if (!vm.isSubtotalsEnabled)
			return true;
		if (!angular.isObject(vm.field.groupBySubtotalFunction))
			return true;
		return vm.field.groupBySubtotalFunction.value !== 'EXPRESSION';
	};

	/**
	 * Close panel
	 */
	vm.closePanel = function () {
		$izendaInstantReportStorage.setCurrentActiveField(null);
	};

	/**
	* Initialize watchers
	*/
	vm.initWatchers = function () {
		$scope.$watch('$izendaInstantReportStorage.getCurrentActiveField()', function (field) {
			vm.field = field;
			vm.expanded = false;
		});

		$scope.$watch('$izendaInstantReportStorage.getDrillDownStyles()', function (ddStyles) {
			vm.drillDownStyles = ddStyles;
		});

		$scope.$watch('$izendaInstantReportStorage.getExpressionTypes()', function (types) {
			vm.expressionTypes = types;
		});

		$scope.$watch('$izendaInstantReportStorage.getSubreports()', function(subreports) {
			vm.subreports = subreports;
		});

		$scope.$watch('$izendaInstantReportStorage.getOptions().isSubtotalsEnabled', function (isSubtotalsEnabled) {
			vm.isSubtotalsEnabled = isSubtotalsEnabled;
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
