define([], function(){

class Express{
	constructor(){
		this._queue = [];
	}
	push(method, path, callback){
		this._queue.push({
			path: path,
			method: method,
			callback: callback
		});
	}
	handleURL( method, path ){
		let middleware = this.has( method, path );
		if ( middleware ) return middleware.callback;
	}
	post( path, callback ){	this.push( 'POST', path, callback ); } 
	get ( path, callback ){ this.push( 'GET', path, callback ); }
	has( method, path ){ return this._queue.find( x => x.method === method.toUpperCase() && x.path === path ); }
	async build(callback){
		if ( callback ) await callback();
		return this;
	}
}

function express(){
	return new Express();
}

return express;

})