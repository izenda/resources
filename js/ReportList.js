﻿var responseServer;
var resourcesProvider;

(function () {
	var cookieNameCurrentCategory = 'izrl_currentCategory';
	var cookieNameClosedCategories = 'izrl_closedCategories';
	var justSelect = false;
	var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

	/////////////////////////////
	// report list renderer class
	/////////////////////////////
	function ReportListRenderer() {
		var this0 = this;
		this0.id = 0;
		this0.$elReportList = jq$('#reportListDiv');
		this0.$elContent = jq$('#contentDiv');
		this0.$elAddInstantReportContainer = jq$('#addInstantReportContainerDiv');
		this0.$elLoading = jq$('#loadingDiv');
		this0.$elLoadingWord = jq$('#loadingWord');

		this0.$elSearchInput = jq$('.iz-rl-search-panel > input');
		this0.$elCancelSearchIcon = jq$('.iz-rl-search-panel > .cancel-search-icon');
		this0.$elSearchProgressIcon = jq$('.iz-rl-search-panel > img.search-progress-icon');
		this0.$elSearchIcon = jq$('.iz-rl-search-panel > .search-icon');

		this0.$elMainPanel = jq$('.iz-rl-right-panel');
		this0.$elMenuButton = jq$('.iz-rl-right-panel .open-menu-mobile');
		this0.$elSideMenu = jq$('.iz-rl-left-panel');
		this0.$elMenuButtonClose = jq$('.iz-rl-left-panel .open-menu-mobile');
		this0.$elSideMenuBackdrop = jq$('.iz-rl-left-panel-backdrop');

		this0.$elLeftPanel = jq$('#leftSideCats');
		this0.$elCategoryTitleMobile = jq$('.iz-rl-right-panel .mobile-header');

		this0.reportListRequest = new ReportListRequest();
		this0.nrlConfigObj = null;
		this0.categoriesModel = null;
		this0.searchKeyword = '';
		this0.searchInputTimer = [];
	}

	ReportListRenderer.prototype.isSubcategory = function(parentCategory, possibleChildCategory) {
		if (!parentCategory || !possibleChildCategory)
			return false;
		var parentParts = parentCategory.split('\\');
		var childParts = possibleChildCategory.split('\\');
		if (parentParts.length >= childParts.length)
			return false;
		for (var i = 0; i < parentParts.length; i++)
			if (parentParts[i] !== childParts[i])
				return false;
		return true;
	};

	ReportListRenderer.prototype.selectDefaultCategory = function () {
		var promise = jq$.Deferred();
		var this0 = this;
		// try to get category from cookie
		var cookieCategoryFullName = AdHoc.Utility.GetCookie(cookieNameCurrentCategory);
		var $categoryEl = null;
		if (cookieCategoryFullName) {
			var cookieCategoryObject = this0.getCategoryByName(cookieCategoryFullName);
			if (cookieCategoryObject)
				$categoryEl = this0.$elLeftPanel
					.find('.category-item[data-category="' + cookieCategoryObject.fullName.replaceAll('\\', '\\\\') + '"]');
		}
		// if category not fount - get first not empty category
		if (!$categoryEl || !$categoryEl.length)
			$categoryEl = this0.$elLeftPanel.find('.category-item:not(.empty):first');

		if ($categoryEl && $categoryEl.length) {
			this0.onCategorySelect($categoryEl).then(function () {
				promise.resolve();
			});
		} else
			promise.resolve();
		return promise;
	};

	ReportListRenderer.prototype.initialize = function () {
		var this0 = this;
		this0.$elSearchInput
			.attr('placeholder', IzLocal.Res('js_Search', 'Search'))
			.on('keyup', function (event) {
				this0.onKeyupQuickSearchBoxHandler(event);
			});

		this0.$elSideMenuBackdrop.on('click', function () {
			this0.hideSideMenu();
		}).on('touchmove', function (e) {
			e.stopPropagation();
			e.preventDefault();
		});

		this0.$elMenuButton.on('click', function () {
			this0.showSideMenu();
		});

		this0.$elMenuButtonClose.on('click', function () {
			this0.hideSideMenu();
		});

		this0.$elCancelSearchIcon.on('click', function () {
			this0.cancelSearch();
		});
		this0.$elCancelSearchIcon.hide();

		this0.handleSwipeEvents();

		// show splashscreen
		this0.turnOnLoading(false, IzLocal.Res('js_Loading'), true);

		// start loading data
		this0.reportListRequest.loadConfig(this, function (nrlConfigObj) {
			this0.$elSideMenu.css('visibility', 'hidden');
			this0.nrlConfigObj = nrlConfigObj;
			this0.reportListRequest.loadReports(null, null, this, function (returnObject) {
				if (!returnObject.ReportSets.length) {
					// no reports => go to designer
					this0.$elAddInstantReportContainer.show();
					var text = IzLocal.Res('js_NoReportsCurrentlyExistMessage',
						'No reports currently exist. Please create and save at least one in the report designer.<br />Redirecting to the Report Designer in 10 seconds.');
					this0.turnOnLoading(false, text);
					setTimeout(function () {
						window.location = this0.nrlConfigObj.ReportDesignerLink;
					}, 11000);
					return;
				}
				this0.buildCategoriesModel(returnObject, true);
				this0.renderCategories();
				this0.renderRecentItems();
				this0.renderTabs();

				this0.selectDefaultCategory().then(function () {
					this0.scrollToCurrentCategory();
					this0.$elSideMenu.css('visibility', 'visible');
				});
			}, function (message) {
				// handle error
				this0.onError('reports not loaded: ' + message);
			});
		});
	};

	/**
	 * Scroll to current category.
	 */
	ReportListRenderer.prototype.scrollToCurrentCategory = function () {
		var this0 = this;
		var currentCategory = this0.categoriesModel.currentCategory;
		if (currentCategory) {
			var $categoryEl = this0.$elLeftPanel
				.find('.category-item[data-category="' + currentCategory.fullName.replaceAll('\\', '\\\\') + '"]');
			var categoryBottom = $categoryEl.position().top + $categoryEl.height();
			var delta = categoryBottom - this0.$elSideMenu.height();
			delta = (delta > 0) ? delta - 40 + this0.$elSideMenu.height() : 0;
			this0.$elSideMenu.scrollTop(delta);
		}
	};

	/**
	 * Category selected handler
	 * @param {object} $categoryEl category DOM jquery element.
	 * @return {Promise} promise.
	 */
	ReportListRenderer.prototype.onCategorySelect = function ($categoryEl) {
		var promise = jq$.Deferred();
		var this0 = this;
		var categorFullName = $categoryEl ? $categoryEl.attr('data-category') : '';
		var categoryObject = this0.getCategoryByName(categorFullName);

		if (!categoryObject || !categoryObject.hasReports) {
			promise.resolve();
			return promise;
		}

		AdHoc.Utility.SetCookie(cookieNameCurrentCategory, categoryObject.fullName);

		this0.$elCategoryTitleMobile.text(categoryObject.fullName);
		if ($categoryEl) {
			this0.$elLeftPanel.find('.category-item').removeClass('selected');
			$categoryEl.addClass('selected');
		}
		this0.$elReportList.scrollTop(0);
		this0.hideSideMenu();
		this0.loadCategory(categoryObject).then(function () {
			promise.resolve();
		});
		return promise;
	};

	/**
	 * Load category reports.
	 * @param {object} categoryObject category model object.
	 * @return {Promise} promise.
	 */
	ReportListRenderer.prototype.loadCategory = function (categoryObject) {
		var promise = jq$.Deferred();
		var this0 = this;
		this0.categoriesModel.currentCategory = categoryObject;

		this0.hideContent();
		this0.turnOnLoading(false, IzLocal.Res('js_Loading'));
		jq$('#tabs').tabs('select', categoryObject.id);
		if (!categoryObject.reports.length) {
			this0.reportListRequest.cancelLoadReports();
			this0.reportListRequest.loadReports(
				this0.searchKeyword,
				categoryObject.fullName,
				this0,
				function (returnObject) {
					this0.buildCategoriesModel(returnObject, false);
					var firstEnabled = this0.turnOffEmptyAfterSearchCategories(returnObject);
					if (firstEnabled && this0.categoriesModel.currentCategory.isDisabled) {
						this0.loadCategory(firstEnabled);
						return;
					}
					this0.renderCategories();
					var $tabElement = jq$('#tabs').find('#tab' + categoryObject.id);
					this0.renderTabContent(categoryObject, $tabElement);
					this0.showContent();
					this0.turnOffLoading(true);
					window.scrollTo(0, 0);
					promise.resolve();
				},
				function (message) {
					this0.onError('reports not loaded: ' + message);
				});
		} else {
			this0.showContent();
			this0.turnOffLoading(true);
			promise.resolve();
		}
		return promise;
	};

	ReportListRenderer.prototype.turnOffEmptyAfterSearchCategories = function (searchResults) {
		var this0 = this;
		var firstEnabled = null;
		this0.categoriesModel.all.forEach(function (categoryObject) {
			if (!this0.searchKeyword) {
				categoryObject.isDisabled = false;
				return;
			}
			var isDisabled = true;
			for (var i = 0; i < searchResults.ReportSets.length; i++) {
				var searchResult = searchResults.ReportSets[i];
				var isReport = !!searchResult.ImgUrl;
				if (isReport)
					continue;
				if (searchResult.CategoryFull === categoryObject.fullName ||
					(!searchResult.CategoryFull && categoryObject.fullName === IzLocal.Res('js_Uncategorized', 'Uncategorized'))) {
					isDisabled = false;
					break;
				}
			}
			categoryObject.isDisabled = isDisabled;
			if (!isDisabled && !firstEnabled)
				firstEnabled = categoryObject;
		});
		if (this.searchKeyword) {
			for (var i = 0; i < searchResults.ReportSets.length; i++) {
				var searchResult = searchResults.ReportSets[i];
				var isReport = !!searchResult.ImgUrl;
				if (isReport) {
					this0.categoriesModel.currentCategory.isDisabled = false;
					break;
				}
			}
		}
		return firstEnabled;
	};

	/**
	 * Category collapse handler
	 * @param {object} $categoryToggleEl category DOM jquery element.
	 */
	ReportListRenderer.prototype.onCategoryToggle = function ($categoryToggleEl) {
		var this0 = this;
		var $li = $categoryToggleEl.parent();
		var categoryFullName = $li.attr('data-category');
		var categoryObject = this0.getCategoryByName(categoryFullName);
		if (!categoryObject)
			throw 'Can\'t find category object: "' + categoryFullName + '"';
		var level = $li.data('level');
		var isOpened = $li.hasClass('open');
		if (isOpened)
			$li.removeClass('open');
		else
			$li.addClass('open');
		// set new state
		categoryObject.opened = !isOpened;

		jq$($li).siblings('.category-item').each(function () {
			var $currentLi = jq$(this);
			var currentCategoryFullName = $currentLi.attr('data-category');
			var currentCategoryObject = this0.getCategoryByName(currentCategoryFullName);
			var currentLevel = $currentLi.data('level');
			if (currentCategoryObject
				&& currentLevel > level
				&& this0.isSubcategory(categoryObject.fullName, currentCategoryObject.fullName)) {
				if (isOpened) {
					$currentLi.removeClass('open');
					$currentLi.stop(true, true).fadeOut(250);
				} else {
					$currentLi.addClass('open');
					$currentLi.stop(true, true).fadeIn(250);
				}
			}
		});

		// save category expand/collapse state
		this0.saveClosedCategories();
	};

	ReportListRenderer.prototype.cancelSearch = function () {
		var this0 = this;
		if (!this0.searchKeyword)
			return;
		this0.$elSearchInput.val('');
		this0.searchKeyword = '';
		this0.$elCancelSearchIcon.hide();
		if (this0.categoriesModel.currentCategory) {
			this0.categoriesModel.currentCategory.reports = [];
			this0.loadCategory(this0.categoriesModel.currentCategory);
		}
	};

	ReportListRenderer.prototype.onKeyupQuickSearchBoxHandler = function (event) {
		var this0 = this;

		if (event.keyCode === 13) {
			this0.hideSideMenu();
			return;
		}
		if (event.keyCode === 27) {
			this0.cancelSearch();
			this0.hideSideMenu();
			return;
		}

		var searchBox = event.target || event;
		this0.$elSearchProgressIcon.hide();
		this0.searchKeyword = searchBox.value.toLowerCase();
		if (this0.searchKeyword)
			this0.$elCancelSearchIcon.show();
		else
			this0.$elCancelSearchIcon.hide();

		// cancel all previous timeouts
		while (this0.searchInputTimer.length > 0) {
			var timerId = this0.searchInputTimer[0];
			this0.searchInputTimer = this0.searchInputTimer.slice(1);
			clearTimeout(timerId);
		}
		this0.$elSearchProgressIcon.show();
		this0.$elSearchIcon.hide();
		this0.$elCancelSearchIcon.hide();
		var newTimerId = setTimeout(function () {
			this0.searchKeyword = searchBox.value.toLowerCase();
			if (this0.categoriesModel.currentCategory) {
				this0.categoriesModel.currentCategory.reports = [];
				this0.loadCategory(this0.categoriesModel.currentCategory);
			}
		}, 1000);
		this0.searchInputTimer.push(newTimerId);
	};

	ReportListRenderer.prototype.handleSwipe = function ($el, handler) {
		var startX, distX;
		var startY, distY;
		var startTime = null;
		var threshold = 150;
		var allowedTime = 300;
		var restraint = 50;
		var swipedir = 'none';
		$el.on('touchstart', function (e) {
			var touchobj = e.originalEvent.changedTouches[0];
			distX = 0;
			distY = 0;
			startX = touchobj.pageX;
			startY = touchobj.pageY;
			startTime = e.timeStamp;
		}).on('touchend', function (e) {
			swipedir = 'none';
			var touchobj = e.originalEvent.changedTouches[0];
			distX = touchobj.pageX - startX;
			distY = touchobj.pageY - startY;
			var elapsedTime = e.timeStamp - startTime;
			if (elapsedTime <= allowedTime) {
				if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
					swipedir = distX < 0 ? 'left' : 'right';
				} else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
					swipedir = distY < 0 ? 'up' : 'down';
				}
				handler(swipedir);
			}
		});
	};

	ReportListRenderer.prototype.handleSwipeEvents = function () {
		var this0 = this;
		this0.handleSwipe(this0.$elSideMenu, function (swipedir) {
			if (swipedir === 'left')
				this0.hideSideMenu();
		});
		this0.handleSwipe(this0.$elSideMenuBackdrop, function (swipedir) {
			if (swipedir === 'left')
				this0.hideSideMenu();
		});
		this0.handleSwipe(this0.$elMainPanel, function (swipedir) {
			if (swipedir === 'right')
				this0.showSideMenu();
		});
	};

	ReportListRenderer.prototype.saveClosedCategories = function () {
		var this0 = this;
		var resultArray = [];
		this0.categoriesModel.all.forEach(function (categoryObject) {
			if (!categoryObject.opened)
				resultArray.push(categoryObject.fullName);
		});
		AdHoc.Utility.SetCookie(cookieNameClosedCategories, JSON.stringify(resultArray));
	};

	ReportListRenderer.prototype.buildCategoriesModel = function (rawModel, clean) {
		var this0 = this;
		var closedCategories = AdHoc.Utility.GetCookie(cookieNameClosedCategories);
		closedCategories = closedCategories ? JSON.parse(closedCategories) : [];

		if (clean)
			this0.categoriesModel = {
				currentCategory: null,
				categories: [],
				all: []
			};
		this0.categoriesModel.all.forEach(function (categoryObject) {
			categoryObject.reports = [];
		}, this);

		this0.categoriesModel.recents = [];
		if (rawModel.Recent)
			rawModel.Recent.forEach(function (reportSet) {
				this0.categoriesModel.recents.push({
					name: reportSet.Name,
					urlEncodedName: reportSet.UrlEncodedName,
					dashboard: reportSet.Dashboard
				});
			});

		var uncategorizedText = IzLocal.Res('js_Uncategorized', 'Uncategorized');

		rawModel.ReportSets.forEach(function (reportSet) {
			// collect categories
			var categoryFullName = reportSet.CategoryFull ? reportSet.CategoryFull : uncategorizedText;
			var parts = categoryFullName.split(this0.nrlConfigObj.CategoryCharacter);

			var currentCategoryName = '';
			var parent = null;
			parts.forEach(function (categoryPart, categoryPartIndex) {
				// current subcategory full name
				if (currentCategoryName !== '')
					currentCategoryName += this0.nrlConfigObj.CategoryCharacter;
				currentCategoryName += categoryPart;

				var cookieCategoryFullName = AdHoc.Utility.GetCookie(cookieNameCurrentCategory) || '';

				// add new category object if not exist:
				var currentCategoryObject = this0.getCategoryByName(currentCategoryName);
				if (!currentCategoryObject) {
					// create if new
					var newCategoryObject = {
						id: this0.id++,
						opened: (this0.isSubcategory(currentCategoryName, cookieCategoryFullName)) || closedCategories.indexOf(currentCategoryName) < 0,
						name: categoryPart,
						fullName: currentCategoryName,
						level: categoryPartIndex,
						reports: [],
						hasReports: categoryPartIndex === parts.length - 1,
						parent: null,
						categories: []
					};
					if (parent !== null) {
						parent.categories.push(newCategoryObject);
						newCategoryObject.parent = parent;
					} else {
						this0.categoriesModel.categories.push(newCategoryObject);
					}	
					this0.categoriesModel.all.push(newCategoryObject);
					parent = newCategoryObject; // go deeper
				} else {
					parent = currentCategoryObject; // go deeper
				}
			}, this);

			var isReport = !!reportSet.Name;
			if (isReport) {
				var categoryObject = this0.getCategoryByName(categoryFullName);
				/* Category, CategoryFull, CsvOnly, Dashboard, ImgUrl, IsLocked, Name, ReadOnly, ReportDesignerType
				Subcategories, Subcategory, UrlEncodedCategory, UrlEncodedName, ViewOnly */
				var reportObject = {
					imgUrl: reportSet.ImgUrl,
					name: reportSet.Name,
					urlEncodedName: reportSet.UrlEncodedName,
					categoryFull: categoryFullName,
					dashboard: reportSet.Dashboard,
					viewOnly: reportSet.ViewOnly,
					readOnly: reportSet.ReadOnly,
					isLocked: reportSet.IsLocked,
					csvOnly: reportSet.CsvOnly,
					reportDesignerType: reportSet.ReportDesignerType
				};
				categoryObject.reports.push(reportObject);
			}
		}, this0);
	};

	ReportListRenderer.prototype.renderCategory = function ($el, categoryObject) {
		var this0 = this;
		if (categoryObject.isDisabled)
			return;
		var hasSubcategory = categoryObject.categories.length;
		var hasReports = categoryObject.hasReports;
		var marginLeft = 6 * categoryObject.level;

		// create li
		var $item = jq$('<li>')
			.attr('title', categoryObject.name)
			.attr('data-level', categoryObject.level)
			.attr('data-category', categoryObject.fullName)
			.addClass('category-item')
			.css({
				'margin-left': marginLeft + 'px',
				'display': categoryObject.level === 0 || this0.nrlConfigObj.ExpandCategorizedReports ? '' : 'none'
			});
		if (!hasReports)
			$item.addClass('empty');

		// create expand icon
		if (hasSubcategory) {
			var $expandIcon = jq$('<a></a>')
				.addClass('category-item-expand')
				.on('click',
					function () {
						this0.onCategoryToggle(jq$(this));
					});
			$item.append($expandIcon);
			if (categoryObject.opened)
				$item.addClass('open');
		}

		var isParentsOpened = true;
		var parent = categoryObject.parent;
		while (parent && isParentsOpened) {
			if (!parent.opened)
				isParentsOpened = false;
			parent = parent.parent;
		}
		if (!isParentsOpened)
			$item.hide();

		if ((this0.categoriesModel.currentCategory &&
			this0.categoriesModel.currentCategory.fullName === categoryObject.fullName) ||
			(this0.categoriesModel.currentCategory === null &&
				categoryObject.fullName === IzLocal.Res('js_Uncategorized', 'Uncategorized')))
			$item.addClass('selected');

		// create link
		var $link = jq$('<a class="category-item-text" href="#"></a>')
			.text(categoryObject.name)
			.on('click',
				function (e) {
					cancelEvent(e);
					var $categoryEl = jq$(this).parent();
					this0.onCategorySelect.call(this0, $categoryEl);
				});
		$item.append($link);
		$el.append($item);
	};

	ReportListRenderer.prototype.renderCategoriesBunch = function ($el, categories) {
		var this0 = this;
		categories.forEach(function (categoryObject) {
			this0.renderCategory($el, categoryObject);
			if (categoryObject.categories.length)
				this0.renderCategoriesBunch($el, categoryObject.categories);
		}, this0);
	};

	ReportListRenderer.prototype.renderCategories = function () {
		var this0 = this;
		var $el = jq$('<ul class="iz-rl-category-list"></ul>');
		this0.renderCategoriesBunch($el, this0.categoriesModel.categories);
		this0.$elLeftPanel.empty();
		if ($el) {
			this0.$elLeftPanel.append($el);
		}
	};

	ReportListRenderer.prototype.renderRecentItems = function () {
		var this0 = this;
		var recents = this0.categoriesModel.recents;
		var element = jq$('<ul class="iz-rl-category-list"></ul>');
		recents.forEach(function (recent) {
			var recentItem = this0.renderRecentItem(recent);
			element.append(recentItem);
		});
		jq$('#recentReports').empty().append(element);
	};

	ReportListRenderer.prototype.renderRecentItem = function (recent) {
		var this0 = this;
		var directLink = this0.createDirectLink(recent);
		var item = jq$('<li class="category-item">').append(jq$('<a class="category-item-text"></a>')
			.attr('href', directLink)
			.text(recent.name)
			.on('click', function (event) {
				if ((event.which === null && event.button < 2) || (event.which !== null && event.which < 2)) {
					AdHoc.Utility.NavigateReport(directLink, 0, this0.nrlConfigObj.ResponseServerUrl);
					cancelEvent(event);
					return false;
				}
				return true;
			}));
		return item;
	};

	ReportListRenderer.prototype.renderTabs = function () {
		var this0 = this;
		this0.$elReportList.empty();
		var $tabs = jq$('<div id="tabs"></div>');
		var $hiddenItems = jq$('<ul style="display: none;"></ul>');
		this0.categoriesModel.all.forEach(function (categoryObject) {
			// tabs menu
			var $hiddenItem = jq$('<li></li>').css({
				'font-size': '1em'
			});
			var $a = jq$('<a></a>').attr('href', '#tab' + categoryObject.id).text(categoryObject.name);
			$hiddenItem.append($a);
			$hiddenItems.append($hiddenItem);

			// tabs
			var $tabElement = jq$('<div>').attr('id', 'tab' + categoryObject.id);
			var $thumbsElement = jq$('<div class="thumbs"></div>');
			$tabElement.append($thumbsElement);
			this0.renderTabContent(categoryObject, $tabElement);
			$tabs.append($tabElement);
		}, this0);
		$tabs.prepend($hiddenItems);
		this0.$elReportList.append($tabs);
		$tabs.tabs({
			show: false,
			hide: false
		});
	};

	ReportListRenderer.prototype.renderTabContent = function (categoryObject, $container) {
		var this0 = this;
		var $thumbs = $container.children('.thumbs');
		$thumbs.empty();
		if (!categoryObject.reports.length) {
			var vSize = document.body.offsetHeight;
			var $noReportsDiv = jq$('<div class="no-reports-found-message"></div>')
				.css('margin-top', vSize / 3 + 'px')
				.text(IzLocal.Res('js_NoReportsFound', 'No reports found'));
			$thumbs.append($noReportsDiv);
			return;
		}
		categoryObject.reports.forEach(function (report) {
			var $reportEl = this0.renderReportItem(report);
			if ($reportEl)
				$thumbs.append($reportEl);
		});

	};

	ReportListRenderer.prototype.renderReportItem = function (report) {
		var this0 = this;
		if (!report.name)
			return null;
		if (report.dashboard && justSelect)
			return null;
		var $thumbElement;
		if (!justSelect) {
			if (this0.nrlConfigObj.ThumbnailsAllowed) {
				$thumbElement = this0.createThumbElement(report, true, true, true, true);
				return $thumbElement;
			}
			else {
				$thumbElement = this0.createThumbElement(report, false, true, true);
				return $thumbElement;
			}
		} else {
			$thumbElement = this0.createThumbElement(report, true, false, false);
			return $thumbElement;
		}
	};

	ReportListRenderer.prototype.createThumbElement = function (report, imageMode, buttonsMode, titleMode, directLinkMode) {
		var this0 = this;
		var directLink = this0.createDirectLink(report);
		var $element = jq$('<div></div>').addClass(isTouch ? 'thumb no-hover' : 'thumb hover');
		if (imageMode) {
			$element.on('click', function (event) {
				if ((event.which === null && event.button < 2) || (event.which !== null && event.which < 2)) {
					AdHoc.Utility.NavigateReport(directLink, 0, this0.nrlConfigObj.ResponseServerUrl);
				}
			});
		} else {
			$element.addClass('text-mode');
			$element.css({
				'background-color': '#f3f3f3',
				'max-width': (this0.nrlConfigObj.ThumbnailWidth + 70) + 'px',
				'line-height': '55px'
			})
				.on('click', function () {
					AdHoc.Utility.NavigateReport(directLink, 0, this0.nrlConfigObj.ResponseServerUrl);
				});
		}
		var thumbContainerElement = this0.createThumbContainerElement(report, imageMode, buttonsMode);
		$element.append(thumbContainerElement);
		if (titleMode) {
			var thumbTitleElement = this0.createThumbTitleElement(report, imageMode);
			$element.append(thumbTitleElement);
		}
		if (directLinkMode) {
			var directLinkElement = jq$('<a>')
				.attr('href', directLink)
				.on('click', function (event) {
					if ((event.which === null && event.button < 2) || (event.which !== null && event.which < 2)) {
						cancelEvent(event);
						return false;
					}
					return true;
				});
			directLinkElement.append($element);
			$element = directLinkElement;
		}
		return $element;
	}

	ReportListRenderer.prototype.createThumbContainerElement = function (report, imageMode, buttonsMode) {
		var this0 = this;
		var element = jq$('<div class="thumb-container">');
		if (imageMode) {
			element.css({
				'background-color': 'white',
				'width': this0.nrlConfigObj.ThumbnailWidth + 'px',
				'height': this0.nrlConfigObj.ThumbnailHeight + 'px'
			}).append(jq$('<img>').attr('src', report.imgUrl));
		} else {
			element.css({
				'width': (this0.nrlConfigObj.ThumbnailWidth + 70) + 'px',
				'height': '0',
				'float': 'left'
			});
		}
		if (buttonsMode) {
			var thumbButtonsElement = this0.createThumbButtonsElement(report, imageMode);
			element.append(thumbButtonsElement);
		}
		return element;
	};

	ReportListRenderer.prototype.createThumbButtonsElement = function (report, imageMode) {
		var this0 = this;
		var element = jq$('<div class="thumb-buttons"></div>');
		if (!report.viewOnly && !report.isLocked && this0.nrlConfigObj.AllowDesignReports) {
			var thumbEditElement = jq$('<div class="thumb-button thumb-edit"></div>')
				.attr('title', IzLocal.Res('js_Edit', 'Edit'))
				.on('click',
					function (event) {
						cancelEvent(event);

						var link = this0.createDirectLink(report, true);
						if (!this0.nrlConfigObj.ChangParentUrlWhenRedirect) {
							AdHoc.Utility.NavigateReport(link, 0, this0.nrlConfigObj.ResponseServerUrl);
						} else {
							AdHoc.Utility.NavigateReport(link, 0, this0.nrlConfigObj.ResponseServerUrl, true);
						}
					});
			if (!imageMode) {
				thumbEditElement.css('right', '28px');
			} else {
				thumbEditElement.addClass('bottom');
			}
			element.append(thumbEditElement);
		}
		if (!report.readOnly &&
			!report.viewOnly &&
			!report.isLocked &&
			this0.nrlConfigObj.AllowDeletingReports &&
			this0.nrlConfigObj.AllowDesignReports) {
			var thumbRemoveElement = jq$('<div class="thumb-button thumb-remove"></div>')
				.attr('title', IzLocal.Res('js_Remove', 'Remove'))
				.on('click',
					function (event) {
						cancelEvent(event);
						var fullName = report.categoryFull + this0.nrlConfigObj.CategoryCharacter + report.name;
						var message = IzLocal.Res('js_AreYouSureYouWantToDeleteMessage', 'Are you sure you want to delete {0}?')
							.replace(/\{0\}/g, fullName);
						this0.deleteReport(report, message, report.urlEncodedName);
					});
			element.append(thumbRemoveElement);
		}
		if (!report.csvOnly || !imageMode) {
			var thumbPrintElement = jq$('<div class="thumb-button thumb-print"></div>')
				.attr('title', IzLocal.Res('js_Print', 'Print'))
				.addClass('thumb-print')
				.on('click',
					function (event) {
						cancelEvent(event);

						var link = 'rs.aspx?rn=' + report.urlEncodedName + '&print=1';
						window.open(link, '_blank');
					});
			if (!imageMode) {
				thumbPrintElement.css('right', '56px');
			} else {
				thumbPrintElement.addClass('bottom');
			}
			element.append(thumbPrintElement);
		}
		return element;
	};

	ReportListRenderer.prototype.createThumbTitleElement = function (report, imageMode) {
		var this0 = this;
		var $element = jq$('<div class="thumb-title"></div>');
		if (imageMode) {
			$element.css('max-width', this0.nrlConfigObj.ThumbnailWidth + 'px');
			$element.text(report.name);
		} else {
			var $textElement = jq$('<span class="thumb-text-mode"></span>')
				.text(report.name);
			$element.append($textElement);
		}
		return $element;
	};

	ReportListRenderer.prototype.createDirectLink = function (report, isDesignerLink) {
		var this0 = this;
		var linkBaseUrl;
		if (isDesignerLink) {
			if (report.dashboard)
				linkBaseUrl = this0.nrlConfigObj.DashboardDesignerLinkTemplate;
			else if (report.reportDesignerType === 'ReportDesigner')
				linkBaseUrl = this0.nrlConfigObj.ReportDesignerLinkTemplate;
			else
				linkBaseUrl = this0.nrlConfigObj.InstantReportDesignerLinkTemplate;
		} else {
			if (report.dashboard)
				linkBaseUrl = this0.nrlConfigObj.DashboardLinkTemplate;
			else
				linkBaseUrl = this0.nrlConfigObj.ReportLinkTemplate;
		}
		// replace '\\' to '\' because url in tag <a> doesn't need double slashes
		var link = linkBaseUrl + report.urlEncodedName.replaceAll(/\\\\/, '\\');
		return link;
	};

	ReportListRenderer.prototype.deleteReport = function (report, message, reportName) {
		var this0 = this;
		ReportingServices.showConfirm(message, function (result) {
			if (result === jsResources.OK) {
				this0.turnOnLoading(true,
					IzLocal.Res('js_Deleting', 'Deleting...'),
					false,
					function () {
						this0.performDelete({
							report: report,
							reportName: reportName
						});
					});
			}
		}, { title: jsResources.Delete, showClose: false });
	};

	ReportListRenderer.prototype.performDelete = function (userData) {
		var this0 = this;
		var requestString = 'wscmd=deletereportset';
		requestString += '&wsarg0=' + userData.reportName;
		AjaxRequest('./rs.aspx', requestString, function () {
			var categoryObject = this0.getCategoryByName(userData.report.categoryFull);
			categoryObject.reports = [];
			this0.loadCategory(categoryObject);
		}, null, 'deletereportset', requestString);
	};

	ReportListRenderer.prototype.onError = function (message) {
		var this0 = this;
		this0.$elReportList.empty().text(message);
		this0.turnOffLoading(true, function () {
			this0.showContent();
		});
	};

	ReportListRenderer.prototype.getCategoryByName = function (fullName) {
		var this0 = this;
		var searchName = fullName;
		if (!fullName)
			searchName = IzLocal.Res('js_Uncategorized', 'Uncategorized');
		var categories = this0.categoriesModel.all.filter(function (categoryObj) {
			return categoryObj.fullName === searchName;
		});
		return categories.length ? categories[0] : null;
	};

	ReportListRenderer.prototype.turnOnLoading = function (animate, text, forceSplashscreenHeight, callback) {
		var this0 = this;
		var alignLoading = function () {
			var vSize = document.body.offsetHeight;
			this0.$elLoading.css('height', forceSplashscreenHeight ? vSize + 'px' : 'auto');
			this0.$elLoadingWord.css('margin-top', (vSize / 3) + 'px');
		};
		this0.hideContent();
		this0.$elContent.css('cursor', 'wait');
		this0.$elLoadingWord.html(text ? text : '');
		if (animate && this0.$elReportList) {
			this0.$elReportList.stop(true, true).fadeOut(250, function () {
				alignLoading();
				this0.$elLoading.stop(true, true).fadeIn(250, function () {
					if (typeof (callback) === 'function')
						callback.call(this0);
				});
			});
		} else {
			this0.$elReportList.hide();
			alignLoading();
			this0.$elLoading.show();
			if (typeof (callback) === 'function')
				callback.call(this0);
		}
	};

	ReportListRenderer.prototype.turnOffLoading = function (animate, callback) {
		var this0 = this;
		this0.$elContent.css('cursor', 'default');
		this0.$elSearchProgressIcon.hide();
		this0.$elSearchIcon.show();
		this0.$elCancelSearchIcon.show();
		if (animate && this0.$elLoading.length) {
			this0.$elLoading.stop(true, true).fadeOut(250,
				function () {
					this0.$elReportList.stop(true, true).fadeIn(250,
						function () {
							this0.$elLoading.hide();
							this0.showContent();
							if (typeof (callback) === 'function')
								callback.call(this0);
						});
				});
		} else {
			this0.$elLoading.hide();
			this0.$elReportList.show();
			this0.showContent();
			if (typeof (callback) === 'function')
				callback.call(this0);
		}
	};

	ReportListRenderer.prototype.showContent = function () {
		var this0 = this;
		var reportListOffsetTop = this0.$elMainPanel.offset().top;
		var footer = jq$('.izenda-layout-footer');
		if (footer.length)
			reportListOffsetTop += footer.height();
		var height = 'calc(100vh - ' + reportListOffsetTop + 'px)';
		this0.$elReportList.css('height', height);
		this0.$elReportList.css('overflow-y', 'auto');
		this0.$elReportList.css('visibility', 'visible');
		this0.$elSideMenu.css('height', height);
		this0.$elSideMenu.css('overflow-y', 'auto');
	};

	ReportListRenderer.prototype.hideContent = function () {
		var this0 = this;
		this0.$elReportList.css('visibility', 'hidden');
	};

	ReportListRenderer.prototype.hideSideMenu = function () {
		var this0 = this;
		this0.$elSideMenu.removeClass('open');
		this0.$elSideMenuBackdrop.removeClass('open');
	};

	ReportListRenderer.prototype.showSideMenu = function () {
		var this0 = this;
		this0.$elSideMenu.addClass('open');
		this0.$elSideMenuBackdrop.addClass('open');
	};

	/////////////////////////////
	// report list requests class
	/////////////////////////////
	function ReportListRequest() {
		this.nrlConfigObj = null;
	}

	ReportListRequest.prototype.loadConfig = function (context, callback) {
		var this0 = this;
		var instant = getUrlParam('instant');
		if (instant !== '1') instant = '0';

		// load config
		var requestString = 'wscmd=reportlistconfig&wsarg0=' + instant;
		AjaxRequest('./rs.aspx', requestString, function (returnObj, id) {
			if (id !== 'reportlistconfig') return;
			if (typeof returnObj === 'undefined' || returnObj === null)
				throw 'reportlistconfig returnObj is supposed to be object.';
			// process config
			this0.nrlConfigObj = returnObj;
			if (!this0.nrlConfigObj.Operational) {
				window.location = getAppendedUrl(this0.nrlConfigObj.SettingsLink);
				return;
			}
			responseServer = new AdHoc.ResponseServer(this0.nrlConfigObj.ResponseServerUrl, this0.nrlConfigObj.TimeOut);
			resourcesProvider = new AdHoc.ResourcesProvider(this0.nrlConfigObj.ResourcesProviderUrl, this0.nrlConfigObj.TimeOut);
			var reportDesignerLink = jq$('#newReportLink');
			reportDesignerLink.href = this0.nrlConfigObj.ReportDesignerLink;
			reportDesignerLink.target = this0.nrlConfigObj.ReportDesignerTarget;

			var dashboardDesignerLink = jq$('#newDashboardLink');
			dashboardDesignerLink.href = this0.nrlConfigObj.DashboardDesignerLink;

			var irdivlink = document.getElementById('irdivlink');
			if (irdivlink)
				irdivlink.onclick = function () {
					window.location = this0.nrlConfigObj.InstantReportUrl;
				};

			if (typeof (callback) === 'function')
				callback.call(context ? context : this0, this0.nrlConfigObj);
		}, function (thisRequestObject) {
			// error handling
			console.error('Failed to load report list config', thisRequestObject);
			throw 'Failed to load report list config';
		}, 'reportlistconfig', requestString);
	};

	ReportListRequest.prototype.loadReports = function (searchString, categoryFullName, context, callbackSuccess, callbackError) {
		var this0 = this;
		var keyword = '';
		var category = '';
		if (typeof (searchString) === 'string')
			keyword = searchString;
		if (typeof (categoryFullName) === 'string')
			category = categoryFullName;

		// load reports
		var requestString = 'wscmd=reportlistdatalite';
		requestString += '&wsarg0=' + category + '&wsarg1=' + keyword + '&wsarg2=1';
		this.reportListRequest = AjaxRequest('./rs.aspx', requestString, function (returnObj, id, parameters) {
			this0.reportListRequest = null;
			// process results
			if (id !== 'reportlistdatalite') return;
			if (typeof returnObj === 'undefined' || returnObj === null || typeof returnObj.ReportSets === 'undefined' || returnObj.ReportSets === null) {
				if (typeof (callbackSuccess) === 'function')
					callbackSuccess.call(context ? context : this0, null);
				return;
			}
			if (typeof (callbackSuccess) === 'function')
				callbackSuccess.call(context ? context : this0, returnObj);
		}, function (returnObj) {
			this0.reportListRequest = null;
			// error handling
			if (returnObj.isAborted || returnObj.requestId !== 'reportlistdatalite') return;
			var startEx = returnObj.responseText.indexOf('<' + '!' + '-' + '-');
			var exMsg;
			if (startEx >= 0)
				exMsg = returnObj.responseText.substr(startEx + 4, returnObj.responseText.length - startEx - 7);
			else
				exMsg = 'Unknown error: ' + JSON.stringify(returnObj);
			if (typeof (callbackError) === 'function')
				callbackError.call(context ? context : this0, exMsg);
		}, 'reportlistdatalite', requestString);
	};

	ReportListRequest.prototype.cancelLoadReports = function () {
		if (this.reportListRequest && this.reportListRequest.abort) {
			this.reportListRequest.isAborted = true;
			this.reportListRequest.abort();
		}
	}

	/////////////////////////////
	// utility functions
	/////////////////////////////

	function getUrlParam(name) {
		name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
		var regexS = '[\\?&]' + name + '=([^&#]*)';
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results === null)
			return '';
		else
			return results[1];
	}

	function cancelEvent(event) {
		if (!event) return;
		(event.stopPropagation) ? event.stopPropagation() : event.cancelBubble = true;
		(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
	}

	// RUN!
	jq$(document).ready(function () {
		justSelect = getUrlParam('justSelect') === '1';
		if (justSelect) {
			document.getElementById('whiteHeader').style.display = 'none';
			document.getElementById('blueHeader').style.display = 'none';
		}

		// ui renderer
		var reportListRenderer = new ReportListRenderer();
		reportListRenderer.initialize();
	});
})();
