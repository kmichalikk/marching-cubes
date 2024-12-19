import * as THREE from "three";
import PointSampler from "./pointSampler.js";
import {lookupIndices, lookupTriangulation} from "./lookup.js";

export default class MarchingCubesMesh extends THREE.Mesh {
    constructor() {
        super();

        const halfSize = 100;
        const pointSampler = new PointSampler();
        const matrix = pointSampler.samplePerlinNoise3DPoints(new THREE.Vector2(-halfSize, -halfSize), new THREE.Vector2(halfSize, halfSize));
        const vertices = [];
        const colors = [];
        for (let i = 0; i < matrix.length-1; i++) {
            for (let j = 0; j < matrix[i].length-1; j++) {
                for (let k = 0; k < matrix[i][j].length-1; k++) {
                    let flag = 0;
                    if (matrix[i][j][k] !== matrix[i+1][j][k]) { flag |= 1 }
                    if (matrix[i+1][j][k] !== matrix[i+1][j+1][k]) { flag |= 2 }
                    if (matrix[i+1][j+1][k] !== matrix[i][j+1][k]) { flag |= 4 }
                    if (matrix[i][j+1][k] !== matrix[i][j][k]) { flag |= 8 }
                    if (matrix[i][j][k+1] !== matrix[i+1][j][k+1]) { flag |= 16 }
                    if (matrix[i+1][j][k+1] !== matrix[i+1][j+1][k+1]) { flag |= 32 }
                    if (matrix[i+1][j+1][k+1] !== matrix[i][j+1][k+1]) { flag |= 64 }
                    if (matrix[i][j+1][k+1] !== matrix[i][j][k+1]) { flag |= 128 }
                    if (matrix[i][j][k] !== matrix[i][j][k+1]) { flag |= 256 }
                    if (matrix[i+1][j][k] !== matrix[i+1][j][k+1]) { flag |= 512 }
                    if (matrix[i+1][j+1][k] !== matrix[i+1][j+1][k+1]) { flag |= 1024 }
                    if (matrix[i][j+1][k] !== matrix[i][j+1][k+1]) { flag |= 2048 }

                    for (const e of lookupTriangulation[flag]) {
                        if (e === -1) {
                            break;
                        }

                        const x = (i - halfSize + lookupIndices[e].x) * 0.5;
                        const y = (k - halfSize + lookupIndices[e].y) * 0.5;
                        const z = (j - halfSize + lookupIndices[e].z) * 0.5;

                        let color = [0.45, 0.76, 0.17];
                        if (y > 12) {
                            color = [0.89, 0.85, 0.82];
                        } else if (y > 5) {
                            color = [0.59, 0.43, 0.44];
                        } else if (y > 0) {
                            color = [0.54, 0.44, 0.4];
                        } else if (y > -5) {
                            color = [0.42, 0.4, 0.28];
                        } else if (y > -15) {
                            color = [0.42, 0.57, 0.16];
                        }

                        vertices.push(x, y, z);
                        colors.push(...color);
                    }
                }
            }
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.geometry.computeVertexNormals();
        this.material = new THREE.MeshPhongMaterial({vertexColors: true, side: THREE.DoubleSide});
    }
}