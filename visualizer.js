class Visualizer {

	constructor($container, python, field_width, field_height) {

		//FIELD SIZE
		this.FIELD_WIDTH = field_width || 400;
		this.FIELD_HEIGHT = field_height || 400;

		//
		this.$container = $container;

		//
		this.python = python;

		//
		this.PYTHON_COLOR = '#0E0099';
		this.BONUS_COLOR = '#FDD308';
		this.CELLS_COLOR = '#E6E6E6';

		if ( $container ) {

			//
			this.initCellSize();

			this.addCanvas();
			this.initGameCharctersCanvas();

			this.initGameField();
			this.drawSnake();
			this.drawBonus();
		};

		$(window).on( python.PYTHON_MOVED, function(){
			this.initMoveAction();
		}.bind(this));
	}

	initCellSize() {
		this.CELL_WIDTH = (this.FIELD_WIDTH / 100) * 5;
    this.CELL_HEIGHT = (this.FIELD_HEIGHT / 100) * 5;
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

	drawSnake( snake_length ) {
		var x = this.CELL_WIDTH * this.python.python_head_x;
		var y = this.CELL_HEIGHT * this.python.python_head_y;

		var length = this.python.python_length;
		this.game_char_context.fillStyle = this.PYTHON_COLOR;

		this.game_char_context.fillRect(x, y, this.CELL_WIDTH * length, this.CELL_HEIGHT);
	}

	drawBonus() {
		var x = this.python.getBonusX( this.FIELD_WIDTH, this.CELL_WIDTH );
		var y = this.python.getBonusY( this.FIELD_HEIGHT, this.CELL_HEIGHT);
		this.game_char_context.fillStyle = this.BONUS_COLOR;

		this.game_char_context.fillRect(this.CELL_WIDTH * x, this.CELL_HEIGHT * y, this.CELL_WIDTH, this.CELL_HEIGHT);
	}

	initMoveAction(data) {
		this.game_char_context.clearRect(0, 0, this.game_characters.width, this.game_characters.height);
	}

}

