class Visualizer {

	constructor($container, python, config) {

		//FIELD SIZE
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;

		//
		this.$container = $container;

		//
		this.python = python;

		//
		this.PYTHON_BODY_COLOR = 'green';
		this.PYTHON_HEAD_COLOR = 'red';

		this.BONUS_COLOR = '#FDD308';
		this.CELLS_COLOR = '#E6E6E6';

		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;

		if ( $container ) {

			//
			this.checkSizeOfFieldElements();

			this.addCanvas();
			this.initGameCharctersCanvas();

			this.initGameField();
			// this.drawGameCharacters();
		};

		window.addEventListener(python.PYTHON_MOVED, function() {
			this.MoveAction();
		}.bind(this));

	}

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

	initGameCharctersCanvas() {
		this.game_characters = this.$container.find('.game-characters')[0];

		this.game_characters.width = this.FIELD_WIDTH;
    this.game_characters.height = this.FIELD_HEIGHT;
		this.game_char_context = this.game_characters.getContext('2d');
	}

	addCanvas(){
		var $game_screen = this.$container.find('.game-screen');
		var canvas = 
		`
			<canvas class="game-field"></canvas>
			<canvas class="game-characters"></canvas>	
		`
		$(canvas).appendTo($game_screen);
	}	

	//
	initGameField() {
		var canvas = this.$container.find('.game-field')[0];

		canvas.width = this.FIELD_WIDTH;
    canvas.height = this.FIELD_HEIGHT;

		var context = canvas.getContext('2d');
		context.strokeStyle = this.CELLS_COLOR;
    for (var x = 1; x < canvas.width; x += this.CELL_WIDTH) context.strokeRect(x, 0, 0.1, canvas.height);
    for (var y = 1; y < canvas.height; y += this.CELL_HEIGHT) context.strokeRect(0, y, canvas.width, 0.1);
	}

	drawGameCharacters( snake_length ) {
		// BONUS
		var x = this.python.bonus.x;
		var y = this.python.bonus.y;
		this.game_char_context.fillStyle = this.BONUS_COLOR;
		this.game_char_context.fillRect(this.CELL_WIDTH * x, this.CELL_HEIGHT * y, this.CELL_WIDTH, this.CELL_HEIGHT);

		//PYTHON	
		var length = this.python.python_length;

		this.game_char_context.fillStyle = this.PYTHON_HEAD_COLOR;
		var x = python.python_body[0].x * this.CELL_WIDTH;
		var y = python.python_body[0].y * this.CELL_HEIGHT;
		this.game_char_context.fillRect(x, y, this.CELL_WIDTH, this.CELL_HEIGHT);

		this.game_char_context.fillStyle = this.PYTHON_BODY_COLOR;

		for ( var i = 1; i < python.python_body.length; i++ ) {
			var x = python.python_body[i].x * this.CELL_WIDTH;
			var y = python.python_body[i].y * this.CELL_HEIGHT;
			this.game_char_context.fillRect(x, y, this.CELL_WIDTH, this.CELL_HEIGHT);
		}
	}

	MoveAction(data) {
		this.game_char_context.clearRect(0, 0, this.game_characters.width, this.game_characters.height);
		this.drawGameCharacters();
	}
}

