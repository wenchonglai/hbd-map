define( ['js/fetch'], function(fetch){

const readFile = async function( path, options, callback ){
	if ( arguments.length < 3 && options instanceof Function ){
		callback = options;
		options = {}
	}
	if ( typeof options === 'string' ){
		options = { encoding: options }
	}

	return await fetch( path, { headers: { 'Content-Type': 'text/plain' } } )
		.then( res => res.text() )
		.then( data => [ undefined, data ] )
		.catch( e => [ e, undefined ] )
		.then( function([ err, data ] = []){ return callback ? callback(err, data) : [ err, data ]; } )
};

fs = {
	readFile
};

return fs;

})