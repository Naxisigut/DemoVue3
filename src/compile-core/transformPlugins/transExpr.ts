import { NodeTypes } from "../ast";

export function transExpr(node){
  if(node.type === NodeTypes.INTERPOLATION){
    processExpr(node.content)
  }
}

function processExpr(node: any) {
  node.content = `_ctx.${node.content}`
}
