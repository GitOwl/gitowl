 "use strict"

var gulp  = require('gulp'),
	sass  = require('gulp-sass'),
	bs    = require('browser-sync'),
	fs    = require('fs-extra'),
	zip   = require('gulp-zip'),
	argv  = require('yargs').argv,
	storage = require('gulp-storage')(gulp);

gulp.storage.create('root', 'config.json')


gulp.task('default', ['temp','watch'], function () {
	console.log(' - INFO:\n\tTHEME: '+gulp.storage.get('theme')+'\n\tDATA: '+gulp.storage.get('data')+'\n')
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

// $ gulp export --file 'doc2018'
//  - Zip temp folder and save on ./exported
// $ gulp export --theme 'default'
//  - Zip theme and save on ./exported
gulp.task('export', function(){ 
	let now = new Date()

	let filename = argv.file || ''+now.getFullYear()+now.getMonth()+1+now.getDate()+now.getMinutes()+now.getSeconds()
	let src = argv.theme ? './src/themes/'+argv.theme+'/**/*' : './temp/**/*'
	
	gulp.src(src)
		.pipe(zip(filename))
		.pipe(gulp.dest('./exported'))

	console.log(' - INFO:\n\tTHEME: '+gulp.storage.get('theme')+'\n\tDATA: '+gulp.storage.get('data')+'\n')
	console.log('   File created ./exported/'+filename+'.zip')
})


gulp.task('clean', function() {
	fs.removeSync('./temp')
	console.log(" - INFO: ./temp has been remove")
})

// $ gulp active --data 'basic' --theme 'default'
gulp.task('active', function(){ 
	if(argv.data != undefined) {
		store(argv.theme || 'default', argv.data)

		gulp.start('temp')
	} else {
		console.log(" - ERROR: The example argument is missing.\n\tExample: $ gulp active --data 'basic'")
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
		console.log(" - INFO: ./src/data/"+folder+"/* has been copied to ./temp")

		gulp.src('./src/themes/'+theme+'/**/*', { "base" : './src/themes/' }).pipe(gulp.dest('temp/themes'))
		console.log(" - INFO: ./src/themes/"+theme+"/**/* has been copied to ./temp/themes")

	} catch(e) {
		console.log(" - ERROR: './src/data/"+folder+"' doesn't exist!")

	}
})


// $ gulp store --theme 'default' --data 'basic'
gulp.task('store', function() {
	let theme = (argv.theme == undefined) ? 'default' : argv.theme
	let data  = (argv.data == undefined)  ? 'basic'   : argv.data
	store(theme, data)
});

function store(theme, data){
	try {
		fs.accessSync('./src/themes/'+theme)
		fs.accessSync('./src/data/'+data)

		gulp.storage.set('theme', theme)
		gulp.storage.set('data', data)

		console.log(" - INFO: config.json file has been created with '"+gulp.storage.get('theme')+"' and '"+gulp.storage.get('data')+"' vars")
	
	}catch(e){
		console.log(" - ERROR: The folder does not exist.")
	}
}


// Shortcuts
gulp.task('gitowl',   function(){ folder = 'gitowl';   gulp.start('temp') })
gulp.task('basic',    function(){ folder = 'basic';    gulp.start('temp') })
gulp.task('advanced', function(){ folder = 'advanced'; gulp.start('temp') })



// TODO:
//  Task release: Make a gitowl release