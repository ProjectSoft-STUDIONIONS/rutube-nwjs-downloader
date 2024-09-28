class RutubeVideo extends HTMLElement {

	static fs = require('node:fs');
	static path = require('node:path');
	static stream = require('node:stream');
	static util = require('node:util');
	static Blob = require('node:buffer').Blob;
	static URL_CONST = require('node:url');
	static splitFile = require('split-file');
	
	#image;
	#blockInput;
	#url;
	#title;
	#progress;
	#result;
	#loader;
	#close;
	#span;
	#btnDown;
	#btnSave;
	#segments = [];
	#dirname = "";
	#name = "";

	get sdk() {
		return (nw.process.versions["nw-flavor"] == "sdk");
	}

	set sdk(value){
		throw new Error('Parameter readonly!');
	}

	get segments() {
		return this.#segments;
	}

	set segments(value) {
		throw new Error('Parameter readonly!');
	}

	get __dirname() {
		return this.#dirname;
	}

	set __dirname(value) {
		throw new Error('Parameter readonly!');
	}

	get __name() {
		return this.#name;
	}

	set __name(value) {
		throw new Error('Parameter readonly!');
	}

	constructor() {
		super();
		let uuid = String(URL.createObjectURL(new Blob([])).substr(-36)).split("-").join("");
		let template = RutubeVideo.fs.readFileSync('tpl/component.html');
		this.#segments = [];
		this.UUID = uuid;
		this.attachShadow({
			mode: "open"
		}).innerHTML = template;
	}

	static formatTime (value) {
		function autopadding(v){
			return ("0" + v).slice(-2);
		}
		let s = autopadding(Math.floor((value / 1000) % 60));
		let m = autopadding(Math.floor((value / 1000 / 60) % 60));
		let h = autopadding(Math.floor((value / (1000 * 60 * 60)) % 24));
		return (h == "00" ? "" : h + ":") + m + ":" + s;
	}

	static sanitize(input, replacement = '') {
		if (typeof input !== 'string') {
			throw new Error('Input must be string');
		}
		if (typeof replacement !== 'string') {
			throw new Error('Replacement must be string');
		}
		return input.replace(/[\/\?<>\\:\*\|"]/g, replacement)
			.replace(/[\x00-\x1f\x80-\x9f]/g, replacement)
			.replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, replacement)
			.replace(/[\s]+/g, ' ')
			.replace(/[-]+/g, '-')
			.replace(/[_]+/g, '_')
			.substring(0, 250);;
	}

	handleError() {
		this.#name = '';
		this.#title.title = "";
		this.#title.innerHTML = "\u00A0";
		this.#image.dataset.duration = "";
		this.#segments = [];
	}

	createDir() {
		let directory = RutubeVideo.path.join(nw.__dirname, 'video', this.UUID);
		this.#dirname = directory;
		return new Promise((resolve, reject) => {
			RutubeVideo.fs.access(directory, function(err) {
				if (err && err.code === 'ENOENT') {
					try{
						RutubeVideo.fs.mkdirSync(directory, {recursive: true});
						resolve(true);
					}catch(e){
						reject(false);
					}
				}else{
					resolve(true);
				}
			});
		})
	}

	removeDir() {
		let directory = RutubeVideo.path.join(nw.__dirname, 'video', this.UUID);
		try {
			RutubeVideo.fs.rmSync(directory, { recursive: true, force: true });
		}catch(e){
			this.sdk && console.log(e);
		}
	}

// https://rutube.ru/video/a038c12f5ac1852e556ee88107746587/

	async handleEvent (event) {
		const __self = this;
		let m3u8Parser = require('m3u8-parser'),
			customEvent;
		switch(event.type){
			case "input":
				const regex = /^https?:\/\/rutube\.ru\/(?:shorts|video)\/(\w+)/;
				let url = __self.#url.value,
					m, pls;
				__self.#name = '';
				__self.#title.title = "";
				__self.#title.innerHTML = "\u00A0";
				__self.#image.dataset.duration = "";
				__self.#segments = [];
				// Удаляем или создаём папку
				__self.removeDir();
				__self.createDir();
				if ((m = regex.exec(url)) !== null) {
					__self.#btnDown.setAttribute("disabled", "disabled");
					__self.#btnSave.setAttribute("disabled", "disabled");
					__self.#loader.classList.add('load');
					__self.#blockInput.classList.add('disabled');
					__self.#image.removeAttribute('style');
					__self.#span.innerText = ``;
					// Удаляем все ts если есть
					await __self.deleteFiles(/^.*\.ts/, __self.__dirname).catch((e) => {
						__self.#span.innerText = 'ОШИБКА УДАЛЕНИЯ *.ts';
					});
					// Удаляем все mp4 если есть
					await __self.deleteFiles(/^.*\.mp4/, __self.__dirname).catch((e) => {
						__self.#span.innerText = 'ОШИБКА УДАЛЕНИЯ *.mp4';
					});

					pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
					// Получаем информацию о видео
					fetch(pls).then(res => res.json()).then((json) => {
						__self.#image.dataset.duration = RutubeVideo.formatTime(json.duration);
						__self.#title.title = __self.#title.innerText = json.title;
						__self.#image.setAttribute('style', `--rutube_image: url(${json.thumbnail_url});`);
						__self.#name = RutubeVideo.sanitize(json.title);
						// Получаем информацию о плейлисте
						fetch(json["video_balancer"]["m3u8"]).then(res => res.text()).then(text => {
							// Плейлист с m3u8 файлами
							// Выбрать самый последний
							let m3u8Video = new m3u8Parser.Parser();
							m3u8Video.push(text);
							m3u8Video.end();
							let plsm3u8 = m3u8Video.manifest.playlists,
								uri = plsm3u8.pop().uri,
								myURL = RutubeVideo.URL_CONST.parse(uri),
								pathname = myURL.pathname.split("/"),
								urlPrefix;
							pathname.pop();
							urlPrefix = myURL.protocol + "//" + myURL.host + "/" + pathname.join("/") + "/";
							// Получаем информацию на сегменты видео
							fetch(uri).then(res => res.text()).then(segm => {
								let segmentsPlayList = new m3u8Parser.Parser();
								segmentsPlayList.push(segm);
								segmentsPlayList.end();
								// Сегменты получены
								segmentsPlayList.manifest.segments.forEach((a, b, c) => {
									__self.#segments[b] = urlPrefix + a.uri
								});
								__self.#loader.classList.remove('load');
								__self.#blockInput.classList.remove('disabled');
								if(__self.#segments.length) {
									// Готовы к скачиванию
									__self.#btnDown.removeAttribute("disabled");
								}
							}).catch((err) => {
								// Обработать ошибки
								__self.#loader.classList.remove('load');
								__self.#blockInput.classList.remove('disabled');
								__self.#image.removeAttribute('style');
								__self.sdk && console.log(err);
							});
						}).catch((err) => {
							// Обработать ошибки
							__self.#loader.classList.remove('load');
							__self.#blockInput.classList.remove('disabled');
							__self.#image.removeAttribute('style');
							__self.sdk && console.log(err);
						});
					}).catch((err) => {
						// Обработать ошибки
						__self.#loader.classList.remove('load');
						__self.#blockInput.classList.remove('disabled');
						__self.#image.removeAttribute('style');
						__self.sdk && console.log(err);
					});
				}else{
					__self.#loader.classList.remove('load');
					__self.#blockInput.classList.remove('disabled');
					__self.#image.removeAttribute('style');
					__self.#name = '';
					__self.#span.innerText = ``;
					__self.#title.title = "";
					__self.#title.innerHTML = "\u00A0";
					__self.#image.dataset.duration = "";
					__self.#segments = [];
					// Обработать ошибки
				}
				break;
			case 'click':
				__self.parentNode.removeChild(__self);
				break;
		}
	}

	async clickDownEvent(e) {
		e.preventDefault();
		let __self = this;
		this.#close.setAttribute("disabled", "disabled");
		if(this.#segments.length) {
			//this.#loader.classList.add('load');
			this.#loader.classList.add('loading');
			this.#blockInput.classList.add('disabled');
			this.#btnDown.setAttribute('disabled', "disabled");
			this.#btnSave.setAttribute('disabled', "disabled");
			this.#url.setAttribute('disabled', "disabled");
			let prgresult = this.shadowRoot.querySelector('.block_progress_text');
			let segments = JSON.parse(JSON.stringify(this.segments)),
				arrFiles = [],
				key, int, ext,
				padStrLen = String(segments.length).length;
			while(segments.length){
				ext = RutubeVideo.path.extname(segments[0]);
				int = parseInt(this.segments.length - segments.length) + 1;
				let fname = 'segment-' + `${int}`.padStart(padStrLen, '0') + ext;
				let fileOut = RutubeVideo.path.join(this.__dirname, fname);
				arrFiles.push(fileOut);
				this.#span.innerText = `СКАЧИВАНИЕ ${RutubeVideo.path.basename(segments[0])} ...`;
				await this.downloadSegment(segments[0], fileOut).catch(e => __self.sdk && console.log('downloadSegment', e));
				let prg = ( int / this.segments.length ) * 100;
				this.#progress.setAttribute('value', prg);
				if(parseFloat(prg) >= 0) {
					prgresult.innerText = parseInt(prg) + "%";
				}else{
					prgresult.innerText = '';
				}
				segments.shift();
			}
			this.#span.innerText = ``;
			let dir = this.__dirname;
			let tName = this.UUID + ext;
			let mp4Name = this.UUID + ".mp4";
			let error = false;
			// Объединяем сегменты
			this.#span.innerText = "ОБЪЕДИНЕНИЕ...";
			await RutubeVideo.splitFile.mergeFiles(arrFiles, RutubeVideo.path.join(dir, tName)).catch((e) => {
				this.#span.innerText = 'ОШИБКА ОБЪЕДИНЕНИЯ *.ts';
				error = true;
			});
			// Удаляем сегменты
			await this.deleteFiles(/^segment-.*\.ts/, this.__dirname).catch((e) => {
				this.#span.innerText = 'ОШИБКА УДАЛЕНИЯ *.ts';
				error = true;
			});
			// Удаляем все mp4 если есть
			await this.deleteFiles(/^.*\.mp4/, this.__dirname).catch((e) => {
				this.#span.innerText = 'ОШИБКА УДАЛЕНИЯ *.mp4';
				error = true;
			});
			// Запускаем ffmpeg для преобразования исходного ts файла в mp4
			this.#span.innerText = "КОНВЕРТИРОВАНИЕ...";
			await this.execFFmpeg(RutubeVideo.path.join(dir, tName), RutubeVideo.path.join(dir, mp4Name)).catch((e) => {
				this.#span.innerText = `ОШИБКА КОНВЕРТИРОВАНИЯ В "${this.__name}.mp4"`;
				error = true;
			});
			// Удаляем исходный файл ts
			await this.deleteFile(RutubeVideo.path.join(dir, tName)).catch((e) => {
				this.#span.innerText = `ОШИБКА УДАЛЕНИЯ`;
				error = true;
			});
			this.#progress.setAttribute('value', 0);
			this.#btnDown.removeAttribute('disabled');
			this.#btnSave.removeAttribute('disabled');
			this.#close.removeAttribute("disabled");
			this.#url.removeAttribute('disabled');
			this.#loader.classList.remove('load');
			this.#loader.classList.remove('loading');
			this.#blockInput.classList.remove('disabled');
			prgresult.innerText = '';
			!error && (this.#span.innerText = `${this.__name}.mp4`);
		}else{
			this.#progress.setAttribute('value', 0);
			this.#btnDown.setAttribute('disabled', "disabled");
			this.#btnSave.setAttribute('disabled', "disabled");
			this.#close.removeAttribute("disabled");
			this.#url.removeAttribute('disabled');
			this.#loader.classList.remove('load');
			this.#loader.classList.remove('loading');
			this.#blockInput.classList.remove('disabled');
			prgresult.innerText = '';
			this.#span.innerText = '';
		}
		return !1;
	}

	deleteFiles(reg, dir) {
		return new Promise((resolve, reject) => {
			dir = RutubeVideo.path.normalize(dir) + "/";
			RutubeVideo.fs.readdirSync(dir).filter(f => reg.exec(f)).forEach(f => {
				try{
					RutubeVideo.fs.unlinkSync(dir + f);
				}catch(e){
					reject(false);
				}
			});
			resolve(true);
		})
	}

	deleteFile(file) {
		return new Promise((resolve, reject) => {
			RutubeVideo.fs.stat(file, function(err, stat) {
				if (err == null) {
					RutubeVideo.fs.unlinkSync(file);
					resolve(true);
				} else if (err.code === 'ENOENT') {
					resolve(true);
				} else {
					reject(false);
				}
			});
		})
	}

	clickSaveEvent(e) {
		e.preventDefault();
		let dialog = require('nw-dialog'),
			__self = this,
			prgresult = this.shadowRoot.querySelector('.block_progress_text'),
			file = RutubeVideo.path.join(this.__dirname, this.UUID + ".mp4");

		dialog.setContext(document);
		// Имя Файла
		let download = this.__name;
		dialog.saveFileDialog(`${download}`, ['.mp4'], async function(result) {
			__self.#loader.classList.add('loading');
			__self.#blockInput.classList.add('disabled');
			__self.#btnDown.setAttribute('disabled', "disabled");
			__self.#btnSave.setAttribute('disabled', "disabled");
			__self.#url.setAttribute('disabled', "disabled");
			__self.#close.setAttribute("disabled", "disabled");
			// Скачиваем (копируем) в выбранное место
			try {
				RutubeVideo.fs.stat(file, function(err, stat){
					if(!err){
						prgresult.innerText = '';
						__self.#progress.setAttribute('value', 0);
						__self.#span.innerText = 'ЗАПИСЬ ....';
						const filesize = stat.size
						let bytesCopied = 0
						const readStream = RutubeVideo.fs.createReadStream(file)
						readStream.on('data', function(buffer){
							bytesCopied += buffer.length
							let porcentage = (bytesCopied / filesize) * 100;//0 .. 1
							prgresult.innerText = parseInt(porcentage) + "%";
							__self.#progress.setAttribute('value', porcentage);
						})
						readStream.on('end', function(){
							prgresult.innerText = "";
							__self.#progress.setAttribute('value', 0);
							__self.#loader.classList.remove('load');
							__self.#loader.classList.remove('loading');
							__self.#blockInput.classList.remove('disabled');
							__self.#btnDown.removeAttribute('disabled');
							__self.#btnSave.removeAttribute('disabled');
							__self.#url.removeAttribute('disabled');
							__self.#close.removeAttribute('disabled');
							__self.#span.innerText = `${__self.__name}.mp4`;
						})
						readStream.pipe(RutubeVideo.fs.createWriteStream(result));
					}else{
						prgresult.innerText = "";
						__self.#progress.setAttribute('value', 0);
						__self.#loader.classList.remove('load');
						__self.#loader.classList.remove('loading');
						__self.#blockInput.classList.remove('disabled');
						__self.#btnDown.removeAttribute('disabled');
						__self.#btnSave.removeAttribute('disabled');
						__self.#url.removeAttribute('disabled');
						__self.#close.removeAttribute('disabled');
						__self.#span.innerText = 'ОШИБКА ЗАПИСИ';
					}
				});
			}catch(e){
				__self.sdk && console.log(e);
				prgresult.innerText = "";
				__self.#progress.setAttribute('value', 0);
				__self.#loader.classList.remove('load');
				__self.#loader.classList.remove('loading');
				__self.#blockInput.classList.remove('disabled');
				__self.#btnDown.removeAttribute('disabled');
				__self.#btnSave.removeAttribute('disabled');
				__self.#url.removeAttribute('disabled');
				__self.#span.innerText = 'ОШИБКА ЗАПИСИ';
				__self.#close.removeAttribute('disabled');
			}
		});
		return !1;
	}

	execFFmpeg (input, output) {
		let __self = this;
		return new Promise((resolve, reject) => {
			const ffmpeg = RutubeVideo.path.join(nw.__dirname, 'bin', 'ffmpeg.exe');
			__self.sdk && console.log(ffmpeg);
			const child = require('node:child_process').exec(`"${ffmpeg}" -hide_banner -y -i "${input}" -vcodec copy -acodec copy "${output}"`);
			child.stdout.pipe(process.stdout);
			child.on('exit', (code) => {
				(code == 0) ? resolve(true) : reject(code);
			});
		})
	}
	
	downloadSegment (input, output) {
		return new Promise((resolve, reject) => {
			fetch(input)
				.then(response => response.arrayBuffer())
				.then(buffer => {
					let buff = Buffer.from(buffer);
					RutubeVideo.fs.writeFileSync(output, buff);
					resolve(output);
				}).catch((e) => {
					reject(e);
				});
		});
	}	

	connectedCallback() {
		let __self = this;
		this.#image = this.shadowRoot.querySelector('.block_image');
		this.#url = this.shadowRoot.querySelector('.url');
		this.#title = this.shadowRoot.querySelector('.title');
		this.#progress = this.shadowRoot.querySelector('.progress');
		this.#result = this.shadowRoot.querySelector('.block_result');
		this.#loader = this.shadowRoot.querySelector('.loader');
		this.#close = this.shadowRoot.querySelector('.btn-close');
		this.#span = this.shadowRoot.querySelector('.block_result span');
		this.#btnDown = this.shadowRoot.querySelector('.btn-download');
		this.#btnSave = this.shadowRoot.querySelector('.btn-save');
		this.#blockInput = this.shadowRoot.querySelector('.block_input');
		this.#span.classList.remove('hidden');
		this.#url.addEventListener('input', this);
		this.#close.addEventListener('click', this);
		this.#btnDown.addEventListener('click', this.clickDownEvent.bind(this));
		this.#btnSave.addEventListener('click', this.clickSaveEvent.bind(this));
		this.#btnDown.setAttribute('disabled', "disabled");
		this.#btnSave.setAttribute('disabled', "disabled");
		this.#name = "";
		this.createDir();
		this.sdk && console.log("Ready 😎");
	}

	disconnectedCallback() {
		this.#url.removeEventListener('input', this);
		this.#close.removeEventListener('click', this);
		this.#btnDown.removeEventListener('click', this.clickDownEvent.bind(this));
		this.#btnSave.removeEventListener('click', this.clickSaveEvent.bind(this));
		this.removeDir();
		this.#dirname = "";
		this.sdk && console.log("Clean 😎");
	}
}
