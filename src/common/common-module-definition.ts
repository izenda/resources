import * as angular from 'angular';
import 'izenda-external-libs';

String.prototype.replaceAll = function (search, replacement) {
	const target = this;
	if (typeof search !== 'string' || search === '')
		return this;
	return target.split(search).join(replacement);
};

/**
 * requirejs module, which creates angular modules.
 * returns 'loadSettings' function, which could load settings for this module.
 */
export class IzendaCommonLoader {
	static loadSettings() {	
		const deferredObject = angular.element.Deferred();
		const urlSettings = window.urlSettings$;
		const rsPageUrl = urlSettings.urlRsPage;
		const settingsUrl = rsPageUrl + '?wscmd=getCommonSettings';
		// load common settings:

		angular.element.get(settingsUrl, (configJson) => {
			var configObject = configJson as IIzendaCommonSettings;
			angular
				.module('izenda.common.core')
				.constant('$izendaCommonSettings', configObject);
			deferredObject.resolve();
		});
		return deferredObject.promise();
	}
}

export interface IIzendaCommonSettings {
	allowCreateNewCategory: boolean;
	allowInvalidCharacters: boolean;
	bulkCsv: boolean;
	categoryCharacter: string;
	culture: string;
	dateFormatLong: string;
	dateFormatShort: string;
	showAllInResults: boolean;
	showCategoryTextboxInSaveDialog: boolean;
	showDesignLinks: boolean;
	showDesignDashboardLink: boolean;
	showSaveAsToolbarButton: boolean;
	showSaveControls: boolean;
	showTimeInFilterPickers: boolean;
	stripInvalidCharacters: boolean;
	timeFormatLong: string;
	timeFormatShort: string;
}