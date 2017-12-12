izendaRequire.define([
	'angular',
	'../../common/core/services/compatibility-service',
	'../../common/core/services/localization-service',
	'../services/services',
	'../directive/directives'
], function (angular) {

	/**
	* Instant report filters controller
	*/
	angular.module('izendaInstantReport').controller('InstantReportColumnsSortController', [
				'$rootScope',
				'$scope',
				'$window',
				'$timeout',
				'$q',
				'$sce',
				'$log',
				'$izendaLocale',
				'$izendaCompatibility',
				'$izendaInstantReportStorage',
				InstantReportColumnsSortController
	]);

	function InstantReportColumnsSortController(
				$rootScope,
				$scope,
				$window,
				$timeout,
				$q,
				$sce,
				$log,
				$izendaLocale,
				$izendaCompatibility,
				$izendaInstantReportStorage) {
		'use strict';
		$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
		var vm = this;

		//vm.panelOpened = false;
		vm.activeFields = $izendaInstantReportStorage.getAllActiveFields();

		vm.columnReordered = function (fromIndex, toIndex, isVisualGroupColumn) {
			$izendaInstantReportStorage.moveFieldToPosition(fromIndex, toIndex, isVisualGroupColumn, false);
			if (!$izendaCompatibility.isSmallResolution())
				$izendaInstantReportStorage.getReportPreviewHtml();
			$scope.$applyAsync();
		};

		/**
		 * Initialize watches
		 */
		vm.initWatchers = function () {
			$scope.$watch('$izendaInstantReportStorage.getAllActiveFields()', function (newActiveFields) {
				vm.activeFields = newActiveFields;
			}, true);
		};

		/**
		 * Initialize controller
		 */
		vm.init = function () {
		};

		vm.initWatchers();
	}

	/**
	 * Columns reorder directive
	 */
	angular.module('izendaInstantReport').directive('instantReportColumnsReorder', [
				'$izendaLocale',
				'$izendaInstantReportStorage',
		function ($izendaLocale, $izendaInstantReportStorage) {
			return {
				restrict: 'EA',
				scope: {
					ngItems: '=',
					showSortButtons: '@',
					onReorder: '&'
				},
				template:
					'<div class="izenda-reorder-header vg">' + $izendaLocale.localeText('js_VisGroupColumns', 'Visual group columns') + '</div>' +
					'<ul class="izenda-reorder list-unstyled vg">' +
						'<li class="izenda-reorder-item" ng-repeat="item in vgList" ng-bind="item.title">' +
							'<span class="pull-right glyphicon glyphicon-arrow-up"></span>' +
							'<span class="pull-right glyphicon glyphicon-arrow-down"></span>' +
						'</li>' +
					'</ul>' +
					'<div class="izenda-reorder-header simple">' + $izendaLocale.localeText('js_Columns', 'Columns') + '</div>' +
					'<ul class="izenda-reorder list-unstyled simple">' +
						'<li class="izenda-reorder-item" ng-repeat="item in simpleList" ng-bind="item.title">' +
							'<span class="pull-right glyphicon glyphicon-arrow-up"></span>' +
							'<span class="pull-right glyphicon glyphicon-arrow-down"></span>' +
						'</li>' +
					'</ul>',
				link: function (scope, element, attrs) {
					var $vgList = element.find('.izenda-reorder.vg'),
							$simpleList = element.find('.izenda-reorder.simple'),
							$vgListHeader = element.find('.izenda-reorder-header.vg'),
							$simpleListHeader = element.find('.izenda-reorder-header.simple');

					/**
					 * Call reorder handler
					 */
					var doReorder = function (startPosition, endPosition, isVg) {
						if (angular.isFunction(scope.onReorder))
							scope.onReorder({
								arg0: startPosition,
								arg1: endPosition,
								arg2: isVg
							});
					};

					/**
					 * Sort handler
					 */
					var sortUpdateHandler = function (event, ui) {
						var $elem = ui.item,
								$parent = $elem.closest('.izenda-reorder');
						var startPosition = parseInt($elem.attr('data-order'));
						var endPosition = $elem.index();
						// update indexes
						$parent.children().each(function (i) {
							angular.element(this).attr('data-order', i);
						});
						doReorder(startPosition, endPosition, $parent.hasClass('vg'));
					};

					/**
					 * Prepare data and update sortable
					 */
					var prepare = function (items) {
						// prepare lists
						var vgList = [], simpleList = [];
						if (angular.isArray(items)) {
							for (var i = 0; i < items.length; i++) {
								var item = items[i];
								if (item.isVgUsed)
									vgList.push(item);
								else
									simpleList.push(item);
							}
						}
						vgList.sort(function (a, b) {
							return a.order - b.order;
						});
						simpleList.sort(function (a, b) {
							return a.order - b.order;
						});

						// create elements:
						if (vgList.length > 0) {
							$vgListHeader.show();
							$vgList.show();
							$vgList.empty();
							angular.element.each(vgList, function (i) {
								var table = $izendaInstantReportStorage.getTableById(this.parentId);
								var $el = angular.element('<li class="izenda-reorder-item"></li>');
								$el.attr('data-order', i);
								$vgList.append($el);

								var $span = angular.element('<span class="izenda-reorder-item-text"></span>');
								$span.text(table.name + ' → ' + (this.description !== '' ? this.description : this.name));
								$el.append($span);

								if (scope.showSortButtons) {
									var $arrowUp = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn1" title="' +
										$izendaLocale.localeText('js_MoveColumnUp', 'Move column up') + '"><span class="glyphicon glyphicon-arrow-up"></span></span>');
									$el.append($arrowUp);
									$arrowUp.on('click', function () {
										var index = angular.element(this).closest('.izenda-reorder-item').index();
										if (index > 0) {
											doReorder(index, index - 1, true);
										}
									});
									var $arrowDown = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn2" title="' +
										$izendaLocale.localeText('js_MoveColumnDown', 'Move column down') + '"><span class="glyphicon glyphicon-arrow-down"></span></span>');
									$el.append($arrowDown);
									$arrowDown.on('click', function () {
										var index = angular.element(this).closest('.izenda-reorder-item').index();
										if (index < vgList.length - 1) {
											doReorder(index, index + 1, true);
										}
									});
								}
							});
							$vgList.sortable('refresh');
						} else {
							$vgListHeader.hide();
							$vgList.hide();
							$vgList.empty();
						}

						if (simpleList.length > 0) {
							if (vgList.length > 0)
								$simpleListHeader.show();
							else
								$simpleListHeader.hide();
							$simpleList.show();
							$simpleList.empty();
							angular.element.each(simpleList, function (i) {
								var table = $izendaInstantReportStorage.getTableById(this.parentId);
								var $el = angular.element('<li class="izenda-reorder-item"></li>');
								$el.attr('data-order', i);
								$simpleList.append($el);

								var $span = angular.element('<span class="izenda-reorder-item-text"></span>');
								$span.text(table.name + ' → ' + (this.description !== '' ? this.description : this.name));
								$el.append($span);

								if (scope.showSortButtons) {
									var $arrowUp = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn1" title="' +
										$izendaLocale.localeText('js_MoveColumnUp', 'Move column up') + '"><span class="glyphicon glyphicon-arrow-up"></span></span>');
									$el.append($arrowUp);
									$arrowUp.on('click', function () {
										var index = angular.element(this).closest('.izenda-reorder-item').index();
										if (index > 0) {
											doReorder(index, index - 1, false);
										}
									});
									var $arrowDown = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn2" title="' +
										$izendaLocale.localeText('js_MoveColumnDown', 'Move column down') + '"><span class="glyphicon glyphicon-arrow-down"></span></span>');
									$el.append($arrowDown);
									$arrowDown.on('click', function () {
										var index = angular.element(this).closest('.izenda-reorder-item').index();
										if (index < simpleList.length - 1) {
											doReorder(index, index + 1, false);
										}
									});
								}
							});
							$simpleList.sortable('refresh');
						} else {
							$simpleListHeader.hide();
							$simpleList.hide();
							$simpleList.empty();
						}
					};

					// initialize
					$vgList.sortable({
						update: sortUpdateHandler,
						axis: 'y'
					});
					$vgList.disableSelection();
					$simpleList.sortable({
						update: sortUpdateHandler,
						axis: 'y'
					});
					$simpleList.disableSelection();
					prepare(scope.ngItems);

					// watch for updates
					scope.$watch('ngItems', function (newVal) {
						prepare(newVal);
					}, true);
				}
			};
		}]);
});