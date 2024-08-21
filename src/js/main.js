(() => {
	// NodeJS
	const fs = require('node:fs');
	const path = require('node:path');
	const URL = require('node:url');
	const stream = require('node:stream');
	const util = require('node:util');
	const { Blob } = require('node:buffer');
	const m3u8Parser = require('m3u8-parser');
	const splitFile = require('split-file');
	const sanitize = require('sanitize-filename');
	const win = nw.Window.get();
	const img = "/images/rutube.svg";

	const streamPipeline = util.promisify(stream.pipeline);

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
						fs.mkdirSync(dir, {recursive: true});
						resolve(true);
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
					fs.unlinkSync(dir + f)
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
				const child = require('node:child_process')
					.exec(`ffmpeg -hide_banner -y -i "${input}" -vcodec copy -acodec copy "${output}"`);
				child.stdout.pipe(process.stdout);
				child.on('exit', () => {
					resolve(true);
				});
			})
		},

		delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	let rutube_dl = "--rutube-dl__",
		style = {
			"main-height": "100vh",
			"background-image": "url(" + img + ")"
		},
		t = _objectSpread({}, style),
		m3u8 = "",
		// videoDir = path.join(nw.__dirname, 'video'),
		videoDir = path.join("C:\\GIT\\rutube-nwjs-downloader", 'video');


	const resizerWin = () => {
		let el = document.documentElement;
		let header = document.querySelector("body > header"),
			main = document.querySelector("body > main"),
			footer = document.querySelector("body > footer"),
			h = header.offsetHeight + footer.offsetHeight;
		t["main-height"] = `calc(100vh - ${h}px)`;
		setStyles(t, el);
	};

	createDir(videoDir);

	setInterval(resizerWin, 500);

	let segments = [];
	// user
	const videoImage = document.querySelector('#app .block_image'),
		videoUrl = document.querySelector('#app .block_input .url'),
		videoTitle = document.querySelector('#app .block_text .title'),
		videoProgress = document.querySelector('#app .block_progress .progress'),
		blockResult = document.querySelector('#app .block_result'),
		loader = document.querySelector('#app .downloader .loader'),
		btn = document.querySelector('#app .downloader .btn');

	videoUrl.addEventListener('input', (e) => {
		blockResult.innerHTML = "";
		let el = document.documentElement;
		const regex_rutube = /^https?:\/\/rutube\.ru\/video\/(\w+)/;
		let url = videoUrl.value, m, pls;
		segments = [];
		if ((m = regex_rutube.exec(url)) !== null) {
			loader.classList.add('load');
			videoTitle.title = "";
			videoTitle.innerText = "\u00A0";
			videoImage.dataset.duration = "";
			pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
			fetch(pls)
				.then(res => res.json())
				.then(json => {
					videoImage.dataset.duration = formatTime(json.duration);
					let el = document.documentElement;
					t["background-image"] = "url(" + json.thumbnail_url + ")";
					setStyles(t, el);
					videoTitle.title = videoTitle.innerText = json.title;
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
									t["background-image"] = "url(" + img + ")";
									videoTitle.innerText = "\u00A0";
									videoTitle.title = "";
									loader.classList.remove('load');
									videoImage.dataset.duration = "";
									setStyles(t, el);
								});
						})
						.catch((e) => {
							t["background-image"] = "url(" + img + ")";
							videoTitle.innerText = "\u00A0";
							videoTitle.title = "";
							loader.classList.remove('load');
							videoImage.dataset.duration = "";
							setStyles(t, el);
						});
				})
				.catch((e) => {
					t["background-image"] = "url(" + img + ")";
					videoTitle.innerText = "\u00A0";
					videoTitle.title = "";
					loader.classList.remove('load');
					videoImage.dataset.duration = "";
					setStyles(t, el);
				});
		} else {
			// не верный url
			t["background-image"] = "url(" + img + ")";
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
			loader.classList.add('load');
			// 
			let key, data = "", int;
			// Получаем ссылки сегментов
			let arrFiles = [];
			// Забрать расширение сегмента
			let ext;
			for(key in segments){
				// Забираем расширение
				ext = path.extname(segments[key]);
				// По сути здесь можно качать и сохранять
				int = parseInt(key) + 1;
				let fname = 'segment-' + `${int}`.padStart(10, '0') + ext;
				try {
					const fileOut = videoDir + "/" + fname;
					await downloadSegment(segments[key], fileOut).catch(e => console.log(e));
					videoProgress.value = (int * 100) / segments.length;
					arrFiles.push(fileOut);
				} catch(e) {
					loader.classList.remove('load');
					return !1;
				}
			}
			if(arrFiles.length == segments.length){
				try {
					// Соединяем, сохраняем, конвертируем
					const saveTitle = sanitize(videoTitle.title);
					// Объединяем сегменты
					await splitFile.mergeFiles(arrFiles, `${videoDir}/${saveTitle}${ext}`);
					// Удаляем сегменты
					await deleteFiles(/^segment-.*\.ts/, videoDir);
					// Удаляем все mp4 если есть
					await deleteFiles(/^.*\.mp4/, videoDir);
					// Запускаем ffmpeg для преобразования исходного ts файла в mp4
					await execFFmpeg(`${videoDir}/${saveTitle}${ext}`, `${videoDir}/${saveTitle}.mp4`);
					// Удаляем исходный файл ts
					await deleteFile(`${videoDir}/${saveTitle}${ext}`);
					// ProgressBar
					videoProgress.value = 0;
					// Вставляем ссылку
					// Пока оставлю так...
					blockResult.innerHTML = `<a href="${videoDir}/${saveTitle}.mp4" download="${saveTitle}.mp4">${saveTitle}.mp4</a>`;
				} catch(e) {
					loader.classList.remove('load');
					return !1;
				}
			}else{
				// Ни все сегменты скачены
				
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
		}
	});

	let rtdl = nw.Window.get();

	rtdl.on('close', async () => {
		rtdl.hide();
		await deleteFiles(/^segment-.*\.ts/, videoDir);
		await deleteFiles(/^.*\.mp4/, videoDir);
		await removeDir(videoDir);
		rtdl.close(true);
	});
})()
