izendaRequire.define([
	'angular',
	'vendor/custom/msie-detect',
	'../module-definition'
], function (angular, msieDetect) {

	angular.module('izenda.common.core').factory('$izendaCompatibility', [
		'$window',
		'$log',
		function ($window, $log) {
			'use strict';
			var currentRights;
			var showSaveControls;
			var showSaveAsToolbarButton;
			var rightNone = "None",
					rightReadOnly = "Read Only",
					rightViewOnly = "View Only",
					rightLocked = "Locked",
					rightFullAccess = "Full Access";
			var isIE8 = msieDetect.isSpecificIeVersion(8, 'lte');
			var isLteIE10 = msieDetect.isSpecificIeVersion(10, 'lte');
			var isGteIE9 = msieDetect.isSpecificIeVersion(10, 'gte');
			var checkIsIe8 = function () {
				return isIE8;
			};

			var checkIE = function () {
				return isGteIE9;
			};

			var checkIsLteIe10 = function () {
				return isLteIE10;
			};

			var isHtml5FullScreenSupported = function () {
				return !isLteIE10 && (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled);
			};

			/**
			 * Check is page should have mobile view.
			 */
			var isMobile = function () {
				return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			};

			/**
			 * Check is page window is too small to fit several columns of tiles.
			 */
			var isSmallResolution = function () {
				return $window.innerWidth <= 991;
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

			var setShowSaveControls = function (flagValue) {
				showSaveControls = flagValue;
			};

			var getShowSaveControls = function () {
				var result = true;
				if (angular.isDefined(showSaveControls))
					result = showSaveControls;
				return result;
			};

			var setShowSaveAsToolbarButton = function (flagValue) {
				showSaveAsToolbarButton = flagValue;
			};

			var getShowSaveAsToolbarButton = function () {
				var result = true;
				if (angular.isDefined(showSaveAsToolbarButton))
					result = showSaveAsToolbarButton;
				return result;
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

			/**
			 * Check is tile editing allowed
			 */
			var isFullAccess = function () {
				var rights = getRights();
				var allowed = [rightFullAccess].indexOf(rights) >= 0;
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
			var isSaveAsAllowed = function () {
				var rights = getRights();
				var allowed = [rightFullAccess, rightReadOnly].indexOf(rights) >= 0;
				allowed = allowed && !checkIsIe8();
				return allowed;
			};

			var isSaveAllowed = function () {
				var rights = getRights();
				var allowed = [rightFullAccess].indexOf(rights) >= 0;
				allowed = allowed && !checkIsIe8();
				return allowed;
			};

			var isShowSaveControls = function () {
				return getShowSaveControls();
			};

			var isShowSaveAsToolbarButton = function () {
				return getShowSaveAsToolbarButton();
			};

			/**
			 * Check is filters editing allowed
			 */
			var isFiltersEditAllowed = function () {
				var rights = getRights();
				var allowed = [rightFullAccess, rightReadOnly, rightLocked].indexOf(rights) >= 0;
				allowed = allowed && !checkIsIe8();
				return allowed;
			};

			return {
				RIGHT_FULL_ACCESS: rightFullAccess,
				RIGHT_READ_ONLY: rightReadOnly,
				RIGHT_VIEW_ONLY: rightViewOnly,
				RIGHT_LOCKED: rightLocked,
				RIGHT_NONE: rightNone,
				checkIE: checkIE,
				checkIsIe8: checkIsIe8,
				checkIsLteIe10: checkIsLteIe10,
				isMobile: isMobile,
				isSmallResolution: isSmallResolution,
				isOneColumnView: isOneColumnView,
				isShowSaveControls: isShowSaveControls,
				isShowSaveAsToolbarButton: isShowSaveAsToolbarButton,
				isHtml5FullScreenSupported: isHtml5FullScreenSupported,
				isEditAllowed: isEditAllowed,
				isFullAccess: isFullAccess,
				isSaveAllowed: isSaveAllowed,
				isSaveAsAllowed: isSaveAsAllowed,
				isFiltersEditAllowed: isFiltersEditAllowed,
				setRights: setRights,
				setShowSaveControls: setShowSaveControls,
				setShowSaveAsToolbarButton: setShowSaveAsToolbarButton,
				getRights: getRights,
				getShowSaveControls: getShowSaveControls,
				getShowSaveAsToolbarButton: getShowSaveAsToolbarButton
			};
		}]);

});