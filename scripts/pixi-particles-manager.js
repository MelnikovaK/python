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
		this.smoke = PIXI.loader.resources[this.ASSETS_PATH + "smoke.json"]
		this.app.stage.addChild(this.container);
    

    
   

	}

	 tick(delta) {
        if (this.smoking) {
            this.emitter.update(delta);
        }
    }

	initSmokeEmitter() {
        return new PIXI.particles.Emitter(this.container,this.art, this.smoke);
    }

    start() {
        this.smoking = true;
        console.log('start')
        this.emitter.emit = true;
    }

}