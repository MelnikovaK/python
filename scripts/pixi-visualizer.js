class PixiVisualizer {
	
	constructor($container, python, config) {
		this.$container = $container;

		//EVENT NAMES
		this.PRELOAD_PROGRESS = "pixi-visualizer:preload_progress";
		this.PRELOAD_COMPLETE = "pixi-visualizer:preload_complete";
		this.SHOW_FINISH_SCREEN = "screens: show_finish_modal";

		//FIELD ELEMENTS SIZE
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;
		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;

		this.ASSETS_PATH = config.ASSETS_PATH || 'assets/';

		//
		this.python = python;

		//
		this.python_body = [];

		//
		this.assets_array = [];

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
		
		this.snake_parts[1] = { frame_position: [4,3], angle: 180 * window.Utils.DEG2RAD, frame_name: 'down'};//tail down
		this.snake_parts[2] = { frame_position: [4,2], angle: 90 * window.Utils.DEG2RAD, frame_name: 'right'};//tail right
		this.snake_parts[4] = { frame_position: [3,3], angle: 270 * window.Utils.DEG2RAD, frame_name: 'left'};//tail left
		this.snake_parts[8] = { frame_position: [3,2], angle: 0, frame_name: 'up'};//tail up

		this.snake_parts[1+2] = { frame_position: [0,0], frame_name: '┘'};// UL  ┘
		this.snake_parts[1+8] = { frame_position: [2,1], frame_name: '|'};// UD  |
		this.snake_parts[1+4] = { frame_position: [2,0], frame_name: '└'};// UD  └
		this.snake_parts[2+8] = { frame_position: [0,1], frame_name: '┐'};// UD  ┐
		this.snake_parts[4+8] = { frame_position: [2,2], frame_name: '┌'};// UD  ┌
		this.snake_parts[2+4] = { frame_position: [1,0], frame_name: '-'};// UD  -


		//
		this.initPixiApplication();
		this.loadAssets( config );

		window.addEventListener(python.PYTHON_MOVED, function() {
			this.moveActionGame();
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
			
			// this.removeSnakeBodyPart();
			this.addSnakeBodyParts();
			this.updateBonusPosition();
			this.updateRottenBonusPosition();
			this.moveActionGame();
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			this.updateBonusPosition();
			this.growPython();
		}.bind(this));

		window.addEventListener( python.PYTHON_LOST_POINT , function () {
			this.updateRottenBonusPosition();
			this.removeSnakeBodyPart();
		}.bind(this));

		window.addEventListener( python.GAME_OVER , function () {
			this.shakeScreen();
		}.bind(this));
		
	}

	shakeScreen() {
		var scope = this;

		var canvas = document.getElementsByTagName('canvas')[0];

		var x = 0;
		var t = 0;
		var amp = 10;

		var interval_id = setInterval(function(){
		  if (amp < 1) {
		  	Utils.triggerCustomEvent( window, scope.SHOW_FINISH_SCREEN );
		  	clearInterval(interval_id);
		  }
		  t += .1;
		  x = Math.sin(t)*amp;
		  canvas.style.left = amp + x + "px"
		  amp -= .05;
		}, 5);
	}

		// >>> CREATING GAME FIELD AND CHARACTERS >>>
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
		//SNAKE
		var head = this.head_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 4, 1, 64, 64 );

 		var straight_body = this.straight_body_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 1, 0, 64, 64 );

 		var tail = this.tail_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 3, 2, 64, 64 );

 		this.python_body.push( { sprite: head, frame_name:'head-right'}, {sprite: straight_body, frame_name:'-'}, {sprite: tail, frame_name: 'tail-right'});

 		//BONUS
 		var bonus = this.bonus_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 0, 3, 64, 64 );
 		var rotten_bonus = this.rotten_bonus_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 1, 3, 64, 64 );

	}

	// <<< CREATING GAME FIELD AND CHARACTERS <<<

	// DELETE
	removeSnakeBodyPart() {


		var last_index = this.python_body.length - 1;



		this.python_body[last_index - 1] = this.python_body[last_index];


		this.bg_container.removeChild(this.python_body[last_index].sptrite);

		console.log(this.python_body);

		this.python_body.pop();

		console.log(this.python_body);
		

		this.assets_array.push(this.python_body[last_index - 1]);

	}

	// >>> MOVE PYTHON >>>
	moveActionGame() {

		this.updateBody();

	}

	updateBody() {

		var python_body = python.python_body;
		//BODY
		for ( var i = 0; i < python_body.length; i++ ) {
			//python parts move
			this.setSpritePosition( this.python_body[i].sprite, python_body[i].x, python_body[i].y );

			var curr_sprite = this.python_body[i].sprite;

			var prev_part_id = this.getPrevPartID(python_body[i-1], python_body[i]); // "-10"
			var next_part_id = this.getNextPartID(python_body[i+1], python_body[i]);// "-10"

			var part_oriented_data;

			if( !python_body[i-1] ){ // head part
				part_oriented_data = this.snake_parts[ next_part_id ];
				curr_sprite.rotation = part_oriented_data.angle;

			}else if( !python_body[i+1] ) { // tail part
				part_oriented_data = this.snake_parts[ prev_part_id ];
				curr_sprite.rotation = part_oriented_data.angle;

			}else{ // body part
				part_oriented_data = this.snake_parts[ prev_part_id + next_part_id ];

				if ( part_oriented_data.frame_name == this.python_body[i].frame_name ) continue;
				curr_sprite.texture.frame = new PIXI.Rectangle(
					part_oriented_data.frame_position[0] * this.SPRITE_WIDTH,
					part_oriented_data.frame_position[1] * this.SPRITE_HEIGHT,
					this.SPRITE_WIDTH, this.SPRITE_HEIGHT
				);
			}
			this.python_body[i].frame_name = part_oriented_data.frame_name;
		}

	}

	getPrevPartID(prev_part, curr_part) {
		return prev_part && this.parts_indexes[ this.getDiffString( curr_part, prev_part ) ]; // "-10"
	}
	getNextPartID(next_part, curr_part) {
		return next_part && this.parts_indexes[ this.getDiffString( curr_part, next_part ) ]; // "-10"
	}



	getDiffString(fisrt_elem, sec_elem) {
		var diff_x = fisrt_elem.x - sec_elem.x;
		var diff_y = fisrt_elem.y - sec_elem.y;
		return diff_x.toString() + diff_y.toString();
	}


	growPython() {
		var python_body = this.python.python_body;
		var last_index = python_body.length - 1;

		var prev_part_id = this.getPrevPartID(python_body[last_index], python_body[last_index - 1]); // "-10"
		var next_part_id = this.getNextPartID(python_body[last_index - 2], python_body[last_index - 1]);

		var part_oriented_data = this.snake_parts[ prev_part_id + next_part_id ];

		if ( this.assets_array.length ) {
			var sprite = this.assets_array.pop(); 
			sprite.texture.frame = new PIXI.Rectangle(
					part_oriented_data.frame_position[0] * this.SPRITE_WIDTH,
					part_oriented_data.frame_position[1] * this.SPRITE_HEIGHT,
					this.SPRITE_WIDTH, this.SPRITE_HEIGHT
			);
		}
		else var sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 
																				part_oriented_data.frame_position[0], 
																				part_oriented_data.frame_position[1], 64, 64 );

 		this.bg_container.addChild( sprite );

		this.python_body.splice(last_index - 1, 0, {sprite: sprite, frame_name: part_oriented_data.frame_name });
	}

	// <<< MOVE PYTHON <<<

	


	// >>> BONUS UPDATE >>>
	updateBonusPosition(){
		this.setSpritePosition( this.bonus_sprite, this.python.bonus.x, this.python.bonus.y );
		this.bg_container.addChild( this.bonus_sprite );
	}

	updateRottenBonusPosition() {
		this.setSpritePosition( this.rotten_bonus_sprite, this.python.rotten_bonus.x, this.python.rotten_bonus.y );
		this.bg_container.addChild( this.rotten_bonus_sprite );
	}

	addSnakeBodyParts() {
		for ( var i = 0; i < this.python_body.length; i++ ){
 			this.bg_container.addChild(this.python_body[i].sprite);
 		}
	}

	

	// <<< BONUS UPDATE <<<


	// >>> PARTICLES >>>
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
	// <<< PARTICLES <<<
	






	// >>> UTILS >>>

	initPixiApplication() {
		this.app = new PIXI.Application({width: this.FIELD_WIDTH, height: this.FIELD_HEIGHT});
		var game_screen = document.getElementsByClassName('game-screen')[0];
		game_screen.appendChild(this.app.view);
	}

	loadAssets( config ) {

		var scope = this;

		PIXI.loader
			.add( ( config.preload_list || [] ).concat([
				this.ASSETS_PATH+"game-over.json",
		    this.ASSETS_PATH+"Ground.png",
		    this.ASSETS_PATH+"bg.png",
		    this.ASSETS_PATH+"CartoonSmoke.png",
		    this.ASSETS_PATH+"snake-graphics.png",
		    this.ASSETS_PATH+"Wall.png"
		  ]) )
		  .on("progress", _loadProgressHandler )
		  .load( _setup );

		  function _loadProgressHandler(loader, resource) {
				Utils.triggerCustomEvent( window, scope.PRELOAD_PROGRESS, loader.progress );
			}

			function _setup() {
				scope.createGameField();
				scope.createGameCharacters();
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


	setSpritePosition(sprite, x, y) {
		sprite.x = x * this.CELL_WIDTH;
		sprite.y = y * this.CELL_HEIGHT;
	} 

	createSnakeParts( sum ) {
		var x = this.snake_parts[sum][0];
		var y = this.snake_parts[sum][1];

		return this.getSprite( this.ASSETS_PATH+"snake-graphics.png", x, y, 64, 64 );
	}

	// <<< UTILS <<<



}
