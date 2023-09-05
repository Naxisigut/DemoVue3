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
        onAdd: () => {
          console.log(this);
          this.count++
          console.log('get add', this.count);
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