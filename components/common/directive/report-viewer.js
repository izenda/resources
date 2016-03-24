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
			'<div id="renderedReportDiv" class="html-container"></div>' +
		'</div>';

	/**
	 * Remove 'onkeydown' event and add own keydown and blur events, which call onPagingClick handler.
	 * @param {} $scope Current directive scope.
	 * @param {} $htmlContainer Report container, which contains paging controls
	 */
	function preparePagingInput($scope, $htmlContainer) {
		var $pageInputs = $htmlContainer.find('.iz-pagelink-exact-page-input');
		if ($pageInputs.length > 0) {
			angular.element.each($pageInputs, function () {
				var $pageInput = angular.element(this);
				$pageInput.attr('onkeydown', null);

				// input changed handler
				var onInputChanged = function ($input) {
					var pagesCount = parseInt($input.attr('data-pages-count'));
					var itemsPerPage = parseInt($input.attr('data-items-per-page'));
					var val = $input.val();
					if (val < 1) {
						val = 1;
					}
					if (val > pagesCount) {
						val = pagesCount;
					}
					var startRecord = ((val - 1) * itemsPerPage) + 1;
					var finishRecord = startRecord + itemsPerPage - 1;
					$scope.onPagingClick({
						arg0: 'iz-pagelink-exact-page-input',
						arg1: startRecord + '-' + finishRecord
					});
				}
				$pageInput.on('blur', function (event) {
					var $this = angular.element(this);
					onInputChanged($this);
				});
				$pageInput.on('keydown', function (event) {
					var kc = event.keyCode || event.which;
					if (kc !== 13) {
						return;
					}
					var $this = angular.element(this);
					onInputChanged($this);
				});
			});
		}
	}

	/**
	 * Remove 'onclick' event and add own click event, which call onPagingClick handler.
	 * @param {} $scope current Directive scope.
	 * @param {} $htmlContainer Report container, which contains paging controls.
	 */
	function preparePageLinks($scope, $htmlContainer) {
		var $pageLinks = $htmlContainer.find('.iz-pagelink, .iz-pagelink-direction-btn');
		if ($pageLinks.length > 0 && angular.isFunction($scope.onPagingClick)) {
			angular.element.each($pageLinks, function () {
				var $pageLink = angular.element(this);
				var onClickScript = $pageLink.attr('onclick');
				var matchResult = /results=(\d+\-\d+)/g.exec(onClickScript);
				if (matchResult && matchResult.length === 2)
					$pageLink.attr('data-active-page', matchResult[1]);
				$pageLink.attr('onclick', null);
				$pageLink.on('click', function () {
					var $currentLink = angular.element(this);
					$scope.onPagingClick({
						arg0: 'iz-pagelink',
						arg1: $currentLink.attr('data-active-page')
					});
				});
			});
		}
	}

	/**
	 * Remove 'onclick' event and add own click event.
	 * @param {} $scope current Directive scope.
	 * @param {} $htmlContainer Report container, which contains paging controls.
	 */
	function prepareGoToRecordBtn($scope, $htmlContainer) {
		var $btn = $htmlContainer.find('.iz-pagelink-go-to-page-btn');
		$btn.attr('onclick', null);
		$btn.on('click', function () {
			var $this = angular.element(this);
			var itemsCount = parseInt($this.attr('data-items-count'));
			var itemsPerPage = parseInt($this.attr('data-items-per-page'));
			var inputValue;
			try {
				inputValue = parseInt(angular.element('#pageNumEd').val());
			} catch (e) {
				inputValue = 1;
			}
			if (itemsCount < inputValue) inputValue = itemsCount;
			var startRecord = inputValue - (inputValue-1) % itemsPerPage;
			var finishRecord = startRecord + itemsPerPage - 1;
			$scope.onPagingClick({
				arg0: 'iz-pagelink-exact-page-input',
				arg1: startRecord + '-' + finishRecord
			});
		});
	}

	// report viewer directive
	angular.module('izendaCommonControls').directive('izendaReportViewer', ['$rootScope', function ($rootScope) {
		return {
			restrict: 'AE',
			scope: {
				allowColReorder: '@',
				allowedColumnsForReorder: '=',
				allowColRemove: '@',
				droppableAccept: '@',
				onReorder: '&',
				onHeaderClick: '&',
				onPagingClick: '&',
				onDragOver: '&',
				onRemove: '&',
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

				var isTableIsGood = function () {
					if (!$scope.$table)
						return false;
					// check if table contains visual groups:
					var isVisualGroup = $scope.$table.children('tbody').children('tr.VisualGroup').length > 0;
					if (isVisualGroup)
						return false;
					// if no table headers - stop:
					var $tableHeader = $scope.$table.children('tbody').children('tr.ReportHeader');
					if ($tableHeader.length === 0)
						return false;
					// check for multilevel pivots:
					return true;
				};

				/**
				 * Change report header in table: replace td -> th
				 * @param {jquery element object} $table 
				 * @returns {jquery element object} new table header <tr>
				 */
				var replaceTdWithTh = function () {
					var copyTag = function($fromTd, $toTh) {
						$toTh.html($fromTd.html());
						var attributes = $fromTd.prop("attributes");
						for (var j = 0; j < attributes.length; j++) {
							var attr = attributes[j];
							if (attr.name === 'align')
								$toTh.css('text-align', attr.value);
							else
								$toTh.attr(attr.name, attr.value);
						}
					};

					var $tbody = angular.element('<thead></thead>');
					var $tableHeaders = $scope.$table.children('tbody').children('tr.ReportHeader');
					angular.element.each($tableHeaders, function() {
						var $tableHeader = angular.element(this);
						var $tr = angular.element('<tr class="ReportHeader"></tr>');
						$tbody.append($tr);
						var colCount = $tableHeader.children('td').length;
						var iRegularColumnCounter = 0;
						for (var i = 0; i < colCount; i++) {
							var $td = angular.element($tableHeader.children('td').eq(i));
							var isEmptyCell = $td.hasClass('EmptyCell');
							if (!isEmptyCell) {
								var $th = angular.element('<th></th>');
								copyTag($td, $th);
								if (angular.isNumber($scope.allowedColumnsForReorder) && iRegularColumnCounter < $scope.allowedColumnsForReorder) {
									$th.addClass('isRegularColumn');
								}
								$tr.append($th);
								iRegularColumnCounter++;

								if (angular.isFunction($scope.onHeaderClick)) {
									$th.mousedown(function() {
										var $this = angular.element(this);
										if (!$this.hasClass('isRegularColumn'))
											return;
										if (angular.isFunction($scope.onHeaderClick))
											$scope.onHeaderClick({ arg0: $this.index() });
									});
								}
							} else {
								var emptyCellColspan = parseInt($td.attr('colspan'));
								for (var iEmptyCell = 0; iEmptyCell < emptyCellColspan; iEmptyCell++) {
									var $thEmptyCell = angular.element('<th></th>');
									copyTag($td, $thEmptyCell);
									$thEmptyCell.attr('colspan', '1');
									if (angular.isNumber($scope.allowedColumnsForReorder) && iRegularColumnCounter < $scope.allowedColumnsForReorder) {
										$thEmptyCell.addClass('isRegularColumn');
									}
									$tr.append($thEmptyCell);
									iRegularColumnCounter++;
								}
							}
						}
					});
					$scope.$table.prepend($tbody);
					$tableHeaders.remove();
				};

				/**
				 * Add col reorder handler.
				 * @param {jquery element object} $table 
				 */
				var addColReorderHandler = function () {
					if (!angular.isNumber($scope.allowedColumnsForReorder) || $scope.allowedColumnsForReorder === 0)
						return;
					// initialize dragtable
					$scope.$table.dragtable({
						maxMovingRows: $scope.$table.find('tr.ReportHeader').length,
						dragaccept: '.isRegularColumn',
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
					$scope.dragtableEnabled = true;
				};

				/**
				 * Add drag handlers to table
				 * @param {jquery element object} $table 
				 */
				var addDragHandlers = function() {
					// mouse over
					if (angular.isString($scope.droppableAccept)) {
						var $currenttable = $scope.$table;
						var currentTableLeft = $currenttable.offset().left;
						$htmlContainerPlaceholder.height($currenttable.height());

						var $currenttableHeader = $scope.$table.find('tr.ReportHeader').last();
						var $currenttableRows = $currenttableHeader.children('th.isRegularColumn');
						var columnCoords = [];
						angular.element.each($currenttableRows, function() {
							var $th = angular.element(this);
							columnCoords.push({
								left: $th.position().left,
								width: $th.width()
							});
						});
						if (columnCoords.length > 0)
							$htmlContainerPlaceholder.css('left', columnCoords[0].left + 'px');

						$scope.$table.on('mouseenter', function () {
							if (!$rootScope.isDraggingNow) {
								return;
							}
							$htmlContainerPlaceholder.css('top', $currenttable.position().top + 'px');
							currentTableLeft = $currenttable.offset().left;
							$htmlContainerPlaceholder.removeClass('hidden');
						});
						$scope.$table.on('mouseleave', function () {
							if (!$rootScope.isDraggingNow) {
								return;
							}
							if (event.toElement && angular.element(event.toElement).hasClass('html-container-placeholder'))
								return;
							$htmlContainerPlaceholder.addClass('hidden');
						});
						$scope.$table.on('mousemove', function (event) {
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
				};

				/**
				 * Add buttons which allow to remvoe table columns
				 * @param {jquery object} $table
				 */
				var addColRemoveButtons = function() {
					if ($scope.allowColRemove !== 'true')
						return;
					var $tableHeader = $scope.$table.children('thead').children('tr.ReportHeader').last();
					angular.element.each($tableHeader.children('th'), function() {
						var $th = angular.element(this);
						$th.css('position', 'relative');
						if (!$th.hasClass('isRegularColumn'))
							return;
						var $reportColumnRemoveButton = angular.element('<div class="report-header-remove-column-btn"><span class="glyphicon glyphicon-remove"></span></div>');
						$th.append($reportColumnRemoveButton);
						$th.on('mouseover.removebtn', function() {
							var $this = angular.element(this);
							$this.children('.report-header-remove-column-btn').show();
						});
						$th.on('mouseout.removebtn', function () {
							var $this = angular.element(this);
							$this.children('.report-header-remove-column-btn').hide();
						});
						$reportColumnRemoveButton.on('mousedown.removebtn', function (e) {
							e.stopImmediatePropagation();
							if (angular.isFunction($scope.onRemove))
								$scope.onRemove({ arg0: angular.element(this).parent().index() });
						});
					});
				};

				/**
				 * Prepare report table
				 * @param {jquery object} $table 
				 */
				var processReportTable = function () {
					if (!isTableIsGood())
						return;

					$scope.dragtableEnabled = false;

					// prepare table
					replaceTdWithTh();

					// add other handlers
					addColReorderHandler();
					addDragHandlers();
					addColRemoveButtons();
				};

				/**
				 * Apply report content html
				 * @param {string} html 
				 */
				var applyHtml = function(html) {
					// show/hide loading indicator
					if (html === null) {
						$htmlContainer.hide();
						$htmlContainerLoading.show();
					} else {
						$htmlContainer.show();
						$htmlContainerLoading.hide();
					}
					// empty result
					if (typeof (html) !== 'string' || (html && typeof(html) === 'string' && html.trim() === '')) {
						$htmlContainer.text($scope.emptyText);
						return;
					}
					$htmlContainer.html(html);

					// is paging enabled
					preparePageLinks($scope, $htmlContainer);
					preparePagingInput($scope, $htmlContainer);
					prepareGoToRecordBtn($scope, $htmlContainer);

					$scope.$table = $htmlContainer.find('table[name=reportTable]');
					if ($scope.$table.length > 0) {
						// prepare report table
						processReportTable();
					}
				};

				// htmlText change handler
				$scope.$watch('htmlText', function (newVal) {
					applyHtml(newVal);
				});
				// drag handler
				$rootScope.$watch('isDraggingNow', function(newVal) {
					if (!newVal) {
						$htmlContainerPlaceholder.addClass('hidden');
					}
				});

				// run
				applyHtml($scope.htmlText);
			}
		};
	}
	]);
})();
