import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from './runtimeHelpers';

export function transform(root, option = {}){
  const ctx = createContext(root, option)
  tranverseNode(root, ctx)
  
  createCodeGenNode(root) // codegen入口节点
  createCodeGenHelpers(root, ctx)
}

function createCodeGenNode(root: any) {
  root.codeGenNode = root.children[0]
}
function createCodeGenHelpers(root: any, ctx) {
  root.helpers = [...ctx.helpers.keys()]
}

function createContext(root: any, option: any) {
  const ctx = {
    root, 
    NodeTransformers: option.NodeTransformers || [],
    helpers: new Map(),
    help(key){
      ctx.helpers.set(key, 1)
    }
  }

  return ctx
}

function tranverseNode(node, ctx){
  // console.log('node', node);
  const {
    NodeTransformers,
    help
  } = ctx
  for (let i = 0, len = NodeTransformers.length; i < len; i++) {
    const plugin = ctx.NodeTransformers[i];
    plugin(node, ctx)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      help(TO_DISPLAY_STRING) // 添加入ctx.helpers内
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      tranverseChildren(node, ctx)
      break;
    default:
  }

}

function tranverseChildren(node, ctx){
  const children = node.children
  if(children){ // interpolation 没有children字段
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      tranverseNode(node, ctx)
    }
  }
}

