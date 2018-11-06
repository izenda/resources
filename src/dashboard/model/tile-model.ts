import { IIzendaRawModel } from 'common/core/models/raw-model';

export interface IBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Izenda dashboard tile model class
 */
export class IzendaDashboardTileModel implements IBox, IIzendaRawModel {
	static $$TileIdCounter: number = 1;

	id: number;
	isNew: boolean = false;
	isSourceReportDeleted: boolean = false;
	title: string = '';
	description: string = '';
	x: number = 0;
	y: number = 0;
	width: number = 6;
	height: number = 3;
	canBeLoaded: boolean = true;
	designerType: string = 'ReportDesigner';
	maxRights: string = 'Full Access';
	top: number = 100;
	topString: string = '100';
	reportName: string = null;
	reportCategory: string = null;
	reportFullName: string = null;
	reportPartName: string = null;
	reportNameWithCategory: string = null;
	reportSetName: string = null;
	reportType: string = null;
	previousReportFullName: string = null;

	backTilePopupOpened: boolean = false;
	flip: any = null;
	updateFromSource: boolean;
	backgroundColor: string;

	/**
	 * Factory method
	 * @param {boolean} isNew is this tile marked as new.
	 * @param {Object} rawModel tile properties.
	 * @returns {IzendaDashboardTileModel} model instance.
	 */
	static createInstance(isNew: boolean, json: any = null): IzendaDashboardTileModel {
		return new IzendaDashboardTileModel(isNew, json);
	}

	constructor(isNew: boolean, json: any) {
		this.id = IzendaDashboardTileModel.$$TileIdCounter++;
		this.isNew = isNew;
		this.fromJson(json);
	}

	/**
	 * Fill this object from the raw representation
	 * @param {any} json Raw model.
	 */
	fromJson(json: any) {
		if (!json)
			return;
		this.isSourceReportDeleted = json.isSourceReportDeleted || false;
		this.title = json.reportTitle || '';
		this.description = json.reportDescription || '';
		this.x = json.x || 0;
		this.y = json.y || 0;
		this.width = json.width || 6;
		this.height = json.height || 3;
		this.canBeLoaded = json.canBeLoaded || true;
		this.designerType = json.designerType || 'ReportDesigner';
		this.maxRights = json.maxRights || 'Full Access';
		this.top = json.recordsCount || 100;
		this.topString = this.top + '';
		this.reportName = json.reportName || null;
		this.reportCategory = json.reportCategory || null;
		this.reportFullName = json.reportFullName || null;
		this.reportPartName = json.reportPartName || null;
		this.reportNameWithCategory = this.reportSetName = json.reportSetName || null;
		this.reportType = json.reportType || null;
	}

	/**
	 * Create JSON config for sending it to server
	 */
	toJson(): any {
		const json = {
			isSourceReportDeleted: this.isSourceReportDeleted,
			reportTitle: this.title, // other name
			reportDescription: this.description, // other name
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			canBeLoaded: this.canBeLoaded,
			designerType: this.designerType,
			maxRights: this.maxRights,
			recordsCount: this.top, // other name 
			reportName: this.reportName || '',
			reportCategory: this.reportCategory || '',
			reportFullName: this.reportFullName || '',
			reportPartName: this.reportPartName || '',
			reportSetName: this.reportSetName || '',
			reportType: this.reportType
		};
		return json;
	}

	/**
	 * Get tile geometric position
	 * @param {Array<IzendaDashboardTileModel>} tiles Collection where this tile placed
	 */
	getTileOrder(tiles: IBox[]): number {
		const tilesCopy = tiles.slice();
		tilesCopy.sort((tile1, tile2) => {
			if (tile1.y !== tile2.y)
				return tile1.y - tile2.y;
			return tile1.x - tile2.x;
		});
		return tilesCopy.indexOf(this);
	}
}