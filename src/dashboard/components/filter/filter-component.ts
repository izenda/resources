import 'izenda-external-libs';
import IzendaComponent from 'common/core/tools/izenda-component';
import izendaDashboardModule from 'dashboard/module-definition';
import IzendaUrlService from 'common/query/services/url-service';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';


/**
 * <izenda-dashboard-filters> component
 */
@IzendaComponent(
	izendaDashboardModule,
	'izendaDashboardFilters',
	['rx', '$window', '$timeout', '$element', '$izendaUrlService', '$izendaDashboardStorageService'],
	{
		templateUrl: '###RS###extres=components.dashboard.components.filter.filter-template.html',
		bindings: {}
	})
export class IzendaDashboardFiltersComponent implements ng.IComponentController {
	isFiltersActive: any;
	subscriptions: any;

	constructor(
		private readonly $rx: any,
		private readonly $window: ng.IWindowService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $element: ng.IAugmentedJQuery,
		private readonly $izendaUrlService: IzendaUrlService,
		private readonly $izendaDashboardStorageService: DashboardStorageService) {

		this.$window.useGetRenderedReportSetForFilters = false;
		this.isFiltersActive = this.$izendaDashboardStorageService.isFiltersActive.getValue();
		// subscribe
		this.subscriptions = [
			this.$izendaDashboardStorageService.isFiltersActive.subscribeOnNext(this.$onFiltersActiveChange, this)
		];
	}

	$onInit() {
		IzLocal.LocalizePage();
		this.setRefreshButtonHandler();
	}

	$onDestroy() {
		this.subscriptions.forEach(sub => sub.dispose());
	}

	/**
	 * Filters panel on/off handler
	 * @param {boolean} isFiltersActive new panel state.
	 */
	$onFiltersActiveChange(isFiltersActive) {
		this.isFiltersActive = isFiltersActive;
	}

	/**
	 * Add "update" button handler
	 */
	setRefreshButtonHandler() {
		var $btn = this.$element.find('.filters-legacy-update-btn');
		if (!$btn.length)
			return;
		const clicks = this.$rx.Observable.fromEvent($btn.get(0), 'click');
		const clicksThrottle = clicks.debounce(500);
		// do merge to ensure that the handlers order will be correct
		this.$rx.Observable.merge(
			clicks.map(e => ({ event: e, isThrottleApplied: false })),
			clicksThrottle.map(e => ({ event: e, isThrottleApplied: true })))
			.subscribe(obj => {
				obj.event.preventDefault();
				const isThrottleApplied = obj.isThrottleApplied;
				if (!isThrottleApplied) {
					// fast clicks handler (always runs before the handler with the enabled throttle condition)
					$btn.children('a').removeClass('blue');
					$btn.children('a').addClass('gray');
					this.$izendaDashboardStorageService.cancelRefreshDashboardQueries();
				} else {
					// run refresh when throttling is done.
					$btn.children('a').removeClass('gray');
					$btn.children('a').addClass('blue');
					this.$timeout(() => {
						this.$izendaDashboardStorageService.refreshDashboard(false, false);
					}, 100);
				}
			});
	}
}

