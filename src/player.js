import {BoxGeometry, Mesh, MeshPhongMaterial, Object3D, Vector3} from "three";

export default class Player extends Object3D {
    rotation = 0;
    move = new Vector3(0, 0, 0.2);
    rotateLeft = false;
    rotateRight = false;

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
            }
        })

        document.addEventListener("keyup", event => {
            if (event.key === "a") {
                this.rotateLeft = false;
            } else if (event.key === "d") {
                this.rotateRight = false;
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

        this.move.applyAxisAngle(new Vector3(0, 1, 0), this.rotation * dt);
        this.rotateY(this.rotation * dt);
        this.position.add(this.move);
        this.rotation -= this.rotation * dt;
        this.rotation -= this.rotation * dt;
    }

    setCameraToFollow(camera) {
        this.add(camera);
        camera.position.set(0, 50, -100);
        camera.lookAt(this.position);
    }
}