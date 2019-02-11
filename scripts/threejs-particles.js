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
			}
			// depthTest: true,
			// depthWrite: false,
			// blending: THREE.AdditiveBlending,
			// scale: 600
		});

		var fireball = new SPE.Emitter( {
			particleCount: 20,
			type: SPE.distributions.SPHERE,
			position: {
				radius: 1
			},
			maxAge: { value: 2 },
			// duration: 1,
			activeMultiplier: 20,
			velocity: {
				value: new THREE.Vector3( 10 )
			},
			size: { value: [20, 100] },
			color: {
				value: [
					new THREE.Color( 0.5, 0.1, 0.05 ),
					new THREE.Color( 0.2, 0.2, 0.2 )
				]
			},
			opacity: { value: [0.5, 0.35, 0.1, 0] }
		});

		group.addEmitter( fireball );
		this.scene.add( group.mesh );
		var scope = this;

		var clock = new THREE.Clock();
		function render() {
			var dt = clock.getDelta();
	    group.tick( );
	    shockwaveGroup.tick( );
	    scope.renderer.render( scope.scene, scope.camera );
			}
	}
}