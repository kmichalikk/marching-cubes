import {PerspectiveCamera, WebGLRenderer, Scene, Vector3} from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

/**
 * @typedef {{priority: int, action: function(float): void, name: string}} UpdateAction
 */

export default class Renderer {
    /** @type {WebGLRenderer} */
    renderer;

    /** @type {PerspectiveCamera} */
    camera;

    /** @type {Array<UpdateAction>} */
    updateActions;

    /** @type {Scene} */
    scene;

    /**
     * @param {string} rootSelector
     * @param {Scene} scene
     */
    constructor(rootSelector, scene) {
        this.renderer = new WebGLRenderer({
            canvas: document.querySelector(rootSelector),
            antialias: true,
        });
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.set(50, 80, 100)
        this.updateActions = [];
        this.scene = scene;
    }

    init() {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.handleResize();

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        orbitControls.target = new Vector3(0, 30, 0)
        this.addUpdateAction('orbit controls', () => orbitControls.update(), 1);

        this.renderer.setAnimationLoop(this.update.bind(this));
    }

    /**
     * @param {float} dt
     */
    update(dt) {
        for (const {action} of this.updateActions) {
            action(dt);
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * @param {string} name
     * @param {function(float): void} action
     * @param {number} priority
     */
    addUpdateAction(name, action, priority) {
        let start = 0;
        let end = this.updateActions.length;

        while (start < end) {
            let mid = Math.floor((start + end) / 2);
            if (priority > this.updateActions[mid].priority) {
                start = mid+1;
            } else {
                end = mid;
            }
        }

        this.updateActions.splice(start, 0, {priority, action, name});
    }

    handleResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}