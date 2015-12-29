/**
* Report viewer directive. Used to show rendered report part (or whole report).
*/
(function () {
	'use strict';

	// template
	var reportViewerTemplate =
		'<div class="izenda-report-viewer">' +
			'<div class="html-container-loading" style="display: none;">Loading...</div>' +
			'<div class="html-container"></div>' +
		'</div>';

	angular.module('izendaCommonControls').directive('izendaReportViewer', ['$log', function ($log) {
		return {
			restrict: 'A',
			scope: {
				allowColReorder: '@',
				onReorder: '&',
				onHeaderClick: '&',
				emptyText: '=',
				htmlText: '='
			},
			template: reportViewerTemplate,
			link: function ($scope, elem, attrs) {
				// apply tile html function
				var $htmlContainer = elem.find('.html-container');
				var $htmlContainerLoading = elem.find('.html-container-loading');

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
					if (!angular.isString(html) || html.trim() === '') {
						$htmlContainer.text($scope.emptyText);
						return;
					}
					
					$htmlContainer.html(html);
					// col reorder:
					if ($scope.allowColReorder === 'true') {
						var $table = $htmlContainer.find('table[name=reportTable]');
						if ($table.length !== 0) {
							// check if table contains visual groups:
							var isVisualGroup = $table.children('tbody').children('tr.VisualGroup').length > 0;
							if (isVisualGroup)
								return;

							// if no table headers - stop
							var $tableHeader = $table.children('tbody').children('tr.ReportHeader');
							if ($tableHeader.length === 0)
								return;
							$tableHeader = angularJq$($tableHeader[0]);

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
								angular.element.each(attributes, function () {
									if (this.name === 'align')
										$th.css('text-align', this.value);
									else
										$th.attr(this.name, this.value);
								});
								$tr.append($th);
								if (angular.isFunction($scope.onHeaderClick)) {
									$th.mousedown(function () {
										$scope.onHeaderClick({ arg0: angular.element(this).index() });
									});
								}
							}
							if (!isVisualGroup)
								$tableHeader.remove();
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
						}
					}
				};

				$scope.$watch('htmlText', function (newVal) {
					applyHtml(newVal);
				});
				applyHtml($scope.htmlText);
			}
		};
	}
	]);
})();
