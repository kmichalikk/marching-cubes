import {Object3D, Vector3, Mesh, PerspectiveCamera} from "three";
import MarchingCubesMesh from "./marchingCubesMesh.js";
import {PerlinSeed} from "./pointSampler.js";

export default class Terrain extends Object3D {
    /** @type {{string: Mesh}} */
    loaded = {};

    /** @type {PerspectiveCamera} */
    camera = null;

    /** @type {PerlinSeed} */
    seed;

    constructor() {
        super();

        this.seed = new PerlinSeed();
    }

    update(dt) {
        this.updateChunks();
    }

    setCamera(camera) {
        this.camera = camera;
    }

    updateChunks() {
        if (this.camera == null) {
            return;
        }

        let cameraPosition = new Vector3();
        this.camera.getWorldPosition(cameraPosition);

        let dir = new Vector3();
        this.camera.getWorldDirection(dir);

        let directions = []
        const up = new Vector3(0, 1, 0);
        for (let i = 0; i < 10; i++) {
            let rayDir = new Vector3(dir.x, 0, dir.z).normalize();
            rayDir.applyAxisAngle(up, -Math.PI/4 + i * Math.PI/20);
            directions.push(rayDir);
        }

        let visibleChunks = {};
        for (const rayDir of directions) {
            for (const len of [-400, 100, 400, 800, 1200]) {
                const pos = new Vector3(cameraPosition.x, 0, cameraPosition.z).add(rayDir.clone().multiplyScalar(len));

                const chunkX = parseInt(500 * Math.sign(pos.x) * Math.round(Math.abs(pos.x) / 500));
                const chunkZ = parseInt(500 * Math.sign(pos.z) * Math.round(Math.abs(pos.z) / 500));
                visibleChunks[`${chunkX},${chunkZ}`] = true;
            }
        }

        for (const ch in this.loaded) {
            if (!visibleChunks.hasOwnProperty(ch)) {
                console.log('disposing', ch);
                this.loaded[ch].dispose();
                delete this.loaded[ch];
            }
        }

        for (const ch in visibleChunks) {
            if (this.loaded.hasOwnProperty(ch)) {
                continue;
            }

            const [x, z] = ch.split(",");
            const position = new Vector3(parseInt(x), 0, parseInt(z));
            this.loaded[ch] = new MarchingCubesMesh(this.seed, position, 250, 5);
            this.loaded[ch].position.copy(position);
            console.log('loading', ch);
            this.add(this.loaded[ch]);
        }
    }
}