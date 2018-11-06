/**
 * IzendaSelectItemModel class is used to provide uniform angular bindings style for <select>.
 */
export class IzendaSelectItemModel {
	text: string;
	value: string;
	group: string;
	selected: boolean;
	enabled: boolean;

	constructor(text: string, value: string, group?: string, selected?: boolean, enabled?: boolean) {
		if (typeof (value) === 'undefined')
			throw new Error('value should be defined');
		this.text = text;
		this.value = value;
		this.group = group ? group : undefined;
		this.selected = selected ? selected : false;
		this.enabled = enabled ? enabled : true;
	}

	get disabled(): boolean {
		return !this.enabled;
	}

	isEqual(testValue: string, isLowerCaseComparison?: boolean): boolean {
		if (testValue === null && this.value === null)
			return true;
		if (testValue === null || this.value === null)
			return false;
		return isLowerCaseComparison
			? testValue.toLowerCase() === this.value.toLowerCase()
			: testValue === this.value;
	}

	isEqualWithItem(item: IzendaSelectItemModel, isLowerCaseComparison?: boolean): boolean {
		if (!item)
			return false;
		return this.isEqual(item.value, isLowerCaseComparison);
	}
}
