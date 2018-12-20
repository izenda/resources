import * as angular from 'angular';
import 'izenda-external-libs';
import izendaCoreModule from 'common/core/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';

/**
 * Message component definition
 */
@IzendaComponent(izendaCoreModule, 'izendaMessageComponent', ['$izendaLocaleService', '$izendaUtilUiService'], {
	templateUrl: '###RS###extres=components.common.core.components.message.message-template.html',
	bindings: {},
})
export default class IzendaMessageComponent {
	constructor(
		private readonly $izendaLocaleService: IzendaLocalizationService,
		private readonly $izendaUtilUiService: IzendaUtilUiService) {

	}

	/**
	 * Close modal dialog.
	 */
	closeModal() {
		this.$izendaUtilUiService.closeMessageDialog();
	}
}

