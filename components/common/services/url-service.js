izendaRequire.define(['angular', './localization-service', './ping-service', './rs-query-service', './settings-service'], function (angular) {

	angular.module('izenda.common.query').factory('$izendaUrl', [
		'$window',
		'$rootScope',
		'$location',
		'$log',
		'$izendaRsQuery',
		'$izendaSettings',
		'$izendaPing',
		'$izendaLocale',
		'$izendaUtil',
		function ($window, $rootScope, $location, $log, $izendaRsQuery, $izendaSettings, $izendaPing,
			$izendaLocale, $izendaUtil) {
			'use strict';

			var urlSettings = $window.urlSettings$;
			var reportNameInfo;

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
			var _extractReportPart = function (fullName, isPartNameAtRight) {
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
			};

			/**
			* Set report name and category to location
			* @param reportNameObject. Object should contain:
			* {
			*   fullName: '',
			*   name: '', // could be parsed from fullName using "_extractName"
			*   category: '', // could be parsed from fullName using "_extractCategory"
			*   isNew: true|false, // if isNew is true - you don't need to assign "name" parameters.
			*   isDefault: false
			* }
			*/
			var setLocation = function (locationInfo) {
				if (!angular.isObject(locationInfo))
					throw '"reportNameObject" parameter should be object';

				// if is new
				if (locationInfo.isNew) {
					setHash('');
					$location.path('');
					$location.search('new');
					return;
				}

				// set path
				var path = '';
				if (!$izendaUtil.isUncategorized(locationInfo.category)) {
					var reportCategoryFixed = locationInfo.category;
					if (reportCategoryFixed.indexOf('/') !== 0) {
						reportCategoryFixed = '/' + reportCategoryFixed;
					}
					path = reportCategoryFixed;
					path += $izendaSettings.getCategoryCharacter() + locationInfo.name;
				} else {
					path = locationInfo.name;
				}
				setHash('');
				$location.search('new', null); // remove "new" url parameter
				$location.path(path);
			};

			/**
			 * Set hash for anchors
			 */
			var setHash = function (hash) {
				var hashToSet = '';
				if (angular.isString(hash))
					hashToSet = hash;
				$location.hash(hashToSet);
			}

			/**
			* Returns report full name (category delimiter: $izendaSettings.getCategoryCharacter())
			*/
			var getLocation = function () {
				var result = {
					fullName: null,
					category: null,
					name: null,
					isNew: false,
					isDefault: false
				};

				// path
				var path = $location.path();
				if (path !== '' && path !== '/') {
					// url contains report name:
					if (path.indexOf('/') === 0) {
						path = path.slice(1, path.length);
					}
					result['fullName'] = path;
					result['category'] = _extractCategory(path);
					result['name'] = _extractName(path);
					return result;
				}
				// isNew
				var newParameter = $location.search()['new'];
				if (angular.isDefined(newParameter)) {
					// url contains 'new' parameter
					result['isNew'] = true;
					return result;
				}
				// isDefault
				result['isDefault'] = true;
				return result;
			};

			/**
			* Set report name and category to location
			*/
			var setReportFullName = function (fullName) {
				setLocation({
					fullName: fullName,
					name: _extractName(fullName),
					category: _extractCategory(fullName),
					isNew: false,
					isDefault: false
				});
			};

			var setIsNew = function () {
				setLocation({
					fullName: null,
					name: null,
					category: null,
					isNew: true,
					isDefault: false
				});
			};

			/**
			* Handler, which reacts on page load and $location change.
			*/
			var locationChangedHandler = function () {
				// cancel all current queries
				var countCancelled = $izendaRsQuery.cancelAllQueries();
				if (countCancelled > 0)
					$log.debug('>>> Cancelled ' + countCancelled + ' queryes');

				// set current report set
				var newLocation2 = getLocation();
				if (newLocation2.fullName !== reportNameInfo.fullName || newLocation2.isNew !== reportNameInfo.isNew)
					reportNameInfo = newLocation2;
			};

			// initialize service:

			// subscribe on $location change:
			$rootScope.$on('$locationChangeSuccess', function () {
				locationChangedHandler();
			});
			reportNameInfo = getLocation();

			// start ping
			$izendaPing.startPing();

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

			return {
				settings: urlSettings,
				getFilterParamsString: getFilterParamsString,
				extractReportName: _extractName,
				extractReportCategory: _extractCategory,
				extractReportPartNames: _extractReportPart,
				setReportFullName: setReportFullName,
				setLocation: setLocation,
				setHash: setHash,
				setIsNew: setIsNew,
				getReportInfo: function () {
					return reportNameInfo;
				}
			};
		}]);

});
