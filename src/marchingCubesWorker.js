import {PointSampler} from "./pointSampler.js";
import {Vector2, Vector3} from "three";
import {getWeights, lookupIndices, lookupTriangulation} from "./lookup.js";

const colormap = [
    [0, 0.84, 0.92, 0.45],
    [50, 0.84, 0.92, 0.45],
    [80, 0.46, 0.98, 0.27],
    [100, 0.44, 0.72, 0.3],
    [120, 0.74, 0.74, 0.74],
    [160, 0.66, 0.66, 0.72],
    [999, 0.66, 0.66, 0.72],
];

function sampleColor(height, slope, scale) {
    // adjust height by slope (dot product between normal and up vector)
    // with some linear function that looks good
    const adjustedHeight = height * (0.9 + slope) / scale;

    // find a threshold that current height fits in
    let i = 0;
    while (colormap[i+1][0] < adjustedHeight) {
        i++;
    }

    // interpolate between current and next color but use a power of t,
    // so the second color starts changing the results right before the next threshold
    const t = (adjustedHeight - colormap[i][0]) / (colormap[i+1][0] - colormap[i][0]);
    const t2 = Math.pow(t, 10);

    return [
        colormap[i][1] * (1-t2) + colormap[i+1][1] * t2,
        colormap[i][2] * (1-t2) + colormap[i+1][2] * t2,
        colormap[i][3] * (1-t2) + colormap[i+1][3] * t2,
    ];
}

onmessage = (event) => {
    const [seed, position, halfSize, scale] = event.data;

    const pointSampler = new PointSampler();
    const matrix = pointSampler.samplePerlinNoise3DPoints(
        new Vector2(position.x-halfSize, position.z-halfSize),
        new Vector2(position.x+halfSize, position.z+halfSize),
        scale,
        seed,
    );
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

                    x = (i * scale - halfSize + x * scale);
                    y = (k + y) * scale;
                    z = (j * scale - halfSize + z * scale);

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

        const color = sampleColor(midHeight, slope, scale);
        colors.push(
            ...color,
            ...color,
            ...color
        )
    }

    const verticesData = new Float32Array(vertices);
    const colorsData = new Float32Array(colors);

    postMessage([verticesData, colorsData], [verticesData.buffer, colorsData.buffer]);
}
