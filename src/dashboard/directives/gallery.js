izendaRequire.define([
	'angular',
	'../../common/query/services/url-service',
	'../services/services'
], function (angular) {

	/**
	 * Slider gallery directive.
	 */
	angular.module('izendaDashboard').directive('izendaGallery', [
		'$window',
		'$timeout',
		'$interval',
		'$izendaUrl',
		'$izendaDashboardQuery',
		'$izendaDashboardState',
		function (
			$window,
			$timeout,
			$interval,
			$izendaUrl,
			$izendaDashboardQuery,
			$izendaDashboardState) {
			return {
				restrict: 'E',
				require: 'ngModel',
				scope: {
					width: '@',
					height: '@',
					updateCounter: '=',
					playTimeout: '=',
					playStarted: '=',
					playStopOnComplete: '=',
					isFullScreen: '=',
					enabled: '=',
					ngModel: '=',
					galleryItems: '='
				},
				templateUrl: '###RS###extres=components.dashboard.templates.gallery.html',

				link: function ($scope, $element) {
					var $smallButtonsPanel = $element.find('.izenda-gallery-controls-round-panel');
					var $titlePanel = $element.find('.izenda-gallery-title-controls');
					var fullscreenRootElement = $element.parent().get(0);
					$scope.state = {
						uid: Math.floor(Math.random() * 1000 * 1000 * 1000 * 1000),
						updatePlayIntervalId: null,
						updatePlayTimeoutId: null,
						resizeTimeoutId: null,
						width: 0,
						height: 0,
						isUiHidden: false,
						smallButtonsPanelHeight: $smallButtonsPanel.height(), // cache sizes
						elementHeight: $element.height(),
						titlePanelPosition: $titlePanel.position(),
						titlePanelHeight: $titlePanel.height()
					};

					/**
					 * Parse size
					 */
					$scope.parseSize = function (sizeString) {
						if (!String.prototype.endsWith) {
							Object.defineProperty(String.prototype, 'endsWith', {
								value: function (searchString, position) {
									var subjectString = this.toString();
									if (position === undefined || position > subjectString.length) {
										position = subjectString.length;
									}
									position -= searchString.length;
									var lastIndex = subjectString.indexOf(searchString, position);
									return lastIndex !== -1 && lastIndex === position;
								}
							});
						}

						var result = {
							isPercent: false,
							value: 0
						};
						if (sizeString.endsWith('%')) {
							result.isPercent = true;
							result.value = parseInt(sizeString.substring(0, sizeString.length - 1)) / 100;
						} else {
							if (sizeString.endsWith('px'))
								result.value = parseInt(sizeString.substring(0, sizeString.length - 2));
							else
								result.value = parseInt(sizeString);
						}
						return result;
					}

					/**
					 * Get gallery item size
					 */
					$scope.getItemSize = function (itemIndex) {
						var parsedWidth = $scope.parseSize($scope.width);
						var parsedHeight = $scope.parseSize($scope.height);

						var galleryItemWidth = Math.round(parsedWidth.isPercent ? $scope.state.width * parsedWidth.value : parsedWidth.value);
						var galleryItemHeight = Math.round(parsedHeight.isPercent ? $scope.state.height * parsedHeight.value : parsedHeight.value);

						var spaceWidth = 100;
						var ngModelVal = angular.isNumber($scope.ngModel) && $scope.ngModel ? $scope.ngModel : 0;
						var delta = angular.isNumber(itemIndex) ? itemIndex - ngModelVal : 0;
						var transformX = Math.round(($scope.state.width - galleryItemWidth) / 2 + delta * (galleryItemWidth + spaceWidth));
						var transformY = Math.round(($scope.state.height - galleryItemHeight) / 2);

						var constraintBottom = $scope.state.smallButtonsPanelHeight;
						var constraintTop = $scope.state.titlePanelPosition.top + $scope.state.titlePanelHeight + 10;
						if (transformY < constraintTop)
							transformY = constraintTop;
						if (transformY + galleryItemHeight > $scope.state.elementHeight - constraintBottom) {
							galleryItemHeight = $scope.state.elementHeight - transformY - constraintBottom;
						}
						return {
							x: transformX,
							y: transformY,
							width: galleryItemWidth,
							height: galleryItemHeight,
							delta: delta
						};
					};

					/**
					 * Get gallery item style
					 */
					$scope.getItemStyle = function (itemIndex) {
						var size = $scope.getItemSize(itemIndex);
						var style = {
							'transform': 'translate(' + size.x + 'px, ' + size.y + 'px)',
							'width': size.width + 'px',
							'height': size.height + 'px',
							'opacity': size.delta ? '0.5' : '1'
						};
						return style;
					};

					/**
					 * Go previous slide
					 */
					$scope.goPrevious = function () {
						$scope.ngModel--;
						if ($scope.ngModel < 0)
							$scope.ngModel = $scope.galleryItems.length - 1;
					};

					/**
					 * Go next slide
					 */
					$scope.goNext = function () {
						$scope.ngModel++;
						if ($scope.ngModel >= $scope.galleryItems.length)
							$scope.ngModel = 0;
					};

					/**
					 * Go to selected slide
					 */
					$scope.goTo = function (index) {
						$scope.ngModel = index;
						$scope.$applyAsync();
					}

					/**
					 * Create title for the tile
					 */
					$scope.createTileTitle = function (tile) {
						if (!angular.isObject(tile))
							return '';
						if (tile.title != null && tile.title != '')
							return tile.title;
						var result = '';
						if (tile.reportCategory != null && tile.reportCategory != '')
							result = tile.reportCategory + ' / ';
						result = result + tile.reportName + ' / ' + tile.reportPartName;
						return result;
					};

					/**
					 * Initialize interval
					 */
					$scope.updatePlay = function (started) {
						if ($scope.state.updatePlayIntervalId != null) {
							$interval.cancel($scope.state.updatePlayIntervalId);
							$scope.state.updatePlayIntervalId = null;
						}
						if ($scope.state.updatePlayTimeoutId != null) {
							$timeout.cancel($scope.state.updatePlayTimeoutId);
							$scope.state.updatePlayTimeoutId = null;
							$scope.state.isUiHidden = false;
						}
						if (started) {
							$scope.state.updatePlayIntervalId = $interval(function () {
								if ($scope.playStopOnComplete && $scope.ngModel === $scope.galleryItems.length - 1) {
									$interval.cancel($scope.state.updatePlayIntervalId);
									$scope.state.updatePlayIntervalId = null;
									$scope.playStarted = false;
									$timeout.cancel($scope.state.updatePlayTimeoutId);
									$scope.state.updatePlayTimeoutId = null;
									$scope.state.isUiHidden = false;
								} else {
									$scope.goNext();
								}
							}, $scope.playTimeout);

							$scope.state.updatePlayTimeoutId = $timeout(function () {
								$scope.state.isUiHidden = true;
							}, 1);
						}
					};

					/**
					 * Load gallery tile
					 */
					$scope.loadTileToGallery = function (tile, $tile) {
						$izendaDashboardQuery.loadTileReport({
							updateFromSourceReport: false,
							dashboardFullName: $izendaUrl.getReportInfo().fullName,
							reportFullName: tile.reportFullName,
							reportPreviousFullName: null,
							top: tile.top,
							contentWidth: $scope.state.width - 50,
							contentHeight: $scope.state.height - 50,
							forPrint: false
						}).then(function (htmlData) {
							$tile.empty();
							var $reportDiv = angular.element('<div class="report"></div>');
							$tile.append($reportDiv);
							// load html into this div
							$izendaDashboardState.loadReportIntoContainer(htmlData, $reportDiv);

							$scope.$applyAsync();
						});
					};

					/**
					 * Clear gallery tiles
					 */
					$scope.clearGalleryTiles = function () {
						angular.element.each($scope.galleryItems, function () {
							var tile = this;
							var $tile = $element.find('.izenda-gallery-item[tile-id=' + tile.id + ']>.izenda-gallery-item-inner');
							$tile.empty();
						});
					};

					/**
					 * Turn on/off tile animations
					 */
					$scope.toggleTileAnimations = function (enabled) {
						if (enabled) {
							$element.find('.izenda-gallery-item').addClass('izenda-gallery-transition');
						} else {
							$element.find('.izenda-gallery-item').removeClass('izenda-gallery-transition');
						}
					};

					$scope.initItemPositions = function () {
						$scope.state.width = $element.width();
						$scope.state.height = $element.height();
						$scope.state.elementHeight = $element.height();
						$scope.state.smallButtonsPanelHeight = $smallButtonsPanel.height(); // cache sizes
						$scope.state.titlePanelPosition = $titlePanel.position();
						$scope.state.titlePanelHeight = $titlePanel.height();
						var itemSize = $scope.getItemSize();
						$smallButtonsPanel.css('top', itemSize.y + itemSize.height + 'px');
					};

					/**
					 * Update gallery
					 */
					$scope.update = function () {
						$scope.clearGalleryTiles();
						$scope.initItemPositions();

						angular.element.each($scope.galleryItems, function () {
							var tile = this;
							var $tileRoot = $element.find('.izenda-gallery-item[tile-id=' + tile.id + ']');
							var $tile = $tileRoot.children('.izenda-gallery-item-inner');
							$tile.empty();

							// show loading spinner
							var loadingHtml =
								'<div class="izenda-common-vcentered-container" style="margin-top:-40px">' +
									'<div class="izenda-common-vcentered-item">' +
										'<img class="izenda-common-img-loading" src="' + $izendaUrl.settings.urlRpPage + '?image=ModernImages.loading-grid.gif" alt="Loading..." />' +
									'</div>' +
								'</div>';
							$tile.append(loadingHtml);

							// start loading gallery tile:
							$scope.loadTileToGallery(tile, $tile);
						});
					};

					/**
					 * Show gallery
					 */
					$scope.activateGallery = function () {
						$timeout(function () {
							$scope.initItemPositions();
							$element.find('.izenda-gallery-item').css('opacity', 1);
							$timeout(function () {
								$scope.toggleTileAnimations(true);
								$scope.update(true);
							}, 250, true);
						}, 0, true);
					};

					/**
					 * Hide gallery
					 */
					$scope.deactivateGallery = function () {
						$scope.clearGalleryTiles();
						$scope.toggleTileAnimations(false);
						$element.find('.izenda-gallery-item').css('opacity', 0)
					}

					/**
					 * On fullscreen change handler
					 */
					$scope.onfullscreenchange = function (e) {
						var isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
						$scope.isFullScreen = isFullscreen;
						$scope.$applyAsync();
					}

					/**
					 * Toggle fullscreen
					 */
					$scope.toggleFullScreen = function () {
						function launchFullScreen(element) {
							if (element.requestFullscreen) {
								element.requestFullscreen();
							} else if (element.mozRequestFullScreen) {
								element.mozRequestFullScreen();
							} else if (element.webkitRequestFullScreen) {
								element.webkitRequestFullScreen();
							} else if (element.msRequestFullscreen) {
								element.msRequestFullscreen();
							}
						}
						function cancelFullscreen() {
							if (document.exitFullscreen) {
								document.exitFullscreen();
							} else if (document.mozCancelFullScreen) {
								document.mozCancelFullScreen();
							} else if (document.webkitCancelFullScreen) {
								document.webkitCancelFullScreen();
							} else if (document.msExitFullscreen) {
								document.msExitFullscreen();
							}
						}

						if ($scope.isFullScreen) {
							launchFullScreen(fullscreenRootElement);
						} else {
							cancelFullscreen();
						}
					};

					/**
					 * Window resize handler
					 */
					$scope.turnOnWindowResizeHandler = function () {
						$scope.state.resizeTimeoutId = null;
						var resizeCompleted = function () {
							$element.show();
							$timeout.cancel($scope.state.resizeTimeoutId);
							$scope.state.resizeTimeoutId = null;

							$scope.state.smallButtonsPanelHeight = $smallButtonsPanel.height(); // cache sizes
							$scope.state.elementHeight = $element.height();
							$scope.state.titlePanelPosition = $titlePanel.position();
							$scope.state.titlePanelHeight = $titlePanel.height();
							$scope.update();
							$scope.$applyAsync();
						};
						angular.element($window).on('resize.izendaGallery' + $scope.state.uid, function () {
							if ($scope.state.resizeTimeoutId != null) {
								$timeout.cancel($scope.state.resizeTimeoutId);
								$scope.state.resizeTimeoutId = null;
							}
							if (!$scope.enabled)
								return;
							$scope.clearGalleryTiles();
							$element.hide();
							$scope.state.resizeTimeoutId = $timeout(function () {
								resizeCompleted();
							}, 500);

						});
					}

					// handle play timeout change
					$scope.$watch('playTimeout', function () {
						$scope.updatePlay($scope.playStarted);
					});

					// handle play started
					$scope.$watch('playStarted', function (newValue) {
						$scope.updatePlay(newValue);
					});

					// handle play started
					$scope.$watch('playStopOnComplete', function () {
						$scope.updatePlay($scope.playStarted);
					});

					// handle fullscreen
					$scope.$watch('isFullScreen', function () {
						$scope.toggleFullScreen();
					});

					// handler update
					$scope.$watch('updateCounter', function (newVal) {
						if (!newVal || newVal < 0)
							return;
						$scope.update();
					});

					// handle activate/deactivate gallery
					$scope.$watch('enabled', function (isEnabled) {
						if (isEnabled)
							$scope.activateGallery();
						else {
							$scope.deactivateGallery();
						}
					});

					////////////////////////////////////////////////////////
					// start initialize:
					////////////////////////////////////////////////////////

					if (!$element.hasClass('izenda-gallery-container'))
						$element.addClass('izenda-gallery-container');

					// window resize
					$scope.turnOnWindowResizeHandler();

					// hotkeys handler
					angular.element('body').on('keydown.izendaGallery' + $scope.state.uid, function (e) {
						if (!$scope.enabled)
							return;
						if (e.keyCode === 37) {
							// left
							$scope.goPrevious();
							$scope.$parent.$apply();
						} else if (e.keyCode === 39 || e.keyCode === 32) {
							// right
							$scope.goNext();
							$scope.$parent.$apply();
						}
					});

					// fullscreen handler
					fullscreenRootElement.addEventListener('webkitfullscreenchange', $scope.onfullscreenchange);
					fullscreenRootElement.addEventListener('fullscreenchange', $scope.onfullscreenchange);

					document.addEventListener("mozfullscreenchange", $scope.onfullscreenchange);
					document.addEventListener('MSFullscreenChange', $scope.onfullscreenchange);
					document.addEventListener("fullscreenchange", $scope.onfullscreenchange);

					// init
					$scope.update();
				}
			};
		}]);

});