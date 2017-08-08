izendaRequire.define(['angular', '../../common/services/services'], function (angular) {

	/**
	* Izenda query service which provides dashboard specific queries
	* this is singleton
	*/
	angular
	.module('izenda.common.query')
	.factory('$izendaDashboardQuery', [
	'$izendaRsQuery',
	'$izendaLocale',
	'$izendaUrl',
	function ($izendaRsQuery, $izendaLocale, $izendaUrl) {
		'use strict';

		/**
		* Load dashboard tiles
		*/
		function loadDashboardLayout(updateFromSource) {
			return $izendaRsQuery.query('getReportDashboardConfig', [updateFromSource ? 'true' : 'false'], {
				dataType: 'json'
			},
			// custom error handler:
			{
				handler: function () {
					return $izendaLocale.localeText('js_LayoutLoadError', 'Failed to load dashboard layout');
				}
			});
		}

		/**
		* Set top for report part
		*/
		function setReportPartTop(reportPartFullName, top) {
			var result = $izendaRsQuery.query('settoptoreportpartincrs', [reportPartFullName, top]);
			return result;
		}

		/**
		* Load tile report html
		*/
		function loadTileReport(options) {
			var params = {};
			if (options.applyFilterParams && $izendaUrl.settings.filterParameters.length) {
				angular.element.each($izendaUrl.settings.filterParameters, function () {
					var parameter = this;
					params[parameter[0]] = parameter[1];
				});
			}
			params['wscmd'] = options.updateFromSourceReport ? 'updateandgetcrsreportpartpreview' : 'getcrsreportpartpreview';
			params['wsarg0'] = options.reportFullName;
			params['wsarg1'] = options.reportPreviousFullName ? options.reportPreviousFullName : '';
			params['wsarg2'] = 1;
			params['wsarg3'] = options.top;
			params['wsarg4'] = options.contentWidth;
			params['wsarg5'] = options.contentHeight;
			params['wsarg6'] = options.forPrint;
			params['rnalt'] = options.reportFullName ? options.reportFullName.split('@')[1] : '';

			var result = $izendaRsQuery.rsQuery(params, {
				dataType: 'text',
				headers: {
					'Content-Type': options.updateFromSourceReport ? 'text/json' : 'text/html'
				}
			}, {
				handler: function (name) {
					return $izendaLocale.localeText('js_TileLoadError', 'Failed to load tile') + ': ' + name;
				},
				params: [options.reportFullName]
			});
			return result;
		}

		/**
		* Save dashboard
		*/
		function saveDashboard(dashboardName, dashboardConfigObject) {
			return $izendaRsQuery.query('savecrsdashboard', [JSON.stringify(dashboardConfigObject), dashboardName], {
				dataType: 'text',
				method: 'POST'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_DashboardSaveError', 'Failed to save dashboard') + ': ' + name;
				},
				params: [dashboardName]
			});
		}

		/**
		* Sync dashboard state to server
		*/
		function syncDashboard(dashboardConfigObject) {
			return $izendaRsQuery.query('synccrsdashboard', [JSON.stringify(dashboardConfigObject)], {
				dataType: 'text',
				method: 'POST'
			},
			// custom error handler:
			{
				handler: function () {
					return $izendaLocale.localeText('js_DashboardSyncError', 'Failed to sync dashboard');
				},
				params: []
			});
		}

		/**
		* Load rendered report part of CRS
		*/
		function loadTileReportForPrint(reportPartName) {
			return $izendaRsQuery.query('renderedreportpartcrsforprint', ['', reportPartName], {
				dataType: 'text'
			},
			// custom error handler:
			{
				handler: function (name) {
					return $izendaLocale.localeText('js_DashboardPrintTileError', 'Failed to load tile for print') + ': ' + name;
				},
				params: [reportPartName]
			});
		}

		/**
		* Load rendered for print dashboard
		*/
		function loadDashboardForPrint() {
			return $izendaRsQuery.rsQuery({
				'p': 'htmlreport',
				'printmanual': '1'
			}, {
				dataType: 'text'
			},
			// custom error handler:
			{
				handler: function () {
					return $izendaLocale.localeText('js_DashboardPrintError', 'Failed to load dashboard for print');
				},
				params: []
			});
		}

		// PUBLIC API
		return {
			loadDashboardLayout: loadDashboardLayout,
			loadTileReport: loadTileReport,
			loadTileReportForPrint: loadTileReportForPrint,
			saveDashboard: saveDashboard,
			syncDashboard: syncDashboard,
			setReportPartTop: setReportPartTop,
			loadDashboardForPrint: loadDashboardForPrint
		};
	}]);

});