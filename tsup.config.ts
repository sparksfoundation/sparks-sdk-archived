import type { Options } from 'tsup';

export const tsup: Options = {
  dts: true,
  bundle: false,
  treeshake: true,
  target: "node16",
  format: ["esm", "cjs"],
  entry: ["src/**/*.ts"]
};