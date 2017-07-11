izendaRequire.define(['angular', 'bootstrap-datetimepicker', '../services/services'], function (angular) {

	(function () {
		'use strict';
		angular.module('izenda.common.ui').directive('izendaDateTimePicker', [
			'$window',
			'$timeout',
			'$izendaLocale',
			'$izendaCompatibility',
			function ($window, $timeout, $izendaLocale, $izendaCompatibility) {
				return {
					restrict: 'A',
					require: 'ngModel', // get a hold of NgModelController
					scope: {
						model: '=ngModel',
						ngDisabled: '=',
						dateFormat: '=',
						locale: '=',
						datepart: '=',
						showAdditionalButtons: '@',
						htmlContainerSelector: '@',
						onChange: '&'
					},
					template: $izendaCompatibility.isSmallResolution()
						? '<div class="izenda-date-picker-inline"/>'
						: '<input type="text" class="form-control" />' +
							'<span class="input-group-addon">' +
								'<span class="glyphicon-calendar glyphicon"></span>' +
							'</span>',
					link: function ($scope, elem, attrs, ngModelCtrl) {
						var uid = Math.trunc(Math.random() * 1000000);
						var $input = elem.children('input,.izenda-date-picker-inline');
						var $btn = elem.children('.input-group-addon');
						var isSmallResolution = $izendaCompatibility.isSmallResolution();

						function getPicker() {
							return $input.data('DateTimePicker');
						}

						/**
						 * Set date to the picker
						 */
						function setDate(newDate) {
							if (!newDate)
								getPicker().date(null);
							else if (angular.isDate(newDate))
								getPicker().date(getUpdatedDateValue($scope.model, newDate, $scope.datepart));
							else if (angular.isString(newDate))
								getPicker().date(getUpdatedDateValue($scope.model, new Date(newDate), $scope.datepart));
							else
								throw 'Unknown date type: ' + typeof (newDate);
						}

						/**
						 * Create new date object based on baseDate with updated from the newDate date or time or both.
						 * @param {Date} baseDate current date
						 * @param {Date} newDate updated date
						 * @param {string} datepart what part will be updated: '"date"|"time"|"datetime"'
						 */
						function getUpdatedDateValue(baseDate, newDate, datepart) {
							if (!baseDate) {
								return new Date(newDate);
							}
							var currDate = new Date(baseDate); // clone base date
							if (datepart.indexOf('date') >= 0) {
								currDate.setFullYear(newDate.getFullYear());
								currDate.setMonth(newDate.getMonth());
								currDate.setDate(newDate.getDate());
							}
							if (datepart.indexOf('time') >= 0) {
								currDate.setHours(newDate.getHours());
								currDate.setMinutes(newDate.getMinutes());
								currDate.setSeconds(newDate.getSeconds());
							}
							return currDate;
						}

						/**
						 * Enable/Disable picker
						 */
						function setDisabled(isDisabled) {
							if (isDisabled) {
								getPicker().disable();
							} else {
								getPicker().enable();
							}
						}

						/**
						 * Apply date format in the picker
						 */
						function setFormat(format) {
							if (!angular.isString(format))
								getPicker().format(false);
							else
								getPicker().format(format);
						}

						/**
						 * Apply locale in the picker
						 */
						function setLocale(locale) {
							if (!angular.isString(locale))
								return;
							getPicker().locale(locale);
						}

						// create date picker config json
						var config = {};
						if ($scope.showAdditionalButtons === 'true') {
							config = {
								showTodayButton: true,
								showClear: true
							};
						}
						angular.extend(config, {
							locale: $scope.locale,
							inline: isSmallResolution,
							widgetParent: isSmallResolution ? null : angular.element($scope.htmlContainerSelector),
							toolbarPlacement: 'bottom',
							widgetPositioning: {
								vertical: 'bottom'
							},
							tooltips: {
								today: $izendaLocale.localeText('js_GoToToday', 'Go to today'),
								clear: $izendaLocale.localeText('js_ClearSelection', 'Clear selection'),
								close: $izendaLocale.localeText('js_ClosePicker', 'Close the picker'),
								selectMonth: $izendaLocale.localeText('js_SelectMonth', 'Select Month'),
								prevMonth: $izendaLocale.localeText('js_PreviousMonth', 'Previous Month'),
								nextMonth: $izendaLocale.localeText('js_NextMonth', 'Next Month'),
								selectYear: $izendaLocale.localeText('js_SelectYear', 'Select Year'),
								prevYear: $izendaLocale.localeText('js_PreviousYear', 'Previous Year'),
								nextYear: $izendaLocale.localeText('js_NextYear', 'Next Year'),
								selectDecade: $izendaLocale.localeText('js_SelectDecade', 'Select Decade'),
								prevDecade: $izendaLocale.localeText('js_PreviousDecade', 'Previous Decade'),
								nextDecade: $izendaLocale.localeText('js_NextDecade', 'Next Decade'),
								prevCentury: $izendaLocale.localeText('js_PreviousCentury', 'Previous Century'),
								nextCentury: $izendaLocale.localeText('js_NextCentury', 'Next Century')
							}
						});
						// create picker
						$scope.dateTimePicker = $input.datetimepicker(config);

						// date picker 'on show' handler
						$input.on('dp.show', function (e) {
							if (isSmallResolution)
								return;
							var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
							$widget.show();
							$widget.css({
								top: $input.offset().top - $widget.parent().offset().top + $input.height() + 20,
								left: $input.offset().left - $widget.parent().offset().left
							});
						});

						// window resize handler
						angular.element($window).on('resize.dp' + uid, function (e) {
							if (isSmallResolution)
								return;
							var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
							$widget.hide();
							$timeout(function () {
								$input.blur();
							}, 10);
						});

						$btn.on('click', function () {
							if (!$scope.ngDisabled) {
								$input.focus();
							}
						});

						// watch variables:
						$scope.$watch('ngDisabled', function (newVal) {
							setDisabled(newVal);
						});

						$scope.$watch('dateFormat', function (newVal) {
							setFormat(newVal);
						});
						$scope.$watch('locale', function (newVal) {
							setLocale(newVal);
						});

						// initialize values
						setDisabled($scope.ngDisabled);
						setFormat($scope.dateFormat);
						setLocale($scope.locale);

						if (ngModelCtrl) {
							$scope.$watch('model', function (newVal) {
								setDate(newVal);
							});

							$timeout(function () {
								ngModelCtrl.$render = function () {
									setDate(ngModelCtrl.$viewValue);
								}
							});

							$input.on('dp.change', function (e) {
								var newDateValue = e.date ? getUpdatedDateValue($scope.model, e.date.toDate(), $scope.datepart) : null;
								ngModelCtrl.$setViewValue(newDateValue);
							});
						}

						// destructor
						$scope.$on('$destroy', function () {
							angular.element($window).off('resize.dp' + uid);
							var picker = getPicker();
							if (picker)
								getPicker().destroy();
						});
					}
				};
			}
		]);
	})();

});
