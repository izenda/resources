/// <reference path="~/Resources/test/vendor/jquery-1.11.2.min.js"/>
/// <reference path="~/Resources/test/vendor/url-settings-test.js"/>
/// <reference path="~/Resources/test/tools/test-tools.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular-mocks.js"/>
/// <reference path="~/Resources/components/common/module-definition.js"/>
/// <reference path="~/Resources/components/common/services/url-service.js"/>
/// <reference path="~/Resources/components/common/services/compatibility-service.js"/>
/// <reference path="~/Resources/components/common/services/rs-query-service.js"/>
/// <reference path="~/Resources/components/common/services/common-query-service.js"/>
/// <reference path="~/Resources/components/common/controllers/select-report-name-controller.js"/>

/**
 * IzendaSelectReportNameController tests
 */
describe('IzendaSelectReportNameController tests ->', function () {
  var $rootScope, $controller, $httpBackend, urlSettings, $location, $browser;

  // runs before tests
  beforeEach(function () {
    module('izendaCommonControls');
    inject(function (_$rootScope_, _$controller_, _$httpBackend_, _$location_, _$browser_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $browser = _$browser_;
      urlSettings = new UrlSettings(); // UrlSettings stub which got from test/vendor/url-settings-test.js
    });
  });
  // runs after tests
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  /**
   * Create empty controller helper function
   */
  var createController = function ($scope) {
    var controller = $controller('IzendaSelectReportNameController', {
      $scope: $scope
    });
    controller.initialize();
    return controller;
  };

  /**
   * Set current dashobard browser url
   */
  var setCurrentDashboardLocation = function (name, category) {
    if (angular.isString(category))
      $location.path('/' + category + '/' + name);
    else
      $location.path('/' + name);
  };

  /**
   * Test controller initialization
   */
  describe('IzendaSelectReportNameController initialization test ->', function() {

    /**
     * Initialization test
     */
    it('Should initialize', function () {
      var $scope = $rootScope.$new();
      var controller = createController($scope);
      controller.initialize();
    });

    /**
     * External event test
     */
    it('Should react on openSelectReportNameModalEvent', function () {
      var reportListData = testTools.createReportListData({
        '': ['report1', 'report2', 'report3']
      });
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=reportlistdatalite&wsarg0=', reportListData);

      var $scope = $rootScope.$new();
      var controller = createController($scope);
      controller.initialize();
      $scope.$broadcast('openSelectReportNameModalEvent', []);
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      expect(controller.isNewReportDialog).toBe(false);
      expect(controller.modalOpened).toBe(true);
    });

    /**
     * Load categories test
     */
    it('Should load categories properly', function () {
      var testCategory = 'test category';
      var reportListData = testTools.createReportListData({
        'test category': ['report1', 'report2', 'report3']
      });
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=reportlistdatalite&wsarg0=', reportListData);

      var $scope = $rootScope.$new();
      var controller = createController($scope);
      controller.show();
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      expect(controller.categories.length).toBe(3);
      expect(controller.categories[0].name).toBe(controller.CREATE_NEW_TEXT);
      expect(controller.categories[1].name).toBe(controller.UNCATEGORIZED_TEXT);
      expect(controller.categories[2].name).toBe(testCategory);
    });

    /**
     * Form validation test: check empty report name
     */
    it('Should validate empty report name', function() {
      var $scope = $rootScope.$new();
      var controller = createController($scope);

      // test empty report 1
      controller.resetForm();
      controller.reportName = '';
      controller.validateForm().then(function () {
      }, function () {
        expect(controller.errorMessages.length).toBe(1);
        expect(controller.errorMessages[0]).toBe(controller.ERROR_REPORT_NAME_EMPTY);
      });
    });

    /**
     * Form validation test: check for creating category which duplicates existing
     */
    it('Should validate duplicate category when creating new category', function() {
      var $scope = $rootScope.$new();
      var controller = createController($scope);

      var sameCategoryName = 'category 1';
      controller.reportName = 'test report';
      controller.newCategoryName = sameCategoryName;
      controller.isCreatingNewCategory = true;
      controller.categories.push({
        id: 0, name: controller.CREATE_NEW_TEXT
      }, {
        id: 1, name: controller.UNCATEGORIZED_TEXT
      }, {
        id: 2, name: sameCategoryName
      });
      controller.validateForm().then(function () {
      }, function () {
        expect(controller.errorMessages.length).toBe(1);
        expect(controller.errorMessages[0]).toBe(controller.ERROR_CATEGORY_EXIST(sameCategoryName));
      });
    });

    /**
     * Form validation test: check existing report
     */
    it('Should validate duplicate report', function () {
      var reportListData = testTools.createReportListData({
        '': ['undefinedreport1', 'undefinedreport2'],
        'category1': null,
        'category2': null,
        'currentcategory': null
      });
      var reportListData2 = testTools.createReportListData({
        'currentcategory': ['report1', 'report2', 'report3']
      });

      testTools.createRsPageUrlHandler($httpBackend, urlSettings,
            '?wscmd=reportlistdatalite&wsarg0=', reportListData);
      testTools.createRsPageUrlHandler($httpBackend, urlSettings,
            '?wscmd=reportlistdatalite&wsarg0=currentcategory', reportListData2);
      setCurrentDashboardLocation('currentreport', 'currentcategory');

      // initialize controller
      var $scope = $rootScope.$new();
      var controller = createController($scope);
      controller.show();
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      // categories loaded
      expect(controller.categories.length).toBe(5);

      // set name: uncategorized\undefinedreport1. it should throw already exist error:
      var selectedUncategorizedCategory = controller.getCategoryObjectByName(controller.UNCATEGORIZED_TEXT);
      controller.selectedCategoryId = selectedUncategorizedCategory.id;
      controller.reportName = 'undefinedreport1';
      controller.validateForm().then(function () {
        throw new Error('Should not validate');
      }, function () {
        expect(controller.errorMessages.length).toBe(1);
        expect(controller.errorMessages[0]).toBe(controller.ERROR_REPORT_EXIST('Uncategorized\\undefinedreport1'));
      });
    });

    /**
     * Form validation test: check existing report 2
     */
    it('Should validate duplicate report 2', function () {
      var reportListData = testTools.createReportListData({
        '': ['undefinedreport1', 'undefinedreport2'],
        'category1': null,
        'category2': null,
        'currentcategory': null
      });
      var reportListData2 = testTools.createReportListData({
        'currentcategory': ['report1', 'report2', 'report3']
      });

      testTools.createRsPageUrlHandler($httpBackend, urlSettings,
            '?wscmd=reportlistdatalite&wsarg0=', reportListData);
      testTools.createRsPageUrlHandler($httpBackend, urlSettings,
            '?wscmd=reportlistdatalite&wsarg0=currentcategory', reportListData2);
      setCurrentDashboardLocation('currentreport', 'currentcategory');

      // initialize controller
      var $scope = $rootScope.$new();
      var controller = createController($scope);
      controller.show();
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      // categories loaded
      expect(controller.categories.length).toBe(5);

      // set name: currentcategory\report2. it should load category reports and throw already exist error:
      var selectedUncategorizedCategory = controller.getCategoryObjectByName('currentcategory');
      controller.selectedCategoryId = selectedUncategorizedCategory.id;
      controller.reportName = 'report2';
      controller.validateForm().then(function () {
        throw new Error('Should not validate');
      }, function () {
        expect(controller.errorMessages.length).toBe(1);
        expect(controller.errorMessages[0]).toBe(controller.ERROR_REPORT_EXIST('currentcategory\\report2'));
      });
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
