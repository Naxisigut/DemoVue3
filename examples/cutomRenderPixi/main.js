import { createRenderer } from '../../lib/demo-vue3-esm.js';
import App from './App.js';

let app = new PIXI.Application({ width: 640, height: 360 });
document.body.appendChild(app.view);
const stage = app.stage

function createElement(type){
  if(type === 'rectangle'){
    const rectangle = new PIXI.Graphics()
    rectangle.beginFill(0x66CCFF);
    rectangle.drawRect(0, 0, 100, 100);
    rectangle.endFill();
    return rectangle
  }
}

function patchProp(key, val, el){
  el[key] = val
}

function insert(el, container){
  container.addChild(el)
}

const pixiRenderOption = {
  createElement, 
  patchProp,
  insert
}

const renderer = createRenderer(pixiRenderOption)
renderer.createApp(App).mount(stage)