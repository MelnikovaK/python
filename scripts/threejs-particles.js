class ThreejsParticles {
	constructor($container, renderer, config, python) {

		this.ASSETS_PATH = config.ASSETS_PATH;

		this.python = python;


		window.addEventListener( python.GAME_OVER , function () {
			this.updateEmitterGroup(this.explode_group);
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			this.updateEmitterGroup(this.coin_group);
		}.bind(this));

		window.addEventListener( python.PYTHON_LOST_POINT , function () {
			this.updateEmitterGroup(this.smoke_group);
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_ACCELERATION , function () {
			this.updateEmitterGroup(this.accel_group);
		}.bind(this));

		window.addEventListener( "screens:preload_complete" , function (e) {
			this.scene = e.detail.scene;
			this.camera = e.detail.camera;
			this.renderer = e.detail.renderer;
			this.game_container = e.detail.game_container;
			this.initEmitter();
		}.bind(this));

	}


	initEmitter() {
		var clock = new THREE.Clock();
		var stats = new Stats();

		//GROUPS
		this.explode_group = this.createGroup('smokeparticle.png');
		this.coin_group = this.createGroup('coin.png');
		this.smoke_group = this.createGroup('cloudSml.png');
		this.accel_group = this.createGroup('smokeparticle.png');

		this.explode_group.addPool(10, new SPE.Emitter( fire ), false);
		this.coin_group.addPool(10, new SPE.Emitter( coin ), false);
		this.smoke_group.addPool(10, new SPE.Emitter( smoke ), false);
		this.accel_group.addPool(10, new SPE.Emitter( accel ), false);

		this.game_container.add( this.explode_group.mesh, this.coin_group.mesh, this.smoke_group.mesh, this.accel_group.mesh );
		
		var scope = this;

		var dt = clock.getDelta();
		function render(dt) {
			
			scope.coin_group.tick( dt );
			scope.explode_group.tick( dt );
			scope.smoke_group.tick( dt );
			scope.accel_group.tick( dt );
	    scope.renderer.render( scope.scene, scope.camera );
		}

		function animate() {
	    requestAnimationFrame( animate );
	    render( clock.getDelta() );
	    stats.update();
		}

		animate();
	}

	createGroup( texture_name ) {
		var textureLoader = new THREE.TextureLoader();
		return new SPE.Group({
			texture: {
				value: textureLoader.load( this.ASSETS_PATH + texture_name ),
				frames: new THREE.Vector2( 5, 5 ),
				loop: 1
			},
			blending: THREE.AdditiveBlending,
			scale: 100
		});
	} 

	updateEmitterGroup( emitter_group ) {
		var head = this.python.python_body[0];
    	emitter_group.triggerPoolEmitter( 1, (new THREE.Vector3( head.x, 0, head.y )) );
	}

}