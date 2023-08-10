import { test, expect, describe, it, vi } from 'vitest';
import { effect, stop } from './effect';
import { reactive } from './reactive';

describe('effect', () => {
  it('happy path', ()=>{
    const user = { age: 10 }
    const proxy = reactive(user) 
    let nextAge
    effect(()=>{
      nextAge = proxy.age + 1
    })
    expect(nextAge).toBe(11)
    proxy.age ++
    // console.log(2, nextAge);
    expect(nextAge).toBe(12)
  })


  it('effect return runner', () => {
    let nextAge = 0
    const runner = effect(() => {
      nextAge++
    })
    expect(nextAge).toBe(1)
    
    runner()
    expect(nextAge).toBe(2)
  })


  it('schedular', ()=>{
    let dummy
    const proxy = reactive({ foo: 1})
    let run
    let schedular = vi.fn(()=>{
      run = runner
    })
    const runner = effect(()=>{
      dummy = proxy.foo
    }, { schedular })

    // should not be called on track
    expect(schedular).not.toHaveBeenCalled()
    expect(dummy).toBe(1)

    // should be called on first trigger
    proxy.foo++
    expect(schedular).toHaveBeenCalledTimes(1)
    // runner not run on trigger
    expect(dummy).toBe(1)
    
    run()
    expect(dummy).toBe(2)
  })


  it('stop', () => {
    let dummy
    const proxy = reactive({ foo: 1})
    const runner = effect(() => {
      dummy = proxy.foo
    })
    proxy.foo = 2
    expect(dummy).toBe(2)

    // stopped runner should not be triggered
    stop(runner)
    proxy.foo = 3 // 不要用proxy.foo++ 因为只想触发set，不想触发get
    expect(dummy).toBe(2)

    // stopped runner could be manually call
    runner()
    expect(dummy).toBe(3)
  })
  
})