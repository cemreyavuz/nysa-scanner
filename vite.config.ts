/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import packageJson from "./package.json";

const getPackageName = () => {
  return packageJson.name;
};

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, (char) => char[1].toUpperCase());
  } catch (err) {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `nysa-scanner.mjs`,
  cjs: `nysa-scanner.cjs`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: "./",
  build: {
    outDir: "./build/dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: getPackageNameCamelCase(),
      formats,
      fileName: (format) => fileName[format],
    },
    rollupOptions: {
      external: Object.keys(packageJson.dependencies),
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, "./bin"),
          dest: "./",
        },
      ],
    }),
  ],
});
