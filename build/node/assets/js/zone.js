define( ['js/zone-containers', 'js/planning-docs', 'js/map-layer'], function(ZoneContainers, PlanningDocs, MapLayer){

class Zone{
	constructor( { geometry = {}, attr = {}, planningDocs = {} } = {} ){
		let { lamc_key, gplu_key, ord1_key, ord2_key, hcpu2_key } = attr;

		this._geometry = geometry;
		this._planningDocs = planningDocs;
		this._attr = attr;

		let rings = geometry.rings, bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity

		rings.map( singleGeometry => {
			singleGeometry.map( coord => {
				if ( coord[0] < bx0 ) bx0 = coord[0];
				if ( coord[1] < by0 ) by0 = coord[1];
				if ( coord[0] > bx1 ) bx1 = coord[0];
				if ( coord[1] > by1 ) by1 = coord[1];
			})
		});

		this._geometry.bound = [ [bx0, by0], [bx0, by1], [bx1, by1], [by1, bx1] ];

		this._currentCodeContainers = new ZoneContainers([
			{ key: lamc_key, type: 0, planningDocs: planningDocs },
			{ key: gplu_key, type: 1, planningDocs: planningDocs },
			{ key: ord1_key, type: 5, planningDocs: planningDocs },
			{ key: ord2_key, type: 5, planningDocs: planningDocs }
		]);
		
		this._futureCodeContainers = new ZoneContainers([
			{ key: hcpu2_key, type: 9, planningDocs: planningDocs }
		]);

		this._zoningInfo = this._createZoningInfo();
	}

	_createZoningInfo(){
		let { prop_gplu, prop_zone, subarea, subarea1, cpio } = this.hcpu2Info || {},
				{ _currentCodeContainers, _futureCodeContainers } = this,
				gpluContainer = _currentCodeContainers[1],
				hcpu2Container = _futureCodeContainers[0],
				zoningInfo = {
						e: { 
						zone: this.fullZoneName,
						gplu: this.gpluDescription.gplu_desc,
						gpluNotes: gpluContainer ? [{ type: gpluContainer._type, name: gpluContainer._key, notes: gpluContainer.getNotes() }] : [],
						devStds: {}
					},
					n: {
						hcpu2: this._attr.hcpu2_key,
						hcpu2Notes: hcpu2Container ? [{ type: hcpu2Container._type, name: hcpu2Container._key, notes: hcpu2Container.getNotes() }] : [],
						zone: prop_zone,
						gplu: prop_gplu,
						subArea: subarea && `${subarea} - ${subarea1}`,
						cpio: cpio,
						devStds: {}
					}
				};

		[ 'density', 'far', 'height', 'stories' ].map( key => {
			zoningInfo.e.devStds[key] = this._get(key);
			zoningInfo.e.devStds[key + 'Notes'] = this._currentCodeContainers.traverseNote(key);
			zoningInfo.n.devStds[key] = this._get(key, 1)
			zoningInfo.n.devStds[key + 'Notes'] = this._futureCodeContainers.traverseNote(key);
		});
		zoningInfo.e.devStds.generalNotes = this._currentCodeContainers.traverseNote('generalNotes');
		zoningInfo.n.devStds.generalNotes = this._futureCodeContainers.traverseNote('generalNotes');

		return zoningInfo;
	}

	_get( key = '', when = 0, inherit = false ){
		if ( key === 'zone' ){
			let value_e = this.fullZoneName,
					value_n = this.hcpu2Info && this.hcpu2Info.prop_zone;

			if ( when <= 0 ) return value_e;
			return ( !inherit || value_n ) ? value_n : value_e;
		}

		let len = this._currentCodeContainers.length,
				value_e = this._currentCodeContainers.traverse(key, len + when);

		if ( when <= 0 ) return value_e;

		let value_n = this._futureCodeContainers.traverse(key, when);

		return ( !inherit || value_n >= 0 ) ? value_n : value_e;
	}

	get geometry(){ return this._geometry; }
	get attr(){ return this._attr; }
	get planningDocs(){ return this._planningDocs; }

	get fullZoneName(){
		let { condition, classification, htdist, limitation, overlay } = this._attr;
		return [
			`${( condition || '' ).split('').map( x => `[${x}]`).join('')}${classification}`,
			`${htdist}${limitation || ''}`,
			overlay
		].filter( x => x !== undefined ).join('-');
	}
	
	get gpluDescription(){ return this._planningDocs.get(1).database.get( this._attr.gplu_key ); }
	get hcpu2Info(){ return this._planningDocs.get(9).database.get( this._attr.hcpu2_key ); }

	getZone( when = 0, inherit = false ){ return this._get('zone', when, inherit); }
	getDensity( when = 0, inherit = false ){ return this._get( 'density', when, inherit ); }
	getFAR( when = 0, inherit = false ){ return this._get( 'far', when, inherit ); }
	getHeight( when = 0, inherit = false ){ return this._get( 'height', when, inherit ); }
	getStories( when = 0, inherit = false ){ return this._get( 'stories', when, inherit ); }

	getConstraintFactors( when = 0 ){
	/*
	Assume maximum FAR built-out w/ 0.5 FAR of at-grade commercial gross sf and the rest to be residential;
	assume max. 2 floors of subterranean parking and 3 floors of above-grade parking;
	assume parking space = 350 gross sf / space;
	assume residential parking ratio at 1.75 spaces / DU; 
	assume commercial parking ratio at 2 spaces / 1,000 gross sf;
	assume residential DU = 1,000 gross sf / DU;
	assume residential efficiency factor = 0.825;
	assume commercial efficiency factor = 0.9;
	assume floor area as of lot coverage:
		subterranean parking: 100%;
		1st floor: 90%;
		at-grade and above-grade parking: 90%;
		residential floor; < 8 stories total: 65%;
		residential floor; ≥ 8 stories total: 40%
	assume residential & parking floor-to-floor height = 10';
	assume commercial floor_to_floor height = 15';
	*/
		let zoneClassifiction = this.getZone( when, true ).split('-')[0].replace(/[\[\(].+[\)\]]/, '').replace(/[0-9]/, '');

		if ( !['C', 'R'].includes( zoneClassifiction[0] ) )
			return ['Zone'];

		const FAR_COM = zoneClassifiction[0] === 'C' ? .5 : 0,
					PKNG_FLR_SUB = 2,
					PKNG_FLR_ABOVE = 3,
					PKNG_RATIO_RES = .6125,
					PKNG_RATIO_COM = .7,
					DU_SIZE = 1000,
					EFF_FACTOR_RES = .825,
					EFF_FACTOR_COM = .9,
					LOT_COV_SUB = 1,
					LOT_COV_NONRES = .9,
					LOT_COV_RES_LOW = .65,
					LOT_COV_RES_HIGH = .4,
					FLR_HGHT_RES = 10,
					FLR_HGHT_COM = 15;

		let density = this.getDensity( when, true ),
				far = this.getFAR( when, true ),
				height = this.getHeight( when, true ),
				stories = this.getStories( when, true ),
				far_res = far - FAR_COM;

		height = height === 9999 ? Infinity : height;
		stories = stories === 9999 ? Infinity : stories;

		let actual_du_size = far_res * density / EFF_FACTOR_RES,
				actual_pkng_far = FAR_COM * PKNG_RATIO_COM + far_res * PKNG_RATIO_RES,
				actual_pkng_far_grade_or_above = actual_pkng_far > 2 ? actual_pkng_far - 2 : 0,
				actual_stories_nonres = ( FAR_COM / EFF_FACTOR_COM + actual_pkng_far_grade_or_above ) / LOT_COV_NONRES,
				_actual_stories_res = far_res / EFF_FACTOR_RES / LOT_COV_RES_LOW,
				actual_stories_res = _actual_stories_res * 
														( ( _actual_stories_res + actual_stories_nonres > 8 ) ? LOT_COV_RES_LOW / LOT_COV_RES_HIGH : 1 ),
				actual_stories = Math.ceil( actual_stories_nonres + actual_stories_res ),
				actual_height = ( actual_stories - 1 ) * FLR_HGHT_RES + FLR_HGHT_COM;

		let factors = [
					[ 'FAR', 1 ],
					[ 'Density', actual_du_size / DU_SIZE ],
					[ 'Height', actual_height / height ],
					[ 'Stories', actual_stories / stories ]
				].sort( ( a, b ) => b[1] - a[1] );

		if ( factors[0][1] < factors[1][1] * 1.25 )
			if ( factors[0][1] < factors[2][1] * 1.375 ) return [];
			else return [ factors[0][0], factors[1][0] ];

		return [ factors[0][0] ]
	}

	inquire(){
		let { _attr, _currentCodeContainers, _futureCodeContainers, _zoningInfo } = this;
		return {
			attr: _attr,
			//currentCodeContainers: _currentCodeContainers,
			//futureCodeContainers: _futureCodeContainers,
			zoningInfo : _zoningInfo
		}
	}
	preview(){ return this._zoningInfo; }
}

/**
	*/
class ZoneLayer extends MapLayer{
	constructor({ legend, isActive, name, order, dataURL = '' } = {}){
		let dict = new Map([
					['SHAPE_AREA', 'area'],
					['SHAPE_LEN', 'perim'],	
					['LAMC_KEY', 'lamc_key'],
					['CLASSIFICA', 'classification'],
					['HtDist', 'htdist'],
					['Limitation', 'limitation'],
					['Overlay', 'overlay'],
					['Condition', 'condition'],
					['GPLU_KEY', 'gplu_key'],
					['ORD1_KEY', 'ord1_key'],
					['ORD1', 'ord1'],
					['ORD1SECTNS', 'ord1sectn'],
					['ORD2_KEY', 'ord2_key'],
					['ORD2', 'ord2'],
					['ORD2SECTNS', 'ord2sectn'],
					['HCPU2_KEY', 'hcpu2_key']
				]);

		super({ legend: legend, dict: dict, url: dataURL + 'shp_json/parcel.json', isActive, name, order });
		this._dataURL = dataURL;
	}
	async build(callback){
		await MapLayer.prototype.build.call(this);

		this._planningDocs = new PlanningDocs({ folderURL: this._dataURL + 'planning_docs/' });

		await this._planningDocs.build();
		
		for ( let entry of this.data.entries() )
			this.set( entry[0], new Zone( Object.assign({}, {planningDocs: this._planningDocs}, entry[1]) ) );
		
		return this;
	}

	inquire(fid){ let zone = this.get(fid); return zone ? zone.inquire() : undefined; }
	preview(fid){ let zone = this.get(fid); return zone ? zone.preview() : undefined; }
}

return ZoneLayer;

});
