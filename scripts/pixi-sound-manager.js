class PixiSoundManager {
	constructor(config, python) {

		this.sounds_list= {};
		this.sounds_list['bonus'] = config.preload_list[0];
		this.sounds_list['game-over'] = config.preload_list[1];
		this.sounds_list['music'] = config.preload_list[2];

		this.sounds_turn_on = true;

		this.initEventHandlers();

	}

	playSound( sound_name ){
		var sound = PIXI.sound.Sound.from( sound_name );
		sound.play();
	}

	pauseSounds() {
		PIXI.sound.pauseAll();
	}

	togglePauseSounds() {
		PIXI.sound.togglePauseAll();
	}




	initEventHandlers() {
		var scope = this;

		window.addEventListener( "screens: start game" , function () {
			if (scope.sounds_turn_on) scope.playSound(scope.sounds_list['music']);
		});

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			if (scope.sounds_turn_on) scope.playSound(scope.sounds_list['bonus']);
		});

		window.addEventListener( python.GAME_OVER , function () {
			if (scope.sounds_turn_on) scope.playSound(scope.sounds_list['game-over']);
			setTimeout(function(){scope.togglePauseSounds()}, 1000);
		});

		window.addEventListener( python.PAUSE, function() {
		  if (scope.sounds_turn_on) scope.togglePauseSounds();
		});

		window.addEventListener( python.PLAY, function() {
			if (scope.sounds_turn_on) scope.togglePauseSounds();
		});

		window.addEventListener( "screens: sound playing", function() {
			scope.sounds_turn_on = true;
		});

		window.addEventListener( "screens: sound paused", function() {
			scope.sounds_turn_on = false;
		});
	}

}