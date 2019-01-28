class PixiParticlesManager {

	constructor($container, visualizer, config, python) {


		this.ASSETS_PATH = 'assets/'
		this.container = new PIXI.Container();

    this.emitter = this.initSmokeEmitter();

    this.art = [PIXI.Texture.fromImage(this.ASSETS_PATH +'CartoonSmoke.png')]

    PIXI.ticker.shared.add(this.tick, this);

		this.app = visualizer.app;

		this.createParticles();
		this.start();
	}
	createParticles(){
		var canvas = document.getElementsByTagName("canvas")[0];
		// Basic PIXI Setup
		var rendererOptions =
		{
			view: canvas,
		};
    var update = function(){

			// Update the next frame
			updateId = requestAnimationFrame(update);

			var now = Date.now();
			if (emitter)
				emitter.update((now - elapsed) * 0.001);

			elapsed = now;
			// render the stage
			renderer.render(stage);
		};

		window.emitter = emitter = new PIXI.particles.Emitter(
				this.app.stage,
				this.art,
				{
		"alpha": {
			"start": 0.74,
			"end": 0
		},
		"scale": {
			"start": 0.1,
			"end": 1.2
		},
		"color": {
			"start": "eb8b58",
			"end": "575757"
		},
		"speed": {
			"start": 700,
			"end": 50
		},
		"startRotation": {
			"min": 0,
			"max": 360
		},
		"rotationSpeed": {
			"min": 0,
			"max": 200
		},
		"lifetime": {
			"min": 0.4,
			"max": 0.7
		},
		"blendMode": "normal",
		"frequency": 0.001,
		"emitterLifetime": 0.2,
		"maxParticles": 100,
		"pos": {
			"x": 0,
			"y": 0
		},
		"addAtBack": true,
		"spawnType": "point"
}
			);
   

	}
}