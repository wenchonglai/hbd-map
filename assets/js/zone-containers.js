/**
	*/
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

module.exports = ZoneContainers;