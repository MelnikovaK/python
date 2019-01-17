class Python {

	constructor(inputController, config, python_start_x, python_start_y) {

		//
		this.PYTHON_MOVED = "python:draw";
		this.PYTHON_GET_POINT = "python:python get point";
		this.GAME_OVER = "python: game over";

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
		this.directions[this.RIGHT] = {x:1,y:0};
		this.directions[this.LEFT] = {x:-1,y:0};
		this.directions[this.UP] = {x:0,y:-1};
		this.directions[this.DOWN] = {x:0,y:1};


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
		
		//
		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
		  var dir = this.directions[e.detail];
		  if( dir ) {
		  	var difference_x = this.directions[e.detail].x - this.python_direction.x;
		  	var difference_y = this.directions[e.detail].y - this.python_direction.y;
		  	if ( difference_x == 0 || difference_y == 0 ) return;
		  	this.python_direction = dir;
		  }
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
		  this.startGame();
		}.bind(this));

		window.addEventListener( "screens: game pause" , function () {
			console.log('pause');
		  // clearTimeout(this.game_timeout);
		}.bind(this));
	}

	startGame(){

		console.log('#START GAME');
			
		var scope = this;

		if(!this.gameStep){

			this.gameStep = function(){				

				// schedule the next game step
				scope.game_timeout = setTimeout( scope.gameStep, 500);


				// move python
				scope.movePython();

				// check game end
				if ( scope.isGameOver() ) {
					scope.gameOver();
					return;
				}

				// redraw
				var event = new CustomEvent( scope.PYTHON_MOVED );
  			window.dispatchEvent(event);
			};
		}

		this.points = 0;
		this.python_direction = this.directions[this.RIGHT];
		this.resetPyhon();
		this.generateNewBonus();

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

			var event = new CustomEvent( this.PYTHON_GET_POINT );
			window.dispatchEvent(event);
		
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
		// var max_x = this.FIELD_WIDTH / this.CELL_WIDTH - 1;
		// var max_y = this.FIELD_HEIGHT / this.CELL_HEIGHT - 1;
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

		if( python_head.x < 0 || python_head.x >= this.cells_horizontal || python_head.y < 0 || python_head.y >= this.cells_vertical ) return true;
		for ( var i = 1; i < this.python_body.length; i++) {
			if ( python_head.x == this.python_body[i].x && python_head.y == this.python_body[i].y ) return true;
		}

	}

	gameOver(){

		clearTimeout( this.game_timeout );
		this.inputController.enabled = false;

		var event = new CustomEvent( this.GAME_OVER );
		window.dispatchEvent(event);

	}
	
}
