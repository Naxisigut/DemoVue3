import { h, ref } from '../../lib/demo-vue3-esm.js';


/* 1. 左侧对比 */
// A B C
// A B D E
// i e1 e2: 2 2 3
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "D"}, 'D'),
//   h('div', { key: "E"}, 'E'),
// ]

/* 2. 右侧对比 */
// A C
// D B C
// i e1 e2: 0 0 1
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: "D"}, 'D'),
//   h('div', { key: "E"}, 'E'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
// ]

/* 3. 右侧新增 */
// A B
// A B C D
// i e1 e2: 3 1 3
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
// ]
// const nextChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
//   h('div', { key: "D"}, 'D'),
// ]

/* 4. 左侧新增 */
// A B
// C A B
// i e1 e2: 0 -1 0
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
// ]
// const nextChildren = [
//   h('div', { key: "C"}, 'C'),
//   h('div', { key: "D"}, 'D'),
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
// ]

/* 5. 右侧删减 */
// A B C
// A B
// i e1 e2: 2 2 1
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
// ]

/* 6. 左侧删减 */
// A B C
// B C
// i e1 e2: 0 0 -1
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C"}, 'C'),
// ]

export default {
  name: 'Text2Arr',
  render(){
    return h('div', {}, this.isChange ? nextChildren : prevChildren)
  },
  setup(){
    window.isChange = ref(false)
    const isChange = window.isChange
    return {
      isChange
    }
  }
}