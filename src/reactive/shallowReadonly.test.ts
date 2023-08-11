import { expect, describe, it, vi } from 'vitest';
import { effect, stop } from './effect';
import { isReadonly, readonly, shallowReadonly } from './reactive';

describe('shallowReadonly', () => {
  it('happy path', () => {
    const target = { foo: 1 }
    const proxy = shallowReadonly(target)
    expect(proxy).not.toBe(target)
    expect(proxy.foo).toBe(1)

    // cannot be set
    proxy.foo = 2
    expect(proxy.foo).toBe(1)
  })
  
  it('isReadonly', () => {
    const target = { foo: 1 }
    const proxy = shallowReadonly(target)
    expect(isReadonly(target)).toBe(false)
    expect(isReadonly(proxy)).toBe(true)
  })

  it('shallow readonly', () => {
    const target = { 
      nested: { foo: 1 },
      arr: [ { foo: 2 } ]
    }
    const proxy = shallowReadonly(target)
    expect(isReadonly(proxy.nested)).toBe(false)
    expect(isReadonly(proxy.arr)).toBe(false)
    expect(isReadonly(proxy.arr[0])).toBe(false)
    // expect(proxy.nested === proxy.nested).toBe(true)
  })
})