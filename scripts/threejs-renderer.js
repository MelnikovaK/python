class ThreejsRenderer {
	constructor( $container, python, config ) {

		this.container = document.getElementsByClassName('game-screen__container')[0];

		this.PATH = config.ASSETS_PATH;
		//FIELD
		this.FIELD_WIDTH = config.field_width;
		this.FIELD_HEIGHT = config.field_height;

		this.CELL_WIDTH = config.cell_width;
		this.CELL_HEIGHT = config.cell_height;

		this.CELLS_HORIZONTAL = config.cells_horizontal;
		this.CELLS_VERTICAL = config.cells_vertical;
		
		this.initScene();
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

		camera.position.set( 0, 30, 20 );
		camera.lookAt( ZERO );

		var scene = this.scene = new THREE.Scene();
		this.scene.add(this.camera);
		this.scene.background = new THREE.Color( 0xcce0ff );

		// !!!
		// var gridHelper = new THREE.GridHelper( 20, 20 );
		// gridHelper.position.y = .1;
		// scene.add( gridHelper );
		// !!!

		this.renderer.setSize(this.FIELD_WIDTH, this.FIELD_HEIGHT);
		this.container.appendChild(this.renderer.domElement);

		var textureLoader = new THREE.TextureLoader();

		var texture = textureLoader.load( this.PATH + "ground.jpg", function(texture) {
			console.log('onload');
			var groundMaterial = new THREE.MeshLambertMaterial( {
				color: 0xffffff,
				map: texture,
				// wireframe: true
				// side: THREE.DoubleSide
			} );
			var ground_plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20, 20 ), groundMaterial );
			ground_plane.rotation.x = -90 / 180 * Math.PI;
			ground_plane.receiveShadow = true;
			this.scene.add( ground_plane );

		}.bind(this));



		const sphereMaterial = new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000,
      wireframe: true
    });		
		const RADIUS = .5;
		const SEGMENTS = 16;
		const RINGS = 16;

		const sphere = new THREE.Mesh( new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS), sphereMaterial);
		sphere.castShadow = true;
		// sphere.position.z = 100;

		this.scene.add(sphere);

		var spotLight = new THREE.SpotLight( 0xffffff, 1, 0, 30 / 180 * Math.PI );
		spotLight.position.set( 10/2, 100/2, 50/2 );

		var spotLightHelper = new THREE.SpotLightHelper( spotLight );
		scene.add( spotLightHelper );

			/*
		spotLight.castShadow = true;

		spotLight.shadow.mapSize.width = 1024;
		spotLight.shadow.mapSize.height = 1024;

		spotLight.shadow.camera.near = 1;
		spotLight.shadow.camera.far = 200;
		spotLight.shadow.camera.fov = 30;
		spotLight.shadowCameraVisible = true; // !!!
		*/

		this.scene.add( spotLight );



		//
		var t = 0;
		function animate() {
			requestAnimationFrame( animate );
			t += .02;
			sphere.position.x = Math.sin(t) * 5;
			sphere.position.z = Math.cos(t/2) * 5;

			//
			camera.position.set( 0, 50 + Math.sin(t)*10, 20 );
			camera.lookAt( ZERO );

			//
			scope.renderer.render( scope.scene, scope.camera );
		}
		
		animate();

	}


	initGameField() {

	}



} 