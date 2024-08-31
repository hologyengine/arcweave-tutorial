import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import hologyBuild from '@hology/vite-plugin'
import arcweave from '@hology/arcweave/vite-plugin'

export default defineConfig({
  esbuild: {
    target: "es2020",
  },
  plugins: [
    arcweave({
      apiKey: process.env.ARCWEAVE_API_KEY!, 
      projectHash: 'g16kx770YP'
    }),
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