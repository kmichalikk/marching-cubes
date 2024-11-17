import './style.css';

import Renderer from "./renderer.js";
import {BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector2} from "three";
import PointSampler from "./pointSampler.js";

const scene = new Scene();
const renderer = new Renderer("#root", scene);

const points = new PointSampler(new Vector2(-20, -20), new Vector2(20, 20));
scene.add(points);

renderer.init();
