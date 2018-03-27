var gulp = require('gulp'),
	sass = require('gulp-sass'),
	bs   = require('browser-sync'),
	fs   = require('fs-extra'),
	argv = require('yargs').argv;

// gulp.task('sass', function () {  
// 	gulp.src('docs/themes/default/scss/style.scss')
// 		.pipe(sass({includePaths: ['scss']}))
// 		.pipe(gulp.dest('docs/themes/default/css'))
// 		.pipe(bs.stream());
// });

// gulp.task('default', ['sass', 'bs-docs'], function () {  
// 	//
// });

gulp.task('bs-docs', function() {  
	bs.init(["**/*"], {
		server: {
			baseDir: "./docs"
		},
		browser: '/opt/firefox_dev/firefox',
	});

	gulp.watch("./docs/**/*").on('change', bs.reload);
});

gulp.task('default', ['sass', 'watch'], function () {  
	// Call 'theme' and 'watch'
});

gulp.task('sass', function () {  
	// TODO: Pass argument on watch
	let theme = (argv.theme == undefined) ? 'default' : argv.theme
	
	gulp.src('./themes/'+theme+'/scss/style.scss')
		.pipe(sass({includePaths: ['scss']}))
		.pipe(gulp.dest('./themes/'+theme+'/css'))
		.pipe(gulp.dest('./temp/themes/'+theme+'/css'))
		.pipe(bs.stream());

});

// $ gulp watch --theme 'default'
gulp.task('watch', function() {  
	let theme = (argv.theme == undefined) ? 'default' : argv.theme

	bs.init(["**/*"], {
		server: {
			baseDir: "./temp"
		},
		browser: '/opt/firefox_dev/firefox',
	});

	gulp.watch("**/*.scss", ['sass']);
	gulp.watch("./src/**/*", ['src']);
	// TODO: Watch examples
	gulp.watch("**/*.html").on('change', bs.reload);

});

gulp.task('gitowl', function(){ copyToTemp('gitowl') });
gulp.task('basic', function(){ copyToTemp('basic') });
gulp.task('advanced', function(){ copyToTemp('advanced') });

// $ gulp active --example 'basic'
gulp.task('active', function(){ 
	
	if(argv.example != undefined) {
		let theme = (argv.theme == undefined) ? 'default' : argv.theme
		copyToTemp(argv.example, argv.theme) 
	}
	 else {
		console.log(" - ERROR: The example argument is missing.")
		console.log("   $ gulp active --example 'basic'")
	}
});

// $ gulp docs 
//  - Call bs-docs
// $ gulp docs --theme 'default' --example 'basic'
//  - Copy to docs exaple basic and theme default
gulp.task('docs', function(){ 
	fs.removeSync('./docs/*')
	console.log(" - INFO: ./docs/* has been remove")

	gulp.src('./temp/**/*').pipe(gulp.dest('./docs'))
	console.log(" - INFO: ./temp/**/* has been copied to ./docs")
});

gulp.task('clean', function() {
	fs.removeSync('./temp')
	console.log(" - INFO: ./temp has been remove")
});


gulp.task('src', function() {
	gulp.src('./src/**/*').pipe(gulp.dest('./temp'))
	console.log(" - INFO: ./src/* has been copied to ./temp")
});


function copyToTemp(folder, theme = 'default'){
	// TODO: Fix theme copy

	try {
		fs.accessSync('examples/'+folder+'/')

  		fs.removeSync('./temp')
		console.log(" - INFO: ./temp has been remove")

		gulp.src('./src/**/*').pipe(gulp.dest('./temp'))
		console.log(" - INFO: ./src/* has been copied to ./temp")

		gulp.src('./examples/'+folder+'/**/*').pipe(gulp.dest('./temp'))
		console.log(" - INFO: ./examples/"+folder+"/* has been copied to ./temp")

		gulp.src('./themes/**/*').pipe(gulp.dest('temp/themes'))
		console.log(" - INFO: ./themes/**/* has been copied to ./temp/themes")

		console.log(" - INFO: Run 'gulp watch'")

	} catch(e) {
		console.log(" - ERROR: './examples/"+folder+"' doesn't exist!")

	}
}

// function sass(theme){
// 	console.log(" - INFO: Theme sass has been changed")
// 	gulp.src('./themes/'+theme+'/scss/style.scss')
// 		.pipe(sass({includePaths: ['scss']}))
// 		.pipe(gulp.dest('./themes/'+theme+'/css'))
// 		.pipe(gulp.dest('./temp/themes/'+theme+'/css'))
// 		.pipe(bs.stream());
// }

function copyTheme(theme){
	gulp.src('./themes/**/*').pipe(gulp.dest('temp/themes'))
	console.log(" - INFO: ./themes/**/* has been copied to ./temp/themes")
}