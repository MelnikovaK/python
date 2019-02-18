var smoke = { particleCount: 750,
                maxAge: {
                    value: .8,
                },
                position: {
                    value: new THREE.Vector3( 0,0,0 ),
                    spread: new THREE.Vector3( 1, 1, 1 ),
                },
                velocity: {
                    value: new THREE.Vector3( 2 )
                },
                wiggle: {
                    spread: 3
                },
                size: {
                    value: 2
                },
                opacity: {
                    value: [ 0, 1, 0 ]
                },
                color: {
                    value: new THREE.Color('#004D00' ),
                    spread: new THREE.Color( '#5D534B' )
                },
                angle: {
                    value: [ 0, Math.PI * 0.125 ]
                }
            }