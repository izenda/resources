import * as angular from 'angular';

// ReSharper disable once InconsistentNaming
export default function IzendaComponent(moduleOrName: string | ng.IModule,
	selector: string,
	dependencies: any[],
	options: {
		template?: string,
		templateUrl?: string,
		bindings?: any,
		controller?: any,
	}) {
	return (controller: Function) => {
		const module = typeof (moduleOrName) === 'string' ? angular.module(moduleOrName) : moduleOrName;
		const extendedOptions: ng.IComponentOptions = angular.copy(options);

		var $inject = controller.$inject = dependencies;
		controller.prototype.$inject = $inject;
		controller.$inject = $inject;

		extendedOptions.controller = dependencies.concat(controller);
		module.component(selector, extendedOptions);
	}
}