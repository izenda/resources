describe('Common module tests', function () {
  it("should be registered izendaCompatibility module", function () {
    expect(angular.module("izendaCompatibility")).not.toEqual(null);
  });

  it("should be registered izendaQuery module", function () {
    expect(angular.module("izendaQuery")).not.toEqual(null);
  });

  it("should be registered izendaCommonControls module", function () {
    expect(angular.module("izendaCommonControls")).not.toEqual(null);
  });

  // check the dependencies:
  describe("Dependencies:", function () {
    var deps;
    var hasModule = function (m) {
      return deps.indexOf(m) >= 0;
    };
    beforeEach(function () {
      deps = angular.module("izendaCommonControls").value('appName').requires;
    });
    it("izendaCommonControls should have izendaCompatibility as a dependency", function () {
      expect(hasModule('izendaCompatibility')).toBeTruthy();
    });
    it("izendaCommonControls should have izendaQuery as a dependency", function () {
      expect(hasModule('izendaQuery')).toBeTruthy();
    });
  });
});