export function registerKeyEvents() {
	document.addEventListener("keydown", (e) => {
		this.keysDown[e.code] = true;
	});
	document.addEventListener("keyup", (e) => {
		this.keysDown[e.code] = false;
	});
}

export function registerMouseMoveEvent() {
	window.addEventListener("mousemove", (e) => {
		clearTimeout(this.cancelDriftTimeout);
		this.mouse.x = e.movementX;
		this.mouse.y = e.movementY;
		this.cancelDriftTimeout = setTimeout(() => {
			this.mouse.x = this.mouse.y = 0;
		}, 10);
	});
}

export function checkInputs(inputMappings, keysDown) {
	const inputs = {};

	// Check scalar values
	Object.entries(inputMappings.scalar).forEach(([axisName, axis]) => {
		axis.forEach((axisInput) => {
			inputs[axisName] = 0;
			if (axisInput.inputs.some((input) => keysDown.includes(input))) {
				inputs[axisName] += axisInput.value;
			}
		});
	});

	// Check discrete values
	Object.entries(inputMappings.discrete).forEach(([inputName, inputEvent]) => {
		inputEvent.forEach((axisInput) => {
			if (axisInput.inputs.some((inputCode) => keysDown.includes(inputCode))) {
				inputs[inputName] = true;
			} else {
				inputs[inputName] = false;
			}
		});
	});

	return inputs;
}
