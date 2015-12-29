angular
.module('izendaQuery')
.factory('$izendaUrl', [
	'$window',
	'$rootScope',
	'$location',
	'$log',
	'$izendaRsQuery',
	'$izendaCommonQuery',
	'$izendaPing',
	function ($window, $rootScope, $location, $log, $izendaRsQuery, $izendaCommonQuery, $izendaPing) {
		'use strict';

		var urlSettings = $window.urlSettings$;

		var UNCATEGORIZED = 'Uncategorized';

		var reportNameInfo;

		/**
		* Extract report name from category\report full name
		*/
		function extractName(fullName) {
			if (angular.isString(fullName)) {
				var reportFullNameParts = fullName.split('\\');
				return reportFullNameParts[reportFullNameParts.length - 1];
			} else
				throw 'Can\'t extract category from object ' + fullName + 'with type ' + typeof (fullName);
		}

		/**
		* Extract report category from "category\report full name
		*/
		var extractCategory = function(fullName) {
			if (angular.isString(fullName)) {
				var reportFullNameParts = fullName.split('\\');
				var category;
				if (reportFullNameParts.length >= 2)
					category = reportFullNameParts.slice(0, reportFullNameParts.length - 1).join('\\');
				else
					category = UNCATEGORIZED;
				return category;
			} else
				throw 'Can\'t extract category from object ' + fullName + 'with type ' + typeof (fullName);
		};

		/**
		* Extract report name, category, report set name for report part.
		*/
		var extractReportPart = function(reportFullName, isPartNameAtRight) {
			if (reportFullName == null)
				throw 'Full name is null';

			var result = {
				reportPartName: null,
				reportFullName: reportFullName
			};
			// extract report part name
			var reportSetName = reportFullName;
			if (reportFullName.indexOf('@') >= 0) {
				var parts = reportFullName.split('@');
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
			result.reportName = extractName(reportSetName);
			result.reportCategory = extractCategory(reportSetName);
			result.reportNameWithCategory = result.reportName;
			if (result.reportCategory !== UNCATEGORIZED)
				result.reportNameWithCategory = result.reportCategory + '\\' + result.reportNameWithCategory;
			result.reportFullName = (result.reportPartName != null ? result.reportPartName + '@' : '') + result.reportSetName;
			return result;
		};

		/**
		* Set report name and category to location
		*/
		var setLocation = function (reportNameObject) {
			var path = '';
			if (reportNameObject.isNew) {
				$location.path('');
				$location.search('new');
				return;
			}
			var category = reportNameObject['category'];
			if (angular.isString(category) && category !== UNCATEGORIZED) {
				var reportCategoryFixed = reportNameObject['category'].split('\\').join('/');
				if (reportCategoryFixed.indexOf('/') !== 0) {
					reportCategoryFixed = '/' + reportCategoryFixed;
				}
				path = reportCategoryFixed;
			}
			path += '/' + reportNameObject['name'];

			$location.search('new', null);
			$location.path(path);
		};

		/**
		* Returns report full name (category delimiter: '/')
		*/
		var getLocation = function () {
			var result = {
				fullName: null,
				category: null,
				name: null,
				isNew: false
			};
			var path = $location.path();
			if (path !== '' && path !== '/') {
				if (path.indexOf('/') === 0) {
					path = path.slice(1, path.length);
				}
				path = path.split('/').join('\\');
				result['fullName'] = path;
				result['category'] = extractCategory(path);
				result['name'] = extractName(path);
			} else {
				var newParameter = $location.search()['new'];
				if (angular.isDefined(newParameter)) {
					result['isNew'] = true;
				} else {
					setLocation({
						isNew: true
					});
				}
			}
			return result;
		};

		/**
		* Set report name and category to location
		*/
		var setReportFullName = function (fullName) {
			setLocation({
				fullName: fullName,
				name: extractName(fullName),
				category: extractCategory(fullName),
				isNew: false
			});
		};

		var setIsNew = function () {
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
		$izendaPing.startPing(10000);

		return {
			settings: urlSettings,
			extractReportName: extractName,
			extractReportCategory: extractCategory,
			extractReportPartNames: extractReportPart,
			setReportFullName: setReportFullName,
			setIsNew: setIsNew,
			getReportInfo: function () {
				return reportNameInfo;
			}
		};
	}]);

