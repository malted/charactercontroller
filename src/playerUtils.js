import { MathUtils } from "three";

function playerMove(delta) {
    // Move the player
    const speed = this.sprintKeyPressed ? this.sprintSpeed : this.walkSpeed;
    this.player.translateX(this.horizontalAxis * speed * delta);
    this.player.translateY(this.verticalAxis * speed * delta);
}

function playerLook(delta) {
    // Rotate the player left and right
    this.player.rotation.z += -this.mouse.x * delta * this.sensitivity.x;

    // Rotate the camera up and down
    this.player.children[0].rotation.x -= this.mouse.y * delta * this.sensitivity.y;
}

function playerClamp() {
    // Clamp the up and down camera movement
    if (this.camera.rotation.x < MathUtils.degToRad(this.lookLimit.down)) {
        this.camera.rotation.x = MathUtils.degToRad(this.lookLimit.down);
    } else if (this.camera.rotation.x > MathUtils.degToRad(this.lookLimit.up)) {
        this.camera.rotation.x = MathUtils.degToRad(this.lookLimit.up);
    }
}

export { playerClamp, playerLook, playerMove }