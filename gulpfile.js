const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const promisedDel = require('promised-del');
const postcssCombineSelectors = require('postcss-combine-duplicated-selectors');
const postcssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rollup = require('gulp-better-rollup');
const rollupBabel = require('rollup-plugin-babel');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonjs = require('rollup-plugin-commonjs');
const cachebust = require('gulp-cache-bust');

const sass = require('sass');
const $ = gulpLoadPlugins();

const development = $.environments.development;
const production = $.environments.production;

const clean = () => promisedDel('docs/');
const cleanCSS = () => promisedDel('docs/**/*.css');
const cleanHTML = () => promisedDel('docs/**/*.html');
const cleanJS = () => promisedDel('docs/**/*.js');
const cleanJSON = () => promisedDel('docs/**/*.json');
const cleanSounds = () => promisedDel('docs/**/*.mp3');

const html = () =>
	gulp.src('src/pages/**/*.pug', { base: 'src/pages/' })
		.pipe($.pug())
		.pipe(development($.htmlBeautify({
			'indent_size': 1,
			'indent_char': '	',
			'wrap_line_length': 0,
			'end_with_newline': true
		})))
		.pipe(production($.htmlmin({ collapseWhitespace: true })))
		.pipe(production($.eol()))
		.pipe(gulp.dest('docs'));

const cacheBusting = () =>
    gulp.src('docs/**/*.html', {base: 'docs'})
        .pipe(cachebust())
		.pipe(gulp.dest('docs'));

const gulpSass = $.sass(sass);

const css = () =>
	gulp.src('src/**/*.scss', { base: 'src' })
		.pipe(development($.sourcemaps.init()))
		.pipe(gulpSass({
			indentType: 'space',
			indentWidth: 2
		}).on('error', gulpSass.logError))
		.pipe($.postcss([
			postcssImport(),
			postcssCombineSelectors({ removeDuplicatedProperties: true }),
			autoprefixer({ grid: true }),
			cssnano({ autoprefixer: false })
		]))
		.pipe($.rename((path) => {
			path.basename += '.min'
		}))
		.pipe(development($.sourcemaps.write('.')))
		.pipe($.eol())
		.pipe(gulp.dest('docs'));


const js = () =>
	gulp.src(['src/scripts/*.js', '!src/scripts/data.js', '!src/scripts/global.js', '!src/scripts/html2canvas.js', '!src/scripts/*.test.js'], { base: 'src' })
		.pipe(development($.sourcemaps.init()))
		.pipe(rollup({
			treeshake: false,
			plugins: [rollupResolve({ browser: true, preferBuiltins: false }), rollupCommonjs(), rollupBabel()]
		}, {
			format: 'iife'
		}))
		.pipe($.rename((path) => {
			path.basename += '.min'
		}))
		.pipe(development($.sourcemaps.write('.')))
		.pipe(production($.eol()))
		.pipe(gulp.dest('docs'));

const vendor = () =>
	gulp.src('src/scripts/html2canvas.js', { base: 'src' })
		.pipe($.rename((path) => { path.basename += '.min' }))
		.pipe(gulp.dest('docs'));

const json = () =>
    gulp.src('src/**/*.json', { base: 'src' })
        .pipe(gulp.dest('docs'));

const sounds = () =>
    gulp.src('src/**/*.mp3', { base: 'src' })
        .pipe(gulp.dest('docs'));

const build = gulp.series(gulp.parallel(css, js, vendor, html, json, sounds), cacheBusting);

const watch = () => {
	gulp.watch('src/**/*.scss', gulp.series(cleanCSS, css));
	gulp.watch('src/**/*.pug', gulp.series(cleanHTML, html, cacheBusting));
	gulp.watch('src/**/*.js', gulp.series(cleanJS, gulp.parallel(js, vendor)));
	gulp.watch('src/**/*.json', gulp.series(cleanJSON, json));
	gulp.watch('src/**/*.mp3', gulp.series(cleanSounds, sounds));
	// Rebuild JS when toolkit5e packages are recompiled
	gulp.watch('../../toolkit5e/packages/*/dist/**/*.js', gulp.series(cleanJS, gulp.parallel(js, vendor)));
};
		

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.rebuild = gulp.series(clean, build);
exports.default = gulp.series(clean, build, watch);
