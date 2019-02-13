var $game_container = $('.game_container');

var ASSETS_PATH = 'assets/';

var config = {
	
	ASSETS_PATH: ASSETS_PATH,
	
	cells_horizontal: 20,
	cells_vertical: 20,
	
	field_width: 600,
	field_height: 600,
	cell_width: 600/20,
	cell_height: 600/20,
	field_offset_x: 0,
	field_offset_y: 0,

	logic_step_interval: 500,
	max_python_length: 4,
	
	input: {
		keyboard_enabled: true,
		mouse_enabled: true,
		touch_enabled: false,

		swipe_min_distance: 10,
		swipe_max_distance: 80,

		actions: {
			"left": { // название активности
				keys: [37,65], // список кодов кнопок соответствующих активности
				enabled: true // отключенная активность по умолчанию
			},
			"right": {
				keys: [39,68],
			},
			"up": {
				keys: [87, 38],
			},
			"down": {
				keys: [83, 40],
			},
			"pause": {
				keys: [32],
			},
			"play": {
				keys: [27],
			},
			"full_screen_on": {
				keys: [81]
			},
			"full_screen_off": {
				keys: [90]
			},

			"swipe-left": { // название активности
				gesture: ['swipe-left'],
			},
			"swipe-right": {
				gesture: ['swipe-right'],
			},
			"swipe-up": {
				gesture: ['swipe-up'],
			},
			"swipe-down": {
				gesture: ['swipe-down'],
			},

			"tap": {
				gesture: ['tap']
			}
		}
	},

	preload_list: [
		ASSETS_PATH+"bonus.mp3",
	    ASSETS_PATH+"game over.mp3",
	    ASSETS_PATH+"music.mp3"
	],

	sounds: {
		"bonus": ASSETS_PATH+"bonus.mp3",
		"game over": ASSETS_PATH+"game over.mp3",
		"music": ASSETS_PATH+"music.mp3",
	}
}

// config.sounds = config.preload_list;


let inputController = new InputController( config.input, $game_container[0] );

let python = new Python( inputController, config );

let screens = new Screens( $game_container, python );

let sound_manager = new PixiSoundManager(config, python);

let renderer = new ThreejsRenderer($game_container, python, config );

let particles_manager = new ThreejsParticles($game_container, renderer, config, python);
