import * as angular from 'angular';
import 'izenda-external-libs';

export default class IzendaEventService {
	private readonly events: any = {};

	static get injectModules(): any[] {
		return ['$rootScope', '$log'];
	}

	constructor(
		private readonly $rootScope: ng.IRootScopeService,
		private readonly $log: ng.ILogService) { }

	/**
	 * Add event to queue. 
	 */
	queueEvent(eventName: string, eventArguments: any[], clearQueue: boolean) {
		if (!(eventName in this.events) || clearQueue) {
			this.events[eventName] = [];
		}
		const eventRecord = {
			args: eventArguments
		};
		this.events[eventName].push(eventRecord);
		this.$log.debug(`event "${eventName}" queued`);
		this.$rootScope.$broadcast(eventName, eventArguments);
	}

	/**
	 * Retrieve event record from queue and return it's record.
	 */
	handleQueuedEvent(eventName: string, scope: any, eventContext: any, eventHandler: any) {
		if (!angular.isFunction(eventHandler))
			throw 'eventHandler should be a function';
		if (!(eventName in this.events) || !angular.isArray(this.events[eventName]))
			this.events[eventName] = [];

		while (this.events[eventName].length > 0) {
			const eventRecord = this.events[eventName].shift();
			this.$log.debug(`event "${eventName}" run from queue`);
			eventHandler.apply(eventContext, eventRecord.args);
		}

		// start handling event using angular events.
		if (scope.$$listeners) {
			const eventArr = scope.$$listeners[eventName];
			if (eventArr) {
				for (let i = 0; i < eventArr.length; i++) {
					if (eventArr[i] === eventHandler) {
						eventArr.splice(i, 1);
					}
				}
			}
		};
		scope.$on(eventName, (event, args) => {
			this.$log.debug(`event "${eventName}" run from $on`);
			this.events[eventName] = [];
			eventHandler.apply(eventContext, args);
		});
	}

	/**
	 * Clear all queued events (for manual $broadcast handling)
	 */
	clearEventQueue(eventName) {
		this.events[eventName] = [];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaEventService', IzendaEventService.injectModules.concat(IzendaEventService));
	}
}
