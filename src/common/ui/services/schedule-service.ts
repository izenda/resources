import * as angular from 'angular';
import 'izenda-external-libs';
import { IzendaScheduleModel } from 'common/core/models/schedule-model';
import { IzendaSelectItemModel } from 'common/core/models/select-item-model';
import IzendaCommonQueryService from 'common/query/services/common-query-service';

export default class IzendaScheduleService {

	scheduleConfig: IzendaScheduleModel;
	timezones: IzendaSelectItemModel[];
	sendEmailTypes: IzendaSelectItemModel[];
	repeatTypes: IzendaSelectItemModel[];

	static get injectModules(): any[] {
		return ['$q', '$izendaCommonQueryService'];
	}

	constructor(
		private readonly $q: ng.IQService,
		private readonly $izendaCommonQueryService: IzendaCommonQueryService) {
		this.reset();
	}

	/**
	 * Create current scheule config json for send to server.
	 * @return {any} Raw model for sending to server.
	 */
	getScheduleConfigForSend(): any {
		return this.scheduleConfig.toJson();
	}

	/**
	 * Set current schedule config.
	 * @param {any} json schedule raw model.
	 * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
	 */
	setScheduleConfig(json: any): ng.IPromise<void> {
		this.reset();
		return this.$q(resolve => {
			this.fillScheduleConfigFromJson(json).then(() => resolve());
		});
	}

	/**
	 * Set schedule service state from the config object.
	 * Schedule timezones, repeat types and others are supposed to be loaded.
	 * @param {any} json schedule raw model.
	 * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
	 */
	private fillScheduleConfigFromJson(json: any): ng.IPromise<void> {
		return this.$q(resolve => {
			// Load schedule collections.
			this.loadScheduleData().then(() => {
				// Fill schedule config from json after loading collections.
				this.scheduleConfig.fromJson(json, this.sendEmailTypes, this.repeatTypes, this.timezones);
				resolve();
			});
		});
	}

	/**
	 * Load schedule data and available values from server
	 * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
	 */
	private loadScheduleData(): ng.IPromise<void> {
		return this.$q(resolve => {

			// calculate current timezone std offset:
			const rightNow = new Date();
			const jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
			const temp = jan1.toGMTString();
			const jan2 = new Date(temp.substring(0, temp.lastIndexOf(' ')));
			const stdTimeOffset = (jan1.getTime() - jan2.getTime()) / (1000 * 60);

			// load schedule dictionaries:
			this.$izendaCommonQueryService.getScheduleData(stdTimeOffset).then(json => {

				this.timezones = json.TimeZones.map(tz => {
					const tzText = tz.Text ? tz.Text.replaceAll('&nbsp;', ' ') : '';
					return new IzendaSelectItemModel(tzText, tz.Value, undefined, tz.Selected, tz.Enabled);
				});

				this.sendEmailTypes = json.SendEmailList.map(eml =>
					new IzendaSelectItemModel(eml.Text, eml.Value, undefined, eml.Selected, eml.Enabled));

				this.repeatTypes = json.RepeatTypes.map(rt =>
					new IzendaSelectItemModel(rt.Text, rt.Value, undefined, rt.Selected, rt.Enabled));

				resolve();
			});
		});
	}

	/**
	 * Set default values.
	 */
	private reset(): void {
		this.scheduleConfig = new IzendaScheduleModel();
		this.timezones = [];
		this.sendEmailTypes = [];
		this.repeatTypes = [];
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaScheduleService', IzendaScheduleService.injectModules.concat(IzendaScheduleService));
	}
}
