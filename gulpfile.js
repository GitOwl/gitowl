 "use strict"

var gulp  = require('gulp'),
	sass  = require('gulp-sass'),
	bs    = require('browser-sync'),
	fs    = require('fs-extra'),
	argv  = require('yargs').argv,
	storage = require('gulp-storage')(gulp);

gulp.storage.create('root', 'config.json')


gulp.task('default', ['watch'], function () {  
	// Call 'temp' and 'watch'

	console.log("THEME: "+gulp.storage.get('theme'))
	console.log("DATA: "+gulp.storage.get('data'))
})

gulp.task('sass', function () {  
	let theme = (argv.theme != undefined) ? argv.theme : gulp.storage.get('theme')
	console.log("SASS: "+theme)
	gulp.src('./src/themes/'+theme+'/scss/style.scss')
		.pipe(sass({includePaths: ['scss']}))
		.pipe(gulp.dest('./src/themes/'+theme+'/css'))
		.pipe(bs.stream());

})

// $ gulp watch --theme 'default' --data 'basic'
gulp.task('watch', function() {  
	let theme = (argv.theme == undefined) ? gulp.storage.get('theme') : argv.theme
	let folder = (argv.data == undefined) ? gulp.storage.get('data')  : argv.data

	bs.init(["./src/**/*"], {
		server: {
			baseDir: "./temp"
		},
		browser: '/opt/firefox_dev/firefox',
	})

	gulp.watch("./src/**/*.scss", ['sass']);	
	gulp.watch("./src/**/*", ['temp']);
	//gulp.watch("**/*.html").on('change', bs.reload);

})

gulp.task('watch-docs', function() {  
	bs.init(["**/*"], {
		server: {
			baseDir: "./docs"
		},
		browser: '/opt/firefox_dev/firefox',
	})

	gulp.watch("./docs/**/*").on('change', bs.reload);
})

// $ gulp docs 
//  - Call watch-docs
// $ gulp docs --theme 'default' --example 'basic'
//  - Copy to docs exaple basic and theme default
gulp.task('docs', function(){ 
	fs.removeSync('./docs/*')
	console.log(" - INFO: ./docs/* has been remove")

	gulp.src('./temp/**/*').pipe(gulp.dest('./docs'))
	console.log(" - INFO: ./temp/**/* has been copied to ./docs")
})

gulp.task('clean', function() {
	fs.removeSync('./temp')
	console.log(" - INFO: ./temp has been remove")
})

// $ gulp active --data 'basic' --theme 'default'
gulp.task('active', function(){ 
	
	if(argv.data != undefined) {
		let theme = (argv.theme == undefined) ? 'default' : argv.theme
		store(theme, argv.data)

		gulp.start('temp')
	} else {
		console.log(" - ERROR: The example argument is missing.")
		console.log("   Example: $ gulp active --data 'basic'")
	}
})


gulp.task('temp', function() {

	// FIX: theme copy
	let theme = gulp.storage.get('theme')
	let folder = gulp.storage.get('data')
	
	try {
		fs.accessSync('./src/data/'+folder+'/')

		gulp.start('clean')

		gulp.src(['./src/app/**/*']).pipe(gulp.dest('./temp'))
		console.log(" - INFO: ./src/app/**/* has been copied to ./temp")

		gulp.src('./src/data/'+folder+'/**/*').pipe(gulp.dest('./temp'))
		console.log(" - INFO: ./data/"+folder+"/* has been copied to ./temp")

		gulp.src('./src/themes/**/*').pipe(gulp.dest('temp/themes'))
		console.log(" - INFO: ./themes/**/* has been copied to ./temp/themes")

	} catch(e) {
		console.log(" - ERROR: './data/"+folder+"' doesn't exist!")

	}
})

// Shortcuts
gulp.task('gitowl',   function(){ folder = 'gitowl';   gulp.start('temp') })
gulp.task('basic',    function(){ folder = 'basic';    gulp.start('temp') })
gulp.task('advanced', function(){ folder = 'advanced'; gulp.start('temp') })



// $ gulp store --theme 'default' --data 'basic'
gulp.task('store', function() {
	let theme = (argv.theme == undefined) ? 'default' : argv.theme
	let data  = (argv.data == undefined)  ? 'basic'   : argv.data
	store(theme, data)
});

function store(theme, data){
	gulp.storage.set('theme', theme)
	gulp.storage.set('data', data)
	console.log(" - INFO: config.json file has been created with '"+gulp.storage.get('theme')+"' and '"+gulp.storage.get('data')+"' vars")
}