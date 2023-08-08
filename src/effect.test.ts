import { test, expect, describe, it } from 'vitest';
import { effect } from './effect';
import { reactive } from './reactive';

describe('effect', () => {
  it('happy path', ()=>{
    const user = { age: 10 }
    const proxy = reactive(user) 
    let nextAge
    effect(()=>{
      nextAge = proxy.age + 1
      console.log(111);
    })
    expect(nextAge).toBe(11)
    proxy.age ++
    // console.log(2, nextAge);
    expect(nextAge).toBe(12)
  })
})