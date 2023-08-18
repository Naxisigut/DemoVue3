import { expect, describe, it, vi } from 'vitest';
import { computed } from './computed';
import { reactive } from './reactive';

describe('computed',() => {
  it('happy path', () => {
    const foo = reactive({ a: 0 })
    const dummy = computed(() => {
      return foo.a
    })
    expect(dummy.value).toBe(0)
  })

  it('computed lazy', () => {
    const foo = reactive({ a: 0 })
    const getter = vi.fn(()=>{
      return foo.a
    })
    const dummy = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled() // 不对dummy进行get，则不会触发getter
    expect(dummy.value).toBe(0) // 对dummy进行get
    expect(getter).toHaveBeenCalledTimes(1) // 此时getter被执行

    // will not compute when deps did not change
    console.log(dummy.value);
    expect(getter).toHaveBeenCalledTimes(1)

    // // compute when deps changed & computer be get
    foo.a = 1
    expect(getter).toHaveBeenCalledTimes(1) // still not compute
    expect(dummy.value).toBe(1) // get
    expect(getter).toHaveBeenCalledTimes(2) // now compute

    // // will not compute when deps did not change
    console.log(dummy.value);
    expect(getter).toHaveBeenCalledTimes(2)


  })


})