// Copyright (c) 2005-2013 Izenda, L.L.C. - ALL RIGHTS RESERVED    

// JavaScript


function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getAppendedUrl(urlToAppend) {
	if (typeof (window.izendaPageId$) !== 'undefined') {
		if (urlToAppend.indexOf("?") == -1)
			urlToAppend = urlToAppend + "?";
		else {
			if (urlToAppend[urlToAppend.length - 1] != '&' && urlToAppend[urlToAppend.length - 1] != '?')
				urlToAppend = urlToAppend + "&";
		}
		urlToAppend = urlToAppend + 'izpid=' + window.izendaPageId$;
	}
	return urlToAppend;
}

function ensureIzPidProcessed()
{
	if (typeof (window.izendaPageId$) == 'undefined') {
		var uid = getParameterByName('izpid');
		if (typeof uid != 'undefined' && uid != '')
			window.izendaPageId$ = uid;
	}
}
