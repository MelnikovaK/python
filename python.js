class Python {

	constructor(inputController, config, start_pos_x, start_pos_y) {

		//
		this.PYTHON_MOVED = "python:draw";
		this.PYTHON_GET_POINT = "python:python get point";

		//
		this.inputController = inputController;

		//
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;

		//
		this.python_body = [];
		
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
		
		//GAME PARAMETERS
		this.points = 0;
		this.python_length = 3;
		this.python_direction = this.directions[this.RIGHT];

		if (config) {
			this.setPythonBody( start_pos_x, start_pos_y );
			this.setBonusCoordinates();
		}

		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
		  var dir = this.directions[e.detail];
		  if( dir ) this.python_direction = dir;
		  // console.log('dir: ', dir );
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
		  this.startGame();
		}.bind(this));
	}

	startGame(){
		console.log('#START GAME');
			
		var scope = this;

		if(!this.gameStep){

			this.gameStep = function(){
				
				setTimeout( scope.gameStep, 500);

				scope.checkBonusEats();

				if ( scope.python_length == scope.python_body.length ) scope.python_body.pop();
				var new_cell = {x: scope.python_body[0].x + scope.python_direction.x, y: scope.python_body[0].y + scope.python_direction.y};
				scope.python_body.unshift( new_cell );

				var event = new CustomEvent( scope.PYTHON_MOVED );
  			window.dispatchEvent(event);
			};
		}

		this.gameStep();
	}


	setPythonBody( current_pos_x, current_pos_y ) {
		var position_x = current_pos_x || 4;
		var position_y = current_pos_y || 3;

		for ( var i = 0; i < this.python_length; i++ ) {
			var coordinates = { x: position_x - i, y: position_y }
			this.python_body[i] = coordinates;
		}
	}

	setBonusCoordinates() {
		var min = 1;
		var max_x = this.FIELD_WIDTH / this.CELL_WIDTH;
		var max_y = this.FIELD_HEIGHT / this.CELL_HEIGHT;
		this.bonus = {
			x: parseInt( Math.random() * (max_x - min) + min ),
			y: parseInt( Math.random() * (max_y - min) + min ),
			point : 1
		}
	}

	checkBonusEats() {
		var x = this.python_body[0].x + this.python_direction.x;	
		var y = this.python_body[0].y + this.python_direction.y;	
		if ( x == this.bonus.x && y == this.bonus.y ) {
			this.python_length += 1;
			this.points += this.bonus.point;
			this.setBonusCoordinates();

			var event = new CustomEvent( this.PYTHON_MOVED );
			window.dispatchEvent(event);
		}
	}

	checkGameOver() {

	}
	
}
