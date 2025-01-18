const Hatch = class{
	constructor({ width = 100, height = 100, rotation = 0, fillStyle = 'rgba(0,0,0,0)' } = {}){
		this._canvas = document.createElement('canvas');
		this._canvas.width = this._width = width;
		this._canvas.height = this._height = height;

		this._ctx = this._canvas.getContext('2d');
		this._ctx.fillStyle = fillStyle;
		this._ctx.rect(0, 0, width, height );
		this._ctx.fill();
	}
	createPattern(repeat = 'repeat'){
		return this._ctx.createPattern( this._canvas, repeat )
	}
	static parse(obj){
		switch( obj.type.toLowerCase() ){
			case 'linehatch': return LineHatch.parse(obj);
			default: return new this(obj);
		}
	}
}

const LineHatch = class extends Hatch{
	constructor({ width = 100, height = 100, lineWidth = 1, rotation = 0, strokeStyle = '#000000', gap = 10, offsetX = 0, offsetY = 0 } = {}){
		super({ width, height });
		width = this._width;
		height = this._height;

		this._lineWidth = lineWidth;
		this._rotation = rotation = -rotation % ( 2 * Math.PI );
		this._strokeStyle = strokeStyle;
		this._gap = gap;
		this._offsetX = offsetX;
		this._offsetY = offsetY;

		let { sin, cos, PI, floor, ceil } = Math,
				xMin = 0, yMin = 0, xMax = width, yMax = height;

		if ( rotation < -PI ) rotation += 2 * PI;
		else if ( rotation >= PI ) rotation -= 2 * PI;

		this._ctx.transform( cos(rotation), -sin(rotation), sin(rotation), cos(rotation), 1, 1 );

		if ( -PI <= rotation && rotation < -PI / 2 ){
			yMin = -height * cos(rotation) + width * sin(rotation);
			xMin = -width * cos(rotation);
		}
		else if ( -PI / 2 <= rotation && rotation < 0 ){
			yMin = width * sin(rotation);
			xMax = width * cos(rotation) - height * sin(rotation);
		}
		else if ( 0 <= rotation && rotation < PI / 2 ){
			xMin = -height * sin(rotation);
			yMax = height * cos(rotation) + width * sin(rotation);
		}
		else if ( PI / 2 <= rotation && rotation < PI ){
			xMin = -width * cos(rotation) - height * sin(rotation);
			yMin = height * cos(rotation);
		}

		Object.assign( this._ctx, { lineWidth, strokeStyle });
		for ( let i = floor( yMin / gap ) * gap; i <= ceil( yMax / gap ) * gap; i += gap ){
			this._ctx.beginPath();
			this._ctx.moveTo(xMin, i );
			this._ctx.lineTo(xMax, i );
			this._ctx.stroke();
		}
	}

	toSVGPattern(svg){
		let self = this,
				func = function(pattern){
					let { PI, cos, sin } = Math,
							rotation = -self._rotation * 180 / PI,
							gap = self._gap * cos(self._rotation),
							attr = {
								stroke: self._strokeStyle,
								'stroke-width': self._lineWidth / 2,
								fill: 'none'
							},
							group = pattern.group();

					pattern.rect(self._width, self._height).fill('none').stroke('none');
					pattern.transform({ rotation: rotation });
					group.attr(attr);

					for ( let i = 0; i < self._height; i += gap )
						group.line(0, i, self._width, i)
				};

		return svg.pattern( self._width, self._height, func )
	}

	static parse(obj){ return new this(obj); }
}