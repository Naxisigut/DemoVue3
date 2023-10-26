import { h, ref } from '../../lib/demo-vue3-esm.js';
import Child from './Child.js';

export default {
  name: 'App',
  render(){
    return h('div', {}, [
      h('button', { onClick: this.changeMsg }, '改变msg'),
      h(Child),
      h('button', { onClick: this.changeCount }, '改变Count'),
      h('div', {}, `count: ${this.count}`)
    ]
  )},
  setup(){
    const msg = ref('initial msg')
    const count = ref(0)
    const changeMsg = () => { 
      msg.value = 'msg changed'
    }
    const changeCount = () => {
      count.value++
    }
    return{
      msg,
      count,
      changeMsg,
      changeCount,
    }
  }
}