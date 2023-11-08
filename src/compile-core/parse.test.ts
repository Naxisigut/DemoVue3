import { expect, describe, it, vi } from 'vitest';
import { baseParse } from './parse';
import { NodeTypes } from './ast';

describe('baseParse', () => {
  it('simple interpolation',() => {
    const ast = baseParse('{{message}}')
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'message'
      }
    })
  })

  it('interpolation trim',()=>{
    const ast = baseParse('{{ message }}')
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content:{
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'message'
      }
    })
  })

  it('simple element',()=>{
    const ast = baseParse('<div></div>')
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div'
    })
  })

  it('simple text',()=>{
    const ast = baseParse('simple text')
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: 'simple text'
    })
  })
})