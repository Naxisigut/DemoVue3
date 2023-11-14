import { expect, describe, it, vi } from 'vitest';
import { baseParse } from './parse';
import { generate } from './codegen';
import { transform } from './transform';
import { transExpr } from './transformPlugins/transExpr';
import { transElement } from './transformPlugins/transElement';
import { transCompound } from './transformPlugins/transCompound';

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
  
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast, {
      NodeTransformers: [ transExpr ]
    })
    const { code } = generate(ast)
  
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast = baseParse('<div></div>')
    transform(ast, {
      NodeTransformers: [ transExpr, transElement  ]
    })
    const { code } = generate(ast)
  
    expect(code).toMatchSnapshot()
  })
  
  it.only('union', () => {
    const ast = baseParse('<div>hi, {{message}}</div>')
    transform(ast, {
      NodeTransformers: [ transExpr, transElement, transCompound ]
    })
    const { code } = generate(ast)
  
    expect(code).toMatchSnapshot()
    
  })
})