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

	grunt.loadNpmTasks('innosetup-compiler');

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	require('./modules/Downloader.js')(grunt);
	require('./modules/Build.js')(grunt);
	require('./modules/Versions.js')(grunt);

	const path = require('path'),
		uniqid = function () {
			let result = URL.createObjectURL(new Blob([])).slice(-36).split("-").join("");
			return result;
		},
		hash = uniqid();

	var gc = {
			sdk: target ? 'normal' : 'sdk',
			version: version
		},
		flv = target ? '' : '-sdk',
		pkg = grunt.file.readJSON('package.json');

	console.table({
		version     : `${pkg.version}`,
		target_NWJS : target ? 'normal' : 'sdk',
		update_NWJS : update ? 'обновление' : 'кеш',
		version_NWJS: version == 0 ? 'последняя': `${version}`,
		date        : grunt.template.date(new Date().getTime(), 'dd-mm-yyyy')
	});

	grunt.initConfig({
		globalConfig: gc,
		pkg: pkg,
		clean: {
			options: {
				force: true
			},
			all: [
				"build/**/*",
				"install/",
				"video/",
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
			},
			app: {
				expand: true,
				cwd: 'src/js/',
				src: 'rutube-video.js',
				dest: 'application/js/',
			}
		},
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
					modifyVars: {
						"hash": hash,
					}
				},
				files: {
					'test/css/main.css': [
						'src/less/main.less'
					],
					'test/css/component.css': [
						'src/less/component.less',
					],
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
						'test/css/main.css'
					],
					'test/css/component.css': [
						'test/css/component.css'
					]
				}
			},
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
					doctype: 'html',
					pretty: '',// '\t',
					separator: '',// '\n'
					data: function(dest, src) {
						return {
							"hash": hash,
							"target": gc.sdk,
						}
					},
				},
				files: {
					"application/index.html": ['src/pug/index.pug'],
					"application/tpl/component.html": ['src/pug/component.pug']
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
		innosetup: {
			main: {
				options: {
					gui: false,
					verbose: true,
				},
				script: __dirname + "/innosetup.iss"
			}
		},
	});
	const tasks = [
		'clean:all',
		'concat:main',
		'uglify',
		'copy:app',
		'ttf2woff2',
		'less',
		'cssmin',
		'pug',
	];

	update && tasks.push('downloader');

	tasks.push(
		'unzip',
		'version_edit:main',
		'copy:main',
		'zip:main',
		'clean:vk',
		'buildnw:main'
	);

	// Таск для запуска innosetup
	// Клонируем Таск по умолчанию
	const inno = JSON.parse(JSON.stringify(tasks));
	// Добавляем запуск innosetup
	inno.push('innosetup');
	// Регистрируем таски
	grunt.registerTask('default', tasks);
	grunt.registerTask('build', inno);
}