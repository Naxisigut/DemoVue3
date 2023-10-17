import { createRenderer } from '../runtime-core/index';
import { isOn } from '../shared/index';

function createElement(type){
  return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal){
  
  if(isOn(key)){
    const e = key.slice(2).toLowerCase()
    el.addEventListener(e, nextVal)
  }else{
    if(nextVal === undefined || nextVal === null){
      el.removeAttribute(key)
    }else{
      el.setAttribute(key, nextVal)
    }
  }
}

function insert(el, container){
  container.appendChild(el)
}

function remove(el){
  if(el.parentNode){
    el.parentNode.removeChild(el)
  }
}

function setElementText(el, text){
  // const newTextChild = document.createTextNode(text)
  // el.appendChild(newTextChild)
  el.textContent = text
}

const option = {
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
}

const renderer: any = createRenderer(option)
export function createApp(...args){
  return renderer.createApp(...args)
}

export * from "../runtime-core/index"
