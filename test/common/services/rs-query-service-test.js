/// <reference path="~/Resources/test/vendor/jquery-1.11.2.min.js"/>
/// <reference path="~/Resources/test/vendor/url-settings-test.js"/>
/// <reference path="~/Resources/test/tools/test-tools.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular.js"/>
/// <reference path="~/Resources/components/vendor/angular-1.3.14/angular-mocks.js"/>
/// <reference path="~/Resources/components/common/module-definition.js"/>
/// <reference path="~/Resources/components/common/services/url-service.js"/>
/// <reference path="~/Resources/components/common/services/rs-query-service.js"/>
/**
 * $izendaRsQuery service tests
 */
describe('$izendaRsQuery tests ->', function () {
  var $izendaRsQuery, $timeout, $httpBackend, urlSettings;

  // runs before tests
  beforeEach(function () {
    module('izendaQuery');
    inject(function (_$izendaRsQuery_, _$timeout_, _$httpBackend_) {
      $izendaRsQuery = _$izendaRsQuery_;
      $timeout = _$timeout_;
      $httpBackend = _$httpBackend_;
      urlSettings = new UrlSettings(); // UrlSettings stub which got from test/vendor/url-settings-test.js
    });
  });

  /**
   * tests for $izendaRsQuery.query(...)
   */
  describe('$izendaRsQuery.query test ->', function () {

    /**
     * Simple query test
     */
    it('Should handle custom $http query with text result', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test&wsarg0=arg0&wsarg1=arg1', 'Hello world!');
      var requestResult = $izendaRsQuery.query('test', ['arg0', 'arg1']);
      expect(requestResult.$$state.status).toBe(0);
      requestResult.then(function (data) {
        expect(data).toBe('Hello world!');
      });
      testTools.endRequest($httpBackend);
    });

    /**
     * Simple query test with json result
     */
    it('Should handle custom $http query with json result', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test&wsarg0=arg0&wsarg1=arg1', {
        jsonResultObject: 'test'
      });
      var requestResult = $izendaRsQuery.query('test', ['arg0', 'arg1'], {
        dataType: 'json'
      });
      expect(requestResult.$$state.status).toBe(0);
      requestResult.then(function (data) {
        expect(data.jsonResultObject).toBe('test');
      });
      testTools.endRequest($httpBackend);
    });

    /**
     * Query parameters test
     */
    it('Should work good without wsArgs parameter', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test', 'Hello world!');
      var requestResult = $izendaRsQuery.query('test');
      expect(requestResult.$$state.status).toBe(0);
      requestResult.then(function (data) {
        expect(data).toBe('Hello world!');
      });
      testTools.endRequest($httpBackend);
    });
    
    /**
     * Query parameters test
     */
    it('Should throw error when wsCmd is not set', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test', 'Hello world!');
      expect(function () {
        $izendaRsQuery.query();
        testTools.endRequest($httpBackend);
      }).toThrow();
    });

    /**
     * Query parameters test
     */
    it('Should throw error when wrong wsArgs parameter type', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test', 'Hello world!');
      expect(function () {
        $izendaRsQuery.query('test', 123);
        testTools.endRequest($httpBackend);
      }).toThrow();
    });
  });

  /**
   * tests for $izendaRsQuery.cancelAllQueries(...)
   */
  describe('$izendaRsQuery.cancelAllQueries test ->', function () {

    /**
     * test for cancel queries
     */
    it('Should cancel queries', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test', 'test');
      var requestsCount = 0;
      for (var i = 0; i < 10; i++) {
        $izendaRsQuery.query('test').then(function (data) {
          requestsCount++;
        });
      }
      // and cancel it before $httpBackend.flush() - emulate
      var queriesCancelled = $izendaRsQuery.cancelAllQueries();
      expect(queriesCancelled).toBe(10);
      expect(requestsCount).toBe(0);
      // flush should fail, because we cancel all queries in $izendaRsQuery.cancelAllQueries()
      // and it is should throw 'No pending request to flush!' error.
      expect(function () {
        $httpBackend.flush();
      }).toThrow();
      
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    /**
     * test for cancel queries except queries in ignore list
     */
    it('Should cancel queries except ignoreList', function () {
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=test', 'test');
      testTools.createRsPageUrlHandler($httpBackend, urlSettings, '?wscmd=testIgnored', 'testIgnored');

      var requestsCount = 0;
      for (var i = 0; i < 10; i++) {
        $izendaRsQuery.query('test').then(function (data) {
          requestsCount++;
        });
      }
      for (var j = 0; j < 10; j++) {
        $izendaRsQuery.query('testIgnored').then(function (data) {
          expect(data).toBe('testIgnored');
          requestsCount++;
        });
      }
      var queriesCancelled = $izendaRsQuery.cancelAllQueries({
        ignoreList: ['testIgnored']
      });
      expect(queriesCancelled).toBe(10);
      $httpBackend.flush();
      expect(requestsCount).toBe(10);

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
