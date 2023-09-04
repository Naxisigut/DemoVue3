import { h } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'foo',
  setup(props){
    console.log('1. get props in setup', props);
    // 3. props is shallowReadonly
  },
  render(){
    // 2. can use props by This in render function
    console.log('2. use props by this in render function', this.count);
    return h('div', {}, `foo: ${this.count}`)
  }
}