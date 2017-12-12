(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.LinearGauge = function (options) {
		var gauge = this;

		var context = jq$.extend({
			segmentOffset: 0.4,
			mode: 'horizontal',
			defaultColor: '#50b6ff',
		}, options);

		var eventService = izenda.services.createPubSubService();

		function getParentControl() {
			var control = {};

			control.element = d3v4.select(context.parent);

			return control;
		}

		function createContainerControl(parent) {
			var control = {};

			var svgElement = parent.element.append('svg');
			var groupElement = svgElement.append('g');

			function getCalculatedState() {
				var width = context.size * 1.1075 + 20;
				var height = context.size * 0.35;

				if (context.mode === 'vertical') {
					height = [width, width = height][0];
				}

				return {
					width: width,
					height: height
				};
			}

			function applyState(state) {
				control.state = state;

				svgElement
					.attr('width', state.width)
					.attr('height', state.height);
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			}

			control.element = groupElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);
			eventService.subscribe('ModeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createTitleControl(parent) {
			var control = {};

			var divElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-title');
			var spanElement = divElement.append('span');

			function getCalculatedState() {
				var x = 10;
				var y = - 10;

				var width = context.mode === 'horizontal' ? context.size : context.size * 0.35;
				var fontSize = context.size * 0.0725;
				var text = context.title;

				return {
					x: x,
					y: y,
					width: width,
					fontSize: fontSize,
					text: text
				};
			}

			function applyState(state) {
				control.state = state;

				divElement
					.style('left', state.x + 'px')
					.style('top', state.y + 'px');

				spanElement
					.style('width', state.width + 'px')
					.style('font-size', state.fontSize + 'px')
					.attr('title', state.text)
					.text(state.text);
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();
				
				applyState(newState);
			}

			control.element = divElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);
			eventService.subscribe('ModeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createScaleControl(parent) {
			var control = {};

			var groupChartElement = parent.element.append('g')
				.attr('class', 'izenda-vis-gauge-chart');

			var groupXAxisElement = groupChartElement.append('g')
				.attr('class', 'izenda-vis-gauge-x izenda-vis-gauge-axis');

			var pathPointerElement = groupChartElement.append('path')
				.attr('class', 'izenda-vis-gauge-pointer')
				.attr('d', d3v4.symbol().type(d3v4.symbolTriangle));

			var groupAreasElement = groupChartElement.append('g')
				.attr('class', 'izenda-vis-gauge-areas');

			function getCalculatedState() {
				var step = 25;
				var minValue = 0;
				var maxValue = 100;

				var width = context.size;
				var height = context.size * 0.08;

				var widthMode = context.size * 1.1075 + 20;
				var heightMode = context.size * 0.35;

				if (context.mode === 'vertical') {
					heightMode = [widthMode, widthMode = heightMode][0];
				}

				var chartTransform = context.mode === 'horizontal' ? 'translate(' + 10 + ', ' + (context.size * 0.0575) + ')' : 'rotate(-90), translate(' + (context.size * (-1.1375)) + ', ' + (context.size * 0.225 + 10) + '), scale(1, -1)';

				var chartXAxisFontSize = context.size * 0.065;
				var chartXAxisTransform = context.mode === 'horizontal' ? '' : 'rotate(90), scale(-1, 1)';
				var chartXAxisDX = context.mode === 'horizontal' ? 0 : (context.size * -0.0575);
				var chartXAxisDY = context.mode === 'horizontal' ? (context.size * 0.0575) : (-0.01625 * context.size - 4);
				var chartXAxisTextAnchor = context.mode === 'horizontal' ? 'middle' : 'end';

				var tickValues = d3v4.range(minValue, maxValue + 1, step);
				var tickSize = context.size * 0.04;

				var value = context.data.items[0].value;
				if (context.data.items[0].format.isPercentage) {
					value *= 100;
				}
				var pointerTX = context.size * ((value > maxValue ? maxValue : (value < minValue ? minValue : value)) - minValue) / (maxValue - minValue);
				var pointerTY = context.size * 0.105;
				var pointerScale = context.size * 0.00375;

				return {
					step: step,
					minValue: minValue,
					maxValue: maxValue,
					tickValues: tickValues,
					tickSize: tickSize,
					width: width,
					height: height,
					widthMode: widthMode,
					heightMode: heightMode,
					chartXAxisDX: chartXAxisDX,
					chartXAxisDY: chartXAxisDY,
					chartXAxisFontSize: chartXAxisFontSize,
					chartXAxisTransform: chartXAxisTransform,
					chartXAxisTextAnchor: chartXAxisTextAnchor,
					chartTransform: chartTransform,
					pointerTX: pointerTX,
					pointerTY: pointerTY,
					pointerScale: pointerScale
				};
			}

			function applyState(state) {
				control.state = state;

				var x = d3v4.scaleLinear()
					.domain([state.minValue, state.maxValue])
					.range([0, state.width]);

				var y = d3v4.scaleLinear()
					.domain([0, 100])
					.range([state.height, 0]);

				var xAxis = d3v4.axisBottom()
					.scale(x)
					.tickValues(state.tickValues)
					.tickSize(state.tickSize, state.tickSize);

				var area = d3v4.area()
					.x(function (d) { return x(d.valueX); })
					.y0(state.height)
					.y1(function (d) { return y(d.valueY); });

				groupChartElement
					.attr('transform', state.chartTransform);

				groupXAxisElement
					.attr('transform', 'translate(0,' + (state.height * 1.09) + ')')
					.call(xAxis)
					.selectAll('text')
					.attr('dx', state.chartXAxisDX)
					.attr('dy', state.chartXAxisDY)
					.attr('transform', state.chartXAxisTransform)
					.style('font-size', state.chartXAxisFontSize + 'px')
					.style('text-anchor', state.chartXAxisTextAnchor);

				pathPointerElement.attr('transform', 'translate(' + state.pointerTX + ',' + state.pointerTY + '), scale(' + state.pointerScale + ')');

				function generateSegments(ranges, regions) {
					var segments = [];

					if (ranges.length < 2) {
						return [];
					}

					regions = regions.sort(function (a, b) {
						return a.value > b.value ? 1 : (a.value < b.value ? -1 : 0);
					});

					var currentY = 10, dY = 90 / (ranges.length + 1),
						currentColor = context.defaultColor;

					for (var i = regions.length - 1; i >= 0; --i) {
						if (regions[i].value <= state.minValue) {
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

						var leftBoundary = { valueX: ranges[i - 1] + context.segmentOffset, valueY: currentY }, rightBoundary;
						jq$.each(regionsInRange, function (index, region) {
							var rY = currentY + ((region.value - ranges[i - 1]) / (ranges[i] - ranges[i - 1])) * dY;
							rightBoundary = { valueX: region.value, valueY: rY };
							segments.push({ data: area([leftBoundary, rightBoundary]), color: currentColor });
							currentColor = region.color;
							leftBoundary = rightBoundary;
						});
						segments.push({ data: area([leftBoundary, { valueX: ranges[i] - context.segmentOffset, valueY: currentY + dY }]), color: currentColor });
						currentY += dY;
					}

					return segments;
				}

				var paths = groupAreasElement.selectAll('path')
					.data(generateSegments(state.tickValues, jq$.grep([context.data.low, context.data.high, context.data.target], function (n, i) { return (typeof n !== 'undefined'); })));
				paths.enter()
					.append('path')
					.attr('class', 'izenda-vis-gauge-area')
					.attr('fill', function (d) { return d.color; })
					.merge(paths)
					.attr('d', function (d) { return d.data; })
				paths.exit().remove();
			}


			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				if (context.animation) {
					textElement
						.transition()
						.duration(context.duration)
						.tween('d', function (d) {
							var ci = complexInterpolate(currentState, newState);
							return function (t) {
								applyState(ci(t));
							};
						});
				} else {
					applyState(newState);
				}
			}

			control.element = groupChartElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);
			eventService.subscribe('ModeChange', control.updateState);

			control.updateState();

			return control;
		}

		gauge.render = function (dynamic) {
			context.animation = false;
			context.duration = 1000;

			var parent = getParentControl();
			var container = createContainerControl(parent);
			createTitleControl(parent);
			createScaleControl(container);
		};

		gauge.setSize = function (size) {
			context.size = size;

			context.animation = false;

			eventService.publish('SizeChange', size);
		};

		gauge.changeMode = function (mode) {
			context.mode = mode;

			context.animation = false;

			eventService.publish('ModeChange', mode);
		};
	};
})(window.izenda || (window.izenda = {}));