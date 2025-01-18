define([], function(){

class Response{
	constructor(){
		this._response = undefined;
		this._onChange = undefined;
	}
	set onchange(func){ this._onChange = func; }
	get response(){ return this._response; }
	async json(){
		return this._response;
	}
	send(data){
		this._response = data;
		this._onChange && this._onChange.call(this);
	}
}

return async function (url, request, data){
	return new Promise( function( resolve, reject ){
		let app = window.app;
		const { method, headers, body, credentials } = request,
					hasURL = app && app.has( method, url );

		if ( !hasURL ){
			fetch( url, request, data )
				.then( response => {
					let { status } = response; 
					if ( status === 200 ) resolve(response);
					else reject(response);
				});
			
		}
		else {
			let contentType = headers['Content-Type'],
					response = new Response();

			if ( contentType === 'application/json' )
				request.body = JSON.parse(body);

			response.onchange = function(e){
				resolve(this);
			};

			try {
				app.handleURL( method, url )( request, response );
			}
			catch(e){ reject(e); }
		}
	});
};

});