var $game_container = $('.game_container');

var config = {
	
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
			keys: [100,68],
		},
		"up": {
			keys: [87],
		},
		"down": {
			keys: [83],
		},

		"move-left": { // название активности
			gesture: ['swipe-left'],
		},
		"move-right": {
			gesture: ['swipe-right'],
		},
		"move-up": {
			gesture: ['swipe-up'],
		},
		"move-down": {
			gesture: ['swipe-down'],
		},
	}
}



let screens = new Screens($game_container);

let inputController = new InputController( config, $game_container[0] );

let python = new Python(inputController);

let visualizer = new Visualizer($game_container, python);
