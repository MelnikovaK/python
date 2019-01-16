class Visualizer {

	constructor($container, cell_width, cell_height, field_width, field_height, start_pos_x, start_pos_y) {

		//FIELD SIZE
		this.CELL_WIDTH = cell_width || 20;
		this.CELL_HEIGHT = cell_height || 20;
		this.FIELD_WIDTH = field_width || 400;
		this.FIELD_HEIGHT = field_height || 400;
		this.START_SNAKE_POS_X = start_pos_x || 3;
		this.START_SNAKE_POS_Y = start_pos_y || 3;

		//
		this.$container = $container;


		if ( $container ) {

			//SCREENS
			this.initStartScreen();
			this.initGameScreen();
			this.initFinishScreen();

			//
			this.initGameField();
			this.initSnakePosition();

			this.placeBonus();
		}
	}

	initStartScreen() {
		this.$start_screen = $('<div class="start_screen"></button').appendTo( this.$container );

		var $game_title = $('<h1> Python </h1>').appendTo(this.$start_screen);
		var $start_game_button = $('<button class="start_game">New game</button>').appendTo(this.$start_screen);

		$start_game_button.on( 'click', this.ShowGameScreen.bind(this) );
	}

	initGameScreen() {
		this.$game_screen = $('<div class="game_screen hidden_screen"></button').appendTo( this.$container );

		var $points_counter = $('<div class="points_counter">Points: <p class="points"></p></div>').appendTo(this.$game_screen);
		var $pause = $('<button class="pause">Pause</button>').appendTo(this.$game_screen);

		this.$canvas_field = $('<canvas id="game_field"></canvas>').appendTo(this.$game_screen);
		this.$canvas_bonus = $('<canvas id="bonus"></canvas>').appendTo(this.$game_screen);
		this.$canvas_snake = $('<canvas id="snake"></canvas>').appendTo(this.$game_screen);
	}

	initFinishScreen() {
		this.$finish_screen = $('<div class="finish_screen hidden_screen"></button').appendTo( this.$container );

		var $finish_title = $('<h1> Game over </h1>').appendTo(this.$finish_screen);
		var $final_score = $('<div class="final_score">Score: </div>').appendTo(this.$finish_screen);
		var $play_again = $('<button class="play_again">Play again</button>').appendTo(this.$finish_screen);
		var $new_game = $('<button class="new_game">Start new game</button>').appendTo(this.$finish_screen);
	}

	ShowGameScreen() {
		this.$start_screen.addClass('hidden_screen');
		this.$game_screen.removeClass('hidden_screen');
		this.startGame();
	}

	initGameField() {
		var canvas = this.$canvas_field[0];
		canvas.width = this.FIELD_WIDTH;
    canvas.height = this.FIELD_HEIGHT;
		var context = canvas.getContext('2d');
		context.strokeStyle = "#E6E6E6";
    for (var x = 1; x < canvas.width; x += this.CELL_WIDTH) context.strokeRect(x, 0, 0.1, canvas.height);
    for (var y = 1; y < canvas.height; y += this.CELL_HEIGHT) context.strokeRect(0, y, canvas.width, 0.1);
	}

	initSnakePosition( snake_length ) {
		var canvas = this.$canvas_snake[0];
		canvas.width = this.FIELD_WIDTH;
    canvas.height = this.FIELD_HEIGHT;
		var context = canvas.getContext('2d');

		this.snake = new Path2D();

		var x = this.CELL_WIDTH * this.START_SNAKE_POS_X;
		var y = this.CELL_HEIGHT * this.START_SNAKE_POS_Y;
		var length = snake_length || 3;

		this.snake.rect(x, y, this.CELL_WIDTH * length, this.CELL_HEIGHT);
		context.fillStyle = "#0E0099";
		context.fill(this.snake);
	}

	placeBonus() {
		var min = 1;
		var max_x = this.FIELD_WIDTH / this.CELL_WIDTH;
		var max_y = this.FIELD_HEIGHT / this.CELL_HEIGHT;
		var x = parseInt( Math.random() * (max_x - min) + min );
		var y = parseInt( Math.random() * (max_y - min) + min );
		this.drawBonus( x, y);
	}

	drawBonus( x, y ) {
		var canvas = this.$canvas_bonus[0];
		canvas.width = this.FIELD_WIDTH;
    canvas.height = this.FIELD_HEIGHT;
		var context = canvas.getContext('2d');
		this.bonus = new Path2D();
		this.bonus.rect(this.CELL_WIDTH * x, this.CELL_HEIGHT * y, this.CELL_WIDTH, this.CELL_HEIGHT);
		context.fillStyle = "#FDD308";
		context.fill(this.bonus);
	}

	startGame() {
		this.python = new Python();
	}
}


var $game_container = $('.game_container');
let visualizer = new Visualizer($game_container);
