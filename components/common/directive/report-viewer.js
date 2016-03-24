/**
* Report viewer directive. Used to show rendered report part (or whole report).
*/
(function () {
	'use strict';

	// template
	var reportViewerTemplate =
		'<div class="izenda-report-viewer">' +
			'<div class="html-container-placeholder hidden"></div>' +
			'<div class="html-container-loading" style="display: none;">Loading...</div>' +
			'<div class="html-container"></div>' +
		'</div>';

	angular.module('izendaCommonControls').directive('izendaReportViewer', ['$rootScope', function ($rootScope) {
		return {
			restrict: 'E',
			scope: {
				allowColReorder: '@',
				droppableAccept: '@',
				onReorder: '&',
				onHeaderClick: '&',
				onDragOver: '&',
				emptyText: '=',
				currentInsertColumnOrder: '=',
				htmlText: '='
			},
			template: reportViewerTemplate,
			link: function ($scope, elem) {
				// apply tile html function
				var $htmlContainer = elem.find('.html-container');
				var $htmlContainerLoading = elem.find('.html-container-loading');
				var $htmlContainerPlaceholder = elem.find('.html-container-placeholder');

				var applyHtml = function(html) {
					if (html === null) {
						$htmlContainer.hide();
						$htmlContainerLoading.show();
					} else {
						$htmlContainer.show();
						$htmlContainerLoading.hide();
					}

					var angularJq$ = angular.element;
					// empty result
					if (typeof (html) !== 'string' || (html && typeof(html) === 'string' && html.trim() === '')) {
						$htmlContainer.text($scope.emptyText);
						return;
					}
					
					$htmlContainer.html(html);
					// col reorder:
					if ($scope.allowColReorder === 'true') {
						var $table = $htmlContainer.find('table[name=reportTable]');
						if ($table.length === 0)
							return;
						// check if table contains visual groups:
						var isVisualGroup = $table.children('tbody').children('tr.VisualGroup').length > 0;
						if (isVisualGroup)
							return;
						// if no table headers - stop
						var $tableHeader = $table.children('tbody').children('tr.ReportHeader');
						if ($tableHeader.length === 0)
							return;

						// replace table header tr.ReportHeader -> th.ReportHeader for dragtable use
						$tableHeader = angularJq$($tableHeader[0]);
						if ($tableHeader.children('td.EmptyCell').length > 0)
							return;
						var colCount = $tableHeader.children('td').length;

						var $tbody = angularJq$('<thead></thead>');
						var $tr = angularJq$('<tr class="ReportHeader"></tr>');
						$tbody.append($tr);
						$table.prepend($tbody);

						for (var i = 0; i < colCount; i++) {
							var $td = angularJq$($tableHeader.children('td').eq(i));
							var $th = angularJq$('<th></th>');
							$th.html($td.html());
							var attributes = $td.prop("attributes");
							for (var j = 0; j < attributes.length; j++) {
								var attr = attributes[j];
								if (attr.name === 'align')
									$th.css('text-align', attr.value);
								else
									$th.attr(attr.name, attr.value);
							}
							$tr.append($th);
							if (angular.isFunction($scope.onHeaderClick)) {
								$th.mousedown(function () {
									$scope.onHeaderClick({ arg0: angular.element(this).index() });
								});
							}
						}
						$tableHeader.remove();
						// initialize dragtable
						$table.dragtable({
							maxMovingRows: 1,
							persistState: function (table) {
								var fromIndex = table.startIndex,
										toIndex = table.endIndex;
								if (angular.isFunction($scope.onReorder))
									$scope.onReorder({
										arg0: fromIndex - 1,
										arg1: toIndex - 1
									});
							}
						});

						// mouse over
						if (angular.isString($scope.droppableAccept)) {
							var $currenttable = $table;
							var currentTableLeft = $currenttable.offset().left;
							$htmlContainerPlaceholder.height($currenttable.height());

							var $currenttableHeader = $table.find('tr.ReportHeader');
							var $currenttableRows = $currenttableHeader.children('th');
							var columnCoords = [];
							angular.element.each($currenttableRows, function () {
								var $th = angular.element(this);
								columnCoords.push({
									left: $th.position().left,
									width: $th.width()
								});
							});
							if (columnCoords.length > 0)
								$htmlContainerPlaceholder.css('left', columnCoords[0].left + 'px');

							$table.on('mouseenter', function () {
								if (!$rootScope.isDraggingNow) {
									return;
								}
								$htmlContainerPlaceholder.css('top', $currenttable.position().top + 'px');
								currentTableLeft = $currenttable.offset().left;
								$htmlContainerPlaceholder.removeClass('hidden');
							});
							$table.on('mouseleave', function (e) {
								if (!$rootScope.isDraggingNow) {
									return;
								}
								if (event.toElement && angular.element(event.toElement).hasClass('html-container-placeholder'))
									return;
								$htmlContainerPlaceholder.addClass('hidden');
							});
							$table.on('mousemove', function (event) {
								if (!$rootScope.isDraggingNow)
									return;
								var left = event.pageX - currentTableLeft;
								for (var k = 0; k < columnCoords.length; k++) {
									var column = columnCoords[k];
									if (k < columnCoords.length - 1) {
										var nextColumn = columnCoords[k + 1];
										if (column.left <= left && left < nextColumn.left) {
											if (left <= column.left + (nextColumn.left - column.left) / 2) {
												$htmlContainerPlaceholder.css('left', column.left + 'px');
												$scope.currentInsertColumnOrder = k;
												$scope.$applyAsync();
											} else {
												$htmlContainerPlaceholder.css('left', nextColumn.left + 'px');
												$scope.currentInsertColumnOrder = k + 1;
												$scope.$applyAsync();
											}
										}
									} else {
										if (left >= column.left + column.width / 2) {
											$htmlContainerPlaceholder.css('left', (column.left + column.width) + 'px');
											$scope.currentInsertColumnOrder = k + 1;
											$scope.$applyAsync();
										} else if (left >= column.left) {
											$htmlContainerPlaceholder.css('left', (column.left) + 'px');
											$scope.currentInsertColumnOrder = k;
											$scope.$applyAsync();
										}
									}
								}
							});
						}
					}
				};

				$scope.$watch('htmlText', function (newVal) {
					applyHtml(newVal);
				});

				$rootScope.$watch('isDraggingNow', function(newVal) {
					if (!newVal) {
						$htmlContainerPlaceholder.addClass('hidden');
					}
				});

				applyHtml($scope.htmlText);
			}
		};
	}
	]);
})();
