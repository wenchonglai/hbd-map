(function( app ){

	window.WIDTH_MAP = 1280 * window.devicePixelRatio;
	window.HEIGHT_MAP = 832 * window.devicePixelRatio;

	app.then( app => {
		window.fetch = fetch;
		window.app = app;
		init(); 
	});
})(app)

