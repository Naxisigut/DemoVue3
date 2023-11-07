import { NodeTypes } from "./ast"

export function baseParse(content: any){
  const context = createParseContext(content)
  return createRoot(parseChildren(context))
}

function createParseContext(content: any) {
  return {
    source: content
  }
}

function createRoot(children: any) {
  return {
    children
  }
}

function parseChildren(context: any) {
  const nodes: any = []
  const node = parseInterpolation(context)
  nodes.push(node)
  return nodes
}

function parseInterpolation(context: any) {
  const openDelimitter = "{{"
  const closeDelimitter = "}}"
  const closeIndex = context.source.indexOf(closeDelimitter, openDelimitter.length)
  advanceBy(context, openDelimitter.length) // 推进至 {{ 后
  const rawContentLength = closeIndex - openDelimitter.length
  const content = context.source.slice(0, rawContentLength).trim()
  advanceBy(context, rawContentLength + closeDelimitter.length) // 推进至 }} 后

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}

function advanceBy(context, index){
  context.source = context.source.slice(index)
}

