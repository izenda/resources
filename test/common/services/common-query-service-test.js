/// <reference path="~/Resources/test/vendor/jquery-1.11.2.min.js"/>
/// <reference path="~/Resources/test/vendor/url-settings-test.js"/>
/// <reference path="~/Resources/test/tools/test-tools.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular-mocks.js"/>
/// <reference path="~/Resources/components/common/module-definition.js"/>
/// <reference path="~/Resources/components/common/services/url-service.js"/>
/// <reference path="~/Resources/components/common/services/rs-query-service.js"/>
/// <reference path="~/Resources/components/common/services/common-query-service.js"/>

/**
 * $izendaCommonQuery service tests
 */
describe('$izendaCommonQuery tests ->', function () {
  var $izendaCommonQuery, $httpBackend, urlSettings;

  // runs before tests
  beforeEach(function () {
    module('izendaQuery');
    inject(function (_$izendaCommonQuery_, _$httpBackend_) {
      $izendaCommonQuery = _$izendaCommonQuery_;
      $httpBackend = _$httpBackend_;
      urlSettings = new UrlSettings(); // UrlSettings stub which got from test/vendor/url-settings-test.js
    });
  });

  /**
   * tests for $izendaCommonQuery.checkReportSetExist(...)
   * Adhoc API method: WebServiceRequestProcessor.CheckReportSetExists
   */
  describe('$izendaCommonQuery.checkReportSetExist test ->', function () {

    /**
     * Find report set test
     */
    it('Should find report set', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=checkreportsetexists&wsarg0=' +
            encodeURIComponent('test category\\test report'), 'true');
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=checkreportsetexists&wsarg0=' +
            encodeURIComponent('test category\\test report2'), 'false');

      $izendaCommonQuery.checkReportSetExist('test category\\test report').then(function (data) {
        expect(data).toBe('true');
      });
      $httpBackend.flush();

      // without parameter
      $izendaCommonQuery.checkReportSetExist('test category\\test report2').then(function (data) {
        expect(data).toBe('false');
      });
      testTools.endRequest($httpBackend);
    });

    /**
     * Arguments test
     */
    it('Should throw error when parameter isn\'t set', function () {
      // without parameter
      expect(function () {
        $izendaCommonQuery.checkReportSetExist();
        $httpBackend.flush();
      }).toThrow();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  /**
   * tests for $izendaCommonQuery.getReportSetCategory(...)
   * Adhoc API method: WebServiceRequestProcessor.GetReportListDataLite
   */
  describe('$izendaCommonQuery.getReportSetCategory test ->', function () {

    /**
     * Get report set category test
     */
    it('Should return report set category', function () {
      var reportListData = testTools.createReportListData({
        'test category': ['report1', 'report2', 'report3']
      });
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=reportlistdatalite&wsarg0=' +
            encodeURIComponent('test category'), reportListData);
      
      $izendaCommonQuery.getReportSetCategory('test category').then(function (data) {
        expect(data.ReportSets).toBeDefined();
        expect(data.ReportSets.length).toBe(3);
        expect(data.Recent.length).toBe(0);
        expect(data.Frequent.length).toBe(0);
        expect(data.ReportSets[0].Category).toBe('test category');
      });
      testTools.endRequest($httpBackend);
    });

    /**
     * Get uncategorized report sets
     */
    it('Should return uncategorized category', function() {
      var reportListData = testTools.createReportListData({
        '': ['report1', 'report2', 'report3']
      });
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=reportlistdatalite&wsarg0=', reportListData);
      $izendaCommonQuery.getReportSetCategory('uncategorized').then(function (data) {
        expect(data.ReportSets).toBeDefined();
        expect(data.ReportSets.length).toBe(3);
        expect(data.Recent.length).toBe(0);
        expect(data.Frequent.length).toBe(0);
        expect(data.ReportSets[0].Category).toBe('');
      });
      testTools.endRequest($httpBackend);
    });
  });

  /**
   * tests for $izendaCommonQuery.getReportParts(...)
   * Adhoc API method: WebServiceRequestProcessor.GetReportData
   */
  describe('$izendaCommonQuery.getReportParts test ->', function () {
    /**
     * Get report set category test
     */
    it('Should return report set category', function () {
      var reportName = 'test category\\test report';
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=reportdata&wsarg0=' + encodeURIComponent(reportName),
            testTools.createReportData());

      $izendaCommonQuery.getReportParts(reportName).then(function (data) {
        expect(data.Reports).toBeDefined();
        expect(angular.isArray(data.Reports)).toBe(true);
        expect(data.Reports.length).toBe(3);
      });
      testTools.endRequest($httpBackend);
    });
  });
});
