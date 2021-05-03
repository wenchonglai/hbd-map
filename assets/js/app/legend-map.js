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