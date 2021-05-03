/** comma separated text to variable
  * @param text:		raw comma separated text
  * @param classes:	
  * @param _n:			additional times cstToArray to be executed
  *	return:					an Array object
  */
define([], function(){

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

return txtToObject;

})  
