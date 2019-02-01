class MaskManager() {
	constructor(sprite, mask, cell_width, cell_height) {
		this.CELL_WIDTH = cell_width;
		this.CELL_HEIGHT = cell_height;

		this.sprite = sprite;
		this.mask = mask;

		this.sprite_masks = {};

		this.sprite_mask['left-down'] = this.leftDown;
		this.sprite_mask['straight-horizontal'] = this.leftDown;
		this.sprite_mask['left-down'] = this.leftDown;
		this.sprite_mask['left-down'] = this.leftDown;
		this.sprite_mask['left-down'] = this.leftDown;
		this.sprite_mask['left-down'] = this.leftDown;
		this.sprite_mask['left-down'] = this.leftDown;

		this.start_position_x_right = this.sprite.x - this.CELL_HEIGHT / 2 ;
		this.start_position_y_right = this.sprite.y + this.CELL_HEIGHT / 2;
	}

	leftDown(delta) {
		this.mask.clear();

		this.mask.beginFill(0xe74c3c); 
		this.mask.moveTo(this.start_position_x_right, this.start_position_y_right );
		this.mask.lineTo(this.start_position_x_right, this.start_position_y_right - this.CELL_HEIGHT);
		if (delta < 0.5) {
			this.mask.lineTo(this.start_position_x_right + this.CELL_WIDTH * delta * 2,  this.start_position_y_right - this.CELL_HEIGHT);
			this.mask.lineTo(this.start_position_x_right, this.start_position_y_right );
		} else {
			this.mask.lineTo(this.start_position_x_right + this.CELL_WIDTH, this.start_position_y_right - this.CELL_HEIGHT);
			this.mask.lineTo(this.start_position_x_right + this.CELL_WIDTH, this.start_position_y_right - this.CELL_HEIGHT + this.CELL_HEIGHT * delta) ;
			this.mask.lineTo(this.start_position_x_right, this.start_position_y_right );
		}
		this.mask.endFill();
	}

	spriteIncreaseStraightRight(mask, sprite) {
		mask.clear();

		mask.beginFill(0xe74c3c); 
		mask.moveTo(this.start_position_x_right, this.start_position_y_right );
		mask.lineTo(this.start_position_x_right, this.start_position_y_right - this.CELL_HEIGHT);
		mask.lineTo(this.start_position_x_right + this.CELL_WIDTH * delta , this.start_position_y_right - this.CELL_HEIGHT);
		mask.lineTo(this.start_position_x_right + this.CELL_WIDTH * delta , this.start_position_y_right) ;
		mask.lineTo(this.start_position_x_right, this.start_position_y_right );
		mask.endFill();
	}

}