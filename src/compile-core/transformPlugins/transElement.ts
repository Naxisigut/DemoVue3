import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transElement(node, ctx){
  if(node.type === NodeTypes.ELEMENT){
    const { help } = ctx
    help(CREATE_ELEMENT_VNODE)
  }
}
