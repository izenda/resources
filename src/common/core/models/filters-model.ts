import { IIzendaRawModel as IRawModel } from 'common/core/models/raw-model';

/**
 * Server-side filters object raw model.
 */
export class IzendaFiltersModel implements IRawModel {

	filterLogic: string = '';
	filters: any[] = [];
	subreportsFilters: any = null;

	fromJson(json: any) {
		this.filterLogic = json.FilterLogic || '';
		this.filters = json.Filters || [];
		this.subreportsFilters = json.SubreportsFilters || null;
	}

	toJson(): any {
		return {
			FilterLogic: this.filterLogic,
			Filters: this.filters,
			SubreportFilters: this.subreportsFilters
		};
	}
}