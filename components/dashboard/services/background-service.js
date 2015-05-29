/**
 * Background image/color storage service
 */
angular
  .module('izendaQuery')
  .factory('$izendaBackground', ['$log', '$cookies', function ($log, $cookies) {
    'use strict';

    /**
     * Get cookie by name
     */
    function getCookie(name) {
      return $cookies[name];
      /*var result = null;
      var nameEq = name + "=";
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) === ' ')
          cookie = cookie.substring(1);
        if (cookie.indexOf(nameEq) !== -1)
          result = cookie.substring(nameEq.length, cookie.length);
      }
      return result;*/
    };

    function setCookie(name, value) {
      $cookies[name] = value;
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
      setBackgroundColor: setBackgroundColor
    };
  }]);
