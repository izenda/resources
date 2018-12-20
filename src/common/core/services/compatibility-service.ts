import * as angular from 'angular';
import 'izenda-external-libs';
import MsieDetect from 'common/core/tools/msie-detect';

export default class IzendaCompatibilityService {
	private readonly rightNone = 'None';
	private readonly rightReadOnly = 'Read Only';
	private readonly rightViewOnly = 'View Only';
	private readonly rightLocked = 'Locked';
	private readonly rightFullAccess = 'Full Access';
	private currentRights: string = this.rightNone;
	private readonly ie8: boolean;
	private readonly lteIe10: boolean;
	private readonly gteIe9: boolean;
	private usesHiddenColumns: boolean;

	static get injectModules(): any[] {
		return ['$window'];
	}

	constructor(private readonly $window: ng.IWindowService) {
		this.ie8 = MsieDetect.isSpecificIeVersion(8, 'lte');
		this.lteIe10 = MsieDetect.isSpecificIeVersion(10, 'lte');
		this.gteIe9 = MsieDetect.isSpecificIeVersion(9, 'gte');
	}

	private isIe8(): boolean {
		return this.ie8;
	}

	isIe(): boolean {
		return this.gteIe9;
	}

	isLteIe10(): boolean {
		return this.lteIe10;
	}

	isHtml5FullScreenSupported(): boolean {
		return !this.lteIe10
			&& (document['fullscreenEnabled'] || document['webkitFullscreenEnabled'] || document['mozFullScreenEnabled'] || document['msFullscreenEnabled']);
	}

	/**
	 * Check is page should have mobile view.
	 */
	isMobile(): boolean {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	/**
	 * Check is page window is too small to fit several columns of tiles.
	 */
	isSmallResolution(): boolean {
		return this.$window.innerWidth <= 991;
	}

	/**
	 * Check if one column view required
	 */
	isOneColumnView(): boolean {
		return this.isMobile() || this.isSmallResolution();
	};

	/**
	 * Set flag that indicates that report with hidden columns is currenly loaded.
	 */
	setUsesHiddenColumns(value: boolean) {
		this.usesHiddenColumns = value;
	}

	/**
	 * Get flat that indicates that report with hidden columns is currenly loaded.
	 */
	isUsesHiddenColumns(): boolean {
		return this.usesHiddenColumns;
	}

	/**
	 * Set rights for current dashboard
	 */
	setRights(rights: string) {
		this.currentRights = rights ? rights : this.rightNone;
	}

	/**
	 * Get current rights
	 */
	getRights(): string {
		return this.currentRights ? this.currentRights : this.rightNone;
	}

	/**
	 * Set full access right as current right.
	 */
	setFullAccess() {
		this.setRights(this.rightFullAccess);
	}

	/**
	 * Check is tile editing allowed.
	 */
	isFullAccess(): boolean {
		let allowed = [this.rightFullAccess].indexOf(this.getRights()) >= 0;
		allowed = allowed && !this.isIe8();
		return allowed;
	}

	/**
	 * Check is tile editing allowed.
	 */
	isEditAllowed(): boolean {
		let allowed = [this.rightFullAccess, this.rightReadOnly].indexOf(this.getRights()) >= 0;
		allowed = allowed && !this.isOneColumnView();
		allowed = allowed && !this.isIe8();
		return allowed;
	}

	/**
	 * Check is save as allowed
	 */
	isSaveAsAllowed(): boolean {
		let allowed = [this.rightFullAccess, this.rightReadOnly].indexOf(this.getRights()) >= 0;
		allowed = allowed && !this.isIe8();
		return allowed;
	}

	/**
	 * Check is save allowed with hidden columns
	 */
	isSaveAllowedWithHidden(): boolean {
		let allowed = [this.rightFullAccess].indexOf(this.getRights()) >= 0;
		allowed = allowed && !this.isIe8();
		return allowed;
	}

	/**
	 * Check is save allowed
	 */
	isSaveAllowed(): boolean {
		return this.isSaveAllowedWithHidden() && !this.usesHiddenColumns;
	}

	/**
	 * Check is filters editing allowed
	 */
	isFiltersEditAllowed(): boolean {
		let allowed = [this.rightFullAccess, this.rightReadOnly, this.rightLocked].indexOf(this.getRights()) >= 0;
		allowed = allowed && !this.isIe8();
		return allowed;
	}

	static get $inject() {
		return this.injectModules;
	}

	static register(module: ng.IModule) {
		module.service('$izendaCompatibilityService', IzendaCompatibilityService.injectModules.concat(IzendaCompatibilityService));
	}
}
