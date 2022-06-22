/* TOOD
	Add support for game controllers
	https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API

	Add support for touch
	https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

	Other input methods for increased accessability?

	Procedural input checking. Having functions for every single
	input action is bad. The usage should be checkInputs(this.inputs.sprint), 
	for example.
*/

import { Group, Clock, PerspectiveCamera, Raycaster, Vector3 } from "three";
import * as PlayerUtils from "./playerUtils.js";

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
			inputs = {
				forwards: ["KeyW", "ArrowUp"],
				backwards: ["KeyS", "ArrowDown"],
				left: ["KeyA", "ArrowLeft"],
				right: ["KeyD", "ArrowRight"],
				jump: ["Space"],
				sprint: ["ShiftLeft", "ShiftRight"],
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
		this.inputs = inputs;

		this.player = new Group();
		this.clock = new Clock();
		this.camera = new PerspectiveCamera(
			this.cameraFov,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.player.add(this.camera);

		this.keysDown = {};
		this.mouse = { x: 0, y: 0 };

		this.isGrounded;
		this.velocity = 0;

		this.raycaster = new Raycaster(
			this.player.position,
			new Vector3(0, 0, -1),
			0,
			this.floorDistance
		);

		document.addEventListener("keydown", (e) => {
			this.keysDown[e.code] = true;
		});
		document.addEventListener("keyup", (e) => {
			this.keysDown[e.code] = false;
		});

		this.cancelDriftTimeout;
		window.addEventListener("mousemove", (e) => {
			clearTimeout(this.cancelDriftTimeout);
			this.mouse.x = e.movementX;
			this.mouse.y = e.movementY;
			this.cancelDriftTimeout = setTimeout(() => {
				this.mouse.x = this.mouse.y = 0;
			}, 10);
		});

		this.clock.start();
	}

	get horizontalAxis() {
		let res = 0;
		this.inputs.left.forEach((key) => {
			if (this.keysDown[key]) res = -1;
		});
		this.inputs.right.forEach((key) => {
			if (this.keysDown[key]) res = 1;
		});
		return res;
	}
	get verticalAxis() {
		let res = 0;
		this.inputs.forwards.forEach((key) => {
			if (this.keysDown[key]) res = 1;
		});
		this.inputs.backwards.forEach((key) => {
			if (this.keysDown[key]) res = -1;
		});
		return res;
	}
	get sprintKeyPressed() {
		let res = false;
		this.inputs.sprint.forEach((key) => {
			if (this.keysDown[key]) res = true;
		});
		return res;
	}

	update() {
		const clock = this.clock;
		const elapsed = this.clock.elapsedTime;
		const delta = clock.getDelta();

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
