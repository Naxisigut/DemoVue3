import { h } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'foo',
  render(){
    return h('div', 
    {},
    [
      h('div', {}, this.count.toString()),
      h('button', {
        onClick: this.onClick
      }, 'add')
    ]
    )
  },
  setup(props, {emit}){
    return {
      onClick: () => {
        emit('add')
      }
    }
  },
}