import { expect, describe, it } from 'vitest';
import { isReactive, reactive, isReadonly, readonly, isProxy } from './reactive';

describe('reactive', () => {
  it('reactive get', ()=>{
    const target = { a: 1 }
    const proxy = reactive(target)
    expect(proxy).not.toBe(target)
    expect(proxy.a).toBe(1)
  })
  
  it('reactive set', () => {
    const target = {a: 1}
    const proxy = reactive(target)
    target.a = 2
    expect(proxy.a).toBe(2)
  })

  it('deep reactive', () => {
    const target = { 
      nested: { foo: 1 },
      arr: [ { foo: 2 } ]
    }
    const proxy = reactive(target)
    expect(isReactive(proxy.nested)).toBe(true)
    expect(isReactive(proxy.arr)).toBe(true)
    expect(isReactive(proxy.arr[0])).toBe(true)
    // expect(proxy.nested === proxy.nested).toBe(true)
  })

  
  it('isReactive', () => {
    const target = { foo: 1 }
    const proxy = reactive(target)
    expect(isReactive(target)).toBe(false)
    expect(isReactive(proxy)).toBe(true)
  })

  it('isProxy', () => {
    const target = { foo: 1 }
    const proxy = reactive(target)
    const readonlyProxy = readonly(target)
    expect(isProxy(target)).toBe(false)
    expect(isProxy(proxy)).toBe(true)
    expect(isProxy(readonlyProxy)).toBe(true)
  })
})



