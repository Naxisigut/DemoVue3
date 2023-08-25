import typescript from '@rollup/plugin-typescript';

export default {
  input:'src/index.ts',
  output:[
    {
      format: 'cjs', // 导出为cjs
      file: 'lib/demo-vue3-cjs.js'
    },
    {
      format: 'esm', // 导出为esm
      file: 'lib/demo-vue3-esm.js'
    },
  ],
  plugins:[typescript({
    exclude:['**/*.test.ts']
  })]
}