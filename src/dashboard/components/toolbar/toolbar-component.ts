import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaComponent from 'common/core/tools/izenda-component';
import izendaDashboardModule, { IIzendaDashboardSettings } from 'dashboard/module-definition';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaScheduleService from 'common/ui/services/schedule-service';
import IzendaShareService from 'common/ui/services/share-service';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';
import DashboardBackgroundService from 'dashboard/services/background-service';
import DashboardGalleryService from 'dashboard/services/gallery-service';

@IzendaComponent(
	izendaDashboardModule,
	'izendaDashboardToolbar',
	['rx', '$window', '$element', '$interval', '$timeout', '$rootScope',
		'izendaDashboardConfig', '$izendaSettingsService', '$izendaLocaleService', '$izendaUtilService', '$izendaUtilUiService',
		'$izendaCompatibilityService', '$izendaUrlService',
		'$izendaScheduleService', '$izendaShareService', '$izendaDashboardSettings', '$izendaDashboardStorageService',
		'$izendaBackgroundService', '$izendaGalleryService'],
	{
		templateUrl: '###RS###extres=components.dashboard.components.toolbar.toolbar-template.html'
	})
class IzendaDashboardToolbarComponent implements ng.IComponentController {
	isLicenseFailed: boolean;
	isHueRotate: boolean;
	isHueRotateEnabled: boolean;
	isHtml5FullScreenSupported: boolean;
	isDesignLinksAllowed: boolean;
	isStorageAvailable: boolean;

	isSaveReportModalOpened: boolean;
	scheduleModalOpened: boolean;
	shareModalOpened: boolean;
	selectBackgroundImageModalOpened: boolean;

	subscriptions: any[];
	commonSettings: any;

	printMode: string;
	backgroundModalRadio: string;

	isButtonBarVisible: boolean;
	buttonbarClass: string;
	buttonbarCollapsedClass: string;

	refreshInterval: number;
	autoRefresh: any;

	sendEmailModalOpened: boolean;
	sendEmailState: any;

	currentCategory: string;
	currentDashboard: string;

	model: any;
	categories: any;

	constructor(
		private readonly $rx: any,
		private readonly $window: any,
		private readonly $element: any,
		private readonly $interval: any,
		private readonly $timeout: any,
		private readonly $rootScope: any,
		private readonly dashboardConfig: any,
		private readonly $izendaSettingsService: any,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaUtilService: IzendaUtilService,
		private readonly $izendaUtilUiService: IzendaUtilUiService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaScheduleService: IzendaScheduleService,
		private readonly $izendaShareService: IzendaShareService,
		private readonly $izendaDashboardSettings: IIzendaDashboardSettings,
		private readonly $izendaDashboardStorageService: DashboardStorageService,
		private readonly $izendaBackgroundService: DashboardBackgroundService,
		private readonly $izendaGalleryService: DashboardGalleryService) {

		const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
		const isFirefox = /Firefox/.test(navigator.userAgent);
		this.isHueRotate = isChrome || isSafari || isFirefox;
		this.isHueRotateEnabled = false;
		this.isSaveReportModalOpened = false;
		this.isHtml5FullScreenSupported = this.$izendaCompatibilityService.isHtml5FullScreenSupported();
	}

	$onInit() {
		this.subscriptions = [];
		this.isLicenseFailed = !this.$izendaDashboardSettings.dashboardsAllowed;
		if (this.isLicenseFailed)
			return;

		this.scheduleModalOpened = false;
		this.shareModalOpened = false;

		// settings
		this.commonSettings = this.$izendaSettingsService.getCommonSettings();
		this.isDesignLinksAllowed = this.commonSettings.showDesignLinks;
		this.printMode = this.$izendaDashboardSettings.allowedPrintEngine;

		// background
		this.isStorageAvailable = this.$izendaBackgroundService.isStorageAvailable();
		this.selectBackgroundImageModalOpened = false;
		this.backgroundModalRadio = 'url';
		// button bar
		this.isButtonBarVisible = false;
		this.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel left-transition';
		this.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel left-transition opened';
		// refresh
		this.refreshInterval = null;
		this.autoRefresh = null;
		//email
		this.sendEmailModalOpened = false;
		this.sendEmailState = {
			errors: [],
			isLoading: false,
			errorOccured: false,
			sendType: 'Link',
			email: '',
			opened: false,
			focused: false
		};

		// subscribe
		this.subscriptions = [
			this.$izendaDashboardStorageService.model.subscribeOnNext(this.$onDashboardModelUpdate, this),
			this.$izendaDashboardStorageService.autoRefresh.subscribeOnNext(this.$onAutorefreshUpdate, this),
			this.$izendaDashboardStorageService.categories.subscribeOnNext(this.$onCategoriesUpdate, this),
			this.$izendaDashboardStorageService.currentCategory.subscribeOnNext(next => this.currentCategory = next),
			this.$izendaDashboardStorageService.currentDashboard.subscribeOnNext(next => this.currentDashboard = next),
			this.$izendaDashboardStorageService.windowSize.subscribeOnNext(newWindowSize => {
				// resize handler
			}, this)
		];
	}

	$onDestroy() {
		this.cancelRefreshInterval();
		this.subscriptions.forEach(sub => sub.dispose());
	}

	$onDashboardModelUpdate(newModel) {
		this.cancelRefreshInterval();
		this.model = newModel;
	}

	$onAutorefreshUpdate(newAutorefresh) {
		this.autoRefresh = newAutorefresh;
	}

	$onCategoriesUpdate(newCategories) {
		this.categories = newCategories;
	}

	/**
	 * Create new dashboard button handler.
	 */
	createNewDashboard() {
		this.$izendaDashboardStorageService.navigateNewDashboard();
	}

	/**
	 * Save dashboard
	 * @param {boolean} showNameDialog dashboard report set name.
	 */
	saveDashboard(showNameDialog) {
		if (showNameDialog || !this.model.reportFullName) {
			this.isSaveReportModalOpened = true;
		} else {
			this.hideButtonBar();
			this.$izendaDashboardStorageService
				.saveDashboard()
				.then(() => {
					this.$izendaUtilUiService.showNotification(this.$izendaLocaleService.localeText('js_DashboardSaved',
						'Dashboard sucessfully saved'));
				},
				(error) => {
					const msgCantSave = this.$izendaLocaleService.localeText('js_CantSaveDashboard', 'Can\'t save dashboard');
					const msgError = this.$izendaLocaleService.localeText('js_Error', 'Error');
					var errorText = `${msgCantSave} "${this.model.reportFullName}". ${msgError}: "${error}"`;
					this.$izendaUtilUiService.showErrorDialog(errorText);
				});
		}
	}

	/**
	  * Save dialog closed handler.
	  */
	onSaveClosed() {
		this.hideButtonBar();
		this.isSaveReportModalOpened = false;
	}

	/**
	 * Report name/category selected. Save report handler. In this scenario we have to turn button bar off
	 */
	onSave(reportName, categoryName) {
		this.hideButtonBar(() => {
			this.isSaveReportModalOpened = false;
			this.$izendaDashboardStorageService
				.saveDashboard(reportName, categoryName)
				.then(() => {
					this.$izendaUtilUiService.showNotification(this.$izendaLocaleService.localeText('js_DashboardSaved',
						'Dashboard sucessfully saved'));
				},
				(error) => {
					const msgCantSave = this.$izendaLocaleService.localeText('js_CantSaveDashboard', 'Can\'t save dashboard');
					const msgError = this.$izendaLocaleService.localeText('js_Error', 'Error');
					var errorText = `${msgCantSave} "${this.model.reportFullName}". ${msgError}: "${error}"`;
					this.$izendaUtilUiService.showErrorDialog(errorText);
				});

		});
	}

	/**
	 * Refresh all dashboard tiles (without reloading)
	 * @param {number} intervalIndex auto refresh interval index. Automatic refresh will turn on if this argument is set.
	 */
	refreshDashboard(intervalIndex) {
		this.$izendaDashboardStorageService.refreshDashboard(false, false);
		if (!this.autoRefresh)
			return;
		if (angular.isNumber(intervalIndex)) {
			this.cancelRefreshInterval();
			const selectedInterval = this.autoRefresh.intervals[intervalIndex];
			selectedInterval.selected = true;
			let intervalValue = selectedInterval.value;
			if (intervalValue >= 1) {
				intervalValue *= 1000;
				this.refreshInterval = setInterval(
					() => this.$izendaDashboardStorageService.refreshDashboard(false, false),
					intervalValue);
			}
		}
	}

	closeScheduleDialog() {
		this.scheduleModalOpened = false;
	}

	closeShareDialog() {
		this.shareModalOpened = false;
	}

	openToolbarDashboard(dashboardObj) {
		this.$izendaDashboardStorageService.navigateToDashboard(dashboardObj.fullName);
	}

	showButtonBar() {
		this.isButtonBarVisible = true;
		this.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel transform-transition opened';
		this.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel transform-transition';
	}

	hideButtonBar(completedHandler?) {
		this.isButtonBarVisible = false;
		this.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel';
		this.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel opened';
		this.$timeout(() => {
			if (angular.isFunction(completedHandler))
				completedHandler.call(this);
		},
			200);
	}

	/**
	 * Activate/deactivate dashboard mode
	 */
	toggleGalleryMode(enableGalleryMode) {
		if (enableGalleryMode)
			this.$izendaDashboardStorageService.toggleFiltersPanel(false);
		this.$izendaGalleryService.galleryState.isEnabled = enableGalleryMode;
	}

	/**
	 * Open gallery in fullscreen mode
	 */
	toggleGalleryModeFullScreen() {
		this.$izendaDashboardStorageService.toggleFiltersPanel(false);
		this.$izendaGalleryService.galleryState.isFullScreen = !this.$izendaGalleryService.galleryState.isFullScreen;
	}

	/**
	 * Turn off/on gallery play
	 */
	toggleGalleryPlay() {
		this.$izendaDashboardStorageService.toggleFiltersPanel(false);
		this.$izendaGalleryService.galleryState.isPlayStarted = !this.$izendaGalleryService.galleryState.isPlayStarted;
	}

	/**
	 * Get current selected interval
	 */
	get selectedInterval() {
		if (!this.autoRefresh)
			return null;
		const selected = this.autoRefresh.intervals.filter(interval => interval.selected);
		if (selected.length > 1)
			throw 'Found more than 2 selected refresh intervals';
		return selected.length ? selected[0] : null;
	}

	/**
	 * Stop current interval loop and unselect current interval in UI.
	 */
	cancelRefreshInterval() {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}

		if (!this.autoRefresh)
			return;
		if (angular.isArray(this.autoRefresh.intervals)) {
			this.autoRefresh.intervals.forEach(interval => {
				interval.selected = false;
			});
		}
	}

	/**
	 * Toggle dashboard filters panel
	 */
	toggleDashboardFilters() {
		if (this.isFiltersEditAllowed) {
			this.$izendaDashboardStorageService.toggleFiltersPanel();
		}
	}

	/**
	 * Hue rotate toolbar btn icon
	 */
	get hueRotateBtnImageUrl() {
		return this.$izendaUrlService.settings.urlRpPage + 'extres=images.color' + (!this.isHueRotateEnabled ? '-bw' : '') + '.png';
	}

	/**
	 * Check if one column view required
	 */
	get isOneColumnView() {
		return this.$izendaCompatibilityService.isOneColumnView();
	}

	/**
	 * Check is filters allowed
	*/
	get isFullAccess() {
		return this.$izendaCompatibilityService.isFullAccess();
	}

	/**
	 * Check is filters allowed
	 */
	get isFiltersEditAllowed() {
		return this.$izendaCompatibilityService.isFiltersEditAllowed();
	}

	/**
	 * Check is save allowed
	 */
	get isSaveAllowed() {
		return this.model && this.$izendaCompatibilityService.isSaveAllowedWithHidden() && !this.model.tilesWithHiddenColumns.length;
	}

	/**
	 * Check is save as allowed
	 */
	get isSaveAsAllowed() {
		return this.model && this.$izendaCompatibilityService.isSaveAsAllowed() && !this.model.tilesWithHiddenColumns.length;
	}

	/**
	 * Show or not save controls
	 */
	get isShowSaveControls() {
		return this.commonSettings.showSaveControls;
	}

	/**
	 * Is "save as" button allowed
	 */
	get isShowSaveAsToolbarButton() {
		return this.commonSettings.showSaveAsToolbarButton;
	}

	get isShowDesignDashboardLink() {
		return this.commonSettings.showDesignDashboardLink;
	}

	/**
	 * Check is edit allowed
	 */
	get isReadOnly() {
		return this.$izendaCompatibilityService.isEditAllowed();
	}

	/**
	 * Check toggleHueRotateEnabled
	 */
	get isToggleHueRotateEnabled() {
		return this.isHueRotate;
	}

	/**
	 * Background modal "OK" click handler
	 */
	$onBackgroundDialogHandlerOk() {
		this.selectBackgroundImageModalOpened = false;
		if (this.backgroundModalRadio === 'file')
			this.setBackgroundImageFromLocalhost();
	}

	/**
	 * Background file/url changed handler
	 */
	$onBackgroundModalRadioChange() {
		this.$izendaBackgroundService.backgroundImageType = this.backgroundModalRadio;
	}

	/**
	 * Set file selected in file input as background
	 */
	setBackgroundImageFromLocalhost() {
		const $fileBtn = angular.element('#izendaDashboardBackground');
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			if ($fileBtn[0]['files'].length === 0)
				return;
			const file = $fileBtn[0]['files'][0];
			// test file information
			if (!file.type.match('image.*')) {
				alert(this.$izendaLocaleService.localeText('js_ShouldBeImage', 'File should be image'));
				return;
			}
			// read the file:
			// TODO READER + TYPESCRIPT!
			const reader = new FileReader();
			reader.onload = (event: any) => {
				var bytes = event.target.result;
				this.$izendaBackgroundService.backgroundImageBase64 = bytes;
			};
			//reader.onload = (() => {
			//	return event => {
			//		var bytes = event.target.result;
			//		this.$izendaBackgroundService.backgroundImageBase64 = bytes;
			//	};
			//})(file);
			// Read in the image file as a data URL.
			reader.readAsDataURL(file);
		}
	}

	get isBackgroundImageSet() {
		return this.$izendaBackgroundService.backgroundImageBase64 || this.$izendaBackgroundService.backgroundImageUrl;
	}

	removeBackgroundImageHandler() {
		this.$izendaBackgroundService.backgroundImageBase64 = '';
		this.$izendaBackgroundService.backgroundImageUrl = '';
	}

	// PRINT

	/**
	 * Is html model enabled in AdHocSettings
	 */
	get isPrintDashboardVisible() {
		return this.printMode === 'Html' || this.printMode === 'Html2PdfAndHtml';
	}

	/**
	 * Is html2pdf mode enabled in AdHocSettings
	 */
	get isPrintDashboardPdfVisible() {
		return this.printMode === 'Html2Pdf' || this.printMode === 'Html2PdfAndHtml';
	}

	/**
	 * Is print button visible
	 */
	get isPrintDropdownVisible() {
		return this.isPrintDashboardPdfVisible || this.isPrintDashboardVisible;
	}

	/**
	 * Print whole dashboard
	 */
	printDashboard() {
		this.$izendaDashboardStorageService.printDashboard('html').then(() => {
			// HTML print print successfully completed handler
		},
			error => {
				const errorTitle = this.$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error');
				let errorText = this.$izendaLocaleService.localeText('js_FailedPrintReport',
					'Failed to print report "{0}". Error description: {1}.');
				errorText = errorText.replaceAll('{0}', this.model.reportFullName ? this.model.reportFullName : '');
				errorText = errorText.replaceAll('{1}', error);
				this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
				console.error(error);
			});
	}

	/**
	 * Print dashboard as pdf
	 */
	printDashboardPdf() {
		this.$izendaDashboardStorageService.printDashboard('pdf').then(() => {
			// PDF print print successfully completed handler
		},
			error => {
				const errorTitle = this.$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error');
				let errorText = this.$izendaLocaleService.localeText('js_FailedPrintReport',
					'Failed to print report "{0}". Error description: {1}.');
				errorText = errorText.replaceAll('{0}', this.model.reportFullName ? this.model.reportFullName : '');
				errorText = errorText.replaceAll('{1}', error);
				this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
				console.error(error);
			});
	}

	// EMAIL

	/**
	 * Open send email dialog
	 */
	showEmailModal(type) {
		this.sendEmailState.isLoading = false;
		this.sendEmailState.opened = true;
		this.sendEmailState.sendType = type;
		this.sendEmailState.email = '';
		this.sendEmailState.errors = [];
		this.sendEmailState.errorOccured = false;
	}

	/**
	 * Send email dialog shown event.
	 */
	setFocus() {
		this.$timeout(() => {
			this.sendEmailState.focused = true;
		}, 1);
	}

	/**
	 * Close send email dialog
	 */
	hideEmailModal(success) {
		this.sendEmailState.focused = false;
		this.sendEmailState.errorOccured = true;
		this.sendEmailState.errors = [];
		if (success) {
			// OK pressed
			const isEmailValid =
				/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(this.sendEmailState
					.email);
			if (!isEmailValid) {
				this.sendEmailState.errorOccured = true;
				this.sendEmailState.errors.push(this.$izendaLocaleService.localeText('js_IncorrectEmail', 'Incorrect Email'));
			} else {
				this.sendEmailState.isLoading = true;
				this.$izendaDashboardStorageService.sendEmail(this.sendEmailState.sendType, this.sendEmailState.email).then(result => {
					this.sendEmailState.opened = false;
					if (result === 'OK') {
						this.$izendaUtilUiService.showNotification(
							this.$izendaLocaleService.localeText('js_EmailWasSent', 'Email  was sent'));
					} else {
						const errorText = this.$izendaLocaleService.localeText('js_FailedToSendEmail', 'Failed to send email');
						this.$izendaUtilUiService.showErrorDialog(errorText);
					}
				},
					error => {
						console.error(error);
						const errorText = this.$izendaLocaleService.localeText('js_FailedToSendEmail', 'Failed to send email');
						this.$izendaUtilUiService.showErrorDialog(errorText);
					});
			}
		} else {
			// cancel pressed
			this.sendEmailState.opened = false;
		}

	}

	/**
	 * Send dashboard via email
	 */
	sendEmail(type) {
		if (type === 'Link') {
			if (!this.model.reportFullName) {
				const errorText =
					this.$izendaLocaleService.localeText('js_CantSendUnsavedLink', 'Cannot email link to unsaved dashboard');
				this.$izendaUtilUiService.showNotification(errorText);
				return;
			}
			let redirectUrl =
				`?subject=${encodeURIComponent(this.model.reportFullName)}&body=${encodeURIComponent(location.href)}`;
			redirectUrl = `mailto:${redirectUrl.replace(/ /g, '%20')}`;
			window.top.location.href = redirectUrl;
		} else
			this.showEmailModal(type);
	}
}
