import { h, ref } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'Text2Arr',
  render(){
    const prevChildren = 'Text'
    const nextChildren = [
      h('div', {}, 'array_child_1'),
      h('div', {}, 'array_child_2')
    ]

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