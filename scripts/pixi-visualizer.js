class PixiVisualizer {
	
	constructor($container, python, config, screens) {

		//ACTIONS NAMES
		this.PROGRESSBAR_LOADING = "pixi-visualizer:progressbar_loading";

		//FIELD ELEMENTS SIZE
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;
		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;
		this.cells_horizontal = config.cells_horizontal || 20;
		this.cells_vertical = config.cells_vertical || 20;


		//
		this.python = python;

		//
		this.python_body = [];


		this.parts_indexes = {
			"-10": 2,
			"0-1": 1,
			"10": 4,
			"01": 8,
		};

		//
		this.snake_parts = {};
		this.snake_parts[1+2] = [0,0];// UL  ┘
		this.snake_parts[1+8] = [2,1];// UD  |
		this.snake_parts[1+4] = [2,0];// UD  └
		this.snake_parts[2+8] = [0,1];// UD  ┐
		this.snake_parts[4+8] = [2,2];// UD  ┌
		this.snake_parts[2+4] = [1,0];// UD  -
		this.snake_parts[1] = [4,3];//tail down
		this.snake_parts[2] = [4,2];//tail right
		this.snake_parts[4] = [3,3];//tail left
		this.snake_parts[8] = [3,2];//tail up

		//
		this.initPixiApplication();
		this.loadAssets();



		window.addEventListener(python.PYTHON_MOVED, function() {
			this.moveAction();
		}.bind(this));

		window.addEventListener( "screens: start game" , function () {
			// var sound = PIXI.sound.Sound.from("assets/music.mp3");
			// PIXI.loader.resources.sound.play();
			this.setBonus();
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			this.setBonus();
			this.growPython();
		}.bind(this));
	}

	initPixiApplication() {
		this.app = new PIXI.Application({width: this.FIELD_WIDTH, height: this.FIELD_HEIGHT});
		var game_screen = document.getElementsByClassName('game-screen')[0];
		game_screen.appendChild(this.app.view);
	}

	moveAction() {
		var python_body = python.python_body;
		this.python_body[0].rotation = this.python.python_direction.rotation;

		this.changeRotation();
		for ( var i = 0; i < python_body.length ; i++ ) {
			this.python_body[i].x = python_body[i].x * this.CELL_WIDTH;
			this.python_body[i].y = python_body[i].y * this.CELL_HEIGHT;
		}
	}

	changeRotation() {
		var python_body = python.python_body;
		var last_index = this.python_body.length - 1;

		//body
		for ( var i = 1; i < python_body.length - 1; i++ ) {
			var prev_part = this.getDiffString(python_body[i], python_body[i - 1]);
			var next_part = this.getDiffString(python_body[i], python_body[i + 1]);
			var body_part = this.snake_parts[this.parts_indexes[prev_part] + this.parts_indexes[next_part]];
			if ( body_part ) {
				this.changePythonParts(body_part, this.python_body[i], i, false)
			}
		}

		//TAIL
		var tail_diff = this.getDiffString(python_body[last_index], python_body[last_index - 1]);
		var tail = this.snake_parts[this.parts_indexes[tail_diff]];
		this.changePythonParts(tail, this.python_body[last_index], last_index, true);
	}

	getDiffString(fisrt_elem, sec_elem) {
		var diff_x = fisrt_elem.x - sec_elem.x;
		var diff_y = fisrt_elem.y - sec_elem.y;
		return diff_x.toString() + diff_y.toString();
	}

	changePythonParts(adding_elem, deleting_elem, index, tail_checking) {
		this.app.stage.removeChild(deleting_elem);
		this.app.stage.addChild( adding_elem );
		var first_array_part = this.python_body.slice(0, index);
		if( tail_checking ) var sec_array_part = [];
		var sec_array_part = this.python_body.slice( index + 1 );
		this.python_body = first_array_part.concat(adding_elem, sec_array_part);
	}

	loadAssets() {
		PIXI.loader
			.add([
		    "assets/Ground.png",
		    "assets/snake-graphics.png",
		    "assets/Wall.png",
		    "assets/bonus.mp3",
		    "assets/game over.mp3",
		    "assets/music.mp3"
		  ])
		  .on("progress", this.loadProgressHandler.bind(this))
		  .load(this.setup.bind(this));
	}

	loadProgressHandler(loader, resource) {
		Utils.triggerCustomEvent( window, this.PROGRESSBAR_LOADING, loader.progress );
	}

	setup() {
		this.createGameField();
 		this.createGameCharacters();
		this.initSnakeParts();
	}

	getSprite( sprite_name, x, y, width, height ){
		let texture = PIXI.loader.resources[ sprite_name ].texture.clone();
		texture.frame = new PIXI.Rectangle(x*width, y*height, width, height);

		let sprite = new PIXI.Sprite( texture );
		sprite.width = this.CELL_WIDTH;
		sprite.height = this.CELL_HEIGHT;
		sprite.pivot.set(32, 32);
		return sprite;
	}

	createGameField() {
		for ( var i = 0; i < this.cells_horizontal + 1; i++) {
			for ( var j = 0; j < this.cells_vertical + 1; j++) {

				if ( i == 0 || j == 0 || i == this.cells_horizontal - 1 || j == this.cells_vertical - 1)  var pic_name = "assets/Wall.png";
				else var pic_name = "assets/Ground.png"

				let ground_cell = new PIXI.Sprite(PIXI.loader.resources[pic_name].texture);
				ground_cell.x = i * this.CELL_WIDTH;
				ground_cell.y = j * this.CELL_HEIGHT;
				ground_cell.width = this.CELL_WIDTH;
				ground_cell.height = this.CELL_HEIGHT;
				this.app.stage.addChild(ground_cell);
			}
		}
	}

	createGameCharacters() {
		// SNAKE
 		var head = this.head_sprite = this.getSprite( "assets/snake-graphics.png", 3, 0, 64, 64 );
 		this.app.stage.addChild(head);

 		var straight_body = this.straight_body_sprite = this.getSprite( "assets/snake-graphics.png", 2, 1, 64, 64 );
 		this.app.stage.addChild( straight_body );

 		var tail = this.tail_sprite = this.getSprite( "assets/snake-graphics.png", 3, 2, 64, 64 );
 		this.app.stage.addChild( tail );

 		this.python_body.push(head, straight_body, tail);


 		//BONUS
 		var bonus = this.bonus_sprite = this.getSprite( "assets/snake-graphics.png", 0, 3, 64, 64 );
 		this.app.stage.addChild( bonus );
	}

	setBonus() {
		this.bonus_sprite.x = this.CELL_WIDTH * this.python.bonus.x;
		this.bonus_sprite.y = this.CELL_HEIGHT * this.python.bonus.y;
	}

	growPython() {
		var python_body = this.python.python_body;
		var last_index = python_body.length - 1;

		var prev_part = this.getDiffString(python_body[last_index - 1], python_body[last_index]);
		var next_part = this.getDiffString(python_body[last_index - 1], python_body[last_index - 2]);
		var body_part = this.snake_parts[this.parts_indexes[prev_part] + this.parts_indexes[next_part]];
		this.app.stage.addChild( body_part );
		console.log(body_part)

		var last_element = this.python_body.pop();
		this.python_body.push(body_part, last_element);
	}

	initSnakeParts() {
		for ( var sum in this.snake_parts) {
			var x = this.snake_parts[sum][0];
			var y = this.snake_parts[sum][1];
			this.snake_parts[sum] = this.getSprite( "assets/snake-graphics.png", x, y, 64, 64 );
		}
	}

}
