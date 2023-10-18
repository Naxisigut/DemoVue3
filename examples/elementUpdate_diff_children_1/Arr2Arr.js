import { h, ref } from '../../lib/demo-vue3-esm.js';


/* 1. 左侧对比 */
const prevChildren = [
  h('div', { key: "A"}, 'A'),
  h('div', { key: "B"}, 'B')
]
const nextChildren = [
  h('div', { key: "A"}, 'A'),
  h('div', { key: "C"}, 'C'),
  h('div', { key: "D"}, 'D'),
]

export default {
  name: 'Text2Arr',
  render(){
    return h('div', {}, this.isChange ? nextChildren : prevChildren)
  },
  setup(){
    window.isChange = ref(false)
    const isChange = window.isChange
    return {
      isChange
    }
  }
}