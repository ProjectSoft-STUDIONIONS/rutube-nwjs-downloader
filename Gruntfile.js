module.exports = function(grunt) {
	process.removeAllListeners('warning');
	require('dotenv').config();

	// target=true - nwjs sdk = nortmal
	// target=false - nwjs sdk = sdk
	// update=true - произвести скачивание nwjs и ffmpeg
	// update=false - не производить скачивание nwjs и ffmpeg
	// В корне проекта присутствие файла .env обязятельно
	// Параметры NWJS_TARGET и NWJS_UPDATE должны быть заданы. 
	// При первом запуске или смене SDK NWJS_UPDATE должен быть равен 1
	// NWJS_VERSION должен содержать номер нужной версии или 0 для загрузки последней

	const target = process.env.NWJS_TARGET === '1' ? true : false,
		update = process.env.NWJS_UPDATE === '1' ? true : false,
		version = process.env.NWJS_VERSION === '0' ? false : process.env.NWJS_VERSION; // 0.87.0

	console.log(target, update, version);
	console.log(grunt.template.date(new Date().getTime(), 'yyyy-mm-dd'));

	//grunt.loadNpmTasks('innosetup-compiler');

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	require('./modules/Downloader.js')(grunt);
	require('./modules/Build.js')(grunt);
	require('./modules/Versions.js')(grunt);

	const path = require('path'),
		uniqid = function () {
			let result = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, '');
			return result;
		};

	var gc = {
			sdk: target ? 'normal' : 'sdk',
			version: version
		},
		flv = target ? '' : '-sdk',
		pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		globalConfig: gc,
		pkg: pkg,
		clean: {
			options: {
				force: true
			},
			all: [
				"build/**/*",
				"*-lock.json",
				'application/css/',
				'application/fonts/',
				'application/js/',
				'application/*-lock.json',
				'application/*.sublime-*',
				'test/'
			],
			vk: [
				'build/RuTube-DL.exe',
				'build/vk_*',
				'build/vulkan*',
				'build/swiftshader',
				'build/locales/*.info'
			],
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: "src/images",
						src: "**",
						dest: "application/images"
					},
					{
						expand: true,
						cwd: "src/_locales",
						src: "**",
						dest: "application/_locales"
					},
					{
						expand: true,
						cwd: `.cache/${gc.sdk}`,
						src: "**",
						dest: "build/"
					},
				]
			}
		},
		/*
		webfont: {
			main: {
				src: 'src/glyph/*.svg',
				dest: 'src/fonts',
				options: {
					engine: 'node',
					hashes: false,
					destLess: 'src/less/fonts',
					relativeFontPath: "/fonts/",
					font: 'rutube-dl',
					types: 'ttf',
					fontFamilyName: 'Rutube DL',
					stylesheets: ['less'],
					syntax: 'bootstrap',
					execMaxBuffer: 1024 * 400,
					htmlDemo: false,
					version: '1.0.0',
					normalize: true,
					startCodepoint: 0xE900,
					iconsStyles: false,
					autoHint: false,
					templateOptions: {
						baseClass: '',
						classPrefix: 'icon-'
					},
					template: 'src/rutube-dl.less'
				}
			}
		},
		*/
		ttf2woff2: {
			main: {
				src: ["src/fonts/*.ttf"],
				dest: "application/fonts",
			},
		},
		less: {
			main: {
				options: {
					compress: false,
					ieCompat: false,
					plugins: [
						
					],
					data: function(dest, src) {
						return {
							"hash": uniqid(),
						}
					}
				},
				files: {
					'test/css/test-main.css': [
						'src/less/main.less',
						'bower_components/Croppie/croppie.css'
					]
				}
			},
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			main: {
				files: {
					'application/css/main.css': [
						'test/css/test-main.css'
					]
				}
			},
		},
		requirejs: {
			main: {
				options: {
					baseUrl: __dirname+"/bower_components/jquery-ui/ui/widgets/",//"./",
					paths: {
						jquery: __dirname+'/bower_components/jquery/dist/jquery'
					},
					preserveLicenseComments: false,
					optimize: "uglify",
					findNestedDependencies: true,
					skipModuleInsertion: true,
					exclude: ["jquery"],
					include: [
						"../disable-selection.js",
						"sortable.js",
					],
					out: "test/js/jquery.ui.nogit.js",
					done: function(done, output) {
						grunt.log.writeln(output.magenta);
						grunt.log.writeln("jQueryUI Custom Build ".cyan + "done!\n");
						done();
					},
					error: function(done, err) {
						grunt.log.warn(err);
						done();
					}
				}
			}
		},
		concat: {
			options: {
				separator: ';',
			},
			main: {
				src: [
					'src/js/ressizer.js',
					'src/js/main.js',
				],
				dest: 'test/js/concat.js',
			},
		},
		uglify : {
			options: {
				ASCIIOnly: true,
				compress: false,
				//beautify: true
			},
			main: {
				files: {
					'application/js/main.js': [
						'test/js/concat.js',
					],
				},
			},
		},
		pug: {
			main: {
				options: {
					pretty: '',// '\t',
					separator: '',// '\n'
					data: function(dest, src) {
						return {
							"hash": uniqid(),
							"target": gc.sdk,
						}
					},
				},
				files: {
					"application/index.html": ['src/pug/index.pug'],
				},
			},
		},
		version_edit: {
			main: {
				options: {
					pkg: pkg,
				}
			}
		},
		downloader: {
			main: {
				options: {
					version: gc.version,
					sdk: gc.sdk == 'normal' ? false : true
				}
			}
		},
		zip: {
			main: {
				router: function (filepath) {
					return filepath.split('/').slice(1).join('/');
				},
				src: ["application/**/*"],
				dest: 'build/package.nw'
			}
		},
		unzip: {
			unzip_001: {
				router: function (filepath) {
					return filepath.split('/').slice(1).join('/');
				},
				src: `.cache/${gc.sdk}.zip`,
				dest: `.cache/${gc.sdk}/`
			},
			unzip_002: {
				src: `.cache/ffmpeg.zip`,
				dest: `.cache/${gc.sdk}/`
			},
		},
		buildnw: {
			main: {}
		},
		/*innosetup: {
			main: {
				options: {
					gui: false,
					verbose: true,
				},
				script: __dirname + "/setup.iss"
			}
		},*/
	});
	const tasks = [
		'clean:all',
		//'requirejs:main',
		'concat:main',
		'uglify',
		'ttf2woff2',
		'less',
		'cssmin',
		'pug',
	];

	update && tasks.push('downloader');

	tasks.push(/* 'unzip', */ 'version_edit:main', 'copy:main', 'zip:main', 'clean:vk', 'buildnw:main');

	//target && tasks.push('innosetup:main');



	grunt.registerTask('default', tasks);
}