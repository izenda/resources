izendaRequire.define(['angular', 'moment', './common-query-service', './settings-service'], function (angular, moment) {

	/**
	 * Service used for store data in schedule control
	 */
	angular.module('izenda.common.ui').factory('$izendaScheduleService', [
		'$injector',
		'$q',
		'$izendaSettings',
		'$izendaCommonQuery',
		function ($injector, $q, $izendaSettings, $izendaCommonQuery) {
			'use strict';

			// apply config options
			var clearScheduleOptions = false;
			if ($injector.has('izendaCommonUiConfig')) {
				var config = $injector.get('izendaCommonUiConfig');
				clearScheduleOptions = angular.isObject(config) ? config.clearScheduleOptions : false;
			}

			// local variables:
			var scheduleConfig;
			var timezones;
			var sendEmailTypes;
			var repeatTypes;

			/**
			 * Set default values.
			 */
			var reset = function () {
				var d = new Date();
				scheduleConfig = {
					date: d,
					timezone: -1,
					repeat: 'None',
					email: 'Link',
					recipients: ''
				};
				timezones = [];
				sendEmailTypes = [];
				repeatTypes = [];
			};

			/**
			 * Return current schedule config
			 */
			var getScheduleConfig = function () {
				return scheduleConfig;
			};

			/**
			 * Set current schedule config
			 */
			var setScheduleConfig = function (value) {
				scheduleConfig = value;
				if (scheduleConfig.date.getFullYear() <= 1900) {
					scheduleConfig.date = null;
				}
			};

			/**
			 * Get available repeat types list
			 */
			var getRepeatTypes = function () {
				return repeatTypes;
			};

			/**
			 * Get available email types
			 */
			var getEmailTypes = function () {
				return sendEmailTypes;
			};

			/**
			 * Get available timezones
			 */
			var getTimezones = function () {
				return timezones;
			};

			/**
			 * Load schedule data and available values from server
			 */
			var loadScheduleData = function (customScheduleConfig) {
				return $q(function (resolve) {
					reset();
					// calculate current timezone std offset:
					var rightNow = new Date();
					var jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
					var temp = jan1.toGMTString();
					var jan2 = new Date(temp.substring(0, temp.lastIndexOf(" ")));
					var std_time_offset = (jan1 - jan2) / (1000 * 60);
					$izendaCommonQuery.getScheduleData(std_time_offset).then(function (scheduleData) {
						scheduleData.Date = moment(scheduleData.DateString, 'YYYY-MM-DD HH:mm:ss')._d;
						if (angular.isObject(customScheduleConfig)) {
							setScheduleConfig(angular.extend({}, customScheduleConfig));
						}
						if (!angular.isObject(customScheduleConfig))
							reset();
						// timezones
						angular.element.each(scheduleData.TimeZones, function () {
							if (this.Selected && (!clearScheduleOptions || scheduleConfig.timezone == -1)) {
								scheduleConfig.timezone = this.Value;
							}
							timezones.push({
								text: this.Text.replaceAll('&nbsp;', ' '),
								disabled: !this.Enabled,
								value: this.Value
							});
						});

						// sendEmailTypes
						angular.element.each(scheduleData.SendEmailList, function () {
							if (this.Selected && !clearScheduleOptions) {
								scheduleConfig.email = this.Value;
							}
							sendEmailTypes.push({
								text: this.Text,
								disabled: !this.Enabled,
								value: this.Value
							});
						});

						// RepeatTypes
						angular.element.each(scheduleData.RepeatTypes, function () {
							if (this.Selected && !clearScheduleOptions) {
								scheduleConfig.repeat = this.Value;
							}
							repeatTypes.push({
								text: this.Text,
								disabled: !this.Enabled,
								value: this.Value
							});
						});
						if (!clearScheduleOptions) {
							var date = scheduleData.Date;
							if (date.getFullYear() > 1900) {
								scheduleConfig.date = date;
							}
							scheduleConfig.recipients = scheduleData.Recipients;
						}
						// resolve promise
						resolve();
					});
				});
			};

			var getScheduleConfigForSend = function () {
				var scheduleConfigFixed = angular.extend({}, scheduleConfig);
				var d = scheduleConfig.date;
				if (!angular.isDate(d)) {
					scheduleConfigFixed.dateString = null;
					scheduleConfigFixed.timeString = null;
				} else {
					scheduleConfigFixed.dateString = moment(d).format('YYYY-MM-DD');
					scheduleConfigFixed.timeString = moment(d).format('HH:mm:ss');
				}
				delete scheduleConfigFixed.date;
				return scheduleConfigFixed;
			};

			/**
			 * Save schedule config to current report set
			 */
			var saveScheduleConfigToCrs = function () {
				var configForSend = getScheduleConfigForSend();
				$izendaCommonQuery.saveScheduleData(configForSend);
			};

			reset();
			return {
				getScheduleConfig: getScheduleConfig,
				getScheduleConfigForSend: getScheduleConfigForSend,
				setScheduleConfig: setScheduleConfig,
				getRepeatTypes: getRepeatTypes,
				getEmailTypes: getEmailTypes,
				getTimezones: getTimezones,
				loadScheduleData: loadScheduleData,
				saveScheduleConfigToCrs: saveScheduleConfigToCrs
			};
		}
	]);

});