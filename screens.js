class Screens {

	constructor($container, python) {

		//
		this.START_GAME = "screens: start game";
		this.PAUSE = "screens: game pause";
		this.PLAY = "screens: game play";


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
		
		window.addEventListener( this.python.PYTHON_GET_POINT, function() {
			var $points = $('.game-screen__points', this.$container);
			$points.text(this.python.points);
		}.bind(this))

		window.addEventListener( this.python.GAME_OVER, function() {
			this.showScreen( 'finish-screen' );
			var $score = $('.finish-screen__score', this.$container);
			$score.text(this.python.points);
		}.bind(this))
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
				<button class="start-game button">New game</button>
			</div>

		`
		);

		this.$start_screen = $( '.start_screen', this.$container );
	}


	//
	initGameScreen() {

		var $screen = this.addScreenTemplate( 'game-screen',
		`
			<div class="screen  game-screen">
				<div class="game-screen__modal-form">
					<h1> PAUSE </h1>
					<div>Score: <span class="modal-form__score"></span></div>
		      <button class="modal-form__button button">Continue</button>
				</div>
				<div class="overlay"></div>
				<div>Points: <span class="game-screen__points">0</span></div>
				<button class="game-screen__pause button">Pause</button>
			</div>

		`,
			function(){
				var event = new CustomEvent( this.START_GAME );
				window.dispatchEvent(event);
			}.bind(this)
		);
		this.$game_screen = $('.game-screen');

		var $pause = $('.game-screen__pause', this.$game_screen );
		var $continue = $('.modal-form__button', this.$game_screen);

		$continue.on('click', function() {
			$('.game-screen__modal-form').animate({opacity: 0, top: '0%'}, 200,
				function(){ 
					$(this).css('display', 'none');
					$('.overlay').fadeOut(400); 
				}
			);
			var event = new CustomEvent( this.PLAY );
			window.dispatchEvent(event);
		});

		$pause.on('click', function() {
			$('.overlay').fadeIn(400, function(){
				$('.game-screen__modal-form') 
					.css('display', 'block')
					.animate({opacity: 1, top: '10%'}, 200);
			});
			$('.modal-form__score', this.$game_screen).text(this.python.points);

			var event = new CustomEvent( this.PAUSE );
			window.dispatchEvent(event);
		}.bind(this))

	}

	//
	initFinishScreen() {

		var $screen = this.addScreenTemplate( 'finish-screen',
		`
			<div class="screen  finish-screen">
				<h1> Game over </h1>
				<div>Score: <span class="finish-screen__score"></span></div>
				<button class="finish-screen__play-again button">Play again</button>
				<button class="start-game button">Start new game</button>
			</div>

		`
		);
		this.$finish_screen = $('.finish-screen');
		var $start_game_button = $('.start-game', this.$container);

		$start_game_button.on( 'click', function() {
			this.showScreen( 'game-screen' );
		}.bind(this) );
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
		
		if( !this.current_screen_object ) return;

		this.current_screen_object.$element.fadeOut(200);
		this.current_screen_object = undefined;
	}

}