define(['js/map-layer', 'js/zone'], function(MapLayer, ZoneLayer){

const DATA_URL = 'node/assets/data/';

class InteractiveMap{
	constructor(...layers){
		this._mapLayers = [...layers];
	}
	get mapLayers(){ return this._mapLayers; }
	async build(callback){
		let [ l0, l1 ] = this._mapLayers;

		await l0.build().then( () => l1.build() )

		if (callback) await callback();
		
		return this;
	}
}
	
return new InteractiveMap(
	new MapLayer({ name: 'A-BOUND', order: 1, url: DATA_URL + 'shp_json/boundary.json' }),
	new ZoneLayer({ name: 'A-ZONE', order: 0, dataURL: DATA_URL, isActive: true })
);

})