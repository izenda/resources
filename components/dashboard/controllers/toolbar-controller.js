angular
	.module('izendaDashboard')
	.controller('IzendaToolbarController', [
		'$injector',
		'$scope',
		'$rootScope',
		'$log',
		'$window',
		'$timeout',
		'$cookies',
		'$izendaCompatibility',
		'$izendaBackground',
		'$izendaSettings',
		'$izendaPing',
		'$izendaScheduleService',
		'$izendaShareService',
		'$izendaDashboardToolbarQuery',
		'$izendaUrl',
		'$izendaEvent',
		'$izendaLocale',
		'$izendaDashboardState',
		izendaToolbarController]);

/**
 * Toolbar controller
 */
function izendaToolbarController(
	$injector,
	$scope,
	$rootScope,
	$log,
	$window,
	$timeout,
	$cookies,
	$izendaCompatibility,
	$izendaBackground,
	$izendaSettings,
	$izendaPing,
	$izendaScheduleService,
	$izendaShareService,
	$izendaDashboardToolbarQuery,
	$izendaUrl,
	$izendaEvent,
	$izendaLocale,
	$izendaDashboardState) {

  'use strict';

  //////////////////////////////////////////////////////
  // VARS
  //////////////////////////////////////////////////////

  var vm = this;
  var _ = angular.element;
  $scope.izendaUrl = $izendaUrl;
  $scope.izendaDashboardState = $izendaDashboardState;
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

  vm.dashboardConfig = $injector.get('izendaDashboardConfig');
  vm.dashboardsAllowedByLicense = false;
  vm.isIE8 = $izendaCompatibility.checkIsIe8();
  vm.isStorageAvailable = $izendaBackground.isStorageAvailable();
  vm.isPresentationModeEnable = !$izendaCompatibility.checkIsLteIe10();
  vm.synchronized = false;
  vm.isDesignLinksAllowed = true;

  vm.refreshInterval = null;
  vm.autoRefreshIntervals = [];
  $izendaDashboardToolbarQuery.loadAutoRefreshIntervals().then(function (data) {
    var isFirst = true;
    angular.forEach(data, function (value, key) {
      this.push({ name: key, value: value, selected: isFirst });
      isFirst = false;
    }, vm.autoRefreshIntervals);
    if (vm.autoRefreshIntervals.length > 0 && vm.autoRefreshIntervals[0].value >= 1) {
      vm.refreshDashboardHandler(0, true);
    }
  });

  vm.backgroundModalRadio = 'url';
  vm.dashboardCategoriesLoading = true;
  vm.dashboardCategories = [];
  vm.dashboardsInCurrentCategory = [];
  vm.activeDashboard = null;
  vm.printMode = 'Html2PdfAndHtml';
	vm.reportInfo = null;

	vm.sendEmailModalOpened = false;
	vm.sendEmailState = {
		errors: [],
		isLoading: false,
		errorOccured: false,
		sendType: 'Link',
		email: '',
		opened: false
	};

	vm.scheduleModalOpened = false;
	vm.shareModalOpened = false;

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
	vm.isReadOnly = function () {
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
  	$izendaUrl.setIsNew();
  };

  /**
   * Refresh dashboard button handler.
   */
  vm.refreshDashboardHandler = function (index, skipFirst) {
    if (!skipFirst) {
    	$izendaEvent.queueEvent('dashboardRefreshEvent', [true, true]);
    }
    if (typeof index != 'undefined') {
      var interval = vm.autoRefreshIntervals[index].value;
      var numberOfIntervals = vm.autoRefreshIntervals.length;
      for (var i = 0; i < numberOfIntervals; ++i) {
        vm.autoRefreshIntervals[i].selected = index === i;
      }
      clearInterval(vm.refreshInterval);
      if (interval >= 1) {
        interval *= 1000;
        vm.refreshInterval = setInterval(function () {
        	$izendaEvent.queueEvent('dashboardRefreshEvent', [true, true]);
        }, interval);
      }
    }
  };

  /**
   * Save/SaveAS dialog
   */
  vm.saveDashboardHandler = function (showSaveAsDialog) {
  	$izendaEvent.queueEvent('dashboardSaveEvent', [showSaveAsDialog || vm.reportInfo.isNew], true);
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
	vm.cancelBackgroundDialogHandler = function () {
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
   * Toggle hue rotate switcher control handler.
   */
  vm.toggleHueRotateHandler = function () {
    vm.hueRotate = !vm.hueRotate;
    $scope.$applyAsync();
  };

  /**
   * Hue rotate toolbar btn icon
   */
	vm.getHueRotateBtnImageUrl = function () {
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
      	alert($izendaLocale.localeText('js_ShouldBeImage', 'File should be image'));
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
	vm.getToolbarItemTitle = function (item) {
    return item.text;
  };

  /**
   * Toolbar item equals function
   */
	vm.getToolbarItemsEquals = function (item1, item2) {
    return item1 && item2 && item1.id === item2.id;
  };

  /**
   * Toolbar click function
   */
  vm.toolbarLoadDashboard = function (item) {
  	vm.activeDashboard = item;
	  $izendaUrl.setReportFullName(item.fullName);
  };

	/**
		* Update toolbar dashboard tabs
		*/
	vm.updateToolbarItems = function () {
		vm.dashboardsInCurrentCategory.length = 0;
		vm.activeDashboard = null;
		if (vm.reportInfo === null)
			return;

		if (vm.reportInfo.isNew)
			vm.activeDashboard = null;
		for (var i = 0; i < vm.dashboardCategories.length; i++) {
			if (vm.dashboardCategories[i].name === vm.reportInfo.category) {
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
					if (!vm.reportInfo.isNew) {
						var isActive = dashboard === vm.reportInfo.fullName;
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
        vm.sendEmailState.errors.push($izendaLocale.localeText('js_IncorrectEmail','Incorrect Email'));
      } else {
        vm.sendEmailState.isLoading = true;
        $izendaDashboardToolbarQuery.sendReportViaEmail(vm.sendEmailState.sendType, vm.sendEmailState.email).then(function (result) {
          vm.sendEmailState.opened = false;
          if (result === 'OK') {
          	$rootScope.$broadcast('showNotificationEvent', [$izendaLocale.localeText('js_EmailWasSent', 'Email  was sent')]);
          } else {
          	$rootScope.$broadcast('showNotificationEvent', [$izendaLocale.localeText('js_FailedToSendEmail', 'Failed to send email')]);
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
	vm.validateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  /**
   * Send dashboard via email
   */
  vm.sendEmail = function (type) {
		if (type === 'Link') {
			var redirectUrl = '?subject=' + encodeURIComponent(vm.activeDashboard.fullName) + '&body=' + encodeURIComponent(location);
			redirectUrl = 'mailto:' + redirectUrl.replace(/ /g, '%20');
			window.top.location = redirectUrl;
		}
		else
			vm.showEmailModal(type);
  };

  /**
   * Is html model enabled in AdHocSettings
   */
	vm.isPrintDashboardVisible = function () {
    return vm.printMode === 'Html' || vm.printMode === 'Html2PdfAndHtml';
  };

	//crutch to avoid call of window.open inside anonymous function
  vm.beforePrintDashboard = function () {
  	vm.synchronized = false;
  	$izendaEvent.queueEvent('dashboardSyncEvent', []);
  }

  /**
   * Print whole dashboard
   */
  vm.printDashboard = function () {
  	$izendaEvent.queueEvent('printWholeDashboardEvent', ['html']);
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
  	$izendaEvent.queueEvent('printWholeDashboardEvent', ['pdf']);
  };

  /**
   * Is print button visible
   */
	vm.isPrintDropdownVisible = function () {
    return vm.isPrintDashboardPdfVisible() || vm.isPrintDashboardVisible();
  };

  /**
   * Open schedule dialog
   */
	vm.showScheduleDialog = function () {
		vm.scheduleModalOpened = true;
  };

	/**
	 * Close schedule dialog
	 */
	vm.closeScheduleDialog = function (result) {
		vm.scheduleModalOpened = false;
		if (result) {
			$izendaScheduleService.saveScheduleConfigToCrs();
		}
	}

  /**
   * Open share dialog
   */
	vm.showShareDialog = function () {
		vm.shareModalOpened = true;
	};

	/**
	 * Close share dialog
	 */
	vm.closeShareDialog = function (result) {
		vm.shareModalOpened = false;
		if (result) {
			$izendaShareService.saveShareConfigToCrs();
		}
	}

	/**
   * Turn off dashboard filters
   */
	vm.closeDashboardFilters = function () {
    $rootScope.$broadcast('izendaFiltersClose');
  };

	/**
	 * Raises when location changed and need to load dashboard.
	 */
	vm.dashboardLocationChangedHandler = function (reportInfo) {
		vm.isGalleryMode = false;
		vm.reportInfo = reportInfo;
		vm.updateToolbarItems();
		$log.debug('Location changed: new: ' + vm.reportInfo.isNew + ', name: ' + vm.reportInfo.fullName);
	};

  /**
   * Initialize event handlers
   */
  vm.initializeEventHandlers = function () {
  	/**
		 * Create new dashboard. Fires when user selects name for new dashboard in IzendaSelectReportNameController
		 */
		$scope.$on('selectedNewReportNameEvent', function (event, args) {
			var dashboardName = args[0],
					dashboardCategory = args[1];
			var fullName = dashboardName;
			if (angular.isString(dashboardCategory) && dashboardCategory !== '' && dashboardCategory.toLowerCase() !== 'uncategorized') {
				fullName = dashboardCategory + '\\' + dashboardName;
			}
			$izendaUrl.setReportFullName(fullName);
			vm.hideButtonBar();

			// load dashboard navigation
			$izendaDashboardToolbarQuery.loadDashboardNavigation().then(function (data) {
				vm.dashboardNavigationLoaded(data);
			});
			$scope.$evalAsync();
		});

		$scope.$on('startEditTileEvent', function () {
			$izendaDashboardState.turnOffWindowResizeHandler();
    });

    $scope.$on('stopEditTileEvent', function () {
    	$izendaDashboardState.turnOnWindowResizeHandler();
    });

    $izendaEvent.handleQueuedEvent('dashboardSyncCompletedEvent', $scope, vm, function () {
    	vm.synchronized = true;
    });
  };

  /**
   * Get adhocsettings
   */
  vm.initializeAdHocSettings = function () {
    $izendaSettings.getPrintMode().then(function (printModeString) {
      vm.printMode = printModeString;
      $scope.$applyAsync();
    });

		$izendaSettings.getCommonSettings().then(function (settings) {
			vm.isDesignLinksAllowed = settings.showDesignLinks;
			$scope.$applyAsync();
		});
  };

	/**
	* Initialize dashboard navigation
	*/
	vm.initialize = function () {
		$izendaSettings.getDashboardAllowed().then(function (allowed) {
			vm.dashboardsAllowedByLicense = allowed;
			if (allowed) {
				vm.initializeAdHocSettings();

				vm.initializeEventHandlers();

				vm.updateDashboardBackgroundImage();

				// load dashboard navigation
				$izendaDashboardToolbarQuery.loadDashboardNavigation().then(function (data) {
					vm.dashboardNavigationLoaded(data);
				});

				// initialize color picker
				vm.initializeColorPicker();

				// watch for window width chage
				$scope.$watch('izendaDashboardState.getWindowWidth()', function (newWidth) {
					if (angular.isUndefined(newWidth))
						return;
					vm.updateToolbarItems();
				});

				// watch for location change
				$scope.$watch('izendaUrl.getReportInfo()', function (reportInfo) {
					if (!angular.isDefined(reportInfo))
						return;
					if (reportInfo.fullName === null && !reportInfo.isNew)
						return;
					vm.dashboardLocationChangedHandler(reportInfo);
				});
			}
		});
	};
}