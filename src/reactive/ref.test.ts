import { expect, describe, it } from 'vitest';
import { effect } from './effect';
import { ref } from './ref';

describe('ref', () => {
  it('ref get', ()=>{
    const target = 0
    const proxy = ref(target)
    expect(proxy.value).toBe(0)
  })
  
  it('ref set', () => {
    const target = 0
    const proxy = ref(target)
    proxy.value = 1

    expect(target).toBe(1)
    expect(proxy.value).toBe(1)
  })
  
  it('ref should be reactive', () => {
    const target = 1
    const proxy = ref(target)

    let foo
    let count = 0
    effect(()=>{
      count++
      foo = proxy.target
    })
    // effect should be triggered
    expect(count).toBe(1)
    expect(foo).toBe(0)

    // effect should be triggered when target change
    proxy.value = 1
    expect(count).toBe(2)
    expect(foo).toBe(2)
    
    // same value should not trigger effect
    proxy.value = 1
    expect(count).toBe(2)
  })
  

 
})
