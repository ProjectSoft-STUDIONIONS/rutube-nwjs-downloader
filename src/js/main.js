(() => {
	const fs = require('node:fs'),
		path = require('node:path'),
		os = require('node:os'),
		util = require('node:util'),
		URL_CONST = require('node:url'),
		countDwn = 3,
		sdk = nw.process.versions["nw-flavor"] == "sdk",
		win = nw.Window.get();

	sdk && win.showDevTools();

	customElements.define("rutube-video", RutubeVideo);
		// Контейн6р
	const app = document.querySelector('#app'),
		// Кнопка добавления
		addBtn = document.querySelector('.btn-add'),
		importBtn = document.querySelector('.btn-import');

	const pause = function(delay= 1000){
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(true);
			}, delay);
		});
	}
	// Добавить компонент
	addBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// Добавляем
		let rutube = document.createElement('rutube-video');
		app.append(rutube);
		return !1;
	});

	importBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// проверить директорию
		// проверить кол-во закачек
		// подготовить
		let dialog = require('nw-dialog');
		dialog.setContext(document);
		dialog.openFileDialog(['.txt'], false, async function(file) {
			// https://rutube.ru/video/16006a50b52e2c96311c636e06adc1b5/
			const regex = /^https?:\/\/rutube\.ru\/(?:shorts|video)\/(\w{32})/;
			let url;
			// Читаем файл, проверяем ссылки
			let array = fs.readFileSync(file, {encoding: 'utf8'}).toString().split("\n")
					.map(item => item.trim())
					.filter(item => regex.exec(item) !== null);
			if(!array.length){
				return !1;
			}
			addBtn.setAttribute('disabled', 'disabled');
			importBtn.setAttribute('disabled', 'disabled');
			for(url of array) {
				let rutube = document.createElement('rutube-video');
				app.append(rutube);
				rutube.url = url;
				rutube.automate = true;
				window.scrollTo({
					top: app.offsetHeight,
					left: 0,
					behavior: 'auto'
				});
				await pause(200);
			}
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'auto'
			});
			automateDownload();
		});
		return !1;
	});

	function automateDownload() {
		let array = [...document.querySelectorAll('rutube-video')];
		if(array.length){
			// Отключаем контролы
			addBtn.setAttribute('disabled', 'disabled');
			importBtn.setAttribute('disabled', 'disabled');
			// Определить скачиваемые элементы
			let downs = array.filter((item) => item.download),
				// Определить недостающее количество (до трёх)
				count = 3 - downs.length,
				// Получить первые count элементов из нескачиваемых
				arrs = array.filter((item) => !item.download),
				// Получаем до трёх первых элементов
				newDown = arrs.slice(0, count);
			// Запускаем скачивание на этих элементах
			newDown.forEach((a, b, c) => {
				a.init();
			})
		}else{
			// Включаем контролы
			addBtn.removeAttribute('disabled');
			importBtn.removeAttribute('disabled');
		}
		// Получить массив rutube-video
		// Получить срез в три блока
		// Запустить скачивание
	}

	document.addEventListener('rutube-video:disconnected', (e) => {
		e.stopPropagation();
		e.preventDefault();
		sdk && console.log('rutube-video:disconnected', e);
		setTimeout(() => {
			automateDownload();
		}, 100);
		return !1;
	});

	document.addEventListener('disconnected', (e) => {
		e.stopPropagation();
		e.preventDefault();
		sdk && console.log('disconnected', e);
		setTimeout(() => {
			automateDownload();
		}, 100);
		return !1;
	});

	document.addEventListener('rutube-video:connected', (e) => {
		e.stopPropagation();
		e.preventDefault();
		sdk && console.log('rutube-video:connected', e);
		return !1;
	});

	document.addEventListener('connected', (e) => {
		e.stopPropagation();
		e.preventDefault();
		sdk && console.log('connected', e);
		return !1;
	});

	document.addEventListener('rutube-video:close', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// Удаляем
		e.target.parentNode.removeChild(e.target);
		return !1;
	});

	document.addEventListener('click', (e) => {
		if(e.target.tagName == "A"){
			if(e.target.target == "_blank"){
				e.stopPropagation();
				e.preventDefault();
				let href = e.target.href;
				nw.Shell.openExternal(href);
				return !1;
			}
		}
	});

})();
