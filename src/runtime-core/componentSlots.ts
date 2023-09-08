import { ShapeFlag } from "../shared/shapeFlag";

export function initSlots(instance, children){
  const { vnode } = instance
  if(vnode.shapeFlag & ShapeFlag.SLOT_CHILDREN){
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots(children, slots){
  for (const key in children) {
    // rawSlot offered by father component
    // because of scoped slot, rawSlot here is a function
    // rawSlot function return vnode
    const rawSlot = children[key];
    // slots[key] is a function wraps rawSlot function
    slots[key] = (scope)=> normalizeSlot(rawSlot(scope))
  }
}

function normalizeSlot(slot){
  return Array.isArray(slot) ? slot : [slot]
  // return [slot]
}


