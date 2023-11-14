import { expect, describe, it, vi } from 'vitest';
import { baseParse } from './parse';
import { generate } from './codegen';
import { transform } from './transform';
import { transExpr } from './transformPlugins/transExpr';

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
  
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    debugger
    transform(ast, {
      NodeTransformers: [ transExpr ]
    })
    const { code } = generate(ast)
  
    expect(code).toMatchSnapshot()
  })
})