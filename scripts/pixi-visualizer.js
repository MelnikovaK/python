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

		this.START_PYTHON_LENGTH = config.max_python_length;
		this.logic_step_interval = config.logic_step_interval;

		//
		this.AM = new AssetManager(this);

		//
		this.APPLE = 'apple';
		this.ROTTEN_APPLE = 'rotten_apple';

		//
		this.python = python;

		//
		this.python_body = [];

		this.bonuses = {};

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
			// this.moveActionGame();
			this.onPythonMoved();	
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
			var scope = this;

			this.updateBonusesArray();
			// this.python.bonuses.forEach(function(e){
			// 	e._sprite = scope.AM.pullAsset( e.type );
			// 	scope.GO_container.addChild( e._sprite );
			// 	scope.updateBonusPosition( e._sprite, e.x, e.y );
			// });

			this.removeSnakeBodyPart(this.python_body.length - this.START_PYTHON_LENGTH);
			this.updatePythonBodyArray();
			// this.updateBody();

			this.startRenderer();

		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function (e) {
			var bonus = e.detail.bonus;
			this.updateBonusPosition(bonus._sprite, bonus.x, bonus.y );
			this.growPython();
		}.bind(this));

		window.addEventListener( python.PYTHON_LOST_POINT , function (e) {
			var bonus = e.detail.bonus;
			this.updateBonusPosition(bonus._sprite, bonus.x, bonus.y );
			if ( !e.detail.game_over ) this.removeSnakeBodyPart(1);
		}.bind(this));

		window.addEventListener( python.GAME_OVER , function () {
			this.shakeScreen();
			this.removeBonuses();
			this.stopRenderer();
		}.bind(this));
		
	}

	updateBonusesArray() {
		var scope = this;
		this.python.bonuses.forEach(function(e){
			e._sprite = scope.AM.pullAsset( e.type );
			scope.GO_container.addChild( e._sprite );
			scope.updateBonusPosition( e._sprite, e.x, e.y );
		});
	}

	updatePythonBodyArray() {
		var python_body = this.python.python_body;
		var scope = this;
		for ( var i = 0; i < python_body.length; i++) {
			var sprite_name;
			var angle = undefined;

			if ( i == 0 ) {
				sprite_name = 'python_head';
				angle = 90 * window.Utils.DEG2RAD;
			}
			else if ( i == python_body.length - 1) {
				sprite_name = 'python_tail';
				angle = 90 * window.Utils.DEG2RAD;
			}
			else sprite_name = 'python_body';
			if ( !python_body[i]._sprite ) {

				python_body[i]._sprite = scope.AM.pullAsset( sprite_name );
				scope.snake_container.addChild( python_body[i]._sprite );
			}
			this.setSpritePosition( python_body[i]._sprite, python_body[i].x, python_body[i].y );
			if ( angle ) {
				python_body[i]._sprite.rotation = angle;
			}
		}
	}

	shakeScreen() {
		var scope = this;

		var canvas = document.getElementsByTagName('canvas')[0];

		var top = parseInt(getComputedStyle(canvas).top);

		var x = 0;
		var t = 0;
		var amp = 10;

		var interval_id = setInterval(function(){
		  if (amp < 1) {
		  	Utils.triggerCustomEvent( window, scope.SHOW_FINISH_SCREEN );
		  	clearInterval(interval_id);
		  }
		  t += .1;
		  if (scope.python.python_direction.x == 0) {
		  	x = Math.cos(t)*amp;
		  	canvas.style.top = top + amp + x + "px";
		  }
		  else {
		  	x = Math.sin(t)*amp;
		  	canvas.style.left = amp + x + "px";
		  }
		  amp -= .05;
		}, 5);
	}

		// >>> CREATING GAME FIELD AND CHARACTERS >>>
	createGameField() {

		var bg_container = this.bg_container = new PIXI.Container();
		this.app.stage.addChild( bg_container );

		for ( var i = 0; i < this.cells_horizontal; i++) {
			for ( var j = 0; j < this.cells_vertical; j++) {
				if ( i == 0 || j == 0 || i == this.cells_horizontal - 1 || j == this.cells_vertical - 1)  var id = 'wall_cell';
				else  var id = 'ground_cell'

				var ground_cell = this.AM.pullAsset(id);
				ground_cell.x = i * this.CELL_WIDTH;
				ground_cell.y = j * this.CELL_HEIGHT;
				ground_cell.width = this.CELL_WIDTH;
				ground_cell.height = this.CELL_HEIGHT;
				bg_container.addChild(ground_cell);
			}
		}
	}

	createGameCharacters() {
		
		var python_body = this.python.python_body;
		this.GO_container = new PIXI.Container();
		this.app.stage.addChild( this.GO_container );
		//SNAKE

		this.snake_container = new PIXI.Container();
		this.app.stage.addChild( this.snake_container );

		// this.initPythonParts();

		// var head = this.head_sprite = this.AM.pullAsset('python_head');
		// head.rotation = 270 * window.Utils.DEG2RAD;

 		// var straight_body = this.straight_body_sprite = this.AM.pullAsset('python_body');

 		// var tail = this.tail_sprite = this.AM.pullAsset('python_tail');
		// tail.rotation = 90 * window.Utils.DEG2RAD;

 		// this.python_body.push( { sprite: head, frame_name:'head-right'} );
 		// for( var i=1; i<this.python.python_body.length-1; i++){
	 	// 	this.python_body.push( {sprite: this.AM.pullAsset('python_body'), frame_name:'-'});
	 	// }
 		// this.python_body.push( {sprite: tail, frame_name: 'tail-right'});

 		// // console.log("P> ", this.python_body );

 		// for ( var i = 0; i < this.python_body.length; i++ ){
			// // this.setSpritePosition( this.python_body[i].sprite, python_body[i].x, python_body[i].y );
 		// 	this.snake_container.addChild(this.python_body[i].sprite);
 		// }

	}

	// <<< CREATING GAME FIELD AND CHARACTERS <<<



	// DELETE
	removeSnakeBodyPart( remove_counter ) {
		while ( remove_counter > 0 ) {
			var last_index = this.python_body.length - 1;

			this.snake_container.removeChild(this.python_body[last_index - 1].sprite);
			this.AM.putAsset(this.python_body[last_index - 1], 'python_body')
			this.python_body.splice(last_index - 1, 1);

			remove_counter--;
		}
	}

	removeBonuses(bonus) {
		for ( var i = 0; i < this.python.bonuses.length; i++ ){
			this.AM.putAsset(this.python.bonuses[i]._sprite);
			this.GO_container.removeChild(this.python.bonuses[i]._sprite);
		}
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

				// if ( part_oriented_data.frame_name == this.python_body[i].frame_name ) continue;
				curr_sprite.texture.frame = new PIXI.Rectangle(
					part_oriented_data.frame_position[0] * this.SPRITE_WIDTH,
					part_oriented_data.frame_position[1] * this.SPRITE_HEIGHT,
					this.SPRITE_WIDTH, this.SPRITE_HEIGHT
				);
			}
			this.python_body[i].frame_name = part_oriented_data.frame_name;
		}

	}

	getPrevPartID(prev_part, curr_part, use_prev) {
		return prev_part && this.parts_indexes[ this.getDiffString( curr_part, prev_part, use_prev ) ]; // "-10"
	}
	getNextPartID(next_part, curr_part, use_prev) {
		return next_part && this.parts_indexes[ this.getDiffString( curr_part, next_part, use_prev ) ]; // "-10"
	}



	getDiffString(fisrt_elem, sec_elem, use_prev) {
		var diff_x = use_prev ? (fisrt_elem.prev_x - sec_elem.prev_x) : (fisrt_elem.x - sec_elem.x);
		var diff_y = use_prev ? (fisrt_elem.prev_y - sec_elem.prev_y) : (fisrt_elem.y - sec_elem.y);
		return diff_x.toString() + diff_y.toString();
	}


	growPython() {
		var python_body = this.python.python_body;
		var last_index = python_body.length - 1;

		var prev_part_id = this.getPrevPartID(python_body[last_index], python_body[last_index - 1]); // "-10"
		var next_part_id = this.getNextPartID(python_body[last_index - 2], python_body[last_index - 1]);

		var part_oriented_data = this.snake_parts[ prev_part_id + next_part_id ];

		var sprite =  this.AM.pullAsset('python_body');

		sprite.texture.frame = new PIXI.Rectangle(
				part_oriented_data.frame_position[0] * this.SPRITE_WIDTH,
				part_oriented_data.frame_position[1] * this.SPRITE_HEIGHT,
				this.SPRITE_WIDTH, this.SPRITE_HEIGHT
		);

 		this.snake_container.addChild( sprite );

		this.python_body.splice(last_index - 1, 0, {sprite: sprite, frame_name: part_oriented_data.frame_name });
	}

	// <<< MOVE PYTHON <<<

	


	// >>> BONUS UPDATE >>>
	updateBonusPosition( sprite, x, y ){
		sprite.x = x * this.CELL_WIDTH;
		sprite.y = y * this.CELL_HEIGHT;
	}

	// <<< BONUS UPDATE <<<


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
				this.ASSETS_PATH+"smoke.json",
				this.ASSETS_PATH+"gold_anim.png",
				this.ASSETS_PATH+"coin.png",
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
				scope.createAssets();
				scope.createGameField();
				scope.createGameCharacters();
		 		Utils.triggerCustomEvent( window, scope.PRELOAD_COMPLETE );
			}
	}

	createAssets() {
		
		var scope = this;

		var head = function() {return scope.getSprite( scope.ASSETS_PATH+"snake-graphics.png", 3, 0, 64, 64 )};
		var straight_horizontal = function() {return scope.getSprite( scope.ASSETS_PATH+"snake-graphics.png", 1, 0, 64, 64 )};
		var tail = function() {return scope.getSprite( scope.ASSETS_PATH+"snake-graphics.png", 3, 2, 64, 64 )};
		var apple = function() {return scope.getSprite( scope.ASSETS_PATH+"snake-graphics.png", 0, 3, 64, 64 )};
		var rotten_apple =function() {return scope.getSprite( scope.ASSETS_PATH+"snake-graphics.png", 1, 3, 64, 64 )};

		//GAME FIELD
		this.AM.addAsset('wall_cell', function(){
			return new PIXI.Sprite( PIXI.loader.resources[scope.ASSETS_PATH+"Wall.png"].texture ); }, 76 );
		this.AM.addAsset('ground_cell', function(){
			return new PIXI.Sprite( PIXI.loader.resources[scope.ASSETS_PATH+"Ground.png"].texture ); }, 360 );
		
		//SNAKE PARTS
		this.AM.addAsset('python_head', head, 3);
		this.AM.addAsset('python_body', straight_horizontal, 40);
		this.AM.addAsset('python_tail', tail, 3);
		
		//BONUSES
		this.AM.addAsset('apple', apple , 3);
		this.AM.addAsset('rotten_apple', rotten_apple, 3);
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




	// *************************************************************
	//

	startRenderer(){

		var scope = this;

		var python_body = this.python.python_body;

		this.render_timer = setInterval( render, 1000 / 60 );
		this.logic_step_timestamp = Date.now();
		render();

		// var timer_prev = Date.now();
		
		function render(){
			
			var time_current = Date.now();
			var delta = (time_current - scope.logic_step_timestamp) / scope.logic_step_interval;
			// console.log('>', delta );

			// head
			_updateSingleSprite( python_body[0], python_body[0]._sprite, delta );

			console.log(python_body)

			//
			_updateSingleSprite( python_body[python_body.length-1], python_body[python_body.length-1]._sprite, delta );
		
		}

		function _updateSingleSprite( part, _sprite, delta ){

			scope.setSpritePosition( _sprite,
				part.prev_x + (part.x - part.prev_x) * delta,
				part.prev_y + (part.y - part.prev_y) * delta
			);
			
			var prev_angle = part.prev_angle;
			var dist = Math.abs(part.angle - prev_angle);
			if( dist > Math.PI ){
				if( prev_angle < part.angle ){
					prev_angle += Utils.PI2;
				}else{
					prev_angle -= Utils.PI2;
				}
			}
			var angle = prev_angle + (part.angle - prev_angle) * delta;
			// console.log( prev_angle * Utils.RAD2DEG +" > "+ part.angle * Utils.RAD2DEG );
			_sprite.rotation = angle;
		}

	}

	stopRenderer(){
		clearInterval(this.render_timer);
	}

	onPythonMoved(){
		
		var python_body = this.python.python_body;
		console.log("==============>");
		this.updatePythonBodyArray();

		for( var i=1; i < python_body.length-1; i++){
			var part_sprite = python_body[i]._sprite;
			this.setSpritePosition( part_sprite, python_body[i].prev_x, python_body[i].prev_y );

			// change body part visual
			var prev_part_id = this.getPrevPartID(python_body[i-1], python_body[i], true ); // "-10"
			var next_part_id = this.getNextPartID(python_body[i+1], python_body[i], true );// "-10"

			var part_oriented_data = this.snake_parts[ prev_part_id + next_part_id ];

			part_sprite.texture.frame = new PIXI.Rectangle(
				part_oriented_data.frame_position[0] * this.SPRITE_WIDTH,
				part_oriented_data.frame_position[1] * this.SPRITE_HEIGHT,
				this.SPRITE_WIDTH, this.SPRITE_HEIGHT
			);

			if( i == python_body.length - 2 ) part_sprite.visible = false;
			
		}
		this.logic_step_timestamp = Date.now();
	}	

	// *************************************************************

	// <<< UTILS <<<



}
