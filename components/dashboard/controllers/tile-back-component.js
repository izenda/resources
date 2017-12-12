izendaRequire.define([
	'angular',
	'../services/services',
	'../directives/directives'], function (angular) {

		/**
		 * Back tile component definition
		 */
		angular.module('izendaDashboard').component('izendaDashboardTileBack', {
			templateUrl: '###RS###extres=components.dashboard.templates.izenda-dashboard-tile-back.html',
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
			},
			controller: ['$izendaSettings', '$izendaDashboardSettings',
						'$izendaCompatibility', '$izendaDashboardQuery', IzendaDashboardTileBackController]
		});

		function IzendaDashboardTileBackController($izendaSettings, $izendaDashboardSettings,
					$izendaCompatibility, $izendaDashboardQuery) {
			var self = this;
			self.showAllInResults = true;
			self.isDesignLinksAllowed = true;
			self.printMode = 'Html2PdfAndHtml';
			
			self.topSelected = function (newTop) {
				if (angular.isFunction(self.onSetTileTop))
					self.onSetTileTop({
						top: newTop
					});
			};

			self.printTile = function () {
				fireHandler(self.onPrint);
			};

			self.fireExportToExcel = function () {
				fireHandler(self.onExportExcel);
			};

			self.fireReportEditorLink = function () {
				fireHandler(self.onGoToEditor);
			};

			self.fireReportViewerLink = function () {
				fireHandler(self.onGoToViewer);
			};

			self.reloadTile = function () {
				fireHandler(self.onReload);
			};

			self.selectReportPart = function () {
				fireHandler(self.onSelectReport);
			};

			//////////////////////////////////////////////////////////////////////
			// rights
			//////////////////////////////////////////////////////////////////////
			self.hasRightLevel = function (requiredLevel) {
				var rights = ['None', 'Locked', 'View Only', 'Read Only', 'Full Access'];
				var currentRightLevel = rights.indexOf(self.tile.maxRights);
				if (currentRightLevel < 0)
					throw 'Unknown right string: ' + self.tile.maxRights;
				return currentRightLevel >= requiredLevel;
			}

			self.hasLockedRightsOrMore = function () {
				return self.hasRightLevel(1);
			};

			self.hasViewOnlyRightsOrMore = function () {
				return self.hasRightLevel(2);
			};

			self.hasReadOnlyRightsOrMore = function () {
				return self.hasRightLevel(3);
			};

			self.hasFullRights = function () {
				return self.hasRightLevel(4);
			};

			/**
			 * Is html model enabled in AdHocSettings
			 */
			self.isPrintTileVisible = function () {
				return self.printMode === 'Html' || self.printMode === 'Html2PdfAndHtml';
			};

			/**
			 * Check if one column view required
			 */
			self.isOneColumnView = function () {
				return $izendaCompatibility.isOneColumnView();
			};

			function _initializeAdHocSettings() {
				var settings = $izendaSettings.getCommonSettings();
				self.isDesignLinksAllowed = settings.showDesignLinks; // show/hide "go to designer" button
				self.showAllInResults = settings.showAllInResults; // show "ALL" in tile top slider
				self.printMode = $izendaDashboardSettings.allowedPrintEngine; // allowed print modes
			}

			function fireHandler(handlerFunction) {
				if (angular.isFunction(handlerFunction))
					handlerFunction({});
			}

			self.$onInit = function () {
				_initializeAdHocSettings();
			};
		}

	});