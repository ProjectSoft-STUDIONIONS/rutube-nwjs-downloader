(() => {

	// NodeJS
	const fs = require('node:fs');
	const path = require('node:path');
	const stream = require('node:stream');
	const util = require('node:util');
	const { Blob } = require('node:buffer');
	const splitFile = require('split-file');
	const dirname = nw.__dirname;
	// Регистрируем свой веб компонент
	customElements.define("rutube-video", RutubeVideo);
		// Контейн6р
	const app = document.querySelector('#app'),
		// Кнопка добавления
		addBtn = document.querySelector('.btn-add'),
		// Кнопка скачивания
		downBtn = document.querySelector('.btn-download'),
		// Функция проверки состояний компонентов и определения доступности копки скачивания
		DownChanegeDisabled = function() {
			let rutube = Array.from(document.querySelectorAll('rutube-video')),
				rv,
				load;
			downBtn.removeAttribute('disabled');
			for(rv of rutube){
				load = rv.getAttribute('load') || "unload";
				if(load == "unload"){
					downBtn.setAttribute('disabled', 'disabled');
					break;
				}
			}
			if(!rutube.length){
				downBtn.setAttribute('disabled', 'disabled');
			}
		},
		AddChangeDisabled = function(value = false) {
			if(typeof value == "boolean") {
				if(value){
					addBtn.setAttribute('disabled', 'disabled');
					return !1;
				}else{
					addBtn.removeAttribute('disabled');
					return !1;
				}
			}
			return !1;
		},
		downloadSegment = async function(input, output) {
			return new Promise((resolve, reject) => {
				fetch(input)
					.then(response => response.arrayBuffer())
					.then(buffer => {
						let buff = Buffer.from(buffer);
						fs.writeFileSync(output, buff);
						resolve(output);
					}).catch((e) => {
						reject(e);
					});
			});
		},

		deleteFiles = async function(reg, dir){
			return new Promise((resolve, reject) => {
				dir = path.normalize(dir) + "/";
				fs.readdirSync(dir).filter(f => reg.exec(f)).forEach(f => {
					try{
						fs.unlinkSync(dir + f);
					}catch(e){
						reject(false);
					}
				});
				resolve(true);
			})
		},

		deleteFile = async function(file) {
			return new Promise((resolve, reject) => {
				fs.stat(file, function(err, stat) {
					if (err == null) {
						fs.unlinkSync(file);
						resolve(true);
					} else if (err.code === 'ENOENT') {
						resolve(true);
					} else {
						reject(false);
					}
				});
			})
		},

		execFFmpeg = async function (input, output) {
			return new Promise((resolve, reject) => {
				const ffmpeg = path.join(dirname, 'bin', 'ffmpeg.exe');
				const child = require('node:child_process')
					.exec(`"${ffmpeg}" -hide_banner -y -i "${input}" -vcodec copy -acodec copy "${output}"`);
				child.stdout.pipe(process.stdout);
				child.on('exit', () => {
					resolve(true);
				});
			})
		};

	addBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		let load = true;
		let rtv = document.querySelectorAll('rutube-video');
		let rutube;
		downBtn.setAttribute('disabled', 'disabled');
		rtv.forEach((a, b, c) => {
			let attr = a.getAttribute('load') || "unload";
			a.setAttribute('link', "");
			a.setAttribute('text', "");
			if(attr == "unload"){
				load = false;
			}
		});
		// Нельзя добавлять если не загружен ссылкой
		if(!load){
			downBtn.setAttribute('disabled', 'disabled');
		}else{
			// Добавляем
			rutube = document.createElement('rutube-video');
			app.append(rutube);
			console.log(rutube.segments);
		}
		// Выход
		return !1;
	});

	downBtn.addEventListener('click', async (e) => {
		e.stopPropagation();
		e.preventDefault();
		let rutvs = Array.from(document.querySelectorAll('rutube-video')),
			rtv;
		for(rtv of rutvs){
			let attr = rtv.getAttribute('load') || "unload";
			rtv.setAttribute('link', "");
			rtv.setAttribute('text', "");
			if(attr == "unload"){
				return !1;
				break;
			}
		}
		AddChangeDisabled(true);
		downBtn.setAttribute('disabled', 'disabled');
		for(rtv of rutvs){
			rtv.setAttribute('disabled', 'disabled');
		}
		// Здесь запустить
		for(rtv of rutvs){
			let arrFiles = [],
			key, int, ext,
			segments = JSON.parse(JSON.stringify(rtv.segments));
			while(segments.length){
				rtv.setAttribute('text', "СКАЧИВАНИЕ...");
				// Забираем расширение
				ext = path.extname(segments[0]);
				// По сути здесь можно качать и сохранять
				int = parseInt(rtv.segments.length - segments.length) + 1;
				let fname = 'segment-' + `${int}`.padStart(10, '0') + ext;
				try {
					let fileOut = path.join(rtv.__dirname, fname);
					arrFiles.push(fileOut);
					await downloadSegment(segments[0], fileOut).catch(e => console.log('downloadSegment', e));
					let prg = (int / rtv.segments.length) * 100;
					rtv.setAttribute('progress', prg);
				} catch(e) {
					
					console.log('try downloadSegment', e);
					return !1;
				}
				segments.shift();
			}
			let info = rtv.downLoadInfo;
			let dir = rtv.__dirname;
			let tName = rtv.__name + ext;
			let mp4Name = rtv.__name + ".mp4"
			// Объединяем сегменты
			rtv.setAttribute('text', "ОБЪЕДИНЕНИЕ...");
			await splitFile.mergeFiles(arrFiles, path.join(dir, tName));
			// Удаляем сегменты
			await deleteFiles(/^segment-.*\.ts/, rtv.__dirname);
			// Удаляем все mp4 если есть
			await deleteFiles(/^.*\.mp4/, rtv.__dirname);
			// Запускаем ffmpeg для преобразования исходного ts файла в mp4
			rtv.setAttribute('text', "КОНВЕРТИРОВАНИЕ...");
			await execFFmpeg(path.join(dir, tName), path.join(dir, mp4Name));
			// Удаляем исходный файл ts
			await deleteFile(path.join(dir, tName));
			rtv.setAttribute('progress', 0);
			rtv.setAttribute('disabled', 'enabled');
			rtv.setAttribute('text', "");
			rtv.setAttribute('link', mp4Name);
		}
		addBtn.removeAttribute('disabled');
		if(rutvs.length) {
			downBtn.removeAttribute('disabled');
		}
		return !1;
	});

	document.addEventListener('rutube-video:input', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// console.log(e.target.segments);
		// Проверяем условия для кнопки скачивания
		DownChanegeDisabled();
		return !1;
	});

	document.addEventListener('rutube-video:close', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// Удаляем
		e.target.parentNode.removeChild(e.target);
		// Проверяем условия для кнопки скачивания
		DownChanegeDisabled();
		return !1;
	});

	document.addEventListener('rutube-video:download', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// Проверяем клик по ссылке в RutubeVideo
		let info = e.target.downLoadInfo;
		let file = info.path;
		// Скачать файл
		let dialog = require('nw-dialog');
		dialog.setContext(document);
		let download = info.__name;
		// let arr = download.split(".");
		// arr.pop();
		// download = arr.join(".");
		dialog.saveFileDialog(`${download}`, ['.mp4'], async function(result) {
			// loader.classList.add('load');
			// Блокируем
			// EnDisApp(true);
			fs.stat(file, function(err, stat){
				const filesize = stat.size
				let bytesCopied = 0
				const readStream = fs.createReadStream(file)
				readStream.on('data', function(buffer){
					bytesCopied += buffer.length
					let porcentage = (bytesCopied / filesize) * 100;//0 .. 1
					e.target.setAttribute('progress', porcentage);
					// win.setProgressBar(porcentage);
					// videoProgress.value = porcentage * 100;
				})
				readStream.on('end', function(){
					e.target.setAttribute('progress', 0);
					// win.setProgressBar(-2);
					// videoProgress.value = 0;
					// loader.classList.remove('load');
					// Де Блокируем
					// EnDisApp(false);
				})
				readStream.pipe(fs.createWriteStream(result));
			});
		});
		console.log('DownLoad', e.target.downLoadInfo);
		return !1;
	});

	document.querySelector('body').addEventListener('click', (e) => {
		if(e.target.tagName == "A"){
			if(e.target.target == "_blank"){
				e.preventDefault();
				let href = e.target.href;
				nw.Shell.openExternal(href);
				return !1;
			}
		}
	});

	/**
	// NodeJS
	const fs = require('node:fs');
	const path = require('node:path');
	const URL = require('node:url');
	const stream = require('node:stream');
	const util = require('node:util');
	const { Blob } = require('node:buffer');
	const splitFile = require('split-file');
	const m3u8Parser = require('m3u8-parser');
	const sanitize = require('sanitize-filename');
	const win = nw.Window.get();
	const img = "var(--rutube_image)";

	const dirname = nw.__dirname;

	// user
	const videoImage = document.querySelector('#app .block_image'),
		videoUrl = document.querySelector('#app .block_input .url'),
		videoTitle = document.querySelector('#app .block_text .title'),
		videoProgress = document.querySelector('#app .block_progress .progress'),
		blockResult = document.querySelector('#app .block_result'),
		loader = document.querySelector('#app .downloader .loader'),
		btn = document.querySelector('#app .downloader .btn');

	const ownKeys = (e, t) => {
			var n = Object.keys(e);
			if (Object.getOwnPropertySymbols) {
				var o = Object.getOwnPropertySymbols(e);
				if (t)
					o = o.filter((t) => {
						return Object.getOwnPropertyDescriptor(e, t).enumerable;
					});
				n.push.apply(n, o);
			}
			return n;
		},
		_objectSpread = (...args) => {
			for (var t = 1; t < args.length; t++) {
				var n = null != args[t] ? args[t] : {};
				if (t % 2)
					ownKeys(Object(n), true).forEach((t) => {
						_defineProperty(args[0], t, n[t]);
					});
				else if (Object.getOwnPropertyDescriptors)
					Object.defineProperties(args[0], Object.getOwnPropertyDescriptors(n));
				else
					ownKeys(Object(n)).forEach((t) => {
						Object.defineProperty(args[0], t, Object.getOwnPropertyDescriptor(n, t));
					});
			}
			return args[0];
		},
		_defineProperty = (e, t, n) => {
			if (t in e) Object.defineProperty(e, t, { value: n, enumerable: true, configurable: true, writable: true });
			else e[t] = n;
			return e;
		},
		setStyles = (...args) => {
			let n = args.length > 2 && void 0 !== args[2] ? args[2] : rutube_dl;
			Object.keys(args[0]).forEach((o) => {
				(args[1].style.getPropertyValue(n + o) != args[0][o]) && args[1].style.setProperty(n + o, args[0][o]);
			});
		},
		removeStyles = (...args) => {
			let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : rutube_dl;
			Object.keys(aegs[0]).forEach((e) => {
				args[1].style.removeProperty(n + e);
			});
		},

		formatTime = function(value){
			function autopadding(v){
				return ("0" + v).slice(-2);
			}
			let s = autopadding(Math.floor((value / 1000) % 60));
			let m = autopadding(Math.floor((value / 1000 / 60) % 60));
			let h = autopadding(Math.floor((value / (1000 * 60 * 60)) % 24));
			return (h == "00" ? "" : h + ":") + m + ":" + s;
		},

		createDir = function(dir) {
			return new Promise((resolve, reject) => {
				fs.access(dir, function(err) {
					if (err && err.code === 'ENOENT') {
						try{
							fs.mkdirSync(dir, {recursive: true});
							resolve(true);
						}catch(e){
							reject(false);
						}
					}else{
						resolve(true);
					}
				});
			})
		},

		deleteFiles = async function(reg, dir){
			return new Promise((resolve, reject) => {
				dir = path.normalize(dir) + "/";
				fs.readdirSync(dir).filter(f => reg.exec(f)).forEach(f => {
					try{
						fs.unlinkSync(dir + f);
					}catch(e){
						reject(false);
					}
				});
				resolve(true);
			})
		},

		deleteFile = async function(file) {
			return new Promise((resolve, reject) => {
				fs.stat(file, function(err, stat) {
					if (err == null) {
						fs.unlinkSync(file);
						resolve(true);
					} else if (err.code === 'ENOENT') {
						resolve(true);
					} else {
						reject(false);
					}
				});
			})
		},

		removeDir = async function(dir) {
			return new Promise((resolve, reject) => {
				fs.rm(dir, {
					recursive: true,
					force: true
				}, err => {
					if (err) {
						reject(err);
					}
					resolve(true);
				});
			});
		},

		downloadSegment = async function(input, output) {
			return new Promise((resolve, reject) => {
				fetch(input)
					.then(response => response.arrayBuffer())
					.then(buffer => {
						let buff = Buffer.from(buffer);
						fs.writeFileSync(output, buff);
						resolve(output);
					}).catch((e) => {
						reject(false);
					});
			});
		},

		execFFmpeg = async function (input, output) {
			return new Promise((resolve, reject) => {
				const ffmpeg = path.join(dirname, 'bin', 'ffmpeg.exe');
				const child = require('node:child_process')
					.exec(`"${ffmpeg}" -hide_banner -y -i "${input}" -vcodec copy -acodec copy "${output}"`);
				child.stdout.pipe(process.stdout);
				child.on('exit', () => {
					resolve(true);
				});
			})
		},

		EnDisApp = function(bol){
			let a = document.querySelector('.block_result a');
			if(bol){
				videoUrl.setAttribute('disabled', 'disabled');
				btn.setAttribute('disabled', 'disabled');
				if(a){
					a.setAttribute('aria-disabled', 'true');
					a.classList.add('events');
					a.setAttribute('href', saveTitle);
					a.href = saveTitle;
				}
			}else{
				videoUrl.removeAttribute('disabled');
				btn.removeAttribute('disabled');
				if(a){
					a.removeAttribute('aria-disabled');
					a.removeAttribute('href');
					a.href = null;
					a.classList.remove('events');
				}
			}
		},

		delay = ms => new Promise(resolve => setTimeout(resolve, ms)),
		resizerWin = () => {
			let el = document.documentElement;
			let header = document.querySelector("body > header"),
				main = document.querySelector("body > main"),
				footer = document.querySelector("body > footer"),
				h = header.offsetHeight + footer.offsetHeight;
			t["main-height"] = `calc(100vh - ${h}px)`;
			setStyles(t, el);
		};

	let rutube_dl = "--rutube-dl__",
		style = {
			"main-height": "100vh",
			"background-image": img
		},
		t = _objectSpread({}, style),
		m3u8 = "",
		// videoDir = path.join(nw.__dirname, 'video'),
		videoDir = path.join(`${dirname}`, 'video'),
		segments = [],
		outputVideo = "",
		saveTitle = "";

	createDir(videoDir);

	videoUrl.addEventListener('input', async (e) => {
		outputVideo = "";
		saveTitle = "";
		blockResult.innerText = "\u00A0";
		let el = document.documentElement;
		const regex_rutube = /^https?:\/\/rutube\.ru\/video\/(\w+)/;
		let url = videoUrl.value, m, pls;
		// Обнуляемся
		videoTitle.title = "";
		videoTitle.innerText = "\u00A0";
		videoImage.dataset.duration = "";
		// Удаляем видеофайлы
		try{
			await deleteFiles(/^.*\.ts/, videoDir);
			await deleteFiles(/^.*\.mp4/, videoDir);
		}catch(err){
			console.log(err);
		}
		segments = [];
		if ((m = regex_rutube.exec(url)) !== null) {
			loader.classList.add('load');
			pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
			// Получаем информацию о видео
			fetch(pls)
				.then(res => res.json())
				.then(json => {
					videoImage.dataset.duration = formatTime(json.duration);
					let el = document.documentElement;
					t["background-image"] = "url(" + json.thumbnail_url + ")";
					setStyles(t, el);
					videoTitle.title = videoTitle.innerText = json.title;
					// Получаем информацию о плейлисте
					m3u8 = json["video_balancer"]["m3u8"];
					fetch(m3u8)
						.then(res => res.text())
						.then(text => {
							// Плейлист с m3u8 файлами
							// Выбрать самый последний
							let m3u8Video = new m3u8Parser.Parser();
							m3u8Video.push(text);
							m3u8Video.end();
							let plsm3u8 = m3u8Video.manifest.playlists;
							let plsurl = plsm3u8[plsm3u8.length -1];
							// Получаем ссылку для составления в будующем ссылки на сегмент
							const myURL = URL.parse(plsurl.uri);
							let pathname = myURL.pathname.split("/");
							pathname.pop();
							const urlPrefix = myURL.protocol + "//" + myURL.host + "/" + pathname.join("/") + "/";
							// Получаем информацию на сегменты видео
							fetch(plsurl.uri)
								.then(res => res.text())
								.then(async segm => {
									let segmentsPlayList = new m3u8Parser.Parser();
									segmentsPlayList.push(segm);
									segmentsPlayList.end();
									// Сегменты получены
									segmentsPlayList.manifest.segments.forEach((a, b, c) => {
										segments[b] = urlPrefix + a.uri
									});
									loader.classList.remove('load');
									if(segments.length) {
										//
									}
								})
								.catch((e) => {
									t["background-image"] = img;
									videoTitle.innerText = "\u00A0";
									videoTitle.title = "";
									loader.classList.remove('load');
									videoImage.dataset.duration = "";
									setStyles(t, el);
									console.log(e);
								});
						})
						.catch((e) => {
							t["background-image"] = img;
							videoTitle.innerText = "\u00A0";
							videoTitle.title = "";
							loader.classList.remove('load');
							videoImage.dataset.duration = "";
							setStyles(t, el);
							console.log(e);
						});
				})
				.catch((e) => {
					t["background-image"] = img;
					videoTitle.innerText = "\u00A0";
					videoTitle.title = "";
					loader.classList.remove('load');
					videoImage.dataset.duration = "";
					setStyles(t, el);
					console.log(e);
				});
		} else {
			// не верный url
			t["background-image"] = img;
			videoTitle.innerText = "\u00A0";
			videoTitle.title = "";
			loader.classList.remove('load');
			videoImage.dataset.duration = "";
			setStyles(t, el);
		}
	});

	btn.addEventListener('click', async (e) => {
		e.preventDefault();
		if(segments.length){
			outputVideo = "";
			saveTitle = "";
			loader.classList.add('load');
			// 
			let key, data = "", int;
			// Получаем ссылки сегментов
			let arrFiles = [];
			// Забрать расширение сегмента
			let ext;
			// Блокируем
			EnDisApp(true);
			blockResult.innerHTML = `СКАЧИВАНИЕ...`;
			for(key in segments){
				// Забираем расширение
				ext = path.extname(segments[key]);
				// По сути здесь можно качать и сохранять
				int = parseInt(key) + 1;
				let fname = 'segment-' + `${int}`.padStart(10, '0') + ext;
				try {
					const fileOut = videoDir + "/" + fname;
					await downloadSegment(segments[key], fileOut).catch(e => console.log(e));
					videoProgress.value = ( int / segments.length ) * 100;
					win.setProgressBar(int / segments.length);
					arrFiles.push(fileOut);
				} catch(e) {
					win.setProgressBar(-1);
					loader.classList.remove('load');
					outputVideo = "";
					// Де Блокируем
					EnDisApp(false);
					blockResult.innerHTML = ``;
					console.log(e);
					return !1;
				}
			}
			if(arrFiles.length == segments.length){
				win.setProgressBar(2);
				// Блокируем
				EnDisApp(true);
				try {
					// Соединяем, сохраняем, конвертируем
					saveTitle = sanitize(videoTitle.title);
					saveTitle = saveTitle.replace(/\s+/g, " ");
					// Объединяем сегменты
					blockResult.innerHTML = `ОБЪЕДИНЕНИЕ...`
					await splitFile.mergeFiles(arrFiles, `${videoDir}/${saveTitle}${ext}`);
					// Удаляем сегменты
					await deleteFiles(/^segment-.*\.ts/, videoDir);
					// Удаляем все mp4 если есть
					await deleteFiles(/^.*\.mp4/, videoDir);
					// Запускаем ffmpeg для преобразования исходного ts файла в mp4
					blockResult.innerHTML = `КОНВЕРТИРОВАНИЕ...`
					await execFFmpeg(`${videoDir}/${saveTitle}${ext}`, `${videoDir}/${saveTitle}.mp4`);
					// Удаляем исходный файл ts
					await deleteFile(`${videoDir}/${saveTitle}${ext}`);
					outputVideo = `${videoDir}/${saveTitle}.mp4`;
					// ProgressBar
					videoProgress.value = 0;
					// Вставляем ссылку
					// Пока оставлю так...
					blockResult.innerHTML = `СКАЧАТЬ: <a href="${saveTitle}.mp4" download="${saveTitle}.mp4">${saveTitle}.mp4</a>`;
					win.setProgressBar(-1);
					// Де Блокируем
					EnDisApp(false);
				} catch(e) {
					loader.classList.remove('load');
					win.setProgressBar(-1);
					saveTitle = "";
					outputVideo = "";
					// Де Блокируем
					EnDisApp(false);
					blockResult.innerHTML = ``;
					console.log(e);
					return !1;
				}
			}else{
				// Ни все сегменты скачены
				outputVideo = "";
				saveTitle = "";
				win.setProgressBar(-1);
				// Де Блокируем
				EnDisApp(false);
				blockResult.innerHTML = ``;
			}
			loader.classList.remove('load');
		}
		return !1;
	});

	document.querySelector('body').addEventListener('click', (e) => {
		if(e.target.tagName == "A"){
			if(e.target.target == "_blank"){
				e.preventDefault();
				let href = e.target.href;
				nw.Shell.openExternal(href);
				return !1;
			}
			if(e.target.download){
				e.preventDefault();
				// Save file
				let dialog = require('nw-dialog');
				dialog.setContext(document);
				let download = e.target.download;
				let arr = download.split(".");
				arr.pop();
				download = arr.join(".");
				dialog.saveFileDialog(`${download}`, ['.mp4'], async function(result) {
					loader.classList.add('load');
					// Блокируем
					EnDisApp(true);
					fs.stat(outputVideo, function(err, stat){
						const filesize = stat.size
						let bytesCopied = 0
						const readStream = fs.createReadStream(outputVideo)
						readStream.on('data', function(buffer){
							bytesCopied += buffer.length
							let porcentage = (bytesCopied / filesize);//0 .. 1
							win.setProgressBar(porcentage);
							videoProgress.value = porcentage * 100;

						})
						readStream.on('end', function(){
							win.setProgressBar(-2);
							videoProgress.value = 0;
							loader.classList.remove('load');
							// Де Блокируем
							EnDisApp(false);
						})
						readStream.pipe(fs.createWriteStream(result));
					});
				});
				return !1;
			}
		}
	});

	setInterval(resizerWin, 500);
	**/
})();
