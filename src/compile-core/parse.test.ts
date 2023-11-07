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
})