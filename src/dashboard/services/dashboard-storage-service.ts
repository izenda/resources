import 'izenda-external-libs';
import * as angular from 'angular';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaRsQueryService from 'common/query/services/rs-query-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';
import IzendaScheduleService from 'common/ui/services/schedule-service';
import IzendaShareService from 'common/ui/services/share-service';

import { IzendaFiltersModel } from 'common/core/models/filters-model';
import { IIzendaDashboardConfig } from 'dashboard/module-definition';
import { IzendaDashboardModel } from 'dashboard/model/dashboard-model';
import DashboardQueryService from 'dashboard/services/dashboard-query-service';



/**
 * Dashboard storage service. Stores current dashboard state.
 */
export default class DashboardStorageService {

	UNCATEGORIZED: string;

	// rx subjects
	model: any;
	categories: any;
	currentCategory: any;
	currentDashboard: any;
	isLoaded: any;
	isFiltersActive: any;
	exportProgress: any;
	autoRefresh: any;
	refreshObservable: any;
	windowSize: any;
	windowSizeActive: any;
	location: any;

	static get injectModules(): any[] {
		return [
			'rx', '$q', '$window', '$interval', '$timeout', '$izendaLocaleService', '$izendaCompatibilityService',
			'$izendaSettingsService', '$izendaUtilService', '$izendaUrlService', '$izendaRsQueryService',
			'$izendaUtilUiService', 'izendaDashboardConfig', '$izendaDashboardQueryService',
			'$izendaScheduleService', '$izendaShareService'
		];
	}

	constructor(
		private readonly $rx: any,
		private readonly $q: ng.IQService,
		private readonly $window: ng.IWindowService,
		private readonly $interval: ng.IIntervalService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaCompatibilityService: IzendaCompatibilityService,
		private readonly $izendaSettingsService: IzendaQuerySettingsService,
		private readonly $izendaUtilService: IzendaUtilService,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaRsQueryService: IzendaRsQueryService,
		private readonly $izendaUtilUiService: IzendaUtilUiService,
		private readonly $izendaDashboardConfig: IIzendaDashboardConfig,
		private readonly $izendaDashboardQueryService: DashboardQueryService,
		private readonly $izendaScheduleService: IzendaScheduleService,
		private readonly $izendaShareService: IzendaShareService) {

		this.UNCATEGORIZED = this.$izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');

		// rx subjects
		this.model = new this.$rx.BehaviorSubject(null);
		this.categories = new this.$rx.BehaviorSubject([]);
		this.currentCategory = new this.$rx.BehaviorSubject([]);
		this.currentDashboard = new this.$rx.BehaviorSubject(null);
		this.isLoaded = new this.$rx.BehaviorSubject(false);
		this.isFiltersActive = new this.$rx.BehaviorSubject(false);
		this.exportProgress = new this.$rx.BehaviorSubject(null);
		this.autoRefresh = new this.$rx.BehaviorSubject({
			intervals: []
		});
		this.refreshObservable = new this.$rx.Subject();
		this.windowSize = new this.$rx.BehaviorSubject({
			width: this.$window.innerWidth,
			height: this.$window.innerHeight
		});
		this.windowSizeActive = true;

		// set custom refresh cascading filters function
		this._setFiltersRefreshCascadingInterceptor();

		// subscribe on location change.
		this.location = $izendaUrlService.location;
		this.location.subscribeOnNext(this._$onLocationChanged, this);

		// subscribe on window resize
		this.turnOnResizeHandler();

		// load some static stuff.
		this.loadAutoRefreshIntervals();
	}

	turnOnResizeHandler() {
		const resize = new this.$rx.Observable.fromEvent(this.$window, 'resize');
		const resizeDebounce = resize.debounce(500);
		const resizeCombined = this.$rx.Observable.merge(
			resize.map(e => ({ event: e, isDebounceApplied: false })),
			resizeDebounce.map(e => ({ event: e, isDebounceApplied: true }))
		);

		// combined resize events emitter (simple resize event will come earlier than it's debounced version)
		resizeCombined.subscribe(obj => {
			// if resize is turned off - do nothing
			if (!this.windowSizeActive)
				return;
			const isDebounceApplied = obj.isDebounceApplied;
			if (!isDebounceApplied) {
				//var overflowValue = angular.element('body').css('overflow');
				//if (overflowValue !== 'hidden') {
				//	angular.element('body').css('overflow', 'hidden');
				//}
			} else {
				// notify
				this.windowSize.onNext({
					width: this.$window.innerWidth,
					height: this.$window.innerHeight
				});
			}
		});
	}

	/**
	 * Change location to new dashboard
	 */
	navigateNewDashboard() {
		this.$izendaUrlService.setIsNew();
	}

	/**
	 * Change location to existing dashboard
	 * @param {string} dashboardFullName dashboard report set full name.
	 */
	navigateToDashboard(dashboardFullName) {
		this.$izendaUrlService.setReportFullName(dashboardFullName);
	}

	/**
	 * Save dashboard. If assigned new report name and category - navigation to the new dashboard will occur.
	 * @param {string} reportName New report name (optional). If not set - report will be saved using current report name.
	 * @param {string} categoryName New category name (optional). If not set (or reportName not set) - report
	 * will be saved using current category name.
	 * @throws {reject function} promise will reject with a message as argument if something went wrong.
	 */
	saveDashboard(reportName?: string, categoryName?: string): ng.IPromise<void> {
		return this.$q((resolve, reject) => {
			try {

				// prepare report name variables
				let newReportName = reportName || null;
				let newReportCategory = categoryName || null;
				let newReportFullName: string;
				if (this.$izendaUtilService.isUncategorized(newReportCategory))
					newReportCategory = null;
				if (newReportName) {
					// if name was set
					newReportFullName = this.$izendaUtilService.createReportFullName(newReportName,
						this.$izendaSettingsService.getCategoryCharacter(),
						newReportCategory);
				} else {
					// if name wasn't set
					const currentLocation = this.location.getValue();
					newReportName = currentLocation.name;
					newReportCategory = currentLocation.category;
					newReportFullName = currentLocation.fullName;
				}

				// update report names in the model
				const model: IzendaDashboardModel = this.model.getValue();
				model.reportCategory = newReportCategory;
				model.reportName = newReportName;
				model.reportFullName = this.$izendaSettingsService.getReportFullName(newReportName, newReportCategory);

				// create json and send save request
				const json = this.createJsonConfigForSend();
				this.$izendaDashboardQueryService.saveDashboardNew(json).then(() => {
					this.$izendaUrlService.setReportFullName(newReportFullName);
					resolve();
				}, (error) => {
					reject(error);
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Load tiles HTML content.
	 * @param {IzendaDashboardTileModel} tile Tile object.
	 * @param {object} size {width, height} object.
	 */
	loadTilesPreview(tile, size) {
		return this.$q((resolve, reject) => {
			try {
				const sizeObject = size || { width: 0, height: 0 };
				const json = this.createJsonConfigForSend();
				this.$izendaDashboardQueryService.loadTilesPreviewNew(json, tile, sizeObject)
					.then(result => resolve(result), error => reject(error));
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Load and prepare report into container
	 * @param {string} report html data.
	 * @param {jquery dom element} container.
	 */
	loadReportIntoContainer(htmlData, $container) {
		const customCssStart = '/*CustomCssStart*/';
		const customCssEnd = '/*CustomCssEnd*/';

		/**
		 * Extract custom css rules
		 */
		const extractCustomCss = html => {
			if (!angular.isFunction(CSSParser))
				throw 'Css parser (cssParser.js) not found';
			const startIndex = html.indexOf(customCssStart);
			const endIndex = html.indexOf(customCssEnd);
			if (startIndex < 0 || endIndex < 0 || startIndex > endIndex)
				return null;
			try {
				const customCss = html.substring(startIndex + customCssStart.length, endIndex);
				const parser = new CSSParser();
				const sheet = parser.parse(customCss, false, true);
				return sheet;
			} catch (e) {
				return null;
			}
		};

		/**
		 * Inject custom css
		 */
		const injectCustomCss = (html, customCss) => {
			const startIndex = html.indexOf(customCssStart);
			const endIndex = html.indexOf(customCssEnd);
			if (startIndex < 0 || endIndex < 0 || startIndex > endIndex)
				return null;
			const result = [
				html.substring(0, startIndex),
				customCssStart,
				customCss,
				customCssEnd,
				html.substring(endIndex + customCssStart.length)
			].join('');
			return result;
		};

		/**
		 * Change rules
		 */
		const replaceCssRules = (sourceStyleSheet, selectorTextChangeFunction) => {
			const cssRules = sourceStyleSheet.cssRules;
			cssRules.forEach(rule => {
				if (rule.type === 1) {
					const selector = rule.mSelectorText;
					rule.mSelectorText = selectorTextChangeFunction(selector);
				} else if (rule.type === 4) {
					replaceCssRules(rule, selectorTextChangeFunction);
				}
			});
		};

		try {
			var tileId = $container.closest('.izenda-report-with-id').attr('reportid');
			// clear previous content
			$container.empty();

			// turn off internal visualization window resize handler.
			izenda.visualization.isResizeHandlerEnabled = false;

			// load response to container
			if (angular.isObject(htmlData) && htmlData.hasOwnProperty('message')) {
				console.error(htmlData);
				izenda.report.loadReportResponse(htmlData['message'], $container);
			} else
				izenda.report.loadReportResponse(htmlData, $container);

			// replace CSS
			const $customCss = $container.find('style[id=additionalStyle]');
			if ($customCss.length > 0) {
				const csshtml = $customCss.html();
				const styleSheet = extractCustomCss(csshtml);
				if (styleSheet) {
					// replace rule selectors:
					replaceCssRules(styleSheet,
						selector => {
							const parts = selector.split(',');
							let result = '';
							parts.forEach(function (part, index) {
								if (index > 0)
									result += ', ';
								result += `.izenda-report-with-id[reportid="${tileId}"] ${part.trim()}`;
							});
							return result;
						});
				}
				const newCss = styleSheet.cssText();
				const newHtml = injectCustomCss(csshtml, newCss);
				$customCss.html(newHtml);
			}

			$container.find('[id$=_outerSpan]').css('display', 'block');
			// prepare content div
			const divs$ = $container.find('div.DashPartBody, div.DashPartBodyNoScroll');
			if (divs$.length > 0) {
				divs$.css('height', 'auto');
				divs$.find('span').each(function (iSpan, span) {
					const $span = angular.element(span);
					if ($span.attr('id') && String($span.attr('id')).indexOf('_outerSpan') >= 0) {
						$span.css('display', 'inline');
					}
				});
				const $zerochartResults = divs$.find('.iz-zero-chart-results');
				if ($zerochartResults.length > 0) {
					$zerochartResults.closest('table').css('height', '100%');
					divs$.css('height', '100%');
				}
			}
			// init gauge
			if (angular.isDefined(AdHoc) &&
				angular.isObject(AdHoc.Utility) &&
				angular.isFunction(AdHoc.Utility.InitGaugeAnimations)) {
				AdHoc.Utility.InitGaugeAnimations(null, null);
			}
		} catch (e) {
			$container.empty();
			const failedMsg = this.$izendaLocaleService.localeText('js_FailedToLoadReport', 'Failed to load report') + ': ' + e;
			$container.append(`<b>${failedMsg}</b>`);
			console.error(failedMsg);
		}
	}

	/**
	 * Print dashboard
	 * @param {string} type
	 */
	printDashboard(type, reportForPrint?) {
		this.exportProgress.onNext('print');
		return this.$q((resolve, reject) => {
			const resolveWrapper = () => {
				this.exportProgress.onNext(null);
				resolve();
			};
			const rejectWrapper = (error) => {
				this.exportProgress.onNext(null);
				reject(error);
			};

			if (type !== 'html' && type !== 'pdf' && type !== 'excel') {
				rejectWrapper(`Unknown print type: ${type}`);
				return;
			}

			const json = this.createJsonConfigForSend();
			this.$izendaDashboardQueryService.syncTilesNew(json, reportForPrint).then(() => {
				if (type === 'html')
					this.printDashboardAsHtml(reportForPrint).then(() => resolveWrapper(), error => rejectWrapper(error));
				else if (type === 'excel')
					this.printDashboardAsExcel(reportForPrint).then(() => resolveWrapper(), error => rejectWrapper(error));
				else if (type === 'pdf')
					this.printDashboardAsPDF(reportForPrint).then(() => resolveWrapper(), error => rejectWrapper(error));
			},
				error => rejectWrapper(error));
		});
	}

	/**
	 * Open new window with the new dashboard for printing.
	 * @param {string} reportForPrint report part. Only one report will be printed if defined.
	 */
	printDashboardAsHtml(reportForPrint) {
		return this.$q((resolve, reject) => {
			try {
				var printUrl = `${this.$izendaUrlService.settings.urlRsPage}?p=htmlreport&print=1`;
				// print single tile if parameter is set:
				if (angular.isString(reportForPrint) && reportForPrint !== '')
					printUrl += `&reportPartName=${encodeURIComponent(reportForPrint)}`;

				// izpid and anpid will be added inside the ExtendReportExport method 
				this.$timeout(() => {
					let newWindow = ExtendReportExport(responseServer.OpenUrl, printUrl, 'aspnetForm', '', '', true);
					if ('WebkitAppearance' in document.documentElement.style) {
						let intervalId = this.$interval(() => {
							if (!newWindow || newWindow.closed) {
								this.$interval.cancel(intervalId);
								intervalId = null;
								resolve();
							}
						}, 500);
					} else {
						resolve();
					}
				}, 500);
			} catch (e) {
				console.error(e);
				reject(e);
			}
		});
	}

	/**
	 * Export dashboard to file
	 * @param {string} outputType output type query parameter
	 * @param {string} reportForPrint report part. Only one report will be printed if defined.
	 */
	printDashboardAsFile(outputType, reportForPrint) {
		if (!outputType)
			throw 'Parameter "outputType" should be defined';
		return this.$q((resolve, reject) => {
			try {
				let addParam = '';
				if (typeof (window.izendaPageId$) !== 'undefined')
					addParam += `&izpid=${window.izendaPageId$}`;
				if (typeof (window.angularPageId$) !== 'undefined')
					addParam += `&anpid=${window.angularPageId$}`;

				let url = this.$izendaUrlService.settings.urlRsPage + '?';
				if (reportForPrint)
					url += `rpn=${reportForPrint}&`;
				url += `output=${outputType}${addParam}`;

				// download the file
				this.$izendaRsQueryService.downloadFileRequest('GET', url).then(() => resolve());
			} catch (e) {
				console.error(e);
				reject(e);
			}
		});
	}

	/**
	 * Export dashboard tile as excel
	 * @param {string} reportForPrint report part. Only one report will be printed if defined.
	 */
	printDashboardAsExcel(reportForPrint) {
		return this.printDashboardAsFile('XLS(MIME)', reportForPrint);
	}

	/**
	 * Print dashboard into PDF
	 * @param {string} reportForPrint report part. Only one report will be printed if defined.
	 */
	printDashboardAsPDF(reportForPrint) {
		return this.printDashboardAsFile('PDF', reportForPrint);
	}

	/**
	 * Send email
	 */
	sendEmail(sendType, email) {
		return this.$q((resolve, reject) => {
			try {
				const json = this.createJsonConfigForSend();
				this.$izendaDashboardQueryService.sendReportViaEmailNew(json, sendType, email)
					.then(result => resolve(result), error => reject(error));
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Turn on/off filters panel.
	 * @param {any} opened
	 */
	toggleFiltersPanel(opened?) {
		const currentOpened = this.isFiltersActive.getValue();
		if (angular.isDefined(opened)) {
			if (currentOpened != opened)
				this.isFiltersActive.onNext(opened);
		} else {
			this.isFiltersActive.onNext(!currentOpened);
		}
	}

	/**
	 * Update dashboard filters
	 */
	refreshFilters() {
		const json = this.createJsonConfigForSend();
		this.$izendaDashboardQueryService.syncFiltersNew(json).then(filtersData => {
			this._setFiltersData(filtersData);
		},
			error => {
				console.error('Failed to get filters data: ', error);
			});
	}

	/**
	 * Refresh dashboard
	 * @param {boolean} reloadLayout reload dashboard layout from the server.
	 * @param {boolean} updateFromSource update tiles from it's sources.
	 * @param {IzendaDashboardTileModel} tile update only one tile.
	 */
	refreshDashboard(reloadLayout, updateFromSource, tile?) {
		if (reloadLayout) {
			this._$onLocationChanged(this.location.getValue(), !!updateFromSource);
		} else {
			this.refreshObservable.onNext({
				tile: tile || null,
				updateFromSource: !!updateFromSource
			});
		}
	}

	/**
	 * Cancels refresh dashboard queries
	 */
	cancelRefreshDashboardQueries() {
		this.$izendaRsQueryService.cancelAllQueries({
			cancelList: [
				{
					wscmd: 'getDashboardTilePreviewNew'
				}
			]
		});
	}

	/**
	 * Load auto refresh intervals config. After complete this.autoRefresh is notified
	 */
	loadAutoRefreshIntervals() {
		var newAutoRefresh = {
			intervals: []
		};
		this.$izendaDashboardQueryService.loadAutoRefreshIntervalsNew().then(data => {
			for (let name in data)
				if (data.hasOwnProperty(name))
					newAutoRefresh.intervals.push({ name: name, value: data[name], selected: false });
			this.autoRefresh.onNext(newAutoRefresh, this);
		});
	}

	/**
	 * Turn on window resize handler event emitter
	 */
	turnOnWindowResizeHandler() {
		this.windowSizeActive = true;
	}

	/**
	 * Turn off window resize handler event emitter
	 */
	turnOffWindowResizeHandler() {
		this.windowSizeActive = false;
	}

	/**
	 * Create json config
	 */
	private createJsonConfigForSend(): any {
		// create json for sending to server
		const model: IzendaDashboardModel = this.model.getValue();
		const scheduleJson = this.$izendaScheduleService.getScheduleConfigForSend();
		const shareJson = this.$izendaShareService.getShareConfigForSend();

		// legacy API call.
		let filtersJson = [];
		if (angular.isFunction(GetDataToCommit))
			filtersJson = GetDataToCommit();
		let filtersRaw = new IzendaFiltersModel();
		filtersRaw.fromJson({
			FilterLogic: '',
			Filters: filtersJson,
			SubreportsFilters: []
		});

		const json = model.toJson();
		json.share = shareJson;
		json.schedule = scheduleJson;
		json.filters = filtersRaw.toJson();
		return json;
	}

	/**
	 * Calculate category name
	 */
	_getWantedCategoryName() {
		const urlFullName = this.location.getValue().fullName;
		const categories = this.categories.getValue();
		const isUrlFullNameExist =
			testFullName => categories.some(cat => cat.dashboards.some(dashName => dashName === testFullName));
		// calc current dashboard category
		let currentCategoryName = '';
		let isCategorySet = false;
		if (isUrlFullNameExist(urlFullName)) {
			currentCategoryName = this.location.getValue().category;
			isCategorySet = true;
		}
		if (!isCategorySet && this.$izendaDashboardConfig.defaultDashboardCategory !== null) {
			currentCategoryName = this.$izendaDashboardConfig.defaultDashboardCategory;
			isCategorySet = true;
		}
		if (!isCategorySet) {
			const uncategorized = categories.first(cat => this.$izendaUtilService.isUncategorized(cat.name));
			if (uncategorized)
				currentCategoryName = uncategorized.name; // if we have "uncategorized" dashboards - select it
			else
				currentCategoryName = categories.length ? categories[0].name : '';
		}
		return currentCategoryName;
	}

	/**
	 * Check report name obtained from the 'rn' parameter and load default dashboard if rn parameter doesn't
	 * contain valid dashboard name.
	 * @param {object} location Location object.
	 * @returns {string} fixed dashboard full name (or empty string if can't find default dashboard).
	 */
	_getWantedReportFullName(location) {
		const urlFullName = location.fullName;
		const categories = this.categories.getValue();
		const isUrlFullNameExist =
			testFullName => categories.some(cat => cat.dashboards.some(dashName => dashName === testFullName));

		// calc current dashboard category
		const currentCategoryName = this._getWantedCategoryName();

		// calc current dashboard full name
		let currentDashboardFullName = '';
		let isCurrentDashbiardNameSet = false;
		if (isUrlFullNameExist(urlFullName)) {
			currentDashboardFullName = urlFullName;
			isCurrentDashbiardNameSet = true;
		}
		if (!isCurrentDashbiardNameSet && this.$izendaDashboardConfig.defaultDashboardName !== null) {
			currentDashboardFullName = this.$izendaDashboardConfig.defaultDashboardName;
			if (currentDashboardFullName && currentCategoryName && !this.$izendaUtilService.isUncategorized(currentCategoryName)) {
				currentDashboardFullName =
					currentCategoryName + this.$izendaSettingsService.getCategoryCharacter() + currentDashboardFullName;
			}
			isCurrentDashbiardNameSet = true;
		}

		// couldn't find dashboard - use first
		if (!isCurrentDashbiardNameSet) {
			const defaultCats = categories.filter(cat => cat.dashboards.length);
			currentDashboardFullName = defaultCats.length ? defaultCats[0].dashboards[0] : '';
		}

		return currentDashboardFullName;
	}

	/**
	 * Update dashboards in current category collection and current active dashboard
	 */
	_updateCurrentCategory() {
		const categories = this.categories.getValue();
		const currentCategoryName = this._getWantedCategoryName();
		const currentDashboardName = this._getWantedReportFullName(this.location.getValue());
		const category = categories.first(cat => currentCategoryName === cat.name ||
			(this.$izendaUtilService.isUncategorized(currentCategoryName) && this.$izendaUtilService.isUncategorized(cat.name)));
		var currentDashboardsCollection = [];
		var currentDashboard = null;
		if (category) {
			category.dashboards.forEach((dash, iDash) => {
				const dashObj = {
					id: iDash,
					fullName: dash,
					text: this.$izendaUrlService.extractReportName(dash)
				};
				currentDashboardsCollection.push(dashObj);

				if (this.location.getValue().isNew)
					return;
				if (dash === currentDashboardName)
					currentDashboard = dashObj;
			});
		}
		this.currentCategory.onNext(currentDashboardsCollection);
		this.currentDashboard.onNext(currentDashboard);
	}

	/**
	 * Location changed handler:
	 * 1. Load categories.
	 * 2. Create/Open dashboard.
	 * 3. Navigate to default dashboard if something went wrong (dashboard not exists, or url parameters not set).
	 * @param {object} newLocation location info object
	 * @param {boolean} updateFromSource is reload tiles from its sources required?
	 */
	_$onLocationChanged(newLocation, updateFromSource) {
		this.$izendaRsQueryService.cancelAllQueries();
		this.model.onNext(null);
		this._loadCategories().then(() => {
			if (newLocation.isNew) {
				this._newDashboard();
				return;
			}
			// validate report full name:
			const wantedFullName = this._getWantedReportFullName(newLocation);
			if (!wantedFullName) {
				this.navigateNewDashboard(); // change url to "?isNew=1"
				return;
			}
			if (newLocation.fullName === wantedFullName) {
				// wanted report and report from the location are the same - open dashboard.
				this.loadDashboardInternal(wantedFullName, !!updateFromSource);
			} else {
				if (newLocation.fullName) {
					// show notification to a user if we change the location from wrong report to default.
					let message = this.$izendaLocaleService.localeText('js_FailedToLoadDashboard',
						'Failed to load dashboard "{0}". Opening default dashboard "{1}".');
					message = message.replace('{0}', newLocation.fullName);
					message = message.replace('{1}', wantedFullName);
					this.$izendaUtilUiService.showNotification(message);
				}
				this.navigateToDashboard(wantedFullName); // change url to "?rn=default_dashboard"
			}
		});
	}

	/**
	 * Load dashboard categories
	 */
	_loadCategories() {
		return this.$q((resolve, reject) => {
			this.$izendaDashboardQueryService.loadDashboardNavigationNew().then(
				(data) => {
					if (!data) {
						reject(`Failed to load dashboard categories. Result: ${data}`);
						return;
					}
					let idCounter = 0;
					const newCategories: any = [];
					for (let category in data) {
						if (data.hasOwnProperty(category)) {
							let dashboards = data[category];
							if (dashboards.length > 0) {
								dashboards = dashboards.filter(dash => dash && dash !== '');
								const item = {
									id: idCounter++,
									name: category,
									dashboards: dashboards
								};
								// sort 
								if (angular.isFunction(this.$izendaDashboardConfig.dashboardToolBarItemsSort))
									item.dashboards.sort((item1, item2) => this.$izendaDashboardConfig.dashboardToolBarItemsSort(item1, item2));
								newCategories.push(item);
							}
						}
					}
					this.categories.onNext(newCategories, this);
					resolve(this.categories);
				},
				error => {
					var errorMessage =
						this.$izendaLocaleService.localeText('js_DashboardLoadCatsError', 'Failed to get dashboard categories');
					reject(`${errorMessage}: ${error}`);
				});
		});
	}

	_setFiltersRefreshCascadingInterceptor() {
		window.cascadingFiltersChangedCustomContext = this;
		// turn off legacy filters queries: we'll do it by ourselves.
		window.cascadingFiltersChangedCustom = () => {
			if (angular.isFunction(CascadingFiltersChanged)) {
				window.refreshFiltersLastGUID = GenerateGuid();
				const json = this.createJsonConfigForSend();
				this.$izendaDashboardQueryService.syncFiltersNew(json).then(filtersData => {
					CascadingFiltersChanged(filtersData, `refreshcascadingfilters-${window.refreshFiltersLastGUID}`);
				});
			}
		};
	}

	_setFiltersData(filtersData) {
		// set legacy filters from response
		if (angular.isFunction(GotFiltersData)) {
			GotFiltersData(
				angular.isObject(filtersData)
					? filtersData
					: {
						Filters: [],
						SubreportsFilters: [],
						FilterLogic: ''
					},
				'getfiltersdata');
		}
	}

	/**
	 * Load dashboard config from the server and fill dashboard model.
	 * @param {string} reportFullName dashboard report full name.
	 * @param {boolean} updateFromSource is reload tiles from its sources required?
	 */
	private loadDashboardInternal(reportFullName, updateFromSource) {
		this._updateCurrentCategory(); // update category objects

		// start loading
		this.isLoaded.onNext(false, this);
		this.$izendaDashboardQueryService.loadDashboardNew(reportFullName, !!updateFromSource).then(dashboardModel => {
			if (!angular.isObject(dashboardModel))
				throw `Failed to load dashboard '${reportFullName}'`;

			// set current rights
			this.$izendaCompatibilityService.setRights(dashboardModel.effectiveRights);
			this.$izendaCompatibilityService.setUsesHiddenColumns(dashboardModel.usesHiddenColumns);

			// update names
			dashboardModel.reportFullName = this.$izendaSettingsService.getReportFullName(dashboardModel.reportName, dashboardModel.reportCategory);
			dashboardModel.tiles.forEach(tile => {
				tile.reportName = this.$izendaUrlService.extractReportName(tile.reportSetName);
				tile.reportCategory = this.$izendaUrlService.extractReportCategory(tile.reportSetName);
			});

			// set legacy filters from response
			this._setFiltersData(dashboardModel.filters);

			// notify that model was changed and report was loaded
			this.model.onNext(dashboardModel, this);

			// show hidden columns warning
			if (this.$izendaCompatibilityService.isUsesHiddenColumns()) {
				this.$izendaUtilUiService.showMessageDialog(
					this.$izendaLocaleService.localeText(
						'js_dashboardUsesHiddenColumns',
						'Dashboard contains tile with report which contains unavailable fields. Please re-save original report or chose another one.'));
			}

			this.isLoaded.onNext(true, this);

		}, error => {
			const errorMessage = this.$izendaLocaleService.localeText('js_LayoutLoadError', 'Failed to load dashboard layout');
			this.$izendaUtilUiService.showErrorDialog(`${errorMessage}: ${error}`);
		});
	}

	/**
	 * Create new dashboard.
	 */
	_newDashboard() {
		this._updateCurrentCategory(); // update category objects

		this.$izendaCompatibilityService.setRights('Full Access');
		const newModelInstance = IzendaDashboardModel.createInstance(true);
		const schedulePromise = this.$izendaScheduleService.setScheduleConfig(null);
		const sharePromise = this.$izendaShareService.setShareConfig(null);
		this.$q.all([schedulePromise, sharePromise]).then(() => {
			this.model.onNext(newModelInstance, this);
			this.isLoaded.onNext(true, this);
		});
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaDashboardStorageService', DashboardStorageService.injectModules.concat(DashboardStorageService));
	}
}
