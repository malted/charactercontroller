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

		this.player = new Group();
		this.clock = new Clock();
		this.camera = new PerspectiveCamera(
			this.cameraFov,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.player.add(this.camera);

		this.keysDown = {
			KeyW: false,
			KeyA: false,
			KeyS: false,
			KeyD: false,
			Space: false,
			ShiftLeft: false,
		};
		console.log(this.keysDown);
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
		if (this.keysDown.KeyA) return -1;
		if (this.keysDown.KeyD) return 1;
		return 0;
	}
	get verticalAxis() {
		if (this.keysDown.KeyW) return 1;
		if (this.keysDown.KeyS) return -1;
		return 0;
	}
	get shiftIsDown() {
		return this.keysDown.ShiftLeft;
	}

	update() {
		const clock = this.clock;
		const elapsed = this.clock.elapsedTime;
		const delta = clock.getDelta();

		console.log(this.horizontal);

		this.raycaster.set(this.player.position, new Vector3(0, 0, -1));

		if (this.raycaster.intersectObjects(this.scene.children, true).length < 1) {
			this.player.position.z -= delta * this.gravity;
			this.isGrounded = false;
		} else {
			this.isGrounded = true;
			this.isJumping = false;
		}

		if (this.isGrounded && !this.wasGroundedLastFrame) {
			this.jumpFrameCounter = 0;
			this.isJumping = false;
			this.easedLastFrame = 0;
		}

		const speed = this.shiftIsDown ? this.sprintSpeed : this.walkSpeed;

		this.player.translateX(this.horizontalAxis * speed * delta);
		this.player.translateY(this.verticalAxis * speed * delta);

		this.player.rotation.z += -this.mouse.x * delta * this.sensitivity.x;

		this.player.children[0].rotation.x -= this.mouse.y * delta * this.sensitivity.y;

		if (this.player.children[0].rotation.x < MathUtils.degToRad(this.lookLimit.down)) {
			this.player.children[0].rotation.x = MathUtils.degToRad(this.lookLimit.down);
		} else if (this.player.children[0].rotation.x > MathUtils.degToRad(this.lookLimit.up)) {
			this.player.children[0].rotation.x = MathUtils.degToRad(this.lookLimit.up);
		}

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
