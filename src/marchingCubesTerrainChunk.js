import {
    BufferAttribute,
    BufferGeometry,
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
} from "three";

import MarchingCubesWorker from "./marchingCubesWorker.js?worker"

export default class MarchingCubesTerrainChunk extends Mesh {
    terrainScale = 1;
    loaded = false;

    constructor(seed, position, halfSize, scale = 2) {
        super();
        this.terrainScale = scale;

        const water = new Mesh(
            new PlaneGeometry(800, 800),
            new MeshPhongMaterial({color: 0x108fc9, side: DoubleSide, opacity: 0.8, transparent: true})
        );
        water.rotation.set(-Math.PI/2, 0, 0);
        this.add(water);
        water.position.y = 65*this.terrainScale;

        const worker = new MarchingCubesWorker();

        worker.postMessage([seed, position, halfSize, scale]);
        worker.onmessage = (event) => {
            const [vertices, colors] = event.data;
            this.geometry = new BufferGeometry();
            this.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
            this.geometry.setAttribute('color', new BufferAttribute(colors, 3));
            this.geometry.computeVertexNormals();
            this.material = new MeshPhongMaterial({vertexColors: true, side: DoubleSide});
            this.loaded = true;
            worker.terminate();
        }
    }

    dispose() {
        if (this.loaded) {
            this.geometry.dispose();
            this.material.dispose();
        }

        this.removeFromParent();
    }
}