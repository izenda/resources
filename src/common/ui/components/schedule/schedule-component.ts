﻿import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import { DateTimeFormat } from 'common/query/services/settings-service';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaQuerySettingsService from 'common/query/services/settings-service';
import IzendaScheduleService from 'common/ui/services/schedule-service';

/**
 * Schedule component definition
 */
@IzendaComponent(
	izendaUiModule,
	'izendaScheduleComponent',
	['$izendaLocale', '$izendaSettings', '$izendaScheduleService'],
	{
		templateUrl: '###RS###extres=components.common.ui.components.schedule.schedule-template.html',
		bindings: {
			scheduleConfig: '=',
			repeatTypes: '<',
			emailTypes: '<',
			timezones: '<'
		}
	})
export default class IzendaScheduleComponent {
	dateFormat: DateTimeFormat;
	culture: string;

	constructor(
		private readonly $izendaLocale: IzendaLocalizationService,
		private readonly $izendaSettings: IzendaQuerySettingsService,
		private readonly $izendaScheduleService: IzendaScheduleService) {
	}

	/**
	 * Component init
	 */
	$onInit() {
		this.dateFormat = this.$izendaSettings.dateFormat;
		this.culture = this.$izendaSettings.culture;
	}
}
