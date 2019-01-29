class AssetManager {

	constructor() {
		this.asset_entities = {};
	}

	addAsset(id, createAsset, pregenerate_amount ) {
		/*
		var elems = [];
		for ( var i = 0; i < pregenerate_amount; i++ ) {
			elems.push(createAsset());
		}
		this.asset_entities[id] = elems;
		*/
		this.asset_entities[ id ] = {
			id: id,
			assets: [],
			createAsset: createAsset
		};

		var a = [];
		for( var i=0; i< pregenerate_amount; i++ ){
			// var asset = this.pullAsset( id );
			// console.log( asset);
			a.push( this.pullAsset( id ) );
		}
		for( var i=0; i< a.length; i++ ){
			this.putAsset( a[i] );
		}

		// console.log("AM: ", this.asset_entities );
	}

	pullAsset(id) {
		/*
		var scope = this;
		if ( this.asset_entities[id].length == 1 ){
			this.addAsset(id, function() {return scope.asset_entities[id][0]}, 2)
		}
		return this.asset_entities[id].pop();	
		*/
		var asset_obj = this.asset_entities[ id ];
		if( !asset_obj ) return undefined;

		var asset;
		
		if( asset_obj.assets.length ){
			asset = asset_obj.assets.pop();
		}else{
			asset = asset_obj.createAsset();
			asset._asset_id = id;	
		}

		return asset;
	}
	
	putAsset(asset) {
		// for ( var asset_id in this.asset_entities )
		// 	if ( asset == this.asset_entities[asset_id] )
		// 		this.asset_entities[asset_id].push(asset);

		var asset_obj = this.asset_entities[ asset._asset_id ];
		if( !asset_obj ) return undefined;

		asset_obj.assets.push( asset );

	}

}
