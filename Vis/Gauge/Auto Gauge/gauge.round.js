var izenda = izenda || {};

(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.RoundGauge = function (parent, title, degree, tickness, data) {
		ns.gauges.BaseGauge.call(this, parent, title);
		
		this.data = data;
		this.degree = degree;
		this.tickness = tickness;

		this._applyMeasure();
	}

	ns.gauges.RoundGauge.prototype = new ns.gauges.BaseGauge();

	ns.gauges.RoundGauge.prototype._applyMeasure = function () {
		var diameter = 200,
			margin = { top: 0, right: 0, bottom: 30, left: 0 };

		this.width = diameter - margin.right - margin.left - margin.top - margin.bottom;
		this.height = this.width;

		var halfWidth = this.width * 0.5;

		this.duration = 1000;
		this.minValue = 0;
		this.maxValue = 100;
		this.circle = this.data.items[0].value;
		
		this.fontSize = this.width * 0.25;

		this.startAngle = ((this.degree == 360) ? 0 : -this.degree / 2) * (Math.PI / 180);
		this.endAngle = this.startAngle + this.degree * (Math.PI / 180);

		this.outerRadius = halfWidth;
		this.innerRadius = this.outerRadius - (this.tickness * this.outerRadius / 100);

		if (this.outerRadius - this.innerRadius < 1) {
			this.innerRadius = this.outerRadius - 1;
		}

		this.backgroundArc = d3.svg.arc()
			.startAngle(this.startAngle)
			.endAngle(this.endAngle)
			.innerRadius(this.innerRadius)
			.outerRadius(this.outerRadius);
		this.backgroundArcX = halfWidth;
		this.backgroundArcY = halfWidth;

		this.currentArc = d3.svg.arc()
			.innerRadius(this.innerRadius)
			.outerRadius(this.outerRadius);
		this.currentArcX = halfWidth;
		this.currentArcY = halfWidth;

		this.titleWidth = this.width;
		this.titleX = halfWidth;
		this.titleY = this.width * (((this.degree < 180) ? 200 : ((this.degree > 340) ? 360 : this.degree + 20)) / 360) + this.fontSize;
		this.titleFontSize = this.fontSize * 0.5;

		this.regionFactor = 5;
		var regionThickness = this.outerRadius - this.innerRadius;
		this.regionOuterRadius = this.innerRadius * 0.95;
		this.regionInnerRadius = this.regionOuterRadius - (regionThickness > 5 ? 5 : regionThickness);
		this.regionX = halfWidth;
		this.regionY = halfWidth;

		if (typeof this.data.max != "undefined") {
			this.circle = 1;
			this.maxValue = this.data.max.value;
		} else if (this.data.items.length > 1) {
			this.circle = 1;
			this.maxValue = this.data.items[1].value;
		} else {
			if (this.data.items[0].format.isPercentage) {
				this.circle = 100;
				this.maxValue = 100;
			} else {
				this.circle = this.data.items[0].value;
				this.maxValue = this.data.items[0].value;
			}
		}

		this.labelValueFontSize = this.width * 0.3;
		this.labelValueX = halfWidth;
		this.labelValueY = halfWidth + this.labelValueFontSize / 4;
		this.labelFormatTypeFontSize = this.width * 0.15;
		this.labelsOffsetFactor = 0.75;
	};

	ns.gauges.RoundGauge.prototype.render = function (dynamic) {
		var self = this;

		var svg = d3.select(self.parent).append("svg");

		var enter = svg.append("g").attr("class", "component");

		var background = enter.append("g").attr("class", "background");
		background.append("path")
			.attr("transform", "translate(" + self.backgroundArcX + "," + self.backgroundArcY + ")")
			.attr("d", self.backgroundArc);
		background.append("text")
			.attr("width", self.titleWidth)
			.attr("class", "title")
			.attr("x", self.titleX)
			.attr("y", self.titleY)
			.text(self.title)
			.style("font-size", self.titleFontSize + "px");

		function wrap(text, width) {
			text.each(function () {
				var lexeme = d3.select(this),
					words = lexeme.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = self.fontSize / 1.5,
					y = lexeme.attr("y"),
					tspan = lexeme.text(null).append("tspan").attr("x", self.width / 2).attr("y", y);
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width && line.length > 1) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = lexeme.append("tspan").attr("x", self.width / 2).attr("y", ++lineNumber * lineHeight + parseInt(y)).text(word);
					}
				}
			});
		}
		background.select("text.title").call(wrap, self.width);

		svg.attr("width", self.width)
			.attr("height", background.node().getBBox().height);

		enter.append("g").attr("class", "arcs");

		var ratio = (self.data.items[0].value - self.minValue) / (self.maxValue - self.minValue),
			wDegree = self.degree == 360 ? 0 : self.degree / 2;
		self.currentArc
			.startAngle(self.startAngle)
			.endAngle(dynamic ? self.startAngle : ((Math.min(self.degree * ratio, self.degree) - wDegree) * Math.PI / 180));

		var path = enter.select(".arcs").append("path")
			.attr("class", "arc")
			.attr("transform", "translate(" + self.currentArcX + "," + self.currentArcY + ")")
			.attr("d", self.currentArc);

		var regions = jq$.grep([self.data.low, self.data.high, self.data.target], function (n, i) { return (typeof n != 'undefined'); });
		regions.forEach(function (region) {
			var arc = d3.svg.arc()
				.outerRadius(self.regionOuterRadius)
				.innerRadius(self.regionInnerRadius);

			var point = ((region.value > self.circle) ? self.circle : region.value) * self.degree / self.circle;

			if (self.degree != 360) {
				if (point == 0) {
					point += self.regionFactor;
				} else if (region.value > self.circle || point == self.degree) {
					point -= self.regionFactor;
				}
			}

			arc.startAngle((point - self.regionFactor - wDegree) * (Math.PI / 180))
				.endAngle((point + self.regionFactor - wDegree) * (Math.PI / 180));

			enter.select(".arcs").append("path")
				.attr("transform", "translate(" + self.regionX + "," + self.regionY + ")")
				.attr("class", "arc-region-" + region.name)
				.attr("d", arc)
				.attr("fill", region.color);

			region.arc = arc;
		});

		var tooltip = d3.select(self.parent).append("div")
			.attr("class", "tooltip")
			.style("opacity", 0)
			.html((self.data.items.length > 1 || (typeof self.data.max != "undefined")) ? (self.data.items[0].value + " / " + ((typeof self.data.max != "undefined") ? self.data.max.value : self.data.items[1].value)) : ns.format.formatValue(self.data.items[0].value, self.data.items[0].format));

		var labels = enter.append("g").attr("class", "labels")
			.on("mouseover", function (d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 1);
				tooltip.style("left", (d3.event.layerX) + "px")
					.style("top", (d3.event.layerY - 15) + "px");
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

		var formatTypeText = null;
		if (self.data.items.length > 1 || (typeof this.data.max != "undefined")) {
			var numerator = self.data.items[0],
				denominator = (typeof this.data.max != "undefined") ? self.data.max : self.data.items[1];

			numerator.format.significant = null;
			denominator.format.significant = null;
			var formatedFirst = ns.format.formatBigNumber(numerator.value, numerator.format),
				formatedSecond = ns.format.formatBigNumber(denominator.value, denominator.format),
				isExistFractPart = (formatedFirst != "0") && (formatedSecond != "1") && formatedFirst !== formatedSecond;
				//&& (parseInt(formatedSecond) != 1 || formatedFirst[formatedFirst.length - 1] !== formatedSecond[formatedSecond.length - 1]);

			if (isExistFractPart) {
				formatTypeText = "/" + formatedSecond;
			} else {
				if (formatedFirst === formatedSecond) {
					numerator.value = 1;
				}
				self.circle = numerator.value;
				self.maxValue = numerator.value;
			}
		} else if (self.data.items[0].format.isPercentage) {
			formatTypeText = "%";
		} else if (self.data.items[0].format.isCurrency) {
			formatTypeText = self.data.items[0].format.currency;
		}

		var labelValue = labels.append("text")
			.attr("class", "label-value")
			.text(ns.format.formatBigNumber(self.data.items[0].value, self.data.items[0].format))
			.style("text-anchor", "middle");

		if(formatTypeText) {
			labels.append("text")
				.attr("class", "label-format-type")
				.text(formatTypeText)
				.style("text-anchor", "start");
		}

		function setLabelParameters() {
			self.labelValueY = self.width * 0.55 + labelValue.node().getBBox().height * 0.5;

			labelValue.attr("x", self.labelValueX)
				.attr("y", self.labelValueY)
				.style("font-size", self.labelValueFontSize + "px");
			
			if(formatTypeText) {
				labels.select(".label-format-type")
					.attr("x", self.labelValueX + labelValue.node().getBBox().width * 0.5 + self.width * 0.01)
					.attr("y", self.labelValueY)
					.style("font-size", self.labelFormatTypeFontSize + "px");
			}

			var labelsBBox = labels.node().getBBox(),
			labelBoxHalfWidth = labelsBBox.x - self.width * 0.5 + labelsBBox.width;

			if (labelBoxHalfWidth > self.innerRadius * self.labelsOffsetFactor) {
				var factor = self.innerRadius * self.labelsOffsetFactor / labelBoxHalfWidth;
				labels.attr("transform", "translate(" + (1 - factor) * self.labelValueX + "," + ((1 - factor) * self.labelValueY - self.labelValueFontSize * 0.3 * (1 - factor)) + "), scale(" + factor + ")");
			}
		}

		setLabelParameters();

		if (dynamic) {
			var currentValue = self.minValue,
				currentArcAngle = self.startAngle,
				currentArcEndAngle = (Math.min(self.degree * ratio, self.degree) - wDegree) * Math.PI / 180;

			path.datum(currentArcEndAngle);
			path.transition().duration(self.duration)
				.attrTween("d", function (a) {
					var i = d3.interpolate(currentArcAngle, a);
					return function (t) {
						currentArcAngle = i(t);
						return self.currentArc.endAngle(i(t))();
					};
				});

			jq$.extend(true, self.data.items[0].format, {
				degree: ns.format.getDegreeByValue(self.data.items[0].value)
			});

			labelValue.datum(Math.round(ratio * 100));
			labelValue.transition().duration(self.duration)
				.tween("text", function (a) {
					var i = d3.interpolate(currentValue, a);
					currentValue = i(0);

					return function (t) {
						currentValue = i(t);
						this.textContent = ns.format.formatBigNumber(i(t) * self.maxValue / 100, self.data.items[0].format);
					}
				}).each("end", function () {
					labelValue.text(ns.format.formatBigNumber(self.data.items[0].value, self.data.items[0].format));
				});
		}
	};

	ns.gauges.RoundGauge.prototype.setDegree = function (degree) {
		this.destroy();

		this.degree = degree;
		this._applyMeasure();
		this.render();
	};

	ns.gauges.RoundGauge.prototype.setTickness = function (tickness) {
		this.destroy();

		this.tickness = tickness;
		this._applyMeasure();
		this.render();
	};
})(izenda);