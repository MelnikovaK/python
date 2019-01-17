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
		this.point_position_x = 0;
		this.point_position_y = 0;

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
		// this.gameStep();

		if (config) {

			this.setPythonBody( start_pos_x, start_pos_y );
			this.setBonusX();
			this.setBonusY();
		}

		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
		  var dir = this.directions[e.detail];
		  if( dir ) this.python_direction = dir;
		  console.log('dir: ', dir );
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

				var changed_cell_of_body = scope.python_body.pop();
				changed_cell_of_body.x = scope.python_body[0].x + scope.python_direction.x;
				changed_cell_of_body.y = scope.python_body[0].y + scope.python_direction.y;
				scope.python_body.unshift(changed_cell_of_body);

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
			console.log(coordinates.x)
			this.python_body[i] = coordinates;
		}
	}

	setBonusX() {
		var min = 1;
		var max_x = this.FIELD_WIDTH / this.CELL_WIDTH;
		this.point_position_x = parseInt( Math.random() * (max_x - min) + min );
	}

	setBonusY() {
		var min = 1;
		var max_y = this.FIELD_HEIGHT / this.CELL_HEIGHT;
		this.point_position_y = parseInt( Math.random() * (max_y - min) + min );
	}
	
}
