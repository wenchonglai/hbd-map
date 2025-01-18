{
const DATA_URL = './public/assets/data/';

async function readFile(file) {
	return new Promise(res => {
		var rawFile = new XMLHttpRequest();

		rawFile.open("GET", file, false);
		rawFile.onreadystatechange = function (){
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					var allText = rawFile.responseText;

					res(allText)
				}
			}
		}
		rawFile.send(null);
	})
}


class BSTNode{
	constructor({ key, value }){
		this._key = key;
		this._value = value;
		this._lc = null;
		this._rc = null;
		this._parent = null;
		this._height = 1;
	}
	get lc(){ return this._lc; }
	set lc(node){ this._lc = node; }
	get isLeft(){ return !!this.parent && this.parent.lc === this; }
	get leftMost(){ let node = this, hot; while ( node = ( hot = node ).lc ); return hot; }
	
	get rc(){ return this._rc; }
	set rc(node){ return this._rc = node; }
	get isRight(){ return !!this.parent && this.parent.rc === this; }
	get rightMost(){ let node = this, hot; while ( node = ( hot = node ).rc ); return hot; }

	get parent(){ return this._parent; }
	set parent(node){ this._parent = node; }

	get height(){ return this._height; }
	set height(value){ this.height = value; }

	get key(){ return this._key; }
	get value(){ return this._value; }
	
	get pred(){
		let node = this;
		
		if ( node.lc ) return node.lc.rightMost;
		
		while ( node.isLeft ) node = node.parent;
		return node.parent;
	}
	get succ(){
		let node = this;
		
		if ( node.rc ) return node.rc.leftMost;
		
		while ( node.isRight ) node = node.parent;
		return node.parent;
	}

	updateHeight(){
		this._height = Math.max( ( this.lc ? this.lc.height : 0 ), ( this.rc ? this.rc.height : 0 ) ) + 1;
		return this._height;
	}
}

class BST{
	constructor(...BSTNodes){
		this._root = null;
		this._size = 0;
		BSTNodes.map( node => this.insert(node) );
	}
	get root(){ return this._root; }
	set root(node){ this._root = node; }
	get height(){ return this.root ? this.root.height : 0; }

	updateHeight( node, height = node.height ){
		let parent, parentHeight;

		node.updateHeight();

		while ( ( parent = node.parent ) )
			if ( ( parentHeight = ( node = parent ).height ) === parent.updateHeight() )
				break;

		return node.height;
	}

	insert(node){
		if ( !( node instanceof this.constructor.NodeClass ) ) node = new this.constructor.NodeClass(node);

		let hot = true, curr = this._root;
		
		if ( !curr ) this.root = node;
		else {

			while ( curr ) curr = ( node.key < ( hot = curr ).key ) ? curr.lc : curr.rc;

			if ( node.key < hot.key ) hot.lc = node;
			else hot.rc = node;

			node.parent = hot;
		}

		this._size++;
		this.updateHeight(node);

		return this;
	}
	remove(node){
		let p = node.parent, childNode = null;

		if ( !node.lc && !node.rc ); 
		else if ( !node.lc ) childNode = node.rc;
		else if ( !node.rc ) childNode = node.lc;
		else {
			childNode = this.remove( node.lc.rightMost );
			childNode.lc = node.lc;
			childNode.rc = node.rc;
			node.lc.parent = node.rc.parent = childNode;
		}
		
		if (p)
			if ( node.isLeft ) p.lc = childNode; else p.rc = childNode;

		if ( this.root === node ) this.root = childNode;

		if ( childNode ){
			childNode.parent = p;
			this.updateHeight( childNode );
		}

		node.parent = null;
		
		return node;
	}

	search( key, { isContinuous = false } = {} ){
		let node = this.root, hot = null;

		while ( node ){
			if ( node.key === key ) break;
			node = ( key < ( hot = node ).key ) ? node.lc : node.rc;
		}
		return isContinuous ? ( node ? node : key < hot.key ? hot.pred : hot ) : node;
	}

	map(fn) {
		let curr = this.root;

		if (!curr) return

		const results = []
		const i = 0

		while (curr) {
			results.push(fn(curr, i))
			curr = curr.succ
		}

		return results
	}
}

BST.NodeClass = BSTNode;

function getAverage( key, n1, n2 ){
	let k1 = n1.key, k2 = n2.key, v1 = n1.value, v2 = n2.value, v = ( v1 instanceof Array ) ? [] : Object.create(v1);

	if ( n1.key === n2.key ) return v1;
	
	Reflect.ownKeys(v1).map( k => {
		if ( v1[k] instanceof Object ) return v[k] = getAverage( key, { key: k1, value: v1[k] }, { key: k2, value: v2[k] } );

		v[k] = v1[k] + ( v2[k] - v1[k] ) * ( key - k1 ) / ( k2 - k1 );
	});
		return v;
}

const RESTRICTED_WORDS = [],
			RESERVED_WORDS = [
				'if', 'then', 'else', 'case', 'switch', 'default',
				'for', 'while', 'do', 'of', 'from', 'in', 'break', 'continue',
				'class', 'function', 'arguments', 'var', 'const', 'let', 
				'typeof', 'instanceof',
				'this', 'new', 'super',
				'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'return',
				'Math', 'Array', 'String', 'Number', 'Date', 'JSON',
				'undefined', 'null', 'Infinity', 'NaN',
				'true', 'false',
				'console'
			];

function parseEvalString(str){
	str = str
		.split(/([#$_\.\"\'a-zA-Z][#$_a-zA-Z0-9]*)/g)
		.map( ( x, i ) => {
			if ( i % 2 ){
				if ( RESTRICTED_WORDS.includes(x) ) throw new SyntaxError(`${x} is restricted in the expression.`);
				else if ( x.length && !x[0].match(/[\.\"\'"]/) && !RESERVED_WORDS.includes(x) )
					return `this.${x}`;
				else return x;
			}
			return x;
		}).join('');

	fn = eval(`() => function evalFn() { return ${str}; }`)

	return fn()
}

class Legend{
	constructor( {
		func = '',
		symbologies = [],
		showOther = false,
		} = {}
	){
		this._symbologies = symbologies.map( symbology => {
			let legend = symbology.legend;

			if ( typeof symbology.func === 'string' ){ symbology.func = parseEvalString(symbology.func); }

			symbology.legend = new BST();

			legend.map(entry =>
				symbology.legend.insert({ key: entry.key, value: entry.value })
			)

			return symbology;
		});
		
		this._showOther = showOther;
	}
	get(feature){
		let styles = this._symbologies.map( symbology => {
			let key = symbology.func.call(feature),
					node1 = symbology.legend.search( key, { isContinuous: symbology.isContinuous } ),
					node2 = node1 && node1.succ;

			return ( symbology.isGradient && node1 && node2 ) ? getAverage( key, node1, node2 ) : ( node1 ? node1.value : undefined );
		})
		.filter( value => value !== undefined );

		return styles;
	}
}

class ZoneContainer{
	constructor({ key = '', type = '', planningDocs = {} } = {}){
		try {
			var planningDoc = planningDocs.get(type),
					data = planningDoc.database.get(key.replace(/\?/g, '')),
					{ density, density_notes, far, far_notes, height, height_notes, stories, stories_notes, general_notes } = data;
		}
		catch(e){ this._key = undefined; return; }

		this._key = key;
		this._typeCode = type;
		this._type = planningDocs._docIndex.get(type).document;

		[ 'density', 'far', 'height', 'stories', 'general' ].map( key => {
			let dataEntry = data[key];
			if ( dataEntry !== -1 ){
				if ( key !== 'general' ) this[ '_' + key ] = dataEntry;
				this[ '_' + key + 'Notes' ] = data[ key + '_notes' ].map( note => note ? Object.assign( { name: note }, planningDoc.reference.get(note) ) : undefined ).filter( x => x );
			}
		});

		this._key.match(/\?/) && this._generalNotes.push( { name: '?', text: 'Community Plan subarea for this land use is based on JKA assumptions. However, it is not specified in any published planning document.' } )
	}

	get key(){ return this._key; }
	get density(){ return this._density; }	
	get far(){ return this._far; }
	get height(){ return this._height; }
	get stories(){ return this._stories; }

	getNotes(noteType){
		switch ( String(noteType).toLowerCase() ){
			case '1':; case 'density': return this._densityNotes;
			case '2':; case 'far': return this._farNotes;
			case '3':; case 'height': return this._heightNotes;
			case '4':; case 'stories': return this._storiesNotes;
			default: return this._generalNotes;
		}
	}
}

/**
	*/
class ZoneContainers extends Array{
	constructor( containers = [], { planningDocs } = {} ){
		super();
		//if ( !(containers instanceof Array) ) containers = [containers];

		containers.map( container => this.insert( new ZoneContainer(container) ) );
	}
	insert(container){ ( container instanceof ZoneContainer ) && this.push(container); }
	traverse( key, iterations = Infinity ){
		let retVal, i = 0;

		for ( let container of this ){
			if ( !container._key ) continue;
			if( ++i > iterations ) break;

			if ( container[key] !== undefined && container[key] !== -1 )
				retVal = container[key];
		}

		return retVal;
	}
	traverseNote( key, iterations = Infinity ){
		let retVal = [], i = 0;

		for ( let container of this ){
			if ( !container._key ) continue;
			if ( ++i > iterations ) break;

			let notes = container.getNotes(key);
			notes.length && retVal.unshift({ type: container._type, name: container._key, notes: notes })
		}

		return retVal;
	}
}

/** comma separated text to variable
  * @param text:		raw comma separated text
  * @param classes:	
  * @param _n:			additional times cstToArray to be executed
  *	return:					an Array object
  */
function cstToVar(text, classes){
	switch (classes[0]){
		case Array: return text.split(/\,\ */).map( x => cstToVar( x, classes.slice(1) ) );
		case Date: return new Date( Number(text.slice(0,4)), Number( text.slice(4,6) - 1 ), Number( text.slice(6, 8) ) ); //yyyymmdd
		case String: return text.replace(/\ +$/, '');
		case Number: return text == -1 ? undefined : Number(text);
		case Boolean: return !!text;
		default: return classes[0](text);
	}
}

/** tab separated text to Object
  * @param text:	raw tab separated text
  *	return:				a Map object
  */
function txtToObject(text){ 
	let [ keys, dataTypes, ...arr ] = text.split('\n').map( row => row.split('\t') ),
			retVal = new Map();

	keys = keys.map( str => str.toLowerCase() );
	dataTypes = dataTypes.map( str => 
		str.split('|').map( ( text, i, a ) => {
			switch (text.toLowerCase()){
				case 'array': return Array;
				case 'string': return String;
				case 'number': return Number;
				case 'date': return Date;
				case 'boolean': return Boolean;
			}
		})
	);

	arr.map( entry => {
		let [ key, ...values ] = entry.map( ( x, i ) => cstToVar( x, dataTypes[i] )),
				object = {};

		values.map( ( value, i ) => { object[ keys[ i + 1 ] ] = value } ); 
		retVal.set( key, object );
	});

	return retVal;
}

class PlanningDocs extends Map{
	async init(folderURL = '') {
		const docIndexText = await readFile( folderURL + 'document_index.txt');
		this._docIndex = txtToObject( docIndexText );

		await Promise.all(
			this._docIndex.entries().map(async ([key, {file_name, document}]) => {
				try {
					if (!file_name) return;
					
					const databaseFile = await readFile( folderURL + file_name + '.txt')
					const refereceFile = await readFile( folderURL + file_name + '_ref.txt')

					this.set( key, {
						name: document,
						database: txtToObject(databaseFile),
						reference: txtToObject(refereceFile)
					});
				} catch (e) {
					// do nothing
				}
			})
		)
	}
}


const MapLayer = class{
	constructor({ isActive = false, name = '', order = -1, url } = {}){
		this._data = new Map();
		this._name = name;
		this._isActive = isActive;
		this._order = order;
		this._url = url
	}

	async init(dict) {
		const fileData = await readFile(this._url)

		let jsonObject = JSON.parse( fileData );

		jsonObject.features.map( feature => {
			let { attributes, geometry } = feature,
					attr = {};

			Reflect.ownKeys(attributes).map( key => {
				let val = attributes[key],
						alias = dict && dict.get(key);
				
				if ( typeof val === 'string' ){
					val = attributes[key] = val.replace(/\ *$/, '');
					if ( !val.length ) attributes[key] = undefined;
				}

				attr[ alias || key.toLowerCase() ] = attributes[key];
			});

			this.set( attributes.FID, { geometry: geometry, attr: attr } );
		});
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
		console
		let { condition, classifica: classification, htdist, limitation, overlay } = this._attr;
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

		super({ legend: legend, dict: dict, url: dataURL + '/shp_json/parcel.json', isActive, name, order });

		this._dataURL = dataURL;
	}
	async init() {
		this._planningDocs = new PlanningDocs();

		await MapLayer.prototype.init.call(this)

		await this._planningDocs.init(this._dataURL + 'planning_docs/');

		for ( let entry of this.data.entries() )
			this.set( entry[0], new Zone( Object.assign({}, {planningDocs: this._planningDocs}, entry[1]) ) );
	}

	inquire(fid){ let zone = this.get(fid); return zone ? zone.inquire() : undefined; }
	preview(fid){ let zone = this.get(fid); return zone ? zone.preview() : undefined; }
}

class InteractiveMap{
	constructor(){
		this.mapLayers = [
			new MapLayer({ name: 'A-BOUND', order: 1, url: DATA_URL + 'shp_json/boundary.json' }),
			new ZoneLayer({ name: 'A-ZONE', order: 0, dataURL: DATA_URL, isActive: true })
		];
	}
	async init() {
		await this.mapLayers[0].init()
		await this.mapLayers[1].init()
	}
}

const interactiveMap = new InteractiveMap();
interactiveMap.init();
const { mapLayers } = interactiveMap
const [ , zoneLayer ] = mapLayers;

const getMapAPI = legends => mapLayers.map( ( layer, i ) => layer.getData( new Legend( legends[i] ) ) );
const getZoneAPI = fid => zoneLayer.inquire(fid)

let createSideBarItem = function({ title = 'title', data = [], parent } = {}){
	if ( data.length ) return React.createElement( $SideBarItem, { title: title, data: data, parent: parent } );
}

let createDevStdSideBarItem = function( devStds, parent ){
	let _devStds = {};

	Reflect.ownKeys( devStds ).map( key => {
		let val = devStds[key];
		_devStds[key] = val < 0 ? undefined : ( val === 0 ? 'Not Allowed' : ( val === 9999 ? 'Unlimited' : val ) );
	});

	let { density, densityNotes, far, farNotes, height, heightNotes, stories, storiesNotes } = _devStds;

	return [
		density && createSideBarItem({
			title: 'Max. Allowable Density', data: [{ item: isNaN(density) ? density: `1 DU / ${density} lot sf` , notes: densityNotes }], parent: parent
		}),
		far && createSideBarItem({ title: 'Max. Allowable FAR', data: [{ item: isNaN(far) ? far: `${far} : 1`, notes: farNotes }], parent: parent }),
		height && createSideBarItem({
			title: 'Max. Allowable Height',
			data: [{
				item: isNaN(height) ? ( isNaN(stories) ? height : `${stories} stories` ) : `${height} ft${ isNaN(stories) ? '' : ` & ${stories} stories` }`,
				notes: heightNotes && heightNotes.concat(storiesNotes)
			}],
			parent: parent
		})
	];
}

const $DataExplanation = class extends React.Component{
	constructor(...args){ super(...args); }
	render(){
		let notes = this.props.notes, url = '';

		return React.createElement('div', Object.assign( { className: 'explanation' }, this.props ),
			...notes.map( note => React.createElement( 'div', { className: 'note-type' }, 
				...note.notes.map( noteItem => 
					React.createElement('div', null,
						React.createElement( 'a', {
								target: '_blank',
								href: url = ( ( noteItem.url && noteItem.url.length ) ? noteItem.url : url )
							},
							`${note.type} ${noteItem.name.match(/\*+/) ? `${note.name}${noteItem.name}` : noteItem.name.replace(/\.?\$/, ' Para. ')}: `
						),
						React.createElement( 'span', null, noteItem.text )
					)
				)
			))
		);
	}
}

const $SideBarItemData = class extends React.Component{
	constructor(...args){ super(...args); this.state = { toggle: 0 } }
	toggle(){
		this.setState({ toggle: this.state.toggle^1 } );
	}
	handleClick(){
		this.toggle();
	}
	render(){
		let { item, notes = [] } = this.props;

		return React.createElement('div', { className: 'sidebar-item-data' },
			React.createElement( 'div', {
					className: 'value', onClick: notes.length ? this.handleClick.bind(this) : undefined
				},
				this.props.item,
				notes.length ? React.createElement('sup', { className: 'read-more' }, `(${ this.state.toggle ? 'Hide' : 'Show' } Notes)` ) : null
			),
			React.createElement( $DataExplanation, { ref: 'explanation', className: 'explanation', toggle: this.state.toggle, notes: notes } )
		)
	}
}

const $SideBarItem = class extends React.Component{
	render(){
		return React.createElement('div', { className: 'sidebar-item' },
			React.createElement('div', { className: 'sidebar-item-title' }, this.props.title ),
			React.createElement('div', { className: 'sidebar-item-body' }, 
				...this.props.data
					.filter( data => data )
					.map( data => React.createElement( $SideBarItemData, { item: data.item, notes: data.notes, parent: this } ) )
			)
				
		);
	}
}

const $SideBarData = class extends React.Component{
	render(){
		if ( !this.props.data ) return React.createElement('div', null);

		let { attr, zoningInfo } = this.props.data,
				{ ord1_key, ord2_key } = attr,
				ords = [];

		return React.createElement('div', null,
			React.createElement('div', { className: 'header', children: ['Existing Planning and Zoning'] } ),
			React.createElement('div', { className: 'content' },
				createSideBarItem({ title: 'General Plan Land Use', data: [{ item: zoningInfo.e.gplu, notes: zoningInfo.e.gpluNotes }], parent: this.props.parent }),
				createSideBarItem({ title: 'Zoning', data: [{ item: zoningInfo.e.zone }], parent: this.props.parent }),
				createSideBarItem({
					title: 'Planning Cases',
					data: [ ord1_key, ord2_key ].map( key => ({ item: key, notes: zoningInfo.e.devStds.generalNotes.filter( x => x.name === key) }) ),
					parent: this.props.parent
				}),
				...createDevStdSideBarItem( zoningInfo.e.devStds, this.props.parent )
			),
			zoningInfo.n.subArea && React.createElement('div', { className: 'header', children: ['HCPU2 Information'] } ),
			zoningInfo.n.subArea && React.createElement('div', { className: 'content' },
				createSideBarItem({ title: 'Proposed General Plan Land Use', data: [{ item: zoningInfo.n.gplu }], parent: this.props.parent }),
				createSideBarItem({ title: 'Proposed Zone', data: [{ item: zoningInfo.n.zone }], parent: this.props.parent }),
				createSideBarItem({ title: 'Subarea', data: [{ item: zoningInfo.n.hcpu2 , notes: zoningInfo.n.hcpu2Notes }], parent: this.props.parent }),
				createSideBarItem({ title: 'Subarea Type', data: [{ item: zoningInfo.n.subArea }], parent: this.props.parent }),
				createSideBarItem({ title: 'CPIO', data: [{ item: zoningInfo.n.cpio ? 'Yes' : 'No' }], parent: this.props.parent }),
				...createDevStdSideBarItem( zoningInfo.n.devStds, this.props.parent )
			)
		);
	}
}

const $Selectable = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { highlight: 0, select: 0 };
	}
	handleClick(){
		this.setState({ select: this.state.select^1 });
	}
	handleMouseEnter(){
		this.setState({ highlight: 1 });
	}
	handleMouseLeave(){
		this.setState({ highlight: 0 });
	}
	render(){
		return React.createElement(
			'div',
			Object.assign( {
				onClick: function(){
					return function(){
						this.parent && this.parent.handleClick && this.parent.handleClick.call(this.parent);
						this.handleClick.call(this)
					}
				},
				onMouseEnter: this.handleMouseEnter.bind(this),
				onMouseLeave: this.handleMouseLeave.bind(this),
				select: this.state.select,
				highlight: this.state.highlight },
				this.props ),
			...( this.props.children instanceof Array ? this.props.children : [ this.props.children ] )
		);
	}
}

const $Selectables = class extends React.Component{
	constructor(...args){
		super(...args);
	}
	render(){
		return React.createElement(
			'div',
			this.props,
			this.props.header && this.props.header,
			...( this.props.children instanceof Array ? this.props.children : [ this.props.children ] )
		)
	}
}

let createLayerSelectable = function({ key, text }){
	return React.createElement( $Selectable, { className: 'data-layer', onClick: this.handleClick(key).bind(this), }, text );
}

const $Setting = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { toggle: 0, className: '' }
	}
	toggle(){
		this.setState({ toggle: this.state.toggle^1 })
	}
	handleClick(key){
		let { parent, projection } = this.props;
		return function(){
			this.toggle();
			parent.props.legendMaps.get('A-ZONE').activeKey = (key); 
			parent.getMap.call( parent );
		}
	}
	render(){
		let parent = this.props.parent;

		return React.createElement('div', Object.assign( { className: 'setting', toggle: this.state.toggle }, this.props, { parent: undefined } ),
			React.createElement('div', { className: 'mask', onClick: this.toggle.bind(this) } ),
			React.createElement('div', { className: 'control-pane' },
				React.createElement('a', { onClick: parent.toSVG.bind(parent) }, 'Export Map'),
				React.createElement( $Selectables,
					{ className: 'layers',
						header: React.createElement('div', { className: 'header' },
							'Data Layers',
							React.createElement('div', { className: 'notes' },
								React.createElement('div', null, 'Existing conditions recorded on 09/01/2018.'),
								React.createElement('div', null, 'Proposed HCPU2 regulations based on the 05/2017 draft.'),
							)
						)
					},
					...parent.state.layers
						.map( layer => 
							layer.isActive ? React.createElement('div', { className: 'content' },
								...Array.from( parent.props.legendMaps.get( layer.name ).entries() )
									.map( x => createLayerSelectable.call( this, { key: x[0], text: x[1].name }) )
							) : null
						)
				)
			)
		);
	}
};

const $SearchPane = class extends React.Component{
	constructor(...args){ super(...args) }
	async handleSearch(address){
		if ( address.split(',').length < 2 ) address = `${address}, 'Hollywood, Los Angeles, California`; 
		return await geocode(address);
	}
	toggleSetting(){
		let $setting = this.props.parent.refs.setting;
		$setting && $setting.toggle();
	}
	render(){
		return React.createElement('div',
			{ className: 'search-pane' },
			React.createElement('button', { className: 'menu', onClick: this.toggleSetting.bind(this) }),
				React.createElement('input', { ref: 'input', className: 'search', placeholder: 'Search by address...' }),
				React.createElement('button', {
					className: 'search',
					onClick: () =>
						$SearchPane.prototype.handleSearch( this.refs.input.value )
							.then( data => {
								let coord = new Coord(data), parent = this.props.parent,
										{ nad, gcs, screen } = parent.props.projection;

								return $ContentPanel.prototype.getZone.call( parent, coord, { coordType: 'gcs', zoom: true } )
							})
							.catch( e => { throw e; alert(`Cannot find address '${this.refs.input.value}'. Try again.`) })
				})
		)
	}
}

const $DraggablePanel = class extends React.Component{
	render(){
		return React.createElement('div', Object.assign( {}, this.props, { dragbar: undefined }), 
			React.createElement('div', { className: 'drag-content' }, this.props.children ),
			this.props.dragbar || null
		)
	}
}

const $SideBar = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { toggle: 1 }
	}
	toggle(){
		this.setState({ toggle: this.state.toggle^1 });
	}
	
	render(){
		

		return React.createElement( $DraggablePanel, 
			{ className: 'side-bar',
				toggle: this.props.toggle,
				dragbar: null
			},
			React.createElement('div', { className: 'info-pane' },
				React.createElement('div', { className: 'zoning-info', ref: 'zoningInfo' })
			)
		)
	}
};

const loadImage = async function(url){
	return await new Promise( (resolve, reject) => {
		let img = new Image();
		img.src = url;
		img.onload = () => { resolve(img) };
		img.onerror = e => { reject(e) };
	});
}

const $PopUp = class extends React.Component{
	constructor(...args){ super(...args); this.state = { touches: [] } }
	render(){
		let self = this,
				{ touches, state } = this.state;

		return React.createElement('div', { className: 'pop-up' },
			React.createElement('div', null, state ),
			React.createElement('div', null, touches.length ),
			...( touches ? touches.map( ( touch, i ) =>
					React.createElement('div', null,
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'pageX: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.pageX.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'pageY: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.pageY.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'screenX: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.screenX.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'screenY: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.screenY.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'offsetX: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.offsetX.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'offsetY: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.offsetY.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'left: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.left.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'top: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.top ),
						)
					)
				) : []
			)
		);
	}
}

const getOffset = function(touch){
	let { pageX, pageY, screenX, screenY, target } = touch,
			{ left, top } = target.getBoundingClientRect();

	left += window.scrollX;
	top += window.scrollY;

	return { offsetX: pageX - left, offsetY: pageY - top, left: left, top: `${top},${window.scrollY}` };
}

const $MapCanvas = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { touches: [], animation: { timer: 0 }, listeners: [], baseMap: { foregroundImg: undefined, backgroundImg: undefined } }
	}
	async loadBaseMap(backgroundURL, foregroundURL){
		[ this.state.baseMap.backgroundImg, this.state.baseMap.foregroundImg ] = await Promise.all([ loadImage(backgroundURL), loadImage(foregroundURL) ]);
	}
	get ctx(){ return this._ctx; }
	componentDidMount(){
		let ctx = this.refs.canvas.getContext('2d'),
				parent = this.props.parent,
				elem = ReactDOM.findDOMNode(this),
				func =  e => {
					this.handleTouch.call(this, e);
					e.preventDefault();
				},
				listenerArgs = [ 'touchmove', func ];

		elem.addEventListener(...listenerArgs, { passive: false });
		
		ctx.width = this.props.width;
		ctx.height = this.props.height;
		ctx.scale( window.devicePixelRatio, window.devicePixelRatio );

		this.state.listeners.push(listenerArgs);
		this._ctx = ctx;
		
		this
			.loadBaseMap( './public/assets/img/basemap-background.png', './public/assets/img/basemap-foreground.png' )
			.then( () => {
				parent.props.legendMaps.get('A-ZONE').activeKey = getUrlParameters().legend || 'gplu';
				parent.getMap()
					.then( () => parent.resize() ); 
			});
	}
	componentWillUnMount(){
		this.state.listeners.map( entry => elem.removeEventListener( ...entry, { passive: false }) );
		
	}
	move(dx, dy){
		if ( dx || dy ){
			let { projection } = this.props.parent.props;
			
			projection.screen.x += dx;
			projection.screen.y += dy;

			cancelAnimationFrame(this.state.animation.timer);
			this.state.animation.timer = requestAnimationFrame( this.redraw.bind(this) );
		}
	}

	handleMouseMove(e){
		let { parent } = this.props;
		if ( !parent.state || !parent.state.layers ) return;
		e.persist();

		let { nad, gcs, screen } = parent.props.projection,
				{ layers } = parent.state,
				coord = new Coord([e.nativeEvent.offsetX, e.nativeEvent.offsetY]).project( screen, nad ),
				arr = layers
					.map( ( layer, i ) => {
						let thisLayer = parent.state.layers[i];

						if ( layer.isActive && thisLayer ) layer.highlighted = layer.data.filter( featureData => coord.isWithin(featureData.geometry.rings) );
						else layer.highlighted = [];
					})

		cancelAnimationFrame(this.state.animation.timer);
		this.state.animation.timer = requestAnimationFrame( this.redraw.bind(this) );
	}

	handleClick(e){
		let parent = this.props.parent;

		if (!parent.state || !parent.state.layers) return;

		let { nad, gcs, screen } = parent.props.projection,
				coord = new Coord([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);

		parent.getZone(coord).catch( e => {} );
	}

	handleTouchStart(e){
		let touches = Array.from( e.touches ).map( touch => Object.assign( touch, getOffset(touch) ) );

		//if ( touches.length < 2 ) return;

		this.setState({ touches: touches });

		this.handleDragStart(touches[0]);
	}

	handleTouch(e){

		let touches = Array.from( e.touches ).map( touch => Object.assign( touch, getOffset(touch) ) ),
				[ c0, c1 ] = this.state.touches,
				[ new_c0, new_c1 ] = touches;
		//if ( touches.length < 2 ) return;
	
		this.setState({ touches: touches });

		c1 = c1 || c0;
		new_c1 = new_c1 || new_c0;

		let offsetX = ( c1.offsetX + c0.offsetX ) / 2,
				offsetY = ( c1.offsetY + c0.offsetY ) / 2,
				new_offsetX = ( new_c1.offsetX + new_c0.offsetX ) / 2,
				new_offsetY = ( new_c1.offsetY + new_c0.offsetY ) / 2,
				dx = new_offsetX - offsetX,
				dy = new_offsetY - offsetY,
				distX = c1.offsetX - c0.offsetX,
				distY = c1.offsetY - c0.offsetY,
				new_distX = new_c1.offsetX - new_c0.offsetX,
				new_distY = new_c1.offsetY - new_c0.offsetY,
				dist = ( distX ** 2 + distY ** 2 ) ** .5,
				new_dist = ( new_distX ** 2 + new_distY ** 2 ) ** .5,
				dDist = Math.abs(new_dist - dist),
				dZoom = ( new_dist - dist ) / dist;

		this.move( dx, dy );
		dist > 20 && dDist > ( dx ** 2 + dy ** 2 ) ** .5 && new_dist && this.zoom( new_offsetX, new_offsetY, dZoom > .5 ? .5 : ( dZoom < -.5 ? -.5 : dZoom ) )
	}

	handleTouchEnd(e){
		let touches = Array.from( e.touches ).map( touch => Object.assign( touch, getOffset(touch) ) );

		this.setState({ touches: touches });
	}

	handleDragStart(e){
		let touch = this.state.touches[0] = e.nativeEvent || e,
				{ offsetX, offsetY, dataTransfer } = touch;

		dataTransfer && dataTransfer.setDragImage(document.getElementById('drag-image'), 0, 0);
		cancelAnimationFrame(this.state.animation.timer);
	}
	
	
	handleDrag(e){
		let touch = this.state.touches[0],
				newTouch = e.nativeEvent || e,
				dx = newTouch.offsetX - touch.offsetX, dy = newTouch.offsetY - touch.offsetY;
				this.state.touches[0] = newTouch;

		if ( newTouch.type !== 'dragend' && newTouch.screenX && newTouch.screenY )
			this.move(dx, dy);
	}

	handleDragEnd(e){
		this.setState({ touches: [] });
		return this.handleDrag(e);
	}

	zoom( x, y, dZoom ){
		if ( !dZoom ) return;

		let { nad, gcs, screen } = this.props.parent.props.projection;

		if ( dZoom && screen.zoom > screen.zoomMin || dZoom > 0 && screen.zoom < screen.zoomMax ){
			screen.x -= ( x - screen.x ) * dZoom / screen.zoom,
			screen.y -= ( y - screen.y ) * dZoom / screen.zoom,
			screen.zoom += dZoom;
		}

		cancelAnimationFrame(this.state.animation.timer);
		this.state.animation.timer = requestAnimationFrame( this.redraw.bind(this) );
	}
	handleWheel(e){
		let touch = e.nativeEvent || e,
				{ nad, gcs, screen } = this.props.parent.props.projection;
		
		this.zoom( touch.offsetX, touch.offsetY, -touch.deltaY * 1 / 512 )
	}

	redraw(mode){
		let { parent } = this.props;
		if ( !parent || !parent.state ) return;

		let projection = parent.props.projection,
				{ nad, screen } = projection,
				coord = new Coord(6455481.543734974, 1863309.72102292).project( nad, screen ),
				ctx = this.ctx;

		ctx.clearRect( 0, 0, this.props.width, this.props.height );
		ctx.drawImage( this.state.baseMap.backgroundImg, ...coord, WIDTH_MAP * screen.zoom, HEIGHT_MAP * screen.zoom );

		drawLayers.call( this, {
			layers: parent.state.layers,
			ctx: ctx,
			projection: parent.props.projection,
			mode: mode
		});

		ctx.drawImage( this.state.baseMap.foregroundImg, ...coord, WIDTH_MAP * screen.zoom, HEIGHT_MAP * screen.zoom );
	}
	render(){ 
		return React.createElement( 'canvas', Object.assign( {
			ref: 'canvas', draggable: true,
			className: 'map-canvas',
			onMouseMove: this.handleMouseMove.bind(this),
			onClick: this.handleClick.bind(this),
			onDragStart: this.handleDragStart.bind(this),
			onDrag: this.handleDrag.bind(this),
			onDragEnd: this.handleDragEnd.bind(this),
			onMouseMove: this.handleMouseMove.bind(this),
			onWheel: this.handleWheel.bind(this),
			onTouchStart: this.handleTouchStart.bind(this),
			//onTouchMove: this.handleTouch.bind(this),
			onTouchEnd: this.handleTouchEnd.bind(this)
		}, this.props, { parent: undefined } ) );
	}
}

const $LegendImage = class extends React.Component{
	render(){
		let children = this.props.styles.map( style => {
			let { lineWidth, strokeStyle, fillStyle } = style;

			if ( fillStyle && fillStyle.type ) fillStyle = Hatch.parse(fillStyle);

			style = {
				background: ( fillStyle instanceof Hatch ) ? 'none' : ( fillStyle ? fillStyle.toString() : 'none' ),
				backgroundImage: ( fillStyle instanceof Hatch ) ? `url(${fillStyle._canvas.toDataURL()}) ` : 'none',
				borderColor: lineWidth ? `${strokeStyle ? strokeStyle.toString() : ''}` : 'none',
				borderWidth: lineWidth ? `${lineWidth / 2}` : 'none',
				borderStyle: lineWidth ? 'solid' : 'none',
				boxSizing: 'border-box'
			};

			if ( !fillStyle ){ style.background = '#efefef'; }

			return React.createElement('div', { className: 'legend-image-overlay', style: style });
		});

		return React.createElement('div', { className: 'legend-image' }, ...children)
	}
}

const $LegendItem = class extends React.Component{
	render(){
		let { styles, description } = this.props;

		return React.createElement('div', Object.assign({ className: 'legend-item' }, this.props, { parent: undefined, styles: undefined } ),
			React.createElement( $LegendImage, { className: 'legend-image', styles: styles } ),
			React.createElement('div', { className: 'legend-text', style: { whiteSpace: this.props.whitespace } }, description.toString() )
		);
	}
}

const $LegendGroup = class extends React.Component{
	constructor(...args){ super(...args); this.state = { repeat: 20 } }
	componentDidMount(){}
	resize(){

		let thisDOMNode = ReactDOM.findDOMNode(this),
				thisWidth = thisDOMNode.offsetWidth,
				realWidth = Array.from( thisDOMNode.getElementsByClassName('legend-item') ).slice( 0, this.state.repeat).reduce( ( x, y ) => x + y.offsetWidth + window.scrollY, 0 );

		if ( realWidth > thisWidth && this.state.repeat > 1 ){
			this.setState( { repeat: this.state.repeat - 1 }, this.resize )
		}
	}
	render(){
		const { name, unit, legend } = this.props.symbology;

		return React.createElement('div', Object.assign({ className: 'legend-group' }, this.props, { parent: undefined, symbology: undefined } ),
				name && React.createElement( 'div', { className: 'sub-header' }, name, 
					unit && React.createElement('span', {}, `(${unit})`  )
				),
				React.createElement( 'div', 
					{	className: 'legend-grid',
						ref: 'grid',
						style: { gridTemplateColumns: `repeat(${this.state.repeat}, fit-content(600px))` }
					}, null,
					...legend.map( item =>
						React.createElement( $LegendItem, { whitespace: this.state.repeat > 1 ? 'nowrap' : 'normal', styles: item.value, description: item.description || item.key } )
					)
				)
			);
	}
}

const $LegendBox = class extends React.Component{
	constructor(...args){
		super(...args);
		
		let canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d');

		this.state = { legendCtx: ctx, width: 300, children: [], legends: [] };
	}
	resize(){
		let canvasWidth = this.props.parent.refs.canvas.props.width,
				callback = function(){
					Reflect.ownKeys(this.refs).map( key => this.refs[key].setState({ repeat: 10 }, this.refs[key].resize ) )
				}
		
		if ( canvasWidth ) return this.setState({ width: canvasWidth * .5 }, callback.bind(this) );
	}
	render(){
		let legends = this.state.legends;

		return React.createElement( 'div', Object.assign( {}, this.props, { parent: undefined } ), 
			...( legends ? legends.map( legend =>
				React.createElement('div', null,
					...( legend.symbologies.map( ( symbology, i ) => 
								React.createElement( $LegendGroup, { ref: i, parent: this.props.parent, style: { width: this.props.width }, symbology } )
							)
						)
				
				) 
			): [] )
		);
	}
}

/** content panel of the interactive map
	*
	*/
var $ContentPanel = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { eventListeners: [], layers: [], classes: new Set(['not-mounted']) };
	}
	componentDidMount(){
		this.state.classes.delete('not-mounted')
		window.addEventListener( 'resize', this.resize.bind(this) );
	}
	componentWillUnMount(){
		window.removeEventListener( 'resize', this.resize.bind(this) );
	}

	async getMap(){
		let legends = Array.from( this.props.legendMaps.entries() ).map( entry => entry[1].activeLegend );
		let layers = getMapAPI(legends)

		layers.forEach( (layer, i, a) => {
			let thisLayer = this.state.layers[i];

			layer.highlighted = [];
			layer.legend = legends[i];

			if ( layer.isActive && thisLayer ){
				layer.selected = thisLayer.selected.map( feature => {

					let newFeature = layer.data.find( f => f.fid === feature.fid );
					if ( newFeature ) feature.style = newFeature.style;
					return feature;
				});
			}
			else layer.selected = [];

			a[i] = layer
		});

		/*this.selected = this.selected.map( feature => {
			let newFeature = activeLayers.find( f => f.fid === feature.fid );
			if ( newFeature ) feature.style = newFeature.style; 
			return feature;
		}); */
		try {
			let callback = function(){
				this.refs.legendBox.setState(
					{ legends: layers.filter( layer => layer.isActive ).map( layer => layer.legend ) }, 
					( function(){
						this.refs.canvas.redraw();
						this.refs.legendBox.resize();
					} ).bind(this) 
				);
			};

			this.setState( { layers: layers }, callback.bind(this) );
		} catch (e) {
			console.error(e)
		}
	}
	async getZone(coord, { coordType = 'screen', zoom = false } = {}){
		let scrCoord, nadCoord,
				{ nad, gcs, screen } = this.props.projection;

		switch (coordType){
			case 'nad': { scrCoord = coord.project(nad, screen); nadCoord = coord; } break;
			case 'gcs': { scrCoord = coord.project(gcs, screen); nadCoord = coord.project(gcs, nad); } break;
			default: { scrCoord = coord; nadCoord = coord.project(screen, nad); }
		}

		this.state.layers.map( layer => {
			layer.highlighted = [];

			if ( layer.isActive )
				layer.selected = layer.data.filter( featureData => nadCoord.isWithin(featureData.geometry.rings) );
			else layer.selected = [];
		});
	
		if ( zoom ){

			let canvas = this.refs.canvas,
					{ width, height } = canvas.props,
					oldZoom = screen.zoom;

			screen.zoom = Math.max( oldZoom, 3 );
			screen.x = ( screen.x - scrCoord.x ) * screen.zoom / oldZoom + width / 2;
			screen.y = ( screen.y - scrCoord.y ) * screen.zoom / oldZoom + height / 2;
		}

		this.refs.canvas.redraw();

		let zoneLayer = this.state.layers.find( layer => layer.name === 'A-ZONE' );

		const zone = getZoneAPI(zoneLayer.selected[0] && zoneLayer.selected[0].fid)

		ReactDOM.render(
			React.createElement( $SideBarData, { data: zone, parent: this } ),
			this.refs.sideBar.refs.zoningInfo,
		);
	}
	toSVG(){
		drawSVGLayers({
			layers: this.state.layers,
			svg: this.props.svg.clear(),
			projection: this.props.projection
		});
		download('download.svg', this.props.svg.svg() );
	}
	resize(){
		let { offsetWidth, offsetHeight } = ReactDOM.findDOMNode(this),
				{ width, height, classes } = this.state,
				$canvas = this.refs.canvas,
				$legendBox = this.refs.legendBox,
				$sideBar = this.refs.sideBar,
				sideBar = ReactDOM.findDOMNode($sideBar),
				oldSideBarWidth = classes.has('mobile') ? 0 : sideBar.offsetWidth,
				{ screen } = this.props.projection;

		offsetWidth < 800 ? classes.add('mobile') : classes.delete('mobile');

		this.setState({ width: offsetWidth, height: offsetHeight }, function(){
			let $sideBar = this.refs.sideBar,
					sideBar = ReactDOM.findDOMNode($sideBar),
					sideBarWidth = classes.has('mobile') ? 0 : sideBar.offsetWidth;

			cancelAnimationFrame( $canvas.state.animation.timer );
			$legendBox.resize();

			if ( width !== undefined ) {
				screen.x += ( offsetWidth - width - oldSideBarWidth + sideBarWidth ) / 2;
				screen.y += ( offsetHeight - height ) / 2;
			}
			else {
				[ screen.x, screen.y ] = [ ( offsetWidth + sideBarWidth ) / 2, offsetHeight / 2 ];
			}

			$canvas.state.animation.timer = requestAnimationFrame( $canvas.redraw.bind($canvas) );
		});
	}

	render(){
		let $searchPane = React.createElement( $SearchPane, { ref: 'searchPane', parent: this, className: 'search-pane' }, null ),
				$mapContainer = React.createElement(
					'div', 
					{ className: 'map-container',
						ref: 'mapContainer',
						key: 0,
					},
					React.createElement( $MapCanvas, { key: 1, ref: 'canvas', parent: this, width: this.state.width, height: this.state.height } ),
					React.createElement( $LegendBox, { key: 2, ref: 'legendBox', parent: this, className: 'legend' } ),
					React.createElement( $PopUp, { key: 3, ref: 'popUp', parent: this, className: 'popup' } ),
				),
				$setting = React.createElement( $Setting, { key: 1, ref: 'setting', parent: this } ),
				$sideBar = React.createElement( $SideBar, { key: 2, ref: 'sideBar', parent: this } );

		return React.createElement('div', { className: `content-panel ${Array.from(this.state.classes).join(' ')}` }, 
			$setting, $sideBar, $searchPane, $mapContainer
		);
	}
}

}