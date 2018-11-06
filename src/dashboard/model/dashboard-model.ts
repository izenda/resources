import { IzendaShareModel } from 'common/core/models/share-model';
import { IzendaScheduleModel } from 'common/core/models/schedule-model';
import { IIzendaRawModel } from 'common/core/models/raw-model';

import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';
import { IBox } from 'dashboard/model/tile-model';

/**
 * Izenda dashboard model class
 */
export class IzendaDashboardModel implements IIzendaRawModel {
	isNew: boolean = true;
	reportName: string = null;
	reportCategory: string = null;
	reportFullName: string = null;
	sourceReportFullName: string = null;
	effectiveRights: string = null;
	filters: any;
	tiles: IzendaDashboardTileModel[] = [];

	/**
	 * Factory method
	 * @param {boolean} isNew new dashboard with defualt config or not.
	 * @param {any} json dashboard server-side properties.
	 * @returns {IzendaDashboardModel} model instance.
	 */
	static createInstance(
		isNew: boolean,
		json?: any): IzendaDashboardModel {
		return new IzendaDashboardModel(isNew, json);
	}

	/**
	 * Json validation.
	 */
	static isValidJson(json: any): boolean {
		return json && typeof (json) === 'object' && json.hasOwnProperty('tiles');
	}

	constructor(isNew: boolean, json: any, share?: IzendaShareModel, schedule?: IzendaScheduleModel) {
		if (!isNew && !json)
			throw new Error('Can\'t initialize dashboard model when isNew=false and rawModel is empty.');
		this.isNew = isNew;
		if (isNew) {
			this.reportName = null;
			this.reportCategory = null;
			this.reportFullName = null;
			this.sourceReportFullName = null;
			this.tiles = [
				IzendaDashboardTileModel.createInstance(true)
			];
		} else {
			this.fromJson(json, share, schedule);
		}
	}

	/**
	 * Get sorted tiles by its positions.
	 * @returns {IzendaDashboardTileModel[]} sorted tiles array (another instance of array!)
	 */
	get tilesSorted(): IzendaDashboardTileModel[] {
		return this.tiles.sort((tile1, tile2) => {
			if (tile1.y != tile2.y)
				return tile1.y - tile2.y;
			return tile1.x - tile2.x;
		});
	}

	/**
	 * Fill this object from the raw representation
	 * @param {any} json Raw model.
	 */
	fromJson(json: any, share?: IzendaShareModel, schedule?: IzendaScheduleModel) {
		this.reportName = json.reportName;
		this.reportCategory = json.reportCategory;
		this.reportFullName = json.reportFullName;
		this.sourceReportFullName = json.sourceReportFullName;
		this.effectiveRights = json.effectiveRights;

		this.filters = json.filters;
		this.tiles = json.tiles.map(tileCfg => IzendaDashboardTileModel.createInstance(false, tileCfg));
	}

	/**
	 * Create JSON config for sending it to server
	 */
	toJson(): any {

		// filter out invalid tiles and sort by it's geometrical position
		const tilesCopy = this.tiles
			.filter(tile => !!tile.reportFullName)
			.slice();
		tilesCopy.sort((tile1, tile2) => {
			if (tile1.y != tile2.y)
				return tile1.y - tile2.y;
			return tile1.x - tile2.x;
		});
		const result = {
			isDashboard: true,
			isNew: this.isNew,
			reportName: this.reportName,
			reportCategory: this.reportCategory,
			reportFullName: this.reportFullName,
			sourceReportFullName: this.sourceReportFullName,
			filters: this.filters,
			tiles: tilesCopy.map(tile => tile.toJson())
		};
		return result;
	}

	/**
	 * Add new tile with left, top coordinates {x, y}.
	 * Maximum size of the created tile is 6x3.
	 * @param {number} x left coordinate.
	 * @param {number} y top coordinate.
	 */
	addPixelTile(x: number, y: number) {
		const newTile = IzendaDashboardTileModel.createInstance(true);
		newTile.x = x;
		newTile.y = y;
		newTile.width = 1;
		newTile.height = 1;
		while (!this.checkTileIntersectsBbox(newTile) && newTile.width < 6 && newTile.width + newTile.x < 12)
			newTile.width++;
		if (this.checkTileIntersectsBbox(newTile))
			newTile.width--;
		while (!this.checkTileIntersectsBbox(newTile) && newTile.height < 3)
			newTile.height++;
		if (this.checkTileIntersectsBbox(newTile))
			newTile.height--;
		if (newTile.width <= 0 || newTile.height <= 0)
			return;
		this.tiles.push(newTile);
	}

	/**
	 * Remove tile from dashboard
	 * @param {IzendaDashboardTileModel} tile tile for removal.
	 */
	removeTile(tile: IzendaDashboardTileModel) {
		this.tiles.splice(this.tiles.indexOf(tile), 1);
	}

	/**
	 * If tile intersects with at least one of it's neighbors - return true.
	 * @param {IzendaDashboardTileModel} tile tile which we check
	 */
	checkTileIntersectsBbox(tile: IzendaDashboardTileModel): boolean {
		const hitTest = (a: IBox, b: IBox): boolean => {
			const aLeft = a.x;
			const aRight = a.x + a.width - 1;
			const aTop = a.y;
			const aBottom = a.y + a.height - 1;
			const bLeft = b.x;
			const bRight = b.x + b.width - 1;
			const bTop = b.y;
			const bBottom = b.y + b.height - 1;
			return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
		};
		const otherTiles = this.tiles.filter(t => t.id !== tile.id);
		return otherTiles.some(t => hitTest(tile, t));
	}

	/**
	 * Get maximum tile height.
	 * @param {boolean} isOneColumnView desktop/mobile version.
	 * @returns {number} maximum height in coordinate points.
	 */
	getMaxHeight(isOneColumnView: boolean): number {
		if (isOneColumnView)
			return this.tiles.length * 4;
		var maxHeight = 0;
		this.tiles.forEach(tile => {
			if (maxHeight < tile.y + tile.height)
				maxHeight = tile.y + tile.height;
		});
		return maxHeight;
	}


}
