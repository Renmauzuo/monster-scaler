const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const promisedDel = require('promised-del');
const postcssCombineSelectors = require('postcss-combine-duplicated-selectors');
const postcssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rollup = require('gulp-better-rollup');
const rollupBabel = require('rollup-plugin-babel');

const $ = gulpLoadPlugins();

const development = $.environments.development;
const production = $.environments.production;

const clean = () => promisedDel('dist');
const cleanCSS = () => promisedDel('dist/**/*.css');
const cleanHTML = () => promisedDel('dist/**/*.html');
const cleanJS = () => promisedDel('dist/**/*.js');

const html = () =>
	gulp.src('src/**/*.pug', { base: 'src' })
		.pipe($.pug())
		.pipe(development($.htmlBeautify({
			'indent_size': 1,
			'indent_char': '	',
			'wrap_line_length': 0,
			'end_with_newline': true
		})))
		.pipe(production($.htmlmin({ collapseWhitespace: true })))
		.pipe(production($.eol()))
		.pipe(gulp.dest('dist'));

const css = () =>
	gulp.src('src/**/*.scss', { base: 'src' })
		.pipe(development($.sourcemaps.init()))
		.pipe($.sass({
			indentType: 'space',
			indentWidth: 2
		}).on('error', $.sass.logError))
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
		.pipe(gulp.dest('dist'));


const js = () =>
	gulp.src('src/**/*.js', { base: 'src' })
		.pipe(development($.sourcemaps.init()))
		.pipe(rollup({
			treeshake: false,
			plugins: [rollupBabel()]
		}, {
			format: 'cjs'
		}))
		.pipe($.rename((path) => {
			path.basename += '.min'
		}))
		.pipe(development($.sourcemaps.write('.')))
		.pipe(production($.eol()))
		.pipe(gulp.dest('dist'));

const build = gulp.parallel(css, js, html);

const watch = () => {
	gulp.watch('src/**/*.scss', gulp.series(cleanCSS, css));
	gulp.watch('src/**/*.pug', gulp.series(cleanHTML, html));
	gulp.watch('src/**/*.js', gulp.series(cleanJS, js));
};
		

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.rebuild = gulp.series(clean, build);
exports.default = gulp.series(clean, build, watch);
