class PixiSoundManager {

	constructor(config, python) {

		this.sounds_list = config.sounds;

		this.enabled = true;

		this.initEventHandlers(python);

	}

	playSound( sound_name, loop ){
		var sound = PIXI.sound.Sound.from( sound_name );
		sound.play({loop: loop});
	}

	pauseSounds() {
		PIXI.sound.pauseAll();
	}

	togglePauseSounds() {
		PIXI.sound.togglePauseAll();
	}


	initEventHandlers(python) {
		var scope = this;

		window.addEventListener( "sound-manager:toggle_sound", function() {
			scope.enabled = scope.enabled ? false: true;
		});

		window.addEventListener( "sound-manager:play", function(e) {
			var sound_data = e.detail;
			if (scope.enabled) scope.playSound(scope.sounds_list[ sound_data.sound_id ], sound_data.loop);			
		});

		window.addEventListener( "sound-manager:pause", function() {
			if (scope.enabled) scope.togglePauseSounds();
		});

	}

}