(() => {

	const win = nw.Window.get();
	nw.Screen.Init();
	/**
	 * Set position
	 */
	const windowSetPosition =  function() {
		let screen = nw.Screen.screens[0],
			x = parseInt(screen.bounds.x + (screen.bounds.width - w) / 2) || 0,
			y = parseInt(screen.bounds.y + (screen.bounds.height - h) / 2) || 0,
			w = nw.App.manifest.window.width,
			h = nw.App.manifest.window.height,
			wid = screen.work_area.width,
			hei = screen.work_area.height;
		h = h > hei ? hei : h;
		w = w > wid ? wid : w;
		win.restore();
		win.moveTo(x, y);
		win.setMinimumSize(w, h);
		win.resizeTo(w, h);
	}
	windowSetPosition();
	/**
	 * Close 
	 */
	win.on('close', function(){
		windowSetPosition();
		this.close(true);
	});
})()
