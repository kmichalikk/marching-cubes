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

    /**
     * Perlin Noise implementation based on https://adrianb.io/2014/08/09/perlinnoise.html with modifications
     *
     * @returns {number[][][]}
     */
    samplePerlinNoise3DPoints(lowerLeft, upperRight) {
        const permutations = Array.from({length: 256}, (x, i) => i);
        this.fisherYates(permutations);
        permutations.push(...permutations)

        /**
         * Calculates fade function in [0, 1] as given by original paper. The function has second derivative = 0 at 0 and 1
         */
        const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)

        const grad = (hashValue, x, y, z) => {
            // only consider 4 least significant bits
            switch (hashValue & 0xf) {
                case 0x0: return  x + y;
                case 0x1: return -x + y;
                case 0x2: return  x - y;
                case 0x3: return -x - y;
                case 0x4: return  x + z;
                case 0x5: return -x + z;
                case 0x6: return  x - z;
                case 0x7: return -x - z;
                case 0x8: return  y + z;
                case 0x9: return -y + z;
                case 0xA: return  y - z;
                case 0xB: return -y - z;
                case 0xC: return  y + x;
                case 0xD: return -y + z;
                case 0xE: return  y - x;
                case 0xF: return -y - z;
                default: return 0; // never happens
            }
        }

        const lerp = (x1, x2, t) => {
            return x1 + (x2 - x1) * t;
        }

        const sample = (x, y, z) => {
            const xi = Math.floor(x) & 255;
            const yi = Math.floor(y) & 255;
            const zi = Math.floor(z) & 255;

            const xf = x - Math.floor(x)
            const yf = y - Math.floor(y)
            const zf = z - Math.floor(z)

            const u = fade(xf)
            const v = fade(yf)
            const w = fade(zf)

            /**
             * Calculate hash function for each vertex:
             *      aab ------ bab
             *     . |         .|
             *   .   |       .  |
             * abb ------ bbb   |
             *  |    |     |    |
             *  |   aaa ---|-- baa
             *  |  .       |   .
             *  |.         | .
             * aba ------ bba
             */
            const aaa = permutations[permutations[permutations[xi] + yi] + zi]
            const aba = permutations[permutations[permutations[xi] + yi + 1] + zi]
            const aab = permutations[permutations[permutations[xi] + yi] + zi + 1]
            const abb = permutations[permutations[permutations[xi] + yi+1] + zi + 1]
            const baa = permutations[permutations[permutations[xi + 1] + yi] + zi]
            const bba = permutations[permutations[permutations[xi + 1] + yi + 1] + zi]
            const bab = permutations[permutations[permutations[xi + 1] + yi] + zi + 1]
            const bbb = permutations[permutations[permutations[xi + 1] + yi + 1] + zi + 1]

            // lerp between values above in 3D space
            let x1 = lerp(grad(aaa, xf, yf, zf), grad(baa, xf-1, yf, zf), u);
            let x2 = lerp(grad(aba, xf, yf-1, zf), grad(bba, xf-1, yf-1, zf), u);
            let y1 = lerp(x1, x2, v);

            x1 = lerp(grad(aab, xf, yf, zf-1), grad(bab, xf-1, yf, zf-1), u);
            x2 = lerp(grad(abb, xf, yf-1, zf-1), grad(bbb, xf-1, yf-1, zf-1), u);
            let y2 = lerp(x1, x2, v);

            return (lerp(y1, y2, w)+1) / 2;
        }

        // perform sampling
        const width = upperRight.x - lowerLeft.x;
        const depth = upperRight.y - lowerLeft.y;
        const height = 300;
        const passes = [
            [0.011, 150, v => Math.pow(v+0.5, 3)/2],
            [0.027, 50, v => v],
            [0.057, 20, v => v],
        ];

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
                let h = 0;
                for (const [s, w, fn] of passes) {
                    h += fn(sample(j * s, i * s, 1)) * w;
                }
                for (let k = 0; k < height; k++) {
                    let distanceFromSurface = k - h;
                    if (distanceFromSurface < 0.0001) {
                        // avoid floating point errors later
                        distanceFromSurface += 0.0001;
                    }
                    matrix[i-lowerLeft.x][j-lowerLeft.y][k] = distanceFromSurface;
                }
            }
        }

        return matrix;
    }

    fisherYates(values) {
        let i = values.length - 1;
        let k, tmp;
        while (i > 1) {
            k = Math.floor(Math.random() * i);
            tmp = values[i];
            values[i] = values[k];
            values[k] = tmp;
            i--;
        }
    }
}