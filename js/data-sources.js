// Copyright (c) 2005-2013 Izenda, L.L.C. - ALL RIGHTS RESERVED    
//Ajax request for JSON methods-----------------------------------------------------------
/*! JSON v3.3.0 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
(function(n){function K(p,q){function s(a){if(s[a]!==v)return s[a];var c;if("bug-string-char-index"==a)c="a"!="a"[0];else if("json"==a)c=s("json-stringify")&&s("json-parse");else{var e;if("json-stringify"==a){c=q.stringify;var b="function"==typeof c&&r;if(b){(e=function(){return 1}).toJSON=e;try{b="0"===c(0)&&"0"===c(new A)&&'""'==c(new B)&&c(t)===v&&c(v)===v&&c()===v&&"1"===c(e)&&"[1]"==c([e])&&"[null]"==c([v])&&"null"==c(null)&&"[null,null,null]"==c([v,t,null])&&'{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'==
c({a:[e,!0,!1,null,"\x00\b\n\f\r\t"]})&&"1"===c(null,e)&&"[\n 1,\n 2\n]"==c([1,2],null,1)&&'"-271821-04-20T00:00:00.000Z"'==c(new D(-864E13))&&'"+275760-09-13T00:00:00.000Z"'==c(new D(864E13))&&'"-000001-01-01T00:00:00.000Z"'==c(new D(-621987552E5))&&'"1969-12-31T23:59:59.999Z"'==c(new D(-1))}catch(f){b=!1}}c=b}if("json-parse"==a){c=q.parse;if("function"==typeof c)try{if(0===c("0")&&!c(!1)){e=c('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');var l=5==e.a.length&&1===e.a[0];if(l){try{l=!c('"\t"')}catch(d){}if(l)try{l=
1!==c("01")}catch(h){}if(l)try{l=1!==c("1.")}catch(m){}}}}catch(X){l=!1}c=l}}return s[a]=!!c}p||(p=n.Object());q||(q=n.Object());var A=p.Number||n.Number,B=p.String||n.String,G=p.Object||n.Object,D=p.Date||n.Date,J=p.SyntaxError||n.SyntaxError,N=p.TypeError||n.TypeError,R=p.Math||n.Math,H=p.JSON||n.JSON;"object"==typeof H&&H&&(q.stringify=H.stringify,q.parse=H.parse);var G=G.prototype,t=G.toString,u,C,v,r=new D(-0xc782b5b800cec);try{r=-109252==r.getUTCFullYear()&&0===r.getUTCMonth()&&1===r.getUTCDate()&&
10==r.getUTCHours()&&37==r.getUTCMinutes()&&6==r.getUTCSeconds()&&708==r.getUTCMilliseconds()}catch(Y){}if(!s("json")){var E=s("bug-string-char-index");if(!r)var w=R.floor,S=[0,31,59,90,120,151,181,212,243,273,304,334],F=function(a,c){return S[c]+365*(a-1970)+w((a-1969+(c=+(1<c)))/4)-w((a-1901+c)/100)+w((a-1601+c)/400)};(u=G.hasOwnProperty)||(u=function(a){var c={},e;(c.__proto__=null,c.__proto__={toString:1},c).toString!=t?u=function(a){var c=this.__proto__;a=a in(this.__proto__=null,this);this.__proto__=
c;return a}:(e=c.constructor,u=function(a){var c=(this.constructor||e).prototype;return a in this&&!(a in c&&this[a]===c[a])});c=null;return u.call(this,a)});var T={"boolean":1,number:1,string:1,undefined:1};C=function(a,c){var e=0,b,f,l;(b=function(){this.valueOf=0}).prototype.valueOf=0;f=new b;for(l in f)u.call(f,l)&&e++;b=f=null;e?C=2==e?function(a,c){var e={},b="[object Function]"==t.call(a),f;for(f in a)b&&"prototype"==f||u.call(e,f)||!(e[f]=1)||!u.call(a,f)||c(f)}:function(a,c){var e="[object Function]"==
t.call(a),b,f;for(b in a)e&&"prototype"==b||!u.call(a,b)||(f="constructor"===b)||c(b);(f||u.call(a,b="constructor"))&&c(b)}:(f="valueOf toString toLocaleString propertyIsEnumerable isPrototypeOf hasOwnProperty constructor".split(" "),C=function(a,c){var e="[object Function]"==t.call(a),b,g;if(g=!e)if(g="function"!=typeof a.constructor)g=typeof a.hasOwnProperty,g="object"==g?!!a.hasOwnProperty:!T[g];g=g?a.hasOwnProperty:u;for(b in a)e&&"prototype"==b||!g.call(a,b)||c(b);for(e=f.length;b=f[--e];g.call(a,
b)&&c(b));});return C(a,c)};if(!s("json-stringify")){var U={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"},x=function(a,c){return("000000"+(c||0)).slice(-a)},O=function(a){for(var c='"',b=0,g=a.length,f=!E||10<g,l=f&&(E?a.split(""):a);b<g;b++){var d=a.charCodeAt(b);switch(d){case 8:case 9:case 10:case 12:case 13:case 34:case 92:c+=U[d];break;default:if(32>d){c+="\\u00"+x(2,d.toString(16));break}c+=f?l[b]:a.charAt(b)}}return c+'"'},L=function(a,c,b,g,f,l,d){var h,m,k,n,p,q,r,s,y;try{h=
c[a]}catch(z){}if("object"==typeof h&&h)if(m=t.call(h),"[object Date]"!=m||u.call(h,"toJSON"))"function"==typeof h.toJSON&&("[object Number]"!=m&&"[object String]"!=m&&"[object Array]"!=m||u.call(h,"toJSON"))&&(h=h.toJSON(a));else if(h>-1/0&&h<1/0){if(F){n=w(h/864E5);for(m=w(n/365.2425)+1970-1;F(m+1,0)<=n;m++);for(k=w((n-F(m,0))/30.42);F(m,k+1)<=n;k++);n=1+n-F(m,k);p=(h%864E5+864E5)%864E5;q=w(p/36E5)%24;r=w(p/6E4)%60;s=w(p/1E3)%60;p%=1E3}else m=h.getUTCFullYear(),k=h.getUTCMonth(),n=h.getUTCDate(),
q=h.getUTCHours(),r=h.getUTCMinutes(),s=h.getUTCSeconds(),p=h.getUTCMilliseconds();h=(0>=m||1E4<=m?(0>m?"-":"+")+x(6,0>m?-m:m):x(4,m))+"-"+x(2,k+1)+"-"+x(2,n)+"T"+x(2,q)+":"+x(2,r)+":"+x(2,s)+"."+x(3,p)+"Z"}else h=null;b&&(h=b.call(c,a,h));if(null===h)return"null";m=t.call(h);if("[object Boolean]"==m)return""+h;if("[object Number]"==m)return h>-1/0&&h<1/0?""+h:"null";if("[object String]"==m)return O(""+h);if("object"==typeof h){for(a=d.length;a--;)if(d[a]===h)throw N();d.push(h);y=[];c=l;l+=f;if("[object Array]"==
m){k=0;for(a=h.length;k<a;k++)m=L(k,h,b,g,f,l,d),y.push(m===v?"null":m);a=y.length?f?"[\n"+l+y.join(",\n"+l)+"\n"+c+"]":"["+y.join(",")+"]":"[]"}else C(g||h,function(a){var c=L(a,h,b,g,f,l,d);c!==v&&y.push(O(a)+":"+(f?" ":"")+c)}),a=y.length?f?"{\n"+l+y.join(",\n"+l)+"\n"+c+"}":"{"+y.join(",")+"}":"{}";d.pop();return a}};q.stringify=function(a,c,b){var g,f,l,d;if("function"==typeof c||"object"==typeof c&&c)if("[object Function]"==(d=t.call(c)))f=c;else if("[object Array]"==d){l={};for(var h=0,m=c.length,
k;h<m;k=c[h++],(d=t.call(k),"[object String]"==d||"[object Number]"==d)&&(l[k]=1));}if(b)if("[object Number]"==(d=t.call(b))){if(0<(b-=b%1))for(g="",10<b&&(b=10);g.length<b;g+=" ");}else"[object String]"==d&&(g=10>=b.length?b:b.slice(0,10));return L("",(k={},k[""]=a,k),f,l,g,"",[])}}if(!s("json-parse")){var V=B.fromCharCode,W={92:"\\",34:'"',47:"/",98:"\b",116:"\t",110:"\n",102:"\f",114:"\r"},b,I,k=function(){b=I=null;throw J();},z=function(){for(var a=I,c=a.length,e,g,f,l,d;b<c;)switch(d=a.charCodeAt(b),
d){case 9:case 10:case 13:case 32:b++;break;case 123:case 125:case 91:case 93:case 58:case 44:return e=E?a.charAt(b):a[b],b++,e;case 34:e="@";for(b++;b<c;)if(d=a.charCodeAt(b),32>d)k();else if(92==d)switch(d=a.charCodeAt(++b),d){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:e+=W[d];b++;break;case 117:g=++b;for(f=b+4;b<f;b++)d=a.charCodeAt(b),48<=d&&57>=d||97<=d&&102>=d||65<=d&&70>=d||k();e+=V("0x"+a.slice(g,b));break;default:k()}else{if(34==d)break;d=a.charCodeAt(b);for(g=b;32<=
d&&92!=d&&34!=d;)d=a.charCodeAt(++b);e+=a.slice(g,b)}if(34==a.charCodeAt(b))return b++,e;k();default:g=b;45==d&&(l=!0,d=a.charCodeAt(++b));if(48<=d&&57>=d){for(48==d&&(d=a.charCodeAt(b+1),48<=d&&57>=d)&&k();b<c&&(d=a.charCodeAt(b),48<=d&&57>=d);b++);if(46==a.charCodeAt(b)){for(f=++b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&k();b=f}d=a.charCodeAt(b);if(101==d||69==d){d=a.charCodeAt(++b);43!=d&&45!=d||b++;for(f=b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&k();b=f}return+a.slice(g,b)}l&&
k();if("true"==a.slice(b,b+4))return b+=4,!0;if("false"==a.slice(b,b+5))return b+=5,!1;if("null"==a.slice(b,b+4))return b+=4,null;k()}return"$"},M=function(a){var c,b;"$"==a&&k();if("string"==typeof a){if("@"==(E?a.charAt(0):a[0]))return a.slice(1);if("["==a){for(c=[];;b||(b=!0)){a=z();if("]"==a)break;b&&(","==a?(a=z(),"]"==a&&k()):k());","==a&&k();c.push(M(a))}return c}if("{"==a){for(c={};;b||(b=!0)){a=z();if("}"==a)break;b&&(","==a?(a=z(),"}"==a&&k()):k());","!=a&&"string"==typeof a&&"@"==(E?a.charAt(0):
a[0])&&":"==z()||k();c[a.slice(1)]=M(z())}return c}k()}return a},Q=function(a,b,e){e=P(a,b,e);e===v?delete a[b]:a[b]=e},P=function(a,b,e){var g=a[b],f;if("object"==typeof g&&g)if("[object Array]"==t.call(g))for(f=g.length;f--;)Q(g,f,e);else C(g,function(a){Q(g,a,e)});return e.call(a,b,g)};q.parse=function(a,c){var e,g;b=0;I=""+a;e=M(z());"$"!=z()&&k();b=I=null;return c&&"[object Function]"==t.call(c)?P((g={},g[""]=e,g),"",c):e}}}q.runInContext=K;return q}var J=typeof define==="function"&&define.amd,
A="object"==typeof global&&global;!A||A.global!==A&&A.window!==A||(n=A);if("object"!=typeof exports||!exports||exports.nodeType||J){var N=n.JSON,B=K(n,n.JSON3={noConflict:function(){n.JSON=N;return B}});n.JSON={parse:B.parse,stringify:B.stringify}}else K(n,exports);J&&define(function(){return B})})(this);

function AjaxRequest(url, parameters, callbackSuccess, callbackError, id, dataToKeep) {
	var thisRequestObject;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
	thisRequestObject.requestId = id;
	thisRequestObject.dtk = dataToKeep;
	thisRequestObject.onreadystatechange = ProcessRequest;

	/*thisRequestObject.open('GET', url + '?' + parameters, true);
	thisRequestObject.send();*/
	thisRequestObject.open('POST', url, true);
	thisRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	thisRequestObject.send(parameters);

	function DeserializeJson() {
		var responseText = thisRequestObject.responseText;
		while (responseText.indexOf('"\\/Date(') >= 0) {
			responseText = responseText.replace('"\\/Date(', 'eval(new Date(');
			responseText = responseText.replace(')\\/"', '))');
		}
		if (responseText.charAt(0) != '[' && responseText.charAt(0) != '{')
			responseText = '{' + responseText + '}';
		var isArray = true;
		if (responseText.charAt(0) != '[') {
			responseText = '[' + responseText + ']';
			isArray = false;
		}
		var retObj = eval(responseText);
		if (!isArray)
			return retObj[0];
		return retObj;
	}

	function ProcessRequest() {
		if (thisRequestObject.readyState == 4) {
		  if (thisRequestObject.status == 200 && callbackSuccess) {
		    var toRet;
		    if (thisRequestObject.requestId != 'getrenderedreportset' && thisRequestObject.requestId != 'getcrsreportpartpreview' && thisRequestObject.requestId != 'renderedreportpart')
		      toRet = DeserializeJson();
		    else
		      toRet = thisRequestObject.responseText;			
				callbackSuccess(toRet, thisRequestObject.requestId, thisRequestObject.dtk);
			}
			else if (callbackError) {
				callbackError(thisRequestObject);
			}
		}
	}
}

jq$.extend({
	getValues: function (url) {
		var result = null;
		jq$.ajax({
			url: url,
			type: 'get',
			dataType: 'json',
			async: false,
			success: function (data) {
				result = data;
			},
			error: function (data) {
				alert("Can't load (" + url + "). ERROR: " + JSON.stringify(data));
			}
		});
		return result;
	}
});

var currentPreview = null;
var tInd = 0;
var fieldsIndex;
var csOrder = 0;
var dsSelections = new Array();
var fieldsOpts = new Array();
var curPropField = '';
var curFieldIndexes = '';
var previewFieldTimeout;
var previewReportTimeout;
var dsState = new Array();
var databaseSchema;
var origRsData = '';
var nirConfig;
var oDatatable;
var subtotalsAdded = false;
var chartAvailable = false;
var chartAdded = false;
var IR_CurrentChartProps = '';

function IsIE() {
	if (navigator.appName == 'Microsoft Internet Explorer')
		return true;
	return false;
}

function CurrentRn() {
  var queryParameters = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
  while (m = re.exec(queryString)) {
    queryParameters[decodeURIComponent(m[1]).toLowerCase()] = decodeURIComponent(m[2]);
  }
  reportName = '';
  if (queryParameters['rn'] != null && queryParameters['rn'].length > 0) {
    reportName = queryParameters['rn'];
  }
  return reportName;
}

function ExistingReportSetInit() {
  var crn = CurrentRn();
  if (crn == '')
    return;
	var requestString = 'wscmd=reversereportset';
	requestString += '&wsarg0=' + encodeURIComponent(crn);
	AjaxRequest('./rs.aspx', requestString, ReversedReportSet, null, 'reversereportset');
}

function ReversedReportSet(returnObj, id) {
	if (id != 'reversereportset' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value == "OK") {
	  alert('ok');
	}
	else
		alert("Error: " + returnObj.Value);
}

function initDataSources(url) {
	databaseSchema = jq$.getValues(url);
	if (databaseSchema != null) {
		databaseSchema.sort(function (a, b) {
			if (a.DataSourceCategory < b.DataSourceCategory)
				return -1;
			if (a.DataSourceCategory > b.DataSourceCategory)
				return 1;
			return 0;
		});
		var datasourcesSearch = new IzendaDatasourcesSearch(databaseSchema);
		jq$(".database").remove();
		tInd = 0;
		var html = "";
		for (var i = 0; i < databaseSchema.length; i++)
			html += renderDatabase(databaseSchema[i], i);
		jq$(html).prependTo("#databases");
	  NDS_Init();
	  if (databaseSchema.length == 1) {
		  setTimeout(function() {
		  	var dbh = document.getElementById('rdbh0');
		  	if (typeof dbh != 'undefined' && dbh != null) {
		  		dbh = jq$(dbh);
		  		initializeTables(dbh);
		  		dbh.toggleClass("opened", animationTime);
		  		setTimeout(DsDomChanged, animationTime + 100);
		  	}
		  }, 100);
		}
//		ExistingReportSetInit();
		/*var databases = $(".database");
		if (databases && databases.length == 1)
			$(databases[0]).addClass("opened");
		initDraggable();
		var datasourcesSearch = new IzendaDatasourcesSearch(databaseSchema);*/
	};
}

function renderDatabase(database, key) {
	database.domIdHeader = 'rdbh' + key;
    var element = " \
	<div class='database' id='rdbh" + key + "'> \
		<div class='database-header'> \
			<a href='#" + database.DataSourceCategory + "'> \
				<span class='plus-minus'></span> \
				<span class='database-name'>" + database.DataSourceCategory + "</span> \
			</a> \
		</div> \
 \
		<div class='database-tables' id='rdb" + key + "'>" + IzLocal.Res("js_Loading", "Loading...") + "</div> \
	</div> \ ";
    return element;
}

function renderTables(tables, dbKey) {
	var html = "";
	for (key in tables) {
	  html += renderTable(dbKey, tables[key], key, tables[key].sysname, tInd);
		tInd++;
	}
	return html;
}

function renderTable(dbKey, table, key, tableId, ind) {
	table.domId = 'tcb' + ind;
	var element = " \
			<div class='table'> \
				<div class='table-header'> \
					<a href='#" + key + "' tableInd='" + ind + "' id='rdbh" + dbKey + "_" + key + "'> \
						<span class='checkbox-container' locked='false' sorder='-1' id='tcb" + ind + "' tableid='" + tableId + "' onclick='DsClicked(" + ind + ")'><span class='checkbox'></span></span> \
						<span class='table-name'>" + key + "</span> \
						<div class='clearfix'></div> \
					</a> \
				</div> \
				<div class='table-fields' id='rdb" + dbKey + "_" + key + "'>" + IzLocal.Res("js_Loading", "Loading...") + "</div> \
			</div> \ ";
	return element;
}

function renderSections(tableIndex, fields) {
	var html = "";

	var textSectionContent = renderFields(tableIndex, fields, "text");
	if (textSectionContent.length > 1) {
	  html += " \
					<div class='fields-section' sectionDataType='text'> \
						<div class='fields-section-name'> \
							<span>" + IzLocal.Res("js_text", "text") + "</span> \
						</div> \ " + textSectionContent + " \
					</div> \ ";
	}

	var datesSectionContent = renderFields(tableIndex, fields, "dates");
	if (datesSectionContent.length > 1) {
	  html += " \
					<div class='fields-section' sectionDataType='dates'> \
						<div class='fields-section-name'> \
							<span>" + IzLocal.Res("js_dates", "dates") + "</span> \
						</div> \ " + datesSectionContent + " \
					</div> \ ";
	}

	var numbersSectionContent = renderFields(tableIndex, fields, "numeric") + renderFields(tableIndex, fields, "money");
	if (numbersSectionContent.length > 1) {
	  html += " \
					<div class='fields-section' sectionDataType='numbers'> \
						<div class='fields-section-name'> \
							<span>" + IzLocal.Res("js_numbers", "numbers") + "</span> \
						</div> \ " + numbersSectionContent + " \
					</div> \ ";
	}

	var identifiersSectionContent = renderFields(tableIndex, fields, "identifiers");
	if (identifiersSectionContent.length > 1) {
	  html += " \
					<div class='fields-section'> \
						<div class='fields-section-name' sectionDataType='identifiers'> \
							<span>" + IzLocal.Res("js_identifiers", "identifiers") + "</span> \
						</div> \ " + identifiersSectionContent + " \
					</div> \ ";
	}

	return html;
}

function renderFields(tableIndex, fields, sectionName) {
	var html = "";
	var fieldArray = new Array();
	for (key in fields)
		if (fields[key] != null && fields[key].type == sectionName)
			fieldArray.push({ key: key, value: fields[key] });

	fieldArray.sort(function (a, b) {
		if (a.key < b.key) return -1;
		if (a.key > b.key) return 1;
		return 0;
	});

	for (var i = 0; i < fieldArray.length; i++)
		html += renderField(tableIndex, fieldArray[i].key, fieldArray[i].value.sysname, fieldArray[i].value);
	return html;
}

function renderField(tableIndex, fieldName, fieldId, fieldObj) {
	fieldObj.domId = 'tcb' + tableIndex + 'fcb' + fieldsIndex;
	var html = " \
						<a class='field' href='#" + fieldName + "' sorder='-1' locked='false' id='tcb" + tableIndex + "fcb" + fieldsIndex + "' fieldId='" + fieldId + "' onmouseup='FiClick(" + tableIndex + ", " + fieldsIndex + ", false, false)'> \
							<span class='preview-image'></span> \
							</span> \
							<span class='checkbox' style='margin-top: 3px; margin-right: 6px;'></span> \
							<span class='field-name' style=''>" + fieldName + "</span> \
              <span class='field-popup-trigger' style='float:right; margin-top: 2px; left:2px;' title='" + IzLocal.Res("js_Options", "Options") + "' fieldId='" + fieldId + "' style='float:right;'></span> \
              <span style='visibility:hidden;  margin-top: 2px; left:2px; width:20px; float:right;height:0px;'>&nbsp;&nbsp;&nbsp;&nbsp;</span> \
							<span class='clearfix'></span> \
							</a> \ ";
	fieldsIndex++;
	return html;
}


function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStyle(x, styleProp) {
	var y = null;
	if (x.currentStyle)
		y = x.currentStyle[styleProp];
	else if (window.getComputedStyle)
		y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
	return y;
}

function CollectReportData() {
	var dsList = new Array();
	var fieldsList = new Array();
	var fieldsOrders = new Array();
	var fieldWidths = new Array();
	var fOptions = new Array();
	var idList = new Array();
	var sortsList = new Array();
	var index = 0;
	var cb;
	var soVal;
	var sortingData = new Array();
	if (currentPreview != null)
		sortingData = currentPreview.GetSortingData();
	while (true) {
		cb = document.getElementById('tcb' + index);
		if (cb == null)
			break;
		soVal = cb.getAttribute('sorder');
		if (soVal == '-1') {
			index++;
			continue;
		}
		dsList[dsList.length] = cb.getAttribute('tableid');
		var fIndex = 0;
		while (true) {
			cb = document.getElementById('tcb' + index + 'fcb' + fIndex);
			if (cb == null)
				break;
			soVal = cb.getAttribute('sorder');
			if (soVal == '-1') {
				fIndex++;
				continue;
			}
			var widthVal = cb.getAttribute('itemwidth');
			if (!widthVal)
				widthVal = 0;
			idList[fieldsList.length] = 'tcb' + index + 'fcb' + fIndex;
			fieldsList[fieldsList.length] = cb.getAttribute('fieldid');
			fieldsOrders[fieldsOrders.length] = soVal;
			fieldWidths[fieldWidths.length] = widthVal;
			fOptions[fOptions.length] = fieldsOpts[cb.getAttribute('fieldid')];
			var fSort = '0';
			if (typeof sortingData[idList[fieldsList.length - 1]] != 'undefined' && sortingData[idList[fieldsList.length - 1]] != null)
				fSort = sortingData[idList[fieldsList.length - 1]];
			sortsList[sortsList.length] = fSort;
			cb.setAttribute('sorting', fSort);
			fIndex++;
		}
		index++;
	}
	var repObj = new Object();
	repObj.DsList = dsList;
	repObj.FldList = fieldsList;
	repObj.OrdList = fieldsOrders;
	repObj.WidthList = fieldWidths;
	repObj.FldOpts = fOptions;
	repObj.SortsList = sortsList;
	repObj.SubtotalsAdded = subtotalsAdded;
	repObj.ChartAdded = chartAdded;
	repObj.ChartProps = IR_CurrentChartProps;
	repObj.Filters = typeof filtersData != 'undefined' ? GetFiltersDataToCommit() : null;
	var uriResult = encodeURIComponent(JSON.stringify(repObj));
	return uriResult;
}

function DesignReportRequest(s) {
	var requestString = 'wscmd=designreport';
	requestString += '&wsarg0=' + s;
	AjaxRequest('./rs.aspx', requestString, ReportDesigned, null, 'designreport');
}

function ReportDesigned(returnObj, id) {
	if (id != 'designreport' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value == "OK")
	    window.location = nirConfig.ReportDesignerUrl + "?tab=fields";
	else
		alert("Error: " + returnObj.Value);
}

function ViewReportRequest(s) {
	var requestString = 'wscmd=viewreport';
	requestString += '&wsarg0=' + s;
	AjaxRequest('./rs.aspx', requestString, ReportViewed, null, 'viewreport');
}

function ReportViewed(returnObj, id) {
	if (id != 'viewreport' || returnObj == undefined || returnObj == null)
		return;
	if (returnObj.Value == "OK")
	    window.location = nirConfig.ReportViewerUrl;
	else
		alert("Error: " + returnObj.Value);
}

function DS_ShowFieldProperties(fieldSqlName, friendlyName, fiIds, filterGUID) {
	curFieldIndexes = fiIds;
	var autoTotal = false;
	var aRef = document.getElementById(fiIds);
	var selected = -1;
	if (typeof aRef != 'undefined' && aRef != null) {
		selected = aRef.getAttribute('sorder');
		if (typeof selected == 'undefined' || selected == null)
			selected = -1;
		do {
			aRef = aRef.parentNode;
		} while (typeof aRef != 'undefined' && aRef != null && aRef.className != 'fields-section');
		if (typeof aRef != 'undefined' && aRef != null) {
			var sDataType = aRef.getAttribute('sectionDataType');
			if (sDataType == 'numbers' || sDataType == 'identifiers')
				autoTotal = true;
		}
	}
	curPropField = fieldSqlName;
	var field = DS_GetFullField(fieldSqlName, friendlyName);
	field.Selected = selected;
	if (field.Total == null)
		field.Total = 1;
	if (filterGUID != null)
		field.FilterGUID = filterGUID;

	var requestString = 'wscmd=fieldoperatorsandformatswithdefault';
	requestString += '&wsarg0=' + curPropField;
	AjaxRequest('./rs.aspx', requestString, FieldPropFormatsGot, null, 'fieldoperatorsandformatswithdefault', field);
}

function DS_GetFullField(fieldSqlName, friendlyName) {
	var field = new Object();
	field.FriendlyName = friendlyName;
	field.Description = friendlyName;
	field.Total = 0;
	field.VG = 0;
	field.LabelJ = 1;
	field.ValueJ = 0;
	field.Width = '';
	field.IsMultilineHeader = 0;
	field.ColumnName = fieldSqlName;
	var opts = fieldsOpts[fieldSqlName];
	if (opts != null) {
		field.Description = opts.Description;
		field.Total = opts.TotalChecked;
		field.VG = opts.VgChecked;
		field.LabelJ = opts.LabelJVal;
		field.ValueJ = opts.ValueJVal;
		field.Width = opts.Width;
		field.IsMultilineHeader = opts.IsMultilineHeader;
	}
	return field;
}

function FieldPropFormatsGot(returnObj, id, field) {
  if (id != 'fieldoperatorsandformatswithdefault' || returnObj == undefined || returnObj == null)
  	return;
	if (returnObj.Value != "Field not set" && returnObj.AdditionalData != null && returnObj.AdditionalData.length > 1) {
		var operatorsData = returnObj.AdditionalData.slice(0, returnObj.Value);
		var formatsData = returnObj.AdditionalData.slice(returnObj.Value);
		field.Format = '...';
		if (fieldsOpts[curPropField] != null)
	    field.Format = fieldsOpts[curPropField].Format;
		else
	    field.Format = formatsData[formatsData.length - 1];
		field.FormatNames = new Array();
		field.FormatValues = new Array();
		var fCnt = 0;
		var avCnt = 0;
		while (avCnt < formatsData.length - 1) {
			field.FormatNames[fCnt] = formatsData[avCnt];
			avCnt++;
			field.FormatValues[fCnt] = formatsData[avCnt];
			avCnt++;
			fCnt++;
		}
		field.FilterOperatorNames = new Array();
		field.FilterOperatorValues = new Array();	
		fCnt = 0;
		avCnt = 0;
		while (avCnt < operatorsData.length) {
			field.FilterOperatorNames[fCnt] = operatorsData[avCnt];
			avCnt++;
			field.FilterOperatorValues[fCnt] = operatorsData[avCnt];
			avCnt++;
			fCnt++;
		}
		field.FilterOperator = '...';
		if (fieldsOpts[curPropField] != null)
			field.FilterOperator = fieldsOpts[curPropField].FilterOperator;

		if (field.FilterGUID == null) {
			for (var find = 0; find < filtersData.length; find++)
				if (filtersData[find].ColumnName == field.ColumnName) {
					field.FilterGUID = filtersData[find].GUID;
					break;
				}
		}

		if (field.FilterGUID != null) {
			for (var find = 0; find < filtersData.length; find++)
				if (filtersData[find].GUID == field.FilterGUID) {
					field.FilterOperator = filtersData[find].OperatorValue;
					break;
				}
		}

		FP_ShowFieldProperties(field, fieldPopup);
		PreviewFieldDelayed(500);
	}
}

function StoreFieldProps(newField) {
	var opts = new Object();
	opts.Description = newField.Description;
	opts.TotalChecked = newField.Total;
	opts.VgChecked = newField.VG;
	opts.Format = newField.Format;
	opts.FilterOperator = newField.FilterOperator;
	opts.LabelJVal = newField.LabelJ;
	opts.ValueJVal = newField.ValueJ;
	opts.Width = newField.Width;
	opts.IsMultilineHeader = newField.IsMultilineHeader;
	fieldsOpts[curPropField] = opts;

	if (curFieldIndexes != null && curFieldIndexes != ''){
		var s = curFieldIndexes.split('fcb');
		if (s.length == 2 && s[0].length >= 4) {
			var tcbInd = s[0].substr(3);
			var fcbInd = s[1];
			FiClick(tcbInd, fcbInd, true, true);
		}
	}

	if (newField.FilterGUID != null && newField.FilterGUID != 'undefined') {
		for (var i = 0; i < filtersData.length; i++)
			if (filtersData[i].GUID == newField.FilterGUID) {
				filtersData[i].OperatorValue = newField.FilterOperator;
				CommitFiltersData(false);
				break;
			}
	}
}

function PreviewFieldManual() {
	jq$(document.getElementById('fieldSamplePreview')).html('<table width="100%"><tr width="100%"><td width="100%" align="center"><img src="rs.aspx?image=loading.gif"></img></tr></td></table>');
  PreviewFieldToDiv();
}

function PreviewFieldDelayed(timeOut) {
	try {
		clearTimeout(previewFieldTimeout);
	}
	catch (e) {
	}
	jq$(document.getElementById('fieldSamplePreview')).html('<table width="100%"><tr width="100%"><td width="100%" align="center"><img src="rs.aspx?image=loading.gif"></img></tr></td></table>');
	previewFieldTimeout = setTimeout(PreviewFieldToDiv, timeOut);
}

function PreviewFieldToDiv() {
	PreviewField(curPropField, document.getElementById('fieldSamplePreview'));
}

function PreviewField(field, container) {
	var requestString = 'wscmd=getfieldpreview';
	var fProps = FP_CollectProperties();
	var description = fProps.Description;
	var totalChecked = fProps.Total;
	var vgChecked = fProps.VG;
	var format = fProps.Format;
	var filterOperator = fProps.FilterOperator;
	var labelJVal = fProps.LabelJ;
	var valueJVal = fProps.ValueJ;
	var fieldOpts = ',\'Desc\':\'' + description + '\',\'Total\':\'' + totalChecked + '\',\'Vg\':\'' + vgChecked + '\',\'LabelJ\':\'' + labelJVal + '\',\'ValueJ\':\'' + valueJVal + '\',\'Format\':\'' + format + '\',\'FilterOperator\':\'' + filterOperator + '\'';
	requestString += "&wsarg0=" + encodeURIComponent("{'Na':'" + field + "','Cnt':'10'" + fieldOpts + "}");

	var thisRequestObject;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
	thisRequestObject.requestId = 'getfieldpreview';
	thisRequestObject.dtk = container;
	thisRequestObject.onreadystatechange = FieldPreviewed;

	thisRequestObject.open('GET', './rs.aspx?' + requestString, true);
	thisRequestObject.send();

	function FieldPreviewed(returnObj, id) {
		if (thisRequestObject.readyState == 4 && thisRequestObject.status == 200)
			jq$(container).html(thisRequestObject.responseText);
	}
}

function ShowReportPreviewContent(showContent) {
	if (showContent) {
		jq$('#previewLoading').hide();
		jq$('#previewContentWrapper').children().show();
	}
	else {
		jq$('#previewLoading').show();
		jq$('#previewContentWrapper').children().hide();
	}
}

function PreviewReportManual() {
	ShowReportPreviewContent(false);
	PreviewReportToDiv();
}

function PreviewReportDelayed(timeOut) {
	try {
		clearTimeout(previewReportTimeout);
	}
	catch (e) {
	}
	ShowReportPreviewContent(false);
	previewReportTimeout = setTimeout(PreviewReportToDiv, timeOut);
}

function PreviewReportToDiv() {
	PreviewReport(document.getElementById('rightHelpDiv'));
}

function InitEmptyPreviewArea(container) {
	var container$ = jq$(container);

	var subtotalsGrey = 'button default';
	var subtotalsImgName = 'subtotalsplusW.png';
	if (subtotalsAdded) {
		subtotalsGrey = 'button';
		subtotalsImgName = "subtotalsplus.png";
	}

	jq$('#appendSubtotalsBtn').attr('class', subtotalsGrey);
	jq$('#appendSubtotalsBtn img').attr('src', 'rs.aspx?image=' + subtotalsImgName);

	var chartGrey = 'button default';
	var chartImgName = 'chartplusW.png';
	if (chartAdded) {
		chartGrey = 'button';
		chartImgName = "chartplus.png";
	}

	jq$('#appendChartBtn').attr('class', chartGrey);
	jq$('#appendChartBtn img').attr('src', 'rs.aspx?image=' + chartImgName );
	if (!chartAvailable)
		jq$('#appendChartBtn').hide();
  
	container$.droppable({
		accept: 'a.field',
		drop: function (event, ui) {
			fieldsDragPreformingNow = false;
		}
	});
}

function PreviewReport(container) {
	var requestString = 'wscmd=getreportpreview';
	requestString += "&wsarg0=" + CollectReportData();
	var origRn = CurrentRn();
	if (origRn != '') {
	  requestString += "&wsarg1=" + encodeURIComponent(origRn);
	  requestString += "&wsarg2=" + encodeURIComponent(origRsData);
	}
	var thisRequestObject;
	if (window.XMLHttpRequest)
		thisRequestObject = new XMLHttpRequest();
	else if (window.ActiveXObject)
		thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
	thisRequestObject.requestId = 'getreportpreview';
	thisRequestObject.dtk = container;
	thisRequestObject.onreadystatechange = ReportPreviewed;
	thisRequestObject.open('POST', './rs.aspx', true);
	thisRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	thisRequestObject.send(requestString);

	function ReportPreviewed(returnObj, id) {
		ShowReportPreviewContent(true);
		if (thisRequestObject.readyState == 4 && thisRequestObject.status == 200) {
			var subtotalsGrey = 'button';
			var subtotalsImgName = 'subtotalsplus.png';
			if (!subtotalsAdded) {
				subtotalsGrey += ' default';
				subtotalsImgName = "subtotalsplusW.png";
			}
			jq$('#appendSubtotalsBtn').attr('class', subtotalsGrey);
			jq$('#appendSubtotalsBtn img').attr('src', 'rs.aspx?image=' + subtotalsImgName);

			var chartGrey = 'button';
			var chartImgName = 'chartplus.png';
			if (!chartAdded) {
				chartGrey += ' default';
				chartImgName = "chartplusW.png";
			}
			jq$('#appendChartBtn').attr('class', chartGrey);
			jq$('#appendChartBtn img').attr('src', 'rs.aspx?image=' + chartImgName);
			if (!chartAvailable)
				jq$('#appendChartBtn').hide();

			var containerWrapper$ = jq$('#previewWrapper');
			if (containerWrapper$ == null || containerWrapper$.length == 0)
				containerWrapper$ = jq$('<div id="previewWrapper">');
			containerWrapper$.html(thisRequestObject.responseText);
			jq$('#previewWrapperEmpty').hide();
			containerWrapper$.insertAfter(jq$('#previewWrapperEmpty'));

			var index = 0;
			var cb;
			var soVal;
			var widthChanged = false;
			while (true && !widthChanged) {
				cb = document.getElementById('tcb' + index);
				if (cb == null)
					break;
				soVal = cb.getAttribute('sorder');
				if (soVal == '-1') {
					index++;
					continue;
				}
				var fIndex = 0;
				while (true && !widthChanged) {
					cb = document.getElementById('tcb' + index + 'fcb' + fIndex);
					if (cb == null)
						break;
					soVal = cb.getAttribute('sorder');
					if (soVal == '-1') {
						fIndex++;
						continue;
					}
					var widthVal = cb.getAttribute('itemwidth');
					if (typeof widthVal != 'undefined' && widthVal != null && widthVal > 0)
						widthChanged = true;
					fIndex++;
				}
				index++;
			}
			if (!widthChanged)
				jq$('.preview-wrapper table.ReportTable').css('width', '100%');
			
			var visualGroupUsed = (thisRequestObject.responseText.indexOf('class=\'VisualGroup\'') >= 0);
			if (visualGroupUsed) {
				currentPreview = null;
				var tablesContainer$ = jq$('<div>');
				var mainTableTemplate$ = jq$('.preview-wrapper table.ReportTable').clone().html('');
			    var tableIndex = 1;
			    jq$('.preview-wrapper table.ReportTable').find('tr').each(function (i) {
			    	if (jq$(this).attr("class") == 'VisualGroup' && i == 0) {
			    		var vgTitleTable$ = jq$('<table>');
			            vgTitleTable$.attr('targettable', 'ReportTable_1');
			            vgTitleTable$.append(jq$(this).clone());
			            tablesContainer$.append(vgTitleTable$);
			        }
			    	else if (jq$(this).attr("class") == 'VisualGroup' && i != 0) {
			            var tblToInsert = mainTableTemplate$.clone();
			            tblToInsert.attr('class', 'ReportTable_' + tableIndex).attr('name', 'ReportTable_' + tableIndex);
			            tablesContainer$.append(tblToInsert);

			            var vgTitleTable$ = jq$('<table>');
			            var nextIndex = tableIndex + 1;
			            vgTitleTable$.attr('targettable', 'ReportTable_' + nextIndex);
			            vgTitleTable$.append(jq$(this).clone());
			            tablesContainer$.append(vgTitleTable$);
			            
			            tableIndex++;
			            mainTableTemplate$.html('');
			            //mainTableTemplate$.append($(this).clone());
			        }
			    	else if (i == jq$('.preview-wrapper table.ReportTable').find('tr').length - 1) {
			    		mainTableTemplate$.append(jq$(this).clone());
			            tablesContainer$.append(mainTableTemplate$.clone().attr('class', 'ReportTable_' + tableIndex).attr('name', 'ReportTable_' + tableIndex));
			            tableIndex++;
			        }
			        else {
			    		mainTableTemplate$.append(jq$(this).clone());
			        }
			    });
			    tablesContainer$.find('tr.VisualGroup').find('td').attr('style', 'border-width:0px;overflow:hidden;white-space: nowrap;');
			    tablesContainer$.find('tr.VisualGroup').attr('onclick', 'javascript:EBC_ExpandTable_New(this);');
			    jq$('.preview-wrapper table.ReportTable').replaceWith(tablesContainer$.html());
			    try {
			        var preview;
			        var masterTable;
			        for (var i = 1 ; i < tableIndex ; i++) {
			            preview = new DataSourcesPreview('table.ReportTable_' + i);
			            if (i == 1)
			                masterTable = preview;
			            if (i == tableIndex - 1)
			                setTimeout(function () {
			                    preview.InitialResizeColumns();
			                    preview.ResizeColumnsInAllTables(jq$('table.ReportTable_1'));
			                    jq$('table.ReportTable_1').width(jq$('table.ReportTable_1').width());
			                    masterTable.initResize();
			                }, 0);
			        }
			    }
			    catch (e) {
			    }
			}
			else {
			    try {
			    	var preview = new DataSourcesPreview('table.ReportTable');
			    	currentPreview = preview;
			    }
			    catch (e) {
			    }
			}
			setTimeout(updatePreviewPosition, 100);

			//initializePreviewTable();
		}
	}
}

function AppendSubtotals() {
	subtotalsAdded = !subtotalsAdded;
	setTimeout(PreviewReportManual, 100);
}

function AppendChart() {
	chartAdded = !chartAdded;
	setTimeout(PreviewReportManual, 100);
}

/**
 * Drag'n'drop from datasource fields to preview table
 */
var fieldsDragPreformingNow = false;
var fieldDragged$ = null;
var isEmptyTable = false;
var newThCurrent = null;
var newThCurrent_index = null;

function initDraggable() {
	jq$('a.field').draggable({
		cancel: 'a.field.checked, a.field[locked="true"], span.field-popup-trigger',
    cursor: 'move',
    accept: 'table.ReportTable, div.preview-wrapper-empty',
    helper: function(event, ui) {
    	var foo = jq$('<span style="z-index: 1001; background-color: #1C4E89; white-space: nowrap;"></span>');
    	var target = jq$(event.currentTarget).clone();
      target.css('background-color', '#1C4E89');
      foo.append(target);
      return foo;
    },
    //helper: 'clone',
    revert: false,
    opacity: 0.5,

    start: function(event, ui) {
    	fieldsDragPreformingNow = true;
      fieldDragged$ = jq$(event.currentTarget);
      if (jq$('table.ReportTable').length == 0 && jq$('table.ReportTable_1').length == 0) {
        // no preview
        isEmptyTable = true;
      } else {
        // preview exists
        isEmptyTable = false;
      }
    },

    drag: function(event, ui) {
    	var dragTarget = jq$('table.ReportTable');
      var rTableOffset = dragTarget.offset();
      var w = jq$(dragTarget).width();
      var h = jq$(dragTarget).height();
      if (rTableOffset != null) {
          if (ColReorder.aoInstances == 0)
              return;
          var colReorder = ColReorder.aoInstances[ColReorder.aoInstances.length - 1];
          if (colReorder == null)
              return;
          if (event.pageX < rTableOffset.left - 100 || event.pageX > rTableOffset.left + w + 100
                      || event.pageY < rTableOffset.top || event.pageY > rTableOffset.top + h) {
              if (newThCurrent != null)
                  newThCurrent.remove();
              newThCurrent = null;
              colReorder._fnClearDrag.call(colReorder, event);
              return;
          } else {
              if (newThCurrent != null)
                  return;
              var nTh = jq$('table.ReportTable thead tr:first-child');
              newThCurrent = jq$('<th>');
              event['target'] = newThCurrent[0];
              colReorder._fnMouseDownHiddenHelper.call(colReorder, event, nTh);
          }
      }
      else {
          // Dirty workaround. Need to know the exact tables count
          for (var i = 1; i < 1000; i++) {
              {
              	var table = jq$('table.ReportTable_' + i);
                if (table == undefined || table == null)
                  break;

                var rTableOffset_i = table.offset();
                var w_i = jq$(table).width();
                var h_i = jq$(table).height();
                if (rTableOffset_i != null) {
                    if (oDatatable['table.ReportTable_' + i] == null || oDatatable['table.ReportTable_' + i]._oPluginColReorder == null)
                        return;
                    var colReorder = oDatatable['table.ReportTable_' + i]._oPluginColReorder;
                    if (event.pageX < rTableOffset_i.left - 100 || event.pageX > rTableOffset_i.left + w_i + 100
                                || event.pageY < rTableOffset_i.top || event.pageY > rTableOffset_i.top + h_i) {
                        if (newThCurrent_index == i) {
                            if (newThCurrent != null)
                                newThCurrent.remove();
                            newThCurrent = null;
                            colReorder._fnClearDrag.call(colReorder, event);
                        }
                        continue;
                    } else {
                        if (newThCurrent != null && newThCurrent_index == i)
                            return;
                        var nTh = jq$('table.ReportTable_' + i + ' thead tr:first-child');
                        newThCurrent = jq$('<th>');
                        event['target'] = newThCurrent[0];

                        if (oDatatable['table.ReportTable_' + newThCurrent_index] != null && oDatatable['table.ReportTable_' + newThCurrent_index]._oPluginColReorder != null) {
                            var colReorder_prev = oDatatable['table.ReportTable_' + newThCurrent_index]._oPluginColReorder;
                            colReorder_prev._fnClearDrag.call(colReorder_prev, event);
                        }
                        newThCurrent_index = i;
                        colReorder._fnMouseDownHiddenHelper.call(colReorder, event, nTh);
                    }
                }
              } (i);
          }
      }
    },

    stop: function(event, ui) {
      fieldsDragPreformingNow = false;
      if (isEmptyTable) {
      	var dragTarget = jq$('div.preview-wrapper-empty');
        var rTableOffset = dragTarget.offset();
        var w = jq$(dragTarget).outerWidth();
        var h = jq$(dragTarget).outerHeight();
        if (rTableOffset != null)
          if (event.pageX < rTableOffset.left || event.pageX > rTableOffset.left + w
						|| event.pageY < rTableOffset.top || event.pageY > rTableOffset.top + h)
          return;
        fieldDragged$.attr('sorder', 1);
        var helperAttr = fieldDragged$.attr('onmouseup');
        if (helperAttr != null) {
          var helper2 = helperAttr.replace('FiClick', 'FiClickForcedDrag');
          eval(helper2);
        }
      }
      if (updateOnDrag)
        setTimeout(PreviewReportManual, 100);
    }
  });

}

function NDS_CanBeJoined(dsArray) {
	if (dsArray.length < 2)
		return true;
	for (var i = 0; i < dsArray.length; i++) {
		var canBeJoined = false;
		for (var j = 0; j < dsArray.length; j++) {
			if (i == j)
				continue;
			for (var k = 0; k < ebc_constraintsInfo.length; k++) {
				if (ebc_constraintsInfo[k][0] == dsArray[i] && ebc_constraintsInfo[k][1] == dsArray[j]) {
					canBeJoined = true;
					break;
				}
				if (ebc_constraintsInfo[k][0] == dsArray[j] && ebc_constraintsInfo[k][1] == dsArray[i]) {
					canBeJoined = true;
					break;
				}
			}
			if (canBeJoined)
				break;
		}
		if (!canBeJoined)
			return false;
	}
	return true;
}

function NDS_CanBeJoinedWithGiven(dsArray, dsAdded) {
	dsArray[dsArray.length] = dsAdded;
	var canBe = NDS_CanBeJoined(dsArray);
	dsArray.splice(dsArray.length - 1, 1);
	return canBe;
}

function NDS_CanBeJoinedWithoutGiven(dsArray, dsRemoved) {
	var canBe = NDS_CanBeJoined(dsArray);
	for (var i = 0; i < dsArray.length; i++) {
		if (dsArray[i] == dsRemoved) {
			dsArray.splice(i, 1);
			canBe = NDS_CanBeJoined(dsArray);
			dsArray[dsArray.length] = dsRemoved;
			break;
		}
	}
	return canBe;
}

function NDS_SetFiSOrd(fcb, fiOrd) {
	fcb.setAttribute('sorder', fiOrd);
	jq$(fcb).removeClass('checked');
	if (fiOrd >= 0)
		jq$(fcb).addClass('checked');
}

function NDS_SetFiAvailability(fcb, available, checkBoxChildInd) {
	if (available) {
		fcb.childNodes[checkBoxChildInd].style.backgroundColor = '#FFFFFF';
		fcb.setAttribute('locked', false);
	}
	else {
		fcb.childNodes[checkBoxChildInd].style.backgroundColor = '#CCCCCC';
		fcb.setAttribute('locked', true);
	}
}

function NDS_UpdateFiOpacity(fcb) {
	var locked = fcb.getAttribute('locked');
	var fiOrd = fcb.getAttribute('sorder');
	if (fiOrd != '-1' || locked == 'true')
		fcb.childNodes[3].style.opacity = '1';
	else
		fcb.childNodes[3].style.opacity = '0.25';
}

function NDS_SetDsSOrd(cb, sord, dsInd, forceRefresh) {
  var wasOrd = cb.getAttribute('sorder');
  if (wasOrd == '-1' && sord == '-1' && !forceRefresh)
    return;
	cb.setAttribute('sorder', sord);
	var pe = cb.parentElement.parentElement.parentElement;
	jq$(pe).removeClass('checked');
	if (sord >= 0)
		jq$(pe).addClass('checked');
	if (sord == '-1') {
		var fdInd = 0;
		var fcb;
		while (true) {
			fcb = document.getElementById('tcb' + dsInd + 'fcb' + fdInd);
			if (fcb == null)
				break;
			NDS_SetFiSOrd(fcb, -1);
			fdInd++;
		}
	}
}

function NDS_SetDsAvailability(cb, available, tInd) {
	if (available) {
		cb.childNodes[0].style.backgroundColor = '#FFFFFF';
		cb.setAttribute('locked', false);
	}
	else {
		cb.childNodes[0].style.backgroundColor = '#CCCCCC';
		cb.setAttribute('locked', true);
	}
  if (dsState[tInd] < 2)
    return;
	var dsSelected = cb.getAttribute('sorder');
	var fInd = 0;
	var f;
	var firstField = document.getElementById('tcb' + tInd + 'fcb0');
	if (firstField != null) {
	  var checkBoxChildInd = -1;
	  for (var ci = 0; ci < firstField.childNodes.length; ci++) {
	    if (typeof firstField.childNodes[ci].getAttribute != 'undefined' && firstField.childNodes[ci].getAttribute('class') == 'checkbox') {
	      checkBoxChildInd = ci;
	      break;
	    }
	  }
	  if (checkBoxChildInd < 0) {
	    checkBoxChildInd = 3;
	  }
	  while (true) {
		  f = document.getElementById('tcb' + tInd + 'fcb' + fInd);
		  if (f == null)
			  break;
		  NDS_SetFiAvailability(f, available || dsSelected != '-1', checkBoxChildInd);
		  fInd++;
	  }
	}
}

function NDS_UpdateDsOpacity(cb, dsInd) {
	var locked = cb.getAttribute('locked');
	var sorder = cb.getAttribute('sorder');
	if (locked == 'false' && sorder == '-1')
		cb.childNodes[0].style.opacity = '0.25';
	else
		cb.childNodes[0].style.opacity = '1';
  if (dsState[dsInd] < 2)
    return;
	var fdInd = 0;
	var fcb;
	while (true) {
		fcb = document.getElementById('tcb' + dsInd + 'fcb' + fdInd);
		if (fcb == null)
			break;
		NDS_UpdateFiOpacity(fcb);
		fdInd++;
	}
}

function NDS_UpdateDatasourcesAvailability(forceRefresh) {
	var dsArr = new Array();
	var dsNames = new Array();
	var dsChecked = new Array();
	var dsSelected = new Array();
	var cb;
	var soVal;
	var index = 0;
	while (true) {
		cb = document.getElementById('tcb' + index);
		if (cb == null)
			break;
		dsArr[dsArr.length] = cb;
		dsNames[dsNames.length] = cb.getAttribute('tableid');
		dsChecked[dsChecked.length] = false;
		soVal = cb.getAttribute('sorder');
		if (soVal == null || soVal == '-1') {
			index++;
			continue;
		}
		dsChecked[dsChecked.length - 1] = true;
		dsSelected[dsSelected.length] = dsNames[dsNames.length - 1];
		index++;
	}
	for (var i = 0; i < dsArr.length; i++) {
		var toDisable = true;
		if (!dsChecked[i]) {
			if (NDS_CanBeJoinedWithGiven(dsSelected, dsNames[i])) {
				toDisable = false;
			}
		}
		else {
			if (NDS_CanBeJoinedWithoutGiven(dsSelected, dsNames[i])) {
				toDisable = false;
			}
	  }
	  if (dsState[i] > 0) {
	    if (toDisable) {
	      NDS_SetDsAvailability(dsArr[i], false, i);
	    } else {
	      NDS_SetDsAvailability(dsArr[i], true, i);
	    }
	  }
	  NDS_SetDsSOrd(dsArr[i], dsArr[i].getAttribute('sorder'), i, forceRefresh);
	  if (dsState[i] > 0)
		  NDS_UpdateDsOpacity(dsArr[i], i);
	}

	UpdateFiltersAvailability();
}

function NDS_RefreshOpenedList() {
  dsState.length = 0;
  var tcbInd = -1;
  while (true) {
    tcbInd++;
    var ds = document.getElementById('tcb' + tcbInd);
    if (ds == null)
      break;
    dsState[tcbInd] = 0;
    ds = ds.parentElement.parentElement.parentElement;
    var isOpened = false;
    if (jq$(ds).hasClass('opened'))
      isOpened = true;
    ds = ds.parentElement.parentElement;
    var isShown = false;
    if (jq$(ds).hasClass('opened'))
      isShown = true;
    if (isShown) {
      dsState[tcbInd] = 1;
      if (isOpened)
        dsState[tcbInd] = 2;
    }
  }
}

function DsDomChanged() {
  NDS_RefreshOpenedList();
  NDS_UpdateDatasourcesAvailability(false);
}

function NDS_Init() {
	EBC_Init("rs.aspx?", 0, false, 0);
	EBC_LoadConstraints();
}

function EngageDs(clicked) {
	var cso = clicked.getAttribute('sorder');
	if (cso == null || cso == '-1') {
		clicked.setAttribute('sorder', csOrder);
		csOrder++;
	}
}

function DisengageDs(clicked) {
	clicked.setAttribute('sorder', '-1');
}

function NDS_StoreDsSelection(tind) {
	var fi;
	var fIndex = 0;
	var selected = new Array();
	while (true) {
		fi = document.getElementById('tcb' + tind + 'fcb' + fIndex);
		if (fi == null)
			break;
		var so = fi.getAttribute('sorder');
		if (so != '-1')
			selected[selected.length] = fIndex + '-' + so;
		fIndex++;
	}
	dsSelections[tind] = selected;
}

function NDS_RestoreDsSelection(tind) {
	if (dsSelections[tind] != null && dsSelections[tind].length > 0) {
		for (var dsCnt = 0; dsCnt < dsSelections[tind].length; dsCnt++) {
			var sVals = dsSelections[tind][dsCnt].split('-');
			if (sVals.length == 2) {
				var fc = document.getElementById('tcb' + tind + 'fcb' + sVals[0]);
				NDS_SetFiSOrd(fc, sVals[1]);
			}
		}
	}
}

function initFieldsDsp(nwid) {
  var hId = nwid.id;
  hId = hId.substr(4);
  var contentDiv = document.getElementById('rdb' + hId);
  var currHtml = contentDiv.innerHTML;
  if (currHtml != IzLocal.Res("js_Loading", "Loading..."))
    return;
  var firstUnder = hId.indexOf('_');
  var dbKey = hId.substr(0, firstUnder);
  var tKey = hId.substr(firstUnder + 1);

  var willBeTableIndex = jq$(nwid).attr('tableInd');
  fieldsIndex = 0;
  var html = renderSections(willBeTableIndex, databaseSchema[dbKey].tables[tKey].fields);
  html = '<div class=\'table-fields-sections-background\'></div>' + html;
  contentDiv.innerHTML = html;

  initDraggable();
  jq$(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
    event.preventDefault();
  });
  var triggersHtml = "<span class='f-trigger' data-view='fields-view'> \
							<img src='rs.aspx?image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
						</span> \
						<span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
						<span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
						<span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";
	jq$(".table-view-triggers").filter(function (index) {
    var shouldBeReturned = false;
    var npAttr;
    try {
      npAttr = this.getAttribute('notProcessed1');
    }
    catch (e) {
      npAttr = '0';
    }
    if (npAttr == '1') {
      shouldBeReturned = true;
      this.setAttribute('notProcessed1', '0');
    }
    return shouldBeReturned;
  }).append(triggersHtml);

	jq$(".table").each(function () {
		setView(jq$(this), "fields-view");
  });

	jq$(".field-popup-trigger").mouseup(function (event) {
      event.cancelBubble = true;
      (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
      (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
    var parent = this.parentElement;
    var fieldSqlName = parent.getAttribute('fieldid');
    if (fieldSqlName != null && fieldSqlName != '') {
    	var friendlyName = jq$(parent).find('.field-name').html();
        DS_ShowFieldProperties(fieldSqlName, friendlyName, parent.getAttribute('id'));
    }
    return false;
  });
}

function DsClicked(dsInd) {
	var clicked = document.getElementById('tcb' + dsInd);

	if (clicked.getAttribute('locked') == 'false') {
		var cso = clicked.getAttribute('sorder');
		if (cso == null || cso == '-1') {
			EngageDs(clicked);
			NDS_RestoreDsSelection(dsInd);
		}
		else
			DisengageDs(clicked);
	}
	NDS_UpdateDatasourcesAvailability(false);
	var clicked$ = jq$(clicked);
	var table$ = clicked$.closest("div.table");
	initFieldsDsp(clicked.parentNode);  
	table$.addClass("opened");
	if (table$.hasClass('checked')) {
		table$.removeClass('checked');
		jq$.each(table$.find('a.field'), function (i, f) {
			var field$ = jq$(f);
			var sorder = field$.attr('sorder');
			if (sorder != -1 && sorder != '-1') {
				eval(field$.attr('onmouseup'));
			}
		});
	}
}

function NDS_UnckeckAllDs() {
	var index = 0;
	var cb;
	while (true) {
		cb = document.getElementById('tcb' + index);
		if (cb == null)
			break;
		DisengageDs(cb);
		index++;
	}
	NDS_UpdateDatasourcesAvailability(true);
}

function FiClick(tind, find, programmatic, enableOnly) {
  if (fieldsDragPreformingNow && !programmatic)
    return;
	var storeSelection = false;
	var clickedDs = document.getElementById('tcb' + tind);
	if (clickedDs.getAttribute('locked') == 'false' || clickedDs.getAttribute('sorder') != '-1') {
		var clickedFi = document.getElementById('tcb' + tind + 'fcb' + find);
		var cso = clickedFi.getAttribute('sorder');
		if (cso == null || cso == '-1') {
			EngageDs(clickedDs);
			NDS_SetFiSOrd(clickedFi, csOrder);
			storeSelection = true;
			csOrder++;
	  } else {
	    if (!enableOnly)
			  NDS_SetFiSOrd(clickedFi, '-1');
		}
	}
	NDS_UpdateDatasourcesAvailability(false);
	if (storeSelection)
	  NDS_StoreDsSelection(tind);
	if (updateOnClick)
	  PreviewReportManual();
}

function FiClickForcedDrag(tind, find, programmatic, enableOnly) {
  var clickedDs = document.getElementById('tcb' + tind);
  if (clickedDs.getAttribute('locked') == 'false' || clickedDs.getAttribute('sorder') != '-1') {
    var clickedFi = document.getElementById('tcb' + tind + 'fcb' + find);
    EngageDs(clickedDs);
    jq$(clickedFi).addClass('checked');
    csOrder++;
  }
  NDS_UpdateDatasourcesAvailability(false);
  NDS_StoreDsSelection(tind);
  if (updateOnDrag)
    PreviewReportManual();
}

function GetInstantReportConfig() {
    var requestString = 'wscmd=instantreportconfig';
    AjaxRequest('./rs.aspx', requestString, GotInstantReportConfig, null, 'instantreportconfig');
}

function GotInstantReportConfig(returnObj, id) {
    if (id != 'instantreportconfig' || returnObj == undefined || returnObj == null)
        return;
    nirConfig = returnObj;
    chartAvailable = nirConfig.VisualizationsAvailable;
    InitEmptyPreviewArea('#rightHelpDiv');
	jq$("#previewH2").show();
    jq$(".database-header a, .table-header a, a.field, .table-header a .checkbox-container, a.uncheck, a.collapse").click(function (event) {
        event.preventDefault();
    });

    var triggersHTML = "<span class='f-trigger' data-view='fields-view'> \
							<img src='rs.aspx?image=ModernImages.fields-icon.png' alt='' /> <span class='text'>" + IzLocal.Res("js_Fields", "Fields") + "</span> \
						</span> \
						<span class='p-trigger' data-view='preview-view'>" + IzLocal.Res("js_Preview", "Preview") + "</span> \
						<span class='v-trigger' data-view='visuals-view'>" + IzLocal.Res("js_Visuals", "Visuals") + "</span> \
						<span class='b-trigger' data-view='relationships-view'>" + IzLocal.Res("js_Relationships", "Relationships") + "</span> \ ";
    jq$(triggersHTML).appendTo(".table-view-triggers");

    jq$(".table-header a .table-view-triggers span").live("click", function (event) {
        event.cancelBubble = true;
        (event.stopPropagation) ? event.stopPropagation() : event.returnValue = false;
        (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
        var trigger = jq$(this);
        var table = jq$(this).closest(".table");
        var view = trigger.attr("data-view");
        setView(table, view);
        if (!table.hasClass('opened')) {
            collapseTables();
            table.addClass("opened", animationTime);
        }
    });

    jq$(".table").each(function () {
    	setView(jq$(this), "fields-view");
    });

    rootRightDiv = document.getElementById('rootRightDiv');
    leftDiv = document.getElementById('leftDiv');
    pdiv = document.getElementById('rightHelpDiv');
    defaultPdivPos = '';
    databasesDiv = document.getElementById('databases');
    defaultDbHeight = databasesDiv.style.height;	
    defaultDbOverflowY = databasesDiv.style.overflowY;
    previewWrapperDiv = null;
    defaultPwHeight = '';
    defaultPwOverflowY = '';
    defaultPwPaddingRight = '';

    whiteHeader = document.getElementById('whiteHeader');
    blueHeader = document.getElementById('blueHeader');
    setInterval(checkLeftHeight, 100);

    jq$(window).resize(function (event) {
        checkLeftHeight();
        updatePreviewPosition(event);
        PreviewReportDelayed(10);
    });
    jq$(window).scroll(function (event) {
        updatePreviewPosition(event);
    });
    checkLeftHeight();
    updatePreviewPosition(null);
    InitInstantFilters();
}

/* ----------------- */
/* ---- Filters ---- */
/* ----------------- */
var dataSources = [];
var fieldsList = [];
var fieldsDataObtained;
var filtersDataObtained;
var nrvConfig = null;
var urlSettings = {};

function InitInstantFilters() {
	fieldsDataObtained = true;
	filtersDataObtained = true;
	urlSettings.urlRsPage = nirConfig.ResponseServerUrl;
}

function GetSelectedDataSources() {
	var dsList = new Array();
	var index = 0;
	var cb;
	var soVal;
	while (true) {
		cb = document.getElementById('tcb' + index);
		if (cb == null)
			break;
		soVal = cb.getAttribute('sorder');
		if (soVal == '-1') {
			index++;
			continue;
		}
		dsList[dsList.length] = cb.getAttribute('tableid');
		index++;
	}
	return dsList;
}

function UpdateDataSources() {
	if (typeof databaseSchema == 'undefined' || typeof dataSources == 'undefined' || databaseSchema == null)
		return;

	var selectedDataSources = GetSelectedDataSources();
	dataSources = new Array();
	for (var cat = 0; cat < databaseSchema.length; cat++)
		for (key in databaseSchema[cat].tables) {
			var table = databaseSchema[cat].tables[key];

			// Only selected data sources are available
			if (jq$.inArray(table.sysname, selectedDataSources) < 0)
				continue;

			var ds = {
				FriendlyName: key,
				DbName: table.sysname,
				DataType: 0,
				IsStoredProc: false,
				JoinAlias: ''
			};
			var columns = new Array();
			for (fieldKey in table.fields) {
				var field = table.fields[fieldKey];
				var column = {
					FriendlyName: fieldKey,
					DbName: field.sysname
				};
				columns.push(column);
			}
			ds.Columns = columns;
			dataSources.push(ds);
		}	
}

function UpdateFiltersAvailability() {
	if (typeof filtersData == 'undefined' || filtersData == null)
		return;
	UpdateDataSources();

	var availableColumns = new Array();
	for (var ds = 0; ds < dataSources.length; ds++)
		for (var col = 0; col < dataSources[ds].Columns.length; col++)
			availableColumns.push(dataSources[ds].Columns[col].DbName);

	var availableFilters = new Array();
	for (var i = 0; i < filtersData.length; i++)
		if (availableColumns.indexOf(filtersData[i].ColumnName) >= 0) {
			var filterObj = filtersData[i];
			if (!filtersData[i].Removed)
				filterObj.Value = GetFilterValues(i, filtersData).slice(1)[0];
			availableFilters.push(filterObj);
		}

	var returnObject = {
		Filters: availableFilters,
		SubreportsFilters: null,
		FilterLogic: ''
	};
	RefreshFilters(returnObject);
}

// Report Viewer override
function ShowFieldPropertiesByFullFieldName(fieldName, GUID) {
	for (var dsInd = 0; dsInd < dataSources.length; dsInd++)
		for (var colInd = 0; colInd < dataSources[dsInd].Columns.length; colInd++)
			if (dataSources[dsInd].Columns[colInd].DbName == fieldName) {
				DS_ShowFieldProperties(fieldName, dataSources[dsInd].Columns[colInd].FriendlyName, null, GUID);
				return;
			}

	DS_ShowFieldProperties(fieldName, fieldName, null, GUID);
	return;
}