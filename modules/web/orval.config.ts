import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: '../../openapi.yaml',
    output: {
      target: './src/lib/data/generated.ts',
      client: 'react-query',
      httpClient: 'axios',
      prettier: true,
      override: {
        mutator: {
          path: './src/lib/data/axios-client.ts',
          name: 'getAxiosInstance',
        },
      },
    },
  },
})
