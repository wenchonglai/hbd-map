

const express = require('express'),
			app = express(),
			path = require('path'),
			bodyParser = require('body-parser'),
			fs = require('fs'),
			url = require('url'),
			cors = require('cors'); 

let mapInit = require('./assets/js/map-init.js'),
		Legend = require('./assets/js/legend.js'),
		{ mapLayers } = mapInit(),
		[ , zoneLayer ] = mapLayers;

app.use( cors({credentials: true, origin: 'http://localhost:8080'}) );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( bodyParser.json() );


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

app.get('/', function( request, response, next ){
	
	next();
})

app.use( express.static( __dirname + '/public' ) );

/*
app.post('/create_project_folder', function( request, response ){
	let { createProjectFolder } = require('./assets/js/app/create-project-folder');

	response.send( createProjectFolder(request) );
});

app.post('/create_promo_folder', function( request, response ){
	let { createPromoFolder } = require('./assets/js/app/create-promo-folder');

	response.send( createPromoFolder(request) );
});



app.post('/upload', function( request, response ){
	response.send({'result': request});
});
*/

app.listen(8080);