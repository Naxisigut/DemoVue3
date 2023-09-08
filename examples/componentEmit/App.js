
import { h } from '../../lib/demo-vue3-esm.js';
import foo from './foo.js';

export default {
  name: 'App',
  render(){
    return h('div', 
    {}, 
    [
      h(foo, {
        count: this.count,
        onAdd: (a, b) => {
          console.log('a b', a, b);
        }
      })
    ]
  )},
  setup(){
    return {
      count: 1
    }
  }
}