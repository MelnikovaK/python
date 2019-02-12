class Python {

	constructor(inputController, config, python_start_x, python_start_y) {

		//
		this.PYTHON_MOVED = "python:draw";
		this.PYTHON_GET_POINT = "python:python get point";
		this.PYTHON_LOST_POINT = "python:python lost point";
		this.PYTHON_GET_ACCELERATION = "python:python get acceleration";
		this.GAME_OVER = "python: game over";
		this.PAUSE = "python: pause active";
		this.PLAY = "python: pause inactive";
		this.PLAY_SOUND = "sound-manager:play";
		this.PAUSE_SOUND = "sound-manager:pause";
		this.REMOVE_PYTHON_PART = "visualizer:remove_python_part";
		this.REDRAW_BONUS = "visualizer:redraw_bonus";
		this.PYTHON_CHANGE_CAMERA_POSITION = "renderer:change_camera_position";
		this.PYTHON_SHOW_FULL_SCREEN = "renderer:show_full_screen";


		//
		this.inputController = inputController;
		inputController.enabled = false;

		//
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;
		
		//SNAKE DIRECTIONS
		this.RIGHT = 'right';
		this.LEFT = 'left';
		this.UP = 'up';
		this.DOWN = 'down';

		this.direction_indexes = {
			'10': this.RIGHT,
			'-10': this.LEFT,
			'0-1': this.UP,
			'01': this.DOWN
		};

		this.directions = {};
		this.directions[this.RIGHT] = this.directions['swipe-right'] = {x:1, y:0, rotation: 90 * window.Utils.DEG2RAD};
		this.directions[this.LEFT] = this.directions['swipe-left'] = {x:-1, y:0, rotation: 270 * window.Utils.DEG2RAD};
		this.directions[this.UP] = this.directions['swipe-up'] = {x:0, y:-1, rotation: 0};
		this.directions[this.DOWN] = this.directions['swipe-down'] = {x:0, y:1, rotation: 180 * window.Utils.DEG2RAD};

		this.third_person_directions = {};
		this.third_person_directions[this.RIGHT] ={ 'left': this.directions[this.UP], 'right': this.directions[this.DOWN]};
		this.third_person_directions[this.LEFT] ={ 'left': this.directions[this.DOWN], 'right': this.directions[this.UP]};
		this.third_person_directions[this.UP] ={ 'left': this.directions[this.LEFT], 'right': this.directions[this.RIGHT]};
		this.third_person_directions[this.DOWN] ={ 'left': this.directions[this.RIGHT], 'right': this.directions[this.LEFT]};


		this.start_logic_step_interval = config.logic_step_interval;;
		this.logic_step_interval = config.logic_step_interval;
		
		this.inputController_direction = '';


		this.pause = false;
		this.is_game_over = false;
		this.camera_third_person = false;

		this.bonuses = [];

		//

		//
		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;
		this.max_python_length = config.max_python_length || 3;
		this.python_body = [];
		this.python_start_x = python_start_x || 4;
		this.python_start_y = python_start_y || 3;

		//
		this.parts_indexes = {
			"-10": 2,
			"0-1": 1,
			"10": 4,
			"01": 8,
		};

		//
		this.python_directions = {};
		this.python_directions[1] = { angle: 180 * window.Utils.DEG2RAD, name: 'down'};
		this.python_directions[2] = { angle: 90 * window.Utils.DEG2RAD, name: 'right'};
		this.python_directions[4] = { angle: 270 * window.Utils.DEG2RAD, name: 'left'};
		this.python_directions[8] = { angle: 0, name: 'up'};

		

		//
		this.checkSizeOfFieldElements();
		this.resetPyhon();

		//
		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
			this.initInputControllerEvent(e.detail);
			switch( e.detail.name ){
				case "play":
					this.setPause( false );
					break;

				case "pause":
					this.setPause( true );
					break;

				case "change_camera":
					this.changeCameraPosition();
					Utils.triggerCustomEvent( window, this.PYTHON_CHANGE_CAMERA_POSITION );
				break;

				case "full_screen":
					Utils.triggerCustomEvent( window, this.PYTHON_SHOW_FULL_SCREEN );
				break;
					
			}

		}.bind(this));

		this.inputController.target.addEventListener( inputController.ACTION_TRIGGERED, function (e) {
			this.initInputControllerEvent(e.detail);
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
		  this.startGame();
		}.bind(this));

		window.addEventListener( "screens: game paused" , function () {
		  this.setPause( true );
		}.bind(this));

		window.addEventListener( "screens: game playing" , function () {
		  this.setPause( false );
		}.bind(this));

		window.addEventListener( "renderer:change_camera_position", function() {
			this.changeCameraPosition();
		}.bind(this));

	}

	changeCameraPosition() {
		if (this.camera_third_person) this.camera_third_person = false;
		else this.camera_third_person = true;
	}

	initInputControllerEvent(details) {
		if ( !this.pause ) {
			if ( details.name == 'tap') {
				var python_head_x = this.python_body[0].x * this.CELL_WIDTH,
						python_head_y = this.python_body[0].y*this.CELL_HEIGHT;
				details.name = this.inputController.computeGestureName( python_head_x, python_head_y, details.x, details.y)
			}
			var dir = this.directions[details.name];
		  if( dir ) {
		  	if ( this.camera_third_person ) {

		  		var prev_direction = this.getDirectionByIndex( this.python_direction.x, this.python_direction.y );
		  		var new_direction = this.getDirectionByIndex( dir.x, dir.y );
		  		console.log(prev_direction, new_direction)

					dir = this.third_person_directions[prev_direction][new_direction];
		  	}
		  	var difference_x = dir.x - this.python_direction.x;
		  	var difference_y = dir.y - this.python_direction.y;
		  	if ( difference_x == 0 || difference_y == 0 ) return;
		  		
				this.inputController_direction = dir;
		  }
		}
	}

	getDirectionByIndex(x, y) {
		return this.direction_indexes[x.toString() + y.toString()];
	}

	

	//
	checkSizeOfFieldElements() {

		if (!this.FIELD_WIDTH) {
			if (!this.CELL_WIDTH) this.CELL_WIDTH = 20;
			else this.FIELD_WIDTH = this.FIELD_WIDTH = this.cells_horizontal * this.CELL_WIDTH;
		}

		if (!this.FIELD_HEIGHT) {
			if (!this.CELL_HEIGHT) this.CELL_HEIGHT = 20;
			else this.FIELD_HEIGHT = this.FIELD_HEIGHT = this.cells_vertical * this.CELL_HEIGHT;
		}

		if (!this.CELL_WIDTH) this.CELL_WIDTH = this.FIELD_WIDTH / this.cells_horizontal;
		if (!this.CELL_HEIGHT) this.CELL_HEIGHT = this.FIELD_HEIGHT / this.cells_vertical;

		if (this.cells_horizontal != this.FIELD_WIDTH / this.CELL_WIDTH) this.cells_horizontal = this.FIELD_WIDTH / this.CELL_WIDTH;
		if (this.cells_vertical != this.FIELD_HEIGHT / this.CELL_HEIGHT) this.cells_vertical = this.FIELD_HEIGHT / this.CELL_HEIGHT;
	}

	//
	setPause( _paused ){
		if ( this.pause == _paused) return;
		this.pause = _paused;
		Utils.triggerCustomEvent( window, _paused ? this.PAUSE : this.PLAY );
		Utils.triggerCustomEvent( window, this.PAUSE_SOUND );
	}

	//
	startGame(){

		console.log('#START GAME');
			
		var scope = this;


		if(!this.gameStep){

			this.gameStep = function(){				

				// schedule the next game step
				scope.game_timeout = setTimeout( scope.gameStep, scope.logic_step_interval );
				if ( scope.pause ) return;
				if (scope.inputController_direction) scope.python_direction = scope.inputController_direction;

				if (scope.is_game_over){
					scope.gameOver();
					return;
				}
				// move python
				scope.movePython();

				// check game end
				if ( scope.isGameOver()) {
					scope.gameOver();
					return;
				}

				// redraw

				Utils.triggerCustomEvent( window,scope.PYTHON_MOVED );
			};
		}

		Utils.triggerCustomEvent( window, this.PLAY_SOUND, {sound_id: "music", loop: true} );

		this.is_game_over = false;

		this.points = 0;
		this.removeBonuses();
		this.initBonuses();
		this.frogMoving();

		this.inputController.enabled = true;

		this.inputController_direction = this.directions[this.RIGHT];

		this.python_direction = this.inputController_direction;

		this.resetPyhon();

		if ( this.game_timeout ) clearTimeout(this.game_timeout);
		this.gameStep();
	}


	movePython() {
		
		var scope = this;

		var prev_prev_x, prev_prev_y;
		
		var is_tail = true;

		for( var i = this.python_body.length-1; i>0; i-- ){
			// if ( is_tail && python_grow ) continue;
			var part = this.python_body[i];
			var prev_part = this.python_body[i-1];
			if( is_tail ) {
				prev_prev_x = part.prev_x;
				prev_prev_y = part.prev_y;
			}
			scope.changePythonPartCoordinates(part, prev_part.x, prev_part.y, part.x, part.y);

			if( is_tail ){
				scope.updatePartDirection( part, this.python_body[i-2] );
				is_tail = false;
			}else{
				scope.updatePartDirection( part );
			}
		};

		var head = this.python_body[0];
		head.prev_x = head.x;
		head.prev_y = head.y;
		head.x = this.python_body[0].x + this.python_direction.x;
		head.y = this.python_body[0].y + this.python_direction.y;
		scope.updatePartDirection( head );
		// console.log( head.angle, head.direction_name );

		// check if bonus is eaten
		
		for (var i = 0; i < this.bonuses.length; i++ ) {
			
			var bonus = this.bonuses[i];

			if (head.x == bonus.x && head.y == bonus.y) {

				this.resetBonus(bonus);				

				//play sound
				if( bonus.sound ) Utils.triggerCustomEvent( window, this.PLAY_SOUND, bonus.sound );

				this.points += bonus.point;

				if( this.points < 0 ) { // game over
					this.points = 0;
					this.is_game_over = true;
					// this.python_body.pop();
					Utils.triggerCustomEvent(window, bonus.trigger_action_name, {bonus: bonus, game_over: false});
					return;
				}

				// scope.addBodyPart();

				//action
				if ( bonus.action) bonus.action(this, prev_prev_x, prev_prev_y, bonus.point );
				// trigger event
				if( bonus.trigger_action_name ) Utils.triggerCustomEvent(window, bonus.trigger_action_name, {bonus: bonus, game_over: false});
				return;
			}
		}

	}

	growPythonLength(scope, x, y, points) {

		for ( var i = 0; i < points; i++){
			var last_index = scope.python_body.length - 1;
			var copy = Object.assign({}, scope.python_body[last_index]);
			var insert_element = copy;
			insert_element._model = undefined;
			scope.changePythonPartCoordinates(scope.python_body[last_index], scope.python_body[last_index].prev_x, scope.python_body[last_index].prev_y, x, y);

			scope.python_body.splice(last_index, 0, insert_element);
		} 
	}

	changePythonPartCoordinates(part, x, y, prev_x, prev_y) {
		part.x = x;
		part.y = y,
		part.prev_x = prev_x;
		part.prev_y = prev_y;
	}


	updatePartDirection( part, target_part ){
		
		var _id;
		if( target_part ){
			_id = ( part.x - target_part.x ).toString() + ( part.y - target_part.y ).toString();
		}else{
			_id = ( part.prev_x - part.x ).toString() + ( part.prev_y - part.y ).toString();
		}
		var _dir = this.python_directions[ this.parts_indexes[_id] ];
		part.prev_angle = part.angle;
		part.angle = _dir.angle;
		part.prev_direction_name = part.direction_name;
		part.direction_name = _dir.name;
	}

	removeSnakePart(scope) {
		var last_index = scope.python_body.length - 1;

		var deleted_elem = scope.python_body[last_index - 1]._model;

		scope.python_body[last_index - 1]._model = scope.python_body[last_index]._model;
		scope.python_body.pop();


		Utils.triggerCustomEvent(window, scope.REMOVE_PYTHON_PART, {model: deleted_elem})

	}

	accelerateMoving(scope) {
		if ( scope.logic_step_interval != scope.start_logic_step_interval ) return;
		scope.logic_step_interval /= 2;
		setTimeout( function() {
			scope.logic_step_interval *= 2;
		}, 5000); 
	}


	removeBonuses() {
		this.bonuses.length = 0;
	}

	resetPyhon() {
		var position_x = this.python_start_x;
		var position_y = this.python_start_y;

		this.python_body.length = 0;
		for ( var i = 0; i < this.max_python_length; i++ ) {
			var part = this.python_body[i] = {
				x: position_x - i,
				y: position_y,
				prev_x: position_x - i-1,
				prev_y: position_y
			};
			this.updatePartDirection( part );
		}
	}

	frogMoving() {
		var scope = this;
		var frog = this.moving_frog;
		var diap = [0,1, -1];
		setInterval(function() {
			frog.x +=diap[~~( Math.random() * (3 - 1) + 1)] ;
			frog.y += diap[~~( Math.random() * (3 - 1) + 1)];
			if ( !scope.checkBonusCoordinatesCorrect(frog.x, frog.y, frog) ) return scope.frogMoving();

			Utils.triggerCustomEvent(window, scope.REDRAW_BONUS, {bonus: frog})
		}, 3000);
	}


	addBonus( bonus_name ){
		var offset = 1;
		var bonus_data = this.bonus_defenitions[ bonus_name ];
		bonus_data.type = bonus_name;
		bonus_data.x = ~~( Math.random() * (this.cells_horizontal - offset*2) + offset );
		bonus_data.y = ~~( Math.random() * (this.cells_vertical - offset*2) + offset );
		this.bonuses.push( bonus_data );
		return bonus_data;
	}

	initBonuses() {

		this.bonus_defenitions = {
			'apple': {
				point: 1,
				trigger_action_name: this.PYTHON_GET_POINT,
				sound: {sound_id: "bonus", loop: false},
				action: this.growPythonLength
			},
			'rotten_apple': {
				point: -1,
				trigger_action_name: this.PYTHON_LOST_POINT,
				action: this.removeSnakePart
			},
			'stone': {
				point: 0,
				trigger_action_name: this.GAME_OVER
			},
			'accelerator': {
				point: 0,
				trigger_action_name: this.PYTHON_GET_ACCELERATION,
				action: this.accelerateMoving
			},
			'frog': {
				point: 2,
				trigger_action_name: this.PYTHON_GET_POINT,
				action: this.growPythonLength

			},
		}

		this.addBonus( 'apple' );
		this.addBonus( 'rotten_apple' );
		this.addBonus( 'stone' );
		this.addBonus( 'accelerator' );
		this.moving_frog = this.addBonus( 'frog' );

	}

	resetBonus( bonus ) {
		var offset = 1;
		bonus.x = ~~( Math.random() * (this.cells_horizontal - offset*2) + offset );
		bonus.y = ~~( Math.random() * (this.cells_vertical - offset*2) + offset );

		if ( !this.checkBonusCoordinatesCorrect(bonus.x, bonus.y, bonus) ) this.resetBonus(bonus);
		
	}

	checkBonusCoordinatesCorrect( x, y, bonus) {
		for (var i = 0; i < this.python_body.length; i++ ) {
			if ( i == 0 ) { //3 клетки от головы
				var head_x = this.python_body[i].x + 3 * this.python_direction.x;
				var head_y = this.python_body[i].y + 3 * this.python_direction.y;

				if ( x <= head_x && x >= this.python_body[i].x &&  y <= head_y && y >= this.python_body[i].y) return false;
			}

			var less_than_x = this.python_body[i].x - 1;
			var less_than_y = this.python_body[i].y - 1;
			var bigger_than_x = this.python_body[i].x + 1;
			var bigger_than_y = this.python_body[i].y + 1; 

			// if (less_than_x <= x && less_than_y <= y && bigger_than_x >= x && bigger_than_y >= y) return false;
		}
		for (var i = 0; i < this.bonuses.length; i++) {
			if (bonus == this.bonuses[i]) continue;
			if (x == this.bonuses[i].x && y == this.bonuses[i].y ) return false;
		}

		if ( x > this.cells_horizontal - 1 || y > this.cells_vertical - 1 || x < 0 || y < 0 ) return false;
		return true;
	}

	isGameOver() {

		var python_head = this.python_body[0];

		// check bounds
		if( python_head.x < 1 || python_head.x >= this.cells_horizontal - 1 || python_head.y < 1 || python_head.y >= this.cells_vertical - 1 ) {
			return true;
		}

		//
		for ( var i = 1; i < this.python_body.length; i++) {
			var part = this.python_body[i];
			if ( python_head.x == part.x && python_head.y == part.y ) {
				console.log(this.python_body);
				return true;
			}
		}

	}

	gameOver(){

		clearTimeout( this.game_timeout );
		this.inputController.enabled = false;

		Utils.triggerCustomEvent( window, this.GAME_OVER );
		Utils.triggerCustomEvent( window, this.PLAY_SOUND, {sound_id: "game over", loop: false} );

	}
	
}
