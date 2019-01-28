class PixiParticlesManager {

	constructor($container, visualizer, config, python) {

		this.ASSETS_PATH = 'assets/';
		this.container =  visualizer.app.stage;
		this.python = python;

		//
		this.emitters_array  = {};

		this.initEmittersArray();

		window.addEventListener( python.GAME_OVER , function () {
			if(!this.game_over_emitter) return;
			this.game_over_emitter.emit = true;
			this.game_over_emitter.resetPositionTracking();
			this.game_over_emitter.updateOwnerPos(this.python.python_body[0].x * 20, this.python.python_body[0].y * 20 );
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			if(!this.get_point_emitter) return;
			this.get_point_emitter.emit = true;
			this.get_point_emitter.resetPositionTracking();
			this.get_point_emitter.updateOwnerPos(this.python.python_body[0].x * 20, this.python.python_body[0].y * 20 );
		}.bind(this));

		window.addEventListener( python.PYTHON_MOVED , function () {
			// this.elapsed = Date.now();
			// // var scope = this;
			// this.update();

		}.bind(this));

	}

	initEmittersArray() {
		this.game_over_emitter = new PIXI.particles.Emitter(this.container, [PIXI.Texture.fromImage(this.ASSETS_PATH  + 'CartoonSmoke.png')], game_over);
		this.get_point_emitter = new PIXI.particles.Emitter(this.container, [PIXI.Texture.fromImage(this.ASSETS_PATH  + 'coin.png')], get_point, "anim");

		this.emitters_array = {
			'game_over': this.game_over_emitter,
			'get_point': this.get_point_emitter
		}

		var elapsed = Date.now();
		var scope = this;

		var update = function(){
					
			var updateId = requestAnimationFrame(update);
				var now = Date.now();
				for ( var emitter_name in scope.emitters_array ) {
					if (scope.emitters_array[emitter_name])
					scope.emitters_array[emitter_name].update((now - elapsed) * 0.001);
				}
				elapsed = now;
		};

		update();
	}

	// update() {
	// 	var scope = this;
	// 	var updateId = requestAnimationFrame(scope.update);
	// 	var now = Date.now();
	// 	for ( var emitter_name in scope.emitters_array ) {
	// 		if (scope.emitters_array[emitter_name])
	// 		scope.emitters_array[emitter_name].update((now - scope.elapsed) * 0.001);
	// 	}
	// 	scope.elapsed = now;
	// }
}