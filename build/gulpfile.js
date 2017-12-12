/// <binding BeforeBuild='[BUILD-ALL]' ProjectOpened='[WATCH]' />
const gulp = require('gulp');
const asyncStream = require('async');
const mergeStream = require('merge-stream');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const wrap = require('gulp-wrap');
const sass = require('gulp-sass');
const replace = require('gulp-replace');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const glec = require('gulp-line-ending-corrector');

// we're running gulp build using website root folder as root directory 
// (look at the gulp "--cwd" parameter)
const RESOURCES_FOLDER = './Resources';
const FOLDER_NODE_MODULES = './node_modules';
const FOLDER_SRC = `${RESOURCES_FOLDER}/src`;
const FOLDER_DIST = `${RESOURCES_FOLDER}/components`;
const FOLDER_DIST_VENDOR = `${FOLDER_DIST}/vendor`;

////////////////////// APPLICATION //////////////////////

const BABEL_CONFIG = {
	presets: [[
		'env', {
			modules: false,
			useBuiltIns: true,
			targets: {
				browsers: [
					'> 1%',
					'last 2 versions',
					'Firefox ESR'
				]
			}
		}]]
};

/**
 * Build all
 */
gulp.task('[BUILD-ALL]', ['[build-vendor]', '[build-application]'], () => { });

gulp.task('[WATCH]', ['[BUILD-ALL]'], () => {
	var fixDestPath = (path) => path.endsWith('-es6.js')
		? path.substr(0, path.length - '-es6.js'.length) + '.js'
		: path;

	return watch([
		FOLDER_SRC + '/**/*.*',
		`!${FOLDER_SRC}/vendor/**/*`,
		`!${FOLDER_SRC}/**/*.scss`
	], function (file) {
		// all examples for the file './Resources/src/dashboard/components/dashboard/component-es6.js'
		const fileName = file.basename;                                               // 'component-es6.js'
		const fileNameDest = fixDestPath(fileName);                                   // 'component.js'
		const fileExt = file.extname;                                                 // '.js'
		const commonPathPart = file.relative.split('\\').join('/');                   // 'dashboard/components/dashboard/component-es6.js'

		const fileRelativeSrcPath = `${FOLDER_SRC}/${commonPathPart}`;                // './Resources/src/dashboard/components/dashboard/component-es6.js'

		const fileRelativeDestPath = `${FOLDER_DIST}/${fixDestPath(commonPathPart)}`; // './Resources/components/dashboard/components/dashboard/component.js'
		const fileRelativeDestDir = fileRelativeDestPath.substr(0,
			fileRelativeDestPath.length - fileNameDest.length - 1);                   // './Resources/components/dashboard/components/dashboard'

		// Remove compiled js file if source file was deleted
		if (file.event === 'unlink') {
			gutil.log(gutil.colors.red(`Delete ${fileRelativeDestPath}`));
			return gulp
				.src([fileRelativeDestPath], { read: false })
				.pipe(clean());
		}

		gutil.log(gutil.colors.green(`Build ${fileRelativeSrcPath} to ${fileRelativeDestPath}`));
		var sourcePipe = gulp.src(fileRelativeSrcPath)
			.pipe(plumber(function (error) {
				// pipe error handling
				const msg = error.codeFrame.replace(/\n/g, '\n    ');
				gutil.log('|- ' + gutil.colors.bgRed.bold('Build Error in ' + error.plugin));
				gutil.log('|- ' + gutil.colors.bgRed.bold(error.message));
				gutil.log('|- ' + gutil.colors.bgRed('>>>'));
				gutil.log('|\n    ' + msg + '\n           |');
				gutil.log('|- ' + gutil.colors.bgRed('<<<'));
				gutil.log(gutil.colors.red(`Delete ${fileRelativeDestPath}`));
				return gulp
					.src([fileRelativeDestPath], { read: false })
					.pipe(clean());
			}));
		switch (fileExt) {
			case '.js': {
				if (fileName.endsWith('-es6.js')) {
					// compile and rename es6 source files
					sourcePipe = sourcePipe
						.pipe(rename(function (path) {
							if (path.basename.endsWith('-es6')) {
								// rename filename-es6 -> filename
								path.basename = path.basename.substring(0, path.basename.length - 4);
								path.extname = '.js';
							}
						}))
						.pipe(sourcemaps.init({ loadMaps: true }))
						.pipe(babel(BABEL_CONFIG))
						.pipe(sourcemaps.write()); // inline source map
				}
				sourcePipe = sourcePipe.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}));
				break;
			}
			case '.css':
			case '.html':
				sourcePipe = sourcePipe.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}));
				break;
		}
		// at the end - copy to destignation
		sourcePipe = sourcePipe.pipe(gulp.dest(fileRelativeDestDir));
		return sourcePipe;
	});
});

/**
 * Build only application default task
 */
gulp.task('[build-application]', ['copy-application', 'build-application'], () => { });

/**
 * Copy application files
 */
gulp.task('copy-application', ['clean-application'], () => {
	return gulp.src([
		`${FOLDER_SRC}/**/*`,
		`!${FOLDER_SRC}/vendor/**/*`,
		`!${FOLDER_SRC}/**/*-es6.js`,
		`!${FOLDER_SRC}/**/*.scss`])
		.pipe(gulp.dest(FOLDER_DIST));
});

/**
 * Build and copy to dist dir es6 js modules.
 */
gulp.task('build-application', ['clean-application'], () => {
	return gulp
		.src(FOLDER_SRC + '/**/*-es6.js')
		.pipe(rename(function (path) {
			path.basename = path.basename.substring(0, path.basename.length - 4);
			path.extname = '.js';
		}))
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(babel(BABEL_CONFIG))
		.pipe(sourcemaps.write()) // inline source map
		//.pipe(sourcemaps.write('.')) // separate source map file
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(FOLDER_DIST));
});

/**
 * Clean only application
 */
gulp.task('clean-application', [], () => {
	return gulp.src([
		`${FOLDER_DIST}/*`,
		`!${FOLDER_DIST}/vendor`
	], { read: false })
		.pipe(clean());
});

////////////////////// VENDOR //////////////////////

/**
 * Build vendor libs
 */
gulp.task('[build-vendor]', ['clean-vendor', 'copy-vendor', 'angular', 'bootstrap', 'jquery', 'babel-polyfill', 'ion-range-slider',
	'jquery-minicolors', 'css-parser', 'moment', 'require', 'resize-sensor'], () => { });

/**
 * Clean only application
 */
gulp.task('clean-vendor', [], () => {
	return gulp.src([`${FOLDER_DIST}/vendor/*`], { read: false }).pipe(clean());
});

/**
 * Copy to dist dir everything except es6 js modules.
 */
gulp.task('copy-vendor', ['clean-vendor'], () => {
	return gulp
		.src([`${FOLDER_SRC}/vendor/**/*`, `!${FOLDER_SRC}/**/*.es6.js`, `!${FOLDER_SRC}/**/*.scss`], { nodir: true })
		.pipe(gulp.dest(`${FOLDER_DIST}/vendor`));

});

/**
 * Copy babel polyfill (required for transplied es6 modules)
 */
gulp.task('babel-polyfill', ['clean-vendor'], () => {
	return gulp.src(`${FOLDER_NODE_MODULES}/babel-polyfill/dist/polyfill.min.js`)
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/babel`));
});

/**
 * Prepare jquery and jqueryui libs
 */
gulp.task('jquery', ['clean-vendor'], () => {
	const jquerySrc = `${FOLDER_NODE_MODULES}/jquery`;
	const jqueryUiSrc = `${FOLDER_NODE_MODULES}/jquery-ui-dist`;

	const imagesStream = gulp.src(`${jqueryUiSrc}/images/*`)
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jquery/images`));
	const cssStream = gulp.src(`${jqueryUiSrc}/jquery-ui.css`)
		.pipe(replace('url("images/', 'url("###RS###extres=components.vendor.jquery.images.'))
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jquery`));

	const jqueryStream = gulp.src(`${jquerySrc}/dist/jquery.min.js`)
		.pipe(wrap(`
// prevent using external require
(function (requirejs, require, define) {
<%= contents %>
})();
`,
			{}, { parse: false }))
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(rename('jquery-1.11.3.min.js'))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jquery`));

	const jqueryUiStream = gulp.src(`${jqueryUiSrc}/jquery-ui.min.js`)
		.pipe(wrap(`
// prevent using external require
(function (requirejs, require, define) {
<%= contents %>
})();
`,
			{}, { parse: false }))
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(rename('jquery-ui.min.js'))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jquery`));

	return mergeStream(imagesStream, cssStream, jqueryStream, jqueryUiStream);
});

/**
 * Prepare angular lib
 */
gulp.task('angular', ['clean-vendor'], () => {
	const angularSrc = `${FOLDER_NODE_MODULES}/angular`;

	// angular.min
	const angularSrcStream = gulp.src(`${angularSrc}/angular.min.js`)
		.pipe(wrap(`
(function () {
	var $$angularTemp = window.angular;
	var angular = window.angular = undefined;
	<%= contents %>
	window.izendaAngular=window.angular;
	window.izendaAngular.isIzendaAngular=true;
	if (typeof izendaRequire == 'object' && izendaRequire.define.amd) 
		izendaRequire.define(["jquery"], function (jQuery) {
			return window.izendaAngular;
		});
	if (typeof ($$angularTemp)!=="undefined")
		window.angular=$$angularTemp;
})();`,
			{}, { parse: false }))
		.pipe(hideAndRevealJquery())
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/angular`));

	// angular-cookies
	const angularCookiesSrc = `${FOLDER_NODE_MODULES}/angular-cookies`;
	const angularCookiesStream = gulp.src(`${angularCookiesSrc}/angular-cookies.min.js`)
		.pipe(wrap(`
izendaRequire.define(['angular'], function(angular) {
<%= contents %>
});
`,
			{}, { parse: false }))
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/angular`));

	// angular-csp
	const angularCssStream = gulp.src(`${angularSrc}/angular-csp.css`)
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/angular`));
	return mergeStream(angularSrcStream, angularCookiesStream, angularCssStream);
});

/**
 * Prepare and compile bootstrap lib
 */
gulp.task('bootstrap', ['clean-vendor'], (callback) => {
	const bootstrapSassSrc = `${FOLDER_NODE_MODULES}/bootstrap-sass`;
	const bootstrapSrc = `${FOLDER_NODE_MODULES}/bootstrap/dist`;
	const datetimePickerSrc = `${FOLDER_NODE_MODULES}/eonasdan-bootstrap-datetimepicker/build`;

	asyncStream.series([

		// clean src/vendor/bootstrap/scss folder
		function (next) {
			console.log('clean bootstrap sass...');
			gulp.src(`${FOLDER_SRC}/vendor/bootstrap/scss/*`, { read: false })
				.pipe(clean())
				.on('finish', next);
		},

		// copy and rename scss into src/vendor/bootstrap/scss
		function (next) {
			console.log('copy bootstrap sass...');
			gulp.src(`${bootstrapSassSrc}/assets/stylesheets/**/*.scss`)
				.pipe(rename(function (path) {
					path.basename = path.basename.substring(1);
				}))
				.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}))
				.pipe(gulp.dest(`${FOLDER_SRC}/vendor/bootstrap/scss`))
				.on('finish', next);
		},

		// compile scss
		function (next) {
			console.log('compile bootstrap sass...');
			gulp.src(`${FOLDER_SRC}/vendor/bootstrap/izenda-bootstrap.scss`)
				.pipe(sass().on('error', sass.logError))
				.pipe(rename('bootstrap.min.css'))
				.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}))
				.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/bootstrap/css`))
				.on('finish', next);
		},

		// bootstrap js
		function (next) {
			console.log('prepare bootstrap js...');
			gulp.src(`${bootstrapSrc}/js/bootstrap.min.js`)
				.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}))
				.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/bootstrap/js`))
				.on('finish', next);
		},

		// other bootstrap resources
		function (next) {
			console.log('copy other bootstrap resources...');
			gulp.src([`${bootstrapSrc}/fonts/*`])
				.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/bootstrap/fonts`))
				.on('finish', next);
		},

		// datetimepicker js
		function (next) {
			console.log('prepare datetimepicker js...');
			gulp.src(`${datetimePickerSrc}/js/bootstrap-datetimepicker.min.js`)
				.pipe(hideAndRevealRequire())
				.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}))
				.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/bootstrap/js`))
				.on('finish', next);
		},

		function (next) {
			console.log('copy other datetimepicker resources...');
			gulp.src([`${datetimePickerSrc}/css/bootstrap-datetimepicker.min.css`])
				.pipe(glec({
					eolc: 'CRLF',
					encoding: 'utf8'
				}))
				.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/bootstrap/css`))
				.on('finish', next);
		}
	], callback);
});

/**
 * Prepare ion-rangeslider lib
 */
gulp.task('ion-range-slider', ['clean-vendor'], () => {
	const src = `${FOLDER_NODE_MODULES}/ion-rangeslider`;

	const jsStream = gulp.src(`${src}/js/ion.rangeSlider.min.js`)
		.pipe(hideAndRevealRequire())
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/ionrangeslider`));

	const cssStream = gulp.src([`${src}/css/ion.rangeSlider.css`, `${src}/css/ion.rangeSlider.skinHTML5.css`])
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/ionrangeslider`));

	return mergeStream(jsStream, cssStream);
});

/**
 * Prepare jquery-minicolors lib
 */
gulp.task('jquery-minicolors', ['clean-vendor'], () => {
	const src = `${FOLDER_NODE_MODULES}/jquery-minicolors`;

	const jsStream = gulp.src(`${src}/jquery.minicolors.min.js`)
		.pipe(hideAndRevealRequire())
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jquery-minicolors`));

	const cssStream = gulp.src([`${src}/jquery.minicolors.css`])
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jquery-minicolors`));

	return mergeStream(jsStream, cssStream);
});

/**
 * Css parser lib
 */
gulp.task('css-parser', ['clean-vendor'], () => {
	const src = `${FOLDER_NODE_MODULES}/jscssp`;

	return gulp.src(`${src}/cssParser.js`)
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/jscssp`));
});

gulp.task('moment', ['clean-vendor'], () => {
	const src = `${FOLDER_NODE_MODULES}/moment`;

	return gulp.src(`${src}/min/moment-with-locales.min.js`)
		.pipe(hideAndRevealRequire())
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/moment`));
});

gulp.task('resize-sensor', ['clean-vendor'], () => {
	const src = `${FOLDER_NODE_MODULES}/css-element-queries`;

	return gulp.src(`${src}/src/ResizeSensor.js`)
		.pipe(hideAndRevealRequire())
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/resize-sensor`));
});

gulp.task('require', ['clean-vendor'], () => {
	const src = `${FOLDER_NODE_MODULES}/requirejs`;

	return gulp.src(`${src}/require.js`)
		.pipe(wrap(`
var izendaRequire = (function () {
<%= contents %>
	return {
		require: require,
		requirejs: requirejs,
		define: define
	};
}());
`
			, {}, { parse: false }))
		.pipe(glec({
			eolc: 'CRLF',
			encoding: 'utf8'
		}))
		.pipe(gulp.dest(`${FOLDER_DIST_VENDOR}/requirejs`));
});

/**
 * Change the jquery global variables for a while and then return it after script execution has completed.
 * @returns {string} wrapped text
 */
function hideAndRevealJquery() {
	return wrap(`
window.$$jQueryTemp = window.jQuery;
window.$$$Temp = window.$;
window.$ = window.jq$;
window.jQuery = window.jq$;
<%= contents %>
if (typeof(window.$$jQueryTemp) !== "undefined") {
	window.jQuery = window.$$jQueryTemp;
	delete window.$$jQueryTemp;
}
if (typeof(window.$$$Temp) !== "undefined") {
	window.$ = window.$$$Temp;
	delete window.$$$Temp;
}`,
		{}, { parse: false });
}

/**
 * Change default global require variables.
  * @returns {string} wrapped text
 */
function hideAndRevealRequire() {
	return wrap(`
(function (requirejs, require, define) {
<%= contents %>
})(typeof(izendaRequire) === 'object' ? izendaRequire.requirejs : undefined,
	typeof(izendaRequire) === 'object' ? izendaRequire.require : undefined,
	typeof(izendaRequire) === 'object' ? izendaRequire.define : undefined);`,
		{},
		{ parse: false });
}
