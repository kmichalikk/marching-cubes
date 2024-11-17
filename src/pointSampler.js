import {BufferAttribute, BufferGeometry, MeshBasicMaterial, Object3D, Points, PointsMaterial, Vector2} from "three";

export default class PointSampler extends Object3D {
    /**
     * @param {Vector2} boundingLowerLeft
     * @param {Vector2} boundingUpperRight
     */
    constructor(boundingLowerLeft, boundingUpperRight) {
        super();

        const points = this.sampleSine3DPoints(
            new Vector2(Math.round(boundingLowerLeft.x), Math.round(boundingLowerLeft.y)),
            new Vector2(Math.round(boundingUpperRight.x), Math.round(boundingUpperRight.y)),
        );

        this.add(points);
    }

    sampleSine3DPoints(lowerLeft, upperRight) {
        let vertices = [];
        for (let i = lowerLeft.y; i < upperRight.y; i++) {
            for (let j = lowerLeft.x; j < upperRight.x; j++) {
                vertices.push(i, Math.round(3 * Math.sin(i / 6) * Math.cos(j / 8) + Math.sin((i + j) / 4)), j);
            }
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        const material = new PointsMaterial({color: 0xff0000, size: 0.4});

        return new Points(geometry, material);
    }
}