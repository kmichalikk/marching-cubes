import {BoxGeometry, Mesh, MeshPhongMaterial, Object3D, Vector3} from "three";

export default class Player extends Object3D {
    rotation = 0;
    speed = 0.1;
    direction = new Vector3(0, 0, 1);
    rotateLeft = false;
    rotateRight = false;
    accelerate = false;

    constructor() {
        super();

        const geometry = new BoxGeometry(5, 5, 5);
        const material = new MeshPhongMaterial({color: 0xff3300});
        this.playerMesh = new Mesh(geometry, material);
        this.add(this.playerMesh);

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
        if (this.rotateLeft) {
            this.rotation += dt;
        }
        if (this.rotateRight) {
            this.rotation -= dt;
        }
        if (this.accelerate) {
            this.speed = Math.min(0.8, this.speed + dt);
        }

        this.direction.applyAxisAngle(new Vector3(0, 1, 0), this.rotation * dt);
        this.rotateY(this.rotation * dt);
        let move = this.direction.clone().multiplyScalar(this.speed);
        this.position.add(move);
        this.rotation -= this.rotation * dt;
        this.rotation -= this.rotation * dt;
        this.speed = Math.max(0.1, this.speed - dt/3);
    }

    setCameraToFollow(camera) {
        this.add(camera);
        camera.position.set(0, 50, -100);
        camera.lookAt(this.position);
    }
}