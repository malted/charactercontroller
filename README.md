# charactercontroller
A first person character controller for the Three.js graphics library

![npm bundle size](https://img.shields.io/bundlephobia/minzip/charactercontroller)
![npm](https://img.shields.io/npm/v/charactercontroller)
![NPM](https://img.shields.io/npm/l/charactercontroller)

## Installation
`npm install charactercontroller`

## Usage
```javascript
new CharacterController(scene, options);
```
* `scene`
  + An instance of `THREE.Scene` that the Character Controller is to become a child of.

* `options`
  + An object defining options for the Character Controller. The valid fields are described below

## Constructor Options
* `speed`
  + The rate at which the controller is translated in the scene in response to player inputs.
  + Can be interpreted as the speed at which the controller walks.
  + Default: `5`
* `floorDistance`
  + How far above a surface the controller can get before stopping falling.
  + Could be interpreted as the height of the player.
  + Default: `1`
* `gravity`
  + How quickly the controller is pulled down when there is no surface beneath it.
  + Default: `9.8`
* `jumpPower`
  + With how much force the controller is projected upwards when a jump is initiated.
  + Default: `8`
* `jumpDuration`
  + How long the player stays in the air during a jump.
  + Internally this is in frames, however it is recommended that this should be treated as an arbitary unit due to the variable and unpredictable nature of the length of time of an animation frame.
  + Default: `120`
* `sensitivity`
  + `x`
    - How much the camera should move in response to the player moving the mouse left and right.
    - Default: `0.1`
  + `y`
    - How much the camera should move in response to the player moving the mouse up and down.
    - Default: `0.1`
* `lookLimit`
  + `down`
    - The angle in degrees that the camera's `x` rotation should be clamped to when looking down
    - Default: `0`
  + `up`
    - The angle in degrees that the camera's `x` rotation should be clamped to when looking up
    - Default: `180`
* `cameraFov`
  + The field of view of the camera attatched to the character controller.
  + Default: `75`
