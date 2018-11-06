import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaReportViewerRootScope extends ng.IRootScopeService {
	isDraggingNow: boolean;
}

interface IIzendaReportViewerScope extends ng.IScope {
	allowColReorder: any;
	allowedColumnsForReorder: any;
	reportSetOptions: { isVgUsed: boolean; vgStyle: string, sortedActiveFields: any[] };
	allowColRemove: any;
	droppableAccept: any;
	onReorder: any;
	onHeaderClick: any;
	onPagingClick: any;
	onDragOver: any;
	onRemove: any;
	emptyText: any;
	currentInsertColumnOrder: any;
	htmlText: any;

	reorderState: any;
	$table: JQuery<HTMLElement>;
}

/**
 * Directive docs.
 */
class IzendaReportViewer implements ng.IDirective {
	restrict = 'AE';
	scope = {
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
	};

	template =
		`<div class="izenda-report-viewer">
	<div class="html-container-placeholder hidden"></div>
	<div class="html-container-loading" style="display: none;" ng-bind=":: 'js_Loading' | izendaLocale: 'Loading...'"></div>
	<div id="renderedReportDiv" class="html-container"></div>
</div>`;

	link: ($scope: IIzendaReportViewerScope, $element: ng.IAugmentedJQuery) => void;

	constructor(private readonly $rootScope: IIzendaReportViewerRootScope,
		private readonly $timeout: ng.ITimeoutService) {
		IzendaReportViewer.prototype.link = ($scope: IIzendaReportViewerScope, $element: ng.IAugmentedJQuery) => {

			//////////////////////////////////////////////////////////////
			// apply tile html function
			const $htmlContainer = $element.find('.html-container');
			const $htmlContainerLoading = $element.find('.html-container-loading');
			const $htmlContainerPlaceholder = $element.find('.html-container-placeholder');

			/**
			 * Prepare report table
			 * @param {jquery object} $table 
			 */
			const processReportTable = () => {
				// prepare table
				if (!IzendaReportViewer.isTableIsGood($scope.$table))
					return;
				IzendaReportViewer.addColReorderHandler($scope, $timeout, ($from, $to, isVisualGroup) => {
					IzendaReportViewer.onReorder($scope, $from, $to, isVisualGroup);
				});
				// add other handlers
				IzendaReportViewer.addDragHandlers($scope, $rootScope, $element);
				IzendaReportViewer.addClickHandler($scope);
				IzendaReportViewer.addColRemoveButtons($scope);
				izenda.report.registerPostRenderHandlers();
			};

			/**
			 * Apply report content html
			 * @param {string} html 
			 */
			const applyHtml = (html: string) => {
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
				IzendaReportViewer.preparePageLinks($scope, $htmlContainer);
				IzendaReportViewer.preparePagingInput($scope, $htmlContainer);
				IzendaReportViewer.prepareGoToRecordBtn($scope, $htmlContainer);

				$scope.$table = $htmlContainer.find('table[name=reportTable],table.ReportTable');
				if ($scope.$table.length > 0) {
					// prepare report table
					processReportTable();
				}
			};

			// htmlText change handler
			$scope.$watch('htmlText', (newVal: string) => applyHtml(newVal));

			// is dragging enabled handler
			$rootScope.$watch('isDraggingNow', newVal => {
				if (!newVal) {
					$htmlContainerPlaceholder.addClass('hidden');
				}
			});

			// run
			applyHtml($scope.htmlText);

			//////////////////////////////////////////////////////////////

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	/**
	 * Check is any kind of visual group applied.
	 */
	private static isVgApplyed($scope: IIzendaReportViewerScope): boolean {
		return angular.isObject($scope.reportSetOptions)
			? $scope.reportSetOptions.isVgUsed
			: false;
	}

	/**
	 * Check is applied AG or VGHierarchy.
	 */
	private static isTableContainVgColumns($scope: IIzendaReportViewerScope): boolean {
		return IzendaReportViewer.isVgApplyed($scope) &&
			['AnalysisGrid', 'VGHierarchy'].indexOf($scope.reportSetOptions.vgStyle) >= 0;
	}

	/**
	 * Calculate count of visual group column.
	 */
	private static getCountOfVgColumns($scope: IIzendaReportViewerScope): number {
		let countOfVgColumns = 0;
		if (IzendaReportViewer.isTableContainVgColumns($scope)) {
			var fieldsInTable = $scope.reportSetOptions.sortedActiveFields;
			countOfVgColumns = fieldsInTable.filter(field => field.isVgUsed).length;
		}
		return countOfVgColumns;
	}

	/**
	 * Get fields which have own column in preview table
	 * @returns {Array} array of field objects.
	 */
	private static getColumnFields($scope: IIzendaReportViewerScope): any[] {
		let fieldsInTable: any[];
		if (IzendaReportViewer.isTableContainVgColumns($scope))
			fieldsInTable = $scope.reportSetOptions.sortedActiveFields;
		else
			fieldsInTable = $scope.reportSetOptions.sortedActiveFields.filter(field => !field.isVgUsed);
		return fieldsInTable;
	}

	private static isTableIsGood($table: JQuery<HTMLElement>): boolean {
		if (!$table)
			return false;
		// if no table headers - stop:
		var $tableHeader = $table.children('tbody').children('tr.ReportHeader');
		if ($tableHeader.length === 0)
			return false;
		// check if table contains visual groups:
		return true;
	}

	/**
	 * Add col reorder handler.
	 */
	private static addColReorderHandler($scope: IIzendaReportViewerScope, $timeout: ng.ITimeoutService, onColumnReorderCompleted: (...any) => void) {
		if ($scope.allowColReorder !== 'true')
			return;

		const bodyOnselectstartSave = String(angular.element(document.body).attr('onselectstart'));
		const bodyUnselectableSave = String(angular.element(document.body).attr('unselectable'));
		const disableTextSelection = () => {
			// jQuery doesn't support the element.text attribute in MSIE 8
			// http://stackoverflow.com/questions/2692770/style-style-textcss-appendtohead-does-not-work-in-ie
			var $style =
				angular.element(
					'<style id="__disable_text_selection__" type="text/css">body { -ms-user-select:none;-moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;user-select:none; }</style>');
			angular.element(document.head).append($style);
			angular.element(document.body).attr('onselectstart', 'return false;').attr('unselectable', 'on');
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			} else {
				document.selection.empty(); // MSIE http://msdn.microsoft.com/en-us/library/ms535869%28v=VS.85%29.aspx
			}
		};
		const restoreTextSelection = () => {
			angular.element('#__disable_text_selection__').remove();
			if (bodyOnselectstartSave)
				angular.element(document.body).attr('onselectstart', bodyOnselectstartSave);
			else
				angular.element(document.body).removeAttr('onselectstart');
			if (bodyUnselectableSave)
				angular.element(document.body).attr('unselectable', bodyUnselectableSave);
			else
				angular.element(document.body).removeAttr('unselectable');
		};
		const createHelper = innerOffset => {
			var $cell = $scope.reorderState.$from;
			var $clone = $cell.clone().wrap('<div class="izenda-common-col-reorder-helper"></div>').parent();
			$clone.width($cell.outerWidth());
			$clone.height($cell.outerHeight());
			$clone.css('top', $cell.position().top);
			$clone.css('left', $cell.position().left + innerOffset);
			$scope.reorderState.$helper = $clone;
			$scope.reorderState.helperOffset = innerOffset;
			$scope.$table.append($clone);
			return $clone;
		};
		const removeHelper = () => {
			$scope.reorderState.$helper.remove();
		};
		const beforeReorderStarted = () => {
			disableTextSelection();
			$scope.reorderState.$from.addClass('izenda-reorder-cell-selected');
			$scope.reorderState.previousPosition = $scope.$table.css('position');
			$scope.$table.css('position', 'relative');
		};
		const afterReorderCompleted = () => {
			$scope.reorderState.$from.removeClass('izenda-reorder-cell-selected');
			$scope.reorderState.itemsCache = null;
			$scope.$table.css('position', $scope.reorderState.previousPosition);
			$scope.$table.find('.izenda-common-col-reorder-active').removeClass('izenda-col-reorder-active');
			removeHelper();
			restoreTextSelection();
		};
		const getCurrentItemsForReorder = () => {
			if (!$scope.reorderState.itemsCache) {
				$scope.reorderState.itemsCache = $scope.reorderState.$from.parent().children();
			}
			return $scope.reorderState.itemsCache;
		};
		const completeReorder = () => {
			if (!$scope.reorderState.started)
				return;
			$scope.reorderState.started = false;
			afterReorderCompleted();
			if (angular.isFunction(onColumnReorderCompleted)) {
				var isVg = $scope.reorderState.$from.attr('data-is-vg-column') === 'true';
				onColumnReorderCompleted($scope.reorderState.$from, $scope.reorderState.$to, isVg);
			}
		};

		$scope.reorderState = {
			started: false,
			$from: null
		};

		// add table handlers:
		angular.element(document).off('mousemove.izendaColReorder');
		angular.element(document).off('mouseup.izendaColReorder');
		angular.element(document).on('mousemove.izendaColReorder', e => {
			if (!$scope.reorderState.started)
				return;
			const currentTableX = e.pageX - $scope.$table.offset().left;
			const isFromColumnVg = $scope.reorderState.$from.attr('data-is-vg-column') === 'true';


			// highlight current column
			var $tds = getCurrentItemsForReorder();
			var $toTd = null;
			angular.element.each($tds, (iTd, td) => {
				const $currTd = angular.element(td);
				const tdLeft = $currTd.position().left, tdWidth = $currTd.outerWidth();
				const isTdColumnVg = String($currTd.attr('data-is-vg-column')) === 'true';
				if (!$currTd.hasClass('izenda-col-reorder-disabled') &&
					isFromColumnVg === isTdColumnVg &&
					currentTableX >= tdLeft &&
					currentTableX < tdLeft + tdWidth) {
					$toTd = $currTd;
				}
			});

			// is $toTd changed?
			if ($toTd && (!$scope.reorderState.$to || $toTd.index() !== $scope.reorderState.$to.index())) {
				$scope.reorderState.$to = $toTd;

				$tds.removeClass('izenda-common-col-reorder-active');
				if (!$scope.reorderState.$to.hasClass('izenda-common-col-reorder-active')) {
					$scope.reorderState.$to.addClass('izenda-common-col-reorder-active');
				}

				// bubble inner content
				const fromIndex = $scope.reorderState.$from.index();
				const toIndex = $scope.reorderState.$to.index();
				angular.element.each($tds, (iTd, td) => {
					const $currTd2 = angular.element(td);
					const $backups = $currTd2.children('.izenda-common-col-reorder-hidden');
					if ($backups.length > 0) {
						$currTd2.children().not('.izenda-common-col-reorder-hidden').remove();
					}
					$currTd2.children().removeClass('izenda-common-col-reorder-hidden');
				});

				let $currentTd: JQuery<HTMLElement>;
				let $nextTd: JQuery<HTMLElement>;
				let i: number;
				if (fromIndex < toIndex) {
					for (i = fromIndex; i < toIndex; i++) {
						$currentTd = angular.element($tds[i]);
						$nextTd = angular.element($tds[i + 1]);
						$currentTd.children().addClass('izenda-common-col-reorder-hidden');
						$currentTd.append($nextTd.children().clone());
					}
				} else {
					for (i = fromIndex; i > toIndex; i--) {
						$currentTd = angular.element($tds[i]);
						$nextTd = angular.element($tds[i - 1]);
						$currentTd.children().addClass('izenda-common-col-reorder-hidden');
						$currentTd.append($nextTd.children().clone());
					}
				}
			}

			// move helper
			$scope.reorderState.$helper.css('left', currentTableX - $scope.reorderState.helperOffset);
		});
		angular.element(document).on('mouseup.izendaColReorder', () => {
			if ($scope.reorderState.downTimer)
				$timeout.cancel($scope.reorderState.downTimer);
			completeReorder();
		});

		// initialize:
		var $headerRows = $scope.$table.find('tr.ReportHeader');

		// fieldsInTable should contain only fields which have column
		var fieldsInTable = IzendaReportViewer.getColumnFields($scope);
		angular.element.each($headerRows, (iHeaderRow, tableHeader) => {
			var $tableHeader = angular.element(tableHeader);
			if ($tableHeader.children('.EmptyCell').length > 0)
				return;
			angular.element.each($tableHeader.children('td'), (iCell, cell) => {
				var $cell = angular.element(cell);
				if (iCell < fieldsInTable.length) {
					if (IzendaReportViewer.isTableContainVgColumns($scope)) {
						var field = fieldsInTable[iCell];
						$cell.attr('data-is-vg-column', field.isVgUsed ? 'true' : 'false');
					} else {
						$cell.attr('data-is-vg-column', 'false');
					}

					// mouse down handler
					$cell.on('mousedown.izendaColReorder', e => {
						$scope.reorderState.started = false;
						if (e.which !== 1) return;
						if ($scope.reorderState.downTimer)
							$timeout.cancel($scope.reorderState.downTimer);
						$scope.reorderState.downTimer = null;

						$scope.reorderState.$from = angular.element(e.delegateTarget);
						$scope.reorderState.downTimer = $timeout(() => {
							beforeReorderStarted();
							createHelper(e.offsetX);
							$scope.reorderState.started = true;
						}, 250);
					});
				} else {
					$cell.addClass('izenda-col-reorder-disabled');
				}
			});
		});
	}

	/**
	 * Reorder completed handler
	 * @param {jquery dom element} $from. Element which we dragged
	 * @param {jquery dom element} $to. $from element dropped to this element.
	 */
	private static onReorder($scope: IIzendaReportViewerScope, $from, $to, isVg) {
		if (!angular.isFunction($scope.onReorder))
			return;
		if (!$to || !$from)
			return;
		let fromIndex = $from.index();
		let toIndex = $to.index();
		if (fromIndex === toIndex)
			return;
		if (!isVg) {
			const vgColumnsCount = IzendaReportViewer.getCountOfVgColumns($scope);
			fromIndex -= vgColumnsCount;
			toIndex -= vgColumnsCount;
		}
		$scope.onReorder({ arg0: fromIndex, arg1: toIndex, arg2: isVg });
	};

	/**
	 * Add drag handlers to table
	 */
	private static addDragHandlers($scope: IIzendaReportViewerScope, $rootScope: IIzendaReportViewerRootScope, $element: ng.IAugmentedJQuery) {
		const $htmlContainerPlaceholder = $element.find('.html-container-placeholder');

		// mouse over
		if (!angular.isString($scope.droppableAccept))
			return;
		const $currenttable = $scope.$table;
		let currentTableLeft = $currenttable.offset().left;
		$htmlContainerPlaceholder.height($currenttable.height());

		const columnCoords: Array<{ left: number; width: number }> = [];
		const $currenttableHeader = $scope.$table.find('tr.ReportHeader').last();
		const fieldsInTable = IzendaReportViewer.getColumnFields($scope);
		const $currenttableRows = $currenttableHeader.children('td').slice(0, fieldsInTable.length);
		const countOfVgColumns = IzendaReportViewer.getCountOfVgColumns($scope);

		// calculate 
		angular.element.each($currenttableRows, (iTh: number, th: any) => {
			var $th = angular.element(th);
			if (iTh >= countOfVgColumns) {
				columnCoords.push({
					left: $th.position().left,
					width: $th.outerWidth()
				});
			}
		});

		// mouse enter handler
		$scope.$table.on('mouseenter', () => {
			if (!$rootScope.isDraggingNow)
				return;
			currentTableLeft = $currenttable.offset().left;
			$htmlContainerPlaceholder.css('top', $currenttable.position().top + 'px');
			$htmlContainerPlaceholder.height($currenttable.height());
			if (columnCoords.length > 0)
				$htmlContainerPlaceholder.css('left', columnCoords[0].left + 'px');
			$htmlContainerPlaceholder.removeClass('hidden');
		});

		// mouse leave handler
		$scope.$table.on('mouseleave', () => {
			if (!$rootScope.isDraggingNow)
				return;
			if (event['toElement'] && angular.element(event['toElement']).hasClass('html-container-placeholder'))
				return;
			$htmlContainerPlaceholder.addClass('hidden');
		});

		// mouse move handler
		$scope.$table.on('mousemove', event => {
			if (!$rootScope.isDraggingNow)
				return;
			var left = event.pageX - currentTableLeft;
			for (let k = 0; k < columnCoords.length; k++) {
				const column = columnCoords[k];
				if (k < columnCoords.length - 1) {
					const nextColumn = columnCoords[k + 1];
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
	private static addClickHandler($scope: IIzendaReportViewerScope) {
		if (!angular.isFunction($scope.onHeaderClick))
			return;

		const $headerRows = $scope.$table.find('tr.ReportHeader');
		const fieldsInTable = IzendaReportViewer.getColumnFields($scope);
		angular.element.each($headerRows, (iTableHeader, tableHeader) => {
			var $tableHeader = angular.element(tableHeader);
			if ($tableHeader.children('.EmptyCell').length > 0)
				return;
			// iterate header cells
			angular.element.each($tableHeader.children('td'), (iCell, cell) => {
				const $cell = angular.element(cell);
				if (iCell >= fieldsInTable.length)
					return;
				$cell.on('mousedown', e => {
					if (e.which !== 1) return;
					if (!angular.isFunction($scope.onHeaderClick))
						return;
					const $this = angular.element(e.delegateTarget);
					const fieldIndex = $this.index();
					$scope.onHeaderClick({ arg0: fieldsInTable[fieldIndex] });
				});
			});
		});
	};

	/**
	 * Add buttons which allow to remvoe table columns
	 */
	private static addColRemoveButtons($scope: IIzendaReportViewerScope) {
		if ($scope.allowColRemove !== 'true')
			return;

		const $headerRows = $scope.$table.find('tr.ReportHeader');
		const fieldsInTable = IzendaReportViewer.getColumnFields($scope);
		// iterate headers
		angular.element.each($headerRows, (iHeaderRow, headerRow) => {
			const $tableHeader = angular.element(headerRow);
			if ($tableHeader.children('.EmptyCell').length > 0)
				return;
			// iterate header cells
			angular.element.each($tableHeader.children('td'), (iCell, cell) => {
				const $cell = angular.element(cell);
				$cell.css('position', 'relative');
				if (iCell >= fieldsInTable.length)
					return;
				// add cell handlers
				$cell.on('mouseover.removebtn', e => {
					const $this = angular.element(e.delegateTarget);
					$this.children('.izenda-common-remove-column-btn').show();
				});
				$cell.on('mouseout.removebtn', e => {
					const $this = angular.element(e.delegateTarget);
					$this.children('.izenda-common-remove-column-btn').hide();
				});

				// add button
				const $reportColumnRemoveButton =
					angular.element('<div class="izenda-common-remove-column-btn"><span class="glyphicon glyphicon-remove"></span></div>');
				$cell.append($reportColumnRemoveButton);
				$reportColumnRemoveButton.on('mousedown.removebtn', e => {
					if (e.which !== 1) return;
					e.stopImmediatePropagation();
					if (!angular.isFunction($scope.onRemove))
						return;
					const fieldIndex = angular.element(e.delegateTarget).parent().index();
					$scope.onRemove({ arg0: fieldsInTable[fieldIndex] });
				});
			});
		});
	};

	/**
	 * Remove 'onkeydown' event and add own keydown and blur events, which call onPagingClick handler.
	 * @param {} $scope Current directive scope.
	 * @param {} $htmlContainer Report container, which contains paging controls
	 */
	private static preparePagingInput($scope: IIzendaReportViewerScope, $htmlContainer: JQuery<HTMLElement>) {
		const $pageInputs = $htmlContainer.find('.iz-pagelink-exact-page-input');
		if (!$pageInputs.length)
			return;
		angular.element.each($pageInputs, (iPageInput, pageInput) => {
			var $pageInput = angular.element(pageInput);
			$pageInput.attr('onkeydown', null);

			// input changed handler
			var onInputChanged = ($input: JQuery<HTMLElement>) => {
				const pagesCount = parseInt(String($input.attr('data-pages-count')));
				const itemsPerPage = parseInt(String($input.attr('data-items-per-page')));
				let val = Number($input.val());
				if (val < 1) val = 1;
				if (val > pagesCount) val = pagesCount;
				const startRecord = ((val - 1) * itemsPerPage) + 1;
				const finishRecord = startRecord + itemsPerPage - 1;
				$scope.onPagingClick({
					arg0: 'iz-pagelink-exact-page-input',
					arg1: startRecord + '-' + finishRecord
				});
			}
			$pageInput.on('blur', event => {
				var $this = angular.element(event.delegateTarget);
				onInputChanged($this);
			});
			$pageInput.on('keydown', event => {
				var kc = event.keyCode || event.which;
				if (kc !== 13)
					return;
				var $this = angular.element(event.delegateTarget);
				onInputChanged($this);
			});
		});
	}

	/**
	 * Remove 'onclick' event and add own click event, which call onPagingClick handler.
	 * @param {} $scope current Directive scope.
	 * @param {} $htmlContainer Report container, which contains paging controls.
	 */
	private static preparePageLinks($scope: IIzendaReportViewerScope, $htmlContainer: JQuery<HTMLElement>) {
		var $pageLinks = $htmlContainer.find('.iz-pagelink, .iz-pagelink-direction-btn');
		if (!$pageLinks.length || !angular.isFunction($scope.onPagingClick))
			return;
		angular.element.each($pageLinks, (iPageLink, pageLink) => {
			const $pageLink = angular.element(pageLink);
			const onClickScript = String($pageLink.attr('onclick'));
			const matchResult = /results=(\d+\-\d+)/g.exec(onClickScript);
			if (matchResult && matchResult.length === 2)
				$pageLink.attr('data-active-page', matchResult[1]);
			$pageLink.attr('onclick', null);
			$pageLink.on('click', e => {
				var $currentLink = angular.element(e.delegateTarget);
				$scope.onPagingClick({
					arg0: 'iz-pagelink',
					arg1: $currentLink.attr('data-active-page')
				});
			});
		});
	}

	/**
	 * Remove 'onclick' event and add own click event.
	 * @param {} $scope current Directive scope.
	 * @param {} $htmlContainer Report container, which contains paging controls.
	 */
	private static prepareGoToRecordBtn($scope: IIzendaReportViewerScope, $htmlContainer: JQuery<HTMLElement>) {
		const $btn = $htmlContainer.find('.iz-pagelink-go-to-page-btn');
		$btn.attr('onclick', null);
		$btn.on('click', e => {
			const $this = angular.element(e.delegateTarget);
			const itemsCount = parseInt(String($this.attr('data-items-count')));
			const itemsPerPage = parseInt(String($this.attr('data-items-per-page')));
			let inputValue;
			try {
				inputValue = parseInt(String(angular.element('#pageNumEd').val()));
			} catch (e) {
				inputValue = 1;
			}
			if (itemsCount < inputValue) inputValue = itemsCount;
			const startRecord = inputValue - (inputValue - 1) % itemsPerPage;
			const finishRecord = startRecord + itemsPerPage - 1;
			$scope.onPagingClick({
				arg0: 'iz-pagelink-exact-page-input',
				arg1: startRecord + '-' + finishRecord
			});
		});
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($rootScope: IIzendaReportViewerRootScope, $timeout: ng.ITimeoutService) =>
			new IzendaReportViewer($rootScope, $timeout);
		directive.$inject = ['$rootScope', '$timeout'];
		return directive;
	}
}

izendaUiModule.directive('izendaReportViewer',
	['$rootScope', '$timeout', IzendaReportViewer.factory()]);
