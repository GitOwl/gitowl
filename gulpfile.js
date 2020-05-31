"use strict"

var gulp 	= require('gulp'),
	sass 	= require('gulp-sass'),
	bs 		= require('browser-sync'),
	fs 		= require('fs-extra'),
	zip 	= require('gulp-zip'),
	argv 	= require('yargs').argv;

gulp.task('sass', function () {
	let theme = (argv.theme != undefined) ? argv.theme : configFile.get('theme')
	console.log("SASS: " + theme)
	gulp.src('./src/themes/' + theme + '/scss/style.scss')
		.pipe(sass({ includePaths: ['scss'] }))
		.pipe(gulp.dest('./src/themes/' + theme + '/css'))
		.pipe(bs.stream());

})

// $ gulp watch --theme 'default' --data 'basic'
gulp.task('watch', function () {
	let theme = (argv.theme == undefined) ? configFile.get('theme') : argv.theme
	let folder = (argv.data == undefined) ? configFile.get('data') : argv.data

	bs.init(["./src/**/*"], {
		server: {
			baseDir: "./temp"
		},
		browser: '/opt/firefox_dev/firefox',
	})

	gulp.watch("./src/**/*.scss", gulp.series('sass'));
	gulp.watch("./src/**/*", gulp.series('temp'));
	//gulp.watch("**/*.html").on('change', bs.reload);

})

gulp.task('default', gulp.series('watch', function() { 
	gulp.series('temp')

	console.log(' - INFO:\n\tTHEME: ' + configFile.get('theme') + '\n\tDATA: ' + configFile.get('data') + '\n')
}));



// $ gulp export --file 'doc2018'
//  - Zip temp folder and save on ./exported
// $ gulp export --theme 'default'
//  - Zip theme and save on ./exported
gulp.task('export', function () {
	let now = new Date()

	let filename = argv.file || '' + now.getFullYear() + now.getMonth() + 1 + now.getDate() + now.getMinutes() + now.getSeconds()
	let src = argv.theme ? './src/themes/' + argv.theme + '/**/*' : './temp/**/*'

	gulp.src(src)
		.pipe(zip(filename))
		.pipe(gulp.dest('./exported'))

	console.log(' - INFO:\n\tTHEME: ' + configFile.get('theme') + '\n\tDATA: ' + configFile.get('data') + '\n')
	console.log('   File created ./exported/' + filename + '.zip')
})


gulp.task('clean', async function () {
	fs.removeSync('./temp')
	console.log(" - INFO: ./temp has been remove")
	//return done()
})

// $ gulp active --data 'basic' --theme 'default'
gulp.task('active', async function () {
	if (argv.data != undefined) {
		store(argv.theme || 'default', argv.data)

		gulp.series('temp')
	} else {
		console.log(" - ERROR: The example argument is missing.\n\tExample: $ gulp active --data 'basic'")
	}
})


gulp.task('temp', async function () {

	// FIX: theme copy
	let theme = configFile.get('theme')
	let folder = configFile.get('data')

	try {
		fs.accessSync('./src/data/' + folder + '/')

		gulp.series('clean')

		gulp.src(['./src/app/**/*']).pipe(gulp.dest('./temp'))
		console.log(" - INFO: ./src/app/**/* has been copied to ./temp")

		gulp.src('./src/data/' + folder + '/**/*').pipe(gulp.dest('./temp'))
		console.log(" - INFO: ./src/data/" + folder + "/* has been copied to ./temp")

		gulp.src('./src/themes/' + theme + '/**/*', { "base": './src/themes/' }).pipe(gulp.dest('temp/themes'))
		console.log(" - INFO: ./src/themes/" + theme + "/**/* has been copied to ./temp/themes")
	} catch (e) {
		console.log(" - ERROR: './src/data/" + folder + "' doesn't exist!")

	}
})


// $ gulp store --theme 'default' --data 'basic'
gulp.task('store', async function () {
	let theme = (argv.theme == undefined) ? 'default' : argv.theme
	let data = (argv.data == undefined) ? 'basic' : argv.data
	store(theme, data)
});


function store(theme, data) {
	try {
		fs.accessSync('./src/themes/' + theme)
		fs.accessSync('./src/data/' + data)

		configFile.set('theme', theme)
		configFile.set('data', data)

		console.log(" - INFO: config.json file has been created with '" + configFile.get('theme') + "' and '" + configFile.get('data') + "' vars")

	} catch (e) {
		console.log(" - ERROR: The folder does not exist.")
	}
}


// Shortcuts
gulp.task('gitowl',   function () { folder = 'gitowl'; gulp.series('temp') })
gulp.task('basic',    function () { folder = 'basic'; gulp.series('temp') })
gulp.task('advanced', function () { folder = 'advanced'; gulp.series('temp') })


var configFile = { 
	set: (key, value) => {	
		let config = configFile.read()

		config[key] = value
		
		let res = fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), err => {
			if (err) {
				console.log('Error writing file', err)
			} else {
				console.log('Successfully wrote file')
			}
		})
	},
	get: (value) => {	
		return configFile.read()[value]
	},
	read: () =>	{
		let res = fs.readFileSync('./config.json', 'utf8', (err, jsonString) => {
			if (err) {
				console.log("File read failed:", err)
				return false
			}
			return jsonString
		})

		return JSON.parse(res)
	}

}

// TODO:
//  Task release: Make a gitowl release


