import './style.css';

import Renderer from "./renderer.js";
import {Scene, AmbientLight, DirectionalLight} from "three";
import MarchingCubesMesh from "./marchingCubesMesh.js";
import Player from "./player.js";

const scene = new Scene();
const renderer = new Renderer("#root", scene);
const player = new Player();
scene.add(player);
player.position.set(0, 180, 0);
player.setCameraToFollow(renderer.camera);
renderer.addUpdateAction('move player', player.update.bind(player));

const ambient = new AmbientLight(0xffffff, 0.1);
const directionalLight = new DirectionalLight(0xffffff);

scene.add(new MarchingCubesMesh());
scene.add(ambient);
scene.add(directionalLight);

renderer.init();
