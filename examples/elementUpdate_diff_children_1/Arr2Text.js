import { h, ref } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'Arr2Text',
  render(){
    const prevChildren = [
      h('div', {}, 'child_1'),
      h('div', {}, 'child_2')
    ]
    const nextChildren = 'Text'

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