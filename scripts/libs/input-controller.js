class InputController {

  constructor( config_data, target ) {
    
    this.ACTION_ACTIVATED = "input-controller:action-activated";
    this.ACTION_DEACTIVATED  = "input-controller:action-deactivated";
    this.ACTION_TRIGGERED = "input-controller:action-triggered";

    //
    this.enabled = true;
    this._keyboard_enabled = config_data.keyboard_enabled;
    this._mouse_enabled = config_data.mouse_enabled;
    this._touch_enabled = config_data.touch_enabled;

    //
    this.actions = {};
    this.actions_by_keycode = {};
    this.keys = {};
    this.actions_by_gesture = {};

    //
    this.swipe_min_distance = config_data.swipe_min_distance;
    this.swipe_max_distance = config_data.swipe_max_distance;


    //
    var actions_to_bind = config_data.actions;
    if( actions_to_bind ) this.bindActions( actions_to_bind );
    if( target ) this.attach( target );

    Object.defineProperty(this, "keyboard_enabled", {
		  get: function() {
		    return this._keyboard_enabled;
		  },

		  set: function(value) {
		  	if( !(this.enabled && this.target) ) return;
		      this._keyboard_enabled = value;
		    }
		});

		Object.defineProperty(this, "mouse_enabled", {
		  get: function() {
		    return this._mouse_enabled;
		  },

		  set: function(value) {
		  	if( !(this.enabled && this.target) ) return;
		      this._mouse_enabled = value;
		    }
		});

		Object.defineProperty(this, "touch_enabled", {
		  get: function() {
		    return this._touch_enabled;
		  },

		  set: function(value) {
		  	if( !(this.enabled && this.target) ) return;
		      this._touch_enabled = value;
		    }
		});
  }
    

  //
  attach( target, dont_enable ) {

  	this.detach();
  	this.target = target;
  	target.focus();
  	if( dont_enable ) this.enabled = false;
  	this.attachKeyboard( target );
  	this.attachMouse( target );
  	this.attachTouch( target );
  }

  detach() {
  	if( !this.target ) return;
  	target.blur();
  	this.detachKeyboard();
  	this.detachMouse();
  	this.target = null;
  }
  // >>> ACTIONS >>>  

  bindActions( actions_to_bind ) {

  	for( var action_name in actions_to_bind ){
  		
  		var action = actions_to_bind[ action_name ];
  		
  		if( action.enabled == undefined ) action.enabled = true;
  		action.name = action_name;
  		action.active = false;
  		this.actions[ action_name ] = action;

  		// keyboard
  		if( action.keys ){
	  		action.keys.forEach(function(keycode){
	  			this.actions_by_keycode[keycode] = action;
	  			var key = {
	  				is_pressed: false
	  			};
			  	this.keys[keycode] = key;
	  		}.bind(this));
	  	}

	  	// mouse
	  	if( action.gesture ){
	  		action.gesture.forEach(function(gesture_name){
	  			this.actions_by_gesture[gesture_name] = action;
	  		}.bind(this));
	  	}
  	}
  }

  enableAction( action_name ) {
  	this.actions[action_name].enabled = true;
  }

  disableAction( action_name ) {
  	var action = this.actions[action_name];
	 	action.enabled = false;
	 	action.active = false;
  }

  isActionActive(action_name) {
  	var action = this.actions[action_name];
  	if( !action ) return;
		return action.active;
  }

  _setActionActive( action, activate ){
  	if ( !( this.enabled && action && action.enabled && this.keyboard_enabled )) return false;
  	if( action.active == activate ) return false;
  	action.active = activate;
  	// console.log('ACTION NAME: ', action)
  	var event = new CustomEvent( activate ? this.ACTION_ACTIVATED : this.ACTION_DEACTIVATED, { 'detail': { name: action.name}});
  	this.target.dispatchEvent(event);
  }

  emitMouseActionEvent( action, tap_x, tap_y ){
  	if ( !( this.enabled && action && action.enabled && this.mouse_enabled ) ) return false;
  	var event = new CustomEvent( this.ACTION_TRIGGERED, { 'detail':{ name: action.name, x: tap_x, y: tap_y }});
  	this.target.dispatchEvent(event);
  }

  emitTouchActionEvent( action ){
  	if ( !( this.enabled && action && action.enabled && this.touch_enabled ) ) return false;
  	var event = new CustomEvent( this.ACTION_TRIGGERED, { 'detail': { name: action.name, x: tap_x, y: tap_y } });
  	this.target.dispatchEvent(event);
  }
	// <<< ACTIONS <<<  




  // >>> KEYBOARD >>>
  _changeKeyPress(key_code, activate) {
  	if ( !(this.enabled && this.keyboard_enabled) ) return;
  	var key = this.keys[key_code];
  	if( !key ) return;
  	key.is_pressed = activate;
  }

  attachKeyboard( target ){
  	if( !this.onKeyDown ){
		  this.onKeyDown = function(event){
		  	event.preventDefault();
		  	var key_code = event.keyCode;
		  	var action = this.actions_by_keycode[key_code];
		  	this._setActionActive(action, true);
		  	this._changeKeyPress(key_code, true);
		  }.bind(this);

		  this.onKeyUp = function(event){
		  	event.preventDefault();
		  	var key_code = event.keyCode;
		  	var action = this.actions_by_keycode[key_code];
		  	this._setActionActive(action, false);
		  	this._changeKeyPress(key_code, false);
		  }.bind(this);
  	}

		window.addEventListener('keydown', this.onKeyDown );
		window.addEventListener('keyup', this.onKeyUp );

  }

  detachKeyboard(){
  	if( !this.target ) return;
  	window.removeEventListener('keydown', this.onKeyDown );
  	window.removeEventListener('keyup', this.onKeyUp );
  }

  isKeyPressed(keyCode) {
  	if ( this.keys[keyCode] ) return this.keys[keyCode].is_pressed;
	}

	// <<< KEYBOARD <<<







	// >>> MOUSE >>>
	attachMouse( target ){

		if( !this.onMouseDown ){
			
			var start_X, start_Y;
		  this.onMouseDown = function(event){
		  	event.preventDefault();
		  	if (event.which != 1) return;
		  	start_X = event.clientX;
		  	start_Y = event.clientY;
		  	this.removeMouseMoveListeners(target);
		  	target.addEventListener('mousemove', this.onMouseMove);
				target.addEventListener('mouseup', this.onMouseUp );
		  }.bind(this);

		  this.onMouseUp = function(event){
		  	event.preventDefault();
		  	var gesture_name = this.computeGestureName( start_X, start_Y, event.clientX, event.clientY, false, true );
		  	if( gesture_name ){
		  		this.emitMouseActionEvent(this.actions_by_gesture[gesture_name], start_X, start_Y);

		  	}
		  	this.removeMouseMoveListeners(target);
		  }.bind(this);
		
		  this.onMouseMove = function(event){
		  	event.preventDefault();
		  	var finish_X = event.clientX;
        var finish_Y = event.clientY;
		  	var gesture_name = this.computeGestureName( start_X, start_Y, finish_X, finish_Y, true, false );
		  	if (gesture_name) {
		  		this.emitMouseActionEvent(this.actions_by_gesture[gesture_name]);
		  		// start_X = event.clientX;
		  		// start_Y = event.clientY;
		  		this.removeMouseMoveListeners(target);
		  	}
		  }.bind(this);
  	}

		target.addEventListener('mousedown', this.onMouseDown );
		// target.addEventListener('mouseup', this.onMouseUp );
	}

	removeMouseMoveListeners(target){
		if( !target ) return;
		target.removeEventListener('mousemove', this.onMouseMove);
		target.removeEventListener('mouseup', this.onMouseUp );
	}

	detachMouse(target){
  	if( !this.target ) return;
  	target.removeEventListener('mousedown', this.onMouseDown );
  	this.removeMouseMoveListeners();
  }

  //
  computeGestureName(start_X, start_Y, finish_X, finish_Y, on_move, skip_limits ) {
		
		var gesture_name = '';

		var horizontal_difference = start_X - finish_X;
		var vertical_difference = start_Y - finish_Y;
		var horizontal_difference_abs = Math.abs(horizontal_difference);
		var vertical_difference_abs = Math.abs(vertical_difference);

		var max_length = horizontal_difference_abs > vertical_difference_abs ? horizontal_difference_abs : vertical_difference_abs;
		if( max_length < this.swipe_min_distance ) {// min swipe length
			if (!skip_limits) return; 
			else {
				gesture_name = 'tap';
				return gesture_name;
			}
		}

		if ( horizontal_difference_abs > vertical_difference_abs) {
			if ( horizontal_difference < 0 ) gesture_name = 'swipe-right';
			else gesture_name = 'swipe-left';
		} else {
			if ( vertical_difference < 0 ) gesture_name = 'swipe-down';
			else gesture_name = 'swipe-up';
		}
		
		if( !skip_limits && on_move ) {
			if(  max_length > this.swipe_max_distance ) return gesture_name;
			return false;
		}

		return gesture_name;
	}
	// <<< MOUSE <<<



	//>>> TOUCH >>>
	attachTouch( target ){
		if( !this.onTouchStart ){
	
			var start_X, start_Y;

		  this.onTouchStart = function(event){
		  	event.preventDefault();
		  	start_X = event.changedTouches[0].clientX;
		  	start_Y = event.changedTouches[0].clientY;
		  	this.removeTouchMoveListeners();
		  	target.addEventListener('touchmove', this.onTouchMove);
				target.addEventListener('touchend', this.onTouchEnd );
		  }.bind(this);

		  this.onTouchEnd = function(event){
		  	event.preventDefault();
		  	var finish_X = event.changedTouches[0].clientX;
        var finish_Y = event.changedTouches[0].clientY;
		  	var gesture_name = this.computeGestureName( start_X, start_Y, finish_X, finish_Y, false, true );
		  	if( gesture_name ){
		  		this.emitTouchActionEvent(this.actions_by_gesture[gesture_name]);
		  	}
		  	this.removeTouchMoveListeners();
		  }.bind(this);
		
		  this.onTouchMove = function(event){
		  	event.preventDefault();
		  	var finish_X = event.changedTouches[0].clientX;
        var finish_Y = event.changedTouches[0].clientY;
		  	var gesture_name = this.computeGestureName( start_X, start_Y, finish_X, finish_Y, true, false );
		  	if (gesture_name) {
		  		this.emitTouchActionEvent(this.actions_by_gesture[gesture_name]);
		  		this.removeTouchMoveListeners();
		  	}
		  }.bind(this);
  	}
		target.addEventListener('touchstart', this.onTouchStart );
	}

	detacTouch(){
  	if( !this.target ) return;
  	target.removeEventListener('touchstart', this.onTouchStart );
  	this.removeTouchMoveListeners();
  }

  removeTouchMoveListeners(){
		if( !target ) return;
		target.removeEventListener('touchmove', this.onTouchMove);
		target.removeEventListener('touchend', this.onTouchEnd );
	}

	//<<< TOUCH <<<

}