class AssetManager {
	constructor() {
		this.assets_array = {};
	}

	addAsset(id, func, amount) {
		var elems = [];
		for ( var i = 0; i < amount; i++ ) {
			elems.push(func());
		}
		this.assets_array[id] = elems;
	}

	pullAsset(id) {
		var scope = this;
		if ( this.assets_array[id].length == 1 ){
			this.addAsset(id, function() {return scope.assets_array[id][0]}, 2)
		}
		return this.assets_array[id].pop();	
	}
	putAsset(asset, id) {
		// for ( var asset_id in this.assets_array )
		// 	if ( asset == this.assets_array[asset_id] )
		// 		this.assets_array[asset_id].push(asset);
		this.assets_array[id].push(asset);

	}
}