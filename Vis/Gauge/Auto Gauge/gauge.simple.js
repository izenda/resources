var izenda = izenda || {};

(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.SimpleGauge = function (parent, title, size, data) {
		ns.gauges.BaseGauge.call(this, parent, title, size);
		this.data = data;
		this._applyMeasure(size);
	}

	ns.gauges.SimpleGauge.prototype = new ns.gauges.BaseGauge();

	ns.gauges.SimpleGauge.prototype._applyMeasure = function (size) {
		this.width = size;
		this.height = size;

		this.titleX = 0;
		this.titleY = size * 0.23;
		this.titleFontSize = size * 0.23;

		this.valueX = 0;
		this.valueY = size * 0.67;
		this.valueFontSize = size * 0.45;
		this.valueOnLoadAnimationDuration = 700;
		this.valueOnHoverAnimationDuration = 300;
		
		this.unitsX = 0;
		this.unitsY = size * 0.9;
		this.unitsFontSize = size * 0.14;
	};

	ns.gauges.SimpleGauge.prototype._calcColorByRegions = function (value, regions) {
		if (regions.length == 0) {
			return "#000000";
		}

		regions = regions.sort(function (a, b) {
			return a.value > b.value ? 1 : (a.value < b.value ? -1 : 0);
		});

		var startRegion = null, endRegion = null;
		for (var i = 0; i < regions.length; ++i) {
			if (value <= regions[i].value) {
				endRegion = regions[i];
				break;
			}
			startRegion = regions[i];
			endRegion = null;
		}

		var jsgradient = {
			hexToRgb: function (hex) {
				var r, g, b;
				hex = hex.replace('#', '');
				if (hex.length !== 3 && hex.length !== 6) {
					return [255, 255, 255];
				}
				if (hex.length == 3) {
					hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
				}
				r = parseInt(hex.substr(0, 2), 16);
				g = parseInt(hex.substr(2, 2), 16);
				b = parseInt(hex.substr(4, 2), 16);
				return [r, g, b];
			},

			rgbToHex: function (color) {
				color[0] = (color[0] > 255) ? 255 : (color[0] < 0) ? 0 : color[0];
				color[1] = (color[1] > 255) ? 255 : (color[1] < 0) ? 0 : color[1];
				color[2] = (color[2] > 255) ? 255 : (color[2] < 0) ? 0 : color[2];

				return this.zeroFill(color[0].toString(16), 2) + this.zeroFill(color[1].toString(16), 2) + this.zeroFill(color[2].toString(16), 2);
			},

			zeroFill: function (number, width) {
				width -= number.toString().length;
				if (width > 0) {
					return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
				}
				return number;
			},

			jsgradient: function (colorA, colorB, step) {
				var steps = 100;

				if (step == 0) {
					return colorA;
				} else if (step == steps) {
					return colorB;
				}

				colorA = this.hexToRgb(colorA);
				colorB = this.hexToRgb(colorB);

				var rStep = (Math.max(colorA[0], colorB[0]) - Math.min(colorA[0], colorB[0])) / steps;
				var gStep = (Math.max(colorA[1], colorB[1]) - Math.min(colorA[1], colorB[1])) / steps;
				var bStep = (Math.max(colorA[2], colorB[2]) - Math.min(colorA[2], colorB[2])) / steps;

				var rVal = colorA[0],
					gVal = colorA[1],
					bVal = colorA[2];

				for (var i = 0; i < step; i++) {
					rVal = (colorA[0] < colorB[0]) ? rVal + Math.round(rStep) : rVal - Math.round(rStep);
					gVal = (colorA[1] < colorB[1]) ? gVal + Math.round(gStep) : gVal - Math.round(gStep);
					bVal = (colorA[2] < colorB[2]) ? bVal + Math.round(bStep) : bVal - Math.round(bStep);;
				};

				return '#' + this.rgbToHex([rVal, gVal, bVal]);
			}
		};

		if (!startRegion) {
			return jsgradient.jsgradient("#000000", endRegion.color, Math.floor(value / endRegion.value * 100));
		} else if (!endRegion) {
			return startRegion.color;
		} else {
			return jsgradient.jsgradient(startRegion.color, endRegion.color, Math.floor((value - startRegion.value) / (endRegion.value - startRegion.value) * 100));
		}
	};

	ns.gauges.SimpleGauge.prototype.render = function (dynamic) {
		var self = this, formatedValue = ns.format.formatValue(self.data.items[0].value, self.data.items[0].format),
			formatedBigValue = ns.format.formatBigNumber(self.data.items[0].value, self.data.items[0].format);

		var svg = d3.select(self.parent).append("svg");
		var enter = svg.append("g").attr("class", "component");

		enter.append("g")
			.attr("class", "title");
		enter.select(".title").append("text")
			.text(self.title)
			.attr("x", self.titleX)
			.attr("y", self.titleY)
			.style("font-size", self.titleFontSize + "px");

		enter.append("g")
			.attr("class", "value")
			.attr("cursor", "pointer");
		var value = enter.select(".value").append("text")
			.text(formatedValue)
			.attr("x", self.valueX)
			.attr("y", self.valueY)
			.attr("fill", self._calcColorByRegions(self.data.items[0].value, jq$.grep([self.data.low, self.data.high, self.data.target], function (n, i) { return (typeof n != 'undefined'); })))
			.style("font-size", self.valueFontSize + "px");
		
		if (formatedValue !== formatedBigValue) {
			value.on("mouseover", function (d) {
				value.transition().duration(self.valueOnHoverAnimationDuration).style("opacity", 0).each("end", function () {
					value.text(formatedValue);
					value.transition().duration(self.valueOnHoverAnimationDuration).style("opacity", 1);
				});
			}).on("mouseout", function (d) {
				value.transition().duration(self.valueOnHoverAnimationDuration).style("opacity", 0).each("end", function () {
					value.text(formatedBigValue);
					value.transition().duration(self.valueOnHoverAnimationDuration).style("opacity", 1);
				});
			});
		}

		if (typeof self.data.units != 'undefined') {
			enter.append("g")
				.attr("class", "units");
			enter.selectAll(".units").append("text")
				.text(self.data.units.value)
				.attr("x", self.unitsX)
				.attr("y", self.unitsY)
				.style("font-size", self.unitsFontSize + "px");
		}

		svg.attr("width", (enter.node().getBBox().width > self.width) ? enter.node().getBBox().width : self.width)
			.attr("height", self.height)
			.style({
				padding: "0px " + (self.width * 0.08) + "px"
			});

		if (dynamic) {
			var currentValue = 0;
			jq$.extend(true, self.data.items[0].format, {
				degree: ns.format.getDegreeByValue(self.data.items[0].value)
			});
			value.datum(self.data.items[0].value);
			value.transition().duration(self.valueOnLoadAnimationDuration)
				.tween("text", function(a) {
					var i = d3.interpolate(currentValue, a);
					currentValue = i(0);

					return function(t) {
						currentValue = i(t);
						this.textContent = ns.format.formatBigNumber(i(t), self.data.items[0].format);
					}
				});
		} else {
			value.text(formatedBigValue);
		}
	};

	ns.gauges.SimpleGauge.prototype.resize = function (size) {
		this.destroy();
		this._applyMeasure(size);
		this.render(false);
	};
})(izenda);