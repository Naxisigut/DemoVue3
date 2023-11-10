export function generate(ast){
  const code = `return function render(_ctx, _cache, $props, $setup, $data, $options) {
    with (_ctx) {
      return "hi"
    }
  }`

  return {
    code
  }
}