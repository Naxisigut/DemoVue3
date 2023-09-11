import { h, provide, inject, getCurrentInstance } from '../../lib/demo-vue3-esm.js';


const Provider = {
  name: 'Provider',
  render(){
    const providerTwo = h(ProviderTwo)
    return h('div', {}, [providerTwo])
  },
  setup(){
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
    return{}
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  render(){
    const consumer = h(Consumer)
    return h('div', {}, [consumer])
  },
  setup(){
    provide('fooTwo', 'fooTwoVal')
    provide('barTwo', 'barTwoVal')
    return{}
  }
}

const Consumer = {
  name: 'Consumer',
  render(){
    const consumer = h('ul', {}, [
      h('li', {}, 'foo:' + this.fooVal),
      h('li', {}, 'bar:' + this.barVal),
      h('li', {}, 'fooTwo:' + this.fooTwoVal),
      h('li', {}, 'barTwo:' + this.barTwoVal),
      h('li', {}, 'defaultTest:' + this.defaultTest),
      h('li', {}, 'defaultTest:' + this.defaultFuncTest),
    ])
    return consumer
  },
  setup(){
    const fooVal = inject('foo')
    const barVal = inject('bar')
    const fooTwoVal = inject('fooTwo')
    const barTwoVal = inject('barTwo')
    const defaultTest = inject('asdfsa', 'defaultValue')
    const defaultFuncTest = inject('func', ()=>'defaultFunc')
    console.log(getCurrentInstance());
    return{
      fooVal, barVal, fooTwoVal, barTwoVal, defaultTest, defaultFuncTest
    }
  }
}

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    return h('div', {}, [h(Provider)])
  },
  setup(){
    provide('tert', 222)
    return {}
  }
}