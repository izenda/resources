// ReSharper disable InconsistentNaming
interface Array<T> {
	find(predicate: (search: T) => boolean): T;
}

interface String {
	replaceAll(search: string, replacement: string): string;

	replaceAll(regex: RegExp, replacement: string): string;
}

interface Event {
	which: number;
}

interface Document {
	selection: any;
	mozFullScreenElement: any;
	msFullscreenElement: any;
	mozCancelFullScreen: any;
	msExitFullscreen: any;
}

interface Window {
	purl: any;
	utility: any;
	urlSettings$: any;
	urlSettings: any;
	nrvConfig: any;
	responseServer: any;
	responseServerWithDelimeter: any;
	resourcesProvider: any;
	resourcesProviderWithDelimeter: any;
	izendaPageId$: any;
	angularPageId$: any;
	hideModal: any;
	CC_CustomFilterPageValueReceived: any;
	hm: any;
	cascadingFiltersChangedCustomContext: any;
	cascadingFiltersChangedCustom: any;
	refreshFiltersLastGUID: any;
	File: any;
	FileReader: any;
	FileList: any;
}

interface Date {
	toGMTString(): string;
}

interface IzendaLocale {
	/**
	 * Get localized string by given resource dictionary key.
	 * @param {string} key Resources key.
	 * @param {string} defaultValue Default value in case when resource by given key wasn't found.
	 * @returns {string} Localized string.
	 */
	Res(key: string, defaultValue: string): string;

	/**
	 * Look over the html document and localize page.
	 */
	LocalizePage(): void;
}

declare var izendaRequire: any;
declare var moment: any;
declare var IzLocal: IzendaLocale;
declare function getAppendedUrl(url: string, queryParams?: object): string;
declare function appendParameterToUrl(url: string, paramName: string, paramValue: string): string;
declare var izenda: any;
declare var AdHoc: any;
declare var izenda: any;
declare var jsResources: any;
declare var resizeSensor: any;
declare var CSSParser: any;
declare var ExtendReportExport: any;
declare var responseServer: any;
declare var CascadingFiltersChanged: any;
declare var GetDataToCommit: any;
declare var GotFiltersData: any;
declare var GenerateGuid: any;
declare var UrlSettings: any;
declare var IzLocal: IzendaLocale;
