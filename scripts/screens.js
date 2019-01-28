class Screens {

	constructor($container, python) {

		var scope = this;
		//
		this.START_GAME = "screens: start game";
		this.PAUSE = "screens: game paused";
		this.PLAY = "screens: game playing";
		this.TOGGLE_SOUND = "sound-manager:toggle_sound";
		this.GAME_OVER = "screens:game-over"


		//
		this.$container = $container;
		this.screens = {};

		this.python = python;

		this.SOUND_ON = 'Sound on';
		this.SOUND_OFF = 'Sound off';


		if ( !$container || !$container.length ) return;
		
		this.initEventHandlers();


		// INIT SCREENS		
		this.initPreloadScreen();
		this.initStartScreen();
		this.initGameScreen();
		this.initFinishScreen();

		// INIT MODALS
		this.initPauseModalWindow();
		this.initGameOverModalWindow();


		// init buttons by data-attribute
		this.initButtonsByDataAttribute('show-screen', function( screen_name ){
			scope.showScreen( screen_name );
		});

		this.initButtonsByDataAttribute('emit-event', function( event_name, data ){
			Utils.triggerCustomEvent( window, event_name, data );
		});

		this.initButtonsByDataAttribute('emit-sound-event', function( event_name, data ){
			Utils.triggerCustomEvent( window, event_name, data );
		});

		this.initButtonsByDataAttribute('emit-game-over', function( event_name, data ){
			scope.showScreen( 'finish-screen' );
			var $score = $('.finish-screen__score', scope.$container);
			$score.text(scope.python.points);

			scope.hideModalWindow( $('.game-over__modal-form'), $('.game-over__overlay') )
		});

		// START
		this.showScreen('preload-screen');
		
	}



/*
███████╗██╗   ██╗███████╗███╗   ██╗████████╗███████╗
██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
█████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║
███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║
╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
*/
	// >>> EVENT HANDLERS >>>

	initEventHandlers(){
		var scope = this;
			// EVENT HANDLERS
		window.addEventListener( scope.python.PYTHON_GET_POINT, function() {
			var $points = $('.game-screen__points', scope.$container);
			$points.text(scope.python.points);
		});

		window.addEventListener( scope.python.PYTHON_LOST_POINT, function() {
			var $points = $('.game-screen__points', scope.$container);
			$points.text(scope.python.points);
		});

		window.addEventListener( "screens: show_finish_modal" , function() {
			scope.showModalWindowWithScore('.game-over__modal-form', '.game-over__overlay')
		});

		window.addEventListener( scope.python.PAUSE, function() {
			scope.showModalWindowWithScore('.game-screen__modal-form', '.overlay')
		});

		window.addEventListener( scope.python.PLAY, function() {
			scope.hideModalWindow( $('.game-screen__modal-form'), $('.overlay') );
		});

		window.addEventListener( "pixi-visualizer:preload_progress", function(e) {

			var $progressbar = $('.progressbar');
			$progressbar.css('width', ~~(e.detail) + '%');
		});

		window.addEventListener( "pixi-visualizer:preload_complete", function(e) {
			scope.showScreen('start-screen');
		});
	}
	// <<< EVENT HANDLERS <<<
	

	// >>> MODALS >>>

	showModalWindowWithScore(modal_window, overlay) {
		var $modal_window = $(modal_window);
		var $overlay = $(overlay);
		this.showModalWindow( $modal_window, $overlay );
		$('.modal-form__score').text(this.python.points);
	}
	// >>> MODALS >>>


	

/*
██╗   ██╗████████╗██╗██╗     ███████╗
██║   ██║╚══██╔══╝██║██║     ██╔════╝
██║   ██║   ██║   ██║██║     ███████╗
██║   ██║   ██║   ██║██║     ╚════██║
╚██████╔╝   ██║   ██║███████╗███████║
 ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
*/
	// UTILS
	initButtonsByDataAttribute( attr_name, onClick ) {
		/*
		var scope = this;
		var $elems_array = $('[data-show-screen]');
		
		$elems_array.each(function (index, value) { 
		  $(this).on('click', function() {
		  	scope.showScreen($(this).attr('data-show-screen'));
		  })
		});
		*/

		var scope = this;
		var $elems_array = $('[data-'+attr_name+']', this.$container );
		$elems_array.click(function(){
			onClick( $(this).data(attr_name) );
		});

	}
	//


/*
███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗███████╗
██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║██╔════╝
███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║███████╗
╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║╚════██║
███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║███████║
╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝
*/

	// >>> SCREENS >>>

	//
	addScreenTemplate( id, template, onScreenShow ){
		var $el = $(template).appendTo(this.$container);
		$el.hide();
		this.screens[id] = {
			$element: $el,
			onScreenShow: onScreenShow
		};
		return $el;
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
				<button class="game-screen_pause-btn button" data-emit-event="${this.PAUSE}"  data-click-sound="" >Pause</button>
			</div>

		`,
			function(){
				Utils.triggerCustomEvent( window, this.START_GAME );
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
				<div>Score: <span class="finish-screen__score"></span></div>
				<button class="start-game button" data-show-screen="game-screen">Start new game</button>
			</div>

		`
		);
		this.$finish_screen = $('.finish-screen');

	}




/*
███╗   ███╗ ██████╗ ██████╗  █████╗ ██╗     
████╗ ████║██╔═══██╗██╔══██╗██╔══██╗██║     
██╔████╔██║██║   ██║██║  ██║███████║██║     
██║╚██╔╝██║██║   ██║██║  ██║██╔══██║██║     
██║ ╚═╝ ██║╚██████╔╝██████╔╝██║  ██║███████╗
╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
*/
	// >>> MODAL >>>
	//
	addModalTemplate( target, template ) {
		var $modal = $(template).appendTo(target);
	}

	//
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


	// PAUSE MODAL
	initPauseModalWindow() {
		var $modal_window = this.addModalTemplate( this.$game_screen, 
		`
			<div class="game-screen__modal-form">
				<h1> PAUSE </h1>
				<div>Score: <span class="modal-form__score"></span></div>
				<button class="modal-form__continue-btn button" data-emit-event="${this.PLAY}">Continue</button>
				<button class="modal-form__soundon-btn button"">${this.SOUND_OFF}</button>
							</div>
			<div class="overlay"></div>
		`
		);
		var $sound_button = $('.modal-form__soundon-btn', $modal_window);
		var scope = this;
		$sound_button.on('click', function() {
			$(this).text($(this).text()==scope.SOUND_ON ? scope.SOUND_OFF : scope.SOUND_ON);
			Utils.triggerCustomEvent( window, scope.TOGGLE_SOUND );

		})

	}

	initGameOverModalWindow() {
		var $modal_window = this.addModalTemplate( this.$game_screen, 
		`
			<div class="game-over__modal-form">
				<h1> Game over :( </h1>
				<div>Score: <span class="modal-form__score"></span></div>
				<button class="modal-form__continue-btn button" data-emit-game-over="${this.GAME_OVER}">Ok</button>
			</div>
			<div class="game-over__overlay"></div>
		`
		);

	}
	// <<< MODAL <<<

}