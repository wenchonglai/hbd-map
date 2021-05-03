function drawLayers( { layers = [], ctx, projection, highlighted, selected, mode } = {} ){
	let cache = { pattern: new Map() },
			{ screen } = projection,
			{ zoom } = screen,
			zoomFactor = window.devicePixelRatio * zoom ** ( zoom < 1 ? 1 : .35 );
	layers
		.sort( ( a, b ) => a.order - b.order )
		.map( ( layer, i ) => drawLayer({
			data: layer.data,
			ctx: ctx,
			projection: projection,
			highlighted: layer.highlighted,
			selected: layer.selected,
			legend: layer.legend,
			cache: cache,
			zoomFactor: zoomFactor,
			mode: mode
		}) )
}

function drawLayer( { data = [], ctx, projection, highlighted, selected, legend, cache, zoomFactor } = {} ){
	//ctx.globalCompositeOperation = 'multiply';
	ctx.save();
	data.map( featureData =>
		drawGeometry( featureData, { defaultStyles: legend.defaultSettings.normal, ctx, projection, cache, zoomFactor } )
	);
	ctx.restore();
	//ctx.globalCompositeOperation = 'source-over';
	highlighted.map(
		featureData => featureData.selected ||
			drawGeometry( featureData, { styles: [legend.defaultSettings.highlighted], ctx, projection, cache, zoomFactor } )
	);
	ctx.restore();
	selected.map(
		featureData => drawGeometry( featureData, { styles: [legend.defaultSettings.selected], ctx, projection, cache, zoomFactor } )
	);
	ctx.restore();
}

let drawGeometry = function( featureData, { styles = featureData.styles, defaultStyles = [], ctx, projection, cache, zoomFactor } = {} ){
	let { nad, gcs, screen } = projection,
			{ geometry, highlighted, selected } = featureData;

	styles = Array.from( styles !== featureData.styles ? styles : featureData.styles ).filter( x => x );

	ctx.beginPath();

	geometry.rings.map( singleGeometry => {
		let moveTo = false;

		singleGeometry.map( coord => {

			let scrCoord = new Coord(coord).project( nad, screen );

			if ( !moveTo ){ moveTo = true; ctx.moveTo( ...scrCoord ); }
			else ctx.lineTo( ...scrCoord );
		})
	});

	ctx.closePath();


	styles.map( value => value && value.map(
		style => {
			if (!style) return;

			let _style = {};

			Reflect.ownKeys(style).map( key => {
				let value = style[key];

				if (key === 'lineDash' && style[key] instanceof Array){ _style[key] = value; }
				else if ( value instanceof Array ) return _style[key] = new RGBA(value).toString();
				else if ( key === 'fillStyle' && typeof value === 'object' ){
					let fillStyle = value,
							str_fillStyle = JSON.stringify(fillStyle);

					_style[key] = {};

					Reflect.ownKeys(fillStyle).map( key1 => {
						let fillStyleVal = fillStyle[key1];
						_style[key][key1] = ( isNaN(fillStyleVal) || key1 === 'rotation' ) ? fillStyleVal : fillStyleVal * zoomFactor;
					})

					cache.pattern.get(str_fillStyle) ||
						cache.pattern.set( str_fillStyle, Hatch.parse(_style[key]).createPattern() );

					_style[key] = cache.pattern.get(str_fillStyle);
				}
				else _style[key] = String( value );
			});

			ctx.save();	
			defaultStyles.lineWidth = defaultStyles.lineWidth ? window.devicePixelRatio * ( zoom ) : undefined;
			Object.assign( ctx, ...defaultStyles, _style );
			
			if (ctx.lineDash)
				ctx.setLineDash( ctx.lineDash.map( x => x * zoomFactor ) );	

			if ( !ctx.strokeAlignment ){		
				style.fillStyle && ctx.fill('evenodd');
				ctx.stroke();
			}
			else {
				ctx.lineWidth *= 2;

				if ( ctx.strokeAlignment < 0 ){
					ctx.clip();
					style.fillStyle && ctx.fill('evenodd');
					ctx.stroke();
				}
				else {
					ctx.save();
					ctx.clip();
					ctx.globalCompositeOperation = 'source-in';
					ctx.stroke();
					ctx.restore();
					style.fillStyle && ctx.fill('evenodd')
				}
			}

			ctx.restore();
			ctx.strokeAlignment = undefined;
			ctx.lineDash = undefined;
		})
	)
}