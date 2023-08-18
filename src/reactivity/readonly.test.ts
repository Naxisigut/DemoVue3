import { expect, describe, it, vi } from 'vitest';
import { isReadonly, readonly, shallowReadonly } from './reactive';

describe('readonly', () => {
  it('happy path', () => {
    const target = { foo: 1 }
    const proxy = readonly(target)
    expect(proxy).not.toBe(target)
    expect(proxy.foo).toBe(1)

    // cannot be set
    console.warn = vi.fn()
    proxy.foo = 2
    expect(proxy.foo).toBe(1)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
  
  it('isReadonly', () => {
    const target = { foo: 1 }
    const proxy = readonly(target)
    expect(isReadonly(target)).toBe(false)
    expect(isReadonly(proxy)).toBe(true)
  })

  it('deep readonly', () => {
    const target = { 
      nested: { foo: 1 },
      arr: [ { foo: 2 } ]
    }
    const proxy = readonly(target)
    expect(isReadonly(proxy.nested)).toBe(true)
    expect(isReadonly(proxy.arr)).toBe(true)
    expect(isReadonly(proxy.arr[0])).toBe(true)
    // expect(proxy.nested === proxy.nested).toBe(true)
  })
})


describe('shallowReadonly', () => {
  it('happy path', () => {
    const target = { foo: 1 }
    const proxy = shallowReadonly(target)
    expect(proxy).not.toBe(target)
    expect(proxy.foo).toBe(1)

    // cannot be set
    console.warn = vi.fn()
    proxy.foo = 2
    expect(proxy.foo).toBe(1)
    expect(console.warn).toHaveBeenCalledTimes(1)
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