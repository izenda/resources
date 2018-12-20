import * as angular from 'angular';
import 'izenda-external-libs';
import { IzendaSelectItemModel } from 'common/core/models/select-item-model';
import { IzendaShareModel } from 'common/core/models/share-model';
import { IzendaShareRuleModel } from 'common/core/models/share-model';
import IzendaCommonQueryService from 'common/query/services/common-query-service';

/**
 * Service used for store data in share control
 */
export default class IzendaShareService {

	rights: Array<IzendaSelectItemModel>;
	subjects: Array<IzendaSelectItemModel>;
	shareModel: IzendaShareModel;

	static get injectModules(): any[] {
		return ['$q', '$izendaCommonQueryService'];
	}

	constructor(
		private readonly $q: ng.IQService,
		private readonly $izendaCommonQueryService: IzendaCommonQueryService) {
		this.reset();
	}

	/**
	 * Add new empty share rule.
	 */
	addNewShareRule() {
		const shareRuleModel = new IzendaShareRuleModel(this.subjects);
		this.shareModel.shareRules.push(shareRuleModel);
	}

	/**
	 * Remove share rule
	 * @param {Core.IzendaShareRuleModel} shareRule Share rule for removal.
	 */
	removeShareRule(shareRule: IzendaShareRuleModel) {
		if (!shareRule)
			return;
		const idx = this.shareModel.shareRules.indexOf(shareRule);
		this.shareModel.shareRules.splice(idx, 1);
	}

	/**
	 * Create current scheule config json for send to server.
	 * @return {any} Raw model for sending to server.
	 */
	getShareConfigForSend(): any {
		return this.shareModel.toJson();
	}

	/**
	 * Set current share config.
	 * @param {any} json Share model raw object.
	 * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
	 */
	setShareConfig(json: any): ng.IPromise<void> {
		var isDefaultConfig = !json;
		this.reset();
		return this.$q(resolve => {
			this.fillShareConfigFromJson(json, isDefaultConfig).then(() => resolve());
		});
	}

	/**
	 * Set share service state from the config object.
	 * @param {any} json Share model raw object.
	 * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
	 */
	private fillShareConfigFromJson(json: any, isDefaultConfig: boolean): ng.IPromise<void> {
		return this.$q(resolve => {
			this.loadShareData().then(() => {
				if (isDefaultConfig) {
					json = [{
						subject: 'Everyone',
						right: 'None'
					}];
				}
				this.shareModel = new IzendaShareModel();
				this.shareModel.fromJson(json, this.rights, this.subjects);
				resolve();
			});
		});

	}

	/**
	 * Load share data and available values from server.
	 * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
	 */
	private loadShareData(): ng.IPromise<void> {
		return this.$q(resolve => {

			this.$izendaCommonQueryService.getShareData().then(json => {
				// fill available rights collection
				this.rights = json.Rights.map(rightJson => new IzendaSelectItemModel(rightJson.Text, rightJson.Value));

				// fill available subjects collection
				this.subjects = json.ShareWith.map(subjectJson => new IzendaSelectItemModel(subjectJson.Text, subjectJson.Value));

				resolve();
			});
		});
	}

	/**
	 * Set default values.
	 */
	private reset(): void {
		this.rights = new Array<IzendaSelectItemModel>();
		this.subjects = new Array<IzendaSelectItemModel>();
		this.shareModel = new IzendaShareModel();
	}

	/**
	 * Angular dependencies
	 */
	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaShareService', IzendaShareService.injectModules.concat(IzendaShareService));
	}
}
