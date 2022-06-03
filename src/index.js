import {
	Group,
	Clock,
	PerspectiveCamera,
	Raycaster,
	Vector3,
	MathUtils
} from "three";

export default class CharacterController {
	constructor(
		scene,
		{
			speed = 5,
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

		this.speed = speed;
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

        /* Using keyCodes because event.key would be
        affected by modifier keys such as shift. */
		this.keysDown = {
			87: false, // w
			65: false, // a
			83: false, // s
			68: false, // d
			32: false, // space
		};
		this.mouse = { x: 0, y: 0 };

		this.jumpFrameCounter = 0;
		this.easedLastFrame = 0;
		this.isJumping = false;
		this.isGrounded;
		this.wasGroundedLastFrame;

		document.addEventListener("keydown", (e) => {
			this.keysDown[e.keyCode] = true;
		});
		document.addEventListener("keyup", (e) => {
			this.keysDown[e.keyCode] = false;
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

	GetAxis(axis) {
		if (axis === "Horizontal") {
			if (this.keysDown[65]) return -1;
			if (this.keysDown[68]) return 1;
			return 0;
		} else if (axis === "Vertical") {
			if (this.keysDown[87]) return 1;
			if (this.keysDown[83]) return -1;
			return 0;
		} else {
			throw new Error("No axis supplied");
		}
	}

	update() {
		const delta = this.clock.getDelta();

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

		this.player.translateX(this.GetAxis("Horizontal") * this.speed * delta);
		this.player.translateY(this.GetAxis("Vertical") * this.speed * delta);

		this.player.rotation.z += -this.mouse.x * delta * this.sensitivity.x;

		this.player.children[0].rotation.x -= this.mouse.y * delta * this.sensitivity.y;

		if (this.player.children[0].rotation.x < MathUtils.degToRad(this.lookLimit.down)) {
			this.player.children[0].rotation.x = MathUtils.degToRad(this.lookLimit.down);
		} else if (this.player.children[0].rotation.x > MathUtils.degToRad(this.lookLimit.up)) {
			this.player.children[0].rotation.x = MathUtils.degToRad(this.lookLimit.up);
		}

		if (this.keysDown[32] && this.isGrounded) {
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

		return delta;
	}
}
