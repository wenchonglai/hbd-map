define( ['js/fs'], function(fs){

const MapLayer = class{
	constructor({ isActive = false, name = '', order = -1, dict, url } = {}){
		this._url = url;
		this._data = new Map();
		this._name = name;
		this._isActive = isActive;
		this._order = order;
		this._dict = dict;
	}

	async build(callback){
		await fs.readFile( this._url, ( err, data ) => {
			let jsonObject = JSON.parse( data, 'utf-8' );

			jsonObject.features.map( feature => {
				let { attributes, geometry } = feature,
						attr = {};

				Reflect.ownKeys(attributes).map( key => {
					let val = attributes[key],
							alias = this._dict && this._dict.get(key);
					
					if ( typeof val === 'string' ){
						val = attributes[key] = val.replace(/\ *$/, '');
						if ( !val.length ) attributes[key] = undefined;
					}

					attr[ alias || key.toLowerCase() ] = attributes[key];
				});

				this.set( attributes.FID, { geometry: geometry, attr: attr } );
			});
		});

		if ( callback ) await callback();
		return this;
	}

	get(...args){ return this._data.get(...args); }
	set(...args){ return this._data.set(...args); } 
	get data(){ return this._data; }

	getData(legend){
		let data = [];

		for ( let [ key, entry ] of this.data.entries() ){
			data.push({
				fid: key,
				geometry: entry.geometry, 
				styles: legend && legend.get(entry)
			});
		}

		return { data: data, isActive: this._isActive, name: this._name, order: this._order };
	}
}

return MapLayer;

})