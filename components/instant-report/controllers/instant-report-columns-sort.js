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
			'$modal',
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
			$modal,
			$izendaInstantReportStorage) {
	'use strict';
	$scope.$izendaInstantReportStorage = $izendaInstantReportStorage;
	var vm = this;

	//vm.panelOpened = false;
	vm.activeFields = $izendaInstantReportStorage.getAllActiveFields();
	
	vm.columnReordered = function (fromIndex, toIndex, isVisualGroupColumn) {
		$izendaInstantReportStorage.moveFieldToPosition(fromIndex, toIndex, isVisualGroupColumn);
		$izendaInstantReportStorage.getReportPreviewHtml();
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
angular.module('izendaInstantReport').directive('instantReportColumnsReorder', ['$izendaInstantReportStorage', function ($izendaInstantReportStorage) {
	return {
		restrict: 'EA',
		scope: {
			ngItems: '=',
			onReorder: '&'
		},
		template:
			'<div class="izenda-reorder-header vg">Visual group columns</div>' +
			'<ul class="izenda-reorder list-unstyled vg">' +
				'<li class="izenda-reorder-item" ng-repeat="item in vgList" ng-bind="item.title"></li>' +
			'</ul>' +
			'<div class="izenda-reorder-header simple">Columns</div>' +
			'<ul class="izenda-reorder list-unstyled simple">' +
				'<li class="izenda-reorder-item" ng-repeat="item in simpleList" ng-bind="item.title"></li>' +
			'</ul>',
		link: function (scope, element, attrs) {
			var $vgList = element.find('.izenda-reorder.vg'),
					$simpleList = element.find('.izenda-reorder.simple'),
					$vgListHeader = element.find('.izenda-reorder-header.vg'),
					$simpleListHeader = element.find('.izenda-reorder-header.simple');
				

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
				vgList.sort(function(a, b) {
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
						$el.text(table.name + ' → ' + (this.description !== '' ? this.description : this.name));
						$el.attr('data-order', i);
						$vgList.append($el);
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
						$el.text(table.name + ' → ' + (this.description !== '' ? this.description : this.name));
						$el.attr('data-order', i);
						$simpleList.append($el);
					});
					$simpleList.sortable('refresh');
				} else {
					$simpleListHeader.hide();
					$simpleList.hide();
					$simpleList.empty();
				}
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

				if (angular.isFunction(scope.onReorder))
					scope.onReorder({
						arg0: startPosition,
						arg1: endPosition,
						arg2: $parent.hasClass('vg')
			});
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
