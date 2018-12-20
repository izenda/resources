import * as angular from 'angular';
import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';

/**
 * Instant report field options controller
 */
izendaInstantReportModule.controller('InstantReportFieldOptionsController', [
	'$rootScope',
	'$scope',
	'$window',
	'$timeout',
	'$q',
	'$sce',
	'$log',
	'$izendaLocaleService',
	'$izendaCompatibilityService',
	'$izendaInstantReportQueryService',
	'$izendaInstantReportStorageService',
	'$izendaInstantReportValidationService',
	function (
		$rootScope,
		$scope,
		$window,
		$timeout,
		$q,
		$sce,
		$log,
		$izendaLocaleService,
		$izendaCompatibilityService,
		$izendaInstantReportQueryService,
		$izendaInstantReportStorageService,
		$izendaInstantReportValidationService) {
		'use strict';
		var vm = this;
		var primaryButtonClass = "izenda-common-btn-dark",
			activeButtonClass = "izenda-common-btn-dark active";

		$scope.$izendaLocaleService = $izendaLocaleService;
		$scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
		vm.field = null;
		vm.currentSortFunction = 'asc';
		vm.isSubtotalsEnabled = false;

		vm.drillDownStyles = $izendaInstantReportStorageService.getDrillDownStyles();
		vm.subreports = $izendaInstantReportStorageService.getSubreports();
		vm.expanded = false;
		vm.ddkValuesMaxAmount = -1;
		/**
		 * Get class 
		 */
		vm.getPanelClass = function () {
			if ($izendaCompatibilityService.isSmallResolution())
				return 'expanded';
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
			$izendaInstantReportStorageService.applyDescription(vm.field);
		};

		/**
		 * Fires when group was selected
		 */
		vm.onFunctionSelected = function () {
			if (vm.field.groupByFunction === null)
				return;
			$izendaInstantReportStorageService.onFieldFunctionApplied(vm.field);
		};

		/**
		 * Fires when typegroup was selected
		 */
		vm.onTypeGroupSelected = function () {
			$izendaInstantReportStorageService.onExpressionTypeGroupApplied(vm.field);
		};

		/**
		 * Fires when expression changed.
		 */
		vm.onExpressionChanged = function () {
			$izendaInstantReportStorageService.onExpressionApplied();
		};

		/**
		 * Update preview
		 */
		vm.applyChanges = function () {
			$izendaInstantReportValidationService.validateReportSetAndRefresh();
		};

		/**
		 * Toggle label justification
		 */
		vm.toggleLabelJustification = function () {
			var itemsArray = ['L', 'M', 'R', 'J', ' '];
			var idx = itemsArray.indexOf(vm.field.labelJustification);
			if (idx < itemsArray.length - 1)
				idx++;
			else
				idx = 0;
			vm.field.labelJustification = itemsArray[idx];
		};

		/**
		 * Toggle value justification
		 */
		vm.toggleValueJustification = function () {
			var itemsArray = ['L', 'M', 'R', 'J', ' '];
			var idx = itemsArray.indexOf(vm.field.valueJustification);
			if (idx < itemsArray.length - 1)
				idx++;
			else
				idx = 0;
			vm.field.valueJustification = itemsArray[idx];
		};

		/**
		 * Get sort button class
		 */
		vm.getSortButtonClass = function() {
			if (!vm.field)
				return '';
			return vm.field.sort !== null ? 'active' : '';
		};

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
					$izendaInstantReportStorageService.applyFieldSort(vm.field, vm.currentSortFunction);
				} else {
					// disable selected sort
					$izendaInstantReportStorageService.applyFieldSort(vm.field, null);
				}
			} else {
				// set and enable selected sort
				vm.currentSortFunction = sortFunction;
				$izendaInstantReportStorageService.applyFieldSort(vm.field, vm.currentSortFunction);
			}
		};

		/**
		 * Get italic button class
		 */
		vm.getItalicButtonClass = function () {
			if (!vm.field)
				return '';
			return vm.field.italic ? 'active' : '';
		};

		/**
		 * Apply field italic.
		 */
		vm.applyFieldItalic = function () {
			$izendaInstantReportStorageService.applyFieldItalic(vm.field, !vm.field.italic);
		};

		/**
		 * Get visible button class
		 */
		vm.getVisibleButtonClass = function () {
			if (!vm.field)
				return '';
			var classes = [];
			if (vm.field.isVgUsed)
				classes.push('disabled');
			if (!vm.field.visible)
				classes.push('active');
			return classes.join(' ');
		};

		/**
		 * Apply field italic.
		 */
		vm.applyFieldVisible = function () {
			if (vm.field.isVgUsed)
				return;
			$izendaInstantReportStorageService.applyFieldVisible(vm.field, !vm.field.visible);
			$izendaInstantReportValidationService.validateReportSetAndRefresh();
		};

		/**
		 * Get bold button class
		 */
		vm.getBoldButtonClass = function () {
			if (!vm.field)
				return '';
			return vm.field.bold ? 'active' : '';
		};

		/**
		 * Apply field bold.
		 */
		vm.applyFieldBold = function () {
			$izendaInstantReportStorageService.applyFieldBold(vm.field, !vm.field.bold);
		};

		/**
		 * Get visual group button class
		 */
		vm.getVgButtonClass = function() {
			if (!vm.field)
				return '';
			var classes = [];
			if (!vm.field.visible)
				classes.push('disabled');
			if (vm.field.isVgUsed)
				classes.push('active');
			return classes.join(' ');
		};

		/**
		 * Apply visual group changed
		 */
		vm.applyVg = function () {
			if (!vm.field.visible)
				return;
			$izendaInstantReportStorageService.applyVisualGroup(vm.field, !vm.field.isVgUsed);
		};

		/**
		 * If user selects non-default subtotal function, we need to turn on subtotals.
		 */
		vm.onSubtotalFunctionSelect = function () {
			var subtotalFunction = vm.field.groupBySubtotalFunction;
			if (subtotalFunction !== 'DEFAULT')
				$izendaInstantReportStorageService.getOptions().isSubtotalsEnabled = true;
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
		* Subreport selected handler
		*/
		vm.subreportSelectedHandler = function () {
			vm.field.drillDownStyle = (vm.field.subreport) ? 'DetailLinkNewWindow' : '';
			$izendaInstantReportStorageService.disableEmbeddedDrillDownStyle(vm.field);
			$scope.$applyAsync();
		};

		/**
		 * Close panel
		 */
		vm.closePanel = function () {
			$izendaInstantReportStorageService.setCurrentActiveField(null);
		};

		/**
		* Initialize watchers
		*/
		vm.initWatchers = function () {
			$scope.$watch('$izendaInstantReportStorageService.getCurrentActiveField()', function (field) {
				vm.field = field;
				vm.expanded = false;
				if (angular.isObject(vm.field)) {
					$izendaInstantReportStorageService.disableEmbeddedDrillDownStyle(vm.field);
				}
			});

			$scope.$watch('$izendaInstantReportStorageService.getDrillDownStyles()', function (ddStyles) {
				vm.drillDownStyles = ddStyles;
			});

			$scope.$watch('$izendaInstantReportStorageService.getExpressionTypes()', function (types) {
				vm.expressionTypes = types;
			});

			$scope.$watch('$izendaInstantReportStorageService.getSubreports()', function (subreports) {
				vm.subreports = subreports;
			});

			$scope.$watch('$izendaInstantReportStorageService.getOptions().isSubtotalsEnabled', function (isSubtotalsEnabled) {
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
]);