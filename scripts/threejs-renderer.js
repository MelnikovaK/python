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
		
		window.onscroll = function(e) {
			e.preventDefault();
		}
		
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

		window.addEventListener(python.FROG_MOVING, function(e) {
			var interval = e.detail.logic_step_interval; 
			scope.frog_x = e.detail.x;
			scope.frog_z = e.detail.y;
			scope.frog_moving = true;
			setTimeout(function() {
				scope.frog_moving = false;
			}, interval);
		});

		window.addEventListener( python.PYTHON_GET_POINT , function (e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
			scope.updateSnake();
		});

		window.addEventListener( python.OPEN_PYTHON_MOUTH , function (e) {
			var interval = e.detail.logic_step_interval;
			scope.mouth_opening = true;	
			setTimeout( function() {
				scope.mouth_opening = false;
				scope.mouth_closing = true;
				setTimeout( function() {
					scope.mouth_closing = false;
				}, interval)
			}, interval);
		});

		window.addEventListener( python.BONUS_IS_EATEN , function (e) {
			if ( scope.mouth_opening ) return;
			var interval = e.detail.logic_step_interval;
			scope.bonus_eating = true;
			setTimeout( function() {
				scope.bonus_eating = false;
			}, interval);
			//открывается рот при приближении к бонусу
			//закрывается в любом случае
			//в точке бонуса: если рот не открыт -> стандартное съедение
			//иначе ничего не делать
			
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
			scope.createAssets();
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
		this.snake_map_texture = textureLoader.load( this.PATH + "snake_map.jpg");
		this.snake_normalmap_texture = textureLoader.load( this.PATH + "snake_normalmap.jpg");

		this.snake_map_texture.wrapS = this.snake_map_texture.wrapT = THREE.RepeatWrapping;
		// this.snake_normalmap_texture.repeat.set(0.5, 0.5);
		// this.snake_normalmap_texture.needsUpdate = true;
		// this.snake_map_texture.needsUpdate = true;
	}

	initScene() {
		
		var scope = this;

		var ZERO = new THREE.Vector3(0,0,0);
		const VIEW_ANGLE = 90;
		const ASPECT = window.innerWidth / window.innerHeight;
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
    camera.position.set( 0, 15, 0 );
		camera.lookAt( this.ZERO );

		var scene = this.scene = new THREE.Scene();
		this.scene.add(this.camera);
		this.scene.background = new THREE.Color( 0xcce0ff );

		// !!!
		var gridHelper = new THREE.GridHelper( 20, 20 );
		gridHelper.position.y = .1;
		scene.add( gridHelper );
		// !!!

		this.renderer.setSize(window.innerWidth, window.innerHeight);
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
						if ( scope.bonus_eating ) scope.openPythonMouth(upper_head, delta, delta < .5, delta >= .5);
						else scope.openPythonMouth(upper_head, delta, scope.mouth_opening, scope.mouth_closing);

						if ( !(scope.mouth_opening || scope.mouth_closing || scope.bonus_eating) ) upper_head.rotation.x = 0;
						scope.moveEyes(python_part, scope.apple);
					}
				}
				//body
				scope.body_parts.points[i* 2] = new THREE.Vector3(
					scope.getPositionValue( python_body[i].x, python_body[i].prev_x, delta),
					0,
					scope.getPositionValue( python_body[i].y, python_body[i].prev_y, delta)
				)
				if ( i < python_body.length - 1){
					var x = scope.getMiddlePoint(python_body[i].x, python_body[i + 1].x);
					var y = scope.getMiddlePoint(python_body[i].y, python_body[i + 1].y);
					var prev_x = scope.getMiddlePoint(python_body[i].prev_x, python_body[i + 1].prev_x);
					var prev_y = scope.getMiddlePoint(python_body[i].prev_y, python_body[i + 1].prev_y);

					scope.body_parts.points[i * 2 + 1] = new THREE.Vector3(
						scope.getPositionValue( x, prev_x, delta),
						0,
						scope.getPositionValue( y, prev_y, delta)
					);
				}	
			}

			//frog moving
			if( scope.frog_moving ){
				scope.frog.position.x = scope.frog.position.x + ( scope.frog_x - scope.frog.position.x ) * delta; 
				scope.frog.position.z = scope.frog.position.z + ( scope.frog_z - scope.frog.position.z ) * delta; 
				if ( delta < .5 ) scope.frog.position.y = Math.cos(.4) * delta;
				else scope.frog.position.y = Math.cos(.4) * ( 1 - delta );
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

	openPythonMouth(head, delta, first_condition, sec_condition) {
		if (first_condition) head.rotation.x = this.MOUTH_OPENING_ANGLE * delta;
		else if (sec_condition) head.rotation.x = this.MOUTH_OPENING_ANGLE * ( 1 - delta);
	}

	getMiddlePoint( first_value, sec_value ){
		return first_value + (sec_value - first_value) / 2;
	}

	initGameField() {
		var scope = this;
		
		var groundMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: this.ground_texture });
		var ground_plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( scope.CELLS_HORIZONTAL, scope.CELLS_VERTICAL ), groundMaterial );
		ground_plane.rotation.x = -90 / 180 * Math.PI;
		ground_plane.receiveShadow = true;
		scope.game_container.add( ground_plane );
		
		var cube_material = new THREE.MeshLambertMaterial( { map: this.wall_texture } );
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
		var snake_geometry = new THREE.TubeBufferGeometry( points,  points.length * 2 + 30, .5, 16, false );
		this.snake_body.geometry = snake_geometry;
	}

	updateSnake() {

		var python_body = this.python.python_body;

		this.body_parts  = new THREE.CatmullRomCurve3();
		
		for ( var i = 0; i < python_body.length; i++ ) {
			if ( !python_body[i]._model ) {
				if (i < python_body.length ) {
					this.body_parts.points.push( new THREE.Vector3( python_body[i].x, 0, python_body[i].y) )
					if ( i < python_body.length - 1){
						var x = python_body[i].x + (python_body[i + 1].x - python_body[i].x) / 2;
						var y = python_body[i].y + (python_body[i + 1].y - python_body[i].y) / 2;
						this.body_parts.points.push( new THREE.Vector3(x, 0, y) )
					}
				}
				if ( i == 0 || i ==  python_body.length - 1) {

					if ( i == python_body.length - 1 )  { // create tail
						var python_part = this.AM.pullAsset( 'python_tail' );
						
					} else {// create head
						var head = new THREE.Group();
						var lower_head = this.AM.pullAsset( 'python_lower_head' );
						var upper_head = this.AM.pullAsset( 'python_upper_head' );
						// var neck = this.AM.pullAsset( 'python_neck' );
						head.add(upper_head,lower_head);
						var python_part = head;
					 	this.initEyes(head);					 	
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

	changePythonPartPosition(python_part, x, prev_x, z, prev_z, delta) {
		python_part.position.x = this.getPositionValue(x, prev_x, delta);
		python_part.position.z = this.getPositionValue(z, prev_z, delta);
	}

	getPositionValue(value, prev_value, delta) {
		return prev_value + (value - prev_value) * delta
	}

	initEyes(head) {
		var first_eye = this.AM.pullAsset( 'python_eye' );
		var second_eye = this.AM.pullAsset( 'python_eye' );
		this.eyes = [first_eye,second_eye];

		head.add(first_eye, second_eye);
	 	this.setCoordinates(first_eye, -.2, -.3, .1);
	 	this.setCoordinates(second_eye, .2, -.3, .1);
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

	setCoordinates( model, x,z,y) {
		if ( x ) model.position.x = x;
		if ( z ) model.position.z = z;
		if ( y ) model.position.y = y;
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

		for ( var i = 0; i < bonuses.length; i++ ) {
			if ( !bonuses[i]._model ) {
				var bonus = this.AM.pullAsset( bonuses[i].type );
				bonus.position.x = bonuses[i].x;
				bonus.position.z = bonuses[i].y;
				bonuses[i]._model = bonus;
				if ( bonuses[i].type == 'apple') this.apple = bonus;
				if ( bonuses[i].type == 'frog') this.frog = bonus;
				scope.GO_container.add(bonus);
			}
		}		
	}

	changeCameraPosition(delta) {
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
		var camera_x = x - this.CELLS_HORIZONTAL / 2;
		var camera_z = z - this.CELLS_VERTICAL / 2;
		this.camera.position.set(camera_x / 2, 14, camera_z / 3);
		this.camera.lookAt(new THREE.Vector3( camera_x / 2, 0, camera_z / 3));
	}

	resetCameraPosition(camera) {
		camera.position.set( 0, 14, 0 );
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
		var m = new THREE.Matrix4();

		var snake_material = new THREE.MeshPhongMaterial({map: this.snake_map_texture, normalMap: this.snake_normalmap_texture, side: THREE.DoubleSide});


		//HEAD
		var internal_side_material = new THREE.MeshPhongMaterial({ color: '#800000', side: THREE.BackSide});
		var head_materials = [snake_material, internal_side_material];
		var material = new THREE.MeshFaceMaterial(head_materials);


		var upper_head_geometry = new THREE.SphereGeometry( .5, 16, 16, Math.PI, Math.PI);
		var inrenal_lower_head_geometry = new THREE.SphereGeometry( .5, 16, 16, 0, Math.PI);
		var external_lower_head_geometry = new THREE.SphereGeometry( .5, 16, 16, 0, Math.PI);
		var upper_head = function(){ 
			var head_mesh = new THREE.Mesh(upper_head_geometry, material);
			return head_mesh;
		}

		var lower_head = function() {
			var external_head_mesh = new THREE.Mesh(external_lower_head_geometry, snake_material);
			var internal_head_mesh = new THREE.Mesh(inrenal_lower_head_geometry, internal_side_material);
			var head_mesh = new THREE.Group();
			head_mesh.add(external_head_mesh, internal_head_mesh)
			return head_mesh;
		};

		this.AM.addAsset('python_upper_head', upper_head, 3);
		this.AM.addAsset('python_lower_head', lower_head, 3);

		//NECK 
		var geometry = new THREE.CylinderGeometry( .5, .3, 1, 16, 1, false );
		m.makeTranslation(0, 1/2, 0);
    geometry.applyMatrix(m);

		var neck = function() {return	new THREE.Mesh( geometry, snake_material )};
		this.AM.addAsset('python_neck', neck, 3);


		//EYES
		var eye = function() {
			var apple_eye = new THREE.Mesh( new THREE.SphereGeometry( .25, 16, 16), new THREE.MeshLambertMaterial({ color: 'white'}));
			var pupil = new THREE.Mesh( new THREE.SphereGeometry( .08, 16), new THREE.MeshLambertMaterial({ color: 'black'}));
	 		scope.setCoordinates(pupil, 0, -.18, -.16 );	
	 		// apple_eye.scale.z = 0.1;
	 		// pupil.scale.z = 0.1;
			apple_eye.add(pupil);
			return apple_eye;
		};
		this.AM.addAsset('python_eye', eye, 4);

		//TAIL
		var geometry = new THREE.CylinderGeometry( 0, .5, 1.5, 16, 1, false );
    m.makeTranslation(0, 1.5/2, 0);
    geometry.applyMatrix(m);

		var tail = function() {return	new THREE.Mesh( geometry, snake_material )};
		this.AM.addAsset('python_tail', tail, 3);

		//BODY
		var body_parts  = new THREE.CatmullRomCurve3([this.ZERO,this.ZERO,]);
		var body = function() {return new THREE.Mesh(  new THREE.TubeBufferGeometry( body_parts,  16, .5, 16, false ), snake_material)};
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