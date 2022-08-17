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

export function checkInputs() {
	// Check scalar values
	Object.entries(this.inputMappings.scalar).forEach(([axisName, axisInfo]) => {
		this.inputs[axisName] = 0;
		axisInfo.forEach((axisInput) => {
			if (axisInput.inputs.some((code) => this.keysDown[code])) {
				this.inputs[axisName] += axisInput.value;
			}
		});
	});

	// Check discrete values
	Object.entries(this.inputMappings.discrete).forEach(([eventName, eventCodes]) => {
		this.inputs[eventName] = eventCodes.some((code) => this.keysDown[code]);
	});
}
