const _eval = require('eval');

const BST = require('./bst.js');

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
						else if ( x.length && ! x[0].match(/[\.\"\'"]/) && !RESERVED_WORDS.includes(x) )
							return `this.${x}`;
						else return x;
					}
					return x;
				}).join('');

	return _eval(`module.exports = function(){ return ${str}; }`);
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
			for ( let entry of legend )
				symbology.legend.insert({ key: entry.key, value: entry.value });
			
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

module.exports = Legend;