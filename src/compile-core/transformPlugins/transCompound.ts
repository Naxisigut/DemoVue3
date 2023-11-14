import { NodeTypes } from "../ast";

export function transCompound(node, ctx){
  if(node.type === NodeTypes.ELEMENT){
    const children = node.children
    console.log(111, children);
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if(child.type === NodeTypes.TEXT){
        
      }
    }
  }
}
