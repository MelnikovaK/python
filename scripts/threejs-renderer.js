class ThreejsRenderer {
	constructor( $container, python, config ) {

		//ACTIONS
		this.PRELOAD_PROGRESS = "screens:preload_progress";
		this.PRELOAD_COMPLETE = "screens:preload_complete";
		this.SHOW_FINISH_SCREEN = "screens: show_finish_modal";

		var scope = this;
		this.container = document.getElementsByClassName('game-screen__container')[0];

		this.python = python;

		this.bonus_is_eaten = false;

		this.PATH = config.ASSETS_PATH;
		//FIELD
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;

		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;

		this.CELLS_HORIZONTAL = config.cells_horizontal;
		this.CELLS_VERTICAL = config.cells_vertical;

		this.MOUTH_OPENING_ANGLE = 120 * window.Utils.DEG2RAD;

		this.BONUS_RADIUS = .45;
		this.BONUS_SEGMENTS = 16;
		this.BONUS_RINGS = 16;

		this.camera_on_head = false;
		this.full_screen = false;
		this.ZERO = new THREE.Vector3(0,0,0);
		this.CENTER = new THREE.Vector3( this.CELLS_HORIZONTAL / 2, 0, this.CELLS_VERTICAL / 2 );


		//ASSETS MANAGER
		this.AM = new AssetManager(this);

		this.bonuses_type_color = {};
		this.bonuses_type_color['apple'] = {
			color: '#940000',
			shape: new THREE.SphereGeometry( this.BONUS_RADIUS, this.BONUS_SEGMENTS, this.BONUS_RINGS)};
		this.bonuses_type_color['rotten_apple'] = {
			color: '#0E16C4',
			shape: new THREE.SphereGeometry( this.BONUS_RADIUS, this.BONUS_SEGMENTS, this.BONUS_RINGS)};
		this.bonuses_type_color['frog'] = {
			color: '#69CA4E',
			shape: new THREE.SphereGeometry( this.BONUS_RADIUS, this.BONUS_SEGMENTS, this.BONUS_RINGS)};
		this.bonuses_type_color['stone'] = {
			color:'#60604D',
			shape: new THREE.BoxBufferGeometry( 1, 1, 1 )};
		this.bonuses_type_color['accelerator'] = {
			color:'#FFFC29',
			shape: new THREE.CylinderBufferGeometry( 0, .5, 1, 3, 1 )};


		this.preloadTextures();
		this.createAssets();
		
		
		window.addEventListener( "screens: start game" , function () {
			scope.camera_on_head = false;
			scope.resetCameraPosition(scope.camera);
			scope.updateSnake();
			scope.updateBonuses();
			scope.startRendering();

		});

		window.addEventListener( "renderer:change_camera_position", function() {
			if (scope.camera_on_head) scope.camera_on_head = false;
			else scope.camera_on_head = true
			if ( !scope.camera_on_head ) scope.resetCameraPosition(scope.camera);
		});

		window.addEventListener(python.PYTHON_MOVED, function(e) {
			scope.logic_step_interval = python.logic_step_interval;
			scope.logic_step_timestamp = Date.now();	
		});

		window.addEventListener(python.PAUSE, function() {
			window.cancelAnimationFrame(scope.requestAnimationFrame_id);
		});

		window.addEventListener(python.PLAY, function() {
			scope.startRendering();
		});

		window.addEventListener(python.PYTHON_SHOW_FULL_SCREEN, function() {
				scope.changeScreen(window.innerWidth, window.innerHeight);
		});

		window.addEventListener(python.PYTHON_HIDE_FULL_SCREEN, function() {
				scope.changeScreen( scope.FIELD_WIDTH, scope.FIELD_HEIGHT);
		});

		window.addEventListener(python.REDRAW_BONUS, function(e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
		});

		window.addEventListener( python.PYTHON_GET_POINT , function (e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
			scope.updateSnake();
		});

		window.addEventListener( python.BONUS_IS_EATEN , function (e) {
			var interval = e.detail.logic_step_interval;
			scope.bonus_is_eaten = true;	
			setTimeout( function() {
				scope.bonus_is_eaten = false;
			}, interval);
		});

		window.addEventListener( python.PYTHON_GET_ACCELERATION , function (e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
		});

		window.addEventListener( python.PYTHON_LOST_POINT , function (e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
			scope.updateSnake();
		});

		window.addEventListener( python.GAME_OVER , function () {
			scope.shakeScreen();
			window.cancelAnimationFrame(scope.requestAnimationFrame_id);
			setTimeout( function() {
				scope.removePython();
				scope.removeBonuses();
				Utils.triggerCustomEvent( window, scope.SHOW_FINISH_SCREEN );
			}, 2000);
		});
	}
	
	preloadTextures() {
		var scope = this;

		var manager = new THREE.LoadingManager();

		manager.onLoad = function() {
			scope.initScene();
			scope.initContainers();
			scope.initGameField();

		 	Utils.triggerCustomEvent( window, scope.PRELOAD_COMPLETE, {scene: scope.scene, camera: scope.camera, 
		 														renderer: scope.renderer, game_container: scope.game_field});
		};

		manager.onProgress = function( item, loaded, total ) {
	    Utils.triggerCustomEvent( window, scope.PRELOAD_PROGRESS, loaded / total * 100 );
		};

		var textureLoader = new THREE.TextureLoader(manager);

		this.ground_texture = textureLoader.load( this.PATH + "ground.jpg");
		this.wall_texture = textureLoader.load( this.PATH + "wall.jpg");
		this.snake_texture = textureLoader.load( this.PATH + "snake.jpg");
	}

	initScene() {
		
		var scope = this;

		var ZERO = new THREE.Vector3(0,0,0);
		const VIEW_ANGLE = 90;
		const ASPECT = this.FIELD_WIDTH / this.FIELD_HEIGHT;
		const NEAR = .01;
		const FAR = 500;

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		var camera = this.camera =
		    new THREE.PerspectiveCamera(
		        VIEW_ANGLE,
		        ASPECT,
		        NEAR,
		        FAR
		    );

    camera.position.set( 0, 13, 0 );
		camera.lookAt( this.ZERO );

		var scene = this.scene = new THREE.Scene();
		this.scene.add(this.camera);
		this.scene.background = new THREE.Color( 0xcce0ff );

		// !!!
		var gridHelper = new THREE.GridHelper( 20, 20 );
		gridHelper.position.y = .1;
		scene.add( gridHelper );
		// !!!

		this.renderer.setSize(this.FIELD_WIDTH, this.FIELD_HEIGHT);
		this.container.appendChild(this.renderer.domElement);

		var textureLoader = new THREE.TextureLoader();
		
		var spotLight = new THREE.SpotLight( 0xffffff, 1, 0, 30 / 180 * Math.PI );
		spotLight.position.set( 10/2, 100/2, 50/2 );
		this.scene.add( spotLight );
	}

	initContainers() {
		this.game_container = new THREE.Group();
		this.scene.add(this.game_container);

		this.game_field = new THREE.Group();
		this.game_field.position.y = .5;
		this.game_field.position.x = - this.CELLS_HORIZONTAL / 2 + .5;
		this.game_field.position.z = - this.CELLS_VERTICAL / 2 + .5;
		this.game_container.add(this.game_field);

		this.camera_container = new THREE.Group();
		this.game_container.add(this.camera_container);
		this.camera_container.add(this.camera);

		this.snake_container = new THREE.Group();
		this.game_field.add(this.snake_container);

		this.GO_container = new THREE.Group();
		this.game_field.add(this.GO_container);
	}

	updateBonusPosition(bonus,x,y) {
		bonus.position.x = x;
		bonus.position.z = y;
	}

	startRendering() {
		
		var scope = this;

   	function animate() {
			
			scope.requestAnimationFrame_id = requestAnimationFrame( animate );
			// scope.controls.update();

			var python_body =  scope.python.python_body;
			if ( !python_body.length ) return;

			var time_current = Date.now();
			var delta = (time_current - scope.logic_step_timestamp) / scope.logic_step_interval;

			for ( var i = 0; i < python_body.length; i++ ) {
				var python_part = python_body[i]._model;

				if( python_part && (i == python_body.length - 1  || i == 0) ) {
					scope.changePythonPartPosition(python_part, python_body[i].x, python_body[i].prev_x, python_body[i].y, python_body[i].prev_y, delta);
					var prev_angle = scope.getSmallestAngle( python_body[i].angle, python_body[i].prev_angle, Math.PI );
					python_part.rotation.z = prev_angle + (python_body[i].angle - prev_angle) * delta;

					if ( i == 0) { //head
						var upper_head = python_part.children[0];
						if ( scope.bonus_is_eaten ) {
							if ( delta < .5) upper_head.rotation.x = upper_head.rotation.z + (scope.MOUTH_OPENING_ANGLE - upper_head.rotation.z) * delta;
							else upper_head.rotation.x = upper_head.rotation.y + (scope.MOUTH_OPENING_ANGLE - upper_head.rotation.z) * (1 - delta);
						}
						else upper_head.rotation.x = 0;

						scope.moveEyes(python_part, scope.apple);
					}
				}
				//body
				scope.body_parts.points[i] = new THREE.Vector3(
					scope.getPositionValue( python_body[i].x, python_body[i].prev_x, delta),
					0,
					scope.getPositionValue( python_body[i].y, python_body[i].prev_y, delta)
				)
			}

			if (scope.snake_body) {
				scope.updateSnakeBody(scope.body_parts);
			} 

			var head_x = python_body[0]._model.position.x;
			var head_z = python_body[0]._model.position.z;
			if (scope.camera_on_head) scope.changeCameraPosition(delta);
			else scope.moveCamera(head_x, head_z);

			scope.renderer.render( scope.scene, scope.camera );
		}
		animate();
	}


	initGameField() {
		var scope = this;
		
		var groundMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: this.ground_texture });
		var ground_plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( scope.CELLS_HORIZONTAL, scope.CELLS_VERTICAL ), groundMaterial );
		ground_plane.rotation.x = -90 / 180 * Math.PI;
		ground_plane.receiveShadow = true;
		scope.game_container.add( ground_plane );
		
		var cube_material = new THREE.MeshBasicMaterial( { map: this.wall_texture } );
		var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );	
		for ( var i = 0; i < scope.CELLS_HORIZONTAL; i++ )
			for ( var j = 0; j < scope.CELLS_VERTICAL; j++ ) {
				if ( i == 0 || j == 0 || i == scope.CELLS_HORIZONTAL - 1 || j == scope.CELLS_VERTICAL - 1)  {
					var mesh = new THREE.Mesh( geometry, cube_material );
					mesh.position.x = i;
					mesh.position.z= j;
					mesh.rotation.set(THREE.Math.randFloatSpread(.3),THREE.Math.randFloatSpread(.3),THREE.Math.randFloatSpread(.3));
					scope.game_field.add( mesh );
				}
			}
		this.renderer.render( this.scene, this.camera );
	}

	updateSnakeBody(points) {
		var snake_geometry = new THREE.TubeBufferGeometry( points,  points.length + 2, .5, 16, false );
		this.snake_body.geometry = snake_geometry;
	}

	updateSnake() {

		var python_body = this.python.python_body;

		this.body_parts  = new THREE.CatmullRomCurve3();

		
		for ( var i = 0; i < python_body.length; i++ ) {
			if ( !python_body[i]._model ) {
				if (i < python_body.length ) {
					this.body_parts.points.push( new THREE.Vector3( python_body[i].x, 0, python_body[i].y) )
				}
				if ( i == 0 || i ==  python_body.length - 1) {

					if ( i == python_body.length - 1 )  { // create tail
						var python_part = this.AM.pullAsset( 'python_tail' );
						
					} else {// create head
						var head = new THREE.Group();
						var lower_head = this.AM.pullAsset( 'python_lower_head' );
						var upper_head = this.AM.pullAsset( 'python_upper_head' );
						head.add(upper_head,lower_head);
						// var m = new THREE.Matrix4();
						// head.rotateZ = -1;
					  // m.makeTranslation(0, 0, 1);

					  // head.applyMatrix(m);
						var python_part = head;
					 	this.initEyes(upper_head);
					}
					python_part.rotation.x = python_body[i].angle;
					python_part.position.x = python_body[i].x;
					python_part.position.z = python_body[i].y;
					python_body[i]._model = python_part;

					this.snake_container.add(python_part);
				}
			}
		}

		if (!this.snake_body ){
			this.snake_body = this.AM.pullAsset( 'python_body' );
			this.snake_container.add(this.snake_body)

		} else {
			this.updateSnakeBody(this.body_parts);	
		}

	}

	initEyes(head) {
		var first_eye = this.AM.pullAsset( 'python_eye' );
		var second_eye = this.AM.pullAsset( 'python_eye' );
		this.eyes = [first_eye,second_eye];

		head.add(first_eye, second_eye);
	 	this.setCoordinates(first_eye, -.2, -.3);
	 	this.setCoordinates(second_eye, .2, -.3);
	}

	setCoordinates( model, x,z,y) {
		if ( x ) model.position.x = x;
		if ( z ) model.position.z = z;
		if ( y ) model.position.y = y;
	}

	changePythonPartPosition(python_part, x, prev_x, z, prev_z, delta) {
		python_part.position.x = this.getPositionValue(x, prev_x, delta);
		python_part.position.z = this.getPositionValue(z, prev_z, delta);
	}

	getPositionValue(value, prev_value, delta) {
		return prev_value + (value - prev_value) * delta
	}


	moveEyes(head, observed_object) {
		var x = head.position.x + .5;
		var z = head.position.z + .5;
		if ( observed_object ) {
		 	var rad = Math.atan2(observed_object.position.x - x, observed_object.position.z - z) * -1 + 180 * Utils.DEG2RAD - head.rotation.z;
			rad = this.getSmallestAngle( 0, rad, Math.PI );
		 	if ( Math.abs( rad * Utils.RAD2DEG ) > 90 ){
		 		rad = 90 * Utils.DEG2RAD * Math.sign(rad);
		 	}
			this.eyes.forEach(function(x) {
				x.rotation.z = rad;
			});
		}
	}

	getSmallestAngle(angle, prev_angle, max_angle) {
		var dist = Math.abs(angle - prev_angle);
		var changing_angle = max_angle * 2 
		if( dist > max_angle ){
			if( prev_angle < angle ){
				prev_angle += changing_angle;
			}else{
				prev_angle -= changing_angle;
			}
		}
		return prev_angle;
	}
	
	updateBonuses() {
		var scope = this;
		var bonuses = this.python.bonuses;

		const RADIUS = .5;
		const SEGMENTS = 16;
		const RINGS = 16;

		for ( var i = 0; i < bonuses.length; i++ ) {
			if ( !bonuses[i]._model ) {
				var bonus = this.AM.pullAsset( bonuses[i].type );
				bonus.position.x = bonuses[i].x;
				bonus.position.z = bonuses[i].y;
				bonuses[i]._model = bonus;
				if ( bonuses[i].type == 'apple') this.apple = bonus;
				scope.GO_container.add(bonus);
			}
		}		
	}

	changeCameraPosition(delta) {
		var direction = this.python.python_direction;
		var python_body = this.python.python_body;
		var head = python_body[0]._model;

		var camera_position = this.body_parts.points[1].clone();
		this.snake_container.localToWorld( camera_position );
		this.camera.position.copy( camera_position );
		this.camera.position.y = 2;

    var aim_position = this.snake_container.localToWorld( head.position.clone() );
		aim_position.y = 1.5;
		this.camera.lookAt( aim_position );	}

	changeScreen(width, height) {
		this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
		this.renderer.setSize( width, height );
	}

	moveCamera(x, z) {
		// this.camera_container.position.set(x - this.CELLS_HORIZONTAL / 2, 0, 0);
		// this.camera.rotation.order = "YXZ";

		this.camera.position.set(/*( x - 8 )/10*/0 , 13, z / 2);
		this.camera.lookAt(new THREE.Vector3(/*( x - 10) /20*/0,0,0));
	}

	resetCameraPosition(camera) {
		camera.position.set( 0, 13, 0 );
		camera.lookAt( this.ZERO );
	}

	removePython() {
		var scope = this;
		var python_body = this.python.python_body;
		python_body[0]._model.children.forEach(function(x) {
			scope.AM.putAsset(x);
		})
		this.AM.putAsset(python_body[python_body.length - 1]._model);
		this.AM.putAsset(this.snake_body);
		for ( var i = 0; i < this.eyes.length; i++ ){
			this.AM.putAsset(this.eyes[i]);
		}
	}

	removeBonuses() {
		var bonuses = this.python.bonuses;
		for ( var i = 0; i < bonuses.length; i++ ) {
			this.AM.putAsset( bonuses[i]._model );
		}
	}


	createAssets() {
		var scope = this;
		var snake_material = new THREE.MeshBasicMaterial( { map: this.snake_texture } );

		//HEAD
		var upper_head_geometry = new THREE.SphereGeometry( .5, 16, 16, Math.PI, Math.PI);
		var lower_head_geometry = new THREE.SphereGeometry( .5, 16, 16, 0, Math.PI);
		// upper_head_geometry.translate( 0, -.5, 0 )
		// lower_head_geometry.translate( 0, -.5, 0 )
		// var m = new THREE.Matrix4();
  //   m.makeTranslation(0, -1, 0);

  //   upper_head_geometry.applyMatrix(m);
  //   lower_head_geometry.applyMatrix(m);

		var upper_head = function() {return new THREE.Mesh( upper_head_geometry, snake_material);};
		var lower_head = function() {return new THREE.Mesh( lower_head_geometry, snake_material);}; 
		this.AM.addAsset('python_upper_head', upper_head, 3);
		this.AM.addAsset('python_lower_head', lower_head, 3);


		//EYES
		var eye = function() {
			var apple_eye = new THREE.Mesh( new THREE.SphereGeometry( .25, 16, 16), new THREE.MeshLambertMaterial({ color: 'white'}));
			var pupil = new THREE.Mesh( new THREE.SphereGeometry( .08, 16), new THREE.MeshLambertMaterial({ color: 'black'}));
	 		scope.setCoordinates(pupil, 0, -.18, -.18 );	
			apple_eye.add(pupil);
			return apple_eye;
		};
		this.AM.addAsset('python_eye', eye, 4);

		//TAIL
		var geometry = new THREE.CylinderGeometry( 0, .5, 1.5, 16, 1, false );
		var m = new THREE.Matrix4();
    m.makeTranslation(0, 1.5/2, 0);
    geometry.applyMatrix(m);

		var tail = function() {return	new THREE.Mesh( geometry, snake_material )};
		this.AM.addAsset('python_tail', tail, 3);

		//BODY
		var body_parts  = new THREE.CatmullRomCurve3([this.ZERO,this.ZERO,]);
		var body = function() {return new THREE.Mesh(  new THREE.TubeBufferGeometry( body_parts,  2, .5, 16, false ), snake_material)};
		this.AM.addAsset('python_body', body, 3);


		//BONUSES
		this.addBonusToAssetManager('apple');
		this.addBonusToAssetManager('rotten_apple');
		this.addBonusToAssetManager('stone');
		this.addBonusToAssetManager('frog');
		this.addBonusToAssetManager('accelerator');
	}


	addBonusToAssetManager(bonus_name) {
		var scope = this;
		const bonus_material = new THREE.MeshLambertMaterial({ color: this.bonuses_type_color[bonus_name].color});
		var bonus = function() {return new THREE.Mesh( scope.bonuses_type_color[bonus_name].shape, bonus_material)};
		this.AM.addAsset(bonus_name, bonus, 3);

	}

	shakeScreen() {
		var scope = this;

		var canvas = document.getElementsByTagName('canvas')[0];

		var top = parseInt(getComputedStyle(canvas).top);

		var x = 0;
		var t = 0;
		var amp = 10;

		var interval_id = setInterval(function(){
		  if (amp < 1) {
		  	Utils.triggerCustomEvent( window, scope.SHOW_FINISH_SCREEN );
		  	clearInterval(interval_id);
		  }
		  t += .1;
		  if (scope.python.python_direction.x == 0) {
		  	x = Math.cos(t)*amp;
		  	canvas.style.top = top + amp + x + "px";
		  }
		  else {
		  	x = Math.sin(t)*amp;
		  	canvas.style.left = amp + x + "px";
		  }
		  amp -= .05;
		}, 5);
	}

} 