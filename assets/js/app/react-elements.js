{
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
	toggleSetting(){
		let $setting = this.props.parent.refs.setting;
		$setting && $setting.toggle();
	}
	render(){
		return React.createElement('div',
			{ className: 'search-pane' },
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
		)
	}
}

const $DraggablePanel = class extends React.Component{
	render(){
		return React.createElement('div', Object.assign( {}, this.props, { dragbar: undefined }), 
			React.createElement('div', { className: 'drag-content' }, this.props.children ),
			this.props.dragbar || null
		)
	}
}

const $SideBar = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { toggle: 1 }
	}
	toggle(){
		this.setState({ toggle: this.state.toggle^1 });
	}
	
	render(){
		

		return React.createElement( $DraggablePanel, 
			{ className: 'side-bar',
				toggle: this.props.toggle,
				dragbar: null
			},
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
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'screenX: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.screenX.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'screenY: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.screenY.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'offsetX: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.offsetX.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'offsetY: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.offsetY.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } }, 
							React.createElement('div', { style: { display: 'table-cell' } }, 'left: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.left.toFixed(0) ),
						),
						React.createElement('div', { style: { display: 'table-row' } },
							React.createElement('div', { style: { display: 'table-cell' } }, 'top: '),
							React.createElement('div', { style: { display: 'table-cell' } }, touch.top ),
						)
					)
				) : []
			)
		);
	}
}

const getOffset = function(touch){
	let { pageX, pageY, screenX, screenY, target } = touch,
			{ left, top } = target.getBoundingClientRect();

	left += window.scrollX;
	top += window.scrollY;

	return { offsetX: pageX - left, offsetY: pageY - top, left: left, top: `${top},${window.scrollY}` };
}

const $MapCanvas = class extends React.Component{
	constructor(...args){
		super(...args);
		this.state = { touches: [], animation: { timer: 0 }, listeners: [], baseMap: { foregroundImg: undefined, backgroundImg: undefined } }
	}
	async loadBaseMap(backgroundURL, foregroundURL){
		[ this.state.baseMap.backgroundImg, this.state.baseMap.foregroundImg ] = await Promise.all([ loadImage(backgroundURL), loadImage(foregroundURL) ]);
	}
	get ctx(){ return this._ctx; }
	componentDidMount(){
		let ctx = this.refs.canvas.getContext('2d'),
				parent = this.props.parent,
				elem = ReactDOM.findDOMNode(this),
				func =  e => {
					this.handleTouch.call(this, e);
					e.preventDefault();
				},
				listenerArgs = [ 'touchmove', func ];

		elem.addEventListener(...listenerArgs, { passive: false });
		
		ctx.width = this.props.width;
		ctx.height = this.props.height;
		ctx.scale( window.devicePixelRatio, window.devicePixelRatio );

		this.state.listeners.push(listenerArgs);
		this._ctx = ctx;
		
		this
			.loadBaseMap( 'assets/img/basemap-background.png', 'assets/img/basemap-foreground.png' )
			.then( () => {
				parent.props.legendMaps.get('A-ZONE').activeKey = getUrlParameters().legend || 'gplu';
				parent.getMap()
					.then( () => parent.resize() ); 
			});
	}
	componentWillUnMount(){
		this.state.listeners.map( entry => elem.removeEventListener( ...entry, { passive: false }) );
		
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

		cancelAnimationFrame(this.state.animation.timer);
		this.state.animation.timer = requestAnimationFrame( this.redraw.bind(this) );
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

	redraw(mode){
		let { parent } = this.props;
		if ( !parent || !parent.state ) return;

		let projection = parent.props.projection,
				{ nad, screen } = projection,
				coord = new Coord(6455481.543734974, 1863309.72102292).project( nad, screen ),
				ctx = this.ctx;

		ctx.clearRect( 0, 0, this.props.width, this.props.height );
		ctx.drawImage( this.state.baseMap.backgroundImg, ...coord, WIDTH_MAP * screen.zoom, HEIGHT_MAP * screen.zoom );

		drawLayers.call( this, {
			layers: parent.state.layers,
			ctx: ctx,
			projection: parent.props.projection,
			mode: mode
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
			//onTouchMove: this.handleTouch.bind(this),
			onTouchEnd: this.handleTouchEnd.bind(this)
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
				realWidth = Array.from( thisDOMNode.getElementsByClassName('legend-item') ).slice( 0, this.state.repeat).reduce( ( x, y ) => x + y.offsetWidth + window.scrollY, 0 );

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
		let canvasWidth = this.props.parent.refs.canvas.props.width,
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
								React.createElement( $LegendGroup, { ref: i, parent: this.props.parent, style: { width: this.props.width }, symbology: symbology } )
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
		this.state = { eventListeners: [], layers: [], classes: new Set(['not-mounted']) };
	}
	componentDidMount(){
		this.state.classes.delete('not-mounted')
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
					{ width, height } = canvas.props,
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
				{ width, height, classes } = this.state,
				$canvas = this.refs.canvas,
				$legendBox = this.refs.legendBox,
				$sideBar = this.refs.sideBar,
				sideBar = ReactDOM.findDOMNode($sideBar),
				oldSideBarWidth = classes.has('mobile') ? 0 : sideBar.offsetWidth,
				{ screen } = this.props.projection;

		offsetWidth < 800 ? classes.add('mobile') : classes.delete('mobile');

		this.setState({ width: offsetWidth, height: offsetHeight }, function(){
			let $sideBar = this.refs.sideBar,
					sideBar = ReactDOM.findDOMNode($sideBar),
					sideBarWidth = classes.has('mobile') ? 0 : sideBar.offsetWidth;

			cancelAnimationFrame( $canvas.state.animation.timer );
			$legendBox.resize();

			if ( width !== undefined ) {
				screen.x += ( offsetWidth - width - oldSideBarWidth + sideBarWidth ) / 2;
				screen.y += ( offsetHeight - height ) / 2;
			}
			else {
				[ screen.x, screen.y ] = [ ( offsetWidth + sideBarWidth ) / 2, offsetHeight / 2 ];
			}

			$canvas.state.animation.timer = requestAnimationFrame( $canvas.redraw.bind($canvas) );
		});
	}

	render(){
		let $searchPane = React.createElement( $SearchPane, { ref: 'searchPane', parent: this, className: 'search-pane' }, null ),
				$mapContainer = React.createElement(
					'div', 
					{ className: 'map-container',
						ref: 'mapContainer',
						key: 0,
					},
					React.createElement( $MapCanvas, { key: 1, ref: 'canvas', parent: this, width: this.state.width, height: this.state.height } ),
					React.createElement( $LegendBox, { key: 2, ref: 'legendBox', parent: this, className: 'legend' } ),
					React.createElement( $PopUp, { key: 3, ref: 'popUp', parent: this, className: 'popup' } ),
				),
				$setting = React.createElement( $Setting, { key: 1, ref: 'setting', parent: this } ),
				$sideBar = React.createElement( $SideBar, { key: 2, ref: 'sideBar', parent: this } );

		return React.createElement('div', { className: `content-panel ${Array.from(this.state.classes).join(' ')}` }, 
			$setting, $sideBar, $searchPane, $mapContainer
		);
	}
}

}