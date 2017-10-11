izendaRequire.define([
	'angular',
	'../../module-definition',
	'../../../core/services/localization-service',
	'../../../query/services/settings-service',
	'../../../query/services/common-query-service',
	'../../../query/services/url-service',
	'../../../core/directives/bootstrap-modal'
], function (angular) {
	/**
	 * Select report component definition
	 */
	angular.module('izenda.common.ui').component('izendaSelectReportComponent', {
		templateUrl: '###RS###extres=components.common.ui.components.select-report.template.html',
		bindings: {
			opened: '<',
			onSelected: '&',
			onModalClosed: '&'
		},
		controller: ['$timeout', '$izendaLocale', '$izendaUrl', '$izendaSettings', '$izendaCommonQuery', izendaSelectReportComponentCtrl]
	});

	function izendaSelectReportComponentCtrl($timeout, $izendaLocale, $izendaUrl, $izendaSettings, $izendaCommonQuery) {
		var $ctrl = this;

		$ctrl.openedInner = false;
		$ctrl.category = uncategorizedText;
		$ctrl.categories = [];
		$ctrl.groups = [];

		$ctrl.isLoading = true;
		$ctrl.hideAll = true;
		$ctrl.$izendaUrl = $izendaUrl;
		var uncategorizedText = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');

		/**
		 * Component init
		 */
		$ctrl.$onInit = function () {
		};

		$ctrl.$onChanges = function (changesObj) {
			if (changesObj.opened) {
				var currentOpened = changesObj.opened.currentValue;
				if (currentOpened) {
					$ctrl.reset();
					$ctrl.openedInner = true;
					// timeout is needed for the smoother modal animation
					$timeout(function () {
						$ctrl.hideAll = false;
						$izendaCommonQuery.getReportSetCategory(uncategorizedText).then(function (data) {
							var reportSets = data.ReportSets;
							$ctrl.addCategoriesToModal(reportSets);
							$ctrl.addReportsToModal(reportSets);
							$ctrl.isLoading = false;
						});
					}, 500);
				}
			}
		};
		
		/**
		 * Add report parts to modal
		 */
		$ctrl.addReportPartsToModal = function (reportParts) {
			$ctrl.groups = [];

			if (!reportParts || !reportParts.length)
				return;

			// add groups:
			var currentGroup = [];
			for (var i = 0; i < reportParts.length; i++) {
				if (i > 0 && i % 4 === 0) {
					$ctrl.groups.push(currentGroup);
					currentGroup = [];
				}
				var reportPart = reportParts[i];
				reportPart.isReportPart = true;
				currentGroup.push(reportPart);
			}
			$ctrl.groups.push(currentGroup);
		};

		/**
		 * Add reportset categories to modal select control.
		 */
		$ctrl.addCategoriesToModal = function (reportSets) {
			if (!reportSets)
				return;

			$ctrl.categories = [];
			for (var i = 0; i < reportSets.length; i++) {
				var report = reportSets[i];
				if (report.Dashboard)
					continue;
				var category = report.Category ? report.Category : uncategorizedText;
				var item = !report.Subcategory ? category : category + $izendaSettings.getCategoryCharacter() + report.Subcategory;
				if ($ctrl.categories.indexOf(item) < 0) {
					$ctrl.categories.push(item);
				}
			}
		};

		/**
		 * Add report to modal dialog body.
		 */
		$ctrl.addReportsToModal = function (reportSets) {
			$ctrl.groups = [];
			var reportSetsToShow = angular.element.grep(reportSets, function (crs) {
				return !crs.Dashboard && crs.Name;
			});
			if (!reportSetsToShow || !reportSetsToShow.length)
				return;

			// add groups:
			var currentGroup = [];
			$ctrl.groups.length = 0;
			for (var i = 0; i < reportSetsToShow.length; i++) {
				if (i > 0 && i % 4 === 0) {
					$ctrl.groups.push(currentGroup);
					currentGroup = [];
				}
				var reportSet = reportSetsToShow[i];
				reportSet.isReportPart = false;
				currentGroup.push(reportSet);
			}
			$ctrl.groups.push(currentGroup);
		};

		/**
		 * Select category handler
		 */
		$ctrl.categoryChangedHandler = function () {
			$ctrl.isLoading = true;
			$ctrl.groups = [];
			if (!$ctrl.category)
				$ctrl.category = uncategorizedText;
			$izendaCommonQuery.getReportSetCategory($ctrl.category).then(function (data) {
				$ctrl.addReportsToModal(data.ReportSets);
				$ctrl.isLoading = false;
			});
		};

		/**
		 * Modal closed handler
		 */
		$ctrl.modalClosedHandler = function () {
			if (angular.isFunction($ctrl.onModalClosed))
				$ctrl.onModalClosed({});
		};

		/**
		 * User clicked to report set item
		 */
		$ctrl.itemSelectedHandler = function (item) {
			var isReportPart = item.isReportPart;
			var reportFullName = item.Name;

			if (item.CategoryFull != null && item.CategoryFull !== '')
				reportFullName = item.CategoryFull + $izendaSettings.getCategoryCharacter() + reportFullName;

			if (!isReportPart) {
				// if report set selected
				$ctrl.isLoading = true;
				$ctrl.groups = [];
				$izendaCommonQuery.getReportParts(reportFullName).then(function (data) {
					var reports = data.Reports;
					$ctrl.addReportPartsToModal(reports);
					$ctrl.isLoading = false;
				});
			} else {
				$ctrl.openedInner = false;
				// if report part selected
				if (angular.isFunction($ctrl.onSelected))
					$ctrl.onSelected({ reportPartInfo: item });
			}
		};

		/**
		 * Reset form
		 */
		$ctrl.reset = function () {
			$ctrl.category = uncategorizedText;
			$ctrl.categories = [];
			$ctrl.groups = [];
			$ctrl.isLoading = true;
			$ctrl.hideAll = true;
		};
	}
});