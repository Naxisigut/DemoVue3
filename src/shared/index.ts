export const extend = Object.assign

export const isObject = (val) => {
  return typeof val === 'object' && val !== null
}

export const isEqual = (newVal, val) => {
  return Object.is(newVal, val)
}