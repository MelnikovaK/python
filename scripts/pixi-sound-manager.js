class PixiSoundManager {
	constructor(config, python) {

		this.sounds_list= {};
		this.sounds_list['bonus'] = config.preload_list[0];
		this.sounds_list['game-over'] = config.preload_list[1];
		this.sounds_list['start'] = config.preload_list[2];

		this.initEventHandlers();


		
	}

	playSound( sound_name ){
		var sound = PIXI.sound.Sound.from( sound_name );
		sound.play();
	}

	togglePauseSounds() {
		PIXI.sound.togglePauseAll ();
	}

	initEventHandlers() {
		var scope = this;

		window.addEventListener( "screens: start game" , function () {
			scope.playSound(scope.sounds_list['start']);
		});

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			scope.playSound(scope.sounds_list['bonus']);
		});

		window.addEventListener( python.GAME_OVER , function () {
			scope.playSound(scope.sounds_list['game-over']);
		});

		window.addEventListener( "screens: game paused" , function () {
		  scope.togglePauseSounds();
		});

		window.addEventListener( "screens: game playing" , function () {
		  scope.togglePauseSounds();
		});

		window.addEventListener( python.PAUSE, function() {
		  scope.togglePauseSounds();
		});

		window.addEventListener( python.PLAY, function() {
			scope.togglePauseSounds();
		});
	}

}