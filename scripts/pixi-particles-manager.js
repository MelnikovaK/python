class PixiParticlesManager {

	constructor($container, visualizer, config, python) {

		this.ASSETS_PATH = 'assets/';
		this.container =  visualizer.app.stage;

		this.initEmmiter();

	}

	initEmmiter(){
		var emitter = new PIXI.particles.Emitter(

	this.container,
  
	[PIXI.Texture.fromImage(this.ASSETS_PATH  + 'CartoonSmoke.png')],
  
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

// Calculate the current time
var elapsed = Date.now();

var update = function(){
			
	// Update the next frame
	requestAnimationFrame(update);

	var now = Date.now();
	
	// The emitter requires the elapsed
	// number of seconds since the last update
	emitter.update((now - elapsed) * 0.001);
	elapsed = now;
	
	// Should re-render the PIXI Stage
	// renderer.render(stage);
};

// emitter.emit = true;

var canvas = document.getElementsByTagName('canvas')[0];

canvas.addEventListener('mouseup', function(e){
				if(!emitter) return;
				emitter.emit = true;
				emitter.resetPositionTracking();
				emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
			});


// Start the update
update();
	}
}