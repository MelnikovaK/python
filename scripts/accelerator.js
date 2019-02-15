var accel =  {
	maxAge: {
                    value: 1
                },
        		position: {
                    value: new THREE.Vector3(0, 0, -2),
                    spread: new THREE.Vector3( 0, 0, 0 )
                },
        		acceleration: {
                    value: new THREE.Vector3(0, -1, 0),
                    spread: new THREE.Vector3( 1, 0, 1 )
                },
        		velocity: {
                    value: new THREE.Vector3(0, .5, 0),
                    spread: new THREE.Vector3(1, 1.5, 1)
                },
                color: {
                    value: [ new THREE.Color('#FF052D'), new THREE.Color('#05F6FF') ]
                },
                size: {
                    value: 1
                },
        		particleCount: 2000
}