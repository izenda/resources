import * as angular from 'angular';
import 'izenda-external-libs';
import izendaCoreModule from 'common/core/module-definition';
import IzendaComponent from 'common/core/tools/izenda-component';
import IzendaUtilUiService from 'common/core/services/util-ui-service';

/**
 * Message component definition
 */
@IzendaComponent(izendaCoreModule, 'izendaDialogBoxComponent', ['$izendaUtilUiService'], {
	templateUrl: '###RS###extres=components.common.core.components.dialog-box.dialog-box-template.html',
	bindings: {
		componentId: '@',
		useGlobalEventListening: '<',
		opened: '<',
		title: '<',
		message: '<',
		alertInfo: '<',
		buttons: '<',
		checkboxes: '<'
	},
})
export default class IzendaDialogBoxComponent {
	constructor(
		private readonly $izendaUtilUiService: IzendaUtilUiService) {
	}

	/**
	 * Handle button click.
	 */
	onButtonClick(button) {
		if (!button) return;
		if (angular.isFunction(button.callback)) {
			button.callback(this.$izendaUtilUiService.dialogBox.checkboxes);
		}
		this.closeModal();
	}

	/**
	 * Close modal dialog.
	 */
	closeModal() {
		this.$izendaUtilUiService.closeDialogBox();
	}
}
