(() => {

	/**
	 * Set position
	 */
	const win = nw.Window.get();
	nw.Screen.Init();
	var w = nw.App.manifest.window.width,
		h = nw.App.manifest.window.height;

	//w = state ? w : w;
	let screen = nw.Screen.screens[0],
		x = parseInt(screen.bounds.x + (screen.bounds.width - w) / 2) || 0,
		y = parseInt(screen.bounds.y + (screen.bounds.height - h) / 2) || 0,
		wid = screen.work_area.width,
		hei = screen.work_area.height;

	h = h > hei ? hei : h;
	w = w > wid ? wid : w;

	win.restore();
	win.moveTo(x, y);
	win.setMinimumSize(w, h);
	win.resizeTo(w, h);
})()
