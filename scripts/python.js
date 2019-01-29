class Python {

	constructor(inputController, config, python_start_x, python_start_y) {

		//
		this.PYTHON_MOVED = "python:draw";
		this.PYTHON_GET_POINT = "python:python get point";
		this.PYTHON_LOST_POINT = "python:python lost point";
		this.GAME_OVER = "python: game over";
		this.PAUSE = "python: pause active";
		this.PLAY = "python: pause inactive";
		this.PLAY_SOUND = "sound-manager:play";
		this.PAUSE_SOUND = "sound-manager:pause";


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

		this.directions = {};
		this.directions[this.RIGHT] = this.directions['swipe-right'] = {x:1, y:0, rotation: 90 * window.Utils.DEG2RAD};
		this.directions[this.LEFT] = this.directions['swipe-left'] = {x:-1, y:0, rotation: 270 * window.Utils.DEG2RAD};
		this.directions[this.UP] = this.directions['swipe-up'] = {x:0, y:-1, rotation: 0};
		this.directions[this.DOWN] = this.directions['swipe-down'] = {x:0, y:1, rotation: 180 * window.Utils.DEG2RAD};


		

		this.inputController_direction = '';


		this.pause = false;
		this.is_game_over = false;

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
		  	var difference_x = this.directions[details.name].x - this.python_direction.x;
		  	var difference_y = this.directions[details.name].y - this.python_direction.y;
		  	if ( difference_x == 0 || difference_y == 0 ) return;
				this.inputController_direction = dir;
		  }
		}
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
				scope.game_timeout = setTimeout( scope.gameStep, 300);
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

		this.resetPyhon();

		this.inputController.enabled = true;

		this.inputController_direction = this.directions[this.RIGHT];

		this.python_direction = this.inputController_direction;


		if ( this.game_timeout ) clearTimeout(this.game_timeout);
		this.gameStep();
	}


	movePython() {
		
		var next_head_position = {
			x: this.python_body[0].x + this.python_direction.x,
		  y: this.python_body[0].y + this.python_direction.y
		};


		this.python_body.unshift( next_head_position );

		// check if bonus is eaten

		for (var i = 0; i < this.bonuses.length; i++ ) {
			
			var bonus = this.bonuses[i];

			if (next_head_position.x == bonus.x && next_head_position.y == bonus.y) {

				this.resetBonus(bonus);				

				// trigger event
				if( bonus.trigger_action_name ) Utils.triggerCustomEvent(window, bonus.trigger_action_name, {bonus: bonus, game_over: false});

				//play sound
				if( bonus.sound ) Utils.triggerCustomEvent( window, this.PLAY_SOUND, bonus.sound );

				this.points += bonus.point;

				if( this.points < 0 ) { // game over
					this.points = 0;
					this.is_game_over = true;
					Utils.triggerCustomEvent(window, bonus.trigger_action_name, {bonus: bonus, game_over: true});
					return;
				}

				//action
				if ( bonus.action)  bonus.action(this);

				return;
			}
		}

		this.python_body.pop();

	}

	removeSnakePart(scope) {
		var last_index = scope.python_body.length - 1;
		scope.python_body[last_index] = scope.python_body[last_index - 2];
		scope.python_body.splice(last_index - 2, 2);
	}

	removeBonuses() {
		this.bonuses.length = 0;
	}

	resetPyhon() {
		var position_x = this.python_start_x;
		var position_y = this.python_start_y;

		this.python_body.length = 0;
		for ( var i = 0; i < this.max_python_length; i++ ) {
			this.python_body[i] = { x: position_x - i, y: position_y };
		}
	}

	addBonus( bonus_name ){
		var offset = 1;
		var bonus_data = this.bonus_defenitions[ bonus_name ];
		bonus_data.type = bonus_name;
		bonus_data.x = ~~( Math.random() * (this.cells_horizontal - offset*2) + offset );
		bonus_data.y = ~~( Math.random() * (this.cells_vertical - offset*2) + offset );
		this.bonuses.push( bonus_data );
	}

	initBonuses() {

		this.bonus_defenitions = {
			'apple': {
				point: 1,
				trigger_action_name: this.PYTHON_GET_POINT,
				sound: {sound_id: "bonus", loop: false}
			},
			'rotten_apple': {
				point: -1,
				trigger_action_name: this.PYTHON_LOST_POINT,
				action: this.removeSnakePart
			}
		}

		this.addBonus( 'apple' );

		this.addBonus( 'rotten_apple' );

	}

	resetBonus( bonus ) {
		var offset = 1;
		bonus.x = ~~( Math.random() * (this.cells_horizontal - offset*2) + offset );
		bonus.y = ~~( Math.random() * (this.cells_vertical - offset*2) + offset );

		if ( !this.checkBonusCoordinatesCorrect(bonus.x, bonus.y, bonus) ) this.resetBonus();
		
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

			if (less_than_x <= x && less_than_y <= y && bigger_than_x >= x && bigger_than_y >= y) return false;
		}
		for (var i = 0; i < this.bonuses.length; i++) {
			if (bonus == this.bonuses[i]) continue;
			if (x == this.bonuses[i].x && y == this.bonuses[i].y ) return false;
		}
		return true;
	}

	isGameOver() {

		var python_head = this.python_body[0];

		// check bounds
		if( python_head.x < 1 || python_head.x >= this.cells_horizontal || python_head.y < 1 || python_head.y >= this.cells_vertical ) return true;

		//
		for ( var i = 1; i < this.python_body.length; i++) {
			var part = this.python_body[i];
			if ( python_head.x == part.x && python_head.y == part.y ) {
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
