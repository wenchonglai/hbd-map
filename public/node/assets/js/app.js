define(['js/express', 'js/map-init', 'js/legend', 'js/fetch'], function( express, interactiveMap, Legend, fetch ){

let app = express(),
		callback = interactiveMap => {
			let { mapLayers } = interactiveMap,
					[ , zoneLayer ] = mapLayers;
			
			app.post('/get_map', function( request, response, next ){
				let { legends } = request.body,
						retVal;

				retVal = mapLayers.map( ( layer, i ) => layer.getData( new Legend( legends[i] ) ) );

				response.send( retVal );
			});

			app.post('/get_zone', function( request, response, next ){
				let {fid} = request.body;
				response.send( zoneLayer.inquire(fid) );
			});

			window.fetch = fetch;
			window.app = app;

			return app;
		};

return interactiveMap
	.build()
	.then( callback )
	.then( () => app );
})