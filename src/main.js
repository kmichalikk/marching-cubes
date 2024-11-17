import './style.css';

import Renderer from "./renderer.js";
import {BoxGeometry, Mesh, MeshBasicMaterial, Scene} from "three";

const scene = new Scene();
const renderer = new Renderer("#root", scene);

const boxGeometry = new BoxGeometry(1, 1, 1);
const boxMaterial = new MeshBasicMaterial({color: 0xff0000});
const mesh = new Mesh(boxGeometry, boxMaterial);
scene.add(mesh);

renderer.init();
