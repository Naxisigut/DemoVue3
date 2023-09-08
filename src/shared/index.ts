export const extend = Object.assign

export const isObject = (val) => {
  return typeof val === 'object' && val !== null
}

export const isEqual = (newVal, val) => {
  return Object.is(newVal, val)
}

export const hasOwn = (target, key) => {
  return Object.prototype.hasOwnProperty.call(target, key)
}

// 首字母大写
export const captalize = (str: string) => {
  if(!str)return ""
  return str[0].toUpperCase() + str.slice(1)
}

// 驼峰化
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c)=>{
    return c ? c.toUpperCase() : ''
  })
}

export const toHandlerKey = (str: string) =>{
  return str ? camelize(`on${captalize(str)}`) : '' 
}

// 是否以on开头
export const isOn = (str: string) => {
  return /^on[A-Z]/.test(str)
}