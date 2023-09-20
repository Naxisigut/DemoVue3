import { h, ref } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'Text2Arr',
  render(){
    const prevChildren = 'Text'
    const nextChildren = [
      h('div', {}, 'child_1'),
      h('div', {}, 'child_2')
    ]

    return this.isChange ? nextChildren : prevChildren
  },
  setup(){
    window.isChange = ref(false)
    const isChange = window.isChange
    return {
      isChange
    }
  }
}