import { expect, describe, it, vi } from 'vitest';
import { effect, stop } from './effect';
import { isReadonly, readonly } from './reactive';

describe('readonly', () => {
  it('happy path', () => {
    const target = { foo: 1 }
    const proxy = readonly(target)
    expect(proxy).not.toBe(target)
    expect(proxy.foo).toBe(1)

    // cannot be set
    proxy.foo = 2
    expect(proxy.foo).toBe(1)
  })
  
  it('isReadonly', () => {
    const target = { foo: 1 }
    const proxy = readonly(target)
    expect(isReadonly(target)).toBe(false)
    expect(isReadonly(proxy)).toBe(true)
  })
})