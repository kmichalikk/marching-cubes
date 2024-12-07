import './style.css';

import Renderer from "./renderer.js";
import {BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector2} from "three";
import PointSampler from "./pointSampler.js";
import MarchingCubesGeometry from "./marchingCubesGeometry.js";

const scene = new Scene();
const renderer = new Renderer("#root", scene);

scene.add(new MarchingCubesGeometry());

renderer.init();
