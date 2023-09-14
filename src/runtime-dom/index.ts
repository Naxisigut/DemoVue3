import { createRenderer } from '../runtime-core/index';
import { isOn } from '../shared/index';

function createElement(type){
  return document.createElement(type)
}

function patchProp(key, val, el){
  if(isOn(key)){
    const e = key.slice(2).toLowerCase()
    el.addEventListener(e, val)
  }else{
    el.setAttribute(key, val)
  }
}

function insert(el, container){
  container.appendChild(el)
}

const option = {
  createElement,
  patchProp,
  insert
}

const renderer: any = createRenderer(option)
export function createApp(...args){
  return renderer.createApp(...args)
}

export * from "../runtime-core/index"
