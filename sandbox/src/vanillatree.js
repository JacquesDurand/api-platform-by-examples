// copy of https://github.com/finom/vanillatree without Balalaika for better tree shaking
const $ = require('balalaika');

var create = function( tagName, props ) {
  return $.extend( document.createElement( tagName ), props );
},
Tree = function( s, options ) {
  var _this = this,
    container = _this.container = $( s )[ 0 ],
    tree = _this.tree = container.appendChild( create( 'ul', {
      className: 'vtree'
    }) );

  _this.placeholder = options && options.placeholder;
  _this._placeholder();
  _this.leafs = {};
  tree.addEventListener( 'click', function( evt ) {
    if( $( evt.target ).is( '.vtree-leaf-label' ) ) {
      _this.select( evt.target.parentNode.getAttribute('data-vtree-id') );
    } else if( $( evt.target ).is( '.vtree-toggle' ) ) {
      _this.toggle( evt.target.parentNode.getAttribute('data-vtree-id') );
    }
  });
};

Tree.prototype = {
constructor: Tree,
_dispatch: function( name, id ) {
  var event;
  try {
    event = new CustomEvent( 'vtree-' + name, {
      bubbles: true,
      cancelable: true,
      detail: {
        id: id
      }
    });
  } catch(e) {
    event = document.createEvent( 'CustomEvent' );
    event.initCustomEvent( 'vtree-' + name, true, true, { id: id });
  }
  ( this.getLeaf( id, true ) || this.tree )
    .dispatchEvent( event );
  return this;
},
_placeholder: function() {
  var p;
  if( !this.tree.children.length && this.placeholder ) {
    this.tree.innerHTML = '<li class="vtree-placeholder">' + this.placeholder + '</li>'
  } else if( p = this.tree.querySelector( '.vtree-placeholder' ) ) {
    this.tree.removeChild( p );
  }
  return this;
},
getLeaf: function( id, notThrow ) {
  var leaf = $( '[data-vtree-id="' + id + '"]', this.tree )[ 0 ];
  if( !notThrow && !leaf ) throw Error( 'No VanillaTree leaf with id "' + id + '"' )
  return leaf;
},
getChildList: function( id ) {
  var list,
    parent;
  if( id ) {
    parent = this.getLeaf( id );
    if( !( list = $( 'ul', parent )[ 0 ] ) ) {
      list = parent.appendChild( create( 'ul', {
        className: 'vtree-subtree'
      }) );
    }
  } else {
    list = this.tree;
  }

  return list;
},
add: function( options ) {
  var id,
    leaf = create( 'li', {
      className: 'vtree-leaf'
    }),
    parentList = this.getChildList( options.parent );

  leaf.setAttribute( 'data-vtree-id', id = options.id || Math.random() );

  leaf.appendChild( create( 'span', {
    className: 'vtree-toggle'
  }) );

  leaf.appendChild( create( 'a', {
    className: 'vtree-leaf-label',
    innerHTML: options.label
  }) );

  parentList.appendChild( leaf );

  if( parentList !== this.tree ) {
    parentList.parentNode.classList.add( 'vtree-has-children' );
  }

  this.leafs[ id ] = options;

  if( !options.opened ) {
    this.close( id );
  }

  if( options.selected ) {
    this.select( id );
  }

  return this._placeholder()._dispatch( 'add', id );
},
move: function( id, parentId ) {
  var leaf = this.getLeaf( id ),
    oldParent = leaf.parentNode,
    newParent = this.getLeaf( parentId, true );

  if( newParent ) {
    newParent.classList.add( 'vtree-has-children' );
  }

  this.getChildList( parentId ).appendChild( leaf );
  oldParent.parentNode.classList.toggle( 'vtree-has-children', !!oldParent.children.length );

  return this._dispatch( 'move', id );
},
remove: function( id ) {
  var leaf = this.getLeaf( id ),
    oldParent = leaf.parentNode;
  oldParent.removeChild( leaf );
  oldParent.parentNode.classList.toggle( 'vtree-has-children', !!oldParent.children.length );

  return this._placeholder()._dispatch( 'remove', id );
},
open: function( id ) {
  this.getLeaf( id ).classList.remove( 'closed' );
  return this._dispatch( 'open', id );
},
close: function( id ) {
  this.getLeaf( id ).classList.add( 'closed' );
  return this._dispatch( 'close', id );
},
toggle: function( id ) {
  return this[ this.getLeaf( id ).classList.contains( 'closed' ) ? 'open' : 'close' ]( id );
},
select: function( id ) {
  var leaf = this.getLeaf( id );

  if( !leaf.classList.contains( 'vtree-selected' ) ) {
    $( 'li.vtree-leaf', this.tree ).forEach( function( leaf ) {
      leaf.classList.remove( 'vtree-selected' );
    });

    leaf.classList.add( 'vtree-selected' );
    this._dispatch( 'select', id );
  }

  return this;
}
};

module.exports = Tree;
