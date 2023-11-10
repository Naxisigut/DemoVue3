export function transform(root, option = {}){
  const context = createContext(root, option)
  transferNode(root, context)

  createCodeGenNode(root)
}

function createCodeGenNode(root: any) {
  root.codeGenNode = root.children[0]
}

function createContext(root: any, option: any) {
  return {
    root, 
    NodeTransformers: option.NodeTransformers || [],
    codeGenNode: root.children[0]
  }
}

function transferNode(node, context){
  // console.log('node', node);
  const {
    NodeTransformers
  } = context
  for (let i = 0, len = NodeTransformers.length; i < len; i++) {
    const plugin = context.NodeTransformers[i];
    plugin(node)
  }

  const children = node.children
  if(children){
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      transferNode(node, context)
    }
  }
}
