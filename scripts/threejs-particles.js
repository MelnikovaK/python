class ThreejsParticles {
	constructor($container, renderer, config, python) {
		this.ASSETS_PATH = config.ASSETS_PATH;

		this.head = python.python_body[0];


		window.addEventListener( python.GAME_OVER , function () {
			// this.updateEmitter(this.game_over_emitter);
		}.bind(this));

		window.addEventListener( python.PYTHON_GET_POINT , function () {
			// this.updateEmitter(this.get_point_emitter);
		}.bind(this));

		window.addEventListener( "screens:preload_complete" , function (e) {
			this.scene = e.detail.scene;
			this.camera = e.detail.camera;
			this.renderer = e.detail.renderer;

			this.initEmitter();
		}.bind(this));

	}
	initEmitter() {
		this.group = new SPE.Group({
			texture: {
				value: THREE.ImageUtils.loadTexture( this.ASSETS_PATH + 'smokeparticle.png' ),
				frames: new THREE.Vector2( 5, 5 ),
				loop: 1
			},
			blending: THREE.AdditiveBlending,
			scale: 100
		});

		this.fireball = new SPE.Emitter( fire );

		this.group.addEmitter( this.fireball );
		this.scene.add( this.group.mesh );
		var scope = this;


		var clock = new THREE.Clock();
		var stats = new Stats();
		var dt = clock.getDelta();
		function render(dt) {

			// scope.group.tick( dt );
	    scope.renderer.render( scope.scene, scope.camera );
		}

		function animate() {
	    requestAnimationFrame( animate );
	    render( clock.getDelta() );
	    stats.update();
			}

			animate();
		document.addEventListener( 'mousedown', createExplosion, false )

		function createExplosion() {
	    var num = 150;
	    // scope.group.triggerPoolEmitter( 1, (new THREE.Vector3( scope.head.x, .5, scope.head.y )) );
	    // scope.fireball.enable()
	  }
	}

}