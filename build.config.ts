// build.config.ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/index'
  ],
  declaration: true, // generate .d.ts files
  outDir: './dist',
  rollup: {
    emitCJS: true, // emit CommonJS modules
  }
})