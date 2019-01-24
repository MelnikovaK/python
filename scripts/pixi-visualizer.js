class PixiVisualizer {
	
	constructor($container, python, config) {

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

		this.ASSETS_PATH = config.ASSETS_PATH || 'assets/';

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
		
		this.snake_parts[1] = { frame_position: [4,3], angle: 180 * window.Utils.DEG2RAD, frame_name: 'tail-down'};//tail down
		this.snake_parts[2] = { frame_position: [4,2], angle: 90 * window.Utils.DEG2RAD, frame_name: 'tail-right'};//tail right
		this.snake_parts[4] = { frame_position: [3,3], angle: 270 * window.Utils.DEG2RAD, frame_name: 'tail-left'};//tail left
		this.snake_parts[8] = { frame_position: [3,2], angle: 0, frame_name: 'tail-up'};//tail up

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
			this.moveAction();
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
			// this.playSound(this.ASSETS_PATH+"music.mp3");
			this.moveAction();
			this.updateBonusPosition();
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			// this.playSound(this.ASSETS_PATH+"bonus.mp3");
			this.updateBonusPosition();
			this.growPython();
		}.bind(this));

		window.addEventListener( python.GAME_OVER , function () {
			// this.playSound(this.ASSETS_PATH+"game over.mp3");
			// this.stopSound(this.ASSETS_PATH+"music.mp3");
		}.bind(this));
		
	}
	

	// playSound( sound_name ){
	// 	var sound = PIXI.sound.Sound.from( sound_name );
	// 	sound.play();
	// }

	// stopSound(sound_name) {
	// 	var sound = PIXI.sound.Sound.from( sound_name );
	// 	sound.stop();
	// }



	moveAction() {

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
 		var head = this.head_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 4, 1, 64, 64 );
 		this.bg_container.addChild(head);

 		var straight_body = this.straight_body_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 1, 0, 64, 64 );
 		this.bg_container.addChild( straight_body );

 		var tail = this.tail_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 3, 2, 64, 64 );
 		this.bg_container.addChild( tail );

 		this.python_body.push( { sprite: head, frame_name:'head-right'}, {sprite: straight_body, frame_name:'-'}, {sprite: tail, frame_name: 'tail-right'});


 		//BONUS
 		var bonus = this.bonus_sprite = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", 0, 3, 64, 64 );
 		this.app.stage.addChild( bonus );
	}

	


	growPython() {
		var python_body = this.python.python_body;
		var last_index = python_body.length - 1;

		var prev_part_id = this.getPrevPartID(python_body[last_index], python_body[last_index - 1]); // "-10"
		var next_part_id = this.getNextPartID(python_body[last_index - 2], python_body[last_index - 1]);

		var part_oriented_data = this.snake_parts[ prev_part_id + next_part_id ];

		var new_part = this.getSprite( this.ASSETS_PATH+"snake-graphics.png", part_oriented_data.frame_position[0], part_oriented_data.frame_position[1], 64, 64 );
 		this.bg_container.addChild( new_part );

		this.python_body.splice(last_index - 1, 0, {sprite: new_part, frame_name: part_oriented_data.frame_name });
	}

	createSnakeParts( sum ) {
		var x = this.snake_parts[sum][0];
		var y = this.snake_parts[sum][1];

		return this.getSprite( this.ASSETS_PATH+"snake-graphics.png", x, y, 64, 64 );
	}

	


	updateBonusPosition(){
		this.setSpritePosition( this.bonus_sprite, this.python.bonus.x, this.python.bonus.y );
	}





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

		console.log('!', config);
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


	setSpritePosition(sprite, x, y) {
		sprite.x = x * this.CELL_WIDTH;
		sprite.y = y * this.CELL_HEIGHT;
	} 

	// <<< UTILS <<<

	//>>> SOUNDS >>



}
