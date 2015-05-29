testTools = {
  // Create $httpBackend endpoint.
  createRsPageUrlHandler: function ($httpBackend, urlSettings, rsParameters, expectedResult) {
    var url = urlSettings.urlRsPage + rsParameters;
    $httpBackend.when('GET', url).respond(expectedResult);
  },

  // Complete request
  endRequest: function ($httpBackend) {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  },

  // Create report list data mock object (serialized Izenda.AdHoc.Webservices.ReportListDataLite object)
  createReportListData: function (categoriesWithReports) {
    var result = [];
    for (var category in categoriesWithReports) {
      var reports = categoriesWithReports[category];
      if (angular.isArray(reports) && reports.length > 0) {
        for (var i = 0; i < reports.length; i++) {
          var obj = {
            Name: reports[i],
            Category: category
          };
          result.push(obj);
        }
      } else {
        var categoryObj = {
          Name: null,
          Category: category,
          UrlEncodedName: null,
          UrlEncodedCategory: encodeURIComponent(category)
        };
        result.push(categoryObj);
      }
    }
    return {
      'ReportSets': result,
      'Recent': [],
      'Frequent': []
    };
  },

  // Create report data mock object (serialized Izenda.AdHoc.Webservices.ReportSetData object)
  createReportData: function () {
    var baseObject = {
      ReportID: null,
      ImgUrl: null,
      Name: null,
      Category: null,
      FullName: null,
      ReadOnly: false,
      ViewOnly: false,
      Locked: false,
      CreatedDate: null,
      ModifiedDate: null,
      TenantID: null,
      DataSourcesUsed: null,
      FilterTables: null,
      FieldsUsed: null,
      Dashboard: false,
      UrlEncodedName: null,
      OwnerName: null
    };
    return {
      Reports: [angular.extend({}, baseObject, {
        ReportID: 'id1',
        ImgUrl: 'url1',
        Name: 'name1',
        Category: 'category1',
        FullName: 'category1\\name1',
        UrlEncodedName: encodeURIComponent('category1\\name1')
      }), angular.extend({}, baseObject, {
        ReportID: 'id2',
        ImgUrl: 'url2',
        Name: 'name2',
        Category: 'category2',
        FullName: 'category2\\name2',
        UrlEncodedName: encodeURIComponent('category2\\name2')
      }), angular.extend({}, baseObject, {
        ReportID: 'id3',
        ImgUrl: 'url3',
        Name: 'name3',
        Category: 'category1',
        FullName: 'category1\\name3',
        UrlEncodedName: encodeURIComponent('category1\\name3')
      })]
    };
  }
};