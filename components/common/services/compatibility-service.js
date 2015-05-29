angular
  .module('izendaCompatibility')
  .factory('$izendaCompatibility', [
    '$window',
    '$log',
    function ($window, $log) {
      'use strict';
      var currentRights;
      var rightNone = "None",
          rightReadOnly = "Read Only",
          rightViewOnly = "View Only",
          rightLocked = "Locked",
          rightFullAccess = "Full Access";

      var checkIsIe8 = function () {
        var isSpecificIeVersion = function (version, comparison) {
          var ieCompareOperator = 'IE',
              b = document.createElement('B'),
              docElem = document.documentElement,
              isIeResult;
          if (version) {
            ieCompareOperator += ' ' + version;
            if (comparison) {
              ieCompareOperator = comparison + ' ' + ieCompareOperator;
            }
          }
          b.innerHTML = '<!--[if ' + ieCompareOperator + ']><b id="iecctest"></b><![endif]-->';
          docElem.appendChild(b);
          isIeResult = !!document.getElementById('iecctest');
          docElem.removeChild(b);
          var isCompatibilityMode = (typeof (document.documentMode) !== 'undefined') &&
          ((comparison === 'lte' && document.documentMode <= version)
            || (comparison === 'gte' && document.documentMode >= version)
            || (comparison === 'lt' && document.documentMode < version)
            || (comparison === 'gt' && document.documentMode > version)
            || (comparison === 'eq' && document.documentMode == version));
          return isIeResult || isCompatibilityMode;
        };
        return isSpecificIeVersion(8, 'lte');
      };

      var checkIsLteIe10 = function () {
        return jq$.browser.msie && jq$.browser.version <= 10;
      };

      /**
       * Check is dashboard should have mobile view.
       */
      var isMobile = function () {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      };

      /**
       * Check is dashboard window is too small to fit several columns of tiles.
       */
      var isSmallResolution = function () {
        return $window.innerWidth <= 1024;
      };

      /**
       * Check if one column view required
       */
      var isOneColumnView = function () {
        return isMobile() || isSmallResolution();
      };

      /**
       * Set rights for current dashboard
       */
      var setRights = function (rights) {
        currentRights = rights;
      };

      /**
       * Check is tile editing allowed
       */
      var isFullAccess = function () {
        var rights = getRights();
        var allowed = [rightFullAccess].indexOf(rights) >= 0;
        allowed = allowed && !isOneColumnView();
        allowed = allowed && !checkIsIe8();
        return allowed;
      };

      /**
       * Check is tile editing allowed
       */
      var isEditAllowed = function () {
        var rights = getRights();
        var allowed = [rightFullAccess, rightReadOnly].indexOf(rights) >= 0;
        allowed = allowed && !isOneColumnView();
        allowed = allowed && !checkIsIe8();
        return allowed;
      };

      /**
       * Check is save allowed
       */
      var isSaveAsAllowed = function() {
        var rights = getRights();
        var allowed = [rightFullAccess, rightReadOnly].indexOf(rights) >= 0;
        allowed = allowed && !isOneColumnView();
        allowed = allowed && !checkIsIe8();
        return allowed;
      };

      /**
       * Check is filters editing allowed
       */
      var isFiltersEditAllowed = function() {
        var rights = getRights();
        var allowed = [rightFullAccess, rightReadOnly, rightLocked].indexOf(rights) >= 0;
        allowed = allowed && !isOneColumnView();
        allowed = allowed && !checkIsIe8();
        return allowed;
      };

      /**
       * Get current rights
       */
      var getRights = function () {
        var result = rightNone;
        // rights default value:
        if (angular.isDefined(currentRights))
          result = currentRights;
        return result;
      };

      return {
        checkIsIe8: checkIsIe8,
        checkIsLteIe10: checkIsLteIe10,
        isMobile: isMobile,
        isSmallResolution: isSmallResolution,
        isOneColumnView: isOneColumnView,
        isEditAllowed: isEditAllowed,
        isFullAccess: isFullAccess,
        isSaveAsAllowed: isSaveAsAllowed,
        isFiltersEditAllowed: isFiltersEditAllowed,
        setRights: setRights,
        getRights: getRights
      };
    }]);