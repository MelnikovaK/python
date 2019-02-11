var fire = {
			particleCount: 600,
			type: SPE.distributions.DISC,
			position: {
				radius: 1,
				value: new THREE.Vector3( 0,2,0 )
			},
			maxAge: {
				value: 2,
				spread: 0
			},
			activeMultiplier: 100,
			velocity: {
				spread : new THREE.Vector3( 3 )
			},
			rotation: {
				axis: new THREE.Vector3( 1, 0, 0 ),
				angle: Math.PI * 0.5,
				static: true
			},
			size: { value: 4 },
			color: {
				value: [
					new THREE.Color( 0.4, 0.2, 0.1 ),
					new THREE.Color( 0.2, 0.2, 0.2 )
				]
			},
			opacity: { value: [0.5, 0.2, 0] }
		}