/**
 * Gallery service. Stores gallery variables
 */
angular.module('izendaDashboard')
	.factory('$izendaGalleryService', [function () {
		'use strict';

		var galleryState = {
			isGalleryEnabled: false,
			isPlayStarted: false,
			isGalleryFullScreen: false,
			playDelay: false,
			isPlayRepeat: false
		};

		/**
		 * Gallery state getter
		 */
		function getGalleryState() {
			return galleryState;
		}

		/**
		 * Switch gallery state to its default value.
		 */
		function resetGalleryState() {
			galleryState.isGalleryEnabled = false;
			galleryState.isPlayStarted = false;
			galleryState.isPlayRepeat = false;
			galleryState.isGalleryFullScreen = false;
			galleryState.playDelay = 5000;
		}

		// public api
		return {
			getGalleryState: getGalleryState,
			resetGalleryState: resetGalleryState
		};
	}]);
