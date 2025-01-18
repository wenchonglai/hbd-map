const MapLayer = require('./map-layer.js'),
			ZoneLayer = require('./zone.js')

const DATA_URL = 'assets/data/';

class InteractiveMap{
	constructor(){
		this.mapLayers = [
			new MapLayer({ name: 'A-BOUND', order: 1, url: DATA_URL + 'shp_json/boundary.json' }),
			new ZoneLayer({ name: 'A-ZONE', order: 0, dataURL: DATA_URL, isActive: true })
		];
	}
}
	
module.exports = function(){
	return new InteractiveMap();
}