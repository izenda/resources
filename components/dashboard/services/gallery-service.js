define(['../../common/services/services'], function () {

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
				isPlayRepeat: false,
				hasTiles: false
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
				galleryState.hasTiles = false;
			}

			// public api
			return {
				getGalleryState: getGalleryState,
				resetGalleryState: resetGalleryState
			};
		}]);

});
