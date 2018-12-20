import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaCommonQueryService from 'common/query/services/common-query-service';

export default class IzendaPingService {

	private readonly minute: number;
	private readonly defaultTimeout: number;
	private timeout: number;
	private pingTimer: any;

	static get injectModules(): any[] {
		return ['$timeout', '$izendaCommonQueryService'];
	}

	constructor(
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaCommonQueryService: IzendaCommonQueryService) {
		this.minute = 60 * 1000;
		this.defaultTimeout = 15 * this.minute; // default timeout - 15 minutes.
		this.timeout = -1;
		this.pingTimer = null;
	}

	/**
	 * Stop ping queries
	 */
	stopPing() {
		if (this.pingTimer !== null) {
			this.$timeout.cancel(this.pingTimer);
			this.pingTimer = null;
		}
	}

	/**
	 * Make ping iteration and create timeout for next iteration.
	 */
	ping() {
		// cancel previous timer:
		this.stopPing();

		// hint: start immediately if timeout variable wasn't set.
		this.pingTimer = this.$timeout(() => {
			this.$izendaCommonQueryService.ping().then(data => {
				// set timeout
				this.timeout = (data > 0)
					? Math.round(data * 0.75 * this.minute)
					: this.defaultTimeout;
				this.ping();
			});
		},
			this.timeout >= 0 ? this.timeout : 0);
	}

	/**
	 * Start ping queries
	 */
	startPing() {
		this.ping();
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaPingService', IzendaPingService.injectModules.concat(IzendaPingService));
	}
}
