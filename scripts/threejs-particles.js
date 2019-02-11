class ThreejsParticles {
	constructor($container, renderer, config, python) {
		this.ASSETS_PATH = config.ASSETS_PATH;


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
		var group = new SPE.Group({
			texture: {
				value: THREE.ImageUtils.loadTexture( this.ASSETS_PATH + 'smokeparticle.png' ),
				frames: new THREE.Vector2( 5, 5 ),
				loop: 1
			},
			blending: THREE.AdditiveBlending,
			scale: 100
		});

		var fireball = new SPE.Emitter( fire );

		group.addEmitter( fireball );
		this.scene.add( group.mesh );
		var scope = this;


		var clock = new THREE.Clock();
		var stats = new Stats();
		clock.getDelta();
		function render() {
			var dt = clock.getDelta();
	    group.tick( );
	    scope.renderer.render( scope.scene, scope.camera );
		}

		function animate() {
	    requestAnimationFrame( animate );
	    stats.update();
	    render();
			}

			animate();
	}
}