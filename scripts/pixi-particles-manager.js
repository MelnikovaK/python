class PixiParticlesManager {

	constructor($container, visualizer, config, python) {


		this.ASSETS_PATH = 'assets/'

		this.app = visualizer.app;

		this.createParticles();
	}
	createParticles(){
		var scope = this;
		var ParticleExample = function(imagePaths, config, type, useParticleContainer, stepColors)
		{
			var canvas = document.getElementsByTagName("canvas")[0];
			var rendererOptions =
			{
				view: canvas,
			};

			var stage = scope.app.stage,
				emitter = null,
				renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, rendererOptions);

			// Calculate the current time
			var elapsed = Date.now();

			var updateId;

			// Update function every frame
			var update = function(){

				// Update the next frame
				updateId = requestAnimationFrame(update);

				var now = Date.now();
				if (emitter)
					emitter.update((now - elapsed) * 0.001);

				elapsed = now;
				renderer.render(stage);
			};

			// Preload the particle images and create PIXI textures from it
			var makeTextures = true;
				
				//collect the textures, now that they are all loaded
				var art;
				if(makeTextures)
				{
					art = [];
					for(var i = 0; i < imagePaths.length; ++i)
						art.push(PIXI.Texture.fromImage(imagePaths[i]));
				} else art = imagePaths.art;

				// Create the new emitter and attach it to the stage
				var emitterContainer;
				if(useParticleContainer)
				{
					emitterContainer = new PIXI.ParticleContainer();
					emitterContainer.setProperties({
						scale: true,
						position: true,
						rotation: true,
						uvs: true,
						alpha: true
					});
				}
				else
					emitterContainer = new PIXI.Container();
				stage.addChild(emitterContainer);
				window.emitter = emitter = new PIXI.particles.Emitter(
					emitterContainer,
					art,
					config
				);
				if (stepColors)
					emitter.startColor = PIXI.particles.ParticleUtils.createSteppedGradient(config.color.list, stepColors);
				if(type == "path")
					emitter.particleConstructor = PIXI.particles.PathParticle;
				else if(type == "anim")
					emitter.particleConstructor = PIXI.particles.AnimatedParticle;

				// Center on the stage
				emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

				// Click on the canvas to trigger
				canvas.addEventListener('mouseup', function(e){
					if(!emitter) return;
					emitter.emit = true;
					emitter.resetPositionTracking();
					emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
				});

				// Start the update
				update();
		};

		// Assign to global space
		window.ParticleExample = new ParticleExample(
					// The image to use
					[this.ASSETS_PATH + "CartoonSmoke.png"],
					// Emitter configuration, edit this to change the look
					// of the emitter
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
					});
	}
}