class PixiParticlesManager {

	constructor($container, config, python) {
		this.ASSETS_PATH = 'assets/'

		this.app = new PIXI.Application({width: 400, height: 400});
		this.createParticles();
	}
	createParticles(){
		var canvas = document.getElementsByTagName('canvas')[0];

		var rendererOptions = { view: canvas, };

		var stage = new PIXI.Container(),
			emitter = null,
			renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, rendererOptions),
			bg = null;

			var elapsed = Date.now();

			var updateId;

			var update = function(){
				updateId = requestAnimationFrame(update);

				var now = Date.now();
				if (emitter) emitter.update((now - elapsed) * 0.001);

				elapsed = now;
				renderer.render(stage);
			};


	}
}