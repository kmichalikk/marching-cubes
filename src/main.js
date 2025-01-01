import './style.css';

import Renderer from "./renderer.js";
import {Scene, AmbientLight, DirectionalLight} from "three";
import Player from "./player.js";
import Terrain from "./terrain.js";

const scene = new Scene();
const renderer = new Renderer("#root", scene);
const player = new Player();
scene.add(player);
player.position.set(0, 300, 0);
player.setCameraToFollow(renderer.camera);
renderer.addUpdateAction('move player', player.update.bind(player));

const ambient = new AmbientLight(0xffffff, 0.1);
const directionalLight = new DirectionalLight(0xffffff);

const terrain = new Terrain();
terrain.setCamera(renderer.camera);

scene.add(terrain);
scene.add(ambient);
scene.add(directionalLight);

renderer.addUpdateAction('update terrain', terrain.update.bind(terrain));

renderer.init();
