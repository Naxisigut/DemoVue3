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

function advanceBy(context, index){
  context.source = context.source.slice(index)
}

function parseChildren(context: any) {
  const nodes: any = []
  let node
  const s = context.source
  if(s.startsWith('{{')){
    node = parseInterpolation(context)
  }else if(s.startsWith('<')){
    // 首字符为<, 相邻字符为英文字母 => element
    if(/[a-z]/i.test(s[1])){
      node = parseElement(context)
    }
  }
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


function parseElement(context: any){
  const tag = parseTag(context)
  parseTag(context)
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseTag(context: any) {
  const reg = /^<\/?([a-z]+)/i
  const match: any = reg.exec(context.source)
  let tag = '' 
  tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)

  return tag
}

