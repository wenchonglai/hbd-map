let Projection = class {
	constructor({ center = [], scale = 1, scaleX, scaleY, zoom = 1, zoomMax = 80, zoomMin = .0125 } = {}){
		this._center = new Coord(center);
		this._scale = { x: scaleX || scale, y: scaleY || scale };
		this._zoom = zoom;
		this._zoomMax = zoomMax;
		this._zoomMin = zoomMin;
	}
	get center(){ return this._center; }
	get x(){ return this.center.x; }
	set x(val){ this.center.x = val; }
	get y(){ return this.center.y; }
	set y(val){ this.center.y = val; }
	get scale(){ return this._scale; }
	get scaleX(){ return this.scale.x / this.zoom; }
	get scaleY(){ return this.scale.y / this.zoom; }
	get zoom(){ return this._zoom; }
	set zoom(val){ this._zoom = Math.max( this._zoomMin, Math.min( this._zoomMax, val ) ); }
	get zoomMin(){ return this._zoomMin; }
	get zoomMax(){ return this._zoomMax; }
	convertTo( coord, projection ){
		return new Coord(
			( ( coord.x - this.x ) * this.scaleX  ) / ( projection.scaleX ) + projection.x,
			( ( coord.y - this.y ) * this.scaleY ) / ( projection.scaleY ) + projection.y
		);
	}
}