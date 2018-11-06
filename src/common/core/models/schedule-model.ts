import 'izenda-external-libs';
import { IIzendaRawModel as IRawModel } from 'common/core/models/raw-model';
import { IzendaSelectItemModel } from 'common/core/models/select-item-model';


export class IzendaScheduleModel implements IRawModel {
	date: Date;
	recipients: string;

	email: IzendaSelectItemModel;
	repeat: IzendaSelectItemModel;
	timezone: IzendaSelectItemModel;

	constructor() {
		this.date = new Date();
		this.email = null;
		this.recipients = '';
		this.repeat = null;
		this.timezone = null;
	}

	/**
	 * Fill this object from server-side dto object.
	 * @param {any} json dto object.
	 * @param {Core.IzendaSelectItemModel[]} emailTypes Email type models collection.
	 * @param {Core.IzendaSelectItemModel[]} repeatTypes Repeat type models collection.
	 * @param {Core.IzendaSelectItemModel[]} timezones Timezone models collection.
	 */
	fromJson(json: any,
		emailTypes: IzendaSelectItemModel[],
		repeatTypes: IzendaSelectItemModel[],
		timezones: IzendaSelectItemModel[]) {

		// parse and set date
		if (json && json.dateString) {
			let dateString = json.dateString.trim();
			let momentDate: any;
			if (json.timeString) {
				dateString += ` ${json.timeString.trim()}`;
				momentDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
			} else {
				momentDate = moment(dateString, 'YYYY-MM-DD');
			}
			this.date = momentDate.isValid() ? momentDate._d : new Date();
		} else
			this.date = new Date();
		if (!this.date || this.date.getFullYear() <= 1900)
			this.date = new Date();

		// timezone
		this.timezone = timezones.length ? (timezones.find(tz => tz.selected) || timezones[0]) : null;
		if (json && json.timezoneId)
			this.timezone = timezones.find(tz => tz.value === json.timezoneId) || this.timezone;

		// email type
		this.email = emailTypes.length ? (emailTypes.find(e => e.selected) || emailTypes[0]) : null;

		// repeat type
		this.repeat = repeatTypes.length ? (repeatTypes.find(r => r.selected) || repeatTypes[0]) : null;

		// recipients
		this.recipients = json && json.recipients ? json.recipients : '';
	}

	/**
	 * Create server-side dto object for this schedule model object.
	 * @return {any} New json object.
	 */
	toJson(): any {
		let dateString: string = null;
		let timeString: string = null;
		if (this.date) {
			dateString = moment(this.date).format('YYYY-MM-DD');
			timeString = moment(this.date).format('HH:mm:ss');
		}
		const json = {
			dateString: dateString,
			timeString: timeString,
			recipients: this.recipients,
			email: this.email ? this.email.value : null,
			repeat: this.repeat ? this.repeat.value : null,
			timezoneId: this.timezone ? this.timezone.value : null
		};
		return json;
	}

}
