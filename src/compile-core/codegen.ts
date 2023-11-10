export function generate(ast){
  const ctx = createCodeGenCtx()
  const { push } = ctx // 闭包
  push('return ')
  
  const functionName = 'render'
  push(`function ${functionName}`)
  
  const args = ['_ctx', '_cache'] 
  const signature = args.join(', ')
  push(`(${signature})`)
  
  const { codeGenNode } = ast
  push(`{return '${codeGenNode.content}'}`)
  // `return function render(_ctx, _cache, $props, $setup, $data, $options) {
  //   with (_ctx) {
  //     return "hi11"
  //   }
  // }`

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
