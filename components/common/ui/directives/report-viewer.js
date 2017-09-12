izendaRequire.define([
	'angular',
	'../module-definition',
	'../../../core/services/localization-service'
], function (angular) {
	'use strict';

	/**
	 * Report viewer directive. Used to show rendered report part (or whole report).
	 */
	angular.module('izenda.common.ui').directive('izendaReportViewer', [
		'$rootScope', '$timeout', '$izendaLocale',
		function ($rootScope, $timeout, $izendaLocale) {
			return {
				restrict: 'AE',
				scope: {
					allowColReorder: '@',
					allowedColumnsForReorder: '=',
					reportSetOptions: '=',
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
				template: '<div class="izenda-report-viewer">' +
				'<div class="html-container-placeholder hidden"></div>' +
				'<div class="html-container-loading" style="display: none;">' + $izendaLocale.localeText('js_Loading', 'Loading...') + '</div>' +
				'<div id="renderedReportDiv" class="html-container"></div>' +
				'</div>',
				link: function ($scope, elem) {
					// apply tile html function
					var $htmlContainer = elem.find('.html-container');
					var $htmlContainerLoading = elem.find('.html-container-loading');
					var $htmlContainerPlaceholder = elem.find('.html-container-placeholder');

					var isVgApplyed = function () {
						if (angular.isObject($scope.reportSetOptions))
							return $scope.reportSetOptions.isVgUsed;
						return false;
					};

					var isTableContainVgColumns = function () {
						return isVgApplyed() && ($scope.reportSetOptions.vgStyle === 'AnalysisGrid' || $scope.reportSetOptions.vgStyle === 'VGHierarchy');
					};

					var getCountOfVgColumns = function () {
						var countOfVgColumns = 0;
						if (isTableContainVgColumns()) {
							var fieldsInTable = $scope.reportSetOptions.sortedActiveFields;
							angular.element.each(fieldsInTable, function () {
								if (this.isVgUsed)
									countOfVgColumns++;
							});
						}
						return countOfVgColumns;
					};

					/**
					 * Get fields which have own column in preview table
					 * @returns {Array} array of field objects.
					 */
					var getColumnFields = function () {
						var fieldsInTable;
						if (isTableContainVgColumns())
							fieldsInTable = $scope.reportSetOptions.sortedActiveFields;
						else
							fieldsInTable = angular.element.grep($scope.reportSetOptions.sortedActiveFields, function (f) {
								return !f.isVgUsed;
							});
						return fieldsInTable;
					};

					var isTableIsGood = function () {
						if (!$scope.$table)
							return false;
						// if no table headers - stop:
						var $tableHeader = $scope.$table.children('tbody').children('tr.ReportHeader');
						if ($tableHeader.length === 0)
							return false;
						// check if table contains visual groups:
						return true;
					};

					/**
					 * Add col reorder handler.
					 * @param {jquery element object} $table 
					 */
					var addColReorderHandler = function (onColumnReorderCompleted) {
						if ($scope.allowColReorder !== 'true')
							return;

						$scope.reorderState = {
							started: false,
							$from: null
						};
						var bodyOnselectstartSave = angular.element(document.body).attr('onselectstart'),
							bodyUnselectableSave = angular.element(document.body).attr('unselectable');
						var _disableTextSelection = function () {
							// jQuery doesn't support the element.text attribute in MSIE 8
							// http://stackoverflow.com/questions/2692770/style-style-textcss-appendtohead-does-not-work-in-ie
							var $style = angular.element('<style id="__disable_text_selection__" type="text/css">body { -ms-user-select:none;-moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;user-select:none; }</style>');
							angular.element(document.head).append($style);
							angular.element(document.body).attr('onselectstart', 'return false;').attr('unselectable', 'on');
							if (window.getSelection) {
								window.getSelection().removeAllRanges();
							} else {
								document.selection.empty(); // MSIE http://msdn.microsoft.com/en-us/library/ms535869%28v=VS.85%29.aspx
							}
						};
						var restoreTextSelection = function () {
							angular.element('#__disable_text_selection__').remove();
							if (bodyOnselectstartSave) {
								angular.element(document.body).attr('onselectstart', bodyOnselectstartSave);
							} else {
								angular.element(document.body).removeAttr('onselectstart');
							}
							if (bodyUnselectableSave) {
								angular.element(document.body).attr('unselectable', bodyUnselectableSave);
							} else {
								angular.element(document.body).removeAttr('unselectable');
							}
						};
						var _createHelper = function (innerOffset) {
							var $cell = $scope.reorderState.$from;
							var $clone = $cell.clone().wrap('<div class="izenda-col-reorder-helper"></div>').parent();
							$clone.width($cell.outerWidth());
							$clone.height($cell.outerHeight());
							$clone.css('top', $cell.position().top);
							$clone.css('left', $cell.position().left + innerOffset);
							$scope.reorderState.$helper = $clone;
							$scope.reorderState.helperOffset = innerOffset;
							$scope.$table.append($clone);
							return $clone;
						};
						var _removeHelper = function () {
							$scope.reorderState.$helper.remove();
						};
						var _beforeReorderStarted = function () {
							_disableTextSelection();
							$scope.reorderState.$from.addClass('izenda-reorder-cell-selected');
							$scope.reorderState.previousPosition = $scope.$table.css('position');
							$scope.$table.css('position', 'relative');
						};
						var _afterReorderCompleted = function () {
							$scope.reorderState.$from.removeClass('izenda-reorder-cell-selected');
							$scope.reorderState.itemsCache = null;
							$scope.$table.css('position', $scope.reorderState.previousPosition);
							$scope.$table.find('.izenda-col-reorder-active').removeClass('izenda-col-reorder-active');
							_removeHelper();
							restoreTextSelection();
						};
						var _getCurrentItemsForReorder = function () {
							if (!$scope.reorderState.itemsCache) {
								$scope.reorderState.itemsCache = $scope.reorderState.$from.parent().children();
							}
							return $scope.reorderState.itemsCache;
						};
						var _completeReorder = function () {
							if (!$scope.reorderState.started)
								return;
							$scope.reorderState.started = false;
							_afterReorderCompleted();
							if (angular.isFunction(onColumnReorderCompleted)) {
								var isVg = $scope.reorderState.$from.attr('data-is-vg-column') === 'true';
								onColumnReorderCompleted($scope.reorderState.$from, $scope.reorderState.$to, isVg);
							}
						};

						// add table handlers:
						angular.element(document).off('mousemove.izendaColReorder');
						angular.element(document).off('mouseup.izendaColReorder');
						angular.element(document).on('mousemove.izendaColReorder', function (e) {
							if (!$scope.reorderState.started)
								return;
							var currentTableX = e.pageX - $scope.$table.offset().left;
							var isFromColumnVg = $scope.reorderState.$from.attr('data-is-vg-column') === 'true';


							// highlight current column
							var $tds = _getCurrentItemsForReorder();
							var $toTd = null;
							angular.element.each($tds, function () {
								var $td = angular.element(this);
								var tdLeft = $td.position().left,
									tdWidth = $td.outerWidth();
								var isTdColumnVg = $td.attr('data-is-vg-column') === 'true';
								if (!$td.hasClass('izenda-col-reorder-disabled') && isFromColumnVg === isTdColumnVg
									&& currentTableX >= tdLeft && currentTableX < tdLeft + tdWidth) {
									$toTd = $td;
								}
							});

							var isToTdChanged = false;
							if ($toTd) {
								if (!$scope.reorderState.$to || $toTd.index() !== $scope.reorderState.$to.index()) {
									isToTdChanged = true;
									$scope.reorderState.$to = $toTd;
								}
							}
							if (isToTdChanged) {
								$tds.removeClass('izenda-col-reorder-active');
								if (!$scope.reorderState.$to.hasClass('izenda-col-reorder-active')) {
									$scope.reorderState.$to.addClass('izenda-col-reorder-active');
								}

								// bubble inner content
								var fromIndex = $scope.reorderState.$from.index();
								var toIndex = $scope.reorderState.$to.index();
								angular.element.each($tds, function () {
									var $td = angular.element(this);
									var $backups = $td.children('.izenda-col-reorder-hidden');
									if ($backups.length > 0) {
										$td.children().not('.izenda-col-reorder-hidden').remove();
									}
									$td.children().removeClass('izenda-col-reorder-hidden');
								});
								var $currentTd, $nextTd, i;
								if (fromIndex < toIndex) {
									for (i = fromIndex; i < toIndex; i++) {
										$currentTd = angular.element($tds[i]);
										$nextTd = angular.element($tds[i + 1]);
										$currentTd.children().addClass('izenda-col-reorder-hidden');
										$currentTd.append($nextTd.children().clone());
									}
								} else {
									for (i = fromIndex; i > toIndex; i--) {
										$currentTd = angular.element($tds[i]);
										$nextTd = angular.element($tds[i - 1]);
										$currentTd.children().addClass('izenda-col-reorder-hidden');
										$currentTd.append($nextTd.children().clone());
									}
								}
							}

							// move helper
							$scope.reorderState.$helper.css('left', currentTableX - $scope.reorderState.helperOffset);
						});
						angular.element(document).on('mouseup.izendaColReorder', function () {
							if ($scope.reorderState.downTimer)
								$timeout.cancel($scope.reorderState.downTimer);
							_completeReorder();
						});

						// initialize:
						var $headerRows = $scope.$table.find('tr.ReportHeader');
						// fieldsInTable should contain only fields which have column
						var fieldsInTable = getColumnFields();
						angular.element.each($headerRows, function () {
							var $tableHeader = angular.element(this);
							if ($tableHeader.children('.EmptyCell').length > 0)
								return;
							angular.element.each($tableHeader.children('td'), function (iCell) {
								var $cell = angular.element(this);
								if (iCell < fieldsInTable.length) {
									if (isTableContainVgColumns()) {
										var field = fieldsInTable[iCell];
										$cell.attr('data-is-vg-column', field.isVgUsed ? 'true' : 'false');
									} else {

										$cell.attr('data-is-vg-column', 'false');
									}

									// mouse down handler
									$cell.on('mousedown.izendaColReorder', function (e) {
										$scope.reorderState.started = false;
										if (e.which !== 1) return;
										if ($scope.reorderState.downTimer)
											$timeout.cancel($scope.reorderState.downTimer);
										$scope.reorderState.downTimer = null;

										$scope.reorderState.$from = angular.element(this);
										$scope.reorderState.downTimer = $timeout(function () {
											_beforeReorderStarted();
											_createHelper(e.offsetX);
											$scope.reorderState.started = true;
										}, 250);
									});
								} else {
									$cell.addClass('izenda-col-reorder-disabled');
								}
							});
						});
					};

					/**
					 * Reorder completed handler
					 * @param {jquery dom element} $from. Element which we dragged
					 * @param {jquery dom element} $to. $from element dropped to this element.
					 */
					var onReorder = function ($from, $to, isVg) {
						if (!angular.isFunction($scope.onReorder))
							return;
						if (!$to || !$from)
							return;
						var fromIndex = $from.index();
						var toIndex = $to.index();
						if (fromIndex === toIndex)
							return;
						if (!isVg) {
							var vgColumnsCount = getCountOfVgColumns();
							fromIndex -= vgColumnsCount;
							toIndex -= vgColumnsCount;
						}
						$scope.onReorder({ arg0: fromIndex, arg1: toIndex, arg2: isVg });
					};

					/**
					 * Add drag handlers to table
					 * @param {jquery element object} $table 
					 */
					var addDragHandlers = function () {
						// mouse over
						if (!angular.isString($scope.droppableAccept))
							return;
						var $currenttable = $scope.$table;
						var currentTableLeft = $currenttable.offset().left;
						$htmlContainerPlaceholder.height($currenttable.height());

						var columnCoords = [];

						var $currenttableHeader = $scope.$table.find('tr.ReportHeader').last();
						var fieldsInTable = getColumnFields();
						var $currenttableRows = $currenttableHeader.children('td').slice(0, fieldsInTable.length);
						var countOfVgColumns = getCountOfVgColumns();

						// calculate 
						angular.element.each($currenttableRows, function (iTh, th) {
							var $th = angular.element(th);
							if (iTh >= countOfVgColumns) {
								columnCoords.push({
									left: $th.position().left,
									width: $th.outerWidth()
								});
							}
						});

						// mouse enter handler
						$scope.$table.on('mouseenter', function () {
							if (!$rootScope.isDraggingNow) {
								return;
							}
							currentTableLeft = $currenttable.offset().left;
							$htmlContainerPlaceholder.css('top', $currenttable.position().top + 'px');
							$htmlContainerPlaceholder.height($currenttable.height());
							if (columnCoords.length > 0)
								$htmlContainerPlaceholder.css('left', columnCoords[0].left + 'px');
							$htmlContainerPlaceholder.removeClass('hidden');
						});

						// mouse leave handler
						$scope.$table.on('mouseleave', function () {
							if (!$rootScope.isDraggingNow) {
								return;
							}
							if (event.toElement && angular.element(event.toElement).hasClass('html-container-placeholder'))
								return;
							$htmlContainerPlaceholder.addClass('hidden');
						});

						// mouse move handler
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
					};

					/**
					 * Add table header click handler
					 */
					var addClickHandler = function () {
						if (!angular.isFunction($scope.onHeaderClick))
							return;

						var $headerRows = $scope.$table.find('tr.ReportHeader');
						var fieldsInTable = getColumnFields();
						angular.element.each($headerRows, function () {
							var $tableHeader = angular.element(this);
							if ($tableHeader.children('.EmptyCell').length > 0)
								return;
							// iterate header cells
							angular.element.each($tableHeader.children('td'), function (iCell) {
								var $cell = angular.element(this);
								if (iCell >= fieldsInTable.length)
									return;
								$cell.on('mousedown', function (e) {
									if (e.which !== 1) return;
									if (!angular.isFunction($scope.onHeaderClick))
										return;
									var $this = angular.element(this);
									var fieldIndex = $this.index();
									$scope.onHeaderClick({ arg0: fieldsInTable[fieldIndex] });
								});
							});
						});
					};

					/**
					 * Add buttons which allow to remvoe table columns
					 */
					var addColRemoveButtons = function () {
						if ($scope.allowColRemove !== 'true')
							return;

						var $headerRows = $scope.$table.find('tr.ReportHeader');
						var fieldsInTable = getColumnFields();
						// iterate headers
						angular.element.each($headerRows, function () {
							var $tableHeader = angular.element(this);
							if ($tableHeader.children('.EmptyCell').length > 0)
								return;
							// iterate header cells
							angular.element.each($tableHeader.children('td'), function (iCell) {
								var $cell = angular.element(this);
								$cell.css('position', 'relative');
								if (iCell >= fieldsInTable.length)
									return;
								// add cell handlers
								$cell.on('mouseover.removebtn', function () {
									var $this = angular.element(this);
									$this.children('.report-header-remove-column-btn').show();
								});
								$cell.on('mouseout.removebtn', function () {
									var $this = angular.element(this);
									$this.children('.report-header-remove-column-btn').hide();
								});

								// add button
								var $reportColumnRemoveButton = angular.element('<div class="report-header-remove-column-btn"><span class="glyphicon glyphicon-remove"></span></div>');
								$cell.append($reportColumnRemoveButton);
								$reportColumnRemoveButton.on('mousedown.removebtn', function (e) {
									if (e.which !== 1) return;
									e.stopImmediatePropagation();
									if (!angular.isFunction($scope.onRemove))
										return;
									var fieldIndex = angular.element(this).parent().index();
									$scope.onRemove({ arg0: fieldsInTable[fieldIndex] });
								});
							});
						});
					};

					/**
					 * Prepare report table
					 * @param {jquery object} $table 
					 */
					var processReportTable = function () {
						// prepare table
						if (!isTableIsGood())
							return;

						//replaceTdWithTh();
						addColReorderHandler(function ($from, $to, isVisualGroup) {
							onReorder($from, $to, isVisualGroup);
						});

						// add other handlers
						addDragHandlers();
						addClickHandler();
						addColRemoveButtons();

						izenda.report.registerPostRenderHandlers();
					};

					/**
					 * Apply report content html
					 * @param {string} html 
					 */
					var applyHtml = function (html) {
						// show/hide loading indicator
						if (html === null) {
							$htmlContainer.hide();
							$htmlContainerLoading.show();
						} else {
							$htmlContainer.show();
							$htmlContainerLoading.hide();
						}
						// empty result
						if (typeof (html) !== 'string' || (html && typeof (html) === 'string' && html.trim() === '')) {
							$htmlContainer.text($scope.emptyText);
							return;
						}
						$htmlContainer.html(html);

						// is paging enabled
						preparePageLinks($scope, $htmlContainer);
						preparePagingInput($scope, $htmlContainer);
						prepareGoToRecordBtn($scope, $htmlContainer);

						$scope.$table = $htmlContainer.find('table[name=reportTable],table.ReportTable');
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
					$rootScope.$watch('isDraggingNow', function (newVal) {
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
			var startRecord = inputValue - (inputValue - 1) % itemsPerPage;
			var finishRecord = startRecord + itemsPerPage - 1;
			$scope.onPagingClick({
				arg0: 'iz-pagelink-exact-page-input',
				arg1: startRecord + '-' + finishRecord
			});
		});
	}
});
