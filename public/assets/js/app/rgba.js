const RGBA = class extends Array{
	constructor( { r = 0, g = 0, b = 0, a = 1 } = {} ){
		if ( !isNaN( arguments[0] ) ) [ r, g, b, a ] = Array.from(arguments).map( x => Number(x) );
		else if ( arguments[0] instanceof Array ) [ r, g, b, a ] = arguments[0];
		else if ( typeof arguments[0] === 'string' )
			if ( arguments[0].match(/[0-9a-fA-F]{6}/) ){
				[ r, g, b, a ] = arguments[0].match(/[0-9a-fA-F]{2}/g).map( x => parseInt( x, 16 ) || 0 );
				a = a / 255;
			}
			else [ r, g, b, a ] = arguments[0].match(/[\-\+]?\d+(\.\d*)?(e[\-\+]?\d+)?/g).map( x => Number(x) );
		
		super( ...[ r, g, b ].map( num => Math.min( Math.max( num, 0 ), 255) || 0 ), Math.min( Math.max( a, 0 ), 1 ) || 1 );
	}
	get a(){ return this[3] }
	toString(){ return `rgba(${this.join(', ')})`; }
	toHTMLColorCode(){
		return {
			color: `#${Array.from( this.slice(0,3) ).map( x => parseInt(x).toString(16).padStart(2, '0') ).join('')}`,
			opacity: this.a
		}
	}
}
