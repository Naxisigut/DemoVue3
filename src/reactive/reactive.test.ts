import { expect, describe, it } from 'vitest';
import { isReactive, reactive } from './reactive';

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

  it('isReactive', () => {
    const target = { foo: 1 }
    const proxy = reactive(target)
    expect(isReactive(target)).toBe(false)
    expect(isReactive(proxy)).toBe(true)
  })
})
