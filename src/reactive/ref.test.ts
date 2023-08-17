import { expect, describe, it } from 'vitest';
import { effect } from './effect';
import { ref } from './ref';

describe('ref', () => {
  it('ref happy path', ()=>{
    const proxy = ref(0)
    expect(proxy.value).toBe(0)
    proxy.value = 1
    expect(proxy.value).toBe(1)
  })
  
  it('ref deps and effects', () => {
    const proxy = ref(0)

    let foo
    let count = 0
    effect(()=>{
      count++
      foo = proxy.value
    })
    // runner should be called when effect called
    expect(count).toBe(1)
    expect(foo).toBe(0)

    // effect should be triggered when target change
    proxy.value = 1
    expect(count).toBe(2)
    expect(foo).toBe(1)
    
    // same value should not trigger effect
    proxy.value = 1
    expect(count).toBe(2)
  })

  it('ref value is nested', () => {
    const foo = ref({
      count: 1
    })

    let dummy
    effect(() => {
      dummy = foo.value.count
    })
    expect(dummy).toBe(1)

    foo.value.count = 2
    expect(dummy).toBe(2)
  })
})
