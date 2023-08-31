import { h } from '../../lib/demo-vue3-esm.js';

self = null
export default {
  render(){
    self = this
    // console.log(this.$el);
    return h('div', 
    {
      class: ['bold'], 
      id: 'test'
    }, 
    this.msg,
    // [h('div', {class: 'red'}, 'son1'), h('div', {class:  'blue'}, 'son2')]
    // 'hello vue3'
  )},
  setup(){
    return {
      msg: 'hello world'
    }
  }
}