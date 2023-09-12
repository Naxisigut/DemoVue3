import { createAppApi } from '../runtime-core/index';

function createElement(){
  
}


function patchProp(){

}


function insert(){

}

const option = {
  createElement,
  patchProp,
  insert
}

export * from "../runtime-core/index"
export const createApp = createAppApi(option)