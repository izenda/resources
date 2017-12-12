(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.SimpleGauge = function (options) {
		var gauge = this;

		var context = jq$.extend({

		}, options);

		var eventService = izenda.services.createPubSubService();

		function getColorByRegions(value, regions) {
			if (regions.length === 0) {
				return 'rgba(0, 0, 0, 0.8)';
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
				return jsgradient.jsgradient('#101010', endRegion.color, Math.floor(value / endRegion.value * 100));
			} else if (!endRegion) {
				return startRegion.color;
			} else {
				return jsgradient.jsgradient(startRegion.color, endRegion.color, Math.floor((value - startRegion.value) / (endRegion.value - startRegion.value) * 100));
			}
		}

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
				var width = context.size;
				var height = context.size;

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

			control.updateState();

			(function initTooltip() {
				var services = window.ReportingServices;
				var front = parent.element.append('div')
					.attr('class', 'izenda-vis-gauge-front');
				var formatedValue = izenda.utils.number.format(context.data.items[0].value, context.data.items[0].format);
				front.on('mouseover', function (e) {
					services.showTip(formatedValue, {
						element: front.node(),
						style: 'sharp',
						mode: 'tooltip',
						tipStyle: izenda.utils.string.format('border: none; box-shadow: 2px 2px 5px 0px #7c7c7c; padding: 2px; font-family: "Open Sans Condensed", sans-serif; font-size: {fontSize}px; padding: 0px {padding}px',
							{
								fontSize: context.size * 0.43 / 3,
								padding: context.size * 0.08 / 3
							})
					});
				});
				front.on('mouseout', function (e) {
					services.hideTip();
				});
			})();

			return control;
		}

		function createTitleControl(parent) {
			var control = {};

			var divElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-title');
			var spanElement = divElement.append('span');

			function getCalculatedState() {
				var width = context.size;
				var fontSize = context.size * 0.23;
				var text = context.title;
				return {
					width: width,
					fontSize: fontSize,
					text: text
				};
			}

			function applyState(state) {
				control.state = state;

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

			control.updateState();

			return control;
		}

		function createValueControl(parent) {
			var control = {};

			var groupElement = parent.element.append('g')
				.attr('class', 'izenda-vis-gauge-value');
			var textElement = groupElement.append('text');

			function getCalculatedState() {
				var item = context.data.items[0];

				var x = 0;
				var y = context.size * 0.67;
				var fontSize = context.size * (item.format.isPercentage ? 0.38 : 0.45);
				var color = getColorByRegions(item.value, jq$.grep([context.data.low, context.data.high, context.data.target], function (n, i) { return (typeof n !== 'undefined'); }));
				var text = izenda.utils.number.formatBigNumber(item.value, item.format);
				return {
					x: x,
					y: y,
					fontSize: fontSize,
					color: color,
					text: text
				};
			}

			function tweenText() {
				var currentValue = 0;
				var valueToCalcPower = context.data.items[0].value;
				if (context.data.items[0].format.isPercentage) {
					valueToCalcPower *= 100;
				}
				jq$.extend(true, context.data.items[0].format, {
					powerIndex: izenda.utils.number.getPowerIndex(valueToCalcPower)
				});
				textElement.datum(context.data.items[0].value);
				textElement
					.transition()
					.duration(context.duration)
					.on('start', function () {
						d3v4.active(this)
							.tween('text',
								function(a) {
									var i = d3v4.interpolate(currentValue, a);
									currentValue = i(0);
									return function(t) {
										currentValue = i(t);
										textElement.text(izenda.utils.number.formatBigNumber(i(t), context.data.items[0].format));
									}
								});
					})
					.on('end', function () {
						textElement.text(izenda.utils.number.formatBigNumber(context.data.items[0].value, context.data.items[0].format));
					});
			}

			function applyState(state) {
				control.state = state;

				textElement
					.attr('x', state.x)
					.attr('y', state.y)
					.style('font-size', state.fontSize + 'px')
					.style('fill', state.color)
					.text(state.text);
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				if (context.texttween) {
					applyState(newState);
					tweenText();
				} else {
					applyState(newState);
				}
			};

			control.element = groupElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createSubTitleControl(parent) {
			var control = {};

			var divElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-subtitle');
			var spanElement = divElement.append('span');

			function getCalculatedState() {
				var x = 0;
				var y = context.size * 0.74;
				var width = context.size;
				var fontSize = context.size * 0.14;
				var text = context.subtitle;
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
			};

			control.element = divElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		gauge.render = function (dynamic) {
			context.animation = dynamic;
			context.texttween = dynamic;
			context.duration = 1000;

			var parent = getParentControl();
			var container = createContainerControl(parent);
			createTitleControl(parent);
			createValueControl(container);
			createSubTitleControl(parent);
		};

		gauge.destroy = function () {
			jq$(context.parent).empty();
		};

		gauge.setSize = function (size) {
			context.size = size;

			context.animation = false;
			context.texttween = false;

			eventService.publish('SizeChange', size);
		};
	};
})(window.izenda || (window.izenda = {}));