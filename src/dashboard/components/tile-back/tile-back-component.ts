import * as angular from 'angular';
import 'izenda-external-libs';
import IzendaComponent from 'common/core/tools/izenda-component';
import izendaDashboardModule from 'dashboard/module-definition';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';

import { IIzendaDashboardSettings } from 'dashboard/module-definition';
import { IzendaDashboardTileModel } from 'dashboard/model/tile-model';


/**
 * Back tile component definition
 */
@IzendaComponent(
	izendaDashboardModule,
	'izendaDashboardTileBack',
	['$izendaSettings', '$izendaDashboardSettings', '$izendaCompatibility'],
	{
		templateUrl: '###RS###extres=components.dashboard.components.tile-back.tile-back-template.html',
		bindings: {
			tile: '<',
			focused: '<',
			onSetTileTop: '&',
			onPrint: '&',
			onExportExcel: '&',
			onGoToEditor: '&',
			onGoToViewer: '&',
			onReload: '&',
			onSelectReport: '&'
		}
	})
export class IzendaDashboardTileBackComponent implements ng.IComponentController {

	// bindings
	tile: IzendaDashboardTileModel;
	focused: boolean;
	onSetTileTop: ({ top: number }) => void;
	onPrint: (any) => void;
	onExportExcel: (any) => void;
	onGoToEditor: (any) => void;
	onGoToViewer: (any) => void;
	onReload: (any) => void;
	onSelectReport: (any) => void;
	// other
	showAllInResults: boolean;
	isDesignLinksAllowed: boolean;
	printMode: string;

	constructor(
		private readonly $izendaSettings: IzendaQuerySettingsService,
		private readonly $izendaDashboardSettings: IIzendaDashboardSettings,
		private readonly $izendaCompatibility: IzendaCompatibilityService) {

		this.showAllInResults = true;
		this.isDesignLinksAllowed = true;
		this.printMode = 'Html2PdfAndHtml';
	}

	$onInit() {
		this.initializeAdHocSettings();
	};

	topSelected(newTop: number) {
		if (this.onSetTileTop)
			this.onSetTileTop({ top: newTop });
	}

	printTile() {
		this.fireHandler(this.onPrint);
	}

	fireExportToExcel() {
		this.fireHandler(this.onExportExcel);
	}

	fireReportEditorLink() {
		this.fireHandler(this.onGoToEditor);
	}

	fireReportViewerLink() {
		this.fireHandler(this.onGoToViewer);
	}

	reloadTile() {
		this.fireHandler(this.onReload);
	}

	selectReportPart() {
		this.fireHandler(this.onSelectReport);
	}

	//////////////////////////////////////////////////////////////////////
	// rights
	//////////////////////////////////////////////////////////////////////
	hasRightLevel(requiredLevel): boolean {
		var rights = ['None', 'Locked', 'View Only', 'Read Only', 'Full Access'];
		var currentRightLevel = rights.indexOf(this.tile.maxRights);
		if (currentRightLevel < 0)
			throw 'Unknown right string: ' + this.tile.maxRights;
		return currentRightLevel >= requiredLevel;
	}

	hasLockedRightsOrMore(): boolean {
		return this.hasRightLevel(1);
	}

	hasViewOnlyRightsOrMore(): boolean {
		return this.hasRightLevel(2);
	}

	hasReadOnlyRightsOrMore(): boolean {
		return this.hasRightLevel(3);
	}

	hasFullRights(): boolean {
		return this.hasRightLevel(4);
	}

	/**
	 * Is html model enabled in AdHocSettings
	 */
	isPrintTileVisible(): boolean {
		return this.printMode === 'Html' || this.printMode === 'Html2PdfAndHtml';
	}

	/**
	 * Check if one column view required
	 */
	isOneColumnView(): boolean {
		return this.$izendaCompatibility.isOneColumnView();
	}

	private initializeAdHocSettings() {
		var settings = this.$izendaSettings.getCommonSettings();
		this.isDesignLinksAllowed = settings.showDesignLinks; // show/hide "go to designer" button
		this.showAllInResults = settings.showAllInResults; // show "ALL" in tile top slider
		this.printMode = this.$izendaDashboardSettings.allowedPrintEngine; // allowed print modes
	}

	fireHandler(handlerFunction: (any) => void) {
		if (handlerFunction)
			handlerFunction({});
	}
}
