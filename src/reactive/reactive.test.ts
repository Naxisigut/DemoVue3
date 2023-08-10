import { test, expect, describe, it } from 'vitest';
import { reactive } from './reactive';

describe('reactive', () => {
  test('reactive get', ()=>{
    const target = { a: 1 }
    const proxy = reactive(target)
    expect(proxy).not.toBe(target)
    expect(proxy.a).toBe(1)
  })
  
  test('reactive set', () => {
    const target = {a: 1}
    const proxy = reactive(target)
    target.a = 2
    expect(proxy.a).toBe(2)
  })
})
