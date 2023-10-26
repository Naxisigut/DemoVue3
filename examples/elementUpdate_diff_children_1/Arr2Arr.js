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

/* 3.1 新增-左侧 */
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

/* 3.2. 新增-右侧 */
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

/* 4.1 删减-右侧 */
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

/* 4.2. 删减-左侧 */
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

/* 5.1. 中间对比-旧节点的删除 */
// A B (C D E) F G
// A B (D C) F G
// i e1 e2: 0 0 -1
// const prevChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "C", id: "prev_c"}, 'C'),
//   h('div', { key: "D"}, 'D'),
//   h('div', { key: "E"}, 'E'),
//   h('div', {}, 'H'),
//   h('div', { key: "F"}, 'F'),
//   h('div', { key: "G"}, 'G'),
// ]
// const nextChildren = [
//   h('div', { key: "A"}, 'A'),
//   h('div', { key: "B"}, 'B'),
//   h('div', { key: "D"}, 'D'),
//   h('div', { key: "C", id: "next_c"}, 'C'),
//   h('div', { key: "F"}, 'F'),
//   h('div', { key: "G"}, 'G'),
// ]

/* 5.2. 中间对比-同一节点的移动 */
// A B (C D E) F G
// A B (E C D) F G
// newIndexToOldIndexMap: [5, 3, 4]
// 最长子序列： [1,2]
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

/* 5.3. 中间对比-节点未移动 */
// A (B C D E) F
// A (C D) F
// newIndexToOldIndexMap: [3, 4]
// 最长子序列： []
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
// ];

// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
// ];

/* 5.4. 中间对比-新增节点 */
// A (B C D E) F
// A (C D E G) F
// newIndexToOldIndexMap: [3, 4]
// 最长子序列： []
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
];

const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "G" }, "G"),
  h("p", { key: "F" }, "F"),
];

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