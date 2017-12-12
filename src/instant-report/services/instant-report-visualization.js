izendaRequire.define([
	'angular',
	'./instant-report-query'
], function (angular) {

	/**
	 * Instant report chart service. Contains charts data and its functions.
	 */
	angular.module('izendaInstantReport').factory('$izendaInstantReportVisualization', [
		'$q',
		'$izendaInstantReportQuery',
		function ($q, $izendaInstantReportQuery) {
			'use strict';

			var _visConfig = _createDefaultConfig();

			/**
			 * Create default config object
			 */
			function _createDefaultConfig() {
				return {
					categories: []
				};
			}

			/**
			 * Get current config.
			 */
			function getVisualizationConfig() {
				return _visConfig;
			}

			/**
			 * Load visualizations. Designed as async operation for future async config loading.
			 * @returns {promise object}.
			 */
			function loadVisualizations() {
				_visConfig = _createDefaultConfig();

				return $q(function (resolve) {
					// run query:
					$izendaInstantReportQuery.getVisualizationConfig().then(function (config) {
						if (!angular.isObject(config) || !angular.isArray(config.categories)) {
							resolve();
							return;
						}
						// set config:
						_visConfig = config;
						// add category name to each visualization object:
						angular.element.each(_visConfig.categories, function () {
							var categoryName = this.name;
							angular.element.each(this.charts, function () {
								this.categoryName = categoryName;
							});
						});
						resolve();
					});
				});
			};

			/**
			 * Find visualization object by given name and category.
			 * @param {string} category.
			 * @param {string} name.
			 * @returns {object} visualization object.
			 */
			function findVisualization(category, name) {
				var result = null;
				angular.element.each(_visConfig.categories, function () {
					if (this.name === category) {
						angular.element.each(this.charts, function () {
							if (this.name === name)
								result = this;
						});
					}
				});
				return result;
			};

			// public API:
			return {
				getVisualizationConfig: getVisualizationConfig,
				loadVisualizations: loadVisualizations,
				findVisualization: findVisualization
			};
		}
	]);

});