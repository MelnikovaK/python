class MaskManager() {
	constructor(sprite, mask, cell_width, cell_height) {
		this.CELL_WIDTH = cell_width;
		this.CELL_HEIGHT = cell_height;

		this.sprite = sprite;
		this.mask = mask;

		this.mask_states = {
			'up':[
          [ 0,.999, 1,.999, 1,1, 0,1 ],
          [ 0,0, 1,0, 1,1, 0,1 ]

        ],
      'right': [
        [ 0,0, 0,0, 0,1 ,0,1 ],
        [ 0,0, 1,0, 1,1, 0,1 ],
      ],
      'down': [
        [ 0,0, 1,0, 1,.111, 0,.111 ],
        [ 0,0, 1,0, 1,1, 0,1 ],
      ],
      'left': [
        [ .999,0, 1,0, 1,1, .999,1 ],
        [ 0,0, 1,0, 1,1, 0,1 ],
      ],

      'left-down': [
      	[ 0,0, 0,0, 0,1, 0,1, ],
        [ 0,0, 1,0, 0,1, 0,1, ],
       	[ 0,0, 1,0, 1,1, 0,1 ],
      ],

      'left-up': [
        [ 0,1, 0,1, 0,0, 0,1, ],
        [ 1,1, 0,1, 0,0, 1,1, ],
        [ 1,1, 0,1, 0,0, 1,0, ],
      ],

      'down-right': [
        [ 0,1, 0,1, 0,0, 0,1, ],
        [ 1,1, 0,1, 0,0, 1,1, ],
        [ 1,1, 0,1, 0,0, 1,0, ],
      ],

      'up-right': [
        [ 0,1, 0,1, 0,0, 0,1, ],
        [ 1,1, 0,1, 0,0, 1,1, ],
        [ 1,1, 0,1, 0,0, 1,0, ],
      ]
		}

		this.curve_body_part = {
      	'clockwise': [
      		[ 0,0, 0,0, 0,1, 0,1, ],
          [ 0,0, 1,0, 0,1, 0,1, ],
         	[ 0,0, 1,0, 1,1, 0,1 ],
      	],
      	'counterclockwise': [
      		[ 0,1, 0,1, 0,0, 0,1, ],
          [ 1,1, 0,1, 0,0, 1,1, ],
          [ 1,1, 0,1, 0,0, 1,0, ],
      	]
      };

      this.mask_rotation = {
      	'left-down': 270 * window.Utils.DEG2RAD,
      	'left-up': 0,
      	'down-right': 180 * window.Utils.DEG2RAD,
      	'up-right': 90 * window.Utils.DEG2RAD,
      }

	}

}