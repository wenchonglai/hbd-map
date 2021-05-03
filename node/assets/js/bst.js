define( function(){

class BSTNode{
	constructor({ key, value }){
		this._key = key;
		this._value = value;
		this._lc = null;
		this._rc = null;
		this._parent = null;
		this._height = 1;
	}
	get lc(){ return this._lc; }
	set lc(node){ this._lc = node; }
	get isLeft(){ return !!this.parent && this.parent.lc === this; }
	get leftMost(){ let node = this, hot; while ( node = ( hot = node ).lc ); return hot; }
	
	get rc(){ return this._rc; }
	set rc(node){ return this._rc = node; }
	get isRight(){ return !!this.parent && this.parent.rc === this; }
	get rightMost(){ let node = this, hot; while ( node = ( hot = node ).rc ); return hot; }

	get parent(){ return this._parent; }
	set parent(node){ this._parent = node; }

	get height(){ return this._height; }
	set height(value){ this.height = value; }

	get key(){ return this._key; }
	get value(){ return this._value; }
	
	get pred(){
		let node = this;
		
		if ( node.lc ) return node.lc.rightMost;
		
		while ( node.isLeft ) node = node.parent;
		return node.parent;
	}
	get succ(){
		let node = this;
		
		if ( node.rc ) return node.rc.leftMost;
		
		while ( node.isRight ) node = node.parent;
		return node.parent;
	}

	updateHeight(){
		this._height = Math.max( ( this.lc ? this.lc.height : 0 ), ( this.rc ? this.rc.height : 0 ) ) + 1;
		return this._height;
	}
}

class BST{
	constructor(...BSTNodes){
		this._root = null;
		this._size = 0;
		BSTNodes.map( node => this.insert(node) );
	}
	get root(){ return this._root; }
	set root(node){ this._root = node; }
	get height(){ return this.root ? this.root.height : 0; }

	updateHeight( node, height = node.height ){
		let parent, parentHeight;

		node.updateHeight();

		while ( ( parent = node.parent ) )
			if ( ( parentHeight = ( node = parent ).height ) === parent.updateHeight() )
				break;

		return node.height;
	}

	insert(node){
		if ( !( node instanceof this.constructor.NodeClass ) ) node = new this.constructor.NodeClass(node);

		let hot = true, curr = this._root;
		
		if ( !curr ) this.root = node;
		else {

			while ( curr ) curr = ( node.key < ( hot = curr ).key ) ? curr.lc : curr.rc;

			if ( node.key < hot.key ) hot.lc = node;
			else hot.rc = node;

			node.parent = hot;
		}

		this._size++;
		this.updateHeight(node);

		return this;
	}
	remove(node){
		let p = node.parent, childNode = null;

		if ( !node.lc && !node.rc ); 
		else if ( !node.lc ) childNode = node.rc;
		else if ( !node.rc ) childNode = node.lc;
		else {
			childNode = this.remove( node.lc.rightMost );
			childNode.lc = node.lc;
			childNode.rc = node.rc;
			node.lc.parent = node.rc.parent = childNode;
		}
		
		if (p)
			if ( node.isLeft ) p.lc = childNode; else p.rc = childNode;

		if ( this.root === node ) this.root = childNode;

		if ( childNode ){
			childNode.parent = p;
			this.updateHeight( childNode );
		}

		node.parent = null;
		
		return node;
	}

	search( key, { isContinuous = false } = {} ){
		let node = this.root, hot = null;

		while ( node ){
			if ( node.key === key ) break;
			node = ( key < ( hot = node ).key ) ? node.lc : node.rc;
		}
		return isContinuous ? ( node ? node : key < hot.key ? hot.pred : hot ) : node;
	}
}

BST.NodeClass = BSTNode;

return BST;

});