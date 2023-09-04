import { h } from '../../lib/demo-vue3-esm.js';
import foo from './foo.js';

export default {
  name: 'App',
  render(){
    return h('div', 
    {
      class: ['bold'], 
      id: 'test',
      onClick: () => {
        console.log('click');
      }
    }, 
    [h('div', {class: 'red'}, 'son1'), h(foo, {count: 1})]
  )},
  setup(){
    return {
      msg: 'hello world'
    }
  }
}