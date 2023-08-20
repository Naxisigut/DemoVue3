export default {
  render(){
    h('div', 'hello ' + this.msg)
  },
  setup(){
    return {
      msg: 'world'
    }
  }
}