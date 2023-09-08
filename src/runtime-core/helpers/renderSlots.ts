// help render slots in compoent render
import { createVNode } from "../vnodes";

export function renderSlots(slots, slotName, scope){
  const slot = slots[slotName]
  if(slot){
    // because of scoped slot, slot here is a function
    return createVNode('div', {}, slot(scope))
  }
}