const Coord = class {
	constructor({ x = 0, y = 0 } = {}){
		if ( arguments instanceof Coord ){
			this.x = arguments.x;	this.y = arguments.y;
			return;
		}
			
		let [ arg0, arg1 ] = arguments;

		if ( !( arg0 instanceof Object ) ){
			this.x = arg0; this.y = arg1;
			return;
		}

		if ( arg0[0] !== undefined ){
			[ this.x, this.y ] = arg0;
			return;
		}

		this.x = x; this.y = y;
	}
	*[Symbol.iterator](){
		yield this.x;
		yield this.y;
	}
	isWithin(geometry){
		let retVal = 0,
				[ x, y ] = this;

		geometry.map( singleGeometry => {
			for ( let i = 0, len = singleGeometry.length; i < len; ){

				let [ x0, y0 ] = singleGeometry[i],
						[ x1, y1 ] = singleGeometry[ ++i % len ],
						dx0 = x0 - x, dx1 = x1 - x, dy0 = y0 - y, dy1 = y1 - y;

				if ( dy0 * dy1 < 0 )
					if ( dx0 > 0 && dx1 > 0 ) retVal ^= 1;
					else if ( dx0 * dx1 < 0 && dx0 * dy1 < dx1 * dy0 ) retVal ^= 1;
			}
		});

		return retVal;
	}
	project(from, to){
		return from.convertTo( this, to );
	}
}
