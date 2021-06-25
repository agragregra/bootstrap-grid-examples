const { src, dest, parallel, series, watch } = require('gulp'),
		sass         = require('gulp-sass')(require('sass')),
		browsersync  = require('browser-sync'),
		concat       = require('gulp-concat'),
		uglify       = require('gulp-uglify'),
		cleancss     = require('gulp-clean-css'),
		rename       = require('gulp-rename'),
		autoprefixer = require('gulp-autoprefixer'),
		notify       = require("gulp-notify"),
		rsync        = require('gulp-rsync');

// Scripts concat & minify

function js() {
	return src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(dest('app/js'))
	.pipe(browsersync.reload({ stream: true }))
};

function browserSync() {
	browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	})
};

function styles() {
	return src('app/sass/**/*.sass')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
};

function deploy() {
	return src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
};

function startwatch() {
	watch('app/sass/**/*.sass', styles);
	watch(['libs/**/*.js', 'app/js/common.js'], js);
	watch('app/*.html', browsersync.reload);
}

exports.styles = styles;
exports.js = js;
exports.default = parallel(styles, js, browserSync, startwatch);
