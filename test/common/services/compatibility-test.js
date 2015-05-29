/// <reference path="~/Resources/test/vendor/jquery-1.11.2.min.js"/>
/// <reference path="~/Resources/test/vendor/url-settings-test.js"/>
/// <reference path="~/Resources/test/tools/test-tools.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular-mocks.js"/>
/// <reference path="~/Resources/components/common/module-definition.js"/>
/// <reference path="~/Resources/components/common/services/compatibility-service.js"/>
describe('common module compatibility tests ->', function () {
  var $izendaCompatibility, $window;
  var rightNone = "None",
          rightReadOnly = "Read Only",
          rightViewOnly = "View Only",
          rightLocked = "Locked",
          rightFullAccess = "Full Access";

  beforeEach(function () {
    module('izendaCompatibility', function($provide) {
      var myMock = {
        innerHeight: 800,
        innerWidth: 1025
      };
      $provide.value('$window', myMock);
    });
    inject(function (_$window_, _$izendaCompatibility_) {
      $izendaCompatibility = _$izendaCompatibility_;
      $window = _$window_;
    });
  });

  /**
   * Is IE8 function test (will fail if we'll test in IE8 enviriment)
   */
  describe('check checkIsIe8 test ->', function () {
    it('should have an checkIsIe8 function', function () {
      expect(angular.isFunction($izendaCompatibility.checkIsIe8)).toBe(true);
    });
    it('should not to be ie8', function () {
      var result = $izendaCompatibility.checkIsIe8();
      expect(result).not.toBeTruthy();
    });
  });

  /**
   * $izendaCompatibility.isMobile function test
   */
  describe('check isMobile test ->', function () {
    it('should have an isMobile function', function () {
      expect(angular.isFunction($izendaCompatibility.isMobile)).toBe(true);
    });
    it('should not to be isMobile', function () {
      var result = $izendaCompatibility.isMobile();
      expect(result).not.toBeTruthy();
    });
  });

  /**
   * Check isFullAccess
   */
  describe('$izendaCompatibility.rights tests ->', function () {

    it('Full Access tests', function () {
      $izendaCompatibility.setRights(rightFullAccess);
      expect($window.innerWidth).toBeGreaterThan(1024);
      expect($izendaCompatibility.isSmallResolution()).toBe(false);
      expect($izendaCompatibility.isFullAccess()).toBe(true);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(true);
      expect($izendaCompatibility.isEditAllowed()).toBe(true);
      expect($izendaCompatibility.isSaveAsAllowed()).toBe(true);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(true);
    });

    it('Read Only tests', function () {
      $izendaCompatibility.setRights(rightReadOnly);
      expect($window.innerWidth).toBeGreaterThan(1024);
      expect($izendaCompatibility.isSmallResolution()).toBe(false);
      expect($izendaCompatibility.isFullAccess()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(true);
      expect($izendaCompatibility.isEditAllowed()).toBe(true);
      expect($izendaCompatibility.isSaveAsAllowed()).toBe(true);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(true);
    });

    it('View Only tests', function () {
      $izendaCompatibility.setRights(rightViewOnly);
      expect($window.innerWidth).toBeGreaterThan(1024);
      expect($izendaCompatibility.isSmallResolution()).toBe(false);
      expect($izendaCompatibility.isFullAccess()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(false);
      expect($izendaCompatibility.isEditAllowed()).toBe(false);
      expect($izendaCompatibility.isSaveAsAllowed()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(false);
    });

    it('Locked tests', function () {
      $izendaCompatibility.setRights(rightLocked);
      expect($window.innerWidth).toBeGreaterThan(1024);
      expect($izendaCompatibility.isSmallResolution()).toBe(false);
      expect($izendaCompatibility.isFullAccess()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(true);
      expect($izendaCompatibility.isEditAllowed()).toBe(false);
      expect($izendaCompatibility.isSaveAsAllowed()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(true);
    });

    it('None tests', function () {
      $izendaCompatibility.setRights(rightNone);
      expect($window.innerWidth).toBeGreaterThan(1024);
      expect($izendaCompatibility.isSmallResolution()).toBe(false);
      expect($izendaCompatibility.isFullAccess()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(false);
      expect($izendaCompatibility.isEditAllowed()).toBe(false);
      expect($izendaCompatibility.isSaveAsAllowed()).toBe(false);
      expect($izendaCompatibility.isFiltersEditAllowed()).toBe(false);
    });
  });
});
