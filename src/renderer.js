import {PerspectiveCamera, WebGLRenderer, Scene, PMREMGenerator, LinearSRGBColorSpace} from 'three';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader.js";
import hdriUrl from "../assets/industrial_sunset_02_puresky_2k.hdr";

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

    elapsedTime = 0;

    /**
     * @param {string} rootSelector
     * @param {Scene} scene
     */
    constructor(rootSelector, scene) {
        this.renderer = new WebGLRenderer({
            canvas: document.querySelector(rootSelector),
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        this.renderer.outputColorSpace = LinearSRGBColorSpace;
        this.camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.updateActions = [];
        this.scene = scene;
    }

    init() {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.handleResize();
        this.elapsedTime = performance.now();
        this.renderer.setAnimationLoop(this.update.bind(this));

        const hdriLoader = new RGBELoader();
        const pmremGenerator = new PMREMGenerator(this.renderer);
        hdriLoader.load(hdriUrl, (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            texture.dispose();
            this.scene.background = envMap;
            this.scene.backgroundIntensity = 0.8;
            this.scene.environment = envMap;
            this.scene.environmentIntensity = 0.8;
        });
    }

    /**
     * @param {float} dt
     */
    update() {
        const currentTime = performance.now();
        const delta = (currentTime - this.elapsedTime) / 1000;
        this.elapsedTime = currentTime;
        for (const {action} of this.updateActions) {
            action(delta);
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