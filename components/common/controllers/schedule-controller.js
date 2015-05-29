angular
  .module('izendaCommonControls')
  .controller('IzendaScheduleController', [
    '$rootScope',
    '$scope',
    '$q',
    '$log',
    '$izendaUrl',
    '$izendaCommonQuery',
    izendaScheduleController]);

/**
 * Schedule controller
 * TODO: now used IzendaScheduleControl javascript object. But we have to move logic to this controller in future
 */
function izendaScheduleController(
  $rootScope,
  $scope,
  $q,
  $log,
  $izendaUrl,
  $izendaCommonQuery) {
  'use strict';

  var vm = this;

  vm.modalOpened = false;
  vm.scheduleControl = null; // object IzendaScheduleControl

  /**
   * Open modal dialog
   */
  vm.openModal = function() {
    vm.modalOpened = true;
  };

  /**
   * Close modal dialog
   */
  vm.closeModal = function (result) {
    vm.modalOpened = false;
    if (result) {
      $log.debug('Schedule done!');
    } else {
      $log.debug('Schedule cancelled!');
    }
  };

  /**
   * Initialize controller
   */
  vm.initialize = function() {
    $scope.$on('openScheduleModalEvent', function () {
      vm.scheduleControl = new IzendaScheduleControl();
      vm.openModal();
    });
  };
}