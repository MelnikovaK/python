class Python {

	constructor(inputController, config, python_start_x, python_start_y) {

		//
		this.PYTHON_MOVED = "python:draw";
		this.PYTHON_GET_POINT = "python:python get point";
		this.GAME_OVER = "python: game over";
		this.PAUSE = "python: pause active";
		this.PLAY = "python: pause inactive";

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

		//
		this.bonus = {};

		//
		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;
		this.max_python_length = config.max_python_length || 3;
		this.python_body = [];
		this.python_start_x = python_start_x || 4;
		this.python_start_y = python_start_y || 3;

		//
		this.checkSizeOfFieldElements();
		//
		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
			
			if ( !this.pause ) {
				var dir = this.directions[e.detail];
			  if( dir ) {
			  	var difference_x = this.directions[e.detail].x - this.python_direction.x;
			  	var difference_y = this.directions[e.detail].y - this.python_direction.y;
			  	if ( difference_x == 0 || difference_y == 0 ) return;
					this.inputController_direction = dir;

			  }
			}

			switch( e.detail ){
				case "play":
					this.setPause( false );
					break;

				case "pause":
					this.setPause( true );
					break;
			}

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
		this.pause = _paused;
		Utils.triggerCustomEvent( window, _paused ? this.PAUSE : this.PLAY );
	}

	//
	startGame(){

		console.log('#START GAME');
			
		var scope = this;

		if(!this.gameStep){

			this.gameStep = function(){				

				// schedule the next game step
				scope.game_timeout = setTimeout( scope.gameStep, 500);
				if ( scope.pause ) return;
				if (scope.inputController_direction) scope.python_direction = scope.inputController_direction;
				// move python
				scope.movePython();

				// check game end
				if ( scope.isGameOver() ) {
					scope.gameOver();
					return;
				}

				// redraw

				Utils.triggerCustomEvent( window,scope.PYTHON_MOVED );
			};
		}

		this.points = 0;
		this.generateNewBonus();

		this.python_direction = this.directions[this.RIGHT];

		this.resetPyhon();

		this.inputController.enabled = true;

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
		if ( next_head_position.x == this.bonus.x && next_head_position.y == this.bonus.y ) {
			this.points += this.bonus.point;
			this.generateNewBonus();

			Utils.triggerCustomEvent( window, this.PYTHON_GET_POINT );
		
		}else{ // if not
			
			this.python_body.pop();

		}

	}

	resetPyhon() {
		var position_x = this.python_start_x;
		var position_y = this.python_start_y;

		this.python_body.length = 0;
		for ( var i = 0; i < this.max_python_length; i++ ) {
			this.python_body[i] = { x: position_x - i, y: position_y };
		}
	}

	generateNewBonus() {
		var point = 1;
		var offset = 1;
		this.bonus.x = ~~( Math.random() * (this.cells_horizontal - offset*2) + offset ),
		this.bonus.y = ~~( Math.random() * (this.cells_vertical - offset*2) + offset ),
		this.bonus.point = 1
		
		if ( !this.checkBonusCoordinatesCorrect(this.bonus.x, this.bonus.y) ) this.generateNewBonus();
		
	}

	checkBonusCoordinatesCorrect( x, y ) {
		for (var i = 0; i < this.python_body.length; i++ ) {

			var less_than_x = this.python_body[i].x - 1;
			var less_than_y = this.python_body[i].y - 1;
			var bigger_than_x = this.python_body[i].x + 1;
			var bigger_than_y = this.python_body[i].y + 1; 

			if (less_than_x <= x && less_than_y <= y || bigger_than_x >= x && bigger_than_y >= y)  return false;
		}
		return true;
	}


	isGameOver() {

		var python_head = this.python_body[0];

		// check bounds
		if( python_head.x < 1 || python_head.x >= this.cells_horizontal || python_head.y < 1 || python_head.y >= this.cells_vertical ) return true;

		//
		for ( var i = 1; i < this.python_body.length - 1; i++) {
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
	}
	
}
