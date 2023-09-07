import { h } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'foo',
  render(){
    const foo = h('div', {}, 'foo')
    return h('div', 
      {},
      [foo, this.$slots]
    )
  },
  setup(){
    return {
    }
  },
}