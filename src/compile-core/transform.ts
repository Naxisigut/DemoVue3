export function transform(root, option){
  const context = createContext(root, option)
  transferNode(root, context)
}

function createContext(root: any, option: any) {
  return {
    root, 
    NodeTransformers: option.NodeTransformers || []
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

