class Python {
	constructor(inputController, start_pos_x, start_pos_y) {

		//
		this.PYTHON_MOVED = "python:python moved";
		this.PYTHON_CHANGE_DIRECTION = "python:python change direstion";
		this.PYTHON_GET_POINT = "python:python get point";

		//
		this.inputController = inputController;

		//
		this.POINT_X = 0;
		this.POINT_Y = 0;

		//
		this.python_head_x = start_pos_x || 3;
		this.python_head_y = start_pos_y || 3;
		
		//SNAKE DIRECTIONS
		this.RIGHT = 'right';
		this.LEFT = 'left';
		this.UP = 'up';
		this.DOWN = 'down';

		//GAME PARAMETERS
		this.points = 0;
		this.python_length = 3;
		this.python_direction = this.RIGHT;
		this.moveSnake();

		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
		  switch( e.detail ){
		  	case "left": 
		  		this.python_direction = this.LEFT
		  		break;
		  	case "right":
		  		this.python_direction = this.RIGHT
		  		break;
		  	case "up":
		  		this.python_direction = this.UP
		  		break;
		  	case "down": 
		  		this.python_direction = this.DOWN
		  		break;
	  	}
		}.bind(this));
	}

	moveSnake() {
		setTimeout(function() {
			this.emitPythonMove();
	  	this.moveSnake();
		}.bind(this), 500);
	}

	emitPythonMove() {
		switch (this.python_direction) {
		  case this.RIGHT:
		    this.python_head_x += 1
		    break;
		  case this.LEFT:
		    this.python_head_x -= 1
		    break;
		  case this.UP:
				this.python_head_y -= 1
		    break;
		  case this.DOWN:
				this.python_head_y += 1
		    break;
		};
		var event = new CustomEvent( this.PYTHON_MOVED );
  	window.dispatchEvent(event);
	}

	getBonusX(field_width, cell_width) {
		var min = 1;
		var max_x = field_width / cell_width;
		this.POINT_X = parseInt( Math.random() * (max_x - min) + min );
		return this.POINT_X;
	}

	getBonusY(field_height, cell_height) {
		var min = 1;
		var max_y = field_height / cell_height;
		this.POINT_Y = parseInt( Math.random() * (max_y - min) + min );
		return this.POINT_X;
	}
}
