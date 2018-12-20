/**
 * Instant report settings object interface. Values for this passed from
 * "static string GetInstantReportSettings()" backend method.
 */
export interface IIzendaInstantReportConfig {
	allowVirtualDataSources: boolean;
	ddkValuesMaxAmount: number;
	showDesignLinks: boolean;
	showSaveControls: boolean;
	showScheduleControls: boolean;
	showSharingControl: boolean;
	showChartTab: boolean;
	showAllInPreview: boolean;
	distinct: boolean;
	showDistinct: boolean;
	defaultTable: string;
	maxAllowedTables: number;
	headerForegroundColor: string;
	itemForegroundColor: string;
	reportHeaderColor: string;
	reportItemColor: string;
	reportAlternatingItemColor: string;
	reportBorderColor: string;
	defaultVisibilityForNonAdmins: string;
	defaultSharingRights: string;

	// custom additional settings (not presented in backend)
	moveUncategorizedToLastPosition : boolean;
}
