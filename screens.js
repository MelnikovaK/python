class Screens {

	constructor($container, python) {

		//
		this.$container = $container;
		this.screens = {};

		this.python = python;


		if ( $container ) {
			this.initStartScreen();
			this.initGameScreen();
			this.initFinishScreen();

			this.showScreen('start-screen');
		}

		$(window).on('show-screen', function(e,data){
			this.showScreen( data );
		});
	}

	/*
███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗███████╗
██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║██╔════╝
███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║███████╗
╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║╚════██║
███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║███████║
╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝
*/

	addScreenTemplate( id, template, onScreenShow ){
		var $el = $(template).appendTo(this.$container);
		$el.hide();
		this.screens[id] = {
			$element: $el,
			onScreenShow: onScreenShow
		};
		return $el;
	}

	initStartScreen() {
		var $screen = this.addScreenTemplate( 'start-screen',
		`
			<div class="screen start-screen">
				<h1> Python </h1>
				<button class="start-screen__btn-start-game button">New game</button>
			</div>

		`
		);

		this.$start_screen = $( '.start_screen', this.$container );
		var $start_game_button = $('.start-screen__btn-start-game')
		$start_game_button.on( 'click', function() {
			this.showScreen( 'game-screen' );
			// this.python.moveSnake();
		}.bind(this) );
	}


	//
	initGameScreen() {

		var $screen = this.addScreenTemplate( 'game-screen',
		`
			<div class="screen  game-screen">
				<div class="game-screen__points">Points: </div>
				<button class="game-screen__pause button">Pause</button>
			</div>

		`,
			function(){
				// $(window).trigger('start-game');
				this.python.startGame();
			}.bind(this)
		);
		this.$game_screen = $('.game-screen');
	}

	//
	initFinishScreen() {

		var $screen = this.addScreenTemplate( 'finish-screen',
		`
			<div class="screen  finish-screen">
				<h1> Game over </h1>
				<div class="finish-screen__score">Score: </div>
				<button class="finish-screen__play-again button">Play again</button>
				<button class="finish-screen__new_game button">Start new game</button>
			</div>

		`
		);
		this.$finish_screen = $('.finish-screen');
	}

	//
	showScreen( screen_id ){

		this.hideScreen();

		var current_screen_object = this.current_screen_object = this.screens[screen_id];
		current_screen_object.$element.fadeIn( 200, function(){
			if( current_screen_object.onScreenShow ) current_screen_object.onScreenShow();
		});

	}

	hideScreen(){
		
		/*
		for ( var screen_id in this.screens) {
			if (screen_id != id) this.screens[screen_id].$element.fadeOut(200);
		}
		*/
		if( !this.current_screen_object ) return;

		this.current_screen_object.$element.fadeOut(200);
		this.current_screen_object = undefined;
	}

}