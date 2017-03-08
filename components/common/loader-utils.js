define([], function () {
	/**
	 * Initialize configs which used by old scripts
	 */
	function loadReportViewerConfig() {
		// load report viewer config (supprt for legacy code)
		window.urlSettings = window.urlSettings$ = UrlSettings();

		var dfd = jq$.Deferred();
		var uSettings = window.urlSettings$;
		var url = uSettings.urlRsPage + '?wscmd=reportviewerconfig&wsarg0=0&wsarg1=0&wsarg2=' +
			encodeURIComponent(uSettings.reportInfo.fullName);
		url = appendParameterToUrl(url, 'izpid', window.izendaPageId$);
		url = appendParameterToUrl(url, 'anpid', window.angularPageId$);
		jq$.ajax(url, {
			dataType: 'json'
		}).done(function (returnObj) {
			window.nrvConfig = returnObj;
			window.nrvConfig.serverDelimiter = '?';
			if (window.nrvConfig.ResponseServerUrl.indexOf('?') >= 0)
				window.nrvConfig.serverDelimiter = '&';
			var delimiter = '';
			if (uSettings.urlRsPage.lastIndexOf(window.nrvConfig.serverDelimiter) !== uSettings.urlRsPage.length - 1)
				delimiter = window.nrvConfig.serverDelimiter;
			window.responseServer = new AdHoc.ResponseServer(uSettings.urlRsPage + delimiter, 0);
			window.responseServerWithDelimeter = window.responseServer.ResponseServerUrl;
			window.resourcesProvider = new AdHoc.ResourcesProvider(uSettings.urlRpPage + delimiter, 0);
			window.resourcesProviderWithDelimeter = window.resourcesProvider.ResourcesProviderUrl;
			dfd.resolve();
		});
		return dfd;
	}

	/**
	 * Save default jQuery into $$jQueryTemp and set jq$ instead of it
	 */
	function storeDefaultJquery() {
		window.$$jQueryTemp = null;
		if (window.jQuery)
			window.$$jQueryTemp = window.jQuery;
		window.jQuery = jq$;
	}

	/**
	 * Restore previously saved default jQuery.
	 */
	function restoreDefaultJquery() {
		// restore default jquery:
		if (window.$$jQueryTemp) {
			window.jQuery = window.$$jQueryTemp;
			delete window.$$jQueryTemp;
		}
	}

	return {
		loadReportViewerConfig: loadReportViewerConfig,
		storeDefaultJquery: storeDefaultJquery,
		restoreDefaultJquery: restoreDefaultJquery
	};
});
