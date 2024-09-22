(() => {
	customElements.define("rutube-video", RutubeVideo);
		// Контейн6р
	const app = document.querySelector('#app'),
		// Кнопка добавления
		addBtn = document.querySelector('.btn-add');

	addBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// Добавляем
		let rutube = document.createElement('rutube-video');
		app.append(rutube);
		return !1;
	});

	document.addEventListener('rutube-video:input', (e) => {
		e.stopPropagation();
		e.preventDefault();
		return !1;
	});

	document.addEventListener('rutube-video:close', (e) => {
		e.stopPropagation();
		e.preventDefault();
		// Удаляем
		e.target.parentNode.removeChild(e.target);
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
})();
