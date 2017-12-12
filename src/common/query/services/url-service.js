izendaRequire.define([
	'angular',
	'../module-definition',
	'../../core/services/localization-service',
	'../../core/services/util-service',
	'./ping-service',
	'./rs-query-service',
	'./settings-service'
], function (angular) {

	angular.module('izenda.common.query').factory('$izendaUrl', [
		'$window',
		'$rootScope',
		'$log',
		'$izendaRsQuery',
		'$izendaSettings',
		'$izendaPing',
		'$izendaLocale',
		'$izendaUtil',
		function ($window, $rootScope, $log, $izendaRsQuery, $izendaSettings, $izendaPing,
			$izendaLocale, $izendaUtil) {
			'use strict';

			var urlSettings = $window.urlSettings$;

			var reportNameInfo = getLocation();

			// subscribe on location change:
			window.onpopstate = function (event) {
				if (event.state && (event.state.rn || event.state.new)) {
					locationChangedHandler();
				}
			}

			// start ping
			$izendaPing.startPing();
			
			/**
			* Set report name and category to location
			* @param locationInfo. Object should contain:
			* {
			*   fullName: '',
			*   name: '', // could be parsed from fullName using "_extractName"
			*   category: '', // could be parsed from fullName using "_extractCategory"
			*   isNew: true|false, // if isNew is true - you don't need to assign "name" parameters.
			* }
			*/
			function setLocation(locationInfo) {
				if (!angular.isObject(locationInfo))
					throw '"locationInfo" parameter should be object';

				// if is new
				if (locationInfo.isNew) {
					setUrl({
						isNew: '1'
					}, { new: true });
					locationChangedHandler();
					return;
				}

				// navigate to existing report
				setUrl({
					rn: locationInfo.fullName.replaceAll(' ', '+')
				}, { rn: locationInfo.fullName });
				locationChangedHandler();
			}

			function getUrlParams(url) {
				var urlObj = (typeof (angular.element.url) === 'undefined') ? window.purl(url) : angular.element.url(url);
				return urlObj.data.param.query;
			}

			/**
			 * Change url if possible, otherwise reload the page with new url.
			 * @param {object} params - url params object.
			 * @param {any} additionalParams - additional params for pushState.
			 */
			function setUrl(params, additionalParams) {
				var oldUrlParams = getUrlParams(window.location.href);

				var isRnOldExist = angular.isString(oldUrlParams.rn);
				var rnOld = isRnOldExist ? 'rn=' + oldUrlParams.rn.replaceAll(' ', '+') : '';
				var isNewOldExist = angular.isString(oldUrlParams.isNew);

				var isRnNewExist = angular.isString(params.rn) && params.rn !== '';
				var rnNew = isRnNewExist ? 'rn=' + params.rn.replaceAll(' ', '+') : '';
				var isNewNewExist = angular.isString(params.isNew);

				if (isRnOldExist && isRnNewExist && rnOld === rnNew)
					// same rn
					return;
				if (isNewOldExist && isNewNewExist)
					// same isNew
					return;
				if (isRnNewExist && isNewNewExist)
					throw 'Incorrect params: both "rn" and "isNew" defined.';
				
				var newPath = window.location.pathname;
				var newParams = window.location.search ? window.location.search : '?';

				if (isNewNewExist) {
					// go to new report
					// remove rn
					newParams = newParams.replaceAll(rnOld, '');
					newParams += (newParams.endsWith('?') ? '' : '&') + 'isNew=1';
				} else if (isRnNewExist) {
					// go to existing report
					// remove isNew
					newParams = newParams.replaceAll('isNew=1', '');
					if (isRnOldExist)
						newParams = newParams.replaceAll(rnOld, rnNew);
					else
						newParams += (newParams.endsWith('?') ? '' : '&') + rnNew;
				}
				newParams = newParams.replaceAll('?&', '?');
				newParams = newParams.replaceAll('&&', '&');

				var newUrl = newPath + newParams;
				if ($window.history && $window.history.pushState) {
					$window.history.pushState(additionalParams, document.title, newUrl);
				} else
					window.location.href = newUrl;
			}

			/**
			 * Returns report full name (category delimiter: $izendaSettings.getCategoryCharacter())
			 */
			function getLocation() {
				var result = {
					fullName: null,
					category: null,
					name: null,
					isNew: false
				};
				urlSettings = new UrlSettings();

				// existing report
				var reportInfo = urlSettings.reportInfo;
				if (reportInfo.fullName) {
					result.fullName = reportInfo.fullName;
					result.category = reportInfo.category;
					result.name = reportInfo.name;
					return result;
				}

				// isNew
				result['isNew'] = reportInfo.isNew;
				return result;
			};

			/**
			 * Set report name and category to location
			 */
			function setReportFullName(fullName) {
				setLocation({
					fullName: fullName,
					name: _extractName(fullName),
					category: _extractCategory(fullName),
					isNew: false
				});
			};

			/**
			 * Go to "new"
			 */
			function setIsNew() {
				setLocation({
					fullName: null,
					name: null,
					category: null,
					isNew: true
				});
			};

			/**
			* Handler, which reacts on page load and $location change.
			*/
			function locationChangedHandler() {
				// update url settings object because url has changed
				urlSettings = new UrlSettings();
				// cancel all current queries
				var countCancelled = $izendaRsQuery.cancelAllQueries();
				if (countCancelled > 0)
					$log.debug('>>> Cancelled ' + countCancelled + ' queryes');

				// set current report set
				var newLocation2 = getLocation();
				if (newLocation2.fullName !== reportNameInfo.fullName || newLocation2.isNew !== reportNameInfo.isNew)
					reportNameInfo = newLocation2;
			};

			/**
			 * Create filter parameters url part
			 */
			function getFilterParamsString() {
				var requestString = '';
				if (urlSettings.filterParameters.length > 0) {
					for (var i = 0; i < urlSettings.filterParameters.length; i++) {
						var paramObject = urlSettings.filterParameters[i];
						requestString += '&' + paramObject[0] + '=' + encodeURIComponent(paramObject[1]);
					}
				}
				return requestString;
			}

			/**
			 * Extract report name from category\report full name
			 */
			function _extractName(fullName) {
				if (!angular.isString(fullName) || fullName === '')
					throw 'Can\'t extract report name from object "' + fullName + '" with type ' + typeof (fullName);

				var parts = fullName.split($izendaSettings.getCategoryCharacter());
				return parts[parts.length - 1];
			}

			/**
			 * Extract report category from "category\report full name
			 */
			function _extractCategory(fullName) {
				if (!angular.isString(fullName) || fullName === '')
					throw 'Can\'t extract category from object "' + fullName + '" with type ' + typeof (fullName);

				var reportFullNameParts = fullName.split($izendaSettings.getCategoryCharacter());
				var category;
				if (reportFullNameParts.length >= 2)
					category = reportFullNameParts.slice(0, reportFullNameParts.length - 1).join($izendaSettings.getCategoryCharacter());
				else
					category = $izendaUtil.getUncategorized();
				return category;
			};

			/**
			 * Extract report name, category, report set name for report part.
			 */
			function _extractReportPart(fullName, isPartNameAtRight) {
				if (!angular.isString(fullName) || fullName === '')
					throw 'Can\'t extract report part name from object "' + fullName + '" with type ' + typeof (fullName);

				var result = {
					reportPartName: null,
					reportFullName: fullName
				};
				// extract report part name
				var reportSetName = fullName;
				if (fullName.indexOf('@') >= 0) {
					var parts = fullName.split('@');
					if (!angular.isUndefined(isPartNameAtRight) && isPartNameAtRight) {
						result.reportPartName = parts[1];
						reportSetName = parts[0];
					} else {
						result.reportPartName = parts[0];
						reportSetName = parts[1];
					}
				}
				// collect results into one object:
				result.reportSetName = reportSetName;
				result.reportName = _extractName(reportSetName);
				result.reportCategory = _extractCategory(reportSetName);
				result.reportNameWithCategory = result.reportName;
				if ($izendaUtil.isUncategorized(result.reportCategory))
					result.reportNameWithCategory = result.reportCategory + $izendaSettings.getCategoryCharacter() + result.reportNameWithCategory;
				result.reportFullName = (result.reportPartName != null ? result.reportPartName + '@' : '') + result.reportSetName;
				return result;
			}

			return {
				settings: urlSettings,
				getFilterParamsString: getFilterParamsString,
				extractReportName: _extractName,
				extractReportCategory: _extractCategory,
				extractReportPartNames: _extractReportPart,
				setReportFullName: setReportFullName,
				setIsNew: setIsNew,
				getReportInfo: function () {
					return reportNameInfo;
				}
			};
		}]);

});