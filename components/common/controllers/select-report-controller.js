izendaRequire.define(['angular', '../services/services', '../directive/directives'], function (angular) {

	/**
	 * Select report report part modal dialog control.
	 */
	angular.module('izenda.common.ui')
		.component('izendaSelectReportPart', {
			templateUrl: 'Resources/components/common/templates/select-report.html',
			controller: ['$scope', '$element', '$izendaLocale', '$izendaUrl', '$izendaCommonQuery', '$izendaSettings',
				IzendaSelectReportPart],
			bindings: {
				isVisible: '<',
				onReportPartSelected: '&',
				onReportPartCancelled: '&'
			}
		});

	function IzendaSelectReportPart($scope, $element, $izendaLocale, $izendaUrl, $izendaCommonQuery, $izendaSettings) {
		'use strict';
		var self = this;
		var UNCATEGORIZED = $izendaLocale.localeText('js_Uncategorized', 'Uncategorized');
		self.izendaUrl = $izendaUrl;
		self.isLoading = false;

		self.category = UNCATEGORIZED;
		self.categories = [];
		self.groups = [];

		/**
		 * Bindings listener
		 */
		self.$onChanges = function (changesObj) {
			if (angular.isObject(changesObj.isVisible)) {
				if (changesObj.isVisible.currentValue)
					self.show();
			};
		};

		/**
		 * Reset form
		 */
		self.reset = function () {
			self.isLoading = true;
			self.category = UNCATEGORIZED;
			self.categories = [];
			self.groups = [];
		};

		/**
		 * Add report parts to modal
		 */
		self.addReportPartsToModal = function (reportParts) {
			self.groups = [];
			if (!reportParts || !reportParts.length) {
				return;
			}
			// add groups:
			var currentGroup = [];
			for (var i = 0; i < reportParts.length; i++) {
				if (i > 0 && i % 4 === 0) {
					self.groups.push(currentGroup);
					currentGroup = [];
				}
				var reportPart = reportParts[i];
				reportPart.isReportPart = true;
				currentGroup.push(reportPart);
			}
			self.groups.push(currentGroup);
		};

		/**
		 * Add reportset categories to modal select control.
		 */
		self.addCategoriesToModal = function (reportSets) {
			if (!reportSets)
				return;
			self.categories = [];
			for (var i = 0; i < reportSets.length; i++) {
				var report = reportSets[i];
				if (report.Dashboard)
					continue;
				var category = report.Category;
				if (category == null || category === '')
					category = UNCATEGORIZED;
				var item = !report.Subcategory ? category : category + $izendaSettings.getCategoryCharacter() + report.Subcategory;
				if (self.categories.indexOf(item) < 0) {
					self.categories.push(item);
				}
			}
		};

		/**
		 * Add report to modal dialog body.
		 */
		self.addReportsToModal = function (reportSets) {
			self.groups = [];
			var reportSetsToShow = angular.element.grep(reportSets, function (currentReportSet) {
				return !currentReportSet.Dashboard && currentReportSet.Name;
			});
			if (!reportSetsToShow || !reportSetsToShow.length)
				return;

			// add groups:
			var currentGroup = [];
			self.groups = [];
			for (var i = 0; i < reportSetsToShow.length; i++) {
				if (i > 0 && i % 4 === 0) {
					self.groups.push(currentGroup);
					currentGroup = [];
				}
				var reportSet = reportSetsToShow[i];
				reportSet.isReportPart = false;
				currentGroup.push(reportSet);
			}
			self.groups.push(currentGroup);
		};

		/**
		 * Select report part modal
		 */
		self.show = function () {
			self.reset();
			var $modal = angular.element($element).children('.modal');
			var modal = $modal.modal({
				backdrop: 'static',
				keyboard: false
			});
			modal.on('hidden.bs.modal', function () {
				if (angular.isFunction(self.onReportPartCancelled)) {
					self.onReportPartCancelled();
				}
				$scope.$applyAsync();
			})
			$izendaCommonQuery.getReportSetCategory(UNCATEGORIZED).then(function (data) {
				var reportSets = data.ReportSets;
				self.addCategoriesToModal(reportSets);
				self.addReportsToModal(reportSets);
				self.isLoading = false;
				$scope.$applyAsync();
			});
		};

		/**
		 * Select category handler
		 */
		self.categoryChangedHandler = function () {
			self.isLoading = true;
			self.groups = [];
			self.category = self.category || UNCATEGORIZED;
			$izendaCommonQuery.getReportSetCategory(self.category).then(function (data) {
				self.addReportsToModal(data.ReportSets);
				self.isLoading = false;
				$scope.$applyAsync();
			});
		};

		/**
		 * User clicked to report set item
		 */
		self.itemSelectedHandler = function (item) {
			var isReportPart = item.isReportPart;
			var reportFullName = item.Name;

			if (item.CategoryFull != null && item.CategoryFull !== '')
				reportFullName = item.CategoryFull + $izendaSettings.getCategoryCharacter() + reportFullName;

			if (!isReportPart) {
				// if report set selected
				self.isLoading = true;
				self.groups = [];
				$izendaCommonQuery.getReportParts(reportFullName).then(function (data) {
					var reports = data.Reports;
					self.addReportPartsToModal(reports);
					self.isLoading = false;
					$scope.$applyAsync();
				});
			} else {
				// if report part selected
				var $modal = angular.element($element).children('.modal');
				$modal.modal('hide');
				if (angular.isFunction(self.onReportPartSelected)) {
					self.onReportPartSelected({ reportPartObject: item });
				}
			}
		};
	}
});