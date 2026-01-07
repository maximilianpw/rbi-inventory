/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly CLERK_SECRET_KEY?: string
  readonly NEXT_PUBLIC_API_BASE_URL?: string
  readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css?url' {
  const url: string
  export default url
}
