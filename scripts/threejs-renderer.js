class ThreejsRenderer {
	constructor( $container, python, config ) {

		//ACTIONS
		this.PRELOAD_PROGRESS = "screens:preload_progress";
		this.PRELOAD_COMPLETE = "screens:preload_complete";


		//
		this.logic_step_interval = config.logic_step_interval;


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

		this.bonuses_type_color = {};
		this.bonuses_type_color['apple'] = '#940000';
		this.bonuses_type_color['rotten_apple'] = '#0E16C4';

		this.preloadTextures();
		this.initScene();
		this.initContainers();
		this.initGameField();

		
		window.addEventListener( "screens: start game" , function () {
			scope.updateSnake();
			scope.initBonuses();
			// scope.updateBonusesPosition();
		});

		window.addEventListener(python.PYTHON_MOVED, function() {
			scope.onPythonMoved();	
		});

		window.addEventListener( python.PYTHON_GET_POINT , function (e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
			scope.updateSnake();
		});

		window.addEventListener( python.REMOVE_PYTHON_PART , function (e) {
			var model = e.detail.model;
			console.log(model)

			this.removePythonPart( model );
		}.bind(this));

		window.addEventListener( python.PYTHON_LOST_POINT , function (e) {
			var bonus = e.detail.bonus;
			scope.updateBonusPosition(bonus._model, bonus.x, bonus.y );
			scope.updateSnake();

		});
	}

	removePythonPart(part) {

		console.log(part)
		this.snake_container.remove(part);
		part.geometry.dispose();
		part.material.dispose();
	}

	preloadTextures() {
		var scope = this;

		var manager = new THREE.LoadingManager();

		manager.onLoad = function() {

		 	Utils.triggerCustomEvent( window, scope.PRELOAD_COMPLETE );
		};

		manager.onProgress = function( item, loaded, total ) {
	    Utils.triggerCustomEvent( window, scope.PRELOAD_PROGRESS, loaded / total * 100 );
		};

		var textureLoader = new THREE.TextureLoader(manager);

		this.ground_texture = textureLoader.load( this.PATH + "ground.jpg");
		this.wall_texture = textureLoader.load( this.PATH + "wall.jpg");
		this.snake_texture = textureLoader.load( this.PATH + "snake.jpg");
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

	initScene() {
		
		var scope = this;

		var ZERO = new THREE.Vector3(0,0,0);
		const VIEW_ANGLE = 50;
		const ASPECT = this.FIELD_WIDTH / this.FIELD_HEIGHT;
		const NEAR = 1;
		const FAR = 500;

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		var camera = this.camera =
		    new THREE.PerspectiveCamera(
		        VIEW_ANGLE,
		        ASPECT,
		        NEAR,
		        FAR
		    );

		camera.position.set( 0, 20, 20 );
		camera.lookAt( ZERO );

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
/*
		var spotLightHelper = new THREE.SpotLightHelper( spotLight );
		scene.add( spotLightHelper );*/


		this.scene.add( spotLight );



		//
		var t = 0;
		function animate() {
			requestAnimationFrame( animate );
		var python_body =  scope.python.python_body;

			var time_current = Date.now();
			var delta = (time_current - scope.logic_step_timestamp) / scope.logic_step_interval;

			for ( var i = 0; i < python_body.length; i++ ) {
				var python_part = python_body[i]._model;
				if (python_part) {
					python_part.position.x = python_body[i].prev_x + (python_body[i].x - python_body[i].prev_x) * delta;
					python_part.position.z = python_body[i].prev_y + (python_body[i].y - python_body[i].prev_y) * delta;
					if( i == python_body.length - 1 ) {
						var prev_angle = python_body[i].prev_angle;
						var dist = Math.abs(python_body[i].angle - prev_angle);
						if( dist > Math.PI ){
							if( prev_angle < python_body[i].angle ){
								prev_angle += Utils.PI2;
							}else{
								prev_angle -= Utils.PI2;
							}
						}
						python_part.rotation.z = prev_angle + (python_body[i].angle - prev_angle) * delta;
					}
				}
			}

			// t += .02;
			// sphere.position.x = Math.sin(t) * 5;
			// sphere.position.z = Math.cos(t/2) * 5;

			//
			// camera.position.set( 0, 50 + Math.sin(t)*10, 20 );
			// camera.lookAt( ZERO );

			//
			scope.renderer.render( scope.scene, scope.camera );
		}
		
		animate();

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
					scope.game_field.add( mesh );
					
				}
				
			}
	}

	updateSnake() {
		var scope = this;

		var snake_material = new THREE.MeshBasicMaterial( { map: this.snake_texture } );
		var python_body = scope.python.python_body;
		var points = [];

		for ( var i = 0; i < python_body.length; i++ ) {
			if ( !python_body[i]._model ) {
				if ( i == python_body.length - 1 ) {
					var python_part = new THREE.Mesh( new THREE.CylinderGeometry( 0, .5, 1.5, 16 ), snake_material );
					python_part.rotation.x = python_body[i].angle;
					python_part.rotation.z = python_body[i].angle;
				} else var python_part = new THREE.Mesh( new THREE.SphereGeometry( .5, 16, 16), snake_material);

				python_part.castShadow = true;
				python_part.position.x = python_body[i].x;
				python_part.position.z = python_body[i].y;
				python_body[i]._model = python_part;

				scope.snake_container.add(python_part);
			}
		}
		console.log(python_body[python_body.length - 1]._model)
		console.log(python_body[python_body.length - 2]._model)
	}

	initBonuses() {
		var scope = this;
		var bonuses = this.python.bonuses;

		const RADIUS = .5;
		const SEGMENTS = 16;
		const RINGS = 16;

		for ( var i = 0; i < bonuses.length; i++ ) {
			const apple_material = new THREE.MeshLambertMaterial({ color: this.bonuses_type_color[bonuses[i].type]});
			var bonus = new THREE.Mesh( new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS), apple_material);
			bonus.position.x = bonuses[i].x;
			bonus.position.z = bonuses[i].y;
			bonuses[i]._model = bonus;
			scope.GO_container.add(bonus);
		}		
	}



} 