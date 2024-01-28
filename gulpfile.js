import pkg from 'gulp'
const { src, dest, parallel, series, watch } = pkg

import browserSync   from 'browser-sync'
import gulpSass      from 'gulp-sass'
import * as dartSass from 'sass'
const  sass          = gulpSass(dartSass)
import postCss       from 'gulp-postcss'
import cssnano       from 'cssnano'
import concat        from 'gulp-concat'
import uglify        from 'gulp-uglify'
import autoprefixer  from 'autoprefixer'
import rsyncModule   from 'gulp-rsync'

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
	})
}

function js() {
	return src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(dest('app/js'))
	.pipe(browserSync.stream())
};

function styles() {
	return src(['app/sass/**/*.sass'])
		.pipe(sass({ 'include css': true }))
		.pipe(postCss([
			autoprefixer({ grid: 'autoplace' }),
			cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
		]))
		.pipe(concat('main.min.css'))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function deploy() {
	return src('app/') // Без звёздочек!
		.pipe(rsyncModule({
			root: 'app/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			clean: true, // Mirror copy with file deletion
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch(['app/sass/**/*.sass'], { usePolling: true }, styles);
	watch(['libs/**/*.js', 'app/js/common.js'], { usePolling: true }, js);
	watch(['app/*.html'], { usePolling: true }).on('change', browserSync.reload)
}

export { styles, js, deploy }
export default series(styles, js, parallel(browsersync, startwatch))
