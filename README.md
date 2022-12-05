# charactercontroller

A first person character controller for the Three.js graphics library

![GitHub Lint Workflow Status](https://img.shields.io/github/workflow/status/ma1ted/charactercontroller/CI?label=Lint)
![GitHub Publish Workflow Status](https://img.shields.io/github/workflow/status/ma1ted/charactercontroller/Publish?label=Publish)

![npm bundle size](https://img.shields.io/bundlephobia/minzip/charactercontroller)
![npm](https://img.shields.io/npm/v/charactercontroller)
![NPM](https://img.shields.io/npm/l/charactercontroller)

## [Demo](https://controller.malted.dev)

## Installation

`npm install charactercontroller`

## Usage

```javascript
import CharacterController from "charactercontroller";

// Scene & renderer initialisation...

const controller = new CharacterController(scene, options);

function animate() {
	requestAnimationFrame(animate);
	// ...
	controller.update();
	renderer.render(scene, controller.camera);
}
```

- `scene`
	> An instance of `THREE.Scene` that the Character Controller is to become a child of.

- `options`
	> An object defining options for the Character Controller. The valid fields are described below

## Constructor Options

- `walkSpeed`
	> The rate at which the controller is translated in the scene in response to player inputs, when the sprint key (left shift) **is not** being pressed.
	- Default: `5`

- `sprintSpeed`
	> The rate at which the controller is translated in the scene in response to player inputs, when the sprint key (left shift) **is** being pressed.
  - Default: `10`

- `floorDistance`
	> How far above a surface the controller can get before stopping falling.
	> 
	> Could be interpreted as the height of the player.
	- Default: `1`

- `gravity`
	> How quickly the controller is pulled down when there is no surface beneath it.
	- Default: `-9.81`

- `jumpPower`
	> With how much force the controller is projected upwards when a jump is initiated.
	- Default: `5`

- `sensitivity`
	- `x`

		> How much the camera should move in response to the player moving the mouse left and right.
		- Default: `0.1`
	- `y`
		> How much the camera should move in response to the player moving the mouse up and down.
    	- Default: `0.1`
- `lookLimit`
	- `down`
	
		> The angle in degrees that the camera's `x` rotation should be clamped to when looking down
		- Default: `0`
	- `up`
	
		> The angle in degrees that the camera's `x` rotation should be clamped to when looking up
  		- Default: `180`
 
- `cameraFov`
	> The field of view of the camera attatched to the character controller.
	- Default: `75`

- `inputMappings`
	> The `KeyboardEvent.code`s that control the character controller. An array of `code`s are used to support multiple keys controlling the same actions; primarily for accessability reasons.

	- `scalar`
 
		> **Note**
		> 
    	> The scalar property defines axes that can take on any value within a range. There are two axes that control the planar movement of the character controller; horizontal and vertical, named `horizontalAxis` and `verticalAxis` respectively. These both take an array of input maps as values.
    	> The format of the input maps required in arrays on scalar axes is as follows;
    	> 
    	> `{ inputs: KeyboardEvent.code[], value: number }`
    	> 
    	> Where `value` is 	the magnitude of the axis when a key in `inputs` is being pressed.

		+ `horizontalAxis`
			- Default:
    			```js
    			{ inputs: ["KeyA", "ArrowLeft"], value: -1 },
				{ inputs: ["KeyD", "ArrowRight"], value: 1 },
				```
    	+ `verticalAxis`
    		- Default: 
				```js
 				{ inputs: ["KeyS", "ArrowDown"], value: -1 },
				{ inputs: ["KeyW", "ArrowUp"], value: 1 },
				```
	- `discrete`

		> **Note**
		>
		> The discrete property defines single-fire actions that occur at a specific point in time. These inputs differ from the ones defined under `scalar` as they describe events that happen once at a time, rather than continuously over time. The format of input maps required here is simply an array of `KeyboardEvent.code`s.
    	+ `jump`
      		- Default: `["Space"]`
    	+ `sprint`
      		- Default: `["ShiftLeft", "ShiftRight"]`,
	<br />
	
	> **Note**
	>
	> The default `inputMappings` object is shown below;
	```js
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
	```
