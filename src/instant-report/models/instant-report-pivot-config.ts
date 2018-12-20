export default class IzendaInstantReportDefaultPivotConfig {
	pivotColumn: any;
	cellValues: any[];
	options: {
		addSideTotals: boolean
	};

	constructor() {
		this.pivotColumn = null;
		this.cellValues = [];
		this.options = {
			addSideTotals: false
		};
	}

	static fromObject(object: any) {
		const result = new IzendaInstantReportDefaultPivotConfig();
		result.pivotColumn = object.pivotColumn;
		result.cellValues = object.cellValues;
		result.options = {
			addSideTotals: object.options.addSideTotals
		};
		return result;
	}

	clone(): IzendaInstantReportDefaultPivotConfig {
		const result = new IzendaInstantReportDefaultPivotConfig();
		result.pivotColumn = this.pivotColumn;
		result.cellValues = new Array<any>(this.cellValues);
		result.options = { addSideTotals: this.options ? this.options.addSideTotals : false };
		return result;
	}
}
