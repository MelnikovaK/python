class ThreejsRenderer {
	constructor( $container, python, config ) {

		//ACTIONS
		this.PRELOAD_PROGRESS = "screens:preload_progress";
		this.PRELOAD_COMPLETE = "screens:preload_complete";
		this.SHOW_FINISH_SCREEN = "screens: show_finish_modal";

		var scope = this;
		this.container = document.getElementsByClassName('game-screen__container')[0];

		this.python = python;


		this.PATH = config.ASSETS_PATH;
		//FIELD
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;

		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;

		this.CELLS_HORIZONTAL = config.cells_horizontal;
		this.CELLS_VERTICAL = config.cells_vertical;

		this.BONUS_RADIUS = .5;
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
			this.nearest_bonus = e.detail.nearest_bonus;
			// console.log(this.nearest_bonus)
			scope.onPythonMoved();	
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
		 														renderer: scope.renderer, game_container: scope.game_field} );
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

    camera.position.set( 0, 16, 0 );
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


		//CONTROLS
		this.controls = new THREE.OrbitControls( camera, this.renderer.domElement );
		this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.25;
		this.controls.screenSpacePanning = false;
		this.controls.minDistance = 10;
		this.controls.maxDistance = 500;
		this.controls.maxPolarAngle = Math.PI / 2;
		window.addEventListener( 'resize', onWindowResize, false );

		function onWindowResize() {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
		}
	}

	initContainers() {
		this.game_container = new THREE.Group();
		this.scene.add(this.game_container);

		this.game_field = new THREE.Group();
		this.game_field.position.y = .5;
		this.game_field.position.x = - this.CELLS_HORIZONTAL / 2 + .5;
		this.game_field.position.z = - this.CELLS_VERTICAL / 2 + .5;
		this.game_container.add(this.game_field);

		this.snake_container = new THREE.Group();
		this.game_field.add(this.snake_container);

		this.GO_container = new THREE.Group();
		this.game_field.add(this.GO_container);
	}

	updateBonusPosition(bonus,x,y) {
		bonus.position.x = x;
		bonus.position.z = y;
	}

	onPythonMoved() {
		var python_body =  this.python.python_body;
		this.logic_step_timestamp = Date.now();
	}


	startRendering() {
		
		var scope = this;

   	function animate() {
			
			scope.requestAnimationFrame_id = requestAnimationFrame( animate );
			scope.controls.update();

			var python_body =  scope.python.python_body;
			if ( !python_body.length ) return;

			var time_current = Date.now();
			var delta = (time_current - scope.logic_step_timestamp) / scope.logic_step_interval;

			for ( var i = 0; i < python_body.length; i++ ) {

				var python_part = python_body[i]._model;

				if( python_part && (i == python_body.length - 1  || i == 0) ) {

					python_part.position.x = python_body[i].prev_x + (python_body[i].x - python_body[i].prev_x) * delta;
					python_part.position.z = python_body[i].prev_y + (python_body[i].y - python_body[i].prev_y) * delta;
					var prev_angle = scope.getSmallestAngle(python_body[i].angle, python_body[i].prev_angle);
					python_part.rotation.z = prev_angle + (python_body[i].angle - prev_angle) * delta;

					if ( i == 0) {

					  // var rad = Math.atan2(event.pageX - x, event.pageY - y);
					  // var rot = (rad * (180 / Math.PI) * -1) + 180;


						var x = python_part.position.x + .5;
						var z = python_part.position.z + .5;
						if ( scope.apple ) {
						 	var rad = Math.atan2(scope.apple.position.x - x, scope.apple.position.z - z) * -1;
							// console.log(rad)
							// var angle = scope.getSmallestAngle(0, rad);
							scope.eyes.forEach(function(x) {
								// x.model.lookAt( new THREE.Vector3(scope.apple.position.x,scope.apple.position.y, scope.apple.position.z) );
								x.model.rotation.z = rad;
							});
						}
					}
				}
				if ( scope.body_parts && i < python_body.length ) {

				scope.body_parts.points[i] = new THREE.Vector3(
					python_body[i].prev_x + (python_body[i].x - python_body[i].prev_x) * delta,
					0,
					python_body[i].prev_y + (python_body[i].y - python_body[i].prev_y) * delta);
				}

			}

			if (scope.snake_body) {
				scope.updateSnakeBody(scope.body_parts);
			} 

			// t += .02;
			// sphere.position.x = Math.sin(t) * 5;
			// sphere.position.z = Math.cos(t/2) * 5;

			//
			// camera.position.set( 0, 50 + Math.sin(t)*10, 20 );
			// camera.lookAt( ZERO );
			var head_x = python_body[0]._model.position.x;
			var head_z = python_body[0]._model.position.z;
			if (scope.camera_on_head) scope.changeCameraPosition(delta);
			else scope.moveCamera(head_x, head_z);

			scope.renderer.render( scope.scene, scope.camera );
		}
		
		animate();

	}

	getSmallestAngle(angle, prev_angle) {
		var dist = Math.abs(angle - prev_angle);
		if( dist > Math.PI ){
			if( prev_angle < angle ){
				prev_angle += Utils.PI2;
			}else{
				prev_angle -= Utils.PI2;
			}
		}
		return prev_angle;
	}

	initGameField() {
		var scope = this;
		
		var textureLoader = new THREE.TextureLoader();

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
						var python_part = this.AM.pullAsset( 'python_head' )
					 	this.initEyes(python_part);
					}
					python_part.rotation.x = python_body[i].angle;
					python_part.position.x = python_body[i].x;
					python_part.position.z = python_body[i].y;
					python_body[i]._model = python_part;

					this.snake_container.add(python_part);
				}
			}
		}

		// var head = python_body[0]._model;
		if (!this.snake_body ){
			this.snake_body = this.AM.pullAsset( 'python_body' );
			this.snake_container.add(this.snake_body)
		} else {
			this.updateSnakeBody(this.body_parts);	
		}

	}

	initEyes(head) {
		var python_body = this.python.python_body;
		var first_eye = this.AM.pullAsset( 'python_eye' );
		var second_eye = this.AM.pullAsset( 'python_eye' );
		this.eyes = [{model: first_eye, angle: 0, prev_angle: 0},
								 {model: second_eye, angle: 0, prev_angle: 0}];
		console.log(first_eye, second_eye)

		// var first_pupil = this.first_pupil = this.AM.pullAsset( 'python_pupil' );
		// var second_pupil = this.second_pupil = this.AM.pullAsset( 'python_pupil' );
		// this.additional_materials = [first_eye,second_eye,first_pupil,second_pupil];

		// first_eye.add(first_pupil);
		// second_eye.add(second_pupil);

		head.add(first_eye, second_eye);
	 	this.setCoordinates(first_eye, -.2, -.2);
	 	this.setCoordinates(second_eye, .2, -.2 );
	 	// this.setCoordinates(first_pupil, -.1, -.2, -.13 );
	 	// this.setCoordinates(second_pupil, .1, -.2, -.13 );
	}

	setCoordinates( model, x,z,y) {
		if ( x ) model.position.x = x;
		if ( z ) model.position.z = z;
		if ( y ) model.position.y = y;
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
		// if ( x > z ) this.camera.position.set(x/8, 13, this.camera_z)
		// this.game_field.add(this.camera)
		this.camera.position.set(/*( x - 10) /20*/0, 13, z/2)
		// this.camera_x = x;
		// this.camera_z = z
		this.camera.lookAt( this.ZERO );
	}

	resetCameraPosition(camera) {
		camera.position.set( 0, 13, 0 );
		camera.lookAt( this.ZERO );
	}

	removePython() {
		var python_body = this.python.python_body;
		this.AM.putAsset(python_body[0]._model);
		this.AM.putAsset(python_body[python_body.length - 1]._model);
		this.AM.putAsset(this.snake_body);
		for ( var i = 0; i < this.eyes.length; i++ ){
			this.AM.putAsset(this.eyes[i].model);
		}
		this.snake_body = undefined;
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
		var head = function() {return new THREE.Mesh( new THREE.SphereGeometry( .5, 16, 16), snake_material)};
		this.AM.addAsset('python_head', head, 3);

		//EYES

		var eye = function() {
			var apple_eye = new THREE.Mesh( new THREE.SphereGeometry( .3, 16, 16), new THREE.MeshLambertMaterial({ color: 'white'}));
			var pupil = new THREE.Mesh( new THREE.SphereGeometry( .1, 16), new THREE.MeshLambertMaterial({ color: 'black'}));
	 		scope.setCoordinates(pupil, .1, -.2, -.13 );	
			apple_eye.add(pupil);
			return apple_eye;
		};
		this.AM.addAsset('python_eye', eye, 4);

		// var pupil = function() {return new THREE.Mesh( new THREE.SphereGeometry( .1, 16), new THREE.MeshLambertMaterial({ color: 'black'}))};
		// this.AM.addAsset('python_pupil', pupil, 4);


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