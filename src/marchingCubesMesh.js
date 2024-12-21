import * as THREE from "three";
import PointSampler from "./pointSampler.js";
import {getWeights, lookupIndices, lookupTriangulation} from "./lookup.js";
import {Vector3} from "three";

export default class MarchingCubesMesh extends THREE.Mesh {
    constructor(scale = 2) {
        super();

        // [starting height, r, g, b]
        this.colormap = [
            [0, 0.84, 0.92, 0.45],
            [50, 0.84, 0.92, 0.45],
            [60, 0.46, 0.98, 0.27],
            [100, 0.44, 0.72, 0.3],
            [140, 0.74, 0.74, 0.74],
            [180, 0.66, 0.66, 0.72],
            [999, 0.66, 0.66, 0.72],
        ];

        const halfSize = 100;
        const pointSampler = new PointSampler();
        const matrix = pointSampler.samplePerlinNoise3DPoints(new THREE.Vector2(-halfSize, -halfSize), new THREE.Vector2(halfSize, halfSize));
        const vertices = [];
        const colors = [];
        for (let i = 0; i < matrix.length-1; i++) {
            for (let j = 0; j < matrix[i].length-1; j++) {
                for (let k = 0; k < matrix[i][j].length-1; k++) {
                    let flag = 0;
                    if (matrix[i][j][k] * matrix[i+1][j][k] < 0) { flag |= 1 }
                    if (matrix[i+1][j][k] * matrix[i+1][j+1][k] < 0) { flag |= 2 }
                    if (matrix[i+1][j+1][k] * matrix[i][j+1][k] < 0) { flag |= 4 }
                    if (matrix[i][j+1][k] * matrix[i][j][k] < 0) { flag |= 8 }
                    if (matrix[i][j][k+1] * matrix[i+1][j][k+1] < 0) { flag |= 16 }
                    if (matrix[i+1][j][k+1] * matrix[i+1][j+1][k+1] < 0) { flag |= 32 }
                    if (matrix[i+1][j+1][k+1] * matrix[i][j+1][k+1] < 0) { flag |= 64 }
                    if (matrix[i][j+1][k+1] * matrix[i][j][k+1] < 0) { flag |= 128 }
                    if (matrix[i][j][k] * matrix[i][j][k+1] < 0) { flag |= 256 }
                    if (matrix[i+1][j][k] * matrix[i+1][j][k+1] < 0) { flag |= 512 }
                    if (matrix[i+1][j+1][k] * matrix[i+1][j+1][k+1] < 0) { flag |= 1024 }
                    if (matrix[i][j+1][k] * matrix[i][j+1][k+1] < 0) { flag |= 2048 }

                    for (const e of lookupTriangulation[flag]) {
                        if (e === -1) {
                            break;
                        }

                        const w = getWeights(matrix, i, j, k)[e];
                        let x = lookupIndices[e].x;
                        let y = lookupIndices[e].y;
                        let z = lookupIndices[e].z;

                        switch (true) {
                            case x === 0.5: x = w; break;
                            case y === 0.5: y = w; break;
                            case z === 0.5: z = w; break;
                        }

                        x = (i - halfSize + x) * scale;
                        y = k + y;
                        z = (j - halfSize + z) * scale;

                        vertices.push(x, y, z);
                    }
                }
            }
        }

        const up = new Vector3(0, 1, 0);
        for (let i = 0; i < vertices.length; i += 9) {
            const ab = new Vector3(vertices[i+3] - vertices[i], vertices[i+4] - vertices[i+1], vertices[i+5] - vertices[i+2]);
            const ac = new Vector3(vertices[i+6] - vertices[i], vertices[i+7] - vertices[i+1], vertices[i+8] - vertices[i+2]);
            let slope = 1 - Math.abs(ab.cross(ac).normalize().dot(up));

            const midHeight = Math.max(vertices[i+1], vertices[i+4], vertices[i+7]);

            const color = this.sampleColor(midHeight, slope);
            colors.push(
                ...color,
                ...color,
                ...color
            )
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.geometry.computeVertexNormals();
        this.material = new THREE.MeshPhongMaterial({vertexColors: true, side: THREE.DoubleSide});
    }

    sampleColor(height, slope) {
        // adjust height by slope (dot product between normal and up vector) with some linear function that looks good
        const adjustedHeight = height * (0.8 + slope);

        // find a threshold that current height fits in
        let i = 0;
        while (this.colormap[i+1][0] < adjustedHeight) {
            i++;
        }

        // interpolate between current and next color but use a power of t,
        // so the second color starts changing the results right before the next threshold
        const t = (adjustedHeight - this.colormap[i][0]) / (this.colormap[i+1][0] - this.colormap[i][0]);
        const t2 = Math.pow(t, 10);

        return [
            this.colormap[i][1] * (1-t2) + this.colormap[i+1][1] * t2,
            this.colormap[i][2] * (1-t2) + this.colormap[i+1][2] * t2,
            this.colormap[i][3] * (1-t2) + this.colormap[i+1][3] * t2,
        ];
    }
}