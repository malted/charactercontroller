import { MathUtils } from "three";

function playerMove(delta) {
	// Move the player
	const speed = this.inputs.sprint ? this.sprintSpeed : this.walkSpeed;
	this.player.translateX(this.inputs.horizontalAxis * speed * delta);
	this.player.translateY(this.inputs.verticalAxis * speed * delta);
}

function playerLook(delta) {
	// Rotate the player left and right
	this.player.rotation.z += -this.mouse.x * delta * this.sensitivity.x;

	// Rotate the camera up and down
	this.player.children[0].rotation.x -= this.mouse.y * delta * this.sensitivity.y;
}

function playerClamp() {
	// Clamp the up and down camera movement
	this.camera.rotation.x = MathUtils.clamp(
		this.camera.rotation.x,
		MathUtils.degToRad(this.lookLimit.down),
		MathUtils.degToRad(this.lookLimit.up)
	);
}

export { playerClamp, playerLook, playerMove };
