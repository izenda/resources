angular
  .module('izendaQuery')
  .factory('$izendaUrl', [
    '$window',
    '$location',
    '$log',
    function ($window, $location, $log) {
      'use strict';

      var urlSettings = new UrlSettings();

      /**
       * Get report full
       */
      function getReportInfoFromRn() {
        return urlSettings.reportInfo;
      }

      /**
       * Update report url: set parameter rn=reportFullName
       */
      function setReportFullName(reportFullName) {
        // add #/category/name parameter
        $location.path(reportFullName.replace('\\', '/'));
      }

      /**
       * Extract report name from category\report full name
       */
      function extractReportName(fullName) {
        var result = null;
        if (angular.isString(fullName)) {
          var reportFullNameParts = fullName.split('\\');
          result = reportFullNameParts[reportFullNameParts.length - 1];
        }
        return result;
      }

      /**
       * Extract report category from category\report full name
       */
      function extractReportCategory(fullName) {
        if (!angular.isString(fullName))
          return 'Uncategorized';
        var reportFullNameParts = fullName.split('\\');
        if (reportFullNameParts.length === 2)
          return reportFullNameParts[0];
        else
          return 'Uncategorized';
      }

      /**
       * Extract report name, category, report set name for report part.
       */
      function extractReportPartNames(reportFullName, isPartNameAtRight) {
        if (reportFullName == null)
          throw 'full name is null';
        var parseReportSetName = function (rsName) {
          var separatorIndex = rsName.lastIndexOf('\\');
          if (separatorIndex > 0) {
            return {
              reportCategory: rsName.substr(0, separatorIndex),
              reportName: rsName.substr(separatorIndex + 1)
            };
          }
          return {
            reportCategory: null,
            reportName: rsName
          };
        };

        var result = {
          reportPartName: null,
          reportFullName: reportFullName
        };
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

        var reportNameObj = parseReportSetName(reportSetName);
        result.reportSetName = reportSetName;
        result.reportName = reportNameObj.reportName;
        result.reportCategory = reportNameObj.reportCategory;
        result.reportNameWithCategory = result.reportName;
        if (result.reportCategory != null)
          result.reportNameWithCategory = result.reportCategory + '\\' + result.reportNameWithCategory;
        result.reportFullName = (result.reportPartName != null ? result.reportPartName + '@' : '') + result.reportSetName;
        return result;
      }

      /**
       * Get isNew parameter
       */
      function getIsNew() {
        var isNewParam = $location.search()['isNew'];
        // $location.search() return object with parameters
        // and if there is no such parameter - result will be undefined.
        if (angular.isUndefined(isNewParam)) {
          var reportInfoFromRn = getReportInfoFromRn();
          isNewParam = reportInfoFromRn.isNew;
        }
        return isNewParam;
      }

      /**
       * Get report full name from "#/category/reportname" or "rn=category\reportname" url parameters.
       */
      function getReportFullName() {
        var result = null;
        if ($location.path().trim() !== '') {
          var loc = $location.path();
          if ($location.path().charAt(0) === '/')
            loc = loc.substring(1);
          result = loc.replace('/', '\\');
        } else {
          // try to find "rn=..." parameter in url (for external links):
          var reportInfoFromRn = getReportInfoFromRn();
          if (angular.isString(reportInfoFromRn.fullName) && reportInfoFromRn.fullName !== '') {
            result = reportInfoFromRn.fullName.replace('/', '\\');
          }
        }
        return result;
      }

      function getReportCategory() {
        return extractReportCategory(getReportFullName());
      }

      function getReportName() {
        return extractReportName(getReportFullName());
      }

      /**
       * Get url settings for current report from url
       */
      function getReportInfo() {
        return {
          fullName: getReportFullName(),
          name: getReportName(),
          category: getReportCategory(),
          isNew: getIsNew()
        };
      }

      return {
        urlSettings: new UrlSettings(),
        extractReportName: extractReportName,
        extractReportCategory: extractReportCategory,
        extractReportPartNames: extractReportPartNames,
        setReportFullName: setReportFullName,
        getReportInfo: getReportInfo
      };
    }]);