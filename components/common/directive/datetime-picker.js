(function () {
	'use strict';
	angular.module('izenda.common.ui').directive('izendaDateTimePicker', ['$window', '$timeout', function ($window, $timeout) {
		return {
			restrict: 'EA',
			require: 'ngModel',
			scope: {
				ngModel: '=',
				ngDisabled: '=',
				dateFormat: '=',
				locale: '=',
				showAdditionalButtons: '@',
				htmlContainerSelector: '@',
				onChange: '&'
			},
			template:
				'<input type="text" class="form-control" />' +
				'<span class="input-group-addon">' +
					'<span class="glyphicon-calendar glyphicon"></span>' +
				'</span>',
			link: function ($scope, elem, attrs, ngModelCtrl) {
				var $input = elem.children('input');
				var $btn = elem.children('.input-group-addon');

				function getPicker() {
					return $input.data('DateTimePicker');
				}

				/**
				 * Set date value
				 */
				function setDate(newDate) {
					if (angular.isUndefined(newDate) || newDate === null)
						getPicker().date(null);
					else if (angular.isDate(newDate))
						getPicker().date(newDate);
					else if (angular.isString(newDate))
						getPicker().date(newDate);
					else
						throw 'Unknown date type: ' + typeof (newDate);
				}

				/**
				 * Enable/Disable
				 */
				function setDisabled(isDisabled) {
					if (isDisabled) {
						getPicker().disable();
					} else {
						getPicker().enable();
					}
				}

				/**
				 * Apply format
				 */
				function setFormat(format) {
					if (!angular.isString(format))
						getPicker().format(false);
					else
						getPicker().format(format);
				}

				/**
				 * Apply locale
				 */
				function setLocale(locale) {
					if (!angular.isString(locale))
						return;
					getPicker().locale(locale);
				}

				// initialize datetime picker
				var config = {};
				if ($scope.showAdditionalButtons === 'true') {
					config = {
						showTodayButton: true,
						showClear: true
					};
				}
				angular.extend(config, {
					//debug: true,
					locale: $scope.locale,
					widgetParent: angular.element($scope.htmlContainerSelector),
					toolbarPlacement: 'bottom',
					widgetPositioning: {
						vertical: 'bottom'
					},
					tooltips: {
						today: 'Go to today',
						clear: 'Clear selection',
						close: 'Close the picker',
						selectMonth: 'Select Month',
						prevMonth: 'Previous Month',
						nextMonth: 'Next Month',
						selectYear: 'Select Year',
						prevYear: 'Previous Year',
						nextYear: 'Next Year',
						selectDecade: 'Select Decade',
						prevDecade: 'Previous Decade',
						nextDecade: 'Next Decade',
						prevCentury: 'Previous Century',
						nextCentury: 'Next Century'
					}
				});
				$scope.dateTimePicker = $input.datetimepicker(config);
				$input.on('dp.show', function (e) {
					var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
					$widget.show();
					$widget.css({
						top: $input.offset().top - $widget.parent().offset().top + $input.height() + 20,
						left: $input.offset().left - $widget.parent().offset().left
					});
				});
				angular.element($window).on('resize.dp', function (e) {
					var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
					$widget.hide();
					$timeout(function() {
						$input.blur();
					}, 10);
				});

				$input.on('dp.change', function (e) {
					if (e.date)
						ngModelCtrl.$setViewValue(e.date.toDate());
					else
						ngModelCtrl.$setViewValue(null);
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
				$scope.$watch('ngModel', function (newVal) {
					setDate(newVal);
				});
				$scope.$watch('dateFormat', function (newVal) {
					setFormat(newVal);
				});
				$scope.$watch('locale', function(newVal) {
					setLocale(newVal);
				});
				if (angular.isString(attrs.ngChange))
					ngModelCtrl.$viewChangeListeners.push(function () {
						$scope.$eval(attrs.ngChange);
					});

				// initialize values
				setDisabled($scope.ngDisabled);
				setFormat($scope.dateFormat);
				setLocale($scope.locale);
				setDate($scope.ngModel);
			}
		};
	}
	]);

	/*function izendaDatePicker() {
		return {
			restrict: 'EA',
			require: ['ngModel'],
			scope: {
				ngModel: '=',
				isDisabled: '=',
				valueFormat: '='
			},
			template: '<input type="text" class="form-control" />' +
				'<span class="input-group-addon"><span class="glyphicon-calendar glyphicon"></span></span>',
			link: function ($scope, elem, attrs) {
				var input = elem.children('input');
				var btn = elem.children('.input-group-addon');

				// init calendar
				var datePickerOptions = {};
				if ($scope.valueFormat) {
					datePickerOptions.dateFormat = $scope.valueFormat;
				}
				$scope.calendar = input.datepicker(datePickerOptions);

				var setDate = function (val) {
					if (angular.isUndefined(val) || val === null) {
						input.val('');
					} else if (angular.isDate(val)) {
						input.datepicker('update', val);
					} else {
						throw 'Unknown date type: ' + typeof (val);
					}
				};

				// check for disabled:
				$scope.$parent.$watch(attrs.ngDisabled, function (newVal) {
					input.prop('disabled', newVal);
					if (newVal) {
						btn.off('click');
						input.datepicker('hide');
					} else {
						btn.on('click', function () {
							elem.children('input').focus();
						});
					}
				});
				$scope.$parent.$watch(attrs.ngModel, function (newVal, oldVal) {
					if (newVal !== oldVal) {
						setDate(newVal);
					}
				});
				input.prop('disabled', attrs.ngDisabled);
				setDate($scope.ngModel);

				// handlers
				btn.on('click', function () {
					elem.children('input').focus();
				});

				input.datepicker().on('changeDate', function (e) {
					if (!angular.isDate(e)) {
						var d = new Date();
						if (!angular.isDate($scope.ngModel)) {
							$scope.ngModel = d;
						} else {
							$scope.ngModel.setFullYear(d.getFullYear());
							$scope.ngModel.setMonth(d.getMonth());
							$scope.ngModel.setDate(d.getDate());
						}
					} else {
						$scope.ngModel.setFullYear(e.getFullYear());
						$scope.ngModel.setMonth(e.getMonth());
						$scope.ngModel.setDate(e.getDate());
					}
					$scope.$parent.$applyAsync();
				});
			}
		};
	}

	function izendaTimePicker() {
		return {
			restrict: 'EA',
			require: ['ngModel'],
			scope: {
				ngModel: '=',
				ngChange: '&'
			},
			template: '<input type="text" class="form-control" />' +
				'<span class="input-group-addon"><span class="glyphicon-time glyphicon"></span></span>',
			link: function ($scope, elem, attrs) {
				var input = elem.children('input');
				var btn = elem.children('.input-group-addon');
				var timePickerOptions = {
					minuteStep: 5
				};
				$scope.timepicker = input.timepicker(timePickerOptions);
				
				var setTime = function (val) {
					if (angular.isUndefined(val) || val === null) {
						input.val('');
					} else if (angular.isDate(val)) {
						input.val(val.getHours() + ':' + val.getMinutes());
					} else {
						throw 'Unknown time type: ' + typeof (val);
					}
					$scope.timepicker.timepicker('setTime', val);
				};

				$scope.$watch('ngModel', function (newVal, oldVal) {
					if (newVal !== oldVal) {
						setTime(newVal);
					}
				});
				setTime($scope.ngModel);

				$scope.timepicker.on('changeTime.timepicker', function (e) {
					if (!angular.isDate($scope.ngModel)) {
						$scope.ngModel = d;
					}
					var hours = e.time.hours;
					if (e.time.meridian === 'PM' && e.time.hours < 12) hours = hours + 12;
					if (e.time.meridian === 'AM' && e.time.hours === 12) hours = hours - 12;
					$scope.ngModel.setHours(hours);
					$scope.ngModel.setMinutes(e.time.minutes);
					$scope.$parent.$applyAsync();
					if (angular.isFunction($scope.ngChange))
						$scope.ngChange({
							arg0: $scope.ngModel
						});
				});

				// handlers
				btn.on('click', function () {
					$scope.timepicker.timepicker('showWidget');
				});
			}
		};
	}

	// definition
	angular.module('izenda.common.ui')
		.directive('izendaDatePicker', [izendaDatePicker])
		.directive('izendaTimePicker', [izendaTimePicker]);
	*/
})();
