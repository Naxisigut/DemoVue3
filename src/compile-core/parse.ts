import { NodeTypes } from "./ast"

export function baseParse(content: any){
  const context = createParseContext(content)
  return createRoot(parseChildren(context, []))
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

// 对应 parseTextData
function chop(context, length){
  const content = context.source.slice(0, length)
  advanceBy(context, length)
  return content
}

/* 实现逻辑略有不同 */
function isEnd(context, ancestorTags){
  const s = context.source

  // 倒序，因为正常情况下会匹配栈顶的tag
  for (let i = ancestorTags.length -1; i >= 0; i--) {
    // 这里使用toLowerCase 增加健壮性
    const endTag = `</${ancestorTags[i]}>`.toLowerCase();
    const sTag = s.slice(0, endTag.length).toLowerCase()
    if(endTag === sTag)return true
  }
  // if(openTag && s.startsWith(`</${openTag}>`))return true

  return s.length === 0
}

function parseChildren(context: any, ancestorTags: any) {
  debugger
  const nodes: any = []
  while(!isEnd(context, ancestorTags)){
    // debugger
    let node
    const s = context.source
    if(s.startsWith('{{')){
      node = parseInterpolation(context)
    }else if(s.startsWith('<')){
      // 首字符为<, 相邻字符为英文字母 => element
      if(/[a-z]/i.test(s[1])){
        node = parseElement(context, ancestorTags)
      }
    }
    if(!node){
      node = parseText(context)
    }
    nodes.push(node)
  }

  return nodes
}

function parseInterpolation(context: any) {
  const openDelimitter = "{{"
  const closeDelimitter = "}}"
  const closeIndex = context.source.indexOf(closeDelimitter, openDelimitter.length)
  advanceBy(context, openDelimitter.length) // 推进至 {{ 后
  const rawContentLength = closeIndex - openDelimitter.length
  const rawContent = chop(context, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, closeDelimitter.length) // 推进至 }} 后

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}


/* 实现逻辑略有不同 */
function parseElement(context: any, ancestorTags){
  const openTag = parseTag(context) // 开始标签
  ancestorTags.push(openTag)
  const children = parseChildren(context, ancestorTags)
  const closeTag = parseTag(context) // 结束标签
  if(closeTag === openTag){
    ancestorTags.pop()
  }else{
    throw new Error("lack end tag: " + openTag);
  }
  return {
    type: NodeTypes.ELEMENT,
    tag: openTag,
    children
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

function parseText(context: any) {
  let endIndex = context.source.length

  const endTokens = ['{{', '<']
  for (let i = 0; i < endTokens.length; i++) {
    const endToken = endTokens[i];
    const index = context.source.indexOf(endToken)
    if(index !== -1 && index < endIndex)endIndex = index
  }
  const content = chop(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

