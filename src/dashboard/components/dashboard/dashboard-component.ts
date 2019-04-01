import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaComponent from 'common/core/tools/izenda-component';
import izendaDashboardModule from 'dashboard/module-definition';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import { IIzendaDashboardSettings } from 'dashboard/module-definition';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';
import DashboardBackgroundService from 'dashboard/services/background-service';
import DashboardGalleryService from 'dashboard/services/gallery-service';

/**
 * Izenda dashboard component.
 */
@IzendaComponent(
	izendaDashboardModule,
	'izendaDashboard',
	['rx', '$window', '$element', '$interval', '$timeout', '$rootScope', '$izendaLocaleService', '$izendaCompatibilityService',
		'$izendaDashboardSettings', '$izendaDashboardStorageService', '$izendaBackgroundService', '$izendaGalleryService'],
	{
		templateUrl: '###RS###extres=components.dashboard.components.dashboard.dashboard-template.html'
	})
export class IzendaDashboardComponent implements ng.IComponentController {
	isLicenseFailed: boolean;
	exportProgress: string;
	tileWidth: number;
	tileHeight: number;
	tileContainerStyle: any;
	isMouseEventsEnabled: boolean;
	galleryContainerStyle: any;
	rootWidth: number;
	previousWidth: number;
	subscriptions: any[];
	model: any;
	isGridVisible: boolean;
	gridStyle: any;
	isGridShadowVisible: boolean;
	isGridShadowPlusButtonVisible: boolean;
	gridShadowStyle: any;
	isLoaded: boolean;

	constructor(
		private readonly $rx: any,
		private readonly $window: ng.IWindowService,
		private readonly $element: ng.IAugmentedJQuery,
		private readonly $interval: ng.IIntervalService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $rootScope: ng.IRootScopeService,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService,
		private readonly $izendaDashboardSettings: IIzendaDashboardSettings,
		private readonly $izendaDashboardStorageService: DashboardStorageService,
		private readonly $izendaBackgroundService: DashboardBackgroundService,
		private readonly $izendaGalleryService: DashboardGalleryService) {
	}

	$onInit() {
		this.isLicenseFailed = !this.$izendaDashboardSettings.dashboardsAllowed;
		if (this.isLicenseFailed)
			return;

		this.exportProgress = null;
		this.tileWidth = 100;
		this.tileHeight = 100;
		this.tileContainerStyle = {
			backgroundColor: 'transparent'
		};
		this.isMouseEventsEnabled = true;

		this.initGrid();

		this.galleryContainerStyle = {
			'height': 0
		};
		this.rootWidth = this.$element.find('.iz-dash-root').width();

		// subscribe

		this.previousWidth = this.$window.innerWidth;

		this.subscriptions = [
			this.$izendaDashboardStorageService.model.subscribeOnNext(this.$onDashboardModelUpdate, this),
			this.$izendaDashboardStorageService.isLoaded.subscribeOnNext(this.$onDashboardIsLoadedUpdate, this),
			this.$izendaDashboardStorageService.exportProgress.subscribeOnNext((newValue) => {
				this.$timeout(() => this.exportProgress = newValue, 1);
			}, this),
			//this.$izendaBackgroundService.background.subscribeOnNext(this.$onDashboardBackgroundChanged, this),
			this.$izendaDashboardStorageService.windowSize.subscribeOnNext(newWindowSize => {
				if (this.previousWidth === newWindowSize.width)
					return;
				this.previousWidth = newWindowSize.width;
				this.rootWidth = this.$element.find('.iz-dash-root').width();
				this.updateDashboardSize();
				this.$rootScope.$applyAsync();
			})
		];
	}

	initGrid() {
		this.isGridVisible = false;
		this.gridStyle = null;
		this.isGridShadowVisible = false;
		this.isGridShadowPlusButtonVisible = false;
		this.gridShadowStyle = {
			'left': 0,
			'top': 0,
			'width': 0,
			'height': 0
		}
		this.updateGridStyle(); // init grid style
	}

	$onDestroy() {
		this.subscriptions.forEach(sub => sub.dispose());
	}

	/**
	 * Dashboard model changed handler. Occurs when user navigates to existing or new dashboard.
	 * @param {IzendaDashboardModel} newModel new dashboard model object.
	 */
	$onDashboardModelUpdate(newModel) {
		this.model = newModel;
		if (!this.model)
			return;
		this.updateDashboardSize();
	}

	/**
	 * Dashboard isLoaded changed handler.
	 * @param {boolean} newIsLoaded new isLoaded value.
	 */
	$onDashboardIsLoadedUpdate(newIsLoaded) {
		this.isLoaded = newIsLoaded;
	}

	/**
	 * Event fires on tile drag start
	 */
	$onTileDragStart(tile) {
		this.turnOffMouseHandlers();
		this.showGrid();
		this.showTileGridShadow({
			left: tile.x * this.tileWidth,
			top: tile.y * this.tileHeight,
			width: tile.width * this.tileWidth,
			height: tile.height * this.tileHeight
		},
			false);
	}

	/**
	 * Event fires on tile drag change position
	 */
	$onTileDrag(tile, shadowPosition) {
		this.showTileGridShadow({
			left: shadowPosition.left,
			top: shadowPosition.top,
			width: shadowPosition.width,
			height: shadowPosition.height
		},
			false);
		this.updateDashboardSize(shadowPosition);
	}

	/**
	 * Event fires on tile drag end
	 */
	$onTileDragEnd(eventResult) {
		this.hideGrid();
		this.turnOnMouseHandlers();
	}

	/**
	 * Start tile resize event handler
	 */
	$onTileResizeStart(tile) {
		this.turnOffMouseHandlers();
		this.showGrid();
		this.showTileGridShadow({
			left: tile.x * this.tileWidth,
			top: tile.y * this.tileHeight,
			width: tile.width * this.tileWidth,
			height: tile.height * this.tileHeight
		},
			false);
	}

	/**
	 * Tile resize handler
	 */
	$onTileResize(tile, shadowPosition) {
		this.showTileGridShadow({
			left: shadowPosition.left,
			top: shadowPosition.top,
			width: shadowPosition.width,
			height: shadowPosition.height
		},
			false);
		this.updateDashboardSize(shadowPosition);
	}

	/**
	 * Tile resize completed handler
	 */
	$onTileResizeEnd(eventResult) {
		this.hideGrid();
		this.turnOnMouseHandlers();
	}

	/**
	 * Tile delete handler
	 */
	$onTileDelete(tile) {
		if (tile == null)
			throw 'Tile not found';
		this.model.removeTile(tile);
		this.updateDashboardSize();
		this.$izendaDashboardStorageService.refreshFilters();
	}

	/**
	 * Tile report selected handler.
	 * @param {IzendaDashboardTileModel} tile tile model object.
	 */
	$onTileReportSelected(tile) {
		this.$izendaDashboardStorageService.refreshFilters();
	}

	/**
	 * Dashboard mouse hover
	 */
	globalMousemoveHandler($event) {
		if (!this.isMouseEventsEnabled) {
			return;
		}

		const $target = angular.element($event.target);
		if ($target.closest('.iz-dash-tile').length) {
			this.hideGrid();
			return;
		}

		// get {x, y} click coordinates
		const x = Math.floor($event.offsetX / this.tileWidth);
		const y = Math.floor($event.offsetY / this.tileHeight);

		this.showGrid();
		if ($target.hasClass('dashboard-grid') && $target.width() > 0) {
			this.showTileGridShadow({
				left: x * this.tileWidth,
				top: y * this.tileHeight,
				width: this.tileWidth,
				height: this.tileHeight
			}, true);
		}
	}

	/**
	 * Dashboard mouse out
	 */
	globalMouseoutHandler($event) {
		if (!this.isMouseEventsEnabled
			|| ($event.relatedTarget && angular.element($event.relatedTarget).closest('.iz-dash-body-container').length > 0))
			return;
		this.hideGrid();
	}

	/**
	 * Click to any part of the dashboard
	 */
	globalClickHandler($event) {
		if (!this.isMouseEventsEnabled)
			return true;
		if (typeof ($event['which']) !== 'undefined' && $event['which'] !== 1)
			return true;
		// get {x, y} click coordinates
		const x = Math.floor($event.offsetX / this.tileWidth);
		const y = Math.floor($event.offsetY / this.tileHeight);
		this.model.addPixelTile(x, y);
		this.updateDashboardSize();
		return false;
	}

	/**
	 * Disable mouse move/out/click handlers for dashboard 
	 */
	turnOffMouseHandlers() {
		this.isMouseEventsEnabled = false;
		this.hideGrid();
	}

	/**
	 * Enable mouse move/out/click handlers for dashboard 
	 */
	turnOnMouseHandlers() {
		this.isMouseEventsEnabled = true;
	}

	/**
	 * Update tile container sizes
	 * @param {object} additionalBox. If we want to extend dashboard container size we can
	 * use this parameter and add additional area.
	 */
	updateDashboardSize(additionalBox?) {
		if (!this.model)
			return;
		this.updateTileSize();
		this.updateGallerySize();
		const isOneColumn = this.$izendaCompatibilityService.isOneColumnView();
		const maxHeight = this.model.getMaxHeight(isOneColumn);

		let maxHeightPixels = maxHeight * this.tileHeight;
		// update height of union of tiles and additional box it is set
		if (angular.isDefined(additionalBox))
			if (additionalBox.top + additionalBox.height > maxHeightPixels)
				maxHeightPixels = additionalBox.top + additionalBox.height;
		// set height:
		angular.element('.iz-dash-body-container').height((maxHeightPixels + this.tileHeight + 1) + 'px');
	}

	/**
	 * Update tile grid sizes
	 */
	updateTileSize() {
		const width = Math.floor(this.rootWidth / 12) * 12 - 24;
		this.$element.find('.iz-dash-body-container').width(width);
		this.tileWidth = width / 12;
		this.tileHeight = this.tileWidth > 100 ? this.tileWidth : 100;
		this.updateGridStyle();
	}

	/**
	 * Update tile grid style variable.
	 */
	updateGridStyle() {
		this.gridStyle = {
			'background-size': this.tileWidth +
				'px ' +
				this.tileHeight +
				'px, ' +
				this.tileWidth +
				'px ' +
				this.tileHeight +
				'px'
		};
	}

	/**
	 * Update gallery container size
	 */
	updateGallerySize() {
		const tileContainerTop = angular.element('.iz-dash-root').offset().top;
		this.galleryContainerStyle.height = angular.element(this.$window).height() - tileContainerTop - 30;
	}

	/**
	 * Event handler which runs when user turns on fullscreen.
	 * @param {boolean} isFullscreen
	 */
	galleryToggleFullscreen(isFullscreen) {
		this.$izendaGalleryService.galleryState.isFullScreen = isFullscreen;
	}

	/**
	 * Event handler which runs when gallery stop playing.
	 * @param {boolean} isPlayStarted isPlayStarted
	 */
	galleryTogglePlayStarted(isPlayStarted) {
		this.$izendaGalleryService.galleryState.isPlayStarted = isPlayStarted;
	}

	showGrid() {
		const isOneColumn = this.$izendaCompatibilityService.isOneColumnView();
		if (isOneColumn)
			return;
		this.isGridVisible = true;
	}

	hideGrid() {
		if (!this.isGridVisible)
			return;
		this.isGridVisible = false;
		this.hideTileGridShadow();
	}

	/**
	 * Show tile grid shadow
	 */
	showTileGridShadow(shadowBbox, showPlusButton) {
		const isOneColumn = this.$izendaCompatibilityService.isOneColumnView();
		if (isOneColumn)
			return;
		this.isGridShadowVisible = true;
		this.isGridShadowPlusButtonVisible = showPlusButton;
		let left = shadowBbox.left;
		let top = shadowBbox.top;
		const width = shadowBbox.width;
		const height = shadowBbox.height;
		if (left < 0) left = 0;
		if (left + width >= this.tileWidth * 12) left = this.tileWidth * 12 - width;
		if (top < 0) top = 0;
		this.gridShadowStyle = {
			'left': left + 1,
			'top': top + 1,
			'width': width - 1,
			'height': height - 1
		};
	}

	/**
	 * Hide tile grid shadow
	 */
	hideTileGridShadow() {
		this.isGridShadowVisible = false;
	}

	getExportWaitMessageHeaderText() {
		if (this.exportProgress === 'export')
			return this.$izendaLocaleService.localeText('js_ExportingInProgress', 'Exporting in progress.');
		if (this.exportProgress === 'print')
			return this.$izendaLocaleService.localeText('js_PrintingInProgress', 'Printing in progress.');
		return '';
	}

	getExportWaitMessageText() {
		if (this.exportProgress === 'export')
			return this.$izendaLocaleService.localeText('js_FinishExporting', 'Please wait till export is completed...');
		if (this.exportProgress === 'print')
			return this.$izendaLocaleService.localeText('js_FinishPrinting', 'Please finish printing before continue.');
		return '';
	}
}

