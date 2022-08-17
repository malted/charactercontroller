import { Group, Clock, PerspectiveCamera, Raycaster, Vector3, MathUtils } from "three";
import * as PlayerUtils from "./playerUtils.js";
import * as InputUtils from "./inputUtils.js";

export default class CharacterController {
	constructor(
		scene,
		{
			walkSpeed = 5,
			sprintSpeed = 10,
			floorDistance = 1,
			gravity = -9.81,
			jumpPower = 5,
			sensitivity = {
				x: 0.1,
				y: 0.1,
			},
			lookLimit = {
				down: 0,
				up: 180,
			},
			cameraFov = 75,
			inputMappings = {
				scalar: {
					horizontalAxis: [
						{ inputs: ["KeyA", "ArrowLeft"], value: -1 },
						{ inputs: ["KeyD", "ArrowRight"], value: 1 },
					],
					verticalAxis: [
						{ inputs: ["KeyS", "ArrowDown"], value: -1 },
						{ inputs: ["KeyW", "ArrowUp"], value: 1 },
					],
				},
				discrete: {
					jump: ["Space"],
					sprint: ["ShiftLeft", "ShiftRight"],
				},
			},
		}
	) {
		this.scene = scene;

		this.walkSpeed = walkSpeed;
		this.sprintSpeed = sprintSpeed;
		this.floorDistance = floorDistance;
		this.gravity = gravity;
		this.jumpPower = jumpPower;
		this.sensitivity = sensitivity;
		this.lookLimit = lookLimit;
		this.cameraFov = cameraFov;
		this.inputMappings = inputMappings;

		this.player = new Group();
		this.clock = new Clock();
		this.camera = new PerspectiveCamera(
			this.cameraFov,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.camera.rotation.x = MathUtils.degToRad(90);
		this.player.add(this.camera);

		// A raw list of all the keys currently pressed. Internal use only.
		this.keysDown = {};

		// A processed list of inputs corresponding to the input mappings.
		this.inputs = {};
		this.mouse = { x: 0, y: 0 };

		this.isGrounded;
		this.velocity = 0;

		this.raycaster = new Raycaster(
			this.player.position,
			new Vector3(0, 0, -1),
			0,
			this.floorDistance
		);

		this.cancelDriftTimeout;
		InputUtils.registerMouseMoveEvent.call(this);

		InputUtils.registerKeyEvents.call(this);

		this.clock.start();
	}

	update() {
		const clock = this.clock;
		const elapsed = this.clock.elapsedTime;
		const delta = clock.getDelta();

		// Update the player's currently activated inputs for this frame.
		InputUtils.checkInputs.call(this);

		// Cast a ray straight down from the player's position.
		this.raycaster.set(this.player.position, new Vector3(0, 0, -1));

		// An array of the objects the ray intersects with.
		const hits = this.raycaster.intersectObjects(this.scene.children, true);
		// If the list of objects the ray intersects with is not empty, the player is touching the ground.
		if (hits.length < 1) {
			this.isGrounded = false;
		} else {
			this.isGrounded = true;

			/* Snap the player's z position to the position of the 
			first object the ray intersects with. This makes sure the 
			player's position is always floorDistance away from the surface,
			as factors such as frame rate can affect where the 
			player ends up when the ground check is carried out 
			and the player's velocity is set to zero. */
			this.player.position.z = hits[0].point.z + this.floorDistance;
		}

		/* The player's velocity is multiplied by delta time twice so it
		produces an accelerating gravitational force. 
		Gravity is not a constant speed; it's an acceleration! 
		Thanks to John French for help with this. */
		this.velocity += this.gravity * delta;

		/* If the player is touching the ground, cancel their velocity. 
		Their velocity is checked to be below 0 to make sure the velocity is 
		not set to zero when they are going up, i.e. right after jumping, 
		when their ground check ray is still intersecting with the floor. */
		if (this.isGrounded && this.velocity < 0) {
			this.velocity = 0;
		}

		/* Make sure the player is on the floor before letting them jump again;
		otherwise the would be able to fly. Also, debouncing is not required
		for this as it would not matter if the velocity keeps being set to
		jumpPower for a short while after the jump has started. */
		if (this.keysDown.Space && this.isGrounded) {
			this.velocity = this.jumpPower;
		}
		this.player.position.z += this.velocity * delta;

		PlayerUtils.playerMove.call(this, delta);
		PlayerUtils.playerLook.call(this, delta);
		PlayerUtils.playerClamp.call(this);

		return { elapsed, delta };
	}
}
