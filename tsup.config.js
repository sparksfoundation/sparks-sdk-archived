import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/agents/Profile/index.ts',
    'src/channels/HttpFetch/index.ts',
    'src/channels/HttpRest/index.ts',
    'src/channels/PostMessage/index.ts',
    'src/channels/WebRTC/index.ts',
    'src/ciphers/X25519SalsaPoly',
    'src/ciphers/X25519SalsaPolyPassword/index.ts',
    'src/controllers/Basic/index.ts',
    'src/hashers/Blake3/index.ts',
    'src/signers/Ed25519/index.ts',
    'src/signers/Ed25519Password/index.ts',
  ],
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
})