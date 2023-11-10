import { expect, describe, it, vi } from 'vitest';
import { transform } from './transform';
import { baseParse } from './parse';
import { NodeTypes } from './ast';
import { generate } from './codegen';

describe('transform', () => {

  it('happy path', () => {
    const ast = baseParse('<div>hi, {{message}}</div>')
    const textPlugin = (node) => {
      if(node.type === NodeTypes.TEXT){
        node.content = 'hi, mini-vue'
      }
      return node
    }
    transform(ast, {
      NodeTransformers: [textPlugin]
    })
  
    const nodeText = ast.children[0].children[0]
    expect(nodeText.content).toBe('hi, mini-vue')
  })
})