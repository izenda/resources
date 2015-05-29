var izenda = izenda || {};

(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.LinearGauge = function (parent, title, mode, size, data) {
		ns.gauges.BaseGauge.call(this, parent, title, size);

		this.size = size;
		this.data = data;
		this.mode = mode || "horizontal";
		this.defaultColor = "#50b6ff";

		this._applyMeasure(size);
	}

	ns.gauges.LinearGauge.prototype = new ns.gauges.BaseGauge();

	ns.gauges.LinearGauge.prototype._applyMeasure = function (size) {
		this.width = size;
		this.height = size * 0.08;

		this.step = 25;
		this.minValue = 0;
		this.maxValue = 100;
		this.tickValues = d3.range(this.minValue, this.maxValue + 1, this.step);
		this.tickSize = size * 0.04;
		this.segmentOffset = 0.4;

		this.titleX = 10;
		this.titleY = size * 0.0575;
		this.titleFontSize = size * 0.0575;

		this.chartXAxisFontSize = size * 0.05;

		var value = this.data.items[0].value;
		this.pointerTX = size * ((value > this.maxValue ? this.maxValue : (value < this.minValue ? this.minValue : value)) - this.minValue) / (this.maxValue - this.minValue);
		this.pointerTY = size * 0.1;
		this.pointerScale = size * 0.004;
		
		if (this.mode === "horizontal") {
			this.widthMode = this.width + 20;
			this.heightMode = this.height + size * 0.2025;

			this.chartTransofrm = "translate(" + 10 + ", " + (size * 0.0575) + ")";

			this.chartXAxisTransform = "rotate(-90)";
		} else if (this.mode === "vertical") {
			this.widthMode = this.height + size * 0.145 + 20;
			this.heightMode = this.width + size * 0.1075 + 20;

			this.chartTransofrm = "rotate(-90), translate(" + (20 - this.heightMode) + ", " + (size * 0.225 + 10) + "), scale(1, -1)";

			this.chartXAxisTransform = "rotate(90), scale(-1, 1)";
		}		
	};

	ns.gauges.LinearGauge.prototype.render = function (dynamic) {
		var self = this;

		var svg = d3.select(self.parent).append("svg");
		var enter = svg.append("g").attr("class", "component");

		var gTitle = enter.append("g")
			.attr("class", "title");
		gTitle.append("text")
			.attr("x", self.titleX)
			.attr("y", self.titleY)
			.text(self.title)
			.style("font-size", self.titleFontSize + "px");

		var chart = enter.append("g")
			.attr("class", "chart");

		var titleWidthPlusOffset = gTitle.node().getBBox().width + 10;
		svg.attr("width", d3.max([self.widthMode, titleWidthPlusOffset]))
			.attr("height", self.heightMode);
		chart.attr("transform", self.chartTransofrm);

		var x = d3.scale.linear()
			.domain([self.minValue, self.maxValue])
			.range([0, self.width]);

		var y = d3.scale.linear()
			.domain([0, 100])
			.range([self.height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickValues(self.tickValues)
			.tickSize(self.tickSize, self.tickSize);

		var area = d3.svg.area()
			.x(function (d) { return x(d.valueX); })
			.y0(self.height)
			.y1(function (d) { return y(d.valueY); });

		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (self.height * 1.09) + ")")
			.call(xAxis)
				.selectAll("text")
				.style({
					"text-anchor": "end",
					"font-size": self.chartXAxisFontSize + "px"
				})
				.attr("dx", "-1em")
				.attr("dy", (self.width * 0.00075 - 0.85) + "em")
				.attr("transform", self.chartXAxisTransform);

		chart.append("path")
			.attr("class", "pointer")
			.attr("d", d3.svg.symbol().type("triangle-up"))
			.attr("transform", "translate(" + self.pointerTX + "," + self.pointerTY + "), scale(" + self.pointerScale + ")");
		
		function appendSegment(segment) {
			chart.append("path")
				.datum(segment.data)
				.attr("class", "area")
				.attr("d", area)
				.attr("fill", segment.color);
		}

		function generateSegments(ranges, regions) {
			var segments = [];

			if (ranges.length < 2) {
				return [];
			}

			regions = regions.sort(function (a, b) {
				return a.value > b.value ? 1 : (a.value < b.value ? -1 : 0);
			});

			var currentY = 10, dY = 90 / (ranges.length + 1), currentColor = self.defaultColor;

			for (var i = regions.length - 1; i >= 0; --i) {
				if (regions[i].value <= self.minValue) {
					currentColor = regions[i].color;
				}
			}

			for (var i = 1; i < ranges.length; ++i) {
				var regionsInRange = [];

				jq$.each(regions, function (index, region) {
					if (region.value == ranges[i - 1]) {
						currentColor = region.color;
					} else if (region.value > ranges[i - 1] && region.value < ranges[i]) {
						regionsInRange.push(region);
					}
				});
			
				var leftBoundary = { valueX: ranges[i - 1] + self.segmentOffset, valueY: currentY }, rightBoundary;
				jq$.each(regionsInRange, function (index, region) {
					var rY = currentY + ((region.value - ranges[i - 1]) / (ranges[i] - ranges[i - 1])) * dY;
					rightBoundary = { valueX: region.value, valueY: rY };
					segments.push({ data: [leftBoundary, rightBoundary], color: currentColor });
					currentColor = region.color;
					leftBoundary = rightBoundary;
				});
				segments.push({ data: [leftBoundary, { valueX: ranges[i] - self.segmentOffset, valueY: currentY + dY }], color: currentColor });
				currentY += dY;
			}

			return segments;
		}

		jq$.each(generateSegments(self.tickValues, jq$.grep([self.data.low, self.data.high, self.data.target], function (n, i) { return (typeof n != 'undefined'); })), function (index, segment) {
			appendSegment(segment);
		});
	};

	ns.gauges.LinearGauge.prototype.resize = function (size) {
		this.destroy();
		this.size = size;
		this._applyMeasure(size);
		this.render(false);
	};

	ns.gauges.LinearGauge.prototype.changeMode = function (mode) {
		if (this.mode !== mode) {
			this.destroy();
			this.mode = mode;
			this._applyMeasure(this.size);
			this.render(false);
		}
	};
})(izenda);