import { h } from '../../lib/demo-vue3-esm.js';

export default {
  render(){
    return h('div', 
    {
      class: ['bold'], 
      id: 'test'
    }, 
    [h('div', {class: 'red'}, 'son1'), h('div', {class:  'blue'}, 'son2')]
    // 'hello vue3'
  )},
  setup(){
    return {
      msg: 'world'
    }
  }
}