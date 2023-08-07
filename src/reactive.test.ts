import { test, expect } from 'vitest';
import { add } from './reactive';

test('init', ()=>{
  expect(add(1, 2)).toBe(3)
})