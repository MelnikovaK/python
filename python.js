class Python {

	constructor(inputController, start_pos_x, start_pos_y) {

		//
		this.PYTHON_MOVED = "python:draw";
		this.PYTHON_GET_POINT = "python:python get point";

		//
		this.inputController = inputController;

		//
		this.point_position_x = 0;
		this.point_position_y = 0;
		//
		this.python_head_x = start_pos_x || 3;
		this.python_head_y = start_pos_y || 3;
		
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

		//GAME PARAMETERS
		this.points = 0;
		this.python_length = 3;
		this.python_direction = this.directions[this.RIGHT];
		// this.gameStep();

		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
		  var dir = this.directions[e.detail];
		  if( dir ) this.python_direction = dir;
		  console.log('dir: ', dir );
		}.bind(this));
	}

	startGame(){
		console.log('#START GAME');
			
		var scope = this;

		if(!this.gameStep){

			this.gameStep = function(){
				// console.log('gameStep: ', scope );
				
				setTimeout( scope.gameStep, 500);
				
				scope.python_head_x += scope.python_direction.x;
				scope.python_head_y += scope.python_direction.y;

				var event = new CustomEvent( scope.PYTHON_MOVED );
  			window.dispatchEvent(event);

			};
		}

		this.gameStep();
	}


	getBonusX(field_width, cell_width) {
		var min = 1;
		var max_x = field_width / cell_width;
		this.point_position_x = parseInt( Math.random() * (max_x - min) + min );
		return this.point_position_x;
	}

	getBonusY(field_height, cell_height) {
		var min = 1;
		var max_y = field_height / cell_height;
		this.point_position_y = parseInt( Math.random() * (max_y - min) + min );
		return this.point_position_y;
	}
}
