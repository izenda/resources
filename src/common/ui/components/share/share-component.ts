import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import { IzendaSelectItemModel } from 'common/core/models/select-item-model';
import { IzendaShareRuleModel } from 'common/core/models/share-model';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaShareService from 'common/ui/services/share-service';

@IzendaComponent(
	izendaUiModule,
	'izendaShareComponent',
	['$izendaLocaleService', '$izendaShareService'],
	{
		templateUrl: '###RS###extres=components.common.ui.components.share.share-template.html',
		bindings: {
			subjects: '<',
			rights: '<',
			shareRules: '<'
		}
	})
export default class IzendaShareComponent {
	// variables for binding definition:
	subjects: Array<IzendaSelectItemModel>;
	rights: Array<IzendaSelectItemModel>;
	shareRules: Array<IzendaShareRuleModel>;

	constructor(
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaShareService: IzendaShareService) {
	}

	/**
	 * Check is share rule selected right is valid
	 */
	getShareRuleValidationMessage(shareRule: IzendaShareRuleModel) {
		if (!shareRule.right && !shareRule.subject)
			return this.$izendaLocaleService.localeText('js_NessesarySelectRight',
				'It is necessary to choose the right, otherwise it will be ignored.');
		return null;
	}

	/**
	 * Remove share rule handler.
	 * @param {Core.IzendaShareRuleModel} shareRule
	 */
	removeShareRule(shareRule: IzendaShareRuleModel) {
		this.$izendaShareService.removeShareRule(shareRule);
	}

	/**
	 * Add share rule
	 */
	addShareRule() {
		this.$izendaShareService.addNewShareRule();
	}
}