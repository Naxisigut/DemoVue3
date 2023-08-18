import { expect, describe, it } from 'vitest';
import { effect } from './effect';
import { reactive } from './reactive';
import { ref, isRef, unRef, proxyRefs } from './ref';

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


  it('isRef', ()=>{
    const foo = ref(0)
    const dummy = reactive({ a: 0})
    expect(isRef(foo)).toBe(true)
    expect(isRef(0)).toBe(false)
    expect(isRef(dummy)).toBe(false)
  })

  it('unRef', () => {
    const foo = ref(0)
    expect(unRef(foo)).toBe(0)
    expect(unRef(0)).toBe(0)
  })

  it('proxyRefs', () => {
    const foo = {
      a: ref(0),
      b: 'b'
    }
    
    // get
    const fooProxy = proxyRefs(foo)
    expect(foo.a.value).toBe(0)
    expect(fooProxy.a).toBe(0)
    expect(fooProxy.b).toBe('b')

    // set normal value to ref
    fooProxy.a = 1
    expect(fooProxy.a).toBe(1)
    expect(foo.a.value).toBe(1)

    // // set ref value to ref
    fooProxy.a = ref(2)
    expect(fooProxy.a).toBe(2)
    expect(foo.a.value).toBe(2)

    // set normal value to normal
    fooProxy.b = 'c'
    expect(fooProxy.b).toBe('c')

    // set ref value  to normal
    fooProxy.b = ref(3)
    expect(fooProxy.b).toBe(3)
    expect(foo.b.value).toBe(3)
  })
})
