class PixiVisualizer {
	constructor($container, python, config, screens) {

		//ACTIONS NAMES
		this.PROGRESSBAR_LOADING = "pixi-visualizer:progressbar_loading";

		//FIELD ELEMENTS SIZE
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;


		this.initPixiApplication();
		this.loadAssets();


		window.addEventListener(python.PYTHON_MOVED, function() {
			this.moveAction();
		}.bind(this));
	}

	initPixiApplication() {
		this.app = new PIXI.Application({width: this.FIELD_WIDTH, height: this.FIELD_HEIGHT});
		var game_screen = document.getElementsByClassName('game-screen')[0];
		game_screen.appendChild(this.app.view);
	}

	moveAction() {

	}

	loadAssets() {
		PIXI.loader
			.add([
		    "assets/Ground.png",
		    "assets/snake-graphics.png",
		    "assets/Wall.png",
		    "assets/bonus.mp3",
		    "assets/game over.mp3",
		    "assets/music.mp3"
		  ])
		  .on("progress", this.loadProgressHandler.bind(this))
		  .load(this.setup.bind(this));
	}

	loadProgressHandler(loader, resource) {
		Utils.triggerCustomEvent( window, this.PROGRESSBAR_LOADING, loader.progress );

	  console.log("loading: " + resource.url); 
	  console.log("progress: " + loader.progress + "%");
	}


	setup() {
		let ground = new PIXI.Sprite(PIXI.loader.resources["assets/snake-graphics.png"].texture);
  	this.app.stage.addChild(ground);
		console.log("All files loaded");
	}

}
