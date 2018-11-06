export class IzendaDashboardGalleryStateModel {
	private isEnabledInner: boolean = false;
	isFullScreen: boolean = false;
	playDelay: number = 5000;
	isPlayStarted: boolean = false;
	isPlayRepeat: boolean = false;

	constructor() {
		this.reset();
	}

	reset() {
		this.isEnabledInner = false;
		this.isFullScreen = false;
		this.playDelay = 5000;
		this.isPlayStarted = false;
		this.isPlayRepeat = false;
	}

	get isEnabled() {
		return this.isEnabledInner;
	}

	set isEnabled(value) {
		this.isEnabledInner = value;
		this.isFullScreen = false; // turn off fullscreen
		this.isPlayStarted = false; // turn off play
	}
}
