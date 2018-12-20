import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaComponent from 'common/core/tools/izenda-component';
import izendaDashboardModule, { IIzendaDashboardSettings } from 'dashboard/module-definition';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';
import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';
import { IzendaDashboardModel } from 'dashboard/model/dashboard-model';

/**
 * Tile default state object
 */
izendaDashboardModule.constant('tileDefaults', {
	id: null,
	canBeLoaded: false,
	maxRights: 'None',
	title: null,
	description: null,
	reportFullName: null,
	reportPartName: null,
	reportSetName: null,
	reportName: null,
	reportCategory: null,
	reportNameWithCategory: null,
	previousReportFullName: null,
	isSourceReportDeleted: false,
	designerType: 'ReportDesigner',
	x: 0,
	y: 0,
	width: 1,
	height: 1,
	top: 100,
	topString: '100',
	flip: false,
	applyFilterParams: false,
	backgroundColor: '#fff',
	backTilePopupOpened: false
});

@IzendaComponent(
	izendaDashboardModule,
	'izendaDashboardTile',
	['rx', '$element', '$interval', '$timeout', '$window', '$izendaCompatibilityService', '$izendaUtilService', '$izendaUrlService',
		'$izendaUtilUiService', '$izendaLocaleService', '$izendaSettingsService', '$izendaDashboardSettings', '$izendaDashboardStorageService'],
	{
		templateUrl: '###RS###extres=components.dashboard.components.tile.tile-template.html',
		bindings: {
			tile: '<', // main tile object
			tiles: '<', // all tile objects in dashboard
			gridWidth: '<',
			gridHeight: '<',
			isDashboardChangingNow: '<',
			onTileDrag: '&',
			onTileDragStart: '&',
			onTileDragEnd: '&',
			onTileResize: '&',
			onTileResizeStart: '&',
			onTileResizeEnd: '&',
			onTileDelete: '&',
			onTileReportSelected: '&'
		}
	})
class IzendaDashboardTileComponent implements ng.IComponentController {

	subscriptions: any[];

	isIe: boolean;
	isButtonsVisible: boolean;

	tile: IzendaDashboardTileModel;
	tiles: IzendaDashboardTileModel[];
	model: IzendaDashboardModel;

	deleteConfirmClass: string = 'title-button hidden-confirm-btn';
	tileSizeChanged: boolean = false;
	state: any;
	isSelectReportPartModalVisible: boolean = false;
	exportProgress: string;
	previousWidth: number;
	isDashboardChangingNow: boolean = false;
	gridWidth: number;
	gridHeight: number;

	onTileDelete: any;
	onTileResizeStart: any;
	onTileResize: any;
	onTileResizeEnd: any;
	onTileDragEnd: any;
	onTileReportSelected: any;

	constructor(
		private readonly rx: any,
		private readonly $element: ng.IAugmentedJQuery,
		private readonly $interval: ng.IIntervalService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $window: ng.IWindowService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService,
		private readonly $izendaUtilService: IzendaUtilService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaUtilUiService: IzendaUtilUiService,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaSettingsService: IzendaQuerySettingsService,
		private readonly $izendaDashboardSettings: IIzendaDashboardSettings,
		private readonly $izendaDashboardStorageService: DashboardStorageService) {

	}

	$onInit() {
		this.subscriptions = [];

		this.isIe = this.$izendaCompatibilityService.isIe();
		this.isButtonsVisible = true;
		this.deleteConfirmClass = 'title-button hidden-confirm-btn';
		this.tileSizeChanged = false;
		this.state = {
			empty: true,
			resizableHandlerStarted: false,
			relativeReportComplexity: 0
		};
		this.isSelectReportPartModalVisible = false;
		this.exportProgress = null;

		this.previousWidth = this.$window.innerWidth;

		this.subscriptions = [
			this.$izendaDashboardStorageService.refreshObservable.subscribe(refreshInfo => this.$onRefresh(refreshInfo)),
			this.$izendaDashboardStorageService.windowSize.subscribeOnNext(newWindowSize => {
				if (this.previousWidth === newWindowSize.width)
					return;
				this.previousWidth = newWindowSize.width;
				this.refreshTile(false);
			})
		];
	}

	/**
	 * Bindings listener
	 */
	$onChanges(changesObj) {
		if (changesObj.tile && angular.isObject(changesObj.tile)) {
			this.refreshTile();
		};
	}

	$onDestroy() {
		this.subscriptions.forEach(sub => sub.dispose());
	}

	$onRefresh(refreshInfo) {
		const updateFromSource = refreshInfo.updateFromSource;
		const tile = refreshInfo.tile;
		if (!tile || tile === this.tile)
			this.refreshTile(updateFromSource);
	}

	/**
	 * Check if tile is empty
	 */
	isTileEmpty(): boolean {
		return this.state.empty;
	}

	/**
	 * Check if one column view required
	 */
	isOneColumnView(): boolean {
		return this.$izendaCompatibilityService.isOneColumnView();
	}

	/**
	 * Check tile is read only
	 */
	isEditAllowed(): boolean {
		return this.$izendaCompatibilityService.isEditAllowed();
	}

	/**
	 * Check if tile title set
	 */
	isTitleSet(): boolean {
		return angular.isString(this.tile.title) && this.tile.title !== '';
	}

	/**
	 * Is tile small enough and we need to show buttons without labels.
	 */
	isTileButtonsTight(): boolean {
		return this.tile.width * this.gridWidth < 400;
	}

	/**
	 * change report category from cat1\cat2\cat3 to cat1/cat2/cat3
	 */
	getConvertedReportCategory(): string {
		return angular.isString(this.tile.reportCategory) ? this.tile.reportCategory : null;
	}

	/**
	 * Generate title text
	 */
	getTitleText(): string {
		if (this.isTitleSet())
			return this.tile.title;
		let result = '';
		if (this.getConvertedReportCategory())
			result += this.getConvertedReportCategory() + ' / ';
		if (this.tile.reportName && this.tile.reportPartName)
			result += this.tile.reportName + ' / ' + this.tile.reportPartName;
		return result;
	}

	/**
	 * Is html model enabled in AdHocSettings
	 */
	isReportDivHidden(): boolean {
		return !this.tile.reportFullName || this.isDashboardChangingNow;
	}

	/**
	 * Is tile content should be hidden now.
	 */
	private isTileSmallEnough(): boolean {
		return this.tile.width * this.gridWidth < 400 || this.tile.height * this.gridHeight < 400;
	}

	/**
	 * Class for confirm delete button (depends on tile size)
	 */
	getConfirmDeleteClass(): string {
		const tightClass = this.isTileButtonsTight() ? ' short' : '';
		return `title-button-confirm-remove${tightClass}`;
	}

	/**
	 * Class for cancel delete button (depends on tile size)
	 */
	getCancelDeleteClass(): string {
		const tightClass = this.isTileButtonsTight() ? ' short' : '';
		return `title-button-cancel-remove${tightClass}`;
	}

	//////////////////////////////////////////////////////////////////////
	// export modal
	//////////////////////////////////////////////////////////////////////

	getWaitMessageHeaderText() {
		if (this.exportProgress === 'export')
			return this.$izendaLocaleService.localeText('js_ExportingInProgress', 'Exporting in progress.');
		if (this.exportProgress === 'print')
			return this.$izendaLocaleService.localeText('js_PrintingInProgress', 'Printing in progress.');
		return '';
	}

	getWaitMessageText() {
		if (this.exportProgress === 'export')
			return this.$izendaLocaleService.localeText('js_FinishExporting', 'Please wait till export is completed...');
		if (this.exportProgress === 'print')
			return this.$izendaLocaleService.localeText('js_FinishPrinting', 'Please finish printing before continue.');
		return '';
	}

	//////////////////////////////////////////////////////////////////////
	// tile actions
	//////////////////////////////////////////////////////////////////////

	/**
	 * Show confirm delete dialog in title
	 */
	showConfirmDelete() {
		if (!this.tile.reportFullName) {
			this.deleteTile();
			return;
		}
		this.deleteConfirmClass = 'title-button';
	}

	/**
	 * Hide confirm delete dialog in title
	 */
	hideConfirmDelete() {
		this.deleteConfirmClass = 'title-button hidden-confirm-btn';
	}

	/**
	 * Delete this tile
	 */
	deleteTile() {
		if (angular.isFunction(this.onTileDelete)) {
			this.onTileDelete(this.tile);
		}
	}

	/**
	 * Close back tile popup
	 */
	closeBackTilePopup() {
		this.tile.backTilePopupOpened = false;
	}

	/**
	 * Back tile popup closed handler
	 */
	onBackTilePopupClosed() {

	}

	/**
	 * Print tile
	 */
	printTile() {
		this.closeBackTilePopup();

		// print single tile if parameter is set:
		if (!this.tile.reportFullName)
			return;

		this.$izendaDashboardStorageService.printDashboard('html', this.tile.reportFullName).then(() => {
			// HTML print print successfully completed handler
			this.flipFront(true, false);
		}, error => {
			const errorTitle = this.$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error');
			let errorText = this.$izendaLocaleService.localeText('js_FailedPrintReport',
				'Failed to print report "{0}". Error description: {1}.');
			errorText = errorText.replaceAll('{0}', this.model.reportFullName ? this.model.reportFullName : '');
			errorText = errorText.replaceAll('{1}', error);
			this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
			console.error(error);
			this.flipFront(true, false);
		});
	}

	/**
	 * Export to excel
	 */
	exportExcel() {
		this.closeBackTilePopup();
		// download the file
		// TODO very easy to add PDF print for tile: 'excel' => 'pdf'
		this.$izendaDashboardStorageService.printDashboard('excel', this.tile.reportFullName).then(() => {
			this.flipFront(true, false);
		}, (error) => {
			const errorTitle = this.$izendaLocaleService.localeText('js_FailedExportReportTitle', 'Report export error');
			let errorText = this.$izendaLocaleService.localeText('js_FailedExportReport',
				'Failed to export report "{0}". Error description: {1}.');
			errorText = errorText.replaceAll('{0}', this.model.reportFullName ? this.model.reportFullName : '');
			errorText = errorText.replaceAll('{1}', error);
			this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
			console.error(error);
			this.flipFront(true, false);
		});
	}

	/**
	 * Back tile side click handler
	 */
	onBackTileClick() {
		this.tiles.forEach(tile => {
			if (tile.id !== this.tile.id)
				tile.backTilePopupOpened = false;
		});
		if (this.isTileSmallEnough()) {
			this.tile.backTilePopupOpened = !this.tile.backTilePopupOpened;
		} else {
			this.flipBack();
		}
	}

	/**
	 * Flip tile back
	 */
	flipBack() {
		this.tile.flip = {
			isFront: false
		};
	}

	/**
	 * Flip tile front
	 */
	flipFront(update?: boolean, updateFromSourceReport?: boolean) {
		this.closeBackTilePopup();
		this.tile.flip = {
			isFront: true,
			update: update,
			updateFromSourceReport: updateFromSourceReport
		};
	}

	/**
	 * Go to report viewer
	 */
	fireReportViewerLink() {
		this.closeBackTilePopup();

		if (!this.tile.isSourceReportDeleted) {
			this.$window.open(this.getReportViewerLink(), '_blank');
		} else {
			let errorText = this.$izendaLocaleService.localeText('js_SourceReportNotExist', 'Source report "{0}" doesn\'t exist.');
			errorText = errorText.replace(new RegExp(/\{0\}/g), this.getSourceReportName());
			this.$izendaUtilUiService.showErrorDialog(errorText);
		}
	}

	/**
	 * Go to report editor
	 */
	fireReportEditorLink() {
		this.closeBackTilePopup();

		if (!this.tile.isSourceReportDeleted) {
			this.$window.open(this.getReportEditorLink(), '_blank');
		} else {
			let errorText = this.$izendaLocaleService.localeText('js_SourceReportNotExist', 'Source report "{0}" not exist.');
			errorText = errorText.replace(new RegExp(/\{0\}/g), this.getSourceReportName());
			this.$izendaUtilUiService.showErrorDialog(errorText);
		}
	}

	/**
	 * Refresh tile content
	 * @param {boolean} updateFromSourceReport. Is tile content need to be refreshed from the source report.
	 * TODO: remove DOM manipulations to separate directive.
	 */
	refreshTile(updateFromSourceReport?: boolean) {
		// TODO: do we need this variable?
		//const updateFromSource = this.tile.updateFromSource || updateFromSourceReport;

		this.tileSizeChanged = false; // reset tile size information
		this.tile.updateFromSource = false; // reset update from source flag

		if (!this.tile.reportFullName)
			return;
		this.tile.previousReportFullName = null;

		// set loading html
		const loadingHtml =
			`<div class="izenda-common-vcentered-container">
	<div class="izenda-common-vcentered-item">
		<img class="izenda-common-img-loading" src="${this.$izendaUrlService.settings.urlRpPage}image=ModernImages.loading-grid.gif" alt="Loading..." />
	</div>
</div>`;
		const $body = this.$element.find('.animate-flip> .flippy-front> .frame> .report');
		$body.html(loadingHtml);

		// calculate tile width and height in pixels
		const tileWidth = this.getWidth() * this.gridWidth - 20;
		let tileHeight = this.getHeight() * this.gridHeight - 55;
		if (this.tile.description)
			tileHeight -= 32;
		const size = {
			height: tileHeight,
			width: tileWidth
		};

		// load preview
		this.$izendaDashboardStorageService.loadTilesPreview(this.tile, size).then(tilesHtml => {
			this.applyTileHtml(tilesHtml);
		}, error => {
			this.applyTileHtml(error);
		});
	}

	/**
	 * Set tile top values.
	 */
	setTileTop(newTop: number) {
		this.tile.top = newTop;
		this.tile.topString = '' + newTop;
	}

	//////////////////////////////////////////////////////////////////////
	// tile handlers
	//////////////////////////////////////////////////////////////////////

	/**
	 * Resize start handler
	 */
	onTileResizeStartInner(eventResult) {
		this.isButtonsVisible = false;
		if (angular.isFunction(this.onTileResizeStart))
			this.onTileResizeStart(eventResult);
	}

	/**
	 * Resize handler
	 */
	onTileResizeInner(eventResult) {
		if (angular.isFunction(this.onTileResize))
			this.onTileResize(eventResult);
	}

	/**
	 * Resize end handler
	 */
	onTileResizeEndInner(eventResult) {
		if (eventResult.isTileSizeChanged) {
			this.flipFront();
			this.refreshTile(false);
		}
		if (angular.isFunction(this.onTileResizeEnd)) {
			this.onTileResizeEnd(eventResult);
		}
		this.isButtonsVisible = true;
	}

	/**
	 * Drag end handler
	 */
	onTileDragEndInner(eventResult) {
		const resultType = eventResult.type; // 'swap', 'move' or 'none'
		if (resultType === 'swap' && eventResult.targetTile && eventResult.isTileSizeChanged) {
			// we have to notify another tile about swap
			this.$izendaDashboardStorageService.refreshDashboard(false, false, eventResult.targetTile);
		}
		if (eventResult.isTileSizeChanged)
			this.refreshTile(false);
		if (angular.isFunction(this.onTileDragEnd))
			this.onTileDragEnd(eventResult);
	}

	/**
	 * Select report part for tile
	 */
	selectReportPart() {
		this.isSelectReportPartModalVisible = true;
	}

	/**
	 * Select report part cancelled
	 */
	onSelectReportModalClosed() {
		// we need to reset "opened" binding.
		this.isSelectReportPartModalVisible = false;
	}

	/**
	 * Report part selected handler
	 */
	onSelectReportPart(reportPartInfo) {
		// hide select report part dialog
		this.closeBackTilePopup();
		const rpInfo = reportPartInfo;
		if (rpInfo.UsesHiddenColumns) {
			this.$izendaUtilUiService.showMessageDialog(
				this.$izendaLocaleService.localeText(
					'js_cannotAddReportWithHiddenColumnsToTile',
					'You cannot add this report into the dashboard because it contains hidden columns. Please re-save the original report as a report with a different name or chose another one.'));
			return;
		}

		let fName = rpInfo.Name;
		if (!this.$izendaUtilService.isUncategorized(rpInfo.Category))
			fName = rpInfo.Category + this.$izendaSettingsService.getCategoryCharacter() + fName;

		const nameparts = rpInfo.Name.split('@');
		const name = nameparts[0];
		const part = nameparts[1];

		// check if tile already exist
		const isTileInDashboard = this.tiles.filter((tile) => {
			return tile.reportPartName === part &&
				tile.reportName === name &&
				((tile.reportCategory === rpInfo.Category) ||
					(this.$izendaUtilService.isUncategorized(tile.reportCategory) && this.$izendaUtilService.isUncategorized(rpInfo.Category)));
		}).length > 0;

		if (isTileInDashboard) {
			const errorText = this.$izendaLocaleService.localeText('js_CantSelectReportPart',
				'Can\'t select report part because dashboard already contains tile with that report.');
			this.$izendaUtilUiService.showNotification(errorText);
			return;
		}

		// update report parameters
		this.tile.previousReportFullName = this.tile.reportFullName;
		angular.extend(this.tile, this.$izendaUrlService.extractReportPartNames(fName, true));
		this.tile.title = rpInfo.Title;

		// update report name with category variable
		this.tile.reportNameWithCategory = this.tile.reportName;
		if (!this.$izendaUtilService.isUncategorized(this.tile.reportCategory))
			this.tile.reportNameWithCategory = this.tile.reportCategory +
				this.$izendaSettingsService.getCategoryCharacter() +
				this.tile.reportNameWithCategory;

		if (rpInfo.IsLocked)
			this.tile.maxRights = 'Locked';
		else if (rpInfo.ViewOnly)
			this.tile.maxRights = 'View Only';
		else if (rpInfo.ReadOnly)
			this.tile.maxRights = 'Read Only';
		else
			this.tile.maxRights = 'Full Access';

		// set top variables for tile:
		const newTop = rpInfo.NativeTop && rpInfo.NativeTop > 0 ? rpInfo.NativeTop : 100;
		this.setTileTop(newTop);
		this.tile.designerType = rpInfo.DesignerType;
		this.flipFront(true, true);
		if (angular.isFunction(this.onTileReportSelected)) {
			this.onTileReportSelected(this.tile);
		}
	}

	/**
	 * Tile flip handler
	 */
	onTileFlip(isFront, update, updateFromSourceReport) {
		if (isFront && update) {
			this.refreshTile(updateFromSourceReport);
		}
	}

	/**
	 * Tile top changed:
	 */
	onSetTileTop(top) {
		if (this.tile.top === top)
			return;
		this.tile.top = top;
		this.tile.topString = '' + top;
		this.flipFront(true, false);
		this.closeBackTilePopup();
	}

	//////////////////////////////////////////////////////////////////////
	// tile position
	//////////////////////////////////////////////////////////////////////

	/**
	 * Return style object for '.iz-dash-tile'
	 */
	getTileStyle() {
		const top = this.gridHeight * this.getY();
		const left = this.gridWidth * this.getX();
		const result = {
			'width': (this.gridWidth * this.getWidth()) + 'px',
			'height': (this.gridHeight * this.getHeight()) + 'px',
			'z-index': (this.tile.backTilePopupOpened ? '3' : '1')
		};
		if (this.$izendaCompatibilityService.isLteIe10()) {
			result['x'] = `${left}px`;
			result['y'] = `${top}px`;
		} else {
			result['transform'] = `translate3d(${left}px,${top}px,0)`;
		}
		return result;
	}

	/**
	 * Get tile width
	 */
	private getWidth() {
		return this.isOneColumnView() ? 12 : this.tile.width;
	}

	/**
	 * Get tile height
	 */
	private getHeight() {
		return this.isOneColumnView() ? 4 : this.tile.height;
	}

	/**
	 * Get X coordinate for tile. This coordinate used for drawing tile UI
	 */
	private getX() {
		return this.isOneColumnView() ? 0 : this.tile.x;
	}

	/**
	 * Get Y coordinate for tile. This coordinate used for drawing tile UI
	 */
	private getY() {
		return this.isOneColumnView() ? 4 * this.tile.getTileOrder(this.tiles) : this.tile.y;
	}

	/**
	 * Get report viewer link for tile report
	 */
	private getReportViewerLink() {
		return getAppendedUrl(`${this.$izendaUrlService.settings.urlReportViewer}?rn=${this.getSourceReportName()}`);
	}

	/**
	 * Get report editor link for tile report
	 */
	private getReportEditorLink() {
		const designerUrl = this.tile.designerType === 'InstantReport'
			? this.$izendaUrlService.settings.urlInstantReport
			: this.$izendaUrlService.settings.urlReportDesigner;
		return getAppendedUrl(`${designerUrl}?rn=${this.getSourceReportName()}`);
	}

	/**
	 * Get source report name
	 */
	private getSourceReportName() {
		let result = this.tile.reportName;
		if (!this.$izendaUtilService.isUncategorized(this.tile.reportCategory))
			result = this.tile.reportCategory + this.$izendaSettingsService.getCategoryCharacter() + result;
		return result;
	}

	/**
	 * Set tile inner html
	 */
	private applyTileHtml(htmlData) {
		// load tile content
		const $report = angular.element(this.$element).find('.report');
		this.$izendaDashboardStorageService.loadReportIntoContainer(htmlData, $report);

		const numberOfCellInComplexReport = 3000;
		const numberOfCells = angular.element(this.$element).find('.ReportTable td').length;
		this.state.relativeReportComplexity = numberOfCells / numberOfCellInComplexReport;
		if (this.state.relativeReportComplexity > 1)
			this.state.relativeReportComplexity = 1;

		if (this.isIe && this.state.relativeReportComplexity >= 0.5)
			this.$element.addClass('hover-ie');

		this.state.empty = false;
	}
}