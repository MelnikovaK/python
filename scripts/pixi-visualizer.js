class PixiVisualizer {
	
	constructor($container, python, config, screens) {

		//ACTIONS NAMES
		this.PROGRESSBAR_LOADING = "pixi-visualizer:progressbar_loading";

		//FIELD ELEMENTS SIZE
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;
		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;

		//
		this.python = python;


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
		var head = python.python_body[0];
		this.head_sprite.x = head.x * this.CELL_WIDTH;
		this.head_sprite.y = head.y * this.CELL_HEIGHT;
	}

	loadAssets() {
		PIXI.loader
			.add([
		    // "assets/game.json",
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
		this.createGameField();
 		this.createSnake();
 		

		console.log("All files loaded");
	}

	getSprite( sprite_name, x, y, width, height ){
		let texture = PIXI.loader.resources[ sprite_name ].texture.clone();
		texture.frame = new PIXI.Rectangle(x*width, y*height, width, height);
		let sprite = new PIXI.Sprite( texture );
		sprite.width = this.CELL_WIDTH;
		sprite.height = this.CELL_HEIGHT;
		return sprite;
	}

	createGameField() {
		for ( var i = 0; i < this.cells_horizontal; i++) {
			for ( var j = 0; j < this.cells_vertical; j++) {

				if ( i == 0 || j == 0 || i == this.cells_horizontal - 1 || j == this.cells_vertical - 1)  var pic_name = "assets/Wall.png";
				else var pic_name = "assets/Ground.png"

				let ground_cell = new PIXI.Sprite(PIXI.loader.resources[pic_name].texture);
				ground_cell.x = i * this.CELL_WIDTH;
				ground_cell.y = j * this.CELL_HEIGHT;
				ground_cell.width = this.CELL_WIDTH;
				ground_cell.height = this.CELL_HEIGHT;
				this.app.stage.addChild(ground_cell);
			}
		}
	}

	createSnake() {
		// SNAKE
 		var head = this.head_sprite = this.getSprite( "assets/snake-graphics.png", 3, 0, 64, 64 );
 		this.app.stage.addChild( head );

 		var straight_body = this.straight_body_sprite = this.getSprite( "assets/snake-graphics.png", 2, 1, 64, 64 );
 		this.app.stage.addChild( straight_body );

 		var curved_body = this.curved_body_sprite = this.getSprite( "assets/snake-graphics.png", 0, 0, 64, 64 );
 		this.app.stage.addChild( curved_body );

 		var tail = this.tail_sprite = this.getSprite( "assets/snake-graphics.png", 3, 2, 64, 64 );
 		this.app.stage.addChild( tail );

 		//BONUS
 		var x = this.python.bonus.x;
		var y = this.python.bonus.y;
		// console.log(x)


 		var bonus = this.bonus_sprite = this.getSprite( "assets/snake-graphics.png", 0, 3, 64, 64 );
 		this.app.stage.addChild( bonus );
 		bonus.x = this.CELL_WIDTH * 2;
	}

}
