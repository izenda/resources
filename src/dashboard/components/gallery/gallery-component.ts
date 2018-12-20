import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaComponent from 'common/core/tools/izenda-component';
import izendaDashboardModule from 'dashboard/module-definition';
import IzendaUrlService from 'common/query/services/url-service';
import { IzendaDashboardModel } from 'dashboard/model/dashboard-model';
import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';
import DashboardBackgroundService from 'dashboard/services/background-service';

/**
 * <izenda-gallery> component
 */
@IzendaComponent(
	izendaDashboardModule,
	'izendaGallery',
	['rx', '$scope', '$window', '$element', '$interval', '$timeout', '$izendaUrlService', '$izendaDashboardStorageService', '$izendaBackgroundService'],
	{
		templateUrl: '###RS###extres=components.dashboard.components.gallery.gallery-template.html',
		bindings: {
			model: '<', // IzendaDashboardModel instance
			width: '@',
			height: '@',
			playTimeout: '<',
			playStarted: '<',
			playStopOnComplete: '<',
			isFullScreen: '<',
			enabled: '<',
			onPlayStartedChange: '&',
			onFullscreenChange: '&'
		}
	})
export class IzendaGalleryComponent implements ng.IComponentController {
	subscriptions = [];
	model: IzendaDashboardModel;

	$smallButtonsPanel: ng.IAugmentedJQuery;
	$parentElement: ng.IAugmentedJQuery;
	$titlePanel: ng.IAugmentedJQuery;
	previousWidth: number;
	enabled: boolean;
	currentTile: IzendaDashboardTileModel;
	state: any;
	isFullScreen: boolean;
	onFullscreenChange: any;
	onPlayStartedChange: any;
	fullscreenHandler: any;

	playStopOnComplete: boolean;
	playStarted: boolean;
	playTimeout: number;
	width: number;
	height: number;

	constructor(
		private readonly $rx: any,
		private readonly $scope: ng.IScope,
		private readonly $window: ng.IWindowService,
		private readonly $element: ng.IAugmentedJQuery,
		private readonly $interval: ng.IIntervalService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaDashboardStorageService: DashboardStorageService,
		private readonly $izendaBackgroundService: DashboardBackgroundService) {

		this.subscriptions = [];

		this.$parentElement = this.$element.parent();
		if (!this.$element.hasClass('izenda-gallery-container'))
			this.$element.addClass('izenda-gallery-container');

		this.$smallButtonsPanel = this.$parentElement.find('.izenda-gallery-controls-round-panel');
		this.$titlePanel = this.$parentElement.find('.izenda-gallery-title-controls');

		this.currentTile = null;
		this.state = {
			isUiHidden: false,
			width: 0,
			height: 0,
			elementHeight: this.$parentElement.height(),
			smallButtonsPanelHeight: this.$smallButtonsPanel.height(),
			titlePanelPosition: this.$titlePanel.position(),
			titlePanelHeight: this.$titlePanel.height()
		};

		this.setFullscreenHandlers();
	}

	$onInit() {
		this.previousWidth = this.$window.innerWidth;
		this.subscriptions = [
			this.$izendaDashboardStorageService.windowSize.subscribeOnNext(newWindowSize => {
				if (this.previousWidth === newWindowSize.width || !this.enabled)
					return;
				this.previousWidth = newWindowSize.width;
				this.$onWindowResize();
			}, this)
		];
	}

	$onChanges(changesObject) {
		if (changesObject.enabled) {
			const isEnabled = changesObject.enabled.currentValue;
			if (isEnabled)
				this.activateGallery();
			else
				this.deactivateGallery();
		} else if (changesObject.playStarted) {
			const isStarted = changesObject.playStarted.currentValue;
			if (isStarted)
				this.play();
			else
				this.stop();
		} else if (changesObject.isFullScreen) {
			const isFullscreen = changesObject.isFullScreen.currentValue;
			this.toggleFullscreen(isFullscreen);
		}
	}

	$onDestroy() {
		this.removeFullscreenHandlers();
		this.subscriptions.forEach(sub => sub.dispose());
	}

	/**
	 * On fullscreen change handler
	 */
	$onfullscreenchange() {
		if (!this.enabled)
			return;
		const isFullscreen = !!(document['fullscreenElement'] || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['msFullscreenElement']);
		if (this.isFullScreen !== isFullscreen && angular.isFunction(this.onFullscreenChange)) {
			this.onFullscreenChange({ isFullscreen: isFullscreen });
		}
	}

	/**
	 * Gallery
	 */
	$onWindowResize() {
		if (!this.enabled)
			return;
		this.toggleTileAnimations(false);
		this.initSizes();
		this.$timeout(() => {
			this.loadTilesToGallery();
			this.toggleTileAnimations(true);
		},
			1,
			true);
	}

	enableKeyHandlers() {
		// hotkeys handler
		angular.element('body').on('keydown.izendaGallery', (e: JQuery.Event) => {
			if (!this.enabled)
				return;
			const keyCode = e.keyCode;
			this.$scope.$apply(() => {
				if (!this.enabled)
					return;
				if (e.keyCode === JQuery.Key.ArrowLeft) {
					this.goPrevious();
				} else if (keyCode === JQuery.Key.ArrowRight || keyCode === JQuery.Key.Space) {
					this.goNext();
				}
			});
		});
	}

	disableKeyHandlers() {
		angular.element('body').off('keydown.izendaGallery');
	}

	setFullscreenHandlers() {
		const fullscreenRootElement = this.$parentElement.get(0);
		this.fullscreenHandler = this.$onfullscreenchange.bind(this);
		fullscreenRootElement.addEventListener('webkitfullscreenchange', this.fullscreenHandler);
		fullscreenRootElement.addEventListener('fullscreenchange', this.fullscreenHandler);
		document.addEventListener('fullscreenchange', this.fullscreenHandler);
		document.addEventListener('mozfullscreenchange', this.fullscreenHandler);
		document.addEventListener('MSFullscreenChange', this.fullscreenHandler);
	}

	removeFullscreenHandlers() {
		const fullscreenRootElement = this.$parentElement.get(0);
		fullscreenRootElement.removeEventListener('webkitfullscreenchange', this.fullscreenHandler);
		fullscreenRootElement.removeEventListener('fullscreenchange', this.fullscreenHandler);
		document.removeEventListener('fullscreenchange', this.fullscreenHandler);
		document.removeEventListener('mozfullscreenchange', this.fullscreenHandler);
		document.removeEventListener('MSFullscreenChange', this.fullscreenHandler);
	}

	updateGalleryBackground(isFullScreen: boolean) {
		const $galleryContainer = this.$parentElement;
		// when we're going to fullscreen mode - we need to add background for element, which will be the root in fullscreen view.
		if (isFullScreen) {
			const backgroundImg = this.$izendaBackgroundService.finalBackgroundImageUrl;
			$galleryContainer.css('background-image', backgroundImg ? `url("${backgroundImg}")` : '');
			const backgroundColor = this.$izendaBackgroundService.backgroundColor;
			$galleryContainer.css('background-color', backgroundColor);
		} else {
			$galleryContainer.css('background-image', '');
			$galleryContainer.css('background-color', '');
		}
	}

	toggleFullscreen(isFullscreen) {
		const launchFullScreen = element => {
			if (element.requestFullscreen)
				element.requestFullscreen();
			else if (element.mozRequestFullScreen)
				element.mozRequestFullScreen();
			else if (element.webkitRequestFullScreen)
				element.webkitRequestFullScreen();
			else if (element.msRequestFullscreen)
				element.msRequestFullscreen();
		}
		const cancelFullscreen = () => {
			if (document['exitFullscreen'])
				document['exitFullscreen']();
			else if (document['mozCancelFullScreen'])
				document['mozCancelFullScreen']();
			else if (document['webkitCancelFullScreen'])
				document['webkitCancelFullScreen']();
			else if (document['msExitFullscreen'])
				document['msExitFullscreen']();
		}

		this.updateGalleryBackground(isFullscreen);
		if (isFullscreen) {
			const fullscreenRootElement = this.$parentElement.get(0);
			launchFullScreen(fullscreenRootElement);
		} else
			cancelFullscreen();
	}

	/**
	 * Gallery enabled handler
	 */
	activateGallery() {
		this.state.isUiHidden = false;
		this.currentTile = null;
		if (this.model && this.galleryTiles.length)
			this.currentTile = this.galleryTiles[0];
		this.initSizes();
		this.enableKeyHandlers();

		this.$element.find('.izenda-gallery-item').css('opacity', 1);
		this.$timeout(() => {
			this.toggleTileAnimations(true);
			this.loadTilesToGallery();
		},
			250,
			true);
	}

	/**
	 * Gallery disabled handler
	 */
	deactivateGallery() {
		this.clearTiles();
		this.state.isUiHidden = false;
		this.currentTile = null;

		this.disableKeyHandlers();
		this.toggleTileAnimations(false);
		this.$element.find('.izenda-gallery-item').css('opacity', 0);
	}

	/**
	 * Start rotating gallery tiles.
	 */
	play() {
		this.stop();
		if (this.galleryTiles.length <= 1)
			return;

		if (this.playStopOnComplete && this.galleryTiles.indexOf(this.currentTile) === this.galleryTiles.length - 1)
			this.goTo(this.galleryTiles[0]);

		this.state.updatePlayIntervalId = this.$interval(() => {
			if (this.playStopOnComplete && this.galleryTiles.indexOf(this.currentTile) === this.galleryTiles.length - 1) {
				this.playStarted = false;
				this.stop();
				this.runStopHandler();
			} else {
				this.goNext();
			}
		}, this.playTimeout);

		this.state.updatePlayTimeoutId = this.$timeout(() => {
			this.state.isUiHidden = true;
		}, 1);
	}

	/**
	 * Stop rotating gallery tiles.
	 */
	stop() {
		if (this.state.updatePlayIntervalId) {
			this.$interval.cancel(this.state.updatePlayIntervalId);
			this.state.updatePlayIntervalId = null;
		}
		if (this.state.updatePlayTimeoutId != null) {
			this.$timeout.cancel(this.state.updatePlayTimeoutId);
			this.state.updatePlayTimeoutId = null;
			this.state.isUiHidden = false;
		}
	}

	runStopHandler() {
		if (angular.isFunction(this.onPlayStartedChange)) {
			this.onPlayStartedChange({ isPlayStarted: this.playStarted });
		}
	}

	/**
	 * Show selected tile
	 * @param {IzendaDashboardTileModel} tile tile model.
	 */
	goTo(tile) {
		this.currentTile = tile;
	}

	/**
	 * Show previous tile
	 */
	goPrevious() {
		if (this.galleryTiles.length < 2)
			return;
		let index = this.currentTile ? this.galleryTiles.indexOf(this.currentTile) : 0;
		index--;
		if (index < 0)
			index = this.galleryTiles.length - 1;
		this.goTo(this.galleryTiles[index]);
	}

	/**
	 * Show next tile.
	 */
	goNext() {
		if (this.galleryTiles.length < 2)
			return;
		let index = this.currentTile ? this.galleryTiles.indexOf(this.currentTile) : 0;
		index++;
		if (index > this.galleryTiles.length - 1)
			index = 0;
		this.goTo(this.galleryTiles[index]);
	}

	/**
	 * Initialize basic sizes
	 */
	initSizes() {
		const tileContainerTop = angular.element('.iz-dash-root').offset().top;
		const fullHeight = angular.element(this.$window).height() - tileContainerTop - 30;
		this.$parentElement.height(fullHeight);
		this.state.width = this.$parentElement.width();
		this.state.height = this.$parentElement.height();
		this.state.elementHeight = this.$parentElement.height();
		this.state.smallButtonsPanelHeight = this.$smallButtonsPanel.height(); // cache sizes
		this.state.titlePanelPosition = this.$titlePanel.position();
		this.state.titlePanelHeight = this.$titlePanel.height();
		const tileSize = this.currentTile
			? this.getTileSize(this.currentTile)
			: {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				delta: 0
			};
		this.$smallButtonsPanel.css('top', tileSize.y + tileSize.height + 'px');
	}

	/**
	 * Gallery tiles getter - tiles available for showing in gallery.
	 */
	get galleryTiles() {
		if (!this.model || !this.model.tiles.length)
			return [];
		return this.model.tilesSorted.filter(t => !!t.reportName);
	}

	/**
	 * Create title for the tile
	 */
	get tileTitle() {
		if (!this.currentTile)
			return '';
		if (this.currentTile.title)
			return this.currentTile.title;
		let result = '';
		if (this.currentTile.reportCategory)
			result = this.currentTile.reportCategory + ' / ';
		result = result + this.currentTile.reportName + ' / ' + this.currentTile.reportPartName;
		return result;
	}

	/**
	 * Get tile CSS style.
	 * @param {IzendaDashboardTileModel} tile tile model instance.
	 */
	getTileStyle(tile) {
		const size = this.getTileSize(tile);
		const style = {
			'transform': `translate(${size.x}px, ${size.y}px)`,
			'width': `${size.width}px`,
			'height': `${size.height}px`,
			'opacity': size.delta ? '0.5' : '1'
		};
		return style;
	}

	/**
	 * Calculate tile size.
	 * @param {IzendaDashboardTileModel} tile tile model instance.
	 */
	getTileSize(tile) {
		const tileIndex = this.galleryTiles.indexOf(tile);
		const currentTileIndex = this.galleryTiles.indexOf(this.currentTile);

		const parsedWidth = this.parseSize(this.width);
		const parsedHeight = this.parseSize(this.height);

		const galleryItemWidth =
			Math.round(parsedWidth.isPercent ? this.state.width * parsedWidth.value : parsedWidth.value);
		let galleryItemHeight =
			Math.round(parsedHeight.isPercent ? this.state.height * parsedHeight.value : parsedHeight.value);

		const spaceWidth = 100;
		const delta = tileIndex - currentTileIndex;
		const transformX = Math.round((this.state.width - galleryItemWidth) / 2 + delta * (galleryItemWidth + spaceWidth));
		let transformY = Math.round((this.state.height - galleryItemHeight) / 2);

		const constraintBottom = this.state.smallButtonsPanelHeight;
		const constraintTop = this.state.titlePanelPosition.top + this.state.titlePanelHeight + 10;
		if (transformY < constraintTop)
			transformY = constraintTop;
		if (transformY + galleryItemHeight > this.state.elementHeight - constraintBottom) {
			galleryItemHeight = this.state.elementHeight - transformY - constraintBottom;
		}
		return {
			x: transformX,
			y: transformY,
			width: galleryItemWidth,
			height: galleryItemHeight,
			delta: delta
		};
	}

	/**
	 * Parse size string
	 * @param {string} sizeString
	 */
	parseSize(sizeString) {
		const result = {
			isPercent: false,
			value: 0
		};
		if (sizeString.endsWith('%')) {
			result.isPercent = true;
			result.value = parseInt(sizeString.substring(0, sizeString.length - 1)) / 100;
		} else if (sizeString.endsWith('px'))
			result.value = parseInt(sizeString.substring(0, sizeString.length - 2));
		else
			result.value = parseInt(sizeString);
		return result;
	}

	/**
	 * Turn on/off CSS tile animations
	 * @param {bool} enabled
	 */
	toggleTileAnimations(enabled) {
		if (enabled) {
			this.$element.find('.izenda-gallery-item').addClass('izenda-gallery-transition');
		} else {
			this.$element.find('.izenda-gallery-item').removeClass('izenda-gallery-transition');
		}
	}

	/**
	 * Clear tiles.
	 */
	clearTiles() {
		this.galleryTiles.forEach(tile => {
			var $tile = this.$element.find(`.izenda-gallery-item[tile-id=${tile.id}] > .izenda-gallery-item-inner`);
			$tile.empty();
		});
	}

	/**
	* Load gallery tile
	*/
	loadTilesToGallery() {
		this.galleryTiles.forEach(tile => {
			var $tile = this.$element.find(`.izenda-gallery-item[tile-id=${tile.id}] > .izenda-gallery-item-inner`);
			var loadingHtml = '<div class="izenda-common-vcentered-container">' +
				'<div class="izenda-common-vcentered-item">' +
				'<img class="izenda-common-img-loading" src="' +
				this.$izendaUrlService.settings.urlRpPage +
				'image=ModernImages.loading-grid.gif" alt="Loading..." />' +
				'</div>' +
				'</div>';
			$tile.html(loadingHtml);

			var size = {
				height: $tile.height(),
				width: $tile.width()
			};
			this.$izendaDashboardStorageService.loadTilesPreview(tile, size).then(tilesHtml => {
				var $reportDiv = angular.element('<div class="report"></div>');
				$tile.empty();
				$tile.append($reportDiv);

				// load html into this div
				this.$izendaDashboardStorageService.loadReportIntoContainer(tilesHtml, $reportDiv);
			},
				error => {
					$tile.empty();
					$tile.text(error);
				});
		});
	}
}

