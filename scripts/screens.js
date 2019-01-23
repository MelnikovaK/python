class Screens {

	constructor($container, python) {

		//
		this.START_GAME = "screens: start game";
		this.PAUSE = "screens: game paused";
		this.PLAY = "screens: game playing";


		//
		this.$container = $container;
		this.screens = {};

		this.python = python;


		if ( !$container || !$container.length ) return;
		
		// EVENT HANDLERS
		window.addEventListener( this.python.PYTHON_GET_POINT, function() {
			var $points = $('.game-screen__points', this.$container);
			$points.text(this.python.points);
		}.bind(this))

		window.addEventListener( this.python.GAME_OVER, function() {
			this.showScreen( 'finish-screen' );
			var $score = $('.finish-screen__score', this.$container);
			$score.text(this.python.points);
		}.bind(this));

		window.addEventListener( this.python.PAUSE, function() {
			this.gamePaused();
		}.bind(this))

		window.addEventListener( this.python.PLAY, function() {
			this.onGamePlaying();
		}.bind(this))

		window.addEventListener( "pixi-visualizer:preload_progress", function(e) {
			var $progressbar = $('.progressbar');

			$progressbar.css('width', ~~(e.detail) + '%');

		}.bind(this))

		window.addEventListener( "pixi-visualizer:preload_complete", function(e) {
			this.showScreen('start-screen');

		}.bind(this))


		// INIT SCREENS		
		this.initPreloadScreen();
		this.initStartScreen();
		this.initGameScreen();
		this.initFinishScreen();

		// INIT MODALS
		this.initPauseModalWindow();

		// START
		this.showScreen('preload-screen');
		
	}

	// >>> EVENT HANDLERS >>>
	onGamePlaying() {
		var $modal_window = $('.game-screen__modal-form');
		var $overlay = $('.overlay');
		this.hideModalWindow( $modal_window, $overlay );
	}
	// <<< EVENT HANDLERS <<<
	

	// >>> MODALS >>>
	gamePaused() {
		var $modal_window = $('.game-screen__modal-form');
		var $overlay = $('.overlay');
		this.showModalWindow( $modal_window, $overlay );
		$('.modal-form__score').text(this.python.points);
	}
	// >>> MODALS >>>


/*
███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗███████╗
██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║██╔════╝
███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║███████╗
╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║╚════██║
███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║███████║
╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝
*/

	// >>> SCREENS >>>
	

	// UTILS
	addScreenTemplate( id, template, onScreenShow ){
		var $el = $(template).appendTo(this.$container);
		$el.hide();
		this.screens[id] = {
			$element: $el,
			onScreenShow: onScreenShow
		};
		return $el;
	}

	addModalTemplate( target, template ) {
		var $modal = $(template).appendTo(target);
	}
	//

	// PRELOAD SCREEN
	initPreloadScreen() {
		var $screen = this.addScreenTemplate( 'preload-screen',
		`
			<div class="screen preload-screen">
				<h1>LOADING...<h1>
				<div class="progressbar_container">
				<div class="progressbar"></div>
				</div>
			</div>
		`
		);

		this.$preload_screen = $( '.preload_screen', this.$container );
	}

	// START SCREEN
	initStartScreen() {
		var $screen = this.addScreenTemplate( 'start-screen',
		`
			<div class="screen start-screen">
				<h1> Python </h1>
				<button class="start-game button" data-show-screen="game-screen">New game</button>
				</div>
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
				<div>Points: <span class="game-screen__points">0</span></div>
				<button class="game-screen_pause-btn button">Pause</button>
			</div>

		`,
			function(){
				Utils.triggerCustomEvent( window, this.START_GAME );
			}.bind(this)
		);
		this.$game_screen = $('.game-screen');

		var $pause_button = $('.game-screen_pause-btn', this.$game_screen);

		$pause_button.on('click', function() {
			Utils.triggerCustomEvent( window, this.PAUSE );		
		}.bind(this));

	}

	//
	initFinishScreen() {

		var $screen = this.addScreenTemplate( 'finish-screen',
		`
			<div class="screen  finish-screen">
				<h1> Game over </h1>
				<div>Score: <span class="finish-screen__score"></span></div>
				<button class="start-game button" data-show-screen="game-screen">Start new game</button>
			</div>

		`
		);
		this.$finish_screen = $('.finish-screen');
		var $start_game_button = $('.start-game', this.$container);
		
		this.createEventShowScreen();
	}

	createEventShowScreen() {
		var scope = this;
		var elems_array = $('*[data-show-screen]');
		elems_array.each(function (index, value) { 
		  $(this).on('click', function() {
		  	scope.showScreen($(this).attr('data-show-screen'));
		  })
		});
	}


	//
	initPauseModalWindow() {
		var $modal_window = this.addModalTemplate( this.$game_screen, 
		`
			<div class="game-screen__modal-form">
				<h1> PAUSE </h1>
				<div>Score: <span class="modal-form__score"></span></div>
				<button class="modal-form__continue-btn button">Continue</button>
			</div>
			<div class="overlay"></div>
		`
		);

		var $continue_button = $('.modal-form__continue-btn');

		$continue_button.on('click', function() {
			Utils.triggerCustomEvent( window, this.PLAY );		
		}.bind(this));
	}

	showModalWindow( $modal_window, $overlay ) {
		$overlay.fadeIn(400, function(){
			$modal_window 
				.css('display', 'block')
				.animate({opacity: 1, top: '10%'}, 200);
		});
	}

	hideModalWindow( $modal_window, $overlay ) {
		$modal_window.animate({opacity: 0, top: '0%'}, 200,
			function(){ 
				$(this).css('display', 'none');
				$overlay.fadeOut(400); 
			}
		);
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