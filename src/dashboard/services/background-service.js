izendaRequire.define([
	'angular'
], function (angular) {

	/**
	* Background image/color storage service
	*/
	angular
		.module('izendaDashboard')
		.factory('$izendaBackground', ['$log', '$cookies', function ($log, $cookies) {
			'use strict';

			function getCookie(name) {
				return $cookies.get(name);
			};

			function setCookie(name, value) {
				$cookies.put(name, value);
			}

			function setBackgroundColor(color) {
				setCookie('izendaDashboardBackgroundColor', color);
			}

			/**
			* Get background color from cookie for dashboard.
			*/
			function getBackgroundColor() {
				var backColor = getCookie('izendaDashboardBackgroundColor');
				return backColor ? backColor : '#1c8fd6';
			}

			function getBackgroundRepeat() {
				var izendaBackgroundImageRepeat = getCookie('izendaBackgroundImageRepeat');
				return izendaBackgroundImageRepeat === 'true';
			}

			function setBackgroundRepeat(value) {
				setCookie('izendaBackgroundImageRepeat', value);
			}

			/**
			* Check storage supported by browser
			*/
			function isStorageAvailable() {
				return typeof (Storage) !== 'undefined';
			}

			/**
			* Set background base64 string to storage.
			*/
			function setBackgroundImgToStorage(stringValue) {
				var result = isStorageAvailable();
				if (result) {
					if (stringValue != null)
						localStorage.setItem('izendaDashboardBackgroundImg', stringValue);
					else
						localStorage.removeItem('izendaDashboardBackgroundImg');
				}
				return result;
			}

			/**
			* Get object from storage
			*/
			function getBackgroundImgFromStorage() {
				var result = null;
				if (isStorageAvailable()) {
					var dataImage = localStorage.getItem('izendaDashboardBackgroundImg');
					if (angular.isString(dataImage))
						result = dataImage;
				}
				return result;
			}

			// PUBLIC API
			return {
				isStorageAvailable: isStorageAvailable,
				setBackgroundImgToStorage: setBackgroundImgToStorage,
				getBackgroundImgFromStorage: getBackgroundImgFromStorage,
				getBackgroundColor: getBackgroundColor,
				setBackgroundColor: setBackgroundColor,
				setBackgroundRepeat: setBackgroundRepeat,
				getBackgroundRepeat: getBackgroundRepeat
			};
		}]);

});