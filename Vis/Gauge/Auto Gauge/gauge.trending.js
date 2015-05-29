var izenda = izenda || {};

(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.TrendingGauge = function (parent, title, size, data) {
		ns.gauges.BaseGauge.call(this, parent, title, size);

		this._applyMeasure(size);

		this.data = data;
	}

	ns.gauges.TrendingGauge.prototype = new ns.gauges.BaseGauge();

	ns.gauges.TrendingGauge.prototype._applyMeasure = function (size) {
		this.width = size,
		this.height = size * 0.5;

		this.correctedCurrentBlockWidth = this.width * 0.9;

		this.titleX = this.width / 30;
		this.titleY = this.height * 0.2;
		this.titleFontSize = size * 0.1;

		this.relativeX = this.width * (1 - 1 / 30);
		this.relativeY = this.height * 0.2;
		this.relativeFontSize = size * 0.1;
		this.relativeArrowScale = size * 0.05 / 79;

		this.currentX = this.width * 0.05;
		this.currentY = this.height * 0.86;
		this.currentFontSize = size * 0.18;

		this.currentDateX = this.width * 0.05;
		this.currentDateY = this.height * 0.96;
		this.currentDateFontSize = size * 0.038;
		this.currentDateAnimationDuration = 300;

		this.outsetBorderWidth = 3;
		this.insetBorderWidth = size * 0.017;
		
		this.areaOffset = size * 0.005;
		this.areaBorderWidth = size * 0.003;

		this.areaPointRadius = size / 60;
		this.areaPointOffset = size * 0.004;

		this.areaBullseyeRadius = size / 70;
		this.areaBullseyeTickness = size * 0.006;
		this.areaBullseyeInnerRadius = size * 0.006;
	};

	ns.gauges.TrendingGauge.prototype.render = function () {
		var self = this, lastRecord = self.data[self.data.length - 1],
			relativeValue = lastRecord.items[0].value * 100 / self.data[0].items[0].value - 100;

		var svg = d3.select(self.parent).append("svg")
			.attr("width", self.width)
			.attr("height", self.height);

		var defs = svg.append("defs");

		var backgroundAreaGradient = defs.append("linearGradient")
			.attr("id", "backgroundAreaGradient")
			.attr("x1", "100%")
			.attr("y1", "100%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("gradientUnits", "userSpaceOnUse");

		backgroundAreaGradient.append("stop")
			.attr("offset", "10%")
			.attr("stop-color", "#ffffff")
			.attr("stop-opacity", 1);

		backgroundAreaGradient.append("stop")
			.attr("offset", "65%")
			.attr("stop-color", "#c1e5f5")
			.attr("stop-opacity", 1);

		var enter = svg.append("g").attr("class", "component");

		var x = d3.time.scale()
			.domain(d3.extent(self.data, function (d) { return d.date; }))
			.range([0, self.width - self.areaOffset * 2]);

		var y = d3.scale.linear()
			.domain([d3.min(self.data, function (d) {
				return (typeof d.target == "undefined") ? d.items[0].value : d3.min([d.items[0].value, d.target.value]);
			}), d3.max(self.data, function(d) {
				return (typeof d.target == "undefined") ? d.items[0].value : d3.max([d.items[0].value, d.target.value]);
			})])
			.range([self.height * 0.52, self.height * 0.32]);

		var area = d3.svg.area()
			.x(function (d) { return x(d.date); })
			.y0(self.height - self.areaOffset * 2)
			.y1(function (d) { return y(d.items[0].value); });

		var background = enter.append("g").attr("class", "backgrounbd");
		background.append("path")
			.datum(self.data)
			.attr("class", "area")
			.attr("d", area)
			.attr("transform", "translate(" + self.areaOffset + "," + self.areaOffset + ")")
			.attr("fill", "url(#backgroundAreaGradient)")
			.style("stroke-width", self.areaBorderWidth + "px");

		var areaPoint = background.append("circle")
			.attr("class", "area-point")
			.attr("r", self.areaPointRadius);
		var bisectDate = d3.bisector(function (d) { return d.date; }).left, currentItem;
		function setTransformOfAreaPoint(point) {
			var xT = x(point.date) + self.areaOffset;
			var yT = y(point.items[0].value) + self.areaOffset;

			if (xT < self.areaPointRadius) {
				xT = self.areaPointRadius + self.areaOffset + self.areaPointOffset;
			} else if (self.width - xT < self.areaPointRadius) {
				xT = self.width - self.areaPointRadius - self.areaOffset - self.areaPointOffset;
			}

			areaPoint.attr("transform", "translate(" + xT + "," + yT + ")");
		}
		setTransformOfAreaPoint(lastRecord);

		svg.on("mouseover", function () {
				currentBlock.select(".current-date").transition().duration(self.currentDateAnimationDuration).style("opacity", 1);
			})
			.on("mouseout", function () {
				currentBlock.select(".current-date").transition().duration(self.currentDateAnimationDuration).style("opacity", 0);
			})
			.on("mousemove", function () {
				var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(self.data, x0, 1),
				d0 = self.data[i - 1],
				d1 = (i < self.data.length) ? self.data[i] : self.data[i - 1],
				d = x0 - d0.date > d1.date - x0 ? d1 : d0;

				if (d != currentItem) {
					currentItem = d;
					setCurrentValue(d);
					setRelativeValue(Math.round((d.items[0].value * 100 / self.data[0].items[0].value - 100) * 100) / 100);
					setTransformOfAreaPoint(d);

					if (typeof d.target !== "undefined") {
						setTransformOfAreaBullseye(d);
					}
				}
			});

		function setTransformOfAreaBullseye(point) {
			var xT = x(point.date) + self.areaOffset;
			var yT = y(point.target.value) + self.areaOffset;

			if (xT < self.areaPointRadius) {
				xT = self.areaPointRadius + self.areaOffset + self.areaPointOffset;
			} else if (self.width - xT < self.areaPointRadius) {
				xT = self.width - self.areaPointRadius - self.areaOffset - self.areaPointOffset;
			}

			if (yT < self.areaPointRadius) {
				yT = self.areaPointRadius + self.areaOffset + self.areaPointOffset;
			} else if (self.height - yT < self.areaPointRadius) {
				yT = self.height - self.areaPointRadius - self.areaOffset - self.areaPointOffset;
			}

			background.select(".area-bullseye").attr("transform", "translate(" + xT + "," + yT + ")");
			background.select(".area-bullseye-inner").attr("transform", "translate(" + xT + "," + yT + ")");
		}
		if (typeof lastRecord.target !== "undefined") {
			background.append("circle")
				.attr("class", "area-bullseye")
				.attr("r", self.areaBullseyeRadius)
				.style("stroke-width", self.areaBullseyeTickness + "px"),
			background.append("circle")
				.attr("class", "area-bullseye-inner")
				.attr("r", self.areaBullseyeInnerRadius);

			setTransformOfAreaBullseye(lastRecord);
		}

		enter.append("g")
			.attr("class", "title")
			.append("text")
				.attr("x", self.titleX)
				.attr("y", self.titleY)
				.text(self.title)
				.style("font-size", self.titleFontSize + "px");

		var relativeBlock = enter.append("g");
		var relativeBlockText = relativeBlock.append("text")
			.attr("class", "relative-value")
			.attr("transform", "translate(" + self.relativeX + "," + self.relativeY + ")")
			.style({
				"text-anchor": "end",
				"font-size": self.relativeFontSize + "px"
			});
		function setRelativeValue(value) {
			var formatedBigValue = ns.format.formatPercentage(ns.format.formatBigNumber((value < 0) ? value * (-1) : value, {
				precision: 2,
				degreeCase: "LOWER"
			}));

			relativeBlock.attr("class", function (d, i) {
				return "relative-block" + ((value > 0) ? " up-direction" : ((value < 0) ? " dn-direction" : ""));
			});

			relativeBlockText.text(formatedBigValue);

			enter.selectAll(".relative-arrow").remove();
			if (value > 0) {
				relativeBlock.append("path")
					.attr("class", "relative-arrow")
					//arrow1: M 100 25L 100 100L 25 100L 0 75L 55 75L 0 20L 20 0L 75 55L 75 0L 100 25z
					//arrow2: m45 45l-45 -45l30 0l45 45l-45 45l-30 0l45 -45z
					//arrow3: m0 20l20 -20l40 40l40 -40l20 20l-60 60l-60 -60z
					.attr("d", "m0 20l20 -20l40 40l40 -40l20 20l-60 60l-60 -60z")
					.attr("transform", " translate(" + (self.width * 0.94 - relativeBlockText.node().getBBox().width) + "," + (self.height * 0.163) + "), rotate(-180), scale(" + self.relativeArrowScale + ")");
			} else if (value < 0) {
				relativeBlock.append("path")
					.attr("class", "relative-arrow")
					.attr("d", "m0 20l20 -20l40 40l40 -40l20 20l-60 60l-60 -60z")
					.attr("transform", " translate(" + (self.width * 0.94 - self.relativeArrowScale * 120 - relativeBlockText.node().getBBox().width) + "," + (self.height * 0.097) + "), scale(" + self.relativeArrowScale + ")");
			}
		}
		setRelativeValue(relativeValue);

		var currentBlock = enter.append("g")
			.attr("class", "current-block");
		currentBlock.append("text")
			.attr("class", "current-value")
			.attr("x", self.currentX)
			.attr("y", self.currentY)
			.style({
				"text-anchor": "start",
				"font-size": self.currentFontSize + "px"
			});
		currentBlock.append("text")
			.attr("class", "current-date")
			.attr("x", self.currentDateX)
			.attr("y", self.currentDateY)
			.style({
				"opacity": 0,
				"text-anchor": "start",
				"font-size": self.currentDateFontSize + "px"
			});
		function setCurrentValue(item) {
			var currentBlockText = currentBlock.select(".current-value"),
				formatedBigValue = ns.format.formatBigNumber(item.items[0].value, {
				precision: item.items[0].format.precision,
				degreeCase: "LOWER"
			});

			currentBlockText.text(formatedBigValue);
			currentBlock.select(".current-date").text("on " + item.date.toLocaleDateString());
			
			if (currentBlock.node().getBBox().width > self.correctedCurrentBlockWidth) {
				currentBlockText.style("font-size", (self.currentFontSize * self.correctedCurrentBlockWidth / currentBlock.node().getBBox().width) + "px");
			}
		}
		setCurrentValue(lastRecord);
		
		enter.append("rect")
			.attr("class", "insetBorder")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width)
			.attr("height", self.height)
			.style("stroke-width", self.insetBorderWidth + "px");

		/*enter.append("rect")
			.attr("class", "outsetBorder")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width)
			.attr("height", self.height)
			.style("stroke-width", self.outsetBorderWidth + "px");*/
	};

	ns.gauges.TrendingGauge.prototype.resize = function (size) {
		this._applyMeasure(size);

		this.destroy();
		this.render();
	};
})(izenda);
