import { Group, Clock, PerspectiveCamera, Raycaster, Vector3, MathUtils } from "three";

export default class CharacterController {
	constructor(
		scene,
		{
			walkSpeed = 5,
			sprintSpeed = 10,
			floorDistance = 1,
			gravity = 9.8,
			jumpPower = 8,
			jumpDuration = 120,
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
			}
		}
	) {
		this.scene = scene;

		this.walkSpeed = walkSpeed;
		this.sprintSpeed = sprintSpeed;
		this.floorDistance = floorDistance;
		this.gravity = gravity;
		this.jumpPower = jumpPower;
		this.jumpDuration = jumpDuration;
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

		this.jumpFrameCounter = 0;
		this.easedLastFrame = 0;
		this.isJumping = false;
		this.isGrounded;
		this.wasGroundedLastFrame;

		document.addEventListener("keydown", (e) => {
			this.keysDown[e.code] = true;
		});
		document.addEventListener("keyup", (e) => {
			this.keysDown[e.code] = false;
		});

		this.raycaster = new Raycaster(
			this.player.position,
			new Vector3(0, 0, -1),
			0,
			this.floorDistance
		);

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
		this.inputs.left.forEach(key => {
			if (this.keysDown[key]) res = -1;
		});
		this.inputs.right.forEach(key => {
			if (this.keysDown[key]) res = 1;
		});
		return res;
	}
	get verticalAxis() {
        let res = 0;
		this.inputs.forwards.forEach(key => {
			if (this.keysDown[key]) res = 1;
		});
		this.inputs.backwards.forEach(key => {
			if (this.keysDown[key]) res = -1;
		});
		return res;
	}
	get sprintKeyPressed() {
        let res = false;
		this.inputs.sprint.forEach(key => {
			if (this.keysDown[key]) res = true;
		});
		return res;
	}

	update() {
		const clock = this.clock;
		const elapsed = this.clock.elapsedTime;
		const delta = clock.getDelta();

		// Cast an invisible ray straight down to check if the player is touching the ground
		this.raycaster.set(this.player.position, new Vector3(0, 0, -1));

		// If the list of scene objects the ray intersects with is not empty,
		// the player is touching the ground
		if (this.raycaster.intersectObjects(this.scene.children, true).length < 1) {
			this.player.position.z -= delta * this.gravity;
			this.isGrounded = false;
		} else {
			this.isGrounded = true;
			this.isJumping = false;
		}

		// If the player has just landed, reset the jump tracking variables
		if (this.isGrounded && !this.wasGroundedLastFrame) {
			this.jumpFrameCounter = 0;
			this.isJumping = false;
			this.easedLastFrame = 0;
		}

		// Move the player
		const speed = this.sprintKeyPressed ? this.sprintSpeed : this.walkSpeed;
		this.player.translateX(this.horizontalAxis * speed * delta);
		this.player.translateY(this.verticalAxis * speed * delta);

		// Rotate the player left and right
		this.player.rotation.z += -this.mouse.x * delta * this.sensitivity.x;

		// Rotate the camera up and down
		this.player.children[0].rotation.x -= this.mouse.y * delta * this.sensitivity.y;

		// Clamp the up and down camera movement
		if (this.player.children[0].rotation.x < MathUtils.degToRad(this.lookLimit.down)) {
			this.player.children[0].rotation.x = MathUtils.degToRad(this.lookLimit.down);
		} else if (this.player.children[0].rotation.x > MathUtils.degToRad(this.lookLimit.up)) {
			this.player.children[0].rotation.x = MathUtils.degToRad(this.lookLimit.up);
		}

		// Start a jump is the space bar is pressed and the player is on the ground.
		if (this.keysDown.Space && this.isGrounded) {
			this.isJumping = true;
		}

		if (this.isJumping) {
			const ratio = this.jumpFrameCounter / this.jumpDuration;
			const eased = 1 - (1 - ratio) * (1 - ratio);
			const easedDifference = eased - this.easedLastFrame;
			this.player.position.z += easedDifference * this.jumpPower;

			this.jumpFrameCounter++;

			this.easedLastFrame = eased;
		}

		this.mouseLastFrame = { ...this.mouse };
		this.wasGroundedLastFrame = this.isGrounded;

		return { elapsed, delta };
	}
}
