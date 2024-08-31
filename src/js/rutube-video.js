class RutubeVideo extends HTMLElement {

	static observedAttributes = ['download', 'disabled', 'progress', 'link', 'text'];
	
	#image;
	#url;
	#title;
	#progress;
	#result;
	#loader;
	#close;
	#span;
	#link;
	#segments = [];
	#dirname = "";
	#name = "";

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

	get downLoadInfo(){
		let path = require('node:path');
		let title = this.downLink.innerText.length ? this.downLink.innerText : '';
		let obj = {
			segments: this.segments,
			title: title,
			name: this.__name,
			path: title.length ? path.join(this.__dirname, title) : '',
			update: !!this.downLink.innerText.length
		};
		return obj;
	}

	set downLoadInfo(value){
		throw new Error('Parameter readonly!');
	}

	constructor() {
		super();
		let uuid = String(URL.createObjectURL(new Blob([])).substr(-36)).split("-").join("");
		let fs = require('node:fs');
		let template = fs.readFileSync('tpl/component.html');
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

	disableDowm() {
		this.setAttribute('load', 'unload');
		this.#image.removeAttribute('style');
		this.#loader.classList.remove('load');
		this.#segments = [];
		return new CustomEvent('rutube-video:input', {
			bubbles: true
		});
	}

	handleError() {
		this.#name = '';
		this.downLink.innerText = '';
		this.downLink.title = '';
		this.#title.title = "";
		this.#title.innerHTML = "\u00A0";
		this.#image.dataset.duration = "";
		this.#segments = [];
		return new CustomEvent('rutube-video:errorinfo', {
			bubbles: true
		});
	}

	attributeChangedCallback (name, oldValue, newValue) {
		switch(name){
			case "disabled":
				if(newValue == "disabled" || newValue == "enabled"){
					switch(newValue){
						case "disabled":
							this.#url.setAttribute(newValue, newValue);
							this.#close.setAttribute(newValue, newValue);
							this.#loader.classList.add('load');
							this.#span.innerText = "СКАЧИВАНИЕ ...";
							break;
						case "enabled":
							this.#url.removeAttribute(name);
							this.#close.removeAttribute(name);
							this.#loader.classList.remove('load');
							this.#span.innerText = "";
							break;
					}
				}
				break;
			case "progress":
				this.#progress.setAttribute('value', newValue);
				let prgresult = this.shadowRoot.querySelector('.block_progress_text');
				if(parseFloat(newValue) >= 0) {
					prgresult.innerText = parseInt(newValue) + "%";
				}else{
					prgresult.innerText = '';
				}
				break;
			case "link":
				if(newValue.length){
					this.downLink.classList.remove('hidden');
					this.downLink.innerText = newValue;
				}else{
					this.downLink.classList.add('hidden');
					this.downLink.innerText = "";
				}
				break;
			case "text":
				if(newValue.length){
					this.#span.classList.remove('hidden');
					this.#span.innerText = newValue;
				}else{
					this.#span.classList.add('hidden');
					this.#span.innerText = "";
				}
				break;
		}
	}

	createDir = function() {
		let fs = require('node:fs');
		let path = require('node:path');
		let directory = path.join(nw.__dirname, 'video', this.UUID);
		this.#dirname = directory;
		return new Promise((resolve, reject) => {
			fs.access(directory, function(err) {
				if (err && err.code === 'ENOENT') {
					try{
						fs.mkdirSync(directory, {recursive: true});
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
		let fs = require('node:fs');
		let path = require('node:path');
		let directory = path.join(nw.__dirname, 'video', this.UUID);
		try {
			fs.rmSync(directory, { recursive: true, force: true });
		}catch(e){
			console.log(e);
		}
	}

	async removeFiles() {
		let __self = this;
	}

// https://rutube.ru/video/a038c12f5ac1852e556ee88107746587/

	async handleEvent (event) {
		const __self = this;
		let m3u8Parser = require('m3u8-parser'),
			fs = require('node:fs'),
			URL_CONST = require('node:url'),
			sanitize = require('sanitize-filename'),
			customEvent;
		switch(event.type){
			case "input":
				const regex = /^https?:\/\/rutube\.ru\/video\/(\w+)/;
				let url = __self.#url.value,
					m, pls;
				__self.#name = '';
				__self.downLink.innerText = '';
				__self.downLink.title = '';
				__self.#title.title = "";
				__self.#title.innerHTML = "\u00A0";
				__self.#image.dataset.duration = "";
				__self.#segments = [];
				// Удаляем или создаём папку
				__self.removeDir();
				__self.createDir();
				if ((m = regex.exec(url)) !== null) {
					__self.#loader.classList.add('load');
					__self.setAttribute('load', 'unload');
					// Отправляем событие
					customEvent = new CustomEvent('rutube-video:input', {
						bubbles: true
					});
					__self.dispatchEvent(customEvent);
					pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
					// Получаем информацию о видео
					fetch(pls).then(res => res.json()).then((json) => {
						__self.#image.dataset.duration = RutubeVideo.formatTime(json.duration);
						__self.#title.title = __self.#title.innerText = json.title;
						__self.#image.setAttribute('style', `--rutube_image: url(${json.thumbnail_url});`);
						__self.#name = sanitize(json.title);
						__self.downLink.title = this.downLink.innerText = __self.#name + '.mp4';
						// Получаем информацию о плейлисте
						fetch(json["video_balancer"]["m3u8"]).then(res => res.text()).then(text => {
							// Плейлист с m3u8 файлами
							// Выбрать самый последний
							let m3u8Video = new m3u8Parser.Parser();
							m3u8Video.push(text);
							m3u8Video.end();
							let plsm3u8 = m3u8Video.manifest.playlists,
								uri = plsm3u8.pop().uri,
								myURL = URL_CONST.parse(uri),
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
								if(__self.#segments.length) {
									// Готовы к скачиванию
									__self.setAttribute('load', 'load');
									customEvent = new CustomEvent('rutube-video:input', {
										bubbles: true
									});
									__self.dispatchEvent(customEvent);
								}
							}).catch((err) => {
								__self.dispatchEvent(__self.disableDowm());
								__self.dispatchEvent(__self.handleError());
								console.log(err);
							});
						}).catch((err) => {
							__self.dispatchEvent(__self.disableDowm());
							__self.dispatchEvent(__self.handleError());
							console.log(err);
						});
					}).catch((err) => {
						__self.dispatchEvent(__self.disableDowm());
						__self.dispatchEvent(__self.handleError());
						console.log(err);
					});
				}else{
					__self.#name = '';
					__self.downLink.innerText = '';
					__self.downLink.title = '';
					__self.#title.title = "";
					__self.#title.innerHTML = "\u00A0";
					__self.#image.dataset.duration = "";
					__self.#segments = [];
					__self.dispatchEvent(__self.disableDowm());
					__self.dispatchEvent(__self.handleError());
				}
				break;
			case 'click':
				// Отправляем событие на удаление
				customEvent = new CustomEvent('rutube-video:close', {
					bubbles: true
				});
				__self.dispatchEvent(customEvent);
				break;
		}
	}

	clickLinkEvent(e) {
		e.preventDefault();
		let customEvent = new CustomEvent('rutube-video:download', {
			bubbles: true
		});
		this.dispatchEvent(customEvent);
		return !1;
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
		this.downLink = this.#result.querySelector('a');
		this.downLink.innerText = "";
		this.downLink.classList.add('hidden');
		this.#url.addEventListener('input', this);
		this.#close.addEventListener('click', this);
		this.downLink.addEventListener('click', this.clickLinkEvent);
		this.setAttribute('load', 'unload');
		this.setAttribute('disabled', 'enabled');
		this.setAttribute('link', '');
		this.setAttribute('text', '');
		this.#name = "";
		this.createDir();
		console.log("Ready 😎");
	}

	disconnectedCallback() {
		this.#url.removeEventListener('input', this);
		this.#close.removeEventListener('click', this);
		this.downLink.removeEventListener('click', this.clickLinkEvent);
		this.removeDir();
		this.#dirname = "";
		console.log("Clean 😎");
	}
}

