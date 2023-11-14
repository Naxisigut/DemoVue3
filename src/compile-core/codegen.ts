import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast){
  const ctx = createCodeGenCtx()
  const { push } = ctx // 闭包
  const { codeGenNode } = ast
  genFunctionPreamble(ast, ctx) // 生成引入
  genFunctionNameAndArgs(ast, ctx) // 生成函数名和参数
  push('return ')
  genCodeByNode(codeGenNode, ctx) // 生成主体代码
  push('\n}')

  return ctx
}

function createCodeGenCtx() {
  const ctx = {
    code: '',
    push(str){
      ctx.code += str
    }
  }
  return ctx
}

// 生成引入
function genFunctionPreamble(ast, ctx){
  const { push } = ctx
  const { helpers } = ast
  if(!helpers.length)return
  const vueBinding = 'Vue'
  const aliasHelper = (i: symbol) => `${i.description}: _${i.description}`
  push(`const { ${helpers.map(aliasHelper).join(', ')} } = ${vueBinding}`)
  push('\n')
}
// 生成函数名和参数
function genFunctionNameAndArgs(ast: any, ctx: { code: string; push(str: any): void }) {
  const { push } = ctx
  const functionName = 'render'
  const args = ['_ctx', '_cache'] 
  const signature = args.join(', ')
  push(`return function ${functionName}(${signature}){\n`)
}
// 生成函数代码 <-> genNode 
function genCodeByNode(node, ctx){
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, ctx)
      break;
    case NodeTypes.INTERPOLATION:
      genInterPolation(node, ctx)
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, ctx)
      break;
    case NodeTypes.ELEMENT:
      genElement(node, ctx)
      break;
      
      default:
        break;
      }
    }
    
function genText(node, ctx){
  const { push } = ctx
  push(`"${node.content}"`)
}

function genInterPolation(node: any, ctx: any) {
  const { push }  = ctx
  push(`_${TO_DISPLAY_STRING.description}(`)
  genCodeByNode(node.content, ctx)
  push(')')
}

function genExpression(node: any, ctx: any) {
  const { push } = ctx
  push(`${node.content}`)
}

function genElement(node, ctx){
  const { push } = ctx
  // push(`_${ CREATE_ELEMENT_VNODE.description }("${ node.tag }", null, "hi, " + _toDisplayString(_ctx.message))`)
  push(`_${ CREATE_ELEMENT_VNODE.description }("${ node.tag }", null, `)
  // for (let i = 0; i < node.children.length; i++) {
  //   const childNode = node.children[i];
  //   genCodeByNode(childNode, ctx)
  //   push(' + ')
  // }
}

