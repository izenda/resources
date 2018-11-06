import * as angular from 'angular';
import 'izenda-external-libs';

/**
 * Dashboard storage service. Stores current dashboard state.
 */
export default class DashboardBackgroundService {
	hueRotate: boolean;

	constructor(
		private readonly rx: any,
		private readonly $cookies: any) {
		this.hueRotate = false;
	}

	get finalBackgroundImageUrl(): string {
		return this.backgroundImageType === 'file'
			? this.backgroundImageBase64
			: this.backgroundImageUrl;
	}

	// hueRotate get/set

	get backgroundHueRotate(): boolean {
		return this.hueRotate;
	}

	set backgroundHueRotate(val: boolean) {
		this.hueRotate = val;
	}

	// color get/set

	get backgroundColor(): string {
		const backColor = this.getCookie('izendaDashboardBackgroundColor');
		return backColor || '#1c8fd6';
	}

	set backgroundColor(val: string) {
		this.setCookie('izendaDashboardBackgroundColor', val);
	}

	// image repeat get/set

	get backgroundImageRepeat(): boolean {
		return this.getCookie('izendaDashboardBackgroundImageRepeat') === 'true';
	}

	set backgroundImageRepeat(val: boolean) {
		this.setCookie('izendaDashboardBackgroundImageRepeat', val ? 'true' : 'false');
	}

	// backgroundImageType get/set

	get backgroundImageType(): string {
		return this.getCookie('izendaDashboardBackgroundImageType');
	}

	set backgroundImageType(val: string) {
		this.setCookie('izendaDashboardBackgroundImageType', val);
	}

	// backgroundImageBase64 get/set

	get backgroundImageBase64(): string {
		let result = '';
		if (this.isStorageAvailable()) {
			const dataImage = localStorage.getItem('izendaDashboardBackgroundImageBase64');
			if (angular.isString(dataImage))
				result = dataImage;
		} else {
			this.getCookie('izendaDashboardBackgroundImageBase64');
		}
		return result;
	}

	set backgroundImageBase64(val: string) {
		if (this.isStorageAvailable()) {
			if (val != null)
				localStorage.setItem('izendaDashboardBackgroundImageBase64', val);
			else
				localStorage.removeItem('izendaDashboardBackgroundImageBase64');
		} else {
			this.setCookie('izendaDashboardBackgroundImageBase64', val);
		}
	}

	// image url get/set

	get backgroundImageUrl(): string {
		return this.getCookie('izendaDashboardBackgroundImageUrl');
	}

	set backgroundImageUrl(val: string) {
		this.setCookie('izendaDashboardBackgroundImageUrl', val);
	}

	// utility functions

	getCookie(name): string {
		return this.$cookies.get(name);
	}

	setCookie(name: string, value: string) {
		this.$cookies.put(name, value);
	}

	isStorageAvailable(): boolean {
		return typeof (Storage) !== 'undefined';
	}

	static get injectModules(): any[] {
		return ['rx', '$cookies', '$rootScope'];
	}

	/**
	 * Angular dependencies
	 */
	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaBackgroundService', DashboardBackgroundService.injectModules.concat(DashboardBackgroundService));
	}
}
