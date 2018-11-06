import 'izenda-external-libs';
import * as angular from 'angular';
import IzendaUrlService from 'common/query/services/url-service';
import { IzendaDashboardGalleryStateModel } from 'dashboard/model/gallery-state-model';

export default class DashboardGalleryService {
	$galleryState: any;
	location: any;
	galleryState: IzendaDashboardGalleryStateModel;

	constructor(
		private readonly $rx: any,
		private readonly $izendaUrl: IzendaUrlService) {
		this.galleryState = new IzendaDashboardGalleryStateModel();
		// subscibe on location change.
		this.location = this.$izendaUrl.location;
		this.location.subscribeOnNext(this.$onLocationChanged, this);
	}

	$onLocationChanged(newLocation) {
		this.galleryState.reset();
	}

	static get injectModules(): any[] {
		return ['rx', '$izendaUrl'];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaGalleryService', DashboardGalleryService.injectModules.concat(DashboardGalleryService));
	}
}
