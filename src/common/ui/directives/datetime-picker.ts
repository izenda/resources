import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';

interface IIzendaDateTimePickerScope extends ng.IScope {
	model: any;
	ngDisabled: any;
	dateFormat: any;
	locale: any;
	datepart: any;
	showAdditionalButtons: any;
	htmlContainerSelector: any;
	onChange: any;
	dateTimePicker: any;
}

interface IIzendaDateTimePickerScope extends ng.IScope {
}

/**
 * Directive docs.
 */
class IzendaDateTimePicker implements ng.IDirective {
	restrict = 'A';
	require = 'ngModel';
	scope = {
		model: '=ngModel',
		ngDisabled: '=',
		dateFormat: '=',
		locale: '=',
		datepart: '=',
		showAdditionalButtons: '@',
		htmlContainerSelector: '@',
		onChange: '&'
	};
	template =
		`<input type="text" class="form-control" />
<span class="input-group-addon">
	<span class="glyphicon-calendar glyphicon"></span>
</span>`;
	link: ($scope: IIzendaDateTimePickerScope, $element: ng.IAugmentedJQuery,
		attrs: ng.IAttributes, ngModelCtrl: ng.IController) => void;

	constructor(private readonly $window: ng.IWindowService,
		private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaLocale: IzendaLocalizationService,
		private readonly $izendaCompatibility: IzendaCompatibilityService) {

		// change template if resolution is too low
		if (this.$izendaCompatibility.isSmallResolution())
			this.template = '<div class="izenda-common-date-picker-inline"/>';


		IzendaDateTimePicker.prototype.link = ($scope: IIzendaDateTimePickerScope, $element: ng.IAugmentedJQuery,
			attrs: ng.IAttributes, ngModelCtrl: ng.IController) => {

			const uid = Math.floor(Math.random() * 1000000);
			const $input = $element.children('input,.izenda-common-date-picker-inline');
			const $btn = $element.children('.input-group-addon');
			const isSmallResolution = $izendaCompatibility.isSmallResolution();
			const getPicker: () => any = () => $input.data('DateTimePicker');

			/**
			 * Create new date object based on baseDate with updated from the newDate date or time or both.
			 * @param {Date} baseDate current date
			 * @param {Date} newDate updated date
			 * @param {string} datepart what part will be updated: '"date"|"time"|"datetime"'
			 */
			const getUpdatedDateValue = (baseDate, newDate, datepart) => {
				if (!baseDate) return new Date(newDate);
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
			 * Set date to the picker
			 */
			const setDate = newDate => {
				if (!newDate)
					getPicker().date(null);
				else if (angular.isDate(newDate))
					getPicker().date(getUpdatedDateValue($scope.model, newDate, $scope.datepart));
				else if (angular.isString(newDate))
					getPicker().date(getUpdatedDateValue($scope.model, new Date(newDate), $scope.datepart));
				else
					throw `Unknown date type: ${typeof (newDate)}`;
			}

			/**
			 * Enable/Disable picker
			 */
			const setDisabled = isDisabled => {
				if (isDisabled)
					getPicker().disable();
				else
					getPicker().enable();
			}

			/**
			 * Apply date format in the picker
			 */
			const setFormat = format => {
				if (!angular.isString(format))
					getPicker().format(false);
				else
					getPicker().format(format);
			}

			/**
			 * Apply locale in the picker
			 */
			const setLocale = locale => {
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
			angular.extend(config,
				{
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
			$scope.dateTimePicker = $input['datetimepicker'](config);

			// date picker 'on show' handler
			$input.on('dp.show', () => {
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
			angular.element($window).on('resize.dp' + uid, () => {
				if (isSmallResolution)
					return;
				var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
				$widget.hide();
				$timeout(() => $input.blur(), 10);
			});

			$btn.on('click', () => {
				if (!$scope.ngDisabled)
					$input.focus();
			});

			// watch variables:
			$scope.$watch('ngDisabled', newVal => setDisabled(newVal));
			$scope.$watch('dateFormat', newVal => setFormat(newVal));
			$scope.$watch('locale', newVal => setLocale(newVal));

			// initialize values
			setDisabled($scope.ngDisabled);
			setFormat($scope.dateFormat);
			setLocale($scope.locale);

			if (ngModelCtrl) {
				$scope.$watch('model', newVal => setDate(newVal));
				$timeout(() => {
					ngModelCtrl.$render = () => setDate(ngModelCtrl.$viewValue);
				});

				$input.on('dp.change', e => {
					var newDateValue = e['date'] ? getUpdatedDateValue($scope.model, e['date'].toDate(), $scope.datepart) : null;
					ngModelCtrl.$setViewValue(newDateValue);
				});
			}

			// destruction method
			$element.on('$destroy', () => {
				angular.element($window).off('resize.dp' + uid);
				var picker = getPicker();
				if (picker)
					getPicker().destroy();
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($window: ng.IWindowService,
			$timeout: ng.ITimeoutService,
			$izendaLocale: IzendaLocalizationService,
			$izendaCompatibility: IzendaCompatibilityService) =>
			new IzendaDateTimePicker($window, $timeout, $izendaLocale, $izendaCompatibility);
		directive.$inject = ['$window', '$timeout', '$izendaLocale', '$izendaCompatibility'];
		return directive;
	}
}

izendaUiModule.directive('izendaDateTimePicker',
	['$window', '$timeout', '$izendaLocale', '$izendaCompatibility', IzendaDateTimePicker.factory()]);
