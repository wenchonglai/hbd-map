function drawSVGLayers( { layers = [], svg, projection } = {} ){
	let cache = { pattern: new Map() }

	Array.from(layers)
		.sort( ( a, b ) => a.order - b.order )
		.map( ( layer, i ) => {
			let clip = svg.clip(),
					rect = svg.rect( 10 * 72, 6.5 * 72 ).move( .5 * 72, .5 * 72 ),
					group = svg.group();
			
			group.clipWith(clip);

			drawSVGLayer({
				data: layer.data,
				svgLayer: group,
				projection: projection,
				cache: {
					pattern: new Map()
				}
			});

			clip.add(rect);
		})
}

function drawSVGLayer( { data = [], svgLayer, clip, projection, cache } = {} ){
	data.map( featureData =>
		drawSVGGeometry( featureData, { svgLayer: svgLayer, projection: projection, clip: clip, cache: cache } )
	);
}

let drawSVGGeometry = function( featureData, { styles = featureData.styles, svgLayer, projection, clip, cache } = {} ){
	let { nad, svg } = projection,
			{ geometry } = featureData,
			pathStr = '',
			svgFeature,
			svgBase = styles.reduce( ( a, b ) => a + b.length, 0 ) <= 1 ? svgLayer : svgLayer.group();

	styles = Array.from( styles !== featureData.styles ? styles : featureData.styles ).filter( x => x );

	if ( geometry.rings && geometry.rings.length === 1 )
		pathStr = geometry.rings[0].map( coord => 
			Array.from( new Coord(coord).project(nad, svg) ).map( x => x.toFixed(2) ).join(',') 
		).join(' ');

	styles.map( value => value && value.map(
		style => {
			if (!style) return;

			let attr = {};

			Reflect.ownKeys(style).map( key => {
				let styleValue = style[key] || undefined;

				switch (key){
					case 'lineDash': attr['stroke-dasharray'] = styleValue instanceof Array ? styleValue.map( x => x / 2 ).join(' ') : undefined; break;
					case 'lineWidth': attr['stroke-width'] = styleValue / 2; break;
					case 'strokeStyle': attr.stroke = styleValue instanceof Array ? new RGBA(styleValue).toHTMLColorCode().color : styleValue; break;
					case 'strokeAlignment': attr['stroke-alignment'] = styleValue ? styleValue > 0 ? 'outer' : 'inner' : undefined; break;
					case 'lineJoin': attr['stroke-linejoin'] = styleValue; break;
					case 'fillStyle':{
						if ( styleValue instanceof Array ) attr.fill = new RGBA(styleValue).toHTMLColorCode().color;
						else if ( styleValue instanceof Object ){
							let hatch = Hatch.parse(styleValue),
									hatchStr = JSON.stringify(hatch);

							cache.pattern.get(hatchStr) || cache.pattern.set(hatchStr, hatch.toSVGPattern(svgLayer) );
							attr.fill = cache.pattern.get(hatchStr);

						}
					}; break;
				}
/*
				else if ( style[key] instanceof Array ) return _style[key] = new RGBA(style[key]).toString();
				else if ( key === 'fillStyle' && typeof style[key] === 'object' ){
					let fillStyle = style[key],
							str_fillStyle = JSON.stringify(fillStyle);

					_style[key] = {};

					Reflect.ownKeys(fillStyle).map( key1 => {
						_style[key][key1] = ( isNaN(fillStyle[key1]) || key1 === 'rotation' ) ?
																fillStyle[key1] 
																: window.devicePixelRatio * fillStyle[key1] * screen.zoom ** ( screen.zoom < 1 ? 1 : .35 );
					})

					cache.pattern.get(str_fillStyle) ||
						cache.pattern.set( str_fillStyle, Hatch.parse(_style[key]).createPattern() );

					_style[key] = cache.pattern.get(str_fillStyle);
				}
				else _style[key] = String( style[key] );*/
			});

			if ( attr.fill || ( attr.stroke && attr['stroke-width'] ) ){
				if ( !attr.fill ) attr.fill = 'none';
				else {
					attr.stroke = attr.stroke || 'none';
					attr['stroke-width'] || 'none';
				}

				svgBase.polygon(pathStr).attr(attr);
			}
		})
	)
}