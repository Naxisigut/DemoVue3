import { h, ref } from '../../lib/demo-vue3-esm.js';

export default{
  render(){
    return h('div', {}, `child text ${this.$props.msg}`)
  },
  setup(){
    return {}
  }
}