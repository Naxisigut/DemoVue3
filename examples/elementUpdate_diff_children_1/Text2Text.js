import { h, ref } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'Text2Text',
  render(){
    const prevChildren = 'Text1'
    const nextChildren = 'Text2'

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