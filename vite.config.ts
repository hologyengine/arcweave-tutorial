import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import hologyBuild from '@hology/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    target: "es2020",
  },
  plugins: [
    hologyBuild(),
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { version: "2023-11" }],
          ["module:@preact/signals-react-transform"],
        ],
      },
    }),
  ],
})