class PixiVisualizer {
	
	constructor($container, python, config, screens) {

		//EVENT NAMES
		this.PRELOAD_PROGRESS = "pixi-visualizer:preload_progress";
		this.PRELOAD_COMPLETE = "pixi-visualizer:preload_complete";

		//FIELD ELEMENTS SIZE
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;
		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;

		this.ASSETS_PATH = 'assets/';

		//
		this.python = python;

		//
		this.python_body = [];

		//
		this.SPRITE_WIDTH = 64;
		this.SPRITE_HEIGHT = 64;


		this.parts_indexes = {
			"-10": 2,
			"0-1": 1,
			"10": 4,
			"01": 8,
		};

		//
		this.snake_parts = {};
		this.snake_parts[1+2] = { coordinates: [0,0], name: '┘'};// UL  ┘
		this.snake_parts[1+8] = { coordinates: [2,1], name: '|'};// UD  |
		this.snake_parts[1+4] = { coordinates: [2,0], name: '└'};// UD  └
		this.snake_parts[2+8] = { coordinates: [0,1], name: '┐'};// UD  ┐
		this.snake_parts[4+8] = { coordinates: [2,2], name: '┌'};// UD  ┌
		this.snake_parts[2+4] = { coordinates: [1,0], name: '-'};// UD  -
		this.snake_parts[1] = { coordinates: [4,3], name: 'tail down'};//tail down
		this.snake_parts[2] = { coordinates: [4,2], name: 'tail righ'};//tail right
		this.snake_parts[4] = { coordinates: [3,3], name: 'tail left'};//tail left
		this.snake_parts[8] = { coordinates: [3,2], name: 'tail up'};//tail up


		//
		this.initPixiApplication();
		this.loadAssets();

		window.addEventListener(python.PYTHON_MOVED, function() {
			this.moveAction();
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
			this.playSound(this.ASSETS_PATH+"music.mp3");
			this.moveAction();
			this.setSpritePosition( this.bonus_sprite, this.python.bonus.x, this.python.bonus.y );
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			this.playSound(this.ASSETS_PATH+"bonus.mp3");
			this.setSpritePosition( this.bonus_sprite, this.python.bonus.x, this.python.bonus.y );
			this.growPython();
		}.bind(this));

		window.addEventListener( python.GAME_OVER , function () {
			this.playSound(this.ASSETS_PATH+"game over.mp3");
			this.stopSound(this.ASSETS_PATH+"music.mp3");
		}.bind(this));
		
	}

	playSound( sound_name ){
		var sound = PIXI.sound.Sound.from( sound_name );
		sound.play();
	}

	stopSound(sound_name) {
		var sound = PIXI.sound.Sound.from( sound_name );
		sound.stop();
	}

	initPixiApplication() {
		this.app = new PIXI.Application({width: this.FIELD_WIDTH, height: this.FIELD_HEIGHT});
		var game_screen = document.getElementsByClassName('game-screen')[0];
		game_screen.appendChild(this.app.view);
	}

	moveAction() {
		var python_body = python.python_body;
		this.python_body[0].sprite.rotation = this.python.python_direction.rotation;

		this.updateBody();

		for ( var i = 0; i < python_body.length ; i++ ) {
			this.setSpritePosition( this.python_body[i].sprite, python_body[i].x, python_body[i].y );
		}
	}

	updateBody() {
		var python_body = python.python_body;

		//BODY
		for ( var i = 1; i < python_body.length; i++ ) {

			if (i == 0) var prev_part = 0;
			else var prev_part = this.getDiffString(python_body[i], python_body[i - 1]);
			if (i == python_body.length - 1) var next_part = 0;
			else var next_part = this.getDiffString(python_body[i], python_body[i + 1]);

			this.updateSnakePart(prev_part, next_part, i);
		}

	}

	getDiffString(fisrt_elem, sec_elem) {
		var diff_x = fisrt_elem.x - sec_elem.x;
		var diff_y = fisrt_elem.y - sec_elem.y;
		return diff_x.toString() + diff_y.toString();
	}

	updateSnakePart(prev_part, next_part, index) {
		var prev = this.parts_indexes[prev_part] || 0;
		var next = this.parts_indexes[next_part] || 0;
		console.log(prev, next)


		var x = this.snake_parts[this.parts_indexes[prev_part] + next].coordinates[0];
		var y = this.snake_parts[this.parts_indexes[prev_part] + next].coordinates[1];

		this.setSpriteCoordinates(this.ASSETS_PATH+"snake-graphics.png", this.python_body[index].sprite, x, y);
	}


	loadAssets() {

		var scope = this;

		PIXI.loader
			.add([
				this.ASSETS_PATH+"game-over.json",
		    this.ASSETS_PATH+"Ground.png",
		    this.ASSETS_PATH+"bg.png",
		    this.ASSETS_PATH+"CartoonSmoke.png",
		    this.ASSETS_PATH+"snake-graphics.png",
		    this.ASSETS_PATH+"Wall.png",
		    this.ASSETS_PATH+"bonus.mp3",
		    this.ASSETS_PATH+"game over.mp3",
		    this.ASSETS_PATH+"music.mp3"
		  ])
		  .on("progress", _loadProgressHandler )
		  .load( _setup );

		  function _loadProgressHandler(loader, resource) {
				Utils.triggerCustomEvent( window, scope.PRELOAD_PROGRESS, loader.progress );
			}

			function _setup() {
				scope.createGameField();
		 		scope.createGameCharacters();
		 		scope.visualizeParticles();
		 		Utils.triggerCustomEvent( window, scope.PRELOAD_COMPLETE );
			}

	}

	

	getSprite( sprite_name, x, y, width, height ){
		let texture = PIXI.loader.resources[ sprite_name ].texture.clone();
		texture.frame = new PIXI.Rectangle(x*width, y*height, width, height);

		let sprite = new PIXI.Sprite( texture );
		sprite.width = this.CELL_WIDTH;
		sprite.height = this.CELL_HEIGHT;
		sprite.pivot.set(32, 32);
		return sprite;
	}

	setSpriteCoordinates( pic_name, sprite, x, y) {
		let texture = PIXI.loader.resources[ pic_name ].texture.clone();
		texture.frame = new PIXI.Rectangle(x*this.SPRITE_WIDTH, y*this.SPRITE_HEIGHT, this.SPRITE_WIDTH, this.SPRITE_HEIGHT);
		sprite.setTexture(texture);
	}

	createGameField() {

		var bg_container = this.bg_container = new PIXI.Container();
		this.app.stage.addChild( bg_container );

		for ( var i = 0; i < this.cells_horizontal; i++) {
			for ( var j = 0; j < this.cells_vertical; j++) {

				if ( i == 0 || j == 0 || i == this.cells_horizontal - 1 || j == this.cells_vertical - 1)  var pic_name = this.ASSETS_PATH+"Wall.png";
				else var pic_name = this.ASSETS_PATH+"Ground.png"

				let ground_cell = new PIXI.Sprite( PIXI.loader.resources[pic_name].texture );
				ground_cell.x = i * this.CELL_WIDTH;
				ground_cell.y = j * this.CELL_HEIGHT;
				ground_cell.width = this.CELL_WIDTH;
				ground_cell.height = this.CELL_HEIGHT;
				bg_container.addChild(ground_cell);
			}
		}

	}

	createGameCharacters() {
		// SNAKE
 		var head = this.head_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 3, 0, 64, 64 );
 		this.app.stage.addChild(head);

 		var straight_body = this.straight_body_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 2, 1, 64, 64 );
 		this.app.stage.addChild( straight_body );

 		var tail = this.tail_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 3, 2, 64, 64 );
 		this.app.stage.addChild( tail );

 		this.python_body.push( { sprite: head, name:'head-right'}, {sprite: straight_body, name:'-'}, {sprite: tail, name: 'tail-right'});


 		//BONUS
 		var bonus = this.bonus_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 0, 3, 64, 64 );
 		this.app.stage.addChild( bonus );
	}

	setSpritePosition(sprite, x, y) {
		sprite.x = x * this.CELL_WIDTH;
		sprite.y = y * this.CELL_HEIGHT;
	} 


	growPython() {

		var body_part = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 2, 1, 64, 64 );
 		this.app.stage.addChild( body_part );

		var last_element = this.python_body.pop();
		this.python_body.push(body_part, last_element);
	}

	createSnakeParts( sum ) {
		var x = this.snake_parts[sum][0];
		var y = this.snake_parts[sum][1];

		return this.getSprite( this.ASSETS_PATH+"snake-graphics.png", x, y, 64, 64 );
	}

	visualizeParticles(imagePaths, config) {
		var stage = new PIXI.Container(),
			emitter = null,
			renderer = PIXI.autoDetectRenderer(this.FIELD_WIDTH, this.FIELD_HEIGHT),
			bg = null;


		var update = function(){

			updateId = requestAnimationFrame(update);

			var now = Date.now();
			if (emitter)
				emitter.update((now - elapsed) * 0.001);

			elapsed = now;

			// render the stage
			renderer.render(stage);
		};
	}

}
