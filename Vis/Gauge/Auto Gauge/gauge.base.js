var izenda = izenda || {};

(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.BaseGauge = function (parent, title, size) {
		this.parent = (typeof parent !== "undefined") ? parent : {};
		this.title = (typeof title !== "undefined") ? title : "";
		this.size = (typeof size !== "undefined") ? size : 0;
	};

	ns.gauges.BaseGauge.prototype.render = function () {
		jq$(this.parent).html("<div>Not Implemented</div>");
	};

	ns.gauges.BaseGauge.prototype.destroy = function () {
		jq$(this.parent).empty();
	};
})(izenda);


izenda.format = izenda.format || {};

(function (p) {
	p.defaultFormat = function(){
		return {
			precision: 0,
			significant: 3,
			degree: null,
			degreeCase: "UPPER"
		};
	};

	p.fixedNumber = function (value, precision) {
		var pow = Math.pow(10, precision);
		return Math.round(value * pow) / pow;
	};

	p.getDegreeByValue = function (value) {
		value = Math.abs(value);
		if (value >= 1) {
			return Math.floor(value).toString().length - 1;
		} else {
			return (2 - value.toString().length);
		} 
	};

	p.formatNumber = function (value ,format) {
		format = jq$.extend(p.defaultFormat(), format);
		return accounting.formatNumber(value, format.precision);
	};

	p.formatCurrency = function (value, format) {
		format = jq$.extend(p.defaultFormat(), format);
		return accounting.formatMoney(value, format.currency, format.precision);
	};

	p.formatPercentage = function (value) {
		return (value + (/.+(K|M|B|T)$/i.test(value.toString()) ? " %" : "%"));
	};

	p.formatValue = function (value, format) {
		if (format.isCurrency) {
			return p.formatCurrency(value, format);
		}

		if (format.isPercentage) {
			return p.formatPercentage(value);
		}

		return p.formatNumber(value, format);
	};
	
	p.formatBigNumber = function (value, format) {
		format = jq$.extend(p.defaultFormat(), format);
	
		value = p.fixedNumber(value, format.precision);

		function applyCase(value) {
			return (format.degreeCase === "LOWER" ? value.toLowerCase() : value);
		}

		function formatSignificantPart(part) {
			if (format.significant != null) {
				return p.fixedNumber(part, format.significant - Math.floor(part).toString().length);
			}

			return Math.round(part);
		}

		if (format.degree == null) {
			format.degree = p.getDegreeByValue(value);
		}

		if (format.degree >= 12) {
			return applyCase(formatSignificantPart(value / Math.pow(10, 12)) + "T");
		} else if (format.degree >= 9) {
			return applyCase(formatSignificantPart(value / Math.pow(10, 9)) + "B");
		} else if (format.degree >= 6) {
			return applyCase(formatSignificantPart(value / Math.pow(10, 6)) + "M");
		} else if (format.degree >= 3) {
			return applyCase(formatSignificantPart(value / Math.pow(10, 3)) + "K");
		} else {
			return formatSignificantPart(value) + "";
		}
	};
})(izenda.format);


izenda.utils = izenda.utils || {};

(function (u) {
	u.hitch = function (scope, fn) {
		return function () {
			return fn.apply(scope, arguments);
		}
	};
})(izenda.utils);


(function (win, doc) {
	"use strict";
	var DELAY = 100,
		TEST_STRING = 'AxmTYklsjo190QW',
		TOLERANCE = 2,

		SANS_SERIF_FONTS = 'sans-serif',
		SERIF_FONTS = 'serif',

		style = [
			'display:block',
			'position:absolute',
			'top:-999px',
			'left:-999px',
			'font-size:300px',
			'width:auto',
			'height:auto',
			'line-height:normal',
			'margin:0',
			'padding:0',
			'font-variant:normal',
			'white-space:nowrap',
			'font-family:%s'
		].join(';'),
		html = '<div style="' + style + '">' + TEST_STRING + '</div>';

	var FontFaceOnloadInstance = function () {
		this.appended = false;
		this.dimensions = undefined;
		this.serif = undefined;
		this.sansSerif = undefined;
		this.parent = undefined;
	};

	FontFaceOnloadInstance.prototype.initialMeasurements = function (fontFamily) {
		var sansSerif = this.sansSerif,
			serif = this.serif;

		this.dimensions = {
			sansSerif: {
				width: sansSerif.offsetWidth,
				height: sansSerif.offsetHeight
			},
			serif: {
				width: serif.offsetWidth,
				height: serif.offsetHeight
			}
		};
		sansSerif.style.fontFamily = fontFamily + ', ' + SANS_SERIF_FONTS;
		serif.style.fontFamily = fontFamily + ', ' + SERIF_FONTS;
	};

	FontFaceOnloadInstance.prototype.load = function (fontFamily, options) {
		var startTime = new Date(),
			that = this,
			serif = that.serif,
			sansSerif = that.sansSerif,
			parent = that.parent,
			appended = that.appended,
			dimensions = that.dimensions,
			tolerance = options.tolerance || TOLERANCE,
			delay = options.delay || DELAY;

		if (!parent) {
			parent = that.parent = doc.createElement('div');
		}

		parent.innerHTML = html.replace(/\%s/, SANS_SERIF_FONTS) + html.replace(/\%s/, SERIF_FONTS);
		sansSerif = that.sansSerif = parent.firstChild;
		serif = that.serif = sansSerif.nextSibling;

		if (options.glyphs) {
			sansSerif.innerHTML += options.glyphs;
			serif.innerHTML += options.glyphs;
		}

		(function checkDimensions() {
			if (!appended && doc.body) {
				appended = that.appended = true;
				doc.body.appendChild(parent);

				that.initialMeasurements(fontFamily);
			}

			dimensions = that.dimensions;

			if (appended && dimensions &&
				(Math.abs(dimensions.sansSerif.width - sansSerif.offsetWidth) > tolerance ||
					Math.abs(dimensions.sansSerif.height - sansSerif.offsetHeight) > tolerance ||
					Math.abs(dimensions.serif.width - serif.offsetWidth) > tolerance ||
					Math.abs(dimensions.serif.height - serif.offsetHeight) > tolerance)) {
				options.success();
			} else if ((new Date()).getTime() - startTime.getTime() > options.timeout) {
				options.error();
			} else {
				setTimeout(function () {
					checkDimensions();
				}, delay);
			}
		})();
	};

	FontFaceOnloadInstance.prototype.init = function (fontFamily, options) {
		var that = this,
			defaultOptions = {
				glyphs: '',
				success: function () { },
				error: function () { },
				timeout: 10000
			},
			timeout;

		if (!options) {
			options = {};
		}

		for (var j in defaultOptions) {
			if (!options.hasOwnProperty(j)) {
				options[j] = defaultOptions[j];
			}
		}

		if (!options.glyphs && "fonts" in doc) {
			doc.fonts.load("1em " + fontFamily).then(function () {
				options.success();

				win.clearTimeout(timeout);
			});

			if (options.timeout) {
				timeout = win.setTimeout(function () {
					options.error();
				}, options.timeout);
			}
		} else {
			that.load(fontFamily, options);
		}
	};

	var FontFaceOnload = function (fontFamily, options) {
		var instance = new FontFaceOnloadInstance();
		instance.init(fontFamily, options);

		return instance;
	};

	win.FontFaceOnload = FontFaceOnload;
})(window, window.document);


(function (p, z) { function q(a) { return !!("" === a || a && a.charCodeAt && a.substr) } function m(a) { return u ? u(a) : "[object Array]" === v.call(a) } function r(a) { return "[object Object]" === v.call(a) } function s(a, b) { var d, a = a || {}, b = b || {}; for (d in b) b.hasOwnProperty(d) && null == a[d] && (a[d] = b[d]); return a } function j(a, b, d) { var c = [], e, h; if (!a) return c; if (w && a.map === w) return a.map(b, d); for (e = 0, h = a.length; e < h; e++) c[e] = b.call(d, a[e], e, a); return c } function n(a, b) { a = Math.round(Math.abs(a)); return isNaN(a) ? b : a } function x(a) { var b = c.settings.currency.format; "function" === typeof a && (a = a()); return q(a) && a.match("%v") ? { pos: a, neg: a.replace("-", "").replace("%v", "-%v"), zero: a } : !a || !a.pos || !a.pos.match("%v") ? !q(b) ? b : c.settings.currency.format = { pos: b, neg: b.replace("%v", "-%v"), zero: b } : a } var c = { version: "0.4.1", settings: { currency: { symbol: "$", format: "%s%v", decimal: ".", thousand: ",", precision: 2, grouping: 3 }, number: { precision: 0, grouping: 3, thousand: ",", decimal: "." } } }, w = Array.prototype.map, u = Array.isArray, v = Object.prototype.toString, o = c.unformat = c.parse = function (a, b) { if (m(a)) return j(a, function (a) { return o(a, b) }); a = a || 0; if ("number" === typeof a) return a; var b = b || ".", c = RegExp("[^0-9-" + b + "]", ["g"]), c = parseFloat(("" + a).replace(/\((.*)\)/, "-$1").replace(c, "").replace(b, ".")); return !isNaN(c) ? c : 0 }, y = c.toFixed = function (a, b) { var b = n(b, c.settings.number.precision), d = Math.pow(10, b); return (Math.round(c.unformat(a) * d) / d).toFixed(b) }, t = c.formatNumber = c.format = function (a, b, d, i) { if (m(a)) return j(a, function (a) { return t(a, b, d, i) }); var a = o(a), e = s(r(b) ? b : { precision: b, thousand: d, decimal: i }, c.settings.number), h = n(e.precision), f = 0 > a ? "-" : "", g = parseInt(y(Math.abs(a || 0), h), 10) + "", l = 3 < g.length ? g.length % 3 : 0; return f + (l ? g.substr(0, l) + e.thousand : "") + g.substr(l).replace(/(\d{3})(?=\d)/g, "$1" + e.thousand) + (h ? e.decimal + y(Math.abs(a), h).split(".")[1] : "") }, A = c.formatMoney = function (a, b, d, i, e, h) { if (m(a)) return j(a, function (a) { return A(a, b, d, i, e, h) }); var a = o(a), f = s(r(b) ? b : { symbol: b, precision: d, thousand: i, decimal: e, format: h }, c.settings.currency), g = x(f.format); return (0 < a ? g.pos : 0 > a ? g.neg : g.zero).replace("%s", f.symbol).replace("%v", t(Math.abs(a), n(f.precision), f.thousand, f.decimal)) }; c.formatColumn = function (a, b, d, i, e, h) { if (!a) return []; var f = s(r(b) ? b : { symbol: b, precision: d, thousand: i, decimal: e, format: h }, c.settings.currency), g = x(f.format), l = g.pos.indexOf("%s") < g.pos.indexOf("%v") ? !0 : !1, k = 0, a = j(a, function (a) { if (m(a)) return c.formatColumn(a, f); a = o(a); a = (0 < a ? g.pos : 0 > a ? g.neg : g.zero).replace("%s", f.symbol).replace("%v", t(Math.abs(a), n(f.precision), f.thousand, f.decimal)); if (a.length > k) k = a.length; return a }); return j(a, function (a) { return q(a) && a.length < k ? l ? a.replace(f.symbol, f.symbol + Array(k - a.length + 1).join(" ")) : Array(k - a.length + 1).join(" ") + a : a }) }; if ("undefined" !== typeof exports) { if ("undefined" !== typeof module && module.exports) exports = module.exports = c; exports.accounting = c } else "function" === typeof define && define.amd ? define([], function () { return c }) : (c.noConflict = function (a) { return function () { p.accounting = a; c.noConflict = z; return c } }(p.accounting), p.accounting = c) })(this);