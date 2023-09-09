// help render slots in compoent render
import { createVNode } from "../vnodes";

export function renderSlot(slots, slotName, scope){
  // slots is slotContentObject offered by father component
  const slot = slots[slotName]
  if(slot){
    // because of scoped slot, slot here is a function
    return createVNode('div', {}, slot(scope))
  }
}