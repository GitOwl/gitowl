var gulp = require('gulp');  
var sass = require('gulp-sass');  
var browserSync = require('browser-sync');

gulp.task('sass', function () {  
	gulp.src('docs/themes/default/scss/app.scss')
		.pipe(sass({includePaths: ['scss']}))
		.pipe(gulp.dest('docs/themes/default/css'))
	    .pipe(browserSync.stream());
});

gulp.task('browser-sync', function() {  
	browserSync.init(["**/*"], {
		server: {
			baseDir: "./docs"
		},
		browser: '/opt/firefox_dev/firefox',
	});

	gulp.watch("**/*.scss", ['sass']);
	gulp.watch("**/*.html").on('change', browserSync.reload);
});

gulp.task('default', ['sass', 'browser-sync'], function () {  

});