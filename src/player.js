import {AnimationMixer, BoxGeometry, Euler, Mesh, MeshPhongMaterial, Object3D, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

import planeModelUrl from "../assets/plane.glb";

export default class Player extends Object3D {
    rotation = 0;
    speed = 0.2;
    direction = new Vector3(0, 0, 1);
    rotateLeft = false;
    rotateRight = false;
    accelerate = false;

    plane = null;
    animationMixer = null;

    constructor() {
        super();

        const loader = new GLTFLoader();
        loader.load(planeModelUrl, (gltf) => {
            this.plane = gltf.scene;
            this.plane.scale.set(2, 2, 2);
            this.plane.rotateY(-Math.PI/2);
            this.add(this.plane);
            this.animationMixer = new AnimationMixer(this.plane);
            this.animationMixer.clipAction(gltf.animations[0]).play();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "a") {
                this.rotateLeft = true;
            } else if (event.key === "d") {
                this.rotateRight = true;
            } else if (event.key === "w") {
                this.accelerate = true;
            }
        })

        document.addEventListener("keyup", event => {
            if (event.key === "a") {
                this.rotateLeft = false;
            } else if (event.key === "d") {
                this.rotateRight = false;
            } else if (event.key === "w") {
                this.accelerate = false;
            }
        })
    }

    update(dt) {
        if (this.animationMixer != null) {
            this.animationMixer.timeScale = 1 + 3 * this.speed;
            this.animationMixer.update(dt);
        }

        if (this.rotateLeft) {
            this.rotation += dt;
        }
        if (this.rotateRight) {
            this.rotation -= dt;
        }
        if (this.accelerate) {
            this.speed = Math.min(0.8, this.speed + dt);
        }

        if (this.plane != null) {
            this.plane.rotation.set(0, -Math.PI/2 + this.rotation, -0.5 * this.rotation, 'ZXY');
        }

        this.direction.applyAxisAngle(new Vector3(0, 1, 0), this.rotation * dt);
        this.rotateY(this.rotation * dt);
        let move = this.direction.clone().multiplyScalar(this.speed);
        this.position.add(move);
        this.rotation -= this.rotation * dt;
        this.rotation -= this.rotation * dt;
        this.speed = Math.max(0.2, this.speed - dt/3);
    }

    setCameraToFollow(camera) {
        this.add(camera);
        camera.position.set(0, 50, -100);
        camera.lookAt(this.position);
    }
}