var responseServer;
var resourcesProvider;

(function () {
	var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

	var nrlConfigObj = {};
	var justSelect = false;
	var lastlySelectedCategory = null;

	var toggleTimeout = 400,
		isToggleComplete = true;

	var searchInputTimer = null,
		searchKeyword = '';

	var rootTab = {
		level: -1,
		children: []
	};

	function GetReports(keyword, categoryFullName) {
		var requestString = 'wscmd=reportlistdatalite';
		if (keyword == null)
			keyword = '';
		requestString += '&wsarg0=' + categoryFullName + '&wsarg1=' + keyword + '&wsarg2=1';
		AjaxRequest('./rs.aspx', requestString, GetReportsSuccess, GetReportsFail, 'reportlistdatalite', requestString);
	}

	function GetReportsSuccess(returnObj, id, parameters) {
		if (id != 'reportlistdatalite' || typeof returnObj === 'undefined' || returnObj == null ||
			typeof returnObj.ReportSets === 'undefined' || returnObj.ReportSets == null) {
			jq$('#RL_SearchingIcon').css('display', 'none');
			jq$('#loadingDiv').css('display', 'none');
			return;
		}

		rootTab = {
			level: -1,
			children: []
		};

		function walkTree(node, action) {
			action(node);
			for (var i = 0; i < node.children.length; ++i) {
				walkTree(node.children[i], action);
			}
		}

		function initCategoryTree(context) {
			context.previousCatFound = false;
			for (var rCnt1 = 0; rCnt1 < returnObj.ReportSets.length; rCnt1++) {
				var reportSet = returnObj.ReportSets[rCnt1],
					isRealReport = !!reportSet.Name;

				var catFullName = reportSet.CategoryFull;
				if (catFullName == null || catFullName == '')
					catFullName = IzLocal.Res('js_Uncategorized', 'Uncategorized');

				function findChild(part, parent) {
					for (var childIndex = 0; childIndex < parent.children.length; ++childIndex) {
						if (parent.children[childIndex].TabName === part) {
							return parent.children[childIndex];
						}
					}
					return null;
				}

				var parent = context.root;
				var parts = catFullName.split(nrlConfigObj.CategoryCharacter),
					partsCount = parts.length;

				for (var partIndex = 0; partIndex < partsCount; ++partIndex) {
					var part = parts[partIndex];
					var isLastPart = partIndex == partsCount - 1;
					var child = findChild(part, parent);

					if (child == null) {
						child = new Object();
						child.TabName = part;
						child.CategoryFull = null;
						child.Reports = new Array();
						child.children = [];
						child.level = partIndex;
						child.hasReports = false;
						if (isLastPart) {
							child.hasReports = true;
							child.CategoryFull = reportSet.CategoryFull;
							if (isRealReport) {
								
								child.Reports.push(reportSet);
							}
						}
						parent.children.push(child);
					} else if (isLastPart && isRealReport) {
						child.Reports.push(reportSet);
					}

					if (lastlySelectedCategory != null && child.CategoryFull == lastlySelectedCategory.CategoryFull)
						context.previousCatFound = true;

					parent = child;
				}
			}

			var id = -1;
			walkTree(context.root, function (node) { node.ID = id++; });
		}

		var context = {
			root: rootTab,
			previousCatFound: false
		};

		if (returnObj.ReportSets.length == 0 && (parameters.toString().match(/wsarg1=./) == null || parameters.toString().match(/wsarg1=./) == 'wsarg1=&')) {
			jq$('#loadingDiv').css('display', 'none');
			jq$('#addInstantReportContainerDiv').css('display', '');
			ShowContentLoading(setTimeout(function () { window.location = nrlConfigObj.ReportDesignerLink; }, 11000), IzLocal.Res('js_NoReportsCurrentlyExistMessage', 'No reports currently exist. Please create and save at least one in the report designer.<br />Redirecting to the Report Designer in 10 seconds.'));
			return;
		} else {
			initCategoryTree(context);

			if (!context.previousCatFound && lastlySelectedCategory != null && context.root.children.length > 0) {
				lastlySelectedCategory = context.root.children[0];
				GetReports(searchKeyword, context.root.children[0].CategoryFull);
				return;
			}

			if (context.root.children.length <= 0) {
				jq$('#RL_SearchingIcon').css('display', 'none');
				var content = jq$('<div>')
					.attr('id', 'tabs')
					.css({
						'color': '#aaa',
						'font-size': '36px',
						'margin-top': '100px',
						'text-align': 'center',
						'width': '100%'
					}).text('No Reports Found');

				var reportsDiv = jq$('#reportListDiv')
					.css('display', 'none')
					.empty()
					.append(content);
				jq$('#loadingDiv').hide('fade', null, 400, function () {
					reportsDiv.show('fade', 1000);
				});
				return;
			}
		}

		function createDirectLink(report) {
			// replace '\\' to '\' because url in tag <a> doesn't need double slashes
			var link = (report.Dashboard ? nrlConfigObj.DashboardLinkTemplate : nrlConfigObj.ReportLinkTemplate)
				+ report.UrlEncodedName.replaceAll(/\\\\/, '\\');
			return link;
		}

		function createLeftTabPanelElement() {
			var leftContent = jq$('<ul>');
			walkTree(rootTab, function (node) {
				if (node == rootTab)
					return;

				var hasSubcat = node.children && node.children.length > 0;
				var marginLeft = 30 * node.level;

				var item = jq$('<li>')
					.attr('data-level', node.level)
					.attr('data-category', node.CategoryFull)
					.addClass('izenda-category-item')
					.css({
						'margin-left': marginLeft + 'px',
						'display': node.level > 0 ? (nrlConfigObj.ExpandCategorizedReports != true ? 'none' : '') : ''
					});

				if (!node.hasReports) {
					item.addClass('izenda-category-item-empty');
				}

				if (hasSubcat) {
					var expandIcon = jq$('<div>')
						.addClass('izenda-category-expand-icon')
						.css('background', 'url("' + resourcesProvider.ResourcesProviderUrl + 'image=ModernImages.collapse.png' + '") no-repeat center')
						.on('click', function () {
							ToggleSubcategories(this);
						});
					item.addClass('izenda-category-item-expand')
					item.append(expandIcon);
				}

				var categoryFullName = node.CategoryFull;
				var link = jq$('<a>')
					.attr('href', '#')
					.text(node.TabName);

				if (node.hasReports) {
					link.on('click', function () {
						LeftTabClicked(node);
						ShowContentLoading(function () {
							GetReports(searchKeyword, node.CategoryFull)
						}, IzLocal.Res('js_Loading'));
					});
				}

				if (lastlySelectedCategory != null && node.CategoryFull == lastlySelectedCategory.CategoryFull) {
					item.addClass('izenda-category-item-selected');
				}

				if (hasSubcat) {
					link.addClass('izenda-category-item-expander');
				}

				item.append(link);

				leftContent.append(item);
			});
			return leftContent;
		}
		jq$('#leftSideCats')
			.empty().append(createLeftTabPanelElement());

		function createRecentContentElement(report) {
			var directLink = createDirectLink(report);
			var item = jq$('<li>').append(jq$('<a>')
				.attr('href', directLink)
				.text(report.Name)
				.on('click', function () {
					var evt = event || window.event;
					if ((evt.which == null && evt.button < 2) || (evt.which != null && evt.which < 2)) {
						AdHoc.Utility.NavigateReport(directLink, 0, nrlConfigObj.ResponseServerUrl);
						if (evt.preventDefault) {
							evt.preventDefault();
						} else {
							evt.returnValue = false;
						}
						return false;
					}
				}));
			return item;
		}
		function createRecentContentElements() {
			var element = jq$('<ul>');
			for (var index = 0; index < returnObj.Recent.length; index++) {
				var recentItem = createRecentContentElement(returnObj.Recent[index]);
				element.append(recentItem);
			}
			return element;
		}
		jq$('#recentReports')
			.empty().append(createRecentContentElements());

		function createRightTabPanelElement() {
			var content = jq$('<div>').attr('id', 'tabs');
			var hiddenItems = jq$('<ul>').css('display', 'none');
			walkTree(rootTab, function (node) {
				var hiddenItem = jq$('<li>').css({
					'font-size': '0.9em'
				}).append(jq$('<a>').attr('href', '#tab' + node.ID).text(node.TabName));
				hiddenItems.append(hiddenItem);
			});

			content.append(hiddenItems);

			function createReportItem(report, container) {
				if (report.Name == null || report.Name == '')
					return;
				if (report.Dashboard && justSelect)
					return;

				var fullName = report.Name;
				if (report.CategoryFull != null && report.CategoryFull != '')
					fullName = report.CategoryFull + nrlConfigObj.CategoryCharacter + fullName;
				var directLink = createDirectLink(report);

				function createThumbElement(imageMode, buttonsMode, titleMode, directLinkMode) {
					var element = jq$('<div>')
						.addClass(isTouch ? 'thumb no-hover' : 'thumb');
					if (imageMode) {
						element.on('click', function () {
							var evt = event || window.event;
							if ((evt.which == null && evt.button < 2) || (evt.which != null && evt.which < 2)) {
								AdHoc.Utility.NavigateReport(directLink, 0, nrlConfigObj.ResponseServerUrl);
							}
						});
					} else {
						element.css({
							'background-color': '#f3f3f3',
							'max-width': (nrlConfigObj.ThumbnailWidth + 70) + 'px',
							'line-height': '55px'
						})
						.on('click', function () {
							AdHoc.Utility.NavigateReport(directLink, 0, nrlConfigObj.ResponseServerUrl);
						});
					}
					var thumbContainerElement = createThumbContainerElement(imageMode, buttonsMode);
					element.append(thumbContainerElement);
					if (titleMode) {
						var thumbTitleElement = createThumbTitleElement(imageMode);
						element.append(thumbTitleElement);
					}
					if (directLinkMode) {
						var directLinkElement = jq$('<a>')
							.attr('href', directLink)
							.on('click', function () {
								var evt = event || window.event;
								if ((evt.which == null && evt.button < 2) || (evt.which != null && evt.which < 2)) {
									if (evt.preventDefault) {
										evt.preventDefault();
									} else {
										evt.returnValue = false;
									}
									return false;
								}
							});
						directLinkElement.append(element);
						element = directLinkElement;
					}
					return element;
				}

				function createThumbContainerElement(imageMode, buttonsMode) {
					var element = jq$('<div>')
						.addClass('thumb-container');
					if (imageMode) {
						element.css({
							'background-color': 'white',
							'width': nrlConfigObj.ThumbnailWidth + 'px',
							'height': nrlConfigObj.ThumbnailHeight + 'px'
						}).append(jq$('<img>').attr('src', report.ImgUrl));
					} else {
						element.css({
							'width': (nrlConfigObj.ThumbnailWidth + 70) + 'px',
							'height': '0px',
							'float': 'left'
						});
					}
					if (buttonsMode) {
						var thumbButtonsElement = createThumbButtonsElement(imageMode);
						element.append(thumbButtonsElement);
					}
					return element;
				}

				function createThumbButtonsElement(imageMode) {
					var element = jq$('<div>')
						.addClass('thumb-buttons');
					if (!report.ViewOnly && !report.IsLocked && nrlConfigObj.AllowDesignReports) {
						var thumbEditElement = jq$('<div>')
							.attr('title', IzLocal.Res('js_Edit', 'Edit'))
							.addClass('thumb-edit')
							.on('click', function () {
								event.cancelBubble = true;
								(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
								(event.preventDefault) ? event.preventDefault() : event.returnValue = false;

								var link = '';
								if (report.Dashboard)
									link = nrlConfigObj.DashboardDesignerLinkTemplate;
								else if (report.ReportDesignerType === 'ReportDesigner') {
									link = nrlConfigObj.ReportDesignerLinkTemplate;
								} else {
									link = nrlConfigObj.InstantReportDesignerLinkTemplate;
								}
								link += report.UrlEncodedName;
								if (!nrlConfigObj.ChangParentUrlWhenRedirect) {
									AdHoc.Utility.NavigateReport(link, 0, nrlConfigObj.ResponseServerUrl);
								} else {
									AdHoc.Utility.NavigateReport(link, 0, nrlConfigObj.ResponseServerUrl, true);
								}
							});
						if (!imageMode) {
							thumbEditElement.css('top', '28px');
						}
						element.append(thumbEditElement);
					}
					if (!report.ReadOnly && !report.ViewOnly && !report.IsLocked && nrlConfigObj.AllowDeletingReports && nrlConfigObj.AllowDesignReports) {
						var thumbRemoveElement = jq$('<div>')
							.attr('title', IzLocal.Res('js_Remove', 'Remove'))
							.addClass('thumb-remove')
							.on('click', function () {
								event.cancelBubble = true;
								(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
								(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
								var message = IzLocal.Res('js_AreYouSureYouWantToDeleteMessage', 'Are you sure you want to delete {0}?').replace(/\{0\}/g, fullName);
								DeleteReport(message, report.UrlEncodedName);
							});
						element.append(thumbRemoveElement);
					}
					if (!report.CsvOnly || !imageMode) {
						var thumbPrintElement = jq$('<div>')
							.attr('title', IzLocal.Res('js_Print', 'Print'))
							.addClass('thumb-print')
							.on('click', function () {
								event.cancelBubble = true;
								(event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
								(event.preventDefault) ? event.preventDefault() : event.returnValue = false;

								var link = 'rs.aspx?rn=' + report.UrlEncodedName + '&print=1';
								window.open(link, '_blank');
							});
						if (!imageMode) {
							thumbPrintElement.css('top', '28px');
						}
						element.append(thumbPrintElement);
					}
					return element;
				}

				function createThumbTitleElement(imageMode) {
					var element = jq$('<div>')
						.addClass('thumb-title');
					if (imageMode) {
						element.css({
							'max-width': nrlConfigObj.ThumbnailWidth + 'px'
						}).text(report.Name);
					} else {
						element.css({
							'max-width': nrlConfigObj.ThumbnailWidth + 'px',
							'line-height': '55px',
							'padding-top': '0px'
						}).append(jq$('<span>').css({
							'margin-top': '-5px',
							'word-break': 'normal',
							'display': 'inline-block',
							'line-height': '20px',
							'vertical-align': 'middle'
						}).text(report.Name));
					}
					return element;
				}

				if (!justSelect) {
					if (nrlConfigObj.ThumbnailsAllowed) {
						var thumbElement = createThumbElement(true, true, true, true);
						container.append(thumbElement);
					}
					else {
						var thumbElement = createThumbElement(false, true, true);
						container.append(thumbElement);
					}
				} else {
					var thumbElement = createThumbElement(true, false, false);
					container.append(thumbElement);
				}
			}

			function createTabElement(node) {
				var tabElement = jq$('<div>').attr('id', 'tab' + node.ID);
				var thumbsElement = jq$('<div>').addClass('thumbs');
				tabElement.append(thumbsElement);
				for (var reportIndex = 0; reportIndex < node.Reports.length; ++reportIndex) {
					var report = node.Reports[reportIndex];
					createReportItem(report, thumbsElement);
				}
				content.append(tabElement);
			}

			walkTree(rootTab, function (node) {
				if (node == rootTab)
					return;
				createTabElement(node);
			});

			return content;
		}
		jq$('#reportListDiv').css('display', 'none')
			.empty().append(createRightTabPanelElement);

		jq$('#tabs').tabs({ fx: { opacity: 'toggle' } });
		jq$('#tabs').tabs('select', lastlySelectedCategory != null ? lastlySelectedCategory.ID : 0);
		LeftTabClicked(lastlySelectedCategory);

		jq$('#loadingDiv').hide('fade', null, 400, function () {
			jq$('#reportListDiv').css('visibility', 'visible');
			jq$('#contentDiv').css('cursor', 'default');
			jq$('#reportListDiv').show('fade', 1000);
		});
		jq$('#RL_SearchingIcon').css('display', 'none');
	}

	function GetReportsFail(returnObj) {
		if (returnObj.requestId != 'reportlistdatalite') {
			return;
		}
		var startEx = returnObj.responseText.indexOf('<' + '!' + '-' + '-');
		if (startEx < 0) {
			return;
		}
		var exMsg = returnObj.responseText.substr(startEx + 4, returnObj.responseText.length - startEx - 7);
		var reportsDiv = document.getElementById('reportListDiv');
		jq$('#RL_SearchingIcon').css('display', 'none');
		jq$('#loadingDiv').css('display', 'none');
		reportsDiv.innerHTML = exMsg;
		document.getElementById('reportListDiv').style.visibility = 'visible';
	}

	function GetUrlParam(name) {
		name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
		var regexS = '[\\?&]' + name + '=([^&#]*)';
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null)
			return '';
		else
			return results[1];
	}

	function GetConfig() {
		var instant = GetUrlParam('instant');
		if (instant != '1')
			instant = '0';
		var requestString = 'wscmd=reportlistconfig&wsarg0=' + instant;
		AjaxRequest('./rs.aspx', requestString, GetConfigSuccess, null, 'reportlistconfig', requestString);
	}

	function GetConfigSuccess(returnObj, id) {
		if (id != 'reportlistconfig' || returnObj == undefined || returnObj == null)
			return;
		nrlConfigObj = returnObj;
		if (!nrlConfigObj.Operational) {
			window.location = getAppendedUrl(nrlConfigObj.SettingsLink);
			return;
		}
		responseServer = new AdHoc.ResponseServer(nrlConfigObj.ResponseServerUrl, nrlConfigObj.TimeOut);
		resourcesProvider = new AdHoc.ResourcesProvider(nrlConfigObj.ResourcesProviderUrl, nrlConfigObj.TimeOut);
		var reportDesignerLink = jq$('#newReportLink');
		var dashboardDesignerLink = jq$('#newDashboardLink');
		if (reportDesignerLink != null) {
			reportDesignerLink.href = nrlConfigObj.ReportDesignerLink;
			reportDesignerLink.target = nrlConfigObj.ReportDesignerTarget;
		}
		if (dashboardDesignerLink != null)
			dashboardDesignerLink.href = nrlConfigObj.DashboardDesignerLink;
		var irdivlink = document.getElementById('irdivlink');
		if (irdivlink != null)
			irdivlink.onclick = function () { window.location = nrlConfigObj.InstantReportUrl; };
		GetReports(searchKeyword, '');
	}

	function LeftTabClicked(category) {
		var fullname = category ? category.CategoryFull : '';
		var items = jq$('.izenda-category-item[data-category]')
			.removeClass('izenda-category-item-selected')
			.each(function () {
				var item = jq$(this);
				if (item.attr('data-category') == fullname) {
					item.addClass('izenda-category-item-selected');
				}
			});
		lastlySelectedCategory = category;
	}

	function ToggleSubcategories(target) {
		if (!isToggleComplete)
			return;
		isToggleComplete = false;
		var parentNode = jq$(target).parent();
		var targetLevel = parseInt(parentNode.attr('data-level'));
		var vis = parentNode.next().is(':visible');
		parentNode.nextUntil('[data-level="' + targetLevel + '"]').each(function () {
			var current = jq$(this);
			if (current.attr('data-level') <= targetLevel)
				return;
			if (vis && current.is(':visible'))
				current.hide('slide', { direction: 'up' }, toggleTimeout);
			else if (!vis && !current.is(':visible') && (parseInt(current.attr('data-level')) == targetLevel + 1))
				current.show('slide', { direction: 'up' }, toggleTimeout);
		});
		setTimeout(function () { isToggleComplete = true }, toggleTimeout + 100);
	}

	function ShowContentLoading(callback, text) {
		jq$('#contentDiv').css('cursor', 'wait');
		jq$('#reportListDiv').hide('fade', null, 600, ShowLoadingAfterFade(text, callback));
	}

	function ShowLoadingAfterFade(text, callback) {
		var vSize = document.body.offsetHeight;
		jq$('#loadingDiv').css('height', vSize + 'px');
		jq$('#loadingWord').css('margin-top', (vSize / 3) + 'px');
		var loadingWord = document.getElementById('loadingWord');
		loadingWord.innerHTML = text;
		jq$('#loadingDiv').show('fade', null, 400, callback);
	}

	function DeleteReport(message, reportName) {
		ReportingServices.showConfirm(message, function (result) {
			if (result == jsResources.OK)
				ShowContentLoading(function () { PerformDelete({ reportName: reportName }); }, IzLocal.Res('js_Deleting', 'Deleting...'));
		}, { title: jsResources.Delete, showClose: false });
	}

	function PerformDelete(userData) {
		var requestString = 'wscmd=deletereportset';
		requestString += '&wsarg0=' + userData.reportName;
		AjaxRequest('./rs.aspx', requestString, ReportSetDeleted, null, 'deletereportset', requestString);
	}

	function ReportSetDeleted(returnObj, id) {
		if (id != 'deletereportset')
			return;
		SearchReports();
	}

	function OnFocusQuickSearchBoxHandler(event) {
		var searchBox = event.target || event;
		if (searchBox.value == IzLocal.Res('js_Search', 'Search')) {
			searchBox.value = '';
			searchBox.style.color = '#000000';
		}
	}

	function OnBlurQuickSearchBoxHandler(event) {
		var searchBox = event.target || event;
		if (searchBox.value == '') {
			searchBox.value = IzLocal.Res('js_Search', 'Search');
			searchBox.style.color = '#B0B0B0';
		}
	}

	function OnKeyupQuickSearchBoxHandler(event) {
		var searchBox = event.target || event;
		jq$('#RL_SearchingIcon').css('display', 'none');
		searchKeyword = searchBox.value.toLowerCase();
		clearTimeout(searchInputTimer);
		jq$('#RL_SearchingIcon').css('display', '');
		searchInputTimer = setTimeout(SearchReports, 1000);
	}

	function SearchReports() {
		GetReports(searchKeyword, lastlySelectedCategory != null ? lastlySelectedCategory.CategoryFull : '');
	}

	jq$(document).ready(function () {
		justSelect = GetUrlParam('justSelect') == '1';
		if (justSelect) {
			document.getElementById('whiteHeader').style.display = 'none';
			document.getElementById('blueHeader').style.display = 'none';
		}

		var vSize = document.body.offsetHeight;
		jq$('#loadingDiv').css('height', vSize + 'px');
		jq$('#loadingWord').css('margin-top', (vSize / 3) + 'px');

		GetConfig();

		jq$('#RL_QuickSearchBox')
			.on('blur', OnBlurQuickSearchBoxHandler)
			.on('focus', OnFocusQuickSearchBoxHandler)
			.on('keyup', OnKeyupQuickSearchBoxHandler);

		jq$('.RL_CancelSearchIcon')
			.on('click', function () {
				if (!searchKeyword)
					return;
				var sb = document.getElementById('RL_QuickSearchBox');
				sb.value = '';
				searchKeyword = '';
				OnBlurQuickSearchBoxHandler(sb);
				SearchReports();
			});

	});
})();
