var gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	rimraf = require('rimraf');

gulp.task('sass', function () {  
	gulp.src('docs/themes/default/scss/style.scss')
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


gulp.task('gitowl', ['clean'], function () {  
	// 1. Copy src/* to test/
	gulp.src('./src/**/*').pipe(gulp.dest('test'));
	// 2. Copy examples/gitowl/* to test/
	gulp.src('./examples/gitowl/**/*').pipe(gulp.dest('test'));
	// 3. Copy themes/* to test/
	gulp.src('./themes/**/*').pipe(gulp.dest('test/themes'));
});


gulp.task('basic', function () {  
	// 1. Copy src/* to test/
	// 2. Copy examples/basic/* to test/
	// 3. Copy themes/* to test/

});

gulp.task('advanced', function () {  
	// 1. Copy src/* to test/
	// 2. Copy examples/advanced/* to test/
	// 3. Copy themes/* to test/

});



gulp.task('docs', function () {  
	// 1. Clean docs/*
	// 2. Copy test/* to docs/
});


gulp.task('clean', function(cb) {
   	rimraf('./test/*', cb)
});


gulp.task('test', function() {  
	browserSync.init(["**/*"], {
		server: {
			baseDir: "./test"
		},
		browser: '/opt/firefox_dev/firefox',
	});

	gulp.watch("**/*.scss", ['sass']);
	gulp.watch("**/*.html").on('change', browserSync.reload);
});