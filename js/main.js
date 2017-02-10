function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function ensureIzPidProcessed() {
	if (typeof (window.izendaPageId$) == 'undefined') {
		var uid = getParameterByName('izpid');
		if (typeof uid != 'undefined' && uid != '')
			window.izendaPageId$ = uid;
	}
}