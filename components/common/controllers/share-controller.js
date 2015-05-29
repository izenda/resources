angular
  .module('izendaCommonControls')
  .controller('IzendaShareController', [
    '$rootScope',
    '$scope',
    '$q',
    '$log',
    '$izendaUrl',
    '$izendaCommonQuery',
    izendaShareController]);

/**
 * Shedule controller
 */
function izendaShareController(
  $rootScope,
  $scope,
  $q,
  $log,
  $izendaUrl,
  $izendaCommonQuery) {
  'use strict';

  var _ = angular.element;
  var vm = this;

  vm.modalOpened = false;

  /**
   * Open modal dialog
   */
  vm.openModal = function () {
    vm.modalOpened = true;
  };

  /**
   * Close modal dialog
   */
  vm.closeModal = function (result) {
    vm.modalOpened = false;
    if (result) {
      $log.debug('Share done!');
    } else {
      $log.debug('Share cancelled!');
    }
  };

  /**
   * Initialize controller
   */
  vm.initialize = function () {
    $scope.$on('openShareModalEvent', function (event, args) {
      var share = new ShareControlContainer();
      share.initialize();
      vm.openModal();
    });
  };
}