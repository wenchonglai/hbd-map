var init = (function(){
var geocode = async function(address){
	return new Promise( ( resolve, reject ) => {
		if ( !google ) reject( new Error('google module not loaded.') )
		new google.maps.Geocoder().geocode({'address': address}, function(results, status) {
	    if (status === 'OK') {
	      resolve([ results[0].geometry.location.lng(), results[0].geometry.location.lat()])
	    } else {
	      reject('Geocode was not successful for the following reason: ' + status);
	    }
	  });
	});
}
const RGBA = class extends Array{
	constructor( { r = 0, g = 0, b = 0, a = 1 } = {} ){
		if ( !isNaN( arguments[0] ) ) [ r, g, b, a ] = Array.from(arguments).map( x => Number(x) );
		else if ( arguments[0] instanceof Array ) [ r, g, b, a ] = arguments[0];
		else if ( typeof arguments[0] === 'string' )
			if ( arguments[0].match(/[0-9a-fA-F]{6}/) ){
				[ r, g, b, a ] = arguments[0].match(/[0-9a-fA-F]{2}/g).map( x => parseInt( x, 16 ) || 0 );
				a = a / 255;
			}
			else [ r, g, b, a ] = arguments[0].match(/[\-\+]?\d+(\.\d*)?(e[\-\+]?\d+)?/g).map( x => Number(x) );
		
		super( ...[ r, g, b ].map( num => Math.min( Math.max( num, 0 ), 255) || 0 ), Math.min( Math.max( a, 0 ), 1 ) || 1 );
	}
	get a(){ return this[3] }
	toString(){ return `rgba(${this.join(', ')})`; }
	toHTMLColorCode(){
		return {
			color: `#${Array.from( this.slice(0,3) ).map( x => parseInt(x).toString(16).padStart(2, '0') ).join('')}`,
			opacity: this.a
		}
	}
}
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
const LEGEND_DEFAULTSETTINGS = {
				normal: [{
					lineWidth: 0.5,
					strokeStyle: new RGBA('#ffffffff')
				}],
				highlighted: [{
					lineWidth: 4,
					strokeStyle: new RGBA('#ffffffbf')
				},
				{
					lineWidth: 2,
					strokeStyle: new RGBA('#00ffffff')
				}],
				selected: [{
					lineWidth: 8,
					strokeStyle: new RGBA('#ffff4f8f')
				},
				{
					lineWidth: 3,
					strokeStyle: new RGBA('#004fffff')
				}]
			};

let LEGEND_PARAMS_ZONING = [
		[ 'gplu', {
			name: '(E) Land Use',
			symbologies: [
				{	name: '(E) General Plan Land Use',
					func: 'Number(_attr.gplu_key.slice(0,3))',
					legend: [
						{ key: 132, description: 'Single Family Residential', value: [{ fillStyle: new RGBA('#ffff00df') }] },
						{ key: 150, description: 'Medium Residential', value: [{ fillStyle: new RGBA('#ff8c00df') }] },
						{ key: 160, description: 'High Medium Residential', value: [{ fillStyle: new RGBA('#a87000df') }] },
						{ key: 170, description: 'High Residential', value: [{ fillStyle: new RGBA('#895a44df') }] },
						{ key: 260, description: 'Regional Center Commercial', value: [{ fillStyle: new RGBA('#bf006bdf') }] },
						{ key: 500, description: 'Open Space', value: [{ fillStyle: new RGBA('#75b500df') }] },
						{ key: 700, description: 'Public Facilities', value: [{ fillStyle: new RGBA('#728944df') }] }
					],
					isContinuous: true
				},
				{	func: `Array.from(_currentCodeContainers).some( function(){
										return arguments[0] && arguments[0]._typeCode === 5 && Array.from( arguments[0]._generalNotes ).some( function(){
											return arguments[0] && arguments[0].date && new Date(arguments[0].date) > 766220400000
										});
									}) ? ( _attr.condition && _attr.condition.length ? 2 : 1 ) : 0`,
					legend: [
						{ key: 1, description: 'Zone Change After HCP; w/o New Q Condition',
							value: [{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 2, rotation: -Math.PI / 4, gap: 4.5 / Math.sin( Math.PI / 4 ), strokeStyle: '#bfbfbf' } }]
						},
						{ key: 2, description: 'Zone Change After HCP; w/ New Q Condition',
							value: [{ fillStyle: { type: 'linehatch', width: 60, height: 60, lineWidth: 2, rotation: Math.PI / 4, gap: 3 / Math.sin( Math.PI / 4 ), strokeStyle: '#ff7f7f' } }]
						}
					],
					isContinuous: true
				}
			],
			showOther: true
		}],
		[ 'density', {
			name: '(E) Max. Allowable Residential Density',
			symbologies: [
				{	name: '(E) Maximum Allowable Residential Density',
					unit: '1 DU / ? sf lot',
					func: 'getDensity()',
					legend: [
						{ key: 0, description: 'Not Allowed', value: [{ fillStyle: new RGBA('#c6dd7ddf') }] },
						{ key: 200, description: '', value: [{ fillStyle: new RGBA('#660500df') }] },
						{ key: 300, description: '', value: [{ fillStyle: new RGBA('#a7372fdf') }] },
						{ key: 400, description: '', value: [{ fillStyle: new RGBA('#e7685ddf') }] },
						{ key: 600, description: '', value: [{ fillStyle: new RGBA('#f6b319df') }] },
						{ key: 800, description: '', value: [{ fillStyle: new RGBA('#fcdd7cdf') }] },
						{ key: 1200, description: '', value: [{ fillStyle: new RGBA('#f4eccedf') }] }
					],	
					isGradient: true,
					isContinuous: true
				}
			],
			showOther: true
		} ],
		[ 'far', {
			name: '(E) Max. Allowable FAR',
			symbologies: [
				{	func: 'getFAR()',
					name: '(E) Maximum Allowable FAR',
					unit: '',
					legend: [
						{ key: 0, description: 'Not Allowed', value: [{ fillStyle: new RGBA('#99bcbfdf') }] },
						{ key: 0.45, description: '', value: [{ fillStyle: new RGBA('#557c3edf') }] },
						{ key: 2, description: '', value: [{ fillStyle: new RGBA('#b9c55adf') }] },
						{ key: 3, description: '', value: [{ fillStyle: new RGBA('#ffcd31df') }] },
						{ key: 4.5, description: '', value: [{ fillStyle: new RGBA('#f68d3ddf') }] },
						{ key: 6, description: '', value: [{ fillStyle: new RGBA('#ca4d46df') }] }
					],	
					isGradient: true,
					isContinuous: true
				},
				{	func: `_zoningInfo.e.devStds.farNotes
										.some( function(){
											return !!arguments[0] && Array.from(arguments[0].notes)
												.some( function(){
													return !!arguments[0] && arguments[0].name === '*';
												})
										})
								`,
					legend: [
						{ key: true,
							description: 'Additional FAR will require CPC approval',
							value: [{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 1, rotation: Math.PI / 4, gap: 4.5 / Math.sin( Math.PI / 4 ), strokeStyle: '#ca4d46' } }]
						}
					]
				}
			],
			showOther: true,
		}],
		[ 'height', {
			name: '(E) Max. Allowable Building Height',
			symbologies: [	
				{	name: 'Existing Max. Allowable Building Height',
					unit: 'ft',
					func: 'getHeight()',
					legend: [
						{ key: 0, description: 'Not Allowed', value: [{ fillStyle: new RGBA('#ec4852df') }] },
						{ key: 30, description: '30', value: [{ fillStyle: new RGBA('#91e551df') }] },
						{ key: 45, description: '45', value: [{ fillStyle: new RGBA('#49d5a8df') }] },
						{ key: 60, description: '60', value: [{ fillStyle: new RGBA('#00c5ffdf') }] },
						{ key: 100, description: '100-199', value: [{ fillStyle: new RGBA('#0084a8df') }] },
						{ key: 200, description: '200-585', value: [{ fillStyle: new RGBA('#0054b7df') }] },
						{ key: 1000, description: 'Unlimited', value: [{ fillStyle: new RGBA('#002a5cdf') }] }
					],
					isContinuous: true,
					isGradient: false
				}
			]
		}],
		[ 'hcpu2', {
			name: 'HCPU2 Subareas',
			symbologies: [
				{	name: 'HCPU2 Subareas',
					func: '_zoningInfo.n.hcpu2',
					legend: [
						{ key: '2:1A', value: [{ fillStyle: new RGBA('#0000ffdf') }] },
						{ key: '3:1A', value: [{ fillStyle: new RGBA('#66b8ffdf') }] },
						{ key: '3:1B', value: [{ fillStyle: new RGBA('#0088ffdf') }] },
						{ key: '3:2', value: [{ fillStyle: new RGBA('#7bddeedf') }] },
						{ key: '3:2A', value: [{ fillStyle: new RGBA('#c1e3e9df') }] },
						{ key: '3:2B', value: [{ fillStyle: new RGBA('#00c4e5df') }] },
						{ key: '3:2C', value: [{ fillStyle: new RGBA('#7bddeedf') }] },
						{ key: '3:2G', value: [{ fillStyle: new RGBA('#00c4e5df') }] },
						{ key: '3:3', value: [{ fillStyle: new RGBA('#007f97df') }] },
						{ key: '3:4', value: [{ fillStyle: new RGBA('#7ddaeadf') }] },
						{ key: '4:1B', value: [{ fillStyle: new RGBA('#ff0000df') }] },
						{ key: '4:1C', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:1F', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:1G', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:2B', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:2C', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:3', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:3A', value: [{ fillStyle: new RGBA('#880000df') }] },
						{ key: '4:4', value: [{ fillStyle: new RGBA('#ff0088df') }] },
						{ key: '4:4A', value: [{ fillStyle: new RGBA('#ffcfcfdf') }] },
						{ key: 'N/A', description: 'N/A', value: [{ fillStyle: new RGBA('#cfcfcfdf') }] },
					],
					isContinuous: true,
					isGradient: false
				},
				{	func: '_zoningInfo.n.hcpu2 ? 1 : 0 ',
					legend: [
						{ key: 1, description: 'Areas within HCPU2 Boundaries',
							value: [
								{ lineWidth: 3.5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
								{ lineWidth: 1.5, strokeAlignment: -1, strokeStyle: new RGBA('#2f2f2fff') }
							]
						}
					]
				}
			],
			showOther: true
		}],
		[ 'hcpu2_far', {
			name: 'Proposed Max. Allowable FAR',
			symbologies: [
				{	name: 'Proposed Max. Allowable FAR',
					func: 'getFAR(1, true)',
					legend: [
						{ key: 0, description: 'Not Allowed', value: [{ fillStyle: new RGBA('#99bcbfdf') }] },
						{ key: 2, description: '', value: [{ fillStyle: new RGBA('#b9c55adf') }] },
						{ key: 3, description: '', value: [{ fillStyle: new RGBA('#ffcd31df') }] },
						{ key: 4.5, description: '', value: [{ fillStyle: new RGBA('#f68d3ddf') }] },
						{ key: 6, description: '', value: [{ fillStyle: new RGBA('#ca4d46df') }] },
						{ key: 'N/A', description: '', value: [{ fillStyle: new RGBA('#dfdfdfbf') }] }
					],
					isContinuous: true,
					isGradient: false
				},
				{	func: `_zoningInfo.n.devStds.farNotes
										.some( function(){
											return !!arguments[0] && Array.from(arguments[0].notes)
												.some( function(){
													return !!arguments[0] && ['**'].includes( arguments[0].name );
												})
										})
								`,
					legend: [
						{ key: true,
							description: 'Historic properties: FAR exceeding 2 requires OHR approval',
							value: [{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 2, rotation: -Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#b9c55a' } }]
						}
					]
				},
				{	func: `_zoningInfo.n.devStds.farNotes
										.some( function(){
											return !!arguments[0] && Array.from(arguments[0].notes)
												.some( function(){
													return !!arguments[0] && ['***'].includes( arguments[0].name );
												})
										})
								`,
					legend: [
						{ key: true,
							description: 'Historic properties: FAR exceeding 3 requires OHR approval',
							value: [{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 2, rotation: -Math.PI / 4, gap: 4.5 / Math.sin( Math.PI / 4 ), strokeStyle: '#ffcd31' } }]
						}
					]
				},
				{	func: `_zoningInfo.n.devStds.farNotes
										.some( function(){
											return !!arguments[0] && Array.from(arguments[0].notes)
												.some( function(){
													return !!arguments[0] && arguments[0].name === '*';
												})
										}) || ( !_zoningInfo.n.hcpu2 &&
											_zoningInfo.e.devStds.farNotes
											.some( function(){
												return !!arguments[0] && Array.from(arguments[0].notes)
													.some( function(){
														return !!arguments[0] && arguments[0].name === '*';
													})
											})
										)
								`,
					legend: [
						{ key: true,
							description: 'Additional FAR will require CPC approval',
							value: [{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 1, rotation: Math.PI / 4, gap: 4.5 / Math.sin( Math.PI / 4 ), strokeStyle: '#ca4d46' } }]
						}
					]
				},

				{	func: '_zoningInfo.n.hcpu2 ? 1 : 0 ',
					legend: [
						{ key: 1, description: 'Areas within HCPU2 Boundaries',
							value: [
								{ lineWidth: 3.5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
								{ lineWidth: 1.5, strokeAlignment: -1, strokeStyle: new RGBA('#2f2f2fff') }
							]
						}
					]
				}
			],
			showOther: true
		}],
		[ 'hcpu2_height', {
			name: 'Proposed Max. Allowable Building Height',
			symbologies: [	
				{	name: 'Proposed Maximum Allowable Building Height',
					unit: 'ft',
					func: 'getHeight(1, true) ',
					legend: [
						{ key: -2, description: 'N/A', value: [{ fillStyle: new RGBA('#dfdfdfbf') }] },
						{ key: 0, description: 'Not Allowed', value: [{ fillStyle: new RGBA('#ec4852df') }] },
						{ key: 30, description: '30', value: [{ fillStyle: new RGBA('#91e551df') }] },
						{ key: 30, description: '45', value: [{ fillStyle: new RGBA('#49d5a8df') }] },
						{ key: 60, description: '60', value: [{ fillStyle: new RGBA('#00c5ffdf') }] },
						{ key: 100, description: '100-199', value: [{ fillStyle: new RGBA('#0084a8df') }] },
						{ key: 200, description: '200-585', value: [{ fillStyle: new RGBA('#0054b7df') }] },
						{ key: 1000, description: 'Unlimited', value: [{ fillStyle: new RGBA('#002a5cdf') }] }
					],
					isContinuous: true,
					isGradient: false
				},
				{	func: '_zoningInfo.n.hcpu2 ? 1 : 0 ',
					legend: [
						{ key: 1, description: 'Areas within HCPU2 Boundaries',
							value: [
								{ lineWidth: 3.5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
								{ lineWidth: 1.5, strokeAlignment: -1, strokeStyle: new RGBA('#2f2f2fff') }
							]
						}
					]
				}
			]
		}],
		[ 'delta_far', {
			name: 'Change of Max. FAR Allowance',
			symbologies: [	
				{	name: 'Change of Maximum FAR Allowance Since 1995',
					func: 'getFAR(1, true) - getFAR(-1)',
					legend: [
						{ key: -6, description: '-3 or less', value: [{ fillStyle: new RGBA('#1a5282df') }] },
						{ key: -1.5, description: '', value: [{ fillStyle: new RGBA('#a7c5dedf') }] },
						{ key: 0, description: '', value: [{ fillStyle: new RGBA('#dfdfdfdf') }] },
						{ key: 1, description: '+1', value: [{ fillStyle: new RGBA('#ffcd31df') }] },
						{ key: 1.5, description: '+1.5', value: [{ fillStyle: new RGBA('#f68d3ddf') }] },
						{ key: 2.5, description: '+2.5 or more', value: [{ fillStyle: new RGBA('#da1f47df') }] }
					],
					isContinuous: true,
					isGradient: false
				},
				{	func: `_zoningInfo.n.devStds.farNotes
										.some( function(){
											return !!arguments[0] && Array.from(arguments[0].notes)
												.some( function(){
													return !!arguments[0] && ['**', '***'].includes( arguments[0].name );
												})
										}) && _zoningInfo.n.hcpu2 && getFAR(1) > getFAR()
								`,
					legend: [
						{ key: true,
							description: 'Historic properties: FAR exceeding (E) allowance requires OHR approval',
							value: [{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 2, rotation: -Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#dfdfdf' } }]
						}
					]
				},
				{	func: '_zoningInfo.n.hcpu2 ? 1 : 0 ',
					legend: [
						{ key: 1, description: 'Areas within HCPU2 Boundaries',
							value: [
								{ lineWidth: 3.5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
								{ lineWidth: 1.5, strokeAlignment: -1, strokeStyle: new RGBA('#2f2f2fff') }
							]
						}
					]
				}
			]
		}],
		[ 'delta_height', {
			name: 'Change of Max. Building Height Allowance',
			symbologies: [	
				{	name: 'Change of Max. Building Height Allowance Since 1995',
					unit: 'ft',
					func: 'getHeight(1, true) - getHeight(-1)',
					legend: [
						{ key: -9963, description: `∞ → 36`, value: [{ fillStyle: new RGBA('#123757df') }] },
						{ key: -9939, description: `∞ → 60`, value: [{ fillStyle: new RGBA('#1a5282df') }] },
						{ key: -9924, description: `∞ → 75`, value: [{ fillStyle: new RGBA('#4f8abddf') }] },
						{ key: -9789, description: `∞ → 150`, value: [{ fillStyle: new RGBA('#a7c5dedf') }] },
						{ key: -15, description: '', value: [{ fillStyle: new RGBA('#67c687df') }] },
						{ key: 0, description: '', value: [{ fillStyle: new RGBA('#dfdfdfdf') }] },
						{ key: 30, description: '', value: [{ fillStyle: new RGBA('#f9d467df') }] },
						{ key: 105, description: '', value: [{ fillStyle: new RGBA('#f68d3ddf') }] }
					],
					isContinuous: true,
					isGradient: true
				},
				{	func: '_zoningInfo.n.hcpu2 ? 1 : 0 ',
					legend: [
						{ key: 1, description: 'Areas within HCPU2 Boundaries',
							value: [
								{ lineWidth: 3.5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
								{ lineWidth: 1.5, strokeAlignment: -1, strokeStyle: new RGBA('#2f2f2fff') }
							]
						}
					]
				}
			]
		}],
		[ 'prim_constraint', {
			name: 'Primary Zoning Constraints',
			symbologies: [	
				{	name: 'Primary Planning & Zoning Constraints for Development',
					func: 'getConstraintFactors(1).sort().join("/")',
					legend: [
						{ key: '', description: `Balanced (No Primary Constraint)`, value: [{ fillStyle: new RGBA('#dfdfdfdf') }] },
						{ key: 'Zone', description: 'Land Use', value: [{ fillStyle: new RGBA('#9fbfbfdf') }] },
						{ key: 'Density', value: [{ fillStyle: new RGBA('#fcdd7cdf') }] },
						{ key: 'FAR', value: [{ fillStyle: new RGBA('#ec4852df') }] },
						{ key: 'Height', value: [{ fillStyle: new RGBA('#0054b7df') }] },
						{ key: 'Stories', value: [{ fillStyle: new RGBA('#49d5a8df') }] },
						{ key: 'Density/FAR', description: 'Density & FAR', value: [
							{ fillStyle: new RGBA('#fcdd7cdf') },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#ec4852' } },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: -Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#fcdd7c' } }
						]},
						{ key: 'Density/Height', description: 'Density & Height', value: [
							{ fillStyle: new RGBA('#0054b7df') },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: -Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#fcdd7c' } }
						]},
						{ key: 'Density/Stories', description: 'Density & Stories', value: [
							{ fillStyle: new RGBA('#49d5a8df') },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: -Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#fcdd7c' } }
						]},
						
						{ key: 'FAR/Height', description: 'FAR & Height', value: [
							{ fillStyle: new RGBA('#0054b7df') },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#ec4852' } }
						]},
						{ key: 'FAR/Stories', description: 'FAR & Stories', value: [
							{ fillStyle: new RGBA('#49d5a8df') },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#ec4852' } }
						]},
						{ key: 'Height/Stories', description: 'Height & Stories', value: [
							{ fillStyle: new RGBA('#49d5a8df') },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#0054b7' } },
							{ fillStyle: { type: 'linehatch', width: 45, height: 45, lineWidth: 3, rotation: -Math.PI / 4, gap: 4.5 / Math.sin(Math.PI / 4 ), strokeStyle: '#49d5a8' } }
						]},

					],
					isContinuous: false,
					isGradient: false
				},
				{	func: '_zoningInfo.n.hcpu2 ? 1 : 0 ',
					legend: [
						{ key: 1, description: 'Areas within HCPU2 Boundaries',
							value: [
								{ lineWidth: 3.5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
								{ lineWidth: 1.5, strokeAlignment: -1, strokeStyle: new RGBA('#2f2f2fff') }
							]
						}
					]
				}
			]
		}]
	];

let LEGEND_PARAMS_BOUND = [
			[ 'default', {
				name: 'Project Boundaries',
				symbologies: [
					{	name: 'Project Boundaries',
						func: 'attr.name',
						legend: [
							{ key: 'Hollywood Boulevard District',
								value: [
									{ lineWidth: 3, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
									{ lineWidth: 2, strokeAlignment: -1, lineDash: [3, 1.5], strokeStyle: new RGBA('#337c7cff'), lineJoin: 'round' },
									{ lineWidth: .5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffff') }
								],
							},
							{ key: 'Franklin Avenue Design District',
								value: [
									{ lineWidth: 3, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
									{ lineWidth: 2, strokeAlignment: -1, lineDash: [3, 1.5], strokeStyle: new RGBA('#f5188dff'), lineJoin: 'round' },
									{ lineWidth: .5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffff') }
								],
							},
							{ key: 'Hollywood Boulevard Commercial and Entertainment Historic District',
								value: [
									{ lineWidth: 4, strokeAlignment: -1, strokeStyle: new RGBA('#ffffff7f') },
									{ lineWidth: 6, strokeAlignment: -1, strokeStyle: new RGBA('#bf975f4f') },
									{ lineWidth: 4, strokeAlignment: -1, strokeStyle: new RGBA('#bf975f4f') },
									{ lineWidth: 2, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffbf') },
									{ lineWidth: 2, strokeAlignment: -1, lineDash: [3, 1.5], strokeStyle: new RGBA('#835e29ff'), lineJoin: 'round' },
									{ lineWidth: .5, strokeAlignment: -1, strokeStyle: new RGBA('#ffffffff') }
								],
							}
						]
					}
				]
			}]
		];

const LEGEND_PARAMS = [ 
	[ 'A-BOUND', LEGEND_PARAMS_BOUND ],
	[ 'A-ZONE', LEGEND_PARAMS_ZONING ]
];

const LegendMap = class extends Map{
	constructor( arr_2d, { defaultSettings = LEGEND_DEFAULTSETTINGS } = {} ){
		super(arr_2d);
		this._defaultSettings = defaultSettings;
		this._activeKey = arr_2d[0] && arr_2d[0][0];
	}
	get(...args){
		return Object.assign({ defaultSettings: this._defaultSettings }, Map.prototype.get.call(this, ...args) )
	}
	get activeKey(){ return this._activeKey; }
	set activeKey(val){ this._activeKey = val; }
	get activeLegend(){ return this.get(this.activeKey) }
}

const LegendMaps = class extends Map{
	constructor(arr_2d){
		super(arr_2d.map( x => [ x[0], x[1] instanceof LegendMap ? x[1] : new LegendMap(x[1]) ] ));
	}
}
const Coord = class {
	constructor({ x = 0, y = 0 } = {}){
		if ( arguments instanceof Coord ){
			this.x = arguments.x;	this.y = arguments.y;
		}
		else if ( arguments.length > 1 && !isNaN(arguments[0]) && !isNaN(arguments[1]) )
			[ this.x, this.y ] = Array.from(arguments).map( arg => Number(arg) );
		else if ( !isNaN(arguments[0][0]) && !isNaN(arguments[0][1]) )
			[ this.x, this.y ] = arguments[0].map( arg => Number(arg) )
		else {
			this.x = x; this.y = y;
		}
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
function drawLayers( { layers = [], ctx, projection, highlighted, selected } = {} ){
	let cache = { pattern: new Map() }

	layers
		.sort( ( a, b ) => a.order - b.order )
		.map( ( layer, i ) => drawLayer({
			data: layer.data,
			ctx: ctx,
			projection: projection,
			highlighted: layer.highlighted,
			selected: layer.selected,
			legend: layer.legend,
			cache: cache
		}) )
}

function drawLayer( { data = [], ctx, projection, highlighted, selected, legend, cache } = {} ){
	//ctx.globalCompositeOperation = 'multiply';
	ctx.save();
	data.map( featureData =>
		drawGeometry( featureData, { defaultStyles: legend.defaultSettings.normal, ctx: ctx, projection: projection, cache: cache } )
	);
	ctx.restore();
	//ctx.globalCompositeOperation = 'source-over';
	highlighted.map(
		featureData => featureData.selected ||
			drawGeometry( featureData, { styles: [legend.defaultSettings.highlighted], ctx: ctx, projection: projection, cache: cache } )
	);
	ctx.restore();
	selected.map(
		featureData => drawGeometry( featureData, { styles: [legend.defaultSettings.selected], ctx: ctx, projection: projection, cache: cache } )
	);
	ctx.restore();
}

let drawGeometry = function( featureData, { styles = featureData.styles, defaultStyles = [], ctx, projection, cache } = {} ){
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
				if (key === 'lineDash' && style[key] instanceof Array){ _style[key] = style[key]; }
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
				else _style[key] = String( style[key] );
			});

			ctx.save();	
			Object.assign( ctx, ...defaultStyles, _style );
			
			ctx.lineWidth *= window.devicePixelRatio * ( screen.zoom );
			
			if (ctx.lineDash){
				ctx.setLineDash( ctx.lineDash.map( x => window.devicePixelRatio * x * screen.zoom ** ( screen.zoom < 1 ? 1 : .35 ) ) );	
			}

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
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
function getUrlParameters() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

let createSideBarItem = function({ title = 'title', data = [], parent } = {}){
	if ( data.length ) return React.createElement( $SideBarItem, { title: title, data: data, parent: parent } );
}

let createDevStdSideBarItem = function( devStds, parent ){
	let _devStds = {};

	Reflect.ownKeys( devStds ).map( key => {
		let val = devStds[key];
		_devStds[key] = val < 0 ? undefined : ( val === 0 ? 'Not Allowed' : ( val === 9999 ? 'Unlimited' : val ) );
	});

	let { density, densityNotes, far, farNotes, height, heightNotes, stories, storiesNotes } = _devStds;

	return [
		density && createSideBarItem({
			title: 'Max. Allowable Density', data: [{ item: isNaN(density) ? density: `1 DU / ${density} lot sf` , notes: densityNotes }], parent: parent
		}),
		far && createSideBarItem({ title: 'Max. Allowable FAR', data: [{ item: isNaN(far) ? far: `${far} : 1`, notes: farNotes }], parent: parent }),
		height && createSideBarItem({
			title: 'Max. Allowable Height',
			data: [{
				item: isNaN(height) ? ( isNaN(stories) ? height : `${stories} stories` ) : `${height} ft${ isNaN(stories) ? '' : ` & ${stories} stories` }`,
				notes: heightNotes && heightNotes.concat(storiesNotes)
			}],
			parent: parent
		})
	];
}

const $DataExplanation = class extends React.Component{
	constructor(...args){ super(...args); }
	render(){
		let notes = this.props.notes, url = '';

		return React.createElement('div', Object.assign( { className: 'explanation' }, this.props ),
			...notes.map( note => React.createElement( 'div', { className: 'note-type' }, 
				...note.notes.map( noteItem => 
					React.createElement('div', null,
						React.createElement( 'a', {
								target: '_blank',
								href: url = ( ( noteItem.url && noteItem.url.length ) ? noteItem.url : url )
							},
							`${note.type} ${noteItem.name.match(/\*+/) ? `${note.name}${noteItem.name}` : noteItem.name.replace(/\.?\$/, ' Para. ')}: `
						),
						React.createElement( 'span', null, noteItem.text )
					)
				)
			))
		);
	}
}

const $SideBarItemData = class extends React.Component{
	constructor(...args){ super(...args); this.state = { toggle: 0 } }
	toggle(){
		this.setState({ toggle: this.state.toggle^1 } );
	}
	handleClick(){
		this.toggle();
	}
	render(){
		let { item, notes = [] } = this.props;

		return React.createElement('div', { className: 'sidebar-item-data' },
			React.createElement( 'div', {
					className: 'value', onClick: notes.length ? this.handleClick.bind(this) : undefined
				},
				this.props.item,
				notes.length ? React.createElement('sup', { className: 'read-more' }, `(${ this.state.toggle ? 'Hide' : 'Show' } Notes)` ) : null
			),
			React.createElement( $DataExplanation, { ref: 'explanation', className: 'explanation', toggle: this.state.toggle, notes: notes } )
		)
	}
}

const $SideBarItem = class extends React.Component{
	render(){
		return React.createElement('div', { className: 'sidebar-item' },
			React.createElement('div', { className: 'sidebar-item-title' }, this.props.title ),
			React.createElement('div', { className: 'sidebar-item-body' }, 
				...this.props.data
					.filter( data => data )
					.map( data => React.createElement( $SideBarItemData, { item: data.item, notes: data.notes, parent: this } ) )
			)
				
		);
	}
}

const $SideBarData = class extends React.Component{
	render(){
		if ( !this.props.data ) return React.createElement('div', null);

		let { attr, zoningInfo } = this.props.data,
				{ ord1_key, ord2_key } = attr,
				ords = [];
				
		return React.createElement('div', null,
			React.createElement('div', { className: 'header', children: ['Existing Planning and Zoning'] } ),
			React.createElement('div', { className: 'content' },
				createSideBarItem({ title: 'General Plan Land Use', data: [{ item: zoningInfo.e.gplu, notes: zoningInfo.e.gpluNotes }], parent: this.props.parent }),
				createSideBarItem({ title: 'Zoning', data: [{ item: zoningInfo.e.zone }], parent: this.props.parent }),
				createSideBarItem({
					title: 'Planning Cases',
					data: [ ord1_key, ord2_key ].map( key => ({ item: key, notes: zoningInfo.e.devStds.generalNotes.filter( x => x.name === key) }) ),
					parent: this.props.parent
				}),
				...createDevStdSideBarItem( zoningInfo.e.devStds, this.props.parent )
			),
			zoningInfo.n.subArea && React.createElement('div', { className: 'header', children: ['HCPU2 Information'] } ),
			zoningInfo.n.subArea && React.createElement('div', { className: 'content' },
				createSideBarItem({ title: 'Proposed General Plan Land Use', data: [{ item: zoningInfo.n.gplu }], parent: this.props.parent }),
				createSideBarItem({ title: 'Proposed Zone', data: [{ item: zoningInfo.n.zone }], parent: this.props.parent }),
				createSideBarItem({ title: 'Subarea', data: [{ item: zoningInfo.n.hcpu2 , notes: zoningInfo.n.hcpu2Notes }], parent: this.props.parent }),
				createSideBarItem({ title: 'Subarea Type', data: [{ item: zoningInfo.n.subArea }], parent: this.props.parent }),
				createSideBarItem({ title: 'CPIO', data: [{ item: zoningInfo.n.cpio ? 'Yes' : 'No' }], parent: this.props.parent }),
				...createDevStdSideBarItem( zoningInfo.n.devStds, this.props.parent )
			)
		);
	}
}

const $Selectable = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { highlight: 0, select: 0 };
	}
	handleClick(){
		this.setState({ select: this.state.select^1 });
	}
	handleMouseEnter(){
		this.setState({ highlight: 1 });
	}
	handleMouseLeave(){
		this.setState({ highlight: 0 });
	}
	render(){
		return React.createElement(
			'div',
			Object.assign( {
				onClick: function(){
					return function(){
						this.parent && this.parent.handleClick && this.parent.handleClick.call(this.parent);
						this.handleClick.call(this)
					}
				},
				onMouseEnter: this.handleMouseEnter.bind(this),
				onMouseLeave: this.handleMouseLeave.bind(this),
				select: this.state.select,
				highlight: this.state.highlight },
				this.props ),
			...( this.props.children instanceof Array ? this.props.children : [ this.props.children ] )
		);
	}
}

const $Selectables = class extends React.Component{
	constructor(...args){
		super(...args);
	}
	render(){
		return React.createElement(
			'div',
			this.props,
			this.props.header && this.props.header,
			...( this.props.children instanceof Array ? this.props.children : [ this.props.children ] )
		)
	}
}

let createLayerSelectable = function({ key, text }){
	return React.createElement( $Selectable, { className: 'data-layer', onClick: this.handleClick(key).bind(this), }, text );
}

const $Setting = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { toggle: 0, className: '' }
	}
	toggle(){
		this.setState({ toggle: this.state.toggle^1 })
	}
	handleClick(key){
		let { parent, projection } = this.props;
		return function(){
			this.toggle();
			parent.props.legendMaps.get('A-ZONE').activeKey = (key); 
			parent.getMap.call( parent );
		}
	}
	render(){
		let parent = this.props.parent;

		return React.createElement('div', Object.assign( { className: 'setting', toggle: this.state.toggle }, this.props, { parent: undefined } ),
			React.createElement('div', { className: 'mask', onClick: this.toggle.bind(this) } ),
			React.createElement('div', { className: 'control-pane' },
				React.createElement('a', { onClick: parent.toSVG.bind(parent) }, 'Export Map'),
				React.createElement( $Selectables,
					{ className: 'layers',
						header: React.createElement('div', { className: 'header' },
							'Data Layers',
							React.createElement('div', { className: 'notes' },
								React.createElement('div', null, 'Existing conditions recorded on 09/01/2018.'),
								React.createElement('div', null, 'Proposed HCPU2 regulations based on the 05/2017 draft.'),
							)
						)
					},
					...parent.state.layers
						.map( layer => 
							layer.isActive ? React.createElement('div', { className: 'content' },
								...Array.from( parent.props.legendMaps.get( layer.name ).entries() )
									.map( x => createLayerSelectable.call( this, { key: x[0], text: x[1].name }) )
							) : null
						)
				)
			)
		);
	}
};

const $SearchPane = class extends React.Component{
	constructor(...args){ super(...args) }
	async handleSearch(address){
		if ( address.split(',').length < 2 ) address = `${address}, 'Hollywood, Los Angeles, California`; 
		return await geocode(address);
	}
	render(){
		return React.createElement('div',
			{ className: 'search-pane' },
			...( this.props.children instanceof Array ? this.props.children : [ this.props.children ] )
		)
	}
}

const $SideBar = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { toggle: 1, className: '' }
	}
	toggle(){
		this.setState({ toggle: this.state.toggle^1 });
	}
	toggleSetting(){
		let $setting = this.props.parent.refs.setting;
		$setting && $setting.toggle();
	}
	render(){
		let $searchPane = React.createElement( $SearchPane,
					Object.assign( { ref: 'searchPane', className: 'search-pane' }, this.props, { parent: undefined } ),
					React.createElement('button', { className: 'menu', onClick: this.toggleSetting.bind(this) }),
					React.createElement('input', { ref: 'input', className: 'search', placeholder: 'Search by address...' }),
					React.createElement('button', {
						className: 'search',
						onClick: () =>
							$SearchPane.prototype.handleSearch( this.refs.input.value )
								.then( data => {
									let coord = new Coord(data), parent = this.props.parent,
											{ nad, gcs, screen } = parent.props.projection;

									return $ContentPanel.prototype.getZone.call( parent, coord, { coordType: 'gcs', zoom: true } )
								})
								.catch( e => { throw e; alert(`Cannot find address '${this.refs.input.value}'. Try again.`) })
					})
				);

		return React.createElement('div', { className: 'side-bar', toggle: this.props.toggle },
			$searchPane,
			React.createElement('div', { className: 'info-pane' },
				React.createElement('div', { className: 'zoning-info', ref: 'zoningInfo' })
			)
		)
	}
};

const loadImage = async function(url){
	return await new Promise( (resolve, reject) => {
		let img = new Image();
		img.src = url;
		img.onload = () => { resolve(img) };
		img.onerror = e => { reject(e) };
	});
}

const $PopUp = class extends React.Component{
	constructor(...args){ super(...args); this.state = { touches: [] } }
	render(){
		let self = this,
				{ touches, state } = this.state;

		return React.createElement('div', { className: 'pop-up' },
			React.createElement('div', null, state ),
			React.createElement('div', null, touches.length ),
			...( touches ? touches.map( ( touch, i ) =>
					React.createElement('div', null,
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'pageX: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.pageX.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'pageY: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.pageY.toFixed(0) ),
						),
					)
				) : []
			)
		);
	}
}

const getOffset = function(touch){
	let { pageX, pageY, screenX, screenY, target } = touch,
			{ left, top } = target.getBoundingClientRect();

	return { offsetX: pageX - left, offsetY: pageY - top };
}

const $MapCanvas = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { touches: [], animation: { timer: 0 }, ctx: undefined, baseMap: { foregroundImg: undefined, backgroundImg: undefined } }
	}
	async loadBaseMap(backgroundURL, foregroundURL){
		[ this.state.baseMap.backgroundImg, this.state.baseMap.foregroundImg ] = await Promise.all([ loadImage(backgroundURL), loadImage(foregroundURL) ]);
	}
	componentDidMount(){
		let ctx = this.refs.canvas.getContext('2d'),
				parent = this.props.parent;
		
		ctx.width = this.props.width;
		ctx.height = this.props.height;
		ctx.scale( window.devicePixelRatio, window.devicePixelRatio );

		this.setState({ ctx: ctx, width: ctx.width, height: ctx.height });
		this
			.loadBaseMap( 'assets/img/basemap-background.png', 'assets/img/basemap-foreground.png' )
			.then( () => {
				parent.props.legendMaps.get('A-ZONE').activeKey = getUrlParameters().legend || 'hcpu2_height';
				parent.getMap()
					.then( () => parent.resize() ); 
			});
	}
	move(dx, dy){
		if ( dx || dy ){
			let { projection } = this.props.parent.props;
			
			projection.screen.x += dx;
			projection.screen.y += dy;

			cancelAnimationFrame(this.state.animation.timer);
			this.state.animation.timer = requestAnimationFrame( this.redraw.bind(this) );
		}
	}

	handleMouseMove(e){
		let { parent } = this.props;
		if ( !parent.state || !parent.state.layers ) return;
		e.persist();

		let { nad, gcs, screen } = parent.props.projection,
				{ layers } = parent.state,
				coord = new Coord([e.nativeEvent.offsetX, e.nativeEvent.offsetY]).project( screen, nad ),
				arr = layers
					.map( ( layer, i ) => {
						let thisLayer = parent.state.layers[i];

						if ( layer.isActive && thisLayer ) layer.highlighted = layer.data.filter( featureData => coord.isWithin(featureData.geometry.rings) );
						else layer.highlighted = [];
					})

		parent.refs.canvas.redraw();
	}

	handleClick(e){
		let parent = this.props.parent;

		if (!parent.state || !parent.state.layers) return;

		let { nad, gcs, screen } = parent.props.projection,
				coord = new Coord([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);

		parent.getZone(coord).catch( e => {} );
	}

	handleTouchStart(e){
		let touches = Array.from( e.touches ).map( touch => Object.assign( touch, getOffset(touch) ) );

		//if ( touches.length < 2 ) return;

		this.setState({ touches: touches });

		this.handleDragStart(touches[0]);
	}

	handleTouch(e){
		let touches = Array.from( e.touches ).map( touch => Object.assign( touch, getOffset(touch) ) ),
				[ c0, c1 ] = this.state.touches,
				[ new_c0, new_c1 ] = touches;

		//if ( touches.length < 2 ) return;
				
		this.setState({ touches: touches });

		c1 = c1 || c0;
		new_c1 = new_c1 || new_c0;

		let offsetX = ( c1.offsetX + c0.offsetX ) / 2,
				offsetY = ( c1.offsetY + c0.offsetY ) / 2,
				new_offsetX = ( new_c1.offsetX + new_c0.offsetX ) / 2,
				new_offsetY = ( new_c1.offsetY + new_c0.offsetY ) / 2,
				dx = new_offsetX - offsetX,
				dy = new_offsetY - offsetY,
				distX = c1.offsetX - c0.offsetX,
				distY = c1.offsetY - c0.offsetY,
				new_distX = new_c1.offsetX - new_c0.offsetX,
				new_distY = new_c1.offsetY - new_c0.offsetY,
				dist = ( distX ** 2 + distY ** 2 ) ** .5,
				new_dist = ( new_distX ** 2 + new_distY ** 2 ) ** .5,
				dDist = Math.abs(new_dist - dist),
				dZoom = ( new_dist - dist ) / dist;

		this.move( dx, dy );
		dist > 20 && dDist > ( dx ** 2 + dy ** 2 ) ** .5 && new_dist && this.zoom( new_offsetX, new_offsetY, dZoom > .5 ? .5 : ( dZoom < -.5 ? -.5 : dZoom ) )
	}

	handleTouchEnd(e){
		let touches = Array.from( e.touches ).map( touch => Object.assign( touch, getOffset(touch) ) );

		this.setState({ touches: touches });
	}
	/*handleTouchEvents(func){
		return (function(e){
			let { pageX, pageY, screenX, screenY, target } = e.changedTouches[0],
					{ left, top } = target.getBoundingClientRect(),
					nativeEvent = {
						offsetX: pageX - left,
						offsetY: pageY - top,
						screenX: screenX,
						screenY: screenY
					};

			func.call( this, { nativeEvent } )
		}).bind(this);
	}*/

	handleDragStart(e){
		let touch = this.state.touches[0] = e.nativeEvent || e,
				{ offsetX, offsetY, dataTransfer } = touch;

		dataTransfer && dataTransfer.setDragImage(document.getElementById('drag-image'), 0, 0);
		cancelAnimationFrame(this.state.animation.timer);
	}
	
	
	handleDrag(e){
		let touch = this.state.touches[0],
				newTouch = e.nativeEvent || e,
				dx = newTouch.offsetX - touch.offsetX, dy = newTouch.offsetY - touch.offsetY;
				this.state.touches[0] = newTouch;

		if ( newTouch.type !== 'dragend' && newTouch.screenX && newTouch.screenY )
			this.move(dx, dy);
	}
	handleDragEnd(e){
		this.setState({ touches: [] });
		return this.handleDrag(e);
	}

	zoom( x, y, dZoom ){
		if ( !dZoom ) return;

		let { nad, gcs, screen } = this.props.parent.props.projection;

		if ( dZoom && screen.zoom > screen.zoomMin || dZoom > 0 && screen.zoom < screen.zoomMax ){
			screen.x -= ( x - screen.x ) * dZoom / screen.zoom,
			screen.y -= ( y - screen.y ) * dZoom / screen.zoom,
			screen.zoom += dZoom;
		}

		cancelAnimationFrame(this.state.animation.timer);
		this.state.animation.timer = requestAnimationFrame( this.redraw.bind(this) );
	}
	handleWheel(e){
		let touch = e.nativeEvent || e,
				{ nad, gcs, screen } = this.props.parent.props.projection;
		
		this.zoom( touch.offsetX, touch.offsetY, -touch.deltaY * 1 / 512 )
	}

	redraw(){
		let { parent } = this.props;
		if ( !parent || !parent.state ) return;

		let projection = parent.props.projection,
				{ nad, screen } = projection,
				coord = new Coord(6455481.543734974, 1863309.72102292).project( nad, screen ),
				ctx = this.state.ctx;

		ctx.clearRect( 0, 0, this.state.width, this.state.height );
		ctx.drawImage( this.state.baseMap.backgroundImg, ...coord, WIDTH_MAP * screen.zoom, HEIGHT_MAP * screen.zoom );

		drawLayers.call( this, {
			layers: parent.state.layers,
			ctx: ctx,
			projection: parent.props.projection,
			/*highlighted: parent.highlighted,
			selected: parent.selected,
			*/
		});

		ctx.drawImage( this.state.baseMap.foregroundImg, ...coord, WIDTH_MAP * screen.zoom, HEIGHT_MAP * screen.zoom );
	}
	render(){ 
		return React.createElement( 'canvas', Object.assign( {
			ref: 'canvas', draggable: true,
			className: 'map-canvas',
			onMouseMove: this.handleMouseMove.bind(this),
			onClick: this.handleClick.bind(this),
			onDragStart: this.handleDragStart.bind(this),
			onDrag: this.handleDrag.bind(this),
			onDragEnd: this.handleDragEnd.bind(this),
			onMouseMove: this.handleMouseMove.bind(this),
			onWheel: this.handleWheel.bind(this),
			onTouchStart: this.handleTouchStart.bind(this),
			onTouchMove: this.handleTouch.bind(this),
			onTouchEnd: this.handleTouchEnd.bind(this),
			width: this.state.width,
			height: this.state.height
		}, this.props, { parent: undefined } ) );
	}
}

const $LegendImage = class extends React.Component{
	render(){
		let children = this.props.styles.map( style => {
			let { lineWidth, strokeStyle, fillStyle } = style;

			if ( fillStyle && fillStyle.type ) fillStyle = Hatch.parse(fillStyle);

			style = {
				background: ( fillStyle instanceof Hatch ) ? 'none' : ( fillStyle ? fillStyle.toString() : 'none' ),
				backgroundImage: ( fillStyle instanceof Hatch ) ? `url(${fillStyle._canvas.toDataURL()}) ` : 'none',
				borderColor: lineWidth ? `${strokeStyle ? strokeStyle.toString() : ''}` : 'none',
				borderWidth: lineWidth ? `${lineWidth / 2}` : 'none',
				borderStyle: lineWidth ? 'solid' : 'none',
				boxSizing: 'border-box'
			};

			if ( !fillStyle ){ style.background = '#efefef'; }

			return React.createElement('div', { className: 'legend-image-overlay', style: style });
		});

		return React.createElement('div', { className: 'legend-image' }, ...children)
	}
}

const $LegendItem = class extends React.Component{
	render(){
		let { styles, description } = this.props;

		return React.createElement('div', Object.assign({ className: 'legend-item' }, this.props, { parent: undefined, styles: undefined } ),
			React.createElement( $LegendImage, { className: 'legend-image', styles: styles } ),
			React.createElement('div', { className: 'legend-text', style: { whiteSpace: this.props.whitespace } }, description.toString() )
		);
	}
}

const $LegendGroup = class extends React.Component{
	constructor(...args){ super(...args); this.state = { repeat: 20 } }
	componentDidMount(){}
	resize(){
		let thisDOMNode = ReactDOM.findDOMNode(this),
				thisWidth = thisDOMNode.offsetWidth,
				realWidth = Array.from( thisDOMNode.getElementsByClassName('legend-item') ).slice( 0, this.state.repeat).reduce( ( x, y ) => x + y.offsetWidth, 0 );

		if ( realWidth > thisWidth && this.state.repeat > 1 ){
			this.setState( { repeat: this.state.repeat - 1 }, this.resize )
		}
	}
	render(){
		let { name, unit } = this.props.symbology;

		return React.createElement('div', Object.assign({ className: 'legend-group' }, this.props, { parent: undefined, symbology: undefined } ),
				name && React.createElement( 'div', { className: 'sub-header' }, name, 
					unit && React.createElement('span', {}, `(${unit})`  )
				),
				React.createElement( 'div', 
					{	className: 'legend-grid',
						ref: 'grid',
						style: { gridTemplateColumns: `repeat(${this.state.repeat}, fit-content(600px))` }
					}, null,
					...this.props.symbology.legend.map( item =>
						React.createElement( $LegendItem, { whitespace: this.state.repeat > 1 ? 'nowrap' : 'normal', styles: item.value, description: item.description || item.key } )
					)
				)
			);
	}
}

const $LegendBox = class extends React.Component{
	constructor(...args){
		super(...args);
		
		let canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d');

		this.state = { legendCtx: ctx, width: 300, children: [], legends: [] };
	}
	resize(){
		let canvasWidth = this.props.parent.refs.canvas.state.width,
				callback = function(){
					Reflect.ownKeys(this.refs).map( key => this.refs[key].setState({ repeat: 10 }, this.refs[key].resize ) )
				}
		
		if ( canvasWidth ) return this.setState({ width: canvasWidth * .5 }, callback.bind(this) );
	}
	render(){
		let legends = this.state.legends;

		return React.createElement( 'div', Object.assign( {}, this.props, { parent: undefined } ), 
			...( legends ? legends.map( legend =>
				React.createElement('div', null,
					...( legend.symbologies.map( ( symbology, i ) => 
								React.createElement( $LegendGroup, { ref: i, parent: this.props.parent, style: { width: this.state.width }, symbology: symbology } )
							)
						)
				
				) 
			): [] )
		);
	}
}

/** content panel of the interactive map
	*
	*/
var $ContentPanel = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { eventListeners: [], layers: [] };
	}
	componentDidMount(){
		window.addEventListener( 'resize', this.resize.bind(this) );
	}
	componentWillUnMount(){
		window.removeEventListener( 'resize', this.resize.bind(this) );
	}

	async getMap(){
		let legends = Array.from( this.props.legendMaps.entries() ).map( entry => entry[1].activeLegend );

		return await fetch('/get_map', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ legends: legends }),
			headers: { 'Content-Type': 'application/json' }
		})
			.then( response => response.json() )
			.then( layers => {

				layers.map( (layer, i) => {
					let thisLayer = this.state.layers[i];

					layer.highlighted = [];
					layer.legend = legends[i];

					if ( layer.isActive && thisLayer ){
						layer.selected = thisLayer.selected.map( feature => {

							let newFeature = layer.data.find( f => f.fid === feature.fid );
							if ( newFeature ) feature.style = newFeature.style;
							return feature;
						});
					}
					else layer.selected = [];
				});

				/*this.selected = this.selected.map( feature => {
					let newFeature = activeLayers.find( f => f.fid === feature.fid );
					if ( newFeature ) feature.style = newFeature.style; 
					return feature;
				}); */

				return new Promise( ( resolve, reject ) => resolve(layers) );
			})
			.then( layers => {
				let callback = function(){
					this.refs.legendBox.setState({ legends: layers.filter( layer => layer.isActive ).map( layer => layer.legend ) }, ( function(){
						this.refs.canvas.redraw();
						this.refs.legendBox.resize();
					} ).bind(this) );
				};

				this.setState( { layers: layers }, callback.bind(this) );
			})
			.catch( e => { console.log(e)} )
	}
	async getZone(coord, { coordType = 'screen', zoom = false } = {}){
		let scrCoord, nadCoord,
				{ nad, gcs, screen } = this.props.projection;

		switch (coordType){
			case 'nad': { scrCoord = coord.project(nad, screen); nadCoord = coord; } break;
			case 'gcs': { scrCoord = coord.project(gcs, screen); nadCoord = coord.project(gcs, nad); } break;
			default: { scrCoord = coord; nadCoord = coord.project(screen, nad); }
		}

		this.state.layers.map( layer => {
			layer.highlighted = [];

			if ( layer.isActive )
				layer.selected = layer.data.filter( featureData => nadCoord.isWithin(featureData.geometry.rings) );
			else layer.selected = [];
		});
	
		if ( zoom ){

			let canvas = this.refs.canvas,
					{ width, height } = canvas.state,
					oldZoom = screen.zoom;

			screen.zoom = Math.max( oldZoom, 3 );
			screen.x = ( screen.x - scrCoord.x ) * screen.zoom / oldZoom + width / 2;
			screen.y = ( screen.y - scrCoord.y ) * screen.zoom / oldZoom + height / 2;
		}

		this.refs.canvas.redraw();

		let zoneLayer = this.state.layers.find( layer => layer.name === 'A-ZONE' );

		return await fetch('/get_zone', {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({ fid: zoneLayer.selected[0] && zoneLayer.selected[0].fid }),
				headers: { 'Content-Type': 'application/json' }
			})
				.then( response => response.json() )
				.then( data => new Promise( res => res(data) ) )
				.catch( e => new Promise( res => res(undefined) ) )
				.then( data => {
					ReactDOM.render(
						React.createElement( $SideBarData, { data: data, parent: this } ),
						this.refs.sideBar.refs.zoningInfo,
					);
				});
	}
	toSVG(){
		drawSVGLayers({
			layers: this.state.layers,
			svg: this.props.svg.clear(),
			projection: this.props.projection
		});
		download('download.svg', this.props.svg.svg() );
	}
	resize(){
		let { offsetWidth, offsetHeight } = ReactDOM.findDOMNode(this),
				$canvas = this.refs.canvas,
				$legendBox = this.refs.legendBox,
				newWidth = Math.floor( offsetWidth - ReactDOM.findDOMNode(this.refs.sideBar).offsetWidth - 1),
				newHeight = offsetHeight,
				{ screen } = this.props.projection,
				{ width, height } = $canvas.state;

		$canvas.setState({ width: newWidth, height: newHeight }, function(){
			cancelAnimationFrame( $canvas.state.animation.timer );
			$legendBox.resize();

			if ( width !== undefined ) {
				screen.x += ( newWidth - width ) / 2;
				screen.y += ( newHeight - height ) / 2;
			}
			else [ screen.x, screen.y ] = [ newWidth / 2, newHeight / 2 ];

			$canvas.state.animation.timer = requestAnimationFrame( $canvas.redraw.bind($canvas) );
		});
	}

	render(){
		let $mapContainer = React.createElement(
					'div', 
					{ className: 'map-container',
						ref: 'mapContainer',
						key: 0,
					},
					React.createElement( $MapCanvas, { key: 1, ref: 'canvas', parent: this } ),
					React.createElement( $LegendBox, { key: 2, ref: 'legendBox', parent: this, className: 'legend' } ),
					React.createElement( $PopUp, { key: 3, ref: 'popUp', parent: this, className: 'popup' } ),
				),
				$setting = React.createElement( $Setting, { key: 1, ref: 'setting', parent: this } ),
				$sideBar = React.createElement( $SideBar, { key: 2, ref: 'sideBar', parent: this } );

		return React.createElement('div', { className: 'content-panel' }, 
			$setting, $sideBar, $mapContainer
		)
	}
}

function preventTouch(e){
	e.preventDefault();
}

return function init(){
		document.addEventListener('touchmove', preventTouch, { passive: false }) ;

		const	CENTER_NAD = [ 6460481.543734974, 1860059.721022923 ],
					DELTA_NAD = 10000,
					CENTER_GCS = [ -118.334243017, 34.1030693135 ],
					DELTA_X_GCS = 0.032961356000001274,
					DELTA_Y_GCS = 0.017952405000002614 / .65,
					[ WIDTH_SVG, HEIGHT_SVG ] = [ 11 * 72, 8.5 * 72 ],
					CENTER_SVG = [ 5.5 * 72, 2.85 * 72 ];

		let width = document.body.offsetWidth, height = document.body.offsetHeight,
				svgCanvas = SVG('svg').size(WIDTH_SVG, HEIGHT_SVG),
				projection = {
					nad: new Projection({ center: CENTER_NAD, scale: 1 / DELTA_NAD }),
					gcs: new Projection({ center: CENTER_GCS, scaleX: 1 / DELTA_X_GCS, scaleY: 1 / DELTA_Y_GCS }),
					svg: new Projection({ center: CENTER_SVG, scaleX: 1 / 720, scaleY: -1 / 720 }),
					screen: new Projection({
						center: [ document.body.offsetWidth / 2, document.body.offsetHeight / 2 - 40 * window.devicePixelRatio ],
						scaleX: 1 / WIDTH_MAP,
						scaleY: -1 / WIDTH_MAP,
						zoomMax: 4,
						zoomMin: .35
					})
				},
				$contentPanel = React.createElement( $ContentPanel, {
					key: 1,
					projection: projection,
					legendMaps: new LegendMaps(LEGEND_PARAMS),
					svg: svgCanvas
				}),
				reactElements = [
					React.createElement('div', { className: 'title-bar', key: 0 },
						'Hollywood Boulevard District Interactive Map',
					),
					$contentPanel
				];

		projection.screen.zoom = Math.min( width / WIDTH_MAP, height / HEIGHT_MAP );
		ReactDOM.render( reactElements, document.getElementById('container') );

	}
})()