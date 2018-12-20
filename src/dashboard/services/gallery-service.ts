import 'izenda-external-libs';
import * as angular from 'angular';
import IzendaUrlService from 'common/query/services/url-service';
import { IzendaDashboardGalleryStateModel } from 'dashboard/model/gallery-state-model';

export default class DashboardGalleryService {
	$galleryState: any;
	location: any;
	galleryState: IzendaDashboardGalleryStateModel;

	static get injectModules(): any[] {
		return ['$izendaUrlService'];
	}

	constructor(
		private readonly $izendaUrlService: IzendaUrlService) {
		this.galleryState = new IzendaDashboardGalleryStateModel();
		// subscibe on location change.
		this.location = this.$izendaUrlService.location;
		this.location.subscribeOnNext(this.$onLocationChanged, this);
	}

	$onLocationChanged(newLocation) {
		this.galleryState.reset();
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaGalleryService', DashboardGalleryService.injectModules.concat(DashboardGalleryService));
	}
}
