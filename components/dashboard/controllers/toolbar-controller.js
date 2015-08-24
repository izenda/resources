angular
  .module('izendaDashboard')
  .controller('IzendaToolbarController', [
    '$scope',
    '$rootScope',
    '$log',
    '$window',
    '$timeout',
    '$location',
    '$cookies',
    '$izendaCompatibility',
    '$izendaBackground',
    '$izendaSettings',
    '$izendaPing',
    '$izendaDashboardToolbarQuery',
    '$izendaUrl', izendaToolbarController]);

/**
   * Toolbar controller
   */
function izendaToolbarController(
  $scope,
  $rootScope,
  $log,
  $window,
  $timeout,
  $location,
  $cookies,
  $izendaCompatibility,
  $izendaBackground,
  $izendaSettings,
  $izendaPing,
  $izendaDashboardToolbarQuery,
  $izendaUrl) {

  'use strict';

  //////////////////////////////////////////////////////
  // VARS
  //////////////////////////////////////////////////////

  var vm = this;
  var _ = angular.element;

  /**
   * Get cookie by name
   */
  var getCookie = function (name) {
    var result = null;
    var nameEq = name + "=";
    var cookiesArray = document.cookie.split(';');
    for (var i = 0; i < cookiesArray.length; i++) {
      var cookieString = cookiesArray[i];
      while (cookieString.charAt(0) === ' ')
        cookieString = cookieString.substring(1);
      if (cookieString.indexOf(nameEq) !== -1)
        result = cookieString.substring(nameEq.length, cookieString.length);
    }
    return result;
  };

  vm.isIE8 = $izendaCompatibility.checkIsIe8();
  vm.isStorageAvailable = $izendaBackground.isStorageAvailable();
  vm.isPresentationModeEnable = !$izendaCompatibility.checkIsLteIe10();

  vm.backgroundModalRadio = 'url';
  vm.izendaUrl = $izendaUrl;
  vm.dashboardCategoriesLoading = true;
  vm.dashboardCategories = [];
  vm.dashboardsInCurrentCategory = [];
  vm.activeDashboard = null;
  vm.printMode = 'Html2PdfAndHtml';
  vm.isNewDashboard = true;

  vm.sendEmailModalOpened = false;
  vm.sendEmailState = {
    errors: [],
    isLoading: false,
    errorOccured: false,
    sendType: 'Link',
    email: '',
    opened: false
  };

  // background options
  var backColor = $izendaBackground.getBackgroundColor();
  vm.izendaBackgroundColor = backColor ? backColor : '#1c8fd6';
  vm.izendaBackgroundImageUrl = getCookie('izendaDashboardBackgroundImageUrl');
  vm.hueRotate = false;
  vm.selectBackgroundImageModalOpened = false; // background image dialog opened

  vm.isGalleryMode = false; // gallery mode
  vm.windowResizeOptions = {
    timeout: false,
    rtime: null,
    previousWidth: null
  };

  // triple bar button styles:
  vm.isButtonBarVisible = false;
  vm.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel left-transition';
  vm.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel left-transition opened';
  vm.buttonbarIe8Class = 'nav navbar-nav iz-dash-toolbtn-panel-ie8';
  vm.buttonbarCollapsedIe8Class = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel-ie8 opened';
  vm.showButtonBar = function () {
    vm.isButtonBarVisible = true;
    if (vm.isIE8) {
      vm.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel-ie8 opened';
      vm.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel-ie8';
    } else {
      vm.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel left-transition opened';
      vm.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel left-transition';
    }
  };
  vm.hideButtonBar = function () {
    vm.isButtonBarVisible = false;
    if (vm.isIE8) {
      vm.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel-ie8';
      vm.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel-ie8 opened';
    } else {
      vm.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel left-transition';
      vm.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel left-transition opened';
    }
    $timeout(function () {
      vm.updateToolbarItems();
    }, 200);
  };

  //////////////////////////////////////////////////////
  // PUBLIC
  //////////////////////////////////////////////////////

  vm.extractReportName = function(fullName) {
    return $izendaUrl.extractReportName(fullName);
  }

  /**
   * Check if one column view required
   */
  vm.isOneColumnView = function () {
    return $izendaCompatibility.isOneColumnView();
  };

  /**
   * Check is filters allowed
   */
  vm.isFullAccess = function () {
    return $izendaCompatibility.isFullAccess();
  };

  /**
   * Check is filters allowed
   */
  vm.isFiltersEditAllowed = function () {
    return $izendaCompatibility.isFiltersEditAllowed();
  };

  /**
   * Check is save as allowed
   */
  vm.isSaveAsAllowed = function () {
    return $izendaCompatibility.isSaveAsAllowed();
  };

  /**
   * Check is edit allowed
   */
  vm.isReadOnly = function() {
    return $izendaCompatibility.isEditAllowed();
  };

  /**
   * Check toggleHueRotateEnabled
   */
  vm.isToggleHueRotateEnabled = function () {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    return isChrome || isSafari;
  };

  /**
   * Activate/deactivate dashboard mode
   */
  vm.toggleGalleryMode = function (state) {
    vm.isGalleryMode = state;
    if (vm.isGalleryMode) {
      vm.closeDashboardFilters();
      $timeout(function () {
        $rootScope.$broadcast('toggleGalleryMode', [state]);
      }, 100, false);
    } else {
      $rootScope.$broadcast('toggleGalleryMode', [state]);
    }
  };

  /**
   * Open gallery in fullscreen mode
   */
  vm.toggleGalleryModeFullScreen = function () {
    vm.closeDashboardFilters();
    $rootScope.$broadcast('toggleGalleryModeFullscreen', []);
  };

  /**
   * Create new dashboard button handler.
   */
  vm.createNewDashboardHandler = function () {
    $location.url('/?new');
  };

  /**
   * Create new dashboard. Fires when user selects name for new dashboard in IzendaSelectReportNameController
   */
  $scope.$on('selectedNewReportNameEvent', function (event, args) {
    var dashboardName = args[0],
        dashboardCategory = args[1];
    var url = dashboardName;
    if (angular.isString(dashboardCategory) && dashboardCategory !== '' && dashboardCategory.toLowerCase() !== 'uncategorized') {
      url = dashboardCategory + '/' + dashboardName;
    }
    // load dashboard navigation
    $izendaDashboardToolbarQuery.loadDashboardNavigation().then(function (data) {
      vm.dashboardNavigationLoaded(data);
    });
    $location.url(url);
    vm.hideButtonBar();
    $scope.$evalAsync();
  });

  /**
   * Refresh dashboard button handler.
   */
  vm.refreshDashboardHandler = function () {
    $rootScope.$broadcast('dashboardRefreshEvent', []);
  };

  /**
   * Save/SaveAS dialog
   */
  vm.saveDashboardHandler = function (showSaveAsDialog) {
    $rootScope.$broadcast('dashboardSaveEvent', [showSaveAsDialog || vm.isNewDashboard]);
  };

  /**
   * Remove background image link handler
   */
  vm.removeBackgroundImageHandler = function () {
    if ($izendaBackground.setBackgroundImgToStorage(null)) {
      vm.updateDashboardBackgroundImage();
    }
  };

  /**
   * Open dialog when user can set url to set background image.
   */
  vm.selectBackgroundDialogHandler = function () {
    vm.izendaBackgroundImageUrl = null;
    vm.backgroundModalRadio = 'url';
    vm.selectBackgroundImageModalOpened = true;
  };

  /**
   * User cancel background image dialog
   */
  vm.cancelBackgroundDialogHandler = function() {
    vm.selectBackgroundImageModalOpened = false;
  };

  /**
   * User selected background image url:
   */
  vm.okBackgroundDialogHandler = function () {
    vm.selectBackgroundImageModalOpened = false;
    if (vm.backgroundModalRadio === 'file') {
      vm.setBackgroundImageFromLocalhost();
    } else {
      vm.setBackgroundImageFromUrl();
    }
  };

  /**
   * Turn on window resize handler
   */
  vm.turnOnWindowResizeHandler = function () {

    vm.windowResizeOptions.id = null;
    vm.windowResizeOptions.previousWidth = _($window).width();
    vm.isChangingNow = true;
    function doneResizing() {
      if (vm.windowResizeOptions.previousWidth !== _($window).width()) {
        vm.windowResizeOptions.timeout = false;
        vm.isChangingNow = false;
        vm.updateToolbarItems();
        $rootScope.$broadcast('dashboardResizeEvent', [{}]);
        $scope.$evalAsync();
      }
      vm.windowResizeOptions.previousWidth = _($window).width();
    }
    _($window).on('resize.dashboard', function () {
      if (vm.windowResizeOptions.id != null)
        clearTimeout(vm.windowResizeOptions.id);
      vm.windowResizeOptions.id = setTimeout(doneResizing, 200);
    });
  };

  /**
   * Turn off window resize handler
   */
  vm.turnOffWindowResizeHandler = function () {
    _($window).off('resize.dashboard');
  };

  /**
   * Toggle hue rotate switcher control handler.
   */
  vm.toggleHueRotateHandler = function () {
    vm.hueRotate = !vm.hueRotate;
    $scope.$applyAsync();
  };

  /**
   * Hue rotate toolbar btn icon
   */
  vm.getHueRotateBtnImageUrl = function() {
    return 'Resources/images/color' + (!vm.hueRotate ? '-bw' : '') + '.png';
  };

  /**
   * Set file selected in file input as background
   */
  vm.setBackgroundImageFromLocalhost = function () {
    var $fileBtn = _('#izendaDashboardBackground');
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if ($fileBtn[0].files.length === 0)
        return;
      var file = $fileBtn[0].files[0];

      // test file information
      if (!file.type.match('image.*')) {
        alert('File should be image');
        return;
      }
      // read the file:
      var reader = new FileReader();
      reader.onload = (function () {
        return function (e) {
          var bytes = e.target.result;
          if ($izendaBackground.setBackgroundImgToStorage(bytes))
            vm.updateDashboardBackgroundImage();
        };
      })(file);
      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
    }
  };

  /**
   * Set background image from remote url
   */
  vm.setBackgroundImageFromUrl = function () {
    if ($izendaBackground.setBackgroundImgToStorage(vm.izendaBackgroundImageUrl))
      vm.updateDashboardBackgroundImage();
  };

  /**
   * Check if background image set
   */
  vm.isBackgroundImageSet = function () {
    var backgroundImg = $izendaBackground.getBackgroundImgFromStorage();
    return backgroundImg != null;
  };

  /**
   * Update dashboard background
   */
  vm.updateDashboardBackgroundImage = function () {
    vm.izendaBackgroundImageUrl = $izendaBackground.getBackgroundImgFromStorage();
  };

  /**
   * Initialize background color picker control.
   */
  vm.initializeColorPicker = function () {
    $scope.$watch(angular.bind(vm, function () {
      return this.izendaBackgroundColor;
    }), function (newVal) {
      if (newVal !== '') {
        $izendaBackground.setBackgroundColor(newVal);
        /*$cookies.izendaDashboardBackgroundColor = newVal;
        document.cookie = "izendaDashboardBackgroundColor=" + newVal;*/
      }
    });
  };
  
  //////////////// toolbar items ////////////////////

  /**
   * Toolbar item name function
   */
  vm.getToolbarItemTitle = function(item) {
    return item.text;
  };

  /**
   * Toolbar item equals function
   */
  vm.getToolbarItemsEquals = function(item1, item2) {
    return item1 && item2 && item1.id === item2.id;
  };

  /**
   * Toolbar click function
   */
  vm.toolbarLoadDashboard = function (item) {
    vm.activeDashboard = item;
    $location.url(item.fullName.split('\\').join('/'));
  };

  /**
   * Update toolbar dashboard tabs
   */
  vm.updateToolbarItems = function () {
    var isNewDashboard = $location.search()['new'] || false;
    if (isNewDashboard)
      vm.activeDashboard = null;
    for (var i = 0; i < vm.dashboardCategories.length; i++) {
      if (vm.dashboardCategories[i].name === $izendaUrl.getReportInfo().category) {
        vm.dashboardsInCurrentCategory = [];
        var dashboards = vm.dashboardCategories[i].dashboards;
        for (var iDashboard = 0; iDashboard < dashboards.length; iDashboard++) {
          var dashboard = dashboards[iDashboard];
          var dashboardObj = {
            id: iDashboard,
            fullName: dashboard,
            text: $izendaUrl.extractReportName(dashboard)
          };
          vm.dashboardsInCurrentCategory.push(dashboardObj);
          if (!isNewDashboard) {
            var isActive = dashboard === $izendaUrl.getReportInfo().fullName;
            if (isActive) {
              vm.activeDashboard = dashboardObj;
            }
          }
        }
      }
    }
  };

  //////////////// end toolbar items ////////////////////

  /**
   * Set new dashboard as current dashboard
   */
  vm.setNewDashboard = function() {
    $log.debug(' ');
    $log.debug('>>>>> Set new dashboard');
    $log.debug(' ');

    // return from gallery mode.
    vm.isGalleryMode = false;
    $rootScope.$broadcast('toggleGalleryMode', [false]);

    // create new dashboard and set it as CRS
    $izendaDashboardToolbarQuery.newDashboard().then(function () {
      // notify dashboard to start
      $rootScope.$broadcast('dashboardSetEvent', [{
        isNew: true
      }]);
      // notify filters to start
      $rootScope.$broadcast('refreshFilters', []);
      // update toolbar items
      vm.updateToolbarItems();
      $scope.$evalAsync();
    });
  };

  /**
   * Set current dashboard
   */
  vm.setDashboard = function (dashboardFullName) {
    $log.debug(' ');
    $log.debug('>>>>> Set current dashboard: "' + dashboardFullName + '"');
    $log.debug(' ');

    // return from gallery mode.
    vm.isGalleryMode = false;
    $rootScope.$broadcast('toggleGalleryMode', [false]);

    // set current report set query:
    $izendaDashboardToolbarQuery
      .setCurrentReportSet(dashboardFullName)
      .then(function () {
        // notify dashboard to start
        $rootScope.$broadcast('dashboardSetEvent', [{
          isNew: false
        }]);

        // notify filters to start
        $rootScope.$broadcast('refreshFilters', []);

        // update toolbar items
        vm.updateToolbarItems();

        $scope.$evalAsync();
      });
  };

  /**
   * Dashboard categories loaded. Now we have to update it.
   */
  vm.dashboardNavigationLoaded = function (data) {
    vm.dashboardCategoriesLoading = false;
    vm.dashboardCategories.length = 0;

    if (angular.isObject(data)) {
      for (var category in data) {
        if (data.hasOwnProperty(category)) {
          var dashboards = data[category];
          if (dashboards.length > 0) {
            var item = {
              id: (new Date()).getTime(),
              name: category,
              dashboards: data[category]
            };
            vm.dashboardCategories.push(item);
          }
        }
      }
      vm.updateToolbarItems();
    }

    // check dashboard parameter is defined
    if (!vm.isNewDashboard) {
      var fullName = $izendaUrl.getReportInfo().fullName;
      if (angular.isUndefined(fullName) || fullName == null) {
        // go to the first found dashboard, if parameter isn't defined
        if (vm.dashboardCategories.length > 0) {
          // update url
          fullName = vm.dashboardCategories[0].dashboards[0];
        } else {
          throw 'There is no dashboards to load.';
        }
      }
      $izendaUrl.setReportFullName(fullName);
    }

    // run location changed handler
    vm.dashboardLocationChangedHandler();
  };

  /**
   * Toggle dashboard filters panel
   */
  vm.toggleDashboardFilters = function () {
    if (vm.isFiltersEditAllowed())
      $rootScope.$broadcast('izendaFiltersToggle');
  };

  /**
   * Open send email dialog
   */
  vm.showEmailModal = function (type) {
    vm.sendEmailState.isLoading = false;
    vm.sendEmailState.opened = true;
    vm.sendEmailState.sendType = type;
    vm.sendEmailState.email = '';
    vm.sendEmailState.errors = [];
    vm.sendEmailState.errorOccured = false;
  }

  /**
   * Close send email dialog
   */
  vm.hideEmailModal = function (success) {
    vm.sendEmailState.errorOccured = true;
    vm.sendEmailState.errors = [];
    if (success) {
      // OK pressed
      if (!vm.validateEmail(vm.sendEmailState.email)) {
        vm.sendEmailState.errorOccured = true;
        vm.sendEmailState.errors.push('Incorrect Email');
      } else {
        vm.sendEmailState.isLoading = true;
        $izendaDashboardToolbarQuery.sendReportViaEmail(vm.sendEmailState.sendType, vm.sendEmailState.email).then(function (result) {
          vm.sendEmailState.opened = false;
          if (result === 'OK') {
            $rootScope.$broadcast('showNotificationEvent', ['Email to "' + vm.sendEmailState.email + '" was sent']);
          } else {
            $rootScope.$broadcast('showNotificationEvent', ['Failed to send email to "' + vm.sendEmailState.email + '": ' + result]);
          }
          $scope.$applyAsync();
        });
      }
    } else {
      // cancel pressed
      vm.sendEmailState.opened = false;
    }
    
  }

  /**
   * Validate email
   */
  vm.validateEmail = function(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  /**
   * Send dashboard via email
   */
  vm.sendEmail = function (type) {
    vm.showEmailModal(type);
  };

  /**
   * Is html model enabled in AdHocSettings
   */
  vm.isPrintDashboardVisible = function() {
    return vm.printMode === 'Html' || vm.printMode === 'Html2PdfAndHtml';
  };

  /**
   * Print whole dashboard
   */
  vm.printDashboard = function () {
    $rootScope.$broadcast('printWholeDashboardEvent', ['html']);
  };

  /**
   * Is html2pdf mode enabled in AdHocSettings
   */
  vm.isPrintDashboardPdfVisible = function () {
    return vm.printMode === 'Html2Pdf' || vm.printMode === 'Html2PdfAndHtml';
  };

  /**
   * Print dashboard as pdf
   */
  vm.printDashboardPdf = function () {
    $rootScope.$broadcast('printWholeDashboardEvent', ['pdf']);
  };

  /**
   * Is print button visible
   */
  vm.isPrintDropdownVisible = function() {
    return vm.isPrintDashboardPdfVisible() || vm.isPrintDashboardVisible();
  };

  /**
   * Open schedule dialog
   */
  vm.showScheduleDialog = function() {
    $rootScope.$broadcast('openScheduleModalEvent');
  };

  /**
   * Open share dialog
   */
  vm.showShareDialog = function() {
    $rootScope.$broadcast('openShareModalEvent');
  };

  /**
   * Turn off dashboard filters
   */
  vm.closeDashboardFilters = function() {
    $rootScope.$broadcast('izendaFiltersClose');
  };

  /**
   * Raises when location changed and need to load dashboard.
   */
  vm.dashboardLocationChangedHandler = function () {
    vm.isNewDashboard = $location.search()['new'] || false;
    var dashboardFullName = $izendaUrl.getReportInfo().fullName;
    $log.debug('Location changed: new: ' + vm.isNewDashboard + ', name: ' + dashboardFullName);
    if (vm.isNewDashboard) {
      vm.setNewDashboard();
    } else {
      if (angular.isDefined(dashboardFullName) && dashboardFullName.trim() !== '') {
        vm.setDashboard(dashboardFullName);
      } else {
        throw new Error('Can\' t load dashboard, because dashboard name isn\'t set');
      }
    }
  };

  /**
   * Initialize event handlers
   */
  vm.initializeEventHandlers = function () {
    $scope.$on('$locationChangeSuccess', function () {
      vm.dashboardLocationChangedHandler();
    });

    $scope.$on('startEditTileEvent', function () {
      vm.turnOffWindowResizeHandler();
    });

    $scope.$on('stopEditTileEvent', function () {
      vm.turnOnWindowResizeHandler();
    });
  };

  /**
   * Initialize ping service
   */
  vm.initializePing = function() {
    $izendaPing.startPing(10000);
  };

  /**
   * Get adhocsettings
   */
  vm.initializeAdHocSettings = function () {
    $izendaSettings.getPrintMode().then(function (printModeString) {
      vm.printMode = printModeString;
      $scope.$applyAsync();
    });
  };

  /**
   * Initialize dashboard navigation
   */
  vm.initialize = function () {

    vm.initializePing();

    vm.initializeAdHocSettings();

    vm.initializeEventHandlers();

    vm.updateDashboardBackgroundImage();

    // start window resize handler
    vm.turnOnWindowResizeHandler();

    // load dashboard navigation
    $izendaDashboardToolbarQuery.loadDashboardNavigation().then(function (data) {
      vm.dashboardNavigationLoaded(data);
    });

    // initialize color picker
    vm.initializeColorPicker();
  };
}