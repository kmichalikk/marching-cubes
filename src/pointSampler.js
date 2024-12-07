export default class PointSampler {
    /**
     * @returns {number[][][]}
     */
    sampleSine3DPoints(lowerLeft, upperRight) {
        const width = upperRight.x - lowerLeft.x;
        const depth = upperRight.y - lowerLeft.y;
        const height = 100;

        let matrix = [];
        for (let i = 0; i < width; i++) {
            let slice = [];
            for (let j = 0; j < depth; j++) {
                slice.push(new Array(height).fill(0));
            }
            matrix.push(slice);
        }

        for (let i = lowerLeft.y; i < upperRight.y; i++) {
            for (let j = lowerLeft.x; j < upperRight.x; j++) {
                const h = Math.round(3 * Math.sin(i / 6) * Math.cos(j / 8) + Math.sin((i + j) / 4)) + 40;
                for (let k = 0; k < h; k++) {
                    matrix[i-lowerLeft.x][j-lowerLeft.y][k] = 1
                }
            }
        }

        return matrix;
    }
}