import 'izenda-external-libs';
import { IIzendaRawModel as IRawModel } from 'common/core/models/raw-model';
import { IzendaSelectItemModel } from 'common/core/models/select-item-model';

/**
 * Model for the list of share rules.
 */
export class IzendaShareModel implements IRawModel {

	/**
	 * Share rules model collection
	 */
	shareRules: IzendaShareRuleModel[];

	constructor() {
		this.shareRules = new Array<IzendaShareRuleModel>();
	}

	/**
	 * Deserialize share rules. This method sets this.shareRules field.
	 * @param {any[]} json Serialized share rules array.
	 * @param {Core.IzendaSelectItemModel[]} availableRights Right model collection.
	 * @param {Core.IzendaSelectItemModel[]} availableSubjects Subject model collection.
	 */
	fromJson(json: any,
		availableRights: IzendaSelectItemModel[],
		availableSubjects: IzendaSelectItemModel[]) {
		if (!json) {
			this.shareRules = [];
			return;
		}
		this.shareRules = json.map(ruleJson => {
			const shareRule = new IzendaShareRuleModel();
			shareRule.fromJson(ruleJson, availableRights, availableSubjects);
			return shareRule;
		});
	}

	/**
	 * Serialize current share rules to json object.
	 * @return {any[]} array of serialized share rules.
	 */
	toJson(): any[] {
		const json = this.shareRules
			.filter(shareRule => shareRule.subject && shareRule.right)
			.map(shareRule => shareRule.toJson());
		return json;
	}
}

/**
 * Model for subject-right pair.
 */
export class IzendaShareRuleModel implements IRawModel {

	availableSubjects = new Array<IzendaSelectItemModel>();
	right: IzendaSelectItemModel = null;
	subject: IzendaSelectItemModel = null;

	constructor(subjects?: IzendaSelectItemModel[]) {
		if (subjects)
			this.setAvailableSubjects(subjects, null);
	}

	setAvailableSubjects(subjects: IzendaSelectItemModel[], subjectValue?: string) {

		const subjValue = subjectValue
			? subjectValue
			: this.subject
				? this.subject.value
				: null;

		// update available subjects collection
		this.availableSubjects = subjects && subjects.length ? [...subjects] : [];

		// update subject
		this.subject = null;
		if (subjValue !== null)
			this.subject = this.availableSubjects.find(s => s.value === subjValue) || null;
	}

	fromJson(json: any, rights: IzendaSelectItemModel[], subjects: IzendaSelectItemModel[]) {

		// set right
		this.right = null;
		if (rights && rights.length)
			this.right = rights.find(r => json && r.value === json.right) || null;

		// set available subject
		this.setAvailableSubjects(subjects, json ? json.subject : null);
	}

	toJson(): any {

		if (!this.right && !this.subject)
			// you can face with this situation only if you call toJson directly for this class, 
			//because when you serialize collection, there is additional check for empty subject and right.
			return null;

		const json = {
			right: this.right.value,
			subject: this.subject.value
		};

		return json;
	}
}
