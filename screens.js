class Screens {

	constructor($container) {

		//
		this.$container = $container;
		this.screens = {};


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

	addScreenTemplate(id, template){
		var $el = $(template).appendTo(this.$container);
		$el.hide();
		this.screens[id] = $el;
		return $el;
	}	

	initStartScreen() {
		var $screen = this.addScreenTemplate( 'start-screen',
		`
			<div class="start-screen">
				<h1> Python </h1>
				<button class="start-screen__btn-start-game button">New game</button>
			</div>

		`
		);

		this.$start_screen = $('.start_screen');
		var $start_game_button = $('.start-screen__btn-start-game')
		$start_game_button.on( 'click', function() {
			this.showScreen( 'game-screen' );
		}.bind(this) );
	}


	//
	initGameScreen() {

		var $screen = this.addScreenTemplate( 'game-screen',
		`
			<div class="game-screen">
				<div class="game-screen__points">Points: </div>
				<button class="game-screen__pause button">Pause</button>
			</div>

		`
		);
		this.$game_screen = $('.game-screen');
	}

	//
	initFinishScreen() {

		var $screen = this.addScreenTemplate( 'finish-screen',
		`
			<div class="finish-screen">
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
	showScreen( id ){
		this.screens[id].show();
		for ( var screen_id in this.screens) {
			if (screen_id != id) this.screens[screen_id].hide();
		}
	}

}